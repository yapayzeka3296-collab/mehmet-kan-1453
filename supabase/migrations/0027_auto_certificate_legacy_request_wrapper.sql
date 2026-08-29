-- Preserve the legacy one-argument certificate RPC while switching it to automatic issuance.
create or replace function public.request_certificate(p_parcel_id uuid)
returns public.certificate_requests
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  return public.request_certificate(p_parcel_id, '', '', '', '', '', null, 'Türkiye');
end;
$$;
revoke all on function public.request_certificate(uuid) from public;
grant execute on function public.request_certificate(uuid) to authenticated;
