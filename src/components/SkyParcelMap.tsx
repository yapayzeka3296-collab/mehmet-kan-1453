import { useEffect, useMemo, useState } from "react";
import type { Parcel } from "@/types/parcel";

type CityCenter={lat:number;lng:number};
type ViewportBounds={minLat:number;minLng:number;maxLat:number;maxLng:number};
type FocusTarget={city:CityCenter;parcel:CityCenter;token:string};
type Props={parcels:Parcel[];selectedId:string|null;selectedIds?:Set<string>;multiSelect?:boolean;onSelect:(id:string|null)=>void;onToggleSelect?:(id:string)=>void;onViewportChange?:(bounds:ViewportBounds)=>void;center:CityCenter;focusTarget?:FocusTarget|null};
type Province={name:string;lat:number;lng:number};

const PROVINCES:Province[]=[
["Adana",37.00,35.32],["Adıyaman",37.76,38.28],["Afyonkarahisar",38.76,30.54],["Ağrı",39.72,43.05],["Amasya",40.65,35.83],["Ankara",39.93,32.86],["Antalya",36.90,30.71],["Artvin",41.18,41.82],["Aydın",37.84,27.85],["Balıkesir",39.65,27.88],["Bilecik",40.15,29.98],["Bingöl",38.89,40.50],["Bitlis",38.40,42.11],["Bolu",40.74,31.61],["Burdur",37.72,30.29],["Bursa",40.20,29.06],["Çanakkale",40.16,26.41],["Çankırı",40.60,33.61],["Çorum",40.55,34.96],["Denizli",37.78,29.09],["Diyarbakır",37.91,40.23],["Edirne",41.68,26.56],["Elazığ",38.68,39.23],["Erzincan",39.75,39.50],["Erzurum",39.90,41.27],["Eskişehir",39.78,30.52],["Gaziantep",37.07,37.38],["Giresun",40.91,38.39],["Gümüşhane",40.44,39.51],["Hakkari",37.57,43.74],["Hatay",36.20,36.16],["Isparta",37.76,30.56],["Mersin",36.81,34.64],["İstanbul",41.01,28.98],["İzmir",38.42,27.14],["Kars",40.60,43.10],["Kastamonu",41.39,33.78],["Kayseri",38.72,35.48],["Kırklareli",41.74,27.23],["Kırşehir",39.15,34.16],["Kocaeli",40.77,29.94],["Konya",37.87,32.49],["Kütahya",39.42,29.98],["Malatya",38.36,38.31],["Manisa",38.62,27.43],["Kahramanmaraş",37.58,36.92],["Mardin",37.32,40.72],["Muğla",37.22,28.36],["Muş",38.95,41.75],["Nevşehir",38.62,34.72],["Niğde",37.97,34.68],["Ordu",40.98,37.88],["Rize",41.02,40.52],["Sakarya",40.76,30.38],["Samsun",41.29,36.33],["Siirt",37.93,41.95],["Sinop",42.03,35.16],["Sivas",39.75,37.02],["Tekirdağ",40.98,27.51],["Tokat",40.32,36.55],["Trabzon",41.00,39.72],["Tunceli",39.11,39.54],["Şanlıurfa",37.17,38.80],["Uşak",38.68,29.41],["Van",38.50,43.37],["Yozgat",39.82,34.81],["Zonguldak",41.46,31.80],["Aksaray",38.37,34.04],["Bayburt",40.26,40.22],["Karaman",37.18,33.22],["Kırıkkale",39.85,33.52],["Batman",37.89,41.13],["Şırnak",37.42,42.49],["Bartın",41.63,32.34],["Ardahan",41.11,42.70],["Iğdır",39.92,44.05],["Yalova",40.66,29.28],["Karabük",41.20,32.62],["Kilis",36.72,37.12],["Osmaniye",37.07,36.25],["Düzce",40.84,31.16]
].map(([name,lat,lng])=>({name:String(name),lat:Number(lat),lng:Number(lng)}));

const MIN_ZOOM=1;const MAX_ZOOM=3.2;const LABEL_ZOOM=1.45;
function point(p:Province){return{left:((p.lng-26)/19)*100,top:(42.2-p.lat)/6.8*100}}

