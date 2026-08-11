import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/guvenlik-ayarlari")({
  head: () => ({
    meta: [
      { title: "Güvenlik Ayarları — MySkyParcel" },
      { name: "description", content: "Şifreni değiştir, iki adımlı doğrulamayı yönet ve oturumlarını kontrol et." },
      { property: "og:title", content: "Güvenlik Ayarları — MySkyParcel" },
      { property: "og:description", content: "Hesap güvenliği ayarların." },
    ],
  }),
  component: Guvenlik,
});

function Guvenlik() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaQrCode, setMfaQrCode] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  useEffect(() => {
    let active = true;
    async function loadMfa() {
      if (!supabaseBrowser) { setMfaLoading(false); return; }
      const { data, error } = await supabaseBrowser.auth.mfa.listFactors();
      if (!active) return;
      const verified = (data?.totp ?? []).find((factor) => factor.status === "verified");
      setMfaEnabled(Boolean(verified));
      setMfaFactorId(verified?.id ?? null);
      if (error) setMessage("İki adımlı doğrulama durumu alınamadı.");
      setMfaLoading(false);
    }
    void loadMfa();
    return () => { active = false; };
  }, []);

  async function updatePassword() {
    setMessage(null);
    if (!supabaseBrowser || !user?.email) { setMessage("Oturum veya Supabase bağlantısı bulunamadı."); return; }
    if (newPassword.length < 10) { setMessage("Yeni şifre en az 10 karakter olmalıdır."); return; }
    if (newPassword !== confirmPassword) { setMessage("Yeni şifreler eşleşmiyor."); return; }
    if (!currentPassword) { setMessage("Mevcut şifrenizi girin."); return; }
    setBusy(true);
    try {
      const { error: signInError } = await supabaseBrowser.auth.signInWithPassword({ email: user.email, password: currentPassword });
      if (signInError) { setMessage("Mevcut şifre doğrulanamadı."); return; }
      const { error } = await supabaseBrowser.auth.updateUser({ password: newPassword });
      if (error) { setMessage("Şifre güncellenemedi."); return; }
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setMessage("Şifreniz başarıyla güncellendi.");
    } finally {
      setBusy(false);
    }
  }

  async function enableMfa() {
    setMessage(null);
    if (!supabaseBrowser) { setMessage("Supabase bağlantısı bulunamadı."); return; }
    setBusy(true);
    try {
      const { data, error } = await supabaseBrowser.auth.mfa.enroll({ factorType: "totp", friendlyName: "MySkyParcel" });
      if (error || !data) { setMessage(error?.message ?? "İki adımlı doğrulama başlatılamadı."); return; }
      setMfaFactorId(data.id);
      setMfaQrCode(data.totp?.qr_code ?? null);
      setMfaCode("");
      setMessage("Authenticator uygulamanızla QR kodu okutun ve 6 haneli kodu girin.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyMfa() {
    if (!supabaseBrowser || !mfaFactorId || !/^\d{6}$/.test(mfaCode)) { setMessage("Geçerli 6 haneli doğrulama kodunu girin."); return; }
    setBusy(true); setMessage(null);
    try {
      const { data: challenge, error: challengeError } = await supabaseBrowser.auth.mfa.challenge({ factorId: mfaFactorId });
      if (challengeError || !challenge) { setMessage("Doğrulama başlatılamadı."); return; }
      const { error } = await supabaseBrowser.auth.mfa.verify({ factorId: mfaFactorId, challengeId: challenge.id, code: mfaCode });
      if (error) { setMessage("Kod doğrulanamadı. Lütfen tekrar deneyin."); return; }
      setMfaEnabled(true); setMfaQrCode(null); setMfaCode(""); setMessage("İki adımlı doğrulama etkinleştirildi.");
    } finally {
      setBusy(false);
    }
  }

  async function disableMfa() {
    if (!supabaseBrowser || !mfaFactorId) return;
    if (!window.confirm("İki adımlı doğrulamayı kapatmak istediğinize emin misiniz?")) return;
    setBusy(true); setMessage(null);
    try {
      const { error } = await supabaseBrowser.auth.mfa.unenroll({ factorId: mfaFactorId });
      if (error) { setMessage("İki adımlı doğrulama kapatılamadı."); return; }
      setMfaEnabled(false); setMfaFactorId(null); setMessage("İki adımlı doğrulama kapatıldı.");
    } finally {
      setBusy(false);
    }
  }

  async function signOutEverywhere() {
    if (!supabaseBrowser) return;
    setBusy(true); setMessage(null);
    try {
      const { error } = await supabaseBrowser.auth.signOut({ scope: "global" });
      if (error) setMessage("Oturumlar kapatılamadı.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/guvenlik-ayarlari" />
        <div className="min-w-0">
          <div className="panel p-6">
            <h1 className="font-display text-3xl font-bold">GÜVENLİK AYARLARI</h1>
            <p className="mt-2 text-sm text-muted-foreground">Hesabınızı korumak için şifre, iki adımlı doğrulama ve oturum güvenliğini yönetin.</p>
          </div>

          <section className="panel mt-6 grid gap-5 p-6">
            <h2 className="flex items-center gap-2 font-display text-base"><KeyRound className="h-5 w-5 text-gold" /> ŞİFRE DEĞİŞTİR</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              <label className="block"><span className="text-xs text-muted-foreground">Mevcut Şifre</span><input type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" /></label>
              <label className="block"><span className="text-xs text-muted-foreground">Yeni Şifre</span><input type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" /></label>
              <label className="block"><span className="text-xs text-muted-foreground">Yeni Şifre Tekrar</span><input type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" /></label>
            </div>
            <button onClick={() => void updatePassword()} disabled={busy} className="btn-gold w-fit rounded-md px-8 py-3 text-[11px] disabled:opacity-60">ŞİFREYİ GÜNCELLE</button>
          </section>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <section className="panel p-6">
              <h2 className="flex items-center gap-2 font-display text-base"><Smartphone className="h-5 w-5 text-gold" /> İKİ ADIMLI DOĞRULAMA</h2>
              <p className="mt-3 text-sm text-muted-foreground">Authenticator uygulamasıyla hesabınıza ek bir güvenlik katmanı ekleyin.</p>
              {mfaQrCode && <div className="mt-4 rounded-lg border border-border bg-white p-4"><img src={mfaQrCode} alt="Authenticator QR kodu" className="mx-auto h-48 w-48" /></div>}
              {mfaQrCode && <div className="mt-4 flex gap-2"><input inputMode="numeric" maxLength={6} value={mfaCode} onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6 haneli kod" className="min-w-0 flex-1 rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" /><button onClick={() => void verifyMfa()} disabled={busy} className="rounded-md border border-gold/60 px-4 py-2.5 text-[11px] text-gold disabled:opacity-60">DOĞRULA</button></div>}
              {!mfaLoading && !mfaEnabled && !mfaQrCode && <button onClick={() => void enableMfa()} disabled={busy} className="mt-4 rounded-md border border-gold/60 px-6 py-2.5 text-[11px] text-gold disabled:opacity-60">ETKİNLEŞTİR</button>}
              {!mfaLoading && mfaEnabled && <div className="mt-4 flex items-center justify-between gap-3"><span className="text-xs text-green-500">İki adımlı doğrulama etkin.</span><button onClick={() => void disableMfa()} disabled={busy} className="rounded-md border border-border px-4 py-2 text-[11px] disabled:opacity-60">KAPAT</button></div>}
            </section>
            <section className="panel p-6">
              <h2 className="flex items-center gap-2 font-display text-base"><ShieldCheck className="h-5 w-5 text-gold" /> AKTİF OTURUMLAR</h2>
              <p className="mt-3 text-sm text-muted-foreground">Hesabınızdaki tüm aktif oturumları tek işlemle sonlandırabilirsiniz.</p>
              <button onClick={() => void signOutEverywhere()} disabled={busy} className="mt-4 rounded-md border border-border px-6 py-2.5 text-[11px] disabled:opacity-60">TÜM OTURUMLARI KAPAT</button>
            </section>
          </div>
          {message && <p className="mt-4 rounded-md border border-border bg-card p-3 text-sm text-muted-foreground" role="status">{message}</p>}
        </div>
      </main>
      <TrustBar items={SECURITY_TRUST} />
      <SiteFooter />
    </div>
  );
}
