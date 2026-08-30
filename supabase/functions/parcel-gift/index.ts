import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getAdminClient() {
  const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}") as Record<string, string>;
  const key = secretKeys.default ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  return createClient(Deno.env.get("SUPABASE_URL") ?? "", key);
}

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function response(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    if (req.method !== "POST") return response({ error: "method not allowed" }, 405);
    const body = await req.json();
    const action = body?.action;
    const giftId = typeof body?.giftId === "string" ? body.giftId : "";
    const token = typeof body?.token === "string" ? body.token : "";
    if (!giftId || !token || token.length < 32 || token.length > 128) return response({ error: "gift link is invalid" }, 400);

    const admin = getAdminClient();
    const tokenHash = await sha256Hex(token);

    if (action === "preview") {
      const { data: gift, error: giftError } = await admin
        .from("parcel_gifts")
        .select("id, parcel_id, recipient_email, message, status, expires_at")
        .eq("id", giftId)
        .eq("token_hash", tokenHash)
        .single();
      if (giftError || !gift) return response({ error: "gift link is invalid" }, 404);
      if (gift.status !== "pending") return response({ error: "gift is no longer pending" }, 410);
      if (new Date(gift.expires_at) <= new Date()) return response({ error: "gift has expired" }, 410);

      const { data: parcel } = await admin
        .from("parcels")
        .select("parcel_number, tier, cities(name)")
        .eq("id", gift.parcel_id)
        .single();

      return response({
        giftId: gift.id,
        recipientEmail: gift.recipient_email,
        message: gift.message,
        expiresAt: gift.expires_at,
        parcel: {
          parcelNumber: parcel?.parcel_number ?? null,
          tier: parcel?.tier ?? null,
          city: Array.isArray(parcel?.cities) ? parcel?.cities[0]?.name ?? null : (parcel?.cities as { name?: string } | null)?.name ?? null,
        },
      });
    }

    if (action === "accept") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return response({ error: "authentication required" }, 401);
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: { user } } = await userClient.auth.getUser();
      if (!user) return response({ error: "authentication required" }, 401);

      const { data, error } = await userClient.rpc("accept_parcel_gift", {
        p_gift_id: giftId,
        p_token_hash: tokenHash,
      });
      if (error) throw error;
      return response(data);
    }

    return response({ error: "unsupported action" }, 400);
  } catch (error) {
    console.error("Parcel gift error", error);
    return response({ error: error instanceof Error ? error.message : "gift request failed" }, 400);
  }
});
