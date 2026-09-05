-- Make Shopier checkout retries idempotent while the same user's parcel reservation is active.
-- A failed/expired Shopier page must not make the user's still-reserved parcel appear unavailable.

create or replace function public.create_shopier_checkout_intent(p_parcel_ids uuid[], p_certificate_parcel_id uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_user_id uuid := (select auth.uid());
  v_id uuid; v_id2 uuid; v_parcel public.parcels%rowtype; v_order public.orders%rowtype;
  v_orders uuid[] := '{}'; v_parcels uuid[] := '{}'; v_total numeric(12,2) := 0; v_first uuid; v_certificate uuid;
  v_existing public.shopier_checkout_intents%rowtype;
begin
  if v_user_id is null then raise exception 'unauthorized' using errcode='42501'; end if;
  if coalesce(array_length(p_parcel_ids,1),0)=0 then raise exception 'empty_parcel_selection'; end if;
  if (select count(distinct x) from unnest(p_parcel_ids) t(x)) > 100 then raise exception 'too_many_parcels'; end if;

  -- Reuse the same user's active intent on checkout retry. This is important
  -- when Shopier rejects the hosted product page after the reservation was made.
  select * into v_existing
  from public.shopier_checkout_intents i
  where i.user_id = v_user_id
    and i.status in ('pending','redirected')
    and i.expires_at > now()
    and i.parcel_ids @> (select array_agg(distinct x order by x) from unnest(p_parcel_ids) t(x))
    and i.parcel_ids <@ (select array_agg(distinct x order by x) from unnest(p_parcel_ids) t(x))
  order by i.created_at desc
  limit 1;

  if v_existing.id is not null then
    v_certificate := coalesce(p_certificate_parcel_id, v_existing.certificate_parcel_id);
    if v_certificate is null or not (v_certificate = any(v_existing.parcel_ids)) then
      raise exception 'invalid_certificate_parcel';
    end if;
    return jsonb_build_object(
      'ok', true,
      'intent_id', v_existing.id,
      'order_ids', v_existing.order_ids,
      'parcel_ids', v_existing.parcel_ids,
      'certificate_parcel_id', v_certificate,
      'amount', v_existing.amount,
      'currency', v_existing.currency,
      'expires_at', v_existing.expires_at,
      'reused', true
    );
  end if;

  for v_id2 in select distinct x from unnest(p_parcel_ids) t(x) order by x loop
    select * into v_parcel from public.parcels where id=v_id2 for update;
    if not found then raise exception 'parcel_not_found'; end if;
    if v_parcel.status='reserved' and v_parcel.reserved_until is not null and v_parcel.reserved_until<=now() then
      update public.parcels set status='available',reserved_by=null,reserved_until=null,updated_at=now() where id=v_id2;
      select * into v_parcel from public.parcels where id=v_id2 for update;
    end if;
    if v_parcel.status<>'available' or v_parcel.owner_id is not null then raise exception 'parcel_unavailable'; end if;
    if coalesce(v_parcel.price,0)<=0 then raise exception 'invalid_parcel_price'; end if;
    insert into public.orders(user_id,parcel_id,amount,currency,status) values(v_user_id,v_id2,v_parcel.price,'TRY','pending') returning * into v_order;
    update public.parcels set status='reserved',reserved_by=v_user_id,reserved_until=now()+interval '15 minutes',updated_at=now() where id=v_id2;
    v_orders := array_append(v_orders,v_order.id); v_parcels := array_append(v_parcels,v_id2); v_total := v_total + v_order.amount; if v_first is null then v_first:=v_id2; end if;
  end loop;
  v_certificate := coalesce(p_certificate_parcel_id,v_first);
  if not (v_certificate = any(v_parcels)) then raise exception 'invalid_certificate_parcel'; end if;
  insert into public.shopier_checkout_intents(user_id,parcel_id,parcel_ids,order_ids,amount,currency,certificate_parcel_id)
  values(v_user_id,v_first,v_parcels,v_orders,v_total,'TRY',v_certificate) returning id into v_id;
  return jsonb_build_object('ok',true,'intent_id',v_id,'order_ids',v_orders,'parcel_ids',v_parcels,'certificate_parcel_id',v_certificate,'amount',v_total,'currency','TRY','expires_at',now()+interval '15 minutes');
end;
$$;
