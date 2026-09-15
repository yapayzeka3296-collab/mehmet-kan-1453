import { Camera, Compass, LocateFixed, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Gps = { latitude: number; longitude: number; accuracy: number | null };
type Parcel = { id: string; parcel_number: string; latitude: number; longitude: number; distanceMeters: number; bearing: number };
type Orientation = { heading: number | null; pitch: number | null; absolute: boolean; source: string };

const EARTH = 6371000;
const RADIUS = 5000;
const H_FOV = 100;
const MAX_RENDER = 300;
const norm = (n: number) => ((n % 360) + 360) % 360;
const rad = (n: number) => n * Math.PI / 180;
const delta = (target: number, current: number) => ((target - current + 540) % 360) - 180;
const distance = (a: Gps, b: Pick<Parcel, "latitude" | "longitude">) => {
  const p1 = rad(a.latitude), p2 = rad(b.latitude), dp = p2 - p1, dl = rad(b.longitude - a.longitude);
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * EARTH * Math.asin(Math.min(1, Math.sqrt(h)));
};
const bearing = (a: Gps, b: Pick<Parcel, "latitude" | "longitude">) => {
  const p1 = rad(a.latitude), p2 = rad(b.latitude), dl = rad(b.longitude - a.longitude);
  return norm(Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl)) * 180 / Math.PI);
};
const directionFromNorth = (b: number) => ["K", "KD", "D", "GD", "G", "GB", "B", "KB"][Math.round(norm(b) / 45) % 8];

function screenAngle() {
  const a = screen.orientation?.angle;
  return typeof a === "number" ? a : (window as Window & { orientation?: number }).orientation ?? 0;
}

function readHeading(e: DeviceOrientationEvent) {
  const x = e as DeviceOrientationEvent & { webkitCompassHeading?: number };
  if (typeof x.webkitCompassHeading === "number" && Number.isFinite(x.webkitCompassHeading)) {
    return { heading: norm(x.webkitCompassHeading), absolute: true, source: "iOS pusula" };
  }
  if (typeof e.alpha !== "number" || !Number.isFinite(e.alpha)) return null;
  let h = norm(360 - e.alpha);
  const angle = screenAngle();
  if (angle === 90) h = norm(h + 90);
  else if (angle === 180) h = norm(h + 180);
  else if (angle === 270) h = norm(h - 90);
  return { heading: h, absolute: e.absolute === true || e.type === "deviceorientationabsolute", source: e.absolute === true || e.type === "deviceorientationabsolute" ? "Android mutlak pusula" : "Telefon yön sensörü" };
}

async function requestPermissions() {
  const D = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> };
  const M = window.DeviceMotionEvent as typeof DeviceMotionEvent & { requestPermission?: () => Promise<PermissionState> };
  if (typeof D.requestPermission === "function" && await D.requestPermission() !== "granted") return false;
  if (typeof M.requestPermission === "function") { try { await M.requestPermission(); } catch {} }
  return true;
}

