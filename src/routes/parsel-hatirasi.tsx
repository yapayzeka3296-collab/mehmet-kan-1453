import { useEffect, useState } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Memory = { photo_path: string; music_path: string | null; note: string | null };

export const Route = createFileRoute("/parsel-hatirasi")({
  component: ParcelHatirasiPage,
});

function ParcelHatirasiPage() {
  const search = useSearch({ strict: false }) as { parcel?: string };
  const parcelId = search.parcel ?? "";
  const [memory, setMemory] = useState<Memory | null>(null);
  const [parcelNumber, setParcelNumber] = useState(parcelId);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [musicUrl, setMusicUrl] = useState<string | null>(null);
  const [musicObjectUrl, setMusicObjectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [musicError, setMusicError] = useState<string | null>(null);

  useEffect(() => {
    if (!parcelId) { setError("Parsel bilgisi bulunamadı."); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const { data: sessionData } = await supabaseBrowser.auth.getSession(); const userId = sessionData.session?.user?.id ?? null;
      const [{ data: mem, error: memError }, { data: parcel }] = await Promise.all([
        supabaseBrowser.from("parcel_memories").select("photo_path,music_path,note,is_public").eq("parcel_id", parcelId).maybeSingle(),
        supabaseBrowser.from("parcels").select("parcel_number,owner_id").eq("id", parcelId).maybeSingle(),
      ]);
      if (cancelled) return;
      if (memError) setError(memError.message);
      else if (!mem?.photo_path) setError("Bu parselde henüz bir hatıra bulunmuyor.");
      else if (!mem.is_public && parcel?.owner_id !== userId) setError("Bu hatıra yalnızca sahibi tarafından görülebilir.");
      else {
        const next = mem as Memory; setMemory(next); setParcelNumber(parcel?.parcel_number ?? parcelId);
        const { data: photo } = await supabaseBrowser.storage.from("parcel-memories").createSignedUrl(next.photo_path, 3600);
        if (!cancelled) setPhotoUrl(photo?.signedUrl ?? null);
        if (next.music_path) {
          const { data: music, error: musicDownloadError } = await supabaseBrowser.storage.from("parcel-memories").download(next.music_path);
          if (musicDownloadError) {
            const { data: signedMusic } = await supabaseBrowser.storage.from("parcel-memories").createSignedUrl(next.music_path, 3600);
            if (!cancelled) setMusicUrl(signedMusic?.signedUrl ?? null);
          } else if (music && !cancelled) {
            const objectUrl = URL.createObjectURL(music);
            setMusicObjectUrl(objectUrl);
            setMusicUrl(null);
          }
        }
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [parcelId]);

  useEffect(() => () => { if (musicObjectUrl) URL.revokeObjectURL(musicObjectUrl); }, [musicObjectUrl]);

  return <div className="min-h-screen bg-[#050d18] p-4 text-white sm:p-8"><div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] shadow-2xl"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">Parsel Hatırası</div><h1 className="mt-1 text-lg font-extrabold">{parcelNumber}</h1></div><button type="button" onClick={() => window.history.back()} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-xl">×</button></div>{loading ? <div className="p-10 text-center text-white/60">Hatıra yükleniyor...</div> : error ? <div className="p-10 text-center text-sm text-white/60">{error}</div> : <div className="p-5">{photoUrl && <img src={photoUrl} alt={`${parcelNumber} parsel hatırası`} className="max-h-[60vh] w-full rounded-xl object-contain bg-black/20" loading="lazy" />}{memory?.note && <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4"><div className="text-[10px] uppercase tracking-[0.16em] text-cyan-200/60">Not</div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/80">{memory.note}</p></div>}{(musicObjectUrl || musicUrl) && <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4"><div className="mb-2 text-[10px] uppercase tracking-[0.16em] text-cyan-200/60">Hatıra Müziği</div><audio controls preload="metadata" src={musicObjectUrl ?? musicUrl ?? undefined} onError={() => setMusicError("Müzik tarayıcı tarafından oynatılamadı.")} className="w-full" />{musicError && <p className="mt-2 text-[10px] text-red-300">{musicError}</p>}</div>}</div>}</div></div>;
}

export default ParcelHatirasiPage;
