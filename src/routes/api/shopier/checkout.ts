import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const BodySchema = z.object({
  parcel_ids: z.array(z.string().uuid()).min(1).max(100),
  certificate_parcel_id: z.string().uuid().nullable().optional(),
});

const json = (body: Record<string, unknown>, status = 200) => new Response(
  JSON.stringify(body),
  { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } },
);

const getEnv = (name: string) => process.env[name]?.trim() || '';
const SHOPIER_TIMEOUT_MS = 15_000;

const readJson = async (response: Response): Promise<Record<string, unknown>> => {
  const text = await response.text().catch(() => '');
  if (!text) return {};
  try {
    const parsed: unknown = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
};

const getString = (value: unknown) => typeof value === 'string' ? value.trim() : '';

const isShopierUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'shopier.com' || url.hostname.endsWith('.shopier.com'));
  } catch {
    return false;
  }
};

export const Route = createFileRoute('/api/shopier/checkout')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let intentId = '';
        let releaseIntent: ((reason: string) => Promise<void>) | null = null;

        try {
          const parsed = BodySchema.safeParse(await request.json().catch(() => ({})));
          if (!parsed.success) return json({ ok: false, reason: 'invalid_request' }, 400);

          const authHeader = request.headers.get('authorization') ?? '';
          const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
          if (!token) return json({ ok: false, reason: 'unauthenticated' }, 401);

          const supabaseUrl = getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
          const publishableKey = getEnv('SUPABASE_PUBLISHABLE_KEY') || getEnv('VITE_SUPABASE_PUBLISHABLE_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');
          const serviceRoleKey = getEnv('SUPABASE_SECRET_KEY') || getEnv('SUPABASE_SERVICE_ROLE_KEY');
          const shopierPat = getEnv('SHOPIER_PAT');
          const thumbnailBaseUrl = getEnv('SHOPIER_PARCEL_THUMBNAIL_URL') || 'https://myskyparcel.com/api/shopier/parcel-image';

          if (!supabaseUrl || !publishableKey || !serviceRoleKey) return json({ ok: false, reason: 'supabase_not_configured' }, 503);
          if (!shopierPat) return json({ ok: false, reason: 'shopier_not_configured' }, 503);

          const supabase = createClient(supabaseUrl, publishableKey, {
            auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
            global: { headers: { Authorization: `Bearer ${token}` } },
          });
          const { data: authData, error: authError } = await supabase.auth.getUser(token);
          if (authError || !authData.user) return json({ ok: false, reason: 'unauthenticated' }, 401);

          const serviceSupabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
          });

          const { error: cleanupError } = await serviceSupabase.rpc('cleanup_expired_shopier_checkout_state');
          if (cleanupError) {
            console.error('Shopier expired-state cleanup failed', { code: cleanupError.code, message: cleanupError.message });
          }

          const parcelIdsRequest = [...new Set(parsed.data.parcel_ids)];
          let { data, error } = await supabase.rpc('create_shopier_checkout_intent', {
            p_parcel_ids: parcelIdsRequest,
            p_certificate_parcel_id: parsed.data.certificate_parcel_id ?? null,
          });

          if (error && !/parcel_reserved_by_other_user|parcel_unavailable|parcel_not_found|empty_parcel_selection|too_many_parcels|invalid_certificate_parcel|invalid_parcel_price|unauthorized/i.test(error.message ?? '')) {
            const { error: retryCleanupError } = await serviceSupabase.rpc('cleanup_expired_shopier_checkout_state');
            if (retryCleanupError) {
              console.error('Shopier checkout retry cleanup failed', { code: retryCleanupError.code, message: retryCleanupError.message });
            }
            ({ data, error } = await supabase.rpc('create_shopier_checkout_intent', {
              p_parcel_ids: parcelIdsRequest,
              p_certificate_parcel_id: parsed.data.certificate_parcel_id ?? null,
            }));
          }

          if (error) {
            const message = error.message ?? '';
            if (/parcel_reserved_by_other_user/i.test(message)) return json({ ok: false, reason: 'parcel_reserved_by_other_user' }, 409);
            if (/parcel_unavailable/i.test(message)) return json({ ok: false, reason: 'not_available' }, 409);
            if (/parcel_not_found/i.test(message)) return json({ ok: false, reason: 'parcel_not_found' }, 404);
            if (/empty_parcel_selection/i.test(message)) return json({ ok: false, reason: 'empty_parcel_selection' }, 400);
            if (/too_many_parcels/i.test(message)) return json({ ok: false, reason: 'too_many_parcels' }, 400);
            if (/invalid_certificate_parcel/i.test(message)) return json({ ok: false, reason: 'invalid_certificate_parcel' }, 400);
            if (/invalid_parcel_price/i.test(message)) return json({ ok: false, reason: 'invalid_parcel_price' }, 409);
            if (/unauthorized/i.test(message)) return json({ ok: false, reason: 'unauthenticated' }, 401);
            console.error('Shopier checkout intent failed after cleanup retry', { code: error.code, message: error.message });
            return json({ ok: false, reason: 'checkout_intent_failed' }, 500);
          }

          const intent = data as Record<string, unknown>;
          intentId = String(intent.intent_id ?? '');
          const amount = Number(intent.amount);
          const currency = String(intent.currency ?? 'TRY').toUpperCase();
          const parcelIds = Array.isArray(intent.parcel_ids) ? intent.parcel_ids.filter((id): id is string => typeof id === 'string') : [];

          if (!intentId || !Number.isFinite(amount) || amount <= 0 || currency !== 'TRY' || !parcelIds.length) {
            console.error('Invalid Shopier checkout intent data', { intentId, amount, currency, parcelCount: parcelIds.length });
            return json({ ok: false, reason: 'checkout_intent_invalid' }, 500);
          }

          const { data: parcelRows, error: parcelLookupError } = await serviceSupabase
            .from('parcels')
            .select('id,parcel_number')
            .in('id', parcelIds);
          if (parcelLookupError || !parcelRows?.length) {
            console.error('Shopier parcel thumbnail data lookup failed', { intentId, code: parcelLookupError?.code, message: parcelLookupError?.message });
            return json({ ok: false, reason: 'checkout_intent_invalid' }, 500);
          }

          const parcelThumbnailUrl = new URL(thumbnailBaseUrl);
          parcelThumbnailUrl.searchParams.set('ids', parcelIds.join(','));
          const imageUrl = parcelThumbnailUrl.toString();

          releaseIntent = async (reason: string) => {
            const now = new Date().toISOString();
            const { error: releaseError } = await serviceSupabase
              .from('parcels')
              .update({ status: 'available', reserved_by: null, reserved_until: null, updated_at: now })
              .in('id', parcelIds)
              .eq('status', 'reserved')
              .eq('reserved_by', authData.user.id);
            if (releaseError) console.error('Shopier reservation release failed', { intentId, reason, code: releaseError.code, message: releaseError.message });

            const { error: orderError } = await serviceSupabase
              .from('orders')
              .update({ status: 'cancelled', updated_at: now })
              .in('id', Array.isArray(intent.order_ids) ? intent.order_ids.filter((id): id is string => typeof id === 'string') : [])
              .eq('user_id', authData.user.id)
              .eq('status', 'pending');
            if (orderError) console.error('Shopier pending order cancellation failed', { intentId, reason, code: orderError.code, message: orderError.message });

            const { error: intentError } = await serviceSupabase
              .from('shopier_checkout_intents')
              .update({ status: 'failed', updated_at: now })
              .eq('id', intentId)
              .eq('user_id', authData.user.id)
              .in('status', ['pending', 'redirected']);
            if (intentError) console.error('Shopier intent failure persistence failed', { intentId, reason, code: intentError.code, message: intentError.message });
          };

          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), SHOPIER_TIMEOUT_MS);
          let shopierResponse: Response;
          try {
            shopierResponse = await fetch('https://api.shopier.com/v1/products', {
              method: 'POST',
              signal: controller.signal,
              headers: {
                Authorization: `Bearer ${shopierPat}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Idempotency-Key': intentId,
              },
              body: JSON.stringify({
                title: `MySkyParcel Parsel Siparişi ${intentId}`,
                description: `MySkyParcel parsel satın alma işlemi. Sipariş referansı: ${intentId}`,
                type: 'digital',
                shippingPayer: 'sellerPays',
                priceData: { currency: 'TRY', price: amount.toFixed(2) },
                media: [{ type: 'image', url: imageUrl, placement: 1 }],
                stockQuantity: 1,
                customListing: true,
                customNote: `MySkyParcel intent: ${intentId}`,
              }),
            });
          } catch (error) {
            clearTimeout(timeout);
            const aborted = error instanceof Error && error.name === 'AbortError';
            console.error('Shopier product creation request failed', { intentId, reason: aborted ? 'timeout' : 'network_error', message: error instanceof Error ? error.message : String(error) });
            await releaseIntent(aborted ? 'shopier_timeout' : 'shopier_request_failed');
            return json({ ok: false, reason: aborted ? 'shopier_timeout' : 'shopier_unreachable' }, 502);
          }
          clearTimeout(timeout);

          const shopierBody = await readJson(shopierResponse);
          if (!shopierResponse.ok) {
            const apiMessage = getString(shopierBody.message) || getString(shopierBody.error) || getString(shopierBody.detail);
            console.error('Shopier product creation failed', { intentId, status: shopierResponse.status, message: apiMessage.slice(0, 300) });
            await releaseIntent(`shopier_http_${shopierResponse.status}`);
            if (shopierResponse.status === 401 || shopierResponse.status === 403) return json({ ok: false, reason: 'shopier_auth_failed' }, 502);
            if (shopierResponse.status === 400 || shopierResponse.status === 422) return json({ ok: false, reason: 'shopier_validation_failed' }, 502);
            return json({ ok: false, reason: 'shopier_product_creation_failed' }, 502);
          }

          const product = (shopierBody.data && typeof shopierBody.data === 'object' ? shopierBody.data : shopierBody) as Record<string, unknown>;
          const shopierProductId = getString(product.id) || getString(product.product_id) || getString(shopierBody.id) || getString(shopierBody.product_id);
          const explicitCheckoutUrl = getString(product.checkout_url) || getString(product.checkoutUrl) || getString(shopierBody.checkout_url) || getString(shopierBody.checkoutUrl);
          const productUrl = getString(product.url) || getString(shopierBody.url);

          if (!shopierProductId) {
            console.error('Shopier product creation returned no product id', { intentId, status: shopierResponse.status });
            await releaseIntent('shopier_product_id_missing');
            return json({ ok: false, reason: 'shopier_product_id_missing' }, 502);
          }

          const canonicalProductUrl = `https://www.shopier.com/${encodeURIComponent(shopierProductId)}`;
          const checkoutUrl = [explicitCheckoutUrl, productUrl, canonicalProductUrl]
            .find((candidate) => isShopierUrl(candidate)) || canonicalProductUrl;

          const { error: intentUpdateError } = await serviceSupabase
            .from('shopier_checkout_intents')
            .update({ shopier_product_id: shopierProductId, checkout_url: checkoutUrl, status: 'redirected', updated_at: new Date().toISOString() })
            .eq('id', intentId)
            .eq('user_id', authData.user.id)
            .in('status', ['pending', 'redirected']);

          if (intentUpdateError) {
            console.error('Shopier intent persistence failed', { intentId, code: intentUpdateError.code, message: intentUpdateError.message });
            await releaseIntent('intent_persistence_failed');
            return json({ ok: false, reason: 'checkout_persistence_failed' }, 500);
          }

          return json({ ok: true, ...intent, shopier_product_id: shopierProductId, checkout_url: checkoutUrl, shopier_product_url: productUrl || canonicalProductUrl }, 200);
        } catch (error) {
          console.error('Unexpected Shopier checkout error', { intentId, message: error instanceof Error ? error.message : String(error) });
          if (releaseIntent) await releaseIntent('internal_error').catch(() => undefined);
          return json({ ok: false, reason: 'internal_error' }, 500);
        }
      },
    },
  },
});