import { Camera, Compass, LocateFixed, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Parcel = { id: string; parcel_number: string; latitude: number; longitude: number; distanceMeters: number; bearing: number };
type Gps = { latitude: number; longitude: number; accuracy: number | null };

const R = 6371000;
const SEARCH_RADIUS = 5000;
const H_FOV = 100;
const norm = (n:number) => ((n % 360) + 360) % 360;
const rad = (n:number) => n * Math.PI / 180;
const delta = (a:number,b:number) => ((a-b+540)%360)-180;
const dist = (a:Gps,b:{latitude:number;longitude:number}) => {
  const p1=rad(a.latitude),p2=rad(b.latitude),dp=p2-p1,dl=rad(b.longitude-a.longitude);
  const h=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
};
const bearing = (a:Gps,b:{latitude:number;longitude:number}) => {
  const p1=rad(a.latitude),p2=rad(b.latitude),dl=rad(b.longitude-a.longitude);
  return norm(Math.atan2(Math.sin(dl)*Math.cos(p2),Math.cos(p1)*Math.sin(p2)-Math.sin(p1)*Math.cos(p2)*Math.cos(dl))*180/Math.PI);
};

function screenAngle(){
  const o=screen.orientation?.angle;
  if(typeof o === "number") return o;
  return (window as Window & {orientation?:number}).orientation ?? 0;
}

function getHeading(e:DeviceOrientationEvent){
  const w=e as DeviceOrientationEvent & {webkitCompassHeading?:number};
  if(typeof w.webkitCompassHeading === "number" && Number.isFinite(w.webkitCompassHeading)) return {heading:norm(w.webkitCompassHeading),absolute:true,source:"iOS pusula"};
  if(typeof e.alpha !== "number" || !Number.isFinite(e.alpha)) return null;
  let h=norm(360-e.alpha);
  const a=screenAngle();
  if(a===90) h=norm(h+90);
  else if(a===270) h=norm(h-90);
  else if(a===180) h=norm(h+180);
  return {heading:h,absolute:e.absolute===true,source:e.absolute===true?"Android mutlak pusula":"Android sensör"};
}

async function askPermission(){
  const D=window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {requestPermission?:()=>Promise<PermissionState>};
  const M=window.DeviceMotionEvent as typeof DeviceMotionEvent & {requestPermission?:()=>Promise<PermissionState>};
  if(typeof D.requestPermission === "function" && await D.requestPermission() !== "granted") return false;
  if(typeof M.requestPermission === "function") { try { await M.requestPermission(); } catch {} }
  return true;
}

export function SkyScanExperienceV6(){
  const videoRef=useRef<HTMLVideoElement|null>(null);
  const streamRef=useRef<MediaStream|null>(null);
  const watchRef=useRef<number|null>(null);
  const gpsRef=useRef<Gps|null>(null);
  const orientationRef=useRef<{heading:number|null;pitch:number|null;absolute:boolean;source:string}>({heading:null,pitch:null,absolute:false,source:"Bekleniyor"});
  const [started,setStarted]=useState(false);
  const [cameraReady,setCameraReady]=useState(false);
  const [cameraError,setCameraError]=useState<string|null>(null);
  const [gps,setGps]=useState<Gps|null>(null);
  const [gpsError,setGpsError]=useState<string|null>(null);
  const [orientation,setOrientation]=useState(orientationRef.current);
  const [sensorStatus,setSensorStatus]=useState("Bekleniyor");
  const [parcels,setParcels]=useState<Parcel[]>([]);
  const [parcelError,setParcelError]=useState<string|null>(null);
  const [loading,setLoading]=useState(false);

  const loadParcels=useCallback(async(p:Gps)=>{
    setLoading(true);setParcelError(null);
    try{
      const city=await supabaseBrowser.from("cities").select("id").eq("slug","gaziantep").eq("is_active",true).maybeSingle();
      if(city.error) throw city.error;
      if(!city.data) throw new Error("Gaziantep ili bulunamadı.");
      const latD=SEARCH_RADIUS/111320;
      const lonD=SEARCH_RADIUS/Math.max(111320*Math.cos(rad(p.latitude)),1);
      const q=await supabaseBrowser.from("sky_scan_parcels").select("id,parcel_id,parcel_number,latitude,longitude").eq("city_id",city.data.id).gte("latitude",p.latitude-latD).lte("latitude",p.latitude+latD).gte("longitude",p.longitude-lonD).lte("longitude",p.longitude+lonD).limit(1000);
      if(q.error) throw q.error;
      const rows=(q.data??[]).map((x:any)=>{const b={latitude:Number(x.latitude),longitude:Number(x.longitude)};return{id:String(x.parcel_id??x.id),parcel_number:String(x.parcel_number??"—"),latitude:b.latitude,longitude:b.longitude,distanceMeters:dist(p,b),bearing:bearing(p,b)}}).filter((x)=>Number.isFinite(x.latitude)&&Number.isFinite(x.longitude)&&x.distanceMeters<=SEARCH_RADIUS).sort((a,b)=>a.distanceMeters-b.distanceMeters).slice(0,300);
      setParcels(rows);
      if(!rows.length) setParcelError("5 km çevrede Sky Scan parseli bulunamadı.");
    }catch(e){setParcelError(e instanceof Error?e.message:"Parseller alınamadı.");}
    finally{setLoading(false);}
  },[]);

  const startSensors=useCallback(async()=>{
    setSensorStatus("Sensör başlatılıyor…");
    try{
      if(!(await askPermission())){setSensorStatus("Sensör izni verilmedi");return;}
      let got=false;
      let absoluteSeen=false;
      const onOrientation=(e:DeviceOrientationEvent)=>{
        const h=getHeading(e);
        if(!h) return;
        if(e.absolute===true || e.type==="deviceorientationabsolute") absoluteSeen=true;
        if(absoluteSeen && e.type!=="deviceorientationabsolute" && e.absolute!==true) return;
        got=true;
        const next={heading:h.heading,pitch:typeof e.beta==="number"?e.beta:null,absolute:h.absolute||absoluteSeen,source:h.source};
        orientationRef.current=next;setOrientation(next);
        setSensorStatus(next.absolute?"Pusula aktif":"Yön sensörü aktif — kalibrasyon gerekli");
      };
      const onMotion=()=>{if(!got) setSensorStatus("Hareket sensörü aktif — pusula verisi aranıyor…");};
      window.addEventListener("deviceorientationabsolute",onOrientation as EventListener,true);
      window.addEventListener("deviceorientation",onOrientation as EventListener,true);
      window.addEventListener("devicemotion",onMotion as EventListener,true);
      const timer=window.setTimeout(()=>{if(!got) setSensorStatus("Pusula verisi alınamadı — telefonu 8 çizerek hareket ettirin");},5000);
      return()=>{window.clearTimeout(timer);window.removeEventListener("deviceorientationabsolute",onOrientation as EventListener,true);window.removeEventListener("deviceorientation",onOrientation as EventListener,true);window.removeEventListener("devicemotion",onMotion as EventListener,true);};
    }catch(e){setSensorStatus(e instanceof Error?`Sensör: ${e.message}`:"Sensör başlatılamadı");}
    return undefined;
  },[]);

  const start=useCallback(async()=>{
    setStarted(true);setCameraError(null);setGpsError(null);
    if(navigator.geolocation){
      if(watchRef.current!==null) navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current=navigator.geolocation.watchPosition((p)=>{const n={latitude:p.coords.latitude,longitude:p.coords.longitude,accuracy:Number.isFinite(p.coords.accuracy)?p.coords.accuracy:null};gpsRef.current=n;setGps(n);void loadParcels(n);},(e)=>setGpsError(e.code===1?"Konum izni verilmedi.":"GPS verisi alınamadı."),{enableHighAccuracy:true,maximumAge:2000,timeout:15000});
    }else setGpsError("Tarayıcı GPS desteği vermiyor.");
    void startSensors();
    try{
      const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1920},height:{ideal:1080}},audio:false});
      streamRef.current=s;if(videoRef.current){videoRef.current.srcObject=s;await videoRef.current.play();setCameraReady(true);}
    }catch(e){setCameraError(e instanceof Error?e.message:"Kamera açılamadı.");}
  },[loadParcels,startSensors]);

  const stop=useCallback(()=>{if(watchRef.current!==null)navigator.geolocation.clearWatch(watchRef.current);watchRef.current=null;streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;if(videoRef.current)videoRef.current.srcObject=null;setStarted(false);setCameraReady(false);},[]);
  useEffect(()=>()=>stop(),[stop]);

  const projected=useMemo(()=>{
    if(orientation.heading===null)return {visible:[] as Array<Parcel & {left:number;top:number}>,offscreen:parcels};
    const visible:Array<Parcel & {left:number;top:number}>=[];const offscreen:Parcel[]=[];const groups=new Map<number,number>();
    for(const p of parcels){const dx=delta(p.bearing,orientation.heading);if(Math.abs(dx)>H_FOV/2){offscreen.push(p);continue;}const bucket=Math.round(dx/5),i=groups.get(bucket)??0;groups.set(bucket,i+1);visible.push({...p,left:Math.max(3,Math.min(97,50+dx/(H_FOV/2)*46+(i%2?5:-5))),top:Math.max(14,Math.min(80,50+(i%5-2)*8))});}
    return {visible,offscreen};
  },[orientation,parcels]);
  const nearest=parcels[0]??null;
  const nd=nearest&&orientation.heading!==null?delta(nearest.bearing,orientation.heading):null;
  const direction=nd===null?"Yön bekleniyor":Math.abs(nd)<=10?"Tam önünde":Math.abs(nd)>=160?"Arkanda":nd>0?`Sağında → ${Math.round(Math.abs(nd))}°`:`Solunda ← ${Math.round(Math.abs(nd))}°`;

  return <main className="fixed inset-0 z-[70] overflow-hidden bg-black text-white"><video ref={videoRef} muted playsInline autoPlay className="absolute inset-0 h-full w-full object-cover"/>
    {!started&&<div className="absolute inset-0 z-30 grid place-items-center bg-black/55 p-6"><button onClick={start} className="rounded-2xl bg-white px-7 py-4 text-lg font-black text-black shadow-2xl">Gökyüzünü Tara başlat</button></div>}
    <div className="absolute left-3 right-3 top-3 z-40 rounded-2xl border border-white/15 bg-black/60 p-3 backdrop-blur-xl"><div className="flex items-center justify-between"><div className="font-black">Gökyüzünü Tara</div><button onClick={stop} aria-label="Kapat"><X size={18}/></button></div><div className="mt-2 grid grid-cols-2 gap-2 text-xs"><div><Camera size={13} className="mr-1 inline"/>{cameraError??(cameraReady?"Kamera aktif":"Kamera bekleniyor")}</div><div><Compass size={13} className="mr-1 inline"/>{sensorStatus}</div><div><LocateFixed size={13} className="mr-1 inline"/>{gps?`GPS ±${Math.round(gps.accuracy??0)} m`:gpsError??"GPS bekleniyor"}</div><div>{loading?"Parseller yükleniyor…":`${parcels.length} parsel / ${projected.visible.length} ekranda`}</div></div>{orientation.heading!==null&&<div className="mt-2 text-sm font-bold">Pusula: {Math.round(orientation.heading)}° · {orientation.source} · {direction}</div>}{orientation.heading===null&&<div className="mt-2 text-xs">Pusula için telefonu 8 çizerek hareket ettirin. Kamera açık kalır.</div>}{parcelError&&<div className="mt-2 text-xs text-red-200">{parcelError}</div>}</div>
    <div className="pointer-events-none absolute inset-0 z-20">{projected.visible.map(p=><div key={p.id} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border border-cyan-200/70 bg-cyan-300/15 px-2 py-1.5 shadow-xl backdrop-blur-md" style={{left:`${p.left}%`,top:`${p.top}%`}}><div className="text-[10px] font-black">{p.parcel_number}</div><div className="text-[9px]">{p.distanceMeters<1000?`${Math.round(p.distanceMeters)} m`:`${(p.distanceMeters/1000).toFixed(1)} km`}</div></div>)}</div>
    <div className="absolute bottom-4 left-3 right-3 z-40 flex items-center justify-between rounded-2xl bg-black/65 p-3 text-xs backdrop-blur-xl"><div><b>Yakın:</b> {nearest?`${nearest.parcel_number} · ${Math.round(nearest.distanceMeters)} m`:"—"}</div><div className="font-black">{direction}</div><button onClick={()=>gpsRef.current&&void loadParcels(gpsRef.current)} aria-label="Yenile"><RefreshCw size={17}/></button></div>
  </main>;
}
