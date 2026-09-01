import { createClient } from "@supabase/supabase-js";
import { extractShopierOrderId, getShopierOrder, verifyShopierSignature } from "@/lib/shopier";

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

function getServerSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Supabase server integration credentials are not configured");

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

export const POST = async ({ request }: { request: Request }): Promise<Response> => {
  const rawBody = await request.text();
  const signature = request.headers.get("Shopier-Signature");
  const valid = verifyShopierSignature(rawBody, signature);

  if (!valid) return json({ ok: false, reason: "invalid_signature" }, 401);

  let payload: Record<string, unknown>;
  try {
    const parsed = JSON.parse(rawBody) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return json({ ok: false, reason: "invalid_payload" }, 400);
    payload = parsed as Record<string, unknown>;
  } catch {
    return json({ ok: false, reason: "invalid_json" }, 400);
  }

  const eventType = request.headers.get("Shopier-Event")?.trim() || String(payload.event ?? payload.type ?? "unknown");
  const shopierOrderId = extractShopierOrderId(payload);

  try {
    const supabase = getServerSupabase();
    const { error: insertError } = await supabase.from("shopier_webhook_events").insert({
      event_type: eventType,
      shopier_order_id: shopierOrderId,
      payload,
      signature_valid: true,
      processing_status: "received",
    });

    if (insertError) {
      console.error("Shopier webhook audit insert failed", insertError);
      return json({ ok: false, reason: "audit_write_failed" }, 500);
    }

    // Verify the order server-to-server before any future ownership mutation.
    // No existing MySkyParcel order/parcel/payment data is changed in this foundation step.
    if (shopierOrderId && process.env.SHOPIER_PERSONAL_ACCESS_TOKEN) {
      try {
        const order = await getShopierOrder(shopierOrderId);
        console.info("Shopier order verified", {
          orderId: shopierOrderId,
          paymentStatus: order.paymentStatus,
          status: order.status,
          total: order.totals?.total,
          currency: order.currency,
        });
      } catch (error) {
        console.error("Shopier order verification failed", error);
      }
    }

    // Shopier requires a 200 response within 5 seconds; business mutations will be
    // added only after checkout-intent mapping is wired and tested against a real order.
    return json({ ok: true });
  } catch (error) {
    console.error("Shopier webhook handler failed", error);
    return json({ ok: false, reason: "internal_error" }, 500);
  }
};
