import { Compass, Crosshair, LocateFixed, MapPin, Radio, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { geoToEus, normalizeDegrees } from "./geoWorld";

type LocationState = { latitude: number; longitude: number; accuracy: number; altitude: number | null };
type SkyParcel = { id: string; parcel_id: string; parcel_number: string; latitude: number; longitude: number; price: number; tier: string | null; status: string | null; virtualAltitude: number };
type RenderedParcel = SkyParcel & { distance: number; bearing: number; elevation: number; position: THREE.Vector3 };
type OrientationLike = DeviceOrientationEvent & { webkitCompassHeading?: number; absolute?: boolean };
type DirectionKey = "front" | "frontRight" | "right" | "backRight" | "back" | "backLeft" | "left" | "frontLeft";

const SCAN_RADIUS_M = 15000;
const VIRTUAL_ALTITUDE_M = 650;
const MAX_VISIBLE = 12;
const CRYSTAL_SIZE_M = 34;
const FOV_DEGREES = 100;
const directionKeys: DirectionKey[] = ["front", "frontRight", "right", "backRight", "back", "backLeft", "left", "frontLeft"];
const directionText: Record<DirectionKey, string> = { front: "Önünde", frontRight: "Sağ önünde", right: "Sağında", backRight: "Sağ arkasında", back: "Arkanda", backLeft: "Sol arkasında", left: "Solunda", frontLeft: "Sol önünde" };
const directionArrow: Record<DirectionKey, string> = { front: "↑", frontRight: "↗", right: "→", backRight: "↘", back: "↓", backLeft: "↙", left: "←", frontLeft: "↖" };

function directionFromBearing(bearing: number, heading: number | null): DirectionKey {
  const delta = heading === null ? bearing : ((bearing - heading + 540) % 360) - 180;
  if (Math.abs(delta) <= 22.5) return "front";
  if (delta <= 67.5) return "frontRight";
  if (delta <= 112.5) return "right";
  if (delta <= 157.5) return "backRight";
  if (delta > 157.5 || delta < -157.5) return "back";
  if (delta >= -157.5) return "backLeft";
  if (delta >= -112.5) return "left";
  return "frontLeft";
}

function makeCrystal(scene: THREE.Scene, parcel: RenderedParcel) {
  const group = new THREE.Group();
  group.position.copy(parcel.position);
  group.userData.parcelId = parcel.id;
  group.frustumCulled = false;
  const geometry = new THREE.OctahedronGeometry(CRYSTAL_SIZE_M, 1);
  const premium = parcel.tier === "premium" || parcel.tier === "elite";
  const material = new THREE.MeshBasicMaterial({ color: premium ? 0xffd34d : 0x38d9ff, transparent: true, opacity: 0.82, side: THREE.DoubleSide });
  group.add(new THREE.Mesh(geometry, material));
  group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })));
  const ring = new THREE.Mesh(new THREE.RingGeometry(CRYSTAL_SIZE_M * 0.72, CRYSTAL_SIZE_M * 0.78, 40), new THREE.MeshBasicMaterial({ color: premium ? 0xffd34d : 0x38d9ff, transparent: true, opacity: 0.5, side: THREE.DoubleSide }));
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  scene.add(group);
  return group;
}

function sensorHeading(event: OrientationLike): number | null {
  if (typeof event.webkitCompassHeading === "number" && Number.isFinite(event.webkitCompassHeading)) return normalizeDegrees(event.webkitCompassHeading);
  if (typeof event.alpha === "number" && Number.isFinite(event.alpha)) return normalizeDegrees(360 - event.alpha);
  return null;
}

function sensorPitch(event: OrientationLike): number {
  return typeof event.beta === "number" && Number.isFinite(event.beta) ? THREE.MathUtils.clamp(event.beta, -90, 90) : 0;
}

