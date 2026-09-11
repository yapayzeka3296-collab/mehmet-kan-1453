import { Camera, Compass, LocateFixed, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Tier = "digital" | "elite" | "premium";
type Parcel = { id: string; parcel_number: string; latitude: number; longitude: number; tier: Tier; distanceMeters: number; bearing: number };
type Gps = { latitude: number; longitude: number; accuracy: number | null; altitude: number | null } | null;
type Orientation = { heading: number | null; pitch: number | null; alpha: number | null; beta: number | null; gamma: number | null; source: string };

const EARTH = 6371000;
const SEARCH_RADIUS = 5000;
const MAX_RENDER = 120;
const H_FOV = 62;
const V_FOV = 48;

const rad = (n: number) => n * Math.PI / 180;
const deg = (n: number) => n * 180 / Math.PI;
const norm = (n: number) => ((n % 360) + 360) % 360;
const delta = (target: number, current: number) => ((target - current + 540) % 360) - 180;
const distance = (a: Gps, b: Pick<Parcel, "latitude" | "longitude">) => {
  if (!a) return Infinity;
  const p1 = rad(a.latitude), p2 = rad(b.latitude), dp = p2 - p1, dl = rad(b.longitude - a.longitude);
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * EARTH * Math.asin(Math.min(1, Math.sqrt(h)));
};
const bearing = (a: Gps, b: Pick<Parcel, "latitude" | "longitude">) => {
  if (!a) return 0;
  const p1 = rad(a.latitude), p2 = rad(b.latitude), dl = rad(b.longitude - a.longitude);
  return norm(deg(Math.atan2(Math.sin(dl) * Math.cos(p2), Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl))));
};
const cardinal = (h: number) => ["K", "KD", "D", "GD", "G", "GB", "B", "KB"][Math.round(norm(h) / 45) % 8];
const distanceText = (m: number) => m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;

function parseOrientation(event: DeviceOrientationEvent): Orientation {
  const alpha = typeof event.alpha === "number" ? event.alpha : null;
  const beta = typeof event.beta === "number" ? event.beta : null;
  const gamma = typeof event.gamma === "number" ? event.gamma : null;
  const webkit = (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
  const heading = typeof webkit === "number" && Number.isFinite(webkit) ? norm(webkit) : alpha === null ? null : norm(360 - alpha);
  return { heading, pitch: beta, alpha, beta, gamma, source: typeof webkit === "number" ? "iOS pusula" : event.type || "deviceorientation" };
}

async function requestSensorPermission() {
  const D = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<PermissionState> };
  const M = window.DeviceMotionEvent as typeof DeviceMotionEvent & { requestPermission?: () => Promise<PermissionState> };
  if (typeof D.requestPermission === "function") {
    const result = await D.requestPermission();
    if (result !== "granted") return false;
  }
  if (typeof M.requestPermission === "function") {
    const result = await M.requestPermission();
    if (result !== "granted") return false;
  }
  return true;
}

function crystal(tier: Tier) {
  const color = tier === "premium" ? 0xffd45a : tier === "elite" ? 0xb56cff : 0x2ee6ff;
  const group = new THREE.Group();
  const geometry = new THREE.IcosahedronGeometry(1, 1);
  group.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.7, transparent: true, opacity: 0.92, roughness: 0.2, metalness: 0.3 })));
  group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.42 })));
  return group;
}

