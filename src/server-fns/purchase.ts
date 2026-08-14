import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

const ParamsSchema = z.object({ parcel_id: z.string().uuid() });

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

/**
 * Legacy HTTP purchase endpoint kept for compatibility with existing clients.
 * All reservation/order state changes are delegated to the transactional
 * create_parcel_order() RPC. This endpoint deliberately never uses the
 * service-role key, never accepts a client-supplied owner/price/status, and
 * never mutates parcels directly.
 */
export const POST = async ({ request }: { request: Request }): Promise<Response> => {
  try {
    const json = await request.json().catch(() => ({}));
    const parse = ParamsSchema.safeParse(json);
    if (!parse.success) return jsonResponse({ ok: false, reason: 'invalid_parcel_id' }, 400);

    const authHeader = request.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : '';
    if (!token) return jsonResponse({ ok: false, reason: 'unauthenticated' }, 401);

    const supabaseUrl = process.env['SUPABASE_URL'] ?? process.env['VITE_SUPABASE_URL'];
    const publishableKey =
      process.env['SUPABASE_PUBLISHABLE_KEY'] ??
      process.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ??
      process.env['VITE_SUPABASE_ANON_KEY'];

    if (!supabaseUrl || !publishableKey) {
      return jsonResponse({ ok: false, reason: 'service_not_configured' }, 503);
    }

    const supabase = createClient(supabaseUrl, publishableKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) return jsonResponse({ ok: false, reason: 'unauthenticated' }, 401);

    const { data: order, error: orderError } = await supabase.rpc('create_parcel_order', {
      p_parcel_id: parse.data.parcel_id,
    });

    if (orderError) {
      const message = orderError.message ?? '';
      if (/parcel_(unavailable|already_reserved)/i.test(message)) {
        return jsonResponse({ ok: false, reason: 'not_available' }, 409);
      }
      if (/parcel_not_found/i.test(message)) {
        return jsonResponse({ ok: false, reason: 'parcel_not_found' }, 404);
      }
      if (/unauthorized/i.test(message)) {
        return jsonResponse({ ok: false, reason: 'unauthenticated' }, 401);
      }
      console.error('Transactional parcel order failed', orderError);
      return jsonResponse({ ok: false, reason: 'reservation_failed' }, 500);
    }

    return jsonResponse({ ok: true, status: 'reserved', order }, 202);
  } catch (error) {
    console.error('Unexpected purchase handler error', error);
    return jsonResponse({ ok: false, reason: 'internal_error' }, 500);
  }
};
