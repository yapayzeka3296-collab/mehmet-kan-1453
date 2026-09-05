import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';

const html = (body: string, status = 200) => new Response(body, {
  status,
  headers: {
    'content-type': 'text/html; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  },
});

const getEnv = (name: string) => process.env[name]?.trim() || '';

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export const Route = createFileRoute('/api/shopier/redirect')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const intentId = new URL(request.url).searchParams.get('intent')?.trim() || '';
          const supabaseUrl = getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
          // Keep the same server-key aliases used by the checkout endpoint.
          const serviceRoleKey = getEnv('SUPABASE_SECRET_KEY') || getEnv('SUPABASE_SERVICE_ROLE_KEY');
          const shopSlug = getEnv('SHOPIER_SHOP_SLUG');
          if (!intentId || !supabaseUrl || !serviceRoleKey || !shopSlug) {
            console.error('Shopier redirect is not configured', {
              hasIntent: Boolean(intentId),
              hasSupabaseUrl: Boolean(supabaseUrl),
              hasServiceRoleKey: Boolean(serviceRoleKey),
              hasShopSlug: Boolean(shopSlug),
            });
            return html('<!doctype html><html lang="tr"><body>Ödeme bağlantısı yapılandırılamadı.</body></html>', 503);
          }

          const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
          });
          const { data: intent, error } = await supabase
            .from('shopier_checkout_intents')
            .select('id,shopier_product_id,status,expires_at')
            .eq('id', intentId)
            .maybeSingle();

          if (error || !intent?.shopier_product_id) {
            console.error('Shopier redirect intent lookup failed', { intentId, code: error?.code, message: error?.message });
            return html('<!doctype html><html lang="tr"><body>Ödeme bağlantısı bulunamadı.</body></html>', 404);
          }
          if (!['pending', 'redirected'].includes(String(intent.status))) {
            return html('<!doctype html><html lang="tr"><body>Bu ödeme oturumu artık kullanılamıyor.</body></html>', 410);
          }
          if (intent.expires_at && new Date(String(intent.expires_at)).getTime() <= Date.now()) {
            return html('<!doctype html><html lang="tr"><body>Ödeme oturumunun süresi dolmuş.</body></html>', 410);
          }

          const productId = escapeHtml(String(intent.shopier_product_id));
          const encodedSlug = encodeURIComponent(shopSlug);
          return html(`<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Shopier Ödeme</title>
</head>
<body>
  <form id="shopier-hosted-checkout" method="POST" action="https://www.shopier.com/s/shipping/${encodedSlug}">
    <input type="hidden" name="product_id" value="${productId}">
    <input type="hidden" name="quantity" value="1">
    <noscript><button type="submit">Shopier ile ödemeye devam et</button></noscript>
  </form>
  <script>document.getElementById('shopier-hosted-checkout').submit();</script>
</body>
</html>`);
        } catch (error) {
          console.error('Shopier redirect error', error);
          return html('<!doctype html><html lang="tr"><body>Ödeme yönlendirmesi hazırlanamadı.</body></html>', 500);
        }
      },
    },
  },
});
