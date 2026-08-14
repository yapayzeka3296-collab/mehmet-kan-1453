import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://agfxwddvobkhwbbrdzpt.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_R9oNzobOHmh1xbwztofFew_3xz5DZAu';

const url = import.meta.env['VITE_SUPABASE_URL'] ?? DEFAULT_SUPABASE_URL;
const anonKey =
  import.meta.env['VITE_SUPABASE_PUBLISHABLE_KEY'] ??
  import.meta.env['VITE_SUPABASE_ANON_KEY'] ??
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

function getSessionStorage(): Storage | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.sessionStorage;
  } catch {
    return undefined;
  }
}

export function createBrowserSupabase() {
  if (!url || !anonKey) return null;

  const client = createClient(url, anonKey, {
    auth: {
      // Keep the session for the current browser tab/session, but do not
      // persist it in localStorage. Closing the browser/restarting the
      // computer therefore requires the user to authenticate again.
      storage: getSessionStorage(),
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  // Yönetim panelindeki "Çıkış Yap" yalnızca yönetim panelinden çıkar.
  // Site oturumunu kapatmaz; böylece ana sayfaya dönen kullanıcı giriş yapmış
  // olarak kalır. Diğer sayfalardaki gerçek signOut davranışı değişmez.
  const originalSignOut = client.auth.signOut.bind(client.auth);
  client.auth.signOut = async (options) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/yonetim') {
      return { error: null };
    }
    return originalSignOut(options);
  };

  return client;
}

export const supabaseBrowser = createBrowserSupabase();
