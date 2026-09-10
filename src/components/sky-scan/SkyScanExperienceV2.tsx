import { Camera, Compass, MapPin, Navigation, ShoppingCart, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { bearingDegrees, distanceMeters, formatDistance, normalizeAngle, type GeoPoint } from "@/components/sky-scan/geo";

type Parcel = { id: string; parcel_number: string; status: string; price: number | string | null; tier: string; tier_price: number | string | null; city_name: string; city_slug: string; latitude: number; longitude: number };
type Nearby = Parcel & { distance: number; bearing: number };
type OrientationEventEx = DeviceOrientationEvent & { webkitCompassHeading?: number };
const FOV = 70;
const MAX_DISTANCE = 10_000;

const normalizeHeading = (n: number) => ((n % 360) + 360) % 360;
const screenAngle = () => typeof window !== "undefined" && window.screen.orientation ? Number(window.screen.orientation.angle) || 0 : 0;

function getHeading(event: OrientationEventEx) {
  const ios = event.webkitCompassHeading;
  if (typeof ios === "number" && Number.isFinite(ios)) return { value: normalizeHeading(ios), mode: "compass" as const };
  if (typeof event.alpha === "number" && Number.isFinite(event.alpha)) {
    return { value: normalizeHeading(360 - event.alpha + screenAngle()), mode: event.absolute ? "compass" as const : "motion" as const };
  }
  return null;
}

export function SkyScanExperienceV2() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastAlpha = useRef<number | null>(null);
  const relativeHeading = useRef(0);
  const [location, setLocation] = useState<(GeoPoint & { accuracy: number }) | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [parcels, setParcels] = useState<Nearby[]>([]);
  const [loading, setLoading] = useState(false);
  const [parcelError, setParcelError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [headingMode, setHeadingMode] = useState<"compass" | "motion" | null>(null);
  const [sensorState, setSensorState] = useState("Başlatılmadı");
  const [sensorStarted, setSensorStarted] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Nearby | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) { setLocationError("Konum servisi desteklenmiyor."); return; }
    const id = navigator.geolocation.watchPosition(
      p => { setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy }); setLocationError(null); },
      e => setLocationError(e.message || "Konum alınamadı."),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  useEffect(() => {
    if (!location) return;
    let alive = true;
    const run = async () => {
      setLoading(true); setParcelError(null);
      const { data, error } = await supabaseBrowser.rpc("sky_scan_parcels", {
        p_min_lat: location.latitude - 0.045, p_min_lng: location.longitude - 0.06,
        p_max_lat: location.latitude + 0.045, p_max_lng: location.longitude + 0.06, p_limit: 80,
      });
      if (!alive) return;
      if (error) { setParcelError("Yakındaki parseller alınamadı."); setParcels([]); }
      else setParcels(((data ?? []) as Parcel[]).map(p => ({ ...p, distance: distanceMeters(location, p), bearing: bearingDegrees(location, p) })).filter(p => p.distance <= MAX_DISTANCE).sort((a,b) => a.distance-b.distance));
      setLoading(false);
    };
    void run();
    return () => { alive = false; };
  }, [location]);

  const orientationHandler = useCallback((event: DeviceOrientationEvent) => {
    const result = getHeading(event as OrientationEventEx);
    if (result) {
      setHeading(result.value);
      setHeadingMode(result.mode);
      setSensorState(result.mode === "compass" ? "Pusula aktif" : "Hareket sensörü aktif · göreli yön");
      if (typeof event.alpha === "number") lastAlpha.current = event.alpha;
      return;
    }
    if (typeof event.alpha === "number" && Number.isFinite(event.alpha)) {
      if (lastAlpha.current == null) lastAlpha.current = event.alpha;
      else {
        relativeHeading.current = normalizeHeading(relativeHeading.current - normalizeAngle(event.alpha - lastAlpha.current));
        lastAlpha.current = event.alpha;
      }
      setHeading(relativeHeading.current);
      setHeadingMode("motion");
      setSensorState("Hareket sensörü aktif · göreli yön");
    }
  }, []);

  const enableSensors = useCallback(async () => {
    try {
      const DeviceOrientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> };
      if (typeof DeviceOrientation.requestPermission === "function") {
        const result = await DeviceOrientation.requestPermission();
        if (result !== "granted") { setSensorState("Yön sensörü izni verilmedi"); return; }
      }
      lastAlpha.current = null;
      relativeHeading.current = 0;
      window.addEventListener("deviceorientationabsolute", orientationHandler as EventListener, true);
      window.addEventListener("deviceorientation", orientationHandler as EventListener, true);
      setSensorStarted(true);
      setSensorState("Sensör verisi bekleniyor…");
      window.setTimeout(() => setSensorState(current => current === "Sensör verisi bekleniyor…" ? "Sensör olayı alınamadı — telefon/tarayıcı sensör erişimini kontrol edin" : current), 2500);
    } catch {
      setSensorState("Yön sensörüne erişilemedi");
    }
  }, [orientationHandler]);

  useEffect(() => () => {
    window.removeEventListener("deviceorientationabsolute", orientationHandler as EventListener, true);
    window.removeEventListener("deviceorientation", orientationHandler as EventListener, true);
    streamRef.current?.getTracks().forEach(t => t.stop());
  }, [orientationHandler]);

  const startCamera = async () => {
    setCameraError(null); setCameraReady(false);
    try {
      if (!window.isSecureContext) throw new Error("Kamera yalnızca HTTPS bağlantısında çalışır.");
      const video = videoRef.current;
      if (!video) throw new Error("Kamera alanı hazırlanamadı.");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      streamRef.current = stream;
      video.srcObject = stream; video.muted = true; video.playsInline = true;
      await video.play();
      setCameraStarted(true); setCameraReady(true);
      await enableSensors();
    } catch (e) {
      const name = e instanceof DOMException ? e.name : "";
      setCameraError(name === "NotAllowedError" ? "Kamera izni verilmedi." : name === "NotFoundError" ? "Kamera bulunamadı." : name === "NotReadableError" ? "Kamera başka bir uygulama tarafından kullanılıyor." : e instanceof Error ? e.message : "Kamera başlatılamadı.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null;
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.srcObject = null; }
    setCameraStarted(false); setCameraReady(false); setSensorStarted(false); setHeading(null); setHeadingMode(null); setSelected(null); setSensorState("Başlatılmadı");
    window.removeEventListener("deviceorientationabsolute", orientationHandler as EventListener, true);
    window.removeEventListener("deviceorientation", orientationHandler as EventListener, true);
  };

  const skyParcels = useMemo(() => parcels.slice(0, 12).map((parcel, i) => {
    const angle = heading == null ? (i - 5.5) * 10 : normalizeAngle(parcel.bearing - heading);
    return { parcel, angle };
  }).filter(({ angle }) => heading == null || Math.abs(angle) <= FOV / 2), [heading, parcels]);
  const nearest = parcels[0] ?? null;
  const directionTest = nearest ? `${nearest.bearing.toFixed(0)}°` : "—";

  return <main className="min-h-screen bg-slate-950 text-white"><section className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-5 sm:px-6">
    <header className="mb-3 flex items-center gap-3"><a href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm">← Geri</a><div><div className="text-[10px] uppercase tracking-[.2em] text-cyan-300">MySkyParcel</div><h1 className="text-xl font-bold">🌌 Gökyüzünü Tara</h1></div></header>
    <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
      <Card icon={<MapPin/>} title="Konum" value={location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : "Bekleniyor…"} sub={location ? `±${Math.round(location.accuracy)} m` : locationError ?? "GPS bekleniyor"}/>
      <Card icon={<Compass/>} title="Yön" value={heading == null ? "Bekleniyor…" : `${Math.round(heading)}°`} sub={headingMode === "compass" ? "Pusula aktif" : headingMode === "motion" ? "Hareket sensörü" : sensorState}/>
      <Card icon={<Navigation/>} title="Yakındaki parseller" value={loading ? "Yükleniyor…" : `${parcels.length}`} sub={parcelError ?? "10 km tarama alanı"}/>
      <Card icon={<MapPin/>} title="En yakın" value={nearest?.parcel_number ?? "—"} sub={nearest ? formatDistance(nearest.distance) : "Parsel bekleniyor"}/>
      <Card icon={<Compass/>} title="Yön testi" value={directionTest} sub={nearest ? `En yakın parsel` : "—"}/>
    </div>
    {cameraError && <div className="mb-3 rounded-xl border border-red-400/30 bg-red-950/40 p-3 text-sm text-red-200">{cameraError}</div>}
    <div className="relative min-h-[68vh] flex-1 overflow-hidden rounded-3xl border border-cyan-300/20 bg-black shadow-2xl [perspective:1000px]">
      <video ref={videoRef} className={`absolute inset-0 h-full w-full object-cover ${cameraStarted ? "block" : "hidden"}`} playsInline muted autoPlay />
      {!cameraStarted && <div className="absolute inset-0 flex items-center justify-center bg-slate-950 p-6 text-center"><div className="max-w-md"><Camera className="mx-auto h-12 w-12 text-cyan-300"/><h2 className="mt-4 text-xl font-bold">Gerçek gökyüzü taraması</h2><p className="mt-2 text-sm text-white/60">Kamerayı açın. Parsel listesi göstermeden, gerçek parselleri hareket eden 3D objeler olarak gökyüzüne yerleştireceğiz.</p><button onClick={startCamera} className="mt-5 rounded-xl bg-cyan-300 px-5 py-3 font-bold text-slate-950">Kamera + sensörleri başlat</button></div></div>}
      {cameraStarted && <>
        {!cameraReady && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">Kamera görüntüsü hazırlanıyor…</div>}
        <div className="pointer-events-none absolute left-3 right-3 top-3 z-40 flex justify-center"><div className="rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs font-semibold backdrop-blur">🧭 {heading == null ? sensorState : `${Math.round(heading)}° · ${headingMode === "compass" ? "Pusula" : "Hareket"}`} · {skyParcels.length} parsel</div></div>
        {skyParcels.map(({ parcel, angle }, i) => <button key={parcel.id} onClick={() => setSelected(parcel)} className="absolute z-20 -translate-x-1/2 -translate-y-1/2 text-left transition-all duration-200" style={{ left: `${Math.max(5, Math.min(95, 50 + angle / FOV * 100))}%`, top: `${25 + (i * 17) % 45}%` }}><div className="animate-[skyFloat_3.8s_ease-in-out_infinite] [transform-style:preserve-3d]" style={{ animationDelay: `${-i * .5}s` }}><div className="relative h-20 w-20 rotate-45 rounded-xl border-2 border-cyan-200/90 bg-cyan-400/15 shadow-[0_0_28px_rgba(34,211,238,.7)] backdrop-blur-sm"><span className="absolute inset-0 flex -rotate-45 items-center justify-center text-[9px] font-black">SKY</span></div><div className="mt-3 -rotate-0 rounded-xl border border-white/20 bg-black/75 px-2 py-1 text-center backdrop-blur"><div className="text-[10px] font-bold text-cyan-100">✦ {parcel.parcel_number}</div><div className="text-[9px] text-white/70">{formatDistance(parcel.distance)} · {Math.round(parcel.bearing)}°</div></div></div></button>)}
        <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-40 rounded-2xl border border-white/15 bg-black/65 p-3 text-center backdrop-blur"><div className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Canlı gökyüzü taraması</div><div className="mt-1 text-sm font-semibold">Telefonu yavaşça sağa-sola çevirin</div><div className="mt-1 text-xs text-white/60">En yakın: {nearest ? `${nearest.parcel_number} · ${formatDistance(nearest.distance)}` : "—"}</div></div>
        <button onClick={stopCamera} className="absolute right-3 top-3 z-50 rounded-full border border-white/20 bg-black/60 p-3"><X className="h-5 w-5"/></button>
        {selected && <div className="absolute bottom-20 right-3 z-[60] w-[min(360px,calc(100%-24px))] rounded-2xl border border-cyan-300/20 bg-slate-950/95 p-4 shadow-2xl backdrop-blur"><button onClick={() => setSelected(null)} className="absolute right-2 top-2"><X className="h-4 w-4"/></button><div className="text-xs uppercase text-cyan-300">Parsel bulundu</div><div className="mt-1 text-lg font-bold">{selected.parcel_number}</div><div className="mt-2 text-xs text-white/60">{selected.city_name} · {formatDistance(selected.distance)} · {Math.round(selected.bearing)}°</div><div className="mt-3 text-sm">{selected.tier} · ₺{Number(selected.tier_price ?? selected.price ?? 0).toLocaleString("tr-TR")}</div>{selected.status === "available" && <button onClick={() => window.location.href = `/parsel-satin-al?parcels=${encodeURIComponent(selected.id)}`} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 font-bold text-slate-950"><ShoppingCart className="h-4 w-4"/>Satın Al</button>}</div>}
      </>}
    </div>
    <style>{`@keyframes skyFloat{0%,100%{transform:translate3d(0,0,0) rotateX(0deg)}50%{transform:translate3d(0,-12px,18px) rotateX(5deg)}}`}</style>
  </section></main>;
}

function Card({ icon, title, value, sub }: { icon: React.ReactNode; title: string; value: string; sub: string }) {
  return <div className="min-h-[76px] rounded-xl border border-white/10 bg-white/[.045] p-2.5"><div className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-400">{icon}{title}</div><div className="mt-1 truncate text-sm font-semibold">{value}</div><div className="truncate text-[10px] text-slate-500">{sub}</div></div>;
}
