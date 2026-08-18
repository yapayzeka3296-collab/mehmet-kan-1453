-- Finalize certificate issuance snapshots at the authoritative issuance boundary.
-- The snapshot is taken by the admin-only issuance RPC so certificate display data
-- cannot drift when a profile, parcel, or template later changes.

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

  SELECT * INTO r
  FROM public.certificate_requests
  WHERE id=p_request_id
  FOR UPDATE;

  IF r.id IS NULL OR r.status <> 'approved' THEN
    RAISE EXCEPTION 'request_must_be_approved';
  END IF;

  SELECT * INTO p
  FROM public.parcels
  WHERE id=r.parcel_id
  FOR SHARE;

  IF p.owner_id IS DISTINCT FROM r.user_id
     OR p.status <> 'sold'
     OR p.tier IS DISTINCT FROM r.tier THEN
    RAISE EXCEPTION 'certificate_eligibility_changed';
  END IF;

  SELECT COALESCE(NULLIF(BTRIM(pr.full_name), ''), 'MySkyParcel Kullanıcısı')
  INTO holder_snapshot
  FROM public.profiles pr
  WHERE pr.id=r.user_id;

  holder_snapshot := COALESCE(holder_snapshot, 'MySkyParcel Kullanıcısı');

  SELECT COALESCE(c.name, 'Türkiye')
  INTO city_snapshot
  FROM public.cities c
  WHERE c.id=p.city_id;

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
    ),
    'hex'
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
      verification_url='/sertifika-dogrula?code=' || cnum
  WHERE id=r.id AND status='approved'
  RETURNING * INTO r;

  IF r.id IS NULL THEN
    RAISE EXCEPTION 'issue_race_or_invalid_state';
  END IF;

  INSERT INTO public.certificate_audit_log(certificate_request_id,action,actor_id,metadata)
  VALUES(
    r.id,
    'issued',
    (select auth.uid()),
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

-- Backfill only missing metadata for already-issued certificates. Existing
-- immutable values are never overwritten.
UPDATE public.certificate_requests cr
SET holder_name_snapshot = COALESCE(NULLIF(BTRIM(pr.full_name), ''), 'MySkyParcel Kullanıcısı'),
    city_name_snapshot = COALESCE(c.name, 'Türkiye'),
    template_type = CASE cr.tier WHEN 'digital' THEN 'digital' WHEN 'elite' THEN 'special' WHEN 'premium' THEN 'premium' END,
    template_version = CASE cr.tier WHEN 'digital' THEN 'digital-v1' WHEN 'elite' THEN 'special-v1' WHEN 'premium' THEN 'premium-v1' END,
    verification_url = CASE WHEN cr.certificate_number IS NOT NULL THEN '/sertifika-dogrula?code=' || cr.certificate_number ELSE NULL END
FROM public.profiles pr
LEFT JOIN public.parcels p ON p.id=cr.parcel_id
LEFT JOIN public.cities c ON c.id=p.city_id
WHERE cr.user_id=pr.id
  AND cr.status='issued'
  AND (
    cr.holder_name_snapshot IS NULL OR
    cr.city_name_snapshot IS NULL OR
    cr.template_type IS NULL OR
    cr.template_version IS NULL OR
    cr.verification_url IS NULL
  );
