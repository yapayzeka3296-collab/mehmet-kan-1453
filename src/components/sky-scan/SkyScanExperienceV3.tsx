import { Camera, Compass, Crosshair, MapPin, Navigation, ShoppingCart, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { bearingDegrees, distanceMeters, formatDistance, normalizeAngle, type GeoPoint } from "@/components/sky-scan/geo";

type LocationState = GeoPoint & { accuracy: number; altitude: number | null };
type SkyParcel = {
  id: string;
  parcel_number: string;
  status: string;
  price: number | string | null;
  tier: string;
  tier_price: number | string | null;
  city_name: string;
  city_slug: string;
  latitude: number;
  longitude: number;
};
type NearbyParcel = SkyParcel & { distance: number; bearing: number };
type OrientationWithCompass = DeviceOrientationEvent & { webkitCompassHeading?: number };
type CameraState = { fov: number; width: number; height: number; zoom: number | null };
type ProjectedParcel = NearbyParcel & {
  left: number;
  top: number;
  scale: number;
  opacity: number;
  depth: number;
  occluded: boolean;
};

type XRSessionLike = {
  end: () => Promise<void>;
  updateRenderState: (state: { baseLayer: unknown; depthNear?: number; depthFar?: number }) => void;
  requestReferenceSpace: (type: string) => Promise<unknown>;
  requestAnimationFrame: (callback: (time: number, frame: XRFrameLike) => void) => number;
  addEventListener: (type: string, listener: () => void) => void;
};
type XRFrameLike = {
  getViewerPose: (referenceSpace: unknown) => XRViewerPoseLike | null;
  getDepthInformation?: (view: XRViewLike) => XRDepthLike | null;
};
type XRViewerPoseLike = { views: XRViewLike[] };
type XRViewLike = { projectionMatrix: Float32Array | number[]; transform: { inverse: { matrix: Float32Array | number[] } } };
type XRDepthLike = { getDepthInMeters?: (x: number, y: number) => number | undefined };
type XRSystemLike = {
  isSessionSupported: (mode: string) => Promise<boolean>;
  requestSession: (mode: string, options: Record<string, unknown>) => Promise<XRSessionLike>;
};
type XRNavigator = Navigator & { xr?: XRSystemLike };

const MAX_DISTANCE_METERS = 3_000;
const FETCH_LAT = 0.035;
const FETCH_LNG = 0.045;
const SKY_ENTER_ELEVATION = 8;
const SKY_EXIT_ELEVATION = 5;
const DEFAULT_FOV = 68;
const EARTH_RADIUS = 6_371_000;
const SKY_ANCHOR_HEIGHT_MIN = 55;
const SKY_ANCHOR_HEIGHT_MAX = 180;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const rad = (degrees: number) => degrees * Math.PI / 180;
const deg = (radians: number) => radians * 180 / Math.PI;
const tierLabel = (tier: string) => tier === "premium" ? "Premium" : tier === "elite" ? "Elit" : "Dijital";
const tierFallbackPrice = (tier: string) => tier === "premium" ? 699 : tier === "elite" ? 349 : 149;

function orientationQuaternion(event: DeviceOrientationEvent) {
  const alpha = rad(event.alpha ?? 0);
  const beta = rad(event.beta ?? 0);
  const gamma = rad(event.gamma ?? 0);
  const screenAngle = typeof screen !== "undefined" && screen.orientation ? Number(screen.orientation.angle) || 0 : 0;
  const euler = new Euler(beta, alpha, -gamma, "YXZ");
  const quaternion = new Quaternion().setFromEuler(euler);
  quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -rad(screenAngle)));
  quaternion.multiply(new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2));
  return quaternion;
}

function orientationPose(event: DeviceOrientationEvent) {
  const quaternion = orientationQuaternion(event);
  const forward = new Vector3(0, 0, -1).applyQuaternion(quaternion).normalize();
  const rawHeading = normalizeAngle(deg(Math.atan2(forward.x, -forward.z)));
  const pitch = clamp(deg(Math.asin(clamp(forward.y, -1, 1))), -89, 89);
  return { quaternion, rawHeading, pitch };
}

