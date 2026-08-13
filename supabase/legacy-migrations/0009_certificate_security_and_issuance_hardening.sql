-- Certificate security and issuance hardening.
-- Server-side issuance, non-guessable certificate/QR identifiers, audit trail,
-- ownership/tier validation, admin-only state transitions and public verification.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.cities ADD COLUMN IF NOT EXISTS code text;
UPDATE public.cities SET code = CASE slug
  WHEN 'istanbul' THEN 'IST' WHEN 'ankara' THEN 'ANK' WHEN 'izmir' THEN 'IZM'
  WHEN 'bursa' THEN 'BUR' WHEN 'antalya' THEN 'ANT' WHEN 'kayseri' THEN 'KAY'
  WHEN 'gaziantep' THEN 'GZT' ELSE upper(left(regexp_replace(slug,'[^a-zA-Z0-9]','','g'),3)) END
WHERE code IS NULL;
ALTER TABLE public.cities ALTER COLUMN code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS cities_code_idx ON public.cities(code);

CREATE TABLE IF NOT EXISTS public.certificate_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  parcel_id uuid NOT NULL REFERENCES public.parcels(id) ON DELETE RESTRICT,
  tier text NOT NULL CHECK (tier IN ('digital','elite','premium')),
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','approved','issued','rejected','revoked')),
  certificate_number text UNIQUE,
  qr_token text UNIQUE,
  certificate_fingerprint text UNIQUE,
  requested_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  issued_at timestamptz,
  issued_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  rejected_at timestamptz,
  rejected_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  rejection_reason text,
  revoked_at timestamptz,
  revoked_by uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  revocation_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS certificate_requests_user_idx ON public.certificate_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS certificate_requests_parcel_idx ON public.certificate_requests(parcel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS certificate_requests_status_idx ON public.certificate_requests(status);
CREATE UNIQUE INDEX IF NOT EXISTS certificate_one_active_per_user_tier_idx
  ON public.certificate_requests(user_id, tier)
  WHERE status IN ('requested','approved','issued','revoked');

CREATE TABLE IF NOT EXISTS public.certificate_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_request_id uuid NOT NULL REFERENCES public.certificate_requests(id) ON DELETE RESTRICT,
  action text NOT NULL CHECK (action IN ('requested','approved','issued','rejected','revoked')),
  actor_id uuid REFERENCES auth.users(id) ON DELETE RESTRICT,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS certificate_audit_certificate_idx ON public.certificate_audit_log(certificate_request_id, created_at DESC);

ALTER TABLE public.certificate_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS certificate_requests_select_own ON public.certificate_requests;
CREATE POLICY certificate_requests_select_own ON public.certificate_requests
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS certificate_requests_insert_own ON public.certificate_requests;
CREATE POLICY certificate_requests_insert_own ON public.certificate_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id
    AND status = 'requested'
    AND certificate_number IS NULL
    AND qr_token IS NULL
    AND EXISTS (
      SELECT 1 FROM public.parcels p
      WHERE p.id = parcel_id
        AND p.owner_id = (select auth.uid())
        AND p.status = 'sold'
        AND p.tier = certificate_requests.tier
    )
  );

DROP POLICY IF EXISTS certificate_audit_select_own ON public.certificate_audit_log;
CREATE POLICY certificate_audit_select_own ON public.certificate_audit_log
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.certificate_requests c
      WHERE c.id = certificate_request_id AND c.user_id = (select auth.uid())
    )
  );
DROP POLICY IF EXISTS certificate_audit_admin_select ON public.certificate_audit_log;
CREATE POLICY certificate_audit_admin_select ON public.certificate_audit_log
  FOR SELECT TO authenticated USING ((select is_admin()));

REVOKE INSERT, UPDATE, DELETE ON public.certificate_requests FROM anon, authenticated;
GRANT SELECT, INSERT ON public.certificate_requests TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.certificate_audit_log FROM anon, authenticated;
GRANT SELECT ON public.certificate_audit_log TO authenticated;

