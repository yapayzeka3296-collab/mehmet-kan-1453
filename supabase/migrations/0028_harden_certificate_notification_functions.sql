-- Notification trigger functions are internal implementation details.
-- They must not be callable through the Data API by clients.
revoke all on function public.notify_admin_physical_certificate_request() from public, anon, authenticated;
revoke all on function public.notify_admin_certificate_request() from public, anon, authenticated;
