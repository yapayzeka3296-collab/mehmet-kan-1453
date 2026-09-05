-- Restore the least-privilege Data API read access required by the parcel selection page.
-- This does not modify parcel data, orders, payments, RLS, or the view definition.
GRANT SELECT ON TABLE public.parcel_map_public TO anon, authenticated;
