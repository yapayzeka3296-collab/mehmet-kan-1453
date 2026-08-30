-- Include the recipient's shipping and contact details directly in the admin notification.
-- Authentication, ownership and physical-certificate eligibility rules are unchanged.

create or replace function public.notify_admin_physical_certificate_request()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions, pg_temp
as $$
declare
  user_email text;
  profile_name text;
  details text;
begin
  select email, coalesce(raw_user_meta_data->>'full_name','')
    into user_email, profile_name
  from auth.users
  where id = new.user_id;

  select coalesce(nullif(trim(full_name),''), profile_name)
    into profile_name
  from public.profiles
  where id = new.user_id;

  details := format(
    'Fiziksel sertifika talebi. Kullanıcı: %s%s | Telefon: %s | Adres: %s | İlçe: %s | İl: %s | Posta Kodu: %s | Ülke: %s | Parsel: %s | Kademe: %s',
    coalesce(nullif(trim(profile_name),''),'Belirtilmemiş'),
    case when nullif(trim(coalesce(user_email,'')),'') is not null then ' | E-posta: ' || user_email else '' end,
    new.shipping_phone,
    new.shipping_address_line,
    new.shipping_district,
    new.shipping_city,
    coalesce(new.shipping_postal_code,'Belirtilmemiş'),
    new.shipping_country,
    new.parcel_id::text,
    new.tier
  );

  insert into public.admin_notifications(type,title,message,entity_id,metadata)
  values(
    'physical_certificate',
    'Yeni fiziksel sertifika talebi',
    details,
    new.id,
    jsonb_build_object(
      'user_id',new.user_id,
      'user_email',user_email,
      'full_name',profile_name,
      'certificate_id',new.certificate_id,
      'parcel_id',new.parcel_id,
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
