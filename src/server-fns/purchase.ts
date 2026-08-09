import type { APIRoute } from '@tanstack/react-start/server';
import { z } from 'zod';

// Secure purchase serverFn for TanStack Start
// - Validates parcel_id
// - Authenticates user from Authorization: Bearer <access_token>
// - Uses Supabase service role for an atomic conditional reservation
// - Does NOT mark parcel as 'sold' or perform payment logic
// - Returns appropriate HTTP status codes

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

    // Extract access token from Authorization header.
    const authHeader = request.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : null;

    if (!token) {
      return jsonResponse({ ok: false, reason: 'unauthenticated' }, 401);
    }

    // Read server-only environment variables.
    const supabaseUrl =
      process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return jsonResponse({ ok: false, reason: 'service_not_configured' }, 503);
    }

    // Dynamic import keeps the server-only Supabase client out of client bundles.
    let supabaseAdmin: Awaited<
      ReturnType<
        typeof import('@supabase/supabase-js').createClient
      >
    >;

    try {
      const { createClient } = await import('@supabase/supabase-js');
      supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    } catch (error) {
      console.error('Failed to create Supabase server client', error);
      return jsonResponse({ ok: false, reason: 'server_error' }, 500);
    }

    // Verify the access token and obtain the authenticated user's id.
    try {
      const {
        data: { user },
        error: authError,
      } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        console.error('Auth token invalid or user not found', authError);
        return jsonResponse({ ok: false, reason: 'unauthenticated' }, 401);
      }

      // A single conditional UPDATE is atomic at the database level:
      // only one concurrent request can change an available parcel to reserved.
      const { data: updatedParcel, error: updateError } = await supabaseAdmin
        .from('parcels')
        .update({ status: 'reserved', owner_id: user.id })
        .eq('id', parcel_id)
        .eq('status', 'available')
        .select(
          'id, parcel_number, status, price, latitude, longitude, created_at, updated_at',
        )
        .maybeSingle();

      if (updateError) {
        console.error('Error reserving parcel', updateError);
        return jsonResponse({ ok: false, reason: 'reservation_failed' }, 500);
      }

      if (!updatedParcel) {
        // The conditional UPDATE affected no row. Distinguish a missing parcel
        // from an existing parcel that has already been reserved/sold.
        const { data: existingParcel, error: fetchError } = await supabaseAdmin
          .from('parcels')
          .select('id, status')
          .eq('id', parcel_id)
          .maybeSingle();

        if (fetchError) {
          console.error('Error checking parcel after failed reservation', fetchError);
          return jsonResponse({ ok: false, reason: 'internal_error' }, 500);
        }

        if (!existingParcel) {
          return jsonResponse({ ok: false, reason: 'parcel_not_found' }, 404);
        }

        return jsonResponse({ ok: false, reason: 'not_available' }, 409);
      }

      // Reservation succeeded. Payment is intentionally not handled here.
      return jsonResponse(
        {
          ok: true,
          status: 'reserved',
          parcel: updatedParcel,
        },
        202,
      );
    } catch (error) {
      console.error('Database error during reservation', error);
      return jsonResponse({ ok: false, reason: 'internal_error' }, 500);
    }
  } catch (error) {
    console.error('Unexpected purchase handler error', error);
    return jsonResponse({ ok: false, reason: 'internal_error' }, 500);
  }
};
