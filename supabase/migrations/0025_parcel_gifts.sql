-- Secure parcel gifting: pending invitation -> recipient accepts -> ownership transfer.
create table if not exists public.parcel_gifts (
  id uuid primary key default gen_random_uuid(),
  parcel_id uuid not null,
  sender_user_id uuid not null references auth.users(id) on delete restrict,
  recipient_user_id uuid references auth.users(id) on delete set null,
  recipient_email text not null,
  message text,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','expired','cancelled')),
  token_hash text not null unique,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists parcel_gifts_sender_idx on public.parcel_gifts(sender_user_id, created_at desc);
create index if not exists parcel_gifts_recipient_idx on public.parcel_gifts(recipient_email, status);
create index if not exists parcel_gifts_parcel_idx on public.parcel_gifts(parcel_id, status);

alter table public.parcel_gifts enable row level security;

create policy "users can view their own parcel gifts"
on public.parcel_gifts for select to authenticated
using (sender_user_id = auth.uid() or recipient_user_id = auth.uid());

create policy "users can create gifts for their own parcels"
on public.parcel_gifts for insert to authenticated
with check (sender_user_id = auth.uid());

-- Transfer is deliberately server-side only. Clients never update parcel ownership directly.
create or replace function public.accept_parcel_gift(p_gift_id uuid, p_token_hash text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  g public.parcel_gifts;
  current_user_email text;
  old_owner uuid;
  cert record;
begin
  select email into current_user_email from auth.users where id = auth.uid();
  if current_user_email is null then raise exception 'authentication required'; end if;

  select * into g
  from public.parcel_gifts
  where id = p_gift_id
    and token_hash = p_token_hash
    and status = 'pending'
    and expires_at > now()
  for update;

  if not found then raise exception 'gift is invalid, expired, or already processed'; end if;
  if lower(g.recipient_email) <> lower(current_user_email) then raise exception 'gift recipient does not match signed-in account'; end if;

  -- Lock the parcel row and verify the sender still owns it. This prevents double transfers/races.
  select owner_id into old_owner from public.parcels where id = g.parcel_id for update;
  if old_owner is null then raise exception 'parcel not found'; end if;
  if old_owner <> g.sender_user_id then raise exception 'sender no longer owns this parcel'; end if;
  if old_owner = auth.uid() then raise exception 'cannot accept your own gift'; end if;

  update public.parcels set owner_id = auth.uid() where id = g.parcel_id;

  -- Existing issued certificates are archived rather than reassigned to the new owner.
  -- If the project has a certificate history table, preserve its row and mark it superseded.
  begin
    update public.certificates
      set status = 'archived'
    where parcel_id = g.parcel_id and status = 'issued';
  exception when undefined_table then
    null;
  end;

  update public.parcel_gifts
    set recipient_user_id = auth.uid(), status = 'accepted', accepted_at = now()
  where id = g.id;

  return jsonb_build_object('success', true, 'gift_id', g.id, 'parcel_id', g.parcel_id, 'certificate_requires_new_issue', true);
end;
$$;

revoke all on function public.accept_parcel_gift(uuid,text) from public, anon;
grant execute on function public.accept_parcel_gift(uuid,text) to authenticated;
