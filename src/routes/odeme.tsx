import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Lock, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

type Tier = "digital" | "elite" | "premium";

export const Route = createFileRoute("/odeme")({
  validateSearch: (search: Record<string, unknown>) => ({
    parcels: typeof search.parcels === "string" ? search.parcels : "",
    tier: search.tier === "digital" || search.tier === "elite" || search.tier === "premium" ? search.tier : "elite",
  }),
  head: () => ({
    meta: [
      { title: "Ödeme — MySkyParcel" },
      { name: "description", content: "MySkyParcel parsel satın alma ödeme adımı." },
    ],
  }),
  component: Odeme,
});

const PACKAGES: Record<Tier, { name: string; price: number; link: string }> = {
  digital: { name: "Dijital", price: 199, link: import.meta.env.VITE_IYZICO_DIGITAL_LINK?.trim() ?? "" },
  elite: { name: "Özel", price: 499, link: import.meta.env.VITE_IYZICO_ELITE_LINK?.trim() ?? "" },
  premium: { name: "Premium", price: 999, link: import.meta.env.VITE_IYZICO_PREMIUM_LINK?.trim() ?? "" },
};

function Odeme() {
  const navigate = useNavigate({ from: "/odeme" });
  const { parcels, tier } = Route.useSearch();
  const pack = PACKAGES[tier];
  const selectedParcels = parcels ? parcels.split(",").map((value) => value.trim()).filter(Boolean) : [];
  const selectedParcel = selectedParcels[0] ?? "";
  const isSingleParcel = selectedParcels.length === 1;
  const paymentReady = Boolean(pack.link) && isSingleParcel;

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8">
        <h1 className="text-center font-display text-4xl font-bold sm:text-5xl">ÖDEME</h1>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="panel p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3"><Lock className="h-5 w-5 text-gold" /><div><h2 className="font-display text-lg">İYZİCO İLE GÜVENLİ ÖDEME</h2><p className="text-xs text-muted-foreground">Kart bilgilerinizi MySkyParcel üzerinde girmeyin. Ödeme işlemi iyzico'nun güvenli ödeme sayfasında tamamlanır.</p></div></div>
            {!isSingleParcel ? (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-5"><p className="text-sm font-semibold">Tek seferde yalnızca 1 sembolik parsel satın alınabilir.</p><p className="mt-2 text-xs leading-5 text-muted-foreground">İyzico Link paket bazında sabit tutarla çalıştığı için birden fazla parseli aynı ödeme Link'i üzerinden tahsil etmiyoruz. Lütfen satın alma ekranına dönüp tek parsel seçin.</p></div>
            ) : (
              <div className="rounded-xl border border-gold/20 bg-gold/[0.04] p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" /><div><p className="text-sm font-semibold">{pack.name} paketi · {pack.price} TL</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Parsel: {selectedParcel}. Kart bilgileri MySkyParcel üzerinde alınmaz. Ödeme, iyzico'nun oluşturduğunuz resmi Link sayfasında tamamlanır.</p></div></div></div>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => void navigate({ to: "/parsel-satin-al", search: { parcels, tier } })} className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-5 py-3 text-xs"><ArrowLeft className="h-4 w-4" /> BİLGİLERE DÖN</button>
              {paymentReady ? (
                <a href={pack.link} target="_blank" rel="noopener noreferrer" className="btn-gold inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-xs"><Lock className="h-4 w-4" /> İYZİCO İLE ÖDE <ExternalLink className="h-4 w-4" /></a>
              ) : (
                <button type="button" disabled className="btn-gold inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-xs disabled:cursor-not-allowed disabled:opacity-60">{isSingleParcel ? `${pack.name.toUpperCase()} LİNKİ BEKLENİYOR` : "TEK PARSEL SEÇİN"}</button>
              )}
            </div>
            <div className="mt-6 rounded-lg border border-border p-4 text-xs text-muted-foreground"><p>İyzico Link adresleri yalnızca Vercel ortam değişkenlerinden okunur; ödeme bağlantıları GitHub koduna yazılmaz.</p></div>
          </section>

          <aside className="panel h-fit p-6"><h2 className="font-display text-base">SİPARİŞ ÖZETİ</h2><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Seçilen parsel</span><span className="font-semibold">{isSingleParcel ? selectedParcel : "Birden fazla"}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Paket</span><span>{pack.name}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Ödenecek tutar</span><span className="font-display text-2xl text-gold">{pack.price.toLocaleString("tr-TR")} TL</span></div></div></aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
