import { useEffect, useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Turkey3DParcelMap } from "@/components/Turkey3DParcelMap";
import type { Parcel } from "@/types/parcel";

type City = { code: string; slug: string; name: string; center: { lat: number; lng: number } };
type MapParcel = Parcel & { layer_number?: number | null; sector_number?: number | null };

const rawCities: Array<[string, string, number, number]> = [
  ["Adana","adana",37,35.3213],["Adıyaman","adiyaman",37.7648,38.2786],["Afyonkarahisar","afyonkarahisar",38.7569,30.5387],["Ağrı","agri",39.7191,43.0503],["Amasya","amasya",40.65,35.833],["Ankara","ankara",39.9334,32.8597],["Antalya","antalya",36.8969,30.7133],["Artvin","artvin",41.1828,41.8183],["Aydın","aydin",37.8444,27.8458],["Balıkesir","balikesir",39.6484,27.8826],["Bilecik","bilecik",40.1501,29.9831],["Bingöl","bingol",38.8854,40.4986],["Bitlis","bitlis",38.4006,42.1095],["Bolu","bolu",40.735,31.6061],["Burdur","burdur",37.7203,30.2908],["Bursa","bursa",40.195,29.06],["Çanakkale","canakkale",40.1553,26.4142],["Çankırı","cankiri",40.6013,33.6134],["Çorum","corum",40.5506,34.9556],["Denizli","denizli",37.7765,29.0864],["Diyarbakır","diyarbakir",37.9144,40.2306],["Edirne","edirne",41.6771,26.5557],["Elazığ","elazig",38.681,39.2264],["Erzincan","erzincan",39.75,39.5],["Erzurum","erzurum",39.9043,41.2679],["Eskişehir","eskisehir",39.7767,30.5206],["Gaziantep","gaziantep",37.0662,37.3833],["Giresun","giresun",40.9128,38.3895],["Gümüşhane","gumushane",40.4386,39.5086],["Hakkari","hakkari",37.5744,43.7408],["Hatay","hatay",36.202,36.1606],["Isparta","isparta",37.7648,30.5566],["Mersin","mersin",36.8121,34.6415],["İstanbul","istanbul",41.0082,28.9784],["İzmir","izmir",38.4237,27.1428],["Kars","kars",40.6013,43.0975],["Kastamonu","kastamonu",41.3887,33.7827],["Kayseri","kayseri",38.7205,35.4826],["Kırklareli","kirklareli",41.7355,27.2253],["Kırşehir","kirsehir",39.1458,34.1606],["Kocaeli","kocaeli",40.7654,29.9408],["Konya","konya",37.8746,32.4932],["Kütahya","kutahya",39.4167,29.9833],["Malatya","malatya",38.3552,38.3095],["Manisa","manisa",38.6191,27.4289],["Kahramanmaraş","kahramanmaras",37.5753,36.9228],["Mardin","mardin",37.3212,40.7245],["Muğla","mugla",37.2153,28.3636],["Muş","mus",38.9462,41.7539],["Nevşehir","nevsehir",38.6244,34.724],["Niğde","nigde",37.9698,34.6766],["Ordu","ordu",40.9839,37.8764],["Rize","rize",41.0201,40.5234],["Sakarya","sakarya",40.7569,30.3781],["Samsun","samsun",41.2867,36.33],["Siirt","siirt",37.9333,41.95],["Sinop","sinop",42.0268,35.1625],["Sivas","sivas",39.75,37.0167],["Tekirdağ","tekirdag",40.9781,27.511],["Tokat","tokat",40.3167,36.55],["Trabzon","trabzon",41.0015,39.7178],["Tunceli","tunceli",39.1079,39.5401],["Şanlıurfa","sanliurfa",37.1674,38.7955],["Uşak","usak",38.6823,29.4082],["Van","van",38.5012,43.373],["Yozgat","yozgat",39.8181,34.8147],["Zonguldak","zonguldak",41.4564,31.7987],["Aksaray","aksaray",38.3687,34.037],["Bayburt","bayburt",40.2552,40.2249],["Karaman","karaman",37.1811,33.215],["Kırıkkale","kirikkale",39.8468,33.5153],["Batman","batman",37.8874,41.1322],["Şırnak","sirnak",37.4187,42.4918],["Bartın","bartin",41.6344,32.3375],["Ardahan","ardahan",41.1105,42.7022],["Iğdır","igdir",39.9237,44.045],["Yalova","yalova",40.655,29.2769],["Karabük","karabuk",41.1956,32.6227],["Kilis","kilis",36.7184,37.1212],["Osmaniye","osmaniye",37.0742,36.2478],["Düzce","duzce",40.8438,31.1565]
];
const CITIES: City[] = rawCities.map(([name, slug, lat, lng], i) => ({ code: String(i + 1).padStart(2, "0"), name, slug, center: { lat, lng } }));
const DEFAULT_CITY = CITIES.find((c) => c.slug === "istanbul")!;

