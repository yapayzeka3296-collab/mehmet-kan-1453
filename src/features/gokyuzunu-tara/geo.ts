export type GeoPoint = { latitude: number; longitude: number; altitude?: number };

export type SkyParcel = {
  id: string;
  parcel_number: string;
  status: string;
  price: number | null;
  tier: string | null;
  city_name: string | null;
  latitude: number;
  longitude: number;
  layer_number: number | null;
  sector_number: number | null;
  grid_x: number | null;
  grid_y: number | null;
};

const EARTH_RADIUS_M = 6_371_000;
const DEG = Math.PI / 180;

export function distanceMeters(a: GeoPoint, b: GeoPoint) {
  const lat1 = a.latitude * DEG;
  const lat2 = b.latitude * DEG;
  const dLat = (b.latitude - a.latitude) * DEG;
  const dLon = (b.longitude - a.longitude) * DEG;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function bearingDegrees(a: GeoPoint, b: GeoPoint) {
  const lat1 = a.latitude * DEG;
  const lat2 = b.latitude * DEG;
  const dLon = (b.longitude - a.longitude) * DEG;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (Math.atan2(y, x) / DEG + 360) % 360;
}

export function normalizeAngle(angle: number) {
  return ((angle + 540) % 360) - 180;
}

/**
 * MySkyParcel sky coordinates are anchored to the real parcel latitude/longitude
 * and compass bearing. The vertical component is virtual: every parcel receives
 * a stable elevation angle above the local horizon so it remains visible in the
 * sky instead of being pinned to the ground or to the camera screen.
 */
export function skyElevationDegrees(parcel: SkyParcel) {
  const layer = Math.max(1, parcel.layer_number ?? 1);
  const sector = Math.max(1, parcel.sector_number ?? 1);
  return Math.min(42, 9 + (layer - 1) * 1.6 + Math.min(sector - 1, 20) * 0.12);
}

export function skyAltitudeMeters(parcel: SkyParcel, observer: GeoPoint, distance: number) {
  const elevation = skyElevationDegrees(parcel) * DEG;
  const base = Math.max(120, distance * Math.tan(elevation));
  const layer = Math.max(1, parcel.layer_number ?? 1);
  return (observer.altitude ?? 0) + base + (layer - 1) * 20;
}

export function projectSkyParcel(
  observer: GeoPoint,
  heading: number,
  pitch: number,
  parcel: SkyParcel,
  viewport: { width: number; height: number },
  options: { horizontalFov?: number; verticalFov?: number } = {},
) {
  const horizontalFov = options.horizontalFov ?? 70;
  const verticalFov = options.verticalFov ?? 55;
  const distance = distanceMeters(observer, parcel);
  const bearing = bearingDegrees(observer, parcel);
  const bearingDelta = normalizeAngle(bearing - heading);
  const elevation = skyElevationDegrees(parcel);
  const altitude = skyAltitudeMeters(parcel, observer, distance);
  const elevationDelta = elevation - pitch;

  const x = viewport.width / 2 + (bearingDelta / (horizontalFov / 2)) * (viewport.width / 2);
  const y = viewport.height / 2 - (elevationDelta / (verticalFov / 2)) * (viewport.height / 2);
  const visible = Math.abs(bearingDelta) <= horizontalFov / 2 && Math.abs(elevationDelta) <= verticalFov / 2;

  return { x, y, visible, distance, bearing, bearingDelta, elevation, elevationDelta, altitude };
}

export function boundingBox(point: GeoPoint, radiusMeters: number) {
  const latDelta = radiusMeters / 111_320;
  const lonDelta = radiusMeters / (111_320 * Math.max(Math.cos(point.latitude * DEG), 0.15));
  return {
    minLat: point.latitude - latDelta,
    maxLat: point.latitude + latDelta,
    minLon: point.longitude - lonDelta,
    maxLon: point.longitude + lonDelta,
  };
}
