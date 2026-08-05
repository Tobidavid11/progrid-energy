// supabase/functions/verify-payment/index.ts
//
// Called directly from the client (PurchaseFlow) right after Paystack's
// popup reports success. This is the actual source of truth for whether
// an order gets marked paid — the client-side callback alone is never
// trusted, since it could be faked in DevTools without anyone actually
// paying. This function re-checks the transaction directly with
// Paystack's API using the secret key, and cross-checks the amount
// paid against the order's real total before updating anything.
//
// Deploy: supabase functions deploy verify-payment
// Secrets needed: PAYSTACK_SECRET_KEY (required — set via
//   `supabase secrets set PAYSTACK_SECRET_KEY=sk_...`)
//
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically
// by the Supabase Edge Runtime into every function — no need to set
// those as secrets yourself.

import { createClient } from "npm:@supabase/supabase-js@2";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Required because this function is called directly from the browser
// (PurchaseFlow.tsx), unlike send-order-emails which is only ever
// called server-to-server by Supabase's own webhook/trigger. A
// cross-origin POST with custom headers (Authorization, apikey — which
// supabase-js adds automatically) triggers a CORS preflight OPTIONS
// request first; without these headers, the browser blocks the actual
// request before this function's logic ever runs.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface VerifyRequestBody {
  reference: string;
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    status: string; // "success" | "failed" | "abandoned" | ...
    amount: number; // kobo, as actually charged by Paystack
    reference: string;
  };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

Deno.serve(async (req: Request) => {
  // The browser's preflight check — must return 2xx with the CORS
  // headers before it will send the real POST at all.
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  if (!PAYSTACK_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing required environment configuration");
    return jsonResponse(
      { verified: false, reason: "Server misconfiguration" },
      500
    );
  }

  let body: VerifyRequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ verified: false, reason: "Invalid request" }, 400);
  }

  const { reference } = body;
  if (!reference) {
    return jsonResponse({ verified: false, reason: "Missing reference" }, 400);
  }

  // 1. Ask Paystack directly whether this transaction actually succeeded.
  //    This is the step that makes the whole flow trustworthy — the
  //    client cannot fake this response, only Paystack's own API can
  //    produce it, using our secret key that never reaches the browser.
  const verifyRes = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
  );

  const verifyJson = (await verifyRes.json()) as PaystackVerifyResponse;

  if (!verifyRes.ok || !verifyJson.status || verifyJson.data?.status !== "success") {
    return jsonResponse({
      verified: false,
      reason: verifyJson.message || "Payment was not successful.",
    });
  }

  const paidAmountKobo = verifyJson.data.amount;

  // 2. Look up the order using the same reference (the order's own id
  //    was used as the Paystack reference — see PurchaseFlow.tsx).
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, total_kobo, payment_status")
    .eq("id", reference)
    .single();

  if (fetchError || !order) {
    return jsonResponse({ verified: false, reason: "Order not found." });
  }

  // Idempotent: if verify-payment somehow gets called twice for the
  // same order (e.g. a retry after a network hiccup), treat an
  // already-paid order as a success rather than erroring.
  if (order.payment_status === "paid") {
    return jsonResponse({ verified: true });
  }

  // 3. The critical cross-check: the amount Paystack says was actually
  //    paid must match what the order says it costs. Without this, a
  //    manipulated client request could reference a real-but-unrelated
  //    successful transaction (e.g. a ₦100 payment) and get an
  //    unrelated ₦50,000 order marked paid.
  if (paidAmountKobo !== order.total_kobo) {
    console.error(
      `Amount mismatch for order ${order.id}: paid ${paidAmountKobo}, expected ${order.total_kobo}`
    );
    return jsonResponse({
      verified: false,
      reason: "Payment amount does not match the order total.",
    });
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({ payment_status: "paid", paystack_reference: reference })
    .eq("id", order.id);

  if (updateError) {
    return jsonResponse({ verified: false, reason: updateError.message });
  }

  return jsonResponse({ verified: true });
});