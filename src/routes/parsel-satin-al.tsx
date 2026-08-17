import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { getCertificateTemplateImage } from "@/lib/certificateTemplate";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/parsel-satin-al")({
  validateSearch: (search: Record<string, unknown>) => ({ parcels: typeof search.parcels === "string" ? search.parcels : "" }),
  head: () => ({ meta: [
    { title: "Parsel Satın Al — MySkyParcel" },
    { name: "description", content: "Parselini seç, bilgilerini gir ve kişisel sertifikanı oluştur." },
    { property: "og:title", content: "Parsel Satın Al — MySkyParcel" },
    { property: "og:description", content: "Gökyüzü parselinizi kişiselleştirin." },
  ] }),
  component: SatinAl,
});

const STEPS = ["Parsel Seçimi", "Bilgiler", "Ödeme"];
const MAX_MESSAGE_LENGTH = 180;

function SatinAl() {
  const navigate = useNavigate({ from: "/parsel-satin-al" });
  const { parcels } = Route.useSearch();
  const [certificateName, setCertificateName] = useState("");
  const [message, setMessage] = useState("");
  const [certificateCreated, setCertificateCreated] = useState(false);

  const selectedParcel = parcels?.split(",").filter(Boolean)[0] || "GZ-K05-S042-P07";
  const certificateImage = getCertificateTemplateImage("premium");

  function handleCreateCertificate() {
    const cleanName = certificateName.trim();
    const cleanMessage = message.trim();
    if (!cleanName) {
      document.getElementById("certificate-name")?.focus();
      return;
    }

    const purchase = {
      parcels,
      name: cleanName,
      message: cleanMessage,
      tier: "premium",
      certificateCreated: true,
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem("myskyparcel_purchase", JSON.stringify(purchase));
    }
    setCertificateCreated(true);
  }

  function handleContinue() {
    if (!certificateCreated) {
      handleCreateCertificate();
      return;
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

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
          <section className="panel grid gap-5 p-6">
            <h2 className="font-display text-lg">PARSEL BİLGİLERİ</h2>
            <div className="rounded-xl border border-gold/20 bg-gold/[0.04] p-4"><p className="text-sm font-semibold text-gold">Bu parsel size özel olacaktır.</p><p className="mt-1.5 text-xs leading-5 text-muted-foreground">Bu parselin kendine özel parsel kodu bulunur. Satın alma tamamlandığında parsel hesabınıza kaydedilir ve aynı parsel başka bir kullanıcıya satılamaz veya yeniden oluşturulamaz.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[{ l: "Şehir", v: "Gaziantep" }, { l: "Katman", v: "K05 (5. Katman)" }, { l: "Sektör", v: "S042 (42. Sektör)" }, { l: "Parsel", v: "P07 (7. Parsel)" }].map((f) => <label key={f.l} className="block"><span className="text-xs text-muted-foreground">{f.l}</span><input defaultValue={f.v} readOnly className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" /></label>)}
              <label className="block sm:col-span-2"><span className="text-xs text-muted-foreground">Sertifikada Görünecek Ad Soyad</span><input id="certificate-name" value={certificateName} onChange={(e) => { setCertificateName(e.target.value); setCertificateCreated(false); }} placeholder="Ahmet Yılmaz" autoComplete="name" className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" /></label>
              <label className="block sm:col-span-2"><span className="text-xs text-muted-foreground">Mesajınız (opsiyonel)</span><textarea id="certificate-message" value={message} onChange={(e) => { setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH)); setCertificateCreated(false); }} rows={4} maxLength={MAX_MESSAGE_LENGTH} placeholder="Sevdiklerinize özel notunuzu yazın..." className="mt-1.5 w-full resize-none rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" /><span className="mt-1 block text-right text-[10px] text-muted-foreground">{message.length}/{MAX_MESSAGE_LENGTH}</span></label>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={handleCreateCertificate} className="btn-gold inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-[11px]"><Sparkles className="h-4 w-4" /> {certificateCreated ? "SERTİFİKA GÜNCELLENDİ" : "SERTİFİKA OLUŞTUR"}</button>
              {certificateCreated && <button type="button" onClick={handleContinue} className="inline-flex items-center justify-center gap-2 rounded-md border border-gold/40 px-6 py-3 text-[11px] text-gold">ÖDEMEYE GEÇ <ArrowRight className="h-4 w-4" /></button>}
            </div>
          </section>

          <aside className="panel h-fit p-4 sm:p-6 lg:sticky lg:top-6">
            <div className="flex items-center justify-between"><h2 className="font-display text-base">SERTİFİKA ÖNİZLEME</h2><span className="rounded-full border border-gold/25 px-2 py-1 text-[9px] text-gold">CANLI ÖNİZLEME</span></div>
            <div className="relative mt-4 overflow-hidden rounded-lg border border-gold/30 bg-white shadow-lg">
              <img src={certificateImage} alt="Premium sertifika şablonu önizlemesi" width={1600} height={1067} loading="eager" decoding="async" className="block aspect-[1600/1067] w-full object-cover" />
              <div className="pointer-events-none absolute inset-x-[12%] bottom-[7%] text-center">
                <p className="mx-auto max-w-[85%] truncate text-[clamp(8px,1.4vw,15px)] font-semibold text-black/80">{certificateName.trim() || "Ad Soyad"}</p>
                <p className="mx-auto mt-1 max-w-[78%] break-words text-[clamp(6px,0.9vw,10px)] leading-tight text-black/70">{message.trim() || "Özel mesajınız QR kodunun altında burada görünecek."}</p>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">Ad soyad ve mesajınızı yazdıkça sertifika önizlemesi anında güncellenir. Gerçek QR kodu ödeme tamamlandıktan sonra oluşturulan sertifikaya bağlanacaktır.</p>
            <ul className="mt-5 space-y-2 text-sm">{["Premium Sertifika", "QR doğrulama", "E-posta ile anında teslim"].map((i) => <li key={i} className="flex items-start gap-2 text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {i}</li>)}</ul>
            <div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="text-sm text-muted-foreground">Toplam</span><span className="font-display text-2xl text-gold">499 TL</span></div>
            <p className="mt-3 text-center text-[10px] text-muted-foreground">Parsel: {selectedParcel}</p>
          </aside>
        </div>
      </main>
      <TrustBar /><SiteFooter />
    </div>
  );
}
