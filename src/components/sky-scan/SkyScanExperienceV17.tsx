import { LocateFixed, Navigation, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Gps = { latitude: number; longitude: number; accuracy: number | null };
type Parcel = { id: string; parcel_number: string; latitude: number; longitude: number; distance: number; bearing: number };
type XRNavigator = Navigator & { xr?: { isSessionSupported: (mode: "immersive-ar") => Promise<boolean>; requestSession: (mode: "immersive-ar") => Promise<XRSession> } };

const R = 6371000;
const SEARCH = 5000;
const MIN_MOVE = 4;
const rad = (n: number) => n * Math.PI / 180;
const deg = (n: number) => n * 180 / Math.PI;
const norm = (n: number) => ((n % 360) + 360) % 360;
const signed = (n: number) => ((n + 540) % 360) - 180;
const distance = (a: Gps, b: { latitude: number; longitude: number }) => {
  const p1 = rad(a.latitude), p2 = rad(b.latitude), dl = rad(b.longitude - a.longitude), dp = p2 - p1;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};
const bearing = (a: Gps, b: { latitude: number; longitude: number }) => {
  const p1 = rad(a.latitude), p2 = rad(b.latitude), dl = rad(b.longitude - a.longitude);
  return norm(deg(Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl))));
};
const direction = (a: number) => Math.abs(a) < 20 ? "Karşında" : Math.abs(a) > 160 ? "Arkanda" : a > 0 ? "Sağında" : "Solunda";

