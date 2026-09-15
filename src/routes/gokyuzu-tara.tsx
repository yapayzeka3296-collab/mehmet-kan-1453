import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SiteHeader } from "@/components/SiteHeader";
import { destinationPoint, geoToSkyWorld, type GeoPoint } from "@/lib/skyCoordinateEngine";

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanPage });

type TestParcel = { id: string; parcelNumber: string; latitude: number; longitude: number; altitude: number; distance: number; bearing: number };
type SensorState = "idle" | "starting" | "active" | "denied" | "unsupported";
type OrientationSample = { alpha: number; beta: number; gamma: number; absolute: boolean; compass?: number; source: "absolute" | "relative" | "compass" };

type DeviceOrientationWithCompass = DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };

const FALLBACK_ORIGIN: GeoPoint = { latitude: 37.0662, longitude: 37.3833, altitude: 0 };
const TEST_RANGES = [
  { distance: 1000, bearing: 0, altitude: 180, id: "sky-test-1000", parcelNumber: "TEST-001000" },
  { distance: 1500, bearing: 35, altitude: 260, id: "sky-test-1500", parcelNumber: "TEST-001500" },
  { distance: 2000, bearing: 70, altitude: 340, id: "sky-test-2000", parcelNumber: "TEST-002000" },
] as const;

function makeTestParcels(origin: GeoPoint): TestParcel[] {
  return TEST_RANGES.map((test) => {
    const point = destinationPoint(origin, test.distance, test.bearing, test.altitude);
    return { ...test, latitude: point.latitude, longitude: point.longitude };
  });
}

function SkyScanPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const orientationRef = useRef<OrientationSample | null>(null);
  const sensorEnabledRef = useRef(false);
  const [selected, setSelected] = useState<TestParcel | null>(null);
  const [locationText, setLocationText] = useState("GPS bekleniyor");
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
    return () => {
      window.removeEventListener("deviceorientationabsolute", handleAbsolute);
      window.removeEventListener("deviceorientation", handleRelative);
    };
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

    const parcelMeshes = new Map<THREE.Object3D, TestParcel>();
    const parcelGroups = new Map<string, THREE.Group>();
    let origin = FALLBACK_ORIGIN;
    let lastGpsOrigin: GeoPoint | null = null;

    const createParcel = (parcel: TestParcel) => {
      const world = geoToSkyWorld(origin, parcel);
      const group = new THREE.Group();
      group.position.set(world.x, world.y, -world.z);
      const size = Math.max(44, Math.min(90, parcel.distance * 0.045));
      const box = new THREE.BoxGeometry(size, 6, size);
      const material = new THREE.MeshStandardMaterial({ color: 0xd6a84f, emissive: 0x8a5d16, emissiveIntensity: 0.65, metalness: 0.45, roughness: 0.28 });
      const mesh = new THREE.Mesh(box, material); mesh.userData.parcel = parcel; group.add(mesh); parcelMeshes.set(mesh, parcel);
      const edge = new THREE.LineSegments(new THREE.EdgesGeometry(box), new THREE.LineBasicMaterial({ color: 0xffe8ad })); group.add(edge);
      const beacon = new THREE.Mesh(new THREE.CylinderGeometry(3, 8, 90, 10), new THREE.MeshStandardMaterial({ color: 0xf4c65d, emissive: 0x9b6718, emissiveIntensity: 0.9 })); beacon.position.y = 48; group.add(beacon);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(size * 0.68, 1.8, 8, 32), new THREE.MeshBasicMaterial({ color: 0xffd76a })); ring.rotation.x = Math.PI / 2; ring.position.y = 5; group.add(ring);
      scene.add(group); parcelGroups.set(parcel.id, group);
    };

    const rebuild = (nextOrigin: GeoPoint) => {
      origin = nextOrigin;
      for (const group of parcelGroups.values()) scene.remove(group);
      parcelGroups.clear(); parcelMeshes.clear();
      makeTestParcels(origin).forEach(createParcel);
      setSelected(null);
    };
    rebuild(origin);

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
        const deviceEuler = new THREE.Euler(beta, alpha, -gamma, "YXZ");
        const deviceQuaternion = new THREE.Quaternion().setFromEuler(deviceEuler);
        const cameraCorrection = new THREE.Quaternion(-Math.SQRT1_2, 0, 0, Math.SQRT1_2);
        const screenCorrection = new THREE.Quaternion(0, 0, Math.sin(-screenAngle / 2), Math.cos(-screenAngle / 2));
        deviceQuaternion.multiply(cameraCorrection).multiply(screenCorrection);
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
      if (!lastGpsOrigin || Math.hypot((next.latitude - lastGpsOrigin.latitude) * 111_320, (next.longitude - lastGpsOrigin.longitude) * 111_320 * Math.cos(next.latitude * Math.PI / 180)) > 8) {
        lastGpsOrigin = next;
        rebuild(next);
      }
    }, () => setLocationText("GPS izni verilmedi · test koordinatı kullanılıyor"), { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 });

    return () => {
      cancelAnimationFrame(animationFrame); if (watchId !== null) navigator.geolocation.clearWatch(watchId); window.removeEventListener("resize", resize); window.removeEventListener("orientationchange", resize); renderer.domElement.removeEventListener("pointerup", onPointer);
      for (const group of parcelGroups.values()) group.traverse((object) => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); const material = object.material; if (Array.isArray(material)) material.forEach((m) => m.dispose()); else material.dispose(); } });
      renderer.dispose(); if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="min-h-screen bg-slate-950 text-white"><SiteHeader /><main className="mx-auto max-w-[1800px] px-3 pb-6 pt-3 sm:px-5 lg:px-8">
    <section className="mb-3 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/90 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.24em] text-amber-300">MySkyParcel · 3D Sky Engine</p><h1 className="mt-1 font-display text-2xl sm:text-3xl">Gökyüzünü Tara</h1><p className="mt-1 text-xs text-white/55">Canlı kamera + GPS + pusula + jiroskop ile gerçek 3B gökyüzü koordinatları.</p></div><div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/65">Konum: {locationText}</div></section>
    <div className="relative h-[72vh] min-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"><video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full object-cover" aria-label="Canlı kamera görüntüsü" /><div ref={mountRef} className="absolute inset-0" aria-label="MySkyParcel gerçek 3B gökyüzü sahnesi" />{cameraState !== "ready" && <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85 p-5 text-center backdrop-blur-sm"><div className="max-w-md rounded-2xl border border-amber-300/20 bg-slate-900/95 p-5"><p className="text-sm font-semibold text-amber-300">Canlı kamera gerekli</p><p className="mt-2 text-xs text-white/65">{cameraError || "Kamera başlatılıyor…"}</p>{(cameraState === "blocked" || cameraState === "unsupported") && <button type="button" onClick={() => void startCamera()} className="mt-4 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950">Kamera'yı Aç</button>}</div></div>}</div>
    <section className="mt-3 rounded-2xl border border-amber-300/15 bg-slate-900/90 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-amber-300">3B test parselleri</p><p className="mt-1 text-sm text-white/70">1 km · 1,5 km · 2 km. Parseller dünya koordinatından gerçek 3B X/Y/Z konumuna çevrilir.</p><p className={`mt-2 text-xs ${sensorState === "active" ? "text-emerald-300" : "text-white/55"}`}>● {sensorText}</p>{selected && <p className="mt-2 font-display text-xl">PARSEL #{selected.parcelNumber}</p>}</div><div className="flex flex-col gap-2 sm:min-w-[220px]"><button type="button" onClick={() => void startSensors()} disabled={sensorState === "starting"} className="rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 disabled:opacity-60">{sensorState === "active" ? "Sensörleri Yenile" : "Pusula + Jiroskopu Başlat"}</button>{selected && <button type="button" onClick={() => void navigate({ to: "/parsel-satin-al", search: { parcels: selected.id } })} className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold">Bu parseli satın al</button>}</div></div></section>
  </main></div>;
}
