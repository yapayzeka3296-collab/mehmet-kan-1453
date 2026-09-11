import { Camera, Compass, Crosshair, MapPin, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

type LocationState = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

type OrientationLike = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

type SkyParcel = {
  id: string;
  latitude: number;
  longitude: number;
  altitude: number;
  price: number;
};

const RADIUS_METERS = 15_000;
const PARCEL_COUNT = 1_000;
const PARCEL_ALTITUDE = 850;
const EARTH_RADIUS = 6_378_137;
const FOV = 62;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const normalize = (value: number) => ((value % 360) + 360) % 360;
const toRad = (value: number) => (value * Math.PI) / 180;

function hash(index: number, seed: number) {
  const x = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function createSkyParcels(centerLat: number, centerLng: number): SkyParcel[] {
  const parcels: SkyParcel[] = [];
  const latScale = 1 / 111_320;
  const lngScale = 1 / (111_320 * Math.cos(toRad(centerLat)));

  for (let i = 0; i < PARCEL_COUNT; i += 1) {
    const angle = hash(i, 1) * Math.PI * 2;
    const radius = Math.sqrt(hash(i, 2)) * RADIUS_METERS;
    const north = Math.cos(angle) * radius;
    const east = Math.sin(angle) * radius;
    parcels.push({
      id: `P-${String(i + 1).padStart(4, "0")}`,
      latitude: centerLat + north * latScale,
      longitude: centerLng + east * lngScale,
      altitude: PARCEL_ALTITUDE,
      price: 599 + Math.floor(hash(i, 3) * 8) * 100,
    });
  }
  return parcels;
}

function makeCrystalTexture(selected: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) return null;
  const gradient = context.createRadialGradient(64, 64, 8, 64, 64, 58);
  gradient.addColorStop(0, selected ? "rgba(255,245,170,1)" : "rgba(110,230,255,1)");
  gradient.addColorStop(0.32, selected ? "rgba(255,194,60,.9)" : "rgba(50,170,255,.78)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function createCrystal(selected = false) {
  const group = new THREE.Group();
  const glowTexture = makeCrystalTexture(selected);
  if (glowTexture) {
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, transparent: true, depthWrite: false }));
    glow.scale.setScalar(selected ? 7 : 5.2);
    group.add(glow);
  }
  const geometry = new THREE.OctahedronGeometry(selected ? 2.3 : 1.8, 0);
  const material = new THREE.MeshStandardMaterial({
    color: selected ? 0xffc83d : 0x53d9ff,
    emissive: selected ? 0x9a5f00 : 0x075b78,
    emissiveIntensity: selected ? 1.8 : 1.25,
    metalness: 0.35,
    roughness: 0.18,
    transparent: true,
    opacity: 0.92,
  });
  group.add(new THREE.Mesh(geometry, material));
  return group;
}

