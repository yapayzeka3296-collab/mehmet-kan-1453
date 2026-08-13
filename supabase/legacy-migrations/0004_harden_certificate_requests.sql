-- Secure certificate request rules.
-- A certificate request is valid only for the authenticated user's sold parcel
-- and must match the parcel tier. Rejected requests do not consume the right.

DROP INDEX IF EXISTS public.certificate_one_per_user_tier_idx;
CREATE UNIQUE INDEX IF NOT EXISTS certificate_one_active_per_user_tier_idx
  ON public.certificate_requests(user_id, tier)
  WHERE status IN ('requested', 'approved', 'issued');

CREATE OR REPLACE FUNCTION public.validate_certificate_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.parcels%ROWTYPE;
BEGIN
  SELECT * INTO p FROM public.parcels WHERE id = NEW.parcel_id;

  IF p.id IS NULL THEN
    RAISE EXCEPTION 'parcel_not_found';
  END IF;

  IF p.owner_id IS DISTINCT FROM NEW.user_id OR p.status <> 'sold' THEN
    RAISE EXCEPTION 'certificate_requires_owned_sold_parcel';
  END IF;

  IF p.tier IS DISTINCT FROM NEW.tier THEN
    RAISE EXCEPTION 'certificate_tier_mismatch';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_certificate_request_trigger ON public.certificate_requests;
CREATE TRIGGER validate_certificate_request_trigger
BEFORE INSERT ON public.certificate_requests
FOR EACH ROW
EXECUTE FUNCTION public.validate_certificate_request();
