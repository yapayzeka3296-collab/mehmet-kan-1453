-- Fix admin parcel purchase/release RPCs for the live schema.
-- The live database does not contain parcel_ownership_history, so keep
-- ownership state and audit history in the existing parcels/admin_audit_log tables.

create or replace function public.admin_purchase_parcel(p_parcel_id uuid)
returns public.parcels
language plpgsql security definer set search_path=public,pg_temp
as $$
declare actor uuid:=auth.uid(); r public.parcels%rowtype;
begin
  if not public.is_admin() then raise exception 'admin access required' using errcode='42501'; end if;
  select * into r from public.parcels where id=p_parcel_id for update;
  if not found then raise exception 'parcel not found'; end if;
  if r.status<>'available' or r.owner_id is not null then raise exception 'parcel is not available'; end if;
  update public.parcels
    set status='sold',owner_id=actor,reserved_by=null,reserved_until=null,updated_at=now()
    where id=r.id returning * into r;
  perform public.admin_write_audit('parcel',r.id,'admin_purchase_parcel',jsonb_build_object('parcel_id',r.id,'admin_owner_id',actor));
  return r;
end;
$$;

create or replace function public.admin_release_parcel(p_parcel_id uuid)
returns public.parcels
language plpgsql security definer set search_path=public,pg_temp
as $$
declare actor uuid:=auth.uid(); r public.parcels%rowtype;
begin
  if not public.is_admin() then raise exception 'admin access required' using errcode='42501'; end if;
  select * into r from public.parcels where id=p_parcel_id for update;
  if not found then raise exception 'parcel not found'; end if;
  if r.status<>'sold' or r.owner_id is distinct from actor then raise exception 'parcel is not owned by this admin'; end if;
  update public.parcels
    set status='available',owner_id=null,reserved_by=null,reserved_until=null,updated_at=now()
    where id=r.id returning * into r;
  perform public.admin_write_audit('parcel',r.id,'admin_release_parcel',jsonb_build_object('parcel_id',r.id,'admin_owner_id',actor));
  return r;
end;
$$;

revoke all on function public.admin_purchase_parcel(uuid) from public,anon;
grant execute on function public.admin_purchase_parcel(uuid) to authenticated;
revoke all on function public.admin_release_parcel(uuid) from public,anon;
grant execute on function public.admin_release_parcel(uuid) to authenticated;