export function SkyScanExperienceV5() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const camera3dRef = useRef<THREE.PerspectiveCamera | null>(null);
  const parcelGroupRef = useRef<THREE.Group | null>(null);
  const parcelsRef = useRef<SkyParcel[]>([]);
  const centerRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const headingRef = useRef(0);
  const pitchRef = useRef(0);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [sensorStarted, setSensorStarted] = useState(false);
  const [sensorActive, setSensorActive] = useState(false);
  const [sensorError, setSensorError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [nearest, setNearest] = useState<SkyParcel | null>(null);
  const [selected, setSelected] = useState<SkyParcel | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Bu cihaz konum bilgisini desteklemiyor.");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.max(1, position.coords.accuracy || 999),
        };
        setLocation(next);
        setLocationError(null);
        if (!centerRef.current) {
          centerRef.current = { latitude: next.latitude, longitude: next.longitude };
          parcelsRef.current = createSkyParcels(next.latitude, next.longitude);
        }
      },
      (error) => setLocationError(error.message || "Konum alınamadı."),
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 15_000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (!sensorStarted) return;
    let active = false;
    const onOrientation = (event: Event) => {
      const source = event as OrientationLike;
      const hasTilt = typeof source.beta === "number" || typeof source.gamma === "number";
      if (!hasTilt) return;
      const compass = typeof source.webkitCompassHeading === "number"
        ? source.webkitCompassHeading
        : typeof source.alpha === "number" ? source.alpha : null;
      if (compass !== null && Number.isFinite(compass)) {
        const next = normalize(compass);
        headingRef.current = next;
        setHeading(next);
      }
      if (typeof source.beta === "number" && Number.isFinite(source.beta)) pitchRef.current = clamp(source.beta, -90, 90);
      active = true;
      setSensorActive(true);
      setSensorError(null);
    };
    const onMotion = (event: Event) => {
      const acceleration = (event as DeviceMotionEvent).accelerationIncludingGravity;
      if ([acceleration?.x, acceleration?.y, acceleration?.z].some((value) => typeof value === "number" && Math.abs(value) > 0.05)) {
        active = true;
        setSensorActive(true);
        setSensorError(null);
      }
    };
    window.addEventListener("deviceorientationabsolute", onOrientation, true);
    window.addEventListener("deviceorientation", onOrientation, true);
    window.addEventListener("devicemotion", onMotion, true);
    const timer = window.setTimeout(() => {
      if (!active) setSensorError("Sensör verisi alınamadı. Kamera açık kalacak.");
    }, 3500);
    return () => {
      window.removeEventListener("deviceorientationabsolute", onOrientation, true);
      window.removeEventListener("deviceorientation", onOrientation, true);
      window.removeEventListener("devicemotion", onMotion, true);
      window.clearTimeout(timer);
    };
  }, [sensorStarted]);

  useEffect(() => {
    if (!cameraStarted || !canvasRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, 50_000);
    camera3dRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;
    sceneRef.current = scene;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x202040, 1.6));
    const directional = new THREE.DirectionalLight(0xffffff, 2.2);
    directional.position.set(0, 10, 5);
    scene.add(directional);

    const parcelGroup = new THREE.Group();
    parcelGroupRef.current = parcelGroup;
    scene.add(parcelGroup);

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    window.addEventListener("resize", resize);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const center = centerRef.current;
      if (!center || parcelsRef.current.length === 0) {
        renderer.render(scene, camera);
        return;
      }

      const cosLat = Math.cos(toRad(center.latitude));
      const visible: { parcel: SkyParcel; east: number; north: number; distance: number; angle: number }[] = [];
      const halfFov = FOV / 2 + 8;
      for (const parcel of parcelsRef.current) {
        const north = toRad(parcel.latitude - center.latitude) * EARTH_RADIUS;
        const east = toRad(parcel.longitude - center.longitude) * EARTH_RADIUS * cosLat;
        const distance = Math.hypot(east, north);
        let angle = normalize((Math.atan2(east, north) * 180) / Math.PI);
        let delta = normalize(angle - headingRef.current + 540) - 180;
        if (Math.abs(delta) <= halfFov) visible.push({ parcel, east, north, distance, angle });
      }
      visible.sort((a, b) => a.distance - b.distance);
      const active = visible.slice(0, 24);
      setVisibleCount(active.length);
      setNearest(parcelsRef.current.reduce((best, item) => {
        const north = toRad(item.latitude - center.latitude) * EARTH_RADIUS;
        const east = toRad(item.longitude - center.longitude) * EARTH_RADIUS * cosLat;
        const distance = Math.hypot(east, north);
        if (!best) return item;
        const bestNorth = toRad(best.latitude - center.latitude) * EARTH_RADIUS;
        const bestEast = toRad(best.longitude - center.longitude) * EARTH_RADIUS * cosLat;
        return distance < Math.hypot(bestEast, bestNorth) ? item : best;
      }, null as SkyParcel | null));

      while (parcelGroup.children.length < active.length) parcelGroup.add(createCrystal(false));
      parcelGroup.children.forEach((child, index) => {
        const item = active[index];
        child.visible = Boolean(item);
        if (!item) return;
        const forward = item.east * Math.sin(toRad(headingRef.current)) + item.north * Math.cos(toRad(headingRef.current));
        const right = item.east * Math.cos(toRad(headingRef.current)) - item.north * Math.sin(toRad(headingRef.current));
        child.position.set(right / 100, (PARCEL_ALTITUDE - (location?.accuracy ?? 0)) / 100, -forward / 100);
        const distanceScale = clamp(24 / Math.max(item.distance / 1000, 0.25), 1.1, 4.5);
        child.scale.setScalar(distanceScale);
        child.rotation.y += 0.012;
        child.userData.parcel = item.parcel;
      });

      camera.rotation.order = "YXZ";
      camera.rotation.y = 0;
      camera.rotation.x = toRad(-pitchRef.current);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
        else material?.dispose();
      });
      rendererRef.current = null;
      sceneRef.current = null;
      camera3dRef.current = null;
      parcelGroupRef.current = null;
    };
  }, [cameraStarted, location?.accuracy]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (!window.isSecureContext) throw new Error("Kamera yalnızca HTTPS bağlantısında çalışır.");
    const video = videoRef.current;
    if (!navigator.mediaDevices?.getUserMedia || !video) throw new Error("Bu tarayıcı kamera erişimini desteklemiyor.");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, width: { ideal: 1920, min: 1280 }, height: { ideal: 1080, min: 720 }, frameRate: { ideal: 30, max: 60 } },
      audio: false,
    });
    streamRef.current = stream;
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
    setCameraStarted(true);
    setCameraReady(true);
  }, []);

  const startScan = useCallback(async () => {
    setSensorError(null);
    setSensorActive(false);
    setHeading(null);
    try {
      await startCamera();
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraError(error instanceof Error ? error.message : "Kamera başlatılamadı.");
      return;
    }
    const Orientation = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> };
    if (typeof Orientation.requestPermission === "function") {
      try {
        const permission = await Orientation.requestPermission();
        if (permission !== "granted") setSensorError("Yön sensörü izni verilmedi. Kamera çalışmaya devam eder.");
      } catch {
        setSensorError("Yön sensörü izni alınamadı. Kamera çalışmaya devam eder.");
      }
    }
    setSensorStarted(true);
  }, [startCamera]);

  const stopScan = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setCameraStarted(false);
    setCameraReady(false);
    setSensorStarted(false);
    setSensorActive(false);
    setHeading(null);
    setSelected(null);
  }, []);

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  return (
    <main className="fixed inset-0 overflow-hidden bg-slate-950 text-white">
      <video ref={videoRef} className={`absolute inset-0 z-0 h-full w-full object-cover ${cameraStarted ? "block" : "hidden"}`} playsInline muted autoPlay />
      <canvas ref={canvasRef} className={`pointer-events-none absolute inset-0 z-10 h-full w-full ${cameraStarted ? "block" : "hidden"}`} />

      {!cameraStarted && (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-950/90 p-7 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-300/10"><Camera className="h-8 w-8 text-cyan-200" /></div>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[.28em] text-cyan-300">MySkyParcel</p>
            <h1 className="mt-2 text-2xl font-bold">Gökyüzünü Tara</h1>
            <p className="mt-3 text-sm leading-6 text-white/65">Gerçek şehir görüntüsünün üzerinde, 15 km yarıçap içindeki 1.000 sanal 3D parseli konumlarına bağlı olarak keşfedin.</p>
            <button onClick={startScan} className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950">Kamerayı başlat</button>
            {locationError && <p className="mt-3 text-xs text-amber-200">{locationError}</p>}
            {cameraError && <p className="mt-3 text-xs text-red-200">{cameraError}</p>}
          </div>
        </div>
      )}

      {cameraStarted && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="rounded-2xl border border-white/15 bg-black/45 px-3 py-2 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-semibold"><Camera className="h-4 w-4" /> Canlı AR</div>
              <div className="mt-1 text-[10px] text-white/60">{visibleCount} parsel görüş alanında</div>
            </div>
            <button onClick={stopScan} className="pointer-events-auto rounded-full border border-white/20 bg-black/45 p-2.5 backdrop-blur-md" aria-label="Kamerayı kapat"><X className="h-5 w-5" /></button>
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"><Crosshair className="h-10 w-10 text-white/65" strokeWidth={1.2} /></div>

          <div className="absolute inset-x-0 bottom-0 z-20 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto max-w-xl rounded-3xl border border-white/15 bg-black/55 p-4 backdrop-blur-xl">
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold uppercase tracking-wider text-white/70">
                <div><MapPin className="mx-auto mb-1 h-4 w-4" />{location ? `${Math.round(location.accuracy)} m GPS` : "GPS bekleniyor"}</div>
                <div><Compass className="mx-auto mb-1 h-4 w-4" />{sensorActive && heading !== null ? `${Math.round(heading)}°` : "Pusula bekleniyor"}</div>
                <div>{nearest ? `${(Math.hypot((nearest.longitude - (centerRef.current?.longitude ?? nearest.longitude)) * 111_320, (nearest.latitude - (centerRef.current?.latitude ?? nearest.latitude)) * 111_320) / 1000).toFixed(1)} km en yakın` : "Parsel aranıyor"}</div>
              </div>
              {nearest && <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center"><span className="text-xs font-bold">{nearest.id}</span><span className="mx-2 text-white/35">•</span><span className="text-xs text-white/70">850 m yükseklik</span><span className="mx-2 text-white/35">•</span><span className="text-xs font-bold text-amber-200">₺{nearest.price.toLocaleString("tr-TR")}</span></div>}
              {sensorError && <p className="mt-3 text-center text-xs text-amber-200">{sensorError}</p>}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
