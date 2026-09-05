import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "https://myskyparcel.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await userClient.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (profile?.role !== "admin") return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...cors, "Content-Type": "application/json" } });
    const admin = createClient(url, service);
    const body = await req.json();
    const action = body?.action;
    if (!["create", "disable", "enable", "delete"].includes(action)) throw new Error("Invalid action");

    if (action === "create") {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      const fullName = String(body.full_name || "").trim();
      const role = body.role === "admin" ? "admin" : "user";
      if (!email || password.length < 10) throw new Error("Geçerli e-posta ve en az 10 karakterlik şifre gereklidir");
      const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: false, user_metadata: { full_name: fullName } });
      if (error) throw error;
      if (data.user) {
        const { error: profileError } = await admin.from("profiles").update({ full_name: fullName || null, role, updated_at: new Date().toISOString() }).eq("id", data.user.id);
        if (profileError) throw profileError;
        await admin.from("admin_audit_log").insert({ actor_id: user.id, entity_type: "user", entity_id: data.user.id, action: "user_created", metadata: { email, role } });
      }
      return new Response(JSON.stringify({ id: data.user?.id, email }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    const targetId = String(body.user_id || "");
    if (!targetId) throw new Error("user_id required");
    if (targetId === user.id) throw new Error("Kendi admin hesabınızı pasifleştiremez veya silemezsiniz");

    if (action === "delete") {
      const checks = await Promise.all([
        admin.from("orders").select("id", { count: "exact", head: true }).eq("user_id", targetId),
        admin.from("certificate_requests").select("id", { count: "exact", head: true }).eq("user_id", targetId),
        admin.from("physical_certificate_requests").select("id", { count: "exact", head: true }).eq("user_id", targetId),
        admin.from("parcel_ownership_history").select("id", { count: "exact", head: true }).eq("owner_id", targetId),
        admin.from("parcel_gifts").select("id", { count: "exact", head: true }).eq("sender_user_id", targetId),
        admin.from("admin_audit_log").select("id", { count: "exact", head: true }).eq("actor_id", targetId),
        admin.from("certificate_audit_log").select("id", { count: "exact", head: true }).eq("actor_id", targetId),
      ]);
      const labels = ["sipariş", "sertifika", "fiziksel sertifika talebi", "mülkiyet geçmişi", "parsel hediyesi", "yönetim audit kaydı", "sertifika audit kaydı"];
      const queryError = checks.find((result) => result.error)?.error;
      if (queryError) throw queryError;
      const blocking = checks.map((result, index) => ({ ...result, label: labels[index] })).filter((result) => (result.count ?? 0) > 0);
      if (blocking.length) throw new Error(`Bu kullanıcı silinemiyor; ${blocking.map((item) => `${item.count} ${item.label}`).join(", ")} geçmiş kaydı var. Üyeliği pasifleştirebilirsiniz.`);
      const { data: target } = await admin.auth.admin.getUserById(targetId);
      await admin.from("admin_audit_log").insert({ actor_id: user.id, entity_type: "user", entity_id: null, action: "user_deleted", metadata: { target_user_id: targetId, email: target.user?.email ?? null } });
      const { error } = await admin.auth.admin.deleteUser(targetId);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, deleted: true }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    const duration = action === "disable" ? "876000h" : "none";
    const { error } = await admin.auth.admin.updateUserById(targetId, { ban_duration: duration });
    if (error) throw error;
    await admin.from("admin_audit_log").insert({ actor_id: user.id, entity_type: "user", entity_id: targetId, action: action === "disable" ? "user_disabled" : "user_enabled", metadata: {} });
    return new Response(JSON.stringify({ success: true }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Operation failed" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