CREATE OR REPLACE FUNCTION public.validate_certificate_request()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE p public.parcels%ROWTYPE;
BEGIN
  IF NEW.status <> 'requested' OR NEW.certificate_number IS NOT NULL OR NEW.qr_token IS NOT NULL THEN
    RAISE EXCEPTION 'certificate_must_start_as_request';
  END IF;
  SELECT * INTO p FROM public.parcels WHERE id=NEW.parcel_id FOR SHARE;
  IF p.id IS NULL THEN RAISE EXCEPTION 'parcel_not_found'; END IF;
  IF p.owner_id IS DISTINCT FROM NEW.user_id OR p.status <> 'sold' THEN
    RAISE EXCEPTION 'certificate_requires_owned_sold_parcel';
  END IF;
  IF p.tier IS DISTINCT FROM NEW.tier THEN RAISE EXCEPTION 'certificate_tier_mismatch'; END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS validate_certificate_request_trigger ON public.certificate_requests;
CREATE TRIGGER validate_certificate_request_trigger BEFORE INSERT ON public.certificate_requests
FOR EACH ROW EXECUTE FUNCTION public.validate_certificate_request();

CREATE OR REPLACE FUNCTION public.certificate_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS certificate_touch_updated_at_trigger ON public.certificate_requests;
CREATE TRIGGER certificate_touch_updated_at_trigger BEFORE UPDATE ON public.certificate_requests
FOR EACH ROW EXECUTE FUNCTION public.certificate_touch_updated_at();

CREATE OR REPLACE FUNCTION public.is_certificate_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
  SELECT COALESCE((select is_admin()),false);
$$;
REVOKE ALL ON FUNCTION public.is_certificate_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_certificate_admin() TO authenticated,service_role;

CREATE OR REPLACE FUNCTION public.approve_certificate_request(p_request_id uuid)
RETURNS public.certificate_requests LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r public.certificate_requests;
BEGIN
  IF NOT public.is_certificate_admin() THEN RAISE EXCEPTION 'admin_required'; END IF;
  UPDATE public.certificate_requests SET status='approved',approved_at=now(),approved_by=(select auth.uid())
  WHERE id=p_request_id AND status='requested' RETURNING * INTO r;
  IF r.id IS NULL THEN RAISE EXCEPTION 'request_not_found_or_invalid_state'; END IF;
  INSERT INTO public.certificate_audit_log(certificate_request_id,action,actor_id)
  VALUES(r.id,'approved',(select auth.uid()));
  RETURN r;
END; $$;

CREATE OR REPLACE FUNCTION public.issue_certificate_request(p_request_id uuid)
RETURNS public.certificate_requests LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r public.certificate_requests; p public.parcels%ROWTYPE; cnum text; qtoken text; fingerprint text;
BEGIN
  IF NOT public.is_certificate_admin() THEN RAISE EXCEPTION 'admin_required'; END IF;
  SELECT * INTO r FROM public.certificate_requests WHERE id=p_request_id FOR UPDATE;
  IF r.id IS NULL OR r.status <> 'approved' THEN RAISE EXCEPTION 'request_must_be_approved'; END IF;
  SELECT * INTO p FROM public.parcels WHERE id=r.parcel_id FOR SHARE;
  IF p.owner_id IS DISTINCT FROM r.user_id OR p.status <> 'sold' OR p.tier IS DISTINCT FROM r.tier THEN
    RAISE EXCEPTION 'certificate_eligibility_changed';
  END IF;
  cnum := 'MSP-' || upper(substr(encode(gen_random_bytes(16),'hex'),1,24));
  qtoken := encode(gen_random_bytes(32),'hex');
  fingerprint := upper(encode(digest(r.id::text||':'||r.user_id::text||':'||r.parcel_id::text||':'||r.tier||':'||cnum||':'||qtoken,'sha256'),'hex'));
  UPDATE public.certificate_requests
  SET status='issued',certificate_number=cnum,qr_token=qtoken,certificate_fingerprint=fingerprint,
      issued_at=now(),issued_by=(select auth.uid())
  WHERE id=r.id AND status='approved' RETURNING * INTO r;
  IF r.id IS NULL THEN RAISE EXCEPTION 'issue_race_or_invalid_state'; END IF;
  INSERT INTO public.certificate_audit_log(certificate_request_id,action,actor_id,metadata)
  VALUES(r.id,'issued',(select auth.uid()),jsonb_build_object('certificate_number',r.certificate_number,'fingerprint',r.certificate_fingerprint));
  RETURN r;
