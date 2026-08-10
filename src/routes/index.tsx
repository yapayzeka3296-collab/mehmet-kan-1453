import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Boxes, Check, Globe, Headphones, Layers, Lock, MapPin, Play, ShieldCheck, Sparkles } from "lucide-react";
import { useState, type FormEvent } from "react";
import certDigital from "@/assets/cert-digital.jpg";
import certPremium from "@/assets/cert-premium.jpg";
import certFramed from "@/assets/cert-framed.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";
import { CITY_IMAGES } from "@/lib/cityImages";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "MySkyParcel — Gökyüzünde Sana Özel Sembolik Bir Yer" }, { name: "description", content: "Her il için 10 katman, 1.000 sektör ve 1.000.000 parsel. Uzun vadeli hedef: 81 milyon gökyüzü parseli." }, { property: "og:title", content: "MySkyParcel — Gökyüzünde Sana Özel Bir Yer" }, { property: "og:description", content: "Sembolik gökyüzü parselini seç, dijital veya çerçeveli sertifikanı al." }] }),
  component: Index,
});

const SKY_PARCEL_MODEL = { cityCount: 81, layersPerCity: 10, sectorsPerCity: 1_000, parcelsPerCity: 1_000_000, totalParcels: 81_000_000 } as const;
const HERO_CITY = { name: "İSTANBUL", slug: "istanbul", district: "MERKEZ", image: CITY_IMAGES.IST } as const;
const STATS = [
  { icon: Globe, big: "81 MİLYON", title: "TOPLAM GÖKYÜZÜ PARSELİ", text: "81 il × 1.000.000 parsel uzun vadeli hedef" },
  { icon: Layers, big: "10", title: "KATMAN / İL", text: "Her il için 10 katman" },
  { icon: ShieldCheck, big: "1.000", title: "SEKTÖR / İL", text: "Her il için 1.000 sektör" },
  { icon: Boxes, big: "1.000.000", title: "PARSEL / İL", text: "Her il için 1.000.000 parsel" },
  { icon: Headphones, big: "DESTEK", title: "DESTEK EKİBİ", text: "İletişim kanalları üzerinden bize ulaşabilirsiniz" },
  { icon: Lock, big: "", title: "GÜVENLİ ALTYAPI", text: "Güvenlik ve ödeme altyapısı ayrıca doğrulanmalıdır" },
];
const CERTIFICATE_PACKAGES = [
  { id: "digital", name: "DİJİTAL", price: 199, img: certDigital, features: ["Dijital sertifika", "Parsel kodu ve koordinatlar", "QR doğrulama", "E-posta ile anında teslim"] },
  { id: "elite", name: "ELİT", price: 499, img: certPremium, features: ["Özel tasarım sertifika", "Dijital sertifika", "Parsel kodu ve koordinatlar", "QR doğrulama", "E-posta ile anında teslim"] },
  { id: "premium", name: "PREMİUM", price: 999, img: certFramed, features: ["Özel tasarım sertifika", "Çerçeveli baskı (A4)", "Dijital sertifika", "Parsel kodu ve koordinatlar", "QR doğrulama"] },
] as const;
const POPULAR_CITIES = [
  { name: "İSTANBUL", slug: "istanbul", code: "IST", image: CITY_IMAGES.IST }, { name: "ANKARA", slug: "ankara", code: "ANK", image: CITY_IMAGES.ANK }, { name: "İZMİR", slug: "izmir", code: "IZM", image: CITY_IMAGES.IZM }, { name: "ANTALYA", slug: "antalya", code: "ANT", image: CITY_IMAGES.ANT }, { name: "BURSA", slug: "bursa", code: "BUR", image: CITY_IMAGES.BUR }, { name: "KAYSERİ", slug: "kayseri", code: "KAY", image: CITY_IMAGES.KAY }, { name: "GAZİANTEP", slug: "gaziantep", code: "GZT", image: CITY_IMAGES.GZT },
] as const;

