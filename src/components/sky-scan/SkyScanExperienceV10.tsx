import { Camera, Compass, LocateFixed, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Gps = { latitude: number; longitude: number; accuracy: number | null };
type Point = [number, number];
type Parcel = { id: string; parcel_number: string; latitude: number; longitude: number; distance: number; bearing: number; polygon: Point[] };
type Orientation = { heading: number | null; absolute: boolean; source: string; pitch: number | null };
type ProjectedParcel = Parcel & { x: number; y: number; depth: number; dx: number | null; markerX: number; markerY: number };

const RADIUS = 5000;
const EARTH = 6371000;
const FOV = 110;
const VFOV = 70;
const VISIBLE_LIMIT = 60;
const MARKER_MIN_DISTANCE = 7;

const normalize = (value: number) => ((value % 360) + 360) % 360;
const radians = (value: number) => (value * Math.PI) / 180;
const angleDelta = (target: number, heading: number) => normalize(target - heading + 540) - 180;

function haversine(a: Gps, b: { latitude: number; longitude: number }) {
  const p1 = radians(a.latitude); const p2 = radians(b.latitude); const dp = p2 - p1; const dl = radians(b.longitude - a.longitude);
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * EARTH * Math.asin(Math.min(1, Math.sqrt(h)));
}

function getBearing(a: Gps, b: { latitude: number; longitude: number }) {
  const p1 = radians(a.latitude); const p2 = radians(b.latitude); const dl = radians(b.longitude - a.longitude);
  const y = Math.sin(dl) * Math.cos(p2); const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return normalize((Math.atan2(y, x) * 180) / Math.PI);
}

function direction(value: number) {
  const names = ["K", "KD", "D", "GD", "G", "GB", "B", "KB"];
  return names[Math.round(normalize(value) / 45) % 8];
}

function pointInPolygon(point: Point, ring: Point[]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]; const [xj, yj] = ring[j];
    const intersects = (yi > point[1]) !== (yj > point[1]) && point[0] < ((xj - xi) * (point[1] - yi)) / ((yj - yi) || Number.EPSILON) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function polygonCentroid(ring: Point[]): Point {
  if (ring.length < 3) return ring[0] ?? [0, 0];
  let area = 0; let cx = 0; let cy = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i]; const [x2, y2] = ring[i + 1]; const f = x1 * y2 - x2 * y1;
    area += f; cx += (x1 + x2) * f; cy += (y1 + y2) * f;
  }
  if (Math.abs(area) < 1e-12) {
    const points = ring.slice(0, -1); const sum = points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
    return [sum[0] / Math.max(points.length, 1), sum[1] / Math.max(points.length, 1)];
  }
  return [cx / (3 * area), cy / (3 * area)];
}

function representativePoint(ring: Point[]): Point {
  const centroid = polygonCentroid(ring); if (pointInPolygon(centroid, ring)) return centroid;
  const points = ring.slice(0, -1); if (!points.length) return centroid;
  const sum = points.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0]);
  const average: Point = [sum[0] / points.length, sum[1] / points.length];
  return pointInPolygon(average, ring) ? average : points[0];
}

function parseGeometry(raw: unknown): Point[] {
  if (!raw) return [];
  if (typeof raw === "object") {
    const value = raw as any; const geometry = value.type === "Feature" ? value.geometry : value;
    if (geometry?.type === "Polygon" && Array.isArray(geometry.coordinates?.[0])) {
      return geometry.coordinates[0].map((p: unknown) => [Number((p as number[])[0]), Number((p as number[])[1])] as Point).filter((p: Point) => p.every(Number.isFinite));
    }
  }
  const text = String(raw).trim();
  if (/^POLYGON/i.test(text)) {
    const body = text.replace(/^POLYGON\s*\(\(/i, "").replace(/\)\)\s*$/i, "");
    return body.split(",").map((part) => part.trim().split(/\s+/).slice(0, 2).map(Number) as Point).filter((p) => p.every(Number.isFinite));
  }
  if (text.startsWith("{")) { try { return parseGeometry(JSON.parse(text)); } catch { return []; } }
  return [];
}

function readOrientation(event: DeviceOrientationEvent) {
  const value = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
  if (typeof value.webkitCompassHeading === "number" && Number.isFinite(value.webkitCompassHeading)) return { heading: normalize(value.webkitCompassHeading), absolute: true, source: "iOS pusula" };
  if (typeof event.alpha !== "number" || !Number.isFinite(event.alpha)) return null;
  let heading = normalize(360 - event.alpha); const screenAngle = window.screen.orientation?.angle ?? 0;
  if (screenAngle === 90) heading = normalize(heading + 90); if (screenAngle === 180) heading = normalize(heading + 180); if (screenAngle === 270) heading = normalize(heading - 90);
  const absolute = event.absolute === true || event.type === "deviceorientationabsolute";
  return { heading, absolute, source: absolute ? "Android mutlak pusula" : "Telefon yön sensörü" };
}

