-- supabase/migrations/0002_harden_parcels_purchase_rls.sql
-- PR#2: make the server-side purchase handler the only client mutation path.
--
-- The purchase ServerFn uses the Supabase service-role key on the server.
-- Supabase service-role requests bypass RLS, while browser clients must not
-- be able to insert/update/delete parcel ownership or reservation state.

ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;

-- Remove the permissive policies from the initial scaffold.
DROP POLICY IF EXISTS "public_select_parcels" ON public.parcels;
DROP POLICY IF EXISTS "user_select_own" ON public.parcels;
DROP POLICY IF EXISTS "insert_parcels" ON public.parcels;
DROP POLICY IF EXISTS "update_own_parcel" ON public.parcels;
DROP POLICY IF EXISTS "prevent_change_owner" ON public.parcels;

-- Parcel availability is public information used by the map.
-- This policy intentionally grants read-only access only.
CREATE POLICY "public_read_parcels"
ON public.parcels
FOR SELECT
TO anon, authenticated
USING (true);

-- There are intentionally no INSERT, UPDATE, or DELETE policies for
-- anon/authenticated roles. Those operations are therefore denied by RLS.
-- The purchase ServerFn performs reservations with the service-role key.
