import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type MemoryEvent = { parcelId: string; parcelNumber: string };
type Props = { parcel: { id: string; parcel_number: string } | null };

export function ParcelMemoryEditor({ parcel }: Props) {
  const [memory, setMemory] = useState<MemoryEvent | null>(null);
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!parcel) return;
    let observer: MutationObserver | null = null;
    let cancelled = false;
    const install = async () => {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const user = sessionData.session?.user;
      if (!user || cancelled) return;
      const { data: ownerRow } = await supabaseBrowser.from("parcels").select("owner_id").eq("id", parcel.id).maybeSingle();
      if (cancelled || ownerRow?.owner_id !== user.id) return;
      const addButton = () => {
        const purchase = document.querySelector("[data-msp-purchase]") as HTMLElement | null;
        if (!purchase || document.querySelector("[data-msp-memory]") || !purchase.parentElement) return;
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("data-msp-memory", "1");
        button.textContent = "📷  PARSEL HATIRASI";
        button.style.cssText = "margin-top:7px;width:100%;height:32px;border:1px solid rgba(88,230,255,.35);border-radius:8px;background:rgba(88,230,255,.08);color:#bdefff;font-size:10px;font-weight:800;letter-spacing:.04em;cursor:pointer";
        button.addEventListener("click", () => window.dispatchEvent(new CustomEvent<MemoryEvent>("msp:memory", { detail: { parcelId: parcel.id, parcelNumber: parcel.parcel_number } })));
        purchase.parentElement.appendChild(button);
      };
      addButton();
      observer = new MutationObserver(addButton);
      observer.observe(document.body, { childList: true, subtree: true });
    };
    void install();
    return () => { cancelled = true; observer?.disconnect(); };
  }, [parcel]);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<MemoryEvent>).detail;
      setMemory(detail);
      setMessage(null);
    };
    window.addEventListener("msp:memory", onOpen);
    return () => window.removeEventListener("msp:memory", onOpen);
  }, []);

  useEffect(() => {
    if (!memory) return;
    let cancelled = false;
    (async () => {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;
      const { data } = await supabaseBrowser.from("parcel_memories").select("photo_path,note").eq("parcel_id", memory.parcelId).eq("user_id", user.id).maybeSingle();
      if (!cancelled) { setPhotoPath(data?.photo_path ?? null); setNote(data?.note ?? ""); setFile(null); }
    })();
    return () => { cancelled = true; };
  }, [memory]);

  if (!memory) return null;
  const close = () => setMemory(null);

  const save = async () => {
    setSaving(true); setMessage(null);
    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) throw new Error("Oturum açmanız gerekiyor.");
      if (note.length > 500) throw new Error("Not en fazla 500 karakter olabilir.");
      let nextPhotoPath = photoPath;
      if (file) {
        if (!file.type.startsWith("image/")) throw new Error("Lütfen bir fotoğraf seçin.");
        if (file.size > 5 * 1024 * 1024) throw new Error("Fotoğraf en fazla 5 MB olabilir.");
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        if (!["jpg", "jpeg", "png", "webp"].includes(ext)) throw new Error("JPG, PNG veya WebP kullanın.");
        const path = `${user.id}/${memory.parcelId}/memory.${ext}`;
        const { error: uploadError } = await supabaseBrowser.storage.from("parcel-memories").upload(path, file, { upsert: true, contentType: file.type, cacheControl: "3600" });
        if (uploadError) throw uploadError;
        nextPhotoPath = path;
      }
      const { error } = await supabaseBrowser.from("parcel_memories").upsert({ parcel_id: memory.parcelId, user_id: user.id, photo_path: nextPhotoPath ?? "note-only", note: note.trim() || null, updated_at: new Date().toISOString() });
      if (error) throw error;
      setPhotoPath(nextPhotoPath); setFile(null); setMessage("Parsel hatıran kaydedildi.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Kaydetme sırasında hata oluştu."); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-cyan-300/20 bg-[#071a2d] p-5 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">Parsel Hatırası</p><h2 className="mt-1 text-xl font-extrabold">{memory.parcelNumber}</h2><p className="mt-1 text-xs text-white/50">Parseline bir fotoğraf ve kısa bir not bırak.</p></div><button type="button" onClick={close} aria-label="Kapat" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-xl text-white hover:bg-white/15">×</button></div>
        <label className="mt-5 block cursor-pointer rounded-xl border border-dashed border-cyan-300/30 bg-white/[0.03] p-4"><span className="text-sm font-semibold">📷 Fotoğraf</span><span className="mt-1 block text-xs text-white/50">Her parsel için yalnızca 1 fotoğraf · Maks. 5 MB</span><input className="mt-3 block w-full text-xs" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
        <label className="mt-4 block"><span className="text-sm font-semibold">📝 Not</span><textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} maxLength={500} rows={4} placeholder="Bu parsel için bir anı veya kısa not..." className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none placeholder:text-white/30 focus:border-cyan-300/50" /><span className="mt-1 block text-right text-[10px] text-white/40">{note.length}/500</span></label>
        {message && <p className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-xs text-white/70">{message}</p>}
        <button type="button" disabled={saving} onClick={save} className="mt-4 h-11 w-full rounded-xl bg-gradient-to-r from-cyan-300 to-cyan-100 font-extrabold text-[#071a2d] disabled:opacity-50">{saving ? "KAYDEDİLİYOR..." : "HATIRAYI KAYDET"}</button>
      </div>
    </div>
  );
}
