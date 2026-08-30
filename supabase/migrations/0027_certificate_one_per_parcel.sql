-- A certificate belongs to a parcel, so the uniqueness boundary must be user + parcel,
-- not user + tier. This allows a user to own multiple parcels of the same tier.
drop index if exists public.certificate_one_per_user_tier_idx;
create unique index if not exists certificate_one_per_user_parcel_idx
  on public.certificate_requests(user_id, parcel_id);
