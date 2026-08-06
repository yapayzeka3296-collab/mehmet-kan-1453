import { createFileRoute } from "@tanstack/react-router";
import { QrCode, Search, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/sertifika-dogrula")({
  head: () => ({
    meta: [
      { title: "Sertifika Doğrula — MySkyParcel" },
      { name: "description", content: "Parsel kodunu girerek sertifikanın geçerliliğini anında kontrol et." },
      { property: "og:title", content: "Sertifika Doğrula — MySkyParcel" },
      { property: "og:description", content: "QR kod veya parsel kodu ile sertifika doğrulama." },
    ],
  }),
  component: Dogrula,
});

function Dogrula() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-gold" />
          <h1 className="mt-4 font-display text-4xl font-bold">SERTİFİKA DOĞRULA</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Parsel kodunuzu girerek sertifikanızın geçerliliğini kontrol edebilirsiniz.
          </p>
        </div>

        <div className="panel mt-10 p-6 sm:p-10">
          <label className="text-xs text-muted-foreground" htmlFor="kod">
            Parsel Kodu
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              id="kod"
              placeholder="Örn: GZT-K05-S042-P07"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
            />
          </div>
          <button className="btn-gold mt-5 w-full rounded-md py-3.5 text-sm">DOĞRULA</button>

          <div className="mt-8 flex items-start gap-4 rounded-md border border-border bg-background/40 p-5">
            <QrCode className="h-8 w-8 shrink-0 text-gold" />
            <p className="min-w-0 text-sm text-muted-foreground">
              Sertifikanızın üzerindeki QR kodu okutarak da doğrulama yapabilirsiniz.
            </p>
          </div>
        </div>
      </main>
      <TrustBar items={SECURITY_TRUST} />
      <SiteFooter />
    </div>
  );
}