export function SkyScanExperienceV7() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const watchRef = useRef<number | null>(null);
  const gpsRef = useRef<Gps | null>(null);
  const lastFetchRef = useRef({ at: 0, lat: 0, lon: 0 });
  const requestSeqRef = useRef(0);
  const cleanupRef = useRef<(() => void) | null>(null);
  const orientationRef = useRef<Orientation>({ heading: null, pitch: null, absolute: false, source: "Bekleniyor" });

  const [started, setStarted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [gps, setGps] = useState<Gps | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [orientation, setOrientation] = useState(orientationRef.current);
  const [sensorStatus, setSensorStatus] = useState("Başlatılmayı bekliyor");
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(false);
  const [parcelError, setParcelError] = useState<string | null>(null);

  const loadParcels = useCallback(async (p: Gps, force = false) => {
    const now = Date.now();
    const last = lastFetchRef.current;
    const moved = last.at ? distance({ latitude: last.lat, longitude: last.lon, accuracy: null }, p) : Infinity;
    if (!force && last.at && now - last.at < 5000 && moved < 75) return;
    lastFetchRef.current = { at: now, lat: p.latitude, lon: p.longitude };
    const seq = ++requestSeqRef.current;
    setLoading(true);
    setParcelError(null);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 9000);
    try {
      const city = await supabaseBrowser.from("cities").select("id").eq("slug", "gaziantep").eq("is_active", true).maybeSingle().abortSignal(controller.signal);
      if (city.error) throw city.error;
      if (!city.data) throw new Error("Gaziantep ili bulunamadı.");
      const latD = RADIUS / 111320;
      const lonD = RADIUS / Math.max(111320 * Math.cos(rad(p.latitude)), 1);
      const q = await supabaseBrowser.from("sky_scan_parcels")
        .select("id,parcel_id,parcel_number,latitude,longitude")
        .eq("city_id", city.data.id)
        .gte("latitude", p.latitude - latD).lte("latitude", p.latitude + latD)
        .gte("longitude", p.longitude - lonD).lte("longitude", p.longitude + lonD)
        .limit(1000).abortSignal(controller.signal);
      if (q.error) throw q.error;
      const rows = (q.data ?? []).map((x: any) => {
        const point = { latitude: Number(x.latitude), longitude: Number(x.longitude) };
        return { id: String(x.parcel_id ?? x.id), parcel_number: String(x.parcel_number ?? "—"), latitude: point.latitude, longitude: point.longitude, distanceMeters: distance(p, point), bearing: bearing(p, point) };
      }).filter(x => Number.isFinite(x.latitude) && Number.isFinite(x.longitude) && x.distanceMeters <= RADIUS)
        .sort((a, b) => a.distanceMeters - b.distanceMeters).slice(0, MAX_RENDER);
      if (seq === requestSeqRef.current) {
        setParcels(rows);
        if (!rows.length) setParcelError("Bu konumun 5 km çevresinde Sky Scan parseli bulunamadı.");
      }
    } catch (e) {
      if (seq === requestSeqRef.current) setParcelError(e instanceof DOMException && e.name === "AbortError" ? "Parsel sorgusu zaman aşımına uğradı. Yenile ile tekrar deneyin." : e instanceof Error ? e.message : "Parseller alınamadı.");
    } finally {
      window.clearTimeout(timer);
      if (seq === requestSeqRef.current) setLoading(false);
    }
  }, []);

  const startSensors = useCallback(async () => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    setSensorStatus("Sensör izni kontrol ediliyor…");
    try {
      if (!(await requestPermissions())) { setSensorStatus("Sensör izni verilmedi"); return; }
      if (!("DeviceOrientationEvent" in window)) { setSensorStatus("Bu telefonda yön sensörü desteklenmiyor"); return; }
      let got = false;
      let absoluteSeen = false;
      const onOrientation = (e: DeviceOrientationEvent) => {
        const h = readHeading(e);
        if (!h) return;
        if (h.absolute) absoluteSeen = true;
        if (absoluteSeen && !h.absolute) return;
        got = true;
        const next = { heading: h.heading, pitch: typeof e.beta === "number" ? e.beta : null, absolute: h.absolute || absoluteSeen, source: h.source };
        orientationRef.current = next;
        setOrientation(next);
        setSensorStatus(next.absolute ? "Pusula aktif" : "Yön sensörü aktif — kuzey doğrulanıyor");
      };
      const onMotion = (e: DeviceMotionEvent) => {
        if (!got && e.accelerationIncludingGravity) setSensorStatus("Hareket sensörü aktif — pusula aranıyor…");
      };
      window.addEventListener("deviceorientationabsolute", onOrientation as EventListener, true);
      window.addEventListener("deviceorientation", onOrientation as EventListener, true);
      window.addEventListener("devicemotion", onMotion as EventListener, true);
      const timer = window.setTimeout(() => { if (!got) setSensorStatus("Yön verisi alınamadı — telefon sensör ayarlarını kontrol edin"); }, 6000);
      cleanupRef.current = () => {
        window.clearTimeout(timer);
        window.removeEventListener("deviceorientationabsolute", onOrientation as EventListener, true);
        window.removeEventListener("deviceorientation", onOrientation as EventListener, true);
        window.removeEventListener("devicemotion", onMotion as EventListener, true);
      };
    } catch (e) { setSensorStatus(e instanceof Error ? `Sensör: ${e.message}` : "Sensör başlatılamadı"); }
  }, []);

  const start = useCallback(async () => {
    setStarted(true);
    setCameraError(null);
    setGpsError(null);
    if (navigator.geolocation) {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = navigator.geolocation.watchPosition(pos => {
        const next: Gps = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : null };
        gpsRef.current = next;
        setGps(next);
        void loadParcels(next);
      }, e => setGpsError(e.code === 1 ? "Konum izni verilmedi." : e.code === 2 ? "Konum bulunamadı." : "GPS verisi alınamadı."), { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 });
    } else setGpsError("Tarayıcı GPS desteği vermiyor.");
    void startSensors();
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Kamera erişimi desteklenmiyor.");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      streamRef.current = stream;
      if (!videoRef.current) throw new Error("Kamera görüntüsü hazırlanamadı.");
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraReady(true);
    } catch (e) { setCameraError(e instanceof Error ? e.message : "Kamera açılamadı."); }
  }, [loadParcels, startSensors]);

  const stop = useCallback(() => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    watchRef.current = null;
    cleanupRef.current?.();
    cleanupRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStarted(false);
    setCameraReady(false);
  }, []);
  useEffect(() => () => stop(), [stop]);

  const projected = useMemo(() => {
    if (orientation.heading === null) return [] as Array<Parcel & { left: number; top: number }>;
    const groups = new Map<number, number>();
    return parcels.flatMap(p => {
      const dx = delta(p.bearing, orientation.heading!);
      if (Math.abs(dx) > H_FOV / 2) return [];
      const bucket = Math.round(dx / 5);
      const i = groups.get(bucket) ?? 0;
      groups.set(bucket, i + 1);
      return [{ ...p, left: Math.max(3, Math.min(97, 50 + dx / (H_FOV / 2) * 46 + (i % 2 ? 4 : -4))), top: Math.max(15, Math.min(80, 48 + (i % 5 - 2) * 8)) }];
    });
  }, [orientation, parcels]);

  const nearest = parcels[0] ?? null;
  const nearestDelta = nearest && orientation.heading !== null ? delta(nearest.bearing, orientation.heading) : null;
  const direction = nearestDelta === null ? "Pusula bekleniyor" : Math.abs(nearestDelta) <= 10 ? "Tam önünde" : Math.abs(nearestDelta) >= 160 ? "Arkanda" : nearestDelta > 0 ? `Sağında → ${Math.round(Math.abs(nearestDelta))}°` : `Solunda ← ${Math.round(Math.abs(nearestDelta))}°`;

  return <main className="fixed inset-0 z-[70] overflow-hidden bg-black text-white">
    <video ref={videoRef} muted playsInline autoPlay className="absolute inset-0 h-full w-full object-cover" />
    {!started && <div className="absolute inset-0 z-50 grid place-items-center bg-black/55 p-6"><button onClick={start} className="rounded-2xl bg-white px-7 py-4 text-lg font-black text-black">Gökyüzünü Tara başlat</button></div>}
    <div className="absolute left-3 right-3 top-3 z-40 rounded-2xl border border-white/15 bg-black/70 p-3 backdrop-blur-xl">
      <div className="flex items-center justify-between"><b>Gökyüzünü Tara</b><button onClick={stop} aria-label="Kapat"><X size={18}/></button></div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div><Camera size={13} className="mr-1 inline"/>{cameraError ?? (cameraReady ? "Kamera aktif" : "Kamera bekleniyor")}</div>
        <div><Compass size={13} className="mr-1 inline"/>{sensorStatus}</div>
        <div><LocateFixed size={13} className="mr-1 inline"/>{gps ? `GPS ±${Math.round(gps.accuracy ?? 0)} m` : gpsError ?? "GPS bekleniyor"}</div>
        <div>{loading ? "Parseller aranıyor…" : `${parcels.length} parsel bulundu · ${projected.length} ekranda`}</div>
      </div>
      {orientation.heading !== null ? <div className="mt-2 text-sm font-bold">Yön {Math.round(orientation.heading)}° · {direction}</div> : <div className="mt-2 text-xs">Parseller GPS ile yüklenir; pusula gelince sağ/sol yönlendirme otomatik açılır.</div>}
      {parcelError && <div className="mt-2 text-xs text-red-200">{parcelError}</div>}
    </div>
    <div className="pointer-events-none absolute inset-0 z-20">{projected.map(p => <div key={p.id} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border border-cyan-200/70 bg-cyan-300/15 px-2 py-1.5 shadow-xl backdrop-blur-md" style={{ left: `${p.left}%`, top: `${p.top}%` }}><div className="text-[10px] font-black">{p.parcel_number}</div><div className="text-[9px]">{Math.round(p.distanceMeters)} m</div></div>)}</div>
    <div className="absolute bottom-4 left-3 right-3 z-40 rounded-2xl bg-black/75 p-3 backdrop-blur-xl">
      <div className="flex items-center justify-between text-xs"><div><b>Yakın:</b> {nearest ? `${nearest.parcel_number} · ${Math.round(nearest.distanceMeters)} m · ${directionFromNorth(nearest.bearing)}` : "—"}</div><div className="font-black">{direction}</div><button onClick={() => gpsRef.current && void loadParcels(gpsRef.current, true)} aria-label="Parselleri yenile"><RefreshCw size={17}/></button></div>
      {parcels.length > 0 && <div className="mt-2 flex gap-2 overflow-x-auto pb-1">{parcels.slice(0, 8).map(p => <div key={p.id} className="min-w-[115px] rounded-xl border border-white/15 bg-white/10 p-2 text-[10px]"><b>{p.parcel_number}</b><br/>{Math.round(p.distanceMeters)} m · {directionFromNorth(p.bearing)} · {Math.round(p.bearing)}°</div>)}</div>}
    </div>
  </main>;
}
