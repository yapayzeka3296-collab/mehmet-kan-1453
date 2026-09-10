import { Camera, Compass, MapPin, Navigation, X, ShoppingCart, LocateFixed } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { bearingDegrees, distanceMeters, formatDistance, normalizeAngle, type GeoPoint } from "@/components/sky-scan/geo";

type LocationState = GeoPoint & { accuracy: number };
type SkyParcel = {
  id: string;
  parcel_number: string;
  status: "available" | "reserved" | "sold" | string;
  price: number | string | null;
  tier: string;
  tier_price: number | string | null;
  city_name: string;
  city_slug: string;
  latitude: number;
  longitude: number;
};
type NearbyParcel = SkyParcel & { distance: number; bearing: number };

const CAMERA_FOV_DEGREES = 70;
const MAX_DISTANCE_METERS = 10_000;
const tierLabel = (tier: string) => tier === "premium" ? "Premium" : tier === "elite" ? "Elit" : "Dijital";
const tierFallbackPrice = (tier: string) => tier === "premium" ? 999 : tier === "elite" ? 499 : 199;

export function SkyScanExperience() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastParcelFetch = useRef<GeoPoint | null>(null);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [orientationStarted, setOrientationStarted] = useState(false);
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
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const webkitHeading = (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
      const alpha = event.alpha;
      const nextHeading = typeof webkitHeading === "number" ? webkitHeading : typeof alpha === "number" ? (360 - alpha + 360) % 360 : null;
      if (nextHeading !== null && Number.isFinite(nextHeading)) setHeading(nextHeading);
    };
    window.addEventListener("deviceorientation", handleOrientation, true);
    return () => window.removeEventListener("deviceorientation", handleOrientation, true);
  }, [orientationStarted]);

  useEffect(() => {
    if (!location || !supabaseBrowser) return;
    const previous = lastParcelFetch.current;
    if (previous && distanceMeters(previous, location) < 120) return;
    lastParcelFetch.current = location;
    let alive = true;
    const load = async () => {
      setParcelLoading(true); setParcelError(null);
      const { data, error } = await supabaseBrowser.rpc("sky_scan_parcels", { p_min_lat: location.latitude - 0.045, p_min_lng: location.longitude - 0.06, p_max_lat: location.latitude + 0.045, p_max_lng: location.longitude + 0.06, p_limit: 80 });
      if (!alive) return;
      if (error) { setParcelError(error.message || "Yakındaki parseller alınamadı."); setNearbyParcels([]); }
      else { const rows = (data ?? []) as SkyParcel[]; setNearbyParcels(rows.map((parcel) => ({ ...parcel, distance: distanceMeters(location, parcel), bearing: bearingDegrees(location, parcel) })).sort((a, b) => a.distance - b.distance)); }
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
    setCameraError(null); setCameraReady(false);
    const orientationGranted = await requestOrientationPermission();
    if (!orientationGranted) { setCameraError("Yön sensörü izni verilmedi. Telefon ayarlarından sensör iznini açıp tekrar deneyin."); return; }
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

  const stopScan = () => { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; if (videoRef.current) { videoRef.current.pause(); videoRef.current.srcObject = null; } setCameraStarted(false); setCameraReady(false); setOrientationStarted(false); setSelectedParcel(null); };
  const nearestParcel = nearbyParcels[0] ?? null;
  const visibleParcels = useMemo(() => heading === null ? [] : nearbyParcels.map((parcel) => ({ parcel, angle: normalizeAngle(parcel.bearing - heading) })).filter(({ parcel, angle }) => Math.abs(angle) <= CAMERA_FOV_DEGREES / 2 && parcel.distance <= MAX_DISTANCE_METERS).sort((a, b) => a.parcel.distance - b.parcel.distance).slice(0, 12), [heading, nearbyParcels]);
  const buySelected = () => { if (!selectedParcel || selectedParcel.status !== "available") return; window.location.href = `/parsel-satin-al?parcels=${encodeURIComponent(selectedParcel.id)}`; };

  return <main className="min-h-screen bg-slate-950 text-white"><section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col overflow-hidden px-4 py-6 sm:px-6 lg:px-8"><header className="relative z-30 flex items-center gap-3"><a href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80">← Geri</a><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">MySkyParcel</p><h1 className="font-display text-xl font-semibold sm:text-2xl">🌌 Gökyüzünü Tara</h1></div></header><div className="relative mt-6 min-h-[72vh] flex-1 overflow-hidden rounded-3xl border border-cyan-300/15 bg-slate-950 shadow-2xl"><video ref={videoRef} className={`absolute inset-0 z-0 h-full w-full bg-black object-cover ${cameraStarted ? "block" : "hidden"}`} playsInline muted autoPlay />{cameraStarted ? <div className="absolute inset-0 overflow-hidden">{!cameraReady && <div className="absolute inset-0 z-40 flex items-center justify-center bg-black"><div className="rounded-2xl border border-cyan-300/20 bg-slate-950/90 px-6 py-5 text-center"><Camera className="mx-auto h-8 w-8 animate-pulse text-cyan-300" /><p className="mt-3 text-sm font-semibold">Kamera görüntüsü hazırlanıyor…</p></div></div>}<div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center pt-4"><div className="rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-semibold backdrop-blur-md">🧭 {heading === null ? "Yön algılanıyor…" : `${heading.toFixed(0)}°`} · {visibleParcels.length} parsel</div></div><div className="absolute inset-0 z-20">{visibleParcels.map(({ parcel, angle }) => { const leftPercent = 50 + (angle / CAMERA_FOV_DEGREES) * 100; const selected = selectedParcel?.id === parcel.id; return <button key={parcel.id} type="button" onClick={() => setSelectedParcel(parcel)} className="absolute -translate-x-1/2 text-left transition-all duration-150 active:scale-95" style={{ left: `${leftPercent}%`, top: "38%" }} aria-label={`${parcel.parcel_number} parselini görüntüle`}><div className="flex flex-col items-center"><div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 ${selected ? "border-amber-200 bg-amber-300/30 shadow-[0_0_35px_rgba(251,191,36,.9)]" : "border-cyan-200/80 bg-cyan-400/20 shadow-[0_0_30px_rgba(34,211,238,.65)]"} backdrop-blur-sm`}><div className="absolute inset-2 rotate-45 rounded-lg border border-white/70" /><span className="relative text-[9px] font-black tracking-wider">SKY</span></div><div className="mt-2 whitespace-nowrap rounded-xl border border-white/20 bg-black/70 px-3 py-2 text-center shadow-xl backdrop-blur-md"><p className="text-xs font-bold text-cyan-100">✦ {parcel.parcel_number}</p><p className="mt-0.5 text-[10px] text-white/75">{formatDistance(parcel.distance)} · {parcel.bearing.toFixed(0)}°</p></div></div></button>; })}</div><div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center p-4"><div className="rounded-2xl border border-white/15 bg-black/70 px-4 py-3 text-center backdrop-blur-md"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Canlı tarama</p><p className="mt-1 text-sm font-semibold">{visibleParcels.length ? "Parseller görüş alanında" : "Telefonu yavaşça sağa-sola çevirin"}</p>{nearestParcel && <p className="mt-1 text-xs text-white/60">En yakın: {nearestParcel.parcel_number} · {formatDistance(nearestParcel.distance)}</p>}</div></div><button type="button" onClick={stopScan} className="absolute right-4 top-4 z-40 rounded-full border border-white/20 bg-black/60 p-3 backdrop-blur-md" aria-label="Kamerayı kapat"><X className="h-5 w-5" /></button>{selectedParcel && <div className="absolute inset-x-4 bottom-20 z-50 mx-auto max-w-md rounded-3xl border border-cyan-200/20 bg-slate-950/95 p-5 shadow-2xl backdrop-blur-xl sm:inset-x-auto sm:right-5 sm:w-[360px]"><button type="button" onClick={() => setSelectedParcel(null)} className="absolute right-3 top-3 rounded-full p-2 text-white/60 hover:bg-white/10" aria-label="Detayı kapat"><X className="h-4 w-4" /></button><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">PARSEL BULUNDU!</p><h2 className="mt-1 pr-8 text-xl font-bold">{selectedParcel.parcel_number}</h2><div className="mt-4 grid grid-cols-2 gap-2 text-xs"><Info label="Şehir" value={selectedParcel.city_name} /><Info label="Mesafe" value={formatDistance(selectedParcel.distance)} /><Info label="Yön" value={`${selectedParcel.bearing.toFixed(0)}°`} /><Info label="Paket" value={tierLabel(selectedParcel.tier)} /></div><div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-[10px] uppercase tracking-wider text-white/45">Fiyat</p><p className="mt-1 text-2xl font-bold text-cyan-200">{Number(selectedParcel.tier_price ?? selectedParcel.price ?? tierFallbackPrice(selectedParcel.tier)).toLocaleString("tr-TR")} TL</p></div>{selectedParcel.status === "available" ? <button type="button" onClick={buySelected} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-400/20"><ShoppingCart className="h-5 w-5" /> Satın Al</button> : <div className="mt-4 rounded-2xl bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-200">{selectedParcel.status === "sold" ? "Bu parsel satıldı" : "Bu parsel şu anda rezerve"}</div>}<p className="mt-3 text-center text-[10px] text-white/40">Satın alma işlemi mevcut MySkyParcel akışına aktarılır.</p></div>}</div> : <div className="relative flex min-h-[72vh] items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-5 py-10"><div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center"><div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300"><Camera className="h-9 w-9" /></div><h2 className="text-2xl font-semibold sm:text-3xl">Gerçek parsel taraması</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/60">Kamerayı açın; GPS ve pusula ile gerçek parselleri baktığınız yönde görün.</p><div className="mt-7 grid w-full gap-3 text-left sm:grid-cols-2"><StatusCard icon={<MapPin className="h-4 w-4" />} label="Konum" value={location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)} · ±${Math.round(location.accuracy)} m` : locationError ? "İzin bekleniyor" : "Alınıyor…"} /><StatusCard icon={<Compass className="h-4 w-4" />} label="Yön" value={heading === null ? "Başlatılmadı" : `${heading.toFixed(0)}°`} /><StatusCard icon={<Navigation className="h-4 w-4" />} label="Yakındaki parseller" value={parcelLoading ? "Taranıyor…" : `${nearbyParcels.length} parsel`} /><StatusCard icon={<LocateFixed className="h-4 w-4" />} label="En yakın" value={nearestParcel ? `${nearestParcel.parcel_number} · ${formatDistance(nearestParcel.distance)}` : "Parsel bekleniyor"} /></div>{locationError && <p className="mt-4 w-full rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-xs text-amber-200">{locationError}</p>}{parcelError && <p className="mt-4 w-full rounded-xl border border-red-300/20 bg-red-300/5 px-4 py-3 text-xs text-red-200">{parcelError}</p>}{cameraError && <p className="mt-4 w-full rounded-xl border border-red-300/20 bg-red-300/5 px-4 py-3 text-xs text-red-200">{cameraError}</p>}<button type="button" onClick={startScan} className="mt-7 flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950 shadow-lg shadow-cyan-400/20"><Camera className="h-5 w-5" /> Kamerayı ve taramayı başlat</button></div></div>}</div></section></main>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/10 bg-white/5 p-3"><p className="text-[9px] uppercase tracking-wider text-white/40">{label}</p><p className="mt-1 font-semibold text-white/90">{value}</p></div>; }
function StatusCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-cyan-300">{icon}</div><div className="min-w-0"><p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p><p className="mt-1 truncate text-sm font-semibold">{value}</p></div></div>; }
