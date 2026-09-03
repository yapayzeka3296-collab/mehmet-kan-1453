-- Keep the public parcel map tier prices aligned with the live package prices.
-- Applied to production Supabase on 2026-09-03.
-- Does not alter parcels, orders, payment flow, or the cPanel/Nitro core.

CREATE OR REPLACE VIEW public.parcel_map_public AS
SELECT
  p.id,
  p.parcel_number,
  p.status,
  p.price,
  p.tier,
  CASE p.tier
    WHEN 'digital' THEN 149::numeric
    WHEN 'elite' THEN 349::numeric
    WHEN 'premium' THEN 699::numeric
    ELSE p.price + 0::numeric
  END AS tier_price,
  p.city_id,
  CASE c.slug
    WHEN 'istanbul' THEN 'IST'
    WHEN 'ankara' THEN 'ANK'
    WHEN 'izmir' THEN 'IZM'
    WHEN 'bursa' THEN 'BUR'
    WHEN 'antalya' THEN 'ANT'
    WHEN 'kayseri' THEN 'KAY'
    WHEN 'gaziantep' THEN 'GZT'
    ELSE upper(left(regexp_replace(coalesce(c.slug, ''), '[^a-z0-9]', '', 'gi'), 3))
  END AS city_code,
  c.name AS city_name,
  c.slug AS city_slug,
  ((((row_number() OVER (PARTITION BY p.city_id ORDER BY p.parcel_number)) - 1) / 100) + 1)::smallint AS layer_number,
  ((((row_number() OVER (PARTITION BY p.city_id ORDER BY p.parcel_number)) - 1) % 100) + 1)::smallint AS sector_number,
  1 AS local_parcel_number,
  p.grid_x,
  p.grid_y,
  p.latitude,
  p.longitude,
  CASE WHEN p.geometry IS NOT NULL THEN st_asgeojson(p.geometry)::jsonb ELSE NULL::jsonb END AS geometry,
  p.created_at,
  p.updated_at
FROM public.parcels p
LEFT JOIN public.cities c ON c.id = p.city_id;

GRANT SELECT ON public.parcel_map_public TO anon, authenticated;
