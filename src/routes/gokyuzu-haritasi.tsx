import { createFileRoute } from "@tanstack/react-router";
import { Layers3, MapPin, Rotate3D, Search } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";
import { SkyParcelDome } from "@/components/SkyParcelDome";
import { ParcelDetailPanel } from "@/components/ParcelDetailPanel";
import { CITY_IMAGES, CITY_IMAGE_FALLBACK } from "@/lib/cityImages";
import type { CityImageCode } from "@/lib/cityImages";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import type { Parcel } from "@/types/parcel";

export const Route = createFileRoute("/gokyuzu-haritasi")({
  validateSearch: z.object({ city: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Gökyüzü Haritası — MySkyParcel" },
      { name: "description", content: "Pilot şehirlerdeki MySkyParcel parsellerini dünyanın eğriliğini takip eden gökyüzü kubbesi üzerinden keşfet." },
      { property: "og:title", content: "Gökyüzü Haritası — MySkyParcel" },
      { property: "og:description", content: "İstanbul, Ankara, İzmir, Bursa, Antalya, Kayseri ve Gaziantep parsellerini keşfet." },
    ],
  }),
  component: Harita,
});

const PILOT_CITIES: ReadonlyArray<{ code: CityImageCode; slug: string; name: string }> = [
  { code: "IST", slug: "istanbul", name: "İstanbul" },
  { code: "ANK", slug: "ankara", name: "Ankara" },
  { code: "IZM", slug: "izmir", name: "İzmir" },
  { code: "BUR", slug: "bursa", name: "Bursa" },
  { code: "ANT", slug: "antalya", name: "Antalya" },
  { code: "KAY", slug: "kayseri", name: "Kayseri" },
  { code: "GZT", slug: "gaziantep", name: "Gaziantep" },
];

const DEFAULT_CITY = { code: "GZT", slug: "gaziantep", name: "Gaziantep" } satisfies { code: CityImageCode; slug: string; name: string };
const TIER_BY_NUMBER = (number: number) => (number <= 500 ? "digital" : number <= 800 ? "elite" : "premium");
const TIER_PRICE = { digital: 199, elite: 499, premium: 999 } as const;
type Tier = keyof typeof TIER_PRICE;
type PublicParcelRow = Omit<Parcel, "owner_id"> & { owner_id: null; city_slug?: string | null; layer_number?: number | null; sector_number?: number | null; local_parcel_number?: number | null };