export function SkyScanExperienceV5() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupsRef = useRef(new Map<string, THREE.Group>());
  const parcelsRef = useRef<SkyParcel[]>([]);
  const projectedRef = useRef<RenderedParcel[]>([]);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [sensorActive, setSensorActive] = useState(false);
  const [sensorError, setSensorError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [pitch, setPitch] = useState(0);
  const [nearbyParcels, setNearbyParcels] = useState<RenderedParcel[]>([]);
  const [visibleParcels, setVisibleParcels] = useState<RenderedParcel[]>([]);
  const [selected, setSelected] = useState<RenderedParcel | null>(null);
  const [loadingParcels, setLoadingParcels] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    if (!navigator.geolocation) { setLocationError("Bu cihaz konum bilgisini desteklemiyor."); return; }
    const id = navigator.geolocation.watchPosition(
      p => setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: Math.max(1, p.coords.accuracy || 999), altitude: typeof p.coords.altitude === "number" ? p.coords.altitude : null }),
      e => setLocationError(e.message || "Konum alınamadı."),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const loadParcels = useCallback(async (loc: LocationState) => {
    setLoadingParcels(true);
    const latDelta = SCAN_RADIUS_M / 111320;
    const lonDelta = SCAN_RADIUS_M / (111320 * Math.max(0.2, Math.cos(THREE.MathUtils.degToRad(loc.latitude))));
    const { data, error } = await supabaseBrowser.rpc("sky_scan_parcels", {
      p_min_lat: loc.latitude - latDelta,
      p_min_lng: loc.longitude - lonDelta,
      p_max_lat: loc.latitude + latDelta,
      p_max_lng: loc.longitude + lonDelta,
      p_limit: 300,
    });
    if (error) {
      setSensorError(`Parseller alınamadı: ${error.message}`);
      setLoadingParcels(false);
      return;
    }
    const next = (data ?? []).map((row: any) => ({
      id: String(row.id), parcel_id: String(row.id), parcel_number: row.parcel_number || "Parsel", latitude: Number(row.latitude), longitude: Number(row.longitude),
      price: Number(row.price ?? 0), tier: row.tier ?? null, status: row.status ?? null, virtualAltitude: VIRTUAL_ALTITUDE_M,
    })).filter((p: SkyParcel) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
    parcelsRef.current = next;
    setLoadedCount(next.length);
    setLoadingParcels(false);
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
    const camera = new THREE.PerspectiveCamera(FOV_DEGREES, window.innerWidth / window.innerHeight, 0.1, 100000);
    rendererRef.current = renderer; sceneRef.current = scene; cameraRef.current = camera;
    const resize = () => { renderer.setSize(window.innerWidth, window.innerHeight, false); camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); };
    resize(); window.addEventListener("resize", resize);
    const tick = () => { rendererRef.current && requestAnimationFrame(tick); camera.quaternion.identity(); renderer.render(scene, camera); };
    tick();
    return () => { window.removeEventListener("resize", resize); renderer.dispose(); scene.clear(); groupsRef.current.clear(); };
  }, [cameraStarted]);

  useEffect(() => {
    if (!cameraStarted) return;
    let gotData = false;
    const onOrientation = (e: Event) => {
      const event = e as OrientationLike;
      const h = sensorHeading(event);
      const p = sensorPitch(event);
      if (h !== null) setHeading(h);
      setPitch(p);
      gotData = gotData || h !== null || typeof event.beta === "number" || typeof event.gamma === "number";
      setSensorActive(true);
      setSensorError(null);
    };
    const onMotion = () => { gotData = true; setSensorActive(true); setSensorError(null); };
    window.addEventListener("deviceorientationabsolute", onOrientation, true);
    window.addEventListener("deviceorientation", onOrientation, true);
    window.addEventListener("devicemotion", onMotion, true);
    const timer = window.setTimeout(() => { if (!gotData) setSensorError("Sensör verisi alınamadı. Kamera açık kalacak."); }, 3500);
    return () => { window.removeEventListener("deviceorientationabsolute", onOrientation, true); window.removeEventListener("deviceorientation", onOrientation, true); window.removeEventListener("devicemotion", onMotion, true); window.clearTimeout(timer); };
  }, [cameraStarted]);

  useEffect(() => {
    if (!location || !sceneRef.current) return;
    const h = heading ?? 0;
    const candidates: RenderedParcel[] = [];
    for (const parcel of parcelsRef.current) {
      const world = geoToEus(location, { latitude: parcel.latitude, longitude: parcel.longitude, altitude: (location.altitude ?? 0) + parcel.virtualAltitude });
      const distance = Math.hypot(world.x, world.z);
      if (!Number.isFinite(distance) || distance > SCAN_RADIUS_M) continue;
      const bearing = normalizeDegrees((Math.atan2(world.x, -world.z) * 180) / Math.PI);
      const elevation = (Math.atan2(world.y, Math.max(1, distance)) * 180) / Math.PI;
      const horizontal = THREE.MathUtils.degToRad(((bearing - h + 540) % 360) - 180);
      const vertical = THREE.MathUtils.degToRad(elevation - pitch);
      const flat = distance * Math.cos(vertical);
      candidates.push({ ...parcel, distance, bearing, elevation, position: new THREE.Vector3(Math.sin(horizontal) * flat, Math.sin(vertical) * distance, -Math.cos(horizontal) * flat) });
    }
    candidates.sort((a, b) => a.distance - b.distance);
    setNearbyParcels(candidates);
    projectedRef.current = candidates;
    const selectedForRender: RenderedParcel[] = [];
    const used = new Set<string>();
    for (const key of directionKeys) {
      const p = candidates.find(x => !used.has(x.id) && directionFromBearing(x.bearing, heading) === key);
      if (p) { selectedForRender.push(p); used.add(p.id); }
    }
    for (const p of candidates) { if (selectedForRender.length >= MAX_VISIBLE) break; if (!used.has(p.id)) { selectedForRender.push(p); used.add(p.id); } }
    const scene = sceneRef.current;
    for (const [id, group] of groupsRef.current) if (!used.has(id)) { scene.remove(group); group.traverse(o => { if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) { o.geometry.dispose(); const m = o.material; Array.isArray(m) ? m.forEach(x => x.dispose()) : m.dispose(); } }); groupsRef.current.delete(id); }
    for (const p of selectedForRender) { let group = groupsRef.current.get(p.id); if (!group) { group = makeCrystal(scene, p); groupsRef.current.set(p.id, group); } group.position.copy(p.position); }
    setVisibleParcels(selectedForRender);
  }, [location, heading, pitch, sensorActive, loadedCount]);

  const stopScan = useCallback(() => { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; if (videoRef.current) { videoRef.current.pause(); videoRef.current.srcObject = null; } setCameraStarted(false); setSensorActive(false); setHeading(null); setPitch(0); setSelected(null); }, []);
  const startScan = useCallback(async () => {
    setSensorError(null); setSensorActive(false);
    try { await startCamera(); } catch (e) { setCameraError(e instanceof Error ? e.message : "Kamera başlatılamadı."); return; }
    const Orientation = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: (absolute?: boolean) => Promise<PermissionState> };
    if (typeof Orientation.requestPermission === "function") { try { const permission = await Orientation.requestPermission(true); if (permission !== "granted") setSensorError("Yön sensörü izni verilmedi. Kamera çalışmaya devam eder."); } catch { setSensorError("Yön sensörü izni alınamadı. Kamera çalışmaya devam eder."); } }
  }, [startCamera]);

  const directionSummary = useMemo(() => { const c: Record<DirectionKey, number> = { front: 0, frontRight: 0, right: 0, backRight: 0, back: 0, backLeft: 0, left: 0, frontLeft: 0 }; for (const p of nearbyParcels) c[directionFromBearing(p.bearing, heading)]++; return c; }, [nearbyParcels, heading]);
  const nearest = nearbyParcels[0] ?? null;
  const nearestDirection = nearest ? directionFromBearing(nearest.bearing, heading) : null;

  return <main className="fixed inset-0 overflow-hidden bg-slate-950 text-white">
    <video ref={videoRef} className={`absolute inset-0 z-0 h-full w-full object-cover ${cameraStarted ? "block" : "hidden"}`} playsInline muted autoPlay />
    <canvas ref={canvasRef} className={`absolute inset-0 z-10 h-full w-full pointer-events-none ${cameraStarted ? "block" : "hidden"}`} />
    {!cameraStarted && <div className="absolute inset-0 z-30 flex items-center justify-center px-6"><div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-950/92 p-7 text-center shadow-2xl backdrop-blur-xl"><Radio className="mx-auto h-12 w-12 text-cyan-200" /><p className="mt-5 text-[10px] font-bold uppercase tracking-[.28em] text-cyan-300">MySkyParcel • World AR</p><h1 className="mt-2 text-2xl font-bold">Gökyüzünü Tara</h1><p className="mt-3 text-sm leading-6 text-white/65">Konumundaki gerçek parselleri kameranın görüşünde göster.</p><div className="mt-5 grid grid-cols-3 gap-2 text-[10px] text-white/55"><div className="rounded-xl bg-white/5 p-3">{loadedCount.toLocaleString("tr-TR")}<br />parsel</div><div className="rounded-xl bg-white/5 p-3">15 km<br />tarama</div><div className="rounded-xl bg-white/5 p-3">650 m<br />sanal irtifa</div></div><button onClick={startScan} className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950">Gerçek gökyüzünü tara</button>{locationError && <p className="mt-3 text-xs text-amber-200">{locationError}</p>}{cameraError && <p className="mt-3 text-xs text-red-200">{cameraError}</p>}</div></div>}
    {cameraStarted && <><div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 pt-[max(.75rem,env(safe-area-inset-top))]"><div className="mx-auto max-w-xl rounded-3xl border border-white/15 bg-black/55 p-3 backdrop-blur-xl"><div className="flex items-center justify-between"><div className="text-xs font-semibold"><LocateFixed className="mr-1 inline h-4 w-4" />15 km içinde <span className="text-cyan-200">{nearbyParcels.length} parsel</span><div className="mt-1 text-[10px] text-white/50">{loadedCount} yakın parsel • {location ? `${Math.round(location.accuracy)} m GPS` : "GPS bekleniyor"}</div></div><button onClick={stopScan} className="pointer-events-auto rounded-full bg-black/45 p-2"><X className="h-5 w-5" /></button></div><div className="mt-3 rounded-2xl bg-white/5 p-3"><div className="text-[9px] uppercase tracking-[.2em] text-cyan-200">En yakın parsel</div><div className="mt-1 flex items-center gap-2"><span className="text-2xl font-bold">{nearestDirection ? directionArrow[nearestDirection] : "•"}</span><div className="text-sm font-bold">{nearest ? `${directionText[nearestDirection!]} • ${Math.round(nearest.distance)} m` : "Parsel aranıyor"}<div className="text-[10px] font-normal text-white/50">{nearest?.parcel_number ?? ""}{nearest ? ` • dikey açı ${Math.round(nearest.elevation)}°` : ""}</div></div></div></div><div className="mt-2 grid grid-cols-4 gap-1.5 text-center text-[9px]"><div className="rounded-xl bg-white/5 p-2"><b className="block text-sm">{directionSummary.front}</b>Ön</div><div className="rounded-xl bg-white/5 p-2"><b className="block text-sm">{directionSummary.frontRight + directionSummary.right}</b>Sağ</div><div className="rounded-xl bg-white/5 p-2"><b className="block text-sm">{directionSummary.frontLeft + directionSummary.left}</b>Sol</div><div className="rounded-xl bg-white/5 p-2"><b className="block text-sm">{directionSummary.back + directionSummary.backRight + directionSummary.backLeft}</b>Arka</div></div></div></div><div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"><Crosshair className="h-10 w-10 text-white/60" strokeWidth={1.2} /></div>{selected && <div className="absolute left-1/2 top-[24%] z-30 -translate-x-1/2 rounded-2xl border border-white/20 bg-black/70 px-4 py-3"><div className="text-[10px] uppercase text-cyan-200">Parsel</div><div className="text-sm font-bold">{selected.parcel_number} • {Math.round(selected.distance)} m</div></div>}<div className="absolute inset-x-0 bottom-0 z-20 p-3"><div className="mx-auto max-w-xl rounded-3xl border border-white/15 bg-black/60 p-3 backdrop-blur-xl"><div className="grid grid-cols-4 gap-2 text-center text-[10px] text-white/70"><div><MapPin className="mx-auto mb-1 h-4 w-4" />{location ? `${Math.round(location.accuracy)} m` : "GPS"}</div><div><Compass className="mx-auto mb-1 h-4 w-4" />{heading !== null ? `${Math.round(heading)}°` : "Yön bekleniyor"}</div><div><b className="block text-cyan-200">{visibleParcels.length}</b>Gösteriliyor</div><button onClick={() => setHeading(null)} className="pointer-events-auto rounded-xl bg-white/10 px-2 py-1">Yön sıfırla</button></div>{sensorError && <p className="mt-2 text-center text-xs text-amber-200">{sensorError}</p>}{loadingParcels && <p className="mt-2 text-center text-[10px] text-white/50">En yakın parseller güncelleniyor…</p>}</div></div></>}
  </main>;
}
