import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Award, Globe, ShoppingBag, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export const Route = createFileRoute("/panelim")({
  head: () => ({
    meta: [
      { title: "Panelim — MySkyParcel" },
      { name: "description", content: "MySkyParcel kullanıcı paneli." },
    ],
  }),
  component: Panelim,
});

type ParcelRow = { id: string; parcel_number: string; status: string; price: number; city_id: string | null; tier: string | null };
type CertificateRow = { id: string; parcel_id: string; tier: string; status: string; certificate_number: string | null; created_at: string };
type OrderRow = { id: string; parcel_id: string | null; amount: number; currency: string; status: string; created_at: string };

const emptyStats = [
  { key: "parcels", icon: Globe, title: "Parsellerim" },
  { key: "certificates", icon: Award, title: "Sertifikalarım" },
  { key: "orders", icon: ShoppingBag, title: "Siparişlerim" },
  { key: "favorites", icon: Star, title: "Favorilerim" },
] as const;

const formatTier = (tier: string | null) => tier === "premium" ? "Premium" : tier === "elite" ? "Elit" : tier === "digital" ? "Dijital" : "-";
const formatOrderStatus = (status: string) => status === "paid" ? "Ödendi" : status === "pending" ? "Bekliyor" : status === "cancelled" ? "İptal" : status;

function Panelim() {
  const { user, loading } = useAuth();
  const [parcels, setParcels] = useState<ParcelRow[]>([]);
  const [parcelCount, setParcelCount] = useState(0);
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [certificateCount, setCertificateCount] = useState(0);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [orderCount, setOrderCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataErrors, setDataErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!user || !supabaseBrowser) return;
    let cancelled = false;

    const loadDashboard = async () => {
      setDataLoading(true);
      setDataErrors([]);

      const [parcelList, parcelTotal, certificateList, certificateTotal, orderList, orderTotal] = await Promise.all([
        supabaseBrowser.from("parcels").select("id, parcel_number, status, price, city_id, tier").eq("owner_id", user.id).eq("status", "sold").order("updated_at", { ascending: false }).limit(6),
        supabaseBrowser.from("parcels").select("id", { count: "exact", head: true }).eq("owner_id", user.id).eq("status", "sold"),
        supabaseBrowser.from("certificate_requests").select("id, parcel_id, tier, status, certificate_number, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
        supabaseBrowser.from("certificate_requests").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabaseBrowser.from("orders").select("id, parcel_id, amount, currency, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(6),
        supabaseBrowser.from("orders").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      if (cancelled) return;

      const errors: string[] = [];
      if (parcelList.error || parcelTotal.error) { console.error("Parseller yüklenemedi", parcelList.error ?? parcelTotal.error); errors.push("Parsellerim"); }
      if (certificateList.error || certificateTotal.error) { console.error("Sertifikalar yüklenemedi", certificateList.error ?? certificateTotal.error); errors.push("Sertifikalarım"); }
      if (orderList.error || orderTotal.error) { console.error("Siparişler yüklenemedi", orderList.error ?? orderTotal.error); errors.push("Siparişlerim"); }

      setParcels((parcelList.data ?? []) as ParcelRow[]);
      setParcelCount(parcelTotal.count ?? 0);
      setCertificates((certificateList.data ?? []) as CertificateRow[]);
      setCertificateCount(certificateTotal.count ?? 0);
      setOrders((orderList.data ?? []) as OrderRow[]);
      setOrderCount(orderTotal.count ?? 0);
      setDataErrors(errors);
      setDataLoading(false);
    };

    void loadDashboard();
    return () => { cancelled = true; };
  }, [user?.id]);

  if (loading) return <div className="starfield min-h-screen" aria-busy="true" />;
  if (!user) return <Navigate to="/giris" replace />;

  const stats = { parcels: parcelCount, certificates: certificateCount, orders: orderCount, favorites: "—" };

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/panelim" />
        <section className="min-w-0" aria-label="Kullanıcı paneli">
          <div className="panel p-6"><h1 className="font-display text-3xl font-bold">PANELİM</h1><p className="mt-2 text-sm text-muted-foreground">Hesabınızın güncel durumu</p></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {emptyStats.map((item) => <div key={item.title} className="panel flex min-w-0 items-center gap-4 p-5"><item.icon className="h-8 w-8 shrink-0 text-gold" /><div><p className="font-display text-2xl">{dataLoading ? "…" : stats[item.key]}</p><p className="text-sm">{item.title}</p></div></div>)}
          </div>
          {dataErrors.length > 0 && <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">Bazı panel verileri yüklenemedi: {dataErrors.join(", ")}. Diğer veriler gösterilmeye devam ediyor.</div>}
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="panel p-6"><div className="flex items-center justify-between gap-4"><h2 className="font-display text-base tracking-[0.06em]">SON PARSELLERİM</h2><span className="text-xs text-muted-foreground">{dataLoading ? "…" : parcelCount}</span></div><div className="mt-6 space-y-3">
              {!dataLoading && parcels.length === 0 ? <div className="rounded-lg border border-dashed border-border p-8 text-center"><Globe className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 text-sm text-muted-foreground">Henüz satın alınmış parsel bulunmuyor.</p></div> : parcels.map((parcel) => <div key={parcel.id} className="rounded-lg border border-border/70 bg-background/30 p-4"><div className="flex items-center justify-between gap-4"><span className="font-display text-sm">{parcel.parcel_number}</span><span className="text-xs text-gold">{formatTier(parcel.tier)}</span></div><p className="mt-1 text-xs text-muted-foreground">Parsel durumu: Satıldı</p></div>)}
            </div></section>
            <section className="panel p-6"><div className="flex items-center justify-between gap-4"><h2 className="font-display text-base tracking-[0.06em]">SON SİPARİŞLERİM</h2><span className="text-xs text-muted-foreground">{dataLoading ? "…" : orderCount}</span></div><div className="mt-6 space-y-3">
              {!dataLoading && orders.length === 0 ? <div className="rounded-lg border border-dashed border-border p-8 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 text-sm text-muted-foreground">Henüz sipariş bulunmuyor.</p></div> : orders.map((order) => <div key={order.id} className="rounded-lg border border-border/70 bg-background/30 p-4"><div className="flex items-center justify-between gap-4"><span className="font-display text-sm">{order.parcel_id ? `Parsel ${order.parcel_id.slice(0, 8)}` : "Sipariş"}</span><span className="text-xs text-gold">{formatOrderStatus(order.status)}</span></div><p className="mt-1 text-xs text-muted-foreground">{Number(order.amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {order.currency}</p></div>)}
            </div></section>
          </div>
        </section>
      </main><SiteFooter />
    </div>
  );
}