function Harita() {
  const { city: citySlug } = Route.useSearch();
  const initialCity = PILOT_CITIES.find((city) => city.slug === citySlug) ?? DEFAULT_CITY;
  const [selectedCity, setSelectedCity] = useState<CityImageCode>(initialCity.code);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [layerFilter, setLayerFilter] = useState<number | null>(null);
  const [sectorFilter, setSectorFilter] = useState<number | null>(null);
  const [citySearch, setCitySearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nextCity = PILOT_CITIES.find((city) => city.slug === citySlug)?.code ?? DEFAULT_CITY.code;
    setSelectedCity(nextCity);
  }, [citySlug]);

  const selectedParcel = useMemo(() => parcels.find((parcel) => parcel.id === selectedId) ?? null, [parcels, selectedId]);
  const selectedCityMeta = PILOT_CITIES.find((city) => city.code === selectedCity) ?? DEFAULT_CITY;
  const selectedCityImage = CITY_IMAGES[selectedCity] ?? CITY_IMAGE_FALLBACK;
  const availableLayers = useMemo(() => Array.from(new Set(parcels.map((parcel) => parcel.layer_number).filter((value): value is number => typeof value === "number"))).sort((a, b) => a - b), [parcels]);
  const availableSectors = useMemo(() => { const source = layerFilter === null ? parcels : parcels.filter((parcel) => parcel.layer_number === layerFilter); return Array.from(new Set(source.map((parcel) => parcel.sector_number).filter((value): value is number => typeof value === "number"))).sort((a, b) => a - b); }, [parcels, layerFilter]);
  const filteredCities = useMemo(() => { const query = citySearch.trim().toLocaleLowerCase("tr-TR"); if (!query) return PILOT_CITIES; return PILOT_CITIES.filter((city) => city.name.toLocaleLowerCase("tr-TR").includes(query)); }, [citySearch]);

  useEffect(() => {
    let mounted = true;
    async function loadParcels() {
      if (!supabaseBrowser) { setError("Supabase yapılandırması eksik"); setLoading(false); return; }
      setLoading(true); setError(null); setSelectedId(null); setLayerFilter(null); setSectorFilter(null);
      try {
        const { data, error: parcelError } = await supabaseBrowser.from("parcel_map_public").select("id, parcel_number, status, price, tier, tier_price, city_id, city_code, city_name, city_slug, layer_number, sector_number, local_parcel_number, latitude, longitude, created_at, updated_at").eq("city_slug", selectedCityMeta.slug).order("layer_number", { ascending: true }).order("sector_number", { ascending: true }).order("local_parcel_number", { ascending: true }).limit(1000);
        if (parcelError) throw parcelError;
        const normalized = ((data ?? []) as PublicParcelRow[]).map((parcel) => { const numericCode = Number(parcel.parcel_number.split("-").pop() ?? 0); const tier = (parcel.tier ?? TIER_BY_NUMBER(numericCode)) as Tier; return { ...parcel, owner_id: null, tier, tier_price: parcel.tier_price ?? TIER_PRICE[tier], city_name: parcel.city_name ?? selectedCityMeta.name, city_code: parcel.city_code ?? selectedCityMeta.code } as Parcel; });
        if (mounted) setParcels(normalized);
      } catch (err) { console.error("Error loading public pilot city parcels", err); if (mounted) setError("Şehrin herkese açık parsel verileri yüklenemedi. Supabase bağlantısını kontrol edin."); }
      finally { if (mounted) setLoading(false); }
    }
    void loadParcels();
    return () => { mounted = false; };
  }, [selectedCityMeta.code, selectedCityMeta.name, selectedCityMeta.slug]);

  const selectCity = (code: CityImageCode) => { setSelectedCity(code); setSelectedId(null); setLayerFilter(null); setSectorFilter(null); };
  const handleLayerChange = (value: string) => { const next = value ? Number(value) : null; setLayerFilter(next); setSectorFilter(null); };

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1800px] px-3 py-7 sm:px-5 lg:px-8 lg:py-10">
        <div className="mb-6 text-center sm:mb-8"><h1 className="font-display text-3xl font-bold tracking-wide sm:text-5xl">GÖKYÜZÜ HARİTASI</h1><p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">Şehrin üzerindeki dijital parsel kubbesini keşfet. Haritayı sürükle, yakınlaştır ve gerçek bir parsele dokun.</p></div>
        <section className="relative overflow-hidden rounded-3xl border border-sky-200/15 bg-slate-950/50 shadow-2xl shadow-black/30">
          <img key={selectedCityImage} src={selectedCityImage} alt={`${selectedCityMeta.name} şehir manzarası`} loading="eager" width={1536} height={864} onError={(event) => { if (event.currentTarget.src.endsWith(CITY_IMAGE_FALLBACK)) return; event.currentTarget.src = CITY_IMAGE_FALLBACK; }} className="absolute inset-0 h-full w-full object-cover object-center opacity-95" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-300/10 via-transparent to-slate-950/55" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_12%,rgba(239,250,255,0.16),transparent_34%),radial-gradient(ellipse_at_15%_18%,rgba(255,255,255,0.09),transparent_20%),radial-gradient(ellipse_at_84%_20%,rgba(255,255,255,0.08),transparent_18%)]" />
          <div className="relative z-10 grid min-h-[760px] grid-rows-[minmax(560px,1fr)_auto] lg:min-h-[820px] lg:grid-cols-[280px_1fr] lg:grid-rows-1">
            <aside className="order-2 border-t border-white/10 bg-slate-950/72 p-4 backdrop-blur-md lg:order-1 lg:border-r lg:border-t-0 lg:p-5">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/55 px-3"><Search className="h-4 w-4 shrink-0 text-sky-100/60" /><input value={citySearch} onChange={(event) => setCitySearch(event.target.value)} placeholder="Şehir ara..." className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/40" aria-label="Pilot şehir ara" /></div>
              <div className="mt-5"><div className="mb-2 flex items-center justify-between"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/55">Pilot şehirler</p><MapPin className="h-4 w-4 text-sky-200/55" /></div><div className="grid gap-1.5">{filteredCities.map((city) => <button key={city.code} type="button" onClick={() => selectCity(city.code)} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${selectedCity === city.code ? "border-sky-200/40 bg-sky-200/10 text-white shadow-inner shadow-sky-200/10" : "border-transparent text-white/65 hover:border-white/10 hover:bg-white/5 hover:text-white"}`}><MapPin className="h-4 w-4 shrink-0" />{city.name}</button>)}</div></div>
              <div className="mt-6 border-t border-white/10 pt-5"><div className="mb-3 flex items-center gap-2"><Layers3 className="h-4 w-4 text-sky-200/75" /><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/60">Katman ve sektör</p></div><label className="block text-xs text-white/45" htmlFor="map-layer">Katman</label><select id="map-layer" value={layerFilter ?? ""} onChange={(event) => handleLayerChange(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/75 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-200/35"><option value="">Tüm katmanlar</option>{availableLayers.map((layer) => <option key={layer} value={layer}>Katman {layer}</option>)}</select><label className="mt-4 block text-xs text-white/45" htmlFor="map-sector">Sektör</label><select id="map-sector" value={sectorFilter ?? ""} onChange={(event) => setSectorFilter(event.target.value ? Number(event.target.value) : null)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/75 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-200/35"><option value="">Tüm sektörler</option>{availableSectors.map((sector) => <option key={sector} value={sector}>Sektör {String(sector).padStart(2, "0")}</option>)}</select></div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/45 p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/55">Parsel türleri</p><div className="mt-3 space-y-2 text-xs"><div className="flex items-center justify-between text-white/70"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(92,205,255,.9)]" />Dijital</span><span>199 TL</span></div><div className="flex items-center justify-between text-white/70"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(194,125,255,.9)]" />Elit</span><span>499 TL</span></div><div className="flex items-center justify-between text-white/70"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(255,210,91,.9)]" />Premium</span><span>999 TL</span></div></div></div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/45 p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/55">Parsel durumları</p><div className="mt-3 space-y-2 text-xs"><div className="flex items-center gap-2 text-white/65"><span className="h-2 w-2 rounded-full bg-emerald-300" />Müsait · seçilebilir</div><div className="flex items-center gap-2 text-white/65"><span className="h-2 w-2 rounded-full border border-amber-200 bg-transparent" />Rezerve · kesikli ağ</div><div className="flex items-center gap-2 text-white/65"><span className="h-2 w-2 rounded-full bg-white/30" />Satılmış · düşük görünürlük</div></div></div>
              <div className="mt-4 flex items-start gap-2 rounded-2xl border border-white/10 bg-slate-950/35 p-3 text-[11px] leading-5 text-white/45"><Rotate3D className="mt-0.5 h-4 w-4 shrink-0 text-sky-200/60" /><span>Haritayı parmağınla sürükle. Mouse tekerleğiyle veya dokunmatik yakınlaştırmayla kubbeye yaklaş.</span></div>
            </aside>
            <div className="order-1 relative min-h-[560px] min-w-0 lg:order-2 lg:min-h-0">
              <div className="absolute left-4 top-4 z-20 rounded-full border border-white/15 bg-slate-950/55 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md sm:left-6 sm:top-6">{selectedCityMeta.name} · {parcels.length.toLocaleString("tr-TR")} gerçek parsel</div>
              {loading && <div className="absolute inset-0 z-30 grid place-items-center bg-slate-950/20 text-sm text-white/70 backdrop-blur-[1px]">Gerçek parseller yükleniyor...</div>}
              {error && <div className="absolute inset-x-4 top-16 z-30 rounded-xl border border-red-200/20 bg-red-950/60 p-4 text-center text-sm text-red-100 backdrop-blur-md sm:inset-x-8">{error}</div>}
              {!error && <SkyParcelDome parcels={parcels} selectedId={selectedId} onSelect={setSelectedId} layerFilter={layerFilter} sectorFilter={sectorFilter} />}
              <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4"><div className="rounded-full border border-white/10 bg-slate-950/55 px-4 py-2 text-center text-[10px] text-white/55 shadow-lg backdrop-blur-md">{layerFilter !== null ? `Katman ${layerFilter}` : "Tüm katmanlar"} · {sectorFilter !== null ? `Sektör ${String(sectorFilter).padStart(2, "0")}` : "Tüm sektörler"}</div></div>
              {selectedParcel && <ParcelDetailPanel parcel={selectedParcel} onClose={() => setSelectedId(null)} onReserved={(parcel) => setParcels((prev) => prev.map((item) => item.id === parcel.id ? parcel : item))} />}
            </div>
          </div>
        </section>
      </main>
      <TrustBar />
      <SiteFooter />
    </div>
  );
}
