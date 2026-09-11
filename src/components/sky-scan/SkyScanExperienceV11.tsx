import { Camera, Compass, LocateFixed, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Gps = { latitude: number; longitude: number; accuracy: number | null; heading: number | null; speed: number | null };
type Point = [number, number];
type Parcel = { id: string; parcel_number: string; polygon: Point[]; latitude: number; longitude: number; distance: number; bearing: number; world: THREE.Vector3 };
type Orientation = { heading: number | null; pitch: number; roll: number; absolute: boolean; source: string; alpha: number | null; beta: number | null; gamma: number | null };
type DebugState = { target: THREE.Vector3; inFrustum: boolean; relativeBearing: number | null; cameraBearing: number | null; elevation: number | null; cameraPitch: number | null };
type SceneState = { renderer: THREE.WebGLRenderer; raf: number; resize: () => void };

const R = 6371000;
const SEARCH = 5000;
const VIRTUAL_ELEVATION_DEG = 15;
const EYE_HEIGHT = 1.6;
const norm = (n: number) => ((n % 360) + 360) % 360;
const rad = (n: number) => n * Math.PI / 180;
const deg = (n: number) => n * 180 / Math.PI;
const angleDelta = (a: number, b: number) => ((a - b + 540) % 360) - 180;
const hav = (a: Gps, b: { latitude: number; longitude: number }) => {
  const p1 = rad(a.latitude), p2 = rad(b.latitude), d1 = p2 - p1, d2 = rad(b.longitude - a.longitude);
  const h = Math.sin(d1 / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(d2 / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};
const bearing = (a: Gps, b: { latitude: number; longitude: number }) => {
  const p1 = rad(a.latitude), p2 = rad(b.latitude), dl = rad(b.longitude - a.longitude);
  return norm(deg(Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl))));
};
function centroid(p: Point[]): Point {
  if (p.length < 3) return p[0] ?? [0, 0];
  const ring = p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1] ? p : [...p, p[0]];
  let a = 0, x = 0, y = 0;
  for (let i = 0; i < ring.length - 1; i++) { const [x1, y1] = ring[i], [x2, y2] = ring[i + 1], f = x1 * y2 - x2 * y1; a += f; x += (x1 + x2) * f; y += (y1 + y2) * f; }
  return Math.abs(a) < 1e-12 ? p[0] : [x / (3 * a), y / (3 * a)];
}
function readWkbPolygon(hex: string): Point[] {
  const clean = hex.replace(/^\\x/i, "").replace(/\s+/g, "");
  if (!/^[0-9a-f]+$/i.test(clean) || clean.length < 18 || clean.length % 2) return [];
  const bytes = new Uint8Array(clean.length / 2); for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  const view = new DataView(bytes.buffer); let off = 0; const u8 = () => view.getUint8(off++); const u32 = (le: boolean) => { const v = view.getUint32(off, le); off += 4; return v; }; const f64 = (le: boolean) => { const v = view.getFloat64(off, le); off += 8; return v; };
  try { const le = u8() === 1; let type = u32(le); if ((type & 0x20000000) !== 0) { off += 4; type &= ~0x20000000; } const z = (type & 0x80000000) !== 0; type &= 0x0fffffff; if (type >= 1000) type -= 1000; if (type !== 3) return []; const rings = u32(le); if (!rings) return []; const points: Point[] = []; const count = u32(le); for (let i = 0; i < count; i++) { const x = f64(le), y = f64(le); if (z) f64(le); if (Number.isFinite(x) && Number.isFinite(y)) points.push([x, y]); } for (let r = 1; r < rings; r++) { const n = u32(le); for (let i = 0; i < n; i++) { f64(le); f64(le); if (z) f64(le); } } return points; } catch { return []; }
}
function parseGeometry(raw: unknown): Point[] {
  if (!raw) return [];
  if (typeof raw === "object") { const v = raw as { type?: string; geometry?: unknown; coordinates?: unknown }; const g = v.type === "Feature" ? v.geometry as { type?: string; coordinates?: unknown } : v; if (g?.type === "Polygon" && Array.isArray(g.coordinates?.[0])) return (g.coordinates[0] as unknown[]).map(p => Array.isArray(p) ? [+p[0], +p[1]] as Point : [NaN, NaN]).filter(p => p.every(Number.isFinite)); }
  const s = String(raw).trim();
  if (/^(POLYGON|SRID=\d+;POLYGON)/i.test(s)) { const body = s.replace(/^SRID=\d+;/i, "").replace(/^POLYGON\s*\(\(/i, "").replace(/\)\)\s*$/, ""); return body.split(",").map(q => q.trim().split(/\s+/).slice(0, 2).map(Number) as Point).filter(p => p.every(Number.isFinite)); }
  if (/^(\\x)?[0-9a-f]{36,}$/i.test(s)) return readWkbPolygon(s);
  if (s.startsWith("{")) try { return parseGeometry(JSON.parse(s)); } catch { return []; }
  return [];
}
function readOrientation(e: DeviceOrientationEvent): Orientation | null {
  const v = e as DeviceOrientationEvent & { webkitCompassHeading?: number };
  const alpha = typeof e.alpha === "number" ? e.alpha : null, beta = typeof e.beta === "number" ? e.beta : null, gamma = typeof e.gamma === "number" ? e.gamma : null;
  let heading = typeof v.webkitCompassHeading === "number" && Number.isFinite(v.webkitCompassHeading) ? norm(v.webkitCompassHeading) : null;
  const absolute = e.absolute === true || e.type === "deviceorientationabsolute";
  if (heading === null && absolute && alpha !== null) heading = norm(360 - alpha);
  const relative = heading === null && alpha !== null;
  if (heading === null && beta === null && gamma === null) return null;
  const screenAngle = window.screen.orientation?.angle ?? 0;
  if (heading !== null && typeof v.webkitCompassHeading !== "number") heading = norm(heading + screenAngle);
  return { heading, pitch: beta === null ? 0 : beta - 90, roll: gamma ?? 0, absolute, source: typeof v.webkitCompassHeading === "number" ? "iOS pusula" : absolute && heading !== null ? "Mutlak pusula" : relative ? "Göreli sensör" : "Eğim sensörü", alpha, beta, gamma };
}
async function permissions() {
  try { const D = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: (absolute?: boolean) => Promise<PermissionState> }; const M = window.DeviceMotionEvent as typeof DeviceMotionEvent & { requestPermission?: () => Promise<PermissionState> }; if (typeof D.requestPermission === "function" && await D.requestPermission(true) !== "granted") return false; if (typeof M.requestPermission === "function" && await M.requestPermission() !== "granted") return false; return true; } catch { return false; }
}
function enu(o: Gps, p: Point) { const east = rad(p[0] - o.longitude) * R * Math.cos(rad(o.latitude)); const north = rad(p[1] - o.latitude) * R; return new THREE.Vector3(east, 0, -north); }
function compressedDistance(d: number) { return d <= 1000 ? d : 1000 + (d - 1000) * 0.65; }

