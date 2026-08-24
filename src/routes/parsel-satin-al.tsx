import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, FileBadge2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";

type Tier = "digital" | "elite" | "premium";
type PurchaseItem = { id: string; tier: Tier; price: number };
type PurchaseSearch = { parcels?: string; tier?: Tier; certificateParcel?: string };

export const Route = createFileRoute("/parsel-satin-al")({
  validateSearch: (search: Record<string, unknown>): PurchaseSearch => ({
    parcels: typeof search.parcels === "string" ? search.parcels : undefined,
    tier: search.tier === "digital" || search.tier === "elite" || search.tier === "premium" ? search.tier : undefined,
    certificateParcel: typeof search.certificateParcel === "string" ? search.certificateParcel : undefined,
  }),
  head: () => ({ meta: [{ title: "Parsel Satın Al — MySkyParcel" }, { name: "description", content: "MySkyParcel üzerinde istediğiniz sayıda sembolik parseli seçin ve yalnızca bir parsel için sertifika talep edin." }] }),
  component: SatinAl,
});

const PRICES: Record<Tier, number> = { digital: 199, elite: 499, premium: 999 };
const NAMES: Record<Tier, string> = { digital: "Dijital", elite: "Özel", premium: "Premium" };
const PHYSICAL: Record<Tier, boolean> = { digital: false, elite: true, premium: true };

function inferTier(parcelId: string): Tier {
  const numeric = Number(parcelId.split("-").pop() ?? 0);
  return numeric <= 500 ? "digital" : numeric <= 800 ? "elite" : "premium";
}

