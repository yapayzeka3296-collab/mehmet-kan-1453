drop function if exists public.admin_search_users(text, integer, integer);

create function public.admin_search_users(
  p_query text,
  p_limit integer default 100,
  p_offset integer default 0
)
returns table(
  id uuid,
  email text,
  full_name text,
  role text,
  created_at timestamptz,
  is_active boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode = '42501';
  end if;

  return query
  select
    p.id::uuid,
    u.email::text,
    p.full_name::text,
    p.role::text,
    p.created_at::timestamptz,
    (u.banned_until is null or u.banned_until <= now()) as is_active
  from public.profiles p
  inner join auth.users u on u.id = p.id
  where coalesce(trim(p_query), '') = ''
     or lower(coalesce(u.email, '')) like '%' || lower(trim(p_query)) || '%'
     or lower(coalesce(p.full_name, '')) like '%' || lower(trim(p_query)) || '%'
  order by p.created_at desc
  limit least(greatest(coalesce(p_limit, 100), 1), 200)
  offset greatest(coalesce(p_offset, 0), 0);
end;
$$;

revoke execute on function public.admin_search_users(text, integer, integer) from anon, public;
grant execute on function public.admin_search_users(text, integer, integer) to authenticated;