function Index() {
  const navigate = useNavigate();
  const [certificateCode, setCertificateCode] = useState("");
  const parcelModelCheck = SKY_PARCEL_MODEL.cityCount * SKY_PARCEL_MODEL.parcelsPerCity === SKY_PARCEL_MODEL.totalParcels;
  function handleCertificateSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); navigate({ to: "/sertifika-dogrula", search: { code: certificateCode.trim() } }); }
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <img src={HERO_CITY.image} alt={`${HERO_CITY.name} şehir manzarası`} width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-100" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-background/10 to-transparent" />
          <div className="relative mx-auto max-w-[1600px] px-4 py-14 lg:px-8 xl:py-20">
            <div className="min-w-0 max-w-3xl">
              <span className="inline-block max-w-full rounded-md border border-gold/60 px-4 py-2 text-[10px] leading-5 tracking-[0.12em] text-gold">HER İL İÇİN {SKY_PARCEL_MODEL.layersPerCity} KATMAN · {SKY_PARCEL_MODEL.sectorsPerCity.toLocaleString("tr-TR")} SEKTÖR · {SKY_PARCEL_MODEL.parcelsPerCity.toLocaleString("tr-TR")} PARSEL<br /><strong>TOPLAM {SKY_PARCEL_MODEL.totalParcels.toLocaleString("tr-TR")} GÖKYÜZÜ PARSELİ</strong></span>
              <h1 className="mt-6 break-words font-display text-4xl leading-[1.1] font-bold sm:text-5xl lg:text-6xl">GÖKYÜZÜNDE<br /><span className="text-gradient-gold">SANA ÖZEL</span><br />SEMBOLİK BİR YER</h1>
              <p className="mt-5 max-w-lg text-sm text-muted-foreground sm:text-base">MySkyParcel ile gökyüzünde sana özel bir parsel seçebilir, benzersiz sertifikanla bu anı ölümsüzleştirebilirsin.</p>
              <div className="mt-8 flex max-w-full flex-wrap gap-3"><Link to="/gokyuzu-haritasi" className="btn-gold inline-flex max-w-full items-center gap-2 rounded-md px-6 py-3 text-xs"><Sparkles className="h-4 w-4 shrink-0" /> GÖKYÜZÜ HARİTASINA GİT</Link><button type="button" disabled aria-disabled="true" title="Video kaynağı sonraki entegrasyonda eklenecek" className="inline-flex max-w-full items-center gap-2 rounded-md border border-border px-6 py-3 text-xs tracking-[0.08em] transition-colors hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-70"><Play className="h-4 w-4 shrink-0" /> VİDEOYU İZLE</button></div>
              <div className="mt-10 inline-flex max-w-full items-center gap-2 rounded-md bg-navy-deep/70 px-4 py-2"><MapPin className="h-5 w-5 shrink-0 text-gold" /><span className="text-sm font-semibold">{HERO_CITY.name} <span className="block text-[10px] text-muted-foreground">{HERO_CITY.district}</span></span></div>
            </div>
          </div>
        </section>
        <section className="mx-auto max-w-[1600px] px-4 py-8 lg:px-8"><div className="panel grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{STATS.map((s) => <div key={s.title} className="flex min-w-0 items-start gap-3"><s.icon className="mt-1 h-6 w-6 shrink-0 text-gold" /><div className="min-w-0">{s.big && <p className="font-display text-xl font-bold">{s.big}</p>}<p className="text-[11px] font-semibold tracking-[0.08em]">{s.title}</p><p className="mt-1 text-[11px] text-muted-foreground">{s.text}</p></div></div>)}</div>{!parcelModelCheck && <p className="mt-2 text-center text-[10px] text-muted-foreground">Parsel model verisi henüz doğrulanmadı.</p>}</section>
        <section className="mx-auto grid max-w-[1600px] gap-6 px-4 pb-8 lg:px-8 xl:grid-cols-[3fr_1fr]"><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{CERTIFICATE_PACKAGES.map((p) => <article key={p.id} className="panel flex min-w-0 flex-col p-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"><div className="min-w-0"><h3 className="font-display text-lg">{p.name}</h3><ul className="mt-4 space-y-2 text-xs">{p.features.map((f)=><li key={f} className="flex items-start gap-2 text-muted-foreground"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold"/><span>{f}</span></li>)}</ul></div><img src={p.img} alt={p.name} loading="lazy" width={900} height={800} className="h-40 w-full rounded-lg object-contain"/></div><p className="mt-6 font-display text-3xl text-gold">{p.price.toLocaleString("tr-TR")} <span className="text-base">TL</span></p><Link to="/paketler" className="btn-gold mt-4 inline-flex items-center justify-center rounded-md px-5 py-2.5 text-[11px]">HEMEN İNCELE</Link></article>)}</div><div className="grid content-start gap-6"><div className="panel p-6"><h3 className="font-display text-base">SERTİFİKA DOĞRULA</h3><p className="mt-2 text-xs text-muted-foreground">Parsel kodunuzu girerek sertifikanızın geçerliliğini kontrol edebilirsiniz.</p><form onSubmit={handleCertificateSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row"><label htmlFor="homepage-certificate-code" className="sr-only">Sertifika numarası</label><input id="homepage-certificate-code" value={certificateCode} onChange={(event) => setCertificateCode(event.target.value)} aria-label="Sertifika numarası" placeholder="Sertifika numaranızı girin (Örn: SP-GZT-0004207)" autoComplete="off" className="min-w-0 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-[11px] uppercase outline-none focus:border-gold"/><button type="submit" className="btn-gold inline-flex w-full shrink-0 items-center justify-center rounded-md px-4 py-2 text-[11px] sm:w-auto">DOĞRULA</button></form></div><div className="panel p-6"><h3 className="font-display text-base">GÜVENLİ ALIŞVERİŞ</h3><p className="mt-2 text-xs text-muted-foreground">Güvenlik ve ödeme altyapısı yayın öncesi ayrıca doğrulanmalıdır.</p></div></div></section>
        <section className="mx-auto max-w-[1600px] px-4 pb-8 lg:px-8"><div className="panel grid gap-6 p-6 lg:grid-cols-[auto_1fr_auto] lg:items-center"><h3 className="font-display text-base tracking-[0.08em]">POPÜLER ŞEHİRLER</h3><ul className="flex flex-wrap justify-center gap-5">{POPULAR_CITIES.map(c=><li key={c.code}><button type="button" onClick={() => navigate({ to: "/gokyuzu-haritasi", search: { city: c.slug } })} className="block text-center cursor-pointer"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/60 bg-navy overflow-hidden transition-transform duration-200 hover:scale-105"><img src={c.image} alt={`${c.name} şehir manzarası`} loading="lazy" width={96} height={96} className="h-full w-full object-cover opacity-100"/></div><p className="mt-2 text-[10px] tracking-[0.08em] text-muted-foreground">{c.name}</p></button></li>)}</ul><Link to="/gokyuzu-haritasi" className="inline-flex items-center justify-center gap-2 rounded-md border border-gold/60 px-5 py-2.5 text-[11px] tracking-[0.08em] text-gold">TÜM ŞEHİRLER <ArrowRight className="h-4 w-4"/></Link></div></section>
        <TrustBar />
      </main><SiteFooter />
    </div>
  );
}