function SatinAl() {
  const navigate = useNavigate({ from: "/parsel-satin-al" });
  const { parcels, certificateParcel: requestedCertificate } = Route.useSearch();
  const ids = useMemo(() => Array.from(new Set((parcels ?? "").split(",").map((v) => v.trim()).filter(Boolean))), [parcels]);
  const items = useMemo<PurchaseItem[]>(() => ids.map((id) => { const tier = inferTier(id); return { id, tier, price: PRICES[tier] }; }), [ids]);
  const [certificateParcel, setCertificateParcel] = useState(requestedCertificate && ids.includes(requestedCertificate) ? requestedCertificate : ids[0] ?? "");
  const [accepted, setAccepted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const certificateTier = certificateParcel ? items.find((item) => item.id === certificateParcel)?.tier ?? "digital" : "digital";
  const physicalReady = !PHYSICAL[certificateTier] || Boolean(name.trim() && phone.trim() && address.trim() && city.trim() && district.trim());
  const total = items.reduce((sum, item) => sum + item.price, 0);
  const grouped = items.reduce<Record<Tier, number>>((acc, item) => { acc[item.tier] += 1; return acc; }, { digital: 0, elite: 0, premium: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem("myskyparcel_purchase_plan", JSON.stringify({ items, certificateParcel }));
  }, [items, certificateParcel]);

  function handleContinue() {
    if (!items.length || !certificateParcel || !accepted || !physicalReady) return;
    if (typeof window !== "undefined" && PHYSICAL[certificateTier]) window.localStorage.setItem("myskyparcel_delivery", JSON.stringify({ name: name.trim(), phone: phone.trim(), address: address.trim(), city: city.trim(), district: district.trim() }));
    void navigate({ to: "/odeme", search: { parcels: ids.join(","), certificateParcel } });
  }

  if (!items.length) return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-3xl px-4 py-16 lg:px-8"><div className="panel p-8 text-center"><h1 className="font-display text-3xl font-bold">PARSEL SEÇİLMEDİ</h1><p className="mt-3 text-sm text-muted-foreground">Ödeme için önce haritadan en az bir sembolik parsel seçin.</p><button type="button" onClick={() => void navigate({ to: "/gokyuzu-haritasi" })} className="btn-gold mt-6 rounded-md px-6 py-3 text-xs">HARİTAYA DÖN</button></div></main><SiteFooter /></div>;

  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8"><h1 className="text-center font-display text-4xl font-bold sm:text-5xl">SATIN ALMA</h1><p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground">İstediğiniz sayıda ve farklı türlerde parsel seçebilirsiniz. Bu siparişte yalnızca <strong className="text-foreground">bir parsel için sertifika</strong> talep edilebilir.</p><div className="mt-10 grid gap-6 lg:grid-cols-[1fr_380px]"><section className="panel p-6 sm:p-8"><h2 className="font-display text-lg">SEÇİLEN PARSELLER ({items.length})</h2><div className="mt-5 space-y-3">{items.map((item) => <div key={item.id} className={`rounded-xl border p-4 ${certificateParcel === item.id ? "border-gold/50 bg-gold/[0.05]" : "border-border"}`}><div className="flex items-center justify-between gap-4"><div><p className="font-medium">{item.id}</p><p className="mt-1 text-xs text-muted-foreground">{NAMES[item.tier]} · {item.price.toLocaleString("tr-TR")} TL</p></div><label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs text-gold"><input type="radio" name="certificateParcel" checked={certificateParcel === item.id} onChange={() => setCertificateParcel(item.id)} /> <FileBadge2 className="h-4 w-4" /> Sertifika bu parsele</label></div></div>)}</div><div className="mt-6 rounded-xl border border-gold/20 bg-gold/[0.04] p-5"><p className="text-sm font-semibold text-gold">Tek sertifika kuralı</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Siparişte kaç parsel olursa olsun yalnızca seçtiğiniz <strong className="text-foreground">{certificateParcel}</strong> için sertifika talebi oluşturulur. Diğer parseller satın alma kaydında tutulur ancak bu siparişten ikinci bir sertifika talebi oluşturulmaz.</p></div>{PHYSICAL[certificateTier] && <div className="mt-6 rounded-xl border border-gold/20 bg-gold/[0.04] p-5"><p className="text-sm font-semibold text-gold">FİZİKSEL SERTİFİKA TESLİMATI</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Seçtiğiniz sertifika {NAMES[certificateTier]} paketine ait olduğu için fiziksel sertifika hazırlanır ve verdiğiniz adrese gönderilir. Hazırlama ve kargo süresi sipariş onayından itibaren 3–7 iş günüdür.</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad Soyad" autoComplete="name" className="rounded-md border border-border bg-background/40 px-3 py-3 text-sm" /><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon" autoComplete="tel" className="rounded-md border border-border bg-background/40 px-3 py-3 text-sm" /><input value={city} onChange={(e) => setCity(e.target.value)} placeholder="İl" autoComplete="address-level1" className="rounded-md border border-border bg-background/40 px-3 py-3 text-sm" /><input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="İlçe" autoComplete="address-level2" className="rounded-md border border-border bg-background/40 px-3 py-3 text-sm" /><textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Açık teslimat adresi" autoComplete="street-address" className="min-h-24 rounded-md border border-border bg-background/40 px-3 py-3 text-sm sm:col-span-2" /></div></div>}<label className="mt-6 flex cursor-pointer items-start gap-3 text-xs text-muted-foreground"><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 accent-current" /><span>Seçtiğim parselleri ve sertifika talep ettiğim tek parseli kontrol ettiğimi; Ön Bilgilendirme Formu, Mesafeli Satış Sözleşmesi ve diğer bilgilendirmelere eriştiğimi onaylıyorum.</span></label><button type="button" disabled={!accepted || !physicalReady} onClick={handleContinue} className="btn-gold mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-[11px] disabled:cursor-not-allowed disabled:opacity-50"><Sparkles className="h-4 w-4" /> ÖDEME PLANI OLUŞTUR <ArrowRight className="h-4 w-4" /></button></section><aside className="panel h-fit p-6 lg:sticky lg:top-6"><h2 className="font-display text-base">SİPARİŞ ÖZETİ</h2><div className="mt-5 space-y-3 text-sm">{(["digital", "elite", "premium"] as Tier[]).filter((tier) => grouped[tier] > 0).map((tier) => <div key={tier} className="flex justify-between"><span className="text-muted-foreground">{NAMES[tier]} × {grouped[tier]}</span><span>{(PRICES[tier] * grouped[tier]).toLocaleString("tr-TR")} TL</span></div>)}<div className="border-t border-border pt-4 flex justify-between"><span className="font-semibold">Toplam</span><span className="font-display text-2xl text-gold">{total.toLocaleString("tr-TR")} TL</span></div><div className="border-t border-border pt-4 text-xs text-muted-foreground"><p><strong className="text-foreground">Sertifika:</strong> {certificateParcel}</p><p className="mt-1">Toplam parsel: {items.length}</p></div></div><ul className="mt-5 space-y-3 text-sm">{["Sınırsız sayıda seçilen sembolik parsel", "Farklı paket türlerini aynı siparişte seçebilme", "Yalnızca bir parsel için sertifika talebi", "Her parsel için benzersiz kayıt"].map((item) => <li key={item} className="flex items-start gap-2 text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{item}</li>)}</ul></aside></div></main><TrustBar /><SiteFooter /></div>;
}
