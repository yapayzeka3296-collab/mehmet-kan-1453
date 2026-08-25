import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layers3, MapPin, Search, X, ShoppingCart, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import "@/lib/parcelStrokeRenderer";
import { FocusedSkyParcelMap } from "@/components/FocusedSkyParcelMap";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import type { Parcel } from "@/types/parcel";

type GeoJsonPolygon = { type: "Polygon"; coordinates: number[][][] };
type GeoJsonMultiPolygon = { type: "MultiPolygon"; coordinates: number[][][][] };
type ViewportBounds = { minLat:number; minLng:number; maxLat:number; maxLng:number };
type MapParcel = Parcel & { geometry?: GeoJsonPolygon | GeoJsonMultiPolygon | null; layer_number?: number | null; sector_number?: number | null; local_parcel_number?: number | null; city_slug?: string | null };
type FocusTarget = { city:{lat:number;lng:number}; parcel:{lat:number;lng:number}; token:string };
type City = { code:string; slug:string; name:string; center:{lat:number;lng:number} };

export const Route = createFileRoute("/gokyuzu-haritasi")({
  validateSearch: z.object({ city:z.string().optional(), parcels:z.string().optional(), lat:z.string().optional(), lng:z.string().optional() }),
  head:()=>({meta:[
    {title:"Gökyüzü Haritası — MySkyParcel"},
    {name:"description",content:"MySkyParcel dijital parsellerini keşfet, seç ve detaylarını incele."},
    {property:"og:title",content:"Gökyüzü Haritası — MySkyParcel"},
    {property:"og:description",content:"MySkyParcel parsellerini keşfet."},
  ]}),
  component:Harita,
});

