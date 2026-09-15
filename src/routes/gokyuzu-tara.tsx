import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SiteHeader } from "@/components/SiteHeader";
import { geoToSkyWorld, type GeoPoint } from "@/lib/skyCoordinateEngine";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanPage });

type SkyParcel = { id: string; parcelNumber: string; latitude: number; longitude: number; altitude: number; distance: number; bearing: number; status: string; tier: string | null; tierPrice: number | null };
type SensorState = "idle" | "starting" | "active" | "denied" | "unsupported";
type OrientationSample = { alpha: number; beta: number; gamma: number; absolute: boolean; compass?: number; source: "absolute" | "relative" | "compass" };
type DeviceOrientationWithCompass = DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };

const LOAD_RADIUS_METERS = 2500;
const MAX_REAL_PARCELS = 1000;
const EARTH_RADIUS = 6371000;

function normalizeDegrees(value: number) { return ((value % 360) + 360) % 360; }
function distanceBearing(origin: GeoPoint, target: GeoPoint) {
  const lat1 = origin.latitude * Math.PI / 180, lat2 = target.latitude * Math.PI / 180;
  const dLat = (target.latitude - origin.latitude) * Math.PI / 180, dLon = (target.longitude - origin.longitude) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const distance = 2 * EARTH_RADIUS * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return { distance, bearing: normalizeDegrees(Math.atan2(y, x) * 180 / Math.PI) };
}
function layerAltitude(layer: number | null | undefined) { return 180 + (Math.max(1, Number(layer) || 1) - 1) * 80; }

async function loadNearbyParcels(origin: GeoPoint): Promise<SkyParcel[]> {
  const latDelta = LOAD_RADIUS_METERS / 111320;
  const lonDelta = LOAD_RADIUS_METERS / (111320 * Math.max(0.2, Math.cos(origin.latitude * Math.PI / 180)));
  const { data, error } = await supabaseBrowser.from("parcel_map_public")
    .select("id,parcel_number,status,tier,tier_price,latitude,longitude,layer_number")
    .gte("latitude", origin.latitude - latDelta).lte("latitude", origin.latitude + latDelta)
    .gte("longitude", origin.longitude - lonDelta).lte("longitude", origin.longitude + lonDelta)
    .eq("status", "available").limit(MAX_REAL_PARCELS);
  if (error) throw error;
  return (data ?? []).filter(r => Number.isFinite(Number(r.latitude)) && Number.isFinite(Number(r.longitude))).map(r => {
    const point = { latitude: Number(r.latitude), longitude: Number(r.longitude), altitude: 0 };
    const { distance, bearing } = distanceBearing(origin, point);
    return { id: String(r.id), parcelNumber: String(r.parcel_number), latitude: point.latitude, longitude: point.longitude, altitude: layerAltitude(Number(r.layer_number)), distance, bearing, status: String(r.status), tier: r.tier == null ? null : String(r.tier), tierPrice: r.tier_price == null ? null : Number(r.tier_price) };
  }).filter(p => p.distance <= LOAD_RADIUS_METERS).sort((a, b) => a.distance - b.distance);
}

function screenAngle() {
  if (typeof screen !== "undefined" && screen.orientation && Number.isFinite(screen.orientation.angle)) return screen.orientation.angle;
  return typeof window !== "undefined" && typeof window.orientation === "number" ? window.orientation : 0;
}

function buildDeviceCameraQuaternion(sample: OrientationSample) {
  const euler = new THREE.Euler(
    THREE.MathUtils.degToRad(sample.beta),
    THREE.MathUtils.degToRad(sample.alpha),
    THREE.MathUtils.degToRad(-sample.gamma),
    "YXZ",
  );
  const q = new THREE.Quaternion().setFromEuler(euler);
  q.multiply(new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)));
  q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -THREE.MathUtils.degToRad(screenAngle())));
  return q;
}

