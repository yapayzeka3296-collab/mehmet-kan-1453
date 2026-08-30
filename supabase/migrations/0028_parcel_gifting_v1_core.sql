-- Parcel gifting v1: secure creation, cancellation and atomic acceptance.
-- This migration is additive to the existing parcel ownership model.

create unique index if not exists parcel_gifts_one_pending_per_parcel_idx
  on public.parcel_gifts(parcel_id)
  where status = 'pending';

drop policy if exists "users can create gifts for their own parcels" on public.parcel_gifts;
drop policy if exists "users can create gifts" on public.parcel_gifts;

drop function if exists public.create_parcel_gift(uuid,text,text);
create function public.create_parcel_gift(
  p_parcel_id uuid,
  p_recipient_email text,
  p_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_parcel public.parcels;
  v_token text;
  v_gift_id uuid;
  v_expires timestamptz;
  v_recipient_user_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  v_email := lower(trim(coalesce(p_recipient_email, '')));
  if v_email = '' or position('@' in v_email) < 2 then
    raise exception 'valid recipient email required' using errcode = '22023';
  end if;
  if length(v_email) > 320 then
    raise exception 'recipient email is too long' using errcode = '22023';
  end if;
  if p_message is not null and length(p_message) > 1000 then
    raise exception 'gift message is too long' using errcode = '22023';
  end if;

  select * into v_parcel
  from public.parcels
  where id = p_parcel_id
  for update;

  if not found then
    raise exception 'parcel not found' using errcode = 'P0002';
  end if;
  if v_parcel.owner_id is distinct from v_user_id then
    raise exception 'you do not own this parcel' using errcode = '42501';
  end if;
  if lower(coalesce((select email from auth.users where id = v_user_id), '')) = v_email then
    raise exception 'cannot gift a parcel to yourself' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.parcel_gifts
    where parcel_id = p_parcel_id and status = 'pending' and expires_at > now()
  ) then
    raise exception 'parcel already has a pending gift' using errcode = '23505';
  end if;

  select id into v_recipient_user_id
  from auth.users
  where lower(email) = v_email
  limit 1;

  v_token := encode(gen_random_bytes(32), 'hex');
  v_expires := now() + interval '7 days';

  insert into public.parcel_gifts (
    parcel_id, sender_user_id, recipient_user_id, recipient_email, message,
    status, token_hash, expires_at
  ) values (
    p_parcel_id, v_user_id, v_recipient_user_id, v_email,
    nullif(trim(p_message), ''), 'pending',
    encode(digest(v_token, 'sha256'), 'hex'), v_expires
  )
  returning id into v_gift_id;

  return jsonb_build_object(
    'gift_id', v_gift_id,
    'parcel_id', p_parcel_id,
    'recipient_email', v_email,
    'expires_at', v_expires,
    'token', v_token
  );
end;
$$;

revoke all on function public.create_parcel_gift(uuid,text,text) from public, anon;
grant execute on function public.create_parcel_gift(uuid,text,text) to authenticated;

drop function if exists public.cancel_parcel_gift(uuid);
create function public.cancel_parcel_gift(p_gift_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_gift public.parcel_gifts;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select * into v_gift
  from public.parcel_gifts
  where id = p_gift_id and sender_user_id = auth.uid()
  for update;

  if not found then raise exception 'gift not found' using errcode = 'P0002'; end if;
  if v_gift.status <> 'pending' then raise exception 'gift is not pending' using errcode = '22023'; end if;

  update public.parcel_gifts set status = 'cancelled' where id = p_gift_id;

  return jsonb_build_object('success', true, 'gift_id', p_gift_id, 'status', 'cancelled');
end;
$$;

revoke all on function public.cancel_parcel_gift(uuid) from public, anon;
grant execute on function public.cancel_parcel_gift(uuid) to authenticated;

create or replace function public.accept_parcel_gift(p_gift_id uuid, p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  g public.parcel_gifts;
  current_user_email text;
  old_owner uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select lower(email) into current_user_email
  from auth.users
  where id = auth.uid();

  if current_user_email is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select * into g
  from public.parcel_gifts
  where id = p_gift_id
    and token_hash = p_token_hash
    and status = 'pending'
    and expires_at > now()
  for update;

  if not found then
    raise exception 'gift is invalid, expired, or already processed' using errcode = '22023';
  end if;
  if lower(g.recipient_email) <> current_user_email then
    raise exception 'gift recipient does not match signed-in account' using errcode = '42501';
  end if;

  select owner_id into old_owner
  from public.parcels
  where id = g.parcel_id
  for update;

  if old_owner is null then raise exception 'parcel not found' using errcode = 'P0002'; end if;
  if old_owner <> g.sender_user_id then raise exception 'sender no longer owns this parcel' using errcode = '42501'; end if;
  if old_owner = auth.uid() then raise exception 'cannot accept your own gift' using errcode = '42501'; end if;

  update public.parcels
  set owner_id = auth.uid(), updated_at = now()
  where id = g.parcel_id;

  if to_regclass('public.certificates') is not null then
    update public.certificates
    set status = 'archived'
    where parcel_id = g.parcel_id and status = 'issued';
  end if;

  update public.parcel_gifts
  set recipient_user_id = auth.uid(), status = 'accepted', accepted_at = now()
  where id = g.id;

  return jsonb_build_object(
    'success', true,
    'gift_id', g.id,
    'parcel_id', g.parcel_id,
    'certificate_requires_new_issue', true
  );
end;
$$;

revoke all on function public.accept_parcel_gift(uuid,text) from public, anon;
grant execute on function public.accept_parcel_gift(uuid,text) to authenticated;
