import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/iletisim")({
  head: () => ({
    meta: [
      { title: "İletişim — MySkyParcel" },
      { name: "description", content: "Sorularınız için MySkyParcel destek ekibiyle 7/24 iletişime geçin." },
      { property: "og:title", content: "İletişim — MySkyParcel" },
      { property: "og:description", content: "MySkyParcel iletişim bilgileri ve destek formu." },
    ],
  }),
  component: Iletisim,
});

function Iletisim() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-4 py-14 lg:px-8">
        <h1 className="text-center font-display text-4xl font-bold sm:text-5xl">İLETİŞİM</h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-muted-foreground">
          Her türlü soru, görüş ve destek talebiniz için bize ulaşın. 7/24 yanınızdayız.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="panel grid content-start gap-5 p-6">
            {[
              { icon: Mail, t: "E-posta", v: "destek@myskyparcel.com" },
              { icon: Phone, t: "Telefon", v: "+90 850 000 00 00" },
              { icon: MapPin, t: "Adres", v: "Şehitkamil, Gaziantep, Türkiye" },
            ].map((c) => (
              <div key={c.t} className="flex min-w-0 items-start gap-3">
                <c.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{c.t}</p>
                  <p className="truncate text-sm">{c.v}</p>
                </div>
              </div>
            ))}
          </aside>

          <form className="panel grid gap-5 p-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs text-muted-foreground">Ad Soyad</span>
                <input className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" />
              </label>
              <label className="block">
                <span className="text-xs text-muted-foreground">E-posta</span>
                <input className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" />
              </label>
            </div>
            <label className="block">
              <span className="text-xs text-muted-foreground">Konu</span>
              <input className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Mesajınız</span>
              <textarea
                rows={6}
                className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold"
              />
            </label>
            <button className="btn-gold w-fit rounded-md px-8 py-3 text-[11px]">GÖNDER</button>
          </form>
        </div>
      </main>
      <TrustBar />
      <SiteFooter />
    </div>
  );
}
