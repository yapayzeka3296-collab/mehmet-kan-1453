import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";
import { readParcelCart, writeParcelCart, removeParcelFromCart } from "@/lib/parcelCart";
import type { Parcel, ParcelTier } from "@/types/parcel";

type City = { id: string; name: string; slug: string };
type MapParcel = Parcel & { grid_x?: number | null; grid_y?: number | null };
const TIERS: ParcelTier[] = ["digital", "elite", "premium"];
const LIMITS: Record<ParcelTier, number> = { digital: 500, elite: 300, premium: 200 };
const PRICES: Record<ParcelTier, number> = { digital: 199, elite: 499, premium: 999 };
const COLS = 40;
const ROWS = 25;

export function CityParcelLivePage({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useAuth();
  const [city, setCity] = useState<City | null>(null);
  const [parcels, setParcels] = useState<MapParcel[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(readParcelCart().map(p => p.id)));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError(null); setParcels([]);
      if (!supabaseBrowser) { setError("Supabase bağlantısı bulunamadı."); setLoading(false); return; }
      const cityResult = await supabaseBrowser.from("cities").select("id,name,slug").eq("slug", slug).eq("is_active", true).maybeSingle();
      if (cityResult.error) { if (active) { setError(cityResult.error.message); setLoading(false); } return; }
      if (!cityResult.data) { if (active) { setCity(null); setLoading(false); } return; }
      if (!active) return;
      setCity(cityResult.data as City);
      try {
        const groups = await Promise.all(TIERS.map(async tier => {
          const result = await supabaseBrowser.rpc("available_city_parcels", { p_city_slug: slug, p_tier: tier, p_offset: 0, p_limit: LIMITS[tier] });
          if (result.error) throw result.error;
          return (result.data ?? []) as MapParcel[];
        }));
        if (active) setParcels(groups.flat());
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Parseller yüklenemedi.");
      } finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [slug]);

  const byGrid = useMemo(() => {
    const map = new Map<string, MapParcel>();
    parcels.forEach(p => { if (p.grid_x != null && p.grid_y != null) map.set(`${p.grid_x}:${p.grid_y}`, p); });
    return map;
  }, [parcels]);
  const selected = useMemo(() => parcels.filter(p => selectedIds.has(p.id)), [parcels, selectedIds]);
  const total = selected.reduce((s, p) => s + Number(p.tier_price ?? PRICES[p.tier]), 0);

  const toggle = (p: MapParcel) => {
    if (p.status === "sold") return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(p.id)) { next.delete(p.id); removeParcelFromCart(p.id); }
      else { next.add(p.id); const cart = readParcelCart(); if (!cart.some(x => x.id === p.id)) writeParcelCart([...cart, { id: p.id, parcel_number: p.parcel_number, city_name: p.city_name, tier: p.tier, tier_price: Number(p.tier_price ?? PRICES[p.tier]) }]); }
      return next;
    });
  };
  const buy = () => { if (authLoading || !selected.length) return; const ids = selected.map(p => p.id).join(","); window.location.href = user ? `/parsel-satin-al?parcels=${ids}` : `/giris?redirect=${encodeURIComponent(`/parsel-satin-al?parcels=${ids}`)}`; };

  if (!city) return <main className="mx-auto max-w-4xl p-8 text-center text-white"><h1 className="text-2xl font-bold">{loading ? "Gökyüzü haritası hazırlanıyor…" : "İl bulunamadı"}</h1><a href="/turkiye-haritasi" className="mt-4 inline-flex items-center gap-2 text-cyan-300"><ArrowLeft className="h-4 w-4"/> Türkiye haritasına dön</a></main>;

  const imagePath = `/images/cities/${city.slug}.webp`;
  return <main className="mx-auto max-w-[1800px] px-3 py-4 sm:px-5 lg:px-8 text-white">
    <a href="/turkiye-haritasi" className="mb-4 inline-flex items-center gap-2 text-sm text-cyan-200/80"><ArrowLeft className="h-4 w-4"/> Türkiye haritası</a>
    <section className="overflow-hidden rounded-3xl border border-cyan-200/15 bg-slate-900/80 shadow-2xl">
      <div className="relative min-h-[360px] overflow-hidden bg-[#020914] sm:min-h-[620px]">
        <img src={imagePath} alt={`${city.name} haritası`} className="absolute inset-0 h-full w-full object-cover opacity-80" onError={e => { e.currentTarget.style.display = "none"; }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(30,150,220,.28),transparent_38%),linear-gradient(145deg,#020711,#071a2d_55%,#01040b)]" />
        <div className="absolute inset-0 z-10 grid" style={{ gridTemplateColumns: `repeat(${COLS},minmax(0,1fr))`, gridTemplateRows: `repeat(${ROWS},minmax(0,1fr))` }}>
          {Array.from({ length: COLS * ROWS }, (_, i) => {
            const x = i % COLS, y = Math.floor(i / COLS), p = byGrid.get(`${x}:${y}`);
            if (!p) return <span key={i} className="border border-cyan-200/5" />;
            const rgb = p.tier === "digital" ? "85,201,255" : p.tier === "elite" ? "183,124,255" : "246,196,83";
            const selected = selectedIds.has(p.id);
            return <button key={p.id} type="button" disabled={p.status === "sold"} onClick={() => toggle(p)} title={`${p.parcel_number} · ${p.tier}`} className="relative min-h-0 min-w-0 border disabled:cursor-not-allowed" style={{ borderColor: selected ? "rgba(255,244,176,.98)" : `rgba(${rgb},.65)`, background: selected ? "rgba(255,211,92,.55)" : `rgba(${rgb},.09)` }}><span className="pointer-events-none absolute inset-[12%] rounded-sm" style={{ background: selected ? "rgba(255,211,92,.5)" : `rgba(${rgb},.12)` }} /></button>;
          })}
        </div>
        <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/10" />
        <div className="pointer-events-none absolute bottom-5 left-5 z-30"><p className="text-xs uppercase tracking-[.2em] text-cyan-200/70">MySkyParcel · İl Parsel Haritası</p><h1 className="mt-1 text-3xl font-bold">{city.name}</h1><p className="mt-1 text-sm text-white/65">Parselleri seçmek için karelere dokunun.</p></div>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-3"><div className="rounded-xl border border-cyan-300/15 bg-slate-950/60 p-3"><span className="text-xs text-white/45">Parseller</span><div className="text-xl font-bold text-cyan-200">{parcels.length}</div></div><div className="rounded-xl border border-cyan-300/15 bg-slate-950/60 p-3"><span className="text-xs text-white/45">Seçilen</span><div className="text-xl font-bold text-amber-200">{selected.length}</div></div><button type="button" onClick={buy} disabled={!selected.length || authLoading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-40"><ShoppingCart className="h-4 w-4"/> Satın almaya devam et · {total.toLocaleString("tr-TR")} ₺</button></div>
      {error && <div className="mx-4 mb-4 rounded-xl border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">Parsel verisi yüklenemedi: {error}</div>}
      {loading && <div className="px-4 pb-4 text-sm text-white/50">Parseller yükleniyor…</div>}
    </section>
  </main>;
}
