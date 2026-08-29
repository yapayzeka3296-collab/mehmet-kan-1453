-- Restore the authenticated admin dashboard read/update path.
-- The notification rows are already being created by the physical-certificate trigger;
-- this migration only restores access for verified admins.
alter table public.admin_notifications enable row level security;
drop policy if exists "admins read admin notifications" on public.admin_notifications;
drop policy if exists "admins update admin notifications" on public.admin_notifications;
create policy "admins read admin notifications" on public.admin_notifications
  for select to authenticated
  using (public.is_admin());
create policy "admins update admin notifications" on public.admin_notifications
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select, update on table public.admin_notifications to authenticated;