function localEnu(origin: GeoPoint, target: GeoPoint) {
  const dLat = rad(target.latitude - origin.latitude);
  const dLon = rad(target.longitude - origin.longitude);
  const meanLat = rad((origin.latitude + target.latitude) / 2);
  return {
    east: dLon * EARTH_RADIUS * Math.cos(meanLat),
    north: dLat * EARTH_RADIUS,
  };
}

function skyAnchorHeight(distance: number) {
  return clamp(SKY_ANCHOR_HEIGHT_MIN + distance * 0.035, SKY_ANCHOR_HEIGHT_MIN, SKY_ANCHOR_HEIGHT_MAX);
}

function parcelSeed(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function estimateCameraFov(video: HTMLVideoElement, track: MediaStreamTrack | null) {
  const settings = track?.getSettings?.();
  const width = settings?.width ?? video.videoWidth;
  const height = settings?.height ?? video.videoHeight;
  const zoom = typeof settings?.zoom === "number" ? settings.zoom : null;
  let fov = DEFAULT_FOV;
  if (zoom && zoom > 1) fov = 2 * deg(Math.atan(Math.tan(rad(DEFAULT_FOV / 2)) / zoom));
  return { fov: clamp(fov, 45, 82), width, height, zoom } satisfies CameraState;
}

async function getMagneticDeclination(latitude: number, longitude: number) {
  try {
    const url = new URL("https://www.ngdc.noaa.gov/geomag-web/calculators/calculateDeclination");
    url.searchParams.set("lat1", String(latitude));
    url.searchParams.set("lon1", String(longitude));
    url.searchParams.set("model", "WMM");
    url.searchParams.set("resultFormat", "json");
    const response = await fetch(url.toString(), { cache: "force-cache" });
    if (!response.ok) return 0;
    const body = await response.json() as Record<string, unknown>;
    const candidate = body.declination ?? body.Declination ?? body.declinationDeg;
    const value = typeof candidate === "number" ? candidate : Number(candidate);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function projectFallback(
  parcel: NearbyParcel,
  location: LocationState,
  heading: number,
  pitch: number,
  fov: number,
  viewportWidth: number,
  viewportHeight: number,
  referenceHeading: number,
  accuracy: number,
): ProjectedParcel | null {
  const enu = localEnu(location, parcel);
  const yaw = rad(referenceHeading);
  const x = enu.east * Math.cos(yaw) + enu.north * Math.sin(yaw);
  const zNorth = enu.north * Math.cos(yaw) - enu.east * Math.sin(yaw);
  const y = skyAnchorHeight(parcel.distance) - (location.altitude ?? 0) * 0.02;
  const horizontalAngle = normalizeAngle(parcel.bearing - heading);
  const relativePitch = deg(Math.atan2(y, Math.max(1, parcel.distance))) - pitch;
  const verticalFov = fov * (viewportHeight / Math.max(1, viewportWidth));
  const left = 50 + (horizontalAngle / fov) * 100;
  const top = 50 - (relativePitch / verticalFov) * 100;
  const uncertainty = clamp(accuracy / Math.max(parcel.distance, 50), 0, 0.75);
  const depth = Math.sqrt(x * x + zNorth * zNorth + y * y);
  const visible = Math.abs(horizontalAngle) <= fov / 2 && Math.abs(relativePitch) <= verticalFov / 2;
  if (!visible) return null;
  return {
    ...parcel,
    left,
    top,
    scale: clamp(1.4 / Math.sqrt(parcel.distance / 1000 + 0.35), 0.52, 1.5),
    opacity: clamp(0.98 - uncertainty * 0.5 - parcel.distance / MAX_DISTANCE_METERS * 0.25, 0.32, 0.98),
    depth,
    occluded: false,
  };
}

export function SkyScanExperienceV3() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const xrSessionRef = useRef<XRSessionLike | null>(null);
  const xrReferenceSpaceRef = useRef<unknown>(null);
  const xrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const xrOriginHeadingRef = useRef(0);
  const xrWorldOriginRef = useRef<GeoPoint | null>(null);
  const lastParcelFetch = useRef<GeoPoint | null>(null);
  const relativeBaseHeading = useRef<number | null>(null);
  const lastSensorMode = useRef<"absolute" | "relative" | null>(null);
  const smoothedQuaternion = useRef<Quaternion | null>(null);
  const skyModeRef = useRef(false);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [pitch, setPitch] = useState<number | null>(null);
  const [roll, setRoll] = useState<number>(0);
  const [declination, setDeclination] = useState(0);
  const [skyMode, setSkyMode] = useState(false);
  const [orientationStarted, setOrientationStarted] = useState(false);
  const [orientationError, setOrientationError] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>({ fov: DEFAULT_FOV, width: 0, height: 0, zoom: null });
  const [nearbyParcels, setNearbyParcels] = useState<NearbyParcel[]>([]);
  const [parcelLoading, setParcelLoading] = useState(false);
  const [parcelError, setParcelError] = useState<string | null>(null);
  const [selectedParcel, setSelectedParcel] = useState<NearbyParcel | null>(null);
  const [xrMode, setXrMode] = useState(false);
  const [depthOcclusion, setDepthOcclusion] = useState(false);
  const [sensorTimestamp, setSensorTimestamp] = useState(0);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Bu cihaz konum bilgisini desteklemiyor.");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: Math.max(1, position.coords.accuracy || 999),
        altitude: typeof position.coords.altitude === "number" ? position.coords.altitude : null,
      }),
      (error) => setLocationError(error.message || "Konum alınamadı."),
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 15_000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (!location) return;
    let alive = true;
    void getMagneticDeclination(location.latitude, location.longitude).then((value) => {
      if (alive) setDeclination(value);
    });
    return () => { alive = false; };
  }, [location?.latitude, location?.longitude]);

  useEffect(() => {
    if (!orientationStarted) return;
    let gotSensor = false;
    const onOrientation = (event: DeviceOrientationEvent) => {
      if (typeof event.alpha !== "number" || typeof event.beta !== "number" || typeof event.gamma !== "number") return;
      const e = event as OrientationWithCompass;
      const pose = orientationPose(event);
      const absolute = Boolean(event.absolute || typeof e.webkitCompassHeading === "number");
      if (absolute) {
        lastSensorMode.current = "absolute";
        const compass = typeof e.webkitCompassHeading === "number" && Number.isFinite(e.webkitCompassHeading)
          ? normalizeAngle(e.webkitCompassHeading + declination)
          : normalizeAngle(pose.rawHeading + declination);
        setHeading(compass);
      } else {
        lastSensorMode.current = "relative";
        if (relativeBaseHeading.current === null) relativeBaseHeading.current = pose.rawHeading;
        setHeading(normalizeAngle(pose.rawHeading - relativeBaseHeading.current));
      }
      const previous = smoothedQuaternion.current;
      smoothedQuaternion.current = previous ? previous.clone().slerp(pose.quaternion, 0.18) : pose.quaternion;
      setPitch((previousPitch) => previousPitch === null ? pose.pitch : previousPitch * 0.78 + pose.pitch * 0.22);
      const euler = new Euler().setFromQuaternion(smoothedQuaternion.current, "YXZ");
      setRoll(clamp(deg(euler.z), -45, 45));
      gotSensor = true;
      setSensorTimestamp(Date.now());
      setOrientationError(null);
    };
    window.addEventListener("deviceorientationabsolute", onOrientation as EventListener, true);
    window.addEventListener("deviceorientation", onOrientation as EventListener, true);
    const timer = window.setTimeout(() => {
      if (!gotSensor) setOrientationError("Telefonun hareket/yön sensörü veri vermiyor. Kamera açık kalır; tarama sensör verisi geldiğinde otomatik devam eder.");
    }, 3500);
    return () => {
      window.removeEventListener("deviceorientationabsolute", onOrientation as EventListener, true);
      window.removeEventListener("deviceorientation", onOrientation as EventListener, true);
      window.clearTimeout(timer);
    };
  }, [declination, orientationStarted]);

  useEffect(() => {
    const elevation = pitch ?? -90;
    const nextSkyMode = skyModeRef.current ? elevation >= SKY_EXIT_ELEVATION : elevation >= SKY_ENTER_ELEVATION;
    skyModeRef.current = nextSkyMode;
    setSkyMode(nextSkyMode);
    if (!nextSkyMode) setSelectedParcel(null);
  }, [pitch]);

  useEffect(() => {
    if (!location || !supabaseBrowser) return;
    const previous = lastParcelFetch.current;
    if (previous && distanceMeters(previous, location) < 60) return;
    lastParcelFetch.current = location;
    let alive = true;
    const load = async () => {
      setParcelLoading(true);
      setParcelError(null);
      const { data, error } = await supabaseBrowser.rpc("sky_scan_parcels", {
        p_min_lat: location.latitude - FETCH_LAT,
        p_min_lng: location.longitude - FETCH_LNG,
        p_max_lat: location.latitude + FETCH_LAT,
        p_max_lng: location.longitude + FETCH_LNG,
        p_limit: 100,
      });
      if (!alive) return;
      if (error) {
        setParcelError(error.message || "Yakındaki parseller alınamadı.");
        setNearbyParcels([]);
      } else {
        const rows = (data ?? []) as SkyParcel[];
        const maxRange = clamp(1500 + location.accuracy * 15, 1800, MAX_DISTANCE_METERS);
        setNearbyParcels(rows
          .map((parcel) => ({ ...parcel, distance: distanceMeters(location, parcel), bearing: bearingDegrees(location, parcel) }))
          .filter((parcel) => parcel.distance <= maxRange)
          .sort((a, b) => a.distance - b.distance));
      }
      setParcelLoading(false);
    };
    void load();
    return () => { alive = false; };
  }, [location]);

  const requestOrientationPermission = useCallback(async () => {
    const request = (DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: (absolute?: boolean) => Promise<PermissionState>;
    }).requestPermission;
    if (!request) return true;
    try {
      return (await request(true)) === "granted";
    } catch {
      return false;
    }
  }, []);

  const stopXR = useCallback(async () => {
    if (xrSessionRef.current) {
      try { await xrSessionRef.current.end(); } catch { /* session already ended */ }
    }
    xrSessionRef.current = null;
    xrReferenceSpaceRef.current = null;
    setXrMode(false);
    setDepthOcclusion(false);
  }, []);

  const startXR = useCallback(async () => {
    const xr = (navigator as XRNavigator).xr;
    if (!xr || !location || heading === null || !rootRef.current) return false;
    try {
      const supported = await xr.isSessionSupported("immersive-ar");
      if (!supported) return false;
      const session = await xr.requestSession("immersive-ar", {
        requiredFeatures: ["local"],
        optionalFeatures: ["dom-overlay", "depth-sensing", "hit-test", "local-floor"],
        domOverlay: { root: rootRef.current },
        depthSensing: {
          usagePreference: ["cpu-optimized", "gpu-optimized"],
          dataFormatPreference: ["float32", "luminance-alpha"],
        },
      });
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl", { alpha: true, antialias: true });
      if (!gl) {
        await session.end();
        return false;
      }
      const xrCompatibleGl = gl as WebGLRenderingContext & { makeXRCompatible?: () => Promise<void> };
      if (xrCompatibleGl.makeXRCompatible) await xrCompatibleGl.makeXRCompatible();
      const XRWebGLLayerCtor = (window as unknown as { XRWebGLLayer?: new (session: unknown, context: WebGLRenderingContext, options?: { alpha?: boolean }) => unknown }).XRWebGLLayer;
      if (!XRWebGLLayerCtor) {
        await session.end();
        return false;
      }
      session.updateRenderState({ baseLayer: new XRWebGLLayerCtor(session, gl, { alpha: true }) });
      const referenceSpace = await session.requestReferenceSpace("local");
      xrCanvasRef.current = canvas;
      xrSessionRef.current = session;
      xrReferenceSpaceRef.current = referenceSpace;
      xrOriginHeadingRef.current = heading;
      xrWorldOriginRef.current = location;
      setXrMode(true);
      session.addEventListener("end", () => { xrSessionRef.current = null; setXrMode(false); setDepthOcclusion(false); });

      const drawFrame = (_time: number, frame: XRFrameLike) => {
        const currentSession = xrSessionRef.current;
        const space = xrReferenceSpaceRef.current;
        if (!currentSession || !space) return;
        const pose = frame.getViewerPose(space);
        const baseLayer = (currentSession as unknown as { renderState?: { baseLayer?: { framebuffer?: WebGLFramebuffer | null; framebufferWidth?: number; framebufferHeight?: number } } }).renderState?.baseLayer;
        if (baseLayer && gl.bindFramebuffer) {
          gl.bindFramebuffer(gl.FRAMEBUFFER, baseLayer.framebuffer ?? null);
          gl.viewport(0, 0, baseLayer.framebufferWidth ?? gl.drawingBufferWidth, baseLayer.framebufferHeight ?? gl.drawingBufferHeight);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }
        if (pose) {
          const depth = frame.getDepthInformation?.(pose.views[0]);
          setDepthOcclusion(Boolean(depth?.getDepthInMeters));
        }
        currentSession.requestAnimationFrame(drawFrame);
      };
      session.requestAnimationFrame(drawFrame);
      return true;
    } catch {
      return false;
    }
  }, [heading, location]);

  const startCameraFallback = useCallback(async () => {
    if (!window.isSecureContext) throw new Error("Kamera yalnızca HTTPS bağlantısında çalışır.");
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("Bu tarayıcı kamera erişimini desteklemiyor.");
    const video = videoRef.current;
    if (!video) throw new Error("Kamera görüntü alanı hazırlanamadı.");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        frameRate: { ideal: 30, max: 60 },
      },
      audio: false,
    });
    streamRef.current = stream;
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("webkit-playsinline", "true");
    await new Promise<void>((resolve, reject) => {
      if (video.readyState >= HTMLMediaElement.HAVE_METADATA) { resolve(); return; }
      const timeout = window.setTimeout(() => reject(new Error("Kamera görüntüsü zamanında hazır olmadı.")), 8000);
      video.onloadedmetadata = () => { window.clearTimeout(timeout); resolve(); };
      video.onerror = () => { window.clearTimeout(timeout); reject(new Error("Kamera video akışı okunamadı.")); };
    });
    await video.play();
    const track = stream.getVideoTracks()[0] ?? null;
    setCameraState(estimateCameraFov(video, track));
  }, []);

  const startScan = useCallback(async () => {
    setCameraError(null);
    setOrientationError(null);
    setCameraReady(false);
    relativeBaseHeading.current = null;
    smoothedQuaternion.current = null;
    setPitch(null);
    setSkyMode(false);
    skyModeRef.current = false;
    const orientationGranted = await requestOrientationPermission();
    if (!orientationGranted) setOrientationError("Yön sensörü izni verilmedi. Kamera çalışacak; sensör izni verilince parseller yerleşir.");
    setOrientationStarted(true);
    try {
      const xrStarted = await startXR();
      if (!xrStarted) {
        await startCameraFallback();
        setCameraStarted(true);
      } else {
        setCameraStarted(true);
      }
      setCameraReady(true);
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      const name = error instanceof DOMException ? error.name : "";
      const message = name === "NotAllowedError" ? "Kamera izni verilmedi. Tarayıcı ayarlarından kamera iznini açın." : name === "NotFoundError" ? "Kamera bulunamadı." : name === "NotReadableError" ? "Kamera başka bir uygulama tarafından kullanılıyor." : error instanceof Error ? error.message : "Kamera başlatılamadı.";
      setCameraStarted(false);
      setCameraReady(false);
      setCameraError(message);
    }
  }, [requestOrientationPermission, startCameraFallback, startXR]);

  const stopScan = useCallback(() => {
    void stopXR();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setCameraStarted(false);
    setCameraReady(false);
    setOrientationStarted(false);
    setHeading(null);
    setPitch(null);
    setSkyMode(false);
    skyModeRef.current = false;
    setSelectedParcel(null);
    relativeBaseHeading.current = null;
    smoothedQuaternion.current = null;
  }, [stopXR]);

  useEffect(() => () => { void stopXR(); streamRef.current?.getTracks().forEach((track) => track.stop()); }, [stopXR]);

  const fallbackProjected = useMemo<ProjectedParcel[]>(() => {
    if (xrMode || !cameraReady || !skyMode || heading === null || pitch === null || !location) return [];
    const viewport = rootRef.current?.getBoundingClientRect();
    const width = viewport?.width ?? window.innerWidth;
    const height = viewport?.height ?? window.innerHeight;
    return nearbyParcels
      .map((parcel) => projectFallback(parcel, location, heading, pitch, cameraState.fov, width, height, heading, location.accuracy))
      .filter((item): item is ProjectedParcel => Boolean(item));
  }, [cameraReady, cameraState.fov, heading, location, nearbyParcels, pitch, roll, sensorTimestamp, skyMode, xrMode]);

  const xrProjected = useMemo<ProjectedParcel[]>(() => {
    if (!xrMode || !location || !xrWorldOriginRef.current || heading === null) return [];
    return nearbyParcels.map((parcel) => {
      const enu = localEnu(xrWorldOriginRef.current as GeoPoint, parcel);
      const yaw = rad(xrOriginHeadingRef.current);
      const x = enu.east * Math.cos(yaw) + enu.north * Math.sin(yaw);
      const z = -enu.north * Math.cos(yaw) + enu.east * Math.sin(yaw);
      const y = skyAnchorHeight(parcel.distance);
      const depth = Math.sqrt(x * x + y * y + z * z);
      return {
        ...parcel,
        left: 50,
        top: 50,
        scale: clamp(1.45 / Math.sqrt(parcel.distance / 1000 + 0.35), 0.5, 1.45),
        opacity: clamp(0.98 - location.accuracy / Math.max(parcel.distance, 50) * 0.45, 0.35, 0.98),
        depth,
        occluded: false,
      };
    });
  }, [heading, location, nearbyParcels, xrMode]);

  const visibleParcels = xrMode ? xrProjected : fallbackProjected;
  const nearestParcel = nearbyParcels[0] ?? null;
  const accuracyGood = Boolean(location && location.accuracy <= 35);
  const statusText = parcelLoading ? "Parseller taranıyor…" : parcelError ? "Parsel verisi alınamadı" : skyMode ? `${visibleParcels.length} parsel görüş alanında` : "Gökyüzüne yöneltin";

  const buySelected = () => {
    if (!selectedParcel || selectedParcel.status !== "available") return;
    window.location.href = `/parsel-satin-al?parcels=${encodeURIComponent(selectedParcel.id)}`;
  };

  return (
    <main ref={rootRef} className="fixed inset-0 overflow-hidden bg-slate-950 text-white">
      <video ref={videoRef} className={`absolute inset-0 z-0 h-full w-full bg-black object-cover ${cameraStarted && !xrMode ? "block" : "hidden"}`} playsInline muted autoPlay />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(2,6,23,0.04)_58%,rgba(2,6,23,0.52)_100%)]" />

      {!cameraStarted && (
        <div className="absolute inset-0 z-30 flex items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-950/85 p-7 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-300/10"><Camera className="h-8 w-8 text-cyan-200" /></div>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-300">MySkyParcel AR</p>
            <h1 className="mt-2 text-2xl font-bold">Gökyüzünü Tara</h1>
            <p className="mt-3 text-sm leading-6 text-white/65">Telefonu gerçek gökyüzüne tutun. GPS, pusula, jiroskop ve cihazın gerçek kamera perspektifiyle parseller görüş alanınıza yerleşir.</p>
            <button type="button" onClick={startScan} className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-300/20">Kamerayı ve AR taramayı başlat</button>
            {locationError && <p className="mt-3 text-xs text-amber-200">{locationError}</p>}
            {cameraError && <p className="mt-3 text-xs text-red-200">{cameraError}</p>}
          </div>
        </div>
      )}

      {cameraStarted && (
        <>
          <div className="absolute left-3 right-3 top-3 z-50 flex items-center justify-between gap-2 sm:left-5 sm:right-5 sm:top-5">
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/55 px-3.5 py-2 shadow-xl backdrop-blur-md">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10"><Crosshair className="h-4 w-4 text-cyan-200" /></div>
              <div><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-300">MySkyParcel</p><p className="text-xs font-semibold">Gökyüzünü Tara</p></div>
            </div>
            <div className="flex gap-2">
              <div className="hidden rounded-full border border-white/15 bg-slate-950/55 px-3 py-2 text-[10px] text-white/80 backdrop-blur-md sm:block">{xrMode ? "WebXR 3D" : `FOV ${Math.round(cameraState.fov)}°`}</div>
              <button type="button" onClick={stopScan} className="rounded-full border border-white/20 bg-slate-950/55 p-2.5 backdrop-blur-md" aria-label="Kamerayı kapat"><X className="h-5 w-5" /></button>
            </div>
          </div>

          {orientationError && <div className="absolute left-3 right-3 top-16 z-50 mx-auto max-w-xl rounded-xl border border-amber-300/25 bg-black/65 px-3 py-2 text-center text-[11px] text-amber-100 backdrop-blur-md">{orientationError}</div>}

          {!accuracyGood && location && <div className="absolute left-3 right-3 top-[7.2rem] z-40 mx-auto max-w-xl rounded-xl border border-amber-300/25 bg-black/60 px-3 py-2 text-center text-[10px] text-amber-100 backdrop-blur-md">GPS doğruluğu ±{Math.round(location.accuracy)} m. Telefonu birkaç saniye sabit tutun.</div>}

          {!cameraReady && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black"><div className="rounded-2xl border border-cyan-300/20 bg-slate-950/90 px-6 py-5 text-center"><Camera className="mx-auto h-8 w-8 animate-pulse text-cyan-300" /><p className="mt-3 text-sm font-semibold">Kamera görüntüsü hazırlanıyor…</p></div></div>}

          {cameraReady && !skyMode && <div className="pointer-events-none absolute inset-x-4 top-[42%] z-30 flex justify-center"><div className="rounded-2xl border border-white/20 bg-slate-950/50 px-5 py-3 text-center shadow-xl backdrop-blur-md"><div className="text-sm font-semibold">☁️ Gökyüzüne yöneltin</div><div className="mt-1 text-xs text-white/65">Telefonu yukarı kaldırın · 3 km hassas tarama aktif</div></div></div>}

          {cameraReady && skyMode && visibleParcels.map((item) => {
            const selected = selectedParcel?.id === item.id;
            if (item.occluded) return null;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedParcel(item)}
                className="absolute z-30 -translate-x-1/2 -translate-y-1/2 text-left [perspective:1200px] transition-[left,top,opacity,transform] duration-200"
                style={{
                  left: `${clamp(item.left, 3, 97)}%`,
                  top: `${clamp(item.top, 10, 84)}%`,
                  opacity: item.opacity,
                  transform: `translateZ(${-Math.min(item.depth, 1000)}px) scale(${item.scale}) rotateZ(${roll * 0.18}deg)`,
                }}
              >
                <div className="relative [transform-style:preserve-3d] animate-[skyFloat_4.8s_ease-in-out_infinite]" style={{ animationDelay: `${-(parcelSeed(item.id) % 900) / 100}s` }}>
                  <div className="absolute bottom-[calc(100%+5px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-white/25 bg-slate-950/82 px-3 py-2 shadow-xl backdrop-blur-md">
                    <div className="text-[11px] font-bold text-white">P-{item.parcel_number}</div>
                    <div className="text-[9px] text-white/75">{item.city_name} · {formatDistance(item.distance)}</div>
                    <div className="text-[10px] font-bold text-amber-300">₺{item.price ?? item.tier_price ?? tierFallbackPrice(item.tier)}</div>
                  </div>
                  <div className={`relative h-16 w-16 [transform-style:preserve-3d] ${selected ? "drop-shadow-[0_0_28px_rgba(251,191,36,0.95)]" : "drop-shadow-[0_0_20px_rgba(34,211,238,0.9)]"}`}>
                    <div className={`absolute inset-2 rotate-45 rounded-[11px] border-2 ${selected ? "border-amber-300" : "border-cyan-100"}`} />
                    <div className={`absolute inset-5 rotate-45 rounded-[6px] border ${selected ? "border-amber-200/80" : "border-cyan-100/80"}`} />
                    <div className={`absolute left-1/2 top-1 h-14 w-px -translate-x-1/2 ${selected ? "bg-amber-200/80" : "bg-cyan-100/70"}`} />
                    <div className={`absolute left-1 top-1/2 h-px w-14 -translate-y-1/2 ${selected ? "bg-amber-200/80" : "bg-cyan-100/70"}`} />
                    <div className={`absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${selected ? "bg-amber-200" : "bg-white"}`} />
                  </div>
                </div>
              </button>
            );
          })}

          {selectedParcel && (
            <div className="absolute bottom-28 left-3 right-3 z-50 mx-auto max-w-md rounded-3xl border border-white/15 bg-slate-950/88 p-4 shadow-2xl backdrop-blur-xl sm:bottom-28">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">{tierLabel(selectedParcel.tier)}</p><h2 className="mt-1 text-lg font-bold">P-{selectedParcel.parcel_number}</h2><p className="text-xs text-white/65">{selectedParcel.city_name} · {formatDistance(selectedParcel.distance)} · {Math.round(selectedParcel.bearing)}°</p></div>
                <button type="button" onClick={() => setSelectedParcel(null)} className="rounded-full bg-white/10 p-2"><X className="h-4 w-4" /></button>
              </div>
              <div className="mt-3 flex gap-2"><button type="button" onClick={buySelected} disabled={selectedParcel.status !== "available"} className="flex-1 rounded-xl bg-cyan-300 px-4 py-2.5 text-xs font-bold text-slate-950 disabled:opacity-40"><ShoppingCart className="mr-1 inline h-4 w-4" />Satın Al</button><a href={`/parsel/${encodeURIComponent(selectedParcel.id)}`} className="rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold">Parseli İncele</a></div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 z-40 px-3 pb-3 sm:px-5 sm:pb-5">
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 rounded-[28px] border border-white/15 bg-slate-950/72 px-4 py-3 shadow-2xl backdrop-blur-xl sm:px-6 sm:py-4">
              <div className="min-w-0 text-center"><MapPin className="mx-auto h-5 w-5 text-cyan-200" /><p className="mt-1 text-[10px] text-white/60">Görüşte</p><p className="text-sm font-bold">{visibleParcels.length}</p><p className="text-[9px] text-white/55">parsel</p></div>
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-cyan-300/40 bg-slate-950/70 shadow-[0_0_30px_rgba(34,211,238,0.16)]"><div className="absolute inset-2 rounded-full border border-white/10" /><Navigation className="h-7 w-7 text-cyan-100" style={{ transform: `rotate(${heading ?? 0}deg)` }} /><div className="absolute bottom-2 text-[9px] font-bold text-cyan-200">{heading === null ? "—" : `${Math.round(heading)}°`}</div></div>
              <div className="min-w-0 text-center"><Compass className="mx-auto h-5 w-5 text-cyan-200" /><p className="mt-1 text-[10px] text-white/60">En yakın</p><p className="text-sm font-bold">{nearestParcel ? formatDistance(nearestParcel.distance) : "—"}</p><p className="text-[9px] text-white/55">{nearestParcel ? `${Math.round(nearestParcel.bearing)}° yön` : "bekleniyor"}</p></div>
            </div>
            <div className="mx-auto mt-2 flex max-w-2xl items-center justify-center gap-3 text-[9px] text-white/55"><span>{statusText}</span><span>•</span><span>±{location ? Math.round(location.accuracy) : "—"} m GPS</span><span>•</span><span>{Math.round(declination * 10) / 10}° manyetik düzeltme</span>{depthOcclusion && <><span>•</span><span className="text-emerald-300">depth occlusion</span></>}</div>
          </div>
        </>
      )}
    </main>
  );
}
