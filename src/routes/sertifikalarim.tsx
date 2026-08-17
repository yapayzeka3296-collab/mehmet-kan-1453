import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Award, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/sertifikalarim")({
  head: () => ({ meta: [{ title: "Sertifikalarım — MySkyParcel" }, { name: "description", content: "MySkyParcel sertifika kayıtlarınızı görüntüleyin." }] }),
  component: Sertifikalarim,
});

type Certificate = {
  id: string;
  parcel_id: string;
  parcel?: { parcel_number?: string | null } | null;
  tier: "digital" | "elite" | "premium";
  status: "requested" | "approved" | "issued" | "rejected" | "revoked";
  certificate_number: string | null;
  requested_at: string;
  issued_at: string | null;
};

const TIER_LABELS = { digital: "Dijital", elite: "Elit", premium: "Premium" } as const;

function Sertifikalarim() {
  const { user, loading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCertificates = useCallback(async () => {
    if (!user || !supabaseBrowser) {
      setCertificates([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabaseBrowser
      .from("certificate_requests")
      .select("id,parcel_id,tier,status,certificate_number,requested_at,issued_at,parcel:parcels(parcel_number)")
      .eq("user_id", user.id)
      .order("requested_at", { ascending: false });
    if (queryError) {
      console.error("Certificate query failed", queryError);
      setError("Sertifika kayıtları yüklenemedi.");
    } else {
      setCertificates((data as Certificate[]) ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { void loadCertificates(); }, [loadCertificates]);

  if (authLoading) return <div className="starfield min-h-screen" aria-busy="true" />;
  if (!user) return <Navigate to="/giris" replace />;

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/sertifikalarim" />
        <div className="min-w-0">
          <div className="panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold">SERTİFİKALARIM</h1>
              <p className="mt-2 text-xs text-muted-foreground">Sertifika tasarımı sil baştan hazırlanıyor. Mevcut kayıtlarınız korunmaktadır.</p>
            </div>
            <button type="button" onClick={() => void loadCertificates()} className="rounded-md border border-input px-3 py-2 text-xs hover:bg-accent" aria-label="Sertifikaları yenile">
              <RefreshCw className="mr-2 inline h-3.5 w-3.5" /> Yenile
            </button>
          </div>

          {error && <div className="panel mt-6 p-6 text-sm text-red-300" role="alert">{error}</div>}
          {loading && <div className="panel mt-6 p-6 text-sm text-muted-foreground">Sertifika kayıtları yükleniyor...</div>}

          {!loading && !error && certificates.length === 0 && (
            <div className="panel mt-6 p-8 text-center">
              <Award className="mx-auto h-12 w-12 text-gold" />
              <h2 className="mt-4 font-display text-xl">Henüz sertifika kaydınız yok</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">Yeni sertifika tasarımı tamamlandığında sertifika oluşturma akışı yeniden eklenecektir.</p>
            </div>
          )}

          {!loading && !error && certificates.length > 0 && (
            <section className="mt-6">
              <div className="mb-4">
                <h2 className="font-display text-xl">SERTİFİKA KAYITLARIM</h2>
                <p className="mt-1 text-xs text-muted-foreground">Eski şablon, şablona yazı işleme, canvas ile görsel üretimi ve otomatik sertifika görseli oluşturma sistemi kaldırıldı.</p>
              </div>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {certificates.map((certificate) => {
                  const parcelNumber = certificate.parcel?.parcel_number || certificate.parcel_id;
                  return (
                    <li key={certificate.id} className="panel p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-display text-lg">{TIER_LABELS[certificate.tier]} Parsel Sertifikası</p>
                          <p className="mt-1 text-xs text-gold">Parsel: {parcelNumber}</p>
                        </div>
                        <Award className="h-5 w-5 shrink-0 text-gold" />
                      </div>
                      <dl className="mt-4 space-y-2 text-xs text-muted-foreground">
                        <div className="flex justify-between gap-4"><dt>Durum</dt><dd className="text-foreground">{certificate.status}</dd></div>
                        <div className="flex justify-between gap-4"><dt>Talep tarihi</dt><dd className="text-foreground">{new Date(certificate.requested_at).toLocaleDateString("tr-TR")}</dd></div>
                        <div className="flex justify-between gap-4"><dt>Sertifika No</dt><dd className="text-foreground">{certificate.certificate_number || "—"}</dd></div>
                      </dl>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </main>
      <TrustBar items={SECURITY_TRUST} />
      <SiteFooter />
    </div>
  );
}
