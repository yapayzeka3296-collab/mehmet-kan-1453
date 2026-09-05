import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const BodySchema = z.object({
  parcel_ids: z.array(z.string().uuid()).min(1).max(100),
  certificate_parcel_id: z.string().uuid().nullable().optional(),
});

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const getEnv = (name: string) => process.env[name]?.trim() || '';

export const Route = createFileRoute('/api/shopier/checkout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const parsed = BodySchema.safeParse(await request.json().catch(() => ({})));
          if (!parsed.success) return json({ ok: false, reason: 'invalid_request' }, 400);

          const authHeader = request.headers.get('authorization') ?? '';
          const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
          if (!token) return json({ ok: false, reason: 'unauthenticated' }, 401);

          const supabaseUrl = getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
          const publishableKey = getEnv('SUPABASE_PUBLISHABLE_KEY') || getEnv('VITE_SUPABASE_PUBLISHABLE_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');
          const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
          const shopierPat = getEnv('SHOPIER_PAT');

          if (!supabaseUrl || !publishableKey || !serviceRoleKey) return json({ ok: false, reason: 'supabase_not_configured' }, 503);
          if (!shopierPat) return json({ ok: false, reason: 'shopier_not_configured' }, 503);

          const supabase = createClient(supabaseUrl, publishableKey, {
            auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
            global: { headers: { Authorization: `Bearer ${token}` } },
          });
          const { data: authData, error: authError } = await supabase.auth.getUser(token);
          if (authError || !authData.user) return json({ ok: false, reason: 'unauthenticated' }, 401);

          const { data, error } = await supabase.rpc('create_shopier_checkout_intent', {
            p_parcel_ids: [...new Set(parsed.data.parcel_ids)],
            p_certificate_parcel_id: parsed.data.certificate_parcel_id ?? null,
          });
          if (error) {
            const message = error.message ?? '';
            if (/parcel_unavailable/i.test(message)) return json({ ok: false, reason: 'not_available' }, 409);
            if (/parcel_not_found/i.test(message)) return json({ ok: false, reason: 'parcel_not_found' }, 404);
            if (/empty_parcel_selection/i.test(message)) return json({ ok: false, reason: 'empty_parcel_selection' }, 400);
            if (/too_many_parcels/i.test(message)) return json({ ok: false, reason: 'too_many_parcels' }, 400);
            if (/invalid_certificate_parcel/i.test(message)) return json({ ok: false, reason: 'invalid_certificate_parcel' }, 400);
            if (/invalid_parcel_price/i.test(message)) return json({ ok: false, reason: 'invalid_parcel_price' }, 409);
            if (/unauthorized/i.test(message)) return json({ ok: false, reason: 'unauthenticated' }, 401);
            console.error('Shopier checkout intent failed', error);
            return json({ ok: false, reason: 'checkout_intent_failed' }, 500);
          }

          const intent = data as Record<string, unknown>;
          const intentId = String(intent.intent_id ?? '');
          const amount = Number(intent.amount);
          const currency = String(intent.currency ?? 'TRY').toUpperCase();
          const parcelIds = Array.isArray(intent.parcel_ids) ? intent.parcel_ids.filter((id): id is string => typeof id === 'string') : [];

          if (!intentId || !Number.isFinite(amount) || amount <= 0 || currency !== 'TRY' || !parcelIds.length) {
            console.error('Invalid Shopier checkout intent amount/currency/parcel data', { intentId, amount, currency, parcelCount: parcelIds.length });
            return json({ ok: false, reason: 'checkout_intent_invalid' }, 500);
          }

          const serviceSupabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
          });

          const releaseIntent = async (reason: string) => {
            const now = new Date().toISOString();
            const { error: releaseError } = await serviceSupabase
              .from('parcels')
              .update({ status: 'available', reserved_by: null, reserved_until: null, updated_at: now })
              .in('id', parcelIds)
              .eq('status', 'reserved')
              .eq('reserved_by', authData.user.id);
            if (releaseError) console.error('Shopier reservation release failed', { intentId, reason, error: releaseError });

            const { error: intentError } = await serviceSupabase
              .from('shopier_checkout_intents')
              .update({ status: 'failed', updated_at: now })
              .eq('id', intentId)
              .eq('user_id', authData.user.id)
              .in('status', ['pending', 'redirected']);
            if (intentError) console.error('Shopier intent failure persistence failed', { intentId, reason, error: intentError });
          };

          let shopierResponse: Response;
          try {
            shopierResponse = await fetch('https://api.shopier.com/v1/products', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${shopierPat}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: `MySkyParcel Parsel Siparişi ${intentId}`,
                type: 'digital',
                priceData: {
                  currency: 'TRY',
                  price: amount.toFixed(2),
                },
              }),
            });
          } catch (error) {
            console.error('Shopier product creation request failed', { intentId, error });
            await releaseIntent('shopier_request_failed');
            return json({ ok: false, reason: 'shopier_unreachable' }, 502);
          }

          const shopierBody = await shopierResponse.json().catch(() => ({})) as Record<string, unknown>;
          if (!shopierResponse.ok || !shopierBody.id) {
            console.error('Shopier product creation failed', {
              intentId,
              status: shopierResponse.status,
              body: shopierBody,
            });
            await releaseIntent(`shopier_http_${shopierResponse.status}`);
            return json({ ok: false, reason: 'shopier_product_creation_failed' }, 502);
          }

          const shopierProductId = String(shopierBody.id);
          const productUrl = typeof shopierBody.url === 'string' ? shopierBody.url.trim() : '';
          if (!productUrl) {
            console.error('Shopier product creation returned no product URL', { intentId, status: shopierResponse.status, body: shopierBody });
            await releaseIntent('shopier_product_url_missing');
            return json({ ok: false, reason: 'shopier_product_url_missing' }, 502);
          }

          const { error: intentUpdateError } = await serviceSupabase
            .from('shopier_checkout_intents')
            .update({
              shopier_product_id: shopierProductId,
              checkout_url: productUrl,
              status: 'redirected',
              updated_at: new Date().toISOString(),
            })
            .eq('id', intentId)
            .eq('user_id', authData.user.id)
            .in('status', ['pending', 'redirected']);

          if (intentUpdateError) {
            console.error('Shopier intent persistence failed', intentUpdateError);
            await releaseIntent('intent_persistence_failed');
            return json({ ok: false, reason: 'checkout_persistence_failed' }, 500);
          }

          return json({
            ok: true,
            ...intent,
            shopier_product_id: shopierProductId,
            checkout_url: productUrl,
            shopier_product_url: productUrl,
          }, 200);
        } catch (error) {
          console.error('Unexpected Shopier checkout error', error);
          return json({ ok: false, reason: 'internal_error' }, 500);
        }
      },
    },
  },
});
