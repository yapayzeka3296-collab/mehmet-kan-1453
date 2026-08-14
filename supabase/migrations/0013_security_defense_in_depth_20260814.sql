-- MySkyParcel production security defense-in-depth hardening.
-- Applied to production Supabase project agfxwddvobkhwbbrdzpt on 2026-08-14.

-- Keep the public parcel map available without exposing base-table access.
ALTER VIEW public.parcel_map_public SET (security_invoker = false);
REVOKE ALL ON public.parcel_map_public FROM anon, authenticated;
GRANT SELECT ON public.parcel_map_public TO anon, authenticated;

-- Lock down Data API table privileges. RLS remains the authorization layer;
-- these grants remove direct mutation paths that are intended to exist only through RPCs.
REVOKE ALL ON TABLE public.parcels, public.orders, public.payments, public.profiles,
  public.certificate_requests, public.certificate_audit_log, public.admin_audit_log,
  public.security_configuration
  FROM anon, authenticated;

GRANT SELECT ON TABLE public.parcels, public.orders, public.payments, public.profiles,
  public.certificate_requests, public.certificate_audit_log, public.admin_audit_log
  TO authenticated;
GRANT UPDATE (full_name) ON TABLE public.profiles TO authenticated;

-- Public city metadata is intentionally read-only.
REVOKE ALL ON TABLE public.cities FROM anon, authenticated;
GRANT SELECT ON TABLE public.cities TO anon, authenticated;

-- Prevent future public-schema objects from becoming reachable by default.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated, PUBLIC;

-- Trigger/helper functions are never API endpoints.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.trigger_set_timestamp() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.certificate_touch_updated_at() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.validate_certificate_request() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.log_certificate_request_created() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_certificate_admin() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_certificate_admin() TO authenticated;

-- Once a user enrolls a verified MFA factor, database access requires an AAL2 JWT.
-- Users without MFA remain compatible with the existing AAL1 flow until enrollment.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles','parcels','orders','payments','certificate_requests','certificate_audit_log','admin_audit_log'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'mfa_assurance_restriction', t);
    EXECUTE format($p$
      CREATE POLICY %I ON public.%I AS RESTRICTIVE FOR ALL TO authenticated
      USING (
        NOT EXISTS (
          SELECT 1 FROM auth.mfa_factors f
          WHERE f.user_id = (select auth.uid()) AND f.status = 'verified'
        ) OR (select auth.jwt()->>'aal') = 'aal2'
      )
      WITH CHECK (
        NOT EXISTS (
          SELECT 1 FROM auth.mfa_factors f
          WHERE f.user_id = (select auth.uid()) AND f.status = 'verified'
        ) OR (select auth.jwt()->>'aal') = 'aal2'
      )
    $p$, 'mfa_assurance_restriction', t);
  END LOOP;
END $$;

-- Admin authorization also respects MFA after an admin enrolls a factor.
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
      AND (
        NOT EXISTS (
          SELECT 1 FROM auth.mfa_factors f
          WHERE f.user_id = (select auth.uid()) AND f.status = 'verified'
        )
        OR (select auth.jwt()->>'aal') = 'aal2'
      )
  );
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.parcel_map_public FROM anon, authenticated;

-- Public certificate verification is intentionally read-only.
REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;
