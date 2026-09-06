create or replace function public.admin_list_payment_management(p_limit integer default 100,p_offset integer default 0)
returns table(
  order_id uuid,
  user_id uuid,
  user_name text,
  user_email text,
  parcel_id uuid,
  parcel_number text,
  tier text,
  amount numeric,
  currency text,
  payment_status text,
  provider text,
  provider_reference text,
  purchased_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode='42501';
  end if;

  return query
  select
    o.id,
    o.user_id,
    p.full_name,
    u.email::text,
    o.parcel_id,
    pa.parcel_number,
    pa.tier,
    o.amount,
    o.currency,
    o.status,
    o.provider,
    o.provider_reference,
    o.updated_at
  from public.orders o
  join public.parcels pa on pa.id=o.parcel_id
  left join public.profiles p on p.id=o.user_id
  left join auth.users u on u.id=o.user_id
  where o.status='paid'
  order by o.updated_at desc
  limit least(greatest(coalesce(p_limit,100),1),200)
  offset greatest(coalesce(p_offset,0),0);
end;
$$;

revoke execute on function public.admin_list_payment_management(integer,integer) from anon, authenticated, public;
grant execute on function public.admin_list_payment_management(integer,integer) to authenticated;
