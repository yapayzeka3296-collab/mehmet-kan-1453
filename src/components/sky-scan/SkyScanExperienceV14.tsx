import { Camera, LocateFixed, Navigation, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Gps = { latitude: number; longitude: number; accuracy: number | null; speed: number | null };
type Point = [number, number];
type Parcel = { id: string; parcel_number: string; polygon: Point[]; latitude: number; longitude: number; distance: number; bearing: number };
type XRSessionLike = XRSession & { requestReferenceSpace(type: string): Promise<XRReferenceSpace> };

const R = 6371000;
const SEARCH = 5000;
const rad = (n: number) => n * Math.PI / 180;
const deg = (n: number) => n * 180 / Math.PI;
const norm = (n: number) => ((n % 360) + 360) % 360;
const hav = (a: Gps, b: { latitude: number; longitude: number }) => {
  const p1 = rad(a.latitude), p2 = rad(b.latitude), dLat = p2 - p1, dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};
const bearing = (a: Gps, b: { latitude: number; longitude: number }) => {
  const p1 = rad(a.latitude), p2 = rad(b.latitude), dl = rad(b.longitude - a.longitude);
  return norm(deg(Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl))));
};
function centroid(p: Point[]): Point {
  if (p.length < 3) return p[0] ?? [0, 0];
  let a = 0, x = 0, y = 0;
  for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length], f = x1 * y2 - x2 * y1; a += f; x += (x1 + x2) * f; y += (y1 + y2) * f; }
  return Math.abs(a) < 1e-12 ? p[0] : [x / (3 * a), y / (3 * a)];
}
function parseGeometry(raw: unknown): Point[] {
  if (!raw) return [];
  if (typeof raw === "object") { const v = raw as { type?: string; geometry?: any; coordinates?: any }; const g = v.type === "Feature" ? v.geometry : v; if (g?.type === "Polygon" && Array.isArray(g.coordinates?.[0])) return g.coordinates[0].map((p: any) => [Number(p[0]), Number(p[1])] as Point).filter((p: Point) => p.every(Number.isFinite)); }
  const s = String(raw).trim();
  if (/^(POLYGON|SRID=\d+;POLYGON)/i.test(s)) { const body = s.replace(/^SRID=\d+;/i, "").replace(/^POLYGON\s*\(\(/i, "").replace(/\)\)\s*$/, ""); return body.split(",").map(q => q.trim().split(/\s+/).slice(0, 2).map(Number) as Point).filter(p => p.every(Number.isFinite)); }
  return [];
}
function localENU(origin: Gps, target: { latitude: number; longitude: number }) {
  return { east: rad(target.longitude - origin.longitude) * R * Math.cos(rad(origin.latitude)), north: rad(target.latitude - origin.latitude) * R };
}
function xrForwardBearing(q: THREE.Quaternion) {
  const f = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
  return norm(deg(Math.atan2(f.x, -f.z)));
}
function directionLabel(relative: number) {
  const a = ((relative + 540) % 360) - 180;
  if (Math.abs(a) < 20) return "Karşında";
  if (Math.abs(a) > 160) return "Arkanda";
  return a > 0 ? "Sağında" : "Solunda";
}

