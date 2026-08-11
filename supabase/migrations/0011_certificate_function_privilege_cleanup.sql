REVOKE EXECUTE ON FUNCTION public.log_certificate_request_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.certificate_touch_updated_at() FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.certificate_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$ BEGIN NEW.updated_at=now(); RETURN NEW; END; $$;
REVOKE EXECUTE ON FUNCTION public.certificate_touch_updated_at() FROM PUBLIC, anon, authenticated;
