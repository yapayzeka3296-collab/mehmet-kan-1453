import { supabase } from "./supabase";

export async function createParcelGift(parcelId: string, recipientEmail: string, message?: string) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Oturum açmanız gerekiyor.");
  const cleanEmail = recipientEmail.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes("@")) throw new Error("Geçerli bir e-posta adresi girin.");

  const token = crypto.randomUUID() + crypto.randomUUID();
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const tokenHash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");

  const { data, error } = await supabase.from("parcel_gifts").insert({
    parcel_id: parcelId,
    sender_id: userData.user.id,
    recipient_email: cleanEmail,
    message: message?.trim() || null,
    token_hash: tokenHash,
  }).select().single();
  if (error) throw error;

  const { error: mailError } = await supabase.functions.invoke("send-parcel-gift", {
    body: { giftId: data.id, token },
  });
  if (mailError) {
    await supabase.from("parcel_gifts").delete().eq("id", data.id).eq("sender_id", userData.user.id);
    throw new Error("Hediye oluşturuldu ancak e-posta gönderilemedi. Lütfen tekrar deneyin.");
  }
  return data;
}

export async function acceptParcelGift(giftId: string, token: string) {
  if (!giftId || !token) throw new Error("Hediye bağlantısı geçersiz.");
  const { data, error } = await supabase.rpc("accept_parcel_gift", { p_gift_id: giftId, p_token: token });
  if (error) throw error;
  return data;
}
