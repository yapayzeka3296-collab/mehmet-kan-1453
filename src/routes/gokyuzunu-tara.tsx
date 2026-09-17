import { createFileRoute, Link } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadNearbySkyParcels } from '@/features/gokyuzunu-tara/parcelRepository';
import { projectSkyParcel, type GeoPoint, type SkyParcel } from '@/features/gokyuzunu-tara/geo';

export const Route = createFileRoute('/gokyuzunu-tara')({ component: SkyScannerPage });

type SensorState = { heading: number | null; pitch: number | null; roll: number | null; location: GeoPoint | null; accuracy: number | null; absolute: boolean };
type PermissionDeviceOrientation = typeof DeviceOrientationEvent & { requestPermission?: (absolute?: boolean) => Promise<'granted' | 'denied'> };

function SkyScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const locationWatchRef = useRef<number | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [sensor, setSensor] = useState<SensorState>({ heading: null, pitch: null, roll: null, location: null, accuracy: null, absolute: false });
  const [parcels, setParcels] = useState<SkyParcel[]>([]);
  const [selected, setSelected] = useState<SkyParcel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ width: 1, height: 1 });

  const readLocation = useCallback(() => {
    if (!navigator.geolocation) { setError('Bu cihaz konum bilgisini desteklemiyor.'); return; }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setSensor((current) => ({ ...current, location: { latitude: coords.latitude, longitude: coords.longitude, altitude: coords.altitude ?? 0 }, accuracy: coords.accuracy })),
      (positionError) => setError(positionError.code === 3 ? 'GPS konumu zaman aşımına uğradı. Telefonda Konum/GPS açıkken açık havada tekrar deneyin.' : `GPS açılamadı: ${positionError.message}`),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 30_000 },
    );
  }, []);

  const startScanner = useCallback(async () => {
    setError(null);
    try {
      const orientation = window.DeviceOrientationEvent as PermissionDeviceOrientation;
      if (typeof orientation.requestPermission === 'function') {
        const permission = await orientation.requestPermission(true);
        if (permission !== 'granted') throw new Error('Yön sensörü izni verilmedi. Gerçek konum tabanlı parseller için yön izni gereklidir.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
      setCameraReady(true); setScanning(true);
      readLocation();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Kamera başlatılamadı.'); }
  }, [readLocation]);

  useEffect(() => {
    if (!scanning) return;
    const onOrientation = (event: DeviceOrientationEvent) => {
      const orientationEvent = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
      const webkitHeading = orientationEvent.webkitCompassHeading;
      const heading = typeof webkitHeading === 'number' ? webkitHeading : event.absolute && typeof event.alpha === 'number' ? (360 - event.alpha) % 360 : null;
      const pitch = typeof event.beta === 'number' ? Math.max(-89, Math.min(89, 90 - event.beta)) : null;
      const roll = typeof event.gamma === 'number' ? event.gamma : null;
      if (heading != null || pitch != null) setSensor((current) => ({ ...current, heading: heading ?? current.heading, pitch: pitch ?? current.pitch, roll: roll ?? current.roll, absolute: current.absolute || Boolean(event.absolute) || typeof webkitHeading === 'number' }));
    };
    const updateSize = () => { const rect = frameRef.current?.getBoundingClientRect(); if (rect) setViewport({ width: rect.width, height: rect.height }); };
    if (navigator.geolocation) {
      locationWatchRef.current = navigator.geolocation.watchPosition(
        ({ coords }) => setSensor((current) => ({ ...current, location: { latitude: coords.latitude, longitude: coords.longitude, altitude: coords.altitude ?? 0 }, accuracy: coords.accuracy })),
        (positionError) => { if (positionError.code !== 3) setError(`GPS açılamadı: ${positionError.message}`); },
        { enableHighAccuracy: true, maximumAge: 10_000, timeout: 30_000 },
      );
    }
    window.addEventListener('deviceorientationabsolute', onOrientation as EventListener, true);
    window.addEventListener('deviceorientation', onOrientation as EventListener, true);
    updateSize(); window.addEventListener('resize', updateSize);
    return () => {
      if (locationWatchRef.current != null) navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
      window.removeEventListener('deviceorientationabsolute', onOrientation as EventListener, true);
      window.removeEventListener('deviceorientation', onOrientation as EventListener, true);
      window.removeEventListener('resize', updateSize);
    };
  }, [scanning]);

  useEffect(() => {
    if (!sensor.location) return;
    let cancelled = false;
    loadNearbySkyParcels(sensor.location.latitude, sensor.location.longitude, 25_000).then((items) => { if (!cancelled) setParcels(items); }).catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : 'Parseller alınamadı.'); });
    return () => { cancelled = true; };
  }, [sensor.location?.latitude, sensor.location?.longitude]);

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  const projected = useMemo(() => {
    if (!sensor.location || sensor.heading == null || sensor.pitch == null) return [];
    const raw = parcels.map((parcel) => ({ parcel, projection: projectSkyParcel(sensor.location!, sensor.heading!, sensor.pitch!, parcel, viewport, { horizontalFov: 70, verticalFov: 55 }) })).filter(({ projection }) => projection.visible).sort((a, b) => a.projection.distance - b.projection.distance).slice(0, 40);
    const occupied: Array<{ x: number; y: number }> = [];
    return raw.map((item) => {
      const base = item.projection; let x = base.x; let y = base.y;
      for (let ring = 0; ring < 5; ring += 1) {
        if (!occupied.some((point) => Math.hypot(point.x - x, point.y - y) < 54)) break;
        const angle = (item.parcel.sector_number ?? item.parcel.grid_x ?? 0) * 0.9 + ring * 2.1;
        x = base.x + Math.cos(angle) * (26 + ring * 10); y = base.y + Math.sin(angle) * (18 + ring * 8);
      }
      occupied.push({ x, y }); return { ...item, displayX: x, displayY: y };
    });
  }, [parcels, sensor.location, sensor.heading, sensor.pitch, viewport]);

  const sensorReady = sensor.heading != null && sensor.pitch != null;
  return (
    <main style={{ minHeight: '100dvh', background: '#020617', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div ref={frameRef} style={{ position: 'fixed', inset: 0 }}>
        <video ref={videoRef} playsInline muted autoPlay style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#020617' }} />
        {!cameraReady && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: 24, background: 'radial-gradient(circle at 50% 30%, #12345d 0, #020617 65%)' }}><div style={{ maxWidth: 420, textAlign: 'center' }}><div style={{ fontSize: 56, marginBottom: 12 }}>☁️</div><h1 style={{ fontSize: 32, margin: 0 }}>Gökyüzünü Tara</h1><p style={{ opacity: .82, lineHeight: 1.6 }}>Kamerayı gökyüzüne doğrult. Gerçek MySkyParcel parselleri GPS, pusula ve telefonun fiziksel eğimine göre gerçek dünya yönünde yerleştirilecek.</p><button onClick={startScanner} style={{ marginTop: 18, border: 0, borderRadius: 14, padding: '14px 22px', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>Kamerayı Aç</button>{error && <p style={{ color: '#fecaca' }}>{error}</p>}</div></div>}
        {cameraReady && <>
          <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', gap: 8, justifyContent: 'space-between', pointerEvents: 'none' }}><div style={{ padding: '9px 12px', borderRadius: 12, background: 'rgba(2,6,23,.72)', backdropFilter: 'blur(10px)', fontSize: 13 }}>GPS {sensor.accuracy != null ? `±${Math.round(sensor.accuracy)} m` : 'bekleniyor'} · Pusula {sensor.heading != null ? `${Math.round(sensor.heading)}°` : 'bekleniyor'} · Eğim {sensor.pitch != null ? `${Math.round(sensor.pitch)}°` : 'bekleniyor'}</div><div style={{ padding: '9px 12px', borderRadius: 12, background: 'rgba(2,6,23,.72)', backdropFilter: 'blur(10px)', fontSize: 13 }}>{parcels.length} gerçek parsel</div></div>
          {!sensorReady && sensor.location && <div style={{ position: 'absolute', left: 18, right: 18, top: '50%', transform: 'translateY(-50%)', padding: 16, borderRadius: 16, background: 'rgba(2,6,23,.86)', border: '1px solid rgba(255,255,255,.15)', textAlign: 'center', zIndex: 5 }}>Telefon yönü algılanıyor. Pusulayı açmak için telefonu 8 şeklinde birkaç kez hareket ettir ve kamerayı gökyüzüne doğrult.</div>}
          {projected.map(({ parcel, projection, displayX, displayY }) => <button key={parcel.id} onClick={() => setSelected(parcel)} style={{ position: 'absolute', left: displayX, top: displayY, transform: `translate(-50%,-50%) scale(${Math.max(.72, Math.min(1.2, 180 / Math.max(projection.distance, 180)))})`, transformOrigin: 'center', border: '1px solid rgba(255,255,255,.55)', borderRadius: 12, padding: '7px 9px', background: parcel.status === 'available' ? 'rgba(8,47,73,.82)' : 'rgba(69,10,10,.82)', color: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,.35)', cursor: 'pointer', whiteSpace: 'nowrap', zIndex: 4 }}><strong style={{ display: 'block', fontSize: 12 }}>PARSEL #{parcel.parcel_number}</strong><small style={{ opacity: .78 }}>{Math.round(projection.distance)} m · {Math.round(projection.elevation)}°</small></button>)}
          {sensorReady && parcels.length > 0 && projected.length === 0 && <div style={{ position: 'absolute', left: 16, right: 16, bottom: 18, padding: 14, borderRadius: 14, background: 'rgba(2,6,23,.86)', textAlign: 'center', zIndex: 5 }}>Bu gerçek GPS konumunda parseller mevcut, ancak şu an telefonun baktığı yönde değiller. Telefonu yavaşça sağa-sola çevir.</div>}
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: 28, height: 28, transform: 'translate(-50%,-50%)', border: '2px solid rgba(255,255,255,.8)', borderRadius: '50%', pointerEvents: 'none' }} />
          {error && <div style={{ position: 'absolute', left: 16, right: 16, bottom: 18, padding: 12, borderRadius: 12, background: 'rgba(127,29,29,.9)', zIndex: 6 }}>{error}</div>}
        </>}
      </div>
      {selected && <div style={{ position: 'fixed', left: 16, right: 16, bottom: 18, zIndex: 10, padding: 18, borderRadius: 18, background: 'rgba(2,6,23,.94)', border: '1px solid rgba(255,255,255,.16)', backdropFilter: 'blur(16px)' }}><button onClick={() => setSelected(null)} style={{ float: 'right', background: 'transparent', color: '#fff', border: 0, fontSize: 20 }}>×</button><div style={{ fontSize: 12, opacity: .7 }}>{selected.city_name} · Katman {selected.layer_number ?? 1} · Sektör {selected.sector_number ?? 1}</div><h2 style={{ margin: '6px 0' }}>PARSEL #{selected.parcel_number}</h2><p style={{ margin: '4px 0 14px', opacity: .8 }}>{selected.status === 'available' ? 'Satın alınabilir' : 'Satılmış'}</p>{selected.status === 'available' && <Link to="/parsel-satin-al" search={{ parcels: selected.id }} style={{ display: 'inline-block', padding: '12px 16px', borderRadius: 12, background: '#fff', color: '#020617', fontWeight: 800, textDecoration: 'none' }}>Bu parseli satın al</Link>}</div>}
    </main>
  );
}
