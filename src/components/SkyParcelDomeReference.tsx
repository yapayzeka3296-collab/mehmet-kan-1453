import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Parcel } from "@/types/parcel";

type Props={parcels:Parcel[];selectedId:string|null;onSelect:(id:string)=>void};
type Tier="digital"|"elite"|"premium"; type V={x:number;y:number};
type Cell={parcel:Parcel;sector:number;points:V[];center:V;tier:Tier};
const COLORS:Record<Tier,string>={digital:"#45b8ff",elite:"#a979ff",premium:"#f1b84b"};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const wrap=(v:number)=>((v-1)%100+100)%100+1;
function sectorOf(p:Parcel){const m=p.parcel_number.match(/(?:^|-)S(\d+)(?:-|$)/i);return m?clamp(+m[1],1,100):1;}
function rowOf(p:Parcel){const m=p.parcel_number.match(/(?:^|-)P(\d+)(?:-|$)/i);return m?clamp(+m[1]-1,0,9):0;}
function tierFor(row:number):Tier{return row<5?"digital":row<8?"elite":"premium";}

/** Fresh spherical dome. Initial viewport: S001-S006 x P01-P10 = 60 real parcels. */
export function SkyParcelDomeReference({parcels,selectedId,onSelect}:Props){
 const [yaw,setYaw]=useState(0),[pitch,setPitch]=useState(0);
 const drag=useRef({active:false,pointerId:-1,x:0,y:0,moved:false});
 const bySector=useMemo(()=>{const m=new Map<number,Map<number,Parcel>>();for(const p of parcels){const s=sectorOf(p),r=rowOf(p);if(!m.has(s))m.set(s,new Map());m.get(s)!.set(r,p);}return m;},[parcels]);
 // +3 makes the initial six-sector window exactly S001..S006.
 const centerSector=wrap(Math.round(yaw/(Math.PI*2)*100)+3);
 const visible=Array.from({length:6},(_,i)=>wrap(centerSector-2+i));
 const cells=useMemo<Cell[]>(()=>{const out:Cell[]=[];const cx=500,cy=394+pitch*18,rx=405,ry=286,step=Math.PI/18,start=-step*3;
  for(let col=0;col<6;col++){const s=visible[col],rows=bySector.get(s);if(!rows)continue;const a0=start+col*step,a1=a0+step;
   for(let row=0;row<10;row++){const p=rows.get(row);if(!p)continue;const e0=Math.PI/2-(row/10)*(Math.PI/2-.08),e1=Math.PI/2-((row+1)/10)*(Math.PI/2-.08);const project=(e:number,a:number):V=>({x:cx+rx*Math.cos(e)*Math.sin(a),y:cy-ry*Math.sin(e)});const p00=project(e0,a0),p01=project(e0,a1),p11=project(e1,a1),p10=project(e1,a0);out.push({parcel:p,sector:s,points:[p00,p01,p11,p10],center:{x:(p00.x+p01.x+p11.x+p10.x)/4,y:(p00.y+p01.y+p11.y+p10.y)/4},tier:tierFor(row)});}
  }return out;},[bySector,pitch,centerSector]);
 const down=(e:ReactPointerEvent<SVGSVGElement>)=>{drag.current={active:true,pointerId:e.pointerId,x:e.clientX,y:e.clientY,moved:false};e.currentTarget.setPointerCapture(e.pointerId);};
 const move=(e:ReactPointerEvent<SVGSVGElement>)=>{if(!drag.current.active||drag.current.pointerId!==e.pointerId)return;const dx=e.clientX-drag.current.x,dy=e.clientY-drag.current.y;if(Math.abs(dx)+Math.abs(dy)>4)drag.current.moved=true;setYaw(v=>v+dx*.012);setPitch(v=>clamp(v-dy*.006,-1,1));drag.current.x=e.clientX;drag.current.y=e.clientY;};
 const up=(e:ReactPointerEvent<SVGSVGElement>)=>{if(drag.current.pointerId!==e.pointerId)return;drag.current.active=false;try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{}};
 return <div className="relative -mt-14 w-full select-none sm:-mt-20"><svg viewBox="0 0 1000 540" className="block h-[510px] w-full touch-none overflow-visible sm:h-[570px]" role="img" aria-label="Havada duran dijital gökyüzü kubbesi" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
  <defs><linearGradient id="skyDomeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#237fca" stopOpacity=".18"/><stop offset=".48" stopColor="#14588e" stopOpacity=".075"/><stop offset=".82" stopColor="#0b3158" stopOpacity=".025"/><stop offset="1" stopColor="#06192d" stopOpacity="0"/></linearGradient><linearGradient id="skyEdge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#75caff" stopOpacity=".52"/><stop offset=".62" stopColor="#4aa8f0" stopOpacity=".18"/><stop offset="1" stopColor="#4aa8f0" stopOpacity="0"/></linearGradient><filter id="domeGlow"><feGaussianBlur stdDeviation="7"/></filter><filter id="selectionGlow"><feGaussianBlur stdDeviation="6"/></filter></defs>
  <path d="M70 396 A430 330 0 0 1 930 396 L930 432 L70 432 Z" fill="url(#skyDomeFill)" pointerEvents="none"/><path d="M72 396 A428 328 0 0 1 928 396" fill="none" stroke="url(#skyEdge)" strokeWidth="18" opacity=".22" filter="url(#domeGlow)" pointerEvents="none"/><path d="M82 396 A418 318 0 0 1 918 396" fill="none" stroke="url(#skyEdge)" strokeWidth="2" opacity=".5" pointerEvents="none"/>
  {Array.from({length:11},(_,row)=>{const e=Math.PI/2-(row/10)*(Math.PI/2-.08),y=394+pitch*18-286*Math.sin(e),half=405*Math.cos(e)*Math.sin(Math.PI/6);return <path key={`lat${row}`} d={`M${500-half} ${y} Q500 ${y-(10-row)*5} ${500+half} ${y}`} fill="none" stroke="#62baff" strokeWidth={row===10?1.7:1.25} opacity={Math.max(.3,.74-row*.045)} pointerEvents="none"/>;})}
  {Array.from({length:7},(_,i)=>{const a=-Math.PI/6+i*Math.PI/18,b=500+405*Math.cos(.08)*Math.sin(a);return <path key={`lon${i}`} d={`M500 108 Q${500+(b-500)*.35} 245 ${b} ${394+pitch*18-286*Math.sin(.08)}`} fill="none" stroke="#4daaf5" strokeWidth="1.25" opacity=".6" pointerEvents="none"/>;})}
  {cells.map(({parcel,sector,points,center,tier})=>{const color=COLORS[tier],selected=parcel.id===selectedId,poly=points.map(p=>`${p.x},${p.y}`).join(" ");return <g key={parcel.id}>{selected&&<polygon points={poly} fill={color} opacity=".5" filter="url(#selectionGlow)" pointerEvents="none"/>}<polygon points={poly} fill={selected?color:"rgba(4,22,42,.34)"} fillOpacity={selected?.58:.9} stroke={color} strokeWidth={selected?3:1.8} opacity=".98" pointerEvents="all" style={{cursor:"pointer"}} onClick={e=>{e.stopPropagation();if(!drag.current.moved)onSelect(parcel.id);}}/><text x={center.x} y={center.y+1} textAnchor="middle" dominantBaseline="middle" fill="#edf8ff" fontSize="9" fontWeight="700" pointerEvents="none">S{String(sector).padStart(3,"0")}</text>{selected&&<g pointerEvents="none"><path d={`M${center.x} ${center.y-8}l2.3 5 5.4.6-4 3.5 1.2 5.3-4.9-2.8-4.9 2.8 1.2-5.3-4-3.5 5.4-.6Z`} fill="#fff7cf"/><rect x={center.x+15} y={center.y-31} width={Math.max(122,parcel.parcel_number.length*7.1)} height="28" rx="7" fill="#06172a" stroke={color} strokeWidth="1.4"/><text x={center.x+25} y={center.y-13} fill="#fff" fontSize="11" fontWeight="700">{parcel.parcel_number}</text></g>}</g>;})}
  <path d="M90 394 Q500 430 910 394 L910 468 L90 468 Z" fill="url(#skyDomeFill)" opacity=".42" pointerEvents="none"/><text x="500" y="486" textAnchor="middle" fill="#72bfff" fontSize="9" letterSpacing="2.1" opacity=".48" pointerEvents="none">HAVADA ASILI DİJİTAL GÖKYÜZÜ</text>
 </svg><button type="button" onClick={()=>{setYaw(0);setPitch(0);}} className="absolute right-3 top-0 rounded-md border border-sky-400/20 bg-slate-950/65 px-3 py-2 text-[10px] text-sky-100 backdrop-blur-sm">↻ SIFIRLA</button></div>;
}
