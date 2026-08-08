import type { APIRoute } from '@tanstack/react-start/server';

// Server-side purchase handler for TanStack Start serverFn.
// - Reads SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL from server environment variables.
// - Verifies parcel exists and is available.
// - RETURNS a placeholder response while payment integration is not implemented.

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const parcel_id = body?.parcel_id as string | undefined;

    if (!parcel_id) {
      return new Response(JSON.stringify({ ok: false, reason: 'missing_parcel_id' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      // Service keys not configured in this environment — return placeholder
      return new Response(JSON.stringify({ ok: false, reason: 'payment_not_ready' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Dynamic import so this module does not break client-side bundles
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Re-check parcel status server-side
    const { data: parcel, error } = await supabaseAdmin
      .from('parcels')
      .select('*')
      .eq('id', parcel_id)
      .single();

    if (error) {
      console.error('Supabase error fetching parcel:', error);
      return new Response(JSON.stringify({ ok: false, reason: 'parcel_not_found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (!parcel) {
      return new Response(JSON.stringify({ ok: false, reason: 'parcel_not_found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (parcel.status !== 'available') {
      return new Response(JSON.stringify({ ok: false, reason: 'not_available' }), {
        status: 409,
        headers: { 'content-type': 'application/json' },
      });
    }

    // At this stage we would initiate a payment session with provider,
    // and only after successful payment update parcel.owner_id and status = 'sold'
    // with the service-role key. Since payment integration is out of scope,
    // return a clear "not ready" response so the client doesn't assume success.

    return new Response(JSON.stringify({ ok: false, reason: 'payment_not_ready' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  } catch (err) {
    console.error('Purchase handler error', err);
    return new Response(JSON.stringify({ ok: false, reason: 'internal_error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