export function SkyScanExperienceV17() {
  const host = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const lastGps = useRef<Gps | null>(null);
  const lastFetch = useRef(0);
  const xrSession = useRef<XRSession | null>(null);
  const renderer = useRef<THREE.WebGLRenderer | null>(null);
  const camera = useRef<THREE.PerspectiveCamera | null>(null);
  const root = useRef<THREE.Group | null>(null);
  const xrSpace = useRef<XRReferenceSpace | null>(null);
  const origin = useRef<Gps | null>(null);
  const [gps, setGps] = useState<Gps | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [mode, setMode] = useState<"idle" | "xr" | "camera">("idle");
  const [heading, setHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("Gerçek WebXR AR desteği kontrol ediliyor…");

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
      setParcels((data ?? []).map((r: any) => {
        const target = { latitude: Number(r.latitude), longitude: Number(r.longitude) };
        return {
          id: String(r.parcel_id ?? r.id),
          parcel_number: String(r.parcel_number ?? "—"),
          ...target,
          distance: distance(pos, target),
          bearing: bearing(pos, target),
        } as Parcel;
      }).filter(p => p.distance <= SEARCH).sort((a, b) => a.distance - b.distance).slice(0, 100));
      lastFetch.current = Date.now();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parseller alınamadı");
    }
  }, []);

  const updateGps = useCallback((position: GeolocationPosition) => {
    const next: Gps = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
    };
    setGps(next);
    const previous = lastGps.current;
    const moved = previous ? distance(previous, next) : 0;
    if (!previous || moved >= MIN_MOVE || Date.now() - lastFetch.current > 15000) void loadParcels(next);
    if (previous && moved >= MIN_MOVE) setHeading(bearing(previous, next));
    lastGps.current = next;
  }, [loadParcels]);

  useEffect(() => {
    if (!navigator.geolocation) { setError("GPS kullanılamıyor"); return; }
    const id = navigator.geolocation.watchPosition(updateGps, e => setError(`GPS: ${e.message}`), {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 15000,
    });
    return () => navigator.geolocation.clearWatch(id);
  }, [updateGps]);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const xr = (navigator as XRNavigator).xr;
      if (!xr) { setSupported(false); setMessage("Bu tarayıcıda WebXR yok · kamera AR kullanılacak"); return; }
      try {
        const ok = await xr.isSessionSupported("immersive-ar");
        if (alive) {
          setSupported(ok);
          setMessage(ok ? "Gerçek WebXR AR hazır" : "Bu cihaz/tarayıcı immersive-ar desteklemiyor · kamera AR kullanılacak");
        }
      } catch {
        if (alive) { setSupported(false); setMessage("WebXR immersive-ar doğrulanamadı · kamera AR kullanılacak"); }
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!host.current) return;
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.setSize(window.innerWidth, window.innerHeight);
    r.xr.enabled = true;
    const c = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10000);
    const g = new THREE.Group();
    const s = new THREE.Scene();
    s.add(g);
    renderer.current = r;
    camera.current = c;
    root.current = g;
    host.current.appendChild(r.domElement);
    const resize = () => { r.setSize(window.innerWidth, window.innerHeight); c.aspect = window.innerWidth / window.innerHeight; c.updateProjectionMatrix(); };
    window.addEventListener("resize", resize);
    r.setAnimationLoop(() => r.render(s, c));
    return () => {
      window.removeEventListener("resize", resize);
      r.setAnimationLoop(null);
      r.dispose();
      r.domElement.remove();
      renderer.current = null;
    };
  }, []);

  const start = useCallback(async () => {
    setError(null);
    const xr = (navigator as XRNavigator).xr;
    if (supported === true && xr) {
      try {
        // requestSession is called directly from the button handler; do not await isSessionSupported here.
        const session = await xr.requestSession("immersive-ar");
        xrSession.current = session;
        const r = renderer.current;
        if (!r) throw new Error("WebGL renderer hazır değil");
        await r.xr.setSession(session);
        xrSpace.current = await session.requestReferenceSpace("local");
        origin.current = gps;
        setHeading(null);
        setMode("xr");
        setMessage("Gerçek WebXR AR açık · 4 m yürüyün, GPS yönü kalibre edilecek");
        session.addEventListener("end", () => {
          xrSession.current = null;
          xrSpace.current = null;
          setMode("idle");
          setMessage("WebXR AR sonlandırıldı");
        }, { once: true });
        return;
      } catch (e) {
        setError(e instanceof Error ? `${e.name}: ${e.message}` : String(e));
      }
    }
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      stream.current = s;
      if (video.current) { video.current.srcObject = s; await video.current.play(); }
      setMode("camera");
      setMessage("Kamera AR açık · pusula kullanılmıyor · 4 m yürüyerek yön kalibrasyonu yapılır");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kamera açılamadı");
    }
  }, [gps, supported]);

  const stop = useCallback(() => {
    void xrSession.current?.end();
    stream.current?.getTracks().forEach(t => t.stop());
    stream.current = null;
    setMode("idle");
  }, []);

  useEffect(() => {
    const g = root.current;
    const o = origin.current;
    if (!g || !o || mode !== "xr") return;
    g.clear();
    for (const p of parcels) {
      const east = rad(p.longitude - o.longitude) * R * Math.cos(rad(o.latitude));
      const north = rad(p.latitude - o.latitude) * R;
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee })
      );
      marker.position.set(east, 0, -north);
      g.add(marker);
    }
  }, [parcels, gps, mode]);

  const nearest = parcels[0];
  const markers = useMemo(() => heading === null ? [] : parcels.slice(0, 20)
    .map(p => ({ p, relative: signed(p.bearing - heading), left: 50 + signed(p.bearing - heading) / 90 * 50 }))
    .filter(x => x.left > -20 && x.left < 120), [heading, parcels]);

  return <div ref={host} className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
    {mode === "camera" && <video ref={video} className="absolute inset-0 h-full w-full object-cover" playsInline muted autoPlay />}
    {mode === "camera" && markers.map(({ p, relative, left }) => <div key={p.id} className="absolute top-[42%] z-10 -translate-x-1/2 rounded-xl bg-black/75 px-3 py-2 text-center" style={{ left: `${left}%` }}><div className="text-xs font-bold">PARSEL {p.parcel_number}</div><div className="text-[10px]">{Math.round(p.distance)} m · {direction(relative)}</div></div>)}
    <div className="absolute inset-x-0 top-0 z-20 p-2"><div className="flex items-center justify-between"><div className="rounded-full bg-black/70 px-3 py-1 text-[10px]">{mode === "xr" ? "GERÇEK WEBXR AR" : "GÖKYÜZÜNÜ TARA"} · {gps ? `±${Math.round(gps.accuracy ?? 0)}m GPS` : "GPS…"} · {parcels.length} parsel</div>{mode !== "idle" && <button onClick={stop} className="rounded-full bg-black/70 p-2"><X className="h-4 w-4" /></button>}</div></div>
    {mode === "idle" && <div className="absolute bottom-3 left-1/2 z-20 w-[calc(100%-20px)] max-w-sm -translate-x-1/2 rounded-2xl bg-black/85 p-4"><div className="mb-2 flex items-center gap-2 font-semibold"><LocateFixed className="h-5 w-5" />Gökyüzünü Tara</div><div className="mb-3 text-xs text-white/75">{message}</div><button onClick={start} className="w-full rounded-xl bg-cyan-400 px-4 py-3 text-sm font-bold text-black">AR'YI BAŞLAT</button>{error && <div className="mt-2 rounded-lg bg-red-500/20 p-2 text-[11px] text-red-200">{error}</div>}<div className="mt-2 text-[10px] text-white/50">{supported === true ? "WebXR immersive-ar kullanılabilir." : "WebXR yoksa kamera+GPS modu otomatik açılır."}</div></div>}
    {mode !== "idle" && nearest && <div className="absolute bottom-3 left-1/2 z-20 w-[calc(100%-20px)] max-w-sm -translate-x-1/2 rounded-xl bg-black/80 px-3 py-2"><div className="flex justify-between text-xs font-bold"><span>Parsel {nearest.parcel_number}</span><span>{Math.round(nearest.distance)} m</span></div><div className="mt-1 text-[10px] text-white/70"><Navigation className="mr-1 inline h-3 w-3" />{heading === null ? "4 m yürüyün; yön kalibre edilecek" : direction(signed(nearest.bearing - heading))}</div></div>}
  </div>;
}
