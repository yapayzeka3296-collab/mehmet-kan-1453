const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

export const GET = async ({ request }: { request: Request }): Promise<Response> => {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) return jsonResponse({ ok: false, admin: false, reason: "unauthenticated" }, 401);

  const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!supabaseUrl || !serviceRoleKey) return jsonResponse({ ok: false, admin: false, reason: "service_not_configured" }, 503);

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) return jsonResponse({ ok: false, admin: false, reason: "unauthenticated" }, 401);

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Admin role lookup failed", profileError);
      return jsonResponse({ ok: false, admin: false, reason: "internal_error" }, 500);
    }

    if (profile?.role !== "admin") return jsonResponse({ ok: false, admin: false, reason: "forbidden" }, 403);
    return jsonResponse({ ok: true, admin: true }, 200);
  } catch (error) {
    console.error("Admin authorization check failed", error);
    return jsonResponse({ ok: false, admin: false, reason: "internal_error" }, 500);
  }
};
