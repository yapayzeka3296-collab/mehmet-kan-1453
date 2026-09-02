import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";

const SHOPIER_API_BASE_URL = process.env.SHOPIER_API_BASE_URL?.replace(/\/$/, "") || "https://api.shopier.com/v1";

export type ShopierOrder = {
  id?: string; status?: string; paymentStatus?: string; currency?: string;
  totals?: { total?: string | number };
  lineItems?: Array<{ productId?: string; title?: string; quantity?: number; price?: string | number; total?: string | number; type?: string }>;
  shippingInfo?: { email?: string; phone?: string; firstName?: string; lastName?: string };
  note?: string; [key: string]: unknown;
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
  const a = Buffer.from(expected, "utf8"); const b = Buffer.from(received, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function getShopierOrder(orderId: string): Promise<ShopierOrder> {
  const response = await fetch(`${SHOPIER_API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, { headers: { accept: "application/json", authorization: `Bearer ${getShopierToken()}` } });
  if (!response.ok) throw new Error(`Shopier order lookup failed (${response.status}): ${(await response.text().catch(() => "")).slice(0, 500)}`);
  return (await response.json()) as ShopierOrder;
}

export async function createShopierCheckout(input: { title: string; amount: number; description: string; orderId: string }): Promise<{ productId: string; paymentUrl: string; checkoutHtml: string }> {
  const imageUrl = process.env.SHOPIER_PRODUCT_IMAGE_URL?.trim() || "https://myskyparcel.com/myskyparcel-logo.svg";
  const response = await fetch(`${SHOPIER_API_BASE_URL}/products`, {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json", authorization: `Bearer ${getShopierToken()}`, "Idempotency-Key": randomUUID() },
    body: JSON.stringify({
      title: input.title,
      description: input.description,
      type: "digital",
      media: [{ type: "image", url: imageUrl, placement: 1 }],
      priceData: { currency: "TRY", price: input.amount.toFixed(2) },
      stockQuantity: 1,
      shippingPayer: "sellerPays",
      customListing: true,
      customNote: `MySkyParcel referansı: ${input.orderId}`,
    }),
  });
  if (!response.ok) throw new Error(`Shopier product creation failed (${response.status}): ${(await response.text().catch(() => "")).slice(0, 500)}`);
  const product = (await response.json()) as { id?: string; url?: string };
  if (!product.id || !product.url) throw new Error("Shopier product response is missing id or url");

  const shopSlug = process.env.SHOPIER_SHOP_SLUG?.trim();
  if (!shopSlug) throw new Error("SHOPIER_SHOP_SLUG is not configured");
  const escapedId = product.id.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  const escapedSlug = encodeURIComponent(shopSlug).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  const checkoutHtml = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Shopier Güvenli Ödeme</title></head><body><form id="shopier-checkout" method="POST" action="https://www.shopier.com/s/shipping/${escapedSlug}"><input type="hidden" name="product_id" value="${escapedId}"><input type="hidden" name="quantity" value="1"></form><script>document.getElementById('shopier-checkout').submit();</script></body></html>`;
  return { productId: product.id, paymentUrl: product.url, checkoutHtml };
}

export function extractShopierOrderId(payload: Record<string, unknown>): string | null {
  const candidates = [payload.orderId, payload.order_id, payload.id];
  for (const candidate of candidates) { if (typeof candidate === "string" && candidate.trim()) return candidate.trim(); if (typeof candidate === "number") return String(candidate); }
  const order = payload.order;
  if (order && typeof order === "object") { const nested = order as Record<string, unknown>; if (typeof nested.id === "string" && nested.id.trim()) return nested.id.trim(); }
  return null;
}