const CITIES: City[] = [
  {code:"01",slug:"adana",name:"Adana",center:{lat:37.0,lng:35.3213}},
  {code:"02",slug:"adiyaman",name:"Adıyaman",center:{lat:37.7648,lng:38.2786}},
  {code:"03",slug:"afyonkarahisar",name:"Afyonkarahisar",center:{lat:38.7569,lng:30.5387}},
  {code:"04",slug:"agri",name:"Ağrı",center:{lat:39.7191,lng:43.0503}},
  {code:"05",slug:"amasya",name:"Amasya",center:{lat:40.65,lng:35.833}},
  {code:"06",slug:"ankara",name:"Ankara",center:{lat:39.9334,lng:32.8597}},
  {code:"07",slug:"antalya",name:"Antalya",center:{lat:36.8969,lng:30.7133}},
  {code:"08",slug:"artvin",name:"Artvin",center:{lat:41.1828,lng:41.8183}},
  {code:"09",slug:"aydin",name:"Aydın",center:{lat:37.8444,lng:27.8458}},
  {code:"10",slug:"balikesir",name:"Balıkesir",center:{lat:39.6484,lng:27.8826}},
  {code:"11",slug:"bilecik",name:"Bilecik",center:{lat:40.1501,lng:29.9831}},
  {code:"12",slug:"bingol",name:"Bingöl",center:{lat:38.8854,lng:40.4986}},
  {code:"13",slug:"bitlis",name:"Bitlis",center:{lat:38.4006,lng:42.1095}},
  {code:"14",slug:"bolu",name:"Bolu",center:{lat:40.735,lng:31.6061}},
  {code:"15",slug:"burdur",name:"Burdur",center:{lat:37.7203,lng:30.2908}},
  {code:"16",slug:"bursa",name:"Bursa",center:{lat:40.195,lng:29.06}},
  {code:"17",slug:"canakkale",name:"Çanakkale",center:{lat:40.1553,lng:26.4142}},
  {code:"18",slug:"cankiri",name:"Çankırı",center:{lat:40.6013,lng:33.6134}},
  {code:"19",slug:"corum",name:"Çorum",center:{lat:40.5506,lng:34.9556}},
  {code:"20",slug:"denizli",name:"Denizli",center:{lat:37.7765,lng:29.0864}},
  {code:"21",slug:"diyarbakir",name:"Diyarbakır",center:{lat:37.9144,lng:40.2306}},
  {code:"22",slug:"edirne",name:"Edirne",center:{lat:41.6771,lng:26.5557}},
  {code:"23",slug:"elazig",name:"Elazığ",center:{lat:38.681,lng:39.2264}},
  {code:"24",slug:"erzincan",name:"Erzincan",center:{lat:39.75,lng:39.5}},
  {code:"25",slug:"erzurum",name:"Erzurum",center:{lat:39.9043,lng:41.2679}},
  {code:"26",slug:"eskisehir",name:"Eskişehir",center:{lat:39.7767,lng:30.5206}},
  {code:"27",slug:"gaziantep",name:"Gaziantep",center:{lat:37.0662,lng:37.3833}},
  {code:"28",slug:"giresun",name:"Giresun",center:{lat:40.9128,lng:38.3895}},
  {code:"29",slug:"gumushane",name:"Gümüşhane",center:{lat:40.4386,lng:39.5086}},
  {code:"30",slug:"hakkari",name:"Hakkari",center:{lat:37.5744,lng:43.7408}},
  {code:"31",slug:"hatay",name:"Hatay",center:{lat:36.202,lng:36.1606}},
  {code:"32",slug:"isparta",name:"Isparta",center:{lat:37.7648,lng:30.5566}},
  {code:"33",slug:"mersin",name:"Mersin",center:{lat:36.8121,lng:34.6415}},
  {code:"34",slug:"istanbul",name:"İstanbul",center:{lat:41.0082,lng:28.9784}},
  {code:"35",slug:"izmir",name:"İzmir",center:{lat:38.4237,lng:27.1428}},
  {code:"36",slug:"kars",name:"Kars",center:{lat:40.6013,lng:43.0975}},
  {code:"37",slug:"kastamonu",name:"Kastamonu",center:{lat:41.3887,lng:33.7827}},
  {code:"38",slug:"kayseri",name:"Kayseri",center:{lat:38.7205,lng:35.4826}},
  {code:"39",slug:"kirklareli",name:"Kırklareli",center:{lat:41.7355,lng:27.2253}},
  {code:"40",slug:"kirsehir",name:"Kırşehir",center:{lat:39.1458,lng:34.1606}},
  {code:"41",slug:"kocaeli",name:"Kocaeli",center:{lat:40.7654,lng:29.9408}},
  {code:"42",slug:"konya",name:"Konya",center:{lat:37.8746,lng:32.4932}},
  {code:"43",slug:"kutahya",name:"Kütahya",center:{lat:39.4167,lng:29.9833}},
  {code:"44",slug:"malatya",name:"Malatya",center:{lat:38.3552,lng:38.3095}},
  {code:"45",slug:"manisa",name:"Manisa",center:{lat:38.6191,lng:27.4289}},
  {code:"46",slug:"kahramanmaras",name:"Kahramanmaraş",center:{lat:37.5753,lng:36.9228}},
  {code:"47",slug:"mardin",name:"Mardin",center:{lat:37.3212,lng:40.7245}},
  {code:"48",slug:"mugla",name:"Muğla",center:{lat:37.2153,lng:28.3636}},
  {code:"49",slug:"mus",name:"Muş",center:{lat:38.9462,lng:41.7539}},
  {code:"50",slug:"nevsehir",name:"Nevşehir",center:{lat:38.6244,lng:34.724}},
  {code:"51",slug:"nigde",name:"Niğde",center:{lat:37.9698,lng:34.6766}},
  {code:"52",slug:"ordu",name:"Ordu",center:{lat:40.9839,lng:37.8764}},
  {code:"53",slug:"rize",name:"Rize",center:{lat:41.0201,lng:40.5234}},
  {code:"54",slug:"sakarya",name:"Sakarya",center:{lat:40.7569,lng:30.3781}},
  {code:"55",slug:"samsun",name:"Samsun",center:{lat:41.2867,lng:36.33}},
  {code:"56",slug:"siirt",name:"Siirt",center:{lat:37.9333,lng:41.95}},
  {code:"57",slug:"sinop",name:"Sinop",center:{lat:42.0268,lng:35.1625}},
  {code:"58",slug:"sivas",name:"Sivas",center:{lat:39.75,lng:37.0167}},
  {code:"59",slug:"tekirdag",name:"Tekirdağ",center:{lat:40.9781,lng:27.511}},
  {code:"60",slug:"tokat",name:"Tokat",center:{lat:40.3167,lng:36.55}},
  {code:"61",slug:"trabzon",name:"Trabzon",center:{lat:41.0015,lng:39.7178}},
  {code:"62",slug:"tunceli",name:"Tunceli",center:{lat:39.1079,lng:39.5401}},
  {code:"63",slug:"sanliurfa",name:"Şanlıurfa",center:{lat:37.1674,lng:38.7955}},
  {code:"64",slug:"usak",name:"Uşak",center:{lat:38.6823,lng:29.4082}},
  {code:"65",slug:"van",name:"Van",center:{lat:38.5012,lng:43.373}},
  {code:"66",slug:"yozgat",name:"Yozgat",center:{lat:39.8181,lng:34.8147}},
  {code:"67",slug:"zonguldak",name:"Zonguldak",center:{lat:41.4564,lng:31.7987}},
  {code:"68",slug:"aksaray",name:"Aksaray",center:{lat:38.3687,lng:34.037}},
  {code:"69",slug:"bayburt",name:"Bayburt",center:{lat:40.2552,lng:40.2249}},
  {code:"70",slug:"karaman",name:"Karaman",center:{lat:37.1811,lng:33.215}},
  {code:"71",slug:"kirikkale",name:"Kırıkkale",center:{lat:39.8468,lng:33.5153}},
  {code:"72",slug:"batman",name:"Batman",center:{lat:37.8874,lng:41.1322}},
  {code:"73",slug:"sirnak",name:"Şırnak",center:{lat:37.4187,lng:42.4918}},
  {code:"74",slug:"bartin",name:"Bartın",center:{lat:41.6344,lng:32.3375}},
  {code:"75",slug:"ardahan",name:"Ardahan",center:{lat:41.1105,lng:42.7022}},
  {code:"76",slug:"igdir",name:"Iğdır",center:{lat:39.9237,lng:44.045}},
  {code:"77",slug:"yalova",name:"Yalova",center:{lat:40.655,lng:29.2769}},
  {code:"78",slug:"karabuk",name:"Karabük",center:{lat:41.1956,lng:32.6227}},
  {code:"79",slug:"kilis",name:"Kilis",center:{lat:36.7184,lng:37.1212}},
  {code:"80",slug:"osmaniye",name:"Osmaniye",center:{lat:37.0742,lng:36.2478}},
  {code:"81",slug:"duzce",name:"Düzce",center:{lat:40.8438,lng:31.1565}},
];