END; $$;

CREATE OR REPLACE FUNCTION public.reject_certificate_request(p_request_id uuid,p_reason text)
RETURNS public.certificate_requests LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r public.certificate_requests;
BEGIN
  IF NOT public.is_certificate_admin() THEN RAISE EXCEPTION 'admin_required'; END IF;
  IF length(trim(coalesce(p_reason,'')))<3 THEN RAISE EXCEPTION 'rejection_reason_required'; END IF;
  UPDATE public.certificate_requests SET status='rejected',rejected_at=now(),rejected_by=(select auth.uid()),rejection_reason=left(trim(p_reason),500)
  WHERE id=p_request_id AND status IN ('requested','approved') RETURNING * INTO r;
  IF r.id IS NULL THEN RAISE EXCEPTION 'request_not_found_or_invalid_state'; END IF;
  INSERT INTO public.certificate_audit_log(certificate_request_id,action,actor_id,metadata)
  VALUES(r.id,'rejected',(select auth.uid()),jsonb_build_object('reason',r.rejection_reason));
  RETURN r;
END; $$;

CREATE OR REPLACE FUNCTION public.revoke_certificate(p_request_id uuid,p_reason text)
RETURNS public.certificate_requests LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE r public.certificate_requests;
BEGIN
  IF NOT public.is_certificate_admin() THEN RAISE EXCEPTION 'admin_required'; END IF;
  IF length(trim(coalesce(p_reason,'')))<3 THEN RAISE EXCEPTION 'revocation_reason_required'; END IF;
  UPDATE public.certificate_requests SET status='revoked',revoked_at=now(),revoked_by=(select auth.uid()),revocation_reason=left(trim(p_reason),500)
  WHERE id=p_request_id AND status='issued' RETURNING * INTO r;
  IF r.id IS NULL THEN RAISE EXCEPTION 'certificate_not_found_or_not_issued'; END IF;
  INSERT INTO public.certificate_audit_log(certificate_request_id,action,actor_id,metadata)
  VALUES(r.id,'revoked',(select auth.uid()),jsonb_build_object('reason',r.revocation_reason));
  RETURN r;
END; $$;

REVOKE ALL ON FUNCTION public.approve_certificate_request(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.issue_certificate_request(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_certificate_request(uuid,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.revoke_certificate(uuid,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_certificate_request(uuid) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.issue_certificate_request(uuid) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.reject_certificate_request(uuid,text) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.revoke_certificate(uuid,text) TO authenticated,service_role;

CREATE OR REPLACE FUNCTION public.verify_certificate(p_certificate_number text)
RETURNS TABLE(certificate_number text,status text,issued_at timestamptz,parcel_number text,city_code text,city_name text,tier text,owner_display_name text,certificate_fingerprint text)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path=public,pg_temp AS $$
  SELECT cr.certificate_number,cr.status,cr.issued_at,p.parcel_number,c.code,c.name,cr.tier,
    CASE WHEN prof.full_name IS NULL OR btrim(prof.full_name)='' THEN NULL
      ELSE split_part(btrim(prof.full_name),' ',1)||CASE WHEN strpos(btrim(prof.full_name),' ')>0 THEN ' '||left(reverse(split_part(reverse(btrim(prof.full_name)),' ',1)),1)||'.' ELSE '' END END,
    cr.certificate_fingerprint
  FROM public.certificate_requests cr
  JOIN public.parcels p ON p.id=cr.parcel_id
  LEFT JOIN public.cities c ON c.id=p.city_id
  LEFT JOIN public.profiles prof ON prof.id=cr.user_id
  WHERE (cr.certificate_number=upper(trim(p_certificate_number)) OR cr.qr_token=trim(p_certificate_number))
    AND cr.status='issued' LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon,authenticated;

REVOKE ALL ON FUNCTION public.validate_certificate_request() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.certificate_touch_updated_at() FROM PUBLIC;
