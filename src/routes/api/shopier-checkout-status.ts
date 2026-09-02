import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
export async function GET({ request }: { request: Request }) {
  try {
    const parsed = z.string().uuid().safeParse(new URL(request.url).searchParams.get('intent'));
    if (!parsed.success) return json({ ok: false, reason: 'invalid_intent' }, 400);
    const token = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim(); if (!token) return json({ ok: false, reason: 'unauthenticated' }, 401);
    const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL; const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY; if (!url || !key) return json({ ok: false, reason: 'supabase_not_configured' }, 503);
    const userClient = createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } });
    const { data: { user }, error: authError } = await userClient.auth.getUser(token); if (authError || !user) return json({ ok: false, reason: 'unauthenticated' }, 401);
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; if (!serviceKey) return json({ ok: false, reason: 'server_not_configured' }, 503);
    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await admin.from('shopier_checkout_intents').select('id,status').eq('id', parsed.data).eq('user_id', user.id).maybeSingle(); if (error || !data) return json({ ok: false, reason: 'not_found' }, 404);
    return json({ ok: true, status: data.status });
  } catch { return json({ ok: false, reason: 'internal_error' }, 500); }
}
