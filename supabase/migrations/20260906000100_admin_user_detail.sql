create or replace function public.admin_user_detail(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  actor uuid := auth.uid();
  u record;
  result jsonb;
begin
  if actor is null or not public.is_admin() then raise exception 'admin_required'; end if;
  select au.id, au.email, au.phone, au.created_at, au.last_sign_in_at, au.deleted_at, au.banned_until,
         au.raw_user_meta_data, p.full_name, p.role
    into u
    from auth.users au
    left join public.profiles p on p.id = au.id
   where au.id = p_user_id;
  if not found then raise exception 'user_not_found'; end if;
  select jsonb_build_object(
    'id', u.id,
    'full_name', coalesce(u.full_name, u.raw_user_meta_data->>'full_name'),
    'email', u.email,
    'phone', u.phone,
    'role', u.role,
    'created_at', u.created_at,
    'last_sign_in_at', u.last_sign_in_at,
    'deleted_at', u.deleted_at,
    'banned_until', u.banned_until,
    'address', coalesce(u.raw_user_meta_data->>'address', u.raw_user_meta_data->>'address_line', u.raw_user_meta_data->>'shipping_address_line'),
    'district', coalesce(u.raw_user_meta_data->>'district', u.raw_user_meta_data->>'shipping_district'),
    'city', coalesce(u.raw_user_meta_data->>'city', u.raw_user_meta_data->>'shipping_city'),
    'postal_code', coalesce(u.raw_user_meta_data->>'postal_code', u.raw_user_meta_data->>'shipping_postal_code'),
    'purchased_parcels', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'parcel_number', p.parcel_number, 'tier', p.tier, 'price', p.price, 'status', p.status, 'created_at', p.created_at) order by p.created_at desc) from public.parcels p where p.owner_id = u.id and p.status = 'sold'), '[]'::jsonb),
    'certificates', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'parcel_id', c.parcel_id, 'parcel_number', p.parcel_number, 'tier', c.tier, 'status', c.status, 'certificate_number', c.certificate_number, 'issued_at', c.issued_at) order by c.created_at desc) from public.certificate_requests c left join public.parcels p on p.id = c.parcel_id where c.user_id = u.id), '[]'::jsonb)
  ) into result;
  return result;
end;
$$;
revoke all on function public.admin_user_detail(uuid) from public, anon, authenticated;
grant execute on function public.admin_user_detail(uuid) to authenticated;
