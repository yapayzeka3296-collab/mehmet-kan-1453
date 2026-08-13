-- MySkyParcel production privilege hardening for the current schema.
-- Anonymous clients may read public catalog data, but cannot mutate application tables.
-- Authenticated writes remain governed by existing RLS/admin policies.

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE public.cities
  FROM anon, authenticated;
GRANT SELECT ON TABLE public.cities TO anon, authenticated;

REVOKE ALL
  ON TABLE public.parcels
  FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.parcels TO authenticated;

REVOKE ALL
  ON TABLE public.profiles
  FROM anon;
GRANT SELECT, UPDATE ON TABLE public.profiles TO authenticated;

REVOKE ALL
  ON TABLE public.parcel_map_public
  FROM anon, authenticated;
GRANT SELECT ON TABLE public.parcel_map_public TO anon, authenticated;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
