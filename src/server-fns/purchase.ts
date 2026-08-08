import type { APIRoute } from '@tanstack/react-start/server';
import { z } from 'zod';

// Secure purchase serverFn for TanStack Start
// - Validates parcel_id
// - Authenticates user from Authorization: Bearer <access_token>
// - Uses Supabase service role to perform an atomic reservation (status -> 'reserved')
// - Does NOT mark parcel as 'sold' or perform any payment logic
// - Returns appropriate HTTP status codes

const ParamsSchema = z.object({
  parcel_id: z.string().uuid(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const json = await request.json().catch(() => ({}));
    const parse = ParamsSchema.safeParse(json);
    if (!parse.success) {
      return new Response(JSON.stringify({ ok: false, reason: 'invalid_parcel_id' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const { parcel_id } = parse.data;

    // Extract access token from Authorization header
    const authHeader = request.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return new Response(JSON.stringify({ ok: false, reason: 'unauthenticated' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Read server env for Supabase admin
    const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      // Service role not configured on server: cannot proceed with reservation.
      return new Response(
        JSON.stringify({ ok: false, reason: 'service_not_configured' }),
        { status: 503, headers: { 'content-type': 'application/json' } },
      );
    }

    // Dynamic import of Supabase so client bundles are unaffected
    let createClient: any;
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mod = await import('@supabase/supabase-js');
      createClient = (mod as any).createClient;
    } catch (err) {
      console.error('Failed to import @supabase/supabase-js in serverFn', err);
      return new Response(JSON.stringify({ ok: false, reason: 'server_error' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Authenticate the provided access token and get the user id
    // NOTE: supabaseAdmin.auth.getUser(token) is used in v2; adapt if your SDK differs.
    let userId: string | null = null;
    try {
      // @ts-ignore - runtime check; supabase-js types may vary
      const userRes = await supabaseAdmin.auth.getUser(token);
      // supabase-js returns { data: { user }, error }
      // accommodate both shapes
      const user = userRes?.data?.user ?? userRes?.user ?? null;
      const userErr = userRes?.error ?? null;
      if (userErr || !user) {
        console.error('Auth token invalid or user not found', userErr);
        return new Response(JSON.stringify({ ok: false, reason: 'unauthenticated' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        });
      }
      userId = user.id as string;
    } catch (err) {
      console.error('Error verifying user token', err);
      return new Response(JSON.stringify({ ok: false, reason: 'unauthenticated' }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Attempt atomic reservation: set status='reserved' and owner_id=userId only if status is currently 'available'
    try {
      const { data: updatedParcel, error: updateError } = await supabaseAdmin
        .from('parcels')
        .update({ status: 'reserved', owner_id: userId })
        .eq('id', parcel_id)
        .eq('status', 'available')
        .select('*')
        .single();

      if (updateError) {
        // If no rows were updated because status was not 'available', supabase returns 406/pg error or empty result.
        // We check specifically if it's a not found / conflict
        console.error('Error reserving parcel', updateError);
        return new Response(JSON.stringify({ ok: false, reason: 'reservation_failed' }), {
          status: 500,
          headers: { 'content-type': 'application/json' },
        });
      }

      if (!updatedParcel) {
        // No parcel updated: either parcel not found or not available
        // Check if parcel exists to return 404 vs 409
        const { data: existing, error: fetchErr } = await supabaseAdmin
          .from('parcels')
          .select('status')
          .eq('id', parcel_id)
          .single();

        if (fetchErr || !existing) {
          return new Response(JSON.stringify({ ok: false, reason: 'parcel_not_found' }), {
            status: 404,
            headers: { 'content-type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ ok: false, reason: 'not_available' }), {
          status: 409,
          headers: { 'content-type': 'application/json' },
        });
      }

      // Reservation succeeded. Respond with 202 Accepted and reservation details.
      // Do NOT mark as sold or claim payment success here.
      const safeParcel = {
        id: updatedParcel.id,
        parcel_number: updatedParcel.parcel_number,
        status: updatedParcel.status,
        price: updatedParcel.price,
        latitude: updatedParcel.latitude,
        longitude: updatedParcel.longitude,
        created_at: updatedParcel.created_at,
        updated_at: updatedParcel.updated_at,
      };

      return new Response(JSON.stringify({ ok: true, status: 'reserved', parcel: safeParcel }), {
        status: 202,
        headers: { 'content-type': 'application/json' },
      });
    } catch (err) {
      console.error('Database error during reservation', err);
      return new Response(JSON.stringify({ ok: false, reason: 'internal_error' }), {
        status: 500,
        headers: { 'content-type': 'application/json' },
      });
    }
  } catch (err) {
    console.error('Unexpected purchase handler error', err);
    return new Response(JSON.stringify({ ok: false, reason: 'internal_error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
