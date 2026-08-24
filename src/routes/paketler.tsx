import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, CloudDownload, Heart, Lock, ShieldCheck, Star } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CertificateTemplatePreview } from "@/components/CertificateTemplatePreview";

export const Route = createFileRoute("/paketler")({ head: () => ({ meta: [{ title: "Sertifika Seçenekleri — MySkyParcel" }, { name: "description", content: "MySkyParcel dijital ve fiziksel sertifika seçeneklerini ve paket kapsamlarını inceleyin." }] }), component: Paketler });
type Tier = "digital" | "elite" | "premium";
type Plan = { tier: Tier; name: string; price: string; popular: boolean; description: string; features: string[] };
const PLANS: Plan[] = [
  { tier: "digital", name: "DİJİTAL PARSEL SERTİFİKASI", price: "199", popular: false, description: "Seçtiğiniz sembolik parsel kaydını ve kişiselleştirilmiş dijital sertifikayı sunar.", features: ["Kişiye özel dijital sertifika", "Parsel kodu ve dijital kayıt bilgileri", "Elektronik teslim"] },
  { tier: "elite", name: "ÖZEL PARSEL SERTİFİKASI", price: "499", popular: true, description: "Sembolik parsel kaydı, kişiselleştirilmiş sertifika ve A4 baskı sunumunu içerir.", features: ["Kişiye özel dijital sertifika", "Özel sertifika tasarımı", "A4 fiziksel baskı", "Belirtilen teslimat adresine gönderim"] },
  { tier: "premium", name: "PREMİUM PARSEL SERTİFİKASI", price: "999", popular: false, description: "Sembolik parsel kaydı, premium sertifika tasarımı ve çerçeveli A4 baskı sunumunu içerir.", features: ["Kişiye özel dijital sertifika", "Premium sertifika tasarımı", "Premium dokulu kâğıt", "Çerçeveli A4 fiziksel baskı", "Belirtilen teslimat adresine gönderim"] },
];
const BENEFITS = [
  { icon: Star, title: "KİŞİYE ÖZEL", text: "Sertifika, satın alınan sembolik parsel kaydı ve kullanıcı bilgileriyle ilişkilendirilir." },
  { icon: ShieldCheck, title: "DOĞRULANABİLİR", text: "Sertifikalar MySkyParcel doğrulama sistemi üzerinden kontrol edilebilir." },
  { icon: CloudDownload, title: "DİJİTAL & FİZİKSEL", text: "Paket kapsamına göre elektronik sertifika ve fiziksel baskı sunulur." },
  { icon: Lock, title: "GÜVENLİ KAYIT", text: "Sertifika kayıtları doğrulama ve güvenlik altyapısıyla korunur." },
  { icon: Heart, title: "ANLAMLI HEDİYE", text: "Sembolik parsel deneyimini kişiselleştirilmiş bir dijital ve fiziksel hatıraya dönüştürür." },
];
function Paketler() {
  const choosePackage = (tier: Tier) => {
    if (typeof window !== "undefined") window.localStorage.setItem("myskyparcel_selected_tier", tier);
  };
  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-[1600px] px-4 py-10 sm:py-14 lg:px-8"><div className="text-center"><p className="text-xs font-semibold tracking-[0.2em] text-gold">MYSKYPARCEL SERTİFİKALARI</p><h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">SERTİFİKA SEÇENEKLERİ</h1><p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">Dijital, Özel ve Premium sertifika paketlerini inceleyin. Her paket, MySkyParcel üzerindeki sembolik parsel kaydı ve paket kapsamındaki sertifika hizmetini içerir.</p><p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">Satın alınan hizmet gerçek taşınmaz, arsa, arazi veya gökyüzü mülkiyeti oluşturmaz; dijital ve sembolik bir parsel kaydı ile kişiselleştirilmiş sertifika sunar.</p></div><div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{PLANS.map((p) => <article key={p.name} className={`panel relative flex h-full min-w-0 flex-col p-5 sm:p-7 ${p.popular ? "border-gold/70" : ""}`}>{p.popular && <span className="btn-gold absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-[10px]">EN POPÜLER</span>}<h2 className="text-center font-display text-lg sm:text-xl">{p.name}</h2><p className="mt-3 min-h-12 text-center text-xs leading-5 text-muted-foreground">{p.description}</p><p className="mt-3 text-center font-display text-3xl text-gold sm:text-4xl">{p.price} <span className="text-lg">TL</span></p><CertificateTemplatePreview tier={p.tier} className="mt-5 w-full sm:mt-6"/><ul className="mt-5 space-y-3 text-sm sm:mt-6">{p.features.map((f) => <li key={f} className="flex items-start gap-2 text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><span>{f}</span></li>)}</ul><Link to="/gokyuzu-haritasi" search={{ city: "istanbul" }} onClick={() => choosePackage(p.tier)} className="btn-gold mt-6 flex min-h-11 items-center justify-center gap-3 rounded-md py-3 text-sm sm:mt-auto">{p.name.split(" ")[0]} PAKETİ İLE PARSELİ SEÇ <ArrowRight className="h-4 w-4" /></Link></article>)}</div><div className="panel mt-10 grid gap-6 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-5">{BENEFITS.map((b) => <div key={b.title} className="flex min-w-0 items-start gap-3"><b.icon className="mt-0.5 h-6 w-6 shrink-0 text-gold" /><div className="min-w-0"><p className="text-xs font-semibold tracking-[0.06em]">{b.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{b.text}</p></div></div>)}</div></main><SiteFooter /></div>;
}
