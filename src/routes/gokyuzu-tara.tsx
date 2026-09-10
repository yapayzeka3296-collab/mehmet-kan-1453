import { createFileRoute } from "@tanstack/react-router";
import { Camera, Compass, MapPin, Navigation, RefreshCw, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { bearingDegrees, distanceMeters, formatDistance, normalizeAngle, type GeoPoint } from "@/components/sky-scan/geo";

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanPage });

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

function SkyScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [orientationStarted, setOrientationStarted] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [nearbyParcels, setNearbyParcels] = useState<NearbyParcel[]>([]);
  const [parcelLoading, setParcelLoading] = useState(false);
  const [parcelError, setParcelError] = useState<string | null>(null);
  const lastParcelFetch = useRef<GeoPoint | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Bu cihaz konum bilgisini desteklemiyor.");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy });
        setLocationError(null);
      },
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
      const nextHeading = typeof webkitHeading === "number" ? webkitHeading : typeof alpha === "number" ? (360 - alpha) % 360 : null;
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
    const loadNearbyParcels = async () => {
      setParcelLoading(true);
      setParcelError(null);
      const latRadius = 0.045;
      const lngRadius = 0.06;
      const { data, error } = await supabaseBrowser.rpc("sky_scan_parcels", {
        p_min_lat: location.latitude - latRadius,
        p_min_lng: location.longitude - lngRadius,
        p_max_lat: location.latitude + latRadius,
        p_max_lng: location.longitude + lngRadius,
        p_limit: 80,
      });
      if (!alive) return;
      if (error) {
        setParcelError(error.message || "Yakındaki parseller alınamadı.");
        setNearbyParcels([]);
      } else {
        const rows = (data ?? []) as SkyParcel[];
        const mapped = rows
          .map((parcel) => ({
            ...parcel,
            distance: distanceMeters(location, parcel),
            bearing: bearingDegrees(location, parcel),
          }))
          .sort((a, b) => a.distance - b.distance);
        setNearbyParcels(mapped);
      }
      setParcelLoading(false);
    };
    void loadNearbyParcels();
    return () => {
      alive = false;
    };
  }, [location]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const requestOrientationPermission = async () => {
    const permissionRequest = (DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> }).requestPermission;
    if (!permissionRequest) return true;
    try {
      return (await permissionRequest()) === "granted";
    } catch {
      return false;
    }
  };

  const startScan = async () => {
    setCameraError(null);
    const orientationGranted = await requestOrientationPermission();
    if (!orientationGranted) {
      setCameraError("Yön sensörü izni verilmedi. Telefon ayarlarından sensör iznini açıp tekrar deneyin.");
      return;
    }

    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Bu tarayıcı kamera erişimini desteklemiyor.");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraStarted(true);
      setOrientationStarted(true);
    } catch (error) {
      const message = error instanceof DOMException && error.name === "NotAllowedError"
        ? "Kamera izni verilmedi. Tarama için kamera iznini açın."
        : error instanceof Error ? error.message : "Kamera başlatılamadı.";
      setCameraError(message);
    }
  };

  const stopScan = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraStarted(false);
  };

  const nearestParcel = nearbyParcels[0] ?? null;
  const nearestAngle = heading !== null && nearestParcel ? normalizeAngle(nearestParcel.bearing - heading) : null;
  const visibleParcels = heading === null ? [] : nearbyParcels
    .map((parcel) => ({ parcel, angle: normalizeAngle(parcel.bearing - heading) }))
    .filter(({ parcel, angle }) => Math.abs(angle) <= CAMERA_FOV_DEGREES / 2 && parcel.distance <= 10_000)
    .sort((a, b) => a.parcel.distance - b.parcel.distance)
    .slice(0, 12);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative z-30 flex items-center gap-3">
          <a href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10">← Geri</a>
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">MySkyParcel</p><h1 className="font-display text-xl font-semibold sm:text-2xl">🌌 Gökyüzünü Tara</h1></div>
        </header>

        <div className="relative mt-6 min-h-[72vh] flex-1 overflow-hidden rounded-3xl border border-cyan-300/15 bg-slate-950 shadow-2xl">
          {cameraStarted ? (
            <div className="absolute inset-0 bg-black">
              <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted autoPlay />
              <div className="absolute inset-0 bg-black/10" />

              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center pt-4">
                <div className="rounded-full border border-white/20 bg-black/45 px-4 py-2 text-xs font-semibold backdrop-blur-md">
                  🧭 {heading === null ? "Yön algılanıyor…" : `${heading.toFixed(0)}°`} · {visibleParcels.length} parsel görüş alanında
                </div>
              </div>

              <div className="pointer-events-none absolute inset-0 z-10">
                {visibleParcels.map(({ parcel, angle }) => {
                  const leftPercent = 50 + (angle / CAMERA_FOV_DEGREES) * 100;
                  return (
                    <div key={parcel.id} className="absolute top-[38%] -translate-x-1/2 transition-all duration-150" style={{ left: `${leftPercent}%` }}>
                      <div className="flex flex-col items-center">
                        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-cyan-200/80 bg-cyan-400/20 shadow-[0_0_30px_rgba(34,211,238,0.65)] backdrop-blur-sm">
                          <div className="absolute inset-2 rotate-45 rounded-lg border border-white/70" />
                          <span className="relative text-[9px] font-black tracking-wider">SKY</span>
                        </div>
                        <div className="mt-2 whitespace-nowrap rounded-xl border border-white/20 bg-black/65 px-3 py-2 text-center shadow-xl backdrop-blur-md">
                          <p className="text-xs font-bold text-cyan-100">✦ {parcel.parcel_number}</p>
                          <p className="mt-0.5 text-[10px] text-white/75">{formatDistance(parcel.distance)} · {parcel.bearing.toFixed(0)}°</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center p-4">
                <div className="rounded-2xl border border-white/15 bg-black/60 px-4 py-3 text-center backdrop-blur-md">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Canlı tarama</p>
                  <p className="mt-1 text-sm font-semibold">{visibleParcels.length ? "Parseller görüş alanında" : "Telefonu yavaşça sağa-sola çevirin"}</p>
                  {nearestParcel && <p className="mt-1 text-xs text-white/60">En yakın: {nearestParcel.parcel_number} · {formatDistance(nearestParcel.distance)}</p>}
                </div>
              </div>

              <button type="button" onClick={stopScan} className="absolute right-4 top-4 z-30 rounded-full border border-white/20 bg-black/50 p-3 backdrop-blur-md" aria-label="Kamerayı kapat"><X className="h-5 w-5" /></button>
            </div>
          ) : (
            <div className="relative flex min-h-[72vh] items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 px-5 py-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.10),transparent_42%)]" />
              <div className="relative z-10 flex w-full max-w-2xl flex-col items-center text-center">
                <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300 shadow-lg shadow-cyan-950/40"><Camera className="h-9 w-9" /></div>
                <h2 className="text-2xl font-semibold sm:text-3xl">Gerçek parsel taraması</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">Kamera görüntüsü açılacak ve GPS ile bulunan gerçek parseller telefonun baktığı yöne göre ekranın üzerine yerleştirilecek. Bu özellik mevcut harita ve satın alma akışından bağımsız çalışır.</p>

                <div className="mt-7 grid w-full gap-3 text-left sm:grid-cols-2">
                  <StatusCard icon={<MapPin className="h-4 w-4" />} label="Konum" value={location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)} · ±${Math.round(location.accuracy)} m` : locationError ? "İzin bekleniyor" : "Alınıyor…"} />
                  <StatusCard icon={<Compass className="h-4 w-4" />} label="Yön" value={heading === null ? "Başlatılmadı" : `${heading.toFixed(0)}°`} />
                  <StatusCard icon={<Navigation className="h-4 w-4" />} label="Yakındaki parseller" value={parcelLoading ? "Taranıyor…" : `${nearbyParcels.length} parsel`} />
                  <StatusCard icon={<Navigation className="h-4 w-4" />} label="En yakın" value={nearestParcel ? `${nearestParcel.parcel_number} · ${formatDistance(nearestParcel.distance)} · ${nearestParcel.bearing.toFixed(0)}°` : "Parsel bekleniyor"} />
                </div>

                {nearestParcel && heading !== null && <div className="mt-4 w-full rounded-2xl border border-cyan-300/15 bg-cyan-300/5 px-4 py-3 text-left text-xs text-cyan-100"><div className="font-semibold">Yön testi</div><div className="mt-1 text-white/55">{nearestParcel.parcel_number} hedefi telefon yönüne göre {nearestAngle !== null && nearestAngle > 0 ? "+" : ""}{nearestAngle?.toFixed(0)}° açıda.</div></div>}
                {locationError && <p className="mt-4 w-full rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-xs text-amber-200">{locationError}</p>}
                {parcelError && <p className="mt-4 w-full rounded-xl border border-red-300/20 bg-red-300/5 px-4 py-3 text-xs text-red-200">{parcelError}</p>}
                {cameraError && <p className="mt-4 w-full rounded-xl border border-red-300/20 bg-red-300/5 px-4 py-3 text-xs text-red-200">{cameraError}</p>}

                <button type="button" onClick={() => void startScan()} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200">
                  <Camera className="h-4 w-4" /> Kamerayı aç ve parselleri tara
                </button>

                <div className="mt-7 w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-left">
                  <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Canlı veri</p><p className="mt-1 text-sm text-white/55">GPS çevresindeki ilk 80 sonuç, mesafeye göre sıralanıyor.</p></div><RefreshCw className={`h-4 w-4 text-white/35 ${parcelLoading ? "animate-spin" : ""}`} /></div>
                  <div className="mt-4 space-y-2">
                    {nearbyParcels.slice(0, 6).map((parcel) => (
                      <div key={parcel.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-xs">
                        <div className="min-w-0"><p className="truncate font-semibold text-white/85">{parcel.parcel_number}</p><p className="truncate text-white/40">{parcel.city_name} · {parcel.tier}</p></div>
                        <div className="shrink-0 text-right"><p className="font-semibold text-cyan-200">{formatDistance(parcel.distance)}</p><p className="text-white/40">{parcel.bearing.toFixed(0)}°</p></div>
                      </div>
                    ))}
                    {!parcelLoading && nearbyParcels.length === 0 && <p className="py-4 text-center text-xs text-white/35">Bu yarıçapta parsel bulunamadı.</p>}
                  </div>
                </div>

                <p className="mt-4 text-[11px] text-white/35">Bu aşama yalnızca yeni /gokyuzu-tara katmanını kullanır; mevcut harita, sepet, ödeme, sahiplik ve sertifika akışına dokunmaz.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatusCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><div className="flex items-center gap-2 text-cyan-300">{icon}<span className="text-xs font-medium">{label}</span></div><p className="mt-2 break-words text-xs text-white/60">{value}</p></div>;
}
