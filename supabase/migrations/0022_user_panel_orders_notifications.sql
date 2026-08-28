-- User panel additions requested: orders, certificate tracking metadata, and notifications.
-- No invoice/tax profile fields are introduced.

create table if not exists public.user_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_number text not null unique,
  parcel_id uuid,
  amount numeric(12,2) not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.certificate_requests add column if not exists production_status text not null default 'request_received';
alter table public.certificate_requests add column if not exists shipping_company text;
alter table public.certificate_requests add column if not exists tracking_number text;
alter table public.certificate_requests add column if not exists shipped_at timestamptz;
alter table public.certificate_requests add column if not exists delivered_at timestamptz;

alter table public.user_orders enable row level security;
alter table public.user_notifications enable row level security;

drop policy if exists "users read own orders" on public.user_orders;
drop policy if exists "users read own notifications" on public.user_notifications;
drop policy if exists "users update own notifications" on public.user_notifications;

create policy "users read own orders" on public.user_orders for select using (auth.uid() = user_id);
create policy "users read own notifications" on public.user_notifications for select using (auth.uid() = user_id);
create policy "users update own notifications" on public.user_notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
