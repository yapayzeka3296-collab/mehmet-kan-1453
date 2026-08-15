import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowRight, Calendar, FileBadge, Globe, Grid2x2, Headphones, List, Lock, MoreVertical, ShieldCheck, Star, Truck } from "lucide-react";
import heroCity from "@/assets/hero-city.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { TrustBar, type TrustItem } from "@/components/TrustBar";
import { CertificateArtwork } from "@/components/CertificateArtwork";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";
import type { Parcel } from "@/types/parcel";

export const Route = createFileRoute("/parsellerim")({
  head: () => ({ meta: [
    { title: "Koleksiyonum — MySkyParcel" },
    { name: "description", content: "Satın aldığın gökyüzü parsellerini ve sertifikalarını tek koleksiyon alanında görüntüle." },
  ] }),
  component: Parsellerim,
});

const TABS = [
  { label: "TÜM PARSELLER", key: "all" },
  { label: "AKTİF PARSELLER", key: "active" },
  { label: "HEDİYE EDİLENLER", key: "gifted" },
  { label: "SÜRESİ DOLANLAR", key: "expired" },
] as const;
const FOOTER_TRUST: TrustItem[] = [
  { icon: Globe, title: "7.000 BAŞLANGIÇ PARSELİ", text: "7 pilot ilde ilk parseller açıldı." },
  { icon: ShieldCheck, title: "SERTİFİKA SİSTEMİ", text: "Sertifikalar talep üzerine oluşturulur." },
  { icon: Lock, title: "GÜVENLİ ALTYAPI", text: "Sahiplik ve sertifika geçmişi korunur." },
  { icon: Headphones, title: "7/24 DESTEK", text: "Sorularınız için bize ulaşabilirsiniz." },
];
const TIER_LABELS = { digital: "Dijital", elite: "Elit", premium: "Premium" } as const;
type TabKey = typeof TABS[number]["key"];
type ViewMode = "grid" | "list";
type CollectionCertificate = { id: string; parcel_id: string; tier: "digital" | "elite" | "premium"; status: "requested" | "approved" | "issued" | "rejected" | "revoked"; certificate_number: string | null; requested_at: string; issued_at: string | null; parcel?: { parcel_number?: string | null } | null };

