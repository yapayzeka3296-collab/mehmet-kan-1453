import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://myskyparcel.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

const url = Deno.env.get("SUPABASE_URL");
const publishableKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: corsHeaders });
  if (!url || !publishableKey) return new Response(JSON.stringify({ error: "service_unavailable" }), { status: 503, headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });

  // Use the caller's JWT for both authorization and the protected RPC. Never
  // switch to service_role after authentication: auth.uid() must remain the
  // verified admin identity and the RPCs already run as SECURITY DEFINER.
  const userClient = createClient(url, publishableKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });

  const { data: admin, error: adminError } = await userClient.rpc("is_admin");
  if (adminError || admin !== true) return new Response(JSON.stringify({ error: "admin_required" }), { status: 403, headers: corsHeaders });

  let body: { action?: string; request_id?: string; reason?: string };
  try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400, headers: corsHeaders }); }
  if (!body.request_id || !/^[0-9a-f-]{36}$/i.test(body.request_id)) return new Response(JSON.stringify({ error: "invalid_request_id" }), { status: 400, headers: corsHeaders });

  let result;
  if (body.action === "approve") result = await userClient.rpc("approve_certificate_request", { p_request_id: body.request_id });
  else if (body.action === "issue") result = await userClient.rpc("issue_certificate_request", { p_request_id: body.request_id });
  else if (body.action === "reject") result = await userClient.rpc("reject_certificate_request", { p_request_id: body.request_id, p_reason: body.reason ?? "" });
  else if (body.action === "revoke") result = await userClient.rpc("revoke_certificate", { p_request_id: body.request_id, p_reason: body.reason ?? "" });
  else return new Response(JSON.stringify({ error: "invalid_action" }), { status: 400, headers: corsHeaders });

  if (result.error) return new Response(JSON.stringify({ error: "certificate_action_failed" }), { status: 409, headers: corsHeaders });
  return new Response(JSON.stringify({ data: result.data }), { status: 200, headers: corsHeaders });
});
