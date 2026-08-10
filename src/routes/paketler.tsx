import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, CloudDownload, Heart, Lock, ShieldCheck, Star } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/paketler")({
  head: () => ({
    meta: [
      { title: "Paketlerimiz — MySkyParcel" },
      {
        name: "description",
        content:
          "Dijital sertifika 199 TL, Premium sertifika 499 TL, çerçeveli baskı 999 TL. Gökyüzü parselin için paketini seç.",
      },
      { property: "og:title", content: "Paketlerimiz — MySkyParcel" },
      { property: "og:description", content: "Gökyüzü parseli sertifika paketleri ve fiyatları." },
    ],
  }),
  component: Paketler,
});

const PLANS = [
  {
    name: "DİJİTAL SERTİFİKA",
    price: "199",
    img: "/certificates/digital-certificate.jpg",
    popular: false,
    features: ["Dijital sertifika", "Parsel kodu ve koordinatlar", "QR doğrulama", "E-posta ile anında teslim"],
  },
  {
    name: "PREMIUM SERTİFİKA",
    price: "499",
    img: "/certificates/elite-certificate.jpg",
    popular: true,
    features: [
      "Özel tasarım sertifika",
      "Dijital sertifika",
      "Parsel kodu ve koordinatlar",
      "QR doğrulama",
      "E-posta ile anında teslim",
    ],
  },
  {
    name: "ÇERÇEVELİ BASKI (A4)",
    price: "999",
    img: "/certificates/premium-certificate.jpg",
    popular: false,
    features: [
      "Özel tasarım sertifika",
      "Çerçeveli baskı (A4)",
      "Dijital sertifika",
      "Parsel kodu ve koordinatlar",
      "QR doğrulama",
    ],
  },
];

const BENEFITS = [
  { icon: Star, title: "BENZERSİZ PARSEL", text: "Milyonlarca sembolik parsel içinden sana özel olanı seç." },
  { icon: ShieldCheck, title: "KİŞİYE ÖZEL SERTİFİKA", text: "Özel tasarım sertifikayla bu anı ölümsüzleştir." },
  { icon: CloudDownload, title: "DİJİTAL & FİZİKSEL", text: "Dijital sertifikanı hemen al, istersen fiziksel baskıyı kapına getirelim." },
  { icon: Lock, title: "GÜVENLİ & ŞEFFAF", text: "Tüm işlemler 256 Bit SSL ile korunur. Güvenli ödeme altyapısı." },
  { icon: Heart, title: "ANLAMLI BİR HEDİYE", text: "Sevdiklerin için unutulmaz ve farklı bir hediye seçeneği." },
];

function Paketler() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-4 py-14 lg:px-8">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">PAKETLERİMİZ</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Gökyüzünde sana özel bir parsel seç, anlamlı bir hediye ile sevdiklerine unutulmaz bir
            deneyim yaşat.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <article
              key={p.name}
              className={`panel relative flex flex-col p-7 ${p.popular ? "border-gold/70" : ""}`}
            >
              {p.popular && (
                <span className="btn-gold absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[10px]">
                  EN POPÜLER
                </span>
              )}
              <h2 className="text-center font-display text-xl">{p.name}</h2>
              <p className="mt-2 text-center font-display text-4xl text-gold">
                {p.price} <span className="text-lg">TL</span>
              </p>
              <img
                src={p.img}
                alt={p.name}
                loading="lazy"
                width={900}
                height={800}
                className="mt-6 h-56 w-full rounded-lg object-contain"
              />
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/giris"
                className="btn-gold mt-8 flex items-center justify-center gap-3 rounded-md py-3 text-sm"
              >
                HEMEN AL <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>

        <div className="panel mt-10 grid gap-6 p-7 sm:grid-cols-2 lg:grid-cols-5">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex min-w-0 items-start gap-3">
              <b.icon className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-[0.06em]">{b.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{b.text}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