export function SkyScanExperienceV14() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<XRSessionLike | null>(null);
  const refSpace = useRef<XRReferenceSpace | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const originRef = useRef<Gps | null>(null);
  const lastGpsRef = useRef<Gps | null>(null);
  const calibrationGpsRef = useRef<Gps | null>(null);
  const calibrationRef = useRef<{ xrPosition: THREE.Vector3; xrBearing: number; earthBearing: number } | null>(null);
  const calibrationPendingRef = useRef(false);
  const parcelsRef = useRef<Parcel[]>([]);
  const watchRef = useRef<number | null>(null);
  const [gps, setGps] = useState<Gps | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [started, setStarted] = useState(false);
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);
  const [aligned, setAligned] = useState(false);
  const [message, setMessage] = useState("GPS alınıyor…");
  const [error, setError] = useState<string | null>(null);
  const [nearestDirection, setNearestDirection] = useState("—");

  useEffect(() => { parcelsRef.current = parcels; }, [parcels]);

  const loadParcels = useCallback(async (pos: Gps) => {
    try {
      const dLat = SEARCH / 111320, dLon = SEARCH / Math.max(111320 * Math.cos(rad(pos.latitude)), 1);
      const { data, error: qError } = await supabaseBrowser.from("sky_scan_parcels").select("id,parcel_id,parcel_number,latitude,longitude,parcels!sky_scan_parcels_parcel_id_fkey(geometry)").gte("latitude", pos.latitude - dLat).lte("latitude", pos.latitude + dLat).gte("longitude", pos.longitude - dLon).lte("longitude", pos.longitude + dLon).limit(2000);
      if (qError) throw qError;
      const rows = (data ?? []).map((r: any) => {
        const poly = parseGeometry(r.parcels?.geometry);
        const c = poly.length >= 3 ? centroid(poly) : [Number(r.longitude), Number(r.latitude)] as Point;
        const target = { latitude: c[1], longitude: c[0] };
        return { id: String(r.parcel_id ?? r.id), parcel_number: String(r.parcel_number ?? "—"), polygon: poly, latitude: target.latitude, longitude: target.longitude, distance: hav(pos, target), bearing: bearing(pos, target) } as Parcel;
      }).filter((p: Parcel) => Number.isFinite(p.distance) && p.distance <= SEARCH).sort((a: Parcel, b: Parcel) => a.distance - b.distance).slice(0, 150);
      setParcels(rows);
      if (!rows.length) setMessage("5 km içinde parsel bulunamadı");
    } catch (e) { setError(e instanceof Error ? e.message : "Parseller alınamadı"); }
  }, []);

  const updateGps = useCallback((p: GeolocationPosition) => {
    const n: Gps = { latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: Number.isFinite(p.coords.accuracy) ? p.coords.accuracy : null, speed: Number.isFinite(p.coords.speed) ? p.coords.speed : null };
    setGps(n);
    const previous = lastGpsRef.current;
    if (!originRef.current) { originRef.current = n; void loadParcels(n); }
    if (previous && hav(previous, n) >= 4 && !calibrationRef.current) {
      calibrationPendingRef.current = true;
      setMessage("Hareket algılandı · AR görüşü hizalanıyor…");
    }
    lastGpsRef.current = n;
  }, [loadParcels]);

  const createScene = useCallback(() => {
    if (!canvas.current || rendererRef.current) return;
    const renderer = new THREE.WebGLRenderer({ canvas: canvas.current, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.setClearAlpha(0);
    sceneRef.current = new THREE.Scene();
    rendererRef.current = renderer;
  }, []);

  const startXR = useCallback(async () => {
    setError(null);
    if (!navigator.xr) { setError("Bu tarayıcı WebXR AR desteklemiyor."); return; }
    try {
      const supported = await navigator.xr.isSessionSupported("immersive-ar");
      setXrSupported(supported);
      if (!supported) { setError("Bu cihazda WebXR immersive AR desteklenmiyor."); return; }
      createScene();
      const session = await navigator.xr.requestSession("immersive-ar", { requiredFeatures: ["local-floor"], optionalFeatures: ["dom-overlay"], domOverlay: { root: document.body } } as any) as XRSessionLike;
      sessionRef.current = session;
      const renderer = rendererRef.current!;
      await renderer.xr.setSession(session);
      refSpace.current = await session.requestReferenceSpace("local-floor");
      setStarted(true);
      setMessage("Gerçek AR açık · 4 m yürüyün");

      const markerMeshes = new Map<string, THREE.Group>();
      const labelSprites = new Map<string, THREE.Sprite>();
      const rebuildObjects = () => {
        markerMeshes.forEach(g => { sceneRef.current?.remove(g); g.traverse(o => { if (o instanceof THREE.Mesh) { o.geometry.dispose(); (o.material as THREE.Material).dispose(); } }); });
        markerMeshes.clear();
        labelSprites.forEach(s => { sceneRef.current?.remove(s); const m = s.material as THREE.SpriteMaterial; m.map?.dispose(); m.dispose(); });
        labelSprites.clear();
        const scene = sceneRef.current!;
        for (const p of parcelsRef.current) {
          const group = new THREE.Group();
          const beaconHeight = Math.max(2.5, Math.min(12, p.distance * 0.012));
          const radius = Math.max(0.35, Math.min(2.5, p.distance * 0.003));
          const ring = new THREE.Mesh(new THREE.RingGeometry(radius * 0.65, radius, 24), new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide, transparent: true, opacity: 0.9 }));
          ring.rotation.x = -Math.PI / 2;
          const stem = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.18, radius * 0.3, beaconHeight, 12), new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.9 }));
          stem.position.y = beaconHeight / 2;
          const head = new THREE.Mesh(new THREE.ConeGeometry(radius * 0.65, radius * 1.5, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
          head.position.y = beaconHeight + radius * 0.75;
          group.add(ring, stem, head);
          markerMeshes.set(p.id, group); scene.add(group);

          const c = document.createElement("canvas"); c.width = 768; c.height = 112;
          const ctx = c.getContext("2d")!; ctx.fillStyle = "rgba(0,0,0,.82)"; ctx.roundRect(4, 4, 760, 104, 20); ctx.fill(); ctx.fillStyle = "white"; ctx.font = "bold 32px sans-serif"; ctx.fillText(`PARSEL ${p.parcel_number}`, 24, 48); ctx.font = "26px sans-serif"; ctx.fillText(`${Math.round(p.distance)} m`, 24, 84);
          const texture = new THREE.CanvasTexture(c); const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false }));
          const labelWidth = Math.max(5, Math.min(18, p.distance * 0.014));
          sprite.scale.set(labelWidth, labelWidth * (112 / 768), 1); labelSprites.set(p.id, sprite); scene.add(sprite);
        }
      };
      rebuildObjects();
      let objectSignature = "";
      const render = (_time: number, frame: XRFrame) => {
        if (!sessionRef.current || !refSpace.current || !sceneRef.current) return;
        const pose = frame.getViewerPose(refSpace.current); if (!pose?.views[0]) return;
        const view = pose.views[0];
        const signature = parcelsRef.current.map(p => p.id + ":" + Math.round(p.distance)).join("|");
        if (signature !== objectSignature) { objectSignature = signature; rebuildObjects(); }

        const viewerQ = new THREE.Quaternion(view.transform.orientation.x, view.transform.orientation.y, view.transform.orientation.z, view.transform.orientation.w);
        const viewerBearing = xrForwardBearing(viewerQ);
        if (calibrationPendingRef.current && !calibrationRef.current && lastGpsRef.current && originRef.current) {
          calibrationRef.current = { xrPosition: new THREE.Vector3(view.transform.position.x, view.transform.position.y, view.transform.position.z), xrBearing: viewerBearing, earthBearing: bearing(originRef.current, lastGpsRef.current) };
          calibrationGpsRef.current = lastGpsRef.current;
          calibrationPendingRef.current = false; setAligned(true); setMessage("AR hizalandı · parseller görüş alanına yerleştirildi");
        }

        const cal = calibrationRef.current; const origin = calibrationGpsRef.current ?? originRef.current;
        if (cal && origin) {
          const nearest = parcelsRef.current[0];
          for (const p of parcelsRef.current) {
            const enu = localENU(origin, p);
            const earthBearing = norm(deg(Math.atan2(enu.east, enu.north)));
            const d = Math.hypot(enu.east, enu.north);
            const angle = rad(cal.xrBearing + ((earthBearing - cal.earthBearing + 540) % 360 - 180));
            const x = cal.xrPosition.x + Math.sin(angle) * d;
            const z = cal.xrPosition.z - Math.cos(angle) * d;
            const marker = markerMeshes.get(p.id), label = labelSprites.get(p.id);
            if (marker) marker.position.set(x, cal.xrPosition.y + 0.15, z);
            if (label) label.position.set(x, cal.xrPosition.y + Math.max(2.5, Math.min(14, d * 0.012)) + 1.5, z);
            if (p === nearest) {
              const relative = norm(earthBearing - viewerBearing);
              setNearestDirection(directionLabel(relative));
            }
          }
        }
        renderer.render(sceneRef.current, renderer.xr.getCamera());
      };
      renderer.setAnimationLoop(render);
      session.addEventListener("end", () => { renderer.setAnimationLoop(null); sessionRef.current = null; setStarted(false); setAligned(false); calibrationRef.current = null; });
    } catch (e) { setError(e instanceof Error ? e.message : "AR başlatılamadı"); setStarted(false); }
  }, [createScene]);

  const stop = useCallback(async () => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    watchRef.current = null;
    if (sessionRef.current) await sessionRef.current.end().catch(() => undefined);
    rendererRef.current?.setAnimationLoop(null); rendererRef.current?.dispose(); rendererRef.current = null; sceneRef.current = null;
    calibrationRef.current = null; calibrationPendingRef.current = false;
    setStarted(false);
  }, []);

  useEffect(() => {
    if (navigator.xr) navigator.xr.isSessionSupported("immersive-ar").then(setXrSupported).catch(() => setXrSupported(false)); else setXrSupported(false);
    if (!navigator.geolocation) { setError("Bu cihazda GPS desteklenmiyor."); return; }
    watchRef.current = navigator.geolocation.watchPosition(updateGps, e => setError(e.code === 1 ? "Konum izni verilmedi" : "GPS alınamadı"), { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 });
    return () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); void stop(); };
  }, [stop, updateGps]);

  const nearest = parcels[0];
  return <div className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
    <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-2">
      <div className="rounded-full bg-black/50 px-2.5 py-1 text-[10px] backdrop-blur"><Camera className="mr-1 inline h-3 w-3" />{started ? "GERÇEK AR" : "SKY SCAN"} · {gps ? `±${Math.round(gps.accuracy ?? 0)}m` : "GPS…"} · {parcels.length} parsel</div>
      {started && <button className="pointer-events-auto rounded-full bg-black/50 p-1.5 backdrop-blur" onClick={() => void stop()} aria-label="AR kapat"><X className="h-3.5 w-3.5" /></button>}
    </div>
    {started && nearest && <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 w-[calc(100%-20px)] max-w-xs -translate-x-1/2 rounded-xl bg-black/55 px-3 py-2 backdrop-blur">
      <div className="flex items-center justify-between text-xs font-semibold"><span>Parsel {nearest.parcel_number}</span><span>{Math.round(nearest.distance)} m</span></div>
      <div className="mt-0.5 flex items-center justify-between text-[10px] text-white/75"><span>{parcels.length} yakın parsel</span><span><Navigation className="mr-0.5 inline h-3 w-3" />{aligned ? nearestDirection : "4 m yürü"}</span></div>
    </div>}
    {!started && <div className="absolute bottom-3 left-1/2 z-20 w-[calc(100%-20px)] max-w-xs -translate-x-1/2 rounded-xl bg-black/60 p-2.5 backdrop-blur">
      <div className="mb-1 text-[10px] text-white/75">{message}</div>{error && <div className="mb-1 text-[10px] text-red-300">{error}</div>}
      <button onClick={() => void startXR()} disabled={xrSupported === false} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-xs font-bold text-black disabled:opacity-40"><LocateFixed className="h-3.5 w-3.5" />Gerçek AR'yi başlat</button>
    </div>}
  </div>;
}
