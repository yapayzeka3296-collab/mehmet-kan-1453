import type { Parcel, ParcelTier } from "@/types/parcel";

const TIER_COUNTS: Record<ParcelTier, number> = { digital: 30, elite: 22, premium: 8 };
const MAX_VISIBLE_SOLD = 6;

function stableIndex(id: string, length: number) {
  if (!length) return 0;
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(hash) % length;
}

/**
 * Keeps the 30/22/8 tier layout while exposing real sold records in the
 * visible 60 slots. No available parcel is fabricated as sold. The UI caps
 * the visible sold count at 6 (10% of 60) while preserving real ownership.
 */
export function selectVisibleCityParcels(parcels: Parcel[]) {
  let soldRemaining = MAX_VISIBLE_SOLD;
  const result: Parcel[] = [];

  (Object.keys(TIER_COUNTS) as ParcelTier[]).forEach((tier) => {
    const tierRows = parcels.filter((parcel) => parcel.tier === tier);
    const count = TIER_COUNTS[tier];
    const base = tierRows.slice(0, count);
    const soldInside = base.filter((parcel) => parcel.status === "sold");
    const outsideSold = tierRows.filter((parcel) => parcel.status === "sold" && !base.some((item) => item.id === parcel.id));
    const keepInside = soldInside.slice(0, soldRemaining);
    soldRemaining -= keepInside.length;

    const neededOutside = Math.max(0, Math.min(soldRemaining, outsideSold.length));
    const replacements = outsideSold.slice(0, neededOutside);
    soldRemaining -= replacements.length;

    const selectedIds = new Set(base.map((parcel) => parcel.id));
    replacements.forEach((replacement) => {
      if (!base.length) return;
      const position = stableIndex(replacement.id, base.length);
      let target = position;
      for (let step = 0; step < base.length; step += 1) {
        const candidate = base[(position + step) % base.length];
        if (candidate.status !== "sold") { target = (position + step) % base.length; break; }
      }
      const removed = base[target];
      if (removed) selectedIds.delete(removed.id);
      base[target] = replacement;
    });

    const visible = base.filter((parcel) => selectedIds.has(parcel.id) || parcel.status === "sold");
    const deduped: Parcel[] = [];
    const seen = new Set<string>();
    visible.forEach((parcel) => { if (!seen.has(parcel.id) && deduped.length < count) { seen.add(parcel.id); deduped.push(parcel); } });
    if (deduped.length < count) tierRows.filter((parcel) => !seen.has(parcel.id)).slice(0, count - deduped.length).forEach((parcel) => { seen.add(parcel.id); deduped.push(parcel); });
    result.push(...deduped);
  });

  return result.slice(0, 60);
}
