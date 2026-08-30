-- Allow the admin parcel search to search the full parcel inventory.
-- p_only_sold=true keeps the existing sold-only mode; false now means all parcels.
-- Admin authorization remains enforced server-side by public.is_admin().

create or replace function public.admin_search_parcels(
  p_city_slug text default null,
  p_query text default null,
  p_only_sold boolean default false
)
returns table(
  parcel_id uuid,
  parcel_number text,
  status text,
  owner_id uuid,
  owner_name text,
  tier text,
  price numeric,
  city_slug text,
  city_name text
)
language plpgsql
security definer
set search_path=public,auth
as $$
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode='42501';
  end if;

  return query
    select
      p.id,
      p.parcel_number,
      p.status,
      p.owner_id,
      coalesce(pr.full_name,''),
      p.tier,
      p.price,
      c.slug,
      c.name
    from public.parcels p
    left join public.cities c on c.id=p.city_id
    left join public.profiles pr on pr.id=p.owner_id
    where
      (not p_only_sold or (p.status='sold' and p.owner_id is not null))
      and (
        nullif(trim(coalesce(p_city_slug,'')),'') is null
        or lower(c.slug)=lower(trim(p_city_slug))
        or lower(c.name)=lower(trim(p_city_slug))
        or upper(c.code)=upper(trim(p_city_slug))
      )
      and (
        nullif(trim(coalesce(p_query,'')),'') is null
        or p.parcel_number ilike '%'||trim(p_query)||'%'
      )
    order by p.parcel_number
    limit 100;
end;
$$;

revoke all on function public.admin_search_parcels(text,text,boolean) from public,anon;
grant execute on function public.admin_search_parcels(text,text,boolean) to authenticated;