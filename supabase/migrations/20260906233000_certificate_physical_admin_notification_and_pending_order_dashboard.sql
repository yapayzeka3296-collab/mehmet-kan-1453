-- Users can create certificates for their own sold parcels without admin approval.
-- Elite/Premium physical certificate requests notify admins with full user and shipping details.
-- Admin dashboard/order list only count active pending purchase orders backed by a live 5-minute reservation.

create or replace function public.notify_admin_physical_certificate_request()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions, pg_temp
as $$
declare
  user_email text;
  user_name text;
  parcel_number text;
begin
  select u.email into user_email from auth.users u where u.id = new.user_id;
  select p.full_name into user_name from public.profiles p where p.id = new.user_id;
  select p.parcel_number into parcel_number from public.parcels p where p.id = new.parcel_id;

  insert into public.admin_notifications(type,title,message,entity_id,metadata)
  values(
    'physical_certificate',
    'Yeni fiziksel sertifika talebi',
    'Yeni fiziksel sertifika talebi oluşturuldu.' || E'\n\n' ||
    'Kullanıcı: ' || coalesce(nullif(trim(user_name),''),'—') || E'\n' ||
    'E-posta: ' || coalesce(nullif(trim(user_email),''),'—') || E'\n' ||
    'Telefon: ' || coalesce(nullif(trim(new.shipping_phone),''),'—') || E'\n\n' ||
    'Parsel: ' || coalesce(parcel_number,'—') || E'\n' ||
    'Sertifika seviyesi: ' || upper(coalesce(new.tier,'—')) || E'\n' ||
    'Ad Soyad: ' || coalesce(nullif(trim(new.shipping_full_name),''),'—') || E'\n' ||
    'İl: ' || coalesce(nullif(trim(new.shipping_city),''),'—') || E'\n' ||
    'İlçe: ' || coalesce(nullif(trim(new.shipping_district),''),'—') || E'\n' ||
    'Posta Kodu: ' || coalesce(nullif(trim(new.shipping_postal_code),''),'—') || E'\n' ||
    'Açık Adres: ' || coalesce(nullif(trim(new.shipping_address_line),''),'—') || E'\n' ||
    'Ülke: ' || coalesce(nullif(trim(new.shipping_country),''),'Türkiye'),
    new.id,
    jsonb_build_object(
      'user_id',new.user_id,
      'user_email',user_email,
      'user_name',user_name,
      'certificate_id',new.certificate_id,
      'parcel_id',new.parcel_id,
      'parcel_number',parcel_number,
      'tier',new.tier,
      'status',new.status,
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

create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare result jsonb;
begin
  if not public.is_admin() then raise exception 'admin access required' using errcode='42501'; end if;
  select jsonb_build_object(
    'parcels_total',(select count(*) from public.parcels where status='available'),
    'parcels_inventory_total',(select count(*) from public.parcels),
    'parcels_sold',(select count(*) from public.parcels where status='sold'),
    'parcels_available',(select count(*) from public.parcels where status='available'),
    'parcels_reserved',(select count(*) from public.parcels where status='reserved' and reserved_until is not null and reserved_until > now()),
    'parcels_admin_owned',(select count(*) from public.parcels p join public.profiles pr on pr.id=p.owner_id where p.status='sold' and pr.role='admin'),
    'users_total',(select count(*) from public.profiles where coalesce(role,'user') <> 'admin'),
    'certificates_total',(select count(*) from public.certificate_requests where status='issued'),
    'certificates_issued',(select count(*) from public.certificate_requests where status='issued'),
    'certificates_pending',(select count(*) from public.certificate_requests where status in ('requested','approved')),
    'certificates_revoked',(select count(*) from public.certificate_requests where status='revoked'),
    'orders_total',(select count(*) from public.orders o join public.parcels p on p.id=o.parcel_id where o.status='pending' and p.status='reserved' and p.owner_id is null and p.reserved_by=o.user_id and p.reserved_until is not null and p.reserved_until > now()),
    'orders_paid',(select count(*) from public.orders where status='paid'),
    'generated_at',now()
  ) into result;
  return result;
end;
$$;

create or replace function public.admin_list_orders(p_limit integer default 100,p_offset integer default 0)
returns setof public.orders
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then raise exception 'admin access required' using errcode='42501'; end if;
  return query
    select o.*
    from public.orders o
    join public.parcels p on p.id=o.parcel_id
    where o.status='pending'
      and p.status='reserved'
      and p.owner_id is null
      and p.reserved_by=o.user_id
      and p.reserved_until is not null
      and p.reserved_until > now()
    order by o.created_at desc
    limit least(greatest(p_limit,1),200)
    offset greatest(p_offset,0);
end;
$$;
