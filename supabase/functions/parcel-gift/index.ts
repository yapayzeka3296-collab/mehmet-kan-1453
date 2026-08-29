import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('authentication required');
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('authentication required');

    const { action, giftId, tokenHash } = await req.json();
    if (action === 'accept') {
      const { data, error } = await supabase.rpc('accept_parcel_gift', { p_gift_id: giftId, p_token_hash: tokenHash });
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    throw new Error('unsupported action');
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'request failed' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