function Parsellerim() {
  const { user, loading: authLoading } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [certificates, setCertificates] = useState<CollectionCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [sortNewest, setSortNewest] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!supabaseBrowser) { if (mounted) { setError("Supabase yapılandırması eksik"); setLoading(false); } return; }
      if (!user) { if (!authLoading && mounted) { setParcels([]); setCertificates([]); } return; }
      setLoading(true); setError(null);
      try {
        const [{ data: parcelData, error: parcelError }, { data: certificateData, error: certificateError }] = await Promise.all([
          supabaseBrowser.from("parcels").select("id, parcel_number, status, owner_id, price, tier, tier_price, city_id, latitude, longitude, created_at, updated_at, cities(name,code)").eq("owner_id", user.id).order("created_at", { ascending: false }).limit(200),
          supabaseBrowser.from("certificate_requests").select("id,parcel_id,tier,status,certificate_number,requested_at,issued_at,parcel:parcels(parcel_number)").eq("user_id", user.id).order("requested_at", { ascending: false }).limit(200),
        ]);
        if (parcelError) throw parcelError;
        if (!mounted) return;
        setParcels(((parcelData ?? []) as any[]).map((p) => ({ ...p, city_name: p.cities?.name, city_code: p.cities?.code })) as Parcel[]);
        if (certificateError) console.error("Collection certificate query failed", certificateError);
        setCertificates((certificateData ?? []) as CollectionCertificate[]);
      } catch (err) { console.error(err); if (mounted) setError("Koleksiyon verileri yüklenirken hata oluştu"); }
      finally { if (mounted) setLoading(false); }
    }
    void load();
    return () => { mounted = false; };
  }, [user, authLoading]);

  const filteredParcels = useMemo(() => {
    let result = parcels;
    if (activeTab === "active") result = result.filter((p) => p.status === "reserved" || p.status === "sold");
    if (activeTab === "gifted" || activeTab === "expired") result = [];
    return [...result].sort((a, b) => sortNewest ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime() : new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [parcels, activeTab, sortNewest]);

  if (authLoading) return <div className="starfield min-h-screen" aria-busy="true" />;
  if (!user) return <Navigate to="/giris" replace />;

  const summaryCounts = [
    ["Toplam Parsel", parcels.length],
    ["Aktif Parsel", parcels.filter((p) => p.status === "reserved" || p.status === "sold").length],
    ["Sertifika", certificates.filter((c) => c.status !== "revoked").length],
    ["Hediye Edilen", 0],
  ];
  const displayName = (() => { const metadata = user.user_metadata as Record<string, unknown> | undefined; const fullName = typeof metadata?.full_name === "string" ? metadata.full_name.trim() : ""; const name = typeof metadata?.name === "string" ? metadata.name.trim() : ""; return fullName || name || user.email?.split("@")[0] || "MySkyParcel Koleksiyoncusu"; })();

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/parsellerim" />
        <div className="min-w-0 grid gap-6 xl:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <div className="panel relative overflow-hidden p-6"><img src={heroCity} alt="" aria-hidden loading="lazy" width={1920} height={1088} className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-40 md:block" /><div className="relative"><h1 className="font-display text-3xl font-bold">KOLEKSİYONUM</h1><p className="mt-2 text-xs text-muted-foreground">Ana Sayfa <span className="mx-2">›</span> Kullanıcı Paneli <span className="mx-2">›</span> <span className="text-gold">Koleksiyonum</span></p></div></div>
            <div className="panel mt-6 p-5"><ul className="flex flex-wrap gap-2">{TABS.map((t) => <li key={t.key}><button type="button" onClick={() => setActiveTab(t.key)} className={`rounded-md px-4 py-2.5 text-[11px] tracking-[0.06em] ${activeTab === t.key ? "border border-gold/60 text-gold" : "text-muted-foreground hover:text-gold"}`}>{t.label}</button></li>)}</ul></div>
            <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"><p className="truncate text-sm text-muted-foreground">{filteredParcels.length} parseliniz bulunuyor.</p><div className="flex shrink-0 items-center gap-2 text-xs"><span className="hidden text-muted-foreground sm:inline">Sırala:</span><select value={sortNewest ? "new" : "old"} onChange={(e) => setSortNewest(e.target.value === "new")} className="rounded-md border border-input bg-background px-3 py-2 text-xs outline-none"><option value="new">Satın Alma Tarihi (Yeni → Eski)</option><option value="old">Satın Alma Tarihi (Eski → Yeni)</option></select><button type="button" onClick={() => setViewMode("grid")} className={`rounded-md border p-2 ${viewMode === "grid" ? "border-gold/50 text-gold" : "border-border"}`} aria-label="Izgara görünüm"><Grid2x2 className="h-4 w-4" /></button><button type="button" onClick={() => setViewMode("list")} className={`rounded-md border p-2 ${viewMode === "list" ? "border-gold/50 text-gold" : "border-border"}`} aria-label="Liste görünüm"><List className="h-4 w-4" /></button></div></div>
            <ul className={viewMode === "grid" ? "mt-4 grid gap-4" : "mt-4 grid gap-2"}>
              {loading && <li className="panel p-4 text-center text-sm text-muted-foreground">Koleksiyon yükleniyor...</li>}
              {!loading && error && <li className="panel p-4 text-center text-sm text-destructive">{error}</li>}
              {!loading && !error && filteredParcels.length === 0 && <li className="panel p-4 text-center text-sm text-muted-foreground">Bu filtrede parsel bulunmuyor.</li>}
              {!loading && filteredParcels.map((p) => (
                <li key={p.id} className={`panel grid gap-4 p-4 ${viewMode === "grid" ? "md:grid-cols-[280px_1fr]" : "md:grid-cols-[180px_1fr]"}`}>
                  <div className="relative overflow-hidden rounded-lg"><img src={heroCity} alt={`${p.parcel_number} parseli`} loading="lazy" width={1920} height={1088} className={`${viewMode === "grid" ? "h-40" : "h-28"} w-full object-cover opacity-80`} /><span className="absolute left-3 top-3 rounded bg-success px-2 py-0.5 text-[10px] font-bold text-background">{p.status === "reserved" ? "REZERVE" : p.status.toUpperCase()}</span></div>
                  <div className="min-w-0"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3"><h2 className="flex min-w-0 items-center gap-2 truncate font-display text-xl">{p.parcel_number} <Star className="h-4 w-4 shrink-0 text-gold" /></h2><div className="flex shrink-0 items-center gap-2"><span className="rounded-full border border-success/40 px-3 py-1 text-[11px] text-success">{p.status === "reserved" ? "Rezerve" : p.status}</span><MoreVertical className="h-4 w-4 text-muted-foreground" /></div></div><p className="mt-2 text-sm text-muted-foreground">{p.city_name ?? "Pilot il"} · {TIER_LABELS[p.tier]} · {p.parcel_number}</p><div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"><div className="flex min-w-0 flex-wrap gap-6 text-xs"><div className="flex items-start gap-2"><Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><span><span className="block text-muted-foreground">Kayıt Tarihi</span>{new Date(p.created_at).toLocaleDateString("tr-TR")}</span></div><div className="flex items-start gap-2"><FileBadge className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><span><span className="block text-muted-foreground">Fiyat</span>{Number(p.tier_price ?? p.price).toLocaleString("tr-TR")} TL</span></div></div><button type="button" className="btn-gold inline-flex shrink-0 items-center gap-2 rounded-md px-5 py-2.5 text-[11px]">DETAYLAR <ArrowRight className="h-4 w-4" /></button></div></div>
                </li>
              ))}
            </ul>

            <section className="mt-10">
              <div className="flex items-end justify-between gap-4"><div><h2 className="font-display text-2xl">SERTİFİKALARIM</h2><p className="mt-1 text-xs text-muted-foreground">Koleksiyonunuza bağlı oluşturulmuş sertifikalar burada görünür.</p></div><Link to="/paketler" className="text-xs text-gold hover:underline">SERTİFİKA SEÇENEKLERİ</Link></div>
              {certificates.length === 0 ? <div className="panel mt-4 p-6 text-center text-sm text-muted-foreground">Henüz sertifika kaydınız yok. Satın alınmış parseliniz için Dijital Sertifika bölümünden uygun sertifikayı oluşturabilirsiniz.</div> : <ul className="mt-4 grid gap-4 sm:grid-cols-2">{certificates.filter((c) => c.status !== "revoked").map((certificate) => { const parcelNumber = certificate.parcel?.parcel_number || certificate.parcel_id; return <li key={certificate.id} className="panel overflow-hidden p-4"><CertificateArtwork tier={certificate.tier} name={displayName} parcelCode={parcelNumber} certificateNumber={certificate.certificate_number} issuedAt={certificate.issued_at || certificate.requested_at} cityName={parcelNumber.includes("-") ? parcelNumber.split("-")[0] : undefined} /><div className="pt-4"><p className="font-display text-lg">{TIER_LABELS[certificate.tier]} Parsel Sertifikası</p><p className="mt-1 text-xs text-gold">Parsel: {parcelNumber}</p><p className="mt-2 text-[11px] text-muted-foreground">Durum: {certificate.status} · {new Date(certificate.requested_at).toLocaleDateString("tr-TR")}</p>{certificate.certificate_number && <p className="mt-1 text-[11px] text-muted-foreground">Sertifika No: {certificate.certificate_number}</p>}</div></li>; })}</ul>}
            </section>
          </div>
          <div className="grid content-start gap-6"><section className="panel p-5"><h2 className="text-xs font-semibold tracking-[0.1em] text-gold">KOLEKSİYON ÖZETİ</h2><dl className="mt-4 space-y-3 text-sm">{summaryCounts.map(([k, v]) => <div key={k} className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>)}</dl></section><section className="panel p-5"><h2 className="text-xs font-semibold tracking-[0.1em]">YARDIMA MI İHTİYACINIZ VAR?</h2><p className="mt-2 text-xs text-muted-foreground">Parselleriniz veya sertifikalarınız hakkında sorularınız için bize ulaşabilirsiniz.</p><Link to="/iletisim" className="mt-4 flex items-center justify-center gap-2 rounded-md border border-gold/60 py-2.5 text-[11px] text-gold">İLETİŞİME GEÇ <Truck className="h-4 w-4" /></Link></section></div>
        </div>
      </main><TrustBar items={FOOTER_TRUST} /><SiteFooter />
    </div>
  );
}
