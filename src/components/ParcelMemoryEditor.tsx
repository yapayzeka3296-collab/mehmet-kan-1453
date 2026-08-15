import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type MemoryEvent = { parcelId: string; parcelNumber: string; mode?: "edit" | "view" };
type Props = { parcel: { id: string; parcel_number: string } | null };
type Memory = { photo_path: string; note: string | null; updated_at: string };

export function ParcelMemoryEditor({ parcel }: Props) {
  const [memory, setMemory] = useState<MemoryEvent | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [viewer, setViewer] = useState<MemoryEvent | null>(null);
  const [publicMemory, setPublicMemory] = useState<Memory | null>(null);
  const [memoryLoading, setMemoryLoading] = useState(true);

  useEffect(() => {
    if (!parcel) return;
    let observer: MutationObserver | null = null;
    let cancelled = false;
    const install = async () => {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const user = sessionData.session?.user;
      const { data: ownerRow } = await supabaseBrowser.from("parcels").select("owner_id").eq("id", parcel.id).maybeSingle();
      if (cancelled) return;
      const isOwner = !!user && ownerRow?.owner_id === user.id;
      const { data: existing } = await supabaseBrowser.from("parcel_memories").select("photo_path").eq("parcel_id", parcel.id).maybeSingle();
      if (cancelled) return;
      const hasMemory = !!existing?.photo_path && existing.photo_path !== "note-only";
      const addButton = () => {
        const purchase = document.querySelector("[data-msp-purchase]") as HTMLElement | null;
        if (!purchase || !purchase.parentElement) return;
        const old = purchase.parentElement.querySelector("[data-msp-memory], [data-msp-view-memory]");
        if (old) old.remove();
        if (isOwner) {
          const button = document.createElement("button");
          button.type = "button"; button.setAttribute("data-msp-memory", "1"); button.textContent = hasMemory ? "📷  HATIRAYI DÜZENLE" : "📷  PARSEL HATIRASI";
          button.style.cssText = "margin-top:7px;width:100%;height:32px;border:1px solid rgba(88,230,255,.35);border-radius:8px;background:rgba(88,230,255,.08);color:#bdefff;font-size:10px;font-weight:800;letter-spacing:.04em;cursor:pointer";
          button.addEventListener("click", () => window.dispatchEvent(new CustomEvent<MemoryEvent>("msp:memory", { detail: { parcelId: parcel.id, parcelNumber: parcel.parcel_number, mode: "edit" } })));
          purchase.parentElement.appendChild(button);
        } else if (hasMemory) {
          const button = document.createElement("button");
          button.type = "button"; button.setAttribute("data-msp-view-memory", "1"); button.textContent = "👁  HATIRAYI GÖR";
          button.style.cssText = "margin-top:7px;width:100%;height:32px;border:1px solid rgba(88,230,255,.35);border-radius:8px;background:rgba(88,230,255,.08);color:#bdefff;font-size:10px;font-weight:800;letter-spacing:.04em;cursor:pointer";
          button.addEventListener("click", () => window.dispatchEvent(new CustomEvent<MemoryEvent>("msp:memory", { detail: { parcelId: parcel.id, parcelNumber: parcel.parcel_number, mode: "view" } })));
          purchase.parentElement.appendChild(button);
        }
      };
      addButton(); observer = new MutationObserver(addButton); observer.observe(document.body, { childList: true, subtree: true });
    };
    void install();
    return () => { cancelled = true; observer?.disconnect(); };
  }, [parcel]);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<MemoryEvent>).detail;
      if (detail.mode === "view") setViewer(detail); else { setMemory(detail); setMessage(null); }
    };
    window.addEventListener("msp:memory", onOpen);
    return () => window.removeEventListener("msp:memory", onOpen);
  }, []);

  useEffect(() => {
    if (!memory) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabaseBrowser.from("parcel_memories").select("photo_path,note").eq("parcel_id", memory.parcelId).maybeSingle();
      if (!cancelled) { setPhotoPath(data?.photo_path ?? null); setNote(data?.note ?? ""); setFile(null); }
    })();
    return () => { cancelled = true; };
  }, [memory]);

  useEffect(() => {
    if (!viewer) return;
    let cancelled = false;
    setMemoryLoading(true); setPublicMemory(null);
    (async () => {
      const { data, error } = await supabaseBrowser.from("parcel_memories").select("photo_path,note,updated_at").eq("parcel_id", viewer.parcelId).maybeSingle();
      if (!cancelled) { if (!error && data?.photo_path && data.photo_path !== "note-only") setPublicMemory(data as Memory); setMemoryLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [viewer]);

  if (!memory && !viewer) return null;
  if (viewer) {
    const photoUrl = publicMemory ? supabaseBrowser.storage.from("parcel-memories").getPublicUrl(publicMemory.photo_path).data.publicUrl : null;
    return <div className="fixed inset-0 z-[110] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" onClick={() => setViewer(null)}><div className="w-full max-w-md overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] text-white shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4"><div><p className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">Parsel Hatırası</p><h2 className="mt-1 text-lg font-extrabold">{viewer.parcelNumber}</h2></div><button type="button" onClick={() => setViewer(null)} aria-label="Kapat" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-xl">×</button></div>{memoryLoading ? <div className="p-8 text-center text-sm text-white/55">Hatıra yükleniyor...</div> : publicMemory ? <div className="p-5">{photoUrl && <img src={photoUrl} alt={`${viewer.parcelNumber} parsel hatırası`} className="max-h-[55vh] w-full rounded-xl object-contain bg-black/20" loading="lazy" />}{publicMemory.note && <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/60">Not</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/80">{publicMemory.note}</p></div>}</div> : <div className="p-8 text-center text-sm text-white/60">Bu parselde henüz bir hatıra bulunmuyor.</div>}</div></div>;
  }

  const close = () => setMemory(null);
  const save = async () => {
    setSaving(true); setMessage(null); let uploadedPath: string | null = null;
    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession(); const user = sessionData.session?.user; if (!user) throw new Error("Oturum açmanız gerekiyor.");
      if (note.length > 500) throw new Error("Not en fazla 500 karakter olabilir."); if (!file && !photoPath) throw new Error("Lütfen bir fotoğraf seçin.");
      let nextPhotoPath = photoPath;
      if (file) { if (!file.type.startsWith("image/")) throw new Error("Lütfen bir fotoğraf seçin."); if (file.size > 5 * 1024 * 1024) throw new Error("Fotoğraf en fazla 5 MB olabilir."); const ext = (file.name.split(".").pop() || "jpg").toLowerCase(); if (!["jpg", "jpeg", "png", "webp"].includes(ext)) throw new Error("JPG, PNG veya WebP kullanın."); const path = `${user.id}/${memory!.parcelId}/memory-${Date.now()}.${ext}`; const { error: uploadError } = await supabaseBrowser.storage.from("parcel-memories").upload(path, file, { upsert: false, contentType: file.type, cacheControl: "3600" }); if (uploadError) throw new Error(`Fotoğraf yüklenemedi: ${uploadError.message}`); uploadedPath = path; nextPhotoPath = path; }
      const { error: saveError } = await supabaseBrowser.rpc("save_parcel_memory", { p_parcel_id: memory!.parcelId, p_photo_path: nextPhotoPath, p_note: note.trim() });
      if (saveError) { if (uploadedPath) await supabaseBrowser.storage.from("parcel-memories").remove([uploadedPath]); throw new Error(`Hatıra kaydedilemedi: ${saveError.message}`); }
      if (uploadedPath && photoPath && photoPath !== uploadedPath) await supabaseBrowser.storage.from("parcel-memories").remove([photoPath]);
      setPhotoPath(nextPhotoPath); setFile(null); setMessage("Parsel hatıran kaydedildi.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Hatıra kaydedilemedi."); } finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-md rounded-2xl border border-cyan-300/20 bg-[#071a2d] p-5 text-white shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">Parsel Hatırası</p><h2 className="mt-1 text-xl font-extrabold">{memory!.parcelNumber}</h2><p className="mt-1 text-xs text-white/50">Parseline bir fotoğraf ve kısa bir not bırak.</p></div><button type="button" onClick={close} aria-label="Kapat" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-xl">×</button></div><label className="mt-5 block cursor-pointer rounded-xl border border-dashed border-cyan-300/30 bg-white/[0.03] p-4"><span className="text-sm font-semibold">📷 Fotoğraf</span><span className="mt-1 block text-xs text-white/50">Her parsel için yalnızca 1 fotoğraf · Maks. 5 MB</span><input className="mt-3 block w-full text-xs" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label><label className="mt-4 block"><span className="text-sm font-semibold">📝 Not</span><textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} maxLength={500} rows={4} placeholder="Bu parsel için bir anı veya kısa not..." className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none placeholder:text-white/30 focus:border-cyan-300/50" /><span className="mt-1 block text-right text-[10px] text-white/40">{note.length}/500</span></label>{message && <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/70">{message}</p>}<button type="button" disabled={saving} onClick={save} className="mt-4 h-11 w-full rounded-xl bg-gradient-to-r from-cyan-300 to-cyan-100 font-extrabold text-[#071a2d] disabled:opacity-50">{saving ? "KAYDEDİLİYOR..." : "HATIRAYI KAYDET"}</button></div></div>;
}
