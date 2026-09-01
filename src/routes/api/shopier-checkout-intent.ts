import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const BodySchema = z.object({ parcel_id: z.string().uuid() });

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export async function POST({ request }: { request: Request }) {
  try {
    const parsed = BodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return json({ ok: false, reason: 'invalid_parcel_id' }, 400);

    const token = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim();
    if (!token) return json({ ok: false, reason: 'unauthenticated' }, 401);

    const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return json({ ok: false, reason: 'supabase_not_configured' }, 503);

    const supabase = createClient(url, key, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return json({ ok: false, reason: 'unauthenticated' }, 401);

    // Reuse the existing transactional reservation RPC. This intentionally does
    // not replace the current payment page and does not call an unverified
    // Shopier checkout endpoint.
    const { data: order, error } = await supabase.rpc('create_parcel_order', { p_parcel_id: parsed.data.parcel_id });
    if (error) {
      if (/parcel_(unavailable|already_reserved)/i.test(error.message)) return json({ ok: false, reason: 'not_available' }, 409);
      if (/parcel_not_found/i.test(error.message)) return json({ ok: false, reason: 'parcel_not_found' }, 404);
      console.error('Shopier reservation failed', error);
      return json({ ok: false, reason: 'reservation_failed' }, 500);
    }

    const orderRecord = Array.isArray(order) ? order[0] : order;
    const amount = Number(orderRecord?.amount ?? orderRecord?.total_amount ?? 0);
    const { data: intent, error: intentError } = await supabase
      .from('shopier_checkout_intents')
      .insert({
        user_id: user.id,
        parcel_id: parsed.data.parcel_id,
        order_id: orderRecord?.id ?? null,
        amount,
        currency: 'TRY',
        status: 'pending',
      })
      .select()
      .single();

    if (intentError) {
      console.error('Shopier checkout intent creation failed', intentError);
      return json({ ok: false, reason: 'intent_creation_failed' }, 500);
    }

    return json({
      ok: true,
      status: 'pending',
      intent_id: intent.id,
      order_id: orderRecord?.id ?? null,
      amount,
      currency: 'TRY',
      shopier_ready: false,
    }, 202);
  } catch (error) {
    console.error('Shopier checkout intent error', error);
    return json({ ok: false, reason: 'internal_error' }, 500);
  }
}
