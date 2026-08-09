export async function getSupabaseClient(): Promise<any | null> {
  const url =
    import.meta.env['VITE_SUPABASE_URL'] ??
    'https://agfxwddvobkhwbbrdzpt.supabase.co';
  const anonKey =
    import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ??
    import.meta.env['VITE_SUPABASE_ANON_KEY'] ??
    'sb_publishable_R9oNzobOHmh1xbwztofFew_3xz5DZAu';

  if (!url || !anonKey) {
    console.warn('Supabase configuration missing; client disabled');
    return null;
  }

  try {
    const mod = await import('@supabase/supabase-js');
    const client = (mod as any).createClient(url, anonKey);
    return client;
  } catch (err) {
    console.warn('Failed to dynamically import @supabase/supabase-js. Is it installed?', err);
    return null;
  }
}
