-- Certificate delivery: preserve existing certificate flow and add optional physical-delivery details.
-- The request RPC requires delivery details for new certificate requests.

alter table public.certificate_requests
  add column if not exists production_status text not null default 'request_received',
  add column if not exists shipping_company text,
  add column if not exists tracking_number text,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists shipping_full_name text,
  add column if not exists shipping_phone text,
  add column if not exists shipping_address_line text,
  add column if not exists shipping_district text,
  add column if not exists shipping_city text,
  add column if not exists shipping_postal_code text,
  add column if not exists shipping_country text not null default 'Türkiye';

create index if not exists certificate_requests_shipping_status_idx
  on public.certificate_requests (production_status, shipped_at, delivered_at);

create or replace function public.request_certificate(
  p_parcel_id uuid,
  p_shipping_full_name text,
  p_shipping_phone text,
  p_shipping_address_line text,
  p_shipping_district text,
  p_shipping_city text,
  p_shipping_postal_code text default null,
  p_shipping_country text default 'Türkiye'
)
returns public.certificate_requests
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor uuid := (select auth.uid());
  p public.parcels%ROWTYPE;
  r public.certificate_requests%ROWTYPE;
begin
  if actor is null then raise exception 'authentication_required'; end if;
  if nullif(trim(coalesce(p_shipping_full_name,'')),'') is null then raise exception 'shipping_full_name_required'; end if;
  if nullif(trim(coalesce(p_shipping_phone,'')),'') is null then raise exception 'shipping_phone_required'; end if;
  if nullif(trim(coalesce(p_shipping_address_line,'')),'') is null then raise exception 'shipping_address_required'; end if;
  if nullif(trim(coalesce(p_shipping_district,'')),'') is null then raise exception 'shipping_district_required'; end if;
  if nullif(trim(coalesce(p_shipping_city,'')),'') is null then raise exception 'shipping_city_required'; end if;
  select * into p from public.parcels where id = p_parcel_id for share;
  if not found then raise exception 'parcel_not_found'; end if;
  if p.owner_id is distinct from actor or p.status <> 'sold' then raise exception 'certificate_requires_owned_sold_parcel'; end if;
  if p.tier not in ('digital','elite','premium') then raise exception 'invalid_parcel_tier'; end if;
  if exists (select 1 from public.certificate_requests cr where cr.user_id = actor and cr.parcel_id = p.id and cr.status in ('requested','approved','issued','revoked')) then raise exception 'certificate_already_requested'; end if;
  insert into public.certificate_requests(user_id, parcel_id, tier, status, production_status, shipping_full_name, shipping_phone, shipping_address_line, shipping_district, shipping_city, shipping_postal_code, shipping_country)
  values(actor, p.id, p.tier, 'requested', 'request_received', trim(p_shipping_full_name), trim(p_shipping_phone), trim(p_shipping_address_line), trim(p_shipping_district), trim(p_shipping_city), nullif(trim(coalesce(p_shipping_postal_code,'')),''), coalesce(nullif(trim(p_shipping_country),''),'Türkiye'))
  returning * into r;
  return r;
end;
$$;

revoke all on function public.request_certificate(uuid,text,text,text,text,text,text,text) from public;
grant execute on function public.request_certificate(uuid,text,text,text,text,text,text,text) to authenticated;
