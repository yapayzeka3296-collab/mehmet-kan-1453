-- MySkyParcel: atomic multi-parcel reservation/purchase preparation.
-- Users may select any number of available parcels in the map and submit them together.
-- The function delegates each item to the existing transactional create_parcel_order()
-- so a failure rolls back the entire batch instead of leaving a partial selection reserved.

CREATE OR REPLACE FUNCTION public.create_parcel_orders_bulk(p_parcel_ids uuid[])
RETURNS SETOF public.orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_id uuid;
  v_count integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'unauthorized' USING errcode = '42501';
  END IF;

  IF p_parcel_ids IS NULL OR coalesce(array_length(p_parcel_ids, 1), 0) = 0 THEN
    RAISE EXCEPTION 'empty_parcel_selection';
  END IF;

  SELECT count(DISTINCT x) INTO v_count
  FROM unnest(p_parcel_ids) AS t(x);

  IF v_count > 5000 THEN
    RAISE EXCEPTION 'too_many_parcels';
  END IF;

  FOR v_id IN
    SELECT DISTINCT x FROM unnest(p_parcel_ids) AS t(x)
  LOOP
    RETURN NEXT public.create_parcel_order(v_id);
  END LOOP;

  RETURN;
END;
$$;

REVOKE ALL ON FUNCTION public.create_parcel_orders_bulk(uuid[]) FROM public;
GRANT EXECUTE ON FUNCTION public.create_parcel_orders_bulk(uuid[]) TO authenticated;
