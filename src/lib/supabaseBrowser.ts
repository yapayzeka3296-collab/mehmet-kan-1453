import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://agfxwddvobkhwbbrdzpt.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_R9oNzobOHmh1xbwztofFew_3xz5DZAu';

const url = import.meta.env['VITE_SUPABASE_URL'] ?? DEFAULT_SUPABASE_URL;
const anonKey =
  import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ??
  import.meta.env['VITE_SUPABASE_ANON_KEY'] ??
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export function createBrowserSupabase() {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabaseBrowser = createBrowserSupabase();
