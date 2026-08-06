import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";

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
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/guvenlik-ayarlari" />
        <div className="min-w-0">
          <div className="panel p-6">
            <h1 className="font-display text-3xl font-bold">GÜVENLİK AYARLARI</h1>
          </div>

          <section className="panel mt-6 grid gap-5 p-6">
            <h2 className="flex items-center gap-2 font-display text-base">
              <KeyRound className="h-5 w-5 text-gold" /> ŞİFRE DEĞİŞTİR
            </h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {["Mevcut Şifre", "Yeni Şifre", "Yeni Şifre Tekrar"].map((l) => (
                <label key={l} className="block">
                  <span className="text-xs text-muted-foreground">{l}</span>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold"
                  />
                </label>
              ))}
            </div>
            <button className="btn-gold w-fit rounded-md px-8 py-3 text-[11px]">ŞİFREYİ GÜNCELLE</button>
          </section>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <section className="panel p-6">
              <h2 className="flex items-center gap-2 font-display text-base">
                <Smartphone className="h-5 w-5 text-gold" /> İKİ ADIMLI DOĞRULAMA
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Hesabınıza ek bir güvenlik katmanı ekleyin.
              </p>
              <button className="mt-4 rounded-md border border-gold/60 px-6 py-2.5 text-[11px] text-gold">
                ETKİNLEŞTİR
              </button>
            </section>
            <section className="panel p-6">
              <h2 className="flex items-center gap-2 font-display text-base">
                <ShieldCheck className="h-5 w-5 text-gold" /> AKTİF OTURUMLAR
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Bu hesapta 1 aktif oturum bulunuyor (Gaziantep, Chrome).
              </p>
              <button className="mt-4 rounded-md border border-border px-6 py-2.5 text-[11px]">
                TÜM OTURUMLARI KAPAT
              </button>
            </section>
          </div>
        </div>
      </main>
      <TrustBar items={SECURITY_TRUST} />
      <SiteFooter />
    </div>
  );
}
