import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layers3, MapPin, Search, ShoppingCart, X } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";
import "@/lib/parcelStrokeRenderer";
import { GoogleParcelMap } from "@/components/GoogleParcelMap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";
import type { Parcel } from "@/types/parcel";

type GeoJsonPolygon = { type: "Polygon"; coordinates: number[][][] };
type GeoJsonMultiPolygon = { type: "MultiPolygon"; coordinates: number[][][][] };
type ViewportBounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };
type MapParcel = Parcel & { geometry?: GeoJsonPolygon | GeoJsonMultiPolygon | null; layer_number?: number | null; sector_number?: number | null; local_parcel_number?: number | null; city_slug?: string | null };

export const Route = createFileRoute("/gokyuzu-haritasi")({
  validateSearch: z.object({ city: z.string().optional() }),
  head: () => ({ meta: [
    { title: "Gökyüzü Haritası — MySkyParcel" },
    { name: "description", content: "MySkyParcel dijital parsellerini Google Maps üzerinde keşfet, seç ve detaylarını incele." },
    { property: "og:title", content: "Gökyüzü Haritası — MySkyParcel" },
    { property: "og:description", content: "MySkyParcel parsellerini gerçek harita üzerinde keşfet." },
  ] }),
  component: Harita,
});

const PILOT_CITIES = [
  { code: "IST", slug: "istanbul", name: "İstanbul", center: { lat: 41.0082, lng: 28.9784 } },
  { code: "ANK", slug: "ankara", name: "Ankara", center: { lat: 39.9334, lng: 32.8597 } },
  { code: "IZM", slug: "izmir", name: "İzmir", center: { lat: 38.4237, lng: 27.1428 } },
  { code: "BUR", slug: "bursa", name: "Bursa", center: { lat: 40.195, lng: 29.06 } },
  { code: "ANT", slug: "antalya", name: "Antalya", center: { lat: 36.8969, lng: 30.7133 } },
  { code: "KAY", slug: "kayseri", name: "Kayseri", center: { lat: 38.7205, lng: 35.4826 } },
  { code: "GZT", slug: "gaziantep", name: "Gaziantep", center: { lat: 37.0662, lng: 37.3833 } },
] as const;
const DEFAULT_CITY = PILOT_CITIES[0];
const TIER_BY_NUMBER = (number: number) => (number <= 500 ? "digital" : number <= 800 ? "elite" : "premium");
const TIER_PRICE = { digital: 199, elite: 499, premium: 999 } as const;
type Tier = keyof typeof TIER_PRICE;
type PublicParcelRow = Omit<Parcel, "owner_id"> & { owner_id: null; city_slug?: string | null; layer_number?: number | null; sector_number?: number | null; local_parcel_number?: number | null; geometry?: GeoJsonPolygon | GeoJsonMultiPolygon | null };

