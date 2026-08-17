-- Allow new users to create a MySkyParcel account with Google OAuth.
-- Apple remains restricted to existing MySkyParcel accounts.
-- The existing auth hook is kept in place so the provider policy can be
-- changed without changing the Auth hook configuration in Supabase.

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

  -- Normal email/password registration and Google OAuth are allowed.
  if provider not in ('google', 'apple') then
    return '{}'::jsonb;
  end if;

  if provider = 'google' then
    if requested_email = '' then
      return jsonb_build_object(
        'error', jsonb_build_object(
          'http_code', 400,
          'message', 'Google hesabınızda doğrulanmış bir e-posta adresi bulunamadı.'
        )
      );
    end if;

    return '{}'::jsonb;
  end if;

  -- Keep Apple restricted to existing MySkyParcel accounts.
  if requested_email = '' then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 400,
        'message', 'Apple hesabınızda doğrulanmış bir e-posta adresi bulunamadı.'
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
      'message', 'Bu Apple hesabı MySkyParcel hesabına kayıtlı değil. Önce MySkyParcel''a e-posta ve şifre ile kayıt olun.'
    )
  );
end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.hook_restrict_new_oauth_users(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_restrict_new_oauth_users(jsonb) from anon, authenticated, public;
