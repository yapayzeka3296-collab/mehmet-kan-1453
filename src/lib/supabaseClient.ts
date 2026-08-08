export async function getSupabaseClient(): Promise<any | null> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !anonKey) {
    // Not configured for client-side Supabase in this environment.
    console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY missing; supabase client disabled');
    return null;
  }

  try {
    const mod = await import('@supabase/supabase-js');
    // createClient exists on the module
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const client = (mod as any).createClient(url, anonKey);
    return client;
  } catch (err) {
    console.warn('Failed to dynamically import @supabase/supabase-js. Is it installed?', err);
    return null;
  }
}
