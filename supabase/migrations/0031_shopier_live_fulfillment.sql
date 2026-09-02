-- MySkyParcel: Shopier live payment fulfillment.
-- Server-only RPCs: authenticated checkout reservation + webhook fulfillment.

alter table public.shopier_checkout_intents add column if not exists order_ids uuid[] not null default '{}'::uuid[], add column if not exists shopier_product_id text, add column if not exists shopier_payment_id text;
create unique index if not exists shopier_checkout_intents_product_unique on public.shopier_checkout_intents(shopier_product_id) where shopier_product_id is not null;

create or replace function public.create_shopier_checkout_orders(p_parcel_ids uuid[])
returns setof public.orders language plpgsql security definer set search_path=public,pg_temp as $$
declare v_user_id uuid:=auth.uid(); v_id uuid; v_parcel public.parcels%rowtype; v_order public.orders%rowtype;
begin
  if v_user_id is null then raise exception 'unauthorized' using errcode='42501'; end if;
  if p_parcel_ids is null or coalesce(array_length(p_parcel_ids,1),0)=0 then raise exception 'empty_parcel_selection'; end if;
  if (select count(distinct x) from unnest(p_parcel_ids) t(x))>5000 then raise exception 'too_many_parcels'; end if;
  for v_id in select distinct x from unnest(p_parcel_ids) t(x) order by x loop
    select * into v_parcel from public.parcels where id=v_id for update;
    if not found then raise exception 'parcel_not_found'; end if;
    if v_parcel.status='reserved' and v_parcel.reserved_until is not null and v_parcel.reserved_until<=now() then
      update public.parcels set status='available',reserved_by=null,reserved_until=null,updated_at=now() where id=v_id;
      select * into v_parcel from public.parcels where id=v_id for update;
    end if;
    if v_parcel.status<>'available' or v_parcel.owner_id is not null then raise exception 'parcel_unavailable'; end if;
    if v_parcel.price is null or v_parcel.price<=0 then raise exception 'invalid_parcel_price'; end if;
    insert into public.orders(user_id,parcel_id,amount,currency,status) values(v_user_id,v_id,v_parcel.price,'TRY','pending') returning * into v_order;
    update public.parcels set status='reserved',reserved_by=v_user_id,reserved_until=now()+interval '15 minutes',updated_at=now() where id=v_id;
    return next v_order;
  end loop;
  return;
end;
$$;
revoke all on function public.create_shopier_checkout_orders(uuid[]) from public,anon;
grant execute on function public.create_shopier_checkout_orders(uuid[]) to authenticated;

