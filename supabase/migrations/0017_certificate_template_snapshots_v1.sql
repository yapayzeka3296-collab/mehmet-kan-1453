-- Certificate rendering metadata and immutable display snapshots.
-- Existing certificate issuance/security model remains unchanged.

ALTER TABLE public.certificate_requests
  ADD COLUMN IF NOT EXISTS holder_name_snapshot text,
  ADD COLUMN IF NOT EXISTS city_name_snapshot text,
  ADD COLUMN IF NOT EXISTS template_type text,
  ADD COLUMN IF NOT EXISTS template_version text,
  ADD COLUMN IF NOT EXISTS verification_url text;

UPDATE public.certificate_requests cr
SET holder_name_snapshot = COALESCE(NULLIF(BTRIM(p.full_name), ''), 'MySkyParcel Kullanıcısı'),
    city_name_snapshot = c.name,
    template_type = CASE cr.tier
      WHEN 'digital' THEN 'digital'
      WHEN 'elite' THEN 'special'
      WHEN 'premium' THEN 'premium'
    END,
    template_version = CASE cr.tier
      WHEN 'digital' THEN 'digital-v1'
      WHEN 'elite' THEN 'special-v1'
      WHEN 'premium' THEN 'premium-v1'
    END,
    verification_url = '/sertifika-dogrula?code=' || cr.certificate_number
FROM public.profiles p, public.parcels pa
LEFT JOIN public.cities c ON c.id = pa.city_id
WHERE cr.user_id = p.id
  AND pa.id = cr.parcel_id
  AND cr.status = 'issued';

ALTER TABLE public.certificate_requests
  ALTER COLUMN template_type SET DEFAULT 'digital',
  ALTER COLUMN template_version SET DEFAULT 'digital-v1';

CREATE INDEX IF NOT EXISTS certificate_requests_verification_url_idx
  ON public.certificate_requests(verification_url)
  WHERE verification_url IS NOT NULL;
