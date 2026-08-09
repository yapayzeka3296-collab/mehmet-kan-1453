import React from 'react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function GirisForm() {
  const { signIn, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    await signIn(email, password);
    if (error) setMessage(error);
    else setMessage('Giriş başarılı (yönlendiriliyor)');
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
        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full rounded-md py-3 text-sm"
        >
          {loading ? 'Giriş yapılıyor...' : 'GİRİŞ YAP'}
        </button>
      </div>
      {message && <p className="text-sm text-center text-muted-foreground">{message}</p>}
    </form>
  );
}
