import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";
import { readParcelCart, writeParcelCart, removeParcelFromCart, type ParcelCartItem } from "@/lib/parcelCart";
import type { Parcel, ParcelTier } from "@/types/parcel";

type City = { id: string; name: string; slug: string };
type MapParcel = Parcel & { grid_x?: number | null; grid_y?: number | null };
const TIERS: ParcelTier[] = ["digital", "elite", "premium"];
const PAGE_SIZE = 20;
const VISIBLE_COUNT = 60;
const PRICES: Record<ParcelTier, number> = { digital: 199, elite: 499, premium: 999 };
const TIER_COLOR: Record<ParcelTier, string> = { digital: "85,201,255", elite: "183,124,255", premium: "246,196,83" };
const MAP_IMAGE = "/images/cities/turkey-3d-map.png";
const COLS = 12;
const ROWS = 5;

const cartItem = (p: MapParcel): ParcelCartItem => ({
  id: p.id,
  parcel_number: p.parcel_number,
  city_name: p.city_name,
  tier: p.tier,
  tier_price: Number(p.tier_price ?? PRICES[p.tier]),
});

export function CityParcelLivePage({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useAuth();
  const [city, setCity] = useState<City | null>(null);
  const [available, setAvailable] = useState<MapParcel[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(readParcelCart().map(p => p.id)));
  const [cursor, setCursor] = useState<Record<ParcelTier, number>>({ digital: 0, elite: 0, premium: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError(null); setAvailable([]);
      const existing = new Set(readParcelCart().map(p => p.id));
      setSelectedIds(existing);
      if (!supabaseBrowser) { setError("Supabase bağlantısı bulunamadı."); setLoading(false); return; }
      const cityResult = await supabaseBrowser.from("cities").select("id,name,slug").eq("slug", slug).eq("is_active", true).maybeSingle();
      if (cityResult.error) { if (active) { setError(cityResult.error.message); setLoading(false); } return; }
      if (!cityResult.data) { if (active) setLoading(false); return; }
      if (!active) return;
      setCity(cityResult.data as City);
      try {
        const groups = await Promise.all(TIERS.map(async tier => {
          const result = await supabaseBrowser.rpc("available_city_parcels", { p_city_slug: slug, p_tier: tier, p_offset: 0, p_limit: PAGE_SIZE });
          if (result.error) throw result.error;
          return (result.data ?? []) as MapParcel[];
        }));
        if (active) {
          const selectedNow = new Set(readParcelCart().map(p => p.id));
          setAvailable(groups.flat().filter(p => !selectedNow.has(p.id) && p.status === "available"));
          setCursor({ digital: PAGE_SIZE, elite: PAGE_SIZE, premium: PAGE_SIZE });
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Parseller yüklenemedi.");
      } finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [slug]);

  const selected = useMemo(() => readParcelCart().filter(p => selectedIds.has(p.id)), [selectedIds]);

  const visible = useMemo(() => {
    const selectedMap = new Map(selected.map(p => [p.id, p]));
    return [...selected, ...available.filter(p => !selectedMap.has(p.id))].slice(0, VISIBLE_COUNT) as MapParcel[];
  }, [available, selected]);

  const total = selected.reduce((sum, p) => sum + Number(p.tier_price), 0);

  const loadReplacement = async (tier: ParcelTier) => {
    if (!supabaseBrowser) return;
    const offset = cursor[tier];
    const result = await supabaseBrowser.rpc("available_city_parcels", { p_city_slug: slug, p_tier: tier, p_offset: offset, p_limit: 1 });
    if (result.error) throw result.error;
    const replacement = ((result.data ?? []) as MapParcel[]).find(p => p.status === "available" && !selectedIds.has(p.id));
    setCursor(prev => ({ ...prev, [tier]: prev[tier] + 1 }));
    if (replacement) setAvailable(prev => [...prev, replacement]);
  };

  const selectParcel = async (p: MapParcel) => {
    if (p.status !== "available" || selectedIds.has(p.id)) return;
    setSelectedIds(prev => new Set(prev).add(p.id));
    const cart = readParcelCart();
    if (!cart.some(x => x.id === p.id)) writeParcelCart([...cart, cartItem(p)]);
    setAvailable(prev => prev.filter(x => x.id !== p.id));
    setLoadingMore(true);
    try { await loadReplacement(p.tier); } catch (e) { setError(e instanceof Error ? e.message : "Yeni parsel getirilemedi."); }
    finally { setLoadingMore(false); }
  };

  const deselectParcel = (p: MapParcel) => {
    if (!selectedIds.has(p.id)) return;
    setSelectedIds(prev => { const next = new Set(prev); next.delete(p.id); return next; });
    removeParcelFromCart(p.id);
    setAvailable(prev => [p, ...prev.filter(x => x.id !== p.id)]);
  };

  const handleParcelPress = (p: MapParcel) => {
    if (p.status !== "available") return;
    if (selectedIds.has(p.id)) deselectParcel(p);
    else void selectParcel(p);
  };

  const buy = () => {
    if (authLoading || !selected.length) return;
    const ids = selected.map(p => p.id).join(",");
    window.location.href = user ? `/parsel-satin-al?parcels=${ids}` : `/giris?redirect=${encodeURIComponent(`/parsel-satin-al?parcels=${ids}`)}`;
  };

  if (!city) return <main className="mx-auto max-w-4xl p-8 text-center text-white"><h1 className="text-2xl font-bold">{loading ? "Harita hazırlanıyor…" : "İl bulunamadı"}</h1><a href="/turkiye-haritasi" className="mt-4 inline-flex items-center gap-2 text-cyan-300"><ArrowLeft className="h-4 w-4"/> Türkiye haritasına dön</a></main>;

  return <main className="mx-auto max-w-[1800px] px-3 py-4 sm:px-5 lg:px-8 text-white">
    <a href="/turkiye-haritasi" className="mb-4 inline-flex items-center gap-2 text-sm text-cyan-200/80"><ArrowLeft className="h-4 w-4"/> Türkiye haritası</a>
    <section className="overflow-hidden rounded-3xl border border-cyan-200/15 bg-slate-900/80 shadow-2xl">
      <div className="relative isolate min-h-[360px] overflow-hidden bg-[#020914] sm:min-h-[620px]">
        <img src={MAP_IMAGE} alt="Türkiye gökyüzü parsel haritası" className="pointer-events-none absolute inset-0 z-0 h-full w-full object-contain opacity-90" />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_45%,rgba(30,150,220,.22),transparent_42%),linear-gradient(145deg,rgba(2,7,17,.55),rgba(7,26,45,.18),rgba(1,4,11,.55)]" />
        <div className="absolute inset-4 z-20 grid gap-1 sm:inset-8" style={{ gridTemplateColumns: `repeat(${COLS},minmax(0,1fr))`, gridTemplateRows: `repeat(${ROWS},minmax(0,1fr))` }}>
          {Array.from({ length: VISIBLE_COUNT }, (_, i) => {
            const p = visible[i];
            if (!p) return <span key={i} className="rounded-sm border-2 border-cyan-200/15" aria-hidden />;
            const selectedParcel = selectedIds.has(p.id);
            const rgb = TIER_COLOR[p.tier];
            return <button
              key={p.id}
              type="button"
              aria-label={`${p.parcel_number} ${p.tier} parselini ${selectedParcel ? "kaldır" : "seç"}`}
              disabled={p.status !== "available"}
              onPointerUp={(event) => { event.preventDefault(); event.stopPropagation(); handleParcelPress(p); }}
              onClick={(event) => { event.preventDefault(); event.stopPropagation(); }}
              className="relative z-30 min-h-0 min-w-0 cursor-pointer touch-manipulation rounded-sm border-2 transition-all duration-150 active:scale-90 hover:brightness-150 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                borderColor: `rgba(${rgb},${selectedParcel ? "1" : ".98"})`,
                background: selectedParcel ? `rgba(${rgb},.45)` : `rgba(${rgb},.17)`,
                boxShadow: selectedParcel ? `0 0 10px rgba(${rgb},1), 0 0 26px rgba(${rgb},.85), inset 0 0 12px rgba(${rgb},.7)` : `0 0 5px rgba(${rgb},.45), inset 0 0 0 1px rgba(${rgb},.3)`,
                touchAction: "manipulation",
              }}
            >
              <span className="pointer-events-none absolute inset-[8%] rounded-sm" style={{ background: `rgba(${rgb},${selectedParcel ? ".45" : ".18"})` }} />
              {selectedParcel && <span className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-slate-950/90 px-1 py-0.5 text-[7px] font-semibold text-white shadow sm:text-[9px]">{p.parcel_number}</span>}
            </button>;
          })}
        </div>
        <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/5" />
        <div className="pointer-events-none absolute bottom-5 left-5 z-40"><p className="text-xs uppercase tracking-[.2em] text-cyan-200/70">MySkyParcel · Türkiye Gökyüzü Parsel Haritası</p><h1 className="mt-1 text-3xl font-bold">{city.name}</h1><p className="mt-1 text-sm text-white/65">Mavi: Dijital · Mor: Elit · Altın: Premium. Kareye dokunarak parseli seçin.</p></div>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-4">
        <div className="rounded-xl border border-cyan-300/15 bg-slate-950/60 p-3"><span className="text-xs text-white/45">Ekrandaki parsel</span><div className="text-xl font-bold text-cyan-200">{visible.length}</div></div>
        <div className="rounded-xl border border-cyan-300/15 bg-slate-950/60 p-3"><span className="text-xs text-white/45">Seçilen</span><div className="text-xl font-bold text-amber-200">{selected.length}</div></div>
        <div className="rounded-xl border border-cyan-300/15 bg-slate-950/60 p-3"><span className="text-xs text-white/45">Veri durumu</span><div className="text-sm font-semibold text-emerald-300">{loadingMore ? "Yeni parsel getiriliyor…" : loading ? "Yükleniyor…" : "Canlı"}</div></div>
        <button type="button" onClick={buy} disabled={!selected.length || authLoading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-40"><ShoppingCart className="h-4 w-4"/> Satın almaya devam et · {total.toLocaleString("tr-TR")} ₺</button>
      </div>
      {error && <div className="mx-4 mb-4 rounded-xl border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">Parsel verisi: {error}</div>}
    </section>
  </main>;
}
