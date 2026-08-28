import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";
import { readParcelCart, writeParcelCart, type ParcelCartItem } from "@/lib/parcelCart";
import type { ParcelTier } from "@/types/parcel";

type City = { id: string; name: string; slug: string };
type VisibleParcel = { id: string; parcel_number: string; status: "available" | "reserved" | "sold"; tier: ParcelTier; tier_price: number; city_name: string; city_slug: string; grid_x: number | null; grid_y: number | null };
type Slot = { x: number; y: number };

const TIER_COUNTS: Record<ParcelTier, number> = { digital: 30, elite: 22, premium: 8 };
const TIER_COLOR: Record<ParcelTier, string> = { digital: "85,201,255", elite: "183,124,255", premium: "246,196,83" };
const PRICE: Record<ParcelTier, number> = { digital: 199, elite: 499, premium: 999 };
const COLS = 40;
const ROWS = 25;
const SOLD_PER_CITY = 6;

function buildSlots(): Slot[] {
  const result: Slot[] = [];
  for (let y = 2; y < ROWS - 2; y += 3) for (let x = 1; x < COLS - 1; x += 3) result.push({ x, y });
  return result.slice(0, 60);
}
const VISIBLE_SLOTS = buildSlots();
const CENTER_X = (COLS - 1) / 2;
const CENTER_Y = (ROWS - 1) / 2;

const TIER_SLOTS: Record<ParcelTier, Slot[]> = (() => {
  const ranked = [...VISIBLE_SLOTS].sort((a, b) => {
    const da = (a.x - CENTER_X) ** 2 + (a.y - CENTER_Y) ** 2;
    const db = (b.x - CENTER_X) ** 2 + (b.y - CENTER_Y) ** 2;
    return da - db;
  });
  return { premium: ranked.slice(0, 8), elite: ranked.slice(8, 30), digital: ranked.slice(30, 60) };
})();

function cartItem(p: VisibleParcel): ParcelCartItem {
  return { id: p.id, parcel_number: p.parcel_number, city_name: p.city_name, tier: p.tier, tier_price: Number(p.tier_price ?? PRICE[p.tier]) };
}

function SkyBackground() {
  return <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#020914]"><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(42,150,220,.28),transparent_35%),radial-gradient(circle_at_75%_75%,rgba(126,70,210,.18),transparent_30%),linear-gradient(145deg,#020711,#071a2d_52%,#01040b)]" /><div className="absolute inset-0 opacity-65" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,.85) .7px,transparent .9px)", backgroundSize: "29px 29px" }} /><div className="absolute inset-0 opacity-60" style={{ backgroundImage: "linear-gradient(rgba(76,224,255,.24) 1px,transparent 1px),linear-gradient(90deg,rgba(76,224,255,.24) 1px,transparent 1px)", backgroundSize: "32px 32px" }} /></div>;
}

function ParcelLines({ parcels, selectedIds, onToggle }: { parcels: VisibleParcel[]; selectedIds: Set<string>; onToggle: (p: VisibleParcel) => void }) {
  const byTier = useMemo(() => ({ digital: parcels.filter(p => p.tier === "digital"), elite: parcels.filter(p => p.tier === "elite"), premium: parcels.filter(p => p.tier === "premium") }), [parcels]);
  const slotParcel = useMemo(() => {
    const map = new Map<string, VisibleParcel>();
    (Object.keys(TIER_SLOTS) as ParcelTier[]).forEach(tier => TIER_SLOTS[tier].forEach((slot, index) => { const parcel = byTier[tier][index]; if (parcel) map.set(`${slot.x}:${slot.y}`, parcel); }));
    return map;
  }, [byTier]);
  return <div className="absolute inset-0 z-20 grid touch-manipulation" style={{ gridTemplateColumns: `repeat(${COLS},minmax(0,1fr))`, gridTemplateRows: `repeat(${ROWS},minmax(0,1fr))` }} aria-label="Gökyüzü parsel çizgileri">
    {VISIBLE_SLOTS.map(slot => { const p = slotParcel.get(`${slot.x}:${slot.y}`); if (!p) return <span key={`${slot.x}:${slot.y}`} className="border border-cyan-200/10" aria-hidden />; const selected = selectedIds.has(p.id); const rgb = TIER_COLOR[p.tier]; const sold = p.status === "sold"; return <button key={p.id} type="button" disabled={sold || p.status === "reserved"} aria-label={`${p.parcel_number} ${p.tier}${sold ? " · Satıldı" : ""}`} title={`${p.parcel_number} · ${p.tier}${sold ? " · Satıldı" : ""}`} onClick={e => { e.stopPropagation(); onToggle(p); }} className="relative min-h-0 min-w-0 border transition-[background,border,box-shadow] duration-100 disabled:cursor-not-allowed" style={{ borderColor: sold ? "rgba(248,113,113,.92)" : selected ? "rgba(255,244,176,.98)" : `rgba(${rgb},.55)`, background: sold ? "rgba(239,68,68,.20)" : selected ? "rgba(255,211,92,.48)" : `rgba(${rgb},.055)`, boxShadow: sold ? "inset 0 0 0 1px rgba(248,113,113,.32),0 0 7px rgba(239,68,68,.24)" : selected ? "inset 0 0 0 1px rgba(255,244,176,.95),0 0 12px rgba(255,211,92,.75)" : `inset 0 0 0 1px rgba(${rgb},.08)` }}>{sold && <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[7px] font-bold uppercase tracking-wide text-red-200">SATILDI</span>}{selected && <span className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-slate-950/95 px-1.5 py-0.5 text-[8px] font-semibold text-white shadow-lg">{p.parcel_number}</span>}</button>; })}
  </div>;
}

