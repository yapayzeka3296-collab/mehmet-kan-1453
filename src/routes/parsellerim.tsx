import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { ArrowRight, Calendar, FileBadge, Globe, Grid2x2, Headphones, List, Lock, MapPin, MoreVertical, ShieldCheck, Star, Truck, X } from "lucide-react";
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

const FOOTER_TRUST: TrustItem[] = [
  { icon: Globe, title: "7.000 BAŞLANGIÇ PARSELİ", text: "7 pilot ilde ilk parseller açıldı." },
  { icon: ShieldCheck, title: "SERTİFİKA SİSTEMİ", text: "Sertifikalar talep üzerine oluşturulur." },
  { icon: Lock, title: "GÜVENLİ ALTYAPI", text: "Sahiplik ve sertifika geçmişi korunur." },
  { icon: Headphones, title: "7/24 DESTEK", text: "Sorularınız için bize ulaşabilirsiniz." },
];
const TIER_LABELS = { digital: "Dijital", elite: "Elit", premium: "Premium" } as const;
type ViewMode = "grid" | "list";
type CollectionCertificate = { id: string; parcel_id: string; tier: "digital" | "elite" | "premium"; status: "requested" | "approved" | "issued" | "rejected" | "revoked"; certificate_number: string | null; requested_at: string; issued_at: string | null; parcel?: { parcel_number?: string | null } | null };

