-- MySkyParcel + Shopier integration foundation.
-- This migration is intentionally additive: it does not alter existing parcel/order/payment logic.
-- The tables below store Shopier webhook/audit data and a short-lived checkout intent
-- so the existing payment flow can be migrated to Shopier later without changing ownership logic.

create table if not exists public.shopier_checkout_intents (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  parcel_ids uuid[] not null,
  certificate_parcel_id uuid null references public.parcels(id) on delete set null,
  total_amount numeric(14,2) not null check (total_amount >= 0),
  currency text not null default 'TRY',
  status text not null default 'pending' check (status in ('pending','matched','completed','expired','cancelled')),
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  shopier_order_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shopier_checkout_intents_user_idx
  on public.shopier_checkout_intents(user_id, created_at desc);

create index if not exists shopier_checkout_intents_expiry_idx
  on public.shopier_checkout_intents(status, expires_at);

create table if not exists public.shopier_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  shopier_order_id text,
  payload jsonb not null default '{}'::jsonb,
  signature_valid boolean not null default false,
  processing_status text not null default 'received' check (processing_status in ('received','processed','ignored','failed')),
  processing_error text,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists shopier_webhook_events_order_idx
  on public.shopier_webhook_events(shopier_order_id, received_at desc);

create index if not exists shopier_webhook_events_status_idx
  on public.shopier_webhook_events(processing_status, received_at desc);

-- These tables are server-side integration storage. Clients do not get direct table access.
alter table public.shopier_checkout_intents enable row level security;
alter table public.shopier_webhook_events enable row level security;

revoke all on table public.shopier_checkout_intents from anon, authenticated;
revoke all on table public.shopier_webhook_events from anon, authenticated;

-- Keep updated_at consistent with the project's existing timestamp trigger function.
drop trigger if exists shopier_checkout_intents_set_timestamp on public.shopier_checkout_intents;
create trigger shopier_checkout_intents_set_timestamp
before update on public.shopier_checkout_intents
for each row execute procedure public.trigger_set_timestamp();
