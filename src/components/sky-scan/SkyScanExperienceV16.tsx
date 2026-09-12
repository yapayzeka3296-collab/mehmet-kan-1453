import { Camera, LocateFixed, Navigation, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Gps = { latitude: number; longitude: number; accuracy: number | null };
type Parcel = { id: string; parcel_number: string; latitude: number; longitude: number; distance: number; bearing: number };

const R = 6371000;
const SEARCH = 5000;
const MIN_MOVE = 4;
const rad = (n: number) => n * Math.PI / 180;
const deg = (n: number) => n * 180 / Math.PI;
const norm = (n: number) => ((n % 360) + 360) % 360;
const signed = (n: number) => ((n + 540) % 360) - 180;
const dist = (a: Gps, b: { latitude: number; longitude: number }) => {
  const p1 = rad(a.latitude), p2 = rad(b.latitude), dLat = p2 - p1, dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};
const bearing = (a: Gps, b: { latitude: number; longitude: number }) => {
  const p1 = rad(a.latitude), p2 = rad(b.latitude), dl = rad(b.longitude - a.longitude);
  return norm(deg(Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl))));
};
const direction = (a: number) => Math.abs(a) < 20 ? "Karşında" : Math.abs(a) > 160 ? "Arkanda" : a > 0 ? "Sağında" : "Solunda";

