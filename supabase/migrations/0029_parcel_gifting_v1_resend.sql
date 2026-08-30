create or replace function public.resend_parcel_gift(p_gift_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_gift public.parcel_gifts;
  v_token text;
  v_expires timestamptz;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select * into v_gift
  from public.parcel_gifts
  where id = p_gift_id and sender_user_id = auth.uid()
  for update;

  if not found then raise exception 'gift not found' using errcode = 'P0002'; end if;
  if v_gift.status <> 'pending' then raise exception 'only pending gifts can be resent' using errcode = '22023'; end if;

  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires := now() + interval '7 days';

  update public.parcel_gifts
  set token_hash = encode(digest(v_token, 'sha256'), 'hex'), expires_at = v_expires
  where id = p_gift_id;

  return jsonb_build_object(
    'gift_id', p_gift_id,
    'recipient_email', v_gift.recipient_email,
    'expires_at', v_expires,
    'token', v_token
  );
end;
$$;

revoke all on function public.resend_parcel_gift(uuid) from public, anon;
grant execute on function public.resend_parcel_gift(uuid) to authenticated;
