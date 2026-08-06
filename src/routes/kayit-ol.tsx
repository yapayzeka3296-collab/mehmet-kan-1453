import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import heroCity from "@/assets/hero-city.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/kayit-ol")({
  head: () => ({
    meta: [
      { title: "Kayıt Ol — MySkyParcel" },
      { name: "description", content: "Ücretsiz hesap oluştur, gökyüzündeki parselini seç ve sertifikanı al." },
      { property: "og:title", content: "Kayıt Ol — MySkyParcel" },
      { property: "og:description", content: "MySkyParcel'e ücretsiz üye ol." },
    ],
  }),
  component: KayitOl,
});

function KayitOl() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="relative overflow-hidden">
        <img
          src={heroCity}
          alt=""
          aria-hidden
          loading="lazy"
          width={1920}
          height={1088}
          className="absolute inset-x-0 bottom-0 h-[70%] w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/30" />

        <div className="relative mx-auto grid max-w-[1600px] gap-10 px-4 py-14 lg:grid-cols-2 lg:px-8">
          <div className="min-w-0">
            <h1 className="font-display text-4xl leading-tight font-bold sm:text-5xl">
              HESABINI
              <br />
              <span className="text-gradient-gold">OLUŞTUR</span>
            </h1>
            <p className="mt-5 max-w-md text-sm text-muted-foreground">
              Ücretsiz üye ol, gökyüzünde sana özel parselini seç ve sertifikanı anında e-posta ile al.
            </p>
          </div>

          <div className="panel min-w-0 p-6 sm:p-10">
            <h2 className="text-center font-display text-3xl">KAYIT OL</h2>
            <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
              {[
                { id: "ad", label: "Ad Soyad", icon: User, type: "text", ph: "Ahmet Yılmaz" },
                { id: "mail", label: "E-posta Adresiniz", icon: Mail, type: "email", ph: "ornek@email.com" },
                { id: "sifre", label: "Şifreniz", icon: Lock, type: "password", ph: "••••••••••" },
                { id: "sifre2", label: "Şifre Tekrar", icon: Lock, type: "password", ph: "••••••••••" },
              ].map((f) => (
                <div key={f.id}>
                  <label className="text-xs text-muted-foreground" htmlFor={f.id}>
                    {f.label}
                  </label>
                  <div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold">
                    <f.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                      id={f.id}
                      type={f.type}
                      placeholder={f.ph}
                      className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
                    />
                  </div>
                </div>
              ))}

              <label className="flex items-start gap-2 text-xs text-muted-foreground">
                <input type="checkbox" className="mt-0.5 accent-[oklch(0.78_0.13_82)]" />
                <span>
                  <span className="text-gold">Kullanım şartları</span> ve{" "}
                  <span className="text-gold">gizlilik politikasını</span> okudum, kabul ediyorum.
                </span>
              </label>

              <button className="btn-gold flex w-full items-center justify-center gap-3 rounded-md py-3.5 text-sm">
                KAYIT OL <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Zaten hesabınız var mı?{" "}
                <Link to="/giris" className="text-gold hover:underline">
                  Giriş yapın
                </Link>
              </p>
            </form>
          </div>
        </div>

        <TrustBar items={SECURITY_TRUST} />
      </main>
      <SiteFooter />
    </div>
  );
}
