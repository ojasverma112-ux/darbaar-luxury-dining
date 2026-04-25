// Edge function: stripe-webhook
// Receives Stripe events (checkout.session.completed, etc.) and updates the order status.
//
// Requires env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
// IMPORTANT: This function is public (verify_jwt = false) because Stripe calls it directly.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=denonext";

Deno.serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeKey || !webhookSecret) {
    return new Response("Stripe not configured", { status: 503 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig ?? "", webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Bad signature";
    return new Response(`Webhook signature verification failed: ${msg}`, { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          await admin
            .from("orders")
            .update({
              status: "confirmed",
              payment_status: "paid",
              stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
              payment_method: session.payment_method_types?.[0] ?? "card",
            })
            .eq("id", orderId);
        }
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.order_id;
        if (orderId) {
          await admin
            .from("orders")
            .update({ status: "cancelled", payment_status: "failed" })
            .eq("id", orderId);
        }
        break;
      }
      default:
        // ignore
        break;
    }
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Webhook handler error";
    return new Response(msg, { status: 500 });
  }
});
