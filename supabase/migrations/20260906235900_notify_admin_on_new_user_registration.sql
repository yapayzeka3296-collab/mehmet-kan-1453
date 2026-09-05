-- Notify admins when a new Supabase Auth user is registered.
-- Keeps registration server-side and covers password/OAuth-created auth users.

create or replace function public.notify_admin_new_user_registration()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions, pg_temp
as $$
declare
  profile_name text;
  phone text;
  details text;
begin
  select coalesce(nullif(trim(full_name),''), nullif(trim(coalesce(new.raw_user_meta_data->>'full_name','')), ''))
    into profile_name
  from public.profiles
  where id = new.id;

  phone := coalesce(
    nullif(trim(coalesce(new.raw_user_meta_data->>'pending_phone','')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'phone','')), '')
  );

  details := format(
    'Yeni kullanıcı kaydı. Kullanıcı: %s | E-posta: %s | Telefon: %s | Kayıt tarihi: %s',
    coalesce(nullif(trim(profile_name),''),'Belirtilmemiş'),
    coalesce(nullif(trim(coalesce(new.email,'')),''),'Belirtilmemiş'),
    coalesce(phone,'Belirtilmemiş'),
    to_char(coalesce(new.created_at, now()) at time zone 'Europe/Istanbul','DD.MM.YYYY HH24:MI')
  );

  insert into public.admin_notifications(type,title,message,entity_id,metadata)
  values(
    'new_user',
    'Yeni kullanıcı kaydı',
    details,
    new.id,
    jsonb_build_object(
      'user_id', new.id,
      'user_email', new.email,
      'full_name', profile_name,
      'phone', phone,
      'created_at', new.created_at
    )
  );

  return new;
end;
$$;

revoke execute on function public.notify_admin_new_user_registration() from anon, authenticated, public;

drop trigger if exists on_auth_user_created_admin_notification on auth.users;
create trigger on_auth_user_created_admin_notification
after insert on auth.users
for each row
execute function public.notify_admin_new_user_registration();
