import { supabase } from "./supabase";

export async function createParcelGift(parcelId: string, recipientEmail: string, message?: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Oturum açmanız gerekiyor.");

  const token = crypto.randomUUID() + crypto.randomUUID();
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(token));
  const tokenHash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");

  const { data, error } = await supabase.from("parcel_gifts").insert({
    parcel_id: parcelId,
    sender_id: userData.user.id,
    recipient_email: recipientEmail.trim().toLowerCase(),
    message: message?.trim() || null,
    token_hash: tokenHash,
  }).select().single();

  if (error) throw error;
  return { gift: data, token };
}

export async function acceptParcelGift(giftId: string) {
  const { data, error } = await supabase.rpc("accept_parcel_gift", { p_gift_id: giftId });
  if (error) throw error;
  return data;
}
