import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Layers3, ShoppingCart } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";
import { removeParcelFromCart, readParcelCart, writeParcelCart } from "@/lib/parcelCart";
import type { Parcel } from "@/types/parcel";

type City = { slug: string; name: string; lat: number; lng: number };
type MapParcel = Parcel & { layer_number?: number | null; sector_number?: number | null; grid_x?: number | null; grid_y?: number | null };

const CITIES: City[] = [
["adana","Adana",37,35.3213],["adiyaman","Adıyaman",37.7648,38.2786],["afyonkarahisar","Afyonkarahisar",38.7569,30.5387],["agri","Ağrı",39.7191,43.0503],["amasya","Amasya",40.65,35.833],["ankara","Ankara",39.9334,32.8597],["antalya","Antalya",36.8969,30.7133],["artvin","Artvin",41.1828,41.8183],["aydin","Aydın",37.8444,27.8458],["balikesir","Balıkesir",39.6484,27.8826],["bilecik","Bilecik",40.1501,29.9831],["bingol","Bingöl",38.8854,40.4986],["bitlis","Bitlis",38.4006,42.1095],["bolu","Bolu",40.735,31.6061],["burdur","Burdur",37.7203,30.2908],["bursa","Bursa",40.195,29.06],["canakkale","Çanakkale",40.1553,26.4142],["cankiri","Çankırı",40.6013,33.6134],["corum","Çorum",40.5506,34.9556],["denizli","Denizli",37.7765,29.0864],["diyarbakir","Diyarbakır",37.9144,40.2306],["edirne","Edirne",41.6771,26.5557],["elazig","Elazığ",38.681,39.2264],["erzincan","Erzincan",39.75,39.5],["erzurum","Erzurum",39.9043,41.2679],["eskisehir","Eskişehir",39.7767,30.5206],["gaziantep","Gaziantep",37.0662,37.3833],["giresun","Giresun",40.9128,38.3895],["gumushane","Gümüşhane",40.4386,39.5086],["hakkari","Hakkari",37.5744,43.7408],["hatay","Hatay",36.202,36.1606],["isparta","Isparta",37.7648,30.5566],["mersin","Mersin",36.8121,34.6415],["istanbul","İstanbul",41.0082,28.9784],["izmir","İzmir",38.4237,27.1428],["kars","Kars",40.6013,43.0975],["kastamonu","Kastamonu",41.3887,33.7827],["kayseri","Kayseri",38.7205,35.4826],["kirklareli","Kırklareli",41.7355,27.2253],["kirsehir","Kırşehir",39.1458,34.1606],["kocaeli","Kocaeli",40.7654,29.9408],["konya","Konya",37.8746,32.4932],["kutahya","Kütahya",39.4167,29.9833],["malatya","Malatya",38.3552,38.3095],["manisa","Manisa",38.6191,27.4289],["kahramanmaras","Kahramanmaraş",37.5753,36.9228],["mardin","Mardin",37.3212,40.7245],["mugla","Muğla",37.2153,28.3636],["mus","Muş",38.9462,41.7539],["nevsehir","Nevşehir",38.6244,34.724],["nigde","Niğde",37.9698,34.6766],["ordu","Ordu",40.9839,37.8764],["rize","Rize",41.0201,40.5234],["sakarya","Sakarya",40.7569,30.3781],["samsun","Samsun",41.2867,36.33],["siirt","Siirt",37.9333,41.95],["sinop","Sinop",42.0268,35.1625],["sivas","Sivas",39.75,37.0167],["tekirdag","Tekirdağ",40.9781,27.511],["tokat","Tokat",40.3167,36.55],["trabzon","Trabzon",41.0015,39.7178],["tunceli","Tunceli",39.1079,39.5401],["sanliurfa","Şanlıurfa",37.1674,38.7955],["usak","Uşak",38.6823,29.4082],["van","Van",38.5012,43.373],["yozgat","Yozgat",39.8181,34.8147],["zonguldak","Zonguldak",41.4564,31.7987],["aksaray","Aksaray",38.3687,34.037],["bayburt","Bayburt",40.2552,40.2249],["karaman","Karaman",37.1811,33.215],["kirikkale","Kırıkkale",39.8468,33.5153],["batman","Batman",37.8874,41.1322],["sirnak","Şırnak",37.4187,42.4918],["bartin","Bartın",41.6344,32.3375],["ardahan","Ardahan",41.1105,42.7022],["igdir","Iğdır",39.9237,44.045],["yalova","Yalova",40.655,29.2769],["karabuk","Karabük",41.1956,32.6227],["kilis","Kilis",36.7184,37.1212],["osmaniye","Osmaniye",37.0742,36.2478],["duzce","Düzce",40.8438,31.1565]
].map(([slug,name,lat,lng]) => ({ slug: String(slug), name: String(name), lat: Number(lat), lng: Number(lng) }));

