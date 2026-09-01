import { createHmac, timingSafeEqual } from "node:crypto";

const SHOPIER_API_BASE_URL = process.env.SHOPIER_API_BASE_URL?.replace(/\/$/, "") || "https://api.shopier.com/v1";

export type ShopierOrder = {
  id?: string;
  status?: string;
  paymentStatus?: string;
  currency?: string;
  totals?: { total?: string | number };
  lineItems?: Array<{
    productId?: string;
    title?: string;
    quantity?: number;
    price?: string | number;
    total?: string | number;
    type?: string;
  }>;
  shippingInfo?: { email?: string; phone?: string; firstName?: string; lastName?: string };
  note?: string;
  [key: string]: unknown;
};

export function getShopierToken(): string {
  const token = process.env.SHOPIER_PERSONAL_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("SHOPIER_PERSONAL_ACCESS_TOKEN is not configured");
  return token;
}

export function verifyShopierSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.SHOPIER_WEBHOOK_SECRET?.trim();
  if (!secret || !signature) return false;

  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const received = signature.trim();
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");
  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function getShopierOrder(orderId: string): Promise<ShopierOrder> {
  const response = await fetch(`${SHOPIER_API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${getShopierToken()}`,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Shopier order lookup failed (${response.status}): ${body.slice(0, 500)}`);
  }

  return (await response.json()) as ShopierOrder;
}

export function extractShopierOrderId(payload: Record<string, unknown>): string | null {
  const candidates = [payload.orderId, payload.order_id, payload.id];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
    if (typeof candidate === "number") return String(candidate);
  }

  const order = payload.order;
  if (order && typeof order === "object") {
    const nested = order as Record<string, unknown>;
    if (typeof nested.id === "string" && nested.id.trim()) return nested.id.trim();
  }

  return null;
}
