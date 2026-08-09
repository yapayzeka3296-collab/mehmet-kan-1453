import { createFileRoute } from "@tanstack/react-router";
import { Award, RefreshCw } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";
import { useCallback, useEffect, useState } from "react";

export const Route = createFileRoute("/sertifikalarim")({
  head: () => ({
    meta: [
      { title: "Sertifikalarım — MySkyParcel" },
      { name: "description", content: "MySkyParcel dijital sertifika taleplerini ve sertifika geçmişini görüntüle." },
    ],
  }),
  component: Sertifikalarim,
});

type Certificate = {
  id: string;
  parcel_id: string;
  tier: "digital" | "elite" | "premium";
  status: "requested" | "approved" | "issued" | "rejected";
  certificate_number: string | null;
  requested_at: string;
  issued_at: string | null;
};

const TIER_LABELS = { digital: "Dijital", elite: "Elit", premium: "Premium" } as const;

function Sertifikalarim() {
  const { user } = useAuth();
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
      .select("id,parcel_id,tier,status,certificate_number,requested_at,issued_at")
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

  useEffect(() => {
    void loadCertificates();
  }, [loadCertificates]);

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/sertifikalarim" />
        <div className="min-w-0">
          <div className="panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold">SERTİFİKALARIM</h1>
              <p className="mt-2 text-xs text-muted-foreground">
                Her statü için en fazla 1 sertifika hakkınız vardır. Sertifika otomatik oluşturulmaz.
              </p>
            </div>
            <button type="button" onClick={() => void loadCertificates()} className="rounded-md border border-input px-3 py-2 text-xs hover:bg-accent" aria-label="Sertifikaları yenile">
              <RefreshCw className="mr-2 inline h-3.5 w-3.5" /> Yenile
            </button>
          </div>

          {!user && <div className="panel mt-6 p-6 text-sm text-muted-foreground">Sertifikalarınızı görmek için giriş yapın.</div>}
          {loading && <div className="panel mt-6 p-6 text-sm text-muted-foreground">Sertifikalar yükleniyor...</div>}
          {error && <div className="panel mt-6 p-6 text-sm text-red-300">{error}</div>}
          {!loading && !error && user && certificates.length === 0 && (
            <div className="panel mt-6 p-8 text-center">
              <Award className="mx-auto h-12 w-12 text-gold" />
              <h2 className="mt-4 font-display text-xl">Henüz sertifika yok</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                Satın aldığınız ve sahipliğiniz doğrulanan bir parsel için uygun statüde “Sertifika Talep Et” işlemi yapılabilir.
              </p>
            </div>
          )}

          {!loading && !error && certificates.length > 0 && (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {certificates.map((certificate) => (
                <li key={certificate.id} className="panel p-5">
                  <div className="grid h-36 place-items-center rounded-lg border border-gold/40 bg-navy">
                    <Award className="h-12 w-12 text-gold" />
                  </div>
                  <p className="mt-4 font-display text-lg">{TIER_LABELS[certificate.tier]}</p>
                  <p className="text-xs text-gold">Parsel: {certificate.parcel_id}</p>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Durum: {certificate.status} · Talep: {new Date(certificate.requested_at).toLocaleDateString("tr-TR")}
                  </p>
                  {certificate.certificate_number && (
                    <p className="mt-1 text-[11px] text-muted-foreground">Sertifika No: {certificate.certificate_number}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <TrustBar items={SECURITY_TRUST} />
      <SiteFooter />
    </div>
  );
}
