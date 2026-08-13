-- MySkyParcel: restore the parcel tier_price contract used by the application.
-- Production-safe: additive column + deterministic backfill from the existing canonical price.
-- No rows are deleted and no existing RLS, policies, functions, or triggers are changed.

ALTER TABLE public.parcels
  ADD COLUMN IF NOT EXISTS tier_price numeric(14,2);

UPDATE public.parcels
SET tier_price = price
WHERE tier_price IS NULL;

CREATE INDEX IF NOT EXISTS parcels_tier_price_idx
  ON public.parcels(tier_price);
