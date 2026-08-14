-- Keep normal users subject to the existing one-active-certificate-per-tier
-- and one-certificate-per-parcel rules, while allowing explicit admin-issued
-- overrides to be created without those customer limits.
DROP INDEX IF EXISTS public.certificate_one_active_per_user_tier_idx;
CREATE UNIQUE INDEX certificate_one_active_per_user_tier_idx
  ON public.certificate_requests (user_id, tier)
  WHERE admin_issued = false
    AND status = ANY (ARRAY['requested'::text, 'approved'::text, 'issued'::text, 'revoked'::text]);

DROP INDEX IF EXISTS public.certificate_one_per_user_parcel_idx;
CREATE UNIQUE INDEX certificate_one_per_user_parcel_idx
  ON public.certificate_requests (user_id, parcel_id)
  WHERE admin_issued = false;

CREATE OR REPLACE FUNCTION public.admin_create_certificate_for_parcel(
  p_parcel_id uuid,
  p_user_id uuid,
  p_tier text
)
RETURNS public.certificate_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'extensions'
AS $function$
declare
  p public.parcels%rowtype;
  r public.certificate_requests%rowtype;
  cnum text;
  qtoken text;
  fingerprint text;
  actor uuid := auth.uid();
  previous_status text;
  previous_owner uuid;
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode='42501';
  end if;
  if p_tier not in ('digital','elite','premium') then
    raise exception 'invalid certificate tier';
  end if;
  if p_user_id is null or not exists (select 1 from auth.users where id=p_user_id) then
    raise exception 'target user not found';
  end if;

  select * into p from public.parcels where id=p_parcel_id for update;
  if not found then
    raise exception 'parcel not found';
  end if;

  previous_status := p.status;
  previous_owner := p.owner_id;

  -- Admin override: an admin may claim any real parcel, including one that is
  -- currently sold/reserved, and may issue as many admin certificates as needed.
  update public.parcels
  set status='sold',
      owner_id=actor,
      reserved_by=null,
      reserved_until=null,
      updated_at=now()
  where id=p.id;

  insert into public.certificate_requests(
    user_id, parcel_id, tier, status, requested_at, admin_issued, admin_issued_by
  ) values (
    p_user_id, p.id, p_tier, 'requested', now(), true, actor
  ) returning * into r;

  cnum := 'MSP-' || upper(substr(encode(extensions.gen_random_bytes(16),'hex'),1,24));
  qtoken := encode(extensions.gen_random_bytes(32),'hex');
  fingerprint := upper(encode(
    extensions.digest(
      (p_user_id::text||':'||p.id::text||':'||p_tier||':'||cnum||':'||qtoken)::bytea,
      'sha256'
    ),
    'hex'
  ));

  update public.certificate_requests
  set status='issued',
      certificate_number=cnum,
      qr_token=qtoken,
      certificate_fingerprint=fingerprint,
      approved_at=now(),
      approved_by=actor,
      issued_at=now(),
      issued_by=actor,
      updated_at=now()
  where id=r.id
  returning * into r;

  perform public.admin_write_audit(
    'certificate', r.id, 'admin_certificate_override_claim_parcel',
    jsonb_build_object(
      'parcel_id', p.id,
      'target_user_id', p_user_id,
      'admin_owner_id', actor,
      'tier', p_tier,
      'previous_status', previous_status,
      'previous_owner_id', previous_owner
    )
  );

  return r;
end;
$function$;

-- The purchased-parcel helper is also admin-only and marks its result as an
-- admin-issued certificate so it is not subject to customer uniqueness limits.
CREATE OR REPLACE FUNCTION public.admin_create_certificate_for_purchased_parcel(p_parcel_id uuid)
RETURNS public.certificate_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'extensions'
AS $function$
declare
  p public.parcels%rowtype;
  r public.certificate_requests%rowtype;
  cnum text;
  qtoken text;
  fingerprint text;
  actor uuid := auth.uid();
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode='42501';
  end if;

  select * into p from public.parcels where id=p_parcel_id for update;
  if not found then
    raise exception 'parcel not found';
  end if;
  if p.owner_id is null then
    raise exception 'parcel has no owner';
  end if;
  if p.tier not in ('digital','elite','premium') then
    raise exception 'invalid parcel tier';
  end if;

  cnum := 'MSP-' || upper(substr(encode(extensions.gen_random_bytes(16),'hex'),1,24));
  qtoken := encode(extensions.gen_random_bytes(32),'hex');
  fingerprint := upper(encode(
    extensions.digest(
      (p.owner_id::text||':'||p.id::text||':'||p.tier||':'||cnum||':'||qtoken)::bytea,
      'sha256'
    ),
    'hex'
  ));

  insert into public.certificate_requests(
    user_id, parcel_id, tier, status,
    certificate_number, qr_token, certificate_fingerprint,
    requested_at, approved_at, approved_by, issued_at, issued_by,
    admin_issued, admin_issued_by
  ) values (
    p.owner_id, p.id, p.tier, 'issued',
    cnum, qtoken, fingerprint,
    now(), now(), actor, now(), actor,
    true, actor
  ) returning * into r;

  perform public.admin_write_audit(
    'certificate', r.id, 'admin_certificate_created_from_parcel',
    jsonb_build_object('parcel_id',p.id,'tier',p.tier,'admin_owner_id',actor)
  );
  return r;
end;
$function$;

REVOKE EXECUTE ON FUNCTION public.admin_create_certificate_for_purchased_parcel(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_create_certificate_for_purchased_parcel(uuid) TO authenticated, service_role;
