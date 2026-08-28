import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, XCircle, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export const Route = createFileRoute("/dogrula")({ head: () => ({ meta: [{ title: "E-posta Doğrulama — MySkyParcel" }, { name: "description", content: "MySkyParcel e-posta ve üyelik SMS doğrulama sonucu." }] }), component: Dogrula });
function Dogrula() {
  const { user, loading } = useAuth();
  const [linkError, setLinkError] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search); const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    setLinkError(Boolean(params.get("error") || params.get("error_code") || params.get("error_description") || hash.get("error") || hash.get("error_code") || hash.get("error_description")));
  }, []);

  useEffect(() => {
    let active = true;
    async function startPhoneVerification() {
      if (!user || !supabaseBrowser) return;
      const pendingPhone = typeof user.user_metadata?.pending_phone === "string" ? user.user_metadata.pending_phone : "";
      if (!pendingPhone) return;
      if (sessionStorage.getItem(`myskyparcel-phone-sms:${user.id}`) === "sent") { setPhone(pendingPhone); return; }
      setPhone(pendingPhone); setPhoneSending(true); setPhoneMessage(null);
      const { error } = await supabaseBrowser.auth.updateUser({ phone: pendingPhone });
      if (!active) return;
      setPhoneSending(false);
      if (error) { setPhoneMessage(`SMS doğrulaması başlatılamadı: ${error.message}`); return; }
      sessionStorage.setItem(`myskyparcel-phone-sms:${user.id}`, "sent");
      setPhoneMessage(`SMS doğrulama kodu ${pendingPhone} numarasına gönderildi.`);
    }
    void startPhoneVerification();
    return () => { active = false; };
  }, [user?.id, user?.user_metadata?.pending_phone]);

  async function verifyPhone() {
    if (!supabaseBrowser || !user || !phone || !/^\d{6}$/.test(phoneCode)) { setPhoneMessage("Geçerli 6 haneli SMS kodunu girin."); return; }
    setPhoneSending(true); setPhoneMessage(null);
    try {
      const { error } = await supabaseBrowser.auth.verifyOtp({ phone, token: phoneCode, type: "phone_change" });
      if (error) { setPhoneMessage(`SMS kodu doğrulanamadı: ${error.message}`); return; }
      await supabaseBrowser.auth.updateUser({ data: { pending_phone: null } });
      sessionStorage.removeItem(`myskyparcel-phone-sms:${user.id}`);
      setPhoneVerified(true); setPhoneCode(""); setPhoneMessage("Telefon numaranız başarıyla doğrulandı.");
    } finally { setPhoneSending(false); }
  }

  async function resendPhone() {
    if (!supabaseBrowser || !phone) return;
    setPhoneSending(true); setPhoneMessage(null);
    try {
      const { error } = await supabaseBrowser.auth.resend({ type: "phone_change", phone });
      if (error) { setPhoneMessage(`SMS yeniden gönderilemedi: ${error.message}`); return; }
      setPhoneMessage("Yeni SMS doğrulama kodu gönderildi.");
    } finally { setPhoneSending(false); }
  }

  const verified = Boolean(user);
  return <div className="starfield flex min-h-screen flex-col"><SiteHeader /><main className="flex flex-1 items-center justify-center px-4 py-16"><section className="panel w-full max-w-xl p-8 text-center sm:p-12">{loading ? <><Loader2 className="mx-auto h-12 w-12 animate-spin text-gold" aria-hidden /><h1 className="mt-6 font-display text-3xl">DOĞRULAMA KONTROL EDİLİYOR</h1><p className="mt-4 text-sm text-muted-foreground">E-posta doğrulama sonucunuz kontrol ediliyor. Lütfen sayfayı kapatmayın.</p></> : verified ? <><CheckCircle2 className="mx-auto h-14 w-14 text-green-500" aria-hidden /><h1 className="mt-6 font-display text-3xl">E-POSTANIZ DOĞRULANDI</h1><p className="mt-4 text-sm text-muted-foreground">{user?.email ? `${user.email} adresiniz başarıyla doğrulandı.` : "E-posta adresiniz başarıyla doğrulandı."}</p>{phone && !phoneVerified && <div className="mt-8 rounded-xl border border-gold/20 bg-gold/5 p-5 text-left"><div className="flex items-center gap-2"><Smartphone className="h-5 w-5 text-gold" /><h2 className="font-semibold">SMS ÜYELİK DOĞRULAMASI</h2></div><p className="mt-2 text-xs text-muted-foreground">Telefonunuz yalnızca üyelik doğrulaması için SMS ile doğrulanır. {phoneSending ? "SMS işlemi hazırlanıyor..." : phoneMessage}</p><label className="mt-4 block"><span className="text-xs text-muted-foreground">6 haneli SMS kodu</span><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={phoneCode} onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6))} className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-3 text-center text-lg tracking-[0.4em] outline-none focus:border-gold" placeholder="123456" /></label><div className="mt-3 grid gap-2 sm:grid-cols-2"><button type="button" onClick={() => void verifyPhone()} disabled={phoneSending} className="btn-gold rounded-md px-4 py-3 text-xs font-bold">SMS KODUNU DOĞRULA</button><button type="button" onClick={() => void resendPhone()} disabled={phoneSending} className="rounded-md border border-border px-4 py-3 text-xs">SMS KODUNU YENİDEN GÖNDER</button></div></div>}{phoneVerified && <p className="mt-6 rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-500">Telefon numaranız da doğrulandı. Üyelik doğrulaması tamamlandı.</p>}<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"><Link to="/panelim" className="btn-gold rounded-md px-6 py-3 text-sm">PANELİME GİT</Link><Link to="/giris" className="rounded-md border border-input px-6 py-3 text-sm">GİRİŞ SAYFASI</Link></div></> : <><XCircle className="mx-auto h-14 w-14 text-destructive" aria-hidden /><h1 className="mt-6 font-display text-3xl">DOĞRULAMA BAŞARISIZ</h1><p className="mt-4 text-sm text-muted-foreground">{linkError ? "Doğrulama bağlantısı geçersiz veya süresi dolmuş. Yeni doğrulama e-postası isteyin." : "Doğrulama bağlantısı işlenemedi. Yeni doğrulama e-postası isteyin."}</p><div className="mt-8"><Link to="/kayit-ol" className="btn-gold inline-flex rounded-md px-6 py-3 text-sm">KAYIT SAYFASINA DÖN</Link></div></>}</section></main><SiteFooter /></div>;
}
