import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/gizlilik-politikasi")({
  head: () => ({ meta: [{ title: "Gizlilik Politikası — MySkyParcel" }] }),
  component: GizlilikPolitikasi,
});

function GizlilikPolitikasi() {
  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-4xl px-4 py-12 lg:px-8"><article className="panel p-6 sm:p-10"><h1 className="font-display text-3xl font-bold sm:text-4xl">GİZLİLİK POLİTİKASI</h1><div className="mt-6 space-y-6 text-sm leading-7 text-muted-foreground"><section><h2 className="font-display text-lg text-gold">1. Kapsam</h2><p className="mt-2">MySkyParcel, sembolik ve dijital koleksiyon hizmeti sunan bir platformdur. Platformdaki gökyüzü parselleri gerçek taşınmaz veya gökyüzü mülkiyeti oluşturmaz.</p></section><section><h2 className="font-display text-lg text-gold">2. Bilgilerin Kullanımı</h2><p className="mt-2">Toplanan bilgiler yalnızca hizmetlerin sunulması, hesap ve sipariş işlemlerinin yürütülmesi, sembolik koleksiyon ve sertifika kayıtlarının yönetilmesi, güvenliğin sağlanması ve yasal yükümlülüklerin yerine getirilmesi amacıyla kullanılır.</p></section><section><h2 className="font-display text-lg text-gold">3. Veri Paylaşımı ve Güvenlik</h2><p className="mt-2">Kişisel verileriniz, hizmetin gerektirdiği durumlarda ödeme, kargo/posta, teknik altyapı ve barındırma hizmet sağlayıcılarıyla mevzuata uygun şekilde paylaşılabilir. Verilerin korunması için gerekli teknik ve idari tedbirler uygulanır.</p></section><section><h2 className="font-display text-lg text-gold">4. Haklarınız</h2><p className="mt-2">Kişisel verilerinizle ilgili haklarınız ve başvuru yöntemleri hakkında ayrıntılı bilgi için <a className="text-gold hover:underline" href="/kvkk">KVKK Aydınlatma Metni</a>'ni inceleyebilirsiniz.</p></section></div><p className="mt-10 border-t border-border pt-5 text-xs text-muted-foreground">Son güncelleme: 10 Ağustos 2026</p></article></main><SiteFooter /></div>;
}
