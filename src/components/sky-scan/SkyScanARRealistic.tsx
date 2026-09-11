import { Camera, Compass, Crosshair, MapPin, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

type LocationState = {
  latitude: number;
  longitude: number;
  altitude: number | null;
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
const CAMERA_FOV = 62;
const MAX_VISIBLE = 20;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const normalize = (v: number) => ((v % 360) + 360) % 360;
const toRad = (v: number) => (v * Math.PI) / 180;
const toDeg = (v: number) => (v * 180) / Math.PI;

function hash(index: number, seed: number) {
  const x = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function makeParcels(lat: number, lng: number): SkyParcel[] {
  const cosLat = Math.cos(toRad(lat));
  return Array.from({ length: PARCEL_COUNT }, (_, index) => {
    const angle = hash(index, 1) * Math.PI * 2;
    const radius = Math.sqrt(hash(index, 2)) * RADIUS_METERS;
    const north = Math.cos(angle) * radius;
    const east = Math.sin(angle) * radius;
    return {
      id: `P-${String(index + 1).padStart(4, "0")}`,
      latitude: lat + north / 111_320,
      longitude: lng + east / (111_320 * cosLat),
      altitude: PARCEL_ALTITUDE,
      price: 599 + Math.floor(hash(index, 3) * 8) * 100,
    };
  });
}

function crystalTexture(selected: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createRadialGradient(64, 64, 5, 64, 64, 60);
  g.addColorStop(0, selected ? "rgba(255,248,190,1)" : "rgba(125,235,255,1)");
  g.addColorStop(0.3, selected ? "rgba(255,190,55,.92)" : "rgba(45,185,255,.82)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function createCrystal() {
  const group = new THREE.Group();
  const glow = crystalTexture(false);
  if (glow) {
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, transparent: true, depthWrite: false }));
    sprite.scale.setScalar(7);
    group.add(sprite);
  }
  const mesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(2.2, 0),
    new THREE.MeshStandardMaterial({
      color: 0x5fe2ff,
      emissive: 0x075b78,
      emissiveIntensity: 1.5,
      metalness: 0.45,
      roughness: 0.15,
      transparent: true,
      opacity: 0.94,
    }),
  );
  group.add(mesh);
  return group;
}

function setCrystalSelected(group: THREE.Group, selected: boolean) {
  const mesh = group.children.find((child) => child instanceof THREE.Mesh) as THREE.Mesh | undefined;
  const sprite = group.children.find((child) => child instanceof THREE.Sprite) as THREE.Sprite | undefined;
  if (mesh?.material instanceof THREE.MeshStandardMaterial) {
    mesh.material.color.setHex(selected ? 0xffc83d : 0x5fe2ff);
    mesh.material.emissive.setHex(selected ? 0x9a5f00 : 0x075b78);
    mesh.material.emissiveIntensity = selected ? 2.2 : 1.5;
  }
  if (sprite) {
    const texture = crystalTexture(selected);
    if (texture && sprite.material instanceof THREE.SpriteMaterial) {
      sprite.material.map = texture;
      sprite.material.needsUpdate = true;
    }
    sprite.scale.setScalar(selected ? 10 : 7);
  }
}

