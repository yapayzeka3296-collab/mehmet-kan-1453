import { Camera, Compass, LocateFixed, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Gps = { latitude: number; longitude: number; accuracy: number | null; heading: number | null };
type Point = [number, number];
type Parcel = { id: string; parcel_number: string; polygon: Point[]; latitude: number; longitude: number; distance: number; bearing: number; world: THREE.Vector3 };
type Orientation = { heading: number | null; pitch: number; roll: number; absolute: boolean; source: string; alpha: number | null; beta: number | null; gamma: number | null };
type DebugState = { target: THREE.Vector3; inFrustum: boolean; relativeBearing: number | null };

const R = 6371000;
const SEARCH = 5000;
const VIRTUAL_ELEVATION_DEG = 15;
const EYE_HEIGHT = 1.6;
const norm = (n: number) => ((n % 360) + 360) % 360;
const rad = (n: number) => n * Math.PI / 180;
const angleDelta = (a: number, b: number) => ((a - b + 540) % 360) - 180;
const hav = (a: Gps, b: { latitude: number; longitude: number }) => {
  const p1 = rad(a.latitude), p2 = rad(b.latitude), d1 = p2 - p1, d2 = rad(b.longitude - a.longitude);
  const h = Math.sin(d1 / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(d2 / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};
const bearing = (a: Gps, b: { latitude: number; longitude: number }) => {
  const p1 = rad(a.latitude), p2 = rad(b.latitude), dl = rad(b.longitude - a.longitude);
  return norm(Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl)) * 180 / Math.PI);
};

function centroid(p: Point[]): Point {
  if (p.length < 3) return p[0] ?? [0, 0];
  const ring = p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1] ? p : [...p, p[0]];
  let a = 0, x = 0, y = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i], [x2, y2] = ring[i + 1], f = x1 * y2 - x2 * y1;
    a += f; x += (x1 + x2) * f; y += (y1 + y2) * f;
  }
  return Math.abs(a) < 1e-12 ? p[0] : [x / (3 * a), y / (3 * a)];
}

function readWkbPolygon(hex: string): Point[] {
  const clean = hex.replace(/^\\x/i, "").replace(/\s+/g, "");
  if (!/^[0-9a-f]+$/i.test(clean) || clean.length < 18 || clean.length % 2) return [];
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  const view = new DataView(bytes.buffer);
  let off = 0;
  const readU8 = () => view.getUint8(off++);
  const readU32 = (le: boolean) => { const v = view.getUint32(off, le); off += 4; return v; };
  const readF64 = (le: boolean) => { const v = view.getFloat64(off, le); off += 8; return v; };
  try {
    const little = readU8() === 1;
    let type = readU32(little);
    if ((type & 0x20000000) !== 0) { off += 4; type &= ~0x20000000; }
    const hasZ = (type & 0x80000000) !== 0 || type === 1003 || type === 1008;
    type &= 0x0fffffff;
    if (type >= 1000) type -= 1000;
    if (type !== 3) return [];
    const rings = readU32(little);
    if (!rings) return [];
    const count = readU32(little);
    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
      const x = readF64(little), y = readF64(little);
      if (hasZ) readF64(little);
      if (Number.isFinite(x) && Number.isFinite(y)) points.push([x, y]);
    }
    for (let r = 1; r < rings; r++) {
      const n = readU32(little);
      for (let i = 0; i < n; i++) { readF64(little); readF64(little); if (hasZ) readF64(little); }
    }
    return points;
  } catch { return []; }
}

function parseGeometry(raw: unknown): Point[] {
  if (!raw) return [];
  if (typeof raw === "object") {
    const v = raw as { type?: string; geometry?: unknown; coordinates?: unknown };
    const g = v.type === "Feature" ? v.geometry as { type?: string; coordinates?: unknown } : v;
    if (g?.type === "Polygon" && Array.isArray(g.coordinates) && Array.isArray(g.coordinates[0])) {
      return (g.coordinates[0] as unknown[]).map((p) => Array.isArray(p) ? [+p[0], +p[1]] as Point : [NaN, NaN]).filter((p) => p.every(Number.isFinite));
    }
  }
  const s = String(raw).trim();
  if (/^(POLYGON|SRID=\d+;POLYGON)/i.test(s)) {
    const body = s.replace(/^SRID=\d+;/i, "").replace(/^POLYGON\s*\(\(/i, "").replace(/\)\)\s*$/, "");
    return body.split(",").map((q) => q.trim().split(/\s+/).slice(0, 2).map(Number) as Point).filter((p) => p.every(Number.isFinite));
  }
  if (/^(\\x)?[0-9a-f]{36,}$/i.test(s)) return readWkbPolygon(s);
  if (s.startsWith("{")) try { return parseGeometry(JSON.parse(s)); } catch { return []; }
  return [];
}

