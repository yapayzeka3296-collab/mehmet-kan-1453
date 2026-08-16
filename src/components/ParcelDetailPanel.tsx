import React, { useState } from 'react';
import type { Parcel } from '@/types/parcel';
import { useAuth } from '@/hooks/useAuth';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { X } from 'lucide-react';

const TIER_LABELS = { digital: 'Dijital', elite: 'Elit', premium: 'Premium' } as const;

export function ParcelDetailPanel({ parcel, onClose, onReserved }: { parcel: Parcel; onClose: () => void; onReserved?: (p: Parcel) => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const tierLabel = TIER_LABELS[parcel.tier];

  async function handlePurchase() {
    setMessage(null);
    if (!user) { setMessage('Lütfen önce giriş yapın'); return; }
    if (!supabaseBrowser) { setMessage('Supabase yapılandırması eksik. Lütfen daha sonra tekrar deneyin.'); return; }
    setLoading(true);
    try {
      const { data } = await supabaseBrowser.auth.getSession();
      const token = data.session?.access_token;
      if (!token) { setMessage('Oturumunuz bulunamadı. Lütfen tekrar giriş yapın.'); return; }
      const res = await fetch('/purchase', { method: 'POST', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ parcel_id: parcel.id }) });
      const json = await res.json().catch(() => ({}));
      if (res.status === 202) {
        setMessage('Rezervasyon başarılı! Ödeme adımına geçebilirsiniz.');
        const reservedParcel = json.parcel as Partial<Parcel> | undefined;
        if (reservedParcel?.id) onReserved?.({ ...parcel, ...reservedParcel });
      } else if (res.status === 401) setMessage('Oturumunuz bulunamadı. Lütfen tekrar giriş yapın.');
      else if (res.status === 400) setMessage('Geçersiz parsel isteği. Lütfen tekrar deneyin.');
      else if (res.status === 404) setMessage('Parsel bulunamadı.');
      else if (res.status === 409) setMessage('Maalesef bu parsel başka bir kullanıcı tarafından rezerve edilmiş.');
      else if (res.status === 503) setMessage('Servis şu an yapılandırılmamış. Lütfen daha sonra tekrar deneyin.');
      else setMessage('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    } catch (err) {
      console.error('Purchase error', err);
      setMessage('İstek sırasında bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  const purchaseLabel = loading ? 'SATIN ALINIYOR...' : parcel.status === 'available' ? 'SATIN AL' : parcel.status === 'sold' ? 'SATILDI' : 'REZERVE';

  return (
    <aside className="fixed inset-0 z-[100] grid place-items-center bg-black/45 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Parsel bilgisi">
      <div className="max-h-[92vh] w-full max-w-md overflow-auto rounded-2xl border border-cyan-300/20 bg-[#071a2d] p-5 shadow-2xl shadow-black/60 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-cyan-100/60">{parcel.city_name ?? 'MySkyParcel'}</p>
            <h3 className="mt-1 font-display text-lg font-bold">PARSEL BİLGİSİ</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Kapat" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 rounded-xl border border-cyan-300/10 bg-black/15 p-4">
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">Parsel No</dt><dd className="font-semibold">{parcel.parcel_number}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">Şehir</dt><dd className="font-semibold">{parcel.city_name ?? '—'}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">Kategori</dt><dd className="font-semibold">{tierLabel}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">Durum</dt><dd className={`font-semibold ${parcel.status === 'sold' ? 'text-red-300' : parcel.status === 'reserved' ? 'text-amber-300' : 'text-cyan-200'}`}>{parcel.status === 'sold' ? 'Satıldı' : parcel.status === 'reserved' ? 'Rezerve' : 'Satılık'}</dd></div>
            <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">Fiyat</dt><dd className="font-semibold">{parcel.tier_price.toLocaleString('tr-TR')} TL</dd></div>
          </dl>
        </div>
        <button id="myskyparcel-purchase-action" data-msp-purchase="1" type="button" onClick={handlePurchase} disabled={loading || parcel.status !== 'available'} className="btn-gold mt-5 w-full rounded-md py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
          {purchaseLabel}
        </button>
        {message && <p className="mt-3 text-center text-sm text-muted-foreground">{message}</p>}
      </div>
    </aside>
  );
}
