import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { Award, Bell, Globe, Search, Star } from "lucide-react";
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
type CityRow = { slug: string; name: string };
const emptyStats = [
  { key: "parcels", icon: Globe, title: "Parsellerim" },
  { key: "certificates", icon: Award, title: "Sertifikalarım" },
  { key: "favorites", icon: Star, title: "Favorilerim" },
] as const;
const formatTier = (tier: string | null) => tier === "premium" ? "Premium" : tier === "elite" ? "Elit" : tier === "digital" ? "Dijital" : "-";

function Panelim() {
  const { user, loading } = useAuth();
  const navigate = useNavigate({ from: "/panelim" });
  const userId = user?.id;
  const [parcels, setParcels] = useState<ParcelRow[]>([]);
  const [parcelCount, setParcelCount] = useState(0);
  const [certificates, setCertificates] = useState<CertificateRow[]>([]);
  const [certificateCount, setCertificateCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataErrors, setDataErrors] = useState<string[]>([]);
  const [cities, setCities] = useState<CityRow[]>([]);
  const [searchCity, setSearchCity] = useState("");
  const [searchNumber, setSearchNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ParcelRow[]>([]);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const client = supabaseBrowser;
    if (!userId || !client) return;
    let cancelled = false;
    const loadDashboard = async () => {
      const [parcelResult, certificateResult, cityResult] = await Promise.all([
        client.from("parcels").select("id, parcel_number, status, price, city_id, tier", { count: "exact" }).eq("owner_id", userId).eq("status", "sold").order("updated_at", { ascending: false }).order("parcel_number", { ascending: true }).limit(100),
        client.from("certificate_requests").select("id, parcel_id, tier, status, certificate_number, created_at", { count: "exact" }).eq("user_id", userId).order("created_at", { ascending: false }).limit(100),
        client.from("cities").select("slug,name").order("name", { ascending: true }),
      ]);
      if (cancelled) return;
      const errors: string[] = [];
      if (parcelResult.error) { console.error("Parseller yüklenemedi", parcelResult.error); errors.push("Parsellerim"); }
      if (certificateResult.error) { console.error("Sertifikalar yüklenemedi", certificateResult.error); errors.push("Sertifikalarım"); }
      if (cityResult.error) console.error("İller yüklenemedi", cityResult.error);
      setParcels((parcelResult.data ?? []) as ParcelRow[]);
      setParcelCount(parcelResult.count ?? 0);
      setCertificates((certificateResult.data ?? []) as CertificateRow[]);
      setCertificateCount(certificateResult.count ?? 0);
      setCities((cityResult.data ?? []) as CityRow[]);
      setDataErrors(errors);
      setDataLoading(false);
    };
    void loadDashboard();
    return () => { cancelled = true; };
  }, [userId]);

  async function searchParcel() {
    if (!supabaseBrowser || !searchCity || !searchNumber.trim()) return;
    setSearching(true); setSearchError(""); setSearchResults([]);
    const { data, error } = await supabaseBrowser.rpc("search_available_parcels", { p_city_slug: searchCity, p_query: searchNumber.trim() });
    if (error) setSearchError("Parsel aranırken bir hata oluştu.");
    else setSearchResults((data ?? []) as ParcelRow[]);
    setSearching(false);
  }

  if (loading) return <div className="starfield min-h-screen" aria-busy="true" />;
  if (!user) return <Navigate to="/giris" replace />;
  const stats = { parcels: parcelCount, certificates: certificateCount, favorites: "—" };
  const pendingCertificateCount = certificates.filter((certificate) => certificate.status === "requested").length;

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/panelim" />
        <section className="min-w-0" aria-label="Kullanıcı paneli">
          <div className="panel p-6"><h1 className="font-display text-3xl font-bold">PANELİM</h1><p className="mt-2 text-sm text-muted-foreground">Hesabınızın güncel durumu</p></div>
          {pendingCertificateCount > 0 && <div className="mt-6 rounded-lg border border-gold/40 bg-gold/10 p-4" role="status" aria-live="polite"><div className="flex items-start gap-3"><Bell className="mt-0.5 h-5 w-5 shrink-0 text-gold" /><div><p className="font-display text-sm text-gold">SERTİFİKA TALEBİNİZ ALINDI</p><p className="mt-1 text-xs text-muted-foreground">{pendingCertificateCount === 1 ? "Sertifika talebiniz" : `${pendingCertificateCount} sertifika talebiniz`} başarıyla alındı ve yönetici onayı bekliyor.</p><button type="button" onClick={() => void navigate({ to: "/sertifikalarim" })} className="mt-3 rounded-md border border-gold/40 px-3 py-2 text-xs text-gold hover:bg-gold/10">SERTİFİKALARIMI GÖR</button></div></div></div>}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{emptyStats.map((item) => <div key={item.title} className="panel flex min-w-0 items-center gap-4 p-5"><item.icon className="h-8 w-8 shrink-0 text-gold" /><div><p className="font-display text-2xl">{dataLoading ? "…" : stats[item.key]}</p><p className="text-sm">{item.title}</p></div></div>)}</div>
          <section className="panel mt-6 p-6">
            <div className="flex items-center gap-3"><Search className="h-5 w-5 text-gold" /><div><h2 className="font-display text-base tracking-[0.06em]">PARSEL ARA</h2><p className="mt-1 text-xs text-muted-foreground">81 ilden istediğiniz parsel numarasını Supabase kayıtlarından arayın.</p></div></div>
            <form onSubmit={(e) => { e.preventDefault(); void searchParcel(); }} className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <select value={searchCity} onChange={(e) => setSearchCity(e.target.value)} className="rounded-md border border-border bg-background/40 px-3 py-3 text-sm"><option value="">İl seçin</option>{cities.map((city) => <option key={city.slug} value={city.slug}>{city.name}</option>)}</select>
              <input value={searchNumber} onChange={(e) => setSearchNumber(e.target.value)} placeholder="Parsel numarası" className="rounded-md border border-border bg-background/40 px-3 py-3 text-sm" />
              <button type="submit" disabled={searching || !searchCity || !searchNumber.trim()} className="btn-gold inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-xs disabled:opacity-50"><Search className="h-4 w-4" />{searching ? "ARANIYOR…" : "ARA"}</button>
            </form>
            {searchError && <p className="mt-4 text-sm text-destructive">{searchError}</p>}
            {!searching && searchCity && searchNumber.trim() && searchResults.length === 0 && !searchError && <p className="mt-4 text-sm text-muted-foreground">Satışa uygun parsel bulunamadı.</p>}
            {searchResults.length > 0 && <div className="mt-5 space-y-3">{searchResults.map((parcel) => <div key={parcel.id} className="flex flex-col gap-4 rounded-lg border border-border/70 bg-background/30 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-display text-sm">{parcel.parcel_number}</p><p className="mt-1 text-xs text-muted-foreground">{formatTier(parcel.tier)} · {Number(parcel.price).toLocaleString("tr-TR")} TL · Satışa uygun</p></div><button type="button" onClick={() => void navigate({ to: "/parsel-satin-al", search: { parcels: parcel.id, certificateParcel: parcel.id } })} className="btn-gold rounded-md px-5 py-3 text-xs">SATIN AL</button></div>)}</div>}
          </section>
          {dataErrors.length > 0 && <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground">Bazı panel verileri yüklenemedi: {dataErrors.join(", ")}.</div>}
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="panel p-6"><div className="flex items-center justify-between gap-4"><h2 className="font-display text-base tracking-[0.06em]">SON PARSELLERİM</h2><span className="text-xs text-muted-foreground">{dataLoading ? "…" : parcelCount}</span></div><div className="mt-6 space-y-3">{dataLoading ? <div className="rounded-lg border border-dashed border-border p-8 text-center"><Globe className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 text-sm text-muted-foreground">Parseller yükleniyor…</p></div> : parcels.length === 0 ? <div className="rounded-lg border border-dashed border-border p-8 text-center"><Globe className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 text-sm text-muted-foreground">Henüz satın alınmış parsel bulunmuyor.</p></div> : parcels.map((parcel) => <div key={parcel.id} className="rounded-lg border border-border/70 bg-background/30 p-4"><div className="flex items-center justify-between gap-4"><span className="font-display text-sm">{parcel.parcel_number}</span><span className="text-xs text-gold">{formatTier(parcel.tier)}</span></div><p className="mt-1 text-xs text-muted-foreground">Parsel durumu: Satıldı</p></div>)}</div></section>
            <section className="panel p-6"><div className="flex items-center justify-between gap-4"><h2 className="font-display text-base tracking-[0.06em]">SON SERTİFİKALARIM</h2><span className="text-xs text-muted-foreground">{dataLoading ? "…" : certificateCount}</span></div><div className="mt-6 space-y-3">{dataLoading ? <div className="rounded-lg border border-dashed border-border p-8 text-center"><Award className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 text-sm text-muted-foreground">Sertifikalar yükleniyor…</p></div> : certificates.length === 0 ? <div className="rounded-lg border border-dashed border-border p-8 text-center"><Award className="mx-auto h-8 w-8 text-gold" /><p className="mt-3 text-sm text-muted-foreground">Henüz sertifika bulunmuyor.</p></div> : certificates.slice(0, 6).map((certificate) => <div key={certificate.id} className="rounded-lg border border-border/70 bg-background/30 p-4"><div className="flex items-center justify-between gap-4"><span className="font-display text-sm">{certificate.certificate_number ?? "Sertifika"}</span><span className="text-xs text-gold">{formatTier(certificate.tier)}</span></div><p className="mt-1 text-xs text-muted-foreground">Durum: {certificate.status}</p></div>)}</div></section>
          </div>
        </section>
      </main><SiteFooter />
    </div>
  );
}
