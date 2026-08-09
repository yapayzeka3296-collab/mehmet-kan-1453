import type { APIRoute } from '@tanstack/react-start/server';
import { z } from 'zod';

const ParamsSchema = z.object({
  parcel_id: z.string().uuid(),
});

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  try {
    const json = await request.json().catch(() => ({}));
    const parse = ParamsSchema.safeParse(json);

    if (!parse.success) {
      return jsonResponse({ ok: false, reason: 'invalid_parcel_id' }, 400);
    }

    const { parcel_id } = parse.data;
    const authHeader = request.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : null;

    if (!token) {
      return jsonResponse({ ok: false, reason: 'unauthenticated' }, 401);
    }

    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ ok: false, reason: 'service_not_configured' }, 503);
    }

    let supabaseAdmin: Awaited<ReturnType<typeof import('@supabase/supabase-js').createClient>>;

    try {
      const { createClient } = await import('@supabase/supabase-js');
      supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    } catch (error) {
      console.error('Failed to create Supabase server client', error);
      return jsonResponse({ ok: false, reason: 'server_error' }, 500);
    }

    try {
      const {
        data: { user },
        error: authError,
      } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        return jsonResponse({ ok: false, reason: 'unauthenticated' }, 401);
      }

      const { data: updatedParcel, error: updateError } = await supabaseAdmin
        .from('parcels')
        .update({ status: 'reserved', owner_id: user.id })
        .eq('id', parcel_id)
        .eq('status', 'available')
        .select(
          'id, parcel_number, status, owner_id, price, tier, tier_price, city_id, latitude, longitude, created_at, updated_at',
        )
        .maybeSingle();

      if (updateError) {
        console.error('Error reserving parcel', updateError);
        return jsonResponse({ ok: false, reason: 'reservation_failed' }, 500);
      }

      if (!updatedParcel) {
        const { data: existingParcel, error: fetchError } = await supabaseAdmin
          .from('parcels')
          .select('id, status')
          .eq('id', parcel_id)
          .maybeSingle();

        if (fetchError) {
          return jsonResponse({ ok: false, reason: 'internal_error' }, 500);
        }

        if (!existingParcel) {
          return jsonResponse({ ok: false, reason: 'parcel_not_found' }, 404);
        }

        return jsonResponse({ ok: false, reason: 'not_available' }, 409);
      }

      return jsonResponse({ ok: true, status: 'reserved', parcel: updatedParcel }, 202);
    } catch (error) {
      console.error('Database error during reservation', error);
      return jsonResponse({ ok: false, reason: 'internal_error' }, 500);
    }
  } catch (error) {
    console.error('Unexpected purchase handler error', error);
    return jsonResponse({ ok: false, reason: 'internal_error' }, 500);
  }
};
