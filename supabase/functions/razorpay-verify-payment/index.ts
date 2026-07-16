// Supabase Edge Function — verify Razorpay payment before confirming booking
// Secrets: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
// Deploy: supabase functions deploy razorpay-verify-payment

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keyId || !keySecret) {
      return new Response(
        JSON.stringify({ verified: false, error: "Razorpay secrets not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const paymentId = String(body.razorpay_payment_id ?? "");
    const orderId = body.razorpay_order_id ? String(body.razorpay_order_id) : "";
    const signature = body.razorpay_signature ? String(body.razorpay_signature) : "";
    const expectedAmount = typeof body.expected_amount === "number" ? body.expected_amount : null;

    if (!paymentId) {
      return new Response(JSON.stringify({ verified: false, error: "Missing payment id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Signature check when order checkout was used
    if (orderId && signature) {
      const expected = await hmacSha256Hex(keySecret, `${orderId}|${paymentId}`);
      if (expected !== signature) {
        return new Response(
          JSON.stringify({ verified: false, error: "Invalid payment signature" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 2) Always confirm payment status with Razorpay API
    const auth = btoa(`${keyId}:${keySecret}`);
    const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Basic ${auth}` },
    });
    const payment = await res.json();

    if (!res.ok) {
      return new Response(
        JSON.stringify({
          verified: false,
          error: payment.error?.description || "Could not fetch payment",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const status = String(payment.status ?? "");
    const okStatus = status === "captured" || status === "authorized";
    if (!okStatus) {
      return new Response(
        JSON.stringify({ verified: false, error: `Payment status is ${status}`, payment }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (expectedAmount != null && Number(payment.amount) !== expectedAmount) {
      return new Response(
        JSON.stringify({
          verified: false,
          error: "Payment amount mismatch",
          expected: expectedAmount,
          actual: payment.amount,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        verified: true,
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          order_id: payment.order_id,
          email: payment.email,
          contact: payment.contact,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ verified: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
