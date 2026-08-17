import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { CERTIFICATE_TEMPLATE_IMAGE as certDigital } from "@/lib/certificateTemplate";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/parsel-satin-al")({
  validateSearch: (search: Record<string, unknown>) => ({ parcels: typeof search.parcels === "string" ? search.parcels : "" }),
  head: () => ({ meta: [
    { title: "Parsel Satın Al — MySkyParcel" },
    { name: "description", content: "Parselini seç, bilgilerini gir ve ödeme adımına geç." },
    { property: "og:title", content: "Parsel Satın Al — MySkyParcel" },
    { property: "og:description", content: "Gökyüzü parseli satın alma adımları." },
  ] }),
  component: SatinAl,
});

const STEPS = ["Parsel Seçimi", "Bilgiler", "Ödeme"];

function SatinAl() {
  const navigate = useNavigate({ from: "/parsel-satin-al" });
  const { parcels } = Route.useSearch();

  function handleContinue() {
    if (typeof window !== "undefined") {
      const name = (document.getElementById("certificate-name") as HTMLInputElement | null)?.value.trim() ?? "";
      const message = (document.getElementById("certificate-message") as HTMLTextAreaElement | null)?.value.trim() ?? "";
      sessionStorage.setItem("myskyparcel_purchase", JSON.stringify({ parcels, name, message }));
    }
    void navigate({ to: "/odeme", search: { parcels } });
  }

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-4 py-12 lg:px-8">
        <h1 className="text-center font-display text-4xl font-bold sm:text-5xl">PARSEL SATIN AL</h1>
        <ol className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-4">
          {STEPS.map((s, i) => <li key={s} className="flex items-center gap-2 text-xs"><span className={`grid h-7 w-7 place-items-center rounded-full border ${i === 1 ? "border-gold text-gold" : "border-border text-muted-foreground"}`}>{i + 1}</span><span className={i === 1 ? "text-gold" : "text-muted-foreground"}>{s}</span></li>)}
        </ol>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="panel grid gap-5 p-6">
            <h2 className="font-display text-lg">PARSEL BİLGİLERİ</h2>
            <div className="rounded-xl border border-gold/20 bg-gold/[0.04] p-4"><p className="text-sm font-semibold text-gold">Bu parsel size özel olacaktır.</p><p className="mt-1.5 text-xs leading-5 text-muted-foreground">Bu parselin kendine özel parsel kodu bulunur. Satın alma tamamlandığında parsel hesabınıza kaydedilir ve aynı parsel başka bir kullanıcıya satılamaz veya yeniden oluşturulamaz.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[{ l: "Şehir", v: "Gaziantep" }, { l: "Katman", v: "K05 (5. Katman)" }, { l: "Sektör", v: "S042 (42. Sektör)" }, { l: "Parsel", v: "P07 (7. Parsel)" }].map((f) => <label key={f.l} className="block"><span className="text-xs text-muted-foreground">{f.l}</span><input defaultValue={f.v} readOnly className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" /></label>)}
              <label className="block sm:col-span-2"><span className="text-xs text-muted-foreground">Sertifikada Görünecek Ad Soyad</span><input id="certificate-name" placeholder="Ahmet Yılmaz" autoComplete="name" className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" /></label>
              <label className="block sm:col-span-2"><span className="text-xs text-muted-foreground">Mesajınız (opsiyonel)</span><textarea id="certificate-message" rows={4} placeholder="Sevdiklerinize özel notunuzu yazın..." className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" /></label>
            </div>
            <button type="button" onClick={handleContinue} className="btn-gold inline-flex w-fit items-center gap-2 rounded-md px-6 py-3 text-[11px]">ÖDEMEYE GEÇ <ArrowRight className="h-4 w-4" /></button>
          </section>

          <aside className="panel h-fit p-6"><h2 className="font-display text-base">SİPARİŞ ÖZETİ</h2><img src={certDigital} alt="Sertifika önizleme" loading="lazy" width={800} height={1000} className="mt-4 h-52 w-full rounded-lg object-contain" /><ul className="mt-5 space-y-2 text-sm">{["Premium Sertifika", "QR doğrulama", "E-posta ile anında teslim"].map((i) => <li key={i} className="flex items-start gap-2 text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {i}</li>)}</ul><div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="text-sm text-muted-foreground">Toplam</span><span className="font-display text-2xl text-gold">499 TL</span></div></aside>
        </div>
      </main>
      <TrustBar /><SiteFooter />
    </div>
  );
}
