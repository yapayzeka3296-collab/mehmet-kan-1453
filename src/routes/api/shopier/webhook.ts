import { createHmac, timingSafeEqual } from 'node:crypto';
import { createFileRoute } from '@tanstack/react-router';
import { createClient } from '@supabase/supabase-js';

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });

const getEnv = (name: string) => process.env[name]?.trim() || '';

const verifySignature = (token: string, rawBody: string, received: string) => {
  if (!token || !received) return false;

  const expectedHex = createHmac('sha256', token).update(rawBody).digest('hex');
  const expectedBase64 = createHmac('sha256', token).update(rawBody).digest('base64');

  const safeEqual = (expected: string) => {
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(received, 'utf8');
    return a.length === b.length && timingSafeEqual(a, b);
  };

  return safeEqual(expectedHex) || safeEqual(expectedBase64);
};

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

const firstString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return '';
};

export const Route = createFileRoute('/api/shopier/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get('shopier-signature') ?? '';
        const webhookToken = getEnv('SHOPIER_WEBHOOK_TOKEN');

        if (!webhookToken) {
          console.error('Shopier webhook token is not configured');
          return json({ ok: false, reason: 'webhook_not_configured' }, 503);
        }

        if (!verifySignature(webhookToken, rawBody, signature)) {
          return json({ ok: false, reason: 'invalid_signature' }, 401);
        }

        let payload: Record<string, unknown>;
        try {
          payload = asRecord(JSON.parse(rawBody));
        } catch {
          return json({ ok: false, reason: 'invalid_json' }, 400);
        }

        const eventType = firstString(
          request.headers.get('shopier-event'),
          payload.event,
          payload.type,
        ).toLowerCase();
        const webhookId = firstString(
          request.headers.get('shopier-webhook-id'),
          payload.webhookId,
          payload.id,
        );

        const data = asRecord(payload.data ?? payload.order ?? payload);
        const orderId = firstString(data.id, payload.orderId, payload.shopierOrderId);
        const paymentStatus = firstString(data.paymentStatus, payload.paymentStatus).toLowerCase();
        const fulfillmentStatus = firstString(data.status, payload.status).toLowerCase();
        const currency = firstString(data.currency, payload.currency || 'TRY').toUpperCase();
        const totals = asRecord(data.totals);
        const amount = Number(firstString(
          totals.total,
          data.total,
          payload.total,
          payload.amount,
        ));
        const lineItems = Array.isArray(data.lineItems) ? data.lineItems : [];
        const firstLineItem = asRecord(lineItems[0]);
        const productId = firstString(
          firstLineItem.productId,
          data.productId,
          payload.productId,
        );
        const paymentId = firstString(
          data.paymentId,
          payload.paymentId,
          asRecord(data.payment).id,
        );

        const supabaseUrl = getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
        const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
        if (!supabaseUrl || !serviceRoleKey) {
          console.error('Supabase service configuration is missing for Shopier webhook');
          return json({ ok: false, reason: 'supabase_not_configured' }, 503);
        }

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
        });

        const eventRow = {
          event_id: webhookId || null,
          event_type: eventType || null,
          shopier_order_id: orderId || null,
          signature_valid: true,
          payload,
          received_at: new Date().toISOString(),
          processing_status: 'received',
        };

        let eventRecordId: string | null = null;
        const { data: insertedEvent, error: eventInsertError } = await supabase
          .from('shopier_webhook_events')
          .insert(eventRow)
          .select('id')
          .maybeSingle();

        if (!eventInsertError) {
          eventRecordId = insertedEvent?.id ?? null;
        } else if (eventInsertError.code === '23505' && webhookId) {
          const { data: existingEvent, error: existingEventError } = await supabase
            .from('shopier_webhook_events')
            .select('id,processing_status')
            .eq('event_id', webhookId)
            .maybeSingle();

          if (existingEventError || !existingEvent) {
            console.error('Shopier webhook duplicate lookup failed', existingEventError);
            return json({ ok: false, reason: 'event_persistence_failed' }, 500);
          }

          if (existingEvent.processing_status === 'processed') {
            return json({ ok: true, status: 'duplicate' }, 200);
          }

          eventRecordId = existingEvent.id;
          const { error: retryUpdateError } = await supabase
            .from('shopier_webhook_events')
            .update({
              event_type: eventType || null,
              shopier_order_id: orderId || null,
              signature_valid: true,
              payload,
              received_at: new Date().toISOString(),
              processing_status: 'received',
              processing_error: null,
              processed_at: null,
            })
            .eq('id', eventRecordId);

          if (retryUpdateError) {
            console.error('Shopier webhook retry persistence failed', retryUpdateError);
            return json({ ok: false, reason: 'event_persistence_failed' }, 500);
          }
        } else {
          console.error('Shopier webhook event persistence failed', eventInsertError);
          return json({ ok: false, reason: 'event_persistence_failed' }, 500);
        }

        if (eventType !== 'order.fulfilled') {
          await supabase
            .from('shopier_webhook_events')
            .update({
              processing_status: 'ignored',
              processed_at: new Date().toISOString(),
            })
            .eq('id', eventRecordId);
          return json({ ok: true, status: 'ignored', event: eventType || null }, 200);
        }

        if (paymentStatus !== 'paid' || fulfillmentStatus !== 'fulfilled') {
          await supabase
            .from('shopier_webhook_events')
            .update({
              processing_status: 'ignored',
              processing_error: 'order_not_paid_or_not_fulfilled',
              processed_at: new Date().toISOString(),
            })
            .eq('id', eventRecordId);
          return json({ ok: true, status: 'ignored' }, 200);
        }

        if (!orderId || !productId || !Number.isFinite(amount) || amount <= 0 || currency !== 'TRY') {
          await supabase
            .from('shopier_webhook_events')
            .update({
              processing_status: 'failed',
              processing_error: 'missing_or_invalid_order_fields',
              processed_at: new Date().toISOString(),
            })
            .eq('id', eventRecordId);
          return json({ ok: false, reason: 'invalid_order' }, 400);
        }

        const { data: intent, error: intentLookupError } = await supabase
          .from('shopier_checkout_intents')
          .select('id,shopier_product_id')
          .eq('shopier_product_id', productId)
          .maybeSingle();

        if (intentLookupError || !intent) {
          const message = intentLookupError?.message || 'checkout_intent_not_found';
          await supabase
            .from('shopier_webhook_events')
            .update({
              processing_status: 'failed',
              processing_error: message,
              processed_at: new Date().toISOString(),
            })
            .eq('id', eventRecordId);
          return json({ ok: false, reason: 'checkout_intent_not_found' }, 404);
        }

        const { data: completion, error: completionError } = await supabase.rpc('complete_shopier_checkout', {
          p_intent_id: intent.id,
          p_shopier_order_id: orderId,
          p_shopier_payment_id: paymentId || null,
          p_shopier_product_id: productId,
          p_amount: amount,
          p_currency: currency,
        });

        if (completionError) {
          console.error('Shopier checkout completion failed', completionError);
          await supabase
            .from('shopier_webhook_events')
            .update({
              processing_status: 'failed',
              processing_error: completionError.message,
              processed_at: new Date().toISOString(),
            })
            .eq('id', eventRecordId);
          return json({ ok: false, reason: 'checkout_completion_failed' }, 500);
        }

        await supabase
          .from('shopier_webhook_events')
          .update({
            processing_status: 'processed',
            processing_error: null,
            processed_at: new Date().toISOString(),
          })
          .eq('id', eventRecordId);

        return json({ ok: true, status: 'processed', completion }, 200);
      },
    },
  },
});
