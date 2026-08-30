import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Heart, MapPin, ShoppingCart, X } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";
import { PARCEL_CART_EVENT, readParcelCart, removeParcelFromCart, writeParcelCart, type ParcelCartItem } from "@/lib/parcelCart";
import type { ParcelTier } from "@/types/parcel";

type City = { id: string; name: string; slug: string };
type MapParcel = { id: string; parcel_number: string; status: "available" | "reserved" | "sold"; tier: ParcelTier; tier_price: number; city_name: string; city_slug: string; grid_x: number | null; grid_y: number | null };
type OwnedParcelRow = { id: string; parcel_number: string; tier: ParcelTier; tier_price: number | null; price: number | null; cities: { name: string; slug: string }[] | null };
type MemoryNotice = { parcelId: string; parcelNumber: string };

const TIER_ORDER: ParcelTier[] = ["digital", "elite", "premium"];
const TIER_LIMITS: Record<ParcelTier, number> = { digital: 30, elite: 22, premium: 8 };
const VISIBLE_COUNT = 60;
const COLS = 12;
const ROWS = 5;
const MAP_IMAGE = "/images/cities/turkey-3d-map.png";
const GOLD = "255,211,92";
const SOLD_RED = "248,68,68";
const TIER_COLOR: Record<ParcelTier, string> = { digital: "34,211,238", elite: "168,85,247", premium: GOLD };
const PRICES: Record<ParcelTier, number> = { digital: 199, elite: 499, premium: 999 };
const TIER_LABEL: Record<ParcelTier, string> = { digital: "Dijital", elite: "Elit", premium: "Premium" };

function toCartItem(p: MapParcel): ParcelCartItem { return { id: p.id, parcel_number: p.parcel_number, city_name: p.city_name, tier: p.tier, tier_price: Number(p.tier_price ?? PRICES[p.tier]) }; }

async function loadPublicParcels(citySlug: string): Promise<MapParcel[]> {
  if (!supabaseBrowser) throw new Error("Supabase bağlantısı bulunamadı.");
  const { data, error } = await supabaseBrowser.rpc("parcels_in_view", { p_city_slug: citySlug, p_min_lat: -90, p_min_lng: -180, p_max_lat: 90, p_max_lng: 180 });
  if (error) throw error;
  return (data ?? []) as MapParcel[];
}

const GRID_TIERS: ParcelTier[] = (() => {
  const cells = Array.from({ length: VISIBLE_COUNT }, (_, index) => { const x = index % COLS; const y = Math.floor(index / COLS); const cx = (COLS - 1) / 2; const cy = (ROWS - 1) / 2; return { index, distance: (x - cx) ** 2 + (y - cy) ** 2 }; }).sort((a, b) => a.distance - b.distance);
  const result = Array<ParcelTier>(VISIBLE_COUNT); let offset = 0;
  for (const tier of ["premium", "elite", "digital"] as ParcelTier[]) { for (const cell of cells.slice(offset, offset + TIER_LIMITS[tier])) result[cell.index] = tier; offset += TIER_LIMITS[tier]; }
  return result;
})();

function buildSlots(rows: MapParcel[]): Array<MapParcel | null> { const result: Array<MapParcel | null> = Array.from({ length: VISIBLE_COUNT }, () => null); for (const tier of TIER_ORDER) { const tierRows = rows.filter((p) => p.tier === tier).slice(0, TIER_LIMITS[tier]); const indexes = GRID_TIERS.map((slotTier, index) => slotTier === tier ? index : -1).filter((index) => index >= 0); indexes.forEach((index, position) => { result[index] = tierRows[position] ?? null; }); } return result; }

