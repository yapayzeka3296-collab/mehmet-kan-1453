import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Award, Globe, Star } from "lucide-react";
import { useEffect, useState } from "react";
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

const emptyStats = [
  { key: "parcels", icon: Globe, title: "Parsellerim" },
  { key: "certificates", icon: Award, title: "Sertifikalarım" },
  { key: "favorites", icon: Star, title: "Favorilerim" },
] as const;

const formatTier = (tier: string | null) => tier === "premium" ? "Premium" : tier === "elite" ? "Elit" : tier === "digital" ? "Dijital" : "-";

function Panelim() {
  const { user, loading } = useAuth();
  const userId = user?.id;
  const [parcels, setParcels] = useState<ParcelRow[]>([]);
  const [parcelCount, setParcelCount] = useState(0);
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [certificateCount, setCertificateCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataErrors, setDataErrors] = useState<string[]>([]);

  useEffect(() => {
    const client = supabaseBrowser;
    if (!userId || !client) return;
    let cancelled = false;
    const loadDashboard = async () => {
      const [parcelResult, certificateResult] = await Promise.all([
        client.from("parcels").select("id, parcel_number, status, price, city_id, tier", { count: "exact" }).eq("owner_id", userId).eq("status", "sold").order("updated_at", { ascending: false }).order("parcel_number", { ascending: true }).limit(100),
        client.from("certificate_requests").select("id, parcel_id, tier, status, certificate_number, created_at", { count: "exact" }).eq("user_id", userId).order("created_at", { ascending: false }).limit(100),
      ]);
      if (cancelled) return;
      const errors: string[] = [];
      if (parcelResult.error) { console.error("Parseller yüklenemedi", parcelResult.error); errors.push("Parsellerim"); }
      if (certificateResult.error) { console.error("Sertifikalar yüklenemedi", certificateResult.error); errors.push("Sertifikalarım"); }
      setParcels((parcelResult.data ?? []) as ParcelRow[]);
      setParcelCount(parcelResult.count ?? 0);
      setCertificates((certificateResult.data ?? []) as CertificateRow[]);
      setCertificateCount(certificateResult.count ?? 0);
      setDataErrors(errors);
      setDataLoading(false);
    };
    void loadDashboard();
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) return <div className="starfield min-h-screen" aria-busy="true" />;
  if (!user) return <Navigate to="/giris" replace />;

  const stats = { parcels: parcelCount, certificates: certificateCount, favorites: "—" };
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/panelim" />
        <section className="min-w-0" aria-label="Kullanıcı paneli">
          <div className="panel p-6"><h1 className="font-display text-3xl font-bold">PANELİM</h1><p className="mt-2 text-sm text-muted-foreground">Hesabınızın güncel durumu</p></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {emptyStats.map((item) => <div key={item.title} className="panel flex min-w-0 items-center gap-4 p-5"><item.icon className="h-8 w-8 shrink-0 text-gold" /><div><p className="font-display text-2xl">{dataLoading ? "…" : stats[item.key]}</p><p className="text-sm">{item.title}</p></div></div>)}
          </div>
          {dataErrors.length > 0 && <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">Bazı panel verileri yüklenemedi: {dataErrors.join(", ")}.</div>}
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="panel p-6"><div className="flex items-center justify-between gap-4"><h2 className="font-display text-base tracking-[0.06em]">SON PARSELLERİM</h2><span className="text-xs text-muted-foreground">{dataLoading ? "…" : parcelCount}</span></div><div className="mt-6 space-y-3">
              {dataLoading ? <div className="rounded-lg border border-dashed border-border p-8 text-center"><Globe className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 text-sm text-muted-foreground">Parseller yükleniyor…</p></div> : parcels.length === 0 ? <div className="rounded-lg border border-dashed border-border p-8 text-center"><Globe className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 text-sm text-muted-foreground">Henüz satın alınmış parsel bulunmuyor.</p></div> : parcels.map((parcel) => <div key={parcel.id} className="rounded-lg border border-border/70 bg-background/30 p-4"><div className="flex items-center justify-between gap-4"><span className="font-display text-sm">{parcel.parcel_number}</span><span className="text-xs text-gold">{formatTier(parcel.tier)}</span></div><p className="mt-1 text-xs text-muted-foreground">Parsel durumu: Satıldı</p></div>)}
            </div></section>
            <section className="panel p-6"><div className="flex items-center justify-between gap-4"><h2 className="font-display text-base tracking-[0.06em]">SON SERTİFİKALARIM</h2><span className="text-xs text-muted-foreground">{dataLoading ? "…" : certificateCount}</span></div><div className="mt-6 space-y-3">
              {dataLoading ? <div className="rounded-lg border border-dashed border-border p-8 text-center"><Award className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 text-sm text-muted-foreground">Sertifikalar yükleniyor…</p></div> : certificates.length === 0 ? <div className="rounded-lg border border-dashed border-border p-8 text-center"><Award className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 text-sm text-muted-foreground">Henüz sertifika bulunmuyor.</p></div> : certificates.slice(0, 6).map((certificate) => <div key={certificate.id} className="rounded-lg border border-border/70 bg-background/30 p-4"><div className="flex items-center justify-between gap-4"><span className="font-display text-sm">{certificate.certificate_number ?? "Sertifika"}</span><span className="text-xs text-gold">{formatTier(certificate.tier)}</span></div><p className="mt-1 text-xs text-muted-foreground">Durum: {certificate.status}</p></div>)}
            </div></section>
          </div>
        </section>
      </main><SiteFooter />
    </div>
  );
}
