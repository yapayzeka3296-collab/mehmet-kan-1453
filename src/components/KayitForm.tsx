import React, { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useAuth } from '@/hooks/useAuth';

export default function KayitForm() {
  const { signUp, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (error) setMessage(error);
  }, [error]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!email || !password) return setMessage('Lütfen e-posta ve şifre girin');
    if (password !== confirm) return setMessage('Şifreler eşleşmiyor');

    await signUp(email, password);
    if (!error) setMessage('Kayıt başarılı. Lütfen e-postanızı kontrol edin.');
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground">E-posta</label>
        <input
          className="mt-2 w-full rounded-md border border-input px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Şifre</label>
        <input
          type="password"
          className="mt-2 w-full rounded-md border border-input px-3 py-2 text-sm"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Şifre Tekrar</label>
        <input
          type="password"
          className="mt-2 w-full rounded-md border border-input px-3 py-2 text-sm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      <div>
        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full rounded-md py-3 text-sm"
        >
          {loading ? 'Kayıt yapılıyor...' : 'KAYIT OL'}
        </button>
      </div>
      {message && <p className="text-sm text-center text-muted-foreground">{message}</p>}
    </form>
  );
}
