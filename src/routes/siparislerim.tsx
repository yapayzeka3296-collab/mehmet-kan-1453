import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/siparislerim")({
  head: () => ({
    meta: [
      { title: "Siparişlerim — MySkyParcel" },
      { name: "description", content: "Geçmiş siparişlerini, tutarlarını ve durumlarını takip et." },
      { property: "og:title", content: "Siparişlerim — MySkyParcel" },
      { property: "og:description", content: "Sipariş geçmişin ve durumları." },
    ],
  }),
  component: Siparislerim,
});

function Siparislerim() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    return <div className="starfield min-h-screen" aria-busy="true" />;
  }

  if (!user) {
    return <Navigate to="/giris" replace />;
  }

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/siparislerim" />
        <div className="min-w-0">
          <div className="panel p-6">
            <h1 className="font-display text-3xl font-bold">SİPARİŞLERİM</h1>
            <p className="mt-2 text-xs text-muted-foreground">Gerçek sipariş geçmişiniz burada gösterilir.</p>
          </div>
          <section className="panel mt-6 p-8 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-gold" />
            <h2 className="mt-4 font-display text-xl">Henüz siparişiniz yok</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              Bu hesap için henüz kaydedilmiş bir sipariş bulunmuyor. Sipariş oluşturulduğunda numarası, tarihi, tutarı ve durumu burada gösterilecektir.
            </p>
          </section>
        </div>
      </main>
      <TrustBar items={SECURITY_TRUST} />
      <SiteFooter />
    </div>
  );
}
