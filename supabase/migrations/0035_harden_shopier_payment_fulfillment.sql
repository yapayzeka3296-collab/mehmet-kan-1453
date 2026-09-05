-- Harden the Shopier payment -> fulfillment boundary.
-- Payment is considered final only after a signed Shopier webhook confirms
-- a paid + fulfilled order. This migration makes completion idempotent and
-- prevents a Shopier order from being attached to multiple checkout intents.

create unique index if not exists shopier_checkout_intents_shopier_order_unique
  on public.shopier_checkout_intents(shopier_order_id)
  where shopier_order_id is not null;

create or replace function public.complete_shopier_checkout(
  p_intent_id uuid,
  p_shopier_order_id text,
  p_shopier_payment_id text,
  p_shopier_product_id text,
  p_amount numeric,
  p_currency text
)
returns jsonb
language plpgsql
security definer
set search_path=''
as $$
declare
  v_intent public.shopier_checkout_intents%rowtype;
  v_count integer;
  v_holder_name text;
  v_city_name text;
  v_tier text;
begin
  if nullif(trim(coalesce(p_shopier_order_id,'')), '') is null then
    raise exception 'shopier_order_id_required';
  end if;
  if nullif(trim(coalesce(p_shopier_product_id,'')), '') is null then
    raise exception 'shopier_product_id_required';
  end if;
  if round(coalesce(p_amount,0),2) <= 0 then
    raise exception 'shopier_amount_invalid';
  end if;
  if upper(coalesce(p_currency,'')) <> 'TRY' then
    raise exception 'shopier_currency_mismatch';
  end if;

  select * into v_intent
  from public.shopier_checkout_intents
  where id=p_intent_id
  for update;

  if not found then
    raise exception 'shopier_intent_not_found';
  end if;

  if v_intent.status='paid' then
    if coalesce(v_intent.shopier_order_id,'') <> p_shopier_order_id then
      raise exception 'shopier_order_mismatch';
    end if;
    return jsonb_build_object(
      'ok',true,
      'status','already_completed',
      'intent_id',v_intent.id,
      'order_ids',v_intent.order_ids,
      'parcel_ids',v_intent.parcel_ids
    );
  end if;

  if v_intent.status not in ('pending','redirected') then
    raise exception 'shopier_intent_not_active';
  end if;

  if v_intent.shopier_product_id is null or v_intent.shopier_product_id<>p_shopier_product_id then
    raise exception 'shopier_product_mismatch';
  end if;

  if round(v_intent.amount,2)<>round(p_amount,2) then
    raise exception 'shopier_amount_mismatch';
  end if;

  if upper(v_intent.currency)<>upper(p_currency) then
    raise exception 'shopier_currency_mismatch';
  end if;

  -- A valid signed Shopier payment may arrive after the short checkout URL
  -- reservation window. The parcel is still safe to fulfill only while it is
  -- physically reserved by the same user and has not been sold/reassigned.
  -- We deliberately do NOT require reserved_until > now() here. If another
  -- checkout had reclaimed the parcel, its status would no longer match this
  -- user's reservation and this transaction would fail safely.
  select count(*) into v_count
  from public.parcels p
  where p.id=any(v_intent.parcel_ids)
    and p.status='reserved'
    and p.reserved_by=v_intent.user_id
    and p.owner_id is null;

  if v_count<>array_length(v_intent.parcel_ids,1) then
    raise exception 'shopier_reservation_lost';
  end if;

  update public.parcels
  set status='sold',
      owner_id=v_intent.user_id,
      reserved_by=null,
      reserved_until=null,
      updated_at=now()
  where id=any(v_intent.parcel_ids)
    and status='reserved'
    and reserved_by=v_intent.user_id
    and owner_id is null;

  if not found then
    raise exception 'shopier_reservation_lost';
  end if;

  insert into public.parcel_ownership_history(parcel_id,owner_id,acquisition_type)
  select x,v_intent.user_id,'purchase'
  from unnest(v_intent.parcel_ids) t(x);

  update public.orders
  set status='paid',
      provider='shopier',
      provider_reference=p_shopier_order_id
  where id=any(v_intent.order_ids)
    and user_id=v_intent.user_id
    and status='pending';

  if v_intent.certificate_parcel_id is not null then
    select p.tier,c.name
      into v_tier,v_city_name
    from public.parcels p
    left join public.cities c on c.id=p.city_id
    where p.id=v_intent.certificate_parcel_id
      and p.owner_id=v_intent.user_id;

    if v_tier is not null then
      select coalesce(nullif(full_name,''),email)
        into v_holder_name
      from public.profiles
      where id=v_intent.user_id;

      insert into public.certificate_requests(
        user_id,parcel_id,tier,status,holder_name_snapshot,city_name_snapshot,
        template_type,template_version,production_status
      )
      values(
        v_intent.user_id,v_intent.certificate_parcel_id,v_tier,'requested',
        v_holder_name,v_city_name,v_tier,v_tier||'-v1','request_received'
      )
      on conflict do nothing;
    end if;
  end if;

  insert into public.user_notifications(user_id,type,title,message)
  values(
    v_intent.user_id,
    'order',
    'Siparişiniz tamamlandı',
    'Shopier ödemeniz doğrulandı. Seçtiğiniz parseller hesabınıza tanımlandı ve sertifika süreci başlatıldı.'
  );

  update public.shopier_checkout_intents
  set status='paid',
      shopier_order_id=p_shopier_order_id,
      shopier_payment_id=p_shopier_payment_id,
      updated_at=now()
  where id=v_intent.id;

  return jsonb_build_object(
    'ok',true,
    'status','paid',
    'intent_id',v_intent.id,
    'order_ids',v_intent.order_ids,
    'parcel_ids',v_intent.parcel_ids,
    'certificate_started',v_intent.certificate_parcel_id is not null
  );
end;
$$;

revoke all on function public.complete_shopier_checkout(uuid,text,text,text,numeric,text) from public,anon,authenticated;
grant execute on function public.complete_shopier_checkout(uuid,text,text,text,numeric,text) to service_role;
