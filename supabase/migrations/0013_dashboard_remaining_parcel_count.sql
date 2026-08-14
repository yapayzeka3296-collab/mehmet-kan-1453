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
    'certificates_total',(select count(*) from public.certificate_requests),
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
