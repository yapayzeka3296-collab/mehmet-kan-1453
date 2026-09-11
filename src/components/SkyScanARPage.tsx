import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type ParcelTier = "digital" | "elite" | "premium";
type ScanParcel = {
  id: string;
  parcel_number: string;
  latitude: number;
  longitude: number;
  tier: ParcelTier;
  status: "available" | "reserved" | "sold";
  tier_price: number | null;
};
type Position = { latitude: number; longitude: number; accuracy: number; altitude: number | null };
type OrientationState = { heading: number | null; pitch: number; alpha: number | null; beta: number | null; gamma: number | null; source: "absolute" | "relative" | "motion" | "none" };

type Props = { citySlug?: string };

const EARTH_RADIUS = 6371000;
const QUERY_RADIUS_METERS = 5000;
const MAX_PARCELS = 1000;
const HORIZONTAL_FOV = 62;
const VERTICAL_FOV = 48;
const NEAR_SCALE = 1.65;
const FAR_SCALE = 0.62;
const MIN_REQUERY_MOVE = 45;
const MIN_REQUERY_ACCURACY_GAIN = 20;

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const normalizeAngle = (v: number) => ((v % 360) + 360) % 360;
const signedAngle = (v: number) => ((v + 540) % 360) - 180;

function haversineMeters(a: Position, b: Pick<ScanParcel, "latitude" | "longitude">) {
  const lat1 = THREE.MathUtils.degToRad(a.latitude);
  const lat2 = THREE.MathUtils.degToRad(b.latitude);
  const dLat = lat2 - lat1;
  const dLon = THREE.MathUtils.degToRad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(h));
}

function bearingDegrees(a: Position, b: Pick<ScanParcel, "latitude" | "longitude">) {
  const lat1 = THREE.MathUtils.degToRad(a.latitude);
  const lat2 = THREE.MathUtils.degToRad(b.latitude);
  const dLon = THREE.MathUtils.degToRad(b.longitude - a.longitude);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return normalizeAngle(THREE.MathUtils.radToDeg(Math.atan2(y, x)));
}

function compassLabel(degrees: number) {
  const labels = ["K", "KD", "D", "GD", "G", "GB", "B", "KB"];
  return labels[Math.round(normalizeAngle(degrees) / 45) % 8];
}

function distanceLabel(meters: number) {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

function requestOrientationPermission() {
  const ctor = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> };
  if (typeof ctor.requestPermission === "function") return ctor.requestPermission();
  return Promise.resolve("granted" as PermissionState);
}

function makeCrystal(tier: ParcelTier) {
  const color = tier === "premium" ? 0xffd35a : tier === "elite" ? 0xb46cff : 0x2ee6ff;
  const group = new THREE.Group();
  const geometry = new THREE.IcosahedronGeometry(1, 1);
  const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.5, transparent: true, opacity: 0.86, roughness: 0.2, metalness: 0.35 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.baseColor = color;
  group.add(mesh);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }));
  group.add(edge);
  return group;
}

function parcelWorldPosition(distance: number, bearing: number, relativePitch: number) {
  const horizontal = distance * Math.cos(THREE.MathUtils.degToRad(relativePitch));
  const b = THREE.MathUtils.degToRad(bearing);
  return new THREE.Vector3(Math.sin(b) * horizontal, Math.sin(THREE.MathUtils.degToRad(relativePitch)) * distance, -Math.cos(b) * horizontal);
}