function readOrientation(e: DeviceOrientationEvent): Orientation | null {
  const v = e as DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };
  const alpha = typeof e.alpha === "number" ? e.alpha : null;
  const beta = typeof e.beta === "number" ? e.beta : null;
  const gamma = typeof e.gamma === "number" ? e.gamma : null;
  let heading: number | null = typeof v.webkitCompassHeading === "number" ? norm(v.webkitCompassHeading) : null;
  if (heading === null && e.absolute && alpha !== null) heading = norm(360 - alpha);
  const screenAngle = window.screen.orientation?.angle ?? 0;
  if (heading !== null && typeof v.webkitCompassHeading !== "number") heading = norm(heading + (screenAngle === 90 ? 90 : screenAngle === 270 ? -90 : screenAngle === 180 ? 180 : 0));
  if (heading === null && beta === null && gamma === null) return null;
  return { heading, pitch: beta === null ? 0 : beta - 90, roll: gamma ?? 0, absolute: e.absolute === true || e.type === "deviceorientationabsolute", source: v.webkitCompassHeading !== undefined ? "iOS pusula" : e.absolute ? "Mutlak pusula" : heading !== null ? "Pusula" : "Eğim sensörü", alpha, beta, gamma };
}

async function permissions() {
  try {
    const D = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> };
    const M = window.DeviceMotionEvent as typeof DeviceMotionEvent & { requestPermission?: () => Promise<PermissionState> };
    if (typeof D.requestPermission === "function" && await D.requestPermission() !== "granted") return false;
    if (typeof M.requestPermission === "function" && await M.requestPermission() !== "granted") return false;
    return true;
  } catch { return false; }
}

function enu(o: Gps, p: Point) {
  const east = rad(p[0] - o.longitude) * R * Math.cos(rad(o.latitude));
  const north = rad(p[1] - o.latitude) * R;
  return new THREE.Vector3(east, 0, -north);
}

function compressedDistance(d: number) {
  return d <= 1000 ? d : 1000 + (d - 1000) * 0.65;
}

