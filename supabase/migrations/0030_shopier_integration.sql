-- Shopier integration layer. Additive only; existing orders/payments/parcels logic is unchanged.
create table if not exists public.shopier_checkout_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parcel_id uuid not null references public.parcels(id) on delete restrict,
  order_id uuid,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'TRY',
  status text not null default 'pending' check (status in ('pending','redirected','paid','cancelled','expired','failed')),
  shopier_order_id text,
  checkout_url text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists shopier_checkout_intents_active_parcel_idx on public.shopier_checkout_intents(parcel_id) where status in ('pending','redirected');
create index if not exists shopier_checkout_intents_user_idx on public.shopier_checkout_intents(user_id, created_at desc);
create index if not exists shopier_checkout_intents_shopier_order_idx on public.shopier_checkout_intents(shopier_order_id) where shopier_order_id is not null;
create table if not exists public.shopier_webhook_events (
  id uuid primary key default gen_random_uuid(), event_id text, event_type text, shopier_order_id text,
  signature_valid boolean not null default false, payload jsonb not null, received_at timestamptz not null default now(),
  processed_at timestamptz, processing_status text not null default 'received' check (processing_status in ('received','processed','ignored','failed')), processing_error text
);
create unique index if not exists shopier_webhook_events_event_id_idx on public.shopier_webhook_events(event_id) where event_id is not null;
create index if not exists shopier_webhook_events_order_idx on public.shopier_webhook_events(shopier_order_id) where shopier_order_id is not null;
alter table public.shopier_checkout_intents enable row level security;
alter table public.shopier_webhook_events enable row level security;
create policy "users can view their Shopier checkout intents" on public.shopier_checkout_intents for select using (auth.uid() = user_id);
create policy "users can create their Shopier checkout intents" on public.shopier_checkout_intents for insert with check (auth.uid() = user_id);
revoke all on public.shopier_webhook_events from anon, authenticated;
