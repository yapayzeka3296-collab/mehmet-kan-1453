import { Compass, Crosshair, LocateFixed, MapPin, Radio, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { geoToEus, normalizeDegrees } from "./geoWorld";

type LocationState = { latitude: number; longitude: number; accuracy: number; altitude: number | null };
type Parcel = { id: string; parcel_number: string; latitude: number; longitude: number; price: number; tier: string | null; status: string | null };
type OrientationLike = DeviceOrientationEvent & { webkitCompassHeading?: number };

const RADIUS = 15000;
const VIRTUAL_ALTITUDE = 650;
const MAX_VISIBLE = 12;
const FOV = 100;
const MARKER_SIZE = 10;

function getHeading(e: OrientationLike): number | null {
  if (Number.isFinite(e.webkitCompassHeading)) return normalizeDegrees(e.webkitCompassHeading!);
  if (typeof e.alpha === "number" && Number.isFinite(e.alpha)) return normalizeDegrees(360 - e.alpha);
  return null;
}

function getPitch(e: OrientationLike) {
  return typeof e.beta === "number" && Number.isFinite(e.beta) ? THREE.MathUtils.clamp(e.beta, -90, 90) : 0;
}

function marker(scene: THREE.Scene, p: Parcel, position: THREE.Vector3) {
  const g = new THREE.Group();
  g.position.copy(position);
  g.userData.parcelId = p.id;
  g.frustumCulled = false;
  const premium = p.tier === "premium" || p.tier === "elite";
  const material = new THREE.MeshBasicMaterial({ color: premium ? 0xffd34d : 0x38d9ff, transparent: true, opacity: 0.9, depthTest: true });
  const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(MARKER_SIZE, 1), material);
  g.add(mesh);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 }));
  g.add(edge);
  scene.add(g);
  return g;
}

