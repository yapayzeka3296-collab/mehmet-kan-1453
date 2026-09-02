import { createClient } from "@supabase/supabase-js";
import { extractShopierOrderId, getShopierOrder, verifyShopierSignature } from "@/lib/shopier";

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
function getServerSupabase() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Supabase server integration credentials are not configured");
  return createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
}

export const POST = async ({ request }: { request: Request }): Promise<Response> => {
  const rawBody = await request.text();
  if (!verifyShopierSignature(rawBody, request.headers.get("Shopier-Signature"))) return json({ ok: false, reason: "invalid_signature" }, 401);
  let payload: Record<string, unknown>;
  try {
    const parsed = JSON.parse(rawBody) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return json({ ok: false, reason: "invalid_payload" }, 400);
    payload = parsed as Record<string, unknown>;
  } catch { return json({ ok: false, reason: "invalid_json" }, 400); }

  const eventType = request.headers.get("Shopier-Event")?.trim() || String(payload.event ?? payload.type ?? "unknown");
  const shopierOrderId = extractShopierOrderId(payload);
  try {
    const supabase = getServerSupabase();
    const { data: eventRow, error: insertError } = await supabase.from("shopier_webhook_events").insert({ event_type: eventType, shopier_order_id: shopierOrderId, payload, signature_valid: true, processing_status: "received" }).select("id").single();
    if (insertError || !eventRow) return json({ ok: false, reason: "audit_write_failed" }, 500);

    if (eventType !== "order.created" || !shopierOrderId) {
      await supabase.from("shopier_webhook_events").update({ processing_status: "ignored", processed_at: new Date().toISOString() }).eq("id", eventRow.id);
      return json({ ok: true, status: "ignored" });
    }
    if (!process.env.SHOPIER_PERSONAL_ACCESS_TOKEN) throw new Error("shopier_not_configured");

    const order = await getShopierOrder(shopierOrderId);
    const paymentStatus = String(order.paymentStatus ?? "").toLowerCase();
    if (paymentStatus !== "paid") {
      await supabase.from("shopier_webhook_events").update({ processing_status: "ignored", processing_error: `payment_status:${paymentStatus || "unknown"}`, processed_at: new Date().toISOString() }).eq("id", eventRow.id);
      return json({ ok: true, status: "ignored", payment_status: paymentStatus || "unknown" });
    }

    const productIds = Array.from(new Set((order.lineItems ?? []).map((item) => item.productId).filter((id): id is string => Boolean(id))));
    if (productIds.length !== 1) throw new Error("shopier_product_mapping_invalid");
    const total = Number(order.totals?.total ?? 0);
    const currency = String(order.currency ?? "TRY");
    if (!Number.isFinite(total) || total <= 0) throw new Error("shopier_amount_invalid");

    const { data: intent, error: intentError } = await supabase.from("shopier_checkout_intents").select("id").eq("shopier_product_id", productIds[0]).maybeSingle();
    if (intentError || !intent) throw new Error("shopier_intent_not_found");

    const { data: result, error: completionError } = await supabase.rpc("complete_shopier_checkout", {
      p_intent_id: intent.id,
      p_shopier_order_id: shopierOrderId,
      p_shopier_payment_id: shopierOrderId,
      p_shopier_product_id: productIds[0],
      p_amount: total,
      p_currency: currency,
    });
    if (completionError) throw completionError;

    await supabase.from("shopier_webhook_events").update({ processing_status: "processed", processed_at: new Date().toISOString() }).eq("id", eventRow.id);
    return json({ ok: true, status: result?.status ?? "paid" });
  } catch (error) {
    console.error("Shopier webhook fulfillment failed", error);
    try {
      const supabase = getServerSupabase();
      if (shopierOrderId) await supabase.from("shopier_webhook_events").update({ processing_status: "failed", processing_error: error instanceof Error ? error.message : "unknown_error", processed_at: new Date().toISOString() }).eq("shopier_order_id", shopierOrderId).eq("processing_status", "received");
    } catch (auditError) { console.error("Shopier webhook failure audit failed", auditError); }
    return json({ ok: false, reason: "fulfillment_failed" }, 500);
  }
};
