import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SkyScanExperienceV11 } from "./SkyScanExperienceV11";

type AbsoluteOrientationSensorCtor = new (options?: { frequency?: number }) => {
  quaternion: number[] | null;
  start: () => void;
  stop: () => void;
  addEventListener: (type: string, listener: (event: Event) => void) => void;
  removeEventListener: (type: string, listener: (event: Event) => void) => void;
};

type WindowWithOrientationSensor = Window & typeof globalThis & {
  AbsoluteOrientationSensor?: AbsoluteOrientationSensorCtor;
};

const norm = (n: number) => ((n % 360) + 360) % 360;
const deg = (n: number) => n * 180 / Math.PI;

function headingFromQuaternion(values: number[]) {
  if (!Array.isArray(values) || values.length < 4 || values.some(v => !Number.isFinite(v))) return null;
  const [x, y, z, w] = values;
  const q = new THREE.Quaternion(x, y, z, w).normalize();
  // AbsoluteOrientationSensor uses an Earth-referenced frame. Transform the
  // phone's camera/forward axis (-Z) into that frame and derive true azimuth.
  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(q).normalize();
  const east = forward.x;
  const north = forward.y;
  if (Math.hypot(east, north) < 0.08) return null;
  return norm(deg(Math.atan2(east, north)));
}

function emitAbsoluteOrientation(heading: number) {
  const alpha = norm(360 - heading);
  try {
    const event = new DeviceOrientationEvent("deviceorientationabsolute", {
      alpha,
      beta: 0,
      gamma: 0,
      absolute: true,
    });
    window.dispatchEvent(event);
    return;
  } catch {
    const event = new Event("deviceorientationabsolute") as DeviceOrientationEvent & {
      alpha: number;
      beta: number;
      gamma: number;
      absolute: boolean;
    };
    Object.defineProperties(event, {
      alpha: { value: alpha },
      beta: { value: 0 },
      gamma: { value: 0 },
      absolute: { value: true },
    });
    window.dispatchEvent(event);
  }
}

export function SkyScanExperienceV12() {
  const sensorRef = useRef<{ stop: () => void } | null>(null);
  const [nativeHeading, setNativeHeading] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [sensorMessage, setSensorMessage] = useState("Pusula aranıyor…");
  const [sensorAvailable, setSensorAvailable] = useState(false);

  useEffect(() => {
    let timer: number | null = null;
    const onOrientation = (event: Event) => {
      const e = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
      const hasHeading = (typeof e.webkitCompassHeading === "number" && Number.isFinite(e.webkitCompassHeading)) ||
        (e.absolute === true && typeof e.alpha === "number" && Number.isFinite(e.alpha));
      if (hasHeading) {
        setNativeHeading(true);
        setSensorMessage("Pusula aktif");
      }
    };
    window.addEventListener("deviceorientationabsolute", onOrientation, true);
    window.addEventListener("deviceorientation", onOrientation, true);
    timer = window.setTimeout(() => {
      setNativeHeading(current => {
        if (!current) setSensorMessage("Pusula verisi alınamadı");
        return current;
      });
    }, 3000);
    return () => {
      window.removeEventListener("deviceorientationabsolute", onOrientation, true);
      window.removeEventListener("deviceorientation", onOrientation, true);
      if (timer !== null) window.clearTimeout(timer);
      sensorRef.current?.stop();
      sensorRef.current = null;
    };
  }, []);

  const startAbsoluteSensor = async () => {
    setCalibrating(true);
    setSensorMessage("Pusula kalibrasyonu hazırlanıyor…");
    const win = window as WindowWithOrientationSensor;
    const Sensor = win.AbsoluteOrientationSensor;
    if (!Sensor) {
      setSensorAvailable(false);
      setSensorMessage("Bu tarayıcı mutlak pusula sensörünü desteklemiyor. Telefonu 8 şeklinde hareket ettirin ve tekrar deneyin.");
      setCalibrating(false);
      return;
    }
    setSensorAvailable(true);
    try {
      if (navigator.permissions?.query) {
        await Promise.allSettled([
          navigator.permissions.query({ name: "accelerometer" as PermissionName }),
          navigator.permissions.query({ name: "gyroscope" as PermissionName }),
          navigator.permissions.query({ name: "magnetometer" as PermissionName }),
        ]);
      }
      sensorRef.current?.stop();
      const sensor = new Sensor({ frequency: 30 });
      const onReading = () => {
        const q = sensor.quaternion;
        if (!q) return;
        const heading = headingFromQuaternion(q);
        if (heading === null) return;
        emitAbsoluteOrientation(heading);
        setNativeHeading(true);
        setSensorMessage(`Pusula aktif · ${Math.round(heading)}°`);
        setCalibrating(false);
      };
      const onError = (event: Event) => {
        const detail = event as Event & { error?: DOMException };
        const name = detail.error?.name ?? "SensorError";
        setSensorMessage(name === "NotReadableError" ? "Pusula sensörü okunamadı. Telefonu 8 şeklinde hareket ettirip tekrar deneyin." : "Pusula sensörü kullanılamıyor.");
        setCalibrating(false);
      };
      sensor.addEventListener("reading", onReading);
      sensor.addEventListener("error", onError);
      sensor.start();
      sensorRef.current = { stop: () => { sensor.removeEventListener("reading", onReading); sensor.removeEventListener("error", onError); sensor.stop(); } };
      window.setTimeout(() => setCalibrating(false), 10000);
    } catch {
      setSensorMessage("Pusula başlatılamadı. Telefonu 8 şeklinde hareket ettirip tekrar deneyin.");
      setCalibrating(false);
    }
  };

  return (
    <div className="relative h-full w-full">
      <SkyScanExperienceV11 />
      {!nativeHeading && (
        <div className="pointer-events-none fixed inset-x-3 bottom-24 z-[100] flex justify-center">
          <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/20 bg-black/85 p-4 text-white shadow-2xl backdrop-blur">
            <div className="mb-1 text-sm font-semibold">{sensorMessage}</div>
            <div className="text-xs leading-5 text-white/75">
              Sağ-sol parsel yönünü doğru göstermek için mutlak pusula gerekiyor. Telefonu 8 şeklinde yavaşça hareket ettirerek manyetik sensörü kalibre edin.
            </div>
            <button
              type="button"
              onClick={startAbsoluteSensor}
              disabled={calibrating}
              className="mt-3 w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-black disabled:opacity-50"
            >
              {calibrating ? "Pusula kalibre ediliyor…" : "Pusulayı kalibre et"}
            </button>
            {!sensorAvailable && <div className="mt-2 text-[11px] text-white/50">Kamera ve GPS çalışmaya devam eder; pusula yoksa tarama kilitlenmez.</div>}
          </div>
        </div>
      )}
    </div>
  );
}
