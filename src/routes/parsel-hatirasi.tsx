import { useEffect, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function ParcelHatirasiPage() {
  const search = useSearch({ strict: false }) as { parcel?: string };
  const parcelId = search.parcel ?? "";
  const [memory, setMemory] = useState<{ photo_path: string; note: string | null } | null>(null);
  const [parcelNumber, setParcelNumber] = useState(parcelId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!parcelId) { setError("Parsel bilgisi bulunamadı."); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const [{ data: mem, error: memError }, { data: parcel }] = await Promise.all([
        supabaseBrowser.from("parcel_memories").select("photo_path,note").eq("parcel_id", parcelId).maybeSingle(),
        supabaseBrowser.from("parcels").select("parcel_number").eq("id", parcelId).maybeSingle(),
      ]);
      if (cancelled) return;
      if (memError) setError(memError.message);
      else if (!mem?.photo_path) setError("Bu parselde henüz bir hatıra bulunmuyor.");
      else setMemory(mem as { photo_path: string; note: string | null });
      if (parcel?.parcel_number) setParcelNumber(parcel.parcel_number);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [parcelId]);

  const photoUrl = memory?.photo_path ? supabaseBrowser.storage.from("parcel-memories").getPublicUrl(memory.photo_path).data.publicUrl : null;

  return <div className="min-h-screen bg-[#050d18] p-4 text-white sm:p-8">
    <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div><div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">Parsel Hatırası</div><h1 className="mt-1 text-lg font-extrabold">{parcelNumber}</h1></div>
        <button type="button" onClick={() => window.history.back()} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-xl">×</button>
      </div>
      {loading ? <div className="p-10 text-center text-white/60">Hatıra yükleniyor...</div> : error ? <div className="p-10 text-center text-sm text-white/60">{error}</div> : <div className="p-5">
        {photoUrl && <img src={photoUrl} alt={`${parcelNumber} parsel hatırası`} className="max-h-[70vh] w-full rounded-xl object-contain bg-black/20" />}
        {memory?.note && <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4"><div className="text-[10px] uppercase tracking-[0.16em] text-cyan-200/60">Not</div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/80">{memory.note}</p></div>}
      </div>}
    </div>
  </div>;
}
