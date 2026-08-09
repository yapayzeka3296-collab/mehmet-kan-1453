import React, { useEffect, useState } from 'react';
import type { Parcel } from '@/types/parcel';
import { useAuth } from '@/hooks/useAuth';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { ImagePlus, Save, Trash2 } from 'lucide-react';

const TIER_LABELS = {
  digital: 'Dijital',
  elite: 'Elit',
  premium: 'Premium',
} as const;

const MAX_NOTE_LENGTH = 280;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MEMORY_BUCKET = 'parcel-memories';

type Customization = {
  id: string;
  parcel_id: string;
  owner_id: string;
  note: string | null;
  image_path: string | null;
};

export function ParcelDetailPanel({ parcel, onClose, onReserved }: { parcel: Parcel; onClose: () => void; onReserved?: (p: Parcel) => void }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [memoryLoading, setMemoryLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [memoryMessage, setMemoryMessage] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string | null>(null);

  const tierLabel = TIER_LABELS[parcel.tier];
  const isOwner = Boolean(user) && parcel.owner_id === user?.id;
  const canRequestCertificate = Boolean(user) && parcel.status === 'sold' && parcel.owner_id === user?.id;

  useEffect(() => {
    let active = true;

    async function loadCustomization() {
      setNote('');
      setImagePath(null);
      setImageUrl(null);
      setSelectedImageName(null);
      setMemoryMessage(null);

      if (!supabaseBrowser || !user || !isOwner) return;

      setMemoryLoading(true);
      try {
        const { data, error } = await supabaseBrowser
          .from('parcel_customizations')
          .select('id,parcel_id,owner_id,note,image_path')
          .eq('parcel_id', parcel.id)
          .eq('owner_id', user.id)
          .maybeSingle();

        if (error) throw error;
        if (!active) return;

        const customization = data as Customization | null;
        setNote(customization?.note ?? '');
        setImagePath(customization?.image_path ?? null);

        if (customization?.image_path) {
          const { data: signed } = await supabaseBrowser.storage
            .from(MEMORY_BUCKET)
            .createSignedUrl(customization.image_path, 3600);
          if (active) setImageUrl(signed?.signedUrl ?? null);
        }
      } catch (err) {
        console.error('Parcel customization load error', err);
        if (active) setMemoryMessage('Parsel notunuz yüklenemedi.');
      } finally {
        if (active) setMemoryLoading(false);
      }
    }

    void loadCustomization();
    return () => {
      active = false;
    };
  }, [parcel.id, user?.id, isOwner]);

  async function handleReserve() {
    setMessage(null);
    if (!user) {
      setMessage('Lütfen önce giriş yapın');
      return;
    }
    if (!supabaseBrowser) {
      setMessage('Supabase yapılandırması eksik. Lütfen daha sonra tekrar deneyin.');
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

      const res = await fetch('/purchase', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ parcel_id: parcel.id }),
      });

      const json = await res.json().catch(() => ({}));

      if (res.status === 202) {
        setMessage('Rezervasyon başarılı! Ödeme adımına geçebilirsiniz.');
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

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    setMemoryMessage(null);

    if (!file || !user || !isOwner || !supabaseBrowser) return;
    if (!file.type.startsWith('image/')) {
      setMemoryMessage('Lütfen bir görsel dosyası seçin.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setMemoryMessage('Görsel en fazla 5 MB olabilir.');
      return;
    }

    setMemoryLoading(true);
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${user.id}/${parcel.id}/${crypto.randomUUID()}.${extension}`;
      const { error } = await supabaseBrowser.storage
        .from(MEMORY_BUCKET)
        .upload(path, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false,
        });

      if (error) throw error;

      setImagePath(path);
      setSelectedImageName(file.name);
      const { data: signed } = await supabaseBrowser.storage
        .from(MEMORY_BUCKET)
        .createSignedUrl(path, 3600);
      setImageUrl(signed?.signedUrl ?? null);
      setMemoryMessage('Görsel hazır. Kaydetmeyi unutmayın.');
    } catch (err) {
      console.error('Parcel image upload error', err);
      setMemoryMessage('Görsel yüklenemedi. Lütfen tekrar deneyin.');
    } finally {
      setMemoryLoading(false);
    }
  }

  async function saveCustomization() {
    if (!supabaseBrowser || !user || !isOwner) return;

    setMemoryLoading(true);
    setMemoryMessage(null);
    try {
      const { data: existing } = await supabaseBrowser
        .from('parcel_customizations')
        .select('image_path')
        .eq('parcel_id', parcel.id)
        .eq('owner_id', user.id)
        .maybeSingle();

      const { error } = await supabaseBrowser
        .from('parcel_customizations')
        .upsert(
          {
            parcel_id: parcel.id,
            owner_id: user.id,
            note: note.trim() || null,
            image_path: imagePath,
          },
          { onConflict: 'parcel_id,owner_id' },
        );

      if (error) throw error;

      if (existing?.image_path && existing.image_path !== imagePath) {
        await supabaseBrowser.storage.from(MEMORY_BUCKET).remove([existing.image_path]);
      }

      setSelectedImageName(null);
      setMemoryMessage('Parsel notunuz ve görseliniz kaydedildi.');
    } catch (err) {
      console.error('Parcel customization save error', err);
      setMemoryMessage('Kaydetme sırasında bir hata oluştu.');
    } finally {
      setMemoryLoading(false);
    }
  }

  async function removeCustomizationImage() {
    if (!supabaseBrowser || !user || !isOwner || !imagePath) return;

    setMemoryLoading(true);
    setMemoryMessage(null);
    try {
      const { error: storageError } = await supabaseBrowser.storage.from(MEMORY_BUCKET).remove([imagePath]);
      if (storageError) throw storageError;

      const { error: dbError } = await supabaseBrowser
        .from('parcel_customizations')
        .upsert(
          {
            parcel_id: parcel.id,
            owner_id: user.id,
            note: note.trim() || null,
            image_path: null,
          },
          { onConflict: 'parcel_id,owner_id' },
        );
      if (dbError) throw dbError;

      setImagePath(null);
      setImageUrl(null);
      setSelectedImageName(null);
      setMemoryMessage('Parsel görseli kaldırıldı.');
    } catch (err) {
      console.error('Parcel image remove error', err);
      setMemoryMessage('Görsel kaldırılamadı.');
    } finally {
      setMemoryLoading(false);
    }
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-auto bg-background p-6 shadow-lg md:relative md:w-auto md:max-w-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground">{parcel.city_name ?? 'MySkyParcel'} · seçili parsel</p>
          <h3 className="mt-1 font-display text-lg font-bold">{parcel.parcel_number}</h3>
        </div>
        <button onClick={onClose} aria-label="Kapat" className="text-sm text-muted-foreground">Kapat</button>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4"><dt className="text-xs text-muted-foreground">Statü</dt><dd className="font-semibold">{tierLabel}</dd></div>
        <div className="flex items-center justify-between gap-4"><dt className="text-xs text-muted-foreground">Parsel durumu</dt><dd className="capitalize">{parcel.status}</dd></div>
        <div className="flex items-center justify-between gap-4"><dt className="text-xs text-muted-foreground">Fiyat</dt><dd className="font-semibold">{parcel.tier_price.toLocaleString('tr-TR')} TL</dd></div>
      </dl>

      <div className="mt-5 rounded-md border border-gold/20 bg-background/30 p-4 text-xs text-muted-foreground">
        <p>Parsel kodu kalıcıdır ve sahiplik değişse bile değişmez.</p>
        <p className="mt-2">Sertifika otomatik verilmez. Satın alma tamamlandıktan sonra uygun statü için “Sertifika Talep Et” kullanılabilir.</p>
        {canRequestCertificate && <p className="mt-2 text-gold">Bu parsel için sertifika talebi oluşturabilirsiniz.</p>}
      </div>

      {isOwner && (
        <section className="mt-6 rounded-xl border border-gold/25 bg-navy-deep/60 p-4 shadow-inner">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-gold">PARSELİNİ KİŞİSELLEŞTİR</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Küçük bir not ve bir hatıra görseli ekleyebilirsin.</p>
            </div>
            <span className="rounded-full border border-gold/20 px-2 py-1 text-[10px] text-muted-foreground">Sadece sen görürsün</span>
          </div>

          <label className="mt-4 block text-xs text-muted-foreground" htmlFor="parcel-note">Parsel notu</label>
          <textarea
            id="parcel-note"
            value={note}
            maxLength={MAX_NOTE_LENGTH}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Bu parsel benim için..."
            className="mt-2 min-h-24 w-full resize-none rounded-lg border border-input bg-background/70 p-3 text-sm outline-none transition focus:border-gold/60"
          />
          <div className="mt-1 text-right text-[10px] text-muted-foreground">{note.length}/{MAX_NOTE_LENGTH}</div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gold/30 bg-background/60 px-3 py-3 text-xs font-semibold text-gold transition hover:bg-gold/10">
              <ImagePlus className="h-4 w-4" />
              {imagePath ? 'Görseli değiştir' : 'Görsel ekle'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={handleImageChange} disabled={memoryLoading} />
            </label>
            {imagePath && (
              <button type="button" onClick={removeCustomizationImage} disabled={memoryLoading} className="flex items-center justify-center gap-2 rounded-lg border border-red-300/20 px-3 py-3 text-xs text-red-200 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" /> Görseli kaldır
              </button>
            )}
          </div>

          {imageUrl && (
            <div className="relative mt-4 overflow-hidden rounded-lg border border-gold/20 bg-black/30">
              <img src={imageUrl} alt="Parsel hatıra görseli" className="max-h-52 w-full object-cover" />
            </div>
          )}
          {selectedImageName && <p className="mt-2 truncate text-[10px] text-muted-foreground">{selectedImageName}</p>}

          <button type="button" onClick={saveCustomization} disabled={memoryLoading} className="btn-gold mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm">
            <Save className="h-4 w-4" />
            {memoryLoading ? 'Kaydediliyor...' : 'NOTU VE GÖRSELİ KAYDET'}
          </button>
          {memoryMessage && <p className="mt-3 text-center text-xs text-muted-foreground">{memoryMessage}</p>}
        </section>
      )}

      {!isOwner && user && parcel.status === 'sold' && (
        <div className="mt-6 rounded-lg border border-input bg-background/30 p-4 text-xs text-muted-foreground">
          Bu parsel başka bir kullanıcıya ait. Parsel kişiselleştirmesi yalnızca mevcut sahibine açıktır.
        </div>
      )}

      {!user && (
        <div className="mt-6 rounded-lg border border-gold/20 bg-background/30 p-4 text-xs text-muted-foreground">
          Parsel sahibi olduğunda not ve görsel ekleyebilmek için hesabınla giriş yapmalısın.
        </div>
      )}

      <div className="mt-6">
        <button onClick={handleReserve} disabled={loading || parcel.status !== 'available'} className="btn-gold w-full rounded-md py-3 text-sm">
          {loading ? 'Rezervasyon yapılıyor...' : parcel.status === 'available' ? 'PARSELİ REZERVE ET' : 'REZERVE EDİLEMEZ'}
        </button>
        {message && <p className="mt-3 text-center text-sm text-muted-foreground">{message}</p>}
      </div>
    </aside>
  );
}
