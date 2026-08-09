import React, { useState } from 'react';
import type { Parcel } from '@/types/parcel';
import { useAuth } from '@/hooks/useAuth';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export function ParcelDetailPanel({ parcel, onClose, onReserved }: { parcel: Parcel; onClose: () => void; onReserved?: (p: Parcel) => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleReserve() {
    setMessage(null);
    if (!user) {
      setMessage('Lütfen önce giriş yapın');
      return;
    }

    setLoading(true);
    try {
      // get access token from supabase client
      const { data } = await supabaseBrowser.auth.getSession();
      const token = (data as any)?.session?.access_token;
      const res = await fetch('/_start/purchase', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ parcel_id: parcel.id }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.status === 202) {
        setMessage('Rezervasyon başarılı!');
        onReserved?.(json.parcel as Parcel);
      } else if (res.status === 401) {
        setMessage('Oturumunuz bulunamadı. Lütfen tekrar giriş yapın.');
      } else if (res.status === 400) {
        setMessage('Geçersiz parsel isteği. Lütfen tekrar deneyin.');
      } else if (res.status === 404) {
        setMessage('Parsel bulunamadı.');
      } else if (res.status === 409) {
        setMessage('Maalesef bu parsel başka bir kullanıcı tarafından rezerve edilmiş.');
      } else if (res.status === 503) {
        setMessage('Servis şu an yapılandırılmamış. Lütfen daha sonra tekrar deneyin.');
      } else {
        setMessage('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      }
    } catch (err) {
      console.error('Reservation error', err);
      setMessage('İstek sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-auto bg-background p-6 shadow-lg md:relative md:w-auto md:max-w-none">
      <div className="flex items-start justify-between">
        <h3 className="font-display text-lg font-bold">{parcel.parcel_number}</h3>
        <button onClick={onClose} aria-label="Kapat" className="text-sm text-muted-foreground">
          Kapat
        </button>
      </div>

      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Durum</dt>
          <dd className="mt-1">{parcel.status}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Fiyat</dt>
          <dd className="mt-1">{parcel.price}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Koordinatlar</dt>
          <dd className="mt-1">{parcel.latitude}, {parcel.longitude}</dd>
        </div>
      </dl>

      <div className="mt-6">
        <button
          onClick={handleReserve}
          disabled={loading || parcel.status !== 'available'}
          className="btn-gold w-full rounded-md py-3 text-sm"
        >
          {loading ? 'Rezervasyon yapılıyor...' : parcel.status === 'available' ? 'PARSELİ REZERVE ET' : 'REZERVE EDİLEMEZ'}
        </button>
        {message && <p className="mt-3 text-sm text-center text-muted-foreground">{message}</p>}
      </div>
    </aside>
  );
}
