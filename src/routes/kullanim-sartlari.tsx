import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/kullanim-sartlari")({
  head: () => ({ meta: [{ title: "Kullanım Şartları — MySkyParcel" }] }),
  component: KullanimSartlari,
});

function KullanimSartlari() {
  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-4xl px-4 py-12 lg:px-8"><article className="panel p-6 sm:p-10"><h1 className="font-display text-3xl font-bold sm:text-4xl">KULLANIM ŞARTLARI</h1><div className="mt-6 space-y-6 text-sm leading-7 text-muted-foreground"><section><h2 className="font-display text-lg text-gold">1. Hizmet Kullanımı</h2><p className="mt-2">MySkyParcel hizmetleri yürürlükteki mevzuata ve bu kullanım şartlarına uygun olarak kullanılmalıdır. Kullanıcı, hesap bilgilerinin doğruluğundan ve hesabının güvenliğinden sorumludur.</p></section><section><h2 className="font-display text-lg text-gold">2. Parsel ve Sertifika Hizmetleri</h2><p className="mt-2">Satın alınan dijital veya fiziksel sertifika hizmetleri, sipariş sırasında belirtilen kapsamda sunulur. Fiziksel gönderimler, teslimat bilgilerinin doğru ve eksiksiz verilmesine bağlıdır.</p></section><section><h2 className="font-display text-lg text-gold">3. Ödeme ve İptal</h2><p className="mt-2">Ödeme işlemleri yetkili ödeme altyapıları üzerinden gerçekleştirilir. İptal, iade ve tüketici hakları ilgili mevzuat ve satın alınan hizmetin koşullarına tabidir.</p></section><section><h2 className="font-display text-lg text-gold">4. Değişiklikler</h2><p className="mt-2">MySkyParcel, hizmetlerin veya bu şartların mevzuata uygun şekilde güncellenmesi hakkını saklı tutar.</p></section></div><p className="mt-10 border-t border-border pt-5 text-xs text-muted-foreground">Son güncelleme: 10 Ağustos 2026</p></article></main><SiteFooter /></div>;
}
