import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type User = { id: string; email?: string | null };
type AuthResult =
  | { success: true; user?: User; status?: 'verification_sent' | 'verification_resent' }
  | { success: false; error: string };
type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, name?: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
};
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toUser(sessionUser: { id: string; email?: string | null }): User {
  return { id: sessionUser.id, email: sessionUser.email ?? null };
}

function getEmailRedirectUrl(): string {
  if (typeof window === 'undefined') return 'https://myskyparcel.com/dogrula';

  const hostname = window.location.hostname.toLowerCase();
  if (hostname === 'myskyparcel.com' || hostname === 'www.myskyparcel.com') {
    return 'https://myskyparcel.com/dogrula';
  }

  return `${window.location.origin}/dogrula`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = supabaseBrowser;
    if (!client) {
      setLoading(false);
      return;
    }
    let mounted = true;

    async function init() {
      try {
        const { data } = await client.auth.getSession();
        const sessionUser = data.session?.user ?? null;
        if (mounted && sessionUser) setUser(toUser(sessionUser));
      } catch (err) {
        console.error('Error fetching session', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void init();
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      if (sessionUser) {
        setUser(toUser(sessionUser));
        setError(null);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string): Promise<AuthResult> {
    setLoading(true);
    setError(null);
    const client = supabaseBrowser;
    if (!client) {
      const msg = 'Supabase yapılandırması eksik';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
    try {
      const { data, error } = await client.auth.signInWithPassword({ email, password });
      if (error) {
        const msg = error.message ?? 'Giriş sırasında bir hata oluştu';
        setError(msg);
        return { success: false, error: msg };
      }
      const sessionUser = data.user ?? null;
      if (sessionUser) {
        const u = toUser(sessionUser);
        setUser(u);
        return { success: true, user: u };
      }
      const msg = 'Giriş başarısız';
      setError(msg);
      return { success: false, error: msg };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Giriş sırasında bir hata oluştu';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  async function resendSignup(email: string): Promise<AuthResult> {
    const client = supabaseBrowser;
    if (!client) return { success: false, error: 'Supabase yapılandırması eksik' };

    const { error } = await client.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: getEmailRedirectUrl() },
    });

    if (!error) return { success: true, status: 'verification_resent' };

    const code = 'code' in error ? String(error.code ?? '') : '';
    const message = error.message ?? '';
    if (/already.?confirmed|confirmed/i.test(`${code} ${message}`)) {
      return { success: false, error: 'Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın.' };
    }

    return { success: false, error: message || 'Doğrulama e-postası yeniden gönderilemedi.' };
  }

  async function signUp(email: string, password: string, name?: string): Promise<AuthResult> {
    setLoading(true);
    setError(null);
    const client = supabaseBrowser;
    if (!client) {
      const msg = 'Supabase yapılandırması eksik';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
    try {
      const cleanEmail = email.trim().toLowerCase();
      const options = {
        emailRedirectTo: getEmailRedirectUrl(),
        ...(name?.trim() ? { data: { full_name: name.trim() } } : {}),
      };
      const { data, error } = await client.auth.signUp({
        email: cleanEmail,
        password,
        options,
      });

      if (error) {
        const code = 'code' in error ? String(error.code ?? '') : '';
        if (/email_exists|user_already_exists/i.test(code)) {
          const resendResult = await resendSignup(cleanEmail);
          if (resendResult.success) return resendResult;
        }

        const msg = error.message ?? 'Kayıt sırasında bir hata oluştu';
        setError(msg);
        return { success: false, error: msg };
      }

      const sessionUser = data.user ?? null;

      // Supabase may return an obfuscated user with no identities when the
      // email already exists. If so, resend the signup confirmation instead
      // of misleading the user with a new-account success message.
      if (sessionUser && Array.isArray(sessionUser.identities) && sessionUser.identities.length === 0) {
        const resendResult = await resendSignup(cleanEmail);
        if (resendResult.success) return resendResult;
        setError(resendResult.error);
        return resendResult;
      }

      if (data.session && sessionUser) {
        const u = toUser(sessionUser);
        setUser(u);
        return { success: true, user: u };
      }

      return { success: true, status: 'verification_sent' };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kayıt sırasında bir hata oluştu';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  async function signOut(): Promise<AuthResult> {
    setLoading(true);
    setError(null);
    const client = supabaseBrowser;
    if (!client) {
      const msg = 'Supabase yapılandırması eksik';
      setError(msg);
      setLoading(false);
      return { success: false, error: msg };
    }
    try {
      const { error } = await client.auth.signOut();
      if (error) {
        const msg = error.message ?? 'Çıkış sırasında bir hata oluştu';
        setError(msg);
        return { success: false, error: msg };
      }
      setUser(null);
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Çıkış sırasında bir hata oluştu';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  return <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