function Harita() {
  const { city: citySlug } = Route.useSearch();
  const navigate = useNavigate({ from: "/gokyuzu-haritasi" });
  const { user } = useAuth();
  const initialCity = PILOT_CITIES.find((city) => city.slug === citySlug) ?? DEFAULT_CITY;
  const [selectedCity, setSelectedCity] = useState(initialCity.code);
  const [parcels, setParcels] = useState<MapParcel[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedParcels, setSelectedParcels] = useState<MapParcel[]>([]);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [layerFilter, setLayerFilter] = useState<number | null>(null);
  const [sectorFilter, setSectorFilter] = useState<number | null>(null);
  const [citySearch, setCitySearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const selectedCityMeta = PILOT_CITIES.find((city) => city.code === selectedCity) ?? DEFAULT_CITY;
  const availableLayers = useMemo(() => Array.from(new Set(parcels.map((parcel) => parcel.layer_number).filter((value): value is number => typeof value === "number"))).sort((a, b) => a - b), [parcels]);
  const availableSectors = useMemo(() => { const source = layerFilter === null ? parcels : parcels.filter((parcel) => parcel.layer_number === layerFilter); return Array.from(new Set(source.map((parcel) => parcel.sector_number).filter((value): value is number => typeof value === "number"))).sort((a, b) => a - b); }, [parcels, layerFilter]);
  const filteredParcels = useMemo(() => parcels.filter((parcel) => (layerFilter === null || parcel.layer_number === layerFilter) && (sectorFilter === null || parcel.sector_number === sectorFilter)), [parcels, layerFilter, sectorFilter]);
  const filteredCities = useMemo(() => { const query = citySearch.trim().toLocaleLowerCase("tr-TR"); if (!query) return PILOT_CITIES; return PILOT_CITIES.filter((city) => city.name.toLocaleLowerCase("tr-TR").includes(query)); }, [citySearch]);
  const selectedTotal = useMemo(() => selectedParcels.reduce((sum, parcel) => sum + Number(parcel.tier_price ?? parcel.price ?? 0), 0), [selectedParcels]);
  useEffect(() => { const nextCity = PILOT_CITIES.find((city) => city.slug === citySlug) ?? DEFAULT_CITY; setSelectedCity(nextCity.code); }, [citySlug]);
  useEffect(() => { setSelectedId(null); setSelectedParcels([]); setPurchaseMessage(null); setLayerFilter(null); setSectorFilter(null); setParcels([]); }, [selectedCityMeta.code]);

  const loadViewportParcels = useCallback(async (bounds: ViewportBounds) => {
    if (!supabaseBrowser) { setError("Supabase yapılandırması eksik."); setLoading(false); return; }
    const requestId = ++requestIdRef.current; setLoading(true); setError(null);
    try {
      const { data, error: parcelError } = await supabaseBrowser.rpc("parcels_in_view", { p_city_slug: selectedCityMeta.slug, p_min_lat: bounds.minLat, p_min_lng: bounds.minLng, p_max_lat: bounds.maxLat, p_max_lng: bounds.maxLng });
      if (parcelError) throw parcelError;
      if (requestId !== requestIdRef.current) return;
      const normalized = ((data ?? []) as PublicParcelRow[]).map((parcel) => { const numericCode = Number(parcel.parcel_number.split("-").pop() ?? 0); const tier = (parcel.tier ?? TIER_BY_NUMBER(numericCode)) as Tier; return { ...parcel, owner_id: null, tier, tier_price: parcel.tier_price ?? TIER_PRICE[tier], city_name: parcel.city_name ?? selectedCityMeta.name, city_code: parcel.city_code ?? selectedCityMeta.code } as MapParcel; });
      setParcels(normalized);
    } catch (err) { console.error("Error loading viewport parcels", err); if (requestId === requestIdRef.current) setError("Harita alanındaki parseller yüklenemedi. Supabase bağlantısını kontrol edin."); }
    finally { if (requestId === requestIdRef.current) setLoading(false); }
  }, [selectedCityMeta.code, selectedCityMeta.name, selectedCityMeta.slug]);

  const selectCity = (code: typeof selectedCity) => { const city = PILOT_CITIES.find((item) => item.code === code) ?? DEFAULT_CITY; setSelectedCity(city.code); setSelectedId(null); setSelectedParcels([]); setLayerFilter(null); setSectorFilter(null); void navigate({ search: { city: city.slug }, replace: true }); };
  const handleLayerChange = (value: string) => { setLayerFilter(value ? Number(value) : null); setSectorFilter(null); };
  const toggleParcelSelection = (id: string | null) => {
    if (!id) return;
    const parcel = parcels.find((item) => item.id === id);
    if (!parcel || parcel.status !== "available") return;
    setSelectedId(id);
    setPurchaseMessage(null);
    setSelectedParcels((current) => current.some((item) => item.id === id) ? current.filter((item) => item.id !== id) : [...current, parcel]);
  };
  const removeSelected = (id: string) => { setSelectedParcels((current) => current.filter((item) => item.id !== id)); if (selectedId === id) setSelectedId(null); };
  const clearSelected = () => { setSelectedParcels([]); setSelectedId(null); setPurchaseMessage(null); };

  const purchaseSelected = async () => {
    if (!selectedParcels.length || purchaseLoading) return;
    setPurchaseMessage(null);
    if (!user) { setPurchaseMessage("Satın almak için önce giriş yapmalısınız."); void navigate({ to: "/giris" }); return; }
    if (!supabaseBrowser) { setPurchaseMessage("Supabase yapılandırması eksik."); return; }
    setPurchaseLoading(true);
    try {
      const { data } = await supabaseBrowser.auth.getSession();
      const token = data.session?.access_token;
      if (!token) { setPurchaseMessage("Oturumunuz bulunamadı. Lütfen tekrar giriş yapın."); return; }
      const response = await fetch("/purchase-bulk", { method: "POST", headers: { "content-type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ parcel_ids: selectedParcels.map((parcel) => parcel.id) }) });
      const json = await response.json().catch(() => ({}));
      if (response.status === 202) {
        const ids = new Set(selectedParcels.map((parcel) => parcel.id));
        setParcels((current) => current.map((parcel) => ids.has(parcel.id) ? { ...parcel, status: "reserved" } : parcel));
        setSelectedParcels([]); setSelectedId(null);
        setPurchaseMessage(`${json.count ?? ids.size} parsel için rezervasyon oluşturuldu. Ödeme/sipariş adımından devam edebilirsiniz.`);
      } else if (response.status === 409) setPurchaseMessage("Seçtiğiniz parsellerden en az biri artık müsait değil. Seçimi yenileyip tekrar deneyin.");
      else if (response.status === 401) setPurchaseMessage("Oturumunuz bulunamadı. Lütfen tekrar giriş yapın.");
      else if (response.status === 404) setPurchaseMessage("Seçilen parsellerden biri bulunamadı.");
      else if (response.status === 503) setPurchaseMessage("Satın alma servisi şu anda yapılandırılmamış.");
      else setPurchaseMessage("Seçilen parseller işlenemedi. Lütfen tekrar deneyin.");
    } catch (err) { console.error("Bulk purchase error", err); setPurchaseMessage("İşlem sırasında bir hata oluştu."); }
    finally { setPurchaseLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <main className="mx-auto max-w-[1800px] px-3 py-7 sm:px-5 lg:px-8 lg:py-10">
        <div className="mb-6 text-center sm:mb-8"><h1 className="font-display text-3xl font-bold tracking-wide sm:text-5xl">GÖKYÜZÜ HARİTASI</h1><p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">MySkyParcel parsellerini gerçek Google Maps üzerinde keşfet. Haritayı taşı, yakınlaştır ve istediğin kadar müsait parseli seç.</p></div>
        <section className="grid overflow-hidden rounded-3xl border border-sky-200/15 bg-slate-900/70 shadow-2xl shadow-black/30 lg:grid-cols-[280px_1fr]">
          <aside className="order-2 border-t border-white/10 bg-slate-950/90 p-4 backdrop-blur-md lg:order-1 lg:border-r lg:border-t-0 lg:p-5">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3"><Search className="h-4 w-4 shrink-0 text-sky-100/60" /><input value={citySearch} onChange={(event) => setCitySearch(event.target.value)} placeholder="Şehir ara..." className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/40" aria-label="Pilot şehir ara" /></div>
            <div className="mt-5"><div className="mb-2 flex items-center justify-between"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/55">Pilot şehirler</p><MapPin className="h-4 w-4 text-sky-200/55" /></div><div className="grid gap-1.5">{filteredCities.map((city) => <button key={city.code} type="button" onClick={() => selectCity(city.code)} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${selectedCity === city.code ? "border-sky-200/40 bg-sky-200/10 text-white" : "border-transparent text-white/65 hover:border-white/10 hover:bg-white/5 hover:text-white"}`}><MapPin className="h-4 w-4 shrink-0" />{city.name}</button>)}</div></div>
            <div className="mt-6 border-t border-white/10 pt-5"><div className="mb-3 flex items-center gap-2"><Layers3 className="h-4 w-4 text-sky-200/75" /><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/60">Parsel filtreleri</p></div><label className="block text-xs text-white/45" htmlFor="map-layer">Katman</label><select id="map-layer" value={layerFilter ?? ""} onChange={(event) => handleLayerChange(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-200/35"><option value="">Tüm katmanlar</option>{availableLayers.map((layer) => <option key={layer} value={layer}>Katman {layer}</option>)}</select><label className="mt-4 block text-xs text-white/45" htmlFor="map-sector">Sektör</label><select id="map-sector" value={sectorFilter ?? ""} onChange={(event) => setSectorFilter(event.target.value ? Number(event.target.value) : null)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-200/35"><option value="">Tüm sektörler</option>{availableSectors.map((sector) => <option key={sector} value={sector}>Sektör {String(sector).padStart(2, "0")}</option>)}</select></div>
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/65 p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/55">Parsel türleri</p><div className="mt-3 space-y-2 text-xs"><div className="flex items-center justify-between text-white/70"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-sky-300" />Dijital</span><span>199 TL</span></div><div className="flex items-center justify-between text-white/70"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-violet-300" />Elit</span><span>499 TL</span></div><div className="flex items-center justify-between text-white/70"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-amber-300" />Premium</span><span>999 TL</span></div></div></div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/65 p-4 text-xs text-white/55"><p className="font-semibold text-white/75">Çoklu seçim</p><p className="mt-2 leading-5">Müsait parselleri tek tek seçerek istediğiniz kadar parseli listenize ekleyebilirsiniz. Seçimi istediğiniz zaman kaldırabilir veya tamamını tek işlemde satın alma/rezervasyon adımına gönderebilirsiniz.</p></div>
          </aside>
          <div className="order-1 min-w-0 p-2 sm:p-3 lg:order-2 lg:p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1 sm:px-2"><div className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs text-white/75">{selectedCityMeta.name} · {filteredParcels.length.toLocaleString("tr-TR")} parsel</div>{loading && <span className="text-xs text-white/45">Görünen alan yükleniyor...</span>}{error && <span className="text-xs text-red-200">{error}</span>}</div><GoogleParcelMap parcels={filteredParcels} selectedId={selectedId} onSelect={toggleParcelSelection} onViewportChange={loadViewportParcels} center={selectedCityMeta.center} /></div>
        </section>

        {selectedParcels.length > 0 && <section className="mt-5 rounded-2xl border border-gold/25 bg-slate-900/95 p-4 shadow-xl shadow-black/30 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-gold" /><h2 className="font-display text-xl">SEÇİLEN PARSELLER</h2><span className="rounded-full border border-gold/30 px-2 py-0.5 text-[10px] text-gold">{selectedParcels.length}</span></div><p className="mt-1 text-xs text-muted-foreground">İstediğiniz kadar müsait parsel seçebilirsiniz.</p></div><button type="button" onClick={clearSelected} className="rounded-md border border-white/10 px-3 py-2 text-[11px] text-muted-foreground hover:text-white">SEÇİMİ TEMİZLE</button></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{selectedParcels.map((parcel) => <div key={parcel.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/15 px-3 py-2.5"><div className="min-w-0"><p className="truncate text-sm font-semibold">{parcel.parcel_number}</p><p className="text-[10px] text-muted-foreground">{parcel.city_name} · {parcel.tier === "premium" ? "Premium" : parcel.tier === "elite" ? "Elit" : "Dijital"}</p></div><div className="flex shrink-0 items-center gap-2"><span className="text-xs text-gold">{Number(parcel.tier_price ?? parcel.price).toLocaleString("tr-TR")} TL</span><button type="button" onClick={() => removeSelected(parcel.id)} aria-label={`${parcel.parcel_number} seçimini kaldır`} className="rounded-full p-1 text-muted-foreground hover:bg-white/10 hover:text-white"><X className="h-4 w-4" /></button></div></div>)}</div><div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs text-muted-foreground">Seçilen toplam</p><p className="font-display text-2xl text-gold">{selectedTotal.toLocaleString("tr-TR")} TL</p></div><button type="button" onClick={purchaseSelected} disabled={purchaseLoading} className="btn-gold inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"><ShoppingCart className="h-4 w-4" />{purchaseLoading ? "İŞLENİYOR..." : `SEÇİLEN ${selectedParcels.length} PARSELİ SATIN AL`}</button></div>{purchaseMessage && <p className="mt-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">{purchaseMessage}</p>}</section>}
      </main>
      <TrustBar /><SiteFooter />
    </div>
  );
}
