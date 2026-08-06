import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";

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

const FIELDS = [
  ["Ad Soyad", "Ahmet Yılmaz"],
  ["E-posta", "ahmet@email.com"],
  ["Telefon", "+90 555 000 00 00"],
  ["Şehir", "Gaziantep"],
];

function Profilim() {
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
            {FIELDS.map(([l, v]) => (
              <label key={l} className="block">
                <span className="text-xs text-muted-foreground">{l}</span>
                <input
                  defaultValue={v}
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
