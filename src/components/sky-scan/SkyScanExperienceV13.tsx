import { Camera, LocateFixed, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Gps = { latitude: number; longitude: number; accuracy: number | null; speed: number | null };
type Point = [number, number];
type Parcel = { id: string; parcel_number: string; polygon: Point[]; latitude: number; longitude: number; distance: number; bearing: number };
type XRSessionLike = XRSession & { requestReferenceSpace(type: string): Promise<XRReferenceSpace> };
type Calibration = { gps: Gps; xrPosition: THREE.Vector3; xrBearing: number; earthBearing: number };

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
  const east = rad(target.longitude - origin.longitude) * R * Math.cos(rad(origin.latitude));
  const north = rad(target.latitude - origin.latitude) * R;
  return { east, north };
}
function xrForwardBearing(quaternion: THREE.Quaternion) {
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);
  return norm(deg(Math.atan2(forward.x, -forward.z)));
}
function earthToXR(origin: Gps, target: { latitude: number; longitude: number }, calibration: Calibration) {
  const { east, north } = localENU(origin, target);
  const earthBearing = norm(deg(Math.atan2(east, north)));
  const distance = Math.hypot(east, north);
  const xrBearing = rad(calibration.xrBearing + norm(earthBearing - calibration.earthBearing));
  return {
    x: calibration.xrPosition.x + Math.sin(xrBearing) * distance,
    y: calibration.xrPosition.y + 1.2,
    z: calibration.xrPosition.z - Math.cos(xrBearing) * distance,
  };
}

