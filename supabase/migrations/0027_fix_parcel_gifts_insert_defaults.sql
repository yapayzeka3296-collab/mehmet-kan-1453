-- Fix parcel gift creation: the live parcel_gifts table has NOT NULL lifecycle columns
-- without defaults, while the client intentionally supplies only the gift payload.
-- Keep creation server-safe and preserve the existing gifting flow.
alter table public.parcel_gifts
  alter column id set default gen_random_uuid(),
  alter column status set default 'pending',
  alter column expires_at set default (now() + interval '7 days'),
  alter column created_at set default now(),
  alter column updated_at set default now();

-- The client needs only the minimum table privileges required by the existing flow.
-- RLS below still restricts which rows an authenticated user may access.
grant select, insert, delete on table public.parcel_gifts to authenticated;

-- A user may only create a gift for a parcel they currently own and that is sold.
drop policy if exists parcel_gifts_insert_own on public.parcel_gifts;
create policy parcel_gifts_insert_own on public.parcel_gifts
for insert to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.parcels p
    where p.id = parcel_gifts.parcel_id
      and p.owner_id = auth.uid()
      and p.status = 'sold'
  )
);
