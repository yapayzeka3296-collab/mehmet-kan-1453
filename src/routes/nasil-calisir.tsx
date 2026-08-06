import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  ChevronRight,
  CreditCard,
  Gift,
  Globe,
  Headphones,
  Mail,
  ShieldCheck,
  ShoppingCart,
  Star,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/nasil-calisir")({
  head: () => ({
    meta: [
      { title: "Nasıl Çalışır? — MySkyParcel" },
      {
        name: "description",
        content:
          "Beş adımda gökyüzü parselini seç, siparişini oluştur, ödemeni yap, sertifikanı al ve hediyeni ulaştır.",
      },
      { property: "og:title", content: "Nasıl Çalışır? — MySkyParcel" },
      { property: "og:description", content: "MySkyParcel süreci 5 basit adımda." },
    ],
  }),
  component: NasilCalisir,
});

const STEPS = [
  { n: 1, icon: Globe, title: "PARSELİNİ SEÇ", text: "Etkileşimli gökyüzü haritasından konumunu seç ve sana özel parselini belirle." },
  { n: 2, icon: ShoppingCart, title: "SİPARİŞİNİ OLUŞTUR", text: "Seçtiğin parsel için paketini belirle, bilgilerini gir ve siparişini tamamla." },
  { n: 3, icon: CreditCard, title: "ÖDEMENİ YAP", text: "Güvenli ödeme altyapımız ile ödemeni kolayca yap, siparişin onaylansın." },
  { n: 4, icon: Award, title: "SERTİFİKANI AL", text: "Dijital sertifikan e-posta ile anında gönderilir. Dilersen çerçeveli baskını kargoyla alırsın." },
  { n: 5, icon: Gift, title: "HEDİYEN HAZIR", text: "Sevdiklerine anlamlı, benzersiz ve unutulmaz bir hediye vermenin mutluluğunu yaşa." },
];

const WHY = [
  { icon: ShieldCheck, title: "GÜVENLİ ALTYAPI", text: "256 Bit SSL ile tüm işlemleriniz güvende." },
  { icon: Award, title: "RESMİ KAYIT", text: "Tüm parseller kaydedilir ve sertifikanız resmi olarak oluşturulur." },
  { icon: Mail, title: "ANINDA TESLİMAT", text: "Dijital sertifikanız e-posta ile anında gönderilir." },
  { icon: Headphones, title: "7/24 DESTEK", text: "Her zaman yanınızdayız. Sorularınız için bize ulaşın." },
  { icon: Star, title: "BENZERSİZ HEDİYE", text: "Sevdiklerinize verebileceğiniz en özel ve anlamlı hediye." },
];

function NasilCalisir() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-4 py-14 lg:px-8">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            NASIL <span className="text-gradient-gold">ÇALIŞIR?</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
            Sadece birkaç adımda gökyüzünde sana özel bir parsel seç, anlamlı bir hediye ile
            sevdiklerine unutulmaz bir deneyim yaşat.
          </p>
        </div>

        <ol className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
          {STEPS.map((s) => (
            <li key={s.n} className="panel relative flex flex-col items-center p-6 pt-10 text-center">
              <span className="absolute -top-5 grid h-10 w-10 place-items-center rounded-full border-2 border-gold bg-background font-display text-lg text-gold">
                {s.n}
              </span>
              <h2 className="font-display text-base">{s.title}</h2>
              <s.icon className="my-8 h-16 w-16 text-gold" />
              <p className="text-xs text-muted-foreground">{s.text}</p>
              <ChevronRight className="absolute -right-5 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-gold xl:block" />
            </li>
          ))}
        </ol>

        <h2 className="mt-16 text-center font-display text-lg tracking-[0.1em] text-gold">
          NEDEN MY SKYPARCEL?
        </h2>
        <div className="panel mt-6 grid gap-6 p-7 sm:grid-cols-2 lg:grid-cols-5">
          {WHY.map((w) => (
            <div key={w.title} className="flex min-w-0 items-start gap-3">
              <w.icon className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.06em]">{w.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{w.text}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <TrustBar />
      <SiteFooter />
    </div>
  );
}
