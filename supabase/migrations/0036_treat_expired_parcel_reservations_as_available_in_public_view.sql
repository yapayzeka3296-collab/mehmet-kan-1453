create or replace view public.parcel_map_public as
select
  p.id,
  p.parcel_number,
  case
    when p.status = 'reserved' and p.reserved_until is not null and p.reserved_until <= now() then 'available'
    else p.status
  end as status,
  p.price,
  p.tier,
  case p.tier
    when 'digital' then 149::numeric
    when 'elite' then 349::numeric
    when 'premium' then 699::numeric
    else p.price + 0::numeric
  end as tier_price,
  p.city_id,
  case c.slug
    when 'istanbul' then 'IST'
    when 'ankara' then 'ANK'
    when 'izmir' then 'IZM'
    when 'bursa' then 'BUR'
    when 'antalya' then 'ANT'
    when 'kayseri' then 'KAY'
    when 'gaziantep' then 'GZT'
    else upper(left(regexp_replace(coalesce(c.slug, ''), '[^a-z0-9]', '', 'gi'), 3))
  end as city_code,
  c.name as city_name,
  c.slug as city_slug,
  ((row_number() over (partition by p.city_id order by p.parcel_number) - 1) / 100 + 1)::smallint as layer_number,
  ((row_number() over (partition by p.city_id order by p.parcel_number) - 1) % 100::bigint + 1)::smallint as sector_number,
  1 as local_parcel_number,
  p.grid_x,
  p.grid_y,
  p.latitude,
  p.longitude,
  case when p.geometry is not null then st_asgeojson(p.geometry)::jsonb else null::jsonb end as geometry,
  p.created_at,
  p.updated_at
from public.parcels p
left join public.cities c on c.id = p.city_id;