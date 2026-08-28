import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabaseBrowser";

export const Route = createFileRoute("/siparislerim")({
  head: () => ({ meta: [
    { title: "Siparişlerim — MySkyParcel" },
    { name: "description", content: "Geçmiş siparişlerini, tutarlarını ve durumlarını takip et." },
    { property: "og:title", content: "Siparişlerim — MySkyParcel" },
    { property: "og:description", content: "Sipariş geçmişin ve durumları." },
  ] }),
  component: Siparislerim,
});

type Order = { id: string; parcel_id: string | null; amount: number | string; currency: string; status: string; provider: string | null; provider_reference: string | null; created_at: string; updated_at: string };
const STATUS: Record<string, string> = { pending: "Beklemede", paid: "Ödendi", failed: "Başarısız", cancelled: "İptal edildi", refunded: "İade edildi" };

function Siparislerim() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    const load = async () => {
      const supabase = createBrowserSupabase();
      if (!supabase) { if (active) setOrders([]); return; }
      const { data } = await supabase.from("orders")
        .select("id, parcel_id, amount, currency, status, provider, provider_reference, created_at, updated_at")
        .eq("user_id", user.id).order("created_at", { ascending: false });
      if (active) setOrders((data ?? []) as Order[]);
    };
    void load();
    return () => { active = false; };
  }, [user?.id]);

  if (authLoading) return <div className="starfield min-h-screen" aria-busy="true" />;
  if (!user) return <Navigate to="/giris" replace />;

  return <div className="starfield min-h-screen">
    <SiteHeader />
    <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
      <UserSidebar active="/siparislerim" />
      <div className="min-w-0">
        <div className="panel p-6"><h1 className="font-display text-3xl font-bold">SİPARİŞLERİM</h1><p className="mt-2 text-xs text-muted-foreground">Geçmiş siparişlerinizi ve ödeme durumlarını takip edin.</p></div>
        <section className="panel mt-6 overflow-hidden">
          {orders === null ? <div className="p-10 text-center text-sm text-muted-foreground">Siparişleriniz hazırlanıyor…</div> : orders.length === 0 ? <div className="p-10 text-center"><ShoppingBag className="mx-auto h-12 w-12 text-gold" /><h2 className="mt-4 font-display text-xl">Henüz siparişiniz yok</h2><p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">Bu hesap için henüz kaydedilmiş bir sipariş bulunmuyor.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead className="border-b border-border text-left text-xs text-muted-foreground"><tr><th className="px-6 py-4">Sipariş</th><th className="px-6 py-4">Parsel</th><th className="px-6 py-4">Tarih</th><th className="px-6 py-4">Tutar</th><th className="px-6 py-4">Durum</th></tr></thead><tbody>{orders.map(order => <tr key={order.id} className="border-b border-border last:border-0"><td className="px-6 py-4 font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</td><td className="px-6 py-4 font-mono text-xs">{order.parcel_id ? order.parcel_id.slice(0, 8).toUpperCase() : "—"}</td><td className="px-6 py-4">{new Date(order.created_at).toLocaleDateString("tr-TR")}</td><td className="px-6 py-4 font-medium">{Number(order.amount).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency}</td><td className="px-6 py-4"><span className="rounded-full border border-border px-2.5 py-1 text-xs">{STATUS[order.status] ?? order.status}</span></td></tr>)}</tbody></table></div>}
        </section>
      </div>
    </main>
    <TrustBar items={SECURITY_TRUST} /><SiteFooter />
  </div>;
}
