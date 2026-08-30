-- Admin parcel search, purchase, inventory and release.
-- Keeps parcel ownership mutations behind admin-only SECURITY DEFINER RPCs.

create or replace function public.admin_list_parcels(p_limit integer default 100,p_offset integer default 0)
returns setof public.parcels
language plpgsql security definer set search_path=public,pg_temp
as $$
begin
  if not public.is_admin() then raise exception 'admin access required' using errcode='42501'; end if;
  return query select p.* from public.parcels p where p.status='sold' and p.owner_id is not null order by p.updated_at desc limit least(greatest(coalesce(p_limit,100),1),10000) offset greatest(coalesce(p_offset,0),0);
end;
$$;

create or replace function public.admin_search_parcels(p_city_slug text default null,p_query text default null,p_only_sold boolean default false)
returns table(parcel_id uuid,parcel_number text,status text,owner_id uuid,owner_name text,tier text,price numeric,city_slug text,city_name text)
language plpgsql security definer set search_path=public,auth
as $$
begin
  if not public.is_admin() then raise exception 'admin access required' using errcode='42501'; end if;
  return query select p.id,p.parcel_number,p.status,p.owner_id,coalesce(pr.full_name,''),p.tier,p.price,c.slug,c.name
  from public.parcels p left join public.cities c on c.id=p.city_id left join public.profiles pr on pr.id=p.owner_id
  where (p_only_sold = false or (p.status='sold' and p.owner_id is not null))
    and (nullif(trim(coalesce(p_city_slug,'')),'') is null or lower(c.slug)=lower(trim(p_city_slug)) or lower(c.name)=lower(trim(p_city_slug)) or upper(c.code)=upper(trim(p_city_slug)))
    and (nullif(trim(coalesce(p_query,'')),'') is null or p.parcel_number ilike '%'||trim(p_query)||'%')
  order by p.parcel_number limit 100;
end;
$$;

create function public.admin_purchase_parcel(p_parcel_id uuid)
returns public.parcels language plpgsql security definer set search_path=public,pg_temp
as $$
declare actor uuid:=auth.uid(); r public.parcels%rowtype;
begin
  if not public.is_admin() then raise exception 'admin access required' using errcode='42501'; end if;
  select * into r from public.parcels where id=p_parcel_id for update;
  if not found then raise exception 'parcel not found'; end if;
  if r.status<>'available' or r.owner_id is not null then raise exception 'parcel is not available'; end if;
  update public.parcels set status='sold',owner_id=actor,reserved_by=null,reserved_until=null,updated_at=now() where id=r.id returning * into r;
  insert into public.parcel_ownership_history(parcel_id,owner_id,acquisition_type) values(r.id,actor,'purchase');
  perform public.admin_write_audit('parcel',r.id,'admin_purchase_parcel',jsonb_build_object('parcel_id',r.id,'admin_owner_id',actor));
  return r;
end;
$$;

create function public.admin_release_parcel(p_parcel_id uuid)
returns public.parcels language plpgsql security definer set search_path=public,pg_temp
as $$
declare actor uuid:=auth.uid(); r public.parcels%rowtype;
begin
  if not public.is_admin() then raise exception 'admin access required' using errcode='42501'; end if;
  select * into r from public.parcels where id=p_parcel_id for update;
  if not found then raise exception 'parcel not found'; end if;
  if r.status<>'sold' or r.owner_id is distinct from actor then raise exception 'parcel is not owned by this admin'; end if;
  update public.parcel_ownership_history set released_at=now() where parcel_id=r.id and owner_id=actor and released_at is null;
  update public.parcels set status='available',owner_id=null,reserved_by=null,reserved_until=null,updated_at=now() where id=r.id returning * into r;
  perform public.admin_write_audit('parcel',r.id,'admin_release_parcel',jsonb_build_object('parcel_id',r.id,'admin_owner_id',actor));
  return r;
end;
$$;

revoke all on function public.admin_list_parcels(integer,integer) from public,anon;
grant execute on function public.admin_list_parcels(integer,integer) to authenticated;
revoke all on function public.admin_search_parcels(text,text,boolean) from public,anon;
grant execute on function public.admin_search_parcels(text,text,boolean) to authenticated;
revoke all on function public.admin_purchase_parcel(uuid) from public,anon;
grant execute on function public.admin_purchase_parcel(uuid) to authenticated;
revoke all on function public.admin_release_parcel(uuid) from public,anon;
grant execute on function public.admin_release_parcel(uuid) to authenticated;
