create or replace function public.notify_admin_new_user()
returns trigger
language plpgsql
security definer
set search_path = 'public', 'auth', 'extensions', 'pg_temp'
as $$
declare
  user_name text;
  user_phone text;
  provider_name text;
begin
  user_name := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
  user_phone := nullif(trim(coalesce(new.raw_user_meta_data ->> 'pending_phone', new.phone, '')), '');
  provider_name := nullif(trim(coalesce(new.raw_app_meta_data ->> 'provider', '')), '');

  insert into public.admin_notifications(type, title, message, entity_id, metadata)
  values (
    'new_user',
    'Yeni kullanıcı kaydı',
    'Yeni kullanıcı kayıt oldu.' || E'\n\n' ||
    'Ad Soyad: ' || coalesce(user_name, '—') || E'\n' ||
    'E-posta: ' || coalesce(nullif(trim(new.email), ''), '—') || E'\n' ||
    'Telefon: ' || coalesce(user_phone, '—') || E'\n' ||
    'Kullanıcı ID: ' || new.id::text || E'\n' ||
    'Kayıt zamanı: ' || to_char(new.created_at at time zone 'UTC', 'DD.MM.YYYY HH24:MI') || ' UTC',
    new.id,
    jsonb_build_object(
      'user_id', new.id,
      'user_email', new.email,
      'user_name', user_name,
      'user_phone', user_phone,
      'provider', provider_name,
      'created_at', new.created_at
    )
  );

  return new;
exception when others then
  raise warning 'notify_admin_new_user failed for user %: %', new.id, sqlerrm;
  return new;
end;
$$;

revoke all on function public.notify_admin_new_user() from public;

drop trigger if exists on_auth_user_created_admin_notification on auth.users;
create trigger on_auth_user_created_admin_notification
after insert on auth.users
for each row
execute function public.notify_admin_new_user();
