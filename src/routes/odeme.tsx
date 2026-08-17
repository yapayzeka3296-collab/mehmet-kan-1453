import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/odeme")({
  validateSearch: (search: Record<string, unknown>) => ({ parcels: typeof search.parcels === "string" ? search.parcels : "" }),
  head: () => ({
    meta: [
      { title: "Ödeme — MySkyParcel" },
      { name: "description", content: "MySkyParcel parsel satın alma ödeme adımı." },
    ],
  }),
  component: Odeme,
});

const STEPS = ["Parsel Seçimi", "Bilgiler", "Ödeme"];

function Odeme() {
  const navigate = useNavigate({ from: "/odeme" });
  const { parcels } = Route.useSearch();

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8">
        <h1 className="text-center font-display text-4xl font-bold sm:text-5xl">ÖDEME</h1>
        <ol className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-4">
          {STEPS.map((s, i) => <li key={s} className="flex items-center gap-2 text-xs"><span className={`grid h-7 w-7 place-items-center rounded-full border ${i === 2 ? "border-gold text-gold" : "border-border text-muted-foreground"}`}>{i + 1}</span><span className={i === 2 ? "text-gold" : "text-muted-foreground"}>{s}</span></li>)}
        </ol>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="panel p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3"><Lock className="h-5 w-5 text-gold" /><div><h2 className="font-display text-lg">GÜVENLİ ÖDEME</h2><p className="text-xs text-muted-foreground">Sipariş bilgilerinizi kontrol ederek ödeme adımına geçebilirsiniz.</p></div></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2"><span className="text-xs text-muted-foreground">Kart Üzerindeki Ad Soyad</span><input autoComplete="cc-name" placeholder="Ahmet Yılmaz" className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-3 text-sm outline-none focus:border-gold" /></label>
              <label className="block sm:col-span-2"><span className="text-xs text-muted-foreground">Kart Numarası</span><input inputMode="numeric" autoComplete="cc-number" placeholder="0000 0000 0000 0000" className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-3 text-sm outline-none focus:border-gold" /></label>
              <label className="block"><span className="text-xs text-muted-foreground">Son Kullanma Tarihi</span><input autoComplete="cc-exp" placeholder="AA/YY" className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-3 text-sm outline-none focus:border-gold" /></label>
              <label className="block"><span className="text-xs text-muted-foreground">CVV</span><input inputMode="numeric" autoComplete="cc-csc" placeholder="123" className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-3 text-sm outline-none focus:border-gold" /></label>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between"><button type="button" onClick={() => void navigate({ to: "/parsel-satin-al", search: { parcels } })} className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-5 py-3 text-xs"><ArrowLeft className="h-4 w-4" /> BİLGİLERE DÖN</button><button type="button" disabled className="btn-gold inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-xs disabled:cursor-not-allowed disabled:opacity-60"><Lock className="h-4 w-4" /> ÖDEMEYİ TAMAMLA</button></div>
            <div className="mt-6 rounded-lg border border-gold/20 bg-gold/[0.04] p-4 text-xs text-muted-foreground"><ShieldCheck className="mb-2 h-5 w-5 text-gold" /><p>Ödeme sağlayıcısı entegrasyonu tamamlandığında kart bilgileri doğrudan güvenli ödeme sağlayıcısına gönderilecektir. Bu arayüz şu anda gerçek tahsilat yapmaz.</p></div>
          </section>

          <aside className="panel h-fit p-6"><h2 className="font-display text-base">SİPARİŞ ÖZETİ</h2><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Seçilen parseller</span><span className="font-semibold">{parcels ? parcels.split(",").filter(Boolean).length : 0}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Sertifika paketi</span><span>Premium</span></div><div className="flex justify-between border-t border-border pt-4"><span className="text-muted-foreground">Toplam</span><span className="font-display text-2xl text-gold">499 TL</span></div></div></aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
