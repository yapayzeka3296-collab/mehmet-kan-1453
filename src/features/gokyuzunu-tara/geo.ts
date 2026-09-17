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
 * MySkyParcel's virtual sky layer. The DB latitude/longitude define the
 * parcel's horizontal world coordinate; altitude is deliberately virtual,
 * so parcels are displayed above the real horizon instead of on the ground.
 */
export function skyAltitudeMeters(parcel: SkyParcel, observerAltitude = 0) {
  const layer = Math.max(1, parcel.layer_number ?? 1);
  const sector = Math.max(1, parcel.sector_number ?? 1);
  return observerAltitude + 120 + (layer - 1) * 30 + Math.min(sector, 12) * 2;
}

export function projectSkyParcel(
  observer: GeoPoint,
  heading: number,
  parcel: SkyParcel,
  viewport: { width: number; height: number },
  options: { horizontalFov?: number; verticalFov?: number } = {},
) {
  const horizontalFov = options.horizontalFov ?? 70;
  const verticalFov = options.verticalFov ?? 50;
  const distance = distanceMeters(observer, parcel);
  const bearing = bearingDegrees(observer, parcel);
  const bearingDelta = normalizeAngle(bearing - heading);
  const altitude = skyAltitudeMeters(parcel, observer.altitude ?? 0);
  const elevation = Math.atan2(altitude - (observer.altitude ?? 0), Math.max(distance, 1)) / DEG;

  const x = viewport.width / 2 + (bearingDelta / (horizontalFov / 2)) * (viewport.width / 2);
  const y = viewport.height / 2 - (elevation / (verticalFov / 2)) * (viewport.height / 2);
  const visible = Math.abs(bearingDelta) <= horizontalFov / 2 && Math.abs(elevation) <= verticalFov / 2;

  return { x, y, visible, distance, bearing, bearingDelta, elevation, altitude };
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
