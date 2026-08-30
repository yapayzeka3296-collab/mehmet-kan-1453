-- Fix the physical-certificate request RPC variable/alias collision.
-- No workflow or permission changes: the existing ownership, issued-certificate,
-- elite/premium, address validation, and admin-notification behavior remain intact.

create or replace function public.request_physical_certificate(
  p_certificate_id uuid,
  p_shipping_full_name text,
  p_shipping_phone text,
  p_shipping_address_line text,
  p_shipping_district text,
  p_shipping_city text,
  p_shipping_postal_code text default null,
  p_shipping_country text default 'Türkiye'
)
returns public.physical_certificate_requests
language plpgsql
security definer
set search_path = public, auth, extensions, pg_temp
as $$
declare
  actor uuid := auth.uid();
  c public.certificate_requests%rowtype;
  request_row public.physical_certificate_requests%rowtype;
begin
  if actor is null then raise exception 'authentication_required'; end if;
  if nullif(trim(coalesce(p_shipping_full_name,'')),'') is null then raise exception 'shipping_full_name_required'; end if;
  if nullif(trim(coalesce(p_shipping_phone,'')),'') is null then raise exception 'shipping_phone_required'; end if;
  if nullif(trim(coalesce(p_shipping_address_line,'')),'') is null then raise exception 'shipping_address_required'; end if;
  if nullif(trim(coalesce(p_shipping_district,'')),'') is null then raise exception 'shipping_district_required'; end if;
  if nullif(trim(coalesce(p_shipping_city,'')),'') is null then raise exception 'shipping_city_required'; end if;

  select * into c from public.certificate_requests where id=p_certificate_id for share;
  if not found then raise exception 'certificate_not_found'; end if;
  if c.user_id is distinct from actor then raise exception 'certificate_not_owned'; end if;
  if c.status <> 'issued' then raise exception 'certificate_not_issued'; end if;
  if c.tier not in ('elite','premium') then raise exception 'physical_certificate_not_available_for_tier'; end if;
  if exists(
    select 1
    from public.physical_certificate_requests pcr
    where pcr.certificate_id=c.id
      and pcr.status in ('requested','processing','shipped')
  ) then raise exception 'physical_certificate_already_requested'; end if;

  insert into public.physical_certificate_requests(
    certificate_id,user_id,parcel_id,tier,status,
    shipping_full_name,shipping_phone,shipping_address_line,
    shipping_district,shipping_city,shipping_postal_code,shipping_country
  )
  values(
    c.id,actor,c.parcel_id,c.tier,'requested',
    trim(p_shipping_full_name),trim(p_shipping_phone),trim(p_shipping_address_line),
    trim(p_shipping_district),trim(p_shipping_city),
    nullif(trim(coalesce(p_shipping_postal_code,'')),''),
    coalesce(nullif(trim(p_shipping_country),''),'Türkiye')
  ) returning * into request_row;

  return request_row;
end;
$$;

revoke all on function public.request_physical_certificate(uuid,text,text,text,text,text,text,text) from public, anon;
grant execute on function public.request_physical_certificate(uuid,text,text,text,text,text,text,text) to authenticated;
