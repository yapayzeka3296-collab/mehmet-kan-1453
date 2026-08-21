import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layers3, MapPin, Search, ShoppingCart } from "lucide-react";
import { z } from "zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FocusedGoogleParcelMap } from "@/components/FocusedGoogleParcelMap";
import { ParcelDetailPanel } from "@/components/ParcelDetailPanel";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import type { Parcel } from "@/types/parcel";

type GeoJsonPolygon = { type: "Polygon"; coordinates: number[][][] };
type GeoJsonMultiPolygon = { type: "MultiPolygon"; coordinates: number[][][][] };
type ViewportBounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };
type MapParcel = Parcel & {
  geometry?: GeoJsonPolygon | GeoJsonMultiPolygon | null;
  city_slug?: string | null;
  layer_number?: number | null;
  sector_number?: number | null;
  local_parcel_number?: number | null;
};

type City = {
  code: string;
  slug: string;
  name: string;
  center: { lat: number; lng: number };
};

const CITIES: City[] = [
  { code: "IST", slug: "istanbul", name: "İstanbul", center: { lat: 41.0082, lng: 28.9784 } },
  { code: "ANK", slug: "ankara", name: "Ankara", center: { lat: 39.9334, lng: 32.8597 } },
  { code: "IZM", slug: "izmir", name: "İzmir", center: { lat: 38.4237, lng: 27.1428 } },
  { code: "BUR", slug: "bursa", name: "Bursa", center: { lat: 40.195, lng: 29.06 } },
  { code: "ANT", slug: "antalya", name: "Antalya", center: { lat: 36.8969, lng: 30.7133 } },
  { code: "KAY", slug: "kayseri", name: "Kayseri", center: { lat: 38.7205, lng: 35.4826 } },
  { code: "GZT", slug: "gaziantep", name: "Gaziantep", center: { lat: 37.0662, lng: 37.3833 } },
];

const DEFAULT_CITY = CITIES[0];
const TIER_PRICE = { digital: 199, elite: 499, premium: 999 } as const;

