import { Camera, Compass, Crosshair, MapPin, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type LocationState = {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number | null;
};

type OrientationLike = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const normalize = (value: number) => ((value % 360) + 360) % 360;

export function SkyScanExperienceV5() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [sensorStarted, setSensorStarted] = useState(false);
  const [sensorActive, setSensorActive] = useState(false);
  const [sensorError, setSensorError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [pitch, setPitch] = useState<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Bu cihaz konum bilgisini desteklemiyor.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.max(1, position.coords.accuracy || 999),
          altitude: typeof position.coords.altitude === "number" ? position.coords.altitude : null,
        });
        setLocationError(null);
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
        : typeof source.alpha === "number"
          ? source.alpha
          : null;

      if (compass !== null && Number.isFinite(compass)) setHeading(normalize(compass));
      if (typeof source.beta === "number" && Number.isFinite(source.beta)) {
        setPitch(clamp(source.beta, -90, 90));
      }
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

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (!window.isSecureContext) throw new Error("Kamera yalnızca HTTPS bağlantısında çalışır.");
    const video = videoRef.current;
    if (!navigator.mediaDevices?.getUserMedia || !video) throw new Error("Bu tarayıcı kamera erişimini desteklemiyor.");

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
    await video.play();
    setCameraStarted(true);
    setCameraReady(true);
  }, []);

  const startScan = useCallback(async () => {
    setSensorError(null);
    setSensorActive(false);
    setHeading(null);
    setPitch(null);
    try {
      await startCamera();
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraError(error instanceof Error ? error.message : "Kamera başlatılamadı.");
      return;
    }

    const Orientation = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: () => Promise<PermissionState>;
    };
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
    setPitch(null);
  }, []);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  return (
    <main className="fixed inset-0 overflow-hidden bg-slate-950 text-white">
      <video ref={videoRef} className={`absolute inset-0 z-0 h-full w-full object-cover ${cameraStarted ? "block" : "hidden"}`} playsInline muted autoPlay />

      {!cameraStarted && (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-950/90 p-7 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-300/10">
              <Camera className="h-8 w-8 text-cyan-200" />
            </div>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[.28em] text-cyan-300">MySkyParcel</p>
            <h1 className="mt-2 text-2xl font-bold">Gökyüzünü Tara</h1>
            <p className="mt-3 text-sm leading-6 text-white/65">Kamera deneyimi hazır. Yeni gökyüzü ve AR parsel sistemi bu temiz altyapının üzerine yeniden tasarlanacak.</p>
            <button onClick={startScan} className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950">Kamerayı başlat</button>
            {locationError && <p className="mt-3 text-xs text-amber-200">{locationError}</p>}
            {cameraError && <p className="mt-3 text-xs text-red-200">{cameraError}</p>}
          </div>
        </div>
      )}

      {cameraStarted && (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="rounded-2xl border border-white/15 bg-black/45 px-3 py-2 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-semibold"><Camera className="h-4 w-4" /> Kamera {cameraReady ? "hazır" : "başlatılıyor"}</div>
              <div className="mt-1 text-[10px] text-white/60">Yeni AR tasarımı için temiz ekran</div>
            </div>
            <button onClick={stopScan} className="pointer-events-auto rounded-full border border-white/20 bg-black/45 p-2.5 backdrop-blur-md" aria-label="Kamerayı kapat"><X className="h-5 w-5" /></button>
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <Crosshair className="h-10 w-10 text-white/65" strokeWidth={1.2} />
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="mx-auto max-w-xl rounded-3xl border border-white/15 bg-black/50 p-4 backdrop-blur-xl">
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-semibold uppercase tracking-wider text-white/70">
                <div><MapPin className="mx-auto mb-1 h-4 w-4" />{location ? `${Math.round(location.accuracy)} m GPS` : "GPS bekleniyor"}</div>
                <div><Compass className="mx-auto mb-1 h-4 w-4" />{sensorActive && heading !== null ? `${Math.round(heading)}°` : "Pusula bekleniyor"}</div>
                <div>{sensorActive && pitch !== null ? `Eğim ${Math.round(pitch)}°` : "Sensör bekleniyor"}</div>
              </div>
              {sensorError && <p className="mt-3 text-center text-xs text-amber-200">{sensorError}</p>}
              <p className="mt-3 text-center text-[10px] text-white/45">Parsel kristali, etiket, FOV projeksiyonu ve satın alma katmanı bu sürümde yoktur.</p>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
