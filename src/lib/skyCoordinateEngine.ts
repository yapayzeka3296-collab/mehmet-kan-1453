export type GeoPoint = {
  latitude: number;
  longitude: number;
  altitude?: number;
};

export type SkyWorldPoint = {
  x: number;
  y: number;
  z: number;
};

const EARTH_RADIUS_M = 6_378_137;
const DEG_TO_RAD = Math.PI / 180;

/**
 * Converts a geographic point into the local MySkyParcel ENU world.
 * X = East, Y = Up, Z = North.
 *
 * Parcel altitude is supplied by the caller from the parcel's sky layer.
 * It must not be replaced by an artificial 5 km+ height: that pushed normal
 * nearby parcels above the phone camera's field of view when scanning upward.
 */
export function geoToSkyWorld(origin: GeoPoint, target: GeoPoint): SkyWorldPoint {
  const dLat = (target.latitude - origin.latitude) * DEG_TO_RAD;
  const dLon = (target.longitude - origin.longitude) * DEG_TO_RAD;
  const meanLat = ((origin.latitude + target.latitude) * 0.5) * DEG_TO_RAD;
  const x = dLon * Math.cos(meanLat) * EARTH_RADIUS_M;
  const z = dLat * EARTH_RADIUS_M;
  const y = (target.altitude ?? 0) - (origin.altitude ?? 0);

  return { x, y, z };
}

export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const lat1 = a.latitude * DEG_TO_RAD;
  const lat2 = b.latitude * DEG_TO_RAD;
  const dLat = (b.latitude - a.latitude) * DEG_TO_RAD;
  const dLon = (b.longitude - a.longitude) * DEG_TO_RAD;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const surface = 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  const dAlt = (b.altitude ?? 0) - (a.altitude ?? 0);
  return Math.hypot(surface, dAlt);
}

export function bearingDegrees(a: GeoPoint, b: GeoPoint): number {
  const lat1 = a.latitude * DEG_TO_RAD;
  const lat2 = b.latitude * DEG_TO_RAD;
  const dLon = (b.longitude - a.longitude) * DEG_TO_RAD;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

export function destinationPoint(origin: GeoPoint, distance: number, bearing: number, altitude?: number): GeoPoint {
  const angularDistance = distance / EARTH_RADIUS_M;
  const bearingRad = bearing * DEG_TO_RAD;
  const lat1 = origin.latitude * DEG_TO_RAD;
  const lon1 = origin.longitude * DEG_TO_RAD;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad),
  );
  const lon2 = lon1 + Math.atan2(
    Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
    Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
  );

  return {
    latitude: lat2 / DEG_TO_RAD,
    longitude: lon2 / DEG_TO_RAD,
    altitude: altitude ?? origin.altitude ?? 0,
  };
}