export function SkyScanExperienceV11() {
  const video = useRef<HTMLVideoElement>(null), mount = useRef<HTMLDivElement>(null), watch = useRef<number | null>(null), stream = useRef<MediaStream | null>(null), lastLoad = useRef<Gps | null>(null), busy = useRef(false), sceneRef = useRef<SceneState | null>(null), sensorCleanup = useRef<(() => void) | null>(null), sensorTimer = useRef<number | null>(null), oRef = useRef<Orientation>({ heading: null, pitch: 0, roll: 0, absolute: false, source: "Sensör aranıyor", alpha: null, beta: null, gamma: null });
  const relativeHeadingRef = useRef<number | null>(null), headingOffsetRef = useRef<number | null>(null), debugRef = useRef(false);
  const [o, setO] = useState(oRef.current), [gps, setGps] = useState<Gps | null>(null), [sceneGps, setSceneGps] = useState<Gps | null>(null), [parcels, setParcels] = useState<Parcel[]>([]), [started, setStarted] = useState(false), [loading, setLoading] = useState(false), [error, setError] = useState<string | null>(null), [sensor, setSensor] = useState("Pusula sensörü aranıyor…"), [debugOpen, setDebugOpen] = useState(false), [debug, setDebug] = useState<DebugState>({ target: new THREE.Vector3(), inFrustum: false, relativeBearing: null, cameraBearing: null, elevation: null, cameraPitch: null });
  const load = useCallback(async (pos: Gps) => {
    if (busy.current) return; busy.current = true; setLoading(true); setError(null);
    try {
      const dLat = SEARCH / 111320, dLon = SEARCH / Math.max(111320 * Math.cos(rad(pos.latitude)), 1);
      const query = supabaseBrowser.from("sky_scan_parcels").select("id,parcel_id,parcel_number,latitude,longitude,parcels!sky_scan_parcels_parcel_id_fkey(geometry)").gte("latitude", pos.latitude - dLat).lte("latitude", pos.latitude + dLat).gte("longitude", pos.longitude - dLon).lte("longitude", pos.longitude + dLon).limit(2000);
      const q = await Promise.race([query, new Promise<never>((_, reject) => window.setTimeout(() => reject(new Error("Parsel sorgusu zaman aşımına uğradı")), 12000))]); if (q.error) throw q.error;
      const rows = (q.data ?? []).map((r: any) => { const poly = parseGeometry(r.parcels?.geometry); const c = poly.length >= 3 ? centroid(poly) : [Number(r.longitude), Number(r.latitude)] as Point; const target = { latitude: c[1], longitude: c[0] }; const distance = hav(pos, target), b = bearing(pos, target), raw = enu(pos, [target.longitude, target.latitude]); const scale = distance > 0 ? compressedDistance(distance) / distance : 1; const y = EYE_HEIGHT + compressedDistance(distance) * Math.tan(rad(VIRTUAL_ELEVATION_DEG)); return { id: String(r.parcel_id ?? r.id), parcel_number: String(r.parcel_number ?? "—"), polygon: poly, latitude: target.latitude, longitude: target.longitude, distance, bearing: b, world: new THREE.Vector3(raw.x * scale, y, raw.z * scale) }; }).filter((p: Parcel) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && p.distance <= SEARCH).sort((a: Parcel, b: Parcel) => a.distance - b.distance).slice(0, 150);
      setParcels(rows); setSceneGps(pos); lastLoad.current = pos; if (!rows.length) setError("5 km çevresinde parsel bulunamadı");
    } catch (e) { setError(e instanceof Error ? e.message : "Parseller alınamadı"); } finally { busy.current = false; setLoading(false); }
  }, []);
  const disposeScene = useCallback(() => { const s = sceneRef.current; if (!s) return; cancelAnimationFrame(s.raf); window.removeEventListener("resize", s.resize); s.renderer.dispose(); sceneRef.current = null; if (mount.current) mount.current.innerHTML = ""; }, []);
  const addParcels = useCallback((root: THREE.Group, labels: THREE.Group, pos: Gps, items: Parcel[]) => {
    root.clear(); labels.clear(); items.forEach((p, index) => { const target = p.world; if (p.polygon.length >= 3) { const shape = new THREE.Shape(); p.polygon.forEach((pt, i) => { const v = enu(pos, pt), scale = p.distance > 0 ? compressedDistance(p.distance) / p.distance : 1, x = v.x * scale, z = v.z * scale; if (i) shape.lineTo(x, z); else shape.moveTo(x, z); }); shape.closePath(); const geo = new THREE.ExtrudeGeometry(shape, { depth: 8, bevelEnabled: false }); geo.rotateX(-Math.PI / 2); geo.translate(0, target.y, 0); root.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }))); root.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 }))); } const marker = new THREE.Mesh(new THREE.SphereGeometry(Math.max(2.5, Math.min(7, 120 / Math.max(p.distance, 30))), 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false })); marker.position.copy(target); root.add(marker); const c = document.createElement("canvas"); c.width = 520; c.height = 100; const ctx = c.getContext("2d")!; ctx.fillStyle = "rgba(0,0,0,.82)"; ctx.fillRect(4, 4, 512, 92); ctx.fillStyle = "#fff"; ctx.font = "bold 30px sans-serif"; ctx.fillText(p.parcel_number, 18, 42); ctx.font = "22px sans-serif"; ctx.fillText(`${Math.round(p.distance)} m · ${Math.round(p.bearing)}°`, 18, 75); const texture = new THREE.CanvasTexture(c); const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false })); sprite.position.set(target.x, target.y + 10, target.z); sprite.scale.set(18, 3.5, 1); sprite.userData.baseY = target.y + 10; sprite.userData.phase = index * 0.37; labels.add(sprite); });
  }, []);
  const draw = useCallback((pos: Gps, items: Parcel[]) => {
    const el = mount.current; if (!el || !items.length) return; disposeScene(); const scene = new THREE.Scene(); const cam = new THREE.PerspectiveCamera(70, el.clientWidth / Math.max(el.clientHeight, 1), 0.1, 50000); const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); renderer.setSize(el.clientWidth, el.clientHeight); renderer.setClearColor(0, 0); el.appendChild(renderer.domElement); const root = new THREE.Group(), labels = new THREE.Group(); scene.add(root, labels); addParcels(root, labels, pos, items); const smoothQ = new THREE.Quaternion(); let hasSmooth = false, lastDebug = 0;
    const tick = (now: number) => {
      const current = oRef.current; const heading = current.heading; const screen = window.screen.orientation?.angle ?? 0;
      if (heading !== null) {
        const yaw = -rad(norm(heading + screen)); const pitch = rad(-current.pitch); const roll = rad(current.roll); const targetQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(pitch, yaw, roll, "YXZ")); if (!hasSmooth) { smoothQ.copy(targetQ); hasSmooth = true; } else smoothQ.slerp(targetQ, 0.22); cam.quaternion.copy(smoothQ);
      }
      labels.children.forEach(obj => { const s = obj as THREE.Sprite, base = Number(s.userData.baseY ?? s.position.y); s.position.y = base + Math.sin(now * 0.0015 + Number(s.userData.phase ?? 0)) * 1.5; });
      if (items[0] && debugRef.current && now - lastDebug > 200) {
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.quaternion), cameraBearing = norm(deg(Math.atan2(forward.x, -forward.z))); const rel = heading === null ? null : angleDelta(items[0].bearing, heading); const target = items[0].world.clone(); const horizontal = Math.hypot(target.x, target.z); const elevation = deg(Math.atan2(target.y - EYE_HEIGHT, Math.max(horizontal, 0.001))); const cameraPitch = deg(Math.asin(THREE.MathUtils.clamp(-forward.y, -1, 1))); const projected = target.project(cam); const inFrustum = projected.z >= -1 && projected.z <= 1 && Math.abs(projected.x) <= 1 && Math.abs(projected.y) <= 1; setDebug({ target, inFrustum, relativeBearing: rel, cameraBearing, elevation, cameraPitch }); lastDebug = now;
      }
      renderer.render(scene, cam); if (sceneRef.current) sceneRef.current.raf = requestAnimationFrame(tick);
    };
    const resize = () => { cam.aspect = el.clientWidth / Math.max(el.clientHeight, 1); cam.updateProjectionMatrix(); renderer.setSize(el.clientWidth, el.clientHeight); }; window.addEventListener("resize", resize); sceneRef.current = { renderer, raf: requestAnimationFrame(tick), resize };
  }, [addParcels, disposeScene]);
  useEffect(() => { if (sceneGps && parcels.length) draw(sceneGps, parcels); }, [sceneGps, parcels, draw]);
  const start = useCallback(async () => {
    sensorCleanup.current?.(); if (sensorTimer.current !== null) window.clearTimeout(sensorTimer.current); setStarted(true); setError(null); setSensor("Sensör başlatılıyor…"); relativeHeadingRef.current = null; headingOffsetRef.current = null;
    const granted = await permissions(); if (!granted) setSensor("Sensör izni verilmedi · kamera ve GPS devam ediyor"); let seen = false, absoluteLocked = false;
    const onOrientation = (event: Event) => { const r = readOrientation(event as DeviceOrientationEvent); if (!r) return; seen = true; if (r.absolute) absoluteLocked = true; const previous = oRef.current; if (r.heading !== null && !r.absolute && r.source === "Göreli sensör") relativeHeadingRef.current = r.heading; const calibrated = r.heading !== null && !r.absolute && headingOffsetRef.current !== null ? norm(r.heading + headingOffsetRef.current) : r.heading; const merged: Orientation = { ...r, heading: calibrated ?? previous.heading, absolute: r.heading === null ? previous.absolute : r.absolute, source: calibrated !== null && !r.absolute && r.source === "Göreli sensör" && headingOffsetRef.current !== null ? "Kalibreli pusula" : r.heading === null && previous.heading !== null ? previous.source : r.source }; if (!absoluteLocked || r.absolute || r.source === "iOS pusula" || r.heading !== null) { oRef.current = merged; setO(merged); } setSensor(merged.heading === null ? "Hareket sensörü aktif · pusula aranıyor" : merged.source === "Kalibreli pusula" ? "GPS ile kalibre edilmiş pusula aktif" : merged.absolute ? "Mutlak pusula aktif" : "Pusula aktif"); };
    const onMotion = () => { if (!seen) setSensor("Hareket sensörü aktif · pusula aranıyor"); };
    window.addEventListener("deviceorientationabsolute", onOrientation, true); window.addEventListener("deviceorientation", onOrientation, true); window.addEventListener("devicemotion", onMotion, true); sensorCleanup.current = () => { window.removeEventListener("deviceorientationabsolute", onOrientation, true); window.removeEventListener("deviceorientation", onOrientation, true); window.removeEventListener("devicemotion", onMotion, true); }; sensorTimer.current = window.setTimeout(() => { if (!seen) setSensor("Sensör verisi alınamadı · kamera açık"); }, 4000);
    if (navigator.geolocation) watch.current = navigator.geolocation.watchPosition(p => { const n: Gps = { latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: Number.isFinite(p.coords.accuracy) ? p.coords.accuracy : null, heading: Number.isFinite(p.coords.heading) && p.coords.heading >= 0 ? p.coords.heading : null, speed: Number.isFinite(p.coords.speed) ? p.coords.speed : null }; setGps(n); const old = lastLoad.current, improved = old && (n.accuracy ?? 999) + 10 < (old.accuracy ?? 999); if (!old || hav(old, n) > 100 || improved) void load(n); const raw = relativeHeadingRef.current; if (raw !== null && n.heading !== null && (n.speed ?? 0) >= 1.2 && headingOffsetRef.current === null) { headingOffsetRef.current = angleDelta(n.heading, raw); const calibrated = norm(raw + headingOffsetRef.current); const next = { ...oRef.current, heading: calibrated, source: "Kalibreli pusula", absolute: false }; oRef.current = next; setO(next); setSensor("GPS ile kalibre edilmiş pusula aktif"); } else if (oRef.current.heading === null && n.heading !== null && (n.speed ?? 0) >= 1) setSensor("GPS hareket yönü aktif · pusula sensörü bekleniyor"); }, e => setError(e.code === 1 ? "Konum izni verilmedi" : e.code === 2 ? "Konum bulunamadı" : "GPS alınamadı"), { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }); else setError("Bu cihazda GPS desteklenmiyor");
    try { const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false }); stream.current = s; if (video.current) { video.current.srcObject = s; await video.current.play(); } } catch (e) { setError(e instanceof Error ? e.message : "Kamera açılamadı"); }
  }, [load]);
  const stop = useCallback(() => { sensorCleanup.current?.(); sensorCleanup.current = null; if (sensorTimer.current !== null) { window.clearTimeout(sensorTimer.current); sensorTimer.current = null; } if (watch.current !== null) { navigator.geolocation?.clearWatch(watch.current); watch.current = null; } stream.current?.getTracks().forEach(t => t.stop()); stream.current = null; disposeScene(); setStarted(false); }, [disposeScene]);
  useEffect(() => () => stop(), [stop]);
  useEffect(() => { debugRef.current = debugOpen; }, [debugOpen]);
  const nearest = parcels[0]; const gpsHeading = gps?.heading !== null && (gps?.speed ?? 0) >= 1 ? gps.heading : null; const effectiveHeading = o.heading ?? gpsHeading; const dir = nearest && effectiveHeading !== null ? angleDelta(nearest.bearing, effectiveHeading) : null; const dirText = dir === null ? "Yön bekleniyor" : Math.abs(dir) < 25 ? "DÜZ" : dir > 0 && dir < 160 ? "SAĞ" : dir < 0 && dir > -160 ? "SOL" : "ARKA"; const label = o.heading !== null ? o.source : gpsHeading !== null ? "GPS hareket yönü aktif" : sensor; const arrowText = dir === null ? "Telefonu hareket ettirin / pusula bekleniyor…" : Math.abs(dir) <= 35 ? `↑ ${Math.round(Math.abs(dir))}°` : dir > 0 ? `→ ${Math.round(Math.abs(dir))}° Sağda` : `← ${Math.round(Math.abs(dir))}° Solda`;
  return <div className="relative h-[100dvh] w-full overflow-hidden bg-black text-white"><video ref={video} playsInline muted className="absolute inset-0 h-full w-full object-cover" /><div ref={mount} className="pointer-events-none absolute inset-0 z-10" /><div className="absolute inset-x-0 top-0 z-20 p-3"><div className="mx-auto max-w-xl rounded-2xl bg-black/65 p-3"><div className="flex items-center justify-between"><b className="flex items-center gap-2"><Camera className="h-5 w-5" />3B Sky Scan AR</b><button onClick={stop} aria-label="Taramayı kapat"><X className="h-5 w-5" /></button></div><div className="mt-2 grid grid-cols-3 gap-2 text-xs"><span>GPS: {gps ? `${Math.round(gps.accuracy ?? 0)} m` : "—"}</span><span>Heading: {effectiveHeading === null ? "—" : `${Math.round(effectiveHeading)}°`}</span><span>Parsel: {parcels.length}</span></div><div className="mt-2 text-xs">GPS + sensör AR aktif · {loading ? "Parseller aranıyor…" : `${parcels.length} parsel hazır`} · {label}</div>{nearest && <div className="mt-2 rounded-xl bg-black/70 p-2 text-sm">En yakın <b>{nearest.parcel_number}</b> · {Math.round(nearest.distance)} m · {dirText}</div>}{nearest && <div className="mt-2 rounded-xl bg-black/60 p-2 text-center text-lg font-bold">{arrowText}</div>}{error && <div className="mt-2 text-xs text-red-300">{error}</div>}<button onClick={() => setDebugOpen(v => !v)} className="mt-2 rounded-lg bg-white/10 px-2 py-1 text-[11px]">{debugOpen ? "Debug kapat" : "AR Debug"}</button>{debugOpen && <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 rounded-xl bg-black/80 p-2 font-mono text-[10px] text-white/90"><span>Lat: {gps?.latitude.toFixed(6) ?? "—"}</span><span>Lng: {gps?.longitude.toFixed(6) ?? "—"}</span><span>Accuracy: {gps?.accuracy?.toFixed(1) ?? "—"}</span><span>Speed: {gps?.speed?.toFixed(1) ?? "—"}</span><span>Alpha: {o.alpha?.toFixed(1) ?? "—"}</span><span>Absolute: {String(o.absolute)}</span><span>Heading: {effectiveHeading?.toFixed(1) ?? "—"}</span><span>Beta: {o.beta?.toFixed(1) ?? "—"}</span><span>Gamma: {o.gamma?.toFixed(1) ?? "—"}</span><span>Parcel bearing: {nearest?.bearing.toFixed(1) ?? "—"}°</span><span>Camera bearing: {debug.cameraBearing?.toFixed(1) ?? "—"}°</span><span>Δ heading: {debug.relativeBearing?.toFixed(1) ?? "—"}°</span><span>Parcel elevation: {debug.elevation?.toFixed(1) ?? "—"}°</span><span>Camera pitch: {debug.cameraPitch?.toFixed(1) ?? "—"}°</span><span>World X: {debug.target.x.toFixed(1)}</span><span>World Y: {debug.target.y.toFixed(1)}</span><span>World Z: {debug.target.z.toFixed(1)}</span><span>Frustum: {debug.inFrustum ? "Evet" : "Hayır"}</span></div>}</div></div>{!started && <div className="absolute inset-x-4 bottom-8 z-30"><button onClick={start} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 font-bold text-black"><LocateFixed className="h-5 w-5" />GPS + sensör AR taramasını başlat</button></div>}{started && <div className="absolute bottom-4 left-3 right-3 z-20 flex items-center justify-between gap-2"><div className="rounded-full bg-black/65 px-4 py-2 text-sm">{loading ? "Parseller aranıyor…" : `${parcels.length} parsel hazır · ${label}`}</div><button onClick={() => gps && load(gps)} aria-label="Parselleri yenile" className="rounded-full bg-black/65 p-3"><RefreshCw className="h-5 w-5" /></button></div>}<div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 opacity-60"><Compass className="h-8 w-8" /></div></div>;
}
