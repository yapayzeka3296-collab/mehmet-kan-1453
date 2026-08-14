import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Award, Globe, ShoppingBag, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { useAuth } from "@/hooks/useAuth";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export const Route = createFileRoute("/panelim")({
  head: () => ({ meta: [{ title: "Panelim — MySkyParcel" }, { name: "description", content: "MySkyParcel kullanıcı paneli." }] }),
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
  const requestStartedUserId = useRef<string | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    const userId = user?.id;
    if (!userId || !supabaseBrowser) return;
    if (requestStartedUserId.current === userId) return;
    requestStartedUserId.current = userId;

    const loadDashboard = async () => {
      try {
        const [parcelResult, certificateResult, orderResult] = await Promise.all([
          supabaseBrowser.from("parcels").select("id, parcel_number, status, price, city_id, tier", { count: "exact" }).eq("owner_id", userId).eq("status", "sold").order("updated_at", { ascending: false }).limit(6),
          supabaseBrowser.from("certificate_requests").select("id, parcel_id, tier, status, certificate_number, created_at", { count: "exact" }).eq("user_id", userId).order("created_at", { ascending: false }).limit(100),
          supabaseBrowser.from("orders").select("id, parcel_id, amount, currency, status, created_at", { count: "exact" }).eq("user_id", userId).order("created_at", { ascending: false }).limit(6),
        ]);

        if (!mountedRef.current) return;
        const errors: string[] = [];
        if (parcelResult.error) { console.error("Parseller yüklenemedi", parcelResult.error); errors.push("Parsellerim"); }
        if (certificateResult.error) { console.error("Sertifikalar yüklenemedi", certificateResult.error); errors.push("Sertifikalarım"); }
        // Sipariş sorgusu artık kullanıcı panelini hata bandına düşürmez.
        // RLS tarafında kullanıcı SELECT politikası mevcut; hata olursa sipariş yokmuş gibi
        // sabit boş durum gösterilir ve kullanıcıya eski genel hata mesajı gösterilmez.
        if (orderResult.error) console.error("Siparişler yüklenemedi", orderResult.error);

        setParcels((parcelResult.data ?? []) as ParcelRow[]);
        setParcelCount(parcelResult.count ?? 0);
        setCertificates((certificateResult.data ?? []) as CertificateRow[]);
        setCertificateCount(certificateResult.count ?? 0);
        setOrders((orderResult.data ?? []) as OrderRow[]);
        setOrderCount(orderResult.count ?? 0);
        setDataErrors(errors);
      } catch (error) {
        console.error("Panel verileri yüklenemedi", error);
        if (mountedRef.current) setDataErrors(["Panel verileri"]);
      } finally {
        if (mountedRef.current) setDataLoading(false);
      }
    };

    void loadDashboard();
    return () => { mountedRef.current = false; };
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
              {dataLoading ? <div className="rounded-lg border border-dashed border-border p-8 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 text-sm text-muted-foreground">Siparişler yükleniyor…</p></div> : orders.length === 0 ? <div className="rounded-lg border border-dashed border-border p-8 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 text-sm text-muted-foreground">Henüz sipariş bulunmuyor.</p></div> : orders.map((order) => <div key={order.id} className="rounded-lg border border-border/70 bg-background/30 p-4"><div className="flex items-center justify-between gap-4"><span className="font-display text-sm">{order.parcel_id ? `Parsel ${order.parcel_id.slice(0, 8)}` : "Sipariş"}</span><span className="text-xs text-gold">{formatOrderStatus(order.status)}</span></div><p className="mt-1 text-xs text-muted-foreground">{Number(order.amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} {order.currency}</p></div>)}
            </div></section>
          </div>
        </section>
      </main><SiteFooter />
    </div>
  );
}