function SkyScanPage() {
  const mountRef = useRef<HTMLDivElement>(null), videoRef = useRef<HTMLVideoElement>(null), streamRef = useRef<MediaStream | null>(null);
  const orientationRef = useRef<OrientationSample | null>(null), sensorEnabledRef = useRef(false), worldAnchorRef = useRef(new THREE.Quaternion());
  const [selected, setSelected] = useState<SkyParcel | null>(null), [locationText, setLocationText] = useState("GPS bekleniyor");
  const [parcelText, setParcelText] = useState("GPS konumunuz alınmadan parsel yüklenmeyecek."), [cameraState, setCameraState] = useState<"starting" | "ready" | "blocked" | "unsupported">("starting");
  const [cameraError, setCameraError] = useState(""), [sensorState, setSensorState] = useState<SensorState>("idle");
  const [sensorText, setSensorText] = useState("Sensörler başlatılmadı"), [headingText, setHeadingText] = useState("Pusula: --°");
  const navigate = useNavigate();

  const startCamera = async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) { setCameraState("unsupported"); setCameraError("Bu tarayıcı canlı kamerayı desteklemiyor."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = stream;
      const video = videoRef.current; if (!video) return;
      video.srcObject = stream; video.muted = true; video.playsInline = true; await video.play(); setCameraState("ready");
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "CameraError"; setCameraState("blocked");
      setCameraError(name === "NotAllowedError" ? "Kamera izni verilmedi." : name === "NotFoundError" ? "Kamera bulunamadı." : "Kamera başlatılamadı. HTTPS ve kamera iznini kontrol edin.");
    }
  };

  const startSensors = async () => {
    setSensorState("starting"); setSensorText("Pusula ve jiroskop izni isteniyor…"); sensorEnabledRef.current = false; orientationRef.current = null; worldAnchorRef.current.identity();
    if (!("DeviceOrientationEvent" in window)) { setSensorState("unsupported"); setSensorText("Bu tarayıcı yön sensörünü desteklemiyor."); return; }
    try {
      const Orientation = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: (absolute?: boolean) => Promise<PermissionState> };
      const Motion = window.DeviceMotionEvent as typeof DeviceMotionEvent & { requestPermission?: () => Promise<PermissionState> };
      if (Orientation.requestPermission && await Orientation.requestPermission(true) !== "granted") throw new Error("orientation-denied");
      if (Motion.requestPermission && await Motion.requestPermission() !== "granted") throw new Error("motion-denied");
      sensorEnabledRef.current = true; setSensorState("active"); setSensorText("Sensörler aktif · telefonu çevirin ve yukarı kaldırın");
    } catch (e) {
      sensorEnabledRef.current = false; setSensorState("denied"); setSensorText(e instanceof Error && e.message === "orientation-denied" ? "Pusula izni verilmedi. Tarayıcı ayarlarından sensör iznini açın." : "Sensör izni verilmedi. Tekrar deneyin.");
    }
  };

  useEffect(() => { void startCamera(); return () => streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  useEffect(() => {
    const read = (event: DeviceOrientationWithCompass, source: "absolute" | "relative") => {
      if (event.alpha == null || event.beta == null || event.gamma == null) return;
      const raw = event.webkitCompassHeading, compass = Number.isFinite(raw) ? normalizeDegrees(raw as number) : undefined;
      const absolute = source === "absolute" || event.absolute === true;
      orientationRef.current = { alpha: event.alpha, beta: event.beta, gamma: event.gamma, absolute, compass, source: compass != null ? "compass" : absolute ? "absolute" : "relative" };
      setHeadingText(compass != null ? `Pusula: ${Math.round(compass)}°` : absolute ? `Pusula: ${Math.round(normalizeDegrees(event.alpha))}°` : "Pusula: göreli sensör · 3B yerel kalibrasyon");
    };
    const abs = (e: Event) => { if (sensorEnabledRef.current) read(e as DeviceOrientationWithCompass, "absolute"); };
    const rel = (e: Event) => { if (sensorEnabledRef.current) { const x = e as DeviceOrientationWithCompass; if (x.absolute !== true) read(x, "relative"); } };
    window.addEventListener("deviceorientationabsolute", abs); window.addEventListener("deviceorientation", rel);
    return () => { window.removeEventListener("deviceorientationabsolute", abs); window.removeEventListener("deviceorientation", rel); };
  }, []);

  useEffect(() => {
    const mount = mountRef.current; if (!mount) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, Math.max(1, mount.clientWidth) / Math.max(1, mount.clientHeight), 0.1, 15000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75)); renderer.setSize(mount.clientWidth, mount.clientHeight); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.domElement.style.touchAction = "none"; mount.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0x9fc5ff, 0x07111f, 1.8)); const sun = new THREE.DirectionalLight(0xffffff, 2.4); sun.position.set(400, 700, 250); scene.add(sun);
    const meshes = new Map<THREE.Object3D, SkyParcel>(), groups = new Map<string, THREE.Group>(); let origin: GeoPoint | null = null, lastOrigin: GeoPoint | null = null, serial = 0, anchorReady = false;
    const clear = () => { for (const g of groups.values()) { g.traverse(o => { if (o instanceof THREE.Mesh || o instanceof THREE.LineSegments) { o.geometry.dispose(); const m = o.material; Array.isArray(m) ? m.forEach(x => x.dispose()) : m.dispose(); } }); scene.remove(g); } groups.clear(); meshes.clear(); anchorReady = false; };
    const createParcel = (p: SkyParcel) => {
      if (!origin) return;
      const w = geoToSkyWorld(origin, { latitude: p.latitude, longitude: p.longitude, altitude: p.altitude });
      const v = new THREE.Vector3(w.x, w.y, -w.z).applyQuaternion(worldAnchorRef.current);
      const g = new THREE.Group(); g.position.copy(v);
      const size = Math.max(28, Math.min(90, 24 + p.distance * 0.035));
      const box = new THREE.BoxGeometry(size, Math.max(8, size * 0.12), size);
      const mat = new THREE.MeshStandardMaterial({ color: 0xd6a84f, emissive: 0x8a5d16, emissiveIntensity: 0.8, metalness: 0.45, roughness: 0.28 });
      const mesh = new THREE.Mesh(box, mat); mesh.userData.parcel = p; g.add(mesh); meshes.set(mesh, p);
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(box), new THREE.LineBasicMaterial({ color: 0xffe8ad })));
      const beacon = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(3, size * 0.07), Math.max(5, size * 0.11), Math.max(55, size * 1.15), 10), new THREE.MeshStandardMaterial({ color: 0xf4c65d, emissive: 0x9b6718, emissiveIntensity: 1 })); beacon.position.y = size * 0.65; g.add(beacon);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(size * 0.68, Math.max(1.5, size * 0.035), 8, 32), new THREE.MeshBasicMaterial({ color: 0xffd76a })); ring.rotation.x = Math.PI / 2; ring.position.y = size * 0.08; g.add(ring);
      scene.add(g); groups.set(p.id, g);
    };
    const load = async (next: GeoPoint) => {
      origin = next; const my = ++serial; setParcelText("GPS konumunuza yakın gerçek parseller yükleniyor…");
      try {
        const parcels = await loadNearbyParcels(next); if (my !== serial || !origin) return; clear();
        if (!anchorReady && parcels[0] && orientationRef.current?.source === "relative") {
          const w = geoToSkyWorld(origin, { latitude: parcels[0].latitude, longitude: parcels[0].longitude, altitude: parcels[0].altitude });
          const source = new THREE.Vector3(w.x, w.y, -w.z).normalize();
          const q = buildDeviceCameraQuaternion(orientationRef.current); const target = new THREE.Vector3(0, 0, -1).applyQuaternion(q).normalize();
          worldAnchorRef.current.setFromUnitVectors(source, target); anchorReady = true;
        }
        parcels.forEach(createParcel); setSelected(null); setParcelText(parcels.length ? `${parcels.length} gerçek 3B parsel · ${LOAD_RADIUS_METERS / 1000} km yarıçap` : "Bu GPS konumu çevresinde uygun gerçek parsel bulunamadı.");
      } catch (e) { if (my !== serial) return; clear(); setParcelText(`Gerçek parseller yüklenemedi: ${e instanceof Error ? e.message : "Supabase bağlantısı"}`); }
    };
    const raycaster = new THREE.Raycaster(), pointer = new THREE.Vector2();
    const onPointer = (e: PointerEvent) => { const r = renderer.domElement.getBoundingClientRect(); pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); raycaster.setFromCamera(pointer, camera); const hit = raycaster.intersectObjects([...meshes.keys()], false)[0]; if (hit) setSelected(meshes.get(hit.object) ?? null); };
    renderer.domElement.addEventListener("pointerup", onPointer);
    let raf = 0; const animate = () => { raf = requestAnimationFrame(animate); const s = orientationRef.current; if (sensorEnabledRef.current && s) camera.quaternion.slerp(buildDeviceCameraQuaternion(s), 0.28); renderer.render(scene, camera); }; animate();
    const resize = () => { if (!mount.clientWidth || !mount.clientHeight) return; camera.aspect = mount.clientWidth / mount.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(mount.clientWidth, mount.clientHeight); }; window.addEventListener("resize", resize); window.addEventListener("orientationchange", resize);
    let watch: number | null = null;
    if ("geolocation" in navigator) watch = navigator.geolocation.watchPosition(pos => { const next = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, altitude: pos.coords.altitude ?? 0 }; setLocationText(`${next.latitude.toFixed(5)}, ${next.longitude.toFixed(5)}`); const moved = !lastOrigin ? Infinity : Math.hypot((next.latitude - lastOrigin.latitude) * 111320, (next.longitude - lastOrigin.longitude) * 111320 * Math.cos(next.latitude * Math.PI / 180)); if (moved > 40) { lastOrigin = next; void load(next); } }, () => { setLocationText("GPS izni verilmedi · konum bekleniyor"); setParcelText("Parselleri göstermek için GPS konum izni gerekli."); }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 });
    return () => { serial++; cancelAnimationFrame(raf); if (watch !== null) navigator.geolocation.clearWatch(watch); window.removeEventListener("resize", resize); window.removeEventListener("orientationchange", resize); renderer.domElement.removeEventListener("pointerup", onPointer); clear(); renderer.dispose(); if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement); };
  }, []);

  return <div className="min-h-screen bg-slate-950 text-white"><SiteHeader /><main className="mx-auto max-w-[1800px] px-3 pb-6 pt-3 sm:px-5 lg:px-8">
    <section className="mb-3 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/90 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.24em] text-amber-300">MySkyParcel · 3D Sky Engine</p><h1 className="mt-1 font-display text-2xl sm:text-3xl">Gökyüzünü Tara</h1><p className="mt-1 text-xs text-white/55">GPS + pusula + jiroskop ile gerçek 3B gökyüzü parsellerini görün.</p></div><div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/65">Konum: {locationText}</div></section>
    <div className="relative h-[72vh] min-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"><video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full object-cover" aria-label="Canlı kamera görüntüsü" /><div ref={mountRef} className="absolute inset-0 z-10" aria-label="MySkyParcel gerçek 3B gökyüzü sahnesi" />{cameraState !== "ready" && <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/85 p-5 text-center backdrop-blur-sm"><div className="max-w-md rounded-2xl border border-amber-300/20 bg-slate-900/95 p-5"><p className="text-sm font-semibold text-amber-300">Canlı kamera gerekli</p><p className="mt-2 text-xs text-white/65">{cameraError || "Kamera başlatılıyor…"}</p>{(cameraState === "blocked" || cameraState === "unsupported") && <button type="button" onClick={() => void startCamera()} className="mt-4 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950">Kamerayı Aç</button>}</div></div>}</div>
    <section className="mt-3 rounded-2xl border border-amber-300/15 bg-slate-900/90 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-amber-300">Gerçek 3B parseller</p><p className="mt-1 text-sm text-white/70">{parcelText}</p><p className={`mt-2 text-xs ${sensorState === "active" ? "text-emerald-300" : "text-white/55"}`}>● {sensorText}</p><p className="mt-1 text-xs font-semibold text-amber-200">{headingText}</p>{selected && <div className="mt-2"><p className="font-display text-xl">PARSEL #{selected.parcelNumber}</p><p className="text-xs text-white/55">{Math.round(selected.distance)} m · {Math.round(selected.bearing)}° · {selected.tierPrice != null ? `${selected.tierPrice.toFixed(0)} TL` : "fiyat bilgisi yok"}</p></div>}</div><div className="flex flex-col gap-2 sm:min-w-[220px]"><button type="button" onClick={() => void startSensors()} disabled={sensorState === "starting"} className="rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-50">{sensorState === "active" ? "Pusula + Jiroskop Aktif" : "Pusula + Jiroskopu Başlat"}</button>{selected && <button type="button" onClick={() => navigate({ to: "/parsel-satin-al", search: { parcels: selected.id } })} className="rounded-xl border border-amber-300/30 bg-white/5 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Bu parseli satın al</button>}</div></div></section>
  </main></div>;
}
