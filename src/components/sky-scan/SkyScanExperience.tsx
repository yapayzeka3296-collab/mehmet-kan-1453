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
  const relativeBaseHeading = useRef(0);
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
        return;
      }
      const alpha = relativeAlpha(event);
      if (alpha === null) return;
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
    };
    window.addEventListener("deviceorientationabsolute", onOrientation as EventListener, true);
    window.addEventListener("deviceorientation", onOrientation as EventListener, true);
    const timer = window.setTimeout(() => { if (!gotSensor) setOrientationError("Telefon yön sensörü veri göndermiyor — tarayıcı sensör iznini kontrol edin."); }, 3500);
    return () => {
      window.removeEventListener("deviceorientationabsolute", onOrientation as EventListener, true);
      window.removeEventListener("deviceorientation", onOrientation as EventListener, true);
      window.clearTimeout(timer);
    };
  }, [orientationStarted]);

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
    const request = (DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> }).requestPermission;
    if (!request) return true;
    try { return (await request()) === "granted"; } catch { return false; }
  };

  const startScan = async () => {
    setCameraError(null); setCameraReady(false); setOrientationError(null); relativeBaseAlpha.current = null;
    const orientationGranted = await requestOrientationPermission();
    if (!orientationGranted) setOrientationError("Yön sensörü izni verilmedi. Kamera çalışacak; izin verildiğinde parseller gerçek yöne göre hareket eder.");
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
    setCameraStarted(false); setCameraReady(false); setOrientationStarted(false); setHeading(null); setHeadingMode(null); setSelectedParcel(null); relativeBaseAlpha.current = null;
  };

  const skyParcels = useMemo(() => {
    if (!nearbyParcels.length) return [] as Array<{ parcel: NearbyParcel; angle: number }>;
    if (heading === null) return nearbyParcels.slice(0, 12).map((parcel, index) => ({ parcel, angle: (index - 5.5) * 10 }));
    const projected = nearbyParcels
      .map((parcel) => ({ parcel, angle: normalizeAngle(parcel.bearing - heading) }))
      .filter(({ angle }) => Math.abs(angle) <= CAMERA_FOV_DEGREES / 2)
      .sort((a, b) => a.parcel.distance - b.parcel.distance);
    return projected.length ? projected.slice(0, 12) : nearbyParcels.slice(0, 8).map((parcel, index) => ({ parcel, angle: (index - 3.5) * 12 }));
  }, [heading, nearbyParcels]);

  const nearestParcel = nearbyParcels[0] ?? null;
  const statusText = parcelLoading ? "Parseller taranıyor…" : parcelError ? "Parsel verisi alınamadı" : `${skyParcels.length} parsel gökyüzünde`;
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

        {!cameraStarted && <div className="absolute inset-0 z-20 flex items-center justify-center"><div className="max-w-sm px-6 text-center"><Camera className="mx-auto h-12 w-12 text-cyan-300" /><h2 className="mt-4 text-xl font-semibold">Gerçek gökyüzü parsel taraması</h2><p className="mt-2 text-sm text-white/60">Kamera, konum ve telefon hareket sensörü ile gerçek parselleri gökyüzünde 3D olarak gösterir.</p><button type="button" onClick={startScan} className="mt-6 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-300/20">Kamerayı ve taramayı başlat</button>{locationError && <p className="mt-3 text-xs text-amber-200">{locationError}</p>}</div></div>}

        {cameraStarted && <>
          <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(2,6,23,0.08)_55%,rgba(2,6,23,0.58)_100%)]" />
          {!cameraReady && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black"><div className="rounded-2xl border border-cyan-300/20 bg-slate-950/90 px-6 py-5 text-center"><Camera className="mx-auto h-8 w-8 animate-pulse text-cyan-300" /><p className="mt-3 text-sm font-semibold">Kamera görüntüsü hazırlanıyor…</p></div></div>}

          <div className="absolute left-3 right-3 top-3 z-30 flex flex-wrap justify-center gap-2 sm:justify-between">
            <div className="rounded-full border border-white/20 bg-black/65 px-4 py-2 text-xs font-semibold backdrop-blur-md">🧭 {heading === null ? "Sensör bekleniyor…" : headingMode === "compass" ? `${heading.toFixed(0)}° · Pusula aktif` : `Hareket sensörü · ${heading.toFixed(0)}°`}</div>
            <div className="rounded-full border border-white/20 bg-black/65 px-4 py-2 text-xs font-semibold backdrop-blur-md">{statusText}</div>
          </div>

          <div className="absolute left-3 right-3 top-16 z-30 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <InfoCard icon={<MapPin className="h-3.5 w-3.5" />} title="Konum" value={location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : "Bekleniyor"} sub={location ? `±${Math.round(location.accuracy)} m` : "GPS"} />
            <InfoCard icon={<Compass className="h-3.5 w-3.5" />} title="Yön" value={heading === null ? "—" : `${Math.round(heading)}°`} sub={headingMode === "compass" ? "Pusula" : headingMode === "motion" ? "Hareket" : "Sensör"} />
            <InfoCard icon={<MapPin className="h-3.5 w-3.5" />} title="Yakındaki parseller" value={`${nearbyParcels.length}`} sub="10 km tarama alanı" />
            <InfoCard icon={<NavigationIcon />} title="En yakın" value={nearestParcel?.parcel_number ?? "—"} sub={nearestParcel ? formatDistance(nearestParcel.distance) : "Bekleniyor"} />
            <InfoCard icon={<Compass className="h-3.5 w-3.5" />} title="Yön testi" value={nearestParcel ? `${Math.round(nearestParcel.bearing)}°` : "—"} sub="En yakın parsel" />
          </div>

          {orientationError && <div className="absolute left-3 right-3 top-[166px] z-30 mx-auto max-w-xl rounded-xl border border-amber-300/25 bg-black/65 px-3 py-2 text-center text-[11px] text-amber-100 backdrop-blur-md sm:top-[132px]">{orientationError}</div>}

          <div className="absolute inset-0 z-20 overflow-hidden [perspective:1400px]">
            {skyParcels.map(({ parcel, angle }, index) => {
              const distanceRatio = Math.min(1, parcel.distance / MAX_DISTANCE_METERS);
              const scale = 1.38 - distanceRatio * 0.92;
              const opacity = 1 - distanceRatio * 0.45;
              const left = 50 + (angle / CAMERA_FOV_DEGREES) * 100;
              const top = 42 + ((index * 23) % 28) - distanceRatio * 8;
              const z = Math.round((1 - distanceRatio) * 520);
              const tilt = -18 + (index % 5) * 9;
              const selected = selectedParcel?.id === parcel.id;
              return <button key={parcel.id} type="button" onClick={() => setSelectedParcel(parcel)} className="absolute -translate-x-1/2 -translate-y-1/2 text-left [transform-style:preserve-3d] transition-[left,top] duration-300 ease-out" style={{ left: `${Math.max(4, Math.min(96, left))}%`, top: `${Math.max(25, Math.min(75, top))}%`, opacity }}>
                <div className="[transform-style:preserve-3d] animate-[skyFloat_4.5s_ease-in-out_infinite]" style={{ animationDelay: `${(index % 6) * -0.65}s`, transform: `translateZ(${z}px) scale(${scale})` }}>
                  <div className="relative [transform-style:preserve-3d]" style={{ transform: `rotateX(${10 + distanceRatio * 18}deg) rotateY(${tilt}deg) rotateZ(${index % 2 ? 3 : -3}deg)` }}>
                    <div className={`relative h-20 w-28 rounded-xl border-2 bg-slate-950/35 backdrop-blur-[1px] ${selected ? "border-amber-300 shadow-[0_0_42px_rgba(251,191,36,0.95)]" : "border-cyan-300/80 shadow-[0_0_32px_rgba(34,211,238,0.7)]"}`}>
                      <div className="absolute -inset-3 rounded-2xl border border-cyan-200/20" />
                      <div className="absolute inset-1 rounded-lg border border-white/10" />
                      <div className="relative px-2 pt-2 text-[10px] font-bold text-cyan-100">✦ SKY</div>
                      <div className="relative px-2 text-[11px] font-bold text-white">{parcel.parcel_number}</div>
                      <div className="relative px-2 pt-1 text-[10px] text-white/85">{formatDistance(parcel.distance)} · {Math.round(parcel.bearing)}°</div>
                      <div className="absolute -bottom-2 left-1/2 h-1 w-1/2 -translate-x-1/2 rounded-full bg-cyan-300/70 blur-[3px]" />
                    </div>
                    <div className="absolute left-1/2 top-full h-16 w-px -translate-x-1/2 bg-gradient-to-b from-cyan-300/45 to-transparent" />
                    <div className="absolute left-1/2 top-[calc(100%+4rem)] h-1.5 w-14 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-md" />
                  </div>
                </div>
              </button>;
            })}
          </div>

          <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-30 rounded-2xl border border-white/10 bg-black/60 p-3 text-center backdrop-blur-md">
            <div className="text-sm font-semibold text-cyan-100">Canlı gökyüzü taraması</div>
            <div className="mt-1 text-xs text-white/70">Telefonu yavaşça sağa-sola çevirin · yakın parseller daha büyük, uzak parseller daha küçük görünür</div>
            <div className="mt-1 text-xs text-white/80">En yakın: {nearestParcel ? `${nearestParcel.parcel_number} · ${formatDistance(nearestParcel.distance)}` : "—"}</div>
          </div>
        </>}
      </div>

      {cameraError && <div className="mt-3 rounded-xl border border-red-400/30 bg-red-950/30 p-3 text-sm text-red-200">{cameraError}</div>}

      {selectedParcel && <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-2xl border border-cyan-300/30 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3"><div><div className="text-lg font-bold">{selectedParcel.parcel_number}</div><div className="text-xs text-slate-400">{selectedParcel.city_name} · {formatDistance(selectedParcel.distance)} · {Math.round(selectedParcel.bearing)}°</div></div><button type="button" onClick={() => setSelectedParcel(null)} className="rounded-lg p-1 text-slate-400"><X className="h-5 w-5" /></button></div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-white/5 p-2">Paket<br /><b>{tierLabel(selectedParcel.tier)}</b></div><div className="rounded-lg bg-white/5 p-2">Fiyat<br /><b>{selectedParcel.price ?? selectedParcel.tier_price ?? tierFallbackPrice(selectedParcel.tier)} ₺</b></div></div>
        {selectedParcel.status === "available" ? <button type="button" onClick={buySelected} className="mt-3 w-full rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950"><ShoppingCart className="mr-2 inline h-4 w-4" />Satın Al</button> : <div className="mt-3 rounded-xl bg-white/5 p-3 text-center text-sm text-slate-400">Bu parsel şu anda satın alınabilir değil.</div>}
      </div>}
    </section>
    <style>{`@keyframes skyFloat{0%,100%{transform:translate3d(0,0,0) rotateX(0deg)}50%{transform:translate3d(0,-13px,28px) rotateX(2deg)}}`}</style>
  </main>;
}

function NavigationIcon() { return <NavigationDot />; }
function NavigationDot() { return <span className="inline-block h-3.5 w-3.5 rounded-full border border-cyan-300/60" />; }

function InfoCard({ icon, title, value, sub }: { icon: React.ReactNode; title: string; value: string; sub: string }) {
  return <div className="min-h-[62px] rounded-xl border border-white/10 bg-black/50 p-2 backdrop-blur-md"><div className="flex items-center gap-1 text-[9px] uppercase tracking-wide text-slate-400">{icon}{title}</div><div className="mt-0.5 truncate text-xs font-semibold text-white">{value}</div><div className="truncate text-[9px] text-slate-500">{sub}</div></div>;
}