export function SkyScanARPage({ citySlug = "gaziantep" }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupsRef = useRef(new Map<string, THREE.Group>());
  const parcelsRef = useRef<ScanParcel[]>([]);
  const positionRef = useRef<Position | null>(null);
  const orientationRef = useRef<OrientationState>({ heading: null, pitch: 0, alpha: null, beta: null, gamma: null, source: "none" });
  const lastQueryRef = useRef<Position | null>(null);
  const lastAccuracyRef = useRef<number>(Infinity);
  const lastFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const [cameraState, setCameraState] = useState<"idle" | "starting" | "ready" | "error">("idle");
  const [gpsState, setGpsState] = useState<"waiting" | "ready" | "denied" | "error">("waiting");
  const [sensorState, setSensorState] = useState<"waiting" | "ready" | "denied" | "unavailable">("waiting");
  const [position, setPosition] = useState<Position | null>(null);
  const [orientation, setOrientation] = useState<OrientationState>(orientationRef.current);
  const [parcels, setParcels] = useState<ScanParcel[]>([]);
  const [loadingParcels, setLoadingParcels] = useState(false);
  const [parcelError, setParcelError] = useState<string | null>(null);
  const [debug, setDebug] = useState(false);
  const [startMessage, setStartMessage] = useState<string | null>(null);

  const loadParcels = useCallback(async (p: Position) => {
    if (!supabaseBrowser) return;
    setLoadingParcels(true);
    setParcelError(null);
    try {
      const { data: city, error: cityError } = await supabaseBrowser.from("cities").select("id").eq("slug", citySlug).eq("is_active", true).maybeSingle();
      if (cityError) throw cityError;
      if (!city) throw new Error("İl bulunamadı.");
      const latDelta = QUERY_RADIUS_METERS / 111320;
      const lngDelta = QUERY_RADIUS_METERS / Math.max(111320 * Math.cos(THREE.MathUtils.degToRad(p.latitude)), 1);
      const { data, error } = await supabaseBrowser
        .from("sky_scan_parcels")
        .select("id,parcel_id,parcel_number,latitude,longitude,scan_order,parcels(status,tier,tier_price)")
        .eq("city_id", city.id)
        .gte("latitude", p.latitude - latDelta)
        .lte("latitude", p.latitude + latDelta)
        .gte("longitude", p.longitude - lngDelta)
        .lte("longitude", p.longitude + lngDelta)
        .order("scan_order", { ascending: true })
        .limit(MAX_PARCELS);
      if (error) throw error;
      const rows = (data ?? []).map((row: any): ScanParcel | null => {
        if (!Number.isFinite(Number(row.latitude)) || !Number.isFinite(Number(row.longitude))) return null;
        const joined = Array.isArray(row.parcels) ? row.parcels[0] : row.parcels;
        return {
          id: String(row.parcel_id ?? row.id),
          parcel_number: String(row.parcel_number ?? "—"),
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          tier: (joined?.tier ?? "digital") as ParcelTier,
          status: (joined?.status ?? "available") as ScanParcel["status"],
          tier_price: joined?.tier_price == null ? null : Number(joined.tier_price),
        };
      }).filter(Boolean) as ScanParcel[];
      const enriched = rows
        .map((row) => ({ ...row, distance: haversineMeters(p, row), bearing: bearingDegrees(p, row) }))
        .filter((row) => row.distance <= QUERY_RADIUS_METERS)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, MAX_PARCELS)
        .map(({ distance: _distance, bearing: _bearing, ...row }) => row);
      if (!mountedRef.current) return;
      parcelsRef.current = enriched;
      setParcels(enriched);
      lastQueryRef.current = p;
      lastAccuracyRef.current = p.accuracy;
    } catch (error) {
      if (mountedRef.current) setParcelError(error instanceof Error ? error.message : "Parseller alınamadı.");
    } finally {
      if (mountedRef.current) setLoadingParcels(false);
    }
  }, [citySlug]);

  const shouldRequery = useCallback((p: Position) => {
    const last = lastQueryRef.current;
    if (!last) return true;
    const moved = haversineMeters(last, p);
    const accuracyImproved = lastAccuracyRef.current - p.accuracy >= MIN_REQUERY_ACCURACY_GAIN;
    return moved >= MIN_REQUERY_MOVE || accuracyImproved || parcelsRef.current.length === 0;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let watchId: number | null = null;
    if (!navigator.geolocation) { setGpsState("error"); return; }
    watchId = navigator.geolocation.watchPosition(
      (geo) => {
        const next: Position = { latitude: geo.coords.latitude, longitude: geo.coords.longitude, accuracy: geo.coords.accuracy, altitude: geo.coords.altitude };
        positionRef.current = next;
        setPosition(next);
        setGpsState("ready");
        if (shouldRequery(next)) void loadParcels(next);
      },
      (error) => setGpsState(error.code === error.PERMISSION_DENIED ? "denied" : "error"),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    );
    return () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); };
  }, [loadParcels, shouldRequery]);

  const updateOrientation = useCallback((event: DeviceOrientationEvent, source: OrientationState["source"]) => {
    const alpha = typeof event.alpha === "number" ? event.alpha : null;
    const beta = typeof event.beta === "number" ? event.beta : null;
    const gamma = typeof event.gamma === "number" ? event.gamma : null;
    if (beta === null && gamma === null && alpha === null) return;
    const current = orientationRef.current;
    const heading = alpha === null ? current.heading : normalizeAngle(360 - alpha);
    const pitch = beta === null ? current.pitch : clamp(beta - 90, -90, 90);
    const next = { heading, pitch, alpha, beta, gamma, source };
    orientationRef.current = next;
    setOrientation(next);
    if (sensorState !== "ready") setSensorState("ready");
  }, [sensorState]);

  const startSensors = useCallback(async () => {
    try {
      const permission = await requestOrientationPermission();
      if (permission === "denied") { setSensorState("denied"); return; }
      const absoluteHandler = (event: DeviceOrientationEvent) => {
        if (event.absolute || (typeof event.alpha === "number" && orientationRef.current.source === "none")) updateOrientation(event, "absolute");
      };
      const relativeHandler = (event: DeviceOrientationEvent) => {
        if (!event.absolute && orientationRef.current.source !== "absolute") updateOrientation(event, "relative");
      };
      const motionHandler = (event: DeviceMotionEvent) => {
        const rotation = event.rotationRate;
        if (rotation && (rotation.alpha !== null || rotation.beta !== null || rotation.gamma !== null)) {
          const current = orientationRef.current;
          if (current.source === "none") setSensorState("ready");
        }
      };
      window.addEventListener("deviceorientationabsolute", absoluteHandler as EventListener, true);
      window.addEventListener("deviceorientation", relativeHandler as EventListener, true);
      window.addEventListener("devicemotion", motionHandler as EventListener, true);
      const timeout = window.setTimeout(() => {
        if (orientationRef.current.source === "none" && orientationRef.current.heading === null) setSensorState("unavailable");
      }, 5000);
      return () => {
        window.clearEventListener?.("deviceorientationabsolute", absoluteHandler as EventListener, true);
        window.removeEventListener("deviceorientationabsolute", absoluteHandler as EventListener, true);
        window.removeEventListener("deviceorientation", relativeHandler as EventListener, true);
        window.removeEventListener("devicemotion", motionHandler as EventListener, true);
        window.clearTimeout(timeout);
      };
    } catch {
      setSensorState("denied");
      return undefined;
    }
  }, [updateOrientation]);

  const startCamera = useCallback(async () => {
    setCameraState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      if (!mountedRef.current) { stream.getTracks().forEach((track) => track.stop()); return; }
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraState("ready");
    } catch (error) {
      setCameraState("error");
      setStartMessage(error instanceof Error ? error.message : "Kamera başlatılamadı.");
    }
  }, []);

  const startAR = useCallback(async () => {
    setStartMessage(null);
    await startCamera();
    void startSensors();
  }, [startCamera, startSensors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(HORIZONTAL_FOV, 1, 0.1, QUERY_RADIUS_METERS * 1.5);
    camera.rotation.order = "YXZ";
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(0, 10, 5);
    scene.add(key);
    scene.fog = new THREE.FogExp2(0x07111c, 0.00028);
    sceneRef.current = scene; cameraRef.current = camera; rendererRef.current = renderer;
    const resize = () => { const width = window.innerWidth; const height = window.innerHeight; renderer.setSize(width, height, false); camera.aspect = width / Math.max(height, 1); camera.fov = VERTICAL_FOV; camera.updateProjectionMatrix(); };
    resize(); window.addEventListener("resize", resize);
    let disposed = false;
    const animate = (time: number) => {
      if (disposed) return;
      rafRef.current = requestAnimationFrame(animate);
      if (time - lastFrameRef.current < 30) return;
      lastFrameRef.current = time;
      const current = orientationRef.current;
      const heading = current.heading ?? 0;
      const pitch = current.pitch;
      camera.rotation.set(THREE.MathUtils.degToRad(-pitch), THREE.MathUtils.degToRad(-heading), 0, "YXZ");
      const pos = positionRef.current;
      groupsRef.current.forEach((group, id) => {
        const parcel = parcelsRef.current.find((p) => p.id === id);
        if (!parcel || !pos) return;
        const bearing = bearingDegrees(pos, parcel);
        const rel = signedAngle(bearing - heading);
        const targetPitch = 22;
        const point = parcelWorldPosition(Math.max(haversineMeters(pos, parcel), 15), bearing, targetPitch);
        group.position.copy(point);
        const distance = haversineMeters(pos, parcel);
        const scale = clamp(NEAR_SCALE - (distance / QUERY_RADIUS_METERS) * (NEAR_SCALE - FAR_SCALE), FAR_SCALE, NEAR_SCALE);
        group.scale.setScalar(scale * 2.2);
        const opacity = clamp(0.95 - distance / QUERY_RADIUS_METERS * 0.55, 0.25, 0.95);
        group.traverse((child) => { const mat = (child as THREE.Mesh).material as THREE.Material | undefined; if (mat && "opacity" in mat) { mat.transparent = true; mat.opacity = opacity; } });
        group.rotation.y += 0.008;
        group.visible = Math.abs(rel) <= HORIZONTAL_FOV * 0.72;
      });
      renderer.render(scene, camera);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { disposed = true; window.removeEventListener("resize", resize); if (rafRef.current) cancelAnimationFrame(rafRef.current); groupsRef.current.forEach((group) => group.traverse((child) => { const mesh = child as THREE.Mesh; mesh.geometry?.dispose?.(); const material = mesh.material as THREE.Material | undefined; material?.dispose?.(); })); renderer.dispose(); sceneRef.current = null; cameraRef.current = null; rendererRef.current = null; };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const ids = new Set(parcels.map((p) => p.id));
    groupsRef.current.forEach((group, id) => { if (!ids.has(id)) { scene.remove(group); groupsRef.current.delete(id); } });
    for (const parcel of parcels) {
      if (!groupsRef.current.has(parcel.id)) { const group = makeCrystal(parcel.tier); group.userData.parcelId = parcel.id; scene.add(group); groupsRef.current.set(parcel.id, group); }
    }
  }, [parcels]);

  const derived = useMemo(() => {
    if (!position || parcels.length === 0) return { nearest: null as null | (ScanParcel & { distance: number; bearing: number; relative: number }), visible: 0 };
    const rows = parcels.map((p) => ({ ...p, distance: haversineMeters(position, p), bearing: bearingDegrees(position, p), relative: signedAngle(bearingDegrees(position, p) - (orientation.heading ?? 0)) }));
    const nearest = rows[0] ?? null;
    const visible = rows.filter((p) => Math.abs(p.relative) <= HORIZONTAL_FOV / 2).length;
    return { nearest, visible };
  }, [orientation.heading, parcels, position]);

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraState("idle");
  };

  useEffect(() => () => stopCamera(), []);

  const headingText = orientation.heading == null ? "—" : `${Math.round(orientation.heading)}° ${compassLabel(orientation.heading)}`;
  const directionText = derived.nearest == null ? "Parsel aranıyor…" : Math.abs(derived.nearest.relative) <= 8 ? "Tam önünde" : derived.nearest.relative > 0 ? `Sağında → ${Math.round(Math.abs(derived.nearest.relative))}°` : `Solunda ← ${Math.round(Math.abs(derived.nearest.relative))}°`;
  const directionArrow = derived.nearest == null ? "•" : derived.nearest.relative > 8 ? "→" : derived.nearest.relative < -8 ? "←" : "↑";

  return (
    <main className="fixed inset-0 z-[70] overflow-hidden bg-black text-white">
      <video ref={videoRef} muted playsInline autoPlay className="absolute inset-0 h-full w-full object-cover" aria-label="Arka kamera görüntüsü" />
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_35%,rgba(0,0,0,.32)_100%)]" />

      <header className="absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-3 p-3 sm:p-5">
        <div className="rounded-2xl border border-white/15 bg-slate-950/65 px-3 py-2 backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-cyan-200/80">MySkyParcel</p>
          <p className="mt-0.5 text-sm font-semibold">Gökyüzünü Tara</p>
          <p className="text-[10px] text-white/55">GPS: {gpsState === "ready" ? "hazır" : "bekleniyor"} · Sensör: {sensorState === "ready" ? "hazır" : sensorState === "unavailable" ? "veri yok" : "bekleniyor"}</p>
        </div>
        <button type="button" onClick={() => setDebug((v) => !v)} className="pointer-events-auto rounded-xl border border-white/15 bg-slate-950/65 px-3 py-2 text-[11px] text-white/75 backdrop-blur-md">{debug ? "Debug kapat" : "Durum"}</button>
      </header>

      {debug && <div className="absolute left-3 top-24 z-30 max-w-[calc(100%-24px)] rounded-2xl border border-cyan-200/15 bg-slate-950/80 p-3 font-mono text-[10px] leading-5 text-cyan-100 backdrop-blur-md sm:left-5 sm:top-24">
        GPS {position ? `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)} ±${Math.round(position.accuracy)}m` : "—"}<br />
        alpha {orientation.alpha ?? "—"} · beta {orientation.beta ?? "—"} · gamma {orientation.gamma ?? "—"}<br />
        heading {orientation.heading == null ? "—" : orientation.heading.toFixed(1)} · pitch {orientation.pitch.toFixed(1)} · source {orientation.source}<br />
        parcels {parcels.length} · visible {derived.visible} · nearest {derived.nearest ? distanceLabel(derived.nearest.distance) : "—"}
      </div>}

      {cameraState !== "ready" && <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-5 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-3xl border border-cyan-200/15 bg-slate-900/95 p-6 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 text-3xl">✦</div>
          <h1 className="mt-4 text-2xl font-bold">Gökyüzünü Tara</h1>
          <p className="mt-2 text-sm leading-6 text-white/60">Telefonu gökyüzüne tut. Yakınındaki gerçek MySkyParcel parsellerini yönleriyle birlikte bul.</p>
          {cameraState === "error" && <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-xs text-red-200">Kamera başlatılamadı. {startMessage ?? "Tarayıcı kamera iznini kontrol et."}</p>}
          <button type="button" onClick={() => void startAR()} className="mt-5 w-full rounded-2xl bg-cyan-300 px-5 py-3.5 font-bold text-slate-950">Kamerayı ve sensörleri başlat</button>
          <p className="mt-3 text-[10px] text-white/40">Sensör gecikirse kamera açık kalır; sensör sonradan geldiğinde tarama otomatik devam eder.</p>
        </div>
      </div>}

      {cameraState === "ready" && <>
        {sensorState === "unavailable" && <div className="absolute left-1/2 top-24 z-30 -translate-x-1/2 rounded-full border border-amber-200/20 bg-slate-950/75 px-4 py-2 text-xs text-amber-100 backdrop-blur-md">Sensör verisi alınamadı · kamerayı kapatmadan devam ediliyor</div>}
        {gpsState === "denied" && <div className="absolute left-1/2 top-24 z-30 -translate-x-1/2 rounded-full border border-red-200/20 bg-red-950/80 px-4 py-2 text-xs text-red-100 backdrop-blur-md">Konum izni gerekli</div>}
        {parcelError && <div className="absolute bottom-36 left-1/2 z-30 -translate-x-1/2 rounded-xl border border-red-200/20 bg-red-950/80 px-4 py-2 text-xs text-red-100 backdrop-blur-md">{parcelError}</div>}
        {derived.nearest && Math.abs(derived.nearest.relative) > HORIZONTAL_FOV / 2 && <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-slate-950/55 px-5 py-3 text-center backdrop-blur-md"><div className="text-3xl">{directionArrow}</div><p className="mt-1 text-xs">{directionText}</p></div>}

        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 p-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:p-5">
          <div className="mx-auto max-w-2xl rounded-3xl border border-white/15 bg-slate-950/72 p-3 shadow-2xl backdrop-blur-xl sm:p-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-2xl bg-white/5 p-2.5"><p className="text-[9px] uppercase tracking-wider text-white/40">Pusula</p><p className="mt-1 text-sm font-bold text-cyan-100">{headingText}</p></div>
              <div className="rounded-2xl bg-white/5 p-2.5"><p className="text-[9px] uppercase tracking-wider text-white/40">Çevrende</p><p className="mt-1 text-sm font-bold">{parcels.length} parsel</p></div>
              <div className="rounded-2xl bg-white/5 p-2.5"><p className="text-[9px] uppercase tracking-wider text-white/40">Görüş alanında</p><p className="mt-1 text-sm font-bold">{derived.visible}</p></div>
              <div className="rounded-2xl bg-white/5 p-2.5"><p className="text-[9px] uppercase tracking-wider text-white/40">En yakın</p><p className="mt-1 text-sm font-bold text-amber-100">{derived.nearest ? distanceLabel(derived.nearest.distance) : "—"}</p></div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2"><div><p className="text-[9px] uppercase tracking-wider text-white/40">Parsel yönü</p><p className="text-sm font-semibold">{directionText}</p></div><div className="text-right"><p className="text-[9px] uppercase tracking-wider text-white/40">Hedef</p><p className="text-sm font-semibold text-cyan-100">{derived.nearest?.parcel_number ?? "aranıyor"}</p></div></div>
            <div className="mt-2 flex items-center justify-between"><p className="text-[9px] text-white/35">{loadingParcels ? "Yakındaki parseller güncelleniyor…" : "Gerçek GPS koordinatlarıyla yönlendiriliyor"}</p><button type="button" onClick={stopCamera} className="pointer-events-auto rounded-lg border border-white/10 px-2.5 py-1 text-[10px] text-white/50">Kapat</button></div>
          </div>
        </div>
      </>}
    </main>
  );
}