export function SkyScanARRealistic() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const parcelsRef = useRef<SkyParcel[]>([]);
  const centerRef = useRef<{ latitude: number; longitude: number } | null>(null);
  const headingRef = useRef(0);
  const pitchRef = useRef(0);
  const latestVisibleRef = useRef<SkyParcel[]>([]);

  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [sensorActive, setSensorActive] = useState(false);
  const [sensorError, setSensorError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [selected, setSelected] = useState<SkyParcel | null>(null);
  const [nearest, setNearest] = useState<SkyParcel | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Bu cihaz konum bilgisini desteklemiyor.");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const next: LocationState = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          altitude: typeof coords.altitude === "number" && Number.isFinite(coords.altitude) ? coords.altitude : null,
          accuracy: Math.max(1, coords.accuracy || 999),
        };
        setLocation(next);
        setLocationError(null);
        if (!centerRef.current) {
          centerRef.current = { latitude: next.latitude, longitude: next.longitude };
          parcelsRef.current = makeParcels(next.latitude, next.longitude);
        }
      },
      (error) => setLocationError(error.message || "Konum alınamadı."),
      { enableHighAccuracy: true, maximumAge: 2_000, timeout: 15_000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (!started) return;
    let active = false;
    const onOrientation = (event: Event) => {
      const e = event as OrientationLike;
      const hasTilt = typeof e.beta === "number" || typeof e.gamma === "number";
      if (!hasTilt) return;
      const compass = typeof e.webkitCompassHeading === "number"
        ? e.webkitCompassHeading
        : typeof e.alpha === "number" ? e.alpha : null;
      if (compass !== null && Number.isFinite(compass)) {
        const next = normalize(compass);
        headingRef.current = next;
        setHeading(next);
      }
      if (typeof e.beta === "number" && Number.isFinite(e.beta)) pitchRef.current = clamp(e.beta, -90, 90);
      active = true;
      setSensorActive(true);
      setSensorError(null);
    };
    const onMotion = (event: Event) => {
      const a = (event as DeviceMotionEvent).accelerationIncludingGravity;
      if ([a?.x, a?.y, a?.z].some((v) => typeof v === "number" && Math.abs(v) > 0.05)) {
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
  }, [started]);

  useEffect(() => {
    if (!started || !canvasRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, window.innerWidth / window.innerHeight, 0.1, 25_000);
    camera.rotation.order = "YXZ";
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x172033, 1.5));
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(20, 40, 20);
    scene.add(sun);
    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointer = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(group.children, true);
      const hit = hits[0]?.object;
      const parcel = hit?.parent?.userData.parcel as SkyParcel | undefined;
      if (parcel) setSelected(parcel);
    };
    canvasRef.current.addEventListener("pointerup", onPointer);

    const resize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    };
    window.addEventListener("resize", resize);

    let frame = 0;
    let lastUiUpdate = 0;
    const animate = (time: number) => {
      frame = requestAnimationFrame(animate);
      const center = centerRef.current;
      const parcels = parcelsRef.current;
      if (!center || parcels.length === 0) {
        renderer.render(scene, camera);
        return;
      }

      const cosLat = Math.cos(toRad(center.latitude));
      const userAltitude = location?.altitude ?? 0;
      const candidates: Array<{ parcel: SkyParcel; east: number; north: number; distance: number; bearing: number; delta: number; elevation: number }> = [];
      for (const parcel of parcels) {
        const north = toRad(parcel.latitude - center.latitude) * EARTH_RADIUS;
        const east = toRad(parcel.longitude - center.longitude) * EARTH_RADIUS * cosLat;
        const distance = Math.hypot(east, north);
        const bearing = normalize(toDeg(Math.atan2(east, north)));
        const delta = normalize(bearing - headingRef.current + 540) - 180;
        const elevation = toDeg(Math.atan2(parcel.altitude - userAltitude, Math.max(distance, 1)));
        if (Math.abs(delta) <= CAMERA_FOV / 2 + 12 && elevation > -80 && elevation < 80) {
          candidates.push({ parcel, east, north, distance, bearing, delta, elevation });
        }
      }
      candidates.sort((a, b) => a.distance - b.distance);
      const active = candidates.slice(0, MAX_VISIBLE);
      latestVisibleRef.current = active.map((item) => item.parcel);

      while (group.children.length < MAX_VISIBLE) group.add(createCrystal());
      group.children.forEach((child, index) => {
        const item = active[index];
        child.visible = Boolean(item);
        if (!item) return;
        const headingRad = toRad(headingRef.current);
        const forward = item.east * Math.sin(headingRad) + item.north * Math.cos(headingRad);
        const right = item.east * Math.cos(headingRad) - item.north * Math.sin(headingRad);
        const relativeHeight = item.parcel.altitude - userAltitude;
        child.position.set(right, relativeHeight, -forward);
        const scale = clamp(30 / Math.max(item.distance / 1000, 0.35), 1.3, 5.5);
        child.scale.setScalar(scale);
        child.rotation.y += 0.008;
        child.userData.parcel = item.parcel;
        setCrystalSelected(child as THREE.Group, selected?.id === item.parcel.id);
      });

      camera.rotation.y = 0;
      camera.rotation.x = toRad(-pitchRef.current);
      renderer.render(scene, camera);

      if (time - lastUiUpdate > 250) {
        lastUiUpdate = time;
        setVisibleCount(active.length);
        let closest: SkyParcel | null = null;
        let closestDistance = Number.POSITIVE_INFINITY;
        for (const parcel of parcels) {
          const north = toRad(parcel.latitude - center.latitude) * EARTH_RADIUS;
          const east = toRad(parcel.longitude - center.longitude) * EARTH_RADIUS * cosLat;
          const distance = Math.hypot(east, north);
          if (distance < closestDistance) {
            closestDistance = distance;
            closest = parcel;
          }
        }
        setNearest(closest);
      }
    };
    animate(0);

    return () => {
      cancelAnimationFrame(frame);
      canvasRef.current?.removeEventListener("pointerup", onPointer);
      window.removeEventListener("resize", resize);
      renderer.dispose();
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
        else material?.dispose();
      });
      rendererRef.current = null;
      groupRef.current = null;
    };
  }, [started, location?.altitude, selected?.id]);

  const start = useCallback(async () => {
    setCameraError(null);
    setSensorError(null);
    if (!window.isSecureContext) {
      setCameraError("Kamera yalnızca HTTPS bağlantısında çalışır.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !videoRef.current) {
      setCameraError("Bu tarayıcı kamera erişimini desteklemiyor.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920, min: 1280 }, height: { ideal: 1080, min: 720 }, frameRate: { ideal: 30, max: 60 } },
        audio: false,
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      await videoRef.current.play();
      const Orientation = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> };
      if (typeof Orientation.requestPermission === "function") {
        try {
          const permission = await Orientation.requestPermission();
          if (permission !== "granted") setSensorError("Yön sensörü izni verilmedi. Kamera çalışmaya devam eder.");
        } catch {
          setSensorError("Yön sensörü izni alınamadı. Kamera çalışmaya devam eder.");
        }
      }
      setStarted(true);
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraError(error instanceof Error ? error.message : "Kamera başlatılamadı.");
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStarted(false);
    setSensorActive(false);
    setHeading(null);
    setSelected(null);
  }, []);

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" />

      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/75 to-transparent p-4">
        <div>
          <div className="text-lg font-semibold tracking-wide">MySkyParcel</div>
          <div className="text-xs text-white/70">Gerçek şehir üzerinde AR parseller</div>
        </div>
        {started && <button onClick={stop} className="rounded-full bg-black/50 p-2 backdrop-blur"><X className="h-5 w-5" /></button>}
      </div>

      {!started && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 p-6 backdrop-blur-[2px]">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-black/65 p-6 text-center shadow-2xl backdrop-blur-xl">
            <Camera className="mx-auto mb-4 h-12 w-12" />
            <h1 className="text-2xl font-bold">Gökyüzünü Tara</h1>
            <p className="mt-2 text-sm text-white/70">Telefonu şehre çevir. Gerçek konumlara bağlı 3D kristal parseller kamera görüntüsünün üzerinde görünsün.</p>
            {locationError && <p className="mt-3 text-xs text-amber-300">{locationError}</p>}
            {cameraError && <p className="mt-3 text-xs text-red-300">{cameraError}</p>}
            <button onClick={start} className="mt-5 w-full rounded-2xl bg-white px-5 py-3 font-semibold text-black">Kamerayı Aç</button>
          </div>
        </div>
      )}

      {started && (
        <>
          <div className="absolute left-1/2 top-20 z-10 -translate-x-1/2 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-xs backdrop-blur">
            <Compass className="mr-2 inline h-4 w-4" />{heading === null ? "Yön bekleniyor" : `${Math.round(heading)}°`}
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4 pt-20">
            <div className="flex items-center justify-between text-xs text-white/75">
              <span><Crosshair className="mr-1 inline h-4 w-4" />{visibleCount} parsel görünür</span>
              <span><MapPin className="mr-1 inline h-4 w-4" />{location ? `${Math.round(location.accuracy)} m GPS` : "GPS bekleniyor"}</span>
            </div>
            {sensorError && <div className="mt-2 text-xs text-amber-300">{sensorError}</div>}
            {sensorActive && <div className="mt-1 text-xs text-emerald-300">Sensör aktif • telefon yönü takip ediliyor</div>}
            {selected && (
              <div className="mt-3 rounded-2xl border border-amber-300/40 bg-black/70 p-4 backdrop-blur-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-white/60">Seçili sanal parsel</div>
                    <div className="text-lg font-bold text-amber-200">{selected.id}</div>
                    <div className="mt-1 text-sm text-white/75">850 m sanal irtifa • ₺{selected.price.toLocaleString("tr-TR")}</div>
                  </div>
                  <button onClick={() => setSelected(null)} className="rounded-full bg-white/10 p-2"><X className="h-4 w-4" /></button>
                </div>
              </div>
            )}
            {!selected && nearest && <div className="mt-3 text-xs text-white/65">En yakın sanal parsel: <span className="font-semibold text-white">{nearest.id}</span></div>}
          </div>
        </>
      )}
    </main>
  );
}