const PRICE = { digital: 199, elite: 499, premium: 999 } as const;
const COLS = 40;
const ROWS = 25;
const TOTAL = COLS * ROWS;

function cartItem(p: MapParcel) {
  if (p.tier !== "digital" && p.tier !== "elite" && p.tier !== "premium") return null;
  return { id: p.id, parcel_number: p.parcel_number, city_name: p.city_name, tier: p.tier, tier_price: Number(p.tier_price ?? PRICE[p.tier]) };
}

function tierForCell(index: number) {
  if (index < 500) return "digital" as const;
  if (index < 800) return "elite" as const;
  return "premium" as const;
}

function CityParcelGrid({ parcels, selectedIds, onToggle }: { parcels: MapParcel[]; selectedIds: Set<string>; onToggle: (id: string) => void }) {
  const byGrid = useMemo(() => {
    const map = new Map<string, MapParcel>();
    parcels.forEach(p => { if (p.grid_x != null && p.grid_y != null) map.set(`${p.grid_x}:${p.grid_y}`, p); });
    return map;
  }, [parcels]);
  const [hover, setHover] = useState<string | null>(null);
  return <div className="absolute inset-0 z-20 grid touch-manipulation" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))`, gridTemplateRows: `repeat(${ROWS}, minmax(0,1fr))` }} aria-label="Parsel seçim ızgarası">
    {Array.from({ length: TOTAL }, (_, i) => {
      const x = i % COLS; const y = Math.floor(i / COLS); const p = byGrid.get(`${x}:${y}`);
      if (!p) return <span key={i} aria-hidden className="border border-transparent" />;
      const tier = p.tier === "digital" || p.tier === "elite" || p.tier === "premium" ? p.tier : tierForCell(i);
      const selected = selectedIds.has(p.id); const sold = p.status === "sold";
      const tierColor = tier === "digital" ? "85,201,255" : tier === "elite" ? "183,124,255" : "246,196,83";
      return <button key={p.id} type="button" disabled={sold} aria-label={`${p.parcel_number} ${tier}`} title={`${p.parcel_number} · ${tier}`} onClick={e => { e.stopPropagation(); onToggle(p.id); }} onPointerEnter={() => setHover(p.id)} onPointerLeave={() => setHover(null)} className="relative min-h-0 min-w-0 border transition-[background,border,box-shadow] duration-75 disabled:cursor-not-allowed" style={{ borderColor: selected ? "rgba(255,244,176,.98)" : `rgba(${tierColor},.48)`, background: sold ? "rgba(255,23,68,.28)" : selected ? "rgba(255,211,92,.55)" : `rgba(${tierColor},.08)`, boxShadow: selected ? "inset 0 0 0 1px rgba(255,244,176,.9),0 0 10px rgba(255,211,92,.7)" : undefined }}>
        {(hover === p.id || selected) && <span className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-slate-950/95 px-1.5 py-0.5 text-[7px] font-semibold text-white shadow-lg sm:text-[9px]">{p.parcel_number}</span>}
      </button>;
    })}
  </div>;
}

export function CityParcelGridPage({ slug }: { slug: string }) {
  const city = CITIES.find(c => c.slug === slug);
  const { user, loading: authLoading } = useAuth();
  const [parcels, setParcels] = useState<MapParcel[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [layer, setLayer] = useState<number | null>(null);
  const [sector, setSector] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    if (!city || !supabaseBrowser) { setLoading(false); return; }
    const run = async () => {
      const { data } = await supabaseBrowser.rpc("parcels_in_view", { p_city_slug: city.slug, p_min_lat: city.lat - 1, p_min_lng: city.lng - 1, p_max_lat: city.lat + 1, p_max_lng: city.lng + 1 });
      if (!active) return;
      setParcels(((data ?? []) as MapParcel[]).filter(p => p.city_slug === city.slug));
      setLoading(false);
    };
    void run();
    return () => { active = false; };
  }, [city?.slug]);

  const filtered = useMemo(() => parcels.filter(p => (layer === null || p.layer_number === layer) && (sector === null || p.sector_number === sector)), [parcels, layer, sector]);

  const toggle = (id: string) => setSelectedIds(prev => {
    const next = new Set(prev); const p = parcels.find(x => x.id === id);
    if (!p || p.status === "sold") return next;
    if (next.has(id)) { next.delete(id); removeParcelFromCart(id); }
    else { next.add(id); const item = cartItem(p); if (item) { const cart = readParcelCart(); if (!cart.some(x => x.id === id)) writeParcelCart([...cart, item]); } }
    return next;
  });

  if (!city) return <main className="mx-auto max-w-4xl p-8 text-center"><h1 className="text-2xl font-bold">İl bulunamadı</h1><a href="/turkiye-haritasi" className="mt-4 inline-flex items-center gap-2 text-cyan-300"><ArrowLeft className="h-4 w-4"/> Türkiye haritasına dön</a></main>;

  const selected = parcels.filter(p => selectedIds.has(p.id));
  const total = selected.reduce((sum, p) => sum + Number(p.tier_price ?? PRICE[p.tier as keyof typeof PRICE] ?? 199), 0);
  const buy = () => { if (authLoading || !selected.length) return; const ids = selected.map(p => p.id).join(","); window.location.href = user ? `/parsel-satin-al?parcels=${ids}` : `/giris?redirect=${encodeURIComponent(`/parsel-satin-al?parcels=${ids}`)}`; };
  const imagePath = `/images/cities/${city.slug}.webp`; const imageExists = imageReady;

  return <main className="mx-auto max-w-[1800px] px-3 py-4 sm:px-5 lg:px-8">
    <div className="mb-4"><a href="/turkiye-haritasi" className="inline-flex items-center gap-2 text-sm text-cyan-200/80 hover:text-cyan-100"><ArrowLeft className="h-4 w-4"/> Türkiye haritası</a></div>
    <section className="overflow-hidden rounded-3xl border border-cyan-200/15 bg-slate-900/70 shadow-2xl">
      <div className="relative min-h-[300px] overflow-hidden bg-[#020914] sm:min-h-[520px]">
        <img ref={imageRef} src={imagePath} alt={`${city.name} görseli`} className="absolute inset-0 h-full w-full object-cover" onLoad={() => setImageReady(true)} onError={e => { e.currentTarget.style.display = "none"; setImageReady(false); }} />
        {!imageExists && <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(30,112,160,.3),transparent_35%),linear-gradient(145deg,#030b17,#071a2d_52%,#020711)]" />}
        <CityParcelGrid parcels={filtered} selectedIds={selectedIds} onToggle={toggle}/>
        <div className="pointer-events-none absolute inset-0 z-30 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/10" />
        <div className="pointer-events-none absolute bottom-5 left-5 z-40"><p className="text-xs uppercase tracking-[.2em] text-cyan-200/70">MySkyParcel · İl Parsel Haritası</p><h1 className="mt-1 text-3xl font-bold">{city.name}</h1><p className="mt-1 text-sm text-white/60">Parsel çizgilerindeki kareye dokunarak seçim yapabilirsiniz.</p></div>
      </div>
      <div className="grid lg:grid-cols-[1fr_280px]">
        <div className="p-3 lg:p-5"><div className="mb-3 flex items-center justify-between"><span className="text-sm text-white/70">{filtered.length.toLocaleString("tr-TR")} parsel</span>{loading && <span className="text-xs text-white/40">Yükleniyor...</span>}</div><div className="rounded-2xl border border-cyan-200/10 bg-slate-950/50 p-3"><div className="grid grid-cols-3 gap-2 text-center text-xs"><span className="rounded-lg border border-cyan-300/20 px-2 py-2 text-cyan-200">Dijital %50</span><span className="rounded-lg border border-purple-300/20 px-2 py-2 text-purple-200">Elit %30</span><span className="rounded-lg border border-amber-300/20 px-2 py-2 text-amber-200">Premium %20</span></div></div></div>
        <aside className="border-t border-white/10 bg-slate-950/70 p-4 lg:border-l lg:border-t-0"><div className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-cyan-200"/><span className="text-xs uppercase tracking-[.15em] text-white/55">Filtreler</span></div><label className="mt-4 block text-xs text-white/45">Katman</label><select value={layer ?? ""} onChange={e => setLayer(e.target.value ? Number(e.target.value) : null)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 p-2"><option value="">Tümü</option>{Array.from(new Set(parcels.map(p => p.layer_number).filter((x): x is number => typeof x === "number"))).sort((a,b) => a-b).map(x => <option key={x} value={x}>Katman {x}</option>)}</select><label className="mt-4 block text-xs text-white/45">Sektör</label><select value={sector ?? ""} onChange={e => setSector(e.target.value ? Number(e.target.value) : null)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 p-2"><option value="">Tümü</option>{Array.from(new Set(parcels.map(p => p.sector_number).filter((x): x is number => typeof x === "number"))).sort((a,b) => a-b).map(x => <option key={x} value={x}>Sektör {x}</option>)}</select>{selected.length > 0 && <div className="mt-6 rounded-2xl border border-cyan-200/15 bg-slate-900 p-4"><p className="text-xs text-white/50">Seçilen</p><p className="mt-1 text-2xl font-bold">{selected.length}</p><p className="mt-3 text-xs text-white/50">Toplam</p><p className="text-lg font-bold text-cyan-100">{total.toLocaleString("tr-TR")} TL</p><button onClick={buy} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-3 py-3 text-sm font-bold text-slate-950"><ShoppingCart className="h-4 w-4"/> Satın al</button></div>}</aside>
      </div>
    </section>
  </main>;
}
