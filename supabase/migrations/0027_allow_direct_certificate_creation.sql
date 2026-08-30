-- Preserve the existing certificate request validation for normal client inserts,
-- while allowing the dedicated create_certificate_for_owned_parcel() workflow
-- to issue a certificate immediately without admin approval.
-- Authentication/login/logout routes and the physical-certificate workflow are untouched.

create or replace function public.validate_certificate_request()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare p public.parcels%rowtype;
begin
  if current_setting('myskyparcel.certificate_creation', true) <> '1' then
    if NEW.status <> 'requested' or NEW.certificate_number is not null or NEW.qr_token is not null then
      raise exception 'certificate_must_start_as_request';
    end if;
  end if;

  select * into p from public.parcels where id=NEW.parcel_id for share;
  if p.id is null then raise exception 'parcel_not_found'; end if;
  if p.owner_id is distinct from NEW.user_id or p.status <> 'sold' then
    raise exception 'certificate_requires_owned_sold_parcel';
  end if;
  if p.tier is distinct from NEW.tier then raise exception 'certificate_tier_mismatch'; end if;
  return NEW;
end;
$$;

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

  select * into p from public.parcels where id=p_parcel_id for share;
  if not found then raise exception 'parcel_not_found'; end if;
  if p.owner_id is distinct from actor or p.status <> 'sold' then
    raise exception 'certificate_requires_owned_sold_parcel';
  end if;
  if p.tier not in ('digital','elite','premium') then raise exception 'invalid_parcel_tier'; end if;
  if exists(
    select 1 from public.certificate_requests cr
    where cr.user_id=actor and cr.parcel_id=p.id
      and cr.status in ('requested','approved','issued','revoked')
  ) then raise exception 'certificate_already_requested'; end if;

  cnum := 'MSP-' || upper(substr(encode(extensions.gen_random_bytes(16),'hex'),1,24));
  qtoken := encode(extensions.gen_random_bytes(32),'hex');
  fingerprint := upper(encode(
    extensions.digest((actor::text||':'||p.id::text||':'||p.tier||':'||cnum||':'||qtoken)::bytea,'sha256'),
    'hex'
  ));
  holder := coalesce(
    nullif(trim((select raw_user_meta_data->>'full_name' from auth.users where id=actor)),''),
    'MySkyParcel Kullanıcısı'
  );
  select name into city_name from public.cities where id=p.city_id;

  -- This private marker is only set inside this SECURITY DEFINER workflow.
  -- It lets the validation trigger distinguish immediate certificate creation
  -- from the legacy client-side certificate-request insert path.
  perform set_config('myskyparcel.certificate_creation','1',true);

  insert into public.certificate_requests(
    user_id,parcel_id,tier,status,certificate_number,qr_token,certificate_fingerprint,
    requested_at,approved_at,approved_by,issued_at,issued_by,admin_issued,admin_issued_by,
    holder_name_snapshot,city_name_snapshot,verification_url
  )
  values(
    actor,p.id,p.tier,'issued',cnum,qtoken,fingerprint,
    now(),now(),actor,now(),actor,false,null,holder,city_name,
    '/sertifika-dogrula?code='||cnum
  ) returning * into r;

  return r;
end;
$$;

revoke all on function public.create_certificate_for_owned_parcel(uuid) from public, anon;
grant execute on function public.create_certificate_for_owned_parcel(uuid) to authenticated;