function Parsellerim() {
  const { user, loading: authLoading } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [certificates, setCertificates] = useState<CollectionCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortNewest, setSortNewest] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<CollectionCertificate | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!supabaseBrowser) { if (mounted) { setError("Supabase yapılandırması eksik"); setLoading(false); } return; }
      if (!user) { if (!authLoading && mounted) { setParcels([]); setCertificates([]); } return; }
      setLoading(true); setError(null);
      try {
        const [{ data: parcelData, error: parcelError }, { data: certificateData, error: certificateError }] = await Promise.all([
          // Koleksiyonum yalnızca gerçekten satın alınmış/satılmış parselleri gösterir.
          supabaseBrowser.from("parcels").select("id, parcel_number, status, owner_id, price, tier, tier_price, city_id, latitude, longitude, created_at, updated_at, cities(name,code)").eq("owner_id", user.id).eq("status", "sold").order("created_at", { ascending: false }).limit(200),
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

  useEffect(() => {
    if (!selectedParcel && !selectedCertificate) return;
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { setSelectedParcel(null); setSelectedCertificate(null); } };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handleKeyDown); document.body.style.overflow = previousOverflow; };
  }, [selectedParcel, selectedCertificate]);

  const purchasedParcels = useMemo(() => [...parcels].sort((a, b) => sortNewest ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime() : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()), [parcels, sortNewest]);

  if (authLoading) return <div className="starfield min-h-screen" aria-busy="true" />;
  if (!user) return <Navigate to="/giris" replace />;

  const summaryCounts = [
    ["Satın Alınan Parsel", purchasedParcels.length],
    ["Aktif Sahiplik", purchasedParcels.length],
    ["Sertifika", certificates.filter((c) => c.status !== "revoked").length],
    ["Hediye Edilen", 0],
  ];
  const displayName = (() => { const metadata = user.user_metadata as Record<string, unknown> | undefined; const fullName = typeof metadata?.full_name === "string" ? metadata.full_name.trim() : ""; const name = typeof metadata?.name === "string" ? metadata.name.trim() : ""; return fullName || name || user.email?.split("@")[0] || "MySkyParcel Koleksiyoncusu"; })();
  const statusLabel = (status: string) => status === "sold" ? "SATIN ALINDI" : status.toUpperCase();

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/parsellerim" />
        <div className="min-w-0 grid gap-6 xl:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <div className="panel relative overflow-hidden p-6"><img src={heroCity} alt="" aria-hidden loading="lazy" width={1920} height={1088} className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-40 md:block" /><div className="relative"><h1 className="font-display text-3xl font-bold">KOLEKSİYONUM</h1><p className="mt-2 text-xs text-muted-foreground">Ana Sayfa <span className="mx-2">›</span> Kullanıcı Paneli <span className="mx-2">›</span> <span className="text-gold">Koleksiyonum</span></p><p className="mt-3 max-w-2xl text-sm text-muted-foreground">Burada yalnızca satın aldığınız ve sahipliğinizde bulunan parseller gösterilir.</p></div></div>
            <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4"><p className="truncate text-sm text-muted-foreground">{purchasedParcels.length} satın alınmış parseliniz bulunuyor.</p><div className="flex shrink-0 items-center gap-2 text-xs"><span className="hidden text-muted-foreground sm:inline">Sırala:</span><select value={sortNewest ? "new" : "old"} onChange={(e) => setSortNewest(e.target.value === "new")} className="rounded-md border border-input bg-background px-3 py-2 text-xs outline-none"><option value="new">Satın Alma Tarihi (Yeni → Eski)</option><option value="old">Satın Alma Tarihi (Eski → Yeni)</option></select><button type="button" onClick={() => setViewMode("grid")} className={`rounded-md border p-2 ${viewMode === "grid" ? "border-gold/50 text-gold" : "border-border"}`} aria-label="Izgara görünüm"><Grid2x2 className="h-4 w-4" /></button><button type="button" onClick={() => setViewMode("list")} className={`rounded-md border p-2 ${viewMode === "list" ? "border-gold/50 text-gold" : "border-border"}`} aria-label="Liste görünüm"><List className="h-4 w-4" /></button></div></div>
            <ul className={viewMode === "grid" ? "mt-4 grid gap-4" : "mt-4 grid gap-2"}>
              {loading && <li className="panel p-4 text-center text-sm text-muted-foreground">Satın alınan parseller yükleniyor...</li>}
              {!loading && error && <li className="panel p-4 text-center text-sm text-destructive">{error}</li>}
              {!loading && !error && purchasedParcels.length === 0 && <li className="panel p-8 text-center text-sm text-muted-foreground"><p className="font-display text-lg text-foreground">Henüz satın alınmış parseliniz yok.</p><p className="mt-2">Satın aldığınız parseller burada otomatik olarak görünecektir.</p><Link to="/parsel-satin-al" className="btn-gold mt-5 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-[11px]">PARSEL SATIN AL <ArrowRight className="h-4 w-4" /></Link></li>}
              {!loading && purchasedParcels.map((p) => (
                <li key={p.id} className={`panel grid gap-4 p-4 ${viewMode === "grid" ? "md:grid-cols-[280px_1fr]" : "md:grid-cols-[180px_1fr]"}`}>
                  <div className="relative overflow-hidden rounded-lg"><img src={heroCity} alt={`${p.parcel_number} parseli`} loading="lazy" width={1920} height={1088} className={`${viewMode === "grid" ? "h-40" : "h-28"} w-full object-cover opacity-80`} /><span className="absolute left-3 top-3 rounded bg-success px-2 py-0.5 text-[10px] font-bold text-background">SATIN ALINDI</span></div>
                  <div className="min-w-0"><div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3"><h2 className="flex min-w-0 items-center gap-2 truncate font-display text-xl">{p.parcel_number} <Star className="h-4 w-4 shrink-0 text-gold" /></h2><div className="flex shrink-0 items-center gap-2"><span className="rounded-full border border-success/40 px-3 py-1 text-[11px] text-success">Sahibisiniz</span><MoreVertical className="h-4 w-4 text-muted-foreground" /></div></div><p className="mt-2 text-sm text-muted-foreground">{p.city_name ?? "Pilot il"} · {TIER_LABELS[p.tier]} · {p.parcel_number}</p><div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"><div className="flex min-w-0 flex-wrap gap-6 text-xs"><div className="flex items-start gap-2"><Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><span><span className="block text-muted-foreground">Satın Alma Tarihi</span>{new Date(p.created_at).toLocaleDateString("tr-TR")}</span></div><div className="flex items-start gap-2"><FileBadge className="mt-0.5 h-4 w-4 shrink-0 text-gold" /><span><span className="block text-muted-foreground">Paket</span>{TIER_LABELS[p.tier]}</span></div></div><button type="button" onClick={() => setSelectedParcel(p)} className="btn-gold inline-flex shrink-0 items-center gap-2 rounded-md px-5 py-2.5 text-[11px]">DETAYLAR <ArrowRight className="h-4 w-4" /></button></div></div>
                </li>
              ))}
            </ul>

            <section className="mt-10">
              <div className="flex items-end justify-between gap-4"><div><h2 className="font-display text-2xl">SERTİFİKALARIM</h2><p className="mt-1 text-xs text-muted-foreground">Satın alınmış parsellerinize bağlı oluşturulmuş sertifikalar burada görünür.</p></div><Link to="/paketler" className="text-xs text-gold hover:underline">SERTİFİKA SEÇENEKLERİ</Link></div>
              {certificates.length === 0 ? <div className="panel mt-4 p-6 text-center text-sm text-muted-foreground">Henüz sertifika kaydınız yok. Satın alınmış parseliniz için uygun sertifikayı oluşturabilirsiniz.</div> : <ul className="mt-4 grid gap-4 sm:grid-cols-2">{certificates.filter((c) => c.status !== "revoked").map((certificate) => { const parcelNumber = certificate.parcel?.parcel_number || certificate.parcel_id; return <li key={certificate.id} className="panel overflow-hidden p-4"><div role="button" tabIndex={0} onClick={() => setSelectedCertificate(certificate)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedCertificate(certificate); } }} className="cursor-pointer rounded-lg outline-none transition hover:ring-1 hover:ring-gold/60 focus-visible:ring-2 focus-visible:ring-gold" aria-label={`${TIER_LABELS[certificate.tier]} sertifikasını görüntüle`}><CertificateArtwork tier={certificate.tier} name={displayName} parcelCode={parcelNumber} certificateNumber={certificate.certificate_number} issuedAt={certificate.issued_at || certificate.requested_at} cityName={parcelNumber.includes("-") ? parcelNumber.split("-")[0] : undefined} /></div><div className="pt-4"><p className="font-display text-lg">{TIER_LABELS[certificate.tier]} Parsel Sertifikası</p><p className="mt-1 text-xs text-gold">Parsel: {parcelNumber}</p><p className="mt-2 text-[11px] text-muted-foreground">Durum: {certificate.status} · {new Date(certificate.requested_at).toLocaleDateString("tr-TR")}</p>{certificate.certificate_number && <p className="mt-1 text-[11px] text-muted-foreground">Sertifika No: {certificate.certificate_number}</p>}<p className="mt-3 text-[11px] text-gold/80">Sertifikayı büyük görüntülemek için tıklayın.</p></div></li>; })}</ul>}
            </section>
          </div>
          <div className="grid content-start gap-6"><section className="panel p-5"><h2 className="text-xs font-semibold tracking-[0.1em] text-gold">KOLEKSİYON ÖZETİ</h2><dl className="mt-4 space-y-3 text-sm">{summaryCounts.map(([k, v]) => <div key={k} className="flex items-center justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>)}</dl></section><section className="panel p-5"><h2 className="text-xs font-semibold tracking-[0.1em]">YARDIMA MI İHTİYACINIZ VAR?</h2><p className="mt-2 text-xs text-muted-foreground">Parselleriniz veya sertifikalarınız hakkında sorularınız için bize ulaşabilirsiniz.</p><Link to="/iletisim" className="mt-4 flex items-center justify-center gap-2 rounded-md border border-gold/60 py-2.5 text-[11px] text-gold">İLETİŞİME GEÇ <Truck className="h-4 w-4" /></Link></section></div>
        </div>
      </main>

      {selectedParcel && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Parsel detayları" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedParcel(null); }}><div className="relative max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-xl border border-gold/30 bg-background shadow-2xl"><div className="flex items-center justify-between border-b border-border px-5 py-4"><div><p className="font-display text-xl">PARSEL DETAYLARI</p><p className="mt-1 text-xs text-gold">{selectedParcel.parcel_number}</p></div><button type="button" onClick={() => setSelectedParcel(null)} className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-gold" aria-label="Parsel detaylarını kapat"><X className="h-5 w-5" /></button></div><div className="max-h-[calc(92vh-76px)] overflow-auto p-5"><div className="relative overflow-hidden rounded-lg"><img src={heroCity} alt="" aria-hidden className="h-44 w-full object-cover opacity-70" /><div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" /><div className="absolute bottom-4 left-4"><p className="font-display text-2xl">{selectedParcel.parcel_number}</p><p className="text-xs text-gold">{selectedParcel.city_name || "—"} · {TIER_LABELS[selectedParcel.tier]}</p></div></div><dl className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-border p-4"><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Parsel Numarası</dt><dd className="mt-1 font-semibold">{selectedParcel.parcel_number}</dd></div><div className="rounded-lg border border-border p-4"><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Şehir</dt><dd className="mt-1 font-semibold">{selectedParcel.city_name || "—"}{selectedParcel.city_code ? ` (${selectedParcel.city_code})` : ""}</dd></div><div className="rounded-lg border border-border p-4"><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Paket</dt><dd className="mt-1 font-semibold">{TIER_LABELS[selectedParcel.tier]}</dd></div><div className="rounded-lg border border-border p-4"><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Durum</dt><dd className="mt-1 font-semibold text-success">SATIN ALINDI / SAHİBİSİNİZ</dd></div><div className="rounded-lg border border-border p-4"><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Satın Alma Tarihi</dt><dd className="mt-1 font-semibold">{new Date(selectedParcel.created_at).toLocaleDateString("tr-TR")}</dd></div><div className="rounded-lg border border-border p-4"><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Parsel Fiyatı</dt><dd className="mt-1 font-semibold">{Number(selectedParcel.tier_price ?? selectedParcel.price).toLocaleString("tr-TR")} TL</dd></div><div className="rounded-lg border border-border p-4"><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Enlem</dt><dd className="mt-1 font-semibold">{Number(selectedParcel.latitude).toFixed(6)}</dd></div><div className="rounded-lg border border-border p-4"><dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Boylam</dt><dd className="mt-1 font-semibold">{Number(selectedParcel.longitude).toFixed(6)}</dd></div></dl><div className="mt-4 rounded-lg border border-gold/20 bg-gold/5 p-4"><div className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" /><div><p className="text-sm font-semibold">Parsel konumu</p><p className="mt-1 text-xs text-muted-foreground">Bu kayıt, satın aldığınız parselin sistemdeki koordinatlarını gösterir.</p><p className="mt-2 text-xs text-gold">{Number(selectedParcel.latitude).toFixed(6)}, {Number(selectedParcel.longitude).toFixed(6)}</p></div></div></div></div></div></div>}

      {selectedCertificate && (() => { const parcelNumber = selectedCertificate.parcel?.parcel_number || selectedCertificate.parcel_id; return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Sertifika görüntüleme" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCertificate(null); }}><div className="relative flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl border border-gold/30 bg-background shadow-2xl"><div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3"><div><p className="font-display text-lg">{TIER_LABELS[selectedCertificate.tier]} Parsel Sertifikası</p><p className="text-[11px] text-muted-foreground">{parcelNumber}{selectedCertificate.certificate_number ? ` · ${selectedCertificate.certificate_number}` : ""}</p></div><button type="button" onClick={() => setSelectedCertificate(null)} className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-gold" aria-label="Sertifikayı kapat"><X className="h-5 w-5" /></button></div><div className="min-h-0 overflow-auto p-3 sm:p-6"><div className="mx-auto max-w-5xl"><CertificateArtwork tier={selectedCertificate.tier} name={displayName} parcelCode={parcelNumber} certificateNumber={selectedCertificate.certificate_number} issuedAt={selectedCertificate.issued_at || selectedCertificate.requested_at} cityName={parcelNumber.includes("-") ? parcelNumber.split("-")[0] : undefined} /></div></div></div></div>; })()}
      <TrustBar items={FOOTER_TRUST} /><SiteFooter />
    </div>
  );
}
