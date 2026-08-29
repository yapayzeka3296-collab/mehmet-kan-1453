create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'system',
  title text not null,
  message text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.admin_notifications enable row level security;
drop policy if exists "admins read admin notifications" on public.admin_notifications;
drop policy if exists "admins update admin notifications" on public.admin_notifications;
create policy "admins read admin notifications" on public.admin_notifications
  for select using (public.is_admin());
create policy "admins update admin notifications" on public.admin_notifications
  for update using (public.is_admin()) with check (public.is_admin());

create index if not exists admin_notifications_created_at_idx
  on public.admin_notifications (created_at desc);
create index if not exists admin_notifications_unread_idx
  on public.admin_notifications (is_read, created_at desc);

create or replace function public.notify_admin_certificate_request()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if new.status = 'requested' then
    insert into public.admin_notifications(type,title,message,entity_id,metadata)
    values (
      'certificate',
      'Yeni sertifika talebi',
      'Bir kullanıcı sertifika talebi oluşturdu.',
      new.id,
      jsonb_build_object('user_id',new.user_id,'parcel_id',new.parcel_id,'tier',new.tier,'status',new.status)
    );
  end if;
  return new;
end;
$$;

drop trigger if exists admin_certificate_request_notification_trigger on public.certificate_requests;
create trigger admin_certificate_request_notification_trigger
after insert on public.certificate_requests
for each row execute function public.notify_admin_certificate_request();
