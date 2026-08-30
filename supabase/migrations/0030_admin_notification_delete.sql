create or replace function public.admin_delete_notification(p_notification_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin yetkisi gerekli';
  end if;

  delete from public.admin_notifications
  where id = p_notification_id;

  return found;
end;
$$;

revoke all on function public.admin_delete_notification(uuid) from public;
grant execute on function public.admin_delete_notification(uuid) to authenticated;
