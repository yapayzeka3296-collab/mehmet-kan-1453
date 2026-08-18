import { useEffect, useState } from "react";
import {
  certificateTierLabel,
  downloadSvg,
  printCertificate,
  renderCertificateSvg,
  templateTypeForTier,
} from "@/lib/certificateTemplates";

type CertificateRendererCertificate = {
  id: string;
  parcel_id: string;
  tier: "digital" | "elite" | "premium";
  status: "requested" | "approved" | "issued" | "rejected" | "revoked";
  certificate_number: string | null;
  issued_at: string | null;
  parcel?: { parcel_number?: string | null } | null;
  holder_name_snapshot?: string | null;
  city_name_snapshot?: string | null;
  certificate_fingerprint?: string | null;
  verification_url?: string | null;
};

export function CertificateRenderer({ certificate }: { certificate: CertificateRendererCertificate }) {
  const [svg, setSvg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (!certificate.certificate_number || certificate.status !== "issued") throw new Error("certificate_not_issued");
        const relativeVerificationUrl = certificate.verification_url || `/sertifika-dogrula?code=${encodeURIComponent(certificate.certificate_number)}`;
        const verificationUrl = new URL(relativeVerificationUrl, window.location.origin).toString();
        const result = await renderCertificateSvg({
          templateType: templateTypeForTier(certificate.tier),
          holderName: certificate.holder_name_snapshot || "MySkyParcel Kullanıcısı",
          parcelCode: certificate.parcel?.parcel_number || certificate.parcel_id,
          cityName: certificate.city_name_snapshot || "Türkiye",
          certificateNumber: certificate.certificate_number,
          issueDate: certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString("tr-TR") : "—",
          fingerprint: certificate.certificate_fingerprint,
          verificationUrl,
        });
        if (!cancelled) setSvg(result);
      } catch (err) {
        console.error("Certificate render failed", err);
        if (!cancelled) setError("Sertifika tasarımı yüklenemedi.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [certificate]);

  if (loading) return <div className="panel grid min-h-[300px] place-items-center p-6 text-sm text-muted-foreground">Sertifika hazırlanıyor...</div>;
  if (error || !svg) return <div className="panel p-6 text-sm text-red-300">{error || "Sertifika hazırlanamadı."}</div>;

  return (
    <div className="certificate-print-surface space-y-4">
      <div className="overflow-hidden rounded-xl border border-gold/30 bg-black/20 shadow-2xl">
        <div className="aspect-[1122/794] w-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-gold rounded-md px-4 py-2 text-xs" onClick={() => printCertificate(svg, `${certificateTierLabel(certificate.tier)} Sertifika`)}>PDF / Yazdır</button>
        <button type="button" className="rounded-md border border-input px-4 py-2 text-xs hover:bg-accent" onClick={() => downloadSvg(svg, `${certificate.certificate_number}.svg`)}>SVG İndir</button>
      </div>
      <p className="text-[11px] text-muted-foreground">PDF / Yazdır düğmesi tarayıcının yüksek kaliteli yazdırma ekranını açar; buradan “PDF olarak kaydet” seçilebilir. Sertifikanın QR kodu doğrulama adresine yönlendirir.</p>
    </div>
  );
}
