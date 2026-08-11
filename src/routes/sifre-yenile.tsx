import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export const Route = createFileRoute("/sifre-yenile")({
  head: () => ({ meta: [{ title: "Şifre Yenile — MySkyParcel" }, { name: "description", content: "MySkyParcel hesabınız için yeni şifrenizi belirleyin." }] }),
  component: SifreYenile,
});

function SifreYenile() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!supabaseBrowser) { setReady(false); return; }
    let active = true;
    const { data } = supabaseBrowser.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    void supabaseBrowser.auth.getSession().then(({ data: sessionData }) => {
      if (active && sessionData.session) setReady(true);
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMessage(""); setSuccess(false);
    if (!supabaseBrowser || !ready) { setMessage("Şifre yenileme bağlantınız geçersiz veya süresi dolmuş olabilir. Lütfen yeni bir bağlantı isteyin."); return; }
    if (newPassword.length < 10) { setMessage("Yeni şifre en az 10 karakter olmalıdır."); return; }
    if (newPassword !== confirmPassword) { setMessage("Şifreler eşleşmiyor."); return; }
    setLoading(true);
    const { error } = await supabaseBrowser.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) { setMessage("Şifre güncellenemedi. Lütfen yeni bir sıfırlama bağlantısı isteyin."); return; }
    setSuccess(true); setMessage("Şifreniz başarıyla yenilendi.");
    await supabaseBrowser.auth.signOut({ scope: "global" });
  }

  return (
    <div className="starfield min-h-screen"><SiteHeader /><main className="relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      <div className="relative mx-auto max-w-2xl px-4 py-16 lg:px-8"><div className="panel p-6 sm:p-10"><div className="text-center"><ShieldCheck className="mx-auto h-8 w-8 text-gold" /><h1 className="mt-4 font-display text-3xl">ŞİFRE YENİLE</h1><p className="mt-3 text-sm text-muted-foreground">Yeni şifrenizi belirleyin. Güvenlik için en az 10 karakter kullanın.</p></div>
        <form className="mt-8 space-y-5" onSubmit={onSubmit}><label className="block"><span className="text-xs text-muted-foreground">Yeni Şifre</span><div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold"><Lock className="h-4 w-4 shrink-0 text-muted-foreground" /><input type="password" autoComplete="new-password" required minLength={10} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /></div></label><label className="block"><span className="text-xs text-muted-foreground">Yeni Şifre Tekrar</span><div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold"><Lock className="h-4 w-4 shrink-0 text-muted-foreground" /><input type="password" autoComplete="new-password" required minLength={10} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /></div></label>{message && <p role="status" className={success ? "text-center text-sm text-green-500" : "text-center text-sm text-destructive"}>{message}</p>}<button type="submit" disabled={loading || success} className="btn-gold flex w-full items-center justify-center gap-3 rounded-md py-3.5 text-sm disabled:opacity-60">{loading ? "GÜNCELLENİYOR..." : "ŞİFREYİ GÜNCELLE"}<ArrowRight className="h-4 w-4" /></button><Link to="/giris" className="mx-auto flex w-fit items-center gap-2 rounded-md border border-border px-6 py-3 text-sm transition-colors hover:border-gold"><Lock className="h-4 w-4" /> Giriş sayfasına dön</Link></form>
      </div></div><TrustBar items={SECURITY_TRUST} /></main><SiteFooter /></div>
  );
}
