import { useEffect, useMemo, useState } from "react";
import type { Parcel } from "@/types/parcel";
import { PARCEL_CART_EVENT, readParcelCart, writeParcelCart, type ParcelCartItem } from "@/lib/parcelCart";

type CityCenter={lat:number;lng:number};
type ViewportBounds={minLat:number;minLng:number;maxLat:number;maxLng:number};
type FocusTarget={city:CityCenter;parcel:CityCenter;token:string};
type Props={parcels:Parcel[];selectedId:string|null;selectedIds?:Set<string>;multiSelect?:boolean;onSelect:(id:string|null)=>void;onToggleSelect?:(id:string)=>void;onViewportChange?:(bounds:ViewportBounds)=>void;center:CityCenter;focusTarget?:FocusTarget|null};
type Tier="digital"|"elite"|"premium";

const colors:Record<Tier,string>={digital:"#55c9ff",elite:"#b77cff",premium:"#f6c453"};
const TURKEY_BOUNDS={minLat:35.75,maxLat:42.15,minLng:25.65,maxLng:44.85};
function parcelColor(p:Parcel){return p.status==="sold"?"#ff1744":colors[p.tier as Tier]||"#55c9ff"}
function cartItem(p:Parcel):ParcelCartItem|undefined{const tier=p.tier;if(tier!=="digital"&&tier!=="elite"&&tier!=="premium")return;return{id:p.id,parcel_number:p.parcel_number,city_name:p.city_name,tier,tier_price:Number(p.tier_price??(tier==="digital"?199:tier==="elite"?499:999))}}
function geoPos(p:Parcel){const lat=Number(p.latitude),lng=Number(p.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;const x=(lng-TURKEY_BOUNDS.minLng)/(TURKEY_BOUNDS.maxLng-TURKEY_BOUNDS.minLng);const y=(TURKEY_BOUNDS.maxLat-lat)/(TURKEY_BOUNDS.maxLat-TURKEY_BOUNDS.minLat);return{left:Math.max(3,Math.min(97,x*100)),top:Math.max(4,Math.min(96,y*100))}}

export function SkyParcelMap({parcels,selectedId,selectedIds=new Set(),multiSelect=false,onSelect,onToggleSelect,onViewportChange,center,focusTarget}:Props){
 const [focus,setFocus]=useState(false);const [hover,setHover]=useState<string|null>(null);
 const groups=useMemo(()=>{const g:Record<Tier,Parcel[]>={digital:[],elite:[],premium:[]};parcels.forEach(p=>{if(p.tier in g)g[p.tier as Tier].push(p)});return g},[parcels]);
 const availableCount=useMemo(()=>parcels.filter(p=>p.status==="available").length,[parcels]);
 useEffect(()=>{onViewportChange?.({minLat:TURKEY_BOUNDS.minLat,minLng:TURKEY_BOUNDS.minLng,maxLat:TURKEY_BOUNDS.maxLat,maxLng:TURKEY_BOUNDS.maxLng})},[onViewportChange]);
 useEffect(()=>{if(!focusTarget)return;setFocus(true);const t=window.setTimeout(()=>setFocus(false),6000);return()=>window.clearTimeout(t)},[focusTarget?.token]);
 const click=(p:Parcel)=>{if(p.status!=="available")return;const item=cartItem(p);if(multiSelect&&item){const c=readParcelCart();const exists=c.some(x=>x.id===p.id);const next=exists?c.filter(x=>x.id!==p.id):[...c,item];writeParcelCart(next);window.dispatchEvent(new CustomEvent(PARCEL_CART_EVENT,{detail:next}));onToggleSelect?.(p.id)}else onSelect(p.id)};
 return <div className="relative h-[350px] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] sm:h-[420px] lg:h-[469px]">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(30,112,160,.30),transparent_32%),radial-gradient(circle_at_18%_18%,rgba(94,60,180,.18),transparent_28%),linear-gradient(145deg,#030b17,#071a2d_52%,#020711)]"/>
  <div className="absolute inset-0 opacity-60" style={{backgroundImage:"radial-gradient(circle,rgba(255,255,255,.7) .8px,transparent .9px)",backgroundSize:"31px 31px"}}/>
  <div className={`absolute inset-0 z-[1] flex items-center justify-center overflow-hidden px-3 py-4 sm:px-6 transition-transform duration-[1400ms] ease-out ${focus?"scale-[1.08]":"scale-100"}`}>
   <img src="/images/cities/turkey-3d-map.png" alt="Türkiye 3D haritası" className="h-full w-full object-contain drop-shadow-[0_0_35px_rgba(44,190,255,.22)]" />
  </div>
  <div className="absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_50%,transparent_42%,rgba(1,7,17,.32)_100%)]"/>
  <div className="absolute left-5 top-5 z-20 rounded-xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-md"><div className="text-[10px] uppercase tracking-[.28em] text-cyan-200/60">MySkyParcel</div><div className="mt-1 text-sm font-semibold text-white">Gökyüzü Parselleri</div></div>
  <div className="absolute inset-0 z-10">
   {(["digital","elite","premium"] as Tier[]).map(t=>groups[t].map(p=>{const xy=geoPos(p);if(!xy)return null;const selected=selectedId===p.id||selectedIds.has(p.id)||readParcelCart().some(x=>x.id===p.id);const c=parcelColor(p);return <button key={p.id} type="button" disabled={p.status!=="available"} aria-label={p.parcel_number} onClick={()=>click(p)} onMouseEnter={()=>setHover(p.id)} onMouseLeave={()=>setHover(null)} className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-[4px] border sm:h-6 sm:w-6" style={{left:`${xy.left}%`,top:`${xy.top}%`,borderColor:selected?"#fff4b0":c,background:selected?"rgba(255,211,92,.28)":"rgba(4,18,30,.72)",boxShadow:selected?"0 0 8px #fff4b0,0 0 22px rgba(255,211,92,.8)":hover===p.id?`0 0 8px ${c},0 0 20px ${c}99`:`0 0 5px ${c}66`,opacity:p.status==="sold"?.88:1}}><span className="absolute inset-[5px] rounded-full" style={{background:c}}/>{(hover===p.id||selected)&&<span className="pointer-events-none absolute left-1/2 top-[-28px] -translate-x-1/2 whitespace-nowrap rounded bg-[#020914]/90 px-2 py-1 text-[9px] text-white">{p.parcel_number}</span>}</button>}))}
  </div>
  <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[10px] text-white/70 backdrop-blur-md">{availableCount.toLocaleString("tr-TR")} parsel</div>
 </div>;
}

// Turkey 3D map image is the visual base; parcel coordinates are projected against Turkey's geographic bounds.