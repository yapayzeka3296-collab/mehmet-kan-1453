-- Keep expired Shopier reservations self-cleaning in production.
-- pg_cron runs this once per minute so a parcel becomes available without
-- waiting for another checkout request.

create extension if not exists pg_cron with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

create or replace function public.cleanup_expired_shopier_reservations()
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  update public.parcels
  set
    status = 'available',
    reserved_by = null,
    reserved_until = null,
    updated_at = now()
  where status = 'reserved'
    and reserved_until is not null
    and reserved_until <= now()
    and owner_id is null;

  update public.shopier_checkout_intents
  set
    status = 'expired',
    updated_at = now()
  where status in ('pending', 'redirected')
    and expires_at is not null
    and expires_at <= now();
end;
$$;

revoke all on function public.cleanup_expired_shopier_reservations() from public;
grant execute on function public.cleanup_expired_shopier_reservations() to postgres;

-- Idempotent job creation: the same name will not create duplicate workers.
select cron.schedule(
  'myskyparcel-shopier-reservation-cleanup',
  '* * * * *',
  'select public.cleanup_expired_shopier_reservations()'
)
where not exists (
  select 1
  from cron.job
  where jobname = 'myskyparcel-shopier-reservation-cleanup'
);