create or replace function public.complete_shopier_checkout(p_intent_id uuid,p_shopier_order_id text,p_shopier_payment_id text,p_shopier_product_id text,p_amount numeric,p_currency text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_intent public.shopier_checkout_intents%rowtype; v_parcel_id uuid; v_parcel public.parcels%rowtype; v_order_id uuid; v_count integer; v_cert_tier text; v_holder_name text; v_city_name text; v_payment_id uuid;
begin
  select * into v_intent from public.shopier_checkout_intents where id=p_intent_id for update;
  if not found then raise exception 'shopier_intent_not_found'; end if;
  if v_intent.status='paid' then return jsonb_build_object('ok',true,'status','already_completed','intent_id',v_intent.id); end if;
  if v_intent.shopier_product_id is null or v_intent.shopier_product_id<>p_shopier_product_id then raise exception 'shopier_product_mismatch'; end if;
  if round(v_intent.amount,2)<>round(p_amount,2) then raise exception 'shopier_amount_mismatch'; end if;
  if upper(v_intent.currency)<>upper(coalesce(p_currency,'')) then raise exception 'shopier_currency_mismatch'; end if;
  if coalesce(array_length(v_intent.parcel_ids,1),0)=0 then raise exception 'empty_shopier_parcel_selection'; end if;
  select count(*) into v_count from public.parcels p where p.id=any(v_intent.parcel_ids) and p.status='reserved' and p.reserved_by=v_intent.user_id and p.reserved_until is not null and p.reserved_until>now();
  if v_count<>array_length(v_intent.parcel_ids,1) then raise exception 'shopier_reservation_expired'; end if;
  foreach v_parcel_id in array v_intent.parcel_ids loop
    select * into v_parcel from public.parcels where id=v_parcel_id for update;
    if v_parcel.status<>'reserved' or v_parcel.reserved_by<>v_intent.user_id or v_parcel.reserved_until<=now() then raise exception 'shopier_reservation_expired'; end if;
    update public.parcels set status='sold',owner_id=v_intent.user_id,reserved_by=null,reserved_until=null,updated_at=now() where id=v_parcel_id;
    insert into public.parcel_ownership_history(parcel_id,owner_id,acquisition_type) values(v_parcel_id,v_intent.user_id,'purchase');
  end loop;
  if coalesce(array_length(v_intent.order_ids,1),0)>0 then update public.orders set status='paid',provider='shopier',provider_reference=p_shopier_order_id||':'||id::text,updated_at=now() where id=any(v_intent.order_ids) and user_id=v_intent.user_id;
  elsif v_intent.order_id is not null then update public.orders set status='paid',provider='shopier',provider_reference=p_shopier_order_id||':'||v_intent.order_id::text,updated_at=now() where id=v_intent.order_id and user_id=v_intent.user_id; end if;
  if coalesce(array_length(v_intent.order_ids,1),0)>0 then
    foreach v_order_id in array v_intent.order_ids loop
      select id into v_payment_id from public.payments where order_id=v_order_id order by created_at desc limit 1;
      if v_payment_id is null then insert into public.payments(order_id,user_id,amount,currency,status,provider,provider_payment_id,paid_at) values(v_order_id,v_intent.user_id,(select amount from public.orders where id=v_order_id),'TRY','succeeded','shopier',coalesce(p_shopier_payment_id,p_shopier_order_id)||':'||v_order_id::text,now()) returning id into v_payment_id;
      else update public.payments set status='succeeded',provider='shopier',provider_payment_id=coalesce(p_shopier_payment_id,p_shopier_order_id)||':'||v_order_id::text,paid_at=coalesce(paid_at,now()),updated_at=now() where id=v_payment_id; end if;
    end loop;
  elsif v_intent.order_id is not null then
    select id into v_payment_id from public.payments where order_id=v_intent.order_id order by created_at desc limit 1;
    if v_payment_id is null then insert into public.payments(order_id,user_id,amount,currency,status,provider,provider_payment_id,paid_at) values(v_intent.order_id,v_intent.user_id,(select amount from public.orders where id=v_intent.order_id),'TRY','succeeded','shopier',coalesce(p_shopier_payment_id,p_shopier_order_id)||':'||v_intent.order_id::text,now()) returning id into v_payment_id;
    else update public.payments set status='succeeded',provider='shopier',provider_payment_id=coalesce(p_shopier_payment_id,p_shopier_order_id)||':'||v_intent.order_id::text,paid_at=coalesce(paid_at,now()),updated_at=now() where id=v_payment_id; end if;
  end if;
  if v_intent.certificate_parcel_id is not null then
    select p.tier,c.name into v_cert_tier,v_city_name from public.parcels p left join public.cities c on c.id=p.city_id where p.id=v_intent.certificate_parcel_id and p.owner_id=v_intent.user_id;
    if v_cert_tier is not null then select coalesce(nullif(full_name,''),email) into v_holder_name from public.profiles where id=v_intent.user_id;
      insert into public.certificate_requests(user_id,parcel_id,tier,status,holder_name_snapshot,city_name_snapshot,template_type,template_version,production_status) values(v_intent.user_id,v_intent.certificate_parcel_id,v_cert_tier,'requested',v_holder_name,v_city_name,v_cert_tier,v_cert_tier||'-v1','request_received') on conflict do nothing;
    end if;
  end if;
  insert into public.user_notifications(user_id,type,title,message) values(v_intent.user_id,'order','Siparişiniz tamamlandı','Shopier ödemeniz doğrulandı. Seçtiğiniz parseller hesabınıza tanımlandı ve sertifika süreci başlatıldı.');
  update public.shopier_checkout_intents set status='paid',shopier_order_id=p_shopier_order_id,shopier_payment_id=p_shopier_payment_id,updated_at=now() where id=v_intent.id;
  return jsonb_build_object('ok',true,'status','paid','intent_id',v_intent.id,'order_ids',v_intent.order_ids,'parcel_ids',v_intent.parcel_ids,'certificate_started',v_intent.certificate_parcel_id is not null);
exception when unique_violation then if exists(select 1 from public.shopier_checkout_intents where id=p_intent_id and status='paid') then return jsonb_build_object('ok',true,'status','already_completed','intent_id',p_intent_id); end if; raise; end;
$$;
revoke all on function public.complete_shopier_checkout(uuid,text,text,text,numeric,text) from public,anon,authenticated;
grant execute on function public.complete_shopier_checkout(uuid,text,text,text,numeric,text) to service_role;
