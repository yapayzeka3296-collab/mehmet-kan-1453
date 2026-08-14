-- Designated MySkyParcel administrator.
-- The normal login page recognizes this authenticated email as admin.
-- Keep the backend authorization aligned so admin RLS/RPC checks also succeed.
-- No MFA/AAL2 requirement is introduced here.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (
    (select auth.email()) = 'incememet3296@gmail.com'
    OR EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = (select auth.uid())
        AND p.role = 'admin'
    )
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
