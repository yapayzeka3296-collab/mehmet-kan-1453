-- Restore the RPC expected by src/server-fns/purchase-bulk.ts.
-- The function is atomic: create_parcel_order() is called for every selected
-- parcel in one transaction, so any failure rolls the whole batch back.

ALTER TABLE public.parcels
  DROP CONSTRAINT IF EXISTS parcels_tier_check;

ALTER TABLE public.parcels
  ADD CONSTRAINT parcels_tier_check
  CHECK (tier IN ('digital', 'elite', 'premium'));

CREATE OR REPLACE FUNCTION public.create_parcel_orders_bulk(p_parcel_ids uuid[])
RETURNS SETOF public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_id uuid;
  v_ids uuid[];
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING errcode = '42501';
  END IF;

  SELECT COALESCE(array_agg(DISTINCT x ORDER BY x), '{}'::uuid[])
    INTO v_ids
  FROM unnest(COALESCE(p_parcel_ids, '{}'::uuid[])) AS t(x);

  IF COALESCE(array_length(v_ids, 1), 0) = 0 THEN
    RAISE EXCEPTION 'empty_parcel_selection';
  END IF;

  IF array_length(v_ids, 1) > 100 THEN
    RAISE EXCEPTION 'too_many_parcels';
  END IF;

  FOR v_id IN SELECT unnest(v_ids)
  LOOP
    RETURN NEXT public.create_parcel_order(v_id);
  END LOOP;

  RETURN;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_parcel_orders_bulk(uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_parcel_orders_bulk(uuid[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_parcel_orders_bulk(uuid[]) TO authenticated;
