import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SiteHeader } from "@/components/SiteHeader";
import { geoToSkyWorld, type GeoPoint } from "@/lib/skyCoordinateEngine";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanPage });

type SkyParcel = {
  id: string;
  parcelNumber: string;
  latitude: number;
  longitude: number;
  altitude: number;
  distance: number;
  bearing: number;
  status: string;
  tier: string | null;
  tierPrice: number | null;
};
type SensorState = "idle" | "starting" | "active" | "denied" | "unsupported";
type OrientationSample = { alpha: number; beta: number; gamma: number; absolute: boolean; compass?: number; source: "absolute" | "relative" | "compass" };
type DeviceOrientationWithCompass = DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };

const FALLBACK_ORIGIN: GeoPoint = { latitude: 37.0662, longitude: 37.3833, altitude: 0 };
const LOAD_RADIUS_METERS = 2500;
const MAX_REAL_PARCELS = 300;
const EARTH_RADIUS = 6371000;

function distanceBearing(origin: GeoPoint, target: GeoPoint) {
  const lat1 = origin.latitude * Math.PI / 180;
  const lat2 = target.latitude * Math.PI / 180;
  const dLat = (target.latitude - origin.latitude) * Math.PI / 180;
  const dLon = (target.longitude - origin.longitude) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const distance = 2 * EARTH_RADIUS * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  return { distance, bearing };
}

function layerAltitude(layer: number | null | undefined) {
  const safeLayer = Math.max(1, Number(layer) || 1);
  return 180 + (safeLayer - 1) * 80;
}

async function loadNearbyParcels(origin: GeoPoint): Promise<SkyParcel[]> {
  const latDelta = LOAD_RADIUS_METERS / 111320;
  const lonDelta = LOAD_RADIUS_METERS / (111320 * Math.max(0.2, Math.cos(origin.latitude * Math.PI / 180)));
  const { data, error } = await supabaseBrowser
    .from("parcel_map_public")
    .select("id,parcel_number,status,tier,tier_price,latitude,longitude,layer_number")
    .gte("latitude", origin.latitude - latDelta)
    .lte("latitude", origin.latitude + latDelta)
    .gte("longitude", origin.longitude - lonDelta)
    .lte("longitude", origin.longitude + lonDelta)
    .eq("status", "available")
    .limit(MAX_REAL_PARCELS);
  if (error) throw error;
  return (data ?? [])
    .filter((row) => Number.isFinite(Number(row.latitude)) && Number.isFinite(Number(row.longitude)))
    .map((row) => {
      const point = { latitude: Number(row.latitude), longitude: Number(row.longitude), altitude: 0 };
      const { distance, bearing } = distanceBearing(origin, point);
      return {
        id: String(row.id),
        parcelNumber: String(row.parcel_number),
        latitude: point.latitude,
        longitude: point.longitude,
        altitude: layerAltitude(Number(row.layer_number)),
        distance,
        bearing,
        status: String(row.status),
        tier: row.tier == null ? null : String(row.tier),
        tierPrice: row.tier_price == null ? null : Number(row.tier_price),
      };
    })
    .filter((parcel) => parcel.distance <= LOAD_RADIUS_METERS)
    .sort((a, b) => a.distance - b.distance);
}

function SkyScanPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const orientationRef = useRef<OrientationSample | null>(null);
  const sensorEnabledRef = useRef(false);
  const [selected, setSelected] = useState<SkyParcel | null>(null);
  const [locationText, setLocationText] = useState("GPS bekleniyor");
  const [parcelText, setParcelText] = useState("Gerçek parseller GPS konumuna göre yükleniyor…");
  const [cameraState, setCameraState] = useState<"starting" | "ready" | "blocked" | "unsupported">("starting");
  const [cameraError, setCameraError] = useState("");
  const [sensorState, setSensorState] = useState<SensorState>("idle");
  const [sensorText, setSensorText] = useState("Sensörler başlatılmadı");
  const navigate = useNavigate();

  const startCamera = async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) { setCameraState("unsupported"); setCameraError("Bu tarayıcı canlı kamerayı desteklemiyor."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream; video.muted = true; video.playsInline = true;
      await video.play(); setCameraState("ready");
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "CameraError";
      setCameraState("blocked");
      setCameraError(name === "NotAllowedError" ? "Kamera izni verilmedi." : name === "NotFoundError" ? "Kamera bulunamadı." : "Kamera başlatılamadı. HTTPS ve kamera iznini kontrol edin.");
    }
  };

  const startSensors = async () => {
    setSensorState("starting"); setSensorText("Pusula ve jiroskop izni isteniyor…");
    if (!("DeviceOrientationEvent" in window)) { setSensorState("unsupported"); setSensorText("Bu tarayıcı yön sensörünü desteklemiyor."); return; }
    try {
      const Orientation = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: (absolute?: boolean) => Promise<PermissionState> };
      const Motion = window.DeviceMotionEvent as typeof DeviceMotionEvent & { requestPermission?: () => Promise<PermissionState> };
      if (Orientation.requestPermission && (await Orientation.requestPermission(true)) !== "granted") throw new Error("orientation-denied");
      if (Motion.requestPermission && (await Motion.requestPermission()) !== "granted") throw new Error("motion-denied");
      sensorEnabledRef.current = true; setSensorState("active"); setSensorText("Sensör aktif · telefonu hareket ettirin");
    } catch { sensorEnabledRef.current = false; setSensorState("denied"); setSensorText("Sensör izni verilmedi. Tekrar deneyin."); }
  };

  useEffect(() => { void startCamera(); return () => { streamRef.current?.getTracks().forEach((track) => track.stop()); }; }, []);

  useEffect(() => {
    const read = (event: DeviceOrientationWithCompass, source: "absolute" | "relative") => {
      if (event.alpha == null || event.beta == null || event.gamma == null) return;
      const compass = Number.isFinite(event.webkitCompassHeading) ? event.webkitCompassHeading : undefined;
      if (source === "relative" && orientationRef.current?.source === "absolute" && compass == null) return;
      orientationRef.current = { alpha: event.alpha, beta: event.beta, gamma: event.gamma, absolute: source === "absolute" || event.absolute, compass, source: compass != null ? "compass" : source };
    };
    const handleAbsolute = (raw: Event) => read(raw as DeviceOrientationWithCompass, "absolute");
    const handleRelative = (raw: Event) => read(raw as DeviceOrientationWithCompass, "relative");
    window.addEventListener("deviceorientationabsolute", handleAbsolute);
    window.addEventListener("deviceorientation", handleRelative);
    return () => { window.removeEventListener("deviceorientationabsolute", handleAbsolute); window.removeEventListener("deviceorientation", handleRelative); };
  }, []);

  useEffect(() => {
    const mount = mountRef.current; if (!mount) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, Math.max(mount.clientWidth, 1) / Math.max(mount.clientHeight, 1), 0.1, 12000);
    camera.position.set(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75)); renderer.setSize(mount.clientWidth, mount.clientHeight); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.domElement.style.touchAction = "none"; mount.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0x9fc5ff, 0x07111f, 1.8));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4); sun.position.set(400, 700, 250); scene.add(sun);

    const parcelMeshes = new Map<THREE.Object3D, SkyParcel>();
    const parcelGroups = new Map<string, THREE.Group>();
    let origin = FALLBACK_ORIGIN;
    let lastGpsOrigin: GeoPoint | null = null;
    let fetchSerial = 0;

    const clearParcels = () => {
      for (const group of parcelGroups.values()) {
        group.traverse((object) => { if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) { object.geometry.dispose(); const material = object.material; if (Array.isArray(material)) material.forEach((m) => m.dispose()); else material.dispose(); } });
        scene.remove(group);
      }
      parcelGroups.clear(); parcelMeshes.clear();
    };

    const createParcel = (parcel: SkyParcel) => {
      const world = geoToSkyWorld(origin, { latitude: parcel.latitude, longitude: parcel.longitude, altitude: parcel.altitude });
      const group = new THREE.Group();
      group.position.set(world.x, world.y, -world.z);
      const size = Math.max(28, Math.min(70, parcel.distance * 0.045));
      const box = new THREE.BoxGeometry(size, 6, size);
      const material = new THREE.MeshStandardMaterial({ color: parcel.status === "available" ? 0xd6a84f : 0x777777, emissive: 0x8a5d16, emissiveIntensity: 0.65, metalness: 0.45, roughness: 0.28 });
      const mesh = new THREE.Mesh(box, material); mesh.userData.parcel = parcel; group.add(mesh); parcelMeshes.set(mesh, parcel);
      group.add(new THREE.LineSegments(new THREE.EdgesGeometry(box), new THREE.LineBasicMaterial({ color: 0xffe8ad })));
      const beacon = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 6, 65, 10), new THREE.MeshStandardMaterial({ color: 0xf4c65d, emissive: 0x9b6718, emissiveIntensity: 0.9 })); beacon.position.y = 35; group.add(beacon);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(size * 0.68, 1.4, 8, 32), new THREE.MeshBasicMaterial({ color: 0xffd76a })); ring.rotation.x = Math.PI / 2; ring.position.y = 5; group.add(ring);
      scene.add(group); parcelGroups.set(parcel.id, group);
    };

    const loadAndRebuild = async (nextOrigin: GeoPoint) => {
      origin = nextOrigin;
      const serial = ++fetchSerial;
      setParcelText("Yakındaki gerçek parseller yükleniyor…");
      try {
        const parcels = await loadNearbyParcels(nextOrigin);
        if (serial !== fetchSerial) return;
        clearParcels();
        parcels.forEach(createParcel);
        setSelected(null);
        setParcelText(parcels.length ? `${parcels.length} gerçek parsel · ${LOAD_RADIUS_METERS / 1000} km yarıçap` : "Bu konum çevresinde uygun gerçek parsel bulunamadı.");
      } catch (error) {
        if (serial !== fetchSerial) return;
        clearParcels(); setSelected(null);
        setParcelText(`Gerçek parseller yüklenemedi: ${error instanceof Error ? error.message : "Supabase bağlantısı"}`);
      }
    };

    const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2();
    const onPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect(); pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1; pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObjects([...parcelMeshes.keys()], false)[0]; if (hit) setSelected(parcelMeshes.get(hit.object) ?? null);
    };
    renderer.domElement.addEventListener("pointerup", onPointer);

    let animationFrame = 0;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      const sample = orientationRef.current;
      if (sensorEnabledRef.current && sample) {
        const alpha = THREE.MathUtils.degToRad(sample.compass ?? sample.alpha);
        const beta = THREE.MathUtils.degToRad(sample.beta);
        const gamma = THREE.MathUtils.degToRad(sample.gamma);
        const screenAngle = THREE.MathUtils.degToRad(screen.orientation?.angle ?? 0);
        const deviceQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(beta, alpha, -gamma, "YXZ"));
        deviceQuaternion.multiply(new THREE.Quaternion(-Math.SQRT1_2, 0, 0, Math.SQRT1_2));
        deviceQuaternion.multiply(new THREE.Quaternion(0, 0, Math.sin(-screenAngle / 2), Math.cos(-screenAngle / 2)));
        camera.quaternion.slerp(deviceQuaternion, 0.2);
      }
      renderer.render(scene, camera);
    }; animate();

    const resize = () => { if (!mount.clientWidth || !mount.clientHeight) return; camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight); };
    window.addEventListener("resize", resize); window.addEventListener("orientationchange", resize);
    let watchId: number | null = null;
    if ("geolocation" in navigator) watchId = navigator.geolocation.watchPosition((position) => {
      const next = { latitude: position.coords.latitude, longitude: position.coords.longitude, altitude: position.coords.altitude ?? 0 };
      setLocationText(`${next.latitude.toFixed(5)}, ${next.longitude.toFixed(5)}`);
      const moved = !lastGpsOrigin ? Infinity : Math.hypot((next.latitude - lastGpsOrigin.latitude) * 111320, (next.longitude - lastGpsOrigin.longitude) * 111320 * Math.cos(next.latitude * Math.PI / 180));
      if (moved > 40) { lastGpsOrigin = next; void loadAndRebuild(next); }
    }, () => setLocationText("GPS izni verilmedi · konum bekleniyor"), { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 });

    void loadAndRebuild(origin);
    return () => {
      fetchSerial++; cancelAnimationFrame(animationFrame); if (watchId !== null) navigator.geolocation.clearWatch(watchId); window.removeEventListener("resize", resize); window.removeEventListener("orientationchange", resize); renderer.domElement.removeEventListener("pointerup", onPointer); clearParcels(); renderer.dispose(); if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="min-h-screen bg-slate-950 text-white"><SiteHeader /><main className="mx-auto max-w-[1800px] px-3 pb-6 pt-3 sm:px-5 lg:px-8">
    <section className="mb-3 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/90 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.24em] text-amber-300">MySkyParcel · 3D Sky Engine</p><h1 className="mt-1 font-display text-2xl sm:text-3xl">Gökyüzünü Tara</h1><p className="mt-1 text-xs text-white/55">Canlı kamera + GPS + pusula + jiroskop ile gerçek 3B gökyüzü koordinatları.</p></div><div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/65">Konum: {locationText}</div></section>
    <div className="relative h-[72vh] min-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"><video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full object-cover" aria-label="Canlı kamera görüntüsü" /><div ref={mountRef} className="absolute inset-0" aria-label="MySkyParcel gerçek 3B gökyüzü sahnesi" />{cameraState !== "ready" && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85 p-5 text-center backdrop-blur-sm"><div className="max-w-md rounded-2xl border border-amber-300/20 bg-slate-900/95 p-5"><p className="text-sm font-semibold text-amber-300">Canlı kamera gerekli</p><p className="mt-2 text-xs text-white/65">{cameraError || "Kamera başlatılıyor…"}</p>{(cameraState === "blocked" || cameraState === "unsupported") && <button type="button" onClick={() => void startCamera()} className="mt-4 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950">Kamera'yı Aç</button>}</div></div>}</div>
    <section className="mt-3 rounded-2xl border border-amber-300/15 bg-slate-900/90 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-amber-300">Gerçek 3B parseller</p><p className="mt-1 text-sm text-white/70">{parcelText}</p><p className={`mt-2 text-xs ${sensorState === "active" ? "text-emerald-300" : "text-white/55"}`}>● {sensorText}</p>{selected && <div className="mt-2"><p className="font-display text-xl">PARSEL #{selected.parcelNumber}</p><p className="text-xs text-white/55">{Math.round(selected.distance)} m · {Math.round(selected.bearing)}° · {selected.tierPrice != null ? `${selected.tierPrice.toFixed(0)} TL` : "fiyat bilgisi yok"}</p></div>}</div><div className="flex flex-col gap-2 sm:min-w-[220px]"><button type="button" onClick={() => void startSensors()} disabled={sensorState === "starting"} className="rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">Pusula + Jiroskopu Başlat</button>{selected && <button type="button" onClick={() => navigate({ to: "/parsel-satin-al", search: { parcels: selected.id } })} className="rounded-xl border border-amber-300/30 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Bu parseli satın al</button>}</div></div></section>
  </main></div>;
}
