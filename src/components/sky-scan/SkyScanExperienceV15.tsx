import { Camera, LocateFixed, Navigation, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Gps = { latitude: number; longitude: number; accuracy: number | null };
type Parcel = { id: string; parcel_number: string; latitude: number; longitude: number; distance: number; bearing: number };

const R = 6371000;
const SEARCH = 5000;
const rad = (n: number) => n * Math.PI / 180;
const deg = (n: number) => n * 180 / Math.PI;
const norm = (n: number) => ((n % 360) + 360) % 360;
const distance = (a: Gps, b: { latitude: number; longitude: number }) => {
  const p1 = rad(a.latitude), p2 = rad(b.latitude), dLat = p2 - p1, dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};
const bearing = (a: Gps, b: { latitude: number; longitude: number }) => {
  const p1 = rad(a.latitude), p2 = rad(b.latitude), dl = rad(b.longitude - a.longitude);
  return norm(deg(Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl))));
};
const localENU = (origin: Gps, target: Parcel) => ({
  east: rad(target.longitude - origin.longitude) * R * Math.cos(rad(origin.latitude)),
  north: rad(target.latitude - origin.latitude) * R,
});
const direction = (relative: number) => {
  const a = ((relative + 540) % 360) - 180;
  if (Math.abs(a) < 20) return "Karşında";
  if (Math.abs(a) > 160) return "Arkanda";
  return a > 0 ? "Sağında" : "Solunda";
};