export const Route = createFileRoute("/gokyuzu-haritasi")({
  validateSearch: z.object({
    city: z.string().optional(),
    parcels: z.string().optional(),
    lat: z.string().optional(),
    lng: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Gökyüzü Haritası — MySkyParcel" },
      { name: "description", content: "MySkyParcel dijital parsellerini Google Maps üzerinde keşfet." },
    ],
  }),
  component: SkyMapPage,
});

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
  const availableLayers = useMemo(
    () => Array.from(new Set(parcels.map((parcel) => parcel.layer_number).filter((value): value is number => typeof value === "number"))).sort((a, b) => a - b),
    [parcels],
  );
  const availableSectors = useMemo(() => {
    const source = layerFilter === null ? parcels : parcels.filter((parcel) => parcel.layer_number === layerFilter);
    return Array.from(new Set(source.map((parcel) => parcel.sector_number).filter((value): value is number => typeof value === "number"))).sort((a, b) => a - b);
  }, [parcels, layerFilter]);
  const filteredParcels = useMemo(
    () => parcels.filter((parcel) => (layerFilter === null || parcel.layer_number === layerFilter) && (sectorFilter === null || parcel.sector_number === sectorFilter)),
    [parcels, layerFilter, sectorFilter],
  );
  const filteredCities = useMemo(() => {
    const query = citySearch.trim().toLocaleLowerCase("tr-TR");
    return query ? CITIES.filter((item) => item.name.toLocaleLowerCase("tr-TR").includes(query)) : CITIES;
  }, [citySearch]);
  const selectedIdsForPurchase = useMemo(() => Array.from(selectedIds).join(","), [selectedIds]);
  const selectedTotal = useMemo(
    () => parcels.filter((parcel) => selectedIds.has(parcel.id)).reduce((sum, parcel) => sum + Number(parcel.tier_price ?? TIER_PRICE[parcel.tier]), 0),
    [parcels, selectedIds],
  );

  useEffect(() => {
    const next = CITIES.find((item) => item.slug === search.city) ?? DEFAULT_CITY;
    setSelectedCity(next.code);
  }, [search.city]);

  useEffect(() => {
    setParcels([]);
    setSelectedId(null);
    setSelectedIds(new Set());
    setMultiSelect(false);
    setLayerFilter(null);
    setSectorFilter(null);
  }, [city.code]);

  const loadViewportParcels = useCallback(async (bounds: ViewportBounds) => {
    if (!supabaseBrowser) {
      setError("Supabase yapılandırması eksik.");
      return;
    }
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabaseBrowser.rpc("parcels_in_view", {
        p_city_slug: city.slug,
        p_min_lat: bounds.minLat,
        p_min_lng: bounds.minLng,
        p_max_lat: bounds.maxLat,
        p_max_lng: bounds.maxLng,
      });
      if (rpcError) throw rpcError;
      if (currentRequest !== requestId.current) return;
      const normalized = ((data ?? []) as MapParcel[]).map((parcel) => ({
        ...parcel,
        owner_id: null,
        city_name: parcel.city_name ?? city.name,
        city_code: parcel.city_code ?? city.code,
        city_slug: parcel.city_slug ?? city.slug,
        tier_price: parcel.tier_price ?? TIER_PRICE[parcel.tier],
      }));
      setParcels(normalized);
      setSelectedIds((current) => new Set(Array.from(current).filter((id) => normalized.some((parcel) => parcel.id === id))));
      setSelectedId((current) => (current && normalized.some((parcel) => parcel.id === current) ? current : null));
    } catch (cause) {
      console.error("Gökyüzü Haritası parsel sorgusu başarısız", cause);
      if (currentRequest === requestId.current) setError("Harita alanındaki parseller yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [city.code, city.name, city.slug]);

  const selectCity = (code: string) => {
    const next = CITIES.find((item) => item.code === code) ?? DEFAULT_CITY;
    setSelectedCity(next.code);
    void navigate({ search: { city: next.slug }, replace: true });
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMultiSelect = () => {
    setMultiSelect((current) => !current);
    setSelectedId(null);
    if (!multiSelect) setSelectedIds(new Set());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <main className="mx-auto max-w-[1800px] px-3 py-3 sm:px-5 lg:px-8">
        <section className="grid overflow-hidden rounded-3xl border border-sky-200/15 bg-slate-900/70 shadow-2xl shadow-black/30 lg:grid-cols-[280px_1fr]">
          <aside className="order-2 border-t border-white/10 bg-slate-950/90 p-4 backdrop-blur-md lg:order-1 lg:border-r lg:border-t-0 lg:p-5">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3">
              <Search className="h-4 w-4 text-sky-100/60" />
              <input value={citySearch} onChange={(event) => setCitySearch(event.target.value)} placeholder="Şehir ara..." className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-white/40" aria-label="Şehir ara" />
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-sky-100/55">
                <span>Pilot şehirler</span><MapPin className="h-4 w-4" />
              </div>
              <div className="grid gap-1.5">
                {filteredCities.map((item) => (
                  <button key={item.code} type="button" onClick={() => selectCity(item.code)} className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${selectedCity === item.code ? "border-sky-200/40 bg-sky-200/10" : "border-transparent text-white/65 hover:border-white/10 hover:bg-white/5"}`}>
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-100/60"><Layers3 className="h-4 w-4" />Parsel filtreleri</div>
              <label className="block text-xs text-white/45" htmlFor="map-layer">Katman</label>
              <select id="map-layer" value={layerFilter ?? ""} onChange={(event) => setLayerFilter(event.target.value ? Number(event.target.value) : null)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm">
                <option value="">Tüm katmanlar</option>
                {availableLayers.map((layer) => <option key={layer} value={layer}>Katman {layer}</option>)}
              </select>
              <label className="mt-4 block text-xs text-white/45" htmlFor="map-sector">Sektör</label>
              <select id="map-sector" value={sectorFilter ?? ""} onChange={(event) => setSectorFilter(event.target.value ? Number(event.target.value) : null)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm">
                <option value="">Tüm sektörler</option>
                {availableSectors.map((sector) => <option key={sector} value={sector}>Sektör {String(sector).padStart(2, "0")}</option>)}
              </select>
            </div>
            <button type="button" onClick={toggleMultiSelect} className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-sky-200/20 bg-sky-200/5 text-xs font-semibold">
              <ShoppingCart className="h-4 w-4" />{multiSelect ? "Çoklu seçimi kapat" : "Çoklu parsel seç"}
            </button>
            {selectedIds.size > 0 && (
              <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-slate-900/70 p-4">
                <p className="text-xs text-white/60">{selectedIds.size} parsel seçildi</p>
                <p className="mt-1 text-lg font-bold">{selectedTotal.toLocaleString("tr-TR")} TL</p>
                <button type="button" onClick={() => void navigate({ to: "/parsel-satin-al", search: { parcels: selectedIdsForPurchase } as never })} className="btn-gold mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-xs font-bold"><ShoppingCart className="h-4 w-4" />SATIN AL</button>
              </div>
            )}
          </aside>
          <div className="order-1 min-h-[70vh] min-w-0 lg:order-2">
            <FocusedGoogleParcelMap
              parcels={filteredParcels}
              selectedId={selectedId}
              selectedIds={selectedIds}
              multiSelect={multiSelect}
              onSelect={setSelectedId}
              onToggleSelect={toggleSelected}
              onViewportChange={loadViewportParcels}
              center={city.center}
              focusTarget={null}
            />
            {loading && <div className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-xs text-white/70 shadow-xl">Parseller yükleniyor...</div>}
            {error && <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-xl border border-red-300/20 bg-slate-950/95 px-4 py-3 text-xs text-red-100 shadow-xl">{error}</div>}
          </div>
        </section>
      </main>
      <SiteFooter />
      {selectedParcel && <ParcelDetailPanel parcel={selectedParcel} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
