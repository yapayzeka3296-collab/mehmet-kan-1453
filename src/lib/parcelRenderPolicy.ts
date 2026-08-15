export type ParcelRenderDetail = 1 | 2 | 3 | 4;

/**
 * Centralized zoom policy for the parcel map.
 * Keeps rendering decisions out of data fetching and purchase logic.
 */
export function getParcelRenderDetail(zoomLevel: number): ParcelRenderDetail {
  if (zoomLevel <= 1) return 1;
  if (zoomLevel === 2) return 2;
  if (zoomLevel === 3) return 3;
  return 4;
}

export function shouldRenderParcelNumber(detail: ParcelRenderDetail, selected = false): boolean {
  return selected || detail >= 4;
}

export function shouldRenderCornerLights(detail: ParcelRenderDetail, selected = false): boolean {
  return selected || detail >= 3;
}

export function shouldRenderSectorBadge(detail: ParcelRenderDetail): boolean {
  return detail >= 2;
}

export function shouldRenderGlow(detail: ParcelRenderDetail, selected = false): boolean {
  return selected || detail >= 3;
}
