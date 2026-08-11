REVOKE EXECUTE ON FUNCTION public.approve_certificate_request(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.issue_certificate_request(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reject_certificate_request(uuid,text) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.revoke_certificate(uuid,text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_certificate_request(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.issue_certificate_request(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.reject_certificate_request(uuid,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.revoke_certificate(uuid,text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.is_certificate_admin() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_certificate_admin() TO service_role;
REVOKE EXECUTE ON FUNCTION public.validate_certificate_request() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.certificate_touch_updated_at() FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.log_certificate_request_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
BEGIN
  INSERT INTO public.certificate_audit_log(certificate_request_id,action,actor_id)
  VALUES(NEW.id,'requested',NEW.user_id);
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS certificate_request_created_audit_trigger ON public.certificate_requests;
CREATE TRIGGER certificate_request_created_audit_trigger AFTER INSERT ON public.certificate_requests
FOR EACH ROW EXECUTE FUNCTION public.log_certificate_request_created();
REVOKE ALL ON FUNCTION public.log_certificate_request_created() FROM PUBLIC;