export function SkyScanExperienceV13() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<XRSessionLike | null>(null);
  const refSpace = useRef<XRReferenceSpace | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const originRef = useRef<Gps | null>(null);
  const lastGpsRef = useRef<Gps | null>(null);
  const watchRef = useRef<number | null>(null);
  const calibrationRef = useRef<Calibration | null>(null);
  const calibrationPendingRef = useRef(false);
  const [gps, setGps] = useState<Gps | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [started, setStarted] = useState(false);
  const [xrSupported, setXrSupported] = useState<boolean | null>(null);
  const [aligning, setAligning] = useState(true);
  const [message, setMessage] = useState("GPS alınıyor…");
  const [error, setError] = useState<string | null>(null);

  const loadParcels = useCallback(async (pos: Gps) => {
    try {
      const dLat = SEARCH / 111320, dLon = SEARCH / Math.max(111320 * Math.cos(rad(pos.latitude)), 1);
      const { data, error: qError } = await supabaseBrowser.from("sky_scan_parcels").select("id,parcel_id,parcel_number,latitude,longitude,parcels!sky_scan_parcels_parcel_id_fkey(geometry)").gte("latitude", pos.latitude - dLat).lte("latitude", pos.latitude + dLat).gte("longitude", pos.longitude - dLon).lte("longitude", pos.longitude + dLon).limit(2000);
      if (qError) throw qError;
      const rows = (data ?? []).map((r: any) => {
        const poly = parseGeometry(r.parcels?.geometry);
        const c = poly.length >= 3 ? centroid(poly) : [Number(r.longitude), Number(r.latitude)] as Point;
        const target = { latitude: c[1], longitude: c[0] };
        return { id: String(r.parcel_id ?? r.id), parcel_number: String(r.parcel_number ?? "—"), polygon: poly, latitude: target.latitude, longitude: target.longitude, distance: hav(pos, target), bearing: bearing(pos, target) };
      }).filter((p: Parcel) => Number.isFinite(p.distance) && p.distance <= SEARCH).sort((a: Parcel, b: Parcel) => a.distance - b.distance).slice(0, 150);
      setParcels(rows);
      if (!rows.length) setMessage("5 km çevresinde parsel bulunamadı");
    } catch (e) { setError(e instanceof Error ? e.message : "Parseller alınamadı"); }
  }, []);

  const updateGps = useCallback((p: GeolocationPosition) => {
    const n: Gps = { latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: Number.isFinite(p.coords.accuracy) ? p.coords.accuracy : null, speed: Number.isFinite(p.coords.speed) ? p.coords.speed : null };
    setGps(n);
    const previous = lastGpsRef.current;
    if (!originRef.current) { originRef.current = n; void loadParcels(n); }
    if (previous && hav(previous, n) >= 4 && !calibrationRef.current) {
      calibrationPendingRef.current = true;
      setMessage("Hareket algılandı · WebXR kamera yönüyle AR hizalanıyor…");
    }
    lastGpsRef.current = n;
  }, [loadParcels]);

  const createScene = useCallback(() => {
    if (!canvas.current) return;
    const renderer = new THREE.WebGLRenderer({ canvas: canvas.current, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    const scene = new THREE.Scene();
    sceneRef.current = scene;
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
      setMessage("Gerçek AR açık · Pusula yok · 4 m+ yürüyün");

      const group = new THREE.Group();
      sceneRef.current!.add(group);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
      const labelSprites = new Map<string, THREE.Sprite>();
      const markerMeshes = new Map<string, THREE.Mesh>();
      const labelTextures = new Map<string, THREE.CanvasTexture>();

      const rebuildObjects = () => {
        group.clear();
        labelSprites.clear(); markerMeshes.clear(); labelTextures.clear();
        for (const p of parcels) {
          const marker = new THREE.Mesh(new THREE.SphereGeometry(Math.max(0.18, Math.min(1.2, 18 / Math.max(p.distance, 30))), 12, 12), markerMaterial);
          markerMeshes.set(p.id, marker); group.add(marker);
          const c = document.createElement("canvas"); c.width = 512; c.height = 96;
          const ctx = c.getContext("2d")!; ctx.fillStyle = "rgba(0,0,0,.78)"; ctx.fillRect(0, 0, 512, 96); ctx.fillStyle = "white"; ctx.font = "bold 28px sans-serif"; ctx.fillText(`${p.parcel_number} · ${Math.round(p.distance)} m`, 16, 58);
          const texture = new THREE.CanvasTexture(c); labelTextures.set(p.id, texture);
          const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })); sprite.scale.set(4, 0.75, 1); labelSprites.set(p.id, sprite); group.add(sprite);
        }
      };
      rebuildObjects();

      const render = (_time: number, frame: XRFrame) => {
        if (!sessionRef.current || !refSpace.current || !sceneRef.current) return;
        const pose = frame.getViewerPose(refSpace.current);
        if (!pose) return;
        const view = pose.views[0];
        if (!view) return;

        if (calibrationPendingRef.current && !calibrationRef.current && lastGpsRef.current) {
          const movement = lastGpsRef.current;
          const previous = originRef.current;
          if (previous && hav(previous, movement) >= 4) {
            const xrBearing = xrForwardBearing(new THREE.Quaternion(view.transform.orientation.x, view.transform.orientation.y, view.transform.orientation.z, view.transform.orientation.w));
            const earthBearing = bearing(previous, movement);
            calibrationRef.current = { gps: movement, xrPosition: new THREE.Vector3(view.transform.position.x, view.transform.position.y, view.transform.position.z), xrBearing, earthBearing };
            calibrationPendingRef.current = false;
            setAligning(false);
            setMessage(`AR hizalandı · GPS hareketi ${Math.round(earthBearing)}° · WebXR 6DoF aktif`);
          }
        }

        const calibration = calibrationRef.current;
        if (calibration) {
          for (const p of parcels) {
            const pos = earthToXR(calibration.gps, p, calibration);
            const marker = markerMeshes.get(p.id); const label = labelSprites.get(p.id);
            if (marker) marker.position.set(pos.x, pos.y, pos.z);
            if (label) label.position.set(pos.x, pos.y + 1.1, pos.z);
          }
        }
        renderer.render(sceneRef.current, renderer.xr.getCamera(new THREE.Camera()));
      };
      renderer.setAnimationLoop(render);
      session.addEventListener("end", () => { renderer.setAnimationLoop(null); sessionRef.current = null; calibrationRef.current = null; setStarted(false); });
    } catch (e) { setError(e instanceof Error ? e.message : "AR başlatılamadı"); setStarted(false); }
  }, [createScene, parcels]);

  const stop = useCallback(async () => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    watchRef.current = null;
    if (sessionRef.current) await sessionRef.current.end().catch(() => undefined);
    rendererRef.current?.setAnimationLoop(null);
    rendererRef.current?.dispose(); rendererRef.current = null; sceneRef.current = null;
    calibrationRef.current = null;
    setStarted(false);
  }, []);

  useEffect(() => {
    if (navigator.xr) navigator.xr.isSessionSupported("immersive-ar").then(setXrSupported).catch(() => setXrSupported(false)); else setXrSupported(false);
    if (!navigator.geolocation) { setError("Bu cihazda GPS desteklenmiyor."); return; }
    watchRef.current = navigator.geolocation.watchPosition(updateGps, e => setError(e.code === 1 ? "Konum izni verilmedi" : "GPS alınamadı"), { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 });
    return () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); void stop(); };
  }, [stop, updateGps]);

  return <div className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
    <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
    <div className="absolute inset-x-0 top-0 z-20 p-3"><div className="mx-auto max-w-xl rounded-2xl bg-black/70 p-3 backdrop-blur">
      <div className="flex items-center justify-between"><b className="flex items-center gap-2"><Camera className="h-5 w-5" />Gerçek AR Sky Scan</b>{started && <button onClick={() => void stop()} aria-label="AR kapat"><X className="h-5 w-5" /></button>}</div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs"><span>GPS: {gps ? `${Math.round(gps.accuracy ?? 0)} m` : "—"}</span><span>Parsel: {parcels.length}</span><span>XR: {xrSupported ? "hazır" : "yok"}</span></div>
      <div className="mt-2 text-xs">{message}</div>
      {error && <div className="mt-2 text-xs text-red-300">{error}</div>}
      {!started && <button onClick={() => void startXR()} disabled={xrSupported === false} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-black disabled:opacity-40"><LocateFixed className="h-4 w-4" />Gerçek AR'yi başlat</button>}
      {started && aligning && <div className="mt-3 rounded-xl bg-amber-500/20 p-2 text-xs">Pusula kullanılmıyor. Telefonla en az 4 metre yürüyün; WebXR kameranın 6DoF yönü GPS hareketiyle bir kez hizalanacak.</div>}
    </div></div>
  </div>;
}
