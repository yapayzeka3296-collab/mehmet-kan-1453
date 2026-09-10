-- Sky Scan only: isolated read-only projection layer.
-- Existing public.parcels data is not modified by this migration.

CREATE TABLE IF NOT EXISTS public.sky_scan_parcels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id uuid NOT NULL UNIQUE REFERENCES public.parcels(id) ON DELETE RESTRICT,
  city_id uuid NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
  parcel_number text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  scan_order integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.sky_scan_parcels (parcel_id, city_id, parcel_number, latitude, longitude, scan_order)
SELECT p.id, p.city_id, p.parcel_number, p.latitude, p.longitude,
       row_number() OVER (PARTITION BY p.city_id ORDER BY p.parcel_number)::integer
FROM public.parcels p
WHERE p.city_id IS NOT NULL AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
ON CONFLICT (parcel_id) DO UPDATE SET
  city_id = EXCLUDED.city_id,
  parcel_number = EXCLUDED.parcel_number,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  scan_order = EXCLUDED.scan_order;

CREATE INDEX IF NOT EXISTS sky_scan_parcels_city_idx ON public.sky_scan_parcels(city_id);
CREATE INDEX IF NOT EXISTS sky_scan_parcels_lat_lng_idx ON public.sky_scan_parcels(latitude, longitude);

ALTER TABLE public.sky_scan_parcels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS sky_scan_parcels_public_read ON public.sky_scan_parcels;
CREATE POLICY sky_scan_parcels_public_read
  ON public.sky_scan_parcels FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.sky_scan_parcels TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.sky_scan_parcels(
  p_min_lat double precision,
  p_min_lng double precision,
  p_max_lat double precision,
  p_max_lng double precision,
  p_limit integer DEFAULT 300
)
RETURNS TABLE(
  id uuid, parcel_number text, status text, price numeric, tier text,
  tier_price numeric, city_name text, city_slug text,
  latitude double precision, longitude double precision
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO public, extensions
AS $$
  WITH user_point AS (
    SELECT ((p_min_lat + p_max_lat) / 2.0) AS lat,
           ((p_min_lng + p_max_lng) / 2.0) AS lng
  ),
  city_centers AS (
    SELECT p.city_id, avg(p.latitude) AS lat, avg(p.longitude) AS lng
    FROM public.sky_scan_parcels p
    GROUP BY p.city_id
  ),
  target_city AS (
    SELECT cc.city_id
    FROM city_centers cc, user_point u
    ORDER BY extensions.st_distance(
      extensions.st_point(cc.lng, cc.lat)::extensions.geography,
      extensions.st_point(u.lng, u.lat)::extensions.geography
    )
    LIMIT 1
  )
  SELECT p.id, p.parcel_number, src.status, src.price, src.tier,
    CASE src.tier
      WHEN 'digital' THEN 149::numeric
      WHEN 'elite' THEN 349::numeric
      WHEN 'premium' THEN 699::numeric
      ELSE src.price
    END AS tier_price,
    c.name AS city_name, c.slug AS city_slug,
    p.latitude, p.longitude
  FROM public.sky_scan_parcels p
  JOIN public.parcels src ON src.id = p.parcel_id
  JOIN public.cities c ON c.id = p.city_id
  JOIN target_city tc ON tc.city_id = p.city_id
  CROSS JOIN user_point u
  WHERE c.is_active = true
  ORDER BY extensions.st_distance(
      extensions.st_point(p.longitude, p.latitude)::extensions.geography,
      extensions.st_point(u.lng, u.lat)::extensions.geography
    ) ASC,
    p.scan_order ASC
  LIMIT greatest(25, least(coalesce(p_limit, 300), 300));
$$;

REVOKE ALL ON FUNCTION public.sky_scan_parcels(double precision,double precision,double precision,double precision,integer) FROM public;
GRANT EXECUTE ON FUNCTION public.sky_scan_parcels(double precision,double precision,double precision,double precision,integer) TO anon, authenticated;
