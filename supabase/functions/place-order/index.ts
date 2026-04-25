// Edge function: place-order
// Validates cart server-side, looks up postcode in delivery_zones, calculates totals,
// and inserts the order. Optionally creates a customer account when requested.
//
// CORS enabled. Public (verify_jwt = false) so guest checkout works.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IncomingItem { product_id: string; quantity: number }

interface Payload {
  items: IncomingItem[];
  method: "pickup" | "delivery";
  customer: {
    first_name: string;
    last_name: string;
    company?: string;
    phone: string;
    email: string;
  };
  address?: {
    street: string;
    city: string;
    postcode: string;
    country?: string;
  };
  ship_to_different?: boolean;
  ship_address?: {
    first_name: string;
    last_name: string;
    company?: string;
    street: string;
    city: string;
    postcode: string;
  };
  delivery_date?: string;
  delivery_time?: string;
  notes?: string;
  coupon_code?: string;
  create_account?: boolean;
  account_password?: string;
  pay_with?: "cash" | "stripe";
  // honeypot
  hp?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as Payload;

    // Honeypot — bots fill this; humans cannot see it
    if (body.hp && body.hp.length > 0) {
      return new Response(JSON.stringify({ error: "Spam detected" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!body.items?.length) {
      return new Response(JSON.stringify({ error: "Cart is empty" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // Identify caller (if logged in)
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await admin.auth.getUser(token);
      userId = data.user?.id ?? null;
    }

    // Optional account creation for guest
    if (!userId && body.create_account && body.account_password) {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: body.customer.email,
        password: body.account_password,
        email_confirm: true,
        user_metadata: {
          first_name: body.customer.first_name,
          last_name: body.customer.last_name,
          phone: body.customer.phone,
          address: body.address?.street,
          city: body.address?.city,
          postcode: body.address?.postcode,
        },
      });
      if (!createErr && created.user) {
        userId = created.user.id;
      }
      // Silently ignore "already exists" — we still place the order as guest
    }

    // ---- GATEKEEPER #1: global store_settings ----
    const { data: settings } = await admin
      .from("store_settings")
      .select("is_delivery_open, is_pickup_open")
      .limit(1)
      .maybeSingle();

    if (settings) {
      if (body.method === "delivery" && !settings.is_delivery_open) {
        return new Response(
          JSON.stringify({ error: "Delivery is currently paused. Please try again later or choose Pickup." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (body.method === "pickup" && !settings.is_pickup_open) {
        return new Response(
          JSON.stringify({ error: "Pickup is currently paused. Please try again later." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Look up products by id, recalc prices server-side (anti-tampering)
    const productIds = body.items.map((i) => i.product_id);
    const { data: products, error: prodErr } = await admin
      .from("products")
      .select("id, name_nl, price, active")
      .in("id", productIds);
    if (prodErr) throw prodErr;

    // Build line items using DB prices
    let subtotal = 0;
    const lineItems = body.items.map((i) => {
      const p = products?.find((pp) => pp.id === i.product_id);
      if (!p || !p.active) throw new Error(`Product ${i.product_id} not available`);
      const qty = Math.max(1, Math.min(99, Math.floor(i.quantity)));
      const lineTotal = Number(p.price) * qty;
      subtotal += lineTotal;
      return {
        product_id: p.id,
        product_name: p.name_nl,
        unit_price: Number(p.price),
        quantity: qty,
        line_total: lineTotal,
      };
    });

    // Coupon
    let discount = 0;
    if (body.coupon_code?.trim().toUpperCase() === "DARBAAR") {
      discount = Math.round(subtotal * 0.1 * 100) / 100;
    }
    const subtotalAfter = Math.max(0, subtotal - discount);

    // Postcode validation + fee lookup
    let deliveryFee = 0;
    let zoneId: string | null = null;
    let zoneArea: string | null = null;

    if (body.method === "delivery") {
      if (!body.address?.postcode) {
        return new Response(JSON.stringify({ error: "Postcode required for delivery" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const postcode = body.address.postcode.replace(/\s+/g, "").slice(0, 4);
      if (!/^\d{4}$/.test(postcode)) {
        return new Response(JSON.stringify({ error: "Invalid Dutch postcode" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: zones } = await admin
        .from("delivery_zones")
        .select("*")
        .eq("active", true)
        .contains("postcodes", [postcode]);

      const zone = zones?.[0];
      if (!zone) {
        return new Response(JSON.stringify({ error: "We do not deliver to this area." }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (subtotalAfter < Number(zone.min_order_value)) {
        return new Response(
          JSON.stringify({
            error: `Minimum order €${Number(zone.min_order_value).toFixed(2)} for ${zone.area}`,
            min_order: zone.min_order_value,
            zone: zone.area,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      deliveryFee = zone.free_above && subtotalAfter >= Number(zone.free_above) ? 0 : Number(zone.delivery_fee);
      zoneId = zone.id;
      zoneArea = zone.area;
    }

    const total = Math.round((subtotalAfter + deliveryFee) * 100) / 100;

    const initialStatus = body.pay_with === "stripe" ? "pending_payment" : "pending";
    const initialPaymentStatus = body.pay_with === "stripe" ? "pending" : "unpaid";

    // Insert order
    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        user_id: userId,
        method: body.method,
        status: initialStatus,
        payment_status: initialPaymentStatus,
        payment_method: body.pay_with === "stripe" ? "stripe" : "cash",
        customer_email: body.customer.email,
        customer_first_name: body.customer.first_name,
        customer_last_name: body.customer.last_name,
        customer_phone: body.customer.phone,
        customer_company: body.customer.company,
        address: body.address?.street,
        city: body.address?.city,
        postcode: body.address?.postcode?.replace(/\s+/g, "").slice(0, 4),
        country: body.address?.country ?? "Netherlands",
        ship_to_different: !!body.ship_to_different,
        ship_first_name: body.ship_address?.first_name,
        ship_last_name: body.ship_address?.last_name,
        ship_company: body.ship_address?.company,
        ship_address: body.ship_address?.street,
        ship_city: body.ship_address?.city,
        ship_postcode: body.ship_address?.postcode?.replace(/\s+/g, "").slice(0, 4),
        delivery_date: body.delivery_date || null,
        delivery_time: body.delivery_time,
        notes: body.notes,
        subtotal,
        discount,
        delivery_fee: deliveryFee,
        total,
        coupon_code: body.coupon_code,
        delivery_zone_id: zoneId,
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    const { error: itemsErr } = await admin
      .from("order_items")
      .insert(lineItems.map((li) => ({ ...li, order_id: order.id })));
    if (itemsErr) throw itemsErr;

    return new Response(
      JSON.stringify({ ok: true, order_id: order.id, order_number: order.order_number, total, zone: zoneArea }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
