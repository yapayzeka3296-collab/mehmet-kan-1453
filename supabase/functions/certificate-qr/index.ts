import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import QRCode from "npm:qrcode@1.5.4";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://myskyparcel.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "no-store",
};

const url = Deno.env.get("SUPABASE_URL");
const key = Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  if (!url || !key) return new Response("Service unavailable", { status: 503, headers: corsHeaders });

  const code = new URL(req.url).searchParams.get("code")?.trim() ?? "";
  if (!/^[A-Z0-9-]{4,80}$/i.test(code)) return new Response("Invalid certificate", { status: 400, headers: corsHeaders });

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await supabase.rpc("verify_certificate", { p_certificate_number: code.toUpperCase() });
  const verified = Array.isArray(data) ? data[0] : data;
  if (error || !verified?.certificate_number || verified.status !== "issued") {
    return new Response("Certificate not found", { status: 404, headers: corsHeaders });
  }

  const target = `https://myskyparcel.com/sertifika-dogrula?code=${encodeURIComponent(verified.certificate_number)}`;
  const svg = await QRCode.toString(target, { type: "svg", errorCorrectionLevel: "H", margin: 1, width: 320 });
  return new Response(svg, { status: 200, headers: { ...corsHeaders, "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=300" } });
});