async function requestSensorPermission() {
  const Orientation = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> };
  if (typeof Orientation.requestPermission === "function") return (await Orientation.requestPermission()) === "granted";
  return true;
}

export function SkyScanExperienceV10() {
  const videoRef = useRef<HTMLVideoElement>(null); const streamRef = useRef<MediaStream | null>(null); const watchRef = useRef<number | null>(null);
  const lastFetchRef = useRef(0); const sequenceRef = useRef(0); const cleanupSensorRef = useRef<(() => void) | null>(null); const gpsRef = useRef<Gps | null>(null);
  const [orientation, setOrientation] = useState<Orientation>({ heading: null, absolute: false, source: "Bekleniyor", pitch: null });
  const [gps, setGps] = useState<Gps | null>(null); const [parcels, setParcels] = useState<Parcel[]>([]); const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false); const [camera, setCamera] = useState(false); const [status, setStatus] = useState("Başlatılmayı bekliyor"); const [error, setError] = useState<string | null>(null);

  const loadParcels = useCallback(async (position: Gps, force = false) => {
    const now = Date.now(); if (!force && now - lastFetchRef.current < 3500) return; lastFetchRef.current = now;
    const sequence = ++sequenceRef.current; const controller = new AbortController(); const timer = window.setTimeout(() => controller.abort(), 9000); setLoading(true); setError(null);
    try {
      const cityResult = await supabaseBrowser.from("cities").select("id").eq("slug", "gaziantep").eq("is_active", true).maybeSingle().abortSignal(controller.signal);
      if (cityResult.error || !cityResult.data) throw cityResult.error ?? new Error("Gaziantep ili bulunamadı.");
      const latDelta = RADIUS / 111320; const lonDelta = RADIUS / Math.max(111320 * Math.cos(radians(position.latitude)), 1);
      const result = await supabaseBrowser.from("sky_scan_parcels").select("id,parcel_id,parcel_number,latitude,longitude,parcels!sky_scan_parcels_parcel_id_fkey(geometry)").eq("city_id", cityResult.data.id).gte("latitude", position.latitude - latDelta).lte("latitude", position.latitude + latDelta).gte("longitude", position.longitude - lonDelta).lte("longitude", position.longitude + lonDelta).limit(2000).abortSignal(controller.signal);
      if (result.error) throw result.error;
      const rows = (result.data ?? []).map((row: any): Parcel | null => {
        const polygon = parseGeometry(row.parcels?.geometry); const fallback: Point = [Number(row.longitude), Number(row.latitude)]; const targetPoint = polygon.length >= 3 ? representativePoint(polygon) : fallback;
        const target = { latitude: Number(targetPoint[1]), longitude: Number(targetPoint[0]) }; if (!Number.isFinite(target.latitude) || !Number.isFinite(target.longitude)) return null;
        return { id: String(row.parcel_id ?? row.id), parcel_number: String(row.parcel_number ?? "—"), latitude: target.latitude, longitude: target.longitude, distance: haversine(position, target), bearing: getBearing(position, target), polygon };
      }).filter((row): row is Parcel => row !== null).filter((row) => row.distance <= RADIUS).sort((a, b) => a.distance - b.distance).slice(0, 300);
      if (sequence === sequenceRef.current) { setParcels(rows); if (!rows.length) setError("Bu konumun 5 km çevresinde Sky Scan parseli bulunamadı."); }
    } catch (err) {
      if (sequence === sequenceRef.current) setError(err instanceof DOMException && err.name === "AbortError" ? "Parsel sorgusu zaman aşımına uğradı." : err instanceof Error ? err.message : "Parseller alınamadı.");
    } finally { window.clearTimeout(timer); if (sequence === sequenceRef.current) setLoading(false); }
  }, []);

  const startSensors = useCallback(async () => {
    setStatus("Pusula başlatılıyor…"); const permitted = await requestSensorPermission(); if (!permitted) { setStatus("Sensör izni verilmedi"); return () => undefined; }
    let absoluteLocked = false; let received = false; let motionReceived = false;
    const onOrientation = (event: Event) => {
      const deviceEvent = event as DeviceOrientationEvent; const reading = readOrientation(deviceEvent); const beta = typeof deviceEvent.beta === "number" && Number.isFinite(deviceEvent.beta) ? deviceEvent.beta - 90 : null;
      if (!reading) return; if (absoluteLocked && !reading.absolute) return; if (reading.absolute) absoluteLocked = true; received = true;
      setOrientation({ heading: reading.heading, absolute: reading.absolute || absoluteLocked, source: reading.source, pitch: beta }); setStatus(reading.absolute || absoluteLocked ? "Pusula aktif" : "Telefon yön sensörü aktif");
    };
    const onMotion = () => { motionReceived = true; if (!received) setStatus("Hareket sensörü aktif — pusula bekleniyor"); };
    window.addEventListener("deviceorientationabsolute", onOrientation, true); window.addEventListener("deviceorientation", onOrientation, true); window.addEventListener("devicemotion", onMotion, true);
    const timeout = window.setTimeout(() => { if (!received && !motionReceived) setStatus("Sensör verisi alınamadı — hedefler yön sensörü bekliyor"); }, 6000);
    return () => { window.clearTimeout(timeout); window.removeEventListener("deviceorientationabsolute", onOrientation, true); window.removeEventListener("deviceorientation", onOrientation, true); window.removeEventListener("devicemotion", onMotion, true); };
  }, []);

  const stop = useCallback(() => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; cleanupSensorRef.current?.(); cleanupSensorRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; if (videoRef.current) videoRef.current.srcObject = null; setStarted(false); setCamera(false);
  }, []);

  const start = useCallback(async () => {
    setStarted(true); setError(null); cleanupSensorRef.current?.(); cleanupSensorRef.current = await startSensors();
    if (navigator.geolocation) {
      watchRef.current = navigator.geolocation.watchPosition((position) => {
        const next: Gps = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null };
        const previous = gpsRef.current; gpsRef.current = next; setGps(next); const improved = previous?.accuracy != null && next.accuracy != null && next.accuracy < previous.accuracy - 10; void loadParcels(next, improved);
      }, (positionError) => { setError(positionError.code === 1 ? "Konum izni verilmedi." : "GPS verisi alınamadı."); }, { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 });
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false }); streamRef.current = media;
      if (videoRef.current) { videoRef.current.srcObject = media; await videoRef.current.play(); setCamera(true); }
    } catch (err) { setError(err instanceof Error ? err.message : "Kamera açılamadı."); }
  }, [loadParcels, startSensors]);

  useEffect(() => () => stop(), [stop]);

  const projected = useMemo<ProjectedParcel[]>(() => {
    const base = parcels.slice(0, VISIBLE_LIMIT).map((parcel) => {
      const dx = orientation.heading == null ? null : angleDelta(parcel.bearing, orientation.heading); if (dx != null && Math.abs(dx) > FOV / 2) return null;
      const x = dx == null ? 50 : 50 + (dx / (FOV / 2)) * 43; const groundAngle = -(Math.atan2(1.6, Math.max(parcel.distance, 1)) * 180) / Math.PI;
      const y = orientation.pitch == null ? 55 : 50 - ((groundAngle - orientation.pitch) / (VFOV / 2)) * 40; return { ...parcel, x, y, depth: Math.min(1, parcel.distance / RADIUS), dx, markerX: x, markerY: y };
    }).filter(Boolean) as ProjectedParcel[];
    const placed: Array<{ x: number; y: number }> = [];
    return base.map((parcel) => {
      let markerX = parcel.x; let markerY = parcel.y; let attempts = 0;
      while (placed.some((p) => Math.hypot(p.x - markerX, p.y - markerY) < MARKER_MIN_DISTANCE) && attempts < 10) {
        const side = attempts % 2 === 0 ? 1 : -1; const step = Math.ceil((attempts + 1) / 2) * MARKER_MIN_DISTANCE;
        markerX = Math.max(4, Math.min(96, parcel.x + side * step)); markerY = Math.max(20, Math.min(80, parcel.y + (attempts % 3 === 0 ? -3 : attempts % 3 === 1 ? 3 : 0))); attempts += 1;
      }
      placed.push({ x: markerX, y: markerY }); return { ...parcel, markerX, markerY };
    });
  }, [orientation.heading, orientation.pitch, parcels]);

  const polygonLines = useMemo(() => {
    if (!gps) return [];
    return projected.map((parcel) => {
      if (parcel.polygon.length < 3) return null;
      const points = parcel.polygon.map(([longitude, latitude]) => { const b = getBearing(gps, { latitude, longitude }); const d = haversine(gps, { latitude, longitude }); const dx = orientation.heading == null ? 0 : angleDelta(b, orientation.heading); const groundAngle = -(Math.atan2(1.6, Math.max(d, 1)) * 180) / Math.PI; const x = 50 + (Math.max(-FOV / 2, Math.min(FOV / 2, dx)) / (FOV / 2)) * 43; const y = orientation.pitch == null ? 55 : 50 - ((groundAngle - orientation.pitch) / (VFOV / 2)) * 40; return [x, y] as Point; });
      return { id: parcel.id, points };
    }).filter(Boolean) as Array<{ id: string; points: Point[] }>;
  }, [gps, orientation.heading, orientation.pitch, projected]);

  const nearest = parcels[0]; const nearestDelta = nearest && orientation.heading != null ? angleDelta(nearest.bearing, orientation.heading) : null;

  return (
    <main className="fixed inset-0 z-[70] overflow-hidden bg-black text-white">
      <video ref={videoRef} muted playsInline autoPlay className="absolute inset-0 h-full w-full object-cover" />
      {!started && <div className="absolute inset-0 z-50 grid place-items-center bg-black/55"><button onClick={start} className="rounded-full border border-white/30 bg-white px-8 py-4 text-lg font-black text-black shadow-2xl">Gökyüzünü Tara</button></div>}
      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,.18)_70%,rgba(0,0,0,.55))]" />
      <div className="pointer-events-none absolute left-0 right-0 top-[48%] z-20 border-t border-white/20" /><div className="pointer-events-none absolute left-1/2 top-[48%] z-20 h-24 w-px -translate-x-1/2 bg-white/20" />
      <div className="absolute left-3 right-3 top-3 z-40 flex items-start justify-between"><div className="rounded-2xl border border-white/15 bg-black/45 px-3 py-2 text-xs backdrop-blur-md"><b>GÖKYÜZÜ TARAMA</b><div className="mt-1 flex gap-3 opacity-80"><span><Camera size={12} className="mr-1 inline" />{camera ? "Kamera" : "—"}</span><span><LocateFixed size={12} className="mr-1 inline" />{gps ? `±${Math.round(gps.accuracy ?? 0)}m` : "GPS…"}</span><span><Compass size={12} className="mr-1 inline" />{orientation.heading == null ? "Pusula…" : `${Math.round(orientation.heading)}°`}</span></div></div><button onClick={stop} className="pointer-events-auto rounded-full border border-white/20 bg-black/50 p-2 backdrop-blur-md"><X size={18} /></button></div>
      {started && <div className="pointer-events-none absolute inset-x-0 top-[11%] z-30 text-center"><div className="text-[10px] font-bold tracking-[.25em] text-white/60">{status.toUpperCase()}</div><div className="mt-1 text-xs text-white/75">{loading ? "Parseller taranıyor…" : `${parcels.length} parsel · 5 km çevre · ${projected.length} görünür`}</div></div>}
      <svg className="pointer-events-none absolute inset-0 z-[28] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">{polygonLines.map((line) => <polygon key={line.id} points={line.points.map(([x, y]) => `${Math.max(2, Math.min(98, x))},${Math.max(15, Math.min(85, y))}`).join(" ")} fill="none" stroke="rgba(125,211,252,.65)" strokeWidth="0.14" vectorEffect="non-scaling-stroke" />)}</svg>
      <div className="pointer-events-none absolute inset-0 z-30">{projected.map((parcel) => <div key={parcel.id} className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200" style={{ left: `${parcel.markerX}%`, top: `${parcel.markerY}%`, transform: `translate(-50%,-50%) scale(${1.1 - parcel.depth * 0.45})` }}><div className="relative flex flex-col items-center"><div className="h-3 w-3 rounded-full border border-cyan-100 bg-cyan-300/50 shadow-[0_0_22px_rgba(125,211,252,.9)]" /><div className="mt-1 whitespace-nowrap rounded-full border border-cyan-100/35 bg-black/40 px-2 py-1 text-[9px] font-bold tracking-wide backdrop-blur-sm">{parcel.parcel_number} <span className="font-normal opacity-80">{Math.round(parcel.distance)}m · {direction(parcel.bearing)}</span></div></div></div>)}</div>
      <div className="absolute bottom-5 left-1/2 z-40 w-[calc(100%-24px)] max-w-xl -translate-x-1/2 rounded-2xl border border-white/15 bg-black/55 px-4 py-3 text-center backdrop-blur-md">{error ? <div className="text-sm text-white/85">{error}</div> : nearest ? <div><div className="text-[10px] font-bold tracking-[.22em] text-white/55">EN YAKIN PARSEL</div><div className="mt-1 text-lg font-black">{nearest.parcel_number} · {Math.round(nearest.distance)} m</div><div className="mt-1 text-xs text-white/70">{nearestDelta == null ? `${direction(nearest.bearing)} yönü` : Math.abs(nearestDelta) < 12 ? "HEDEF ÖNÜNDE" : nearestDelta > 0 ? `SAĞA → ${Math.round(Math.abs(nearestDelta))}°` : `SOLA ← ${Math.round(Math.abs(nearestDelta))}°`}</div></div> : <div className="text-sm text-white/70">GPS ve yön sensörü bekleniyor…</div>}<button onClick={() => gps && void loadParcels(gps, true)} className="pointer-events-auto mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs"><RefreshCw size={13} /> Yenile</button></div>
    </main>
  );
}
