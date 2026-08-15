import React, { useEffect, useState } from 'react';
import type { Parcel } from '@/types/parcel';
import { useAuth } from '@/hooks/useAuth';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { X } from 'lucide-react';

const TIER_LABELS = { digital: 'Dijital', elite: 'Elit', premium: 'Premium' } as const;
type Memory = { photo_path: string; note: string | null; updated_at?: string };

export function ParcelDetailPanel({ parcel, onClose, onReserved }: { parcel: Parcel; onClose: () => void; onReserved?: (p: Parcel) => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [memoryLoading, setMemoryLoading] = useState(true);
  const [memorySaving, setMemorySaving] = useState(false);
  const [memory, setMemory] = useState<Memory | null>(null);
  const [memoryPhotoUrl, setMemoryPhotoUrl] = useState<string | null>(null);
  const [memoryNote, setMemoryNote] = useState('');
  const [memoryFile, setMemoryFile] = useState<File | null>(null);
  const [memoryMessage, setMemoryMessage] = useState<string | null>(null);
  const tierLabel = TIER_LABELS[parcel.tier];

  useEffect(() => {
    let cancelled = false;
    setMemoryLoading(true);
    setMemory(null);
    setMemoryPhotoUrl(null);
    setMemoryNote('');
    setMemoryFile(null);
    setMemoryMessage(null);

    const loadMemory = async () => {
      if (!supabaseBrowser) {
        if (!cancelled) setMemoryLoading(false);
        return;
      }
      try {
        const [{ data: sessionData }, { data: ownerData }, { data: memoryRow }] = await Promise.all([
          supabaseBrowser.auth.getSession(),
          supabaseBrowser.rpc('is_parcel_owner', { p_parcel_id: parcel.id }),
          supabaseBrowser.from('parcel_memories').select('photo_path,note,updated_at').eq('parcel_id', parcel.id).maybeSingle(),
        ]);
        if (cancelled) return;
        const owner = !!sessionData.session?.user && ownerData === true;
        setIsOwner(owner);
        const nextMemory = memoryRow?.photo_path && memoryRow.photo_path !== 'note-only' ? memoryRow as Memory : null;
        setMemory(nextMemory);
        setMemoryNote(nextMemory?.note ?? '');
        if (nextMemory) {
          setMemoryPhotoUrl(supabaseBrowser.storage.from('parcel-memories').getPublicUrl(nextMemory.photo_path).data.publicUrl);
        }
      } catch (error) {
        console.error('Parcel memory load error', error);
      } finally {
        if (!cancelled) setMemoryLoading(false);
      }
    };

    void loadMemory();
    return () => { cancelled = true; };
  }, [parcel.id, user?.id]);

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
    } catch (err) { console.error('Purchase error', err); setMessage('İstek sırasında bir hata oluştu'); }
    finally { setLoading(false); }
  }

  async function handleMemorySave() {
    if (!user) { setMemoryMessage('Hatıra eklemek için giriş yapın.'); return; }
    if (!supabaseBrowser) { setMemoryMessage('Supabase yapılandırması eksik.'); return; }
    if (!isOwner) { setMemoryMessage('Bu parsel için hatıra ekleme yetkiniz yok.'); return; }
    if (!memoryFile && !memory?.photo_path) { setMemoryMessage('Lütfen bir fotoğraf seçin.'); return; }
    if (memoryNote.trim().length > 300) { setMemoryMessage('Not en fazla 300 karakter olabilir.'); return; }

    setMemorySaving(true);
    setMemoryMessage(null);
    let uploadedPath: string | null = null;
    try {
      let nextPhotoPath = memory?.photo_path ?? null;
      if (memoryFile) {
        if (!memoryFile.type.startsWith('image/')) throw new Error('Lütfen bir fotoğraf seçin.');
        if (memoryFile.size > 5 * 1024 * 1024) throw new Error('Fotoğraf en fazla 5 MB olabilir.');
        const ext = (memoryFile.name.split('.').pop() || 'jpg').toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) throw new Error('JPG, PNG veya WebP kullanın.');
        uploadedPath = `${user.id}/${parcel.id}/memory-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabaseBrowser.storage.from('parcel-memories').upload(uploadedPath, memoryFile, { upsert: false, contentType: memoryFile.type, cacheControl: '3600' });
        if (uploadError) throw new Error(`Fotoğraf yüklenemedi: ${uploadError.message}`);
        nextPhotoPath = uploadedPath;
      }

      const { error: saveError } = await supabaseBrowser.rpc('save_parcel_memory', {
        p_parcel_id: parcel.id,
        p_photo_path: nextPhotoPath,
        p_note: memoryNote.trim(),
      });
      if (saveError) {
        if (uploadedPath) await supabaseBrowser.storage.from('parcel-memories').remove([uploadedPath]);
        throw new Error(`Hatıra kaydedilemedi: ${saveError.message}`);
      }

      if (uploadedPath && memory?.photo_path && memory.photo_path !== uploadedPath) {
        await supabaseBrowser.storage.from('parcel-memories').remove([memory.photo_path]);
      }

      const nextMemory: Memory = { photo_path: nextPhotoPath!, note: memoryNote.trim() };
      setMemory(nextMemory);
      setMemoryPhotoUrl(supabaseBrowser.storage.from('parcel-memories').getPublicUrl(nextMemory.photo_path).data.publicUrl);
      setMemoryFile(null);
      setMemoryMessage('Parsel hatıran kaydedildi.');
    } catch (error) {
      setMemoryMessage(error instanceof Error ? error.message : 'Hatıra kaydedilemedi.');
    } finally {
      setMemorySaving(false);
    }
  }

  const purchaseLabel = loading ? 'SATIN ALINIYOR...' : parcel.status === 'available' ? 'SATIN AL' : parcel.status === 'sold' ? 'SATILDI' : 'REZERVE';

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-auto bg-background p-6 shadow-lg md:relative md:w-auto md:max-w-none">
      <div className="flex items-start justify-between gap-4">
        <div><p className="text-xs text-muted-foreground">{parcel.city_name ?? 'MySkyParcel'}</p><h3 className="mt-1 font-display text-lg font-bold">PARSEL BİLGİSİ</h3></div>
        <button type="button" onClick={onClose} aria-label="Kapat" className="flex h-9 w-9 items-center justify-center rounded-full border border-input text-muted-foreground transition hover:bg-muted hover:text-foreground"><X className="h-5 w-5" /></button>
      </div>
      <div className="mt-5 rounded-xl border border-gold/20 bg-background/30 p-5">
        <dl className="space-y-4 text-sm">
          <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">Parsel No</dt><dd className="font-semibold">{parcel.parcel_number}</dd></div>
          <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">Kategori</dt><dd className="font-semibold">{tierLabel}</dd></div>
          <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">Durum</dt><dd className="font-semibold capitalize">{parcel.status === 'sold' ? 'Satıldı' : parcel.status === 'reserved' ? 'Rezerve' : 'Satılık'}</dd></div>
          <div className="flex items-center justify-between gap-4"><dt className="text-muted-foreground">Fiyat</dt><dd className="font-semibold">{parcel.tier_price.toLocaleString('tr-TR')} TL</dd></div>
        </dl>
      </div>
      <button id="myskyparcel-purchase-action" data-msp-purchase="1" type="button" onClick={handlePurchase} disabled={loading || parcel.status !== 'available'} className="btn-gold mt-6 w-full rounded-md py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
        {purchaseLabel}
      </button>
      {message && <p className="mt-3 text-center text-sm text-muted-foreground">{message}</p>}

      <section className="mt-5 rounded-xl border border-cyan-300/15 bg-cyan-950/10 p-4" aria-label="Parsel hatırası">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/65">Parsel Hatırası</p>
            <p className="mt-1 text-sm font-semibold">Bir fotoğraf ve küçük bir not</p>
          </div>
          {memory && <span className="rounded-full border border-cyan-300/20 px-2 py-1 text-[9px] font-semibold text-cyan-100/65">1 FOTOĞRAF</span>}
        </div>

        {memoryLoading ? (
          <p className="mt-4 text-xs text-muted-foreground">Hatıra kontrol ediliyor...</p>
        ) : isOwner ? (
          <div className="mt-4 space-y-3">
            {memoryPhotoUrl && <img src={memoryPhotoUrl} alt={`${parcel.parcel_number} parsel hatırası`} className="max-h-48 w-full rounded-lg object-cover" loading="lazy" />}
            <label className="block cursor-pointer rounded-lg border border-dashed border-cyan-300/25 bg-white/[0.03] p-3">
              <span className="text-xs font-semibold">📷 {memory ? 'Fotoğrafı değiştir' : 'Fotoğraf ekle'}</span>
              <span className="mt-1 block text-[10px] text-muted-foreground">JPG, PNG veya WebP · Maks. 5 MB · Parsel başına 1 fotoğraf</span>
              <input className="mt-2 block w-full text-[10px]" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setMemoryFile(event.target.files?.[0] ?? null)} />
            </label>
            <label className="block">
              <span className="text-xs font-semibold">📝 Küçük not</span>
              <textarea value={memoryNote} onChange={(event) => setMemoryNote(event.target.value.slice(0, 300))} maxLength={300} rows={3} placeholder="Bu parsel için kısa bir anı..." className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs outline-none placeholder:text-white/30 focus:border-cyan-300/40" />
              <span className="mt-1 block text-right text-[9px] text-muted-foreground">{memoryNote.length}/300</span>
            </label>
            {memoryMessage && <p className="rounded-lg bg-white/5 px-3 py-2 text-[10px] text-white/70">{memoryMessage}</p>}
            <button type="button" disabled={memorySaving} onClick={handleMemorySave} className="h-9 w-full rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-xs font-bold text-cyan-100 transition hover:bg-cyan-300/15 disabled:opacity-50">{memorySaving ? 'KAYDEDİLİYOR...' : memory ? 'HATIRAYI GÜNCELLE' : 'HATIRAYI KAYDET'}</button>
          </div>
        ) : memory ? (
          <div className="mt-4 space-y-3">
            {memoryPhotoUrl && <img src={memoryPhotoUrl} alt={`${parcel.parcel_number} parsel hatırası`} className="max-h-52 w-full rounded-lg object-cover" loading="lazy" />}
            {memory.note && <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3"><p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-cyan-200/55">Not</p><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-white/75">{memory.note}</p></div>}
          </div>
        ) : (
          <p className="mt-4 text-xs leading-5 text-muted-foreground">Bu parselin sahibiysen bir fotoğraf ve kısa bir not ekleyebilirsin.</p>
        )}
      </section>
    </aside>
  );
}
