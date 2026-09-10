import { useEffect, type ReactNode } from "react";

type OrientationLike = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
  __mySkyParcelNormalized?: boolean;
};

type MotionLike = DeviceMotionEvent & { __mySkyParcelHandled?: boolean };

const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const normalizeHeading = (value: number) => ((value % 360) + 360) % 360;

function makeOrientationEvent(alpha: number, beta: number, gamma: number, absolute = false, webkitCompassHeading?: number) {
  try {
    const Ctor = window.DeviceOrientationEvent;
    if (typeof Ctor === "function" && "prototype" in Ctor) {
      const event = new Ctor("deviceorientation", { alpha, beta, gamma, absolute }) as OrientationLike;
      event.__mySkyParcelNormalized = true;
      if (finite(webkitCompassHeading)) {
        Object.defineProperty(event, "webkitCompassHeading", { value: webkitCompassHeading, enumerable: true });
      }
      return event;
    }
  } catch {
    // Fall through to a generic Event for browsers with a restricted constructor.
  }

  const event = new Event("deviceorientation") as OrientationLike;
  Object.defineProperties(event, {
    alpha: { value: alpha, enumerable: true },
    beta: { value: beta, enumerable: true },
    gamma: { value: gamma, enumerable: true },
    absolute: { value: absolute, enumerable: true },
    webkitCompassHeading: { value: webkitCompassHeading, enumerable: true },
    __mySkyParcelNormalized: { value: true },
  });
  return event;
}

function gravityToOrientation(event: MotionLike, last: { alpha: number; beta: number; gamma: number }) {
  const gravity = event.accelerationIncludingGravity;
  const gx = gravity?.x;
  const gy = gravity?.y;
  const gz = gravity?.z;
  if (!finite(gx) || !finite(gy) || !finite(gz)) return last;

  const horizontal = Math.max(0.001, Math.hypot(gy, gz));
  return {
    alpha: last.alpha,
    beta: clamp((Math.atan2(-gx, horizontal) * 180) / Math.PI, -180, 180),
    // gamma can legitimately pass +/-90 when the phone is rotated toward the sky.
    // Clamping it to +/-90 collapses the sky-facing orientation to a horizontal pose.
    gamma: clamp((Math.atan2(gy, gz) * 180) / Math.PI, -180, 180),
  };
}

export function SkyScanSensorBridge({ children }: { children: ReactNode }) {
  useEffect(() => {
    let last = { alpha: 0, beta: 0, gamma: 0 };

    const onOrientation = (event: Event) => {
      const source = event as OrientationLike;
      if (source.__mySkyParcelNormalized) return;

      const alpha = finite(source.alpha) ? source.alpha : last.alpha;
      const beta = finite(source.beta) ? source.beta : last.beta;
      const gamma = finite(source.gamma) ? source.gamma : last.gamma;
      const hasUsefulValue = finite(source.alpha) || finite(source.beta) || finite(source.gamma);
      if (!hasUsefulValue) return;

      last = { alpha, beta, gamma };

      const isAbsoluteEvent = event.type === "deviceorientationabsolute";
      const absolute = isAbsoluteEvent || Boolean(source.absolute);
      const compassHeading = finite(source.webkitCompassHeading)
        ? normalizeHeading(source.webkitCompassHeading)
        : isAbsoluteEvent && finite(source.alpha)
          ? normalizeHeading(source.alpha)
          : undefined;

      if (isAbsoluteEvent || !finite(source.alpha) || !finite(source.beta) || !finite(source.gamma)) {
        window.dispatchEvent(makeOrientationEvent(alpha, beta, gamma, absolute, compassHeading));
      }
    };

    const onMotion = (event: Event) => {
      const source = event as MotionLike;
      if (source.__mySkyParcelHandled) return;
      const rotation = source.rotationRate;
      if (rotation && finite(rotation.alpha)) last.alpha = rotation.alpha;

      const next = gravityToOrientation(source, last);
      if (next === last) return;
      last = next;
      window.dispatchEvent(makeOrientationEvent(next.alpha, next.beta, next.gamma, false));
    };

    window.addEventListener("deviceorientation", onOrientation, true);
    window.addEventListener("deviceorientationabsolute", onOrientation, true);
    window.addEventListener("devicemotion", onMotion, true);

    return () => {
      window.removeEventListener("deviceorientation", onOrientation, true);
      window.removeEventListener("deviceorientationabsolute", onOrientation, true);
      window.removeEventListener("devicemotion", onMotion, true);
    };
  }, []);

  useEffect(() => {
    const requestMotionPermission = async () => {
      const Motion = window.DeviceMotionEvent as typeof DeviceMotionEvent & {
        requestPermission?: () => Promise<PermissionState>;
      };
      if (typeof Motion.requestPermission !== "function") return;
      try {
        await Motion.requestPermission();
      } catch {
        // Orientation remains the primary sensor path; motion is an enhancement.
      }
    };

    document.addEventListener("click", requestMotionPermission, { capture: true, once: true });
    return () => document.removeEventListener("click", requestMotionPermission, true);
  }, []);

  return <>{children}</>;
}
