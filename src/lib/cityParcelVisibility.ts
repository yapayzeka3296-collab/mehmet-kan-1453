import type { Parcel, ParcelTier } from "@/types/parcel";

const TIER_COUNTS: Record<ParcelTier, number> = { digital: 30, elite: 22, premium: 8 };
const MAX_VISIBLE_SOLD = 6;

function hash(id: string) {
  let value = 0;
  for (let i = 0; i < id.length; i += 1) value = (value * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(value);
}

/** Keep 30 Digital + 22 Elite + 8 Premium while showing only real sales.
 * The visible sold count is capped at six (10% of 60); available parcels are
 * never fabricated as sold. Selected sold records are deterministically mixed
 * into the 60 visible positions so they do not form a fixed cluster.
 */
export function selectVisibleCityParcels(parcels: Parcel[]) {
  let soldRemaining = MAX_VISIBLE_SOLD;
  const result: Parcel[] = [];

  (Object.keys(TIER_COUNTS) as ParcelTier[]).forEach((tier) => {
    const tierRows = parcels.filter((parcel) => parcel.tier === tier);
    const count = TIER_COUNTS[tier];
    const sold = tierRows.filter((parcel) => parcel.status === "sold");
    const nonSold = tierRows.filter((parcel) => parcel.status !== "sold");
    const soldToShow = sold.slice(0, soldRemaining);
    soldRemaining -= soldToShow.length;

    const nonSoldToShow = nonSold.slice(0, Math.max(0, count - soldToShow.length));
    const chosen = [...soldToShow, ...nonSoldToShow].sort((a, b) => hash(a.id) - hash(b.id));
    result.push(...chosen.slice(0, count));
  });

  return result.slice(0, 60);
}
