import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Gift, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/sevgiliye-hediye")({
  head: () => ({
    meta: [
      { title: "Sevgiliye Özel Hediye ve Farklı Sürpriz Fikirleri — MySkyParcel" },
      { name: "description", content: "Sevgiliye özel, farklı, ilginç ve sürpriz bir hediye arayanlar için kişiye özel dijital gökyüzü parseli ve sertifika fikrini keşfedin." },
      { property: "og:title", content: "Sevgiliye Özel Hediye — MySkyParcel" },
      { property: "og:description", content: "Sevgiliye farklı, anlamlı ve kişiye özel bir dijital hediye fikri." },
    ],
    links: [{ rel: "canonical", href: "https://myskyparcel.com/sevgiliye-hediye" }],
  }),
  component: SevgiliyeHediye,
});

function SevgiliyeHediye() {
  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-[1200px] px-4 py-12 sm:py-16 lg:px-8"><section className="panel p-6 text-center sm:p-10"><Heart className="mx-auto h-10 w-10 text-gold" /><p className="mt-4 text-xs font-semibold tracking-[0.2em] text-gold">MYSKYPARCEL HEDİYE FİKRİ</p><h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">SEVGİLİYE ÖZEL HEDİYE</h1><p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">Sevgiliye farklı hediye, sevgiliye ilginç hediye veya sevgiliye sürpriz hediye arıyorsanız, klasik hediyelerden farklı bir anı oluşturabilirsiniz. MySkyParcel, kişiye özel dijital gökyüzü parseli ve sertifika deneyimini sembolik bir dijital hediye olarak sunar.</p><Link to="/gokyuzu-haritasi" search={{ city: "istanbul" }} className="btn-gold mt-7 inline-flex min-h-11 items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold">Gökyüzü Parselini Keşfet <ArrowRight className="h-4 w-4" /></Link></section><section className="mt-8 grid gap-6 md:grid-cols-3"><article className="panel p-6"><Gift className="h-7 w-7 text-gold" /><h2 className="mt-4 font-display text-lg">Sevgiliye Farklı Hediye</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Birlikte anlam yükleyebileceğiniz, kişiselleştirilebilir ve dijital olarak saklanabilen farklı bir hediye fikri arayanlar için sembolik gökyüzü parseli alternatif olabilir.</p></article><article className="panel p-6"><Sparkles className="h-7 w-7 text-gold" /><h2 className="mt-4 font-display text-lg">Sevgiliye Sürpriz Hediye</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Parsel seçimini ve sertifika paketini belirleyerek doğum günü, yıl dönümü veya özel bir gün için kişisel bir sürpriz hazırlayabilirsiniz.</p></article><article className="panel p-6"><Heart className="h-7 w-7 text-gold" /><h2 className="mt-4 font-display text-lg">Anlamlı ve Unutulmaz Hediye</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Kişiye özel bilgilerle ilişkilendirilen sertifika, seçtiğiniz sembolik parseli dijital bir hatıraya dönüştürür. Paket kapsamına göre fiziksel baskı seçenekleri de bulunur.</p></article></section><section className="panel mt-8 p-6 sm:p-8"><h2 className="font-display text-xl text-gold">Nasıl Hazırlanır?</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">Gökyüzü Haritası üzerinden bir parsel seçin, uygun sertifika paketini belirleyin ve kişiselleştirme adımlarını tamamlayın. Güncel paket seçeneklerini incelemek için sertifika sayfasına geçebilirsiniz.</p><Link to="/paketler" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">Sertifika Paketlerini İncele <ArrowRight className="h-4 w-4" /></Link><p className="mt-6 text-xs leading-6 text-muted-foreground/70">MySkyParcel parselleri gerçek arsa, arazi, taşınmaz veya tapu değildir. Sunulan hizmet dijital ve sembolik bir parsel kaydı ile kişiselleştirilmiş sertifika deneyimidir.</p></section></main><SiteFooter /></div>;
}
