import { createFileRoute, Navigate } from "@tanstack/react-router";
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

function Panelim() {
  const { user, loading } = useAuth();

  if (loading) return <div className="starfield min-h-screen" aria-busy="true" />;
  if (!user) return <Navigate to="/giris" replace />;

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/panelim" />
        <section className="min-h-[60vh] min-w-0" aria-label="Kullanıcı paneli" />
      </main>
      <SiteFooter />
    </div>
  );
}
