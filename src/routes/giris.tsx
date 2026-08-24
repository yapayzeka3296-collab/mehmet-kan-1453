import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Globe, Layers, Lock, Mail, ShieldCheck, Star } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import heroCity from "@/assets/hero-city.jpg";
import globe from "@/assets/globe.png";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export const Route = createFileRoute("/giris")({
  head: () => ({ meta: [{ title: "Giriş Yap — MySkyParcel" }, { name: "description", content: "Hesabına giriş yaparak parsellerini yönet ve sertifikalarına ulaş." }, { property: "og:title", content: "Giriş Yap — MySkyParcel" }, { property: "og:description", content: "MySkyParcel hesabına giriş yap." }], links: [{ rel: "stylesheet", href: "/login-background.css" }] }),
  component: GirisPage,
});

const FEATURES = [
  { icon: Globe, big: "81 MİLYON", label: "Toplam Gökyüzü Parseli" },
  { icon: Layers, big: "10 Katman", label: "Her İl İçin" },
  { icon: ShieldCheck, big: "1.000 Sektör", label: "Her İl İçin" },
  { icon: Lock, big: "1.000.000 Parsel", label: "Her İl İçin" },
];

function getSafeRedirect() {
  if (typeof window === "undefined") return "/";
  const value = new URLSearchParams(window.location.search).get("redirect");
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  return value;
}

function getOAuthRedirectUrl() {
  if (typeof window === "undefined") return "https://myskyparcel.com/giris";
  return `${window.location.origin}/giris?redirect=${encodeURIComponent(getSafeRedirect())}`;
}

function getPasswordResetRedirectUrl() {
  if (typeof window === "undefined") return "https://myskyparcel.com/sifre-yenile";
  return `${window.location.origin}/sifre-yenile`;
}

function GirisPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [message, setMessage] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaChallengeId, setMfaChallengeId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaBusy, setMfaBusy] = useState(false);

  async function beginMfaIfRequired() {
    if (!supabaseBrowser) return false;
    const { data: aal, error: aalError } = await supabaseBrowser.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aalError) { setMessage("Güvenlik doğrulaması başlatılamadı. Lütfen tekrar deneyin."); return true; }
    if (aal?.nextLevel !== "aal2" || aal.currentLevel === "aal2") return false;

    const { data: factors, error: factorError } = await supabaseBrowser.auth.mfa.listFactors();
    if (factorError) { setMessage("İki adımlı doğrulama durumu alınamadı."); return true; }
    const factor = (factors?.totp ?? []).find((item) => item.status === "verified");
    if (!factor) { setMessage("Hesabınızda doğrulanmış iki adımlı doğrulama faktörü bulunamadı. Güvenlik ayarlarından MFA durumunu kontrol edin."); return true; }

    const { data: challenge, error: challengeError } = await supabaseBrowser.auth.mfa.challenge({ factorId: factor.id });
    if (challengeError || !challenge) { setMessage("İki adımlı doğrulama başlatılamadı."); return true; }
    setMfaFactorId(factor.id);
    setMfaChallengeId(challenge.id);
    setMfaCode("");
    setMfaRequired(true);
    setMessage("Authenticator uygulamanızdaki 6 haneli kodu girin.");
    return true;
  }

  async function completeLogin() {
    await navigate({ to: getSafeRedirect() as "/" });
  }

  useEffect(() => {
    let active = true;
    async function finishOAuthLogin() {
      if (!supabaseBrowser) return;
      const { data } = await supabaseBrowser.auth.getSession();
      if (!active || !data.session?.user) return;
      const mfaRequiredNow = await beginMfaIfRequired();
      if (!mfaRequiredNow && active) await completeLogin();
    }
    void finishOAuthLogin();
    return () => { active = false; };
  }, [navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!supabaseBrowser) { setMessage("Giriş sistemi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin."); return; }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) { setMessage("E-posta ve şifre alanlarını doldurun."); return; }
    setLoading(true);
    const { error } = await supabaseBrowser.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) {
      const text = error.message ?? "Giriş yapılamadı.";
      if (/invalid login credentials/i.test(text)) setMessage("E-posta adresi veya şifre hatalı.");
      else if (/email not confirmed/i.test(text)) setMessage("E-posta adresiniz henüz doğrulanmamış. Lütfen doğrulama e-postanızı kontrol edin.");
      else setMessage(text);
      setLoading(false);
      return;
    }
    const mfaRequiredNow = await beginMfaIfRequired();
    if (!mfaRequiredNow) await completeLogin();
    setLoading(false);
  }

  async function verifyMfa() {
    if (!supabaseBrowser || !mfaFactorId || !mfaChallengeId || !/^\d{6}$/.test(mfaCode)) { setMessage("Geçerli 6 haneli doğrulama kodunu girin."); return; }
    setMfaBusy(true); setMessage("");
    try {
      const { error } = await supabaseBrowser.auth.mfa.verify({ factorId: mfaFactorId, challengeId: mfaChallengeId, code: mfaCode });
      if (error) { setMessage("Kod doğrulanamadı. Lütfen tekrar deneyin."); return; }
      await supabaseBrowser.auth.refreshSession();
      setMfaRequired(false); setMfaFactorId(null); setMfaChallengeId(null); setMfaCode("");
      await completeLogin();
    } finally { setMfaBusy(false); }
  }

  async function handleOAuth(provider: "google" | "apple") {
    if (!supabaseBrowser) { setMessage("Giriş sistemi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin."); return; }
    setMessage(""); setOauthLoading(provider);
    const { error } = await supabaseBrowser.auth.signInWithOAuth({ provider, options: { redirectTo: getOAuthRedirectUrl() } });
    if (error) { console.error(`${provider} OAuth login failed`, error); setMessage(`${provider === "google" ? "Google" : "Apple"} ile giriş şu anda kullanılamıyor. Supabase sağlayıcı ayarlarını kontrol edin.`); setOauthLoading(null); }
  }

  return (
    <div className="starfield min-h-screen"><SiteHeader /><main className="relative overflow-hidden">
      <img src={heroCity} alt="" aria-hidden width={1920} height={1088} className="absolute inset-x-0 bottom-0 h-[70%] w-full object-cover opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
      <img src={globe} alt="" aria-hidden width={1024} height={1024} className="pointer-events-none absolute right-[28%] top-0 hidden h-[110%] opacity-40 mix-blend-screen xl:block" />
      <div className="relative mx-auto grid max-w-[1600px] gap-10 px-4 py-14 lg:grid-cols-2 lg:px-8">
        <div className="min-w-0"><span className="inline-block rounded-md border border-gold/50 px-4 py-2 text-[10px] leading-5 tracking-[0.10em] text-gold">HER İL İÇİN 10 KATMAN · 1.000 SEKTÖR · 1.000.000 PARSEL<br /><strong>TOPLAM 81 MİLYON GÖKYÜZÜ PARSELİ</strong></span><h1 className="mt-6 font-display text-4xl leading-tight font-bold sm:text-5xl">GÖKYÜZÜNDE<br /><span className="text-gradient-gold">SANA ÖZEL</span><br />BİR YER</h1><p className="mt-5 max-w-md text-sm text-muted-foreground">Kendinize veya sevdiklerinize unutulmaz bir hediye verin. Gökyüzündeki yerinizi seçin, sertifikanızı alın ve bu eşsiz deneyimin bir parçası olun.</p><ul className="mt-10 flex flex-wrap gap-8">{FEATURES.map((f) => <li key={f.big} className="min-w-0"><f.icon className="h-7 w-7 text-gold" /><p className="mt-2 text-sm font-semibold">{f.big}</p><p className="text-xs text-muted-foreground">{f.label}</p></li>)}</ul></div>
        <div className="panel min-w-0 p-6 sm:p-10"><div className="text-center"><Star className="mx-auto h-6 w-6 text-gold" /><h2 className="mt-4 font-display text-3xl">{mfaRequired ? "GÜVENLİK DOĞRULAMASI" : "GİRİŞ YAP"}</h2><p className="mt-3 text-sm text-muted-foreground">{mfaRequired ? "Authenticator uygulamanızla ikinci adımı tamamlayın." : "Hesabınıza giriş yaparak parsellerinizi yönetin ve sertifikalarınıza ulaşın."}</p></div>
          {!mfaRequired ? <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div><label className="text-xs text-muted-foreground" htmlFor="email">E-posta Adresiniz</label><div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold"><Mail className="h-4 w-4 shrink-0 text-muted-foreground" /><input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="ornek@email.com" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /></div></div>
            <div><label className="text-xs text-muted-foreground" htmlFor="pass">Şifreniz</label><div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold"><Lock className="h-4 w-4 shrink-0 text-muted-foreground" /><input id="pass" value={password} onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="••••••••••" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /><button type="button" aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"} onClick={() => setShowPassword((value) => !value)} className="shrink-0 text-muted-foreground hover:text-gold">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
            <div className="flex justify-end"><Link to="/sifremi-unuttum" className="text-xs text-gold hover:underline">Şifremi unuttum</Link></div>
            {message && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{message}</p>}
            <p className="text-xs text-muted-foreground">Güvenlik nedeniyle oturum yalnızca bu tarayıcı oturumu boyunca saklanır. Tarayıcıyı kapatıp yeniden açtığınızda tekrar giriş yapmanız gerekir.</p>
            <button type="submit" disabled={loading || oauthLoading !== null} className="btn-gold flex w-full items-center justify-center gap-3 rounded-md py-3.5 text-sm disabled:pointer-events-none disabled:opacity-60">{loading ? "GİRİŞ YAPILIYOR..." : "GİRİŞ YAP"} <ArrowRight className="h-4 w-4" /></button>
            <div className="flex items-center gap-4 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /> veya <span className="h-px flex-1 bg-border" /></div>
            <div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => void handleOAuth("google")} disabled={loading || oauthLoading !== null} className="rounded-md border border-border py-3 text-sm transition-colors hover:border-gold disabled:pointer-events-none disabled:opacity-60">{oauthLoading === "google" ? "Google açılıyor..." : "Google ile giriş yap"}</button><button type="button" onClick={() => void handleOAuth("apple")} disabled={loading || oauthLoading !== null} className="rounded-md border border-border py-3 text-sm transition-colors hover:border-gold disabled:pointer-events-none disabled:opacity-60">{oauthLoading === "apple" ? "Apple açılıyor..." : "Apple ile giriş yap"}</button></div>
            <p className="text-center text-sm text-muted-foreground">Hesabınız yok mu? <Link to="/kayit-ol" className="text-gold hover:underline">Kayıt olun</Link></p>
          </form> : <div className="mt-8 space-y-5"><label className="block"><span className="text-xs text-muted-foreground">Authenticator Kodu</span><input inputMode="numeric" maxLength={6} autoComplete="one-time-code" value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" className="mt-2 w-full rounded-md border border-input bg-background/50 px-3 py-3 text-center text-lg tracking-[0.4em] outline-none focus:border-gold" /></label>{message && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{message}</p>}<button type="button" onClick={() => void verifyMfa()} disabled={mfaBusy} className="btn-gold flex w-full items-center justify-center rounded-md py-3.5 text-sm disabled:opacity-60">{mfaBusy ? "DOĞRULANIYOR..." : "DOĞRULA VE DEVAM ET"}</button><p className="text-center text-xs text-muted-foreground">Bu adım hesabınızın güvenliği için gereklidir.</p></div>}
          <p className="mt-6 text-center text-xs text-muted-foreground">Sorun yaşıyorsanız destek ekibimizle iletişime geçin.</p>
        </div>
      </div>
    </main><SiteFooter /></div>
  );
}
