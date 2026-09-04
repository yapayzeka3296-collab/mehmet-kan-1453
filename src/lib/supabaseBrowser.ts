import { createClient } from '@supabase/supabase-js';

// Production Supabase project is intentionally pinned here as a safe fallback.
// The public anon/publishable key is safe to expose in browser code; database
// access is still enforced by Supabase RLS and function privileges.
const DEFAULT_SUPABASE_URL = 'https://agfxwddvobkhwbbrdzpt.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZnh3ZGR2b2JraHdiYnJkenB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMTgxNDAsImV4cCI6MjEwMTc5NDE0MH0.T_CEm6eUddkxL2mqDpSfHl5WJqw4uufLi5fRqueGm5s';

const configuredUrl = import.meta.env['VITE_SUPABASE_URL'];
const configuredAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY'];
const configuredPublishableKey = import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'];

const url = configuredUrl || DEFAULT_SUPABASE_URL;
const anonKey = configuredAnonKey || configuredPublishableKey || DEFAULT_SUPABASE_ANON_KEY;

const isBrowser = typeof window !== 'undefined';

function getSessionStorage(): Storage | undefined {
  if (!isBrowser) return undefined;
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

// Supabase's auth client must never fall back to browser localStorage while
// Nitro is rendering a route on the server. A tiny in-memory storage keeps the
// client constructible during SSR without leaking or persisting a session.
const serverMemoryStorage: Storage = {
  get length() { return 0; },
  clear() {},
  getItem() { return null; },
  key() { return null; },
  removeItem() {},
  setItem() {},
};

export function createBrowserSupabase() {
  const client = createClient(url, anonKey, {
    auth: {
      storage: getSessionStorage() ?? serverMemoryStorage,
      persistSession: isBrowser,
      autoRefreshToken: isBrowser,
      detectSessionInUrl: isBrowser,
    },
  });

  // Yönetim panelindeki "Çıkış Yap" yalnızca yönetim panelinden çıkar.
  // Site oturumunu kapatmaz; böylece ana sayfaya dönen kullanıcı giriş yapmış
  // olarak kalır. Diğer sayfalardaki gerçek signOut davranışı değişmez.
  const originalSignOut = client.auth.signOut.bind(client.auth);
  client.auth.signOut = async (options) => {
    if (isBrowser && window.location.pathname === '/yonetim') {
      return { error: null };
    }
    return originalSignOut(options);
  };

  return client;
}

export const supabaseBrowser = createBrowserSupabase();
