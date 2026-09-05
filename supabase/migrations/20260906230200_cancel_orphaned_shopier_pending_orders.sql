-- Existing expired Shopier intents must not leave pending orders behind.
-- Keep order history; cancel only unpaid orders linked to expired intents.
update public.orders o
set status='cancelled', updated_at=now()
where o.status='pending'
  and exists (
    select 1
    from public.shopier_checkout_intents i
    where o.id=any(i.order_ids)
      and i.status='expired'
  );
