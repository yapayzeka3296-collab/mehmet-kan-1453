import { Compass, Crosshair, LocateFixed, MapPin, Radio, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { angularDifference, geoToEus, normalizeDegrees } from "./geoWorld";

type LocationState = { latitude: number; longitude: number; accuracy: number; altitude: number | null };
type SkyParcel = { id: string; parcel_id: string; parcel_number: string; latitude: number; longitude: number; price: number; tier: string | null; status: string | null; virtualAltitude: number };
type OrientationLike = DeviceOrientationEvent & { webkitCompassHeading?: number; absolute?: boolean };
type RenderedParcel = SkyParcel & { distance: number; bearing: number; position: THREE.Vector3 };
type DirectionKey = "front" | "frontRight" | "right" | "backRight" | "back" | "backLeft" | "left" | "frontLeft";

const GAZIANTEP_CITY_ID = "4030a03a-b0ff-4d49-8176-e5a7111732df";
const SCAN_RADIUS_M = 15000;
const VIRTUAL_ALTITUDE_M = 650;
const MAX_VISIBLE = 8;
const CRYSTAL_SIZE_M = 34;
const FOV_DEGREES = 68;

const directionText: Record<DirectionKey, string> = {
  front: "Önünde", frontRight: "Sağ önünde", right: "Sağında", backRight: "Sağ arkasında",
  back: "Arkanda", backLeft: "Sol arkasında", left: "Solunda", frontLeft: "Sol önünde",
};
const directionArrow: Record<DirectionKey, string> = { front: "↑", frontRight: "↗", right: "→", backRight: "↘", back: "↓", backLeft: "↙", left: "←", frontLeft: "↖" };

function makeCrystal(scene: THREE.Scene, parcel: RenderedParcel) {
  const group = new THREE.Group();
  group.position.copy(parcel.position);
  group.userData.parcelId = parcel.id;
  const geometry = new THREE.OctahedronGeometry(CRYSTAL_SIZE_M, 1);
  const premium = parcel.tier === "premium";
  const material = new THREE.MeshPhysicalMaterial({ color: premium ? 0xffd76a : 0x5fdcff, emissive: premium ? 0x5b3d00 : 0x063a56, emissiveIntensity: 0.7, metalness: 0.35, roughness: 0.16, transparent: true, opacity: 0.88, transmission: 0.12, clearcoat: 0.8, clearcoatRoughness: 0.18 });
  group.add(new THREE.Mesh(geometry, material));
  group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 18), new THREE.LineBasicMaterial({ color: premium ? 0xfff0b0 : 0xc6f7ff, transparent: true, opacity: 0.95 })));
  const ring = new THREE.Mesh(new THREE.RingGeometry(CRYSTAL_SIZE_M * 0.72, CRYSTAL_SIZE_M * 0.78, 48), new THREE.MeshBasicMaterial({ color: premium ? 0xffd76a : 0x5fdcff, transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  scene.add(group);
  return group;
}

function deviceQuaternion(event: OrientationLike, screenAngle: number) {
  if (![event.alpha, event.beta, event.gamma].every((value) => typeof value === "number" && Number.isFinite(value))) return null;
  const euler = new THREE.Euler(THREE.MathUtils.degToRad(event.beta!), THREE.MathUtils.degToRad(event.alpha!), -THREE.MathUtils.degToRad(event.gamma!), "YXZ");
  const q = new THREE.Quaternion().setFromEuler(euler);
  const q1 = new THREE.Quaternion(-Math.SQRT1_2, 0, 0, Math.SQRT1_2);
  const q0 = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(screenAngle));
  return q.multiply(q1).multiply(q0);
}

function headingFromQuaternion(quaternion: THREE.Quaternion) {
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);
  return normalizeDegrees((Math.atan2(forward.x, -forward.z) * 180) / Math.PI);
}

