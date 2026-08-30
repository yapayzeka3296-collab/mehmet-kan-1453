-- Certificate architecture v2:
-- 1) Users create their digital certificate immediately after owning a sold parcel.
-- 2) Only elite/premium certificates may request a physical copy.
-- 3) Physical delivery is a separate admin-notified workflow.
-- 4) Existing authentication/login/logout routes are untouched.

create table if not exists public.physical_certificate_requests (
  id uuid primary key default gen_random_uuid(),
  certificate_id uuid not null references public.certificate_requests(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  parcel_id uuid not null references public.parcels(id) on delete restrict,
  tier text not null,
  status text not null default 'requested',
  shipping_full_name text not null,
  shipping_phone text not null,
  shipping_address_line text not null,
  shipping_district text not null,
  shipping_city text not null,
  shipping_postal_code text,
  shipping_country text not null default 'Türkiye',
  shipping_company text,
  tracking_number text,
  requested_at timestamptz not null default now(),
  processing_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  rejected_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  constraint physical_certificate_tier_check check (tier in ('elite','premium')),
  constraint physical_certificate_status_check check (status in ('requested','processing','shipped','delivered','rejected'))
);

create unique index if not exists physical_certificate_one_active_per_certificate_idx
  on public.physical_certificate_requests(certificate_id)
  where status in ('requested','processing','shipped');
create index if not exists physical_certificate_user_idx
  on public.physical_certificate_requests(user_id, requested_at desc);
create index if not exists physical_certificate_status_idx
  on public.physical_certificate_requests(status, requested_at desc);

alter table public.physical_certificate_requests enable row level security;

drop policy if exists physical_certificate_select_own on public.physical_certificate_requests;
create policy physical_certificate_select_own
  on public.physical_certificate_requests for select
  to authenticated
  using (user_id = auth.uid());

-- No direct INSERT/UPDATE/DELETE policies: all writes go through SECURITY DEFINER RPCs.

create or replace function public.create_certificate_for_owned_parcel(p_parcel_id uuid)
returns public.certificate_requests
language plpgsql
security definer
set search_path = public, auth, extensions, pg_temp
as $$
declare
  actor uuid := auth.uid();
  p public.parcels%rowtype;
  r public.certificate_requests%rowtype;
  cnum text;
  qtoken text;
  fingerprint text;
  holder text;
  city_name text;
begin
  if actor is null then raise exception 'authentication_required'; end if;

  select * into p from public.parcels where id = p_parcel_id for share;
  if not found then raise exception 'parcel_not_found'; end if;
  if p.owner_id is distinct from actor or p.status <> 'sold' then
    raise exception 'certificate_requires_owned_sold_parcel';
  end if;
  if p.tier not in ('digital','elite','premium') then raise exception 'invalid_parcel_tier'; end if;

  if exists (
    select 1 from public.certificate_requests cr
    where cr.user_id = actor and cr.parcel_id = p.id
      and cr.status in ('requested','approved','issued','revoked')
  ) then
    raise exception 'certificate_already_requested';
  end if;

  cnum := 'MSP-' || upper(substr(encode(extensions.gen_random_bytes(16),'hex'),1,24));
  qtoken := encode(extensions.gen_random_bytes(32),'hex');
  fingerprint := upper(encode(extensions.digest((actor::text||':'||p.id::text||':'||p.tier||':'||cnum||':'||qtoken)::bytea,'sha256'),'hex'));
  holder := coalesce(nullif(trim((select raw_user_meta_data->>'full_name' from auth.users where id = actor)),''), 'MySkyParcel Kullanıcısı');
  select name into city_name from public.cities where id = p.city_id;

  insert into public.certificate_requests(
    user_id, parcel_id, tier, status, certificate_number, qr_token,
    certificate_fingerprint, requested_at, approved_at, approved_by,
    issued_at, issued_by, admin_issued, admin_issued_by,
    holder_name_snapshot, city_name_snapshot, verification_url
  )
  values(
    actor, p.id, p.tier, 'issued', cnum, qtoken,
    fingerprint, now(), now(), actor,
    now(), actor, false, null,
    holder, city_name, '/sertifika-dogrula?code=' || cnum
  )
  returning * into r;

  return r;
end;
$$;

revoke all on function public.create_certificate_for_owned_parcel(uuid) from public, anon;
grant execute on function public.create_certificate_for_owned_parcel(uuid) to authenticated;

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
  r public.physical_certificate_requests%rowtype;
begin
  if actor is null then raise exception 'authentication_required'; end if;
  if nullif(trim(coalesce(p_shipping_full_name,'')),'') is null then raise exception 'shipping_full_name_required'; end if;
  if nullif(trim(coalesce(p_shipping_phone,'')),'') is null then raise exception 'shipping_phone_required'; end if;
  if nullif(trim(coalesce(p_shipping_address_line,'')),'') is null then raise exception 'shipping_address_required'; end if;
  if nullif(trim(coalesce(p_shipping_district,'')),'') is null then raise exception 'shipping_district_required'; end if;
  if nullif(trim(coalesce(p_shipping_city,'')),'') is null then raise exception 'shipping_city_required'; end if;

  select * into c from public.certificate_requests where id = p_certificate_id for share;
  if not found then raise exception 'certificate_not_found'; end if;
  if c.user_id is distinct from actor then raise exception 'certificate_not_owned'; end if;
  if c.status <> 'issued' then raise exception 'certificate_not_issued'; end if;
  if c.tier not in ('elite','premium') then raise exception 'physical_certificate_not_available_for_tier'; end if;
  if exists (select 1 from public.physical_certificate_requests r where r.certificate_id = c.id and r.status in ('requested','processing','shipped')) then
    raise exception 'physical_certificate_already_requested';
  end if;

  insert into public.physical_certificate_requests(
    certificate_id,user_id,parcel_id,tier,status,
    shipping_full_name,shipping_phone,shipping_address_line,shipping_district,
    shipping_city,shipping_postal_code,shipping_country
  )
  values(
    c.id,actor,c.parcel_id,c.tier,'requested',
    trim(p_shipping_full_name),trim(p_shipping_phone),trim(p_shipping_address_line),trim(p_shipping_district),
    trim(p_shipping_city),nullif(trim(coalesce(p_shipping_postal_code,'')),''),
    coalesce(nullif(trim(p_shipping_country),''),'Türkiye')
  )
  returning * into r;

  return r;
end;
$$;

revoke all on function public.request_physical_certificate(uuid,text,text,text,text,text,text) from public, anon;
grant execute on function public.request_physical_certificate(uuid,text,text,text,text,text,text) to authenticated;

create or replace function public.notify_admin_physical_certificate_request()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions, pg_temp
as $$
begin
  insert into public.admin_notifications(type,title,message,entity_id,metadata)
  values (
    'physical_certificate',
    'Yeni fiziksel sertifika talebi',
    'Bir kullanıcı fiziksel sertifika gönderimi istedi.',
    new.id,
    jsonb_build_object(
      'user_id',new.user_id,
      'certificate_id',new.certificate_id,
      'parcel_id',new.parcel_id,
      'tier',new.tier,
      'status',new.status
    )
  );
  return new;
end;
$$;

drop trigger if exists physical_certificate_request_notification_trigger on public.physical_certificate_requests;
create trigger physical_certificate_request_notification_trigger
after insert on public.physical_certificate_requests
for each row execute function public.notify_admin_physical_certificate_request();

create or replace function public.admin_list_physical_certificate_requests(p_limit integer default 100, p_offset integer default 0)
returns setof public.physical_certificate_requests
language plpgsql
security definer
set search_path = public, auth, extensions, pg_temp
as $$
begin
  if not public.is_admin() then raise exception 'admin access required' using errcode='42501'; end if;
  return query
    select r.* from public.physical_certificate_requests r
    order by r.requested_at desc
    limit greatest(1, least(coalesce(p_limit,100),500))
    offset greatest(coalesce(p_offset,0),0);
end;
$$;

revoke all on function public.admin_list_physical_certificate_requests(integer,integer) from public, anon;
grant execute on function public.admin_list_physical_certificate_requests(integer,integer) to authenticated;

create or replace function public.admin_update_physical_certificate_request(
  p_request_id uuid,
  p_status text,
  p_shipping_company text default null,
  p_tracking_number text default null,
  p_rejection_reason text default null
)
returns public.physical_certificate_requests
language plpgsql
security definer
set search_path = public, auth, extensions, pg_temp
as $$
declare
  r public.physical_certificate_requests%rowtype;
  next_status text := lower(trim(coalesce(p_status,'')));
  now_ts timestamptz := now();
begin
  if not public.is_admin() then raise exception 'admin access required' using errcode='42501'; end if;
  if next_status not in ('processing','shipped','delivered','rejected') then raise exception 'invalid_physical_certificate_status'; end if;

  update public.physical_certificate_requests
  set status = next_status,
      shipping_company = coalesce(nullif(trim(p_shipping_company),''), shipping_company),
      tracking_number = coalesce(nullif(trim(p_tracking_number),''), tracking_number),
      processing_at = case when next_status='processing' and processing_at is null then now_ts else processing_at end,
      shipped_at = case when next_status='shipped' and shipped_at is null then now_ts else shipped_at end,
      delivered_at = case when next_status='delivered' and delivered_at is null then now_ts else delivered_at end,
      rejected_at = case when next_status='rejected' and rejected_at is null then now_ts else rejected_at end,
      rejection_reason = case when next_status='rejected' then nullif(trim(p_rejection_reason),'') else rejection_reason end
  where id = p_request_id
  returning * into r;

  if not found then raise exception 'physical_certificate_request_not_found'; end if;
  return r;
end;
$$;

revoke all on function public.admin_update_physical_certificate_request(uuid,text,text,text,text) from public, anon;
grant execute on function public.admin_update_physical_certificate_request(uuid,text,text,text,text) to authenticated;

-- The old combined flow is intentionally disabled so a client cannot continue
-- creating a certificate request that waits for admin approval and requires shipping data.
revoke all on function public.request_certificate(uuid,text,text,text,text,text,text,text) from public, anon, authenticated;
