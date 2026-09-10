import { Camera, Compass, MapPin, ShoppingCart, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { bearingDegrees, distanceMeters, formatDistance, normalizeAngle, type GeoPoint } from "@/components/sky-scan/geo";

type LocationState = GeoPoint & { accuracy: number };
type SkyParcel = { id: string; parcel_number: string; status: string; price: number | string | null; tier: string; tier_price: number | string | null; city_name: string; city_slug: string; latitude: number; longitude: number };
type NearbyParcel = SkyParcel & { distance: number; bearing: number };
type OrientationEventWithCompass = DeviceOrientationEvent & { webkitCompassHeading?: number };

const CAMERA_FOV_DEGREES = 70;
const MAX_DISTANCE_METERS = 10_000;
const FETCH_LAT = 0.045;
const FETCH_LNG = 0.06;

const tierLabel = (tier: string) => tier === "premium" ? "Premium" : tier === "elite" ? "Elit" : "Dijital";
const tierFallbackPrice = (tier: string) => tier === "premium" ? 699 : tier === "elite" ? 349 : 149;
const screenAngle = () => typeof screen !== "undefined" && screen.orientation ? Number(screen.orientation.angle) || 0 : 0;

function absoluteHeading(event: OrientationEventWithCompass) {
  if (typeof event.webkitCompassHeading === "number" && Number.isFinite(event.webkitCompassHeading)) return event.webkitCompassHeading;
  if (event.absolute && typeof event.alpha === "number" && Number.isFinite(event.alpha)) return (360 - event.alpha + screenAngle() + 360) % 360;
  return null;
}

function relativeAlpha(event: DeviceOrientationEvent) {
  return typeof event.alpha === "number" && Number.isFinite(event.alpha) ? event.alpha : null;
}

export function SkyScanExperience() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastParcelFetch = useRef<GeoPoint | null>(null);
  const relativeBaseAlpha = useRef<number | null>(null);
  const relativeBaseHeading = useRef<number>(0);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [headingMode, setHeadingMode] = useState<"compass" | "motion" | null>(null);
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
      (position) => { setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy }); setLocationError(null); },
      (error) => setLocationError(error.message || "Konum alınamadı."),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (!orientationStarted) return;
    let gotCompass = false;
    let gotMotion = false;
    const onOrientation = (event: DeviceOrientationEvent) => {
      const e = event as OrientationEventWithCompass;
      const compass = absoluteHeading(e);
      if (compass !== null) {
        gotCompass = true;
        setHeading(compass);
        setHeadingMode("compass");
        setOrientationError(null);
        return;
      }
      const alpha = relativeAlpha(event);
      if (alpha === null) return;
      if (relativeBaseAlpha.current === null) {
        relativeBaseAlpha.current = alpha;
        setHeading(0);
        setHeadingMode("motion");
        gotMotion = true;
        setOrientationError(null);
        return;
      }
      if (!gotCompass) {
        const delta = normalizeAngle(alpha - relativeBaseAlpha.current);
        setHeading(normalizeAngle(relativeBaseHeading.current - delta));
        setHeadingMode("motion");
        gotMotion = true;
        setOrientationError(null);
      }
    };
    window.addEventListener("deviceorientationabsolute", onOrientation as EventListener, true);
    window.addEventListener("deviceorientation", onOrientation as EventListener, true);
    const timer = window.setTimeout(() => {
      if (!gotCompass && !gotMotion) setOrientationError("Telefonun yön sensörü veri göndermiyor. Kamera açık; sensör verisi geldiğinde parseller gökyüzüne yerleşecek.");
    }, 3000);
    return () => { window.removeEventListener("deviceorientationabsolute", onOrientation as EventListener, true); window.removeEventListener("deviceorientation", onOrientation as EventListener, true); window.clearTimeout(timer); };
  }, [orientationStarted]);

  useEffect(() => {
    if (!location || !supabaseBrowser) return;
    const previous = lastParcelFetch.current;
    if (previous && distanceMeters(previous, location) < 120) return;
    lastParcelFetch.current = location;
    let alive = true;
    const load = async () => {
      setParcelLoading(true); setParcelError(null);
      const { data, error } = await supabaseBrowser.rpc("sky_scan_parcels", { p_min_lat: location.latitude - FETCH_LAT, p_min_lng: location.longitude - FETCH_LNG, p_max_lat: location.latitude + FETCH_LAT, p_max_lng: location.longitude + FETCH_LNG, p_limit: 80 });
      if (!alive) return;
      if (error) { setParcelError(error.message || "Yakındaki parseller alınamadı."); setNearbyParcels([]); }
      else {
        const rows = (data ?? []) as SkyParcel[];
        setNearbyParcels(rows.map((parcel) => ({ ...parcel, distance: distanceMeters(location, parcel), bearing: bearingDegrees(location, parcel) })).filter((parcel) => parcel.distance <= MAX_DISTANCE_METERS).sort((a, b) => a.distance - b.distance));
      }
      setParcelLoading(false);
    };
    void load();
    return () => { alive = false; };
  }, [location]);

  useEffect(() => () => { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; }, []);

  const requestOrientationPermission = async () => {
    const request = (DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> }).requestPermission;
    if (!request) return true;
    try { return (await request()) === "granted"; } catch { return false; }
  };

  const startScan = async () => {
    setCameraError(null); setCameraReady(false); setOrientationError(null); relativeBaseAlpha.current = null;
    const orientationGranted = await requestOrientationPermission();
    if (!orientationGranted) setOrientationError("Yön sensörü izni verilmedi. Kamera açılacak; sensör izin verildiğinde 3D parseller hareket eder.");
    try {
      if (!window.isSecureContext) throw new Error("Kamera yalnızca HTTPS bağlantısında çalışır.");
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Bu tarayıcı kamera erişimini desteklemiyor.");
      const video = videoRef.current;
      if (!video) throw new Error("Kamera görüntü alanı hazırlanamadı. Sayfayı yenileyip tekrar deneyin.");
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      streamRef.current = stream; video.srcObject = stream; video.muted = true; video.autoplay = true; video.playsInline = true; video.setAttribute("webkit-playsinline", "true");
      setCameraStarted(true); setOrientationStarted(true);
      await new Promise<void>((resolve, reject) => { if (video.readyState >= HTMLMediaElement.HAVE_METADATA) { resolve(); return; } const timeout = window.setTimeout(() => reject(new Error("Kamera görüntüsü zamanında hazır olmadı.")), 8000); video.onloadedmetadata = () => { window.clearTimeout(timeout); resolve(); }; video.onerror = () => { window.clearTimeout(timeout); reject(new Error("Kamera video akışı okunamadı.")); }; });
      await video.play(); setCameraReady(true);
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null;
      const name = error instanceof DOMException ? error.name : "";
      const message = name === "NotAllowedError" ? "Kamera izni verilmedi. Tarayıcı ayarlarından kamera iznini açın." : name === "NotFoundError" ? "Kamera bulunamadı." : name === "NotReadableError" ? "Kamera başka bir uygulama tarafından kullanılıyor." : error instanceof Error ? error.message : "Kamera başlatılamadı.";
      setCameraStarted(false); setCameraReady(false); setCameraError(message);
    }
  };

  const stopScan = () => { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; if (videoRef.current) { videoRef.current.pause(); videoRef.current.srcObject = null; } setCameraStarted(false); setCameraReady(false); setOrientationStarted(false); setHeading(null); setHeadingMode(null); setSelectedParcel(null); relativeBaseAlpha.current = null; };

  const skyParcels = useMemo(() => {
    if (!nearbyParcels.length) return [];
    if (heading === null) return nearbyParcels.slice(0, 12).map((parcel, index) => ({ parcel, angle: (index - 5.5) * 10 }));
    const projected = nearbyParcels.map((parcel) => ({ parcel, angle: normalizeAngle(parcel.bearing - heading) })).filter(({ angle }) => Math.abs(angle) <= CAMERA_FOV_DEGREES / 2).sort((a, b) => a.parcel.distance - b.parcel.distance);
    if (projected.length) return projected.slice(0, 12);
    return nearbyParcels.slice(0, 8).map((parcel, index) => ({ parcel, angle: normalizeAngle((index - 3.5) * 12) }));
  }, [heading, nearbyParcels]);

  const buySelected = () => { if (!selectedParcel || selectedParcel.status !== "available") return; window.location.href = `/parsel-satin-al?parcels=${encodeURIComponent(selectedParcel.id)}`; };
  const nearestParcel = nearbyParcels[0] ?? null;
  const statusText = parcelLoading ? "Parseller taranıyor…" : parcelError ? "Parsel verisi alınamadı" : `${skyParcels.length} parsel gökyüzünde`;

  return <main className="min-h-screen bg-slate-950 text-white"><section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
    <header className="relative z-40 flex items-center gap-3"><a href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">← Geri</a><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">MySkyParcel</p><h1 className="font-display text-xl font-semibold sm:text-2xl">🌌 Gökyüzünü Tara</h1></div></header>
    <div className="relative mt-6 min-h-[72vh] flex-1 overflow-hidden rounded-3xl border border-cyan-300/15 bg-slate-950 shadow-2xl">
      <video ref={videoRef} className={`absolute inset-0 z-0 h-full w-full bg-black object-cover ${cameraStarted ? "block" : "hidden"}`} playsInline muted autoPlay />
      {!cameraStarted && <div className="absolute inset-0 z-20 flex items-center justify-center"><div className="max-w-sm px-6 text-center"><Camera className="mx-auto h-12 w-12 text-cyan-300" /><h2 className="mt-4 text-xl font-semibold">Gerçek gökyüzü parsel taraması</h2><p className="mt-2 text-sm text-white/60">Kamera, konum ve telefon hareket sensörü ile gerçek parselleri gökyüzünde 3D olarak gösterir.</p><button type="button" onClick={startScan} className="mt-6 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-300/20">Kamerayı ve taramayı başlat</button>{locationError && <p className="mt-3 text-xs text-amber-200">{locationError}</p>}</div></div>}
      {cameraStarted && <div className="absolute inset-0 overflow-hidden [perspective:1000px]">
        {!cameraReady && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black"><div className="rounded-2xl border border-cyan-300/20 bg-slate-950/90 px-6 py-5 text-center"><Camera className="mx-auto h-8 w-8 animate-pulse text-cyan-300" /><p className="mt-3 text-sm font-semibold">Kamera görüntüsü hazırlanıyor…</p></div></div>}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center pt-4"><div className="rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs font-semibold backdrop-blur-md">🧭 {heading === null ? "Sensör bekleniyor…" : headingMode === "compass" ? `${heading.toFixed(0)}° · Pusula aktif` : `Hareket sensörü aktif · ${heading.toFixed(0)}°`} · {statusText}</div></div>
        <div className="absolute inset-0 z-20">
          {skyParcels.map(({ parcel, angle }, index) => {
            const left = 50 + (angle / CAMERA_FOV_DEGREES) * 100;
            const top = 24 + ((index * 17) % 44);
            const scale = Math.max(0.62, Math.min(1.18, 1.12 - parcel.distance / 9000));
            const selected = selectedParcel?.id === parcel.id;
            return <button key={parcel.id} type="button" onClick={() => setSelectedParcel(parcel)} className="absolute -translate-x-1/2 -translate-y-1/2 text-left transition-[left,top,transform] duration-200 ease-out [transform-style:preserve-3d] hover:scale-105 active:scale-95" style={{ left: `${Math.max(5, Math.min(95, left))}%`, top: `${top}%`, transform: `translate(-50%, -50%) scale(${scale})` }}>
              <div className="animate-[skyFloat_3.8s_ease-in-out_infinite] [transform-style:preserve-3d]" style={{ animationDelay: `${(index % 5) * -0.7}s` }}>
                <div className={`relative h-20 w-20 [transform:rotateX(12deg)_rotateY(-18deg)_rotateZ(45deg)] [transform-style:preserve-3d] ${selected ? "drop-shadow-[0_0_30px_rgba(251,191,36,.95)]" : "drop-shadow-[0_0_24px_rgba(34,211,238,.75)]"}`}>
                  <div className={`absolute inset-0 rounded-xl border-2 ${selected ? "border-amber-200 bg-amber-300/25" : "border-cyan-200/90 bg-cyan-400/15"} backdrop-blur-sm`} />
                  <div className="absolute inset-[10px] rounded-lg border border-white/60 bg-black/20" />
                  <div className="absolute -inset-1 rounded-xl border border-white/20 opacity-60 [transform:translateZ(12px)]" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 whitespace-nowrap text-[9px] font-black tracking-widest [transform:translateZ(18px)_rotateZ(-45deg)]">SKY</span>
                </div>
                <div className="mt-4 rounded-xl border border-white/20 bg-black/75 px-3 py-2 text-center shadow-xl backdrop-blur-md [transform:translateZ(20px)]"><p className="text-xs font-bold text-cyan-100">✦ {parcel.parcel_number}</p><p className="mt-0.5 text-[10px] text-white/75">{formatDistance(parcel.distance)} · {parcel.bearing.toFixed(0)}°</p></div>
              </div>
            </button>;
          })}
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center p-4"><div className="rounded-2xl border border-white/15 bg-black/75 px-4 py-3 text-center backdrop-blur-md"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Canlı gökyüzü taraması</p><p className="mt-1 text-sm font-semibold">Telefonu yavaşça sağa-sola çevirin</p>{nearestParcel && <p className="mt-1 text-xs text-white/60">En yakın: {nearestParcel.parcel_number} · {formatDistance(nearestParcel.distance)}</p>}</div></div>
        {orientationError && <div className="pointer-events-none absolute left-4 right-4 top-16 z-30 mx-auto max-w-md rounded-xl border border-amber-200/20 bg-black/70 px-3 py-2 text-center text-[11px] text-amber-100 backdrop-blur-md">{orientationError}</div>}
        <button type="button" onClick={stopScan} className="absolute right-4 top-4 z-50 rounded-full border border-white/20 bg-black/60 p-3 backdrop-blur-md" aria-label="Kamerayı kapat"><X className="h-5 w-5" /></button>
        {selectedParcel && <div className="absolute inset-x-4 bottom-20 z-[60] mx-auto max-w-md rounded-3xl border border-cyan-200/20 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:w-[360px]"><button type="button" onClick={() => setSelectedParcel(null)} className="absolute right-3 top-3 rounded-full p-2 text-white/60" aria-label="Detayı kapat"><X className="h-4 w-4" /></button><p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Parsel bulundu</p><h2 className="mt-2 text-xl font-bold">{selectedParcel.parcel_number}</h2><div className="mt-4 grid grid-cols-2 gap-3 text-xs"><div className="rounded-xl bg-white/5 p-3"><MapPin className="h-4 w-4 text-cyan-300" /><p className="mt-1 text-white/60">Konum</p><p className="font-semibold">{selectedParcel.city_name}</p></div><div className="rounded-xl bg-white/5 p-3"><Compass className="h-4 w-4 text-cyan-300" /><p className="mt-1 text-white/60">Yön / mesafe</p><p className="font-semibold">{selectedParcel.bearing.toFixed(0)}° · {formatDistance(selectedParcel.distance)}</p></div></div><div className="mt-3 rounded-xl bg-white/5 p-3"><p className="text-white/60">Paket</p><p className="font-semibold">{tierLabel(selectedParcel.tier)}</p><p className="mt-1 text-cyan-200">₺{Number(selectedParcel.tier_price ?? selectedParcel.price ?? tierFallbackPrice(selectedParcel.tier)).toLocaleString("tr-TR")}</p></div>{selectedParcel.status === "available" && <button type="button" onClick={buySelected} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950"><ShoppingCart className="h-4 w-4" />Satın Al</button>}<p className="mt-3 text-center text-[10px] text-white/40">Parsel seçimi mevcut satın alma sistemine aktarılır.</p></div>}
      </div>}
    </div>
    <style>{`@keyframes skyFloat{0%,100%{transform:translate3d(0,0,0) rotateX(0deg)}50%{transform:translate3d(0,-12px,18px) rotateX(5deg)}}`}</style>
  </section></main>;
}
