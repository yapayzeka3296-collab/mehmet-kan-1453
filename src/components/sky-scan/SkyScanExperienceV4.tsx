import { Camera, Compass, Crosshair, MapPin, Navigation, ShoppingCart, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { bearingDegrees, distanceMeters, formatDistance, normalizeAngle, type GeoPoint } from "@/components/sky-scan/geo";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type LocationState = GeoPoint & { accuracy: number; altitude: number | null };
type Parcel = { id:string; parcel_number:string; status:string; price:number|string|null; tier:string; tier_price:number|string|null; city_name:string; city_slug:string; latitude:number; longitude:number };
type Nearby = Parcel & { distance:number; bearing:number };
type OrientationLike = DeviceOrientationEvent & { webkitCompassHeading?: number };

const MAX_RANGE = 3000;
const MIN_REFRESH_METERS = 35;
const REFRESH_MS = 2500;
const DEFAULT_FOV = 68;
const EARTH_RADIUS = 6371000;
const SKY_ENTER = 7;
const SKY_EXIT = 4;
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const rad=(n:number)=>n*Math.PI/180;
const deg=(n:number)=>n*180/Math.PI;
const tierPrice=(t:string)=>t==="premium"?699:t==="elite"?349:149;

function haversine(a:GeoPoint,b:GeoPoint){return distanceMeters(a,b);}
function local(a:GeoPoint,b:GeoPoint){const lat=rad((a.latitude+b.latitude)/2);return {east:rad(b.longitude-a.longitude)*EARTH_RADIUS*Math.cos(lat),north:rad(b.latitude-a.latitude)*EARTH_RADIUS};}
function parcelHeight(d:number){return clamp(55+d*.035,55,180);}
function pose(event:DeviceOrientationEvent){
  const alpha=rad(event.alpha??0), beta=rad(event.beta??0), gamma=rad(event.gamma??0);
  const screenAngle=typeof screen!=="undefined"&&screen.orientation?Number(screen.orientation.angle)||0:0;
  const ca=Math.cos(alpha),sa=Math.sin(alpha),cb=Math.cos(beta),sb=Math.sin(beta),cg=Math.cos(gamma),sg=Math.sin(gamma);
  const x=ca*sg-sa*sb*cg;
  const y=sb;
  const z=ca*cg+sa*sb*sg;
  let heading=normalizeAngle(deg(Math.atan2(x,-z))-screenAngle);
  if(!Number.isFinite(heading)) heading=0;
  return {heading,pitch:clamp(deg(Math.asin(clamp(y,-1,1))),-89,89)};
}

function project(p:Nearby,l:LocationState,heading:number,pitch:number,fov:number,w:number,h:number){
  const rel=normalizeAngle(p.bearing-heading);
  const verticalFov=fov*(h/Math.max(1,w));
  const targetPitch=deg(Math.atan2(parcelHeight(p.distance),Math.max(1,p.distance)));
  const relPitch=targetPitch-pitch;
  if(Math.abs(rel)>fov*.72||Math.abs(relPitch)>verticalFov*.72)return null;
  const uncertainty=clamp(l.accuracy/Math.max(50,p.distance),0,.75);
  const e=local(l,p);
  return { ...p,left:50+(rel/fov)*100,top:50-(relPitch/verticalFov)*100,scale:clamp(1.4/Math.sqrt(p.distance/1000+.35),.52,1.5),opacity:clamp(.98-uncertainty*.45-p.distance/MAX_RANGE*.2,.32,.98),depth:Math.hypot(e.east,e.north,parcelHeight(p.distance)),occluded:false };
}

export function SkyScanExperienceV4(){
  const rootRef=useRef<HTMLDivElement|null>(null); const videoRef=useRef<HTMLVideoElement|null>(null); const streamRef=useRef<MediaStream|null>(null);
  const lastFetchRef=useRef<GeoPoint|null>(null); const lastFetchAt=useRef(0); const requestSeq=useRef(0);
  const sensorMode=useRef<"absolute"|"relative"|null>(null); const relativeBase=useRef<number|null>(null); const absoluteGraceUntil=useRef(0);
  const [location,setLocation]=useState<LocationState|null>(null); const [locationError,setLocationError]=useState<string|null>(null);
  const [nearby,setNearby]=useState<Nearby[]>([]); const [parcelLoading,setParcelLoading]=useState(false); const [parcelError,setParcelError]=useState<string|null>(null);
  const [heading,setHeading]=useState<number|null>(null); const [pitch,setPitch]=useState<number|null>(null); const [roll,setRoll]=useState(0);
  const [cameraStarted,setCameraStarted]=useState(false); const [cameraReady,setCameraReady]=useState(false); const [cameraError,setCameraError]=useState<string|null>(null);
  const [orientationStarted,setOrientationStarted]=useState(false); const [orientationError,setOrientationError]=useState<string|null>(null); const [sensorTick,setSensorTick]=useState(0);
  const [selected,setSelected]=useState<Nearby|null>(null); const [skyMode,setSkyMode]=useState(false); const [fov,setFov]=useState(DEFAULT_FOV);

  useEffect(()=>{if(!navigator.geolocation){setLocationError("Bu cihaz konum bilgisini desteklemiyor.");return;}const id=navigator.geolocation.watchPosition(p=>setLocation({latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:Math.max(1,p.coords.accuracy||999),altitude:typeof p.coords.altitude==="number"?p.coords.altitude:null}),e=>setLocationError(e.message||"Konum alınamadı."),{enableHighAccuracy:true,maximumAge:1000,timeout:15000});return()=>navigator.geolocation.clearWatch(id)},[]);

  const fetchParcels=useCallback(async(l:LocationState,force=false)=>{
    if(!supabaseBrowser)return; const now=Date.now(); const moved=lastFetchRef.current?haversine(lastFetchRef.current,l):Infinity;
    if(!force&&moved<MIN_REFRESH_METERS&&now-lastFetchAt.current<REFRESH_MS)return;
    const seq=++requestSeq.current; lastFetchRef.current={latitude:l.latitude,longitude:l.longitude}; lastFetchAt.current=now; setParcelLoading(true); setParcelError(null);
    const radiusMeters=clamp(Math.max(900,l.accuracy*8),900,MAX_RANGE); const latDelta=radiusMeters/111320; const lngDelta=radiusMeters/(111320*Math.max(.2,Math.cos(rad(l.latitude))));
    const {data,error}=await supabaseBrowser.rpc("sky_scan_parcels",{p_min_lat:l.latitude-latDelta,p_min_lng:l.longitude-lngDelta,p_max_lat:l.latitude+latDelta,p_max_lng:l.longitude+lngDelta,p_limit:100});
    if(seq!==requestSeq.current)return;
    if(error){setParcelError(error.message||"Yakındaki parseller alınamadı.");setNearby([]);setParcelLoading(false);return;}
    const maxRange=clamp(Math.max(1200,l.accuracy*20),1500,MAX_RANGE);
    const rows=(data??[]) as Parcel[];
    const sorted=rows.map(p=>({...p,distance:distanceMeters(l,p),bearing:bearingDegrees(l,p)})).filter(p=>p.distance<=maxRange).sort((a,b)=>a.distance-b.distance);
    setNearby(sorted); setParcelLoading(false);
  },[]);

  useEffect(()=>{if(location)void fetchParcels(location,true)},[location?.latitude,location?.longitude,location?.accuracy,fetchParcels]);
  useEffect(()=>{if(!location)return;const timer=window.setInterval(()=>void fetchParcels(location),REFRESH_MS);return()=>window.clearInterval(timer)},[location,fetchParcels]);

  useEffect(()=>{if(!orientationStarted)return;let absoluteSeen=false;let got=false;absoluteGraceUntil.current=Date.now()+700;
    const accept=(e:DeviceOrientationEvent,absolute:boolean)=>{const x=e as OrientationLike;const hasAlpha=typeof e.alpha==="number";const hasTilt=typeof e.beta==="number"&&typeof e.gamma==="number";if(!hasTilt)return;
      if(absolute){absoluteSeen=true;sensorMode.current="absolute";const raw=typeof x.webkitCompassHeading==="number"&&Number.isFinite(x.webkitCompassHeading)?x.webkitCompassHeading:pose(e).heading;setHeading(normalizeAngle(raw));}
      else {if(absoluteSeen||sensorMode.current==="absolute"||Date.now()<absoluteGraceUntil.current)return;if(!hasAlpha)return;sensorMode.current="relative";const raw=pose(e).heading;if(relativeBase.current===null)relativeBase.current=raw;setHeading(normalizeAngle(raw-relativeBase.current));}
      const q=pose(e);setPitch(v=>v===null?q.pitch:v*.8+q.pitch*.2);setRoll(clamp((e.gamma??0)*.25,-20,20));got=true;setSensorTick(Date.now());setOrientationError(null);
    };
    const onAbs=(e:Event)=>accept(e as DeviceOrientationEvent,true);const onRel=(e:Event)=>accept(e as DeviceOrientationEvent,false);
    window.addEventListener("deviceorientationabsolute",onAbs,true);window.addEventListener("deviceorientation",onRel,true);
    const timer=window.setTimeout(()=>{if(!got)setOrientationError("Sensör verisi alınamadı. Kamera açık kalacak; veri geldiğinde tarama otomatik başlayacak.")},3500);
    return()=>{window.removeEventListener("deviceorientationabsolute",onAbs,true);window.removeEventListener("deviceorientation",onRel,true);window.clearTimeout(timer)};
  },[orientationStarted]);

  useEffect(()=>{const p=pitch??-90;setSkyMode(v=>v?p>=SKY_EXIT:p>=SKY_ENTER)},[pitch]);

  const startCamera=useCallback(async()=>{if(!window.isSecureContext)throw new Error("Kamera yalnızca HTTPS bağlantısında çalışır.");const video=videoRef.current;if(!navigator.mediaDevices?.getUserMedia||!video)throw new Error("Bu tarayıcı kamera erişimini desteklemiyor.");const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1920,min:1280},height:{ideal:1080,min:720},frameRate:{ideal:30,max:60}},audio:false});streamRef.current=stream;video.srcObject=stream;video.muted=true;video.playsInline=true;await video.play();const track=stream.getVideoTracks()[0];const s=track?.getSettings?.();setFov(typeof s?.width==="number"&&typeof s?.height==="number"&&s.width>s.height?DEFAULT_FOV:DEFAULT_FOV);setCameraReady(true)},[]);

  const startScan=useCallback(async()=>{setCameraError(null);setOrientationError(null);setCameraReady(false);setSelected(null);sensorMode.current=null;relativeBase.current=null;absoluteGraceUntil.current=Date.now()+700;setHeading(null);setPitch(null);setOrientationStarted(false);
    const req=(DeviceOrientationEvent as typeof DeviceOrientationEvent&{requestPermission?:()=>Promise<PermissionState>}).requestPermission; if(req){try{if((await req())!=="granted")setOrientationError("Yön sensörü izni verilmedi. Kamera çalışır; izin verilince parseller yerleşir.")}catch{setOrientationError("Yön sensörü izni alınamadı. Kamera çalışır; sensör verisi geldiğinde tarama devam eder.")}}
    setOrientationStarted(true);try{await startCamera();setCameraStarted(true);if(location)void fetchParcels(location,true)}catch(e){streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;setCameraError(e instanceof Error?e.message:"Kamera başlatılamadı.");setCameraStarted(false);setCameraReady(false)}
  },[fetchParcels,location,startCamera]);
  const stopScan=useCallback(()=>{streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;if(videoRef.current){videoRef.current.pause();videoRef.current.srcObject=null}setCameraStarted(false);setCameraReady(false);setOrientationStarted(false);setHeading(null);setPitch(null);setSkyMode(false);setSelected(null)},[]);
  useEffect(()=>()=>{streamRef.current?.getTracks().forEach(t=>t.stop())},[]);

  const projected=useMemo(()=>{if(!location||!cameraReady||!skyMode||heading===null||pitch===null)return[];const r=rootRef.current?.getBoundingClientRect();return nearby.map(p=>project(p,location,heading,pitch,fov,r?.width??window.innerWidth,r?.height??window.innerHeight)).filter(Boolean) as Array<Nearby&{left:number;top:number;scale:number;opacity:number;depth:number;occluded:boolean}>},[cameraReady,fov,heading,location,nearby,pitch,roll,sensorTick,skyMode]);
  const nearest=nearby[0]??null;
  const status=parcelLoading?"Parseller yenileniyor…":parcelError?"Parsel verisi alınamadı":skyMode?`${projected.length} parsel görüş alanında`:"Gökyüzüne yöneltin";
  const buy=()=>{if(selected?.status==="available")window.location.href=`/parsel-satin-al?parcels=${encodeURIComponent(selected.id)}`};

  return <main ref={rootRef} className="fixed inset-0 overflow-hidden bg-slate-950 text-white">
    <video ref={videoRef} className={`absolute inset-0 z-0 h-full w-full object-cover ${cameraStarted?"block":"hidden"}`} playsInline muted autoPlay/>
    {!cameraStarted&&<div className="absolute inset-0 z-30 flex items-center justify-center px-6"><div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-950/90 p-7 text-center shadow-2xl"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-300/10"><Camera className="h-8 w-8 text-cyan-200"/></div><p className="mt-5 text-[10px] font-bold uppercase tracking-[.28em] text-cyan-300">MySkyParcel AR</p><h1 className="mt-2 text-2xl font-bold">Gökyüzünü Tara</h1><p className="mt-3 text-sm leading-6 text-white/65">GPS, pusula, jiroskop ve gerçek kamera görüntüsüyle yakındaki parselleri gökyüzünde göster.</p><button onClick={startScan} className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950">Kamerayı ve AR taramayı başlat</button>{locationError&&<p className="mt-3 text-xs text-amber-200">{locationError}</p>}{cameraError&&<p className="mt-3 text-xs text-red-200">{cameraError}</p>}</div></div>}
    {cameraStarted&&<><div className="absolute left-3 right-3 top-3 z-50 flex items-center justify-between"><div className="flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/60 px-3 py-2 backdrop-blur"><Crosshair className="h-4 w-4 text-cyan-200"/><span className="text-xs font-semibold">Gökyüzünü Tara</span></div><button onClick={stopScan} className="rounded-full border border-white/20 bg-slate-950/60 p-2"><X className="h-5 w-5"/></button></div>
      {orientationError&&<div className="absolute left-3 right-3 top-16 z-50 rounded-xl border border-amber-300/25 bg-black/70 px-3 py-2 text-center text-[11px] text-amber-100">{orientationError}</div>}
      {cameraReady&&!skyMode&&<div className="pointer-events-none absolute inset-x-4 top-[42%] z-30 flex justify-center"><div className="rounded-2xl border border-white/20 bg-slate-950/55 px-5 py-3 text-center"><div className="text-sm font-semibold">☁️ Gökyüzüne yöneltin</div><div className="mt-1 text-xs text-white/65">Telefonu yukarı kaldırın</div></div></div>}
      {cameraReady&&skyMode&&projected.map(p=><button key={p.id} onClick={()=>setSelected(p)} className="absolute z-30 -translate-x-1/2 -translate-y-1/2" style={{left:`${clamp(p.left,3,97)}%`,top:`${clamp(p.top,10,84)}%`,opacity:p.opacity,transform:`translateZ(${-Math.min(p.depth,1000)}px) scale(${p.scale}) rotateZ(${roll*.18}deg)`}}><div className="rounded-xl border border-cyan-100 bg-slate-950/80 px-3 py-2 text-center shadow-xl backdrop-blur"><div className="text-[11px] font-bold">P-{p.parcel_number}</div><div className="text-[9px] text-white/70">{p.city_name} · {formatDistance(p.distance)}</div><div className="text-[10px] font-bold text-amber-300">₺{p.price??p.tier_price??tierPrice(p.tier)}</div></div></button>)}
      {selected&&<div className="absolute bottom-28 left-3 right-3 z-50 mx-auto max-w-md rounded-3xl border border-white/15 bg-slate-950/90 p-4 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300">{selected.tier}</p><h2 className="mt-1 text-lg font-bold">P-{selected.parcel_number}</h2><p className="text-xs text-white/65">{selected.city_name} · {formatDistance(selected.distance)} · {Math.round(selected.bearing)}°</p></div><button onClick={()=>setSelected(null)} className="rounded-full bg-white/10 p-2"><X className="h-4 w-4"/></button></div><button disabled={selected.status!=="available"} onClick={buy} className="mt-3 w-full rounded-xl bg-cyan-300 px-4 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-40"><ShoppingCart className="mr-1 inline h-4 w-4"/>Satın Al</button></div>}
      <div className="absolute bottom-0 left-0 right-0 z-40 px-3 pb-3"><div className="mx-auto flex max-w-2xl items-center justify-between rounded-[28px] border border-white/15 bg-slate-950/75 px-4 py-3 shadow-2xl backdrop-blur-xl"><div className="text-center"><MapPin className="mx-auto h-5 w-5 text-cyan-200"/><p className="text-[10px] text-white/60">Görüşte</p><p className="text-sm font-bold">{projected.length}</p></div><div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-cyan-300/40"><Navigation className="h-7 w-7 text-cyan-100" style={{transform:`rotate(${heading??0}deg)`}}/><span className="absolute bottom-2 text-[9px]">{heading===null?"—":`${Math.round(heading)}°`}</span></div><div className="text-center"><Compass className="mx-auto h-5 w-5 text-cyan-200"/><p className="text-[10px] text-white/60">En yakın</p><p className="text-sm font-bold">{nearest?formatDistance(nearest.distance):"—"}</p><p className="text-[9px] text-white/55">{nearest?`${Math.round(nearest.bearing)}° yön`:parcelLoading?"taranıyor":"bekleniyor"}</p></div></div><div className="mx-auto mt-2 text-center text-[9px] text-white/55">{status} · ±{location?Math.round(location.accuracy):"—"} m GPS · FOV {Math.round(fov)}°</div></div>
    </>}
  </main>;
}
