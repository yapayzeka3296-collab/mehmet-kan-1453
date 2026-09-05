-- Harden Shopier checkout retries against abandoned/expired payment sessions.
-- Expired reservations and their pending checkout intents/orders must never block
-- a later purchase of the same parcel.

create or replace function public.cleanup_expired_shopier_checkout_state()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_released integer := 0;
begin
  update public.parcels p
  set status = 'available',
      reserved_by = null,
      reserved_until = null,
      updated_at = now()
  where p.status = 'reserved'
    and p.reserved_until is not null
    and p.reserved_until <= now()
    and p.owner_id is null;

  get diagnostics v_released = row_count;

  update public.orders o
  set status = 'cancelled'
  where o.status = 'pending'
    and exists (
      select 1
      from public.shopier_checkout_intents i
      where o.id = any(i.order_ids)
        and i.status in ('pending', 'redirected')
        and i.expires_at <= now()
    );

  update public.shopier_checkout_intents i
  set status = 'expired',
      updated_at = now()
  where i.status in ('pending', 'redirected')
    and i.expires_at <= now();

  return v_released;
end;
$$;

revoke all on function public.cleanup_expired_shopier_checkout_state() from public, anon, authenticated;
grant execute on function public.cleanup_expired_shopier_checkout_state() to service_role;
