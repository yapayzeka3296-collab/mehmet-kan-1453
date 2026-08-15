import { X } from 'lucide-react';
import type { Parcel } from '@/types/parcel';
import { useAuth } from '@/hooks/useAuth';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useState } from 'react';

const TIER_LABELS = {
  digital: 'Dijital',
  elite: 'Elit',
  premium: 'Premium',
} as const;

export function ParcelDetailPanel({
  parcel,
  onClose,
  onReserved,
}: {
  parcel: Parcel;
  onClose: () => void;
  onReserved?: (p: Parcel) => void;
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const tierLabel = TIER_LABELS[parcel.tier];

  async function handlePurchase() {
    setMessage(null);
    if (!user) {
      setMessage('Satın almak için önce giriş yapmalısınız.');
      return;
    }
    if (!supabaseBrowser) {
      setMessage('Sistem bağlantısı hazır değil. Lütfen daha sonra tekrar deneyin.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await supabaseBrowser.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setMessage('Oturumunuz bulunamadı. Lütfen tekrar giriş yapın.');
        return;
      }

      const response = await fetch('/purchase', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ parcel_id: parcel.id }),
      });
      const json = await response.json().catch(() => ({}));

      if (response.status === 202) {
        const reservedParcel = json.parcel as Partial<Parcel> | undefined;
        if (reservedParcel?.id) onReserved?.({ ...parcel, ...reservedParcel });
        setMessage('Rezervasyon başarılı! Ödeme adımına geçebilirsiniz.');
        return;
      }
      if (response.status === 401) setMessage('Oturumunuz bulunamadı. Lütfen tekrar giriş yapın.');
      else if (response.status === 400) setMessage('Geçersiz parsel isteği.');
      else if (response.status === 404) setMessage('Parsel bulunamadı.');
      else if (response.status === 409) setMessage('Bu parsel başka bir kullanıcı tarafından rezerve edilmiş.');
      else if (response.status === 503) setMessage('Satın alma servisi şu anda kullanılamıyor.');
      else setMessage('İşlem sırasında bir hata oluştu.');
    } catch (error) {
      console.error('Parcel purchase error', error);
      setMessage('İstek sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-sm overflow-y-auto border-l border-white/10 bg-slate-950/95 p-5 text-white shadow-2xl backdrop-blur-xl md:inset-y-auto md:right-5 md:top-5 md:max-h-[calc(100vh-2.5rem)] md:rounded-2xl md:border">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-white/45">PARSEL BİLGİSİ</p>
          <h3 className="mt-1 text-xl font-bold tracking-wide">{parcel.parcel_number}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Parsel bilgi kutusunu kapat"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-5 space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-white/50">Şehir</span>
          <span className="text-sm font-medium">{parcel.city_name ?? 'MySkyParcel'}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-white/50">Parsel türü</span>
          <span className="text-sm font-medium">{tierLabel}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-white/50">Durum</span>
          <span className="text-sm font-medium">{parcel.status === 'available' ? 'Satışta' : parcel.status === 'reserved' ? 'Rezerve' : 'Satıldı'}</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
          <span className="text-sm text-white/50">Fiyat</span>
          <span className="text-lg font-bold text-amber-200">{parcel.tier_price.toLocaleString('tr-TR')} TL</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePurchase}
        disabled={loading || parcel.status !== 'available'}
        className="mt-5 w-full rounded-xl bg-amber-300 px-4 py-3.5 text-sm font-bold tracking-wide text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {loading ? 'İŞLEM YAPILIYOR...' : parcel.status === 'available' ? 'SATIN AL' : 'SATIN ALINAMAZ'}
      </button>

      {message && (
        <p className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center text-xs leading-5 text-white/65">
          {message}
        </p>
      )}
    </aside>
  );
}
