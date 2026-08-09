import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Eye, Globe, Layers, Lock, Mail, ShieldCheck, Star } from "lucide-react";
import heroCity from "@/assets/hero-city.jpg";
import globe from "@/assets/globe.png";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/giris")({
  head: () => ({
    meta: [
      { title: "Giriş Yap — MySkyParcel" },
      { name: "description", content: "Hesabına giriş yaparak parsellerini yönet ve sertifikalarına ulaş." },
      { property: "og:title", content: "Giriş Yap — MySkyParcel" },
      { property: "og:description", content: "MySkyParcel hesabına giriş yap." },
    ],
  }),
  component: GirisPage,
});

const FEATURES = [
  { icon: Globe, big: "81 MİLYON", label: "Toplam Gökyüzü Parseli" },
  { icon: Layers, big: "10 Katman", label: "Her İl İçin" },
  { icon: ShieldCheck, big: "1.000 Sektör", label: "Her İl İçin" },
  { icon: Lock, big: "1.000.000 Parsel", label: "Her İl İçin" },
];

function GirisPage() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="relative overflow-hidden">
        <img src={heroCity} alt="" aria-hidden width={1920} height={1088} className="absolute inset-x-0 bottom-0 h-[70%] w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <img src={globe} alt="" aria-hidden width={1024} height={1024} className="pointer-events-none absolute right-[28%] top-0 hidden h-[110%] opacity-40 mix-blend-screen xl:block" />
        <div className="relative mx-auto grid max-w-[1600px] gap-10 px-4 py-14 lg:grid-cols-2 lg:px-8">
          <div className="min-w-0">
            <span className="inline-block rounded-md border border-gold/50 px-4 py-2 text-[10px] leading-5 tracking-[0.10em] text-gold">HER İL İÇİN 10 KATMAN · 1.000 SEKTÖR · 1.000.000 PARSEL<br /><strong>TOPLAM 81 MİLYON GÖKYÜZÜ PARSELİ</strong></span>
            <h1 className="mt-6 font-display text-4xl leading-tight font-bold sm:text-5xl">GÖKYÜZÜNDE<br /><span className="text-gradient-gold">SANA ÖZEL</span><br />BİR YER</h1>
            <p className="mt-5 max-w-md text-sm text-muted-foreground">Kendinize veya sevdiklerinize unutulmaz bir hediye verin. Gökyüzündeki yerinizi seçin, sertifikanızı alın ve bu eşsiz deneyimin bir parçası olun.</p>
            <ul className="mt-10 flex flex-wrap gap-8">{FEATURES.map((f) => <li key={f.big} className="min-w-0"><f.icon className="h-7 w-7 text-gold" /><p className="mt-2 text-sm font-semibold">{f.big}</p><p className="text-xs text-muted-foreground">{f.label}</p></li>)}</ul>
          </div>
          <div className="panel min-w-0 p-6 sm:p-10">
            <div className="text-center"><Star className="mx-auto h-6 w-6 text-gold" /><h2 className="mt-4 font-display text-3xl">GİRİŞ YAP</h2><p className="mt-3 text-sm text-muted-foreground">Hesabınıza giriş yaparak parsellerinizi yönetin ve sertifikalarınıza ulaşın.</p></div>
            <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div><label className="text-xs text-muted-foreground" htmlFor="email">E-posta Adresiniz</label><div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold"><Mail className="h-4 w-4 shrink-0 text-muted-foreground" /><input id="email" type="email" placeholder="ornek@email.com" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /></div></div>
              <div><label className="text-xs text-muted-foreground" htmlFor="pass">Şifreniz</label><div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold"><Lock className="h-4 w-4 shrink-0 text-muted-foreground" /><input id="pass" type="password" placeholder="••••••••••" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /><Eye className="h-4 w-4 shrink-0 text-muted-foreground" /></div></div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs"><label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-[oklch(0.78_0.13_82)]" />Beni hatırla</label><Link to="/sifremi-unuttum" className="text-gold hover:underline">Şifremi unuttum?</Link></div>
              <button className="btn-gold flex w-full items-center justify-center gap-3 rounded-md py-3.5 text-sm">GİRİŞ YAP <ArrowRight className="h-4 w-4" /></button>
              <div className="flex items-center gap-4 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /> veya <span className="h-px flex-1 bg-border" /></div>
              <div className="grid gap-3 sm:grid-cols-2"><button type="button" className="rounded-md border border-border py-3 text-sm transition-colors hover:border-gold">Google ile giriş yap</button><button type="button" className="rounded-md border border-border py-3 text-sm transition-colors hover:border-gold">Apple ile giriş yap</button></div>
              <p className="text-center text-sm text-muted-foreground">Hesabınız yok mu? <Link to="/kayit-ol" className="text-gold hover:underline">Kayıt olun</Link></p>
            </form>
          </div>
        </div>
        <TrustBar items={SECURITY_TRUST} />
      </main>
      <SiteFooter />
    </div>
  );
}
