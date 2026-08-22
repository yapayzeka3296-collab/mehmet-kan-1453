import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layers3, MapPin, Search, ListChecks, X, ShoppingCart, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FocusedGoogleParcelMap } from "@/components/FocusedGoogleParcelMap";
import { ParcelDetailPanel } from "@/components/ParcelDetailPanel";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import type { Parcel } from "@/types/parcel";

type GeoJsonPolygon = { type: "Polygon"; coordinates: number[][][] };
type GeoJsonMultiPolygon = { type: "MultiPolygon"; coordinates: number[][][][] };
type ViewportBounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };
type MapParcel = Parcel & { geometry?: GeoJsonPolygon | GeoJsonMultiPolygon | null; layer_number?: number | null; sector_number?: number | null; local_parcel_number?: number | null; city_slug?: string | null };
type FocusTarget = { city: { lat: number; lng: number }; parcel: { lat: number; lng: number }; token: string };
type City = { code: string; slug: string; name: string; center: { lat: number; lng: number } };

const CITIES: City[] = [
  { code: "IST", slug: "istanbul", name: "İstanbul", center: { lat: 41.0082, lng: 28.9784 } },
  { code: "ANK", slug: "ankara", name: "Ankara", center: { lat: 39.9334, lng: 32.8597 } },
  { code: "IZM", slug: "izmir", name: "İzmir", center: { lat: 38.4237, lng: 27.1428 } },
  { code: "BUR", slug: "bursa", name: "Bursa", center: { lat: 40.195, lng: 29.06 } },
  { code: "ANT", slug: "antalya", name: "Antalya", center: { lat: 36.8969, lng: 30.7133 } },
  { code: "KAY", slug: "kayseri", name: "Kayseri", center: { lat: 38.7205, lng: 35.4826 } },
  { code: "GZT", slug: "gaziantep", name: "Gaziantep", center: { lat: 37.0662, lng: 37.3833 } },
];
const DEFAULT_CITY: City = CITIES[0]!;
const TIER_PRICE = { digital: 199, elite: 499, premium: 999 } as const;
type Tier = keyof typeof TIER_PRICE;

export const Route = createFileRoute("/gokyuzu-haritasi")({
  validateSearch: z.object({ city: z.string().optional(), parcels: z.string().optional(), lat: z.string().optional(), lng: z.string().optional() }),
  head: () => ({ meta: [{ title: "Gökyüzü Haritası — MySkyParcel" }, { name: "description", content: "MySkyParcel dijital parsellerini Google Maps üzerinde keşfet." }] }),
  component: SkyMapPage,
});

type PublicParcelRow = MapParcel;

function SkyMapPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/gokyuzu-haritasi" });
  const initialCity = CITIES.find((city) => city.slug === search.city) ?? DEFAULT_CITY;
  const [selectedCity, setSelectedCity] = useState(initialCity.code);
  const [parcels, setParcels] = useState<MapParcel[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [multiSelect, setMultiSelect] = useState(false);
  const [layerFilter, setLayerFilter] = useState<number | null>(null);
  const [sectorFilter, setSectorFilter] = useState<number | null>(null);
  const [citySearch, setCitySearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const city = CITIES.find((item) => item.code === selectedCity) ?? DEFAULT_CITY;
  const selectedParcel = useMemo(() => parcels.find((parcel) => parcel.id === selectedId) ?? null, [parcels, selectedId]);
  const availableLayers = useMemo(() => Array.from(new Set(parcels.map((parcel) => parcel.layer_number).filter((value): value is number => typeof value === "number"))).sort((a, b) => a - b), [parcels]);
  const availableSectors = useMemo(() => { const source = layerFilter === null ? parcels : parcels.filter((parcel) => parcel.layer_number === layerFilter); return Array.from(new Set(source.map((parcel) => parcel.sector_number).filter((value): value is number => typeof value === "number"))).sort((a, b) => a - b); }, [parcels, layerFilter]);
  const filteredParcels = useMemo(() => parcels.filter((parcel) => (layerFilter === null || parcel.layer_number === layerFilter) && (sectorFilter === null || parcel.sector_number === sectorFilter)), [parcels, layerFilter, sectorFilter]);
  const filteredCities = useMemo(() => { const query = citySearch.trim().toLocaleLowerCase("tr-TR"); return query ? CITIES.filter((item) => item.name.toLocaleLowerCase("tr-TR").includes(query)) : CITIES; }, [citySearch]);
  const selectedIdsForPurchase = useMemo(() => Array.from(selectedIds).join(","), [selectedIds]);
  const selectedTotal = useMemo(() => parcels.filter((parcel) => selectedIds.has(parcel.id)).reduce((sum, parcel) => sum + Number(parcel.tier_price ?? TIER_PRICE[parcel.tier as Tier]), 0), [parcels, selectedIds]);

  useEffect(() => { const next: City = CITIES.find((item) => item.slug === search.city) ?? DEFAULT_CITY; setSelectedCity(next.code); }, [search.city]);
  useEffect(() => { setParcels([]); setSelectedId(null); setSelectedIds(new Set()); setMultiSelect(false); setLayerFilter(null); setSectorFilter(null); }, [city.code]);

  const loadViewportParcels = useCallback(async (bounds: ViewportBounds) => {
    if (!supabaseBrowser) { setError("Supabase yapılandırması eksik."); return; }
    const currentRequest = ++requestId.current; setLoading(true); setError(null);
    try {
      const { data, error: rpcError } = await supabaseBrowser.rpc("parcels_in_view", { p_city_slug: city.slug, p_min_lat: bounds.minLat, p_min_lng: bounds.minLng, p_max_lat: bounds.maxLat, p_max_lng: bounds.maxLng });
      if (rpcError) throw rpcError;
      if (currentRequest !== requestId.current) return;
      const normalized = ((data ?? []) as PublicParcelRow[]).map((parcel) => ({ ...parcel, owner_id: null, city_name: parcel.city_name ?? city.name, city_code: parcel.city_code ?? city.code, city_slug: parcel.city_slug ?? city.slug, tier_price: parcel.tier_price ?? TIER_PRICE[parcel.tier as Tier] }));
      setParcels(normalized); setSelectedIds((current) => new Set(Array.from(current).filter((id) => normalized.some((parcel) => parcel.id === id)))); setSelectedId((current) => current && normalized.some((parcel) => parcel.id === current) ? current : null);
    } catch (cause) { console.error("Gökyüzü Haritası parsel sorgusu başarısız", cause); if (currentRequest === requestId.current) setError("Harita alanındaki parseller yüklenemedi. Lütfen tekrar deneyin."); }
    finally { if (currentRequest === requestId.current) setLoading(false); }
  }, [city.code, city.name, city.slug]);

  const selectCity = (code: string) => { const next: City = CITIES.find((item) => item.code === code) ?? DEFAULT_CITY; setSelectedCity(next.code); void navigate({ search: { city: next.slug }, replace: true }); };
  const toggleSelected = (id: string) => setSelectedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const goToPurchase = () => { if (!selectedIdsForPurchase) return; void navigate({ to: "/parsel-satin-al", search: { parcels: selectedIdsForPurchase } as never }); };
  const focusTarget: FocusTarget | null = search.parcels && search.lat && search.lng && Number.isFinite(Number(search.lat)) && Number.isFinite(Number(search.lng)) ? { city: city.center, parcel: { lat: Number(search.lat), lng: Number(search.lng) }, token: `${search.parcels}:${search.lat}:${search.lng}` } : null;

  return <div className="min-h-screen bg-slate-950 text-white"><SiteHeader /><main className="mx-auto max-w-[1800px] px-3 py-2 sm:px-5 lg:px-8 lg:py-3"><section className="grid overflow-hidden rounded-3xl border border-sky-200/15 bg-slate-900/70 shadow-2xl shadow-black/30 lg:grid-cols-[280px_1fr]"><aside className="order-2 border-t border-white/10 bg-slate-950/90 p-4 lg:order-1 lg:border-r lg:border-t-0 lg:p-5"><div className="mb-4 rounded-2xl border border-cyan-300/20 bg-slate-900/80 p-4 text-center"><ShieldCheck className="mx-auto h-7 w-7 text-cyan-200" /><p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em]">GÜVENLİK</p></div><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3"><Search className="h-4 w-4 text-sky-100/60" /><input value={citySearch} onChange={(event) => setCitySearch(event.target.value)} placeholder="Şehir ara..." className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/40" /></div><div className="mt-5 grid gap-1.5">{filteredCities.map((item) => <button key={item.code} type="button" onClick={() => selectCity(item.code)} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm ${selectedCity === item.code ? "border-sky-200/40 bg-sky-200/10" : "border-transparent text-white/65 hover:bg-white/5"}`}><MapPin className="h-4 w-4" />{item.name}</button>)}</div><div className="mt-6 border-t border-white/10 pt-5"><div className="mb-3 flex items-center gap-2"><Layers3 className="h-4 w-4" /><p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Parsel filtreleri</p></div><select value={layerFilter ?? ""} onChange={(event) => setLayerFilter(event.target.value ? Number(event.target.value) : null)} className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm"><option value="">Tüm katmanlar</option>{availableLayers.map((layer) => <option key={layer} value={layer}>Katman {layer}</option>)}</select><select value={sectorFilter ?? ""} onChange={(event) => setSectorFilter(event.target.value ? Number(event.target.value) : null)} className="mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm"><option value="">Tüm sektörler</option>{availableSectors.map((sector) => <option key={sector} value={sector}>Sektör {String(sector).padStart(2, "0")}</option>)}</select></div><div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/65 p-4 text-xs text-white/60">{loading ? "Parseller yükleniyor..." : `${filteredParcels.length} parsel gösteriliyor.`}{error && <p className="mt-2 text-red-300">{error}</p>}</div></aside><div className="order-1 min-w-0 p-2 sm:p-3 lg:order-2"><FocusedGoogleParcelMap parcels={filteredParcels} selectedId={selectedId} selectedIds={selectedIds} multiSelect={multiSelect} onSelect={setSelectedId} onToggleSelect={toggleSelected} onViewportChange={loadViewportParcels} center={city.center} focusTarget={focusTarget} /><div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-900/80 p-3"><button type="button" onClick={() => setMultiSelect((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm"><ListChecks className="h-4 w-4" />{multiSelect ? "Çoklu seçimi kapat" : "Çoklu seçim"}</button>{multiSelect && <button type="button" onClick={goToPurchase} disabled={!selectedIdsForPurchase} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40"><ShoppingCart className="h-4 w-4" />{selectedIds.size} parseli satın al</button>}</div>{selectedParcel && <ParcelDetailPanel parcel={selectedParcel} onClose={() => setSelectedId(null)} onReserved={(reserved) => setParcels((current) => current.map((item) => item.id === reserved.id ? { ...item, ...reserved, status: "reserved" } : item))} />}</div></section></main><SiteFooter /></div>;
}
