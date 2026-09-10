import { createFileRoute } from "@tanstack/react-router";
import { Camera, Compass, MapPin, Navigation, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

function SkyScanPage() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [orientationStarted, setOrientationStarted] = useState(false);
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

  const startOrientation = async () => {
    const permissionRequest = (DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> }).requestPermission;
    if (permissionRequest) {
      try {
        const permission = await permissionRequest();
        if (permission !== "granted") return;
      } catch {
        return;
      }
    }
    setOrientationStarted(true);
  };

  const nearestParcel = nearbyParcels[0] ?? null;
  const nearestAngle = heading !== null && nearestParcel ? normalizeAngle(nearestParcel.bearing - heading) : null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative z-10 flex items-center gap-3">
          <a href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10">← Geri</a>
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">MySkyParcel</p><h1 className="font-display text-xl font-semibold sm:text-2xl">🌌 Gökyüzünü Tara</h1></div>
        </header>

        <div className="relative mt-6 flex flex-1 items-center justify-center overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.10),transparent_42%)]" />
          <div className="relative z-10 flex w-full max-w-2xl flex-col items-center px-5 py-10 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300 shadow-lg shadow-cyan-950/40"><Camera className="h-9 w-9" /></div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Gerçek parsel bağlantısı</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">GPS konumuna göre sınırlı bir alan sorgulanıyor. Bu aşamada kamera hâlâ kapalı; mevcut parsel ve satın alma sistemi değiştirilmeden yalnızca gerçek koordinatlar tarama katmanına getiriliyor.</p>

            <div className="mt-7 grid w-full gap-3 text-left sm:grid-cols-2">
              <StatusCard icon={<MapPin className="h-4 w-4" />} label="Konum" value={location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)} · ±${Math.round(location.accuracy)} m` : locationError ? "İzin bekleniyor" : "Alınıyor…"} />
              <StatusCard icon={<Compass className="h-4 w-4" />} label="Yön" value={heading === null ? "Başlatılmadı" : `${heading.toFixed(0)}°`} />
              <StatusCard icon={<Navigation className="h-4 w-4" />} label="Yakındaki parseller" value={parcelLoading ? "Taranıyor…" : `${nearbyParcels.length} parsel`} />
              <StatusCard icon={<Navigation className="h-4 w-4" />} label="En yakın" value={nearestParcel ? `${nearestParcel.parcel_number} · ${formatDistance(nearestParcel.distance)} · ${nearestParcel.bearing.toFixed(0)}°` : "Parsel bekleniyor"} />
            </div>

            {nearestParcel && heading !== null && <div className="mt-4 w-full rounded-2xl border border-cyan-300/15 bg-cyan-300/5 px-4 py-3 text-left text-xs text-cyan-100"><div className="font-semibold">Yön testi</div><div className="mt-1 text-white/55">{nearestParcel.parcel_number} hedefi telefon yönüne göre {nearestAngle !== null && nearestAngle > 0 ? "+" : ""}{nearestAngle?.toFixed(0)}° açıda.</div></div>}
            {locationError && <p className="mt-4 w-full rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-xs text-amber-200">{locationError}</p>}
            {parcelError && <p className="mt-4 w-full rounded-xl border border-red-300/20 bg-red-300/5 px-4 py-3 text-xs text-red-200">{parcelError}</p>}

            <button type="button" onClick={() => void startOrientation()} disabled={orientationStarted} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-default disabled:opacity-60">
              <Compass className="h-4 w-4" /> {orientationStarted ? "Yön sensörü açık" : "Konum ve yönü başlat"}
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
      </section>
    </main>
  );
}

function StatusCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><div className="flex items-center gap-2 text-cyan-300">{icon}<span className="text-xs font-medium">{label}</span></div><p className="mt-2 break-words text-xs text-white/60">{value}</p></div>;
}
