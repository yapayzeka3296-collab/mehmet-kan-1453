-- Correct the template metadata defaults after the initial snapshot migration.
ALTER TABLE public.certificate_requests
  ALTER COLUMN template_type SET DEFAULT 'digital',
  ALTER COLUMN template_version SET DEFAULT 'digital-v1';
