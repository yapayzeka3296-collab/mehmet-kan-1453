-- Final certificate integrity pass.
-- Fixes the legacy per-user/per-tier uniqueness rule so one owner can
-- legitimately hold multiple parcels of the same certificate tier.
-- Also makes QR verification use the non-guessable qr_token while keeping
-- certificate-number verification available for manual checks.

DROP INDEX IF EXISTS public.certificate_one_active_per_user_tier_idx;
CREATE UNIQUE INDEX IF NOT EXISTS certificate_one_active_per_user_parcel_idx
  ON public.certificate_requests(user_id, parcel_id)
  WHERE status IN ('requested','approved','issued','revoked');

CREATE OR REPLACE FUNCTION public.verify_certificate(p_certificate_number text)
RETURNS TABLE(
  certificate_number text,
  status text,
  issued_at timestamptz,
  parcel_number text,
  city_code text,
  city_name text,
  tier text,
  owner_display_name text,
  certificate_fingerprint text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path=public,pg_temp
AS $$
  SELECT
    cr.certificate_number,
    cr.status,
    cr.issued_at,
    p.parcel_number,
    c.code,
    COALESCE(cr.city_name_snapshot, c.name, 'Türkiye'),
    cr.tier,
    CASE
      WHEN cr.holder_name_snapshot IS NULL OR btrim(cr.holder_name_snapshot) = '' THEN NULL
      WHEN strpos(btrim(cr.holder_name_snapshot), ' ') = 0 THEN left(btrim(cr.holder_name_snapshot), 1) || '.'
      ELSE split_part(btrim(cr.holder_name_snapshot), ' ', 1)
        || ' '
        || left(reverse(split_part(reverse(btrim(cr.holder_name_snapshot)), ' ', 1)), 1)
        || '.'
    END,
    cr.certificate_fingerprint
  FROM public.certificate_requests cr
  JOIN public.parcels p ON p.id=cr.parcel_id
  LEFT JOIN public.cities c ON c.id=p.city_id
  WHERE (
    cr.certificate_number=upper(trim(p_certificate_number))
    OR cr.qr_token=trim(p_certificate_number)
  )
    AND cr.status='issued'
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon,authenticated;

CREATE OR REPLACE FUNCTION public.issue_certificate_request(p_request_id uuid)
RETURNS public.certificate_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=public,pg_temp
AS $$
DECLARE
  r public.certificate_requests;
  p public.parcels%ROWTYPE;
  cnum text;
  qtoken text;
  fingerprint text;
  holder_snapshot text;
  city_snapshot text;
  template_snapshot text;
  version_snapshot text;
BEGIN
  IF NOT public.is_certificate_admin() THEN
    RAISE EXCEPTION 'admin_required';
  END IF;

  SELECT * INTO r FROM public.certificate_requests WHERE id=p_request_id FOR UPDATE;
  IF r.id IS NULL OR r.status <> 'approved' THEN
    RAISE EXCEPTION 'request_must_be_approved';
  END IF;

  SELECT * INTO p FROM public.parcels WHERE id=r.parcel_id FOR SHARE;
  IF p.owner_id IS DISTINCT FROM r.user_id
     OR p.status <> 'sold'
     OR p.tier IS DISTINCT FROM r.tier THEN
    RAISE EXCEPTION 'certificate_eligibility_changed';
  END IF;

  SELECT COALESCE(NULLIF(BTRIM(pr.full_name), ''), 'MySkyParcel Kullanıcısı')
    INTO holder_snapshot
  FROM public.profiles pr WHERE pr.id=r.user_id;
  holder_snapshot := COALESCE(holder_snapshot, 'MySkyParcel Kullanıcısı');

  SELECT COALESCE(c.name, 'Türkiye') INTO city_snapshot
  FROM public.cities c WHERE c.id=p.city_id;
  city_snapshot := COALESCE(city_snapshot, 'Türkiye');

  template_snapshot := CASE r.tier
    WHEN 'digital' THEN 'digital'
    WHEN 'elite' THEN 'special'
    WHEN 'premium' THEN 'premium'
  END;

  version_snapshot := CASE r.tier
    WHEN 'digital' THEN 'digital-v1'
    WHEN 'elite' THEN 'special-v1'
    WHEN 'premium' THEN 'premium-v1'
  END;

  cnum := 'MSP-' || upper(substr(encode(gen_random_bytes(16),'hex'),1,24));
  qtoken := encode(gen_random_bytes(32),'hex');
  fingerprint := upper(encode(
    digest(
      r.id::text||':'||r.user_id::text||':'||r.parcel_id::text||':'||r.tier||':'||cnum||':'||qtoken,
      'sha256'
    ), 'hex'
  ));

  UPDATE public.certificate_requests
  SET status='issued',
      certificate_number=cnum,
      qr_token=qtoken,
      certificate_fingerprint=fingerprint,
      issued_at=now(),
      issued_by=(select auth.uid()),
      holder_name_snapshot=holder_snapshot,
      city_name_snapshot=city_snapshot,
      template_type=template_snapshot,
      template_version=version_snapshot,
      verification_url='/sertifika-dogrula?code=' || qtoken
  WHERE id=r.id AND status='approved'
  RETURNING * INTO r;

  IF r.id IS NULL THEN
    RAISE EXCEPTION 'issue_race_or_invalid_state';
  END IF;

  INSERT INTO public.certificate_audit_log(certificate_request_id,action,actor_id,metadata)
  VALUES(
    r.id, 'issued', (select auth.uid()),
    jsonb_build_object(
      'certificate_number',r.certificate_number,
      'fingerprint',r.certificate_fingerprint,
      'template_type',r.template_type,
      'template_version',r.template_version
    )
  );
  RETURN r;
END;
$$;

REVOKE ALL ON FUNCTION public.issue_certificate_request(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.issue_certificate_request(uuid) TO authenticated,service_role;

-- Existing certificates keep their immutable certificate numbers/fingerprints;
-- only their QR destination is upgraded to the already-issued non-guessable token.
UPDATE public.certificate_requests
SET verification_url='/sertifika-dogrula?code=' || qr_token
WHERE status='issued' AND qr_token IS NOT NULL;