export function SkyScanExperienceV15() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sessionRef = useRef<XRSession | null>(null);
  const spaceRef = useRef<XRReferenceSpace | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const originRef = useRef<Gps | null>(null);
  const lastGpsRef = useRef<Gps | null>(null);
  const calibrationRef = useRef<{ gps: Gps; xrPosition: THREE.Vector3; xrBearing: number; earthBearing: number } | null>(null);
  const calibrationPending = useRef(false);
  const watchRef = useRef<number | null>(null);
  const parcelsRef = useRef<Parcel[]>([]);
  const [gps, setGps] = useState<Gps | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [started, setStarted] = useState(false);
  const [aligned, setAligned] = useState(false);
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);
  const [message, setMessage] = useState("GPS alınıyor…");
  const [error, setError] = useState<string | null>(null);
  const [nearestDirection, setNearestDirection] = useState("—");

  useEffect(() => { parcelsRef.current = parcels; }, [parcels]);

  const loadParcels = useCallback(async (pos: Gps) => {
    try {
      const dLat = SEARCH / 111320;
      const dLon = SEARCH / Math.max(111320 * Math.cos(rad(pos.latitude)), 1);
      const { data, error: qError } = await supabaseBrowser
        .from("sky_scan_parcels")
        .select("id,parcel_id,parcel_number,latitude,longitude")
        .gte("latitude", pos.latitude - dLat).lte("latitude", pos.latitude + dLat)
        .gte("longitude", pos.longitude - dLon).lte("longitude", pos.longitude + dLon)
        .limit(500);
      if (qError) throw qError;
      const rows = (data ?? []).map((r: any) => {
        const target = { latitude: Number(r.latitude), longitude: Number(r.longitude) };
        return {
          id: String(r.parcel_id ?? r.id), parcel_number: String(r.parcel_number ?? "—"),
          latitude: target.latitude, longitude: target.longitude,
          distance: distance(pos, target), bearing: bearing(pos, target),
        } as Parcel;
      }).filter((p) => Number.isFinite(p.distance) && p.distance <= SEARCH)
        .sort((a, b) => a.distance - b.distance).slice(0, 150);
      setParcels(rows);
      if (!rows.length) setMessage("5 km içinde parsel bulunamadı");
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
    const previous = lastGpsRef.current;
    if (!originRef.current) {
      originRef.current = next;
      void loadParcels(next);
    }
    if (previous && distance(previous, next) >= 4 && !calibrationRef.current) {
      calibrationPending.current = true;
      setMessage("Hareket algılandı · AR görüşü hizalanıyor…");
    }
    lastGpsRef.current = next;
  }, [loadParcels]);

  useEffect(() => {
    if (!navigator.geolocation) { setError("Bu cihazda GPS kullanılamıyor."); return; }
    watchRef.current = navigator.geolocation.watchPosition(updateGps, (e) => setError(`GPS: ${e.message}`), { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 });
    return () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); };
  }, [updateGps]);

  const createRenderer = useCallback(() => {
    if (!canvas.current || rendererRef.current) return rendererRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas: canvas.current, alpha: true, antialias: true });
    renderer.xr.enabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearAlpha(0);
    rendererRef.current = renderer;
    sceneRef.current = new THREE.Scene();
    return renderer;
  }, []);

  const startXR = useCallback(async () => {
    setError(null);
    if (!navigator.xr) { setXrSupported(false); setError("Bu tarayıcı WebXR AR desteklemiyor."); return; }
    try {
      const supported = await navigator.xr.isSessionSupported("immersive-ar");
      setXrSupported(supported);
      if (!supported) throw new Error("Bu cihazda immersive AR desteklenmiyor.");

      const renderer = createRenderer();
      if (!renderer) throw new Error("AR görüntü motoru başlatılamadı.");

      // Kritik: requestSession'a cihazın desteklemediği hiçbir özelliği zorunlu
      // veya DOM overlay olarak göndermiyoruz. local-floor yalnızca opsiyonel.
      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: [],
        optionalFeatures: ["local-floor"],
      });
      sessionRef.current = session;
      await renderer.xr.setSession(session);

      let referenceSpace: XRReferenceSpace;
      try {
        referenceSpace = await session.requestReferenceSpace("local-floor");
      } catch {
        referenceSpace = await session.requestReferenceSpace("local");
      }
      spaceRef.current = referenceSpace;
      setStarted(true);
      setMessage("Gerçek AR açık · 4 m yürüyün");

      const markers = new Map<string, THREE.Group>();
      const labels = new Map<string, THREE.Sprite>();
      const rebuild = () => {
        const scene = sceneRef.current!;
        markers.forEach((g) => scene.remove(g));
        labels.forEach((s) => scene.remove(s));
        markers.clear(); labels.clear();
        for (const p of parcelsRef.current) {
          const g = new THREE.Group();
          const radius = Math.max(0.35, Math.min(2.5, p.distance * 0.003));
          const height = Math.max(2.5, Math.min(12, p.distance * 0.012));
          const ring = new THREE.Mesh(new THREE.RingGeometry(radius * .65, radius, 24), new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: .9 }));
          ring.rotation.x = -Math.PI / 2;
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(radius*.18, radius*.3, height, 12), new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: .9 }));
          stem.position.y = height / 2;
          const head = new THREE.Mesh(new THREE.ConeGeometry(radius*.65, radius*1.5, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
          head.position.y = height + radius*.75;
          g.add(ring, stem, head); markers.set(p.id, g); scene.add(g);

          const c = document.createElement("canvas"); c.width = 768; c.height = 112;
          const ctx = c.getContext("2d")!;
          ctx.fillStyle = "rgba(0,0,0,.82)"; ctx.roundRect(4,4,760,104,20); ctx.fill();
          ctx.fillStyle = "white"; ctx.font = "bold 32px sans-serif"; ctx.fillText(`PARSEL ${p.parcel_number}`,24,48);
          ctx.font = "26px sans-serif"; ctx.fillText(`${Math.round(p.distance)} m`,24,84);
          const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
          const w = Math.max(5, Math.min(18, p.distance*.014)); sprite.scale.set(w, w*.146, 1);
          labels.set(p.id, sprite); scene.add(sprite);
        }
      };
      rebuild();
      let signature = "";
      const render = (_time: number, frame: XRFrame) => {
        const sessionNow = sessionRef.current, space = spaceRef.current, scene = sceneRef.current;
        if (!sessionNow || !space || !scene) return;
        const pose = frame.getViewerPose(space);
        if (!pose?.views[0]) return;
        const view = pose.views[0];
        const nextSignature = parcelsRef.current.map((p) => `${p.id}:${Math.round(p.distance)}`).join("|");
        if (nextSignature !== signature) { signature = nextSignature; rebuild(); }

        const q = view.transform.orientation;
        const forward = new THREE.Vector3(0,0,-1).applyQuaternion(new THREE.Quaternion(q.x,q.y,q.z,q.w));
        const xrBearing = norm(deg(Math.atan2(forward.x, -forward.z)));

        if (calibrationPending.current && !calibrationRef.current && originRef.current && lastGpsRef.current) {
          calibrationRef.current = {
            gps: lastGpsRef.current,
            xrPosition: new THREE.Vector3(view.transform.position.x, view.transform.position.y, view.transform.position.z),
            xrBearing,
            earthBearing: bearing(originRef.current, lastGpsRef.current),
          };
          calibrationPending.current = false;
          setAligned(true);
          setMessage("AR hizalandı · parseller görüş alanına yerleştirildi");
        }

        const cal = calibrationRef.current;
        if (cal) {
          const nearest = parcelsRef.current[0];
          let nextDirection = nearestDirection;
          for (const p of parcelsRef.current) {
            const enu = localENU(cal.gps, p);
            const d = Math.hypot(enu.east, enu.north);
            const earthBearing = norm(deg(Math.atan2(enu.east, enu.north)));
            const relative = ((earthBearing - cal.earthBearing + 540) % 360) - 180;
            const angle = rad(cal.xrBearing + relative);
            const x = cal.xrPosition.x + Math.sin(angle) * d;
            const z = cal.xrPosition.z - Math.cos(angle) * d;
            markers.get(p.id)?.position.set(x, cal.xrPosition.y + .15, z);
            labels.get(p.id)?.position.set(x, cal.xrPosition.y + Math.max(2.5, Math.min(14, d*.012)) + 1.5, z);
            if (p === nearest) nextDirection = direction(norm(earthBearing - xrBearing));
          }
          if (nextDirection !== nearestDirection) setNearestDirection(nextDirection);
        }
        renderer.render(scene, renderer.xr.getCamera());
      };
      renderer.setAnimationLoop(render);
      session.addEventListener("end", () => {
        renderer.setAnimationLoop(null); sessionRef.current = null; spaceRef.current = null;
        setStarted(false); setAligned(false); calibrationRef.current = null;
      }, { once: true });
    } catch (e) {
      const err = e as DOMException;
      const detail = err?.name ? `${err.name}: ${err.message}` : (e instanceof Error ? e.message : "AR başlatılamadı");
      setError(detail);
      setStarted(false); sessionRef.current = null; spaceRef.current = null;
      rendererRef.current?.setAnimationLoop(null);
      rendererRef.current?.dispose(); rendererRef.current = null; sceneRef.current = null;
    }
  }, [createRenderer, nearestDirection]);

  const stop = useCallback(async () => {
    if (sessionRef.current) await sessionRef.current.end().catch(() => undefined);
  }, []);

  useEffect(() => () => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    rendererRef.current?.setAnimationLoop(null); rendererRef.current?.dispose();
  }, []);

  const nearest = parcels[0];
  return <div className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
    <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-2">
      <div className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] backdrop-blur"><Camera className="mr-1 inline h-3 w-3" />{started ? "GERÇEK AR" : "SKY SCAN"} · {gps ? `±${Math.round(gps.accuracy ?? 0)}m` : "GPS…"} · {parcels.length} parsel</div>
      {started && <button className="pointer-events-auto rounded-full bg-black/50 p-1.5 backdrop-blur" onClick={() => void stop()} aria-label="AR kapat"><X className="h-3.5 w-3.5" /></button>}
    </div>
    {started && nearest && <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 w-[calc(100%-20px)] max-w-xs -translate-x-1/2 rounded-xl bg-black/55 px-3 py-2 backdrop-blur"><div className="flex items-center justify-between text-xs font-semibold"><span>Parsel {nearest.parcel_number}</span><span>{Math.round(nearest.distance)} m</span></div><div className="mt-0.5 flex items-center justify-between text-[10px] text-white/75"><span>{parcels.length} yakın parsel</span><span><Navigation className="mr-0.5 inline h-3 w-3" />{aligned ? nearestDirection : "4 m yürü"}</span></div></div>}
    {!started && <div className="absolute bottom-3 left-1/2 z-20 w-[calc(100%-20px)] max-w-xs -translate-x-1/2 rounded-xl bg-black/60 p-2.5 backdrop-blur"><div className="mb-1 text-[10px] text-white/75">{message}</div>{error && <div className="mb-1 text-[10px] text-red-300">{error}</div>}<button onClick={() => void startXR()} disabled={xrSupported === false} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-xs font-bold text-black disabled:opacity-40"><LocateFixed className="h-3.5 w-3.5" />Gerçek AR'yi başlat</button></div>}
  </div>;
}