const DEFAULT_CITY=CITIES.find(c=>c.slug==="istanbul")!;
const TIER_BY_NUMBER=(number:number)=>number<=500?"digital":number<=800?"elite":"premium";
const TIER_PRICE={digital:199,elite:499,premium:999} as const;
type Tier=keyof typeof TIER_PRICE;
type PublicParcelRow=Omit<Parcel,"owner_id"> & {owner_id:null;city_slug?:string|null;layer_number?:number|null;sector_number?:number|null;local_parcel_number?:number|null;geometry?:GeoJsonPolygon|GeoJsonMultiPolygon|null};

function Harita(){
  const {city:citySlug,parcels:focusParcelQuery,lat:focusLat,lng:focusLng}=Route.useSearch();
  const navigate=useNavigate({from:"/gokyuzu-haritasi"});
  const initialCity=CITIES.find(city=>city.slug===citySlug)??DEFAULT_CITY;
  const [selectedCity,setSelectedCity]=useState(initialCity.code);
  const [parcels,setParcels]=useState<MapParcel[]>([]);
  const [selectedIds,setSelectedIds]=useState<Set<string>>(new Set());
  const [layerFilter,setLayerFilter]=useState<number|null>(null);
  const [sectorFilter,setSectorFilter]=useState<number|null>(null);
  const [citySearch,setCitySearch]=useState("");
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);
  const [manualFocusTarget,setManualFocusTarget]=useState<FocusTarget|null>(null);
  const requestIdRef=useRef(0);
  const selectedCityMeta=CITIES.find(city=>city.code===selectedCity)??DEFAULT_CITY;
  const focusParcelId=focusParcelQuery?.split(",")[0]||null;
  const queryFocusTarget=useMemo<FocusTarget|null>(()=>{if(!focusParcelId||!Number.isFinite(Number(focusLat))||!Number.isFinite(Number(focusLng)))return null;return{city:selectedCityMeta.center,parcel:{lat:Number(focusLat),lng:Number(focusLng)},token:`${focusParcelId}:${focusLat}:${focusLng}`}},[focusParcelId,focusLat,focusLng,selectedCityMeta.center]);
  const focusTarget=manualFocusTarget??queryFocusTarget;
  const selectedParcels=useMemo(()=>parcels.filter(parcel=>selectedIds.has(parcel.id)),[parcels,selectedIds]);
  const selectedTotal=useMemo(()=>selectedParcels.reduce((sum,parcel)=>sum+Number(parcel.tier_price??TIER_PRICE[(parcel.tier??"digital") as Tier]),0),[selectedParcels]);
  const selectedParcelQuery=useMemo(()=>selectedParcels.map(parcel=>parcel.id).join(","),[selectedParcels]);
  const availableLayers=useMemo(()=>Array.from(new Set(parcels.map(parcel=>parcel.layer_number).filter((value):value is number=>typeof value==="number"))).sort((a,b)=>a-b),[parcels]);
  const availableSectors=useMemo(()=>{const source=layerFilter===null?parcels:parcels.filter(parcel=>parcel.layer_number===layerFilter);return Array.from(new Set(source.map(parcel=>parcel.sector_number).filter((value):value is number=>typeof value==="number"))).sort((a,b)=>a-b)},[parcels,layerFilter]);
  const filteredParcels=useMemo(()=>parcels.filter(parcel=>(layerFilter===null||parcel.layer_number===layerFilter)&&(sectorFilter===null||parcel.sector_number===sectorFilter)),[parcels,layerFilter,sectorFilter]);
  const filteredCities=useMemo(()=>{const query=citySearch.trim().toLocaleLowerCase("tr-TR");return query?CITIES.filter(city=>city.name.toLocaleLowerCase("tr-TR").includes(query)):CITIES},[citySearch]);

  useEffect(()=>{const nextCity=CITIES.find(city=>city.slug===citySlug)??DEFAULT_CITY;setSelectedCity(nextCity.code);setManualFocusTarget(null)},[citySlug,focusParcelQuery,focusLat,focusLng]);
  useEffect(()=>{setSelectedIds(new Set());setLayerFilter(null);setSectorFilter(null);setParcels([])},[selectedCityMeta.code]);

  const loadViewportParcels=useCallback(async(bounds:ViewportBounds)=>{
    if(!supabaseBrowser){setError("Supabase yapılandırması eksik.");setLoading(false);return}
    const requestId=++requestIdRef.current;setLoading(true);setError(null);
    try{
      const {data,error:parcelError}=await supabaseBrowser.rpc("parcels_in_view",{p_city_slug:selectedCityMeta.slug,p_min_lat:bounds.minLat,p_min_lng:bounds.minLng,p_max_lat:bounds.maxLat,p_max_lng:bounds.maxLng});
      if(parcelError)throw parcelError;if(requestId!==requestIdRef.current)return;
      const normalized=((data??[]) as PublicParcelRow[]).map(parcel=>{const numericCode=Number(parcel.parcel_number.split("-").pop()??0);const tier=(parcel.tier??TIER_BY_NUMBER(numericCode)) as Tier;return{...parcel,owner_id:null,tier,tier_price:parcel.tier_price??TIER_PRICE[tier],city_name:parcel.city_name??selectedCityMeta.name,city_code:parcel.city_code??selectedCityMeta.code} as MapParcel});
      setParcels(normalized);setSelectedIds(current=>new Set([...current].filter(id=>normalized.some(parcel=>parcel.id===id))));
    }catch(err){console.error("Error loading viewport parcels",err);if(requestId===requestIdRef.current)setError("Harita alanındaki parseller yüklenemedi. Supabase bağlantısını kontrol edin.")}
    finally{if(requestId===requestIdRef.current)setLoading(false)}
  },[selectedCityMeta.code,selectedCityMeta.name,selectedCityMeta.slug]);

  const selectCity=(code:string)=>{const city=CITIES.find(item=>item.code===code)??DEFAULT_CITY;setSelectedCity(city.code);setSelectedIds(new Set());setLayerFilter(null);setSectorFilter(null);setManualFocusTarget(null);void navigate({search:{city:city.slug},replace:true})};
  const toggleSelectedParcel=(id:string)=>setSelectedIds(current=>{const next=new Set(current);if(next.has(id))next.delete(id);else next.add(id);return next});
  const removeSelected=(id:string)=>setSelectedIds(current=>{const next=new Set(current);next.delete(id);return next});
  const goToPurchase=()=>{if(!selectedParcelQuery)return;void navigate({to:"/parsel-satin-al",search:{parcels:selectedParcelQuery} as never})};

  return <div className="min-h-screen bg-slate-950 text-white"><SiteHeader/><main className="mx-auto max-w-[1800px] px-3 py-2 sm:px-5 lg:px-8 lg:py-3"><section className="grid overflow-hidden rounded-3xl border border-sky-200/15 bg-slate-900/70 shadow-2xl shadow-black/30 lg:grid-cols-[280px_1fr]"><aside className="order-2 border-t border-white/10 bg-slate-950/90 p-4 backdrop-blur-md lg:order-1 lg:border-r lg:border-t-0 lg:p-5"><div className="mb-4 flex min-h-[150px] flex-col justify-center rounded-2xl border border-cyan-300/20 bg-slate-900/80 p-4 text-center shadow-lg"><ShieldCheck className="mx-auto h-7 w-7 text-cyan-200"/><p className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/85">GÜVENLİK</p><p className="mt-1 text-[10px] leading-4 text-white/55">Güvenlik altyapısı yayın öncesi ayrıca doğrulanmalıdır.</p></div><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3"><Search className="h-4 w-4 shrink-0 text-sky-100/60"/><input value={citySearch} onChange={event=>setCitySearch(event.target.value)} placeholder="Şehir ara..." className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/40" aria-label="Türkiye ili ara"/></div><div className="mt-5"><div className="mb-2 flex items-center justify-between"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/55">Türkiye'nin 81 ili</p><MapPin className="h-4 w-4 text-sky-200/55"/></div><div className="grid max-h-[440px] gap-1.5 overflow-auto pr-1">{filteredCities.map(city=><button key={city.code} type="button" onClick={()=>selectCity(city.code)} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${selectedCity===city.code?"border-sky-200/40 bg-sky-200/10 text-white":"border-transparent text-white/65 hover:border-white/10 hover:bg-white/5 hover:text-white"}`}><MapPin className="h-4 w-4 shrink-0"/>{city.name}</button>)}</div></div><div className="mt-6 border-t border-white/10 pt-5"><div className="mb-3 flex items-center gap-2"><Layers3 className="h-4 w-4 text-sky-200/75"/><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100/60">Parsel filtreleri</p></div><label className="block text-xs text-white/45" htmlFor="map-layer">Katman</label><select id="map-layer" value={layerFilter??""} onChange={event=>setLayerFilter(event.target.value?Number(event.target.value):null)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none"><option value="">Tüm katmanlar</option>{availableLayers.map(layer=><option key={layer} value={layer}>Katman {layer}</option>)}</select><label className="mt-4 block text-xs text-white/45" htmlFor="map-sector">Sektör</label><select id="map-sector" value={sectorFilter??""} onChange={event=>setSectorFilter(event.target.value?Number(event.target.value):null)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none"><option value="">Tüm sektörler</option>{availableSectors.map(sector=><option key={sector} value={sector}>Sektör {String(sector).padStart(2,"0")}</option>)}</select></div></aside><div className="order-1 min-w-0 p-2 sm:p-3 lg:order-2 lg:p-4"><div className="mb-3 flex items-center justify-between gap-2 px-1 sm:px-2"><div className="flex min-w-0 items-center gap-2"><div className="shrink-0 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs text-white/75">{selectedCityMeta.name} · {filteredParcels.length.toLocaleString("tr-TR")} parsel</div><div className="hidden shrink-0 items-center gap-2 whitespace-nowrap text-[10px] text-white/70 sm:flex"><span>● Dijital 199 TL</span><span>● Elit 499 TL</span><span>● Premium 999 TL</span></div></div><div className="flex shrink-0 items-center gap-2">{loading&&<span className="text-xs text-white/45">Parseller yükleniyor...</span>}{error&&<span className="text-xs text-red-200">{error}</span>}</div></div><FocusedSkyParcelMap parcels={filteredParcels} selectedId={null} selectedIds={selectedIds} multiSelect={true} onSelect={()=>undefined} onToggleSelect={toggleSelectedParcel} onViewportChange={loadViewportParcels} center={selectedCityMeta.center} focusTarget={focusTarget}/>{selectedParcels.length>0&&<div className="mt-4 rounded-2xl border border-cyan-200/20 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-white">{selectedParcels.length} parsel seçildi</p><p className="mt-1 text-xs text-white/50">Haritada bir parsele tekrar dokunarak seçimini kaldırabilirsin.</p></div><div className="text-right"><p className="text-xs text-white/50">Toplam</p><p className="text-lg font-bold text-cyan-100">{selectedTotal.toLocaleString("tr-TR")} TL</p></div></div><div className="mt-3 grid max-h-56 gap-2 overflow-auto pr-1 sm:grid-cols-2">{selectedParcels.map(parcel=><div key={parcel.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{parcel.parcel_number}</p><p className="text-xs text-white/45">{parcel.city_name} · {parcel.tier==="premium"?"Premium":parcel.tier==="elite"?"Elit":"Dijital"}</p></div><button type="button" onClick={()=>removeSelected(parcel.id)} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white" aria-label={`${parcel.parcel_number} seçimini kaldır`}><X className="h-4 w-4"/></button></div>)}</div><button type="button" onClick={goToPurchase} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"><ShoppingCart className="h-4 w-4"/>SEÇİLEN PARSELLERİ SATIN AL — {selectedTotal.toLocaleString("tr-TR")} TL</button></div>}</div></section></main><SiteFooter/></div>;
}
