import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";
import { useAuth } from "@/hooks/useAuth";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export const Route = createFileRoute("/profilim")({
  head: () => ({ meta: [
    { title: "Profilim — MySkyParcel" },
    { name: "description", content: "Hesap bilgilerini güncelle ve iletişim tercihlerini yönet." },
    { property: "og:title", content: "Profilim — MySkyParcel" },
    { property: "og:description", content: "Hesap bilgilerin ve tercihlerin." },
  ] }),
  component: Profilim,
});

function Profilim() {
  const { user, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setFullName(typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "");
  }, [user]);

  if (loading) return <div className="starfield min-h-screen" aria-busy="true" />;
  if (!user) return <Navigate to="/giris" replace />;

  async function updateProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabaseBrowser) { setError("Supabase yapılandırması eksik."); return; }
    const cleanName = fullName.trim();
    if (cleanName.length > 120) { setError("Ad soyad en fazla 120 karakter olabilir."); return; }
    setSaving(true); setMessage(null); setError(null);
    try {
      const { error: authError } = await supabaseBrowser.auth.updateUser({
        data: { full_name: cleanName },
      });
      if (authError) throw authError;

      const { error: profileError } = await supabaseBrowser
        .from("profiles")
        .update({ full_name: cleanName })
        .eq("id", user.id);
      if (profileError) throw profileError;

      setMessage("Profil bilgileriniz güncellendi.");
    } catch (err) {
      console.error("Profile update failed", err);
      setError("Profil güncellenemedi. Lütfen bilgileri kontrol edip tekrar deneyin.");
    } finally { setSaving(false); }
  }

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/profilim" />
        <div className="min-w-0">
          <div className="panel p-6"><h1 className="font-display text-3xl font-bold">PROFİLİM</h1></div>
          <form className="panel mt-6 grid gap-5 p-6 sm:grid-cols-2" onSubmit={updateProfile}>
            <label className="block"><span className="text-xs text-muted-foreground">Ad Soyad</span><input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" maxLength={120} className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" /></label>
            <label className="block"><span className="text-xs text-muted-foreground">E-posta</span><input value={user.email ?? ""} readOnly autoComplete="email" className="mt-1.5 w-full cursor-not-allowed rounded-md border border-input bg-muted/30 px-3 py-2.5 text-sm outline-none" /></label>
            {message && <p className="text-sm text-success sm:col-span-2" role="status">{message}</p>}
            {error && <p className="text-sm text-destructive sm:col-span-2" role="alert">{error}</p>}
            <button type="submit" disabled={saving} className="btn-gold w-fit rounded-md px-8 py-3 text-[11px] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2">{saving ? "GÜNCELLENİYOR..." : "BİLGİLERİ GÜNCELLE"}</button>
          </form>
        </div>
      </main>
      <TrustBar items={SECURITY_TRUST} /><SiteFooter />
    </div>
  );
}
