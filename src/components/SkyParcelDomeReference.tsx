import { useEffect, useRef } from "react";
import type { MouseEvent, PointerEvent, WheelEvent } from "react";
import type { Parcel } from "@/types/parcel";

type Props = { parcels: Parcel[]; selectedId: string | null; onSelect: (id: string) => void };
type P = { x:number;y:number;z:number };
type Hit = { parcel:Parcel; points:P[]; center:P; depth:number; sector:number };
type State = { yaw:number; pitch:number; zoom:number; dragging:boolean; moved:boolean; lastX:number; lastY:number; vx:number; vy:number };
const TIER={digital:"#4da3ff",elite:"#b68cff",premium:"#e8ad3f"} as const;
const tier=(p:Parcel)=>p.tier==="elite"||p.tier==="premium"?p.tier:"digital";
const num=(p:Parcel)=>Number(p.parcel_number.split("-").pop()||1);
const sector=(p:Parcel)=>Math.max(1,Math.min(100,Math.ceil(num(p)/10)));
function rotate(p:P,yaw:number,pitch:number):P{const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);const x=p.x*cy-p.z*sy,z=p.x*sy+p.z*cy;return{x,y:p.y*cp-z*sp,z:p.y*sp+z*cp};}
function point(lon:number,e:number):P{const a=lon*Math.PI/180,r=e*Math.PI/180,c=Math.cos(r);return{x:c*Math.sin(a),y:Math.sin(r),z:c*Math.cos(a)};}
function star(ctx:CanvasRenderingContext2D,x:number,y:number,r:number){ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.38:r,px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();}

