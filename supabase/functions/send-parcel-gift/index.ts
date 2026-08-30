import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://myskyparcel.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Oturum doğrulanamadı." }, 401);

    const url = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!url || !serviceRoleKey) return json({ error: "Hediye e-posta servisi yapılandırılmamış." }, 503);

    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: "Oturum doğrulanamadı." }, 401);

    const admin = createClient(url, serviceRoleKey);
    const body = await req.json();
    const giftId = typeof body?.giftId === "string" ? body.giftId : "";
    const token = typeof body?.token === "string" ? body.token : "";
    if (!giftId || !token) return json({ error: "Hediye bilgileri eksik." }, 400);

    const { data: gift, error: giftError } = await admin
      .from("parcel_gifts")
      .select("id, parcel_id, sender_user_id, recipient_email, message, expires_at, status")
      .eq("id", giftId)
      .eq("sender_user_id", user.id)
      .single();
    if (giftError || !gift) return json({ error: "Hediye kaydı bulunamadı." }, 404);
    if (gift.status !== "pending") return json({ error: "Hediye artık beklemede değil." }, 409);
    if (new Date(gift.expires_at) <= new Date()) return json({ error: "Hediyenin süresi dolmuş." }, 410);

    const { data: parcel, error: parcelError } = await admin
      .from("parcels")
      .select("parcel_number, tier, owner_id, cities(name)")
      .eq("id", gift.parcel_id)
      .eq("owner_id", user.id)
      .single();
    if (parcelError || !parcel) return json({ error: "Hediye edilecek parsel doğrulanamadı." }, 403);

    const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
    const from = Deno.env.get("MAIL_FROM") ?? "";
    if (!resendKey) return json({ error: "RESEND_API_KEY yapılandırılmamış." }, 503);
    if (!from) return json({ error: "MAIL_FROM yapılandırılmamış. Doğrulanmış bir gönderici adresi gereklidir." }, 503);

    const appUrl = Deno.env.get("PUBLIC_APP_URL") ?? "https://myskyparcel.com";
    const acceptUrl = `${appUrl}/hediye-kabul?gift=${encodeURIComponent(gift.id)}&token=${encodeURIComponent(token)}`;
    const safeMessage = gift.message
      ? gift.message.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;")
      : "";
    const cityName = Array.isArray(parcel.cities) ? parcel.cities[0]?.name : parcel.cities?.name;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [gift.recipient_email],
        subject: "MySkyParcel'dan size bir parsel hediyesi var",
        html: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto"><h2>🎁 MySkyParcel Hediye</h2><p>Size bir gökyüzü parseli hediye edildi.</p><p><strong>Parsel:</strong> ${parcel.parcel_number}<br><strong>Paket:</strong> ${parcel.tier ?? "—"}<br><strong>Şehir:</strong> ${cityName ?? "—"}</p>${safeMessage ? `<p><strong>Mesaj:</strong> ${safeMessage}</p>` : ""}<p><a href="${acceptUrl}" style="display:inline-block;padding:12px 20px;background:#c9a35b;color:#111;text-decoration:none;border-radius:6px">Hediyemi Kabul Et</a></p><p>Bu bağlantı 7 gün geçerlidir.</p></div>`,
      }),
    });

    const providerResult = await resendResponse.json().catch(() => null);
    if (!resendResponse.ok) {
      console.error("Resend parcel gift error", { status: resendResponse.status, result: providerResult, giftId: gift.id });
      return json({ error: `E-posta sağlayıcısı gönderimi reddetti (${resendResponse.status}).` }, 502);
    }

    return json({ ok: true, id: providerResult?.id ?? null });
  } catch (error) {
    console.error("send-parcel-gift error", error);
    return json({ error: error instanceof Error ? error.message : "Hediye e-postası gönderilemedi." }, 500);
  }
});
