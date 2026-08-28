import type { Parcel, ParcelTier } from "@/types/parcel";

const TIER_COUNTS: Record<ParcelTier, number> = { digital: 30, elite: 22, premium: 8 };
const MAX_VISIBLE_SOLD = 6;

function hash(id: string) {
  let value = 0;
  for (let i = 0; i < id.length; i += 1) value = (value * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(value);
}

/** Keep 30 Digital + 22 Elite + 8 Premium while ensuring every real sale up to
 * the 10% visual cap is included in the city's 60 visible parcels.
 */
export function selectVisibleCityParcels(parcels: Parcel[]) {
  const result: Parcel[] = [];
  const allSold = parcels.filter((parcel) => parcel.status === "sold").sort((a, b) => hash(a.id) - hash(b.id));
  const soldToShow = allSold.slice(0, MAX_VISIBLE_SOLD);
  const soldIds = new Set(soldToShow.map((parcel) => parcel.id));

  (Object.keys(TIER_COUNTS) as ParcelTier[]).forEach((tier) => {
    const count = TIER_COUNTS[tier];
    const tierRows = parcels.filter((parcel) => parcel.tier === tier && !soldIds.has(parcel.id));
    const tierSold = soldToShow.filter((parcel) => parcel.tier === tier);
    const remaining = Math.max(0, count - tierSold.length);
    const nonSoldToShow = tierRows.slice(0, remaining);
    result.push(...tierSold, ...nonSoldToShow);
  });

  return result.sort((a, b) => hash(a.id) - hash(b.id)).slice(0, 60);
}
