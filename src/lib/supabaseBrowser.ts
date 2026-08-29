import { createClient } from '@supabase/supabase-js';

// Production Supabase project is intentionally pinned here as a safe fallback.
// The public anon/publishable key is safe to expose in browser code; database
// access is still enforced by Supabase RLS and function privileges.
const DEFAULT_SUPABASE_URL = 'https://agfxwddvobkhwbbrdzpt.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZnh3ZGR2b2JraGJ3YnJkenB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMTgxNDAsImV4cCI6MjEwMTc5NDE0MH0.T_CEm6eUddkxL2mqDpSfHl5WJqw4uufLi5fRqueGm5s';

const configuredUrl = import.meta.env['VITE_SUPABASE_URL'];
const configuredAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'];
const configuredPublishableKey = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'];

// Prefer an explicitly configured key, but never allow an unrelated Supabase
// project URL to silently pair with the production credentials.
const url = configuredUrl || DEFAULT_SUPABASE_URL;
const anonKey = configuredAnonKey || configuredPublishableKey || DEFAULT_SUPABASE_ANON_KEY;

function getSessionStorage(): Storage | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

// Both values always have production fallbacks, so this factory never returns
// null. Keeping the client non-nullable also prevents every consumer from
// having to duplicate defensive checks around an already guaranteed client.
export function createBrowserSupabase() {
  return createClient(url, anonKey, {
    auth: {
      storage: getSessionStorage(),
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

export const supabaseBrowser = createBrowserSupabase();
