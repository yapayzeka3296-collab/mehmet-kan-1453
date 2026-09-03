import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { Parcel } from '@/types/parcel';
import { useAuth } from '@/hooks/useAuth';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { X, ImagePlus, Music2, Pencil, Trash2, ShoppingCart, MapPin } from 'lucide-react';

const TIER_LABELS = { digital: 'Dijital', elite: 'Elit', premium: 'Premium' } as const;
type Memory = { photo_path: string | null; music_path: string | null; note: string | null; is_public: boolean; updated_at?: string };
type Props = { parcel: Parcel; onClose: () => void; onReserved?: (p: Parcel) => void; onLocate?: (p: Parcel) => void };
const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const MUSIC_EXTENSIONS = ['mp3', 'm4a', 'aac', 'wav', 'ogg', 'webm'];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_MUSIC_BYTES = 8 * 1024 * 1024;

const citySlug = (name: string | null | undefined) => (name ?? '').toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function ParcelDetailPanel({ parcel, onClose, onLocate }: Props) {
  const navigate = useNavigate(); const { user } = useAuth();
  const [isOwner, setIsOwner] = useState(false); const [memoryLoading, setMemoryLoading] = useState(true); const [memorySaving, setMemorySaving] = useState(false); const [memoryDeleting, setMemoryDeleting] = useState(false);
  const [memory, setMemory] = useState<Memory | null>(null); const [memoryPhotoUrl, setMemoryPhotoUrl] = useState<string | null>(null); const [memoryMusicUrl, setMemoryMusicUrl] = useState<string | null>(null);
  const [memoryNote, setMemoryNote] = useState(''); const [memoryFile, setMemoryFile] = useState<File | null>(null); const [memoryMusicFile, setMemoryMusicFile] = useState<File | null>(null); const [memoryIsPublic, setMemoryIsPublic] = useState(false); const [memoryMessage, setMemoryMessage] = useState<string | null>(null); const [editingMemory, setEditingMemory] = useState(false);
  const ownsFromParcel = !!user && parcel.owner_id === user.id; const canManageMemory = ownsFromParcel || isOwner; const statusLabel = parcel.status === 'sold' ? 'Satıldı' : parcel.status === 'reserved' ? 'Rezerve' : 'Satılık'; const tierLabel = TIER_LABELS[parcel.tier]; const priceLabel = typeof parcel.tier_price === 'number' ? `${parcel.tier_price.toLocaleString('tr-TR')} TL` : '—'; const canBuy = parcel.status !== 'sold' && parcel.status !== 'reserved' && !ownsFromParcel;
  function handleBuy() { const redirect = `/parsel-satin-al?parcels=${encodeURIComponent(parcel.id)}`; if (!user) { void navigate({ to: '/giris', search: { redirect } }); return; } void navigate({ to: '/parsel-satin-al', search: { parcels: parcel.id } }); }
  function handleGoToParcel() { if (onLocate) { onLocate(parcel); return; } const slug = citySlug(parcel.city_name); if (!slug) return; onClose(); void navigate({ to: '/turkiye-haritasi', search: { city: slug, parcels: parcel.id } as never }); }

  useEffect(() => { let cancelled = false; setMemoryLoading(true); setMemory(null); setMemoryPhotoUrl(null); setMemoryMusicUrl(null); setMemoryNote(''); setMemoryFile(null); setMemoryMusicFile(null); setMemoryIsPublic(false); setMemoryMessage(null); setEditingMemory(false);
    async function loadMemory() {
      try {
        const [{ data: sessionData }, { data: ownerData, error: ownerError }, { data: parcelOwnerRow, error: parcelOwnerError }, { data: memoryRow, error: memoryError }] = await Promise.all([
          supabaseBrowser.auth.getSession(), supabaseBrowser.rpc('is_parcel_owner', { p_parcel_id: parcel.id }), supabaseBrowser.from('parcels').select('owner_id').eq('id', parcel.id).maybeSingle(), supabaseBrowser.from('parcel_memories').select('photo_path,music_path,note,is_public,updated_at').eq('parcel_id', parcel.id).maybeSingle()
        ]);
        if (cancelled) return;
        if (ownerError) console.error('Parcel owner RPC error', ownerError); if (parcelOwnerError) console.error('Parcel owner row error', parcelOwnerError); if (memoryError) console.error('Parcel memory lookup error', memoryError);
        const currentUserId = sessionData.session?.user?.id ?? user?.id ?? null; const rpcOwner = ownerData === true || ownerData === 'true'; const databaseOwner = !!currentUserId && parcelOwnerRow?.owner_id === currentUserId; setIsOwner(rpcOwner || databaseOwner);
        const nextMemory = memoryRow ? (memoryRow as Memory) : null; setMemory(nextMemory); setMemoryNote(nextMemory?.note ?? ''); setMemoryIsPublic(nextMemory?.is_public ?? false);
        if (nextMemory?.photo_path && nextMemory.photo_path !== 'note-only') { const { data } = await supabaseBrowser.storage.from('parcel-memories').createSignedUrl(nextMemory.photo_path, 3600); if (!cancelled) setMemoryPhotoUrl(data?.signedUrl ?? null); }
        if (nextMemory?.music_path) { const { data } = await supabaseBrowser.storage.from('parcel-memories').createSignedUrl(nextMemory.music_path, 3600); if (!cancelled) setMemoryMusicUrl(data?.signedUrl ?? null); }
      } catch (error) { console.error('Parcel memory load error', error); } finally { if (!cancelled) setMemoryLoading(false); }
    }
    void loadMemory(); return () => { cancelled = true; };
  }, [parcel.id, parcel.owner_id, user?.id]);

  function startMemoryEditor() { setMemoryMessage(null); setMemoryFile(null); setMemoryMusicFile(null); setEditingMemory(true); }
  function cancelMemoryEditor() { setMemoryMessage(null); setMemoryFile(null); setMemoryMusicFile(null); setMemoryNote(memory?.note ?? ''); setMemoryIsPublic(memory?.is_public ?? false); setEditingMemory(false); }
  function handleMemoryFileChange(event: ChangeEvent<HTMLInputElement>) { setMemoryFile(event.target.files?.[0] ?? null); setMemoryMessage(null); }
  function handleMemoryMusicChange(event: ChangeEvent<HTMLInputElement>) { setMemoryMusicFile(event.target.files?.[0] ?? null); setMemoryMessage(null); }

  async function handleMemorySave() {
    if (!user) { setMemoryMessage('Hatıra eklemek için giriş yapın.'); return; }
    if (!canManageMemory) { setMemoryMessage('Hatıra eklenemedi.'); return; }
    if (!memoryFile && !memory?.photo_path) { setMemoryMessage('Lütfen bir fotoğraf seçin.'); return; }
    if (!memoryMusicFile && !memory?.music_path) { setMemoryMessage('Lütfen bir müzik dosyası seçin.'); return; }
    if (memoryNote.trim().length > 300) { setMemoryMessage('Not en fazla 300 karakter olabilir.'); return; }
    setMemorySaving(true); setMemoryMessage(null); let uploadedPhotoPath: string | null = null; let uploadedMusicPath: string | null = null;
    try {
      let nextPhotoPath = memory?.photo_path ?? null; let nextMusicPath = memory?.music_path ?? null;
      if (memoryFile) {
        if (!memoryFile.type.startsWith('image/')) throw new Error('Lütfen bir fotoğraf seçin.'); if (memoryFile.size > MAX_PHOTO_BYTES) throw new Error('Fotoğraf en fazla 5 MB olabilir.');
        const ext = (memoryFile.name.split('.').pop() || 'jpg').toLowerCase(); if (!PHOTO_EXTENSIONS.includes(ext)) throw new Error('JPG, PNG veya WebP kullanın.');
        uploadedPhotoPath = `${user.id}/${parcel.id}/memory-photo-${Date.now()}.${ext}`; const { error } = await supabaseBrowser.storage.from('parcel-memories').upload(uploadedPhotoPath, memoryFile, { upsert: false, contentType: memoryFile.type, cacheControl: '3600' }); if (error) throw new Error(`Fotoğraf yüklenemedi: ${error.message}`); nextPhotoPath = uploadedPhotoPath;
      }
      if (memoryMusicFile) {
        if (!memoryMusicFile.type.startsWith('audio/')) throw new Error('Lütfen bir müzik dosyası seçin.'); if (memoryMusicFile.size > MAX_MUSIC_BYTES) throw new Error('Müzik en fazla 8 MB olabilir.');
        const ext = (memoryMusicFile.name.split('.').pop() || 'mp3').toLowerCase(); if (!MUSIC_EXTENSIONS.includes(ext)) throw new Error('MP3, M4A, AAC, WAV, OGG veya WebM kullanın.');
        uploadedMusicPath = `${user.id}/${parcel.id}/memory-music-${Date.now()}.${ext}`; const { error } = await supabaseBrowser.storage.from('parcel-memories').upload(uploadedMusicPath, memoryMusicFile, { upsert: false, contentType: memoryMusicFile.type, cacheControl: '3600' }); if (error) throw new Error(`Müzik yüklenemedi: ${error.message}`); nextMusicPath = uploadedMusicPath;
      }
      const { error: saveError } = await supabaseBrowser.rpc('save_parcel_memory', { p_parcel_id: parcel.id, p_photo_path: nextPhotoPath, p_note: memoryNote.trim(), p_music_path: nextMusicPath, p_is_public: memoryIsPublic });
      if (saveError) throw new Error(`Hatıra kaydedilemedi: ${saveError.message}`);
      const { data: persistedMemory, error: reloadError } = await supabaseBrowser.from('parcel_memories').select('photo_path,music_path,note,is_public,updated_at').eq('parcel_id', parcel.id).maybeSingle();
      if (reloadError || !persistedMemory) throw new Error(reloadError?.message || 'Hatıra kaydı doğrulanamadı.');
      const nextMemory = persistedMemory as Memory;
      if (uploadedPhotoPath && memory?.photo_path && memory.photo_path !== uploadedPhotoPath) await supabaseBrowser.storage.from('parcel-memories').remove([memory.photo_path]);
      if (uploadedMusicPath && memory?.music_path && memory.music_path !== uploadedMusicPath) await supabaseBrowser.storage.from('parcel-memories').remove([memory.music_path]);
      const [{ data: photoSigned }, { data: musicSigned }] = await Promise.all([
        nextMemory.photo_path ? supabaseBrowser.storage.from('parcel-memories').createSignedUrl(nextMemory.photo_path, 3600) : Promise.resolve({ data: null }),
        nextMemory.music_path ? supabaseBrowser.storage.from('parcel-memories').createSignedUrl(nextMemory.music_path, 3600) : Promise.resolve({ data: null })
      ]);
      setMemory(nextMemory); setMemoryNote(nextMemory.note ?? ''); setMemoryIsPublic(nextMemory.is_public); setMemoryFile(null); setMemoryMusicFile(null); setMemoryPhotoUrl(photoSigned?.signedUrl ?? null); setMemoryMusicUrl(musicSigned?.signedUrl ?? null); setEditingMemory(false); setMemoryMessage(nextMemory.is_public ? 'Hatıran kaydedildi. Diğer kullanıcılar görebilir.' : 'Hatıran kaydedildi. Sadece sen görebilirsin.');
    } catch (error) {
      if (uploadedPhotoPath) await supabaseBrowser.storage.from('parcel-memories').remove([uploadedPhotoPath]); if (uploadedMusicPath) await supabaseBrowser.storage.from('parcel-memories').remove([uploadedMusicPath]);
      setMemoryMessage(error instanceof Error ? error.message : 'Hatıran kaydedilemedi.');
    } finally { setMemorySaving(false); }
  }

  async function handleMemoryDelete() {
    if (!user || !canManageMemory || !memory) return; if (!window.confirm('Bu hatırayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;
    setMemoryDeleting(true); setMemoryMessage(null);
    try {
      const photoPath = memory.photo_path; const musicPath = memory.music_path; const { error } = await supabaseBrowser.rpc('delete_parcel_memory', { p_parcel_id: parcel.id }); if (error) throw new Error(`Hatıra silinemedi: ${error.message}`);
      const paths = [photoPath, musicPath].filter((path): path is string => !!path && path !== 'note-only'); if (paths.length) { const { error: storageError } = await supabaseBrowser.storage.from('parcel-memories').remove(paths); if (storageError) console.error('Memory media cleanup error', storageError); }
      setMemory(null); setMemoryPhotoUrl(null); setMemoryMusicUrl(null); setMemoryNote(''); setMemoryMusicFile(null); setMemoryFile(null); setEditingMemory(false); setMemoryMessage('Hatıran silindi.');
    } catch (error) { setMemoryMessage(error instanceof Error ? error.message : 'Hatıra silinemedi.'); } finally { setMemoryDeleting(false); }
  }

  return <aside className="fixed inset-0 z-[320] grid place-items-center bg-black/45 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Parsel bilgileri"><div className="max-h-[92vh] w-full max-w-md overflow-auto rounded-2xl border border-cyan-300/20 bg-[#071a2d] p-5 shadow-2xl shadow-black/60 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs text-cyan-100/60">{parcel.city_name ?? 'MySkyParcel'}</p><h3 className="mt-1 font-display text-lg font-bold">PARSEL BİLGİLERİ</h3></div><button type="button" onClick={onClose} aria-label="Kapat" className="relative z-[1000] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#071a2d] text-muted-foreground"><X className="h-5 w-5" /></button></div><section className="mt-4 rounded-xl border border-cyan-300/15 bg-cyan-950/10 p-4"><div className="grid grid-cols-2 gap-x-4 gap-y-2 border-b border-white/10 pb-4 text-xs"><div><span className="block text-[9px] uppercase tracking-[0.12em] text-white/40">Parsel No</span><strong>{parcel.parcel_number}</strong></div><div><span className="block text-[9px] uppercase tracking-[0.12em] text-white/40">Durum</span><strong>{statusLabel}</strong></div><div><span className="block text-[9px] uppercase tracking-[0.12em] text-white/40">Kategori</span><strong>{tierLabel}</strong></div><div><span className="block text-[9px] uppercase tracking-[0.12em] text-white/40">Fiyat</span><strong>{priceLabel}</strong></div></div><div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2"><button type="button" onClick={handleGoToParcel} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-xs font-bold text-cyan-100 transition hover:bg-cyan-300/15"><MapPin className="h-4 w-4" /> PARSELE GİT</button>{canBuy && <button type="button" onClick={handleBuy} className="btn-gold flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold"><ShoppingCart className="h-4 w-4" /> SATIN AL</button>}</div><div className="mt-5 border-t border-white/10 pt-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/65">Parsel Hatırası</p><p className="mt-1 text-sm font-semibold">1 fotoğraf + kısa not + 1 müzik</p></div>{memory && <span className="rounded-full border border-cyan-300/20 px-2 py-1 text-[9px] font-semibold text-cyan-100/65">{memory.is_public ? 'HERKESE AÇIK' : 'SADECE BEN'}</span>}</div>{memoryLoading ? <p className="mt-4 text-xs text-muted-foreground">Hatıra kontrol ediliyor...</p> : canManageMemory && editingMemory ? <div className="mt-4 space-y-3">{memoryPhotoUrl && <img src={memoryPhotoUrl} alt={`${parcel.parcel_number} parsel hatırası`} className="max-h-48 w-full rounded-lg object-cover" loading="lazy" />}<label className="block cursor-pointer rounded-lg border border-dashed border-cyan-300/25 bg-white/[0.03] p-3"><span className="flex items-center gap-2 text-xs font-semibold"><ImagePlus className="h-4 w-4" /> {memory?.photo_path ? 'Fotoğrafı değiştir' : 'Fotoğraf ekle'}</span><span className="mt-1 block text-[10px] text-muted-foreground">JPG, PNG veya WebP · Maks. 5 MB</span><input className="mt-2 block w-full text-[10px]" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleMemoryFileChange} /></label>{memoryMusicUrl && <audio controls preload="none" src={memoryMusicUrl} className="w-full" />}<label className="block cursor-pointer rounded-lg border border-dashed border-cyan-300/25 bg-white/[0.03] p-3"><span className="flex items-center gap-2 text-xs font-semibold"><Music2 className="h-4 w-4" /> {memory?.music_path ? 'Müziği değiştir' : 'Müzik ekle'}</span><span className="mt-1 block text-[10px] text-muted-foreground">MP3, M4A, AAC, WAV, OGG veya WebM · Maks. 8 MB</span><input className="mt-2 block w-full text-[10px]" type="file" accept="audio/*" onChange={handleMemoryMusicChange} /></label><label className="block"><span className="text-xs font-semibold">📝 Kısa not</span><textarea value={memoryNote} onChange={e => setMemoryNote(e.target.value.slice(0,300))} maxLength={300} rows={3} placeholder="Bu parsel için kısa bir anı..." className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs" /></label><div className="rounded-lg border border-cyan-300/10 bg-white/[0.03] p-3"><p className="text-xs font-semibold">Hatıranın görünürlüğü</p><div className="mt-2 grid grid-cols-2 gap-2"><label className={`cursor-pointer rounded-lg border p-2 text-[11px] ${!memoryIsPublic ? 'border-cyan-300/40 bg-cyan-300/10' : 'border-white/10'}`}><input type="radio" className="mr-2" checked={!memoryIsPublic} onChange={() => setMemoryIsPublic(false)} /> Sadece ben</label><label className={`cursor-pointer rounded-lg border p-2 text-[11px] ${memoryIsPublic ? 'border-cyan-300/40 bg-cyan-300/10' : 'border-white/10'}`}><input type="radio" className="mr-2" checked={memoryIsPublic} onChange={() => setMemoryIsPublic(true)} /> Herkes görebilir</label></div></div>{memoryMessage && <p className="rounded-lg bg-white/5 px-3 py-2 text-[10px]">{memoryMessage}</p>}<div className="grid grid-cols-2 gap-2"><button type="button" disabled={memorySaving} onClick={cancelMemoryEditor} className="h-10 rounded-lg border border-white/10 text-xs font-semibold">VAZGEÇ</button><button type="button" disabled={memorySaving} onClick={handleMemorySave} className="h-10 rounded-lg border border-cyan-300/25 text-xs font-bold">{memorySaving ? 'KAYDEDİLİYOR...' : 'HATIRAYI KAYDET'}</button></div></div> : !memory && canManageMemory ? <div className="mt-4 space-y-3"><div className="rounded-lg border border-dashed border-cyan-300/20 bg-white/[0.02] p-4 text-center text-xs text-white/55">Bu parselde henüz bir hatıra yok.</div><button type="button" onClick={startMemoryEditor} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-xs font-bold text-cyan-100 transition hover:bg-cyan-300/15"><ImagePlus className="h-4 w-4" /> HATIRA EKLE</button></div> : <div className="mt-4 space-y-3">{memoryPhotoUrl ? <img src={memoryPhotoUrl} alt={`${parcel.parcel_number} parsel hatırası`} className="max-h-52 w-full rounded-lg object-cover" loading="lazy" /> : <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-5 text-center text-xs text-white/40">Henüz parsel hatırası eklenmemiş.</div>}{memory?.note && <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3"><p className="text-[9px]">Not</p><p className="mt-1 whitespace-pre-wrap text-xs leading-5">{memory.note}</p></div>}{memoryMusicUrl && <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3"><div className="mb-2 flex items-center gap-2 text-[10px] text-white/55"><Music2 className="h-3.5 w-3.5" /> Hatıra müziği</div><audio controls preload="none" src={memoryMusicUrl} className="w-full" /></div>}{memoryMessage && <p className="rounded-lg bg-white/5 px-3 py-2 text-[10px]">{memoryMessage}</p>}{canManageMemory && <div className="grid grid-cols-2 gap-2"><button type="button" onClick={startMemoryEditor} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-xs font-bold text-cyan-100"><Pencil className="h-4 w-4" /> DÜZENLE</button><button type="button" disabled={memoryDeleting} onClick={() => void handleMemoryDelete()} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-red-300/20 bg-red-300/5 text-xs font-bold text-red-100"><Trash2 className="h-4 w-4" /> {memoryDeleting ? 'SİLİNİYOR...' : 'SİL'}</button></div>}</div>}</div></section></div></aside>;
}
