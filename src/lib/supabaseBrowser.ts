import { createClient } from '@supabase/supabase-js';

// Keep Vercel deployments functional even when environment variables were not
// configured yet. These are Supabase publishable values and are safe for the
// browser; production secrets must never be placed here.
const DEFAULT_SUPABASE_URL = 'https://agfxwddvobkhwbbrdzpt.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_R9oNzobOHmh1xbwztofFew_3xz5DZAu';

const url =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  DEFAULT_SUPABASE_URL;
const anonKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ??
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export function createBrowserSupabase() {
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

export const supabaseBrowser = createBrowserSupabase();
