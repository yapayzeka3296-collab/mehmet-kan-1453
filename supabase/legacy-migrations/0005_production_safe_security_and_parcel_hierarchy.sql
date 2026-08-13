-- Production-safe hardening for the existing MySkyParcel schema.
-- Additive only: existing tables and rows are preserved.
-- This migration is intentionally numbered 0005 because 0004_harden_certificate_requests.sql already exists.

ALTER TABLE public.cities
  ADD COLUMN IF NOT EXISTS slug text;

UPDATE public.cities
SET slug = CASE code
  WHEN 'IST' THEN 'istanbul'
  WHEN 'ANK' THEN 'ankara'
  WHEN 'IZM' THEN 'izmir'
  WHEN 'BUR' THEN 'bursa'
  WHEN 'ANT' THEN 'antalya'
  WHEN 'KAY' THEN 'kayseri'
  WHEN 'GZT' THEN 'gaziantep'
  ELSE lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
END
WHERE slug IS NULL;

ALTER TABLE public.cities
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS cities_slug_idx ON public.cities(slug);

ALTER TABLE public.parcels
  ADD COLUMN IF NOT EXISTS layer_number smallint,
  ADD COLUMN IF NOT EXISTS sector_number smallint,
  ADD COLUMN IF NOT EXISTS local_parcel_number integer;

WITH ranked AS (
  SELECT
    id,
    row_number() OVER (PARTITION BY city_id ORDER BY parcel_number) AS rn
  FROM public.parcels
  WHERE city_id IS NOT NULL
)
UPDATE public.parcels p
SET
  layer_number = ((ranked.rn - 1) / 100) + 1,
  sector_number = ((ranked.rn - 1) % 100) + 1,
  local_parcel_number = 1
FROM ranked
WHERE p.id = ranked.id
  AND p.layer_number IS NULL;

ALTER TABLE public.parcels
  DROP CONSTRAINT IF EXISTS parcels_hierarchy_check;

ALTER TABLE public.parcels
  ADD CONSTRAINT parcels_hierarchy_check CHECK (
    (layer_number IS NULL AND sector_number IS NULL AND local_parcel_number IS NULL)
    OR (
      layer_number BETWEEN 1 AND 10
      AND sector_number BETWEEN 1 AND 100
      AND local_parcel_number BETWEEN 1 AND 1000
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS parcels_city_hierarchy_uidx
  ON public.parcels(city_id, layer_number, sector_number, local_parcel_number)
  WHERE city_id IS NOT NULL
    AND layer_number IS NOT NULL
    AND sector_number IS NOT NULL
    AND local_parcel_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS parcels_city_hierarchy_idx
  ON public.parcels(city_id, layer_number, sector_number);

CREATE OR REPLACE VIEW public.parcel_map_public AS
SELECT
  p.id,
  p.parcel_number,
  p.status,
  p.price,
  p.tier,
  p.tier_price,
  p.city_id,
  c.code AS city_code,
  c.name AS city_name,
  c.slug AS city_slug,
  p.layer_number,
  p.sector_number,
  p.local_parcel_number,
  p.latitude,
  p.longitude,
  p.created_at,
  p.updated_at
FROM public.parcels p
LEFT JOIN public.cities c ON c.id = p.city_id;

GRANT SELECT ON public.parcel_map_public TO anon, authenticated;

ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS public_read_parcels ON public.parcels;
DROP POLICY IF EXISTS public_select_parcels ON public.parcels;
DROP POLICY IF EXISTS user_select_own ON public.parcels;
DROP POLICY IF EXISTS insert_parcels ON public.parcels;
DROP POLICY IF EXISTS update_own_parcel ON public.parcels;
DROP POLICY IF EXISTS prevent_change_owner ON public.parcels;
DROP POLICY IF EXISTS parcels_select_own ON public.parcels;

CREATE POLICY parcels_select_own
ON public.parcels
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- No INSERT/UPDATE/DELETE policies are intentionally provided for anon or
-- authenticated roles. Reservation/ownership mutations remain server-only.

CREATE OR REPLACE FUNCTION public.verify_certificate(p_certificate_number text)
RETURNS TABLE (
  certificate_number text,
  status text,
  issued_at timestamptz,
  parcel_number text,
  city_code text,
  city_name text,
  tier text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    cr.certificate_number,
    cr.status,
    cr.issued_at,
    p.parcel_number,
    c.code,
    c.name,
    cr.tier
  FROM public.certificate_requests cr
  JOIN public.parcels p ON p.id = cr.parcel_id
  LEFT JOIN public.cities c ON c.id = p.city_id
  WHERE cr.certificate_number = upper(trim(p_certificate_number))
    AND cr.status = 'issued'
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

DROP POLICY IF EXISTS certificate_requests_insert_own ON public.certificate_requests;
CREATE POLICY certificate_requests_insert_own
ON public.certificate_requests
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.parcels p
    WHERE p.id = parcel_id
      AND p.owner_id = auth.uid()
      AND p.status = 'sold'
      AND p.tier = certificate_requests.tier
  )
);
