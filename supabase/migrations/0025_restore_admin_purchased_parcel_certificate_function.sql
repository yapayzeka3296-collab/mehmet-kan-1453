CREATE OR REPLACE FUNCTION public.admin_create_certificate_for_purchased_parcel(p_parcel_id uuid)
RETURNS public.certificate_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'extensions', 'pg_temp'
AS $function$
declare
  p public.parcels%rowtype;
  r public.certificate_requests%rowtype;
  cnum text;
  qtoken text;
  fingerprint text;
  actor uuid := auth.uid();
begin
  if not public.is_admin() then raise exception 'admin access required' using errcode='42501'; end if;
  select * into p from public.parcels where id=p_parcel_id for update;
  if not found then raise exception 'parcel not found'; end if;
  if p.owner_id is null then raise exception 'parcel has no owner'; end if;
  if p.tier not in ('digital','elite','premium') then raise exception 'invalid parcel tier'; end if;
  cnum := 'MSP-' || upper(substr(encode(extensions.gen_random_bytes(16),'hex'),1,24));
  qtoken := encode(extensions.gen_random_bytes(32),'hex');
  fingerprint := upper(encode(extensions.digest((p.owner_id::text||':'||p.id::text||':'||p.tier||':'||cnum||':'||qtoken)::bytea,'sha256'),'hex'));
  insert into public.certificate_requests(user_id,parcel_id,tier,status,certificate_number,qr_token,certificate_fingerprint,requested_at,approved_at,approved_by,issued_at,issued_by,admin_issued,admin_issued_by)
  values(p.owner_id,p.id,p.tier,'issued',cnum,qtoken,fingerprint,now(),now(),actor,now(),actor,true,actor)
  returning * into r;
  perform public.admin_write_audit('certificate',r.id,'admin_certificate_created_from_parcel',jsonb_build_object('parcel_id',p.id,'tier',p.tier,'admin_owner_id',actor));
  return r;
end;
$function$;
REVOKE EXECUTE ON FUNCTION public.admin_create_certificate_for_purchased_parcel(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_create_certificate_for_purchased_parcel(uuid) TO authenticated, service_role;
