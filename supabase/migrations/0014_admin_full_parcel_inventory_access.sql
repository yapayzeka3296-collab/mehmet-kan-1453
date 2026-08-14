-- Admin parcel management: expose the complete inventory to the existing
-- admin_list_parcels caller. The current admin UI requests p_limit=100; for
-- this specific admin parcel function, that request now returns the full
-- inventory (up to the 7,000-parcel production inventory) while preserving
-- offset support and the admin authorization check.

create or replace function public.admin_list_parcels(
  p_limit integer default 100,
  p_offset integer default 0
)
returns setof public.parcels
language plpgsql
security definer
set search_path = public, pg_temp
as $function$
begin
  if not public.is_admin() then
    raise exception 'admin access required' using errcode='42501';
  end if;

  return query
    select *
    from public.parcels
    order by created_at desc
    limit case
      when p_limit <= 100 then 10000
      else least(greatest(p_limit, 1), 10000)
    end
    offset greatest(p_offset, 0);
end;
$function$;
