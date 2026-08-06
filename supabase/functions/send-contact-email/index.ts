// supabase/functions/send-contact-email/index.ts
//
// Called directly from the browser (ContactForm.tsx) when someone
// submits the contact form. Sends two emails via Resend: an
// acknowledgment to whoever submitted it, and a notification to the
// team inbox with the actual message so someone can reply.
//
// Deploy: supabase functions deploy send-contact-email
// Secrets needed: RESEND_API_KEY (already set for send-order-emails —
//   reused here, no need to set it again)
//                  CONTACT_EMAIL_FROM (optional, defaults below)
//                  CONTACT_NOTIFICATION_EMAIL (optional, defaults below)

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL =
  Deno.env.get("CONTACT_EMAIL_FROM") ?? "Progrid Energy <info@progridenergy.net>";
const NOTIFICATION_EMAIL =
  Deno.env.get("CONTACT_NOTIFICATION_EMAIL") ?? "info@progridenergy.net";

// Required because this is called directly from the browser, same
// reason verify-payment needs it — see that function's comments for
// the full explanation of why a cross-origin POST needs a CORS
// preflight response before the browser will send the real request.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ContactRequestBody {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function autoReplyHtml(data: ContactRequestBody): string {
  const firstName = data.fullName.split(" ")[0];
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0d0d0d;">
      <h2 style="color: #fc4502;">Thanks for reaching out, ${escapeHtml(firstName)}!</h2>
      <p>We've received your message and a member of our team will get back
        to you as soon as possible.</p>

      <div style="background: #f6f6f4; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 0 0 8px;"><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
        <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
      </div>

      <p style="margin-top: 32px; color: #5b5b58; font-size: 13px;">
        Progrid Energy &middot; info@progridenergy.net
      </p>
    </div>
  `;
}

function notificationHtml(data: ContactRequestBody): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0d0d0d;">
      <h2>New Contact Form Submission</h2>
      <p><strong>${escapeHtml(data.fullName)}</strong></p>
      <p>
        <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a>
        ${data.phone ? `<br /><a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a>` : ""}
      </p>
      <p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
      <p style="white-space: pre-wrap;">${escapeHtml(data.message)}</p>
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
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY secret");
    return jsonResponse({ sent: false, reason: "Server misconfiguration" }, 500);
  }

  let data: ContactRequestBody;
  try {
    data = await req.json();
  } catch {
    return jsonResponse({ sent: false, reason: "Invalid request" }, 400);
  }

  if (!data.fullName || !data.email || !data.subject || !data.message) {
    return jsonResponse({ sent: false, reason: "Missing required fields" }, 400);
  }

  try {
    await Promise.all([
      sendEmail(
        data.email,
        "We've received your message — Progrid Energy",
        autoReplyHtml(data)
      ),
      sendEmail(
        NOTIFICATION_EMAIL,
        `New contact form message from ${data.fullName}`,
        notificationHtml(data)
      ),
    ]);
  } catch (err) {
    console.error("Failed to send contact emails:", err);
    return jsonResponse({ sent: false, reason: "Failed to send email" }, 500);
  }

  return jsonResponse({ sent: true });
});