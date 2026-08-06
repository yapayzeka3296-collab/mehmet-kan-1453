import { createFileRoute } from "@tanstack/react-router";
import { Globe, Heart, Star } from "lucide-react";
import heroCity from "@/assets/hero-city.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/hakkimizda")({
  head: () => ({
    meta: [
      { title: "Hakkımızda — MySkyParcel" },
      { name: "description", content: "MySkyParcel, gökyüzünde sembolik bir parseli anlamlı bir hediyeye dönüştürür." },
      { property: "og:title", content: "Hakkımızda — MySkyParcel" },
      { property: "og:description", content: "MySkyParcel'in hikâyesi ve misyonu." },
    ],
  }),
  component: Hakkimizda,
});

function Hakkimizda() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <img
            src={heroCity}
            alt=""
            aria-hidden
            loading="lazy"
            width={1920}
            height={1088}
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center lg:px-8">
            <h1 className="font-display text-4xl font-bold sm:text-5xl">HAKKIMIZDA</h1>
            <p className="mt-5 text-sm text-muted-foreground">
              MySkyParcel, gökyüzünü sembolik parsellere ayırarak insanların anılarını, sevgilerini ve
              özel anlarını benzersiz bir hediyeye dönüştürmelerini sağlar.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1600px] gap-6 px-4 py-14 lg:grid-cols-3 lg:px-8">
          {[
            { icon: Star, t: "MİSYONUMUZ", d: "Herkesin gökyüzünde sembolik bir yeri olsun; anılar sertifikalarla kalıcı olsun." },
            { icon: Globe, t: "VİZYONUMUZ", d: "Türkiye'nin her şehrinden milyonlarca parseli koleksiyonculara ulaştırmak." },
            { icon: Heart, t: "DEĞERLERİMİZ", d: "Şeffaflık, güvenli altyapı ve gerçekten anlamlı bir hediye deneyimi." },
          ].map((c) => (
            <article key={c.t} className="panel p-7">
              <c.icon className="h-8 w-8 text-gold" />
              <h2 className="mt-4 font-display text-lg">{c.t}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{c.d}</p>
            </article>
          ))}
        </section>
      </main>
      <TrustBar />
      <SiteFooter />
    </div>
  );
}
