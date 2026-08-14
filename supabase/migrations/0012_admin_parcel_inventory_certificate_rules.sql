-- Admin parcel inventory and certificate rules.
-- Only AVAILABLE parcels may be claimed for an admin-issued certificate.
-- A parcel can have only one certificate globally.
create unique index if not exists certificate_one_per_parcel_global_idx on public.certificate_requests(parcel_id);

create or replace function public.admin_search_parcels_for_certificate(p_query text default null)
returns table(parcel_id uuid, parcel_number text, status text, owner_id uuid, owner_name text, tier text, city_id uuid)
language plpgsql security definer set search_path = public, auth
as $$
begin
  if not public.is_admin() then raise exception 'admin access required' using errcode='42501'; end if;
  return query select p.id,p.parcel_number,p.status,p.owner_id,coalesce(pr.full_name,''),p.tier,p.city_id
  from public.parcels p left join public.profiles pr on pr.id=p.owner_id
  where p.status='available' and not exists(select 1 from public.certificate_requests cr where cr.parcel_id=p.id)
    and (p_query is null or p.parcel_number ilike '%'||trim(p_query)||'%' or coalesce(pr.full_name,'') ilike '%'||trim(p_query)||'%')
  order by p.parcel_number;
end; $$;

create or replace function public.admin_create_certificate_for_parcel(p_parcel_id uuid,p_user_id uuid,p_tier text)
returns public.certificate_requests language plpgsql security definer set search_path=public,auth,extensions
as $$
declare p public.parcels%rowtype; r public.certificate_requests%rowtype; cnum text; qtoken text; fingerprint text; actor uuid:=auth.uid();
begin
  if not public.is_admin() then raise exception 'admin access required' using errcode='42501'; end if;
  if p_tier not in ('digital','elite','premium') then raise exception 'invalid certificate tier'; end if;
  if p_user_id is null or not exists(select 1 from auth.users where id=p_user_id) then raise exception 'target user not found'; end if;
  select * into p from public.parcels where id=p_parcel_id for update;
  if not found then raise exception 'parcel not found'; end if;
  if p.status<>'available' then raise exception 'parcel is not available; sold or reserved parcels cannot receive an admin certificate'; end if;
  if exists(select 1 from public.certificate_requests cr where cr.parcel_id=p.id) then raise exception 'certificate already exists for this parcel'; end if;
  update public.parcels set status='sold',owner_id=actor,reserved_by=null,reserved_until=null,updated_at=now() where id=p.id and status='available';
  if not found then raise exception 'parcel is no longer available'; end if;
  insert into public.certificate_requests(user_id,parcel_id,tier,status,requested_at,admin_issued,admin_issued_by) values(p_user_id,p.id,p_tier,'requested',now(),true,actor) returning * into r;
  cnum:='MSP-'||upper(substr(encode(extensions.gen_random_bytes(16),'hex'),1,24)); qtoken:=encode(extensions.gen_random_bytes(32),'hex');
  fingerprint:=upper(encode(extensions.digest((p_user_id::text||':'||p.id::text||':'||p_tier||':'||cnum||':'||qtoken)::bytea,'sha256'),'hex'));
  update public.certificate_requests set status='issued',certificate_number=cnum,qr_token=qtoken,certificate_fingerprint=fingerprint,approved_at=now(),approved_by=actor,issued_at=now(),issued_by=actor,updated_at=now() where id=r.id returning * into r;
  perform public.admin_write_audit('certificate',r.id,'admin_certificate_claim_available_parcel',jsonb_build_object('parcel_id',p.id,'target_user_id',p_user_id,'admin_owner_id',actor,'tier',p_tier)); return r;
end; $$;

create or replace function public.admin_dashboard_stats() returns jsonb language plpgsql security definer set search_path=public
as $$
declare result jsonb; begin
  if not public.is_admin() then raise exception 'admin access required' using errcode='42501'; end if;
  select jsonb_build_object('parcels_total',(select count(*) from public.parcels),'parcels_sold',(select count(*) from public.parcels where status='sold'),'parcels_available',(select count(*) from public.parcels where status='available'),'parcels_reserved',(select count(*) from public.parcels where status='reserved'),'parcels_admin_owned',(select count(*) from public.parcels p join public.profiles pr on pr.id=p.owner_id where p.status='sold' and pr.role='admin'),'users_total',(select count(*) from public.profiles where coalesce(role,'user')<>'admin'),'certificates_total',(select count(*) from public.certificate_requests),'certificates_issued',(select count(*) from public.certificate_requests where status='issued'),'certificates_pending',(select count(*) from public.certificate_requests where status in ('requested','approved')),'certificates_revoked',(select count(*) from public.certificate_requests where status='revoked'),'orders_total',(select count(*) from public.orders),'orders_paid',(select count(*) from public.orders where status='paid'),'payments_total',(select count(*) from public.payments),'payments_succeeded',(select count(*) from public.payments where status='succeeded'),'generated_at',now()) into result; return result;
end; $$;

create or replace function public.admin_create_certificate_for_purchased_parcel(p_parcel_id uuid) returns public.certificate_requests language plpgsql security definer set search_path=public,auth,extensions
as $$
declare p public.parcels%rowtype; r public.certificate_requests%rowtype; cnum text; qtoken text; fingerprint text; actor uuid:=auth.uid(); begin
  if not public.is_admin() then raise exception 'admin access required' using errcode='42501'; end if;
  select * into p from public.parcels where id=p_parcel_id for update; if not found then raise exception 'parcel not found'; end if;
  if p.status<>'available' then raise exception 'sold or reserved parcels cannot receive an admin certificate'; end if;
  if p.tier not in ('digital','elite','premium') then raise exception 'invalid parcel tier'; end if;
  if exists(select 1 from public.certificate_requests cr where cr.parcel_id=p.id) then raise exception 'certificate already exists for this parcel'; end if;
  cnum:='MSP-'||upper(substr(encode(extensions.gen_random_bytes(16),'hex'),1,24)); qtoken:=encode(extensions.gen_random_bytes(32),'hex'); fingerprint:=upper(encode(extensions.digest((p.owner_id::text||':'||p.id::text||':'||p.tier||':'||cnum||':'||qtoken)::bytea,'sha256'),'hex'));
  update public.parcels set status='sold',owner_id=actor,reserved_by=null,reserved_until=null,updated_at=now() where id=p.id and status='available'; if not found then raise exception 'parcel is no longer available'; end if;
  insert into public.certificate_requests(user_id,parcel_id,tier,status,certificate_number,qr_token,certificate_fingerprint,requested_at,approved_at,approved_by,issued_at,issued_by,admin_issued,admin_issued_by) values(p.owner_id,p.id,p.tier,'issued',cnum,qtoken,fingerprint,now(),now(),actor,now(),actor,true,actor) returning * into r;
  perform public.admin_write_audit('certificate',r.id,'admin_certificate_claim_available_parcel',jsonb_build_object('parcel_id',p.id,'tier',p.tier,'admin_owner_id',actor)); return r;
end; $$;
