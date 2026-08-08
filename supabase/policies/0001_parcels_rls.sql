-- supabase/policies/0001_parcels_rls.sql

-- Enable RLS on parcels (run this in Supabase SQL editor)
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;

-- Policy: public can SELECT parcels (read-only public information)
CREATE POLICY "public_select_parcels" ON public.parcels
FOR SELECT
USING (
  true
);

-- Policy: authenticated users can SELECT their own parcels (redundant but explicit)
CREATE POLICY "user_select_own" ON public.parcels
FOR SELECT
USING (
  auth.role() = 'authenticated' AND owner_id = auth.uid()
);

-- Policy: insert allowed only for authenticated users (creating reservations/assignments)
CREATE POLICY "insert_parcels" ON public.parcels
FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
);

-- Policy: owners can update allowed fields on their own parcels but cannot set status to 'sold'
CREATE POLICY "update_own_parcel" ON public.parcels
FOR UPDATE
USING (
  auth.role() = 'authenticated' AND owner_id = auth.uid()
)
WITH CHECK (
  auth.role() = 'authenticated'
  AND owner_id = auth.uid()
  AND (NEW.status <> 'sold')
);

-- Policy: prevent owner_id changes by non-service-role actors; only allow owner_id change if unchanged
CREATE POLICY "prevent_change_owner" ON public.parcels
FOR UPDATE
WITH CHECK (
  (NEW.owner_id = OLD.owner_id)
  OR (auth.role() = 'service_role')
);
