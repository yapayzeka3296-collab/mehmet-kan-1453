import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { Award, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/sertifika-talep")({
  head: () => ({ meta: [{ title: "Sertifika Talebi — MySkyParcel" }] }),
  component: SertifikaTalep,
});

type Parcel = { id: string; parcel_number: string; tier: "digital" | "elite" | "premium"; city?: { name?: string | null } | null };
const TIER_LABELS = { digital: "Dijital", elite: "Özel", premium: "Premium" } as const;
const ACTIVE_CERTIFICATE_STATUSES = new Set(["requested", "approved", "issued", "revoked"]);

function SertifikaTalep() {
  const { user, loading: authLoading } = useAuth();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !supabaseBrowser) { setLoading(false); return; }
    void (async () => {
      const [parcelResult, certificateResult] = await Promise.all([
        supabaseBrowser.from("parcels").select("id,parcel_number,tier,cities(name)").eq("owner_id", user.id).eq("status", "sold").order("created_at", { ascending: false }),
        supabaseBrowser.from("certificate_requests").select("parcel_id,status").eq("user_id", user.id),
      ]);
      if (parcelResult.error) {
        console.error("Owned parcels for certificate request failed", parcelResult.error);
        setParcels([]);
      } else {
        const existingParcelIds = new Set((certificateResult.data ?? []).filter((row) => ACTIVE_CERTIFICATE_STATUSES.has(String(row.status))).map((row) => String(row.parcel_id)));
        setParcels(((parcelResult.data ?? []) as Parcel[]).filter((parcel) => !existingParcelIds.has(parcel.id)));
      }
      setLoading(false);
    })();
  }, [user]);

  async function requestCertificate(parcelId: string) {
    if (!supabaseBrowser) return;
    setBusy(parcelId); setMessage(null);
    const { error } = await supabaseBrowser.rpc("request_certificate", { p_parcel_id: parcelId });
    if (error) setMessage(error.message === "certificate_already_requested" ? "Bu parsel için zaten aktif bir sertifika talebiniz var." : "Sertifika talebi oluşturulamadı.");
    else { setMessage("Sertifika talebiniz oluşturuldu. Onay ve yayın işlemi tamamlandığında Sertifikalarım bölümünde görünecektir."); setParcels((current) => current.filter((parcel) => parcel.id !== parcelId)); }
    setBusy(null);
  }

  if (authLoading) return <div className="starfield min-h-screen" aria-busy="true" />;
  if (!user) return <Navigate to="/giris" replace />;

  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto grid max-w-[1400px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8"><UserSidebar active="/sertifikalarim" /><div className="min-w-0"><div className="panel p-6"><Link to="/sertifikalarim" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-gold"><ArrowLeft className="h-4 w-4" /> Sertifikalarım</Link><div className="mt-5 flex items-center gap-3"><Award className="h-8 w-8 text-gold" /><div><h1 className="font-display text-3xl font-bold">SERTİFİKA TALEP ET</h1><p className="mt-1 text-xs text-muted-foreground">Seçtiğiniz parselin türüne göre, adınıza özel olarak hazırlanan dijital sertifikanız oluşturulur.</p></div></div></div>{message && <div className="panel mt-6 flex items-start gap-3 p-5 text-sm"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" /><span>{message}</span></div>}<section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{loading && <div className="panel p-6 text-sm text-muted-foreground">Parselleriniz yükleniyor...</div>}{!loading && parcels.length === 0 && <div className="panel p-6 text-sm text-muted-foreground">Sertifika talep edilebilecek satın alınmış parsel bulunamadı.</div>}{!loading && parcels.map((parcel) => <article key={parcel.id} className="panel p-5"><p className="font-display text-xl">{parcel.parcel_number}</p><p className="mt-1 text-xs text-muted-foreground">{parcel.city?.name || "Türkiye"} · {TIER_LABELS[parcel.tier]}</p><button type="button" disabled={busy === parcel.id} onClick={() => void requestCertificate(parcel.id)} className="btn-gold mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs disabled:opacity-60">{busy === parcel.id && <Loader2 className="h-4 w-4 animate-spin" />} SERTİFİKA TALEP ET</button></article>)}</section></div></main><TrustBar items={SECURITY_TRUST} /><SiteFooter /></div>;
}
