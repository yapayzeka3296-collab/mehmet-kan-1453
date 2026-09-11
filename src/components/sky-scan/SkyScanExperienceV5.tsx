import { Camera, Compass, LocateFixed, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Parcel = {
  id: string;
  parcel_id: string;
  parcel_number: string;
  latitude: number;
  longitude: number;
  tier?: string | null;
  distanceMeters: number;
  bearing: number;
};

type GpsState = { latitude: number; longitude: number; accuracy: number | null; altitude: number | null } | null;

type OrientationState = { heading: number | null; pitch: number | null; alpha: number | null; beta: number | null; gamma: number | null; source: string };

const MAX_QUERY_RADIUS_METERS = 5000;
const QUERY_DEBOUNCE_MS = 2500;
const EARTH_RADIUS = 6371000;

function toRad(value: number) { return (value * Math.PI) / 180; }
function toDeg(value: number) { return (value * 180) / Math.PI; }

function haversine(aLat: number, aLon: number, bLat: number, bLon: number) {
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.min(1, Math.sqrt(h)));
}

function bearingBetween(aLat: number, aLon: number, bLat: number, bLon: number) {
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const dLon = toRad(bLon - aLon);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function angularDelta(target: number, current: number) {
  return ((target - current + 540) % 360) - 180;
}

function directionLabel(delta: number) {
  const abs = Math.abs(delta);
  if (abs <= 10) return "Tam önünde";
  if (abs >= 160) return "Arkanda";
  return delta > 0 ? "Sağında" : "Solunda";
}

function cardinal(degrees: number) {
  const dirs = ["K", "KD", "D", "GD", "G", "GB", "B", "KB"];
  return dirs[Math.round(degrees / 45) % 8];
}

function normaliseHeading(event: DeviceOrientationEvent) {
  const alpha = typeof event.alpha === "number" ? event.alpha : null;
  const beta = typeof event.beta === "number" ? event.beta : null;
  const gamma = typeof event.gamma === "number" ? event.gamma : null;
  const webkit = (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
  if (typeof webkit === "number" && Number.isFinite(webkit)) return { heading: (webkit + 360) % 360, alpha, beta, gamma, pitch: beta, source: "iOS pusula" };
  if (alpha !== null) return { heading: (360 - alpha + 360) % 360, alpha, beta, gamma, pitch: beta, source: event.type };
  return { heading: null, alpha, beta, gamma, pitch: beta, source: event.type };
}

export function SkyScanExperienceV5() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const orientationHandlerRef = useRef<((event: DeviceOrientationEvent) => void) | null>(null);
  const absoluteHandlerRef = useRef<((event: DeviceOrientationEvent) => void) | null>(null);
  const motionHandlerRef = useRef<((event: DeviceMotionEvent) => void) | null>(null);
  const lastFetchRef = useRef(0);
  const lastQueryPositionRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const threeCameraRef = useRef<any>(null);
  const parcelObjectsRef = useRef<Map<string, any>>(new Map());
  const animationRef = useRef<number | null>(null);
  const orientationRef = useRef<OrientationState>({ heading: null, pitch: null, alpha: null, beta: null, gamma: null, source: "bekleniyor" });
  const gpsRef = useRef<GpsState>(null);
  const parcelsRef = useRef<Parcel[]>([]);
  const activeSensorRef = useRef<"absolute" | "relative" | null>(null);

  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [gps, setGps] = useState<GpsState>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<OrientationState>(orientationRef.current);
  const [sensorStatus, setSensorStatus] = useState("Sensör bekleniyor");
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [nearest, setNearest] = useState<Parcel | null>(null);
  const [loadingParcels, setLoadingParcels] = useState(false);
  const [parcelError, setParcelError] = useState<string | null>(null);

  const stopThree = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
    parcelObjectsRef.current.clear();
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current.domElement?.remove();
    }
    rendererRef.current = null;
    sceneRef.current = null;
    threeCameraRef.current = null;
  }, []);

  const startThree = useCallback(async () => {
    if (!canvasHostRef.current || rendererRef.current) return;
    const THREE = await import("three");
    const host = canvasHostRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x020617, 20, 180);
    const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.pointerEvents = "none";
    host.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const directional = new THREE.DirectionalLight(0xffffff, 2.2);
    directional.position.set(4, 8, 6);
    scene.add(directional);

    sceneRef.current = scene;
    rendererRef.current = renderer;
    threeCameraRef.current = camera;

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      const current = orientationRef.current;
      if (current.heading !== null) {
        const yaw = toRad(current.heading);
        const pitch = current.pitch === null ? 0 : toRad(Math.max(-80, Math.min(80, current.pitch)));
        camera.rotation.order = "YXZ";
        camera.rotation.y = -yaw;
        camera.rotation.x = -pitch;
      }
      for (const object of parcelObjectsRef.current.values()) {
        object.rotation.y += 0.006;
        object.rotation.x += 0.002;
      }
      renderer.render(scene, camera);
    };
    animate();
  }, []);

  const renderParcels = useCallback(async (items: Parcel[]) => {
    if (!sceneRef.current || !rendererRef.current) return;
    const THREE = await import("three");
    const scene = sceneRef.current;
    const keep = new Set(items.map((item) => item.id));
    for (const [id, object] of parcelObjectsRef.current.entries()) {
      if (!keep.has(id)) {
        scene.remove(object);
        object.geometry?.dispose?.();
        object.material?.dispose?.();
        parcelObjectsRef.current.delete(id);
      }
    }
    for (const item of items) {
      let crystal = parcelObjectsRef.current.get(item.id);
      if (!crystal) {
        const geometry = new THREE.IcosahedronGeometry(1, 1);
        const material = new THREE.MeshStandardMaterial({
          color: item.tier === "premium" || item.tier === "elite" ? 0xffd54a : 0x28d9ff,
          emissive: item.tier === "premium" || item.tier === "elite" ? 0x8a5a00 : 0x006b83,
          emissiveIntensity: 1.5,
          transparent: true,
          opacity: 0.92,
          roughness: 0.25,
          metalness: 0.35,
        });
        crystal = new THREE.Mesh(geometry, material);
        scene.add(crystal);
        parcelObjectsRef.current.set(item.id, crystal);
      }
      const angle = toRad(item.bearing);
      const distance = Math.min(item.distanceMeters, MAX_QUERY_RADIUS_METERS);
      const radius = 10 + Math.sqrt(distance) * 0.9;
      const x = Math.sin(angle) * radius;
      const z = -Math.cos(angle) * radius;
      const nearestScale = Math.max(0.7, Math.min(2.8, 2.8 - item.distanceMeters / 2500));
      const vertical = item.distanceMeters < 100 ? 2.8 : 4.5 + Math.min(10, item.distanceMeters / 500);
      crystal.position.set(x, vertical, z);
      crystal.scale.setScalar(nearestScale);
      const material = crystal.material as any;
      material.opacity = Math.max(0.28, Math.min(0.95, 1 - item.distanceMeters / 7000));
    }
  }, []);

  const fetchParcels = useCallback(async (position: NonNullable<GpsState>) => {
    const now = Date.now();
    const previous = lastQueryPositionRef.current;
    if (now - lastFetchRef.current < QUERY_DEBOUNCE_MS && previous) return;
    const moved = previous ? haversine(previous.latitude, previous.longitude, position.latitude, position.longitude) : Infinity;
    if (previous && moved < 40 && now - lastFetchRef.current < 15000) return;

    lastFetchRef.current = now;
    lastQueryPositionRef.current = { latitude: position.latitude, longitude: position.longitude };
    setLoadingParcels(true);
    setParcelError(null);
    try {
      const latDelta = MAX_QUERY_RADIUS_METERS / 111320;
      const lonDelta = MAX_QUERY_RADIUS_METERS / Math.max(111320 * Math.cos(toRad(position.latitude)), 1);
      const minLat = position.latitude - latDelta;
      const maxLat = position.latitude + latDelta;
      const minLon = position.longitude - lonDelta;
      const maxLon = position.longitude + lonDelta;
      const { data, error } = await supabaseBrowser
        .from("sky_scan_parcels")
        .select("id,parcel_id,parcel_number,latitude,longitude,parcels(tier,status)")
        .gte("latitude", minLat)
        .lte("latitude", maxLat)
        .gte("longitude", minLon)
        .lte("longitude", maxLon)
        .limit(1000);
      if (error) throw error;
      const calculated: Parcel[] = (data ?? [])
        .filter((row: any) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude))
        .map((row: any) => {
          const distanceMeters = haversine(position.latitude, position.longitude, row.latitude, row.longitude);
          const bearing = bearingBetween(position.latitude, position.longitude, row.latitude, row.longitude);
          const parcelInfo = Array.isArray(row.parcels) ? row.parcels[0] : row.parcels;
          return { ...row, tier: parcelInfo?.tier ?? null, distanceMeters, bearing };
        })
        .filter((row) => row.distanceMeters <= MAX_QUERY_RADIUS_METERS)
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, 120);
      parcelsRef.current = calculated;
      setParcels(calculated);
      setNearest(calculated[0] ?? null);
      await renderParcels(calculated);
    } catch (error) {
      setParcelError(error instanceof Error ? error.message : "Parseller alınamadı.");
    } finally {
      setLoadingParcels(false);
    }
  }, [renderParcels]);

  const startGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Bu tarayıcı konum erişimini desteklemiyor.");
      return;
    }
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
          altitude: Number.isFinite(position.coords.altitude ?? NaN) ? position.coords.altitude : null,
        };
        gpsRef.current = next;
        setGps(next);
        setGpsError(null);
        void fetchParcels(next);
      },
      (error) => setGpsError(error.code === 1 ? "GPS izni verilmedi." : "GPS verisi alınamadı."),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 },
    );
  }, [fetchParcels]);

  const startSensors = useCallback(async () => {
    const DeviceOrientation = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
    try {
      if (typeof DeviceOrientation?.requestPermission === "function") {
        const permission = await DeviceOrientation.requestPermission();
        if (permission !== "granted") {
          setSensorStatus("Sensör izni verilmedi");
          return;
        }
      }
    } catch {
      setSensorStatus("Sensör izni alınamadı");
      return;
    }

    const absoluteHandler = (event: DeviceOrientationEvent) => {
      if (activeSensorRef.current === "relative") return;
      const parsed = normaliseHeading(event);
      if (parsed.heading !== null || parsed.beta !== null || parsed.gamma !== null) {
        activeSensorRef.current = "absolute";
        orientationRef.current = parsed;
        setOrientation(parsed);
        setSensorStatus("Sensör aktif");
      }
    };
    const relativeHandler = (event: DeviceOrientationEvent) => {
      if (activeSensorRef.current === "absolute") return;
      const parsed = normaliseHeading(event);
      if (parsed.heading !== null || parsed.beta !== null || parsed.gamma !== null) {
        activeSensorRef.current = "relative";
        orientationRef.current = parsed;
        setOrientation(parsed);
        setSensorStatus("Sensör aktif");
      }
    };
    const motionHandler = (event: DeviceMotionEvent) => {
      if (orientationRef.current.pitch === null && typeof event.accelerationIncludingGravity?.y === "number") {
        orientationRef.current = { ...orientationRef.current, pitch: toDeg(Math.atan2(event.accelerationIncludingGravity.y, event.accelerationIncludingGravity.z ?? 1)), source: "devicemotion" };
        setOrientation(orientationRef.current);
        setSensorStatus("Sensör aktif");
      }
    };
    orientationHandlerRef.current = relativeHandler;
    absoluteHandlerRef.current = absoluteHandler;
    motionHandlerRef.current = motionHandler;
    window.addEventListener("deviceorientationabsolute", absoluteHandler, true);
    window.addEventListener("deviceorientation", relativeHandler, true);
    window.addEventListener("devicemotion", motionHandler, true);

    window.setTimeout(() => {
      if (orientationRef.current.heading === null && orientationRef.current.pitch === null) setSensorStatus("Sensör verisi alınamadı");
    }, 5000);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (!window.isSecureContext) throw new Error("Kamera yalnızca HTTPS bağlantısında çalışır.");
    const video = videoRef.current;
    if (!navigator.mediaDevices?.getUserMedia || !video) throw new Error("Bu tarayıcı kamera erişimini desteklemiyor.");
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
    streamRef.current = stream;
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
    setCameraStarted(true);
    setCameraReady(true);
    await startThree();
    startGps();
    await startSensors();
  }, [startGps, startSensors, startThree]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    watchIdRef.current = null;
    if (orientationHandlerRef.current) window.removeEventListener("deviceorientation", orientationHandlerRef.current, true);
    if (absoluteHandlerRef.current) window.removeEventListener("deviceorientationabsolute", absoluteHandlerRef.current, true);
    if (motionHandlerRef.current) window.removeEventListener("devicemotion", motionHandlerRef.current, true);
    orientationHandlerRef.current = null;
    absoluteHandlerRef.current = null;
    motionHandlerRef.current = null;
    activeSensorRef.current = null;
    stopThree();
    setCameraStarted(false);
    setCameraReady(false);
  }, [stopThree]);

  useEffect(() => () => stopCamera(), [stopCamera]);
  useEffect(() => {
    const onResize = () => {
      const renderer = rendererRef.current;
      const camera = threeCameraRef.current;
      if (!renderer || !camera) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const nearestDelta = nearest && orientation.heading !== null ? angularDelta(nearest.bearing, orientation.heading) : null;
  const visible = parcels.filter((parcel) => orientation.heading === null || Math.abs(angularDelta(parcel.bearing, orientation.heading)) <= 34).length;
  useEffect(() => setVisibleCount(visible), [visible]);

  return (
    <main className="fixed inset-0 overflow-hidden bg-black text-white">
      <video ref={videoRef} className={`absolute inset-0 z-0 h-full w-full object-cover ${cameraStarted ? "block" : "hidden"}`} playsInline muted autoPlay />
      <div ref={canvasHostRef} className="pointer-events-none absolute inset-0 z-[1]" />

      {!cameraStarted && (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-950/90 p-7 text-center shadow-2xl backdrop-blur-xl">
            <Camera className="mx-auto h-10 w-10 text-cyan-200" />
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[.28em] text-cyan-300">MySkyParcel</p>
            <h1 className="mt-2 text-2xl font-bold">Gökyüzünü Tara</h1>
            <p className="mt-3 text-sm leading-6 text-white/65">Kamera, GPS ve yön sensörleri birlikte çalışacak.</p>
            <button onClick={() => void startCamera().catch((error) => setCameraError(error instanceof Error ? error.message : "Kamera başlatılamadı."))} className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950">Kamerayı başlat</button>
            {cameraError && <p className="mt-3 text-xs text-red-200">{cameraError}</p>}
          </div>
        </div>
      )}

      {cameraStarted && (
        <>
          <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="rounded-2xl border border-white/15 bg-black/45 px-3 py-2 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-semibold"><Camera className="h-4 w-4" /> Kamera {cameraReady ? "hazır" : "başlatılıyor"}</div>
              <div className="mt-1 text-[10px] text-white/60">{sensorStatus} · {gps ? "GPS aktif" : gpsError ?? "GPS bekleniyor"}</div>
            </div>
            <button onClick={stopCamera} className="rounded-full border border-white/20 bg-black/45 p-2.5 backdrop-blur-md" aria-label="Kamerayı kapat"><X className="h-5 w-5" /></button>
          </div>

          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            {nearest && nearestDelta !== null && Math.abs(nearestDelta) > 34 && (
              <div className="rounded-2xl border border-white/20 bg-black/45 px-4 py-3 backdrop-blur-md">
                <div className="text-lg font-bold">{nearestDelta > 0 ? "→" : "←"} {Math.round(Math.abs(nearestDelta))}°</div>
                <div className="text-xs text-white/70">En yakın parsel {directionLabel(nearestDelta)}</div>
              </div>
            )}
            {!nearest && !loadingParcels && gps && <div className="rounded-2xl bg-black/45 px-4 py-3 text-xs backdrop-blur-md">Yakındaki parseller aranıyor…</div>}
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto max-w-xl rounded-3xl border border-white/15 bg-slate-950/65 p-3 backdrop-blur-xl">
              <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                <div className="rounded-2xl bg-white/5 p-2"><div className="flex items-center gap-1 text-white/55"><Compass className="h-3.5 w-3.5" /> Pusula</div><div className="mt-1 font-bold">{orientation.heading === null ? "—" : `${Math.round(orientation.heading)}° ${cardinal(orientation.heading)}`}</div></div>
                <div className="rounded-2xl bg-white/5 p-2"><div className="text-white/55">Çevrende</div><div className="mt-1 font-bold">{loadingParcels ? "…" : `${parcels.length} parsel`}</div></div>
                <div className="rounded-2xl bg-white/5 p-2"><div className="text-white/55">Görüş alanında</div><div className="mt-1 font-bold">{visibleCount} parsel</div></div>
                <div className="rounded-2xl bg-white/5 p-2"><div className="flex items-center gap-1 text-white/55"><LocateFixed className="h-3.5 w-3.5" /> En yakın</div><div className="mt-1 font-bold">{nearest ? `${Math.round(nearest.distanceMeters)} m` : "—"}</div></div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-white/55">
                <span>{nearest && nearestDelta !== null ? `${directionLabel(nearestDelta)} · ${Math.round(Math.abs(nearestDelta))}°` : parcelError ?? "Parseller hazır olduğunda yönlendirme başlayacak."}</span>
                {gps && <span>GPS ±{Math.round(gps.accuracy ?? 0)} m</span>}
                <button onClick={() => gps && void fetchParcels(gps)} className="rounded-full bg-white/10 p-2" aria-label="Parselleri yenile"><RefreshCw className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
