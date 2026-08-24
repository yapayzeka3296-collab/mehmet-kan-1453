import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/iletisim")({
  head: () => ({
    meta: [
      { title: "İletişim — MySkyParcel" },
      { name: "description", content: "MySkyParcel satıcı ve iletişim bilgileri, destek kanalları." },
      { property: "og:title", content: "İletişim — MySkyParcel" },
      { property: "og:description", content: "MySkyParcel satıcı bilgileri, iletişim ve destek kanalları." },
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
          Sipariş, ödeme, sertifika, teslimat ve diğer destek talepleriniz için aşağıdaki iletişim kanallarından bize ulaşabilirsiniz.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="panel grid content-start gap-5 p-6">
            <div className="flex min-w-0 items-start gap-3">
              <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Satıcı / İşletme</p>
                <p className="text-sm font-medium">MySkyParcel</p>
              </div>
            </div>
            {[
              { icon: Mail, t: "E-posta", v: "info.myskyparcel@gmail.com" },
              { icon: Phone, t: "Telefon", v: "0541 615 97 43" },
              { icon: MapPin, t: "Adres", v: "Kuştepe Mah. Mecidiyeköy Yolu Cad. No:18 34318 Şişli/İstanbul" },
            ].map((c) => (
              <div key={c.t} className="flex min-w-0 items-start gap-3">
                <c.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{c.t}</p>
                  <p className="break-words text-sm">{c.v}</p>
                </div>
              </div>
            ))}
          </aside>

          <form className="panel grid gap-5 p-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs text-muted-foreground">Ad Soyad</span>
                <input name="name" autoComplete="name" className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" />
              </label>
              <label className="block">
                <span className="text-xs text-muted-foreground">E-posta</span>
                <input name="email" type="email" autoComplete="email" className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" />
              </label>
            </div>
            <label className="block">
              <span className="text-xs text-muted-foreground">Konu</span>
              <input name="subject" className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>
            <label className="block">
              <span className="text-xs text-muted-foreground">Mesajınız</span>
              <textarea name="message" rows={6} className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" />
            </label>
            <button type="submit" className="btn-gold w-fit rounded-md px-8 py-3 text-[11px]">GÖNDER</button>
          </form>
        </div>
      </main>
      <TrustBar />
      <SiteFooter />
    </div>
  );
}
