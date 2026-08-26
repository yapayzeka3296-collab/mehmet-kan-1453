import { useEffect, useMemo, useState } from "react";
import type { Parcel } from "@/types/parcel";
import { PARCEL_CART_EVENT, readParcelCart, writeParcelCart, type ParcelCartItem } from "@/lib/parcelCart";

type CityCenter={lat:number;lng:number};
type ViewportBounds={minLat:number;minLng:number;maxLat:number;maxLng:number};
type FocusTarget={city:CityCenter;parcel:CityCenter;token:string};
type Props={parcels:Parcel[];selectedId:string|null;selectedIds?:Set<string>;multiSelect?:boolean;onSelect:(id:string|null)=>void;onToggleSelect?:(id:string)=>void;onViewportChange?:(bounds:ViewportBounds)=>void;center:CityCenter;focusTarget?:FocusTarget|null};
type Tier="digital"|"elite"|"premium";

const colors:Record<Tier,string>={digital:"#55c9ff",elite:"#b77cff",premium:"#f6c453"};
function parcelColor(p:Parcel){return p.status==="sold"?"#ff1744":colors[p.tier as Tier]||"#55c9ff"}
function cartItem(p:Parcel):ParcelCartItem|undefined{const tier=p.tier;if(tier!=="digital"&&tier!=="elite"&&tier!=="premium")return;return{id:p.id,parcel_number:p.parcel_number,city_name:p.city_name,tier,tier_price:Number(p.tier_price??(tier==="digital"?199:tier==="elite"?499:999))}}
function geoPos(p:Parcel,center:CityCenter){const lat=Number(p.latitude),lng=Number(p.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;const halfLat=0.28,halfLng=0.24;return{left:Math.max(2,Math.min(98,50+((lng-center.lng)/halfLng)*46)),top:Math.max(4,Math.min(96,50-((lat-center.lat)/halfLat)*42))}}
function fallbackPos(i:number,total:number){const a=total>1?(i/total)*Math.PI*2:0;const ring=Math.floor(i/40);const r=30+ring*4;return{left:50+Math.cos(a)*r,top:50+Math.sin(a)*r*.72}}

export function SkyParcelMap({parcels,selectedId,selectedIds=new Set(),multiSelect=false,onSelect,onToggleSelect,onViewportChange,center,focusTarget}:Props){
 const [focus,setFocus]=useState(false);const [hover,setHover]=useState<string|null>(null);
 const groups=useMemo(()=>{const g:Record<Tier,Parcel[]>={digital:[],elite:[],premium:[]};parcels.forEach(p=>{if(p.tier in g)g[p.tier as Tier].push(p)});return g},[parcels]);
 const availableCount=useMemo(()=>parcels.filter(p=>p.status==="available").length,[parcels]);
 useEffect(()=>{onViewportChange?.({minLat:center.lat-1,minLng:center.lng-1,maxLat:center.lat+1,maxLng:center.lng+1})},[center.lat,center.lng,onViewportChange]);
 useEffect(()=>{if(!focusTarget)return;setFocus(true);const t=window.setTimeout(()=>setFocus(false),6000);return()=>window.clearTimeout(t)},[focusTarget?.token]);
 const click=(p:Parcel)=>{if(p.status!=="available")return;const item=cartItem(p);if(multiSelect&&item){const c=readParcelCart();const exists=c.some(x=>x.id===p.id);const next=exists?c.filter(x=>x.id!==p.id):[...c,item];writeParcelCart(next);window.dispatchEvent(new CustomEvent(PARCEL_CART_EVENT,{detail:next}));onToggleSelect?.(p.id)}else onSelect(p.id)};
 return <div className="relative h-[350px] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] sm:h-[420px] lg:h-[469px]">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(30,112,160,.30),transparent_32%),radial-gradient(circle_at_18%_18%,rgba(94,60,180,.18),transparent_28%),linear-gradient(145deg,#030b17,#071a2d_52%,#020711)]"/>
  <div className="absolute inset-0 opacity-60" style={{backgroundImage:"radial-gradient(circle,rgba(255,255,255,.7) .8px,transparent .9px)",backgroundSize:"31px 31px"}}/>
  <div className="absolute left-5 top-5 z-20 rounded-xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur-md"><div className="text-[10px] uppercase tracking-[.28em] text-cyan-200/60">MySkyParcel</div><div className="mt-1 text-sm font-semibold text-white">Gökyüzü Parselleri</div></div>
  <div className={`absolute inset-0 transition-transform duration-[1400ms] ease-out ${focus?"scale-[1.18]":"scale-100"}`}>
   <div className="absolute left-1/2 top-1/2 h-[92%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/10 bg-[radial-gradient(circle_at_48%_42%,rgba(48,170,220,.15),rgba(2,10,22,.02)_45%,rgba(0,0,0,.28)_72%)] shadow-[0_0_100px_rgba(40,190,255,.12)_inset]"/>
   {(["digital","elite","premium"] as Tier[]).map(t=>groups[t].map((p,i)=>{const xy=geoPos(p,center)??fallbackPos(i,groups[t].length);const selected=selectedId===p.id||selectedIds.has(p.id)||readParcelCart().some(x=>x.id===p.id);const c=parcelColor(p);return <button key={p.id} type="button" disabled={p.status!=="available"} aria-label={p.parcel_number} onClick={()=>click(p)} onMouseEnter={()=>setHover(p.id)} onMouseLeave={()=>setHover(null)} className="absolute z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-[4px] border sm:h-6 sm:w-6" style={{left:`${xy.left}%`,top:`${xy.top}%`,borderColor:selected?"#fff4b0":c,background:selected?"rgba(255,211,92,.22)":"rgba(4,18,30,.62)",boxShadow:selected?"0 0 8px #fff4b0,0 0 22px rgba(255,211,92,.8)":hover===p.id?`0 0 8px ${c},0 0 20px ${c}99`:`0 0 5px ${c}66`,opacity:p.status==="sold"?.88:1}}><span className="absolute inset-[5px] rounded-full" style={{background:c}}/>{(hover===p.id||selected)&&<span className="pointer-events-none absolute left-1/2 top-[-28px] -translate-x-1/2 whitespace-nowrap rounded bg-[#020914]/90 px-2 py-1 text-[9px] text-white">{p.parcel_number}</span>}</button>}))}
  </div>
  <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-[10px] text-white/55 backdrop-blur-md">{availableCount.toLocaleString("tr-TR")} parsel</div>
 </div>;
}

// Redeploy trigger only: restored baseline SkyParcelMap.