function directionFromBearing(bearing: number, currentHeading: number | null): DirectionKey {
  if (currentHeading === null) {
    const cardinal = Math.round(bearing / 45) * 45;
    if (cardinal === 0 || cardinal === 360) return "front";
    if (cardinal === 45) return "frontRight";
    if (cardinal === 90) return "right";
    if (cardinal === 135) return "backRight";
    if (cardinal === 180) return "back";
    if (cardinal === 225) return "backLeft";
    if (cardinal === 270) return "left";
    return "frontLeft";
  }
  const delta = ((bearing - currentHeading + 540) % 360) - 180;
  if (Math.abs(delta) <= 22.5) return "front";
  if (delta > 22.5 && delta <= 67.5) return "frontRight";
  if (delta > 67.5 && delta <= 112.5) return "right";
  if (delta > 112.5 && delta <= 157.5) return "backRight";
  if (Math.abs(delta) > 157.5) return "back";
  if (delta < -112.5 && delta >= -157.5) return "backLeft";
  if (delta < -67.5 && delta >= -112.5) return "left";
  return "frontLeft";
}

export function SkyScanExperienceV5() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const parcelGroupsRef = useRef(new Map<string, THREE.Group>());
  const parcelsRef = useRef<SkyParcel[]>([]);
  const orientationRef = useRef<THREE.Quaternion | null>(null);
  const rawHeadingRef = useRef<number | null>(null);
  const headingOffsetRef = useRef(0);
  const sensorModeRef = useRef<"absolute" | "relative" | null>(null);
  const rafRef = useRef<number | null>(null);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [sensorActive, setSensorActive] = useState(false);
  const [sensorError, setSensorError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [nearbyParcels, setNearbyParcels] = useState<RenderedParcel[]>([]);
  const [visibleParcels, setVisibleParcels] = useState<RenderedParcel[]>([]);
  const [selected, setSelected] = useState<RenderedParcel | null>(null);
  const [loadingParcels, setLoadingParcels] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    if (!navigator.geolocation) { setLocationError("Bu cihaz konum bilgisini desteklemiyor."); return; }
    const watchId = navigator.geolocation.watchPosition(
      (position) => setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: Math.max(1, position.coords.accuracy || 999), altitude: typeof position.coords.altitude === "number" ? position.coords.altitude : null }),
      (error) => setLocationError(error.message || "Konum alınamadı."),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const loadParcels = useCallback(async () => {
    setLoadingParcels(true);
    const { data: skyData, error: skyError } = await supabaseBrowser.from("sky_scan_parcels").select("id, parcel_id, parcel_number, latitude, longitude, scan_order").eq("city_id", GAZIANTEP_CITY_ID).order("scan_order", { ascending: true }).limit(1000);
    if (skyError) { setSensorError(`Parseller alınamadı: ${skyError.message}`); setLoadingParcels(false); return; }
    const ids = (skyData ?? []).map((row) => row.parcel_id).filter(Boolean);
    const { data: parcelData } = ids.length ? await supabaseBrowser.from("parcels").select("id, parcel_number, price, tier, status").in("id", ids) : { data: [] as any[] };
    const details = new Map((parcelData ?? []).map((row) => [row.id, row]));
    const next = (skyData ?? []).map((row) => {
      const parcel = details.get(row.parcel_id);
      return { id: row.id, parcel_id: row.parcel_id, parcel_number: row.parcel_number || parcel?.parcel_number || `P-${row.scan_order}`, latitude: Number(row.latitude), longitude: Number(row.longitude), price: Number(parcel?.price ?? 999), tier: parcel?.tier ?? null, status: parcel?.status ?? null, virtualAltitude: VIRTUAL_ALTITUDE_M } satisfies SkyParcel;
    }).filter((row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude));
    parcelsRef.current = next;
    setLoadedCount(next.length);
    setLoadingParcels(false);
  }, []);

  useEffect(() => { void loadParcels(); }, [loadParcels]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (!window.isSecureContext) throw new Error("Kamera yalnızca HTTPS bağlantısında çalışır.");
    const video = videoRef.current;
    if (!navigator.mediaDevices?.getUserMedia || !video) throw new Error("Bu tarayıcı kamera erişimini desteklemiyor.");
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920, min: 1280 }, height: { ideal: 1080, min: 720 }, frameRate: { ideal: 30, max: 60 } }, audio: false });
    streamRef.current = stream;
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
    setCameraStarted(true);
  }, []);

  useEffect(() => {
    if (!cameraStarted || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV_DEGREES, window.innerWidth / window.innerHeight, 0.1, 100000);
    scene.add(new THREE.HemisphereLight(0xdff6ff, 0x18202b, 1.7));
    scene.add(new THREE.DirectionalLight(0xffffff, 1.8));
    rendererRef.current = renderer; sceneRef.current = scene; cameraRef.current = camera;
    const resize = () => { renderer.setSize(window.innerWidth, window.innerHeight, false); camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); };
    resize(); window.addEventListener("resize", resize);
    const animate = () => { rafRef.current = requestAnimationFrame(animate); if (orientationRef.current) camera.quaternion.copy(orientationRef.current); renderer.render(scene, camera); };
    animate();
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); renderer.dispose(); scene.clear(); parcelGroupsRef.current.clear(); };
  }, [cameraStarted]);

  useEffect(() => {
    if (!cameraStarted) return;
    let active = false;
    const onOrientation = (event: Event) => {
      const source = event as OrientationLike;
      const isAbsolute = event.type === "deviceorientationabsolute" || source.absolute === true;
      if (sensorModeRef.current === null) sensorModeRef.current = isAbsolute ? "absolute" : "relative";
      if (sensorModeRef.current !== (isAbsolute ? "absolute" : "relative")) return;
      const q = deviceQuaternion(source, Number(window.screen?.orientation?.angle ?? 0));
      if (!q) return;
      orientationRef.current = q;
      const raw = headingFromQuaternion(q);
      rawHeadingRef.current = raw;
      const compass = typeof source.webkitCompassHeading === "number" && Number.isFinite(source.webkitCompassHeading) ? normalizeDegrees(source.webkitCompassHeading) : raw;
      if (typeof source.webkitCompassHeading === "number" && Number.isFinite(source.webkitCompassHeading)) headingOffsetRef.current = normalizeDegrees(compass - raw);
      setHeading(normalizeDegrees(raw + headingOffsetRef.current));
      active = true; setSensorActive(true); setSensorError(null);
    };
    const onMotion = (event: Event) => {
      const acceleration = (event as DeviceMotionEvent).accelerationIncludingGravity;
      if ([acceleration?.x, acceleration?.y, acceleration?.z].some((value) => typeof value === "number" && Math.abs(value) > 0.05)) { active = true; setSensorActive(true); setSensorError(null); }
    };
    window.addEventListener("deviceorientationabsolute", onOrientation, true);
    window.addEventListener("deviceorientation", onOrientation, true);
    window.addEventListener("devicemotion", onMotion, true);
    const timer = window.setTimeout(() => { if (!active) setSensorError("Sensör verisi alınamadı. Kamera açık kalacak."); }, 3500);
    return () => { window.removeEventListener("deviceorientationabsolute", onOrientation, true); window.removeEventListener("deviceorientation", onOrientation, true); window.removeEventListener("devicemotion", onMotion, true); window.clearTimeout(timer); };
  }, [cameraStarted]);

  useEffect(() => {
    if (!location || !sensorActive || !sceneRef.current) return;
    const candidates: RenderedParcel[] = [];
    for (const parcel of parcelsRef.current) {
      const world = geoToEus(location, { latitude: parcel.latitude, longitude: parcel.longitude, altitude: (location.altitude ?? 0) + parcel.virtualAltitude });
      const distance = Math.hypot(world.x, world.z);
      if (!Number.isFinite(distance) || distance > SCAN_RADIUS_M) continue;
      const bearing = normalizeDegrees((Math.atan2(world.x, -world.z) * 180) / Math.PI);
      candidates.push({ ...parcel, distance, bearing, position: new THREE.Vector3(world.x, world.y, world.z) });
    }
    candidates.sort((a, b) => a.distance - b.distance);
    setNearbyParcels(candidates);
    const currentHeading = heading;
    const inDirection = currentHeading === null ? candidates.slice(0, MAX_VISIBLE) : candidates.filter((parcel) => angularDifference(parcel.bearing, currentHeading) <= FOV_DEGREES * 0.75).slice(0, MAX_VISIBLE);
    const scene = sceneRef.current;
    const nextIds = new Set(inDirection.map((parcel) => parcel.id));
    for (const [id, group] of parcelGroupsRef.current) {
      if (!nextIds.has(id)) { scene.remove(group); group.traverse((object) => { if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) { object.geometry.dispose(); if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose()); else object.material.dispose(); } }); parcelGroupsRef.current.delete(id); }
    }
    for (const parcel of inDirection) {
      let group = parcelGroupsRef.current.get(parcel.id);
      if (!group) { group = makeCrystal(scene, parcel); parcelGroupsRef.current.set(parcel.id, group); }
      else group.position.copy(parcel.position);
    }
    setVisibleParcels(inDirection);
  }, [location, heading, sensorActive]);

  const startScan = useCallback(async () => {
    setSensorError(null); setSensorActive(false); setHeading(null); sensorModeRef.current = null;
    try { await startCamera(); } catch (error) { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; setCameraError(error instanceof Error ? error.message : "Kamera başlatılamadı."); return; }
    const Orientation = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> };
    if (typeof Orientation.requestPermission === "function") { try { const permission = await Orientation.requestPermission(); if (permission !== "granted") setSensorError("Yön sensörü izni verilmedi. Kamera çalışmaya devam eder."); } catch { setSensorError("Yön sensörü izni alınamadı. Kamera çalışmaya devam eder."); } }
  }, [startCamera]);

  const stopScan = useCallback(() => { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; if (videoRef.current) { videoRef.current.pause(); videoRef.current.srcObject = null; } setCameraStarted(false); setSensorActive(false); setHeading(null); setSelected(null); setNearbyParcels([]); setVisibleParcels([]); sensorModeRef.current = null; }, []);
  const calibrate = useCallback(() => { if (rawHeadingRef.current !== null && heading !== null) headingOffsetRef.current = normalizeDegrees(heading - rawHeadingRef.current); setSensorError(null); }, [heading]);

  const directionSummary = useMemo(() => {
    const counts: Record<DirectionKey, number> = { front: 0, frontRight: 0, right: 0, backRight: 0, back: 0, backLeft: 0, left: 0, frontLeft: 0 };
    for (const parcel of nearbyParcels) counts[directionFromBearing(parcel.bearing, heading)] += 1;
    return counts;
  }, [nearbyParcels, heading]);
  const nearest = nearbyParcels[0] ?? null;
  const nearestDirection = nearest ? directionFromBearing(nearest.bearing, heading) : null;
  const nearestLabel = nearest && nearestDirection ? `${directionText[nearestDirection]} • ${Math.round(nearest.distance)} m` : "Parsel aranıyor";
  const selectedLabel = useMemo(() => selected ? `${selected.parcel_number} • ${Math.round(selected.distance)} m • ₺${selected.price.toLocaleString("tr-TR")}` : null, [selected]);
  useEffect(() => () => { streamRef.current?.getTracks().forEach((track) => track.stop()); }, []);

  return <main className="fixed inset-0 overflow-hidden bg-slate-950 text-white">
    <video ref={videoRef} className={`absolute inset-0 z-0 h-full w-full object-cover ${cameraStarted ? "block" : "hidden"}`} playsInline muted autoPlay />
    <canvas ref={canvasRef} className={`absolute inset-0 z-10 h-full w-full pointer-events-none ${cameraStarted ? "block" : "hidden"}`} />
    {!cameraStarted && <div className="absolute inset-0 z-30 flex items-center justify-center px-6"><div className="w-full max-w-md rounded-3xl border border-white/15 bg-slate-950/92 p-7 text-center shadow-2xl backdrop-blur-xl"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-300/10"><Radio className="h-8 w-8 text-cyan-200" /></div><p className="mt-5 text-[10px] font-bold uppercase tracking-[.28em] text-cyan-300">MySkyParcel • World AR</p><h1 className="mt-2 text-2xl font-bold">Gökyüzünü Tara</h1><p className="mt-3 text-sm leading-6 text-white/65">Bulunduğun konumdaki parselleri sayar ve telefonunu sağa-sola çevirerek bulman için yönlendirir.</p><div className="mt-5 grid grid-cols-3 gap-2 text-[10px] text-white/55"><div className="rounded-xl bg-white/5 p-3">{loadedCount.toLocaleString("tr-TR")}<br />parsel</div><div className="rounded-xl bg-white/5 p-3">15 km<br />tarama</div><div className="rounded-xl bg-white/5 p-3">650 m<br />sanal irtifa</div></div><button onClick={startScan} className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950">Gerçek gökyüzünü tara</button>{locationError && <p className="mt-3 text-xs text-amber-200">{locationError}</p>}{cameraError && <p className="mt-3 text-xs text-red-200">{cameraError}</p>}</div></div>}
    {cameraStarted && <><div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 pt-[max(.75rem,env(safe-area-inset-top))]"><div className="mx-auto max-w-xl rounded-3xl border border-white/15 bg-black/55 p-3 backdrop-blur-xl"><div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-xs font-semibold"><LocateFixed className="h-4 w-4" /> Konumunda <span className="text-cyan-200">{nearbyParcels.length} parsel</span> var</div><div className="mt-1 text-[10px] text-white/55">{loadedCount.toLocaleString("tr-TR")} Gaziantep parseli • {location ? `${Math.round(location.accuracy)} m GPS` : "GPS bekleniyor"}</div></div><button onClick={stopScan} className="pointer-events-auto rounded-full border border-white/20 bg-black/45 p-2.5" aria-label="Kamerayı kapat"><X className="h-5 w-5" /></button></div><div className="mt-3 rounded-2xl bg-white/5 p-3"><div className="text-[9px] font-bold uppercase tracking-[.2em] text-cyan-200">En yakın parsel</div><div className="mt-1 flex items-center gap-2"><span className="text-2xl font-bold">{nearestDirection ? directionArrow[nearestDirection] : "•"}</span><div><div className="text-sm font-bold">{nearestLabel}</div>{nearest && <div className="text-[10px] text-white/50">{nearest.parcel_number}</div>}</div></div></div><div className="mt-2 grid grid-cols-4 gap-1.5 text-center text-[9px] font-semibold"><div className="rounded-xl bg-white/5 p-2"><b className="block text-sm">{directionSummary.front}</b>Önünde</div><div className="rounded-xl bg-white/5 p-2"><b className="block text-sm">{directionSummary.frontRight + directionSummary.right}</b>Sağında</div><div className="rounded-xl bg-white/5 p-2"><b className="block text-sm">{directionSummary.frontLeft + directionSummary.left}</b>Solunda</div><div className="rounded-xl bg-white/5 p-2"><b className="block text-sm">{directionSummary.back + directionSummary.backRight + directionSummary.backLeft}</b>Arkanda</div></div></div></div><div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"><Crosshair className="h-10 w-10 text-white/60" strokeWidth={1.2} /></div>{selected && <button onClick={() => setSelected(null)} className="absolute left-1/2 top-[24%] z-30 -translate-x-1/2 rounded-2xl border border-white/20 bg-black/65 px-4 py-3 text-left shadow-2xl backdrop-blur-xl"><div className="text-[10px] uppercase tracking-[.2em] text-cyan-200">Parsel</div><div className="mt-1 text-sm font-bold">{selectedLabel}</div></button>}<div className="absolute inset-x-0 bottom-0 z-20 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))]"><div className="mx-auto max-w-xl rounded-3xl border border-white/15 bg-black/60 p-3 backdrop-blur-xl"><div className="grid grid-cols-4 gap-2 text-center text-[10px] text-white/70"><div><MapPin className="mx-auto mb-1 h-4 w-4" />{location ? `${Math.round(location.accuracy)} m` : "GPS"}</div><div><Compass className="mx-auto mb-1 h-4 w-4" />{heading !== null ? `${Math.round(heading)}°` : "Pusula"}</div><div><b className="block text-cyan-200">{visibleParcels.length}</b>Görüşte</div><button onClick={calibrate} className="pointer-events-auto rounded-xl bg-white/10 px-2 py-1">Yön kalibre</button></div>{sensorError && <p className="mt-2 text-center text-xs text-amber-200">{sensorError}</p>}<p className="mt-2 text-center text-[9px] text-white/40">Telefonu sağa veya sola çevir. Sayaç ve yönlendirme anlık güncellenir.</p></div></div></>}
  </main>;
}