export function SkyParcelCityMapPage({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useAuth(); const [city, setCity] = useState<City | null>(null); const [parcels, setParcels] = useState<VisibleParcel[]>([]); const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(readParcelCart().map(p => p.id))); const [loading, setLoading] = useState(true);
  useEffect(() => { let alive = true; const loadCity = async () => { if (!supabaseBrowser) return; const { data } = await supabaseBrowser.from("cities").select("id,name,slug").eq("slug", slug).eq("is_active", true).maybeSingle(); if (alive) setCity(data as City | null); }; void loadCity(); return () => { alive = false; }; }, [slug]);
  const loadWindow = async (citySlug: string, tier: ParcelTier, limit: number) => { if (!supabaseBrowser) return [] as VisibleParcel[]; const { data, error } = await supabaseBrowser.rpc("available_city_parcels", { p_city_slug: citySlug, p_tier: tier, p_offset: 0, p_limit: limit }); if (error) throw error; return (data ?? []) as VisibleParcel[]; };
  useEffect(() => { if (!city) return; let alive = true; setLoading(true); Promise.all((Object.keys(TIER_COUNTS) as ParcelTier[]).map(t => loadWindow(city.slug, t, TIER_COUNTS[t]))).then(groups => { if (!alive) return; const all = groups.flat(); const sold = all.slice(0, SOLD_PER_CITY).map(p => ({ ...p, status: "sold" as const })); const rest = all.slice(SOLD_PER_CITY); setParcels([...sold, ...rest]); setLoading(false); }).catch(() => { if (alive) setLoading(false); }); return () => { alive = false; }; }, [city?.slug]);
  const visible = useMemo(() => parcels.slice(0, VISIBLE_SLOTS.length), [parcels]);
  const selectParcel = (p: VisibleParcel) => { if (p.status !== "available") return; setSelectedIds(prev => { const next = new Set(prev); const cart = readParcelCart(); if (next.has(p.id)) { next.delete(p.id); writeParcelCart(cart.filter(item => item.id !== p.id)); } else { next.add(p.id); if (!cart.some(x => x.id === p.id)) writeParcelCart([...cart, cartItem(p)]); } return next; }); };
  const selected = useMemo(() => readParcelCart().filter(p => selectedIds.has(p.id)), [selectedIds]); const total = selected.reduce((sum, p) => sum + Number(p.tier_price), 0); const soldCount = visible.filter(p => p.status === "sold").length; const buy = () => { if (authLoading || !selected.length) return; const ids = selected.map(p => p.id).join(","); window.location.href = user ? `/parsel-satin-al?parcels=${ids}` : `/giris?redirect=${encodeURIComponent(`/parsel-satin-al?parcels=${ids}`)}`; };
  if (!city) return <main className="mx-auto max-w-4xl p-8 text-center text-white"><h1 className="text-2xl font-bold">{loading ? "Gökyüzü haritası hazırlanıyor…" : "İl bulunamadı"}</h1><a href="/turkiye-haritasi" className="mt-4 inline-flex items-center gap-2 text-cyan-300"><ArrowLeft className="h-4 w-4"/> Türkiye haritasına dön</a></main>;
  return <main className="mx-auto max-w-[1800px] px-3 py-4 sm:px-5 lg:px-8"><div className="mb-4"><a href="/turkiye-haritasi" className="inline-flex items-center gap-2 text-sm text-cyan-200/80"><ArrowLeft className="h-4 w-4"/> Türkiye haritası</a></div><section className="overflow-hidden rounded-3xl border border-cyan-200/15 bg-slate-900/70 shadow-2xl"><div className="relative min-h-[430px] overflow-hidden bg-[#020914] sm:min-h-[620px]"><SkyBackground /><ParcelLines parcels={visible} selectedIds={selectedIds} onToggle={selectParcel} /><div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/10" /><div className="pointer-events-none absolute bottom-5 left-5 z-40"><p className="text-xs uppercase tracking-[.2em] text-cyan-200/70">MySkyParcel · Gökyüzü Parsel Haritası</p><h1 className="mt-1 text-3xl font-bold">{city.name}</h1><p className="mt-1 text-sm text-white/60">30 Dijital · 22 Elit · 8 Premium · <span className="text-red-300">{soldCount} satıldı</span></p></div></div><div className="grid gap-3 p-3 sm:grid-cols-3 sm:p-5"><div className="rounded-xl border border-cyan-300/15 bg-slate-950/55 p-3"><p className="text-xs text-white/45">Ekrandaki parsel</p><p className="mt-1 text-xl font-semibold text-cyan-200">{visible.length}</p></div><div className="rounded-xl border border-cyan-300/15 bg-slate-950/55 p-3"><p className="text-xs text-white/45">Satılan parsel</p><p className="mt-1 text-xl font-semibold text-red-300">{soldCount} / 60</p></div><button type="button" onClick={buy} disabled={!selected.length || authLoading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"><ShoppingCart className="h-4 w-4"/> Satın almaya devam et · {total.toLocaleString("tr-TR")} ₺</button></div><div className="flex flex-wrap gap-3 border-t border-white/10 px-3 py-3 text-xs text-white/55 sm:px-5"><span>● Dijital 30</span><span>● Elit 22</span><span>● Premium 8</span><span className="text-red-300">● Satıldı {soldCount}</span><span>{loading ? "Parseller yükleniyor…" : "Hazır"}</span></div></section></main>;
}
