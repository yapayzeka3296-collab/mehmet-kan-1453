import { Mail, Phone } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/iletisim")({
  head: () => ({
    meta: [
      { title: "İletişim — MySkyParcel" },
      { name: "description", content: "MySkyParcel iletişim bilgileri ve destek kanalları." },
      { property: "og:title", content: "İletişim — MySkyParcel" },
      { property: "og:description", content: "MySkyParcel iletişim bilgileri ve destek kanalları." },
    ],
  }),
  component: Iletisim,
});

function Iletisim() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <section className="panel p-8 text-center sm:p-12">
          <p className="text-xs font-semibold tracking-[0.3em] text-gold">MYSKYPARCEL İLETİŞİM</p>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">BİZE ULAŞIN</h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">
            Sipariş, ödeme, sertifika, sembolik parsel ve diğer konulardaki sorularınız için aşağıdaki iletişim kanallarından bize ulaşabilirsiniz.
          </p>
          <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
            <a href="mailto:info.myskyparcel@gmail.com" className="rounded-xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-gold/40">
              <Mail className="h-6 w-6 text-gold" />
              <p className="mt-3 text-xs text-muted-foreground">E-posta</p>
              <p className="mt-1 break-words text-sm font-medium">info.myskyparcel@gmail.com</p>
            </a>
            <a href="tel:+905416159743" className="rounded-xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-gold/40">
              <Phone className="h-6 w-6 text-gold" />
              <p className="mt-3 text-xs text-muted-foreground">Telefon</p>
              <p className="mt-1 text-sm font-medium">0541 615 97 43</p>
            </a>
          </div>
        </section>
      </main>
      <TrustBar />
      <SiteFooter />
    </div>
  );
}
