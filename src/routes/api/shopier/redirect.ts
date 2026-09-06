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

const isShopierUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'shopier.com' || url.hostname.endsWith('.shopier.com'));
  } catch {
    return false;
  }
};

export const Route = createFileRoute('/api/shopier/redirect')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const intentId = new URL(request.url).searchParams.get('intent')?.trim() || '';
          const supabaseUrl = getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
          const serviceRoleKey = getEnv('SUPABASE_SECRET_KEY') || getEnv('SUPABASE_SERVICE_ROLE_KEY');
          const shopSlug = getEnv('SHOPIER_SHOP_SLUG');

          if (!intentId || !supabaseUrl || !serviceRoleKey) {
            console.error('Shopier redirect is not configured', {
              hasIntent: Boolean(intentId),
              hasSupabaseUrl: Boolean(supabaseUrl),
              hasServiceRoleKey: Boolean(serviceRoleKey),
            });
            return html('<!doctype html><html lang="tr"><body>Ödeme bağlantısı yapılandırılamadı.</body></html>', 503);
          }

          const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
          });
          const { data: intent, error } = await supabase
            .from('shopier_checkout_intents')
            .select('id,shopier_product_id,checkout_url,status,expires_at')
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

          const productId = String(intent.shopier_product_id);
          const storedCheckoutUrl = typeof intent.checkout_url === 'string' ? intent.checkout_url.trim() : '';
          const canonicalProductUrl = `https://www.shopier.com/${encodeURIComponent(productId)}`;

          if (shopSlug) {
            const safeProductId = escapeHtml(productId);
            const safeShopSlug = escapeHtml(encodeURIComponent(shopSlug));
            return html(`<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Shopier Güvenli Ödeme</title>
</head>
<body>
  <p>Shopier güvenli ödeme sayfasına yönlendiriliyorsunuz...</p>
  <form id="shopier-checkout" method="POST" action="https://www.shopier.com/s/shipping/${safeShopSlug}">
    <input type="hidden" name="product_id" value="${safeProductId}">
    <input type="hidden" name="quantity" value="1">
  </form>
  <noscript><button type="submit" form="shopier-checkout">Ödemeye devam et</button></noscript>
  <script>document.getElementById('shopier-checkout').submit();</script>
</body>
</html>`);
          }

          const productUrl = isShopierUrl(storedCheckoutUrl) ? storedCheckoutUrl : canonicalProductUrl;
          const safeProductUrl = escapeHtml(productUrl);
          return html(`<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0;url=${safeProductUrl}">
  <title>Shopier Ödeme</title>
</head>
<body>
  <p>Shopier güvenli ödeme sayfasına yönlendiriliyorsunuz...</p>
  <p><a href="${safeProductUrl}">Shopier ile ödemeye devam et</a></p>
  <script>window.location.replace(${JSON.stringify(productUrl)});</script>
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
