import { createClient } from '@supabase/supabase-js';
import { extractShopierOrderId, verifyShopierSignature } from '@/lib/shopier';

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export async function POST({ request }: { request: Request }) {
  const rawBody = await request.text();
  const signature = request.headers.get('Shopier-Signature') ?? request.headers.get('x-shopier-signature');

  if (!verifyShopierSignature(rawBody, signature)) return json({ ok: false, reason: 'invalid_signature' }, 401);

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return json({ ok: false, reason: 'invalid_json' }, 400);
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return json({ ok: false, reason: 'server_not_configured' }, 503);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const eventId = String(payload.event_id ?? payload.eventId ?? payload.id ?? '').trim() || null;
  const eventType = String(payload.event_type ?? payload.eventType ?? payload.type ?? '').trim() || null;
  const shopierOrderId = extractShopierOrderId(payload);

  const { error } = await supabase.from('shopier_webhook_events').insert({
    event_id: eventId,
    event_type: eventType,
    shopier_order_id: shopierOrderId,
    signature_valid: true,
    payload,
  });

  // Duplicate webhook deliveries are harmless. Other DB errors should be
  // retried by Shopier rather than acknowledged as successfully processed.
  if (error && !/duplicate key/i.test(error.message)) {
    console.error('Shopier webhook event store failed', error);
    return json({ ok: false, reason: 'event_store_failed' }, 500);
  }

  // Do not mark a MySkyParcel order paid yet. The exact Shopier event schema and
  // account-specific order-verification endpoint must be configured before a
  // webhook is allowed to mutate ownership/payment state.
  return json({ ok: true, received: true });
}
