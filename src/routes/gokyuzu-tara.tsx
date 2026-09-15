import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SiteHeader } from "@/components/SiteHeader";
import { destinationPoint, geoToSkyWorld, type GeoPoint } from "@/lib/skyCoordinateEngine";

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanPage });

type TestParcel = {
  id: string;
  parcelNumber: string;
  latitude: number;
  longitude: number;
  altitude: number;
};

type SensorState = "idle" | "starting" | "active" | "denied" | "unsupported";

type OrientationSample = {
  alpha: number;
  beta: number;
  gamma: number;
  absolute: boolean;
};

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

function normalizeAngle(angle: number) {
  return THREE.MathUtils.euclideanModulo(angle + Math.PI, Math.PI * 2) - Math.PI;
}

function SkyScanPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const orientationRef = useRef<OrientationSample | null>(null);
  const sensorEnabledRef = useRef(false);
  const sensorAvailableRef = useRef(false);
  const [selected, setSelected] = useState<TestParcel | null>(null);
  const [locationText, setLocationText] = useState("Test başlangıç konumu");
  const [cameraState, setCameraState] = useState<"starting" | "ready" | "blocked" | "unsupported">("starting");
  const [cameraError, setCameraError] = useState("");
  const [sensorState, setSensorState] = useState<SensorState>("idle");
  const [sensorText, setSensorText] = useState("Sensörler başlatılmadı");
  const navigate = useNavigate();

  const startCamera = async () => {
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState("unsupported");
      setCameraError("Bu tarayıcı canlı kamerayı desteklemiyor.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();
      setCameraState("ready");
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "CameraError";
      setCameraState("blocked");
      setCameraError(
        name === "NotAllowedError"
          ? "Kamera izni verilmedi. Tarayıcıdan kamera iznini açıp tekrar Kamera'yı Aç'a dokunun."
          : name === "NotFoundError"
            ? "Kamera bulunamadı."
            : "Kamera başlatılamadı. HTTPS ve kamera iznini kontrol edin.",
      );
    }
  };

  const startSensors = async () => {
    setSensorState("starting");
    setSensorText("Pusula ve jiroskop izni isteniyor…");

    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      setSensorState("unsupported");
      setSensorText("Bu cihaz/tarayıcı yön sensörünü desteklemiyor.");
      return;
    }

    try {
      const Orientation = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: (absolute?: boolean) => Promise<PermissionState>;
      };
      const Motion = window.DeviceMotionEvent as typeof DeviceMotionEvent & {
        requestPermission?: () => Promise<PermissionState>;
      };

      if (typeof Orientation.requestPermission === "function") {
        const orientationPermission = await Orientation.requestPermission(true);
        if (orientationPermission !== "granted") throw new Error("orientation-denied");
      }
      if (typeof Motion.requestPermission === "function") {
        const motionPermission = await Motion.requestPermission();
        if (motionPermission !== "granted") throw new Error("motion-denied");
      }

      sensorEnabledRef.current = true;
      setSensorState("active");
      setSensorText("Sensör aktif · telefonu hareket ettirin");
    } catch {
      sensorEnabledRef.current = false;
      setSensorState("denied");
      setSensorText("Sensör izni verilmedi. Tekrar denemek için butona dokunun.");
    }
  };

  useEffect(() => {
    void startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha == null || event.beta == null || event.gamma == null) return;
      orientationRef.current = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        absolute: event.absolute,
      };
      sensorAvailableRef.current = true;
      if (sensorEnabledRef.current && sensorState !== "active") {
        setSensorState("active");
        setSensorText(event.absolute ? "Sensör aktif · pusula kilitlendi" : "Sensör aktif · göreli yön kullanılıyor");
      }
    };

    const handleMotion = () => {
      sensorAvailableRef.current = true;
    };

    window.addEventListener("deviceorientationabsolute", handleOrientation as EventListener);
    window.addEventListener("deviceorientation", handleOrientation as EventListener);
    window.addEventListener("devicemotion", handleMotion as EventListener);
    return () => {
      window.removeEventListener("deviceorientationabsolute", handleOrientation as EventListener);
      window.removeEventListener("deviceorientation", handleOrientation as EventListener);
      window.removeEventListener("devicemotion", handleMotion as EventListener);
    };
  }, [sensorState]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, mount.clientWidth / mount.clientHeight, 0.1, 12000);
    camera.position.set(0, 6, 0);
    camera.lookAt(0, 100, -1000);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.touchAction = "none";
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0x9fc5ff, 0x07111f, 1.5));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(400, 700, 250);
    scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(6000, 6000),
      new THREE.MeshStandardMaterial({ color: 0x07131f, transparent: true, opacity: 0.18, roughness: 0.92, metalness: 0.02 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -8;
    scene.add(ground);

    const grid = new THREE.GridHelper(6000, 120, 0x21405a, 0x102337);
    grid.position.y = -7.9;
    grid.material.transparent = true;
    grid.material.opacity = 0.22;
    scene.add(grid);

    const parcelMeshes = new Map<THREE.Object3D, TestParcel>();
    const parcelGroups = new Map<string, THREE.Group>();
    let origin = FALLBACK_ORIGIN;

    const createParcelMesh = (parcel: TestParcel) => {
      const world = geoToSkyWorld(origin, parcel);
      const group = new THREE.Group();
      group.position.set(world.x, world.y, -world.z);

      const size = 44;
      const geometry = new THREE.BoxGeometry(size, 3, size);
      const material = new THREE.MeshStandardMaterial({
        color: 0xd6a84f,
        emissive: 0x5b4217,
        emissiveIntensity: 0.45,
        metalness: 0.55,
        roughness: 0.3,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.parcel = parcel;
      group.add(mesh);
      parcelMeshes.set(mesh, parcel);

      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0xffe3a1, transparent: true, opacity: 0.95 }),
      );
      group.add(edge);
      scene.add(group);
      parcelGroups.set(parcel.id, group);
    };

    const setParcelsForOrigin = (nextOrigin: GeoPoint) => {
      origin = nextOrigin;
      for (const group of parcelGroups.values()) scene.remove(group);
      parcelGroups.clear();
      parcelMeshes.clear();
      for (const parcel of makeTestParcels(origin)) createParcelMesh(parcel);
      setSelected(null);
    };

    setParcelsForOrigin(origin);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownX = 0;
    let pointerDownY = 0;
    const onPointer = (event: PointerEvent) => {
      const moved = Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY);
      if (moved > 10) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects([...parcelMeshes.keys()], false)[0];
      if (hit) setSelected(parcelMeshes.get(hit.object) ?? null);
    };

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let yaw = 0;
    let pitch = -0.02;
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || sensorEnabledRef.current) return;
      yaw -= (event.clientX - lastX) * 0.004;
      pitch -= (event.clientY - lastY) * 0.003;
      pitch = THREE.MathUtils.clamp(pitch, -1.2, 1.2);
      lastX = event.clientX;
      lastY = event.clientY;
      camera.rotation.order = "YXZ";
      camera.rotation.y = yaw;
      camera.rotation.x = pitch;
    };
    const onPointerDown = (event: PointerEvent) => {
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture?.(event.pointerId);
    };
    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      renderer.domElement.releasePointerCapture?.(event.pointerId);
      onPointer(event);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);

    let animationFrame = 0;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      const sample = orientationRef.current;
      if (sensorEnabledRef.current && sample) {
        const screenAngle = (screen.orientation?.angle ?? 0) * THREE.MathUtils.DEG2RAD;
        const alpha = THREE.MathUtils.degToRad(sample.alpha);
        const beta = THREE.MathUtils.degToRad(sample.beta);
        const gamma = THREE.MathUtils.degToRad(sample.gamma);
        const compassHeading = (sample.absolute ? alpha : alpha) + screenAngle;
        const targetYaw = normalizeAngle(-compassHeading);
        const targetPitch = THREE.MathUtils.clamp(-(beta - Math.PI / 2), -1.25, 1.25);
        const targetRoll = THREE.MathUtils.clamp(-gamma, -0.7, 0.7);
        camera.rotation.order = "YXZ";
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetYaw, 0.16);
        camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetPitch, 0.16);
        camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetRoll, 0.12);
      }
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);

    let watchId: number | null = null;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const nextOrigin = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude ?? 0,
          };
          setLocationText(`${nextOrigin.latitude.toFixed(5)}, ${nextOrigin.longitude.toFixed(5)}`);
          setParcelsForOrigin(nextOrigin);
        },
        () => setLocationText("GPS izni verilmedi · test koordinatı kullanılıyor"),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
      );
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      for (const group of parcelGroups.values()) {
        group.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
            else object.material.dispose();
          }
        });
      }
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <main className="relative mx-auto max-w-[1800px] px-3 pb-6 pt-3 sm:px-5 lg:px-8">
        <section className="mb-3 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/90 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-amber-300">MySkyParcel · 3D Sky Engine</p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl">Gökyüzünü Tara</h1>
            <p className="mt-1 text-xs text-white/55">Canlı kamera + GPS + pusula + jiroskop. Telefonu hareket ettirdikçe gerçek 3B dünya yönünüzü takip eder.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/65">Konum: {locationText}</div>
        </section>

        <div className="relative h-[72vh] min-h-[520px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black">
          <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 h-full w-full object-cover" aria-label="Canlı kamera görüntüsü" />
          <div ref={mountRef} className="absolute inset-0" aria-label="MySkyParcel gerçek 3B gökyüzü sahnesi" />
          {cameraState !== "ready" && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/85 p-5 text-center backdrop-blur-sm">
              <div className="max-w-md rounded-2xl border border-amber-300/20 bg-slate-900/95 p-5 shadow-2xl">
                <p className="text-sm font-semibold text-amber-300">Canlı kamera gerekli</p>
                <p className="mt-2 text-xs leading-5 text-white/65">{cameraError || "Kamera başlatılıyor…"}</p>
                {(cameraState === "blocked" || cameraState === "unsupported") && (
                  <button type="button" onClick={() => void startCamera()} className="mt-4 rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950">Kamera'yı Aç</button>
                )}
              </div>
            </div>
          )}
        </div>

        <section className="mt-3 rounded-2xl border border-amber-300/15 bg-slate-900/90 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-amber-300">3B parsel + sensör</p>
              <p className="mt-1 text-sm text-white/70">1 km · 1,5 km · 2 km test parselleri GPS konumunuza göre üretilir.</p>
              <p className={`mt-2 text-xs ${sensorState === "active" ? "text-emerald-300" : "text-white/55"}`}>● {sensorText}</p>
              {selected && <p className="mt-2 font-display text-xl">PARSEL #{selected.parcelNumber}</p>}
            </div>
            <div className="flex flex-col gap-2 sm:min-w-[210px]">
              <button type="button" onClick={() => void startSensors()} disabled={sensorState === "starting"} className="rounded-xl border border-amber-300/30 bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200 disabled:opacity-60">
                {sensorState === "active" ? "Sensörleri Yenile" : "Pusula + Jiroskopu Başlat"}
              </button>
              {selected && (
                <button type="button" onClick={() => void navigate({ to: "/parsel-satin-al", search: { parcels: selected.id } })} className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15">Bu parseli satın al</button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
