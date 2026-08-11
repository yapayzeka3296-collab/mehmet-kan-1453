import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Award,
  ChevronRight,
  Globe,
  Layers,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
} from "lucide-react";
import heroCity from "@/assets/hero-city.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";
import { useAuth } from "@/hooks/useAuth";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export const Route = createFileRoute("/panelim")({
  head: () => ({
    meta: [
      { title: "Panelim — MySkyParcel" },
      { name: "description", content: "Parsellerini, sertifikalarını ve siparişlerini tek ekrandan yönet." },
      { property: "og:title", content: "Panelim — MySkyParcel" },
      { property: "og:description", content: "MySkyParcel kullanıcı paneli." },
    ],
  }),
  component: Panelim,
});

type Parcel = {
  id: string;
  parcel_number: string;
  status: "available" | "reserved" | "sold";
  latitude: number;
  longitude: number;
  created_at: string;
};

const ACTIONS = [
  { icon: ShoppingCart, label: "Parsel Satın Al", to: "/parsel-satin-al" },
  { icon: Globe, label: "Gökyüzü Haritası", to: "/gokyuzu-haritasi" },
  { icon: ShieldCheck, label: "Sertifika Doğrula", to: "/sertifika-dogrula" },
  { icon: Layers, label: "Paketleri İncele", to: "/paketler" },
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function statusLabel(status: Parcel["status"]) {
  if (status === "sold") return "Satın Alındı";
  if (status === "reserved") return "Rezerve";
  return "Müsait";
}

function Panelim() {
  const { user, loading: authLoading } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [parcelTotal, setParcelTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadUserParcels() {
      if (!user?.id || !supabaseBrowser) {
        if (active) {
          setParcels([]);
          setParcelTotal(0);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      const { data, count, error: queryError } = await supabaseBrowser
        .from("parcels")
        .select("id, parcel_number, status, latitude, longitude, created_at", { count: "exact" })
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      if (!active) return;

      if (queryError) {
        console.error("Panel parcels query failed", queryError);
        setError("Parselleriniz şu anda yüklenemedi. Lütfen biraz sonra tekrar deneyin.");
        setParcels([]);
        setParcelTotal(0);
      } else {
        setParcels((data ?? []) as Parcel[]);
        setParcelTotal(count ?? 0);
      }
      setLoading(false);
    }

    void loadUserParcels();
    return () => {
      active = false;
    };
  }, [user?.id]);

  if (authLoading) return <div className="starfield min-h-screen" aria-busy="true" />;
  if (!user) return <Navigate to="/giris" replace />;

  const displayName = user.name || user.email || "Kullanıcımız";
  const greetingName = displayName.includes("@") ? displayName.split("@")[0] : displayName;

  const stats = [
    { icon: Globe, value: String(parcelTotal), title: "Parselim", sub: "Toplam Parsel" },
    { icon: Award, value: "0", title: "Sertifikam", sub: "Toplam Sertifika" },
    { icon: ShoppingBag, value: "0", title: "Siparişim", sub: "Toplam Sipariş" },
    { icon: Star, value: "—", title: "Favori Şehrim", sub: "Henüz belirlenmedi" },
  ];

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/panelim" />

        <div className="min-w-0">
          <div className="panel relative overflow-hidden p-6">
            <img src={heroCity} alt="" aria-hidden loading="lazy" width={1920} height={1088} className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-40 md:block" />
            <div className="relative">
              <h1 className="font-display text-3xl font-bold">PANELİM</h1>
              <p className="mt-2 text-sm">Hoş geldiniz, <span className="text-gold">{greetingName}</span></p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((s) => (
              <div key={s.title} className="panel flex min-w-0 items-center gap-4 p-5">
                <s.icon className="h-8 w-8 shrink-0 text-gold" />
                <div className="min-w-0"><p className="font-display text-2xl">{s.value}</p><p className="text-sm">{s.title}</p><p className="text-xs text-muted-foreground">{s.sub}</p></div>
              </div>
            ))}
          </div>

          {error && <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="panel p-6">
              <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"><h2 className="truncate font-display text-base tracking-[0.06em]">SON PARSELLERİM</h2><Link to="/parsellerim" className="shrink-0 text-xs text-gold hover:underline">Tüm Parsellerim →</Link></header>
              {loading ? <p className="mt-6 text-sm text-muted-foreground">Parselleriniz yükleniyor...</p> : parcels.length === 0 ? (
                <div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center"><Globe className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 text-sm font-medium">Henüz parseliniz yok.</p><p className="mt-1 text-xs text-muted-foreground">Gökyüzü Haritası'ndan bir parsel seçerek başlayabilirsiniz.</p><Link to="/parsel-satin-al" className="mt-4 inline-flex rounded-lg border border-gold/50 px-4 py-2 text-xs text-gold hover:bg-gold/10">Parsel Satın Al</Link></div>
              ) : (
                <ul className="mt-4 divide-y divide-border">{parcels.map((p) => <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4"><div className="min-w-0"><p className="font-semibold">{p.parcel_number}</p><p className="mt-1 text-xs text-muted-foreground">Koordinat: {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}</p><p className="mt-1 text-xs text-muted-foreground">Kayıt Tarihi: {formatDate(p.created_at)}</p></div><div className="flex shrink-0 items-center gap-3"><span className="rounded-full border border-success/40 px-3 py-1 text-[11px] text-success">{statusLabel(p.status)}</span><ChevronRight className="h-4 w-4 text-gold" /></div></li>)}</ul>
              )}
            </section>

            <section className="panel p-6"><header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"><h2 className="truncate font-display text-base tracking-[0.06em]">SON SİPARİŞLERİM</h2><Link to="/siparislerim" className="shrink-0 text-xs text-gold hover:underline">Tüm Siparişlerim →</Link></header><div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 text-sm font-medium">Henüz siparişiniz yok.</p><p className="mt-1 text-xs text-muted-foreground">Gerçek siparişleriniz oluştuğunda burada görünecek.</p></div></section>
            <section className="panel p-6"><header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"><h2 className="truncate font-display text-base tracking-[0.06em]">SERTİFİKALARIM</h2><Link to="/sertifikalarim" className="shrink-0 text-xs text-gold hover:underline">Tüm Sertifikalarım →</Link></header><div className="mt-6 rounded-lg border border-dashed border-border p-6 text-center"><Award className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 text-sm font-medium">Henüz sertifikanız yok.</p><p className="mt-1 text-xs text-muted-foreground">Size ait gerçek sertifikalar oluşturulduğunda burada görünecek.</p><Link to="/sertifikalarim" className="mt-4 inline-flex rounded-lg border border-gold/50 px-4 py-2 text-xs text-gold hover:bg-gold/10">Sertifikalarım</Link></div></section>
            <section className="panel p-6"><h2 className="font-display text-base tracking-[0.06em]">HIZLI İŞLEMLER</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">{ACTIONS.map((a) => <Link key={a.label} to={a.to} className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-4 py-4 text-sm transition-colors hover:border-gold hover:text-gold"><a.icon className="h-5 w-5 shrink-0 text-gold" /><span className="truncate">{a.label}</span></Link>)}</div></section>
          </div>
        </div>
      </main>
      <TrustBar items={SECURITY_TRUST} />
      <SiteFooter />
    </div>
  );
}
