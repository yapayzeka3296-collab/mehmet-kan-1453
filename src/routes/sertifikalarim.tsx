import { createFileRoute, Navigate } from "@tanstack/react-router";
import { Award, RefreshCw } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";
import { CertificateArtwork } from "@/components/CertificateArtwork";
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
  parcel?: { parcel_number?: string | null } | null;
  tier: "digital" | "elite" | "premium";
  status: "requested" | "approved" | "issued" | "rejected" | "revoked";
  certificate_number: string | null;
  requested_at: string;
  issued_at: string | null;
};

const TIER_LABELS = { digital: "Dijital", elite: "Elit", premium: "Premium" } as const;

function getUserDisplayName(user: NonNullable<ReturnType<typeof useAuth>["user"]>) {
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const fullName = typeof metadata?.full_name === "string" ? metadata.full_name.trim() : "";
  if (fullName) return fullName;
  const name = typeof metadata?.name === "string" ? metadata.name.trim() : "";
  if (name) return name;
  return user.email?.split("@")[0] || "MySkyParcel Koleksiyoncusu";
}

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

  useEffect(() => {
    void loadCertificates();
  }, [loadCertificates]);

  if (authLoading) {
    return <div className="starfield min-h-screen" aria-busy="true" />;
  }

  if (!user) {
    return <Navigate to="/giris" replace />;
  }

  const displayName = getUserDisplayName(user);

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
                Sertifika talebiniz onaylandığında kişisel bilgilerinizle otomatik olarak oluşturulur.
              </p>
            </div>
            <button type="button" onClick={() => void loadCertificates()} className="rounded-md border border-input px-3 py-2 text-xs hover:bg-accent" aria-label="Sertifikaları yenile">
              <RefreshCw className="mr-2 inline h-3.5 w-3.5" /> Yenile
            </button>
          </div>

          {loading && <div className="panel mt-6 p-6 text-sm text-muted-foreground">Sertifikalar yükleniyor...</div>}
          {error && <div className="panel mt-6 p-6 text-sm text-red-300">{error}</div>}
          {!loading && !error && certificates.length === 0 && (
            <div className="panel mt-6 p-8 text-center">
              <Award className="mx-auto h-12 w-12 text-gold" />
              <h2 className="mt-4 font-display text-xl">Henüz sertifika yok</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
                Uygun bir parsel için sertifika talebiniz onaylandığında, sertifikanız burada kişisel bilgilerinizle oluşturulur.
              </p>
            </div>
          )}

          {!loading && !error && certificates.length > 0 && (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {certificates.map((certificate) => {
                const parcelNumber = certificate.parcel?.parcel_number || certificate.parcel_id;
                return (
                  <li key={certificate.id} className="panel overflow-hidden p-4">
                    <CertificateArtwork
                      tier={certificate.tier}
                      name={displayName}
                      parcelCode={parcelNumber}
                      certificateNumber={certificate.certificate_number}
                      issuedAt={certificate.issued_at}
                    />
                    <div className="p-2 pt-4">
                      <p className="font-display text-lg">{TIER_LABELS[certificate.tier]} Sertifika</p>
                      <p className="text-xs text-gold">Parsel: {parcelNumber}</p>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Durum: {certificate.status} · Talep: {new Date(certificate.requested_at).toLocaleDateString("tr-TR")}
                      </p>
                      {certificate.certificate_number && (
                        <p className="mt-1 text-[11px] text-muted-foreground">Sertifika No: {certificate.certificate_number}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
      <TrustBar items={SECURITY_TRUST} />
      <SiteFooter />
    </div>
  );
}
