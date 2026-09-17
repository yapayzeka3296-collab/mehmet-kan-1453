import { createFileRoute, Link } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { loadNearbySkyParcels } from '@/features/gokyuzunu-tara/parcelRepository';
import { projectSkyParcel, type GeoPoint, type SkyParcel } from '@/features/gokyuzunu-tara/geo';

export const Route = createFileRoute('/gokyuzunu-tara')({ component: SkyScannerPage });

type SensorState = { heading: number | null; location: GeoPoint | null; accuracy: number | null };

function SkyScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [sensor, setSensor] = useState<SensorState>({ heading: null, location: null, accuracy: null });
  const [parcels, setParcels] = useState<SkyParcel[]>([]);
  const [selected, setSelected] = useState<SkyParcel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewport, setViewport] = useState({ width: 1, height: 1 });

  const startScanner = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
      setScanning(true);

      if (!navigator.geolocation) throw new Error('Bu cihaz konum bilgisini desteklemiyor.');
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setSensor({ heading: null, location: { latitude: coords.latitude, longitude: coords.longitude, altitude: coords.altitude ?? 0 }, accuracy: coords.accuracy }),
        (positionError) => setError(`GPS açılamadı: ${positionError.message}`),
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Kamera başlatılamadı.');
    }
  }, []);

  useEffect(() => {
    if (!scanning) return;
    let watchId: number | undefined;
    const onOrientation = (event: DeviceOrientationEvent) => {
      const absoluteEvent = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
      const webkitHeading = absoluteEvent.webkitCompassHeading;
      const heading = typeof webkitHeading === 'number' ? webkitHeading : typeof event.alpha === 'number' ? (360 - event.alpha) % 360 : null;
      if (heading != null) setSensor((current) => ({ ...current, heading }));
    };
    const updateSize = () => {
      const rect = frameRef.current?.getBoundingClientRect();
      if (rect) setViewport({ width: rect.width, height: rect.height });
    };

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        ({ coords }) => setSensor((current) => ({ ...current, location: { latitude: coords.latitude, longitude: coords.longitude, altitude: coords.altitude ?? 0 }, accuracy: coords.accuracy })),
        () => undefined,
        { enableHighAccuracy: true, maximumAge: 1500, timeout: 10000 },
      );
    }
    window.addEventListener('deviceorientationabsolute', onOrientation as EventListener, true);
    window.addEventListener('deviceorientation', onOrientation as EventListener, true);
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      window.removeEventListener('deviceorientationabsolute', onOrientation as EventListener, true);
      window.removeEventListener('deviceorientation', onOrientation as EventListener, true);
      window.removeEventListener('resize', updateSize);
    };
  }, [scanning]);

  useEffect(() => {
    if (!sensor.location) return;
    let cancelled = false;
    loadNearbySkyParcels(sensor.location.latitude, sensor.location.longitude, 25_000)
      .then((items) => { if (!cancelled) setParcels(items); })
      .catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : 'Parseller alınamadı.'); });
    return () => { cancelled = true; };
  }, [sensor.location?.latitude, sensor.location?.longitude]);

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  const projected = useMemo(() => {
    if (!sensor.location || sensor.heading == null) return [];
    return parcels
      .map((parcel) => ({ parcel, projection: projectSkyParcel(sensor.location!, sensor.heading!, parcel, viewport) }))
      .filter(({ projection }) => projection.visible)
      .sort((a, b) => a.projection.distance - b.projection.distance);
  }, [parcels, sensor.location, sensor.heading, viewport]);

  return (
    <main style={{ minHeight: '100dvh', background: '#020617', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      <div ref={frameRef} style={{ position: 'fixed', inset: 0 }}>
        <video ref={videoRef} playsInline muted autoPlay style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#020617' }} />
        {!cameraReady && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', padding: 24, background: 'radial-gradient(circle at 50% 30%, #12345d 0, #020617 65%)' }}>
          <div style={{ maxWidth: 420, textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>☁️</div>
            <h1 style={{ fontSize: 32, margin: 0 }}>Gökyüzünü Tara</h1>
            <p style={{ opacity: .82, lineHeight: 1.6 }}>Kamerayı gökyüzüne doğrult. Gerçek MySkyParcel parselleri konum, yön ve sanal gökyüzü katmanına göre görüntünün içine yerleştirilecek.</p>
            <button onClick={startScanner} style={{ marginTop: 18, border: 0, borderRadius: 14, padding: '14px 22px', fontWeight: 800, fontSize: 16, cursor: 'pointer' }}>Kamerayı Aç</button>
            {error && <p style={{ color: '#fecaca' }}>{error}</p>}
          </div>
        </div>}

        {cameraReady && <>
          <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', gap: 8, justifyContent: 'space-between', pointerEvents: 'none' }}>
            <div style={{ padding: '9px 12px', borderRadius: 12, background: 'rgba(2,6,23,.72)', backdropFilter: 'blur(10px)', fontSize: 13 }}>
              GPS {sensor.accuracy != null ? `±${Math.round(sensor.accuracy)} m` : 'bekleniyor'} · Yön {sensor.heading != null ? `${Math.round(sensor.heading)}°` : 'bekleniyor'}
            </div>
            <div style={{ padding: '9px 12px', borderRadius: 12, background: 'rgba(2,6,23,.72)', backdropFilter: 'blur(10px)', fontSize: 13 }}>{parcels.length} gerçek parsel</div>
          </div>

          {projected.map(({ parcel, projection }) => (
            <button key={parcel.id} onClick={() => setSelected(parcel)} style={{ position: 'absolute', left: projection.x, top: projection.y, transform: 'translate(-50%,-50%)', border: '1px solid rgba(255,255,255,.45)', borderRadius: 14, padding: '9px 11px', background: parcel.status === 'available' ? 'rgba(8,47,73,.9)' : 'rgba(69,10,10,.9)', color: '#fff', boxShadow: '0 8px 30px rgba(0,0,0,.35)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <strong style={{ display: 'block' }}>PARSEL #{parcel.parcel_number}</strong>
              <small>{Math.round(projection.distance)} m · {Math.round(projection.elevation)}°</small>
            </button>
          ))}

          <div style={{ position: 'absolute', left: '50%', top: '50%', width: 28, height: 28, transform: 'translate(-50%,-50%)', border: '2px solid rgba(255,255,255,.8)', borderRadius: '50%', pointerEvents: 'none' }} />
          {error && <div style={{ position: 'absolute', left: 16, right: 16, bottom: 18, padding: 12, borderRadius: 12, background: 'rgba(127,29,29,.9)' }}>{error}</div>}
        </>}
      </div>

      {selected && <div style={{ position: 'fixed', left: 16, right: 16, bottom: 18, zIndex: 10, padding: 18, borderRadius: 18, background: 'rgba(2,6,23,.94)', border: '1px solid rgba(255,255,255,.16)', backdropFilter: 'blur(16px)' }}>
        <button onClick={() => setSelected(null)} style={{ float: 'right', background: 'transparent', color: '#fff', border: 0, fontSize: 20 }}>×</button>
        <div style={{ fontSize: 12, opacity: .7 }}>{selected.city_name} · Katman {selected.layer_number ?? 1} · Sektör {selected.sector_number ?? 1}</div>
        <h2 style={{ margin: '6px 0' }}>PARSEL #{selected.parcel_number}</h2>
        <p style={{ margin: '4px 0 14px', opacity: .8 }}>{selected.status === 'available' ? 'Satın alınabilir' : 'Satılmış'}</p>
        {selected.status === 'available' && <Link to="/parsel-satin-al" search={{ parcels: selected.id }} style={{ display: 'inline-block', padding: '12px 16px', borderRadius: 12, background: '#fff', color: '#020617', fontWeight: 800, textDecoration: 'none' }}>Bu parseli satın al</Link>}
      </div>}
    </main>
  );
}
