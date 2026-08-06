import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Headphones, Info, Lock, Mail, ShieldCheck, UserLock } from "lucide-react";
import heroCity from "@/assets/hero-city.jpg";
import globe from "@/assets/globe.png";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/sifremi-unuttum")({
  head: () => ({
    meta: [
      { title: "Şifremi Unuttum — MySkyParcel" },
      {
        name: "description",
        content: "E-posta adresinizi girin, şifrenizi sıfırlamanız için size bir bağlantı gönderelim.",
      },
      { property: "og:title", content: "Şifremi Unuttum — MySkyParcel" },
      { property: "og:description", content: "Şifre sıfırlama bağlantısı talep edin." },
    ],
  }),
  component: SifremiUnuttum,
});

const BADGES = [
  { icon: ShieldCheck, title: "GÜVENLİ", text: "256 Bit SSL ile güvenli bağlantı" },
  { icon: Mail, title: "HIZLI", text: "E-posta ile anında şifre sıfırlama" },
  { icon: UserLock, title: "KORUNAN", text: "Bilgileriniz koruma altında" },
  { icon: Headphones, title: "7/24 DESTEK", text: "Her zaman yanınızdayız" },
];

function SifremiUnuttum() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="relative overflow-hidden">
        <img
          src={heroCity}
          alt=""
          aria-hidden
          width={1920}
          height={1088}
          className="absolute inset-x-0 bottom-0 h-[65%] w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <img
          src={globe}
          alt=""
          aria-hidden
          width={1024}
          height={1024}
          className="pointer-events-none absolute left-[30%] top-0 hidden h-[105%] opacity-40 mix-blend-screen xl:block"
        />

        <div className="relative mx-auto grid max-w-[1600px] gap-10 px-4 py-14 lg:grid-cols-2 lg:px-8">
          <div className="min-w-0">
            <h1 className="font-display text-4xl leading-tight font-bold sm:text-5xl">
              ŞİFREMİ
              <br />
              <span className="text-gradient-gold">UNUTTUM</span>
            </h1>
            <p className="mt-5 max-w-sm text-sm text-muted-foreground">
              E-posta adresinizi girin, şifrenizi sıfırlamanız için size bir bağlantı gönderelim.
            </p>
            <ul className="mt-10 flex flex-wrap gap-6">
              {BADGES.map((b) => (
                <li key={b.title} className="w-28 min-w-0">
                  <b.icon className="h-7 w-7 text-gold" />
                  <p className="mt-2 text-xs font-semibold tracking-[0.06em]">{b.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{b.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel min-w-0 p-6 sm:p-10">
            <div className="text-center">
              <h2 className="font-display text-3xl">ŞİFREMİ UNUTTUM</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Kayıtlı e-posta adresinizi girin, şifre sıfırlama bağlantınızı içeren bir e-posta
                gönderelim.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="text-xs text-muted-foreground" htmlFor="mail">
                  E-posta Adresiniz
                </label>
                <div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <input
                    id="mail"
                    type="email"
                    placeholder="ornek@email.com"
                    className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 rounded-md border border-border bg-background/40 p-4">
                <Info className="h-5 w-5 shrink-0 text-info" />
                <p className="min-w-0 text-sm text-muted-foreground">
                  E-posta adresinizi bilmiyorsanız bizimle iletişime geçebilirsiniz.{" "}
                  <Link to="/iletisim" className="text-gold hover:underline">
                    İletişim sayfasına git →
                  </Link>
                </p>
              </div>

              <button className="btn-gold flex w-full items-center justify-center gap-3 rounded-md py-3.5 text-sm">
                ŞİFRE SIFIRLAMA BAĞLANTISI GÖNDER <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> veya <span className="h-px flex-1 bg-border" />
              </div>

              <Link
                to="/giris"
                className="mx-auto flex w-fit items-center gap-2 rounded-md border border-border px-6 py-3 text-sm transition-colors hover:border-gold"
              >
                <Lock className="h-4 w-4" /> Giriş sayfasına dön
              </Link>
            </form>
          </div>
        </div>

        <TrustBar items={SECURITY_TRUST} />
      </main>
      <SiteFooter />
    </div>
  );
}
