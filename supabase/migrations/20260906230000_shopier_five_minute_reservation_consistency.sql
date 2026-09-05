-- Keep parcel reservations and Shopier checkout intents on one five-minute lifecycle.
-- Unpaid checkout state is expired/cancelled; paid history is preserved.

alter table public.shopier_checkout_intents
  alter column expires_at set default (now() + interval '5 minutes');

create or replace function public.create_shopier_checkout_intent(
  p_parcel_ids uuid[],
  p_certificate_parcel_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path to ''
as $function$
declare
  v_user_id uuid := (select auth.uid());
  v_id uuid; v_id2 uuid;
  v_parcel public.parcels%rowtype; v_order public.orders%rowtype;
  v_orders uuid[] := '{}'; v_parcels uuid[] := '{}';
  v_total numeric(12,2) := 0; v_first uuid; v_certificate uuid;
  v_existing public.shopier_checkout_intents%rowtype;
  v_requested uuid[] := (select array_agg(distinct x order by x) from unnest(p_parcel_ids) t(x));
begin
  if v_user_id is null then raise exception 'unauthorized' using errcode='42501'; end if;
  if coalesce(array_length(p_parcel_ids,1),0)=0 then raise exception 'empty_parcel_selection'; end if;
  if (select count(distinct x) from unnest(p_parcel_ids) t(x)) > 100 then raise exception 'too_many_parcels'; end if;

  update public.parcels
  set status='available', reserved_by=null, reserved_until=null, updated_at=now()
  where status='reserved' and reserved_until is not null and reserved_until<=now() and owner_id is null;

  update public.orders o
  set status='cancelled', updated_at=now()
  where o.status='pending'
    and exists (
      select 1 from public.shopier_checkout_intents i
      where o.id=any(i.order_ids) and i.status in ('pending','redirected')
        and (i.expires_at<=now() or exists (
          select 1 from unnest(i.parcel_ids) t(parcel_id)
          where not exists (
            select 1 from public.parcels p
            where p.id=t.parcel_id and p.status='reserved' and p.reserved_by=i.user_id
              and p.owner_id is null and p.reserved_until>now()
          )
        ))
    );

  update public.shopier_checkout_intents i
  set status='expired', updated_at=now()
  where i.status in ('pending','redirected')
    and (i.expires_at<=now() or exists (
      select 1 from unnest(i.parcel_ids) t(parcel_id)
      where not exists (
        select 1 from public.parcels p
        where p.id=t.parcel_id and p.status='reserved' and p.reserved_by=i.user_id
          and p.owner_id is null and p.reserved_until>now()
      )
    ));

  select * into v_existing
  from public.shopier_checkout_intents i
  where i.user_id=v_user_id and i.status in ('pending','redirected') and i.expires_at>now()
    and i.parcel_ids@>v_requested and i.parcel_ids<v_requested
    and not exists (
      select 1 from unnest(i.parcel_ids) t(parcel_id)
      where not exists (
        select 1 from public.parcels p
        where p.id=t.parcel_id and p.status='reserved' and p.reserved_by=v_user_id
          and p.owner_id is null and p.reserved_until>now()
      )
    )
  order by i.created_at desc limit 1;

  if v_existing.id is not null then
    v_certificate:=coalesce(p_certificate_parcel_id,v_existing.certificate_parcel_id);
    if v_certificate is null or not (v_certificate=any(v_existing.parcel_ids)) then raise exception 'invalid_certificate_parcel'; end if;
    return jsonb_build_object('ok',true,'intent_id',v_existing.id,'order_ids',v_existing.order_ids,
      'parcel_ids',v_existing.parcel_ids,'certificate_parcel_id',v_certificate,'amount',v_existing.amount,
      'currency',v_existing.currency,'expires_at',v_existing.expires_at,'reused',true);
  end if;

  for v_id2 in select unnest(v_requested) loop
    select * into v_parcel from public.parcels where id=v_id2 for update;
    if not found then raise exception 'parcel_not_found'; end if;
    if v_parcel.status='reserved' and v_parcel.reserved_by is not null and v_parcel.reserved_by<>v_user_id then raise exception 'parcel_reserved_by_other_user'; end if;
    if v_parcel.status<>'available' or v_parcel.owner_id is not null then raise exception 'parcel_unavailable'; end if;
    if coalesce(v_parcel.price,0)<=0 then raise exception 'invalid_parcel_price'; end if;

    insert into public.orders(user_id,parcel_id,amount,currency,status)
    values(v_user_id,v_id2,v_parcel.price,'TRY','pending') returning * into v_order;
    update public.parcels set status='reserved',reserved_by=v_user_id,reserved_until=now()+interval '5 minutes',updated_at=now() where id=v_id2;
    v_orders:=array_append(v_orders,v_order.id); v_parcels:=array_append(v_parcels,v_id2);
    v_total:=v_total+v_order.amount; if v_first is null then v_first:=v_id2; end if;
  end loop;

  v_certificate:=coalesce(p_certificate_parcel_id,v_first);
  if not (v_certificate=any(v_parcels)) then raise exception 'invalid_certificate_parcel'; end if;

  insert into public.shopier_checkout_intents(user_id,parcel_id,parcel_ids,order_ids,amount,currency,certificate_parcel_id,expires_at)
  values(v_user_id,v_first,v_parcels,v_orders,v_total,'TRY',v_certificate,now()+interval '5 minutes')
  returning id into v_id;

  return jsonb_build_object('ok',true,'intent_id',v_id,'order_ids',v_orders,'parcel_ids',v_parcels,
    'certificate_parcel_id',v_certificate,'amount',v_total,'currency','TRY','expires_at',now()+interval '5 minutes');
end;
$function$;

create or replace function public.cleanup_expired_shopier_checkout_state()
returns integer language plpgsql security definer set search_path to '' as $function$
declare v_released integer:=0;
begin
  update public.parcels set status='available',reserved_by=null,reserved_until=null,updated_at=now()
  where status='reserved' and reserved_until is not null and reserved_until<=now() and owner_id is null;
  get diagnostics v_released=row_count;

  update public.orders o set status='cancelled',updated_at=now()
  where o.status='pending' and exists (
    select 1 from public.shopier_checkout_intents i
    where o.id=any(i.order_ids) and i.status in ('pending','redirected') and i.expires_at<=now()
  );

  update public.shopier_checkout_intents set status='expired',updated_at=now()
  where status in ('pending','redirected') and expires_at<=now();
  return v_released;
end;
$function$;

create or replace function public.cleanup_expired_shopier_reservations()
returns void language plpgsql security definer set search_path to 'public','pg_catalog' as $function$
begin
  perform public.cleanup_expired_shopier_checkout_state();
end;
$function$;
