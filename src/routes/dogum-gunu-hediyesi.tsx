import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Gift, Cake, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/dogum-gunu-hediyesi")({
  head: () => ({
    meta: [
      { title: "Doğum Günü Hediyesi ve Farklı Hediye Fikirleri — MySkyParcel" },
      { name: "description", content: "Doğum günü hediyesi, sevgiliye doğum günü hediyesi ve farklı hediye fikirleri arayanlar için kişiye özel dijital gökyüzü parseli fikrini keşfedin." },
      { property: "og:title", content: "Doğum Günü Hediyesi — MySkyParcel" },
      { property: "og:description", content: "Farklı, ilginç ve kişiye özel bir doğum günü hediyesi fikri." },
    ],
    links: [{ rel: "canonical", href: "https://myskyparcel.com/dogum-gunu-hediyesi" }],
  }),
  component: DogumGunuHediyesi,
});

function DogumGunuHediyesi() {
  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-[1200px] px-4 py-12 sm:py-16 lg:px-8"><section className="panel p-6 text-center sm:p-10"><Cake className="mx-auto h-10 w-10 text-gold" /><p className="mt-4 text-xs font-semibold tracking-[0.2em] text-gold">MYSKYPARCEL HEDİYE FİKRİ</p><h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">DOĞUM GÜNÜ HEDİYESİ</h1><p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-muted-foreground">Doğum günü hediyesi seçerken farklı ve anlamlı bir fikir arıyorsanız MySkyParcel'in kişiye özel dijital gökyüzü parseli deneyimini keşfedebilirsiniz. Sevgiliye doğum günü hediyesi, arkadaşa özel hediye veya unutulmaz bir sürpriz için sembolik bir dijital koleksiyon oluşturabilirsiniz.</p><Link to="/gokyuzu-haritasi" search={{ city: "istanbul" }} className="btn-gold mt-7 inline-flex min-h-11 items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold">Parsel Seçmeye Başla <ArrowRight className="h-4 w-4" /></Link></section><section className="mt-8 grid gap-6 md:grid-cols-3"><article className="panel p-6"><Gift className="h-7 w-7 text-gold" /><h2 className="mt-4 font-display text-lg">Farklı Hediye Fikirleri</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Klasik hediyeler yerine dijital ortamda kişiselleştirilebilen, saklanabilen ve özel bir anıya dönüştürülebilen farklı bir seçenek sunabilirsiniz.</p></article><article className="panel p-6"><Sparkles className="h-7 w-7 text-gold" /><h2 className="mt-4 font-display text-lg">İlginç Hediyeler</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Gökyüzü haritasında seçilen sembolik parsel ve kişiye özel sertifika, doğum günü için ilginç ve dijital bir hediye deneyimi oluşturur.</p></article><article className="panel p-6"><Cake className="h-7 w-7 text-gold" /><h2 className="mt-4 font-display text-lg">Sevgiliye Doğum Günü Hediyesi</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Sevgilinizin adına hazırlanabilecek kişiselleştirilmiş sertifika ile doğum gününüze anlamlı bir dijital hatıra ekleyebilirsiniz.</p></article></section><section className="panel mt-8 p-6 sm:p-8"><h2 className="font-display text-xl text-gold">Hediye Nasıl Hazırlanır?</h2><p className="mt-4 text-sm leading-7 text-muted-foreground">Gökyüzü Haritası'ndan bir parsel seçin, sertifika paketlerinden size uygun olanı belirleyin ve kişiselleştirme adımlarını tamamlayın. Dijital, Özel ve Premium seçeneklerin güncel kapsamını paketler sayfasında görebilirsiniz.</p><Link to="/paketler" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:underline">Paketleri İncele <ArrowRight className="h-4 w-4" /></Link><p className="mt-6 text-xs leading-6 text-muted-foreground/70">MySkyParcel parselleri gerçek taşınmaz veya tapu değildir. Hizmet, dijital ve sembolik parsel kaydı ile kişiselleştirilmiş sertifika sunar.</p></section></main><SiteFooter /></div>;
}