export function SkyScanExperienceV16() {
  const video = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const watchRef = useRef<number | null>(null);
  const lastGpsRef = useRef<Gps | null>(null);
  const parcelsRef = useRef<Parcel[]>([]);
  const sensorRef = useRef<number | null>(null);
  const calibrationSensorRef = useRef<number | null>(null);
  const calibrationBearingRef = useRef<number | null>(null);
  const lastParcelFetchRef = useRef(0);
  const [gps, setGps] = useState<Gps | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [started, setStarted] = useState(false);
  const [aligned, setAligned] = useState(false);
  const [message, setMessage] = useState("GPS alınıyor…");
  const [error, setError] = useState<string | null>(null);
  const [sensorReady, setSensorReady] = useState(false);
  const [heading, setHeading] = useState<number | null>(null);

  useEffect(() => { parcelsRef.current = parcels; }, [parcels]);

  const loadParcels = useCallback(async (pos: Gps) => {
    try {
      const dLat = SEARCH / 111320;
      const dLon = SEARCH / Math.max(111320 * Math.cos(rad(pos.latitude)), 1);
      const { data, error: qError } = await supabaseBrowser.from("sky_scan_parcels")
        .select("id,parcel_id,parcel_number,latitude,longitude")
        .gte("latitude", pos.latitude - dLat).lte("latitude", pos.latitude + dLat)
        .gte("longitude", pos.longitude - dLon).lte("longitude", pos.longitude + dLon)
        .limit(500);
      if (qError) throw qError;
      const rows = (data ?? []).map((r: any) => {
        const target = { latitude: Number(r.latitude), longitude: Number(r.longitude) };
        return { id: String(r.parcel_id ?? r.id), parcel_number: String(r.parcel_number ?? "—"), ...target, distance: dist(pos, target), bearing: bearing(pos, target) } as Parcel;
      }).filter((p) => Number.isFinite(p.distance) && p.distance <= SEARCH).sort((a, b) => a.distance - b.distance).slice(0, 150);
      setParcels(rows);
      lastParcelFetchRef.current = Date.now();
      setMessage(rows.length ? `${rows.length} parsel bulundu · yönünüzü yürüyerek kalibre edin` : "5 km içinde parsel bulunamadı");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parseller alınamadı");
    }
  }, []);

  const updateGps = useCallback((position: GeolocationPosition) => {
    const next: Gps = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null };
    setGps(next);
    const previous = lastGpsRef.current;
    const moved = previous ? dist(previous, next) : 0;

    // İlk GPS fix ile parselleri al; konum değiştikçe yeniden sorgula ki ilk/boş RPC sonucu takılı kalmasın.
    if (!previous || moved >= MIN_MOVE || Date.now() - lastParcelFetchRef.current > 15000) {
      void loadParcels(next);
    }

    if (previous && moved >= MIN_MOVE) {
      const travelBearing = bearing(previous, next);
      // Pusula yok: GPS hareket yönü gerçek dünya yönü için temel referanstır.
      setHeading((current) => current === null ? travelBearing : current);
      if (calibrationSensorRef.current === null && sensorRef.current !== null) {
        calibrationBearingRef.current = travelBearing;
        calibrationSensorRef.current = sensorRef.current;
      }
      setAligned(true);
      setMessage(sensorRef.current === null
        ? "AR hizalandı · GPS hareket yönü kullanılıyor"
        : "AR hizalandı · kamera yönünü takip ediyor");
    }
    lastGpsRef.current = next;
  }, [loadParcels]);

  useEffect(() => {
    if (!navigator.geolocation) { setError("Bu cihazda GPS kullanılamıyor."); return; }
    watchRef.current = navigator.geolocation.watchPosition(updateGps, e => setError(`GPS: ${e.message}`), { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 });
    return () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); };
  }, [updateGps]);

  const onOrientation = useCallback((e: DeviceOrientationEvent) => {
    const a = typeof e.alpha === "number" ? e.alpha : null;
    if (a === null) return;
    sensorRef.current = norm(a);
    setSensorReady(true);
    if (calibrationSensorRef.current !== null && calibrationBearingRef.current !== null) {
      const delta = signed(norm(a) - calibrationSensorRef.current);
      setHeading(norm(calibrationBearingRef.current + delta));
    }
  }, []);

  const startCameraAR = useCallback(async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Bu tarayıcı kamera erişimini desteklemiyor.");
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      streamRef.current = stream;
      if (video.current) { video.current.srcObject = stream; await video.current.play(); }
      if (typeof DeviceOrientationEvent !== "undefined" && "requestPermission" in DeviceOrientationEvent) {
        const permission = await (DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission: () => Promise<string> }).requestPermission();
        if (permission !== "granted") throw new Error("Hareket sensörü izni verilmedi.");
      }
      window.addEventListener("deviceorientation", onOrientation, true);
      setStarted(true);
      setMessage(sensorReady ? "Kamera AR açık · 4 m yürüyün" : "Kamera AR açık · GPS yönü için 4 m yürüyün");
    } catch (e) {
      streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null;
      setError(e instanceof Error ? e.message : "Kamera AR başlatılamadı");
    }
  }, [onOrientation, sensorReady]);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    window.removeEventListener("deviceorientation", onOrientation, true);
    setStarted(false); setAligned(false); calibrationSensorRef.current = null; calibrationBearingRef.current = null; setHeading(null);
  }, [onOrientation]);

  useEffect(() => () => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    window.removeEventListener("deviceorientation", onOrientation, true);
  }, [onOrientation]);

  const nearest = parcels[0];
  const projected = useMemo(() => {
    // Hizalama tamamlanmadıysa bile en yakın parseli kullanıcıya görünür kıl.
    // GPS hareketi geldiğinde heading oluşur ve tüm parseller kamera görüşüne projekte edilir.
    if (!started || heading === null) return [];
    const fov = 70;
    return parcels.map(p => {
      const rel = signed(p.bearing - heading);
      const x = 50 + (rel / (fov / 2)) * 50;
      if (x < -10 || x > 110) return null;
      const scale = Math.max(.65, Math.min(1.5, 18 / Math.max(p.distance, 18)));
      return { p, x, scale, rel };
    }).filter(Boolean) as { p: Parcel; x: number; scale: number; rel: number }[];
  }, [started, heading, parcels]);

  return <div className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
    <video ref={video} muted playsInline className="absolute inset-0 h-full w-full object-cover" />
    <div className="pointer-events-none absolute inset-0 bg-transparent" />
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-2">
      <div className="rounded-full bg-black/55 px-2.5 py-1 text-[10px] backdrop-blur"><Camera className="mr-1 inline h-3 w-3" />{started ? "GERÇEK KAMERA AR" : "SKY SCAN"} · {gps ? `±${Math.round(gps.accuracy ?? 0)}m` : "GPS…"} · {parcels.length} parsel</div>
      {started && <button className="pointer-events-auto rounded-full bg-black/60 p-1.5" onClick={stop} aria-label="AR kapat"><X className="h-3.5 w-3.5" /></button>}
    </div>
    {projected.map(({ p, x, scale, rel }) => <div key={p.id} className="pointer-events-none absolute z-10 -translate-x-1/2" style={{ left: `${x}%`, top: `${45 - Math.max(-12, Math.min(12, rel / 6))}%`, transform: `translateX(-50%) scale(${scale})` }}><div className="flex flex-col items-center"><div className="rounded-full border-2 border-cyan-300 bg-cyan-400/25 px-3 py-2 text-center shadow-lg shadow-cyan-500/30"><div className="text-xs font-bold">PARSEL {p.parcel_number}</div><div className="text-[10px]">{Math.round(p.distance)} m · {direction(rel)}</div></div><div className="h-10 w-0.5 bg-cyan-300/80" /><div className="h-4 w-4 rounded-full border-2 border-cyan-300 bg-cyan-400/40" /></div></div>)}
    {started && nearest && <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 w-[calc(100%-20px)] max-w-xs -translate-x-1/2 rounded-xl bg-black/65 px-3 py-2 backdrop-blur"><div className="flex items-center justify-between text-xs font-semibold"><span>Parsel {nearest.parcel_number}</span><span>{Math.round(nearest.distance)} m</span></div><div className="mt-0.5 flex items-center justify-between text-[10px] text-white/75"><span>{heading !== null ? `${parcels.length} parsel görüşte` : "4 m yürüyerek yönü belirle"}</span><span><Navigation className="mr-0.5 inline h-3 w-3" />{heading !== null ? direction(signed(nearest.bearing - heading)) : "—"}</span></div></div>}
    {!started && <div className="absolute bottom-3 left-1/2 z-20 w-[calc(100%-20px)] max-w-xs -translate-x-1/2 rounded-xl bg-black/70 p-3 backdrop-blur"><div className="mb-1 text-xs font-semibold">Pusula gerektirmeyen kamera AR</div><div className="mb-2 text-[10px] text-white/75">Kamera açılır. Pusula kullanılmaz. Yürürken GPS hareket yönüyle AR hizalanır; desteklenen cihazlarda hareket sensörü yalnızca dönüşleri takip eder.</div>{error && <div className="mb-2 text-[10px] text-red-300">{error}</div>}<button onClick={() => void startCameraAR()} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-xs font-bold text-black"><LocateFixed className="h-3.5 w-3.5" />Kamera AR'yi başlat</button></div>}
  </div>;
}
