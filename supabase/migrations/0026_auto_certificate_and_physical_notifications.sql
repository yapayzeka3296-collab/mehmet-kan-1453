-- MySkyParcel: automatically issue digital certificates on request.
-- Physical delivery requests additionally create an admin-only notification with shipping details.
-- Existing certificate/admin structures are preserved.

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
set search_path = public, extensions, pg_temp
as $$
declare
  actor uuid := auth.uid();
  p public.parcels%rowtype;
  r public.certificate_requests%rowtype;
  holder_snapshot text;
  city_snapshot text;
  template_snapshot text;
  version_snapshot text;
  cnum text;
  qtoken text;
  fingerprint text;
  physical_requested boolean;
begin
  if actor is null then raise exception 'authentication_required'; end if;

  select * into p from public.parcels where id = p_parcel_id for update;
  if not found then raise exception 'parcel_not_found'; end if;
  if p.owner_id is distinct from actor or p.status <> 'sold' then
    raise exception 'certificate_requires_owned_sold_parcel';
  end if;
  if p.tier not in ('digital','elite','premium') then raise exception 'invalid_parcel_tier'; end if;

  if exists (
    select 1 from public.certificate_requests cr
    where cr.user_id = actor and cr.parcel_id = p.id
      and cr.status in ('requested','approved','issued','revoked')
  ) then raise exception 'certificate_already_requested'; end if;

  physical_requested := nullif(trim(coalesce(p_shipping_full_name,'')),'') is not null
    or nullif(trim(coalesce(p_shipping_phone,'')),'') is not null
    or nullif(trim(coalesce(p_shipping_address_line,'')),'') is not null
    or nullif(trim(coalesce(p_shipping_district,'')),'') is not null
    or nullif(trim(coalesce(p_shipping_city,'')),'') is not null
    or nullif(trim(coalesce(p_shipping_postal_code,'')),'') is not null;

  if physical_requested then
    if nullif(trim(coalesce(p_shipping_full_name,'')),'') is null then raise exception 'shipping_full_name_required'; end if;
    if nullif(trim(coalesce(p_shipping_phone,'')),'') is null then raise exception 'shipping_phone_required'; end if;
    if nullif(trim(coalesce(p_shipping_address_line,'')),'') is null then raise exception 'shipping_address_required'; end if;
    if nullif(trim(coalesce(p_shipping_district,'')),'') is null then raise exception 'shipping_district_required'; end if;
    if nullif(trim(coalesce(p_shipping_city,'')),'') is null then raise exception 'shipping_city_required'; end if;
  end if;

  select coalesce(nullif(btrim(pr.full_name),''),'MySkyParcel Kullanıcısı')
    into holder_snapshot from public.profiles pr where pr.id = actor;
  holder_snapshot := coalesce(holder_snapshot,'MySkyParcel Kullanıcısı');

  select coalesce(c.name,'Türkiye') into city_snapshot
    from public.cities c where c.id=p.city_id;
  city_snapshot := coalesce(city_snapshot,'Türkiye');

  template_snapshot := case p.tier when 'digital' then 'digital' when 'elite' then 'special' when 'premium' then 'premium' end;
  version_snapshot := case p.tier when 'digital' then 'digital-v1' when 'elite' then 'special-v1' when 'premium' then 'premium-v1' end;
  cnum := 'MSP-' || upper(substr(encode(gen_random_bytes(16),'hex'),1,24));
  qtoken := encode(gen_random_bytes(32),'hex');
  fingerprint := upper(encode(digest(p.id::text||':'||actor::text||':'||p.tier||':'||cnum||':'||qtoken,'sha256'),'hex'));

  insert into public.certificate_requests(
    user_id, parcel_id, tier, status, certificate_number, qr_token,
    certificate_fingerprint, requested_at, issued_at,
    holder_name_snapshot, city_name_snapshot, template_type, template_version,
    verification_url, production_status,
    shipping_full_name, shipping_phone, shipping_address_line,
    shipping_district, shipping_city, shipping_postal_code, shipping_country
  ) values (
    actor, p.id, p.tier, 'issued', cnum, qtoken,
    fingerprint, now(), now(),
    holder_snapshot, city_snapshot, template_snapshot, version_snapshot,
    '/sertifika-dogrula?code='||cnum,
    case when physical_requested then 'request_received' else 'not_requested' end,
    case when physical_requested then trim(p_shipping_full_name) end,
    case when physical_requested then trim(p_shipping_phone) end,
    case when physical_requested then trim(p_shipping_address_line) end,
    case when physical_requested then trim(p_shipping_district) end,
    case when physical_requested then trim(p_shipping_city) end,
    case when physical_requested then nullif(trim(coalesce(p_shipping_postal_code,'')),'') end,
    case when physical_requested then coalesce(nullif(trim(p_shipping_country),''),'Türkiye') else 'Türkiye' end
  ) returning * into r;

  insert into public.certificate_audit_log(certificate_request_id,action,actor_id,metadata)
  values(r.id,'issued',actor,jsonb_build_object(
    'certificate_number',r.certificate_number,
    'fingerprint',r.certificate_fingerprint,
    'template_type',r.template_type,
    'template_version',r.template_version,
    'automatic',true,
    'physical_requested',physical_requested
  ));

  return r;
end;
$$;

revoke all on function public.request_certificate(uuid,text,text,text,text,text,text,text) from public;
grant execute on function public.request_certificate(uuid,text,text,text,text,text,text,text) to authenticated;

create or replace function public.notify_admin_physical_certificate_request()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  user_email text;
  parcel_number text;
  address_text text;
begin
  if new.production_status <> 'request_received' then return new; end if;

  select au.email into user_email from auth.users au where au.id = new.user_id;
  select p.parcel_number into parcel_number from public.parcels p where p.id = new.parcel_id;
  address_text := concat_ws(', ', nullif(new.shipping_address_line,''), nullif(new.shipping_district,''), nullif(new.shipping_city,''), nullif(new.shipping_postal_code,''), nullif(new.shipping_country,''));

  insert into public.admin_notifications(type,title,message,entity_id,metadata)
  values (
    'certificate_physical',
    'Yeni fiziksel sertifika gönderim talebi',
    concat(
      'Kullanıcı: ', coalesce(new.shipping_full_name,'—'),
      ' | E-posta: ', coalesce(user_email,'—'),
      ' | Telefon: ', coalesce(new.shipping_phone,'—'),
      ' | Parsel: ', coalesce(parcel_number,new.parcel_id::text),
      ' | Adres: ', coalesce(address_text,'—')
    ),
    new.id,
    jsonb_build_object(
      'user_id',new.user_id,
      'user_email',user_email,
      'parcel_id',new.parcel_id,
      'parcel_number',parcel_number,
      'tier',new.tier,
      'certificate_id',new.id,
      'certificate_number',new.certificate_number,
      'shipping_full_name',new.shipping_full_name,
      'shipping_phone',new.shipping_phone,
      'shipping_address_line',new.shipping_address_line,
      'shipping_district',new.shipping_district,
      'shipping_city',new.shipping_city,
      'shipping_postal_code',new.shipping_postal_code,
      'shipping_country',new.shipping_country
    )
  );
  return new;
end;
$$;

drop trigger if exists admin_physical_certificate_notification_trigger on public.certificate_requests;
create trigger admin_physical_certificate_notification_trigger
after insert on public.certificate_requests
for each row execute function public.notify_admin_physical_certificate_request();
