// supabase/functions/send-order-emails/index.ts
//
// Triggered by a Postgres trigger (fix_order_email_timing.sql) that
// fires when an order's payment_status transitions to 'paid' — NOT on
// order creation. This is deliberate: sending a "Thanks for your
// order!" receipt before payment is confirmed is misleading, since the
// order could still be abandoned or fail. Sends two emails via Resend:
// an order receipt to the customer, and a notification to whoever
// monitors orders internally.
//
// Deploy: supabase functions deploy send-order-emails
// Secrets needed: RESEND_API_KEY (required)
//                  ORDER_EMAIL_FROM (optional, defaults below)
//                  ADMIN_NOTIFICATION_EMAIL (optional, defaults below)

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL =
  Deno.env.get("ORDER_EMAIL_FROM") ?? "Progrid Energy <info@progridenergy.net>";
const ADMIN_NOTIFICATION_EMAIL =
  Deno.env.get("ADMIN_NOTIFICATION_EMAIL") ?? "info@progridenergy.net";

interface OrderItem {
  product_id: string;
  name: string;
  price_kobo: number;
  qty: number;
}

interface OrderRecord {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  items: OrderItem[];
  total_kobo: number;
  coupon_code: string | null;
  discount_kobo: number;
  created_at: string;
}

interface WebhookPayload {
  type: "PAYMENT_CONFIRMED";
  table: string;
  record: OrderRecord;
  schema: string;
  old_record: OrderRecord | null;
}

function formatNaira(kobo: number): string {
  return `\u20a6${(kobo / 100).toLocaleString("en-NG")}`;
}

function itemsRowsHtml(items: OrderItem[]): string {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right;">${formatNaira(item.price_kobo)}</td>
        </tr>`
    )
    .join("");
}

function customerReceiptHtml(order: OrderRecord): string {
  const firstName = order.customer_name.split(" ")[0];

  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0d0d0d;">
      <h2 style="color: #fc4502;">Thanks for your order, ${firstName}!</h2>
      <p>We've received your order and our team will call you at
        <strong>${order.customer_phone}</strong> shortly to confirm delivery.</p>

      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        <thead>
          <tr>
            <th style="text-align: left; padding-bottom: 8px; border-bottom: 2px solid #0d0d0d;">Item</th>
            <th style="text-align: center; padding-bottom: 8px; border-bottom: 2px solid #0d0d0d;">Qty</th>
            <th style="text-align: right; padding-bottom: 8px; border-bottom: 2px solid #0d0d0d;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRowsHtml(order.items)}
        </tbody>
      </table>

      ${
        order.discount_kobo > 0
          ? `<p style="color: #1fae5c;">Coupon ${order.coupon_code ?? ""} applied: \u2212${formatNaira(order.discount_kobo)}</p>`
          : ""
      }

      <p style="font-size: 18px; font-weight: bold;">Total: ${formatNaira(order.total_kobo)}</p>

      <h3>Delivery Address</h3>
      <p>${order.delivery_address}</p>

      <p style="margin-top: 32px; color: #5b5b58; font-size: 13px;">
        Order reference: ${order.id}<br />
        Progrid Energy &middot; info@progridenergy.net
      </p>
    </div>
  `;
}

function adminNotificationHtml(order: OrderRecord): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0d0d0d;">
      <h2>New Order \u2014 ${formatNaira(order.total_kobo)}</h2>
      <p><strong>${order.customer_name}</strong></p>
      <p>
        <a href="tel:${order.customer_phone}">${order.customer_phone}</a><br />
        <a href="mailto:${order.customer_email}">${order.customer_email}</a>
      </p>
      <p><strong>Deliver to:</strong> ${order.delivery_address}</p>

      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tbody>
          ${itemsRowsHtml(order.items)}
        </tbody>
      </table>

      ${
        order.coupon_code
          ? `<p>Coupon used: ${order.coupon_code} (\u2212${formatNaira(order.discount_kobo)})</p>`
          : ""
      }
    </div>
  `;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error (${res.status}): ${body}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY secret");
    return new Response("Missing RESEND_API_KEY", { status: 500 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (payload.type !== "PAYMENT_CONFIRMED" || payload.table !== "orders") {
    // Not something we care about — 200 so the webhook doesn't retry.
    return new Response("Ignored", { status: 200 });
  }

  const order = payload.record;

  try {
    await Promise.all([
      sendEmail(
        order.customer_email,
        "Your Progrid Energy Order Receipt",
        customerReceiptHtml(order)
      ),
      sendEmail(
        ADMIN_NOTIFICATION_EMAIL,
        `New Order from ${order.customer_name}`,
        adminNotificationHtml(order)
      ),
    ]);
  } catch (err) {
    console.error("Failed to send order emails:", err);
    // The order itself was already saved successfully by the time this
    // runs — an email failure shouldn't cause Supabase to treat the
    // whole webhook as failed and retry indefinitely. Log it and move
    // on; if this needs to be more robust later (e.g. a retry queue or
    // Slack alert on failure), that's a reasonable next addition.
    return new Response("Order saved, email failed", { status: 200 });
  }

  return new Response("OK", { status: 200 });
});