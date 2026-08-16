import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const ParamsSchema = z.object({ parcel_ids: z.array(z.string().uuid()).min(1).max(5000) });

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export const POST = async ({ request }: { request: Request }): Promise<Response> => {
  try {
    const parse = ParamsSchema.safeParse(await request.json().catch(() => ({})));
    if (!parse.success) return jsonResponse({ ok: false, reason: 'invalid_parcel_selection' }, 400);

    const authHeader = request.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';
    if (!token) return jsonResponse({ ok: false, reason: 'unauthenticated' }, 401);

    const supabaseUrl = process.env['SUPABASE_URL'] ?? process.env['VITE_SUPABASE_URL'];
    const publishableKey = process.env['SUPABASE_PUBLISHABLE_KEY'] ?? process.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ?? process.env['VITE_SUPABASE_ANON_KEY'];
    if (!supabaseUrl || !publishableKey) return jsonResponse({ ok: false, reason: 'service_not_configured' }, 503);

    const supabase = createClient(supabaseUrl, publishableKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return jsonResponse({ ok: false, reason: 'unauthenticated' }, 401);

    const { data: orders, error: orderError } = await supabase.rpc('create_parcel_orders_bulk', { p_parcel_ids: [...new Set(parse.data.parcel_ids)] });
    if (orderError) {
      const message = orderError.message ?? '';
      if (/too_many_parcels/i.test(message)) return jsonResponse({ ok: false, reason: 'too_many_parcels' }, 400);
      if (/parcel_(unavailable|already_reserved)/i.test(message)) return jsonResponse({ ok: false, reason: 'not_available' }, 409);
      if (/parcel_not_found/i.test(message)) return jsonResponse({ ok: false, reason: 'parcel_not_found' }, 404);
      if (/unauthorized/i.test(message)) return jsonResponse({ ok: false, reason: 'unauthenticated' }, 401);
      if (/empty_parcel_selection/i.test(message)) return jsonResponse({ ok: false, reason: 'empty_parcel_selection' }, 400);
      console.error('Transactional bulk parcel order failed', orderError);
      return jsonResponse({ ok: false, reason: 'reservation_failed' }, 500);
    }

    return jsonResponse({ ok: true, status: 'reserved', count: Array.isArray(orders) ? orders.length : parse.data.parcel_ids.length, orders }, 202);
  } catch (error) {
    console.error('Unexpected bulk purchase handler error', error);
    return jsonResponse({ ok: false, reason: 'internal_error' }, 500);
  }
};
