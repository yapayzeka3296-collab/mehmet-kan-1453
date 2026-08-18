-- Safe authenticated certificate request endpoint.
-- Keeps the existing server-side issuance and admin approval model intact.

CREATE OR REPLACE FUNCTION public.request_certificate(p_parcel_id uuid)
RETURNS public.certificate_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  actor uuid := (select auth.uid());
  p public.parcels%ROWTYPE;
  r public.certificate_requests%ROWTYPE;
BEGIN
  IF actor IS NULL THEN RAISE EXCEPTION 'authentication_required'; END IF;
  SELECT * INTO p FROM public.parcels WHERE id = p_parcel_id FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'parcel_not_found'; END IF;
  IF p.owner_id IS DISTINCT FROM actor OR p.status <> 'sold' THEN RAISE EXCEPTION 'certificate_requires_owned_sold_parcel'; END IF;
  IF p.tier NOT IN ('digital','elite','premium') THEN RAISE EXCEPTION 'invalid_parcel_tier'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.certificate_requests cr
    WHERE cr.user_id = actor AND cr.parcel_id = p.id
      AND cr.status IN ('requested','approved','issued','revoked')
  ) THEN RAISE EXCEPTION 'certificate_already_requested'; END IF;

  INSERT INTO public.certificate_requests(user_id, parcel_id, tier, status)
  VALUES(actor, p.id, p.tier, 'requested')
  RETURNING * INTO r;
  RETURN r;
END;
$$;

REVOKE ALL ON FUNCTION public.request_certificate(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.request_certificate(uuid) TO authenticated;
