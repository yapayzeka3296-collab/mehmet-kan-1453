-- Prevent Google/Apple OAuth from creating a brand-new MySkyParcel account.
-- Existing email/password users remain allowed to use OAuth when the
-- provider email matches an existing auth.users record.

create or replace function public.hook_restrict_new_oauth_users(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  provider text;
  requested_email text;
  existing_user boolean;
begin
  provider := lower(coalesce(event->'user'->'app_metadata'->>'provider', ''));
  requested_email := lower(trim(coalesce(event->'user'->>'email', '')));

  -- Normal email/password registration is not restricted by this hook.
  if provider not in ('google', 'apple') then
    return '{}'::jsonb;
  end if;

  if requested_email = '' then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 400,
        'message', 'Google/Apple hesabınızda doğrulanmış bir e-posta adresi bulunamadı.'
      )
    );
  end if;

  select exists (
    select 1
    from auth.users u
    where lower(u.email) = requested_email
  ) into existing_user;

  if existing_user then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'Bu Google/Apple hesabı MySkyParcel hesabına kayıtlı değil. Önce MySkyParcel''a e-posta ve şifre ile kayıt olun.'
    )
  );
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.hook_restrict_new_oauth_users(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_restrict_new_oauth_users(jsonb) from anon, authenticated, public;
