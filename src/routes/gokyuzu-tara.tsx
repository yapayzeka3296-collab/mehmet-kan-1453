import { createFileRoute } from "@tanstack/react-router";
import { Camera, Compass, MapPin, Navigation } from "lucide-react";
import { useEffect, useState } from "react";
import { bearingDegrees, distanceMeters, formatDistance, normalizeAngle, type GeoPoint } from "@/components/sky-scan/geo";

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanPage });

type LocationState = GeoPoint & { accuracy: number };

function SkyScanPage() {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [orientationStarted, setOrientationStarted] = useState(false);

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

  const demoTarget: GeoPoint | null = location ? { latitude: location.latitude + 0.002, longitude: location.longitude + 0.002 } : null;
  const targetDistance = location && demoTarget ? distanceMeters(location, demoTarget) : null;
  const targetBearing = location && demoTarget ? bearingDegrees(location, demoTarget) : null;
  const angle = heading !== null && targetBearing !== null ? normalizeAngle(targetBearing - heading) : null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative z-10 flex items-center gap-3">
          <a href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10">← Geri</a>
          <div><p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">MySkyParcel</p><h1 className="font-display text-xl font-semibold sm:text-2xl">🌌 Gökyüzünü Tara</h1></div>
        </header>

        <div className="relative mt-6 flex flex-1 items-center justify-center overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.10),transparent_42%)]" />
          <div className="relative z-10 flex w-full max-w-lg flex-col items-center px-5 py-12 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300 shadow-lg shadow-cyan-950/40"><Camera className="h-9 w-9" /></div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Sensör testi</h2>
            <p className="mt-3 text-sm leading-6 text-white/60">Bu aşamada yalnızca telefonun GPS ve yön sensörünü kontrollü olarak test ediyoruz. Kamera ve gerçek parseller henüz bağlanmadı.</p>

            <div className="mt-7 grid w-full gap-3 text-left sm:grid-cols-2">
              <StatusCard icon={<MapPin className="h-4 w-4" />} label="Konum" value={location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : locationError ? "İzin bekleniyor" : "Alınıyor…"} />
              <StatusCard icon={<Compass className="h-4 w-4" />} label="Yön" value={heading === null ? "Başlatılmadı" : `${heading.toFixed(0)}°`} />
              <StatusCard icon={<Navigation className="h-4 w-4" />} label="Örnek hedef" value={targetDistance === null ? "Konum bekleniyor" : `${formatDistance(targetDistance)} · ${targetBearing?.toFixed(0)}°`} />
              <StatusCard icon={<Compass className="h-4 w-4" />} label="Açı farkı" value={angle === null ? "—" : `${angle > 0 ? "+" : ""}${angle.toFixed(0)}°`} />
            </div>

            {locationError && <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-3 text-xs text-amber-200">{locationError}</p>}

            <button type="button" onClick={() => void startOrientation()} disabled={orientationStarted} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-default disabled:opacity-60">
              <Compass className="h-4 w-4" /> {orientationStarted ? "Yön sensörü açık" : "Konum ve yönü başlat"}
            </button>
            <p className="mt-4 text-[11px] text-white/35">Sonraki aşama ancak bu sensör testi Vercel Preview'da temiz çalıştıktan sonra yapılacak.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatusCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-3"><div className="flex items-center gap-2 text-cyan-300">{icon}<span className="text-xs font-medium">{label}</span></div><p className="mt-2 break-words text-xs text-white/60">{value}</p></div>;
}
