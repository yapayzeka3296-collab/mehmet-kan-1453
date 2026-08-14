-- Restore the pre-security admin authorization behavior.
-- This migration removes ONLY the MFA/AAL2 restrictive policy introduced by 0013
-- from the affected application tables and restores the original is_admin check.
-- All non-MFA security hardening remains in place.

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles',
    'parcels',
    'orders',
    'payments',
    'certificate_requests',
    'certificate_audit_log',
    'admin_audit_log'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'mfa_assurance_restriction', t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = (select auth.uid())
      AND p.role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
