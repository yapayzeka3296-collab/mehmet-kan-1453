import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const BodySchema = z.object({
  parcel_ids: z.array(z.string().uuid()).min(1).max(100),
  certificate_parcel_id: z.string().uuid().optional(),
});

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

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

          const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
          const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
          const checkoutUrl = process.env.SHOPIER_CHECKOUT_URL;
          if (!url || !key) return json({ ok: false, reason: 'supabase_not_configured' }, 503);
          if (!checkoutUrl) return json({ ok: false, reason: 'shopier_not_configured' }, 503);

          const supabase = createClient(url, key, {
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
            console.error('Shopier checkout intent failed', error);
            return json({ ok: false, reason: 'checkout_intent_failed' }, 500);
          }

          const intent = data as Record<string, unknown>;
          const separator = checkoutUrl.includes('?') ? '&' : '?';
          const redirectUrl = `${checkoutUrl}${separator}msp_intent=${encodeURIComponent(String(intent.intent_id))}`;
          return json({ ok: true, ...intent, checkout_url: redirectUrl }, 200);
        } catch (error) {
          console.error('Unexpected Shopier checkout error', error);
          return json({ ok: false, reason: 'internal_error' }, 500);
        }
      },
    },
  },
});
