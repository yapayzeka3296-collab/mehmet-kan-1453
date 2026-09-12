import { LocateFixed, Navigation, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Gps = { latitude: number; longitude: number; accuracy: number | null };
type Parcel = { id: string; parcel_number: string; latitude: number; longitude: number; distance: number; bearing: number };
type XRNavigator = Navigator & { xr?: { isSessionSupported: (mode: string) => Promise<boolean>; requestSession: (mode: string, options?: Record<string, unknown>) => Promise<XRSession> } };

declare global {
  interface Window {
    THREE?: typeof THREE;
  }
}

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
const geoOffset = (origin: Gps, target: Parcel) => {
  const north = rad(target.latitude - origin.latitude) * R;
  const east = rad(target.longitude - origin.longitude) * R * Math.cos(rad(origin.latitude));
  return { east, north };
};

function makeLabel(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0,0,0,.72)";
  ctx.beginPath();
  ctx.roundRect(8, 8, 496, 112, 24);
  ctx.fill();
  ctx.strokeStyle = "rgba(103,232,249,.95)";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.font = "bold 38px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3.2, 0.8, 1);
  return sprite;
}

export function SkyScanExperienceV16() {
  const host = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const xrSessionRef = useRef<XRSession | null>(null);
  const xrSpaceRef = useRef<XRReferenceSpace | null>(null);
  const geoRootRef = useRef<THREE.Group | null>(null);
  const originGpsRef = useRef<Gps | null>(null);
  const lastGpsRef = useRef<Gps | null>(null);
  const lastPoseRef = useRef<XRViewerPose | null>(null);
  const calibrationRef = useRef<{ gpsBearing: number; xrYaw: number } | null>(null);
  const lastParcelFetchRef = useRef(0);
  const [gps, setGps] = useState<Gps | null>(null);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [started, setStarted] = useState(false);
  const [aligned, setAligned] = useState(false);
  const [message, setMessage] = useState("WebXR AR desteği kontrol ediliyor…");
  const [error, setError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number | null>(null);

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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Parseller alınamadı");
    }
  }, []);

  const updateGps = useCallback((position: GeolocationPosition) => {
    const next: Gps = { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null };
    setGps(next);
    const previous = lastGpsRef.current;
    const moved = previous ? dist(previous, next) : 0;
    if (!originGpsRef.current && started) originGpsRef.current = next;
    if (!previous || moved >= MIN_MOVE || Date.now() - lastParcelFetchRef.current > 15000) void loadParcels(next);
    if (previous && moved >= MIN_MOVE && started && !aligned && lastPoseRef.current) {
      const gpsBearing = bearing(previous, next);
      const q = lastPoseRef.current.transform.orientation;
      const quaternion = new THREE.Quaternion(q.x, q.y, q.z, q.w);
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);
      const xrYaw = Math.atan2(forward.x, -forward.z);
      const rotation = xrYaw - rad(gpsBearing);
      if (geoRootRef.current) geoRootRef.current.rotation.y = rotation;
      calibrationRef.current = { gpsBearing, xrYaw };
      setHeading(gpsBearing);
      setAligned(true);
      setMessage("Gerçek WebXR AR hizalandı · parseller dünya koordinatına bağlandı");
    }
    lastGpsRef.current = next;
  }, [aligned, loadParcels, started]);

  useEffect(() => {
    if (!navigator.geolocation) { setError("Bu cihazda GPS kullanılamıyor."); return; }
    const id = navigator.geolocation.watchPosition(updateGps, e => setError(`GPS: ${e.message}`), { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 });
    return () => navigator.geolocation.clearWatch(id);
  }, [updateGps]);

  useEffect(() => {
    let active = true;
    const check = async () => {
      const xr = (navigator as XRNavigator).xr;
      if (!xr) { if (active) { setSupported(false); setMessage("Bu tarayıcı WebXR immersive AR desteklemiyor."); } return; }
      try {
        const ok = await xr.isSessionSupported("immersive-ar");
        if (active) { setSupported(ok); setMessage(ok ? "Gerçek WebXR AR hazır" : "Bu cihaz immersive AR desteklemiyor."); }
      } catch {
        if (active) { setSupported(false); setMessage("WebXR AR desteği doğrulanamadı."); }
      }
    };
    void check();
    return () => { active = false; };
  }, []);

  const startXR = useCallback(async () => {
    setError(null);
    const xr = (navigator as XRNavigator).xr;
    if (!xr) { setError("navigator.xr bulunamadı. Bu tarayıcı gerçek WebXR AR sunmuyor."); return; }
    try {
      const ok = await xr.isSessionSupported("immersive-ar");
      if (!ok) throw new Error("Bu cihaz/tarayıcı immersive-ar oturumunu desteklemiyor.");
      const session = await xr.requestSession("immersive-ar", {
        requiredFeatures: [],
        optionalFeatures: ["local", "dom-overlay", "hit-test", "anchors"],
        domOverlay: { root: host.current },
      });
      xrSessionRef.current = session;
      const renderer = rendererRef.current;
      if (!renderer) throw new Error("WebGL renderer hazırlanamadı.");
      await renderer.xr.setSession(session);
      let space: XRReferenceSpace;
      try { space = await session.requestReferenceSpace("local"); }
      catch { space = await session.requestReferenceSpace("viewer"); }
      xrSpaceRef.current = space;
      originGpsRef.current = gps;
      lastGpsRef.current = gps;
      calibrationRef.current = null;
      setAligned(false);
      setHeading(null);
      setStarted(true);
      setMessage(gps ? "Gerçek AR açık · 4 m yürüyün, dünya yönü kalibre edilecek" : "Gerçek AR açık · GPS bekleniyor");
      session.addEventListener("end", () => {
        xrSessionRef.current = null;
        xrSpaceRef.current = null;
        renderer.xr.setSession(null);
        setStarted(false);
        setAligned(false);
        setHeading(null);
        setMessage("WebXR AR sonlandırıldı");
      }, { once: true });
    } catch (e) {
      setError(e instanceof Error ? `${e.name}: ${e.message}` : "Gerçek WebXR AR başlatılamadı");
    }
  }, [gps]);

  const stopXR = useCallback(() => {
    void xrSessionRef.current?.end();
  }, []);

  useEffect(() => {
    if (!host.current) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local");
    host.current.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const root = new THREE.Group();
    scene.add(root);
    geoRootRef.current = root;
    sceneRef.current = scene;
    rendererRef.current = renderer;

    const onResize = () => renderer.setSize(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", onResize);
    renderer.setAnimationLoop((_time, frame) => {
      if (frame && xrSpaceRef.current) lastPoseRef.current = frame.getViewerPose(xrSpaceRef.current);
      renderer.render(scene, new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10000));
    });
    return () => {
      window.removeEventListener("resize", onResize);
      renderer.setAnimationLoop(null);
      void xrSessionRef.current?.end();
      renderer.dispose();
      renderer.domElement.remove();
      rendererRef.current = null;
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const root = geoRootRef.current;
    const origin = originGpsRef.current;
    if (!root || !origin || !started) return;
    root.clear();
    const visible = parcels.slice(0, 100);
    for (const parcel of visible) {
      const { east, north } = geoOffset(origin, parcel);
      const group = new THREE.Group();
      group.position.set(east, 1.6, -north);
      const marker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.32, 3.2, 16),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.8 })
      );
      marker.position.y = -1.6;
      group.add(marker);
      const label = makeLabel(`PARSEL ${parcel.parcel_number} · ${Math.round(parcel.distance)} m`);
      if (label) { label.position.y = 1.4; group.add(label); }
      root.add(group);
    }
  }, [parcels, started]);

  const nearest = parcels[0];
  const nearestDirection = useMemo(() => {
    if (!nearest || heading === null) return "—";
    return directionFromRelative(signed(nearest.bearing - heading));
  }, [heading, nearest]);

  return <div ref={host} className="relative h-[100dvh] w-full overflow-hidden bg-black text-white">
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-2">
      <div className="rounded-full bg-black/65 px-2.5 py-1 text-[10px] backdrop-blur">GERÇEK WEBXR AR · {gps ? `±${Math.round(gps.accuracy ?? 0)}m GPS` : "GPS…"} · {parcels.length} parsel</div>
      {started && <button className="pointer-events-auto rounded-full bg-black/70 p-1.5" onClick={stopXR} aria-label="AR kapat"><X className="h-3.5 w-3.5" /></button>}
    </div>
    {started && <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"><div className="h-12 w-12 rounded-full border border-white/60" /><div className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-white/80" /></div>}
    {started && nearest && <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 w-[calc(100%-20px)] max-w-xs -translate-x-1/2 rounded-xl bg-black/70 px-3 py-2 backdrop-blur"><div className="flex items-center justify-between text-xs font-semibold"><span>Parsel {nearest.parcel_number}</span><span>{Math.round(nearest.distance)} m</span></div><div className="mt-0.5 flex items-center justify-between text-[10px] text-white/75"><span>{aligned ? "3B dünya konumuna bağlı" : "4 m yürüyerek kalibre et"}</span><span><Navigation className="mr-0.5 inline h-3 w-3" />{nearestDirection}</span></div></div>}
    {!started && <div className="absolute bottom-3 left-1/2 z-20 w-[calc(100%-20px)] max-w-sm -translate-x-1/2 rounded-xl bg-black/80 p-3 backdrop-blur"><div className="mb-1 text-sm font-semibold">Gerçek WebXR AR</div><div className="mb-2 text-[10px] leading-4 text-white/75">Kamera görüntüsü ayrı bir HTML katmanı değildir. WebXR immersive-ar oturumu cihazın gerçek AR görüntüsünü, hareket takibini ve 3B dünya koordinatlarını sağlar. GPS ile parsel koordinatları bu XR dünyasına bağlanır.</div>{error && <div className="mb-2 text-[10px] text-red-300">{error}</div>}{supported === false ? <div className="rounded-lg border border-amber-300/30 bg-amber-400/10 p-2 text-[10px] text-amber-100">Bu cihaz/tarayıcı gerçek WebXR immersive AR desteklemiyor. Bu sürüm yapay kamera AR'ye dönmez; uyumlu WebXR cihazı gerekir.</div> : <button disabled={supported !== true} onClick={() => void startXR()} className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2.5 text-xs font-bold text-black disabled:opacity-50"><LocateFixed className="h-3.5 w-3.5" />{supported === true ? "Gerçek AR'yi başlat" : "WebXR kontrol ediliyor…"}</button>}</div>}
  </div>;
}

function directionFromRelative(angle: number) {
  return Math.abs(angle) < 20 ? "Karşında" : Math.abs(angle) > 160 ? "Arkanda" : angle > 0 ? "Sağında" : "Solunda";
}
