-- User panel: keep certificate/order status changes visible to the owning user.
-- No invoice or tax fields are introduced.

alter table public.certificate_requests
  add column if not exists production_status text not null default 'request_received',
  add column if not exists shipping_company text,
  add column if not exists tracking_number text,
  add column if not exists shipped_at timestamptz,
  add column if not exists delivered_at timestamptz;

create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'system',
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.user_notifications enable row level security;
drop policy if exists "users read own notifications" on public.user_notifications;
drop policy if exists "users update own notifications" on public.user_notifications;
create policy "users read own notifications" on public.user_notifications for select using (auth.uid() = user_id);
create policy "users update own notifications" on public.user_notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.notify_certificate_status_change()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare label text;
begin
  if new.user_id is null then return new; end if;
  if tg_op = 'INSERT' or new.production_status is distinct from old.production_status or new.status is distinct from old.status or new.tracking_number is distinct from old.tracking_number then
    label := case new.production_status
      when 'request_received' then 'Talep alındı'
      when 'preparing' then 'Hazırlanıyor'
      when 'printing' then 'Basımda'
      when 'printed' then 'Basım tamamlandı'
      when 'shipped' then 'Kargoya verildi'
      when 'delivered' then 'Teslim edildi'
      else case new.status when 'requested' then 'Talep edildi' when 'approved' then 'Onaylandı' when 'issued' then 'Yayınlandı' when 'rejected' then 'Reddedildi' when 'revoked' then 'İptal edildi' else 'Güncellendi' end
    end;
    insert into public.user_notifications(user_id,type,title,message)
    values (new.user_id,'certificate','Sertifika durumu güncellendi',
      'Sertifikanızın güncel durumu: ' || label || case when new.tracking_number is not null then '. Kargo takip no: ' || new.tracking_number else '' end);
  end if;
  return new;
end;
$$;

drop trigger if exists certificate_status_notification_trigger on public.certificate_requests;
create trigger certificate_status_notification_trigger
after insert or update of production_status,status,tracking_number on public.certificate_requests
for each row execute function public.notify_certificate_status_change();

create or replace function public.notify_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if new.user_id is null then return new; end if;
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.user_notifications(user_id,type,title,message)
    values (new.user_id,'order','Sipariş durumu güncellendi','Siparişinizin güncel durumu: ' || coalesce(new.status,'bilinmiyor') || '.');
  end if;
  return new;
end;
$$;

drop trigger if exists order_status_notification_trigger on public.orders;
create trigger order_status_notification_trigger
after insert or update of status on public.orders
for each row execute function public.notify_order_status_change();
