import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Search } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";
import { SkyParcelDomeReference } from "@/components/SkyParcelDomeReference";
import { ParcelDetailPanel } from "@/components/ParcelDetailPanel";
import { CITY_IMAGES, CITY_IMAGE_FALLBACK } from "@/lib/cityImages";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import type { Parcel } from "@/types/parcel";

export const Route = createFileRoute("/gokyuzu-haritasi")({
  head: () => ({ meta: [{ title: "Gökyüzü Haritası — MySkyParcel" }, { name: "description", content: "Pilot şehirlerdeki MySkyParcel parsellerini dijital gökyüzü kubbesi üzerinden keşfet." }] }),
  component: Harita,
});

const PILOT_CITIES = [
  { code: "IST", slug: "istanbul", name: "İstanbul" }, { code: "ANK", slug: "ankara", name: "Ankara" }, { code: "IZM", slug: "izmir", name: "İzmir" },
  { code: "BUR", slug: "bursa", name: "Bursa" }, { code: "ANT", slug: "antalya", name: "Antalya" }, { code: "KAY", slug: "kayseri", name: "Kayseri" }, { code: "GZT", slug: "gaziantep", name: "Gaziantep" },
] as const;
// Ten parcel rows per sector preserve the 50/30/20 rule visually: top 5 Digital, middle 3 Elit, bottom 2 Premium.
const TIER_BY_NUMBER = (n:number) => { const r=(n-1)%10; return r<5 ? "digital" : r<8 ? "elite" : "premium"; };
const TIER_PRICE = { digital:199, elite:499, premium:999 } as const;

function Harita(){
 const [selectedCity,setSelectedCity]=useState("GZT"),[parcels,setParcels]=useState<Parcel[]>([]),[selectedId,setSelectedId]=useState<string|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState<string|null>(null);
 const selectedParcel=useMemo(()=>parcels.find(p=>p.id===selectedId)??null,[parcels,selectedId]);
 const city=PILOT_CITIES.find(c=>c.code===selectedCity)??PILOT_CITIES[6],cityImage=CITY_IMAGES[selectedCity]??CITY_IMAGE_FALLBACK;
 useEffect(()=>{let mounted=true;async function load(){if(!supabaseBrowser){setError("Supabase yapılandırması eksik");setLoading(false);return;}setLoading(true);setError(null);setSelectedId(null);try{const {data:cityRow,error:ce}=await supabaseBrowser.from("cities").select("id,name,slug").eq("slug",city.slug).single();if(ce)throw ce;const {data,error:pe}=await supabaseBrowser.from("parcels").select("id, parcel_number, status, owner_id, price, city_id, latitude, longitude, created_at, updated_at, grid_x, grid_y").eq("city_id",cityRow.id).order("parcel_number").limit(1000);if(pe)throw pe;const normalized=((data??[]) as Array<Parcel & {grid_x?:number;grid_y?:number}>).map(p=>{const n=Number(p.parcel_number.split("-").pop()??0),t=TIER_BY_NUMBER(n);return {...p,tier:t,tier_price:TIER_PRICE[t]} as Parcel;});if(mounted)setParcels(normalized);}catch(err){console.error("Error loading pilot city parcels",err);if(mounted)setError("Şehrin gerçek parselleri yüklenemedi. Supabase bağlantısını kontrol edin.");}finally{if(mounted)setLoading(false);}}void load();return()=>{mounted=false;};},[city.slug]);
 return <div className="starfield min-h-screen"><SiteHeader/><main className="mx-auto max-w-[1800px] px-4 py-8 lg:px-6"><div className="text-center"><h1 className="font-display text-xl font-bold tracking-[0.08em] sm:text-2xl">GÖKYÜZÜ HARİTASI</h1><p className="mx-auto mt-1 max-w-xl text-[11px] text-muted-foreground">Küreyi keşfet, pilot şehrini seç ve bir parsele dokun.</p></div>
  <div className="mt-4 grid items-start gap-4 lg:grid-cols-[270px_minmax(0,1fr)_320px]">
   <aside className="panel grid content-start gap-5 p-4"><div className="flex items-center gap-2 rounded-md border border-input bg-background/50 px-3"><Search className="h-4 w-4 shrink-0 text-muted-foreground"/><input placeholder="Pilot şehir ara..." className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none" aria-label="Pilot şehir ara"/></div><div><p className="mb-2 text-xs text-muted-foreground">Pilot şehirler · 1.000 parsel</p><ul className="grid gap-1">{PILOT_CITIES.map(c=><li key={c.code}><button type="button" onClick={()=>setSelectedCity(c.code)} className={`flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm ${selectedCity===c.code?"border border-gold/50 bg-accent text-gold":"hover:bg-accent hover:text-gold"}`}><MapPin className="h-4 w-4 shrink-0"/>{c.name}</button></li>)}</ul></div><div className="rounded-md border border-gold/20 bg-background/30 p-3 text-xs"><p className="font-semibold text-gold">PARSEL STATÜLERİ</p><p className="mt-2 text-muted-foreground">%50 Dijital · 199 TL</p><p className="text-muted-foreground">%30 Elit · 499 TL</p><p className="text-muted-foreground">%20 Premium · 999 TL</p></div></aside>
   <section className="panel relative min-h-[600px] overflow-hidden p-3 sm:p-5"><img key={cityImage} src={cityImage} alt={`${city.name} şehir manzarası`} loading="eager" width={1536} height={864} onError={e=>{if(!e.currentTarget.src.endsWith(CITY_IMAGE_FALLBACK))e.currentTarget.src=CITY_IMAGE_FALLBACK;}} className="absolute inset-0 h-full w-full scale-[1.02] object-cover opacity-32 transition-all duration-700"/><div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/45 via-transparent to-background/35"/><div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(24,78,145,0.08),transparent_50%)]"/><div className="relative z-10"><div className="-mt-1 flex items-center justify-center gap-2 text-center"><span className="hidden h-px w-8 bg-gold/45 sm:block"/><div><h2 className="font-display text-lg font-semibold tracking-[0.07em] sm:text-xl">{city.name.toUpperCase()} GÖKYÜZÜ</h2><p className="mt-0.5 text-[9px] tracking-[0.12em] text-muted-foreground sm:text-[10px]">1.000 ADET SEMBOLİK GÖKYÜZÜ PARSELİ</p></div><span className="hidden h-px w-8 bg-gold/45 sm:block"/></div>{loading&&<p className="py-10 text-center text-sm text-muted-foreground">Gerçek parseller yükleniyor...</p>}{error&&<p className="py-10 text-center text-sm text-red-300">{error}</p>}{!loading&&!error&&parcels.length===0&&<p className="py-10 text-center text-sm text-muted-foreground">Bu pilot şehirde henüz parsel bulunamadı.</p>}{!error&&<SkyParcelDomeReference parcels={parcels} selectedId={selectedId} onSelect={setSelectedId}/>}</div></section>
   {selectedParcel ? <div className="lg:sticky lg:top-4"><ParcelDetailPanel parcel={selectedParcel} onClose={()=>setSelectedId(null)} onReserved={p=>setParcels(prev=>prev.map(item=>item.id===p.id?p:item))}/></div> : <aside className="panel hidden min-h-[260px] p-5 lg:block"><p className="text-xs font-semibold text-gold">SEÇİLEN PARSEL</p><p className="mt-3 text-sm text-muted-foreground">Kubbeden bir parsel seçtiğinde detayları burada açılacak.</p></aside>}
  </div></main><TrustBar/><SiteFooter/></div>;
}
