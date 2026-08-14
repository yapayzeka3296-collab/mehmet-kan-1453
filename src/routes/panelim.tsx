import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Award, Globe, ShoppingBag, Star } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/panelim")({
  head: () => ({
    meta: [
      { title: "Panelim — MySkyParcel" },
      { name: "description", content: "MySkyParcel kullanıcı paneli." },
    ],
  }),
  component: Panelim,
});

const EMPTY_STATS = [
  { icon: Globe, title: "Parsellerim" },
  { icon: Award, title: "Sertifikalarım" },
  { icon: ShoppingBag, title: "Siparişlerim" },
  { icon: Star, title: "Favorilerim" },
] as const;

function Panelim() {
  const { user, loading } = useAuth();

  if (loading) return <div className="starfield min-h-screen" aria-busy="true" />;
  if (!user) return <Navigate to="/giris" replace />;

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/panelim" />
        <section className="min-w-0" aria-label="Kullanıcı paneli">
          <div className="panel p-6">
            <h1 className="font-display text-3xl font-bold">PANELİM</h1>
            <p className="mt-2 text-sm text-muted-foreground">Kullanıcı paneli</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {EMPTY_STATS.map((item) => (
              <div key={item.title} className="panel flex min-w-0 items-center gap-4 p-5">
                <item.icon className="h-8 w-8 shrink-0 text-gold" />
                <div>
                  <p className="font-display text-2xl">—</p>
                  <p className="text-sm">{item.title}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="panel p-6">
              <h2 className="font-display text-base tracking-[0.06em]">SON PARSELLERİM</h2>
              <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center">
                <Globe className="mx-auto h-8 w-8 text-gold" />
                <p className="mt-3 text-sm text-muted-foreground">Henüz parsel bulunmuyor.</p>
              </div>
            </section>

            <section className="panel p-6">
              <h2 className="font-display text-base tracking-[0.06em]">SON SİPARİŞLERİM</h2>
              <div className="mt-6 rounded-lg border border-dashed border-border p-8 text-center">
                <ShoppingBag className="mx-auto h-8 w-8 text-gold" />
                <p className="mt-3 text-sm text-muted-foreground">Henüz sipariş bulunmuyor.</p>
              </div>
            </section>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