export function SkyScanExperienceV5() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const watchRef = useRef<number | null>(null);
  const sensorCleanupRef = useRef<(() => void) | null>(null);
  const orientationRef = useRef<Orientation>({ heading: null, pitch: null, alpha: null, beta: null, gamma: null, source: "bekleniyor" });
  const gpsRef = useRef<Gps>(null);
  const parcelsRef = useRef<Parcel[]>([]);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const objectsRef = useRef(new Map<string, THREE.Group>());
  const rafRef = useRef<number | null>(null);
  const lastQueryRef = useRef<{ at: number; lat: number; lon: number; accuracy: number | null }>({ at: 0, lat: 0, lon: 0, accuracy: null });

  const [started, setStarted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [gps, setGps] = useState<Gps>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [orientation, setOrientation] = useState(orientationRef.current);
  const [sensorStatus, setSensorStatus] = useState("Bekleniyor");
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [parcelLoading, setParcelLoading] = useState(false);
  const [parcelError, setParcelError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(0);
  const [showStatus, setShowStatus] = useState(true);

  const renderParcels = useCallback((items: Parcel[]) => {
    const scene = sceneRef.current;
    if (!scene) return;
    const keep = new Set(items.map((p) => p.id));
    for (const [id, object] of objectsRef.current) {
      if (!keep.has(id)) {
        scene.remove(object);
        object.traverse((child) => {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          const material = mesh.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material?.dispose();
        });
        objectsRef.current.delete(id);
      }
    }
    for (const item of items) {
      if (!objectsRef.current.has(item.id)) {
        const object = crystal(item.tier);
        scene.add(object);
        objectsRef.current.set(item.id, object);
      }
    }
  }, []);

  const fetchParcels = useCallback(async (p: NonNullable<Gps>) => {
    const now = Date.now();
    const q = lastQueryRef.current;
    const moved = q.at ? distance(q as Gps, { latitude: p.latitude, longitude: p.longitude }) : Infinity;
    const improved = q.accuracy != null && p.accuracy != null && q.accuracy - p.accuracy >= 15;
    if (q.at && now - q.at < 2500) return;
    if (q.at && moved < 40 && now - q.at < 15000 && !improved) return;
    lastQueryRef.current = { at: now, lat: p.latitude, lon: p.longitude, accuracy: p.accuracy };
    setParcelLoading(true);
    setParcelError(null);
    try {
      const city = await supabaseBrowser.from("cities").select("id").eq("slug", "gaziantep").eq("is_active", true).maybeSingle();
      if (city.error) throw city.error;
      if (!city.data) throw new Error("Gaziantep ili bulunamadı.");
      const latDelta = SEARCH_RADIUS / 111320;
      const lonDelta = SEARCH_RADIUS / Math.max(111320 * Math.cos(rad(p.latitude)), 1);
      const { data, error } = await supabaseBrowser.from("sky_scan_parcels")
        .select("id,parcel_id,parcel_number,latitude,longitude")
        .eq("city_id", city.data.id)
        .gte("latitude", p.latitude - latDelta).lte("latitude", p.latitude + latDelta)
        .gte("longitude", p.longitude - lonDelta).lte("longitude", p.longitude + lonDelta)
        .limit(1000);
      if (error) throw error;
      const result: Parcel[] = (data ?? []).map((row: any) => {
        const lat = Number(row.latitude), lon = Number(row.longitude);
        return { id: String(row.parcel_id ?? row.id), parcel_number: String(row.parcel_number ?? "—"), latitude: lat, longitude: lon, tier: "digital" as Tier, distanceMeters: distance(p, { latitude: lat, longitude: lon }), bearing: bearing(p, { latitude: lat, longitude: lon }) };
      }).filter((row) => Number.isFinite(row.latitude) && Number.isFinite(row.longitude) && row.distanceMeters <= SEARCH_RADIUS)
        .sort((a, b) => a.distanceMeters - b.distanceMeters).slice(0, MAX_RENDER);
      parcelsRef.current = result;
      setParcels(result);
      renderParcels(result);
      if (!result.length) setParcelError("Bu konumun 5 km çevresinde Sky Scan parseli bulunamadı.");
    } catch (error) {
      setParcelError(error instanceof Error ? error.message : "Parseller alınamadı.");
    } finally {
      setParcelLoading(false);
    }
  }, [renderParcels]);

  const startGps = useCallback(() => {
    if (!navigator.geolocation) { setGpsError("Tarayıcı GPS desteği vermiyor."); return; }
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    setGpsError(null);
    watchRef.current = navigator.geolocation.watchPosition((pos) => {
      const next: NonNullable<Gps> = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: Number.isFinite(pos.coords.accuracy) ? pos.coords.accuracy : null, altitude: Number.isFinite(pos.coords.altitude ?? NaN) ? pos.coords.altitude : null };
      gpsRef.current = next;
      setGps(next);
      void fetchParcels(next);
    }, (error) => setGpsError(error.code === 1 ? "Konum izni verilmedi." : "GPS verisi alınamadı."), { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 });
  }, [fetchParcels]);

  const startSensors = useCallback(async () => {
    sensorCleanupRef.current?.();
    sensorCleanupRef.current = null;
    setSensorStatus("İzin kontrol ediliyor…");
    try {
      const granted = await requestSensorPermission();
      if (!granted) { setSensorStatus("İzin verilmedi"); return; }
      let absoluteActive = false;
      let firstData = false;
      const apply = (event: DeviceOrientationEvent) => {
        const parsed = parseOrientation(event);
        if (parsed.heading === null && parsed.pitch === null && parsed.gamma === null) return;
        orientationRef.current = parsed;
        setOrientation(parsed);
        firstData = true;
        setSensorStatus("Aktif");
      };
      const absolute = (event: DeviceOrientationEvent) => { if (event.absolute || event.type === "deviceorientationabsolute") { absoluteActive = true; apply(event); } };
      const relative = (event: DeviceOrientationEvent) => { if (!absoluteActive) apply(event); };
      const motion = (event: DeviceMotionEvent) => {
        if (firstData) return;
        const a = event.accelerationIncludingGravity;
        if (a && (typeof a.x === "number" || typeof a.y === "number" || typeof a.z === "number")) setSensorStatus("Hareket sensörü aktif; pusula bekleniyor…");
      };
      window.addEventListener("deviceorientationabsolute", absolute as EventListener, true);
      window.addEventListener("deviceorientation", relative as EventListener, true);
      window.addEventListener("devicemotion", motion as EventListener, true);
      const timeout = window.setTimeout(() => { if (!firstData) setSensorStatus("Pusula verisi bekleniyor; kamera açık kalacak"); }, 5000);
      sensorCleanupRef.current = () => {
        window.clearTimeout(timeout);
        window.removeEventListener("deviceorientationabsolute", absolute as EventListener, true);
        window.removeEventListener("deviceorientation", relative as EventListener, true);
        window.removeEventListener("devicemotion", motion as EventListener, true);
      };
    } catch (error) {
      setSensorStatus(error instanceof Error ? `Sensör: ${error.message}` : "Sensör başlatılamadı");
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setCameraError("Bu tarayıcı kamera erişimini desteklemiyor."); return; }
    setCameraError(null);
    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Kamera görüntüsü hazırlanamadı.");
      video.srcObject = stream;
      await video.play();
      setCameraReady(true);
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : "Kamera açılamadı.");
    }
  }, []);

  const startThree = useCallback(() => {
    if (!hostRef.current || rendererRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(V_FOV, innerWidth / Math.max(innerHeight, 1), 0.1, SEARCH_RADIUS + 100);
    camera.rotation.order = "YXZ";
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.setSize(innerWidth, innerHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "pointer-events-none absolute inset-0 h-full w-full";
    hostRef.current.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const light = new THREE.DirectionalLight(0xffffff, 2); light.position.set(5, 10, 5); scene.add(light);
    sceneRef.current = scene; cameraRef.current = camera; rendererRef.current = renderer;
    const resize = () => { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / Math.max(innerHeight, 1); camera.updateProjectionMatrix(); };
    addEventListener("resize", resize);
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const o = orientationRef.current;
      if (o.heading !== null) {
        camera.rotation.y = -rad(o.heading);
        camera.rotation.x = -rad(Math.max(-75, Math.min(75, o.pitch ?? 0)));
      }
      const p = gpsRef.current;
      let visible = 0;
      for (const [id, object] of objectsRef.current) {
        const item = parcelsRef.current.find((x) => x.id === id);
        if (!item || !p) { object.visible = false; continue; }
        const relative = delta(item.bearing, o.heading ?? 0);
        const inHorizontalFov = Math.abs(relative) <= H_FOV / 2;
        const pitch = o.pitch ?? 0;
        const inVerticalFov = Math.abs(20 - (-pitch)) <= V_FOV / 2 + 16;
        object.visible = inHorizontalFov && inVerticalFov;
        if (object.visible) visible++;
        const a = rad(item.bearing);
        const radius = 14 + Math.sqrt(Math.max(item.distanceMeters, 1)) * 0.85;
        object.position.set(Math.sin(a) * radius, 6 + Math.min(14, item.distanceMeters / 450), -Math.cos(a) * radius);
        const scale = Math.max(0.75, Math.min(3, 3 - item.distanceMeters / 2600));
        object.scale.setScalar(scale);
        object.rotation.y += 0.006;
      }
      setVisibleCount((current) => current === visible ? current : visible);
      renderer.render(scene, camera);
    };
    loop();
    return () => { removeEventListener("resize", resize); };
  }, []);

  const startAll = useCallback(() => {
    setStarted(true);
    setShowStatus(true);
    startThree();
    startGps();
    void startSensors();
    void startCamera();
  }, [startCamera, startGps, startSensors, startThree]);

  const stopAll = useCallback(() => {
    if (watchRef.current !== null) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; }
    sensorCleanupRef.current?.(); sensorCleanupRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStarted(false); setCameraReady(false);
  }, []);

  useEffect(() => () => { stopAll(); if (rafRef.current) cancelAnimationFrame(rafRef.current); rendererRef.current?.dispose(); }, [stopAll]);

  const nearest = useMemo(() => {
    if (!gps || !parcels.length) return null;
    return parcels.map((p) => ({ ...p, distanceMeters: distance(gps, p), bearing: bearing(gps, p) })).sort((a, b) => a.distanceMeters - b.distanceMeters)[0];
  }, [gps, parcels]);
  const nearestDelta = nearest && orientation.heading !== null ? delta(nearest.bearing, orientation.heading) : null;
  const direction = nearestDelta === null ? "Yön bekleniyor" : Math.abs(nearestDelta) <= 10 ? "Tam önünde" : Math.abs(nearestDelta) >= 160 ? "Arkanda" : nearestDelta > 0 ? `Sağında → ${Math.round(Math.abs(nearestDelta))}°` : `Solunda ← ${Math.round(Math.abs(nearestDelta))}°`;

  return (
    <main className="fixed inset-0 z-[70] overflow-hidden bg-black text-white">
      <video ref={videoRef} muted playsInline autoPlay className="absolute inset-0 h-full w-full object-cover" />
      <div ref={hostRef} className="pointer-events-none absolute inset-0" />

      <header className="absolute left-0 right-0 top-0 z-30 flex items-start justify-between gap-2 p-3 sm:p-5">
        <div className="rounded-2xl border border-white/15 bg-slate-950/75 px-3 py-2 backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200">MySkyParcel</p>
          <p className="text-sm font-semibold">Gökyüzünü Tara</p>
          <p className="text-[10px] text-white/60">GPS: {gps ? "aktif" : "bekleniyor"} · Pusula: {orientation.heading === null ? sensorStatus : `${Math.round(orientation.heading)}° ${cardinal(orientation.heading)}`}</p>
        </div>
        <button type="button" onClick={() => setShowStatus((v) => !v)} className="pointer-events-auto rounded-xl border border-white/15 bg-slate-950/75 px-3 py-2 text-xs backdrop-blur-md">Durum</button>
      </header>

      {showStatus && started && (
        <section className="absolute bottom-3 left-3 right-3 z-30 rounded-3xl border border-white/15 bg-slate-950/80 p-4 shadow-2xl backdrop-blur-xl sm:bottom-5 sm:left-5 sm:right-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div><p className="text-[10px] uppercase text-white/45">Kamera</p><p className="text-sm font-semibold">{cameraReady ? "Hazır" : cameraError ? "Hata" : "Başlatılıyor…"}</p></div>
            <div><p className="text-[10px] uppercase text-white/45">Konum</p><p className="text-sm font-semibold">{gps ? `±${Math.round(gps.accuracy ?? 0)} m` : gpsError ?? "Bekleniyor…"}</p></div>
            <div><p className="text-[10px] uppercase text-white/45">Yakındaki parsel</p><p className="text-sm font-semibold">{parcelLoading ? "Aranıyor…" : parcels.length}</p></div>
            <div><p className="text-[10px] uppercase text-white/45">Görüş alanında</p><p className="text-sm font-semibold">{visibleCount}</p></div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
            <div className="min-w-0"><p className="text-xs text-cyan-100">{nearest ? `${nearest.parcel_number} · ${distanceText(nearest.distanceMeters)}` : parcelError ?? sensorStatus}</p><p className="mt-0.5 text-sm font-semibold">{direction}</p></div>
            <div className="flex shrink-0 items-center gap-2"><Compass className="h-5 w-5 text-cyan-200" /><span className="text-xs text-white/60">{orientation.source}</span></div>
          </div>
          {cameraError && <p className="mt-2 text-xs text-red-300">Kamera: {cameraError}</p>}
          {gpsError && <p className="mt-2 text-xs text-amber-200">GPS: {gpsError}</p>}
          {parcelError && <p className="mt-2 text-xs text-amber-200">Parsel: {parcelError}</p>}
        </section>
      )}

      {!started && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/80 p-5 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-cyan-200/15 bg-slate-900 p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200"><Camera className="h-7 w-7" /></div>
            <h1 className="mt-4 text-2xl font-bold">Gökyüzünü Tara</h1>
            <p className="mt-2 text-sm text-white/60">Kamera, GPS ve telefon sensörleri aynı anda başlatılır. Sensör gecikirse kamera kapanmaz.</p>
            <button type="button" onClick={startAll} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 font-bold text-slate-950"><LocateFixed className="h-5 w-5" /> Taramayı başlat</button>
          </div>
        </div>
      )}

      {started && <button type="button" onClick={stopAll} className="pointer-events-auto absolute right-3 top-20 z-30 rounded-xl border border-white/15 bg-slate-950/75 p-2 backdrop-blur-md sm:right-5"><X className="h-5 w-5" /></button>}
      {started && <button type="button" onClick={() => { const p = gpsRef.current; if (p) void fetchParcels(p); }} className="pointer-events-auto absolute right-14 top-20 z-30 rounded-xl border border-white/15 bg-slate-950/75 p-2 backdrop-blur-md sm:right-16" aria-label="Parselleri yenile"><RefreshCw className="h-5 w-5" /></button>}
    </main>
  );
}
