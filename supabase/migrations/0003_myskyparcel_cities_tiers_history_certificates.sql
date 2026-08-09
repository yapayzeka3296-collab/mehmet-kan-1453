-- MySkyParcel domain model
-- 7 pilot cities, 1,000 parcels per city, immutable ownership/certificate history.

CREATE TABLE IF NOT EXISTS public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL UNIQUE,
  is_pilot boolean NOT NULL DEFAULT false,
  parcel_capacity bigint NOT NULL DEFAULT 1000000,
  image_url text,
  center_latitude double precision NOT NULL,
  center_longitude double precision NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.cities (code, name, is_pilot, parcel_capacity, center_latitude, center_longitude)
VALUES
  ('IST', 'İstanbul', true, 1000000, 41.0082, 28.9784),
  ('ANK', 'Ankara', true, 1000000, 39.9334, 32.8597),
  ('IZM', 'İzmir', true, 1000000, 38.4237, 27.1428),
  ('BUR', 'Bursa', true, 1000000, 40.1950, 29.0600),
  ('ANT', 'Antalya', true, 1000000, 36.8969, 30.7133),
  ('KAY', 'Kayseri', true, 1000000, 38.7205, 35.4826),
  ('GZT', 'Gaziantep', true, 1000000, 37.0662, 37.3833)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  is_pilot = EXCLUDED.is_pilot,
  parcel_capacity = EXCLUDED.parcel_capacity,
  center_latitude = EXCLUDED.center_latitude,
  center_longitude = EXCLUDED.center_longitude;

ALTER TABLE public.parcels
  ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES public.cities(id),
  ADD COLUMN IF NOT EXISTS tier text,
  ADD COLUMN IF NOT EXISTS tier_price numeric(14,2);

ALTER TABLE public.parcels
  DROP CONSTRAINT IF EXISTS parcels_tier_check;
ALTER TABLE public.parcels
  ADD CONSTRAINT parcels_tier_check CHECK (tier IS NULL OR tier IN ('digital','elite','premium'));

-- Seed exactly 1,000 deterministic pilot parcels per pilot city when absent.
DO $$
DECLARE
  c record;
  n integer;
  p_tier text;
  p_price numeric(14,2);
  p_code text;
  p_lat double precision;
  p_lon double precision;
BEGIN
  FOR c IN SELECT * FROM public.cities WHERE is_pilot = true ORDER BY code LOOP
    FOR n IN 1..1000 LOOP
      p_tier := CASE
        WHEN n <= 500 THEN 'digital'
        WHEN n <= 800 THEN 'elite'
        ELSE 'premium'
      END;
      p_price := CASE p_tier
        WHEN 'digital' THEN 199
        WHEN 'elite' THEN 499
        ELSE 999
      END;
      p_code := c.code || '-' || lpad(n::text, 4, '0');
      -- Deterministic visual distribution around the city's center.
      p_lat := c.center_latitude + (((n - 1) % 40) - 19.5) * 0.008;
      p_lon := c.center_longitude + (((n - 1) / 40) - 12.0) * 0.012;

      INSERT INTO public.parcels (
        parcel_number, status, owner_id, price, latitude, longitude, city_id, tier, tier_price
      )
      VALUES (
        p_code, 'available', NULL, p_price, p_lat, p_lon, c.id, p_tier, p_price
      )
      ON CONFLICT (parcel_number) DO UPDATE SET
        city_id = COALESCE(public.parcels.city_id, EXCLUDED.city_id),
        tier = COALESCE(public.parcels.tier, EXCLUDED.tier),
        tier_price = COALESCE(public.parcels.tier_price, EXCLUDED.tier_price);
    END LOOP;
  END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS parcels_city_id_idx ON public.parcels(city_id);
CREATE INDEX IF NOT EXISTS parcels_status_idx ON public.parcels(status);
CREATE INDEX IF NOT EXISTS parcels_tier_idx ON public.parcels(tier);

CREATE TABLE IF NOT EXISTS public.parcel_ownership_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id uuid NOT NULL REFERENCES public.parcels(id) ON DELETE RESTRICT,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  acquired_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz,
  acquisition_type text NOT NULL DEFAULT 'purchase',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ownership_acquisition_type_check CHECK (acquisition_type IN ('purchase','marketplace'))
);
CREATE INDEX IF NOT EXISTS ownership_history_parcel_idx ON public.parcel_ownership_history(parcel_id, acquired_at DESC);
CREATE INDEX IF NOT EXISTS ownership_history_owner_idx ON public.parcel_ownership_history(owner_id, acquired_at DESC);

CREATE TABLE IF NOT EXISTS public.certificate_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  parcel_id uuid NOT NULL REFERENCES public.parcels(id) ON DELETE RESTRICT,
  tier text NOT NULL,
  status text NOT NULL DEFAULT 'requested',
  certificate_number text UNIQUE,
  requested_at timestamptz NOT NULL DEFAULT now(),
  issued_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT certificate_tier_check CHECK (tier IN ('digital','elite','premium')),
  CONSTRAINT certificate_status_check CHECK (status IN ('requested','approved','issued','rejected'))
);

-- A user has one certificate right per tier for their lifetime.
CREATE UNIQUE INDEX IF NOT EXISTS certificate_one_per_user_tier_idx
  ON public.certificate_requests(user_id, tier);
CREATE INDEX IF NOT EXISTS certificate_requests_parcel_idx ON public.certificate_requests(parcel_id, requested_at DESC);

-- Prevent ordinary clients from mutating history/certificate records directly.
ALTER TABLE public.parcel_ownership_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificate_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ownership_history_select_own ON public.parcel_ownership_history;
CREATE POLICY ownership_history_select_own
  ON public.parcel_ownership_history FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

DROP POLICY IF EXISTS certificate_requests_select_own ON public.certificate_requests;
CREATE POLICY certificate_requests_select_own
  ON public.certificate_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS certificate_requests_insert_own ON public.certificate_requests;
CREATE POLICY certificate_requests_insert_own
  ON public.certificate_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- No UPDATE/DELETE policies are intentionally provided: history is append-only.
