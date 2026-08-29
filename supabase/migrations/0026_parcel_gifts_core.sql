-- Gift ledger only. Ownership transfer is intentionally implemented through the project's existing parcel ownership model after its exact column is verified.
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
create policy "gift participants can view gifts" on public.parcel_gifts for select to authenticated using (sender_user_id = auth.uid() or recipient_user_id = auth.uid());
create policy "users can create gifts" on public.parcel_gifts for insert to authenticated with check (sender_user_id = auth.uid());
