export type GeoPoint = {
  latitude: number;
  longitude: number;
  altitude?: number | null;
};

export type WorldPoint = {
  x: number; // east, metres
  y: number; // up, metres
  z: number; // south, metres
};

const EARTH_RADIUS_M = 6371008.8;
const toRad = (degrees: number) => (degrees * Math.PI) / 180;

/** Convert a WGS84-like lat/lng point to a local East-Up-South frame. */
export function geoToEus(origin: GeoPoint, target: GeoPoint, fallbackAltitude = 0): WorldPoint {
  const dLat = toRad(target.latitude - origin.latitude);
  const dLon = toRad(target.longitude - origin.longitude);
  const meanLat = toRad((origin.latitude + target.latitude) / 2);
  const north = dLat * EARTH_RADIUS_M;
  const east = dLon * EARTH_RADIUS_M * Math.cos(meanLat);
  const altitude0 = origin.altitude ?? fallbackAltitude;
  const altitude1 = target.altitude ?? fallbackAltitude;
  return { x: east, y: altitude1 - altitude0, z: -north };
}

export function distance2D(a: GeoPoint, b: GeoPoint): number {
  const p = geoToEus(a, b);
  return Math.hypot(p.x, p.z);
}

export function bearingDegrees(a: GeoPoint, b: GeoPoint): number {
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return normalizeDegrees((Math.atan2(y, x) * 180) / Math.PI);
}

export function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

export function angularDifference(a: number, b: number): number {
  const delta = Math.abs(normalizeDegrees(a) - normalizeDegrees(b));
  return Math.min(delta, 360 - delta);
}
