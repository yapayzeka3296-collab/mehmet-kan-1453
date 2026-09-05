-- MySkyParcel: automatically reconcile signed Shopier paid/fulfilled webhooks.
-- Some Shopier webhook payloads may contain a product id that differs from the
-- locally stored product id. The product title still carries the checkout
-- intent reference (Shopier may truncate the UUID suffix), so reconcile by
-- the stable UUID prefix, amount and TRY currency after signature validation.

create or replace function public.reconcile_shopier_paid_webhooks()
returns void
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  e record;
  v_intent public.shopier_checkout_intents%rowtype;
  v_title text;
  v_intent_prefix text;
  v_amount numeric;
  v_order_id text;
  v_payment_id text;
  v_count integer;
  v_tier text;
  v_city_name text;
  v_holder_name text;
begin
  for e in
    select id, payload
    from public.shopier_webhook_events
    where event_type='order.fulfilled'
      and signature_valid=true
      and processing_status='failed'
      and coalesce(payload->>'status','')='fulfilled'
      and coalesce(payload->>'paymentStatus','')='paid'
    order by received_at asc
    limit 50
  loop
    v_title := coalesce(e.payload->'lineItems'->0->>'title','');
    v_intent_prefix := substring(v_title from 'MySkyParcel Parsel Siparişi ([0-9a-fA-F-]+)');
    if v_intent_prefix is null or length(v_intent_prefix) < 8 then
      continue;
    end if;

    select * into v_intent
    from public.shopier_checkout_intents
    where id::text like v_intent_prefix || '%'
    order by created_at desc
    limit 1
    for update;

    if not found then
      continue;
    end if;

    v_amount := round(coalesce((e.payload->'totals'->>'total')::numeric,0),2);
    v_order_id := coalesce(e.payload->>'id','');
    v_payment_id := coalesce(e.payload->>'paymentId','');

    if v_amount <= 0
       or upper(coalesce(e.payload->>'currency','')) <> 'TRY'
       or v_amount <> round(v_intent.amount,2) then
      continue;
    end if;

    if v_intent.status='paid' then
      update public.shopier_webhook_events
      set processing_status='processed', processing_error=null, processed_at=now()
      where id=e.id;
      continue;
    end if;

    if v_intent.status not in ('pending','redirected','expired') then
      continue;
    end if;

    select count(*) into v_count
    from public.parcels p
    where p.id=any(v_intent.parcel_ids)
      and p.owner_id is null;

    if v_count <> coalesce(array_length(v_intent.parcel_ids,1),0) then
      update public.shopier_webhook_events
      set processing_error='paid_webhook_parcel_not_available', processed_at=now()
      where id=e.id;
      continue;
    end if;

    update public.parcels
    set status='sold',
        owner_id=v_intent.user_id,
        reserved_by=null,
        reserved_until=null,
        updated_at=now()
    where id=any(v_intent.parcel_ids)
      and owner_id is null;

    insert into public.parcel_ownership_history(parcel_id,owner_id,acquisition_type)
    select x,v_intent.user_id,'purchase'
    from unnest(v_intent.parcel_ids) t(x)
    where not exists (
      select 1 from public.parcel_ownership_history h
      where h.parcel_id=x
        and h.owner_id=v_intent.user_id
        and h.acquisition_type='purchase'
    );

    update public.orders
    set status='paid', provider='shopier', provider_reference=v_order_id
    where id=any(v_intent.order_ids)
      and user_id=v_intent.user_id
      and status='pending';

    if v_intent.certificate_parcel_id is not null then
      select p.tier,c.name into v_tier,v_city_name
      from public.parcels p
      left join public.cities c on c.id=p.city_id
      where p.id=v_intent.certificate_parcel_id
        and p.owner_id=v_intent.user_id;

      if v_tier is not null then
        select full_name into v_holder_name
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
        shopier_order_id=v_order_id,
        shopier_payment_id=nullif(v_payment_id,''),
        updated_at=now()
    where id=v_intent.id;

    update public.shopier_webhook_events
    set processing_status='processed',
        processing_error=null,
        processed_at=now()
    where id=e.id;
  end loop;
end;
$$;

revoke all on function public.reconcile_shopier_paid_webhooks() from public;
grant execute on function public.reconcile_shopier_paid_webhooks() to postgres;

create extension if not exists pg_cron with schema pg_catalog;

grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

select cron.schedule(
  'myskyparcel-shopier-paid-webhook-reconciliation',
  '* * * * *',
  'select public.reconcile_shopier_paid_webhooks()'
)
where not exists (
  select 1 from cron.job
  where jobname='myskyparcel-shopier-paid-webhook-reconciliation'
);
