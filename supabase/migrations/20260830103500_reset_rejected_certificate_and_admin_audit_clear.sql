begin;

-- Remove the rejected ADIYAMAN-0002 certificate request and its audit trail.
delete from public.certificate_audit_log
where certificate_request_id in (
  select id from public.certificate_requests
  where parcel_id = (select id from public.parcels where parcel_number = 'ADIYAMAN-0002' limit 1)
    and status = 'rejected'
);
delete from public.certificate_requests
where parcel_id = (select id from public.parcels where parcel_number = 'ADIYAMAN-0002' limit 1)
  and status = 'rejected';

-- Dashboard "Sertifika" represents currently issued certificates.
create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $function$
declare
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode='42501';
  end if;
  select jsonb_build_object(
    'parcels_total',(select count(*) from public.parcels where status='available'),
    'parcels_inventory_total',(select count(*) from public.parcels),
    'parcels_sold',(select count(*) from public.parcels where status='sold'),
    'parcels_available',(select count(*) from public.parcels where status='available'),
    'parcels_reserved',(select count(*) from public.parcels where status='reserved'),
    'parcels_admin_owned',(select count(*) from public.parcels p join public.profiles pr on pr.id=p.owner_id where p.status='sold' and pr.role='admin'),
    'users_total',(select count(*) from public.profiles where coalesce(role,'user') <> 'admin'),
    'certificates_total',(select count(*) from public.certificate_requests where status='issued'),
    'certificates_issued',(select count(*) from public.certificate_requests where status='issued'),
    'certificates_pending',(select count(*) from public.certificate_requests where status in ('requested','approved')),
    'certificates_revoked',(select count(*) from public.certificate_requests where status='revoked'),
    'orders_total',(select count(*) from public.orders),
    'orders_paid',(select count(*) from public.orders where status='paid'),
    'payments_total',(select count(*) from public.payments),
    'payments_succeeded',(select count(*) from public.payments where status='succeeded'),
    'generated_at',now()
  ) into result;
  return result;
end;
$function$;

-- Admin-only destructive action. It clears both application audit stores.
create or replace function public.admin_clear_all_audit_logs()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
declare
  deleted_admin integer := 0;
  deleted_certificate integer := 0;
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode='42501';
  end if;
  delete from public.certificate_audit_log;
  get diagnostics deleted_certificate = row_count;
  delete from public.admin_audit_log;
  get diagnostics deleted_admin = row_count;
  return deleted_admin + deleted_certificate;
end;
$function$;

revoke all on function public.admin_clear_all_audit_logs() from public;
grant execute on function public.admin_clear_all_audit_logs() to authenticated;

commit;