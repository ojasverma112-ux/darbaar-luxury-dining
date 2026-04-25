// Edge function: create-checkout-session
// Creates a Stripe Checkout Session for an existing order (in pending_payment status)
// or for a fresh cart. Returns { url } to redirect to.
//
// Requires env vars: STRIPE_SECRET_KEY (set later by the user)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0?target=denonext";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Payload {
  order_id: string; // id of an order already inserted by place-order with status=pending_payment
  success_path?: string; // e.g. "/order-success"
  cancel_path?: string; // e.g. "/"
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({
          error:
            "Online payment is not configured yet. Please add STRIPE_SECRET_KEY in the project secrets.",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = (await req.json()) as Payload;
    if (!body.order_id) {
      return new Response(JSON.stringify({ error: "order_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Load order + items
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select("*")
      .eq("id", body.order_id)
      .maybeSingle();
    if (orderErr || !order) throw new Error("Order not found");

    const { data: items, error: itemsErr } = await admin
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);
    if (itemsErr) throw itemsErr;

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

    const origin = req.headers.get("origin") ?? "https://example.com";
    const successPath = body.success_path ?? "/order-success";
    const cancelPath = body.cancel_path ?? "/";

    const lineItems = (items ?? []).map((li: { product_name: string; unit_price: number; quantity: number }) => ({
      price_data: {
        currency: "eur",
        product_data: { name: li.product_name },
        unit_amount: Math.round(Number(li.unit_price) * 100),
      },
      quantity: li.quantity,
    }));

    // Add delivery fee as a separate line if applicable
    if (Number(order.delivery_fee) > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Delivery fee" },
          unit_amount: Math.round(Number(order.delivery_fee) * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: undefined, // let Stripe decide based on dashboard config (cards, iDEAL, Bancontact, etc.)
      line_items: lineItems,
      customer_email: order.customer_email,
      metadata: { order_id: order.id, order_number: order.order_number },
      success_url: `${origin}${successPath}?order=${encodeURIComponent(order.order_number)}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${cancelPath}?canceled=1`,
    });

    // Store the session id on the order
    await admin
      .from("orders")
      .update({ stripe_session_id: session.id, payment_status: "pending" })
      .eq("id", order.id);

    return new Response(JSON.stringify({ url: session.url, id: session.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
