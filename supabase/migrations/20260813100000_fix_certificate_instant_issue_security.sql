-- Security hardening: certificate request must not issue a certificate.
-- The client-callable RPC only creates a requested record. Issuance remains
-- restricted to the existing admin-only issue_certificate_request RPC.

CREATE OR REPLACE FUNCTION public.request_certificate_for_owned_parcel(p_parcel_id uuid)
RETURNS public.certificate_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_parcel public.parcels%rowtype;
  v_existing public.certificate_requests%rowtype;
  v_result public.certificate_requests%rowtype;
begin
  if v_user_id is null then
    raise exception 'unauthorized';
  end if;

  select * into v_parcel
  from public.parcels
  where id = p_parcel_id
  for update;

  if not found then raise exception 'parcel_not_found'; end if;
  if v_parcel.status <> 'sold' or v_parcel.owner_id is distinct from v_user_id then
    raise exception 'parcel_not_owned';
  end if;
  if v_parcel.tier is null or v_parcel.tier not in ('digital','elite','premium') then
    raise exception 'invalid_parcel_tier';
  end if;

  select * into v_existing
  from public.certificate_requests
  where user_id = v_user_id
    and parcel_id = p_parcel_id
    and status in ('requested','approved','issued')
  order by created_at desc
  limit 1;

  if found then
    return v_existing;
  end if;

  insert into public.certificate_requests (
    user_id,
    parcel_id,
    tier,
    status,
    certificate_number,
    qr_token,
    certificate_fingerprint,
    requested_at,
    approved_at,
    approved_by,
    issued_at,
    issued_by
  ) values (
    v_user_id,
    p_parcel_id,
    v_parcel.tier,
    'requested',
    null,
    null,
    null,
    now(),
    null,
    null,
    null,
    null
  )
  returning * into v_result;

  return v_result;
exception when unique_violation then
  select * into v_result
  from public.certificate_requests
  where user_id = v_user_id
    and parcel_id = p_parcel_id
  order by created_at desc
  limit 1;
  if found then return v_result; end if;
  raise;
end;
$function$;

REVOKE EXECUTE ON FUNCTION public.request_certificate_for_owned_parcel(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.request_certificate_for_owned_parcel(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.request_certificate_for_owned_parcel(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_certificate_for_owned_parcel(uuid) TO service_role;
