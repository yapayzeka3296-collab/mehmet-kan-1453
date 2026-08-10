import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/cerez-politikasi")({
  head: () => ({ meta: [{ title: "Çerez Politikası — MySkyParcel" }] }),
  component: CerezPolitikasi,
});

function CerezPolitikasi() {
  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-4xl px-4 py-12 lg:px-8"><article className="panel p-6 sm:p-10"><h1 className="font-display text-3xl font-bold sm:text-4xl">ÇEREZ POLİTİKASI</h1><div className="mt-6 space-y-6 text-sm leading-7 text-muted-foreground"><section><h2 className="font-display text-lg text-gold">Çerezler Nedir?</h2><p className="mt-2">Çerezler, web sitesinin cihazınızda sakladığı küçük veri dosyalarıdır. Site deneyiminin düzgün çalışmasına ve tercihlerin hatırlanmasına yardımcı olabilir.</p></section><section><h2 className="font-display text-lg text-gold">MySkyParcel'de Kullanım</h2><p className="mt-2">MySkyParcel, sembolik ve dijital koleksiyon hizmetinin temel işlevlerini, oturum ve güvenlik süreçlerini desteklemek için gerekli çerezleri kullanabilir. Çerezler, platformdaki sembolik parsel ve sertifika deneyiminin teknik olarak sunulmasına yardımcı olabilir.</p></section><section><h2 className="font-display text-lg text-gold">Kapsam ve Tercihleriniz</h2><p className="mt-2">Çerezlerin kapsamı ve süresi teknik ihtiyaçlara göre değişebilir. Tarayıcınızın ayarlarından çerezleri yönetebilir veya silebilirsiniz. Bazı çerezlerin devre dışı bırakılması sitenin bazı işlevlerinin düzgün çalışmamasına neden olabilir.</p></section></div><p className="mt-10 border-t border-border pt-5 text-xs text-muted-foreground">Son güncelleme: 10 Ağustos 2026</p></article></main><SiteFooter /></div>;
}
