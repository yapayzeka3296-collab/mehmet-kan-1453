-- Admin panel compatibility: preserve the existing 6-argument payment RPC
-- while supporting the current admin UI's 4-argument call shape.
-- The wrapper delegates to the existing security-checked admin RPC.
create or replace function public.admin_create_payment(
  p_order_id uuid,
  p_amount numeric,
  p_currency text,
  p_status text
)
returns public.payments
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.admin_create_payment(
    p_order_id,
    p_amount,
    p_currency,
    p_status,
    'manual',
    null
  );
end;
$$;

-- Never expose the wrapper to anonymous callers.
revoke all on function public.admin_create_payment(uuid, numeric, text, text) from public;
revoke all on function public.admin_create_payment(uuid, numeric, text, text) from anon;
grant execute on function public.admin_create_payment(uuid, numeric, text, text) to authenticated;
