import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";

type Tier = "digital" | "elite" | "premium";
type PurchaseSearch = { parcels?: string; tier?: Tier };

export const Route = createFileRoute("/parsel-satin-al")({
  validateSearch: (search: Record<string, unknown>): PurchaseSearch => ({
    parcels: typeof search.parcels === "string" ? search.parcels : undefined,
    tier: search.tier === "digital" || search.tier === "elite" || search.tier === "premium" ? search.tier : undefined,
  }),
  head: () => ({ meta: [{ title: "Parsel Satın Al — MySkyParcel" }, { name: "description", content: "MySkyParcel sembolik parsel kaydı ve sertifika satın alma adımını tamamlayın." }] }),
  component: SatinAl,
});

const STEPS = ["Parsel Seçimi", "Bilgiler", "Ödeme"];
const PACKAGES: Record<Tier, { name: string; price: number; physical: boolean }> = {
  digital: { name: "Dijital", price: 199, physical: false },
  elite: { name: "Özel", price: 499, physical: true },
  premium: { name: "Premium", price: 999, physical: true },
};

function SatinAl() {
  const navigate = useNavigate({ from: "/parsel-satin-al" });
  const { parcels, tier: queryTier } = Route.useSearch();
  const storedTier = typeof window !== "undefined" ? window.localStorage.getItem("myskyparcel_selected_tier") : null;
  const tier: Tier = queryTier ?? (storedTier === "digital" || storedTier === "elite" || storedTier === "premium" ? storedTier : "elite");
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const selectedParcel = parcels?.split(",").filter(Boolean)[0] || "GZ-K05-S042-P07";
  const pack = PACKAGES[tier];
  const parcelCount = parcels ? parcels.split(",").filter(Boolean).length : 1;
  const total = pack.price * parcelCount;
  const physicalReady = !pack.physical || Boolean(name.trim() && phone.trim() && address.trim() && city.trim() && district.trim());

  function handleContinue() {
    if (!accepted || !physicalReady) return;
    if (typeof window !== "undefined" && pack.physical) {
      window.localStorage.setItem("myskyparcel_delivery", JSON.stringify({ name: name.trim(), phone: phone.trim(), address: address.trim(), city: city.trim(), district: district.trim() }));
    }
    void navigate({ to: "/odeme", search: { parcels: parcels ?? "", tier } });
  }

  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8"><h1 className="text-center font-display text-4xl font-bold sm:text-5xl">PARSEL SATIN AL</h1><ol className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-4">{STEPS.map((step, index) => <li key={step} className="flex items-center gap-2 text-xs"><span className={`grid h-7 w-7 place-items-center rounded-full border ${index === 1 ? "border-gold text-gold" : "border-border text-muted-foreground"}`}>{index + 1}</span><span className={index === 1 ? "text-gold" : "text-muted-foreground"}>{step}</span></li>)}</ol><div className="mt-10 grid gap-6 lg:grid-cols-[1fr_420px]"><section className="panel p-6"><h2 className="font-display text-lg">PARSEL BİLGİLERİ</h2><div className="mt-5 rounded-xl border border-gold/20 bg-gold/[0.04] p-5"><p className="text-sm font-semibold text-gold">{pack.name} paketi seçildi.</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Bu işlem MySkyParcel üzerindeki sembolik parsel kaydının ve seçilen sertifika hizmetinin satın alınmasıdır. Gerçek taşınmaz, arazi veya gökyüzü mülkiyeti oluşturmaz.</p></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{[{ label: "Şehir", value: "Gaziantep" }, { label: "Katman", value: "K05 (5. Katman)" }, { label: "Sektör", value: "S042 (42. Sektör)" }, { label: "Parsel", value: selectedParcel }].map((field) => <div key={field.label} className="rounded-lg border border-border bg-background/30 p-4"><p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{field.label}</p><p className="mt-2 font-medium">{field.value}</p></div>)}</div><div className="mt-6 rounded-lg border border-border p-4"><p className="text-xs font-semibold text-gold">SERTİFİKA PAKETİ</p><p className="mt-2 text-xs leading-5 text-muted-foreground">{pack.name} paket fiyatı parsel başına {pack.price} TL'dir. {parcelCount} parsel için toplam {total} TL.</p></div>{pack.physical && <div className="mt-6 rounded-xl border border-gold/20 bg-gold/[0.04] p-5"><p className="text-sm font-semibold text-gold">FİZİKSEL TESLİMAT BİLGİLERİ</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Özel ve Premium paketlerde fiziksel sertifika belirtilen adrese gönderilir. Hazırlama ve kargo süresi sipariş onayından itibaren 3–7 iş günüdür. Kargo firması ve takip bilgisi, gönderim oluşturulduğunda iletişim bilgileriniz üzerinden paylaşılır.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad Soyad" autoComplete="name" className="rounded-md border border-border bg-background/40 px-3 py-3 text-sm" /><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon" autoComplete="tel" className="rounded-md border border-border bg-background/40 px-3 py-3 text-sm" /><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="İl" autoComplete="address-level1" className="rounded-md border border-border bg-background/40 px-3 py-3 text-sm" /><input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="İlçe" autoComplete="address-level2" className="rounded-md border border-border bg-background/40 px-3 py-3 text-sm" /><textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Açık teslimat adresi" autoComplete="street-address" className="min-h-24 rounded-md border border-border bg-background/40 px-3 py-3 text-sm sm:col-span-2" /></div><p className="mt-3 text-[11px] text-muted-foreground">Teslimat bilgileriniz yalnızca siparişin hazırlanması ve gönderilmesi amacıyla kullanılacaktır.</p></div>}<label className="mt-6 flex cursor-pointer items-start gap-3 text-xs text-muted-foreground"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-0.5 accent-current" /><span>Parsel bilgilerimi kontrol ettiğimi ve satın alma öncesi sunulan bilgilendirme ve sözleşmelere eriştiğimi onaylıyorum.</span></label><button type="button" disabled={!accepted || !physicalReady} onClick={handleContinue} className="btn-gold mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-[11px] disabled:cursor-not-allowed disabled:opacity-50"><Sparkles className="h-4 w-4" /> ÖDEMEYE GEÇ <ArrowRight className="h-4 w-4" /></button></section><aside className="panel h-fit p-5 lg:sticky lg:top-6"><h2 className="font-display text-base">SATIN ALMA ÖZETİ</h2><p className="mt-4 text-xs text-muted-foreground">Seçilen sembolik parsel</p><p className="mt-1 font-display text-xl text-gold">{selectedParcel}</p><div className="mt-5 border-t border-border pt-4 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Paket</span><span>{pack.name}</span></div><div className="mt-2 flex justify-between"><span className="text-muted-foreground">Parsel sayısı</span><span>{parcelCount}</span></div><div className="mt-3 flex justify-between"><span className="font-semibold">Toplam</span><span className="font-display text-2xl text-gold">{total} TL</span></div>{pack.physical && <div className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">Fiziksel teslimat: 3–7 iş günü</div>}</div><ul className="mt-5 space-y-3 text-sm">{["Benzersiz parsel kodu", "Hesabınıza dijital kayıt", "Sembolik parsel kaydı", "Paket kapsamındaki sertifika", ...(pack.physical ? ["Fiziksel sertifikanın adrese gönderimi"] : [])].map((item) => <li key={item} className="flex items-start gap-2 text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{item}</li>)}</ul></aside></div></main><TrustBar /><SiteFooter /></div>;
}
