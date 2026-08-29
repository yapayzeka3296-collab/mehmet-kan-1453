import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://myskyparcel.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}') as Record<string, string>;
const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', secretKeys.default ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  const origin = req.headers.get('origin')
  if (origin && origin !== 'https://myskyparcel.com' && origin !== 'https://www.myskyparcel.com') return json({ error: 'Origin not allowed' }, 403)
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) return json({ error: 'Email service is not configured.' }, 503)
  try {
    const body = await req.json()
    const name = String(body?.name ?? '').trim(); const email = String(body?.email ?? '').trim(); const subject = String(body?.subject ?? '').trim(); const message = String(body?.message ?? '').trim(); const website = String(body?.website ?? '').trim()
    if (website) return json({ ok: true })
    if (!name || !email || !message) return json({ error: 'Ad soyad, e-posta ve mesaj zorunludur.' }, 400)
    if (name.length > 120 || email.length > 254 || subject.length > 200 || message.length > 5000) return json({ error: 'Mesaj alanlarından biri izin verilen uzunluğu aşıyor.' }, 400)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Geçerli bir e-posta adresi girin.' }, 400)
    const safeSubject = subject || 'MySkyParcel iletişim formu'
    const html = `<h2>MySkyParcel iletişim formu</h2><p><strong>Ad Soyad:</strong> ${escapeHtml(name)}</p><p><strong>E-posta:</strong> ${escapeHtml(email)}</p><p><strong>Konu:</strong> ${escapeHtml(safeSubject)}</p><hr><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`
    const resendResponse = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` }, body: JSON.stringify({ from: 'MySkyParcel <onboarding@resend.dev>', to: ['info.myskyparcel@gmail.com'], reply_to: email, subject: safeSubject, html }) })
    const result = await resendResponse.json()
    if (!resendResponse.ok) { console.error('Resend error', result); return json({ error: 'Mesaj gönderilemedi. Lütfen daha sonra tekrar deneyin.' }, 502) }
    const { error: notificationError } = await supabaseAdmin.from('admin_notifications').insert({ type: 'contact', title: 'Yeni iletişim e-postası', message: `${name} tarafından yeni bir iletişim mesajı gönderildi. Konu: ${safeSubject}`, metadata: { name, email, subject: safeSubject } })
    if (notificationError) console.error('Admin notification insert failed', notificationError)
    return json({ ok: true })
  } catch (error) { console.error('Contact function error', error); return json({ error: 'Mesaj işlenirken bir hata oluştu.' }, 500) }
})

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char) }
