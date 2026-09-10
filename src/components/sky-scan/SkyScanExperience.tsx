import { Camera, Compass, MapPin, ShoppingCart, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { bearingDegrees, distanceMeters, formatDistance, normalizeAngle, type GeoPoint } from "@/components/sky-scan/geo";

type LocationState = GeoPoint & { accuracy: number };
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
type OrientationEventWithCompass = DeviceOrientationEvent & { webkitCompassHeading?: number };
type ProjectedParcel = { parcel: NearbyParcel; angle: number; elevation: number; scale: number; opacity: number; top: number; left: number; z: number };

const CAMERA_FOV_DEGREES = 70;
const CAMERA_VERTICAL_FOV_DEGREES = 55;
const MAX_DISTANCE_METERS = 10_000;
const FETCH_LAT = 0.045;
const FETCH_LNG = 0.06;
const SKY_ENTER_ELEVATION = 10;
const SKY_EXIT_ELEVATION = 6;

const tierLabel = (tier: string) => tier === "premium" ? "Premium" : tier === "elite" ? "Elit" : "Dijital";
const tierFallbackPrice = (tier: string) => tier === "premium" ? 699 : tier === "elite" ? 349 : 149;
const screenAngle = () => typeof screen !== "undefined" && screen.orientation ? Number(screen.orientation.angle) || 0 : 0;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function absoluteHeading(event: OrientationEventWithCompass) {
  if (typeof event.webkitCompassHeading === "number" && Number.isFinite(event.webkitCompassHeading)) return event.webkitCompassHeading;
  if (event.absolute && typeof event.alpha === "number" && Number.isFinite(event.alpha)) return (360 - event.alpha + screenAngle() + 360) % 360;
  return null;
}

function relativeAlpha(event: DeviceOrientationEvent) {
  return typeof event.alpha === "number" && Number.isFinite(event.alpha) ? event.alpha : null;
}

function parcelSeed(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function virtualElevation(id: string) {
  return 18 + (parcelSeed(id) % 27);
}

function virtualTilt(id: string) {
  return -14 + (parcelSeed(id) % 29);
}

export function SkyScanExperience() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastParcelFetch = useRef<GeoPoint | null>(null);
  const relativeBaseAlpha = useRef<number | null>(null);
  const relativeBaseHeading = useRef(0);
  const skyModeRef = useRef(false);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [headingMode, setHeadingMode] = useState<"compass" | "motion" | null>(null);
  const [pitch, setPitch] = useState<number | null>(null);
  const [skyMode, setSkyMode] = useState(false);
  const [orientationStarted, setOrientationStarted] = useState(false);
  const [orientationError, setOrientationError] = useState<string | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [nearbyParcels, setNearbyParcels] = useState<NearbyParcel[]>([]);
  const [parcelLoading, setParcelLoading] = useState(false);
  const [parcelError, setParcelError] = useState<string | null>(null);
  const [selectedParcel, setSelectedParcel] = useState<NearbyParcel | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) { setLocationError("Bu cihaz konum bilgisini desteklemiyor."); return; }
    const watchId = navigator.geolocation.watchPosition(
      (position) => setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy }),
      (error) => setLocationError(error.message || "Konum alınamadı."),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (!orientationStarted) return;
    let gotSensor = false;
    const onOrientation = (event: DeviceOrientationEvent) => {
      const e = event as OrientationEventWithCompass;
      const compass = absoluteHeading(e);
      if (compass !== null) {
        gotSensor = true;
        setHeading(compass);
        setHeadingMode("compass");
        setOrientationError(null);
      } else {
        const alpha = relativeAlpha(event);
        if (alpha !== null) {
          gotSensor = true;
          if (relativeBaseAlpha.current === null) {
            relativeBaseAlpha.current = alpha;
            relativeBaseHeading.current = 0;
            setHeading(0);
          } else {
            const delta = normalizeAngle(alpha - relativeBaseAlpha.current);
            setHeading(normalizeAngle(relativeBaseHeading.current - delta));
          }
          setHeadingMode("motion");
          setOrientationError(null);
        }
      }

      if (typeof event.beta === "number" && Number.isFinite(event.beta)) {
        // Portrait: beta≈90° is the horizon. Tilting the camera upward moves beta toward 0°.
        const rawElevation = clamp(90 - event.beta, -90, 90);
        setPitch((previous) => previous === null ? rawElevation : previous * 0.82 + rawElevation * 0.18);
      }
    };
    window.addEventListener("deviceorientationabsolute", onOrientation as EventListener, true);
    window.addEventListener("deviceorientation", onOrientation as EventListener, true);
    const timer = window.setTimeout(() => { if (!gotSensor) setOrientationError("Telefon yön sensörü veri göndermiyor. Kamera açık kalır; parseller sensör verisi geldiğinde gökyüzüne yerleşir."); }, 3500);
    return () => {
      window.removeEventListener("deviceorientationabsolute", onOrientation as EventListener, true);
      window.removeEventListener("deviceorientation", onOrientation as EventListener, true);
      window.clearTimeout(timer);
    };
  }, [orientationStarted]);

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
    if (previous && distanceMeters(previous, location) < 120) return;
    lastParcelFetch.current = location;
    let alive = true;
    const load = async () => {
      setParcelLoading(true); setParcelError(null);
      const { data, error } = await supabaseBrowser.rpc("sky_scan_parcels", {
        p_min_lat: location.latitude - FETCH_LAT,
        p_min_lng: location.longitude - FETCH_LNG,
        p_max_lat: location.latitude + FETCH_LAT,
        p_max_lng: location.longitude + FETCH_LNG,
        p_limit: 80,
      });
      if (!alive) return;
      if (error) {
        setParcelError(error.message || "Yakındaki parseller alınamadı.");
        setNearbyParcels([]);
      } else {
        const rows = (data ?? []) as SkyParcel[];
        setNearbyParcels(rows.map((parcel) => ({ ...parcel, distance: distanceMeters(location, parcel), bearing: bearingDegrees(location, parcel) }))
          .filter((parcel) => parcel.distance <= MAX_DISTANCE_METERS)
          .sort((a, b) => a.distance - b.distance));
      }
      setParcelLoading(false);
    };
    void load();
    return () => { alive = false; };
  }, [location]);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((track) => track.stop()); }, []);

  const requestOrientationPermission = async () => {
    const request = (DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: (absolute?: boolean) => Promise<PermissionState> }).requestPermission;
    if (!request) return true;
    try { return (await request(true)) === "granted"; } catch { return false; }
  };

  const startScan = async () => {
    setCameraError(null); setCameraReady(false); setOrientationError(null); relativeBaseAlpha.current = null; setPitch(null); setSkyMode(false); skyModeRef.current = false;
    const orientationGranted = await requestOrientationPermission();
    if (!orientationGranted) setOrientationError("Yön sensörü izni verilmedi. Kamera çalışacak; sensör izni verildiğinde gökyüzü taraması aktifleşir.");
    try {
      if (!window.isSecureContext) throw new Error("Kamera yalnızca HTTPS bağlantısında çalışır.");
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Bu tarayıcı kamera erişimini desteklemiyor.");
      const video = videoRef.current;
      if (!video) throw new Error("Kamera görüntü alanı hazırlanamadı. Sayfayı yenileyip tekrar deneyin.");
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      streamRef.current = stream;
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute("webkit-playsinline", "true");
      setCameraStarted(true);
      setOrientationStarted(true);
      await new Promise<void>((resolve, reject) => {
        if (video.readyState >= HTMLMediaElement.HAVE_METADATA) { resolve(); return; }
        const timeout = window.setTimeout(() => reject(new Error("Kamera görüntüsü zamanında hazır olmadı.")), 8000);
        video.onloadedmetadata = () => { window.clearTimeout(timeout); resolve(); };
        video.onerror = () => { window.clearTimeout(timeout); reject(new Error("Kamera video akışı okunamadı.")); };
      });
      await video.play();
      setCameraReady(true);
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      const name = error instanceof DOMException ? error.name : "";
      const message = name === "NotAllowedError" ? "Kamera izni verilmedi. Tarayıcı ayarlarından kamera iznini açın." : name === "NotFoundError" ? "Kamera bulunamadı." : name === "NotReadableError" ? "Kamera başka bir uygulama tarafından kullanılıyor." : error instanceof Error ? error.message : "Kamera başlatılamadı.";
      setCameraStarted(false); setCameraReady(false); setCameraError(message);
    }
  };

  const stopScan = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.srcObject = null; }
    setCameraStarted(false); setCameraReady(false); setOrientationStarted(false); setHeading(null); setHeadingMode(null); setPitch(null); setSkyMode(false); skyModeRef.current = false; setSelectedParcel(null); relativeBaseAlpha.current = null;
  };

  const skyParcels = useMemo<ProjectedParcel[]>(() => {
    if (!cameraReady || !skyMode || heading === null || pitch === null || !nearbyParcels.length) return [];
    return nearbyParcels
      .map((parcel) => {
        const angle = normalizeAngle(parcel.bearing - heading);
        const elevation = virtualElevation(parcel.id);
        const relativeElevation = elevation - pitch;
        const distanceKm = parcel.distance / 1000;
        const distanceScale = clamp(1.65 / Math.sqrt(distanceKm + 0.25), 0.48, 1.5);
        const depthRatio = clamp(parcel.distance / MAX_DISTANCE_METERS, 0, 1);
        return {
          parcel,
          angle,
          elevation,
          scale: distanceScale,
          opacity: 0.96 - depthRatio * 0.46,
          left: 50 + (angle / CAMERA_FOV_DEGREES) * 100,
          top: 50 - (relativeElevation / CAMERA_VERTICAL_FOV_DEGREES) * 100,
          z: Math.round((1 - depthRatio) * 620),
        };
      })
      .filter((item) => Math.abs(item.angle) <= CAMERA_FOV_DEGREES / 2 && Math.abs(item.elevation - pitch) <= CAMERA_VERTICAL_FOV_DEGREES / 2)
      .sort((a, b) => a.parcel.distance - b.parcel.distance)
      .slice(0, 12);
  }, [cameraReady, heading, nearbyParcels, pitch, skyMode]);

  const nearestParcel = nearbyParcels[0] ?? null;
  const statusText = parcelLoading ? "Parseller taranıyor…" : parcelError ? "Parsel verisi alınamadı" : skyMode ? `${skyParcels.length} parsel gökyüzünde` : "Gökyüzüne yöneltin";
  const buySelected = () => {
    if (!selectedParcel || selectedParcel.status !== "available") return;
    window.location.href = `/parsel-satin-al?parcels=${encodeURIComponent(selectedParcel.id)}`;
  };

  return <main className="min-h-screen bg-slate-950 text-white">
    <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <header className="relative z-40 flex items-center gap-3">
        <a href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">← Geri</a>
        <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">MySkyParcel</p><h1 className="text-xl font-semibold sm:text-2xl">🌌 Gökyüzünü Tara</h1></div>
      </header>

      <div className="relative mt-5 min-h-[72vh] flex-1 overflow-hidden rounded-3xl border border-cyan-300/15 bg-slate-950 shadow-2xl">
        <video ref={videoRef} className={`absolute inset-0 z-0 h-full w-full bg-black object-cover ${cameraStarted ? "block" : "hidden"}`} playsInline muted autoPlay />

        {!cameraStarted && <div className="absolute inset-0 z-20 flex items-center justify-center"><div className="max-w-sm px-6 text-center"><Camera className="mx-auto h-12 w-12 text-cyan-300" /><h2 className="mt-4 text-xl font-semibold">Gerçek gökyüzü parsel taraması</h2><p className="mt-2 text-sm text-white/60">Kamera açıldığında parseller görünmez. Telefonu gerçek gökyüzüne kaldırdığınızda GPS + pusula + eğim verisiyle parseller görüş alanına yerleşir.</p><button type="button" onClick={startScan} className="mt-6 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-300/20">Kamerayı ve taramayı başlat</button>{locationError && <p className="mt-3 text-xs text-amber-200">{locationError}</p>}</div></div>}

        {cameraStarted && <>
          <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_18%,rgba(2,6,23,0.03)_58%,rgba(2,6,23,0.45)_100%)]" />
          {!cameraReady && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black"><div className="rounded-2xl border border-cyan-300/20 bg-slate-950/90 px-6 py-5 text-center"><Camera className="mx-auto h-8 w-8 animate-pulse text-cyan-300" /><p className="mt-3 text-sm font-semibold">Kamera görüntüsü hazırlanıyor…</p></div></div>}

          <div className="absolute left-3 right-3 top-3 z-40 flex items-center justify-between gap-2">
            <div className="rounded-full border border-white/20 bg-slate-950/55 px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur-md">✦ Gökyüzünü Tara</div>
            <button type="button" onClick={stopScan} className="rounded-full border border-white/20 bg-slate-950/55 p-2.5 backdrop-blur-md" aria-label="Kamerayı kapat"><X className="h-5 w-5" /></button>
          </div>

          {orientationError && <div className="absolute left-3 right-3 top-16 z-40 mx-auto max-w-xl rounded-xl border border-amber-300/25 bg-black/65 px-3 py-2 text-center text-[11px] text-amber-100 backdrop-blur-md">{orientationError}</div>}

          {cameraReady && !skyMode && <div className="pointer-events-none absolute inset-x-4 top-[43%] z-30 flex justify-center"><div className="rounded-2xl border border-white/20 bg-slate-950/50 px-5 py-3 text-center shadow-xl backdrop-blur-md"><div className="text-sm font-semibold text-white">☁️ Gökyüzüne yöneltin</div><div className="mt-1 text-xs text-white/70">Telefonu yukarı kaldırın · parseller gökyüzüne yerleşecek</div></div></div>}

          {cameraReady && skyMode && skyParcels.map((item) => {
            const { parcel } = item;
            const selected = selectedParcel?.id === parcel.id;
            const tilt = virtualTilt(parcel.id);
            return <button key={parcel.id} type="button" onClick={() => setSelectedParcel(parcel)} className="absolute z-30 -translate-x-1/2 -translate-y-1/2 text-left [perspective:1200px] transition-[left,top,opacity,transform] duration-300 ease-out" style={{ left: `${clamp(item.left, 4, 96)}%`, top: `${clamp(item.top, 12, 88)}%`, opacity: item.opacity, transform: `translateZ(${item.z}px) scale(${item.scale})` }}>
              <div className="relative [transform-style:preserve-3d] animate-[skyFloat_4.8s_ease-in-out_infinite]" style={{ animationDelay: `${-(parcelSeed(parcel.id) % 900) / 100}s` }}>
                <div className="absolute bottom-[calc(100%+4px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/25 bg-slate-950/80 px-2.5 py-1.5 text-left shadow-xl backdrop-blur-md [transform:translateZ(18px)]">
                  <div className="text-[10px] font-bold text-white">{parcel.parcel_number}</div>
                  <div className="text-[9px] text-white/80">{parcel.city_name}</div>
                  <div className="text-[9px] text-cyan-100">{formatDistance(parcel.distance)} · {Math.round(parcel.bearing)}°</div>
                  <div className="text-[10px] font-bold text-amber-300">₺{parcel.price ?? parcel.tier_price ?? tierFallbackPrice(parcel.tier)}</div>
                </div>

                <div className={`relative h-16 w-16 [transform-style:preserve-3d] ${selected ? "drop-shadow-[0_0_24px_rgba(251,191,36,0.95)]" : "drop-shadow-[0_0_20px_rgba(34,211,238,0.8)]"}`} style={{ transform: `rotateX(${12 + (parcelSeed(parcel.id) % 14)}deg) rotateY(${tilt}deg) rotateZ(${(parcelSeed(parcel.id) % 7) - 3}deg)` }}>
                  <div className={`absolute inset-1 rotate-45 border-2 ${selected ? "border-amber-300" : "border-cyan-200"} rounded-[10px]`} />
                  <div className={`absolute inset-4 rotate-45 border ${selected ? "border-amber-200/80" : "border-cyan-100/75"} rounded-[6px]`} />
                  <div className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 ${selected ? "bg-amber-200/80" : "bg-cyan-100/70"}`} />
                  <div className={`absolute left-0 top-1/2 h-px w-full -translate-y-1/2 ${selected ? "bg-amber-200/70" : "bg-cyan-100/60"}`} />
                  <div className={`absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[2px] ${selected ? "bg-amber-200" : "bg-cyan-100"}`} />
                </div>
                <div className={`absolute left-1/2 top-full h-20 w-px -translate-x-1/2 bg-gradient-to-b ${selected ? "from-amber-300/60" : "from-cyan-200/55"} to-transparent`} />
                <div className={`absolute left-1/2 top-[calc(100%+5rem)] h-1.5 w-12 -translate-x-1/2 rounded-full blur-md ${selected ? "bg-amber-300/35" : "bg-cyan-200/25"}`} />
              </div>
            </button>;
          })}

          <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-40 rounded-3xl border border-white/10 bg-slate-950/70 p-3 shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="text-center"><div className="text-lg">◉</div><div className="text-xs font-semibold">{skyMode ? `${skyParcels.length} parsel` : "Tarama hazır"}</div><div className="text-[10px] text-white/60">görüş alanında</div></div>
              <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full border border-cyan-300/70 bg-slate-950/75 shadow-[0_0_24px_rgba(34,211,238,0.3)]"><Compass className="h-6 w-6 text-cyan-200" /><div className="mt-0.5 text-sm font-bold">{heading === null ? "—" : `${Math.round(heading)}°`}</div><div className="text-[9px] text-cyan-100/70">{headingMode === "compass" ? "PUSULA" : headingMode === "motion" ? "HAREKET" : "SENSÖR"}</div></div>
              <div className="text-center"><div className="text-lg">⌖</div><div className="text-xs font-semibold">En yakın parsel</div><div className="text-[10px] text-white/70">{nearestParcel ? formatDistance(nearestParcel.distance) : "—"}</div></div>
            </div>
            <div className="mt-2 text-center text-[10px] text-white/55">{skyMode ? "Telefonu yavaşça sağa-sola çevirin · parseller gerçek yöne göre hareket eder" : "Kamera açık · parseller yalnızca gökyüzü görüş alanına girdiğinde görünür"}</div>
          </div>
        </>}
      </div>

      {cameraError && <div className="mt-3 rounded-xl border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{cameraError}</div>}

      {selectedParcel && skyMode && <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-2xl border border-cyan-300/30 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3"><div><div className="text-lg font-bold">{selectedParcel.parcel_number}</div><div className="text-xs text-slate-400">{selectedParcel.city_name} · {formatDistance(selectedParcel.distance)} · {Math.round(selectedParcel.bearing)}°</div></div><button type="button" onClick={() => setSelectedParcel(null)} className="rounded-lg p-1 text-slate-400"><X className="h-5 w-5" /></button></div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-white/5 p-2">Paket<br /><b>{tierLabel(selectedParcel.tier)}</b></div><div className="rounded-lg bg-white/5 p-2">Fiyat<br /><b>{selectedParcel.price ?? selectedParcel.tier_price ?? tierFallbackPrice(selectedParcel.tier)} ₺</b></div></div>
        {selectedParcel.status === "available" ? <button type="button" onClick={buySelected} className="mt-3 w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950"><ShoppingCart className="mr-2 inline h-4 w-4" />Satın Al</button> : <div className="mt-3 rounded-xl bg-white/5 p-3 text-center text-sm text-slate-400">Bu parsel şu anda satın alınabilir değil.</div>}
      </div>}
    </section>
    <style>{`@keyframes skyFloat{0%,100%{transform:translate3d(0,0,0) rotateX(0deg)}50%{transform:translate3d(0,-10px,18px) rotateX(2deg)}}`}</style>
  </main>;
}

function InfoCard({ icon, title, value, sub }: { icon: ReactNode; title: string; value: string; sub: string }) {
  return <div className="min-h-[62px] rounded-xl border border-white/10 bg-black/50 p-2 backdrop-blur-md"><div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-slate-400">{icon}{title}</div><div className="mt-0.5 truncate text-xs font-semibold text-white">{value}</div><div className="truncate text-[9px] text-slate-500">{sub}</div></div>;
}
