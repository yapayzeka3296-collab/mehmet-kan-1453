import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, ShoppingCart, X } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";
import { readParcelCart, writeParcelCart, removeParcelFromCart, type ParcelCartItem } from "@/lib/parcelCart";
import type { ParcelTier } from "@/types/parcel";

type City = { id: string; name: string; slug: string };
type MapParcel = { id: string; parcel_number: string; status: "available" | "reserved" | "sold"; tier: ParcelTier; tier_price: number; city_name: string; city_slug: string; grid_x: number | null; grid_y: number | null };
type Slot = { parcel: MapParcel; tier: ParcelTier };
type OwnedParcelRow = { id: string; parcel_number: string; tier: ParcelTier; tier_price: number | null; price: number | null; cities: { name: string; slug: string }[] | null };

const TIERS: ParcelTier[] = ["digital", "elite", "premium"];
const PER_TIER = 20;
const VISIBLE_COUNT = 60;
const COLS = 12;
const ROWS = 5;
const MAP_IMAGE = "/images/cities/turkey-3d-map.png";
const TIER_COLOR: Record<ParcelTier, string> = { digital: "85,201,255", elite: "183,124,255", premium: "246,196,83" };
const PRICES: Record<ParcelTier, number> = { digital: 199, elite: 499, premium: 999 };

function toCartItem(p: MapParcel): ParcelCartItem {
  return { id: p.id, parcel_number: p.parcel_number, city_name: p.city_name, tier: p.tier, tier_price: Number(p.tier_price ?? PRICES[p.tier]) };
}

async function loadPublicParcels(citySlug: string): Promise<MapParcel[]> {
  if (!supabaseBrowser) throw new Error("Supabase bağlantısı bulunamadı.");
  const { data, error } = await supabaseBrowser.rpc("parcels_in_view", { p_city_slug: citySlug, p_min_lat: -90, p_min_lng: -180, p_max_lat: 90, p_max_lng: 180 });
  if (error) throw error;
  return ((data ?? []) as MapParcel[]).filter(p => p.status === "available");
}