export function SkyScanExperienceV10() {
  const video = useRef<HTMLVideoElement>(null), mount = useRef<HTMLDivElement>(null), watch = useRef<number | null>(null), stream = useRef<MediaStream | null>(null), gpsRef = useRef<Gps | null>(null), lastLoad = useRef<Gps | null>(null), busy = useRef(false), sceneRef = useRef<{ renderer: THREE.WebGLRenderer; raf: number } | null>(null), oRef = useRef<Orientation>({ heading: null, pitch: 0, roll: 0, absolute: false, source: "Sensör aranıyor", alpha: null, beta: null, gamma: null });
  const [o, setO] = useState(oRef.current), [gps, setGps] = useState<Gps | null>(null), [parcels, setParcels] = useState<Parcel[]>([]), [started, setStarted] = useState(false), [loading, setLoading] = useState(false), [error, setError] = useState<string | null>(null), [sensor, setSensor] = useState("Pusula sensörü aranıyor…"), [debugOpen, setDebugOpen] = useState(false), [debug, setDebug] = useState<DebugState>({ target: new THREE.Vector3(), inFrustum: false, relativeBearing: null });

  const load = useCallback(async (pos: Gps) => {
    if (busy.current) return;
    busy.current = true; setLoading(true); setError(null);
    try {
      const city = await supabaseBrowser.from("cities").select("id").eq("slug", "gaziantep").eq("is_active", true).maybeSingle();
      if (city.error || !city.data) throw city.error ?? new Error("Gaziantep bulunamadı");
      const dLat = SEARCH / 111320, dLon = SEARCH / Math.max(111320 * Math.cos(rad(pos.latitude)), 1);
      const q = await supabaseBrowser.from("sky_scan_parcels").select("id,parcel_id,parcel_number,latitude,longitude,parcels!sky_scan_parcels_parcel_id_fkey(geometry)").eq("city_id", city.data.id).gte("latitude", pos.latitude - dLat).lte("latitude", pos.latitude + dLat).gte("longitude", pos.longitude - dLon).lte("longitude", pos.longitude + dLon).limit(2000);
      if (q.error) throw q.error;
      const rows = (q.data ?? []).map((r: any) => {
        const poly = parseGeometry(r.parcels?.geometry);
        const c = poly.length >= 3 ? centroid(poly) : [Number(r.longitude), Number(r.latitude)] as Point;
        const t = { latitude: c[1], longitude: c[0] }, distance = hav(pos, t), b = bearing(pos, t);
        const raw = enu(pos, [t.longitude, t.latitude]);
        const scale = distance > 0 ? compressedDistance(distance) / distance : 1;
        const y = EYE_HEIGHT + compressedDistance(distance) * Math.tan(rad(VIRTUAL_ELEVATION_DEG));
        return { id: String(r.parcel_id ?? r.id), parcel_number: String(r.parcel_number ?? "—"), polygon: poly, latitude: t.latitude, longitude: t.longitude, distance, bearing: b, world: new THREE.Vector3(raw.x * scale, y, raw.z * scale) };
      }).filter((p: Parcel) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && p.distance <= SEARCH).sort((a: Parcel, b: Parcel) => a.distance - b.distance).slice(0, 150);
      setParcels(rows); lastLoad.current = pos;
      if (!rows.length) setError("5 km çevresinde parsel bulunamadı");
    } catch (e) { setError(e instanceof Error ? e.message : "Parseller alınamadı"); }
    finally { busy.current = false; setLoading(false); }
  }, []);

  const addParcels = useCallback((root: THREE.Group, labels: THREE.Group, pos: Gps, items: Parcel[]) => {
    root.clear(); labels.clear();
    items.forEach((p, index) => {
      const target = p.world;
      if (p.polygon.length >= 3) {
        const shape = new THREE.Shape();
        p.polygon.forEach((pt, i) => { const v = enu(pos, pt); const scale = p.distance > 0 ? compressedDistance(p.distance) / p.distance : 1; const x = v.x * scale, z = v.z * scale; if (i) shape.lineTo(x, z); else shape.moveTo(x, z); });
        shape.closePath();
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 8, bevelEnabled: false });
        geo.rotateX(-Math.PI / 2); geo.translate(0, target.y, 0);
        const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }));
        root.add(mesh);
        const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 }));
        root.add(edge);
      }
      const marker = new THREE.Mesh(new THREE.SphereGeometry(Math.max(2.5, Math.min(7, 120 / Math.max(p.distance, 30))), 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false }));
      marker.position.copy(target); root.add(marker);
      const c = document.createElement("canvas"); c.width = 520; c.height = 100;
      const x = c.getContext("2d")!; x.fillStyle = "rgba(0,0,0,.82)"; x.fillRect(4, 4, 512, 92); x.fillStyle = "#fff"; x.font = "bold 30px sans-serif"; x.fillText(p.parcel_number, 18, 42); x.font = "22px sans-serif"; x.fillText(`${Math.round(p.distance)} m · ${Math.round(p.bearing)}°`, 18, 75);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthTest: false }));
      sprite.position.set(target.x, target.y + 10, target.z); sprite.scale.set(18, 3.5, 1); sprite.userData.baseY = target.y + 10; sprite.userData.phase = index * 0.37; labels.add(sprite);
    });
  }, []);

  const draw = useCallback((pos: Gps, items: Parcel[]) => {
    const el = mount.current; if (!el) return;
    if (sceneRef.current) { cancelAnimationFrame(sceneRef.current.raf); sceneRef.current.renderer.dispose(); }
    el.innerHTML = "";
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(70, el.clientWidth / Math.max(el.clientHeight, 1), 0.1, 50000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.setSize(el.clientWidth, el.clientHeight); renderer.setClearColor(0, 0); el.appendChild(renderer.domElement);
    const root = new THREE.Group(), labels = new THREE.Group(); scene.add(root, labels); addParcels(root, labels, pos, items);
    const tick = (now: number) => {
      const current = oRef.current;
      if (current.heading !== null) {
        const euler = new THREE.Euler(rad(current.beta ?? 0), rad(current.alpha ?? (360 - current.heading)), rad(-(current.gamma ?? 0)), "YXZ");
        const q = new THREE.Quaternion().setFromEuler(euler);
        q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -rad(window.screen.orientation?.angle ?? 0)));
        q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2));
        if (!cam.userData.sensorQ) cam.userData.sensorQ = q.clone(); else (cam.userData.sensorQ as THREE.Quaternion).slerp(q, 0.18);
        cam.quaternion.copy(cam.userData.sensorQ as THREE.Quaternion);
      }
      labels.children.forEach((obj) => { const s = obj as THREE.Sprite; const base = Number(s.userData.baseY ?? s.position.y); s.position.y = base + Math.sin(now * 0.0015 + Number(s.userData.phase ?? 0)) * 1.5; });
      if (items[0]) {
        const rel = oRef.current.heading === null ? null : angleDelta(items[0].bearing, oRef.current.heading);
        const projected = items[0].world.clone().project(cam);
        setDebug({ target: items[0].world.clone(), inFrustum: projected.z >= -1 && projected.z <= 1 && Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1, relativeBearing: rel });
      }
      renderer.render(scene, cam); const raf = requestAnimationFrame(tick); sceneRef.current = { renderer, raf };
    };
    const resize = () => { cam.aspect = el.clientWidth / Math.max(el.clientHeight, 1); cam.updateProjectionMatrix(); renderer.setSize(el.clientWidth, el.clientHeight); };
    window.addEventListener("resize", resize); tick(performance.now());
  }, [addParcels]);

  useEffect(() => { if (gps && parcels.length) draw(gps, parcels); }, [gps, parcels, draw]);

  const start = useCallback(async () => {
    setStarted(true); setError(null); setSensor("Sensör başlatılıyor…");
    const granted = await permissions();
    if (!granted) { setSensor("Sensör izni verilmedi"); }
    let seenOrientation = false, absoluteLocked = false;
    const onOrientation = (e: Event) => {
      const r = readOrientation(e as DeviceOrientationEvent); if (!r) return;
      seenOrientation = true;
      if (r.absolute) absoluteLocked = true;
      if (!absoluteLocked || r.absolute || r.source === "iOS pusula") { oRef.current = r; setO(r); }
      setSensor(r.heading === null ? "Hareket sensörü aktif · pusula aranıyor" : r.absolute ? "Mutlak pusula aktif" : "Pusula aktif");
    };
    const onMotion = () => { if (!seenOrientation) setSensor("Hareket sensörü aktif · pusula aranıyor"); };
    window.addEventListener("deviceorientationabsolute", onOrientation, true); window.addEventListener("deviceorientation", onOrientation, true); window.addEventListener("devicemotion", onMotion, true);
    if (!seenOrientation) window.setTimeout(() => { if (!seenOrientation) setSensor("Sensör verisi alınamadı · kamera açık"); }, 4000);
    if (navigator.geolocation) watch.current = navigator.geolocation.watchPosition((p) => {
      const n: Gps = { latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: Number.isFinite(p.coords.accuracy) ? p.coords.accuracy : null, heading: Number.isFinite(p.coords.heading) && p.coords.heading >= 0 ? p.coords.heading : null };
      gpsRef.current = n; setGps(n);
      const old = lastLoad.current; const improved = old && (n.accuracy ?? 999) + 10 < (old.accuracy ?? 999);
      if (!old || hav(old, n) > 100 || improved || parcels.length === 0) void load(n);
    }, (e) => setError(e.code === 1 ? "Konum izni verilmedi" : "GPS alınamadı"), { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 });
    try { const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false }); stream.current = s; if (video.current) { video.current.srcObject = s; await video.current.play(); } }
    catch (e) { setError(e instanceof Error ? e.message : "Kamera açılamadı"); }
  }, [load, parcels.length]);

  const stop = useCallback(() => {
    if (watch.current !== null) navigator.geolocation.clearWatch(watch.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    if (sceneRef.current) { cancelAnimationFrame(sceneRef.current.raf); sceneRef.current.renderer.dispose(); sceneRef.current = null; }
    setStarted(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const nearest = parcels[0];
  const dir = nearest && o.heading !== null ? angleDelta(nearest.bearing, o.heading) : null;
  const dirText = dir === null ? "Yön bekleniyor" : Math.abs(dir) < 25 ? "DÜZ" : dir > 0 && dir < 160 ? "SAĞ" : dir < 0 && dir > -160 ? "SOL" : "ARKA";
  const label = o.heading !== null ? (o.absolute ? "Mutlak pusula aktif" : "Pusula aktif") : sensor;
  const arrowText = dir === null ? "Pusula Kalibre Ediliyor…" : Math.abs(dir) <= 35 ? `↑ ${Math.round(Math.abs(dir))}°` : dir > 0 ? `→ ${Math.round(Math.abs(dir))}° Sağda` : `← ${Math.round(Math.abs(dir))}° Solda`;

  return <div className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
    <video ref={video} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
    <div ref={mount} className="pointer-events-none absolute inset-0 z-10" />
    <div className="absolute inset-x-0 top-0 z-20 p-3"><div className="mx-auto max-w-xl rounded-2xl bg-black/65 p-3">
      <div className="flex items-center justify-between"><b className="flex items-center gap-2"><Camera className="h-5 w-5" />3B Sky Scan AR</b><button onClick={stop}><X className="h-5 w-5" /></button></div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs"><span>GPS: {gps ? `${Math.round(gps.accuracy ?? 0)} m` : "—"}</span><span>Heading: {o.heading === null ? "—" : `${Math.round(o.heading)}°`}</span><span>Parsel: {parcels.length}</span></div>
      <div className="mt-2 text-xs">GPS + sensör AR aktif · {parcels.length} parsel hazır · {label}</div>
      {nearest && <div className="mt-2 rounded-xl bg-black/70 p-2 text-sm">En yakın <b>{nearest.parcel_number}</b> · {Math.round(nearest.distance)} m · {dirText}</div>}
      {nearest && <div className="mt-2 rounded-xl bg-black/60 p-2 text-center text-lg font-bold">{arrowText}</div>}
      {error && <div className="mt-2 text-xs text-red-300">{error}</div>}
      <button onClick={() => setDebugOpen((v) => !v)} className="mt-2 rounded-lg bg-white/10 px-2 py-1 text-[11px]">{debugOpen ? "Debug kapat" : "AR Debug"}</button>
      {debugOpen && <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 rounded-xl bg-black/80 p-2 font-mono text-[10px] text-white/90">
        <span>Lat: {gps?.latitude.toFixed(6) ?? "—"}</span><span>Lng: {gps?.longitude.toFixed(6) ?? "—"}</span><span>Accuracy: {gps?.accuracy?.toFixed(1) ?? "—"}</span><span>Alpha: {o.alpha?.toFixed(1) ?? "—"}</span><span>Absolute: {String(o.absolute)}</span><span>Heading: {o.heading?.toFixed(1) ?? "—"}</span><span>Beta: {o.beta?.toFixed(1) ?? "—"}</span><span>Gamma: {o.gamma?.toFixed(1) ?? "—"}</span><span>World X: {debug.target.x.toFixed(1)}</span><span>World Y: {debug.target.y.toFixed(1)}</span><span>World Z: {debug.target.z.toFixed(1)}</span><span>Pitch: {o.pitch.toFixed(1)}°</span><span>FOV: 70°</span><span>Aspect: {mount.current ? (mount.current.clientWidth / Math.max(mount.current.clientHeight, 1)).toFixed(2) : "—"}</span><span>Frustum: {debug.inFrustum ? "Evet" : "Hayır"}</span><span>Rel. bearing: {debug.relativeBearing?.toFixed(1) ?? "—"}°</span>
      </div>}
    </div></div>
    {!started && <div className="absolute inset-x-4 bottom-8 z-30"><button onClick={start} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-bold text-black"><LocateFixed className="h-5 w-5" />GPS + sensör AR taramasını başlat</button></div>}
    {started && <div className="absolute bottom-4 left-3 right-3 z-20 flex items-center justify-between gap-2"><div className="rounded-full bg-black/65 px-4 py-2 text-sm">{loading ? "Parseller yükleniyor…" : `${parcels.length} parsel hazır · ${label}`}</div><button onClick={() => gps && load(gps)} className="rounded-full bg-black/65 p-3"><RefreshCw className="h-5 w-5" /></button></div>}
    <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 opacity-60"><Compass className="h-8 w-8" /></div>
  </div>;
}
