import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type User = { id: string; email?: string | null };
type AuthResult = { success: true; user?: User } | { success: false; error: string };
type AuthContextValue = { user: User | null; loading: boolean; error: string | null; signIn: (email: string, password: string) => Promise<AuthResult>; signUp: (email: string, password: string, name?: string) => Promise<AuthResult>; signOut: () => Promise<AuthResult> };
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = supabaseBrowser;
    if (!client) { setLoading(false); return; }
    let mounted = true;
    async function init() {
      try {
        const { data } = await client.auth.getSession();
        const sessionUser = data.session?.user ?? null;
        if (mounted && sessionUser) setUser({ id: sessionUser.id, email: sessionUser.email });
      } catch (err) { console.error('Error fetching session', err); }
      finally { if (mounted) setLoading(false); }
    }
    void init();
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      if (sessionUser) { setUser({ id: sessionUser.id, email: sessionUser.email }); setError(null); }
      else setUser(null);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  async function signIn(email: string, password: string): Promise<AuthResult> {
    setLoading(true); setError(null);
    const client = supabaseBrowser;
    if (!client) { const msg = 'Supabase yapılandırması eksik'; setError(msg); setLoading(false); return { success: false, error: msg }; }
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) { const msg = error.message ?? 'Giriş sırasında bir hata oluştu'; setError(msg); return { success: false, error: msg }; }
      const sessionUser = data.user ?? null;
      if (sessionUser) { const u = { id: sessionUser.id, email: sessionUser.email }; setUser(u); return { success: true, user: u }; }
      const msg = 'Giriş başarısız'; setError(msg); return { success: false, error: msg };
    } catch (err: any) { const msg = err?.message ?? 'Giriş sırasında bir hata oluştu'; setError(msg); return { success: false, error: msg }; }
    finally { setLoading(false); }
  }

  async function signUp(email: string, password: string, name?: string): Promise<AuthResult> {
    setLoading(true); setError(null);
    const client = supabaseBrowser;
    if (!client) { const msg = 'Supabase yapılandırması eksik'; setError(msg); setLoading(false); return { success: false, error: msg }; }
    try {
      const credentials = name?.trim() ? { email, password, options: { data: { full_name: name.trim() } } } : { email, password };
      const { data, error } = await client.auth.signUp(credentials);
      if (error) { const msg = error.message ?? 'Kayıt sırasında bir hata oluştu'; setError(msg); return { success: false, error: msg }; }
      const sessionUser = data.user ?? null;
      if (sessionUser) { const u = { id: sessionUser.id, email: sessionUser.email }; setUser(u); return { success: true, user: u }; }
      return { success: true };
    } catch (err: any) { const msg = err?.message ?? 'Kayıt sırasında bir hata oluştu'; setError(msg); return { success: false, error: msg }; }
    finally { setLoading(false); }
  }

  async function signOut(): Promise<AuthResult> {
    setLoading(true); setError(null);
    const client = supabaseBrowser;
    if (!client) { const msg = 'Supabase yapılandırması eksik'; setError(msg); setLoading(false); return { success: false, error: msg }; }
    try {
      const { error } = await client.auth.signOut();
      if (error) { const msg = error.message ?? 'Çıkış sırasında bir hata oluştu'; setError(msg); return { success: false, error: msg }; }
      setUser(null); return { success: true };
    } catch (err: any) { const msg = err?.message ?? 'Çıkış sırasında bir hata oluştu'; setError(msg); return { success: false, error: msg }; }
    finally { setLoading(false); }
  }

  return <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx; }
