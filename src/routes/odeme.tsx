import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Lock, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

type Tier = "digital" | "elite" | "premium";
type PaymentGroup = { tier: Tier; name: string; price: number; link: string; count: number; parcels: string[] };

export const Route = createFileRoute("/odeme")({
  validateSearch: (search: Record<string, unknown>) => ({
    parcels: typeof search.parcels === "string" ? search.parcels : "",
    certificateParcel: typeof search.certificateParcel === "string" ? search.certificateParcel : "",
  }),
  head: () => ({ meta: [{ title: "Ödeme — MySkyParcel" }, { name: "description", content: "MySkyParcel çoklu parsel ödeme planı." }] }),
  component: Odeme,
});

const PACKAGES: Record<Tier, { name: string; price: number; link: string }> = {
  digital: { name: "Dijital", price: 199, link: import.meta.env.VITE_IYZICO_DIGITAL_LINK?.trim() ?? "" },
  elite: { name: "Özel", price: 499, link: import.meta.env.VITE_IYZICO_ELITE_LINK?.trim() ?? "" },
  premium: { name: "Premium", price: 999, link: import.meta.env.VITE_IYZICO_PREMIUM_LINK?.trim() ?? "" },
};

function inferTier(parcelId: string): Tier {
  const numeric = Number(parcelId.split("-").pop() ?? 0);
  return numeric <= 500 ? "digital" : numeric <= 800 ? "elite" : "premium";
}

function Odeme() {
  const navigate = useNavigate({ from: "/odeme" });
  const { parcels, certificateParcel } = Route.useSearch();
  const selectedParcels = Array.from(new Set(parcels.split(",").map((value) => value.trim()).filter(Boolean)));
  const groups = (["digital", "elite", "premium"] as Tier[]).map((tier): PaymentGroup | null => {
    const tierParcels = selectedParcels.filter((id) => inferTier(id) === tier);
    if (!tierParcels.length) return null;
    return { ...PACKAGES[tier], tier, count: tierParcels.length, parcels: tierParcels };
  }).filter((group): group is PaymentGroup => Boolean(group));
  const total = groups.reduce((sum, group) => sum + group.price * group.count, 0);
  const missingLink = groups.some((group) => !group.link);

  useEffectPersist({ selectedParcels, certificateParcel, groups, total });

  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8"><h1 className="text-center font-display text-4xl font-bold sm:text-5xl">ÖDEME PLANI</h1><p className="mx-auto mt-3 max-w-3xl text-center text-sm text-muted-foreground">Seçtiğiniz tüm parseller sipariş planında korunur. Sertifika yalnızca <strong className="text-foreground">{certificateParcel || "seçilen parsel"}</strong> için talep edilir.</p><div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]"><section className="panel p-6 sm:p-8"><div className="mb-6 flex items-center gap-3"><Lock className="h-5 w-5 text-gold" /><div><h2 className="font-display text-lg">İYZİCO LİNK İLE ÖDEME</h2><p className="text-xs text-muted-foreground">Kart bilgileri MySkyParcel üzerinde alınmaz; ödeme iyzico'nun güvenli sayfasında yapılır.</p></div></div>{groups.length === 0 ? <div className="rounded-xl border border-destructive/40 p-5 text-sm">Ödeme için parsel seçilmedi.</div> : <><div className="rounded-xl border border-gold/20 bg-gold/[0.04] p-5"><p className="text-sm font-semibold text-gold">Çoklu parsel siparişi</p><p className="mt-2 text-xs leading-5 text-muted-foreground">İstediğiniz sayıda farklı türde parsel satın alabilirsiniz. Mevcut bireysel iyzico Link yapısında her Link sabit ürün/tutar içindir; bu nedenle farklı adetler için aynı ürün Link'i gerektiği kadar açılır. Tek bir dinamik sepet ödemesi değildir.</p></div><div className="mt-5 space-y-4">{groups.map((group) => <div key={group.tier} className="rounded-xl border border-border p-5"><div className="flex items-center justify-between gap-4"><div><p className="font-semibold">{group.name}</p><p className="mt-1 text-xs text-muted-foreground">{group.count} parsel × {group.price.toLocaleString("tr-TR")} TL</p></div><p className="font-display text-xl text-gold">{(group.price * group.count).toLocaleString("tr-TR")} TL</p></div><div className="mt-3 text-xs text-muted-foreground">{group.parcels.join(", ")}</div><div className="mt-4 flex items-center justify-between gap-3"><span className="text-[11px] text-muted-foreground">Bu Link tek parsel tutarı içindir; {group.count > 1 ? `${group.count} adet için aynı Link'ten ${group.count} ayrı başarılı ödeme gerekir.` : "1 başarılı ödeme gerekir."}</span>{group.link ? <a href={group.link} target="_blank" rel="noopener noreferrer" className="btn-gold inline-flex shrink-0 items-center gap-2 rounded-md px-5 py-3 text-[11px]"><Lock className="h-4 w-4" /> ÖDE <ExternalLink className="h-4 w-4" /></a> : <button disabled className="btn-gold rounded-md px-5 py-3 text-[11px] opacity-50">LİNK BEKLENİYOR</button>}</div></div>)}</div><div className="mt-6 rounded-xl border border-border p-5 text-xs text-muted-foreground"><p className="font-semibold text-foreground">Ödeme tamamlanınca</p><p className="mt-2">İyzico Link ödemeleri bu sayfadan otomatik olarak doğrulanmaz. Her başarılı ödeme için işlem kaydını iyzico panelinden kontrol etmek gerekir. Otomatik tek-seferlik sepet ve ödeme doğrulaması için ileride iyzico Sanal POS/API entegrasyonu gerekir.</p></div>{missingLink && <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-xs">Seçilen paketlerden en az birinin canlı iyzico Link'i henüz Vercel ortam değişkenine eklenmemiş.</div>}</>}</section><aside className="panel h-fit p-6 lg:sticky lg:top-6"><h2 className="font-display text-base">SİPARİŞ ÖZETİ</h2><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Parsel sayısı</span><span>{selectedParcels.length}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Sertifika</span><span>{certificateParcel || "—"}</span></div>{groups.map((group) => <div key={group.tier} className="flex justify-between"><span className="text-muted-foreground">{group.name} × {group.count}</span><span>{(group.price * group.count).toLocaleString("tr-TR")} TL</span></div>)}<div className="border-t border-border pt-4 flex justify-between"><span className="font-semibold">Toplam</span><span className="font-display text-2xl text-gold">{total.toLocaleString("tr-TR")} TL</span></div></div><div className="mt-5 rounded-lg border border-gold/20 bg-gold/[0.04] p-4 text-xs text-muted-foreground"><ShieldCheck className="mb-2 h-4 w-4 text-gold" /><p>Seçilen parseller sipariş planında korunur. İyzico Link ile ödeme tamamlanana kadar parselleri kesin olarak satılmış kabul etmeyin.</p></div><button type="button" onClick={() => void navigate({ to: "/parsel-satin-al", search: { parcels: selectedParcels.join(","), certificateParcel } })} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-5 py-3 text-xs"><ArrowLeft className="h-4 w-4" /> BİLGİLERE DÖN</button></aside></div></main><SiteFooter /></div>;
}

function useEffectPersist(data: unknown) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem("myskyparcel_checkout_plan", JSON.stringify(data)); } catch { /* localStorage unavailable */ }
}
