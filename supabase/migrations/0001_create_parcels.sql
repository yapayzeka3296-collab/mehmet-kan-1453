-- supabase/migrations/0001_create_parcels.sql

-- Create parcels table
CREATE TABLE IF NOT EXISTS public.parcels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'available',
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  price numeric(14,2) NOT NULL DEFAULT 0,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Constrain status to allowed values
ALTER TABLE public.parcels
  ADD CONSTRAINT parcels_status_check CHECK (status IN ('available','reserved','sold'));

-- Trigger to auto-update updated_at on changes
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_timestamp ON public.parcels;
CREATE TRIGGER trigger_set_timestamp
BEFORE UPDATE ON public.parcels
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();
