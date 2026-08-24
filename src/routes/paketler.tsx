import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, CloudDownload, Heart, Lock, ShieldCheck, Star } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CertificateTemplatePreview } from "@/components/CertificateTemplatePreview";

export const Route = createFileRoute("/paketler")({ head: () => ({ meta: [{ title: "Sertifika Seçenekleri — MySkyParcel" }, { name: "description", content: "MySkyParcel Digital, Özel ve Premium sertifika seçeneklerini ve gerçek tasarım önizlemelerini inceleyin." }] }), component: Paketler });
type Tier = "digital" | "elite" | "premium";
type Plan = { tier: Tier; name: string; price: string; popular: boolean; description: string; features: string[] };
const PLANS: Plan[] = [
  { tier: "digital", name: "DİJİTAL PARSEL SERTİFİKASI", price: "199", popular: false, description: "Parselinizi belgeleyen modern dijital sertifika.", features: ["Kişiye özel dijital sertifika", "Parsel kodu ve kayıt bilgileri", "Dijital teslim"] },
  { tier: "elite", name: "ÖZEL PARSEL SERTİFİKASI", price: "499", popular: true, description: "Özel tasarım ve fiziksel baskı seçeneğiyle daha prestijli sunum.", features: ["Dijital sertifika", "Özel tasarım", "A4 fiziksel baskı", "Fiziksel ürün gönderimi"] },
  { tier: "premium", name: "PREMİUM PARSEL SERTİFİKASI", price: "999", popular: false, description: "En üst segment tasarım, premium baskı ve çerçeveli sunum.", features: ["Dijital sertifika", "Premium tasarım", "Premium dokulu kâğıt", "Çerçeveli A4 baskı", "Fiziksel ürün gönderimi"] },
];
const BENEFITS = [
  { icon: Star, title: "KİŞİYE ÖZEL", text: "Sertifika, satın alınan parsel ve kullanıcı kaydıyla ilişkilendirilir." },
  { icon: ShieldCheck, title: "DOĞRULANABİLİR", text: "Sertifikalar MySkyParcel doğrulama sistemi üzerinden kontrol edilebilir." },
  { icon: CloudDownload, title: "DİJİTAL & FİZİKSEL", text: "Paket kapsamına göre dijital ve fiziksel teslim seçenekleri sunulur." },
  { icon: Lock, title: "GÜVENLİ KAYIT", text: "Sertifika kayıtları doğrulama ve güvenlik altyapısıyla korunur." },
  { icon: Heart, title: "ANLAMLI HEDİYE", text: "Parsel deneyimini kalıcı ve kişisel bir hatıraya dönüştürür." },
];
function Paketler() {
  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-[1600px] px-4 py-10 sm:py-14 lg:px-8"><div className="text-center"><p className="text-xs font-semibold tracking-[0.2em] text-gold">MY SKYPARCEL SERTİFİKALARI</p><h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">SERTİFİKA SEÇENEKLERİ</h1><p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">Digital, Özel ve Premium sertifika tasarımlarını inceleyin; parselinizi seçtikten sonra uygun sertifika seçeneğini belirleyin.</p><p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">Seçtiğiniz parselin türüne göre, adınıza özel olarak hazırlanan dijital sertifikanız oluşturulur.</p></div><div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">{PLANS.map((p) => <article key={p.name} className={`panel relative flex h-full min-w-0 flex-col p-5 sm:p-7 ${p.popular ? "border-gold/70" : ""}`}>{p.popular && <span className="btn-gold absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-[10px]">EN POPÜLER</span>}<h2 className="text-center font-display text-lg sm:text-xl">{p.name}</h2><p className="mt-3 min-h-12 text-center text-xs leading-5 text-muted-foreground">{p.description}</p><p className="mt-3 text-center font-display text-3xl text-gold sm:text-4xl">{p.price} <span className="text-lg">TL</span></p><CertificateTemplatePreview tier={p.tier} className="mt-5 w-full sm:mt-6"/><ul className="mt-5 space-y-3 text-sm sm:mt-6">{p.features.map((f) => <li key={f} className="flex items-start gap-2 text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><span>{f}</span></li>)}</ul><Link to="/gokyuzu-haritasi" search={{ city: "istanbul", tier: p.tier }} className="btn-gold mt-6 flex min-h-11 items-center justify-center gap-3 rounded-md py-3 text-sm sm:mt-auto">{p.name.split(" ")[0]} PAKETİ İLE PARSELİ SEÇ <ArrowRight className="h-4 w-4" /></Link></article>)}</div><div className="panel mt-10 grid gap-6 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-5">{BENEFITS.map((b) => <div key={b.title} className="flex min-w-0 items-start gap-3"><b.icon className="mt-0.5 h-6 w-6 shrink-0 text-gold" /><div className="min-w-0"><p className="text-xs font-semibold tracking-[0.06em]">{b.title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{b.text}</p></div></div>)}</div></main><SiteFooter /></div>;
}
