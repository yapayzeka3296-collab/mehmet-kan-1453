export type ParcelCartItem = {
  id: string;
  parcel_number: string;
  city_name?: string | null;
  tier: "digital" | "elite" | "premium";
  tier_price: number;
};

export const PARCEL_CART_KEY = "myskyparcel_cart";
export const PARCEL_CART_EVENT = "myskyparcel-cart-updated";

export function readParcelCart(): ParcelCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PARCEL_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ParcelCartItem => Boolean(item?.id && item?.parcel_number && ["digital", "elite", "premium"].includes(item?.tier)));
  } catch {
    return [];
  }
}

export function writeParcelCart(items: ParcelCartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PARCEL_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(PARCEL_CART_EVENT, { detail: items }));
}

export function removeParcelFromCart(id: string) {
  writeParcelCart(readParcelCart().filter((item) => item.id !== id));
}

export function clearParcelCart() {
  writeParcelCart([]);
}