export function TurkeyProvinceMapView() {
  const [cityCode, setCityCode] = useState(DEFAULT_CITY.code);
  const [search, setSearch] = useState("");
  const [parcels, setParcels] = useState<MapParcel[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const city = CITIES.find((c) => c.code === cityCode) ?? DEFAULT_CITY;
  const filteredCities = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    return q ? CITIES.filter((c) => c.name.toLocaleLowerCase("tr-TR").includes(q)) : CITIES;
  }, [search]);

  useEffect(() => {
    let active = true;
    setParcels([]);
    setSelectedIds(new Set());
    const load = async () => {
      if (!supabaseBrowser) return;
      const { data } = await supabaseBrowser.rpc("parcels_in_view", {
        p_city_slug: city.slug,
        p_min_lat: city.center.lat - 1,
        p_min_lng: city.center.lng - 1,
        p_max_lat: city.center.lat + 1,
        p_max_lng: city.center.lng + 1,
      });
      if (active) setParcels(((data ?? []) as MapParcel[]).filter((p) => p.city_slug === city.slug));
    };
    void load();
    return () => { active = false; };
  }, [city.code, city.slug, city.center.lat, city.center.lng]);

  const toggle = (id: string) => setSelectedIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  return (
    <main className="mx-auto max-w-[1800px] px-3 py-3 sm:px-5 lg:px-8">
      <section className="grid overflow-hidden rounded-3xl border border-sky-200/15 bg-slate-900/70 shadow-2xl shadow-black/30 lg:grid-cols-[280px_1fr]">
        <aside className="order-2 border-t border-white/10 bg-slate-950/90 p-4 lg:order-1 lg:border-r lg:border-t-0 lg:p-5">
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3">
            <Search className="h-4 w-4 text-sky-100/60" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Şehir ara..." className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-white/40" />
          </div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/55">Türkiye'nin 81 ili</p>
            <MapPin className="h-4 w-4 text-sky-200/55" />
          </div>
          <div className="grid max-h-[560px] gap-1.5 overflow-auto pr-1">
            {filteredCities.map((c) => (
              <button key={c.code} type="button" onClick={() => setCityCode(c.code)} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${cityCode === c.code ? "border-sky-200/40 bg-sky-200/10 text-white" : "border-transparent text-white/65 hover:border-white/10 hover:bg-white/5"}`}>
                <MapPin className="h-4 w-4" />{c.name}
              </button>
            ))}
          </div>
        </aside>
        <div className="order-1 min-w-0 p-2 sm:p-3 lg:order-2 lg:p-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs text-white/75">Türkiye · {city.name} · {parcels.length.toLocaleString("tr-TR")} parsel</div>
            <span className="text-xs text-white/45">81 il gerçek konumları · il sınırları · tıklama noktaları</span>
          </div>
          <Turkey3DParcelMap parcels={parcels} selectedIds={selectedIds} onToggleSelect={toggle} selectedCity={city} />
        </div>
      </section>
    </main>
  );
}