export function SkyParcelMap({onViewportChange,center}:Props){
 const [zoom,setZoom]=useState(1);const [selected,setSelected]=useState<string|null>(null);
 useEffect(()=>{onViewportChange?.({minLat:center.lat-1,minLng:center.lng-1,maxLat:center.lat+1,maxLng:center.lng+1})},[center.lat,center.lng,onViewportChange]);
 const selectedProvince=useMemo(()=>PROVINCES.find(p=>p.name===selected),[selected]);
 const changeZoom=(delta:number)=>setZoom(z=>Math.max(MIN_ZOOM,Math.min(MAX_ZOOM,Number((z+delta).toFixed(2)))));
 const wheel=(e:React.WheelEvent<HTMLDivElement>)=>{e.preventDefault();changeZoom(e.deltaY<0?.15:-.15)};
 const choose=(p:Province)=>{setSelected(p.name);window.dispatchEvent(new CustomEvent("myskyparcel:province-selected",{detail:p}))};
 return <div className="relative h-[350px] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] sm:h-[420px] lg:h-[469px]" onWheel={wheel}>
   <div className="absolute right-4 top-4 z-40 flex flex-col overflow-hidden rounded-xl border border-white/15 bg-black/45 shadow-lg backdrop-blur-md">
     <button type="button" onClick={()=>changeZoom(.25)} className="h-10 w-10 text-xl text-white hover:bg-white/10" aria-label="Yakınlaştır">+</button>
     <div className="border-y border-white/10 px-2 py-1 text-center text-[9px] text-cyan-100/70">{Math.round(zoom*100)}%</div>
     <button type="button" onClick={()=>changeZoom(-.25)} className="h-10 w-10 text-xl text-white hover:bg-white/10" aria-label="Uzaklaştır">−</button>
     <button type="button" onClick={()=>setZoom(1)} className="border-t border-white/10 px-2 py-2 text-[9px] text-white/60 hover:bg-white/10">Sıfırla</button>
   </div>
   <div className="absolute inset-0 cursor-zoom-in" onDoubleClick={()=>changeZoom(.35)}>
    <div className="absolute inset-0 flex items-center justify-center" style={{transform:`scale(${zoom})`,transformOrigin:"50% 50%",transition:"transform 180ms ease-out"}}>
      <img src="/images/cities/turkey-3d-map.png" alt="Türkiye 3D harita" className="block h-full w-full object-contain" draggable={false}/>
      {PROVINCES.map((p,i)=>{const xy=point(p);const active=selected===p.name;return <button key={p.name} type="button" onClick={(e)=>{e.stopPropagation();choose(p)}} aria-label={`${p.name} ilini seç`} title={p.name} className="absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/70 bg-cyan-300/70 shadow-[0_0_7px_rgba(34,211,238,.9)] transition-all duration-150 hover:scale-125" style={{left:`${xy.left}%`,top:`${xy.top}%`,width:zoom>=LABEL_ZOOM?10:7,height:zoom>=LABEL_ZOOM?10:7,opacity:zoom>=LABEL_ZOOM?.92:.55}}><span className={`pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-cyan-200/20 bg-[#03111d]/90 px-1.5 py-0.5 text-[8px] font-medium text-cyan-50 backdrop-blur-sm ${zoom>=LABEL_ZOOM||active?"block":"hidden"}`}>{p.name}</span></button>})}
    </div>
   </div>
   <div className="absolute left-4 top-4 z-40 rounded-xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-md"><div className="text-[9px] uppercase tracking-[.2em] text-cyan-200/60">Türkiye</div><div className="text-xs font-semibold text-white">81 İl · İnteraktif Harita</div></div>
   {selectedProvince&&<div className="absolute bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-xl border border-cyan-200/25 bg-[#03111d]/90 px-4 py-2 text-center shadow-lg backdrop-blur-md"><div className="text-[9px] uppercase tracking-[.16em] text-cyan-200/55">Seçilen İl</div><div className="text-sm font-semibold text-white">{selectedProvince.name}</div></div>}
   <div className="pointer-events-none absolute bottom-4 right-4 z-40 rounded-lg border border-white/10 bg-black/35 px-2 py-1 text-[9px] text-white/55 backdrop-blur-md">Fare tekeri veya + / − ile yakınlaştır</div>
 </div>;
}