export function SkyParcelDomeReference({parcels,selectedId,onSelect}:Props){
 const canvasRef=useRef<HTMLCanvasElement>(null),selectedRef=useRef(selectedId),parcelsRef=useRef(parcels),hitsRef=useRef<Hit[]>([]);
 const state=useRef<State>({yaw:-.34,pitch:.08,zoom:1,dragging:false,moved:false,lastX:0,lastY:0,vx:0,vy:0});
 useEffect(()=>{selectedRef.current=selectedId;parcelsRef.current=parcels;},[selectedId,parcels]);
 useEffect(()=>{const canvas=canvasRef.current,ctx=canvas?.getContext("2d");if(!canvas||!ctx)return;let raf=0,w=0,h=0,dpr=1;
  const resize=()=>{const r=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);w=Math.max(320,r.width);h=Math.max(430,r.height);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);};
  const project=(p:P,r:number,cx:number,cy:number)=>({x:cx+p.x*r,y:cy-p.y*r,z:p.z});
  const draw=()=>{const s=state.current;if(!s.dragging){s.yaw+=s.vx;s.pitch+=s.vy;s.vx*=.94;s.vy*=.94;}s.pitch=Math.max(-.55,Math.min(.75,s.pitch));const radius=Math.min(w*.47,h*.43)*s.zoom,cx=w/2,baseY=h*.48;ctx.clearRect(0,0,w,h);
   const halo=ctx.createRadialGradient(cx,baseY-radius*.8,radius*.04,cx,baseY-radius*.35,radius*1.35);halo.addColorStop(0,"rgba(48,143,255,.10)");halo.addColorStop(.6,"rgba(48,143,255,.045)");halo.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,baseY,radius*1.25,Math.PI,Math.PI*2);ctx.fill();
   ctx.save();ctx.beginPath();ctx.rect(0,0,w,baseY+2);ctx.clip();const fill=ctx.createLinearGradient(cx,baseY-radius,cx,baseY);fill.addColorStop(0,"rgba(35,125,225,.11)");fill.addColorStop(.42,"rgba(14,78,145,.065)");fill.addColorStop(.74,"rgba(8,52,105,.025)");fill.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=fill;ctx.beginPath();ctx.arc(cx,baseY,radius,Math.PI,Math.PI*2);ctx.fill();
   for(let e=10;e<=84;e+=10){ctx.beginPath();let started=false;for(let lon=-90;lon<=90;lon+=3){const p=rotate(point(lon,e),s.yaw,s.pitch);if(p.z<-.04||p.y<0){started=false;continue;}const q=project(p,radius,cx,baseY);started?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);started=true;}ctx.lineWidth=.65;ctx.strokeStyle=`rgba(120,190,255,${(.055+e/84*.13).toFixed(3)})`;ctx.stroke();}
   for(let lon=-90;lon<=90;lon+=12){ctx.beginPath();let started=false;for(let e=0;e<=90;e+=3){const p=rotate(point(lon,e),s.yaw,s.pitch);if(p.z<-.04||p.y<0){started=false;continue;}const q=project(p,radius,cx,baseY);started?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y);started=true;}ctx.lineWidth=.6;ctx.strokeStyle="rgba(120,190,255,.12)";ctx.stroke();}

   // The 1,000 real Supabase parcels remain in data; the visible window moves with the dome.
   const source=[...parcelsRef.current].sort((a,b)=>num(a)-num(b));
   const total=source.length;const center=Math.floor((((s.yaw/(Math.PI*2))+0.5)%1+1)%1*Math.max(1,total));
   const start=(center+Math.round(s.pitch*total*.18))%Math.max(1,total);const visible:Parcel[]=[];
   for(let i=0;i<Math.min(60,total);i++){const p=source[(start+i)%total];if(p&&!visible.some(v=>v.id===p.id))visible.push(p);}
   const hits:Hit[]=[];const cols=10,rows=6,cellLon=180/cols,cellE=78/rows;
   visible.forEach((parcel,index)=>{const col=index%cols,row=Math.floor(index/cols);const t=tier(parcel);const statusRow=t==="premium"?0:t==="elite"?1:2;const lon0=-90+col*cellLon+1.8,lon1=-90+(col+1)*cellLon-1.8,e0=7+statusRow*cellE/3+row*(cellE*.72),e1=e0+cellE*.48;const raw=[point(lon0,e0),point(lon1,e0),point(lon1,e1),point(lon0,e1)].map(p=>rotate(p,s.yaw,s.pitch));const c=rotate(point((lon0+lon1)/2,(e0+e1)/2),s.yaw,s.pitch);if(c.z<.01||c.y<-.08)return;const q=project(c,radius,cx,baseY);hits.push({parcel,points:raw.map(p=>project(p,radius,cx,baseY)),center:q,depth:c.z,sector:sector(parcel)});});
   hits.sort((a,b)=>a.depth-b.depth);hitsRef.current=hits;
   for(const item of hits){const selected=item.parcel.id===selectedRef.current,color=TIER[tier(item.parcel)],vis=Math.max(.18,Math.min(1,item.depth));ctx.beginPath();item.points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=selected?`${color}dd`:`${color}${Math.round((.035+vis*.085)*255).toString(16).padStart(2,"0")}`;ctx.fill();ctx.lineWidth=selected?2.6:.75;ctx.strokeStyle=selected?color:`${color}${Math.round((.20+vis*.35)*255).toString(16).padStart(2,"0")}`;ctx.stroke();ctx.font="700 10px Inter,system-ui,sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=`rgba(238,247,255,${Math.min(.92,.48+vis*.4)})`;ctx.fillText(`S${item.sector}`,item.center.x,item.center.y);
    if(selected){ctx.save();ctx.shadowColor=color;ctx.shadowBlur=28;ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();item.points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.stroke();ctx.fillStyle="#fff7d6";star(ctx,item.center.x,item.center.y,Math.max(8,radius*.018));ctx.restore();const label=item.parcel.parcel_number;ctx.font="700 12px Inter,system-ui,sans-serif";ctx.textAlign="left";const lw=ctx.measureText(label).width+26,bx=Math.min(w-lw-12,Math.max(12,item.center.x+18)),by=Math.max(12,item.center.y-48);ctx.fillStyle="rgba(3,12,27,.97)";ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(bx,by,lw,32,7);ctx.fill();ctx.stroke();ctx.fillStyle="#fff";ctx.fillText(label,bx+13,by+21);}}
   // No yellow baseline: only a very subtle blue sky edge, strongest toward the top.
   ctx.save();ctx.lineWidth=1.4;ctx.shadowColor="rgba(77,165,255,.22)";ctx.shadowBlur=10;const edge=ctx.createLinearGradient(cx,baseY,cx,baseY-radius);edge.addColorStop(0,"rgba(80,160,240,0)");edge.addColorStop(.55,"rgba(80,160,240,.10)");edge.addColorStop(1,"rgba(124,198,255,.42)");ctx.strokeStyle=edge;ctx.beginPath();ctx.arc(cx,baseY,radius,Math.PI,Math.PI*2);ctx.stroke();ctx.restore();ctx.restore();raf=requestAnimationFrame(draw);};
  resize();window.addEventListener("resize",resize);raf=requestAnimationFrame(draw);return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
 },[]);
 const down=(e:PointerEvent<HTMLCanvasElement>)=>{const s=state.current;s.dragging=true;s.moved=false;s.vx=0;s.vy=0;s.lastX=e.clientX;s.lastY=e.clientY;e.currentTarget.setPointerCapture(e.pointerId);};
 const move=(e:PointerEvent<HTMLCanvasElement>)=>{const s=state.current;if(!s.dragging)return;const dx=e.clientX-s.lastX,dy=e.clientY-s.lastY;if(Math.abs(dx)+Math.abs(dy)>3)s.moved=true;s.yaw+=dx*.0068;s.pitch=Math.max(-.55,Math.min(.75,s.pitch+dy*.004));s.vx=dx*.00105;s.vy=dy*.0005;s.lastX=e.clientX;s.lastY=e.clientY;};
 const up=(e:PointerEvent<HTMLCanvasElement>)=>{state.current.dragging=false;try{e.currentTarget.releasePointerCapture(e.pointerId);}catch{}};
 const click=(e:MouseEvent<HTMLCanvasElement>)=>{if(state.current.moved)return;const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best:Hit|null=null;for(const item of hitsRef.current){const d=Math.hypot(x-item.center.x,y-item.center.y);if(d<30&&(!best||item.depth>best.depth||d<Math.hypot(x-best.center.x,y-best.center.y)))best=item;}if(best)onSelect(best.parcel.id);};
 const wheel=(e:WheelEvent<HTMLCanvasElement>)=>{e.preventDefault();state.current.zoom=Math.max(.84,Math.min(1.12,state.current.zoom-e.deltaY*.0005));};
 const reset=()=>{state.current.yaw=-.34;state.current.pitch=.08;state.current.zoom=1;state.current.vx=0;state.current.vy=0;};
 return <div className="relative w-full"><canvas ref={canvasRef} className="h-[500px] w-full touch-none select-none sm:h-[560px]" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClick={click} onWheel={wheel} aria-label="Havada duran dijital gökyüzü kubbesi"/><div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-gold/30 bg-navy-deep/70 px-4 py-2 text-[10px] text-muted-foreground"><span className="text-gold">Premium %20</span> · <span className="text-violet-300">Elit %30</span> · <span className="text-blue-300">Dijital %50</span></div><button type="button" onClick={reset} className="absolute right-3 top-3 rounded-md border border-gold/25 bg-navy-deep/65 px-3 py-2 text-[10px] text-gold backdrop-blur-sm">↻ SIFIRLA</button></div>;
}
