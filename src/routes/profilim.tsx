import { createFileRoute, Navigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/profilim")({
  head: () => ({
    meta: [
      { title: "Profilim — MySkyParcel" },
      { name: "description", content: "Hesap bilgilerini güncelle ve iletişim tercihlerini yönet." },
      { property: "og:title", content: "Profilim — MySkyParcel" },
      { property: "og:description", content: "Hesap bilgilerin ve tercihlerin." },
    ],
  }),
  component: Profilim,
});

function Profilim() {
  const { user, loading } = useAuth();

  if (loading) return <div className="starfield min-h-screen" aria-busy="true" />;
  if (!user) return <Navigate to="/giris" replace />;

  const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
  const email = user.email ?? "";
  const phone = typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : "";
  const city = typeof user.user_metadata?.city === "string" ? user.user_metadata.city : "";

  const fields = [
    ["Ad Soyad", fullName],
    ["E-posta", email],
    ["Telefon", phone],
    ["Şehir", city],
  ];

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/profilim" />
        <div className="min-w-0">
          <div className="panel p-6">
            <h1 className="font-display text-3xl font-bold">PROFİLİM</h1>
          </div>
          <form className="panel mt-6 grid gap-5 p-6 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            {fields.map(([label, value]) => (
              <label key={label} className="block">
                <span className="text-xs text-muted-foreground">{label}</span>
                <input
                  defaultValue={value}
                  autoComplete={label === "E-posta" ? "email" : label === "Ad Soyad" ? "name" : "off"}
                  className="mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold"
                />
              </label>
            ))}
            <button className="btn-gold w-fit rounded-md px-8 py-3 text-[11px] sm:col-span-2">
              BİLGİLERİ GÜNCELLE
            </button>
          </form>
        </div>
      </main>
      <TrustBar items={SECURITY_TRUST} />
      <SiteFooter />
    </div>
  );
}