export function CityParcelLivePage({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useAuth();
  const [city, setCity] = useState<City | null>(null); const [slots, setSlots] = useState<Array<MapParcel | null>>([]); const [selected, setSelected] = useState<ParcelCartItem[]>(() => readParcelCart()); const [purchasedParcel, setPurchasedParcel] = useState<ParcelCartItem | null>(null); const [memoryParcelIds, setMemoryParcelIds] = useState<Set<string>>(new Set()); const [memoryNotice, setMemoryNotice] = useState<MemoryNotice | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);

  useEffect(() => { const syncCart = () => setSelected(readParcelCart()); syncCart(); window.addEventListener(PARCEL_CART_EVENT, syncCart); window.addEventListener("storage", syncCart); return () => { window.removeEventListener(PARCEL_CART_EVENT, syncCart); window.removeEventListener("storage", syncCart); }; }, []);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (authLoading) return;
      setLoading(true); setError(null); setSlots([]); setCity(null); setPurchasedParcel(null); setMemoryParcelIds(new Set()); setMemoryNotice(null);
      try {
        if (!supabaseBrowser) throw new Error("Supabase bağlantısı bulunamadı.");
        const { data: cityData, error: cityError } = await supabaseBrowser.from("cities").select("id,name,slug").eq("slug", slug).eq("is_active", true).maybeSingle();
        if (cityError) throw cityError; if (!cityData) throw new Error("İl bulunamadı."); if (!alive) return; setCity(cityData as City);
        const existing = readParcelCart(); setSelected(existing);
        const params = new URLSearchParams(window.location.search); const targetId = params.get("parcels")?.split(",").map((s) => s.trim()).find(Boolean);
        let targetNumber: string | null = null;
        if (targetId && user) {
          const { data: owned, error: ownedError } = await supabaseBrowser.from("parcels").select("id,parcel_number,status,tier,tier_price,price,city_id,latitude,longitude,cities(name,slug)").eq("id", targetId).eq("owner_id", user.id).eq("status", "sold").maybeSingle();
          if (ownedError) throw ownedError;
          if (owned && alive) { const p = owned as OwnedParcelRow; const ownedCity = p.cities?.[0]; targetNumber = p.parcel_number; setPurchasedParcel({ id: p.id, parcel_number: p.parcel_number, city_name: ownedCity?.name ?? cityData.name, tier: p.tier, tier_price: Number(p.tier_price ?? p.price ?? PRICES[p.tier]) }); }
        }
        const rows = await loadPublicParcels(slug); if (!alive) return; setSlots(buildSlots(rows));
        const parcelIds = rows.map((p) => p.id); if (parcelIds.length) {
          const { data: publicMemories, error: publicMemoryError } = await supabaseBrowser.from("parcel_memories").select("parcel_id").eq("is_public", true).in("parcel_id", parcelIds);
          if (!publicMemoryError && alive) setMemoryParcelIds(new Set((publicMemories ?? []).map((row) => row.parcel_id as string)));
        }
        if (targetId) {
          const { data: targetMemory, error: targetMemoryError } = await supabaseBrowser.from("parcel_memories").select("is_public").eq("parcel_id", targetId).maybeSingle();
          if (!targetMemoryError && targetMemory && (targetMemory.is_public || !!purchasedParcel || targetId === purchasedParcel?.id)) {
            const targetRow = rows.find((p) => p.id === targetId); const number = targetNumber ?? targetRow?.parcel_number ?? targetId; if (alive) setMemoryNotice({ parcelId: targetId, parcelNumber: number });
          } else if (!targetMemoryError && targetMemory?.is_public) {
            const targetRow = rows.find((p) => p.id === targetId); if (alive) setMemoryNotice({ parcelId: targetId, parcelNumber: targetRow?.parcel_number ?? targetId });
          }
        }
      } catch (e) { if (alive) setError(e instanceof Error ? e.message : "Parseller yüklenemedi."); }
      finally { if (alive) setLoading(false); }
    }
    void load(); return () => { alive = false; };
  }, [slug, user, authLoading]);

  const selectedIds = useMemo(() => new Set(selected.map((p) => p.id)), [selected]); const total = selected.reduce((sum, p) => sum + Number(p.tier_price ?? 0), 0); const soldCount = slots.filter((p) => p?.status === "sold").length; const soldPercent = Math.round((soldCount / VISIBLE_COUNT) * 100);
  const toggleParcel = (parcel: MapParcel) => { if (parcel.status !== "available") return; if (selectedIds.has(parcel.id)) { const next = selected.filter((item) => item.id !== parcel.id); setSelected(next); removeParcelFromCart(parcel.id); return; } const item = toCartItem(parcel); const next = [...selected, item]; setSelected(next); writeParcelCart(next); };
  const buy = () => { if (authLoading || selected.length === 0) return; const ids = selected.map((p) => p.id).join(","); window.location.href = user ? `/parsel-satin-al?parcels=${ids}` : `/giris?redirect=${encodeURIComponent(`/parsel-satin-al?parcels=${ids}`)}`; };
  const openMemory = () => { if (memoryNotice) window.location.href = `/parsel-hatirasi?parcel=${encodeURIComponent(memoryNotice.parcelId)}`; };
  const legend = <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/70">{TIER_ORDER.map((tier) => <span key={tier} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: `rgb(${TIER_COLOR[tier]})`, boxShadow: `0 0 7px rgba(${TIER_COLOR[tier]},.75)` }} />{TIER_LABEL[tier]}</span>)}<span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_7px_rgba(248,68,68,.65)]" />Satıldı</span></div>;

  if (!city) return <main className="mx-auto max-w-4xl p-8 text-center text-white"><h1 className="text-2xl font-bold">{loading ? "Harita hazırlanıyor…" : "İl bulunamadı"}</h1>{error && <p className="mt-3 text-red-300">{error}</p>}<div className="mt-4 flex flex-wrap items-center justify-center gap-4"><a href="/turkiye-haritasi" className="inline-flex items-center gap-2 text-cyan-300"><ArrowLeft className="h-4 w-4" /> Türkiye haritasına dön</a>{legend}</div></main>;

  return <main className="mx-auto max-w-[1800px] px-3 py-4 text-white sm:px-5 lg:px-8">
    {memoryNotice && <div className="fixed right-4 top-20 z-[260] w-[min(92vw,360px)] rounded-2xl border border-orange-300/30 bg-[#071a2d]/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-md"><div className="flex items-start gap-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-300/10 text-lg">🧡</div><div className="min-w-0 flex-1"><p className="text-xs font-bold text-orange-100">Bu parselde bir hatıra var</p><p className="mt-1 text-[11px] text-white/55">{memoryNotice.parcelNumber} parselindeki hatırayı görmek ister misin?</p><div className="mt-3 flex gap-2"><button type="button" onClick={openMemory} className="rounded-lg bg-orange-300 px-3 py-2 text-[10px] font-extrabold text-slate-950">HATIRAYI GÖR</button><button type="button" onClick={() => setMemoryNotice(null)} aria-label="Hatıra bildirimini kapat" className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-semibold text-white/65">KAPAT</button></div></div><button type="button" onClick={() => setMemoryNotice(null)} aria-label="Hatıra bildirimini kapat" className="text-white/35 hover:text-white/70"><X className="h-4 w-4" /></button></div></div>}
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><a href="/turkiye-haritasi" className="inline-flex items-center gap-2 text-sm text-cyan-200/80"><ArrowLeft className="h-4 w-4" /> Türkiye haritasına dön</a>{legend}</div>
    <section className="overflow-hidden rounded-3xl border border-cyan-200/20 bg-slate-900/90 shadow-2xl"><div className="relative min-h-[380px] overflow-hidden bg-[#020914] sm:min-h-[650px]"><img src={MAP_IMAGE} alt="Türkiye gökyüzü parsel haritası" width="1600" height="1000" decoding="async" fetchPriority="high" className="pointer-events-none absolute inset-0 z-0 h-full w-full object-contain opacity-90" /><div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_45%,rgba(30,150,220,.22),transparent_42%),linear-gradient(145deg,rgba(2,7,17,.55),rgba(7,26,45,.18),rgba(1,4,11,.55)]" /><div className="pointer-events-auto absolute inset-4 z-[100] grid gap-1.5 sm:inset-8" style={{ gridTemplateColumns: `repeat(${COLS},minmax(0,1fr))`, gridTemplateRows: `repeat(${ROWS},minmax(0,1fr))`, touchAction: "manipulation", perspective: "1200px", transform: "perspective(1200px) rotateX(7deg)", transformOrigin: "50% 100%" }}>
      {Array.from({ length: VISIBLE_COUNT }, (_, i) => { const p = slots[i]; if (!p) return <div key={`empty-${i}`} className="pointer-events-none rounded-sm border border-white/5 bg-white/[0.01]" />; const sold = p.status === "sold"; const isSelected = selectedIds.has(p.id); const hasMemory = memoryParcelIds.has(p.id); const rgb = isSelected ? GOLD : sold ? SOLD_RED : TIER_COLOR[p.tier]; const borderRgb = isSelected ? "255,225,120" : rgb; const fill = isSelected ? "rgba(255,211,92,.48)" : sold ? "rgba(248,68,68,.30)" : `rgba(${rgb},.10)`; const glow = isSelected ? "0 0 16px rgba(255,211,92,1),0 0 38px rgba(255,211,92,.95),0 0 80px rgba(255,211,92,.45),inset 0 0 26px rgba(255,225,135,.95)" : sold ? "0 0 3px rgba(248,68,68,.9),0 0 12px rgba(248,68,68,.45),inset 0 0 5px rgba(248,68,68,.35)" : `0 0 2px rgba(255,255,255,.8),0 0 7px rgba(${rgb},.9),0 0 18px rgba(${rgb},.55),inset 0 0 3px rgba(${rgb},.7)`; return <button key={p.id} type="button" disabled={sold} onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleParcel(p); }} className="relative z-[110] block h-full w-full min-h-0 min-w-0 cursor-pointer select-none rounded-sm border p-0 transition-all duration-200 hover:brightness-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:hover:brightness-100" aria-pressed={isSelected} aria-label={`${p.parcel_number} parseli ${sold ? "satıldı" : isSelected ? "seçildi, kaldır" : "seç"}`} style={{ WebkitTapHighlightColor: "transparent", WebkitAppearance: "none", borderColor: `rgba(${borderRgb},1)`, backgroundColor: fill, boxShadow: glow, touchAction: "manipulation", pointerEvents: "auto", transform: isSelected ? "scale(1.018)" : undefined }}><span className="pointer-events-none absolute inset-[8%] rounded-sm" style={{ background: isSelected ? "linear-gradient(135deg,rgba(255,248,196,.42),rgba(255,193,7,.16))" : sold ? "linear-gradient(135deg,rgba(248,68,68,.22),rgba(127,29,29,.16))" : `linear-gradient(135deg,rgba(${rgb},.10),rgba(${rgb},.025))`, border: isSelected ? "1px solid rgba(255,244,176,.35)" : sold ? "1px solid rgba(248,68,68,.35)" : `1px solid rgba(${rgb},.28)` }} /><span className={`pointer-events-none absolute inset-0 flex items-center justify-center font-semibold ${isSelected ? "text-[7px] text-slate-950 sm:text-[10px]" : sold ? "text-[6px] text-red-100 sm:text-[9px]" : "text-[6px] text-white/90 sm:text-[9px]"}`}>{p.parcel_number}</span>{sold && <span className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-red-600/80 px-1 py-px text-[5px] font-black uppercase tracking-wide text-white sm:text-[6px]">SATILDI</span>}{hasMemory && <span className="pointer-events-none absolute -right-1.5 -top-1.5 z-[140] text-[10px] leading-none drop-shadow-[0_0_5px_rgba(255,166,90,.9)]">🧡</span>}{isSelected && <><span className="pointer-events-none absolute -top-2 left-1/2 z-[130] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white/90 bg-amber-300 shadow-[0_0_16px_rgba(255,211,92,1)] sm:-top-3 sm:h-5 sm:w-5"><MapPin className="h-full w-full p-[2px] text-slate-950" /></span><span className="pointer-events-none absolute left-1/2 top-1/2 z-[130] -translate-x-1/2 translate-y-[115%] whitespace-nowrap rounded-full border border-amber-100/80 bg-slate-950/90 px-2 py-0.5 text-[7px] font-bold uppercase tracking-[.12em] text-amber-100 shadow-[0_0_14px_rgba(255,211,92,.65)] sm:text-[8px]">MY PARSEL · {p.parcel_number}</span><span className="pointer-events-none absolute inset-0 animate-pulse rounded-sm" style={{ boxShadow: "inset 0 0 22px rgba(255,221,110,.95),0 0 34px rgba(255,211,92,.58)" }} /></>}</button>; })}
    </div><div className="pointer-events-none absolute bottom-5 left-5 z-20"><p className="text-xs uppercase tracking-[.2em] text-cyan-200/70">MySkyParcel · Türkiye Gökyüzü Parsel Haritası</p><h1 className="mt-1 text-3xl font-bold">{city.name}</h1><p className="mt-1 text-sm text-white/70">Dışta 30 Dijital · iç halkada 22 Elit · merkezde 8 Premium.</p></div></div>
      <div className="grid gap-3 p-4 sm:grid-cols-5"><div className="rounded-xl border border-cyan-300/15 bg-slate-950/60 p-3"><span className="text-xs text-white/45">Ekrandaki parsel</span><div className="text-xl font-bold text-cyan-200">{slots.filter(Boolean).length}</div></div><div className="rounded-xl border border-red-400/25 bg-red-950/20 p-3"><span className="text-xs text-red-200/60">Satılan</span><div className="text-xl font-bold text-red-400">{soldCount} / {VISIBLE_COUNT} <span className="text-sm">(%{soldPercent})</span></div></div><div className="rounded-xl border border-amber-300/15 bg-slate-950/60 p-3"><span className="text-xs text-white/45">Seçilen</span><div className="text-xl font-bold text-amber-200">{selected.length}</div></div><div className="rounded-xl border border-emerald-300/15 bg-slate-950/60 p-3"><span className="text-xs text-white/45">Veri durumu</span><div className="text-sm font-semibold text-emerald-300">{loading ? "Yükleniyor…" : "Canlı"}</div></div><button type="button" onClick={buy} disabled={!selected.length || authLoading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-40"><ShoppingCart className="h-4 w-4" /> Satın almaya devam et · {total.toLocaleString("tr-TR")} ₺</button></div>
      {(selected.length > 0 || purchasedParcel) && <div className="border-t border-cyan-200/10 p-4"><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold uppercase tracking-[.16em] text-cyan-200">Parsel listesi</h2><span className="text-xs text-white/45">{selected.length + (purchasedParcel ? 1 : 0)} kayıt</span></div><div className="grid gap-2">{purchasedParcel && <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-300/30 bg-emerald-950/20 p-3"><div className="min-w-0"><div className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 shrink-0 text-emerald-300" />{purchasedParcel.parcel_number}</div><p className="text-xs text-white/45">{purchasedParcel.city_name} · {TIER_LABEL[purchasedParcel.tier]}</p></div><span className="text-xs font-semibold text-emerald-300">Satın alındı</span></div>}{selected.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-amber-300/20 bg-slate-950/55 p-3"><div className="min-w-0"><div className="flex items-center gap-2 font-semibold"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: `rgb(${TIER_COLOR[item.tier]})` }} />{item.parcel_number}</div><p className="text-xs text-white/45">{item.city_name ?? city.name} · {TIER_LABEL[item.tier]}</p></div><div className="flex items-center gap-2"><span className="text-sm font-semibold text-amber-200">{item.tier_price.toLocaleString("tr-TR")} TL</span><button type="button" onClick={() => removeParcelFromCart(item.id)} aria-label={`${item.parcel_number} parselini kaldır`} className="rounded-full p-1.5 text-white/45 hover:bg-red-500/10 hover:text-red-300"><X className="h-4 w-4" /></button></div></div>)}</div></div>}
    </section>
  </main>;
}
