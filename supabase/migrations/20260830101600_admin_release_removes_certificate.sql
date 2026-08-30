-- Admin release/relist: return an admin-owned parcel to the public inventory
-- and remove certificate data tied to that parcel before it becomes available again.

create or replace function public.admin_release_parcel(p_parcel_id uuid)
returns public.parcels
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  actor uuid:=auth.uid();
  r public.parcels%rowtype;
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode='42501';
  end if;

  select * into r from public.parcels where id=p_parcel_id for update;
  if not found then raise exception 'parcel not found'; end if;
  if r.status<>'sold' or r.owner_id is distinct from actor then
    raise exception 'parcel is not owned by this admin';
  end if;

  delete from public.physical_certificate_requests where parcel_id=r.id;
  delete from public.certificate_audit_log where certificate_request_id in (
    select id from public.certificate_requests where parcel_id=r.id
  );
  delete from public.certificate_requests where parcel_id=r.id;

  update public.parcel_ownership_history
    set released_at=now()
    where parcel_id=r.id and owner_id=actor and released_at is null;

  update public.parcels
    set status='available', owner_id=null, reserved_by=null, reserved_until=null, updated_at=now()
    where id=r.id
    returning * into r;

  perform public.admin_write_audit(
    'parcel',r.id,'admin_release_parcel',
    jsonb_build_object('parcel_id',r.id,'admin_owner_id',actor,'certificate_removed',true)
  );

  return r;
end;
$$;

revoke all on function public.admin_release_parcel(uuid) from public,anon;
grant execute on function public.admin_release_parcel(uuid) to authenticated;
