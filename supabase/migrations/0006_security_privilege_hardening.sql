-- MySkyParcel production privilege hardening.
-- Additive and non-destructive: this does not change existing rows.
-- Client-side ownership mutations remain server-only.

-- Public catalog data is read-only to API roles.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE public.cities
  FROM anon, authenticated;

-- Parcel ownership is controlled by server-side purchase/reservation code.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE public.parcels
  FROM anon, authenticated;

-- History and certificate records are append/read-only through their RLS policies.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE public.parcel_ownership_history
  FROM anon, authenticated;

REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE public.certificate_requests
  FROM anon, authenticated;

-- Keep only the explicitly required certificate request insert path.
GRANT INSERT ON TABLE public.certificate_requests TO authenticated;

-- Public parcel map exposes only the deliberately selected catalog fields.
REVOKE ALL ON TABLE public.parcel_map_public FROM anon, authenticated;
GRANT SELECT ON TABLE public.parcel_map_public TO anon, authenticated;

-- Public certificate verification is intentionally callable, but the function
-- itself returns only verification metadata and never owner/account details.
REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;
