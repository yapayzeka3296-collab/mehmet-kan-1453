import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

type User = {
  id: string;
  email?: string | null;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseBrowser) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function init() {
      try {
        const { data } = await supabaseBrowser.auth.getSession();
        const sessionUser = (data as any)?.session?.user ?? null;
        if (mounted && sessionUser) {
          setUser({ id: sessionUser.id, email: sessionUser.email });
        }
      } catch (err) {
        console.error('Error fetching session', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange((event, session) => {
      const sUser = (session as any)?.user ?? null;
      if (sUser) {
        setUser({ id: sUser.id, email: sUser.email });
        setError(null);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  async function signIn(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message ?? 'Giriş sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string) {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabaseBrowser.auth.signUp({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message ?? 'Kayıt sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabaseBrowser.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err: any) {
      setError(err.message ?? 'Çıkış sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
