# MySkyParcel + Shopier Integration

## Current integration boundary

This integration is intentionally isolated from the existing purchase/payment UI.
The current `/odeme` flow remains unchanged until a real Shopier checkout is tested end-to-end.

## Server secrets

Configure these only on the Node/Nitro server (never as `VITE_*` variables):

- `SHOPIER_PERSONAL_ACCESS_TOKEN` — Shopier PAT.
- `SHOPIER_WEBHOOK_SECRET` — webhook signing token used for HS256 verification.
- `SHOPIER_API_BASE_URL` — optional; defaults to `https://api.shopier.com/v1`.
- `SUPABASE_URL` — server Supabase URL.
- `SUPABASE_SERVICE_ROLE_KEY` — server-only Supabase service-role key for webhook audit storage.

## Webhook URL

After the application is deployed, configure the Shopier webhook notification URL as:

`https://myskyparcel.com/api/shopier/webhook`

Recommended events for the first phase:

- `order.created`
- `refund.requested`
- `refund.updated`

Shopier signs webhook requests with the `Shopier-Signature` header. The handler rejects invalid signatures before writing any event.

## Data model

`shopier_checkout_intents` stores the future mapping between a MySkyParcel user's reserved parcel selection and a Shopier order ID. It expires after 30 minutes by default.

`shopier_webhook_events` is an append-only integration/audit layer for incoming Shopier events. It does not replace the existing `orders` or `payments` tables.

## Important safety boundary

The webhook currently verifies/logs Shopier orders but does **not** mark a parcel as sold, create a payment, or issue a certificate. This is deliberate. The existing project already has transactional parcel reservation and payment/certificate logic, and that logic must remain the single authority for ownership changes.

The next implementation phase is to map a Shopier order to a `shopier_checkout_intents` row using a tested checkout flow. Only after that mapping is proven should the webhook call the existing purchase/payment RPCs.
