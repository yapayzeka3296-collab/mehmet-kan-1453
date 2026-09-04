-- Restore the Shopier checkout domain after the legacy payment subsystem was removed.
-- This migration intentionally keeps payment credentials out of the database and browser.

create table if not exists public.shopier_checkout_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parcel_id uuid not null references public.parcels(id) on delete restrict,
  parcel_ids uuid[] not null default '{}',
  order_id uuid,
  order_ids uuid[] not null default '{}',
  certificate_parcel_id uuid references public.parcels(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'TRY',
  status text not null default 'pending' check (status in ('pending','redirected','paid','cancelled','expired','failed')),
  shopier_product_id text,
  shopier_order_id text,
  shopier_payment_id text,
  checkout_url text,
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shopier_checkout_intents_user_idx on public.shopier_checkout_intents(user_id, created_at desc);
create index if not exists shopier_checkout_intents_order_idx on public.shopier_checkout_intents(shopier_order_id) where shopier_order_id is not null;
create unique index if not exists shopier_checkout_intents_active_parcel_idx on public.shopier_checkout_intents(parcel_id) where status in ('pending','redirected');

create table if not exists public.shopier_webhook_events (
  id uuid primary key default gen_random_uuid(),
  event_id text,
  event_type text,
  shopier_order_id text,
  signature_valid boolean not null default false,
  payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_status text not null default 'received' check (processing_status in ('received','processed','ignored','failed')),
  processing_error text
);
create unique index if not exists shopier_webhook_events_event_id_idx on public.shopier_webhook_events(event_id) where event_id is not null;
create index if not exists shopier_webhook_events_order_idx on public.shopier_webhook_events(shopier_order_id) where shopier_order_id is not null;

alter table public.shopier_checkout_intents enable row level security;
alter table public.shopier_webhook_events enable row level security;
drop policy if exists "users can view their Shopier checkout intents" on public.shopier_checkout_intents;
create policy "users can view their Shopier checkout intents" on public.shopier_checkout_intents for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.shopier_checkout_intents from anon, authenticated;
grant select on public.shopier_checkout_intents to authenticated;
revoke all on public.shopier_webhook_events from anon, authenticated;

create or replace function public.create_shopier_checkout_intent(p_parcel_ids uuid[], p_certificate_parcel_id uuid default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_user_id uuid := (select auth.uid()); v_id uuid; v_id2 uuid; v_parcel public.parcels%rowtype; v_order public.orders%rowtype; v_orders uuid[] := '{}'; v_parcels uuid[] := '{}'; v_total numeric(12,2) := 0; v_first uuid; v_certificate uuid;
begin
  if v_user_id is null then raise exception 'unauthorized' using errcode='42501'; end if;
  if coalesce(array_length(p_parcel_ids,1),0)=0 then raise exception 'empty_parcel_selection'; end if;
  if (select count(distinct x) from unnest(p_parcel_ids) t(x)) > 100 then raise exception 'too_many_parcels'; end if;
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
revoke all on function public.create_shopier_checkout_intent(uuid[],uuid) from public,anon;
grant execute on function public.create_shopier_checkout_intent(uuid[],uuid) to authenticated;

create or replace function public.complete_shopier_checkout(p_intent_id uuid,p_shopier_order_id text,p_shopier_payment_id text,p_shopier_product_id text,p_amount numeric,p_currency text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_intent public.shopier_checkout_intents%rowtype; v_count integer; v_holder_name text; v_city_name text; v_tier text;
begin
  select * into v_intent from public.shopier_checkout_intents where id=p_intent_id for update;
  if not found then raise exception 'shopier_intent_not_found'; end if;
  if v_intent.status='paid' then return jsonb_build_object('ok',true,'status','already_completed','intent_id',v_intent.id); end if;
  if v_intent.shopier_product_id is not null and v_intent.shopier_product_id<>p_shopier_product_id then raise exception 'shopier_product_mismatch'; end if;
  if round(v_intent.amount,2)<>round(p_amount,2) then raise exception 'shopier_amount_mismatch'; end if;
  if upper(v_intent.currency)<>upper(coalesce(p_currency,'')) then raise exception 'shopier_currency_mismatch'; end if;
  select count(*) into v_count from public.parcels p where p.id=any(v_intent.parcel_ids) and p.status='reserved' and p.reserved_by=v_intent.user_id and p.reserved_until>now();
  if v_count<>array_length(v_intent.parcel_ids,1) then raise exception 'shopier_reservation_expired'; end if;
  update public.parcels set status='sold',owner_id=v_intent.user_id,reserved_by=null,reserved_until=null,updated_at=now() where id=any(v_intent.parcel_ids);
  insert into public.parcel_ownership_history(parcel_id,owner_id,acquisition_type) select x,v_intent.user_id,'purchase' from unnest(v_intent.parcel_ids) t(x);
  update public.orders set status='paid',provider='shopier',provider_reference=coalesce(p_shopier_order_id,'') where id=any(v_intent.order_ids) and user_id=v_intent.user_id;
  if v_intent.certificate_parcel_id is not null then
    select p.tier,c.name into v_tier,v_city_name from public.parcels p left join public.cities c on c.id=p.city_id where p.id=v_intent.certificate_parcel_id and p.owner_id=v_intent.user_id;
    if v_tier is not null then
      select coalesce(nullif(full_name,''),email) into v_holder_name from public.profiles where id=v_intent.user_id;
      insert into public.certificate_requests(user_id,parcel_id,tier,status,holder_name_snapshot,city_name_snapshot,template_type,template_version,production_status) values(v_intent.user_id,v_intent.certificate_parcel_id,v_tier,'requested',v_holder_name,v_city_name,v_tier,v_tier||'-v1','request_received') on conflict do nothing;
    end if;
  end if;
  insert into public.user_notifications(user_id,type,title,message) values(v_intent.user_id,'order','Siparişiniz tamamlandı','Shopier ödemeniz doğrulandı. Seçtiğiniz parseller hesabınıza tanımlandı ve sertifika süreci başlatıldı.');
  update public.shopier_checkout_intents set status='paid',shopier_order_id=p_shopier_order_id,shopier_payment_id=p_shopier_payment_id,updated_at=now() where id=v_intent.id;
  return jsonb_build_object('ok',true,'status','paid','intent_id',v_intent.id,'order_ids',v_intent.order_ids,'parcel_ids',v_intent.parcel_ids,'certificate_started',v_intent.certificate_parcel_id is not null);
end;
$$;
revoke all on function public.complete_shopier_checkout(uuid,text,text,text,numeric,text) from public,anon,authenticated;
grant execute on function public.complete_shopier_checkout(uuid,text,text,text,numeric,text) to service_role;
