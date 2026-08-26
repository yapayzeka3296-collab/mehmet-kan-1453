import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SkyParcelMap } from "@/components/SkyParcelMap";
import { useMemo, useState } from "react";
import type { Parcel } from "@/types/parcel";

export const Route = createFileRoute("/turkiye-haritasi")({ component: TurkeyMapPage });

const cities = [
  ["istanbul","İstanbul",41.0082,28.9784],["ankara","Ankara",39.9334,32.8597],["izmir","İzmir",38.4237,27.1428],["gaziantep","Gaziantep",37.0662,37.3833],["adana","Adana",37.0,35.3213],["antalya","Antalya",36.8969,30.7133]
] as const;

function TurkeyMapPage() {
  const [city, setCity] = useState(cities[0]);
  const parcels = useMemo<Parcel[]>(() => Array.from({ length: 20 }, (_, i) => ({
    id: `${city[0]}-${i+1}`, parcel_number: `${city[0].toUpperCase().slice(0,3)}-${String(i+1).padStart(4,"0")}`,
    status: "available", owner_id: null, price: 199, tier: "digital", tier_price: 199,
    city_id: city[0], city_name: city[1], city_code: city[0].slice(0,3).toUpperCase(), city_slug: city[0],
    latitude: city[2] + ((i % 5) - 2) * .04, longitude: city[3] + (Math.floor(i/5)-2) * .05,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  })), [city]);
  return <div className="min-h-screen bg-[#020711] text-white"><SiteHeader/><main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div className="mb-6"><p className="text-xs uppercase tracking-[.28em] text-cyan-300/70">MySkyParcel</p><h1 className="mt-2 text-3xl font-bold">Türkiye Haritası</h1><p className="mt-2 text-sm text-white/55">Şehrini seç, parsellerini incele ve uygun parseli seç.</p></div><div className="mb-6 flex flex-wrap gap-2">{cities.map(c=><button key={c[0]} onClick={()=>setCity(c)} className={`rounded-lg border px-4 py-2 text-sm ${city[0]===c[0]?"border-cyan-300 bg-cyan-300/15 text-cyan-100":"border-white/10 text-white/65 hover:border-cyan-300/40"}`}>{c[1]}</button>)}</div><SkyParcelMap parcels={parcels} selectedId={null} multiSelect onSelect={()=>{}} center={{lat:city[2],lng:city[3]}}/></main></div>;
}
