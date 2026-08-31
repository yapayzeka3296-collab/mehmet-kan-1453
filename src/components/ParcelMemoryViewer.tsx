import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Props = { parcelId: string; parcelNumber: string; onClose: () => void };
type Memory = { photo_path: string; note: string | null; updated_at: string };

export function ParcelMemoryViewer({ parcelId, parcelNumber, onClose }: Props) {
  const [memory, setMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: queryError } = await supabaseBrowser.from("parcel_memories").select("photo_path,note,updated_at").eq("parcel_id", parcelId).maybeSingle();
      if (cancelled) return;
      if (queryError) setError(queryError.message);
      else if (data?.photo_path && data.photo_path !== "note-only") setMemory(data as Memory);
      else setError("Bu parselde henüz bir hatıra bulunmuyor.");
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [parcelId]);

  const photoUrl = memory ? supabaseBrowser.storage.from("parcel-memories").getPublicUrl(memory.photo_path).data.publicUrl : null;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/75 p-4 pt-20 backdrop-blur-sm" onClick={onClose}>
      <div className="relative z-[10000] w-full max-w-md overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] text-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div><p className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">Parsel Hatırası</p><h2 className="mt-1 text-lg font-extrabold">{parcelNumber}</h2></div>
          <button type="button" onClick={onClose} aria-label="Kapat" className="relative z-[10001] grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-xl hover:bg-white/15">×</button>
        </div>
        {loading ? <div className="p-8 text-center text-sm text-white/55">Hatıra yükleniyor...</div> : error ? <div className="p-8 text-center text-sm text-white/60">{error}</div> : <div className="p-5">
          {photoUrl && <img src={photoUrl} alt={`${parcelNumber} parsel hatırası`} className="max-h-[55vh] w-full rounded-xl object-contain bg-black/20" loading="lazy" />}
          {memory?.note && <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/60">Not</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/80">{memory.note}</p></div>}
        </div>}
      </div>
    </div>
  );
}