export function SkyScanExperienceV6() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupsRef = useRef(new Map<string, THREE.Group>());
  const parcelsRef = useRef<Parcel[]>([]);
  const originRef = useRef<LocationState | null>(null);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [sensorError, setSensorError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [pitch, setPitch] = useState(0);
  const [nearby, setNearby] = useState<Array<Parcel & { distance: number; bearing: number; elevation: number }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(p => setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: Math.max(1, p.coords.accuracy || 999), altitude: typeof p.coords.altitude === "number" ? p.coords.altitude : null }), e => setSensorError(e.message || "Konum alınamadı."), { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 });
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const loadParcels = useCallback(async (loc: LocationState) => {
    setLoading(true);
    const latDelta = RADIUS / 111320;
    const lonDelta = RADIUS / (111320 * Math.max(0.2, Math.cos(THREE.MathUtils.degToRad(loc.latitude))));
    const { data, error } = await supabaseBrowser.rpc("sky_scan_parcels", { p_min_lat: loc.latitude - latDelta, p_min_lng: loc.longitude - lonDelta, p_max_lat: loc.latitude + latDelta, p_max_lng: loc.longitude + lonDelta, p_limit: 300 });
    if (error) { setSensorError(`Parseller alınamadı: ${error.message}`); setLoading(false); return; }
    parcelsRef.current = (data ?? []).map((r: any) => ({ id: String(r.id), parcel_number: String(r.parcel_number ?? "Parsel"), latitude: Number(r.latitude), longitude: Number(r.longitude), price: Number(r.price ?? 0), tier: r.tier ?? null, status: r.status ?? null })).filter((p: Parcel) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
    setLoading(false);
  }, []);

  useEffect(() => { if (location) void loadParcels(location); }, [location?.latitude, location?.longitude, loadParcels]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (!window.isSecureContext) throw new Error("Kamera yalnızca HTTPS bağlantısında çalışır.");
    if (!navigator.mediaDevices?.getUserMedia || !videoRef.current) throw new Error("Bu tarayıcı kamera erişimini desteklemiyor.");
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
    streamRef.current = stream;
    videoRef.current.srcObject = stream;
    await videoRef.current.play();
    setCameraStarted(true);
  }, []);

  useEffect(() => {
    if (!cameraStarted || !canvasRef.current) return;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.5, 100000);
    sceneRef.current = scene; cameraRef.current = camera; rendererRef.current = renderer;
    const resize = () => { renderer.setSize(window.innerWidth, window.innerHeight, false); camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); };
    resize(); window.addEventListener("resize", resize);
    let frame = 0;
    const tick = () => { frame = requestAnimationFrame(tick); renderer.render(scene, camera); };
    tick();
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); renderer.dispose(); scene.clear(); groupsRef.current.clear(); sceneRef.current = null; cameraRef.current = null; rendererRef.current = null; };
  }, [cameraStarted]);

  useEffect(() => {
    if (!cameraStarted) return;
    let got = false;
    const onOrientation = (event: Event) => {
      const e = event as OrientationLike;
      const h = getHeading(e);
      if (h !== null) setHeading(h);
      setPitch(getPitch(e));
      got = got || h !== null || typeof e.beta === "number" || typeof e.gamma === "number";
      setSensorError(null);
    };
    const onMotion = () => { got = true; };
    window.addEventListener("deviceorientationabsolute", onOrientation, true);
    window.addEventListener("deviceorientation", onOrientation, true);
    window.addEventListener("devicemotion", onMotion, true);
    const timer = window.setTimeout(() => { if (!got) setSensorError("Sensör verisi alınamadı. Kamera açık kalacak."); }, 3500);
    return () => { window.removeEventListener("deviceorientationabsolute", onOrientation, true); window.removeEventListener("deviceorientation", onOrientation, true); window.removeEventListener("devicemotion", onMotion, true); window.clearTimeout(timer); };
  }, [cameraStarted]);

  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    if (!scene || !camera || !location) return;
    const origin = originRef.current ?? location;
    originRef.current = location;

    // Keep parcels in the geographic EUS world. Only the camera rotates.
    // This prevents parcels from being mathematically attached to the camera.
    const candidates = parcelsRef.current.map(p => {
      const w = geoToEus(origin, { latitude: p.latitude, longitude: p.longitude, altitude: (origin.altitude ?? 0) + VIRTUAL_ALTITUDE });
      const distance = Math.hypot(w.x, w.z);
      const bearing = normalizeDegrees(Math.atan2(w.x, -w.z) * 180 / Math.PI);
      const elevation = Math.atan2(w.y, Math.max(1, distance)) * 180 / Math.PI;
      return { ...p, distance, bearing, elevation, world: w };
    }).filter(p => Number.isFinite(p.distance) && p.distance <= RADIUS).sort((a, b) => a.distance - b.distance).slice(0, MAX_VISIBLE);
    setNearby(candidates);

    const used = new Set(candidates.map(p => p.id));
    for (const [id, g] of groupsRef.current) if (!used.has(id)) { scene.remove(g); groupsRef.current.delete(id); }
    for (const p of candidates) {
      let g = groupsRef.current.get(p.id);
      if (!g) { g = marker(scene, p, new THREE.Vector3(p.world.x, p.world.y, p.world.z)); groupsRef.current.set(p.id, g); }
      g.position.set(p.world.x, p.world.y, p.world.z);
    }
  }, [location, loading]);

  // World-locked camera: heading/pitch rotate the camera, not the parcels.
  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    const h = THREE.MathUtils.degToRad(heading ?? 0);
    const p = THREE.MathUtils.degToRad(pitch);
    camera.rotation.order = "YXZ";
    camera.rotation.y = -h;
    camera.rotation.x = p;
    camera.rotation.z = 0;
    camera.updateMatrixWorld();
  }, [heading, pitch]);

  const stop = useCallback(() => { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; if (videoRef.current) { videoRef.current.pause(); videoRef.current.srcObject = null; } originRef.current = null; setCameraStarted(false); setHeading(null); setPitch(0); }, []);
  const start = useCallback(async () => {
    setSensorError(null);
    try { await startCamera(); } catch (e) { setCameraError(e instanceof Error ? e.message : "Kamera başlatılamadı."); return; }
    const O = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: (absolute?: boolean) => Promise<PermissionState> };
    if (typeof O.requestPermission === "function") { try { const permission = await O.requestPermission(true); if (permission !== "granted") setSensorError("Yön sensörü izni verilmedi. Kamera çalışmaya devam eder."); } catch { setSensorError("Yön sensörü izni alınamadı. Kamera çalışmaya devam eder."); } }
  }, [startCamera]);

  return <main className="fixed inset-0 overflow-hidden bg-slate-950 text-white">
    <video ref={videoRef} className={`absolute inset-0 z-0 h-full w-full object-cover ${cameraStarted ? "block" : "hidden"}`} playsInline muted autoPlay />
    <canvas ref={canvasRef} className={`absolute inset-0 z-10 h-full w-full ${cameraStarted ? "block" : "hidden"}`} />
    {!cameraStarted && <div className="absolute inset-0 z-30 flex items-center justify-center px-6"><div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-950/92 p-7 text-center shadow-2xl backdrop-blur-xl"><Radio className="mx-auto h-12 w-12 text-cyan-200"/><p className="mt-5 text-[10px] font-bold uppercase tracking-[.28em] text-cyan-300">MySkyParcel • World AR</p><h1 className="mt-2 text-2xl font-bold">Gökyüzünü Tara</h1><p className="mt-3 text-sm text-white/65">Gerçek konumundaki parselleri kameranın görüşünde göster.</p><button onClick={start} className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950">Gerçek gökyüzünü tara</button>{cameraError && <p className="mt-3 text-xs text-red-200">{cameraError}</p>}</div></div>}
    {cameraStarted && <><div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3"><div className="mx-auto max-w-xl rounded-3xl border border-white/15 bg-black/55 p-3 backdrop-blur-xl"><div className="flex items-center justify-between"><div className="text-xs font-semibold"><LocateFixed className="mr-1 inline h-4 w-4"/>15 km içinde <span className="text-cyan-200">{nearby.length} parsel</span><div className="mt-1 text-[10px] text-white/50">{location ? `${Math.round(location.accuracy)} m GPS` : "GPS bekleniyor"}</div></div><button onClick={stop} className="pointer-events-auto rounded-full bg-black/45 p-2"><X className="h-5 w-5"/></button></div><div className="mt-2 grid grid-cols-3 gap-2 text-center text-[10px]"><div className="rounded-xl bg-white/5 p-2"><MapPin className="mx-auto mb-1 h-4 w-4"/>{location ? `${Math.round(location.accuracy)} m` : "GPS"}</div><div className="rounded-xl bg-white/5 p-2"><Compass className="mx-auto mb-1 h-4 w-4"/>{heading === null ? "Yön bekleniyor" : `${Math.round(heading)}°`}</div><div className="rounded-xl bg-white/5 p-2"><b className="block text-cyan-200">{nearby.length}</b>Parsel</div></div>{loading && <p className="mt-2 text-center text-[10px] text-white/50">En yakın parseller güncelleniyor…</p>}{sensorError && <p className="mt-2 text-center text-xs text-amber-200">{sensorError}</p>}</div></div><div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"><Crosshair className="h-10 w-10 text-white/60" strokeWidth={1.2}/></div></>}
  </main>;
}
