import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getAdminClient() {
  const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}") as Record<string, string>;
  const key = secretKeys.default ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!key) throw new Error("Server email service is not configured");
  return createClient(Deno.env.get("SUPABASE_URL") ?? "", key);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authentication required");

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) throw new Error("Authentication required");

    const { giftId, token } = await req.json();
    if (!giftId || !token || typeof token !== "string") throw new Error("Gift data is incomplete");

    // The user JWT is used only to establish the sender identity. The actual
    // sender-owned gift read is performed server-side so RLS on the gift ledger
    // cannot block the email dispatch after the secure create RPC succeeds.
    const admin = getAdminClient();
    const { data: gift, error: giftError } = await admin
      .from("parcel_gifts")
      .select("id, parcel_id, sender_user_id, recipient_email, message, expires_at, status")
      .eq("id", giftId)
      .eq("sender_user_id", user.id)
      .single();
    if (giftError || !gift) throw new Error("Gift not found");
    if (gift.status !== "pending") throw new Error("Gift is not pending");
    if (new Date(gift.expires_at) <= new Date()) throw new Error("Gift expired");

    const { data: parcel, error: parcelError } = await admin
      .from("parcels")
      .select("parcel_number, tier, cities(name)")
      .eq("id", gift.parcel_id)
      .eq("owner_id", user.id)
      .single();
    if (parcelError || !parcel) throw new Error("Parcel not found or no longer owned by sender");

    const appUrl = Deno.env.get("PUBLIC_APP_URL") ?? "https://myskyparcel.com";
    const acceptUrl = `${appUrl}/hediye-kabul?gift=${encodeURIComponent(gift.id)}&token=${encodeURIComponent(token)}`;
    const resendKey = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("MAIL_FROM") ?? "MySkyParcel <onboarding@resend.dev>";
    if (!resendKey) throw new Error("Email service is not configured");

    const safeMessage = gift.message
      ? gift.message.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
      : "";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `parcel-gift/${gift.id}`,
      },
      body: JSON.stringify({
        from,
        to: [gift.recipient_email],
        subject: "MySkyParcel'dan size bir parsel hediyesi var",
        html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto"><h2>🎁 MySkyParcel Hediye</h2><p>Size bir gökyüzü parseli hediye edildi.</p><p><strong>Parsel:</strong> ${parcel.parcel_number}<br><strong>Paket:</strong> ${parcel.tier ?? "—"}</p>${safeMessage ? `<p><strong>Mesaj:</strong> ${safeMessage}</p>` : ""}<p><a href="${acceptUrl}" style="display:inline-block;padding:12px 20px;background:#c9a35b;color:#111;text-decoration:none;border-radius:6px">Hediyemi Kabul Et</a></p><p>Bu bağlantı 7 gün geçerlidir.</p></div>`,
      }),
    });

    const providerResult = await response.json().catch(() => null);
    if (!response.ok) {
      console.error("Parcel gift email provider error", providerResult);
      throw new Error("Email provider rejected the message");
    }

    return new Response(JSON.stringify({ ok: true, id: providerResult?.id ?? null }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Parcel gift function error", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Gift email could not be sent" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
