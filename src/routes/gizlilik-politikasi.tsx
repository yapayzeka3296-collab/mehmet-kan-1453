import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/gizlilik-politikasi")({
  head: () => ({ meta: [{ title: "Gizlilik Politikası — MySkyParcel" }] }),
  component: GizlilikPolitikasi,
});

function GizlilikPolitikasi() {
  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-4xl px-4 py-12 lg:px-8"><article className="panel p-6 sm:p-10"><h1 className="font-display text-3xl font-bold sm:text-4xl">GİZLİLİK POLİTİKASI</h1><p className="mt-5 text-sm leading-7 text-muted-foreground">MySkyParcel, kullanıcılarının kişisel bilgilerinin gizliliğine önem verir. Toplanan bilgiler yalnızca hizmetlerin sunulması, hesap ve sipariş işlemlerinin yürütülmesi, güvenliğin sağlanması ve yasal yükümlülüklerin yerine getirilmesi amacıyla kullanılır.</p><p className="mt-5 text-sm leading-7 text-muted-foreground">Kişisel verileriniz, hizmetin gerektirdiği durumlarda ödeme, kargo/posta, teknik altyapı ve barındırma hizmet sağlayıcılarıyla mevzuata uygun şekilde paylaşılabilir. Verilerin korunması için gerekli teknik ve idari tedbirler uygulanır.</p><p className="mt-5 text-sm leading-7 text-muted-foreground">Gizlilik uygulamalarımız ve kişisel verilerinizle ilgili haklarınız hakkında ayrıntılı bilgi için <a className="text-gold hover:underline" href="/kvkk">KVKK Aydınlatma Metni</a>'ni inceleyebilirsiniz.</p><p className="mt-10 border-t border-border pt-5 text-xs text-muted-foreground">Son güncelleme: 10 Ağustos 2026</p></article></main><SiteFooter /></div>;
}
