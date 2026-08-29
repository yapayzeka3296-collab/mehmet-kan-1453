import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { Award, Eye, RefreshCw, ShieldCheck, Share2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";
import { CertificateRenderer } from "@/components/certificates/CertificateRenderer";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/sertifikalarim")({
  head: () => ({ meta: [{ title: "Sertifikalarım — MySkyParcel" }, { name: "description", content: "MySkyParcel sertifikalarınızı görüntüleyin ve doğrulayın." }] }),
  component: Sertifikalarim,
});

type Certificate = {
  id: string; parcel_id: string; parcel?: { parcel_number?: string | null } | null;
  tier: "digital" | "elite" | "premium";
  status: "requested" | "approved" | "issued" | "rejected" | "revoked";
  certificate_number: string | null; requested_at: string; issued_at: string | null;
  holder_name_snapshot: string | null; city_name_snapshot: string | null;
  certificate_fingerprint: string | null; verification_url: string | null;
};
const TIER_LABELS = { digital: "Dijital", elite: "Özel", premium: "Premium" } as const;
const STATUS_LABELS = { requested: "Talep edildi", approved: "Onaylandı", issued: "Yayınlandı", rejected: "Reddedildi", revoked: "İptal edildi" } as const;

async function shareCertificate(certificate: Certificate) {
  const code = certificate.certificate_number;
  const url = code ? `${window.location.origin}/sertifika-dogrula?code=${encodeURIComponent(code)}` : `${window.location.origin}/sertifikalarim`;
  const title = `${TIER_LABELS[certificate.tier]} MySkyParcel Sertifikası`;
  if (navigator.share) { await navigator.share({ title, text: `MySkyParcel sertifikası: ${code || "Sertifika"}`, url }); return; }
  await navigator.clipboard.writeText(url);
}

function Sertifikalarim() {
  const { user, loading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]); const [selected, setSelected] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [sharingId, setSharingId] = useState<string | null>(null);
  const loadCertificates = useCallback(async () => {
    if (!user || !supabaseBrowser) { setCertificates([]); setLoading(false); return; }
    setLoading(true); setError(null);
    const { data, error: queryError } = await supabaseBrowser.from("certificate_requests").select("id,parcel_id,tier,status,certificate_number,requested_at,issued_at,holder_name_snapshot,city_name_snapshot,certificate_fingerprint,verification_url,parcel:parcels(parcel_number)").eq("user_id", user.id).order("requested_at", { ascending: false });
    if (queryError) { console.error("Certificate query failed", queryError); setError("Sertifika kayıtları yüklenemedi."); } else setCertificates((data as Certificate[]) ?? []);
    setLoading(false);
  }, [user]);
  useEffect(() => { void loadCertificates(); }, [loadCertificates]);
  if (authLoading) return <div className="starfield min-h-screen" aria-busy="true" />;
  if (!user) return <Navigate to="/giris" replace />;
  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8"><UserSidebar active="/sertifikalarim" /><div className="min-w-0">
    <div className="panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="font-display text-3xl font-bold">SERTİFİKALARIM</h1><p className="mt-2 text-xs text-muted-foreground">MySkyParcel sertifikalarınız, doğrulama bilgileri ve güncel şablonlarıyla birlikte burada saklanır.</p></div><div className="flex flex-wrap gap-2"><Link to="/sertifika-talep" className="btn-gold rounded-md px-3 py-2 text-xs">SERTİFİKA TALEP ET</Link><button type="button" onClick={() => void loadCertificates()} className="rounded-md border border-input px-3 py-2 text-xs hover:bg-accent" aria-label="Sertifikaları yenile"><RefreshCw className="mr-2 inline h-3.5 w-3.5" /> Yenile</button></div></div>
    {error && <div className="panel mt-6 p-6 text-sm text-red-300" role="alert">{error}</div>}{loading && <div className="panel mt-6 p-6 text-sm text-muted-foreground">Sertifika kayıtları yükleniyor...</div>}
    {!loading && !error && certificates.length === 0 && <div className="panel mt-6 p-8 text-center"><Award className="mx-auto h-12 w-12 text-gold" /><h2 className="mt-4 font-display text-xl">Henüz sertifika kaydınız yok</h2><p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">Sahip olduğunuz bir parsel için sertifika talebi oluşturabilirsiniz.</p><Link to="/sertifika-talep" className="btn-gold mt-5 inline-flex rounded-md px-5 py-2.5 text-xs">SERTİFİKA TALEP ET</Link></div>}
    {!loading && !error && certificates.length > 0 && <section className="mt-6"><div className="mb-4"><h2 className="font-display text-xl">SERTİFİKA KAYITLARIM</h2><p className="mt-1 text-xs text-muted-foreground">Şablonlar DİJİTAL, ÖZEL ve PREMIUM olarak ayrılır. Yayınlanmış sertifikalar doğrulama, paylaşma ve yazdırma/PDF akışına sahiptir.</p></div><ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{certificates.map((certificate) => { const parcelNumber = certificate.parcel?.parcel_number || certificate.parcel_id; const issued = certificate.status === "issued"; return <li key={certificate.id} className="panel p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-display text-lg">{TIER_LABELS[certificate.tier]} Sertifika</p><p className="mt-1 text-xs text-gold">Parsel: {parcelNumber}</p></div><Award className="h-5 w-5 shrink-0 text-gold" /></div><dl className="mt-4 space-y-2 text-xs text-muted-foreground"><div className="flex justify-between gap-4"><dt>Durum</dt><dd className="text-foreground">{STATUS_LABELS[certificate.status]}</dd></div><div className="flex justify-between gap-4"><dt>Sertifika No</dt><dd className="text-right text-foreground">{certificate.certificate_number || "—"}</dd></div><div className="flex justify-between gap-4"><dt>Düzenlenme</dt><dd className="text-foreground">{certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString("tr-TR") : "—"}</dd></div></dl><div className="mt-5 flex flex-wrap gap-2"><button type="button" disabled={!issued} onClick={() => setSelected(certificate)} className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-xs hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"><Eye className="h-3.5 w-3.5" /> Görüntüle</button>{issued && <button type="button" disabled={sharingId === certificate.id} onClick={async () => { setSharingId(certificate.id); try { await shareCertificate(certificate); } catch (shareError) { if ((shareError as DOMException)?.name !== "AbortError") console.error("Certificate share failed", shareError); } finally { setSharingId(null); } }} className="inline-flex items-center gap-2 rounded-md border border-cyan-300/30 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-300/10 disabled:opacity-50"><Share2 className="h-3.5 w-3.5" /> {sharingId === certificate.id ? "Paylaşılıyor…" : "Paylaş"}</button>}{issued && certificate.certificate_number && <a href={`/sertifika-dogrula?code=${encodeURIComponent(certificate.certificate_number)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-gold/40 px-3 py-2 text-xs text-gold hover:bg-gold/10"><ShieldCheck className="h-3.5 w-3.5" /> Doğrula</a>}</div></li>; })}</ul></section>}
  </div></main>{selected && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Sertifika önizleme"><div className="mx-auto max-w-[576px] py-4 sm:py-8"><div className="mb-3 flex justify-end"><button type="button" onClick={() => setSelected(null)} className="rounded-full border border-border bg-background/90 p-2 hover:border-gold" aria-label="Önizlemeyi kapat"><X className="h-5 w-5" /></button></div><CertificateRenderer certificate={selected} /></div></div>}<TrustBar items={SECURITY_TRUST} /><SiteFooter /></div>;
}
