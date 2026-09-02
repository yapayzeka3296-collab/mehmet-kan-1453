import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { createShopierCheckout } from '@/lib/shopier';

const BodySchema = z.object({ parcel_ids: z.array(z.string().uuid()).min(1).max(5000), certificate_parcel_id: z.string().uuid() });
const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export async function POST({ request }: { request: Request }) {
  try {
    const parsed = BodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return json({ ok: false, reason: 'invalid_selection' }, 400);
    const token = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
    if (!token) return json({ ok: false, reason: 'unauthenticated' }, 401);
    const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return json({ ok: false, reason: 'supabase_not_configured' }, 503);
    const supabase = createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } });
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return json({ ok: false, reason: 'unauthenticated' }, 401);
    const parcelIds = [...new Set(parsed.data.parcel_ids)];
    if (!parcelIds.includes(parsed.data.certificate_parcel_id)) return json({ ok: false, reason: 'certificate_parcel_not_selected' }, 400);

    const { data: orders, error: orderError } = await supabase.rpc('create_parcel_orders_bulk', { p_parcel_ids: parcelIds });
    if (orderError) {
      const message = orderError.message ?? '';
      if (/parcel_(unavailable|already_reserved)/i.test(message)) return json({ ok: false, reason: 'not_available' }, 409);
      if (/too_many_parcels/i.test(message)) return json({ ok: false, reason: 'too_many_parcels' }, 400);
      console.error('Shopier reservation failed', orderError); return json({ ok: false, reason: 'reservation_failed' }, 500);
    }
    const orderRows = (Array.isArray(orders) ? orders : orders ? [orders] : []) as Array<{ id: string; parcel_id: string; amount: number }>;
    if (orderRows.length !== parcelIds.length) return json({ ok: false, reason: 'reservation_incomplete' }, 409);
    const orderIds = orderRows.map((row) => row.id);
    const total = orderRows.reduce((sum, row) => sum + Number(row.amount), 0);
    if (!Number.isFinite(total) || total <= 0) return json({ ok: false, reason: 'invalid_total' }, 500);

    const { data: intent, error: intentError } = await supabase.from('shopier_checkout_intents').insert({
      user_id: user.id, parcel_id: parcelIds[0], order_id: orderIds[0] ?? null, order_ids: orderIds,
      parcel_ids: parcelIds, certificate_parcel_id: parsed.data.certificate_parcel_id,
      amount: total, currency: 'TRY', status: 'pending', expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    }).select('id').single();
    if (intentError || !intent) { console.error('Shopier intent creation failed', intentError); return json({ ok: false, reason: 'intent_creation_failed' }, 500); }

    const checkout = await createShopierCheckout({ title: `MySkyParcel Sipariş ${intent.id.slice(0, 8).toUpperCase()}`, amount: total, description: `MySkyParcel ${orderRows.length} parsel satın alma işlemi`, orderId: intent.id });
    const { error: updateError } = await supabase.from('shopier_checkout_intents').update({ status: 'redirected', shopier_product_id: checkout.productId, checkout_url: checkout.paymentUrl }).eq('id', intent.id);
    if (updateError) { console.error('Shopier intent update failed', updateError); return json({ ok: false, reason: 'checkout_mapping_failed' }, 500); }
    return json({ ok: true, intent_id: intent.id, order_ids: orderIds, amount: total, currency: 'TRY', checkout_url: checkout.paymentUrl, checkout_html: checkout.checkoutHtml });
  } catch (error) { console.error('Shopier checkout error', error); return json({ ok: false, reason: 'internal_error' }, 500); }
}
