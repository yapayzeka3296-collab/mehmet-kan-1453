import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";

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

const ORDERS = [
  { no: "#MSP-2024-000123", date: "20.05.2024", total: "1.198,00 TL", status: "Tamamlandı" },
  { no: "#MSP-2024-000098", date: "15.04.2024", total: "999,00 TL", status: "Tamamlandı" },
  { no: "#MSP-2024-000076", date: "10.03.2024", total: "499,00 TL", status: "Tamamlandı" },
  { no: "#MSP-2024-000045", date: "05.02.2024", total: "199,00 TL", status: "Tamamlandı" },
  { no: "#MSP-2024-000031", date: "12.01.2024", total: "499,00 TL", status: "İşlemde" },
];

function Siparislerim() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/siparislerim" />
        <div className="min-w-0">
          <div className="panel p-6">
            <h1 className="font-display text-3xl font-bold">SİPARİŞLERİM</h1>
            <p className="mt-2 text-xs text-muted-foreground">5 siparişiniz bulunuyor.</p>
          </div>
          <ul className="panel mt-6 divide-y divide-border p-2">
            {ORDERS.map((o) => (
              <li key={o.no} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{o.no}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{o.date}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-[11px] ${
                      o.status === "Tamamlandı"
                        ? "border-success/40 text-success"
                        : "border-gold/50 text-gold"
                    }`}
                  >
                    {o.status}
                  </span>
                  <span className="text-sm">{o.total}</span>
                  <ChevronRight className="h-4 w-4 text-gold" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <TrustBar items={SECURITY_TRUST} />
      <SiteFooter />
    </div>
  );
}