export function CityParcelLivePage({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useAuth();
  const [city, setCity] = useState<City | null>(null);
  const [slots, setSlots] = useState<Array<Slot | null>>([]);
  const [selected, setSelected] = useState<ParcelCartItem[]>(() => readParcelCart());
  const [purchasedParcel, setPurchasedParcel] = useState<ParcelCartItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      if (authLoading) return;
      setLoading(true); setError(null); setSlots([]); setCity(null); setPurchasedParcel(null);
      try {
        if (!supabaseBrowser) throw new Error("Supabase bağlantısı bulunamadı.");
        const { data: cityData, error: cityError } = await supabaseBrowser.from("cities").select("id,name,slug").eq("slug", slug).eq("is_active", true).maybeSingle();
        if (cityError) throw cityError;
        if (!cityData) throw new Error("İl bulunamadı.");
        if (!alive) return;
        setCity(cityData as City);

        const existing = readParcelCart();
        setSelected(existing);
        const selectedIds = new Set(existing.map(p => p.id));

        const params = new URLSearchParams(window.location.search);
        const targetId = params.get("parcels")?.split(",").map(s => s.trim()).find(Boolean);
        if (targetId && user) {
          const { data: owned, error: ownedError } = await supabaseBrowser.from("parcels")
            .select("id,parcel_number,status,tier,tier_price,price,city_id,latitude,longitude,cities(name,slug)")
            .eq("id", targetId).eq("owner_id", user.id).eq("status", "sold").maybeSingle();
          if (ownedError) throw ownedError;
          if (owned && alive) {
            const p = owned as OwnedParcelRow;
            const ownedCity = p.cities?.[0];
            setPurchasedParcel({ id: p.id, parcel_number: p.parcel_number, city_name: ownedCity?.name ?? cityData.name, tier: p.tier, tier_price: Number(p.tier_price ?? p.price ?? PRICES[p.tier]) });
          }
        }

        const rows = (await loadPublicParcels(slug)).filter(p => !selectedIds.has(p.id));
        const next: Array<Slot | null> = [];
        for (const tier of TIERS) {
          const tierRows = rows.filter(p => p.tier === tier).slice(0, PER_TIER);
          for (const parcel of tierRows) next.push({ parcel, tier });
          while (next.length < (TIERS.indexOf(tier) + 1) * PER_TIER) next.push(null);
        }
        if (alive) setSlots(next.slice(0, VISIBLE_COUNT));
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : "Parseller yüklenemedi.");
      } finally { if (alive) setLoading(false); }
    }
    void load();
    return () => { alive = false; };
  }, [slug, user, authLoading]);

  const handleSelect = (slotIndex: number) => {
    const slot = slots[slotIndex];
    if (!slot || slot.parcel.status !== "available" || busy) return;
    const item = toCartItem(slot.parcel);
    if (selected.some(x => x.id === item.id)) return;
    const next = [...selected, item];
    setSelected(next); writeParcelCart(next);
  };

  const handleDeselect = (item: ParcelCartItem) => {
    const next = selected.filter(x => x.id !== item.id);
    setSelected(next); removeParcelFromCart(item.id);
  };

  const activateSlot = (slotIndex: number) => {
    const slot = slots[slotIndex];
    if (!slot || busy) return;
    if (selected.some(x => x.id === slot.parcel.id)) handleDeselect(toCartItem(slot.parcel));
    else handleSelect(slotIndex);
  };

  const selectedIds = new Set(selected.map(p => p.id));
  const total = selected.reduce((sum, p) => sum + Number(p.tier_price ?? 0), 0);
  const buy = () => {
    if (authLoading || selected.length === 0) return;
    const ids = selected.map(p => p.id).join(",");
    window.location.href = user ? `/parsel-satin-al?parcels=${ids}` : `/giris?redirect=${encodeURIComponent(`/parsel-satin-al?parcels=${ids}`)}`;
  };

  if (!city) return <main className="mx-auto max-w-4xl p-8 text-center text-white"><h1 className="text-2xl font-bold">{loading ? "Harita hazırlanıyor…" : "İl bulunamadı"}</h1>{error && <p className="mt-3 text-red-300">{error}</p>}<a href="/turkiye-haritasi" className="mt-4 inline-flex items-center gap-2 text-cyan-300"><ArrowLeft className="h-4 w-4" /> Türkiye haritasına dön</a></main>;

  return <main className="mx-auto max-w-[1800px] px-3 py-4 text-white sm:px-5 lg:px-8">
    <a href="/turkiye-haritasi" className="mb-4 inline-flex items-center gap-2 text-sm text-cyan-200/80"><ArrowLeft className="h-4 w-4" /> Türkiye haritası</a>
    <section className="overflow-hidden rounded-3xl border border-cyan-200/20 bg-slate-900/90 shadow-2xl">
      <div className="relative min-h-[380px] overflow-hidden bg-[#020914] sm:min-h-[650px]">
        <img src={MAP_IMAGE} alt="Türkiye gökyüzü parsel haritası" className="pointer-events-none absolute inset-0 z-0 h-full w-full object-contain opacity-90" />
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_45%,rgba(30,150,220,.22),transparent_42%),linear-gradient(145deg,rgba(2,7,17,.55),rgba(7,26,45,.18),rgba(1,4,11,.55)]" />
        <div className="pointer-events-auto absolute inset-4 z-[100] grid gap-1.5 sm:inset-8" style={{ gridTemplateColumns: `repeat(${COLS},minmax(0,1fr))`, gridTemplateRows: `repeat(${ROWS},minmax(0,1fr))`, touchAction: "manipulation" }}>
          {Array.from({ length: VISIBLE_COUNT }, (_, i) => {
            const slot = slots[i];
            if (!slot) return <div key={`empty-${i}`} className="pointer-events-none rounded-sm border-[3px] border-cyan-100/45 bg-cyan-100/[0.04]" />;
            const p = slot.parcel; const isSelected = selectedIds.has(p.id); const rgb = TIER_COLOR[p.tier];
            const borderRgb = isSelected ? "255,214,92" : rgb;
            const fill = isSelected ? "rgba(255,211,92,.48)" : `rgba(${rgb},.20)`;
            const glow = isSelected ? "0 0 14px rgba(255,211,92,1),0 0 34px rgba(255,211,92,.95),0 0 70px rgba(255,211,92,.45),inset 0 0 24px rgba(255,225,135,.95)" : `0 0 7px rgba(${rgb},.7),inset 0 0 0 1px rgba(${rgb},.5)`;
            return <button key={p.id} type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); activateSlot(i); }} className="relative z-[110] block h-full w-full min-h-0 min-w-0 cursor-pointer select-none rounded-sm border-[3px] p-0 transition-all duration-200 hover:brightness-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white" aria-pressed={isSelected} aria-label={`${p.parcel_number} ${p.tier} parseli ${isSelected ? "seçildi, kaldır" : "seç"}`} style={{ WebkitTapHighlightColor: "transparent", WebkitAppearance: "none", borderColor: `rgba(${borderRgb},1)`, backgroundColor: fill, boxShadow: glow, touchAction: "manipulation", pointerEvents: "auto", transform: isSelected ? "scale(1.015)" : undefined }}>
              <span className="pointer-events-none absolute inset-[8%] rounded-sm" style={{ background: isSelected ? "linear-gradient(135deg,rgba(255,244,176,.35),rgba(255,193,7,.16))" : `rgba(${rgb},.18)`, border: isSelected ? "1px solid rgba(255,244,176,.7)" : undefined }} />
              <span className={`pointer-events-none absolute inset-0 flex items-center justify-center font-semibold ${isSelected ? "text-[7px] text-slate-950 sm:text-[10px]" : "text-[6px] text-white/80 sm:text-[9px]"}`}>{p.parcel_number}</span>
              {isSelected && <>
                <span className="pointer-events-none absolute -top-2 left-1/2 z-[130] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white/90 bg-amber-300 shadow-[0_0_14px_rgba(255,211,92,1)] sm:-top-3 sm:h-5 sm:w-5"><MapPin className="h-full w-full p-[2px] text-slate-950" /></span>
                <span className="pointer-events-none absolute left-1/2 top-1/2 z-[130] -translate-x-1/2 translate-y-[115%] whitespace-nowrap rounded-full border border-amber-100/80 bg-slate-950/90 px-2 py-0.5 text-[7px] font-bold uppercase tracking-[.12em] text-amber-100 shadow-[0_0_14px_rgba(255,211,92,.65)] sm:text-[8px]">MY PARSEL · {p.parcel_number}</span>
                <span className="pointer-events-none absolute inset-0 animate-pulse rounded-sm" style={{ boxShadow: "inset 0 0 22px rgba(255,221,110,.95),0 0 30px rgba(255,211,92,.55)" }} />
              </>}
            </button>;
          })}
        </div>
        <div className="pointer-events-none absolute bottom-5 left-5 z-20"><p className="text-xs uppercase tracking-[.2em] text-cyan-200/70">MySkyParcel · Türkiye Gökyüzü Parsel Haritası</p><h1 className="mt-1 text-3xl font-bold">{city.name}</h1><p className="mt-1 text-sm text-white/70">Mavi: Dijital · Mor: Elit · Altın: Premium · Seçtiğiniz parsel altın ışıkla işaretlenir.</p></div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-4">
        <div className="rounded-xl border border-cyan-300/15 bg-slate-950/60 p-3"><span className="text-xs text-white/45">Ekrandaki parsel</span><div className="text-xl font-bold text-cyan-200">{slots.filter(Boolean).length}</div></div>
        <div className="rounded-xl border border-cyan-300/15 bg-slate-950/60 p-3"><span className="text-xs text-white/45">Seçilen</span><div className="text-xl font-bold text-amber-200">{selected.length}</div></div>
        <div className="rounded-xl border border-cyan-300/15 bg-slate-950/60 p-3"><span className="text-xs text-white/45">Veri durumu</span><div className="text-sm font-semibold text-emerald-300">{loading ? "Yükleniyor…" : busy ? "Yeni parsel getiriliyor…" : "Canlı"}</div></div>
        <button type="button" onClick={buy} disabled={!selected.length || authLoading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-40"><ShoppingCart className="h-4 w-4" /> Satın almaya devam et · {total.toLocaleString("tr-TR")} ₺</button>
      </div>

      {(selected.length > 0 || purchasedParcel) && <div className="border-t border-cyan-200/10 p-4">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold uppercase tracking-[.16em] text-cyan-200">Parsel listesi</h2><span className="text-xs text-white/45">{selected.length + (purchasedParcel ? 1 : 0)} kayıt</span></div>
        <div className="grid gap-2">
          {purchasedParcel && <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-300/30 bg-emerald-950/20 p-3">
            <div className="min-w-0"><div className="flex items-center gap-2 font-semibold"><MapPin className="h-4 w-4 shrink-0 text-emerald-300" />{purchasedParcel.parcel_number}<span className="rounded-full border border-emerald-300/30 px-2 py-0.5 text-[10px] text-emerald-300">SATIN ALINDI</span></div><p className="mt-1 text-xs text-white/55">{purchasedParcel.city_name} · {purchasedParcel.tier}</p></div><span className="shrink-0 text-xs font-semibold text-emerald-300">Sahibisiniz</span>
          </div>}
          {selected.map(item => <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-cyan-200/10 bg-slate-950/50 p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.parcel_number}</p><p className="text-xs text-white/45">{item.city_name} · {item.tier}</p></div><button type="button" onClick={() => handleDeselect(item)} className="rounded-md p-2 text-white/50 hover:bg-white/10 hover:text-white" aria-label={`${item.parcel_number} parselini listeden kaldır`}><X className="h-4 w-4" /></button></div>)}
        </div>
      </div>}
      {error && <div className="mx-4 mb-4 rounded-xl border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">Parsel verisi: {error}</div>}
    </section>
  </main>;
}
