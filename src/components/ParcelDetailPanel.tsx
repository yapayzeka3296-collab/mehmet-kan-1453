import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { Parcel } from '@/types/parcel';
import { useAuth } from '@/hooks/useAuth';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { X, ImagePlus, Pencil, ShoppingCart, MapPin } from 'lucide-react';

const TIER_LABELS = { digital: 'Dijital', elite: 'Elit', premium: 'Premium' } as const;
type Memory = { photo_path: string | null; note: string | null; is_public: boolean; updated_at?: string };
type Props = { parcel: Parcel; onClose: () => void; onReserved?: (p: Parcel) => void; onLocate?: (p: Parcel) => void };

const citySlug = (name: string | null | undefined) => (name ?? '').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function ParcelDetailPanel({ parcel, onClose, onLocate }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOwner, setIsOwner] = useState(false);
  const [memoryLoading, setMemoryLoading] = useState(true);
  const [memorySaving, setMemorySaving] = useState(false);
  const [memory, setMemory] = useState<Memory | null>(null);
  const [memoryPhotoUrl, setMemoryPhotoUrl] = useState<string | null>(null);
  const [memoryNote, setMemoryNote] = useState('');
  const [memoryFile, setMemoryFile] = useState<File | null>(null);
  const [memoryIsPublic, setMemoryIsPublic] = useState(true);
  const [memoryMessage, setMemoryMessage] = useState<string | null>(null);
  const [editingMemory, setEditingMemory] = useState(false);

  const ownsFromParcel = !!user && parcel.owner_id === user.id;
  const canManageMemory = ownsFromParcel || isOwner;
  const statusLabel = parcel.status === 'sold' ? 'Satıldı' : parcel.status === 'reserved' ? 'Rezerve' : 'Satılık';
  const tierLabel = TIER_LABELS[parcel.tier];
  const priceLabel = typeof parcel.tier_price === 'number' ? `${parcel.tier_price.toLocaleString('tr-TR')} TL` : '—';
  const canBuy = parcel.status !== 'sold' && parcel.status !== 'reserved' && !ownsFromParcel;

  function handleBuy() {
    const redirect = `/parsel-satin-al?parcels=${encodeURIComponent(parcel.id)}`;
    if (!user) {
      void navigate({ to: '/giris', search: { redirect } });
      return;
    }
    void navigate({ to: '/parsel-satin-al', search: { parcels: parcel.id } });
  }

  function handleGoToParcel() {
    if (onLocate) { onLocate(parcel); return; }
    const slug = citySlug(parcel.city_name);
    if (!slug) return;
    onClose();
    void navigate({ to: '/turkiye-haritasi', search: { city: slug, parcels: parcel.id, ...(parcel.latitude != null ? { lat: String(parcel.latitude) } : {}), ...(parcel.longitude != null ? { lng: String(parcel.longitude) } : {}) } as never);
  }

  useEffect(() => {
    let cancelled = false;
    setMemoryLoading(true); setMemory(null); setMemoryPhotoUrl(null); setMemoryNote(''); setMemoryFile(null); setMemoryIsPublic(true); setMemoryMessage(null); setEditingMemory(false);
    async function loadMemory() {
      try {
        const [{ data: sessionData }, { data: ownerData, error: ownerError }, { data: parcelOwnerRow, error: parcelOwnerError }, { data: memoryRow, error: memoryError }] = await Promise.all([
          supabaseBrowser.auth.getSession(),
          supabaseBrowser.rpc('is_parcel_owner', { p_parcel_id: parcel.id }),
          supabaseBrowser.from('parcels').select('owner_id').eq('id', parcel.id).maybeSingle(),
          supabaseBrowser.from('parcel_memories').select('photo_path,note,is_public,updated_at').eq('parcel_id', parcel.id).maybeSingle(),
        ]);
        if (cancelled) return;
        if (ownerError) console.error('Parcel owner RPC error', ownerError);
        if (parcelOwnerError) console.error('Parcel owner row error', parcelOwnerError);
        if (memoryError) console.error('Parcel memory lookup error', memoryError);
        const currentUserId = sessionData.session?.user?.id ?? user?.id ?? null;
        const rpcOwner = ownerData === true || ownerData === 'true';
        const databaseOwner = !!currentUserId && parcelOwnerRow?.owner_id === currentUserId;
        setIsOwner(rpcOwner || databaseOwner);
        const nextMemory = memoryRow ? (memoryRow as Memory) : null;
        setMemory(nextMemory); setMemoryNote(nextMemory?.note ?? ''); setMemoryIsPublic(nextMemory?.is_public ?? true);
        if (nextMemory?.photo_path && nextMemory.photo_path !== 'note-only') setMemoryPhotoUrl(supabaseBrowser.storage.from('parcel-memories').getPublicUrl(nextMemory.photo_path).data.publicUrl);
      } catch (error) { console.error('Parcel memory load error', error); }
      finally { if (!cancelled) setMemoryLoading(false); }
    }
    void loadMemory(); return () => { cancelled = true; };
  }, [parcel.id, parcel.owner_id, user?.id]);

  function startMemoryEditor() { setMemoryMessage(null); setMemoryFile(null); setEditingMemory(true); }
  function cancelMemoryEditor() { setMemoryMessage(null); setMemoryFile(null); setMemoryNote(memory?.note ?? ''); setMemoryIsPublic(memory?.is_public ?? true); setEditingMemory(false); }

  async function handleMemorySave() {
    if (!user) { setMemoryMessage('Hatıra eklemek için giriş yapın.'); return; }
    if (!canManageMemory) { setMemoryMessage('Hatıra eklenemedi.'); return; }
    if (!memoryFile && !memory?.photo_path) { setMemoryMessage('Lütfen bir fotoğraf seçin.'); return; }
    if (memoryNote.trim().length > 300) { setMemoryMessage('Not en fazla 300 karakter olabilir.'); return; }
    setMemorySaving(true); setMemoryMessage(null); let uploadedPath: string | null = null;
    try {
      let nextPhotoPath = memory?.photo_path ?? null;
      if (memoryFile) {
        if (!memoryFile.type.startsWith('image/')) throw new Error('Lütfen bir fotoğraf seçin.');
        if (memoryFile.size > 5 * 1024 * 1024) throw new Error('Fotoğraf en fazla 5 MB olabilir.');
        const ext = (memoryFile.name.split('.').pop() || 'jpg').toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) throw new Error('JPG, PNG veya WebP kullanın.');
        uploadedPath = `${user.id}/${parcel.id}/memory-${Date.now()}.${ext}`;
        const { error } = await supabaseBrowser.storage.from('parcel-memories').upload(uploadedPath, memoryFile, { upsert: false, contentType: memoryFile.type, cacheControl: '3600' });
        if (error) throw new Error(`Fotoğraf yüklenemedi: ${error.message}`);
        nextPhotoPath = uploadedPath;
      }

      const { error: saveError } = await supabaseBrowser.rpc('save_parcel_memory', {
        p_parcel_id: parcel.id,
        p_photo_path: nextPhotoPath,
        p_note: memoryNote.trim(),
        p_is_public: memoryIsPublic,
      });
      if (saveError) {
        if (uploadedPath) await supabaseBrowser.storage.from('parcel-memories').remove([uploadedPath]);
        throw new Error(`Hatıra kaydedilemedi: ${saveError.message}`);
      }

      const { data: persistedMemory, error: reloadError } = await supabaseBrowser
        .from('parcel_memories')
        .select('photo_path,note,is_public,updated_at')
        .eq('parcel_id', parcel.id)
        .maybeSingle();
      if (reloadError || !persistedMemory) {
        if (uploadedPath) await supabaseBrowser.storage.from('parcel-memories').remove([uploadedPath]);
        throw new Error(reloadError?.message || 'Hatıra kaydı doğrulanamadı.');
      }

      const nextMemory = persistedMemory as Memory;
      if (uploadedPath && memory?.photo_path && memory.photo_path !== uploadedPath) {
        await supabaseBrowser.storage.from('parcel-memories').remove([memory.photo_path]);
      }
      setMemory(nextMemory);
      setMemoryNote(nextMemory.note ?? '');
      setMemoryIsPublic(nextMemory.is_public);
      setMemoryFile(null);
      setMemoryPhotoUrl(nextMemory.photo_path && nextMemory.photo_path !== 'note-only' ? supabaseBrowser.storage.from('parcel-memories').getPublicUrl(nextMemory.photo_path).data.publicUrl : null);
      setEditingMemory(false);
      setMemoryMessage(nextMemory.is_public ? 'Hatıran kaydedildi. Herkes görebilir.' : 'Hatıran kaydedildi. Sadece sen görebilirsin.');
    } catch (error) {
      setMemoryMessage(error instanceof Error ? error.message : 'Hatıran kaydedilemedi.');
    } finally { setMemorySaving(false); }
  }

  function handleMemoryFileChange(event: ChangeEvent<HTMLInputElement>) { setMemoryFile(event.target.files?.[0] ?? null); setMemoryMessage(null); }

  return (
    <aside className="fixed inset-0 z-[320] grid place-items-center bg-black/45 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Parsel bilgileri">
      <div className="max-h-[92vh] w-full max-w-md overflow-auto rounded-2xl border border-cyan-300/20 bg-[#071a2d] p-5 shadow-2xl shadow-black/60 sm:p-6">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs text-cyan-100/60">{parcel.city_name ?? 'MySkyParcel'}</p><h3 className="mt-1 font-display text-lg font-bold">PARSEL BİLGİLERİ</h3></div><button type="button" onClick={onClose} aria-label="Kapat" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-muted-foreground"><X className="h-5 w-5" /></button></div>
        <section className="mt-4 rounded-xl border border-cyan-300/15 bg-cyan-950/10 p-4" aria-label="Parsel bilgileri ve hatırası">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-b border-white/10 pb-4 text-xs"><div><span className="block text-[9px] uppercase tracking-[0.12em] text-white/40">Parsel No</span><strong>{parcel.parcel_number}</strong></div><div><span className="block text-[9px] uppercase tracking-[0.12em] text-white/40">Durum</span><strong>{statusLabel}</strong></div><div><span className="block text-[9px] uppercase tracking-[0.12em] text-white/40">Kategori</span><strong>{tierLabel}</strong></div><div><span className="block text-[9px] uppercase tracking-[0.12em] text-white/40">Fiyat</span><strong>{priceLabel}</strong></div></div>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button type="button" onClick={handleGoToParcel} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-xs font-bold text-cyan-100 transition hover:bg-cyan-300/15"><MapPin className="h-4 w-4" /> PARSELE GİT</button>
            {canBuy && <button type="button" onClick={handleBuy} className="btn-gold flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold"><ShoppingCart className="h-4 w-4" /> SATIN AL</button>}
          </div>
          <div className="mt-5 border-t border-white/10 pt-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/65">Parsel Hatırası</p><p className="mt-1 text-sm font-semibold">1 fotoğraf + küçük bir not</p></div>{memory && <span className="rounded-full border border-cyan-300/20 px-2 py-1 text-[9px] font-semibold text-cyan-100/65">{memory.is_public ? 'HERKESE AÇIK' : 'SADECE BEN'}</span>}</div>
            {memoryLoading ? <p className="mt-4 text-xs text-muted-foreground">Hatıra kontrol ediliyor...</p> : canManageMemory && editingMemory ? <div className="mt-4 space-y-3">{memoryPhotoUrl && <img src={memoryPhotoUrl} alt={`${parcel.parcel_number} parsel hatırası`} className="max-h-48 w-full rounded-lg object-cover" loading="lazy" />}<label className="block cursor-pointer rounded-lg border border-dashed border-cyan-300/25 bg-white/[0.03] p-3"><span className="flex items-center gap-2 text-xs font-semibold"><ImagePlus className="h-4 w-4" /> {memory?.photo_path ? 'Fotoğrafı değiştir' : 'Fotoğraf ekle'}</span><span className="mt-1 block text-[10px] text-muted-foreground">JPG, PNG veya WebP · Maks. 5 MB</span><input className="mt-2 block w-full text-[10px]" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleMemoryFileChange} /></label><label className="block"><span className="text-xs font-semibold">📝 Küçük not</span><textarea value={memoryNote} onChange={e => setMemoryNote(e.target.value.slice(0,300))} maxLength={300} rows={3} placeholder="Bu parsel için kısa bir anı..." className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs" /></label><label className="flex cursor-pointer items-start gap-3 rounded-lg border border-cyan-300/10 bg-white/[0.03] p-3"><input type="checkbox" checked={memoryIsPublic} onChange={e => setMemoryIsPublic(e.target.checked)} /><span className="text-xs">🌍 Gökyüzü Haritasında herkes görebilsin</span></label>{memoryMessage && <p className="rounded-lg bg-white/5 px-3 py-2 text-[10px]">{memoryMessage}</p>}<div className="grid grid-cols-2 gap-2"><button type="button" disabled={memorySaving} onClick={cancelMemoryEditor} className="h-10 rounded-lg border border-white/10 text-xs font-semibold">VAZGEÇ</button><button type="button" disabled={memorySaving} onClick={handleMemorySave} className="h-10 rounded-lg border border-cyan-300/25 text-xs font-bold">{memorySaving ? 'KAYDEDİLİYOR...' : 'HATIRAYI KAYDET'}</button></div></div> : <div className="mt-4 space-y-3">{memoryPhotoUrl ? <img src={memoryPhotoUrl} alt={`${parcel.parcel_number} parsel hatırası`} className="max-h-52 w-full rounded-lg object-cover" loading="lazy" /> : <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-5 text-center text-xs text-white/40">Henüz parsel hatırası eklenmemiş.</div>}{memory?.note && <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3"><p className="text-[9px]">Not</p><p className="mt-1 whitespace-pre-wrap text-xs leading-5">{memory.note}</p></div>}{memoryMessage && <p className="rounded-lg bg-white/5 px-3 py-2 text-[10px]">{memoryMessage}</p>}{canManageMemory ? <button type="button" onClick={startMemoryEditor} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-xs font-bold text-cyan-100"><Pencil className="h-4 w-4" />{memory ? 'HATIRAYI DÜZENLE' : 'PARSEL HATIRASI EKLE'}</button> : null}</div>}
          </div>
        </section>
      </div>
    </aside>
  );
}
