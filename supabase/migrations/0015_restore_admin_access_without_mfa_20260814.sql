-- Restore the pre-0013 admin access behavior without removing the other
-- defense-in-depth protections introduced by 0013.
--
-- The 0013 restrictive MFA policy was applied to profiles as well as the
-- application data tables. The /yonetim route reads profiles.role directly;
-- therefore an admin with a verified MFA factor but an AAL1 session was
-- redirected before the admin role could be read. Remove only that profiles
-- MFA restriction and remove the MFA condition from is_admin().

DROP POLICY IF EXISTS mfa_assurance_restriction ON public.profiles;

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
