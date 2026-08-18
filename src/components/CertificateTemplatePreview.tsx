import { useEffect, useState } from "react";
import {
  type CertificateTemplateType,
  certificateTierLabel,
  renderCertificateSvg,
} from "@/lib/certificateTemplates";

type CertificateTemplatePreviewProps = {
  tier: "digital" | "elite" | "premium";
  className?: string;
};

const DEMO_DATA = {
  holderName: "Örnek Kullanıcı",
  parcelCode: "MSP-DEMO-001",
  cityName: "Gaziantep",
  certificateNumber: "MSP-DEMO-2026",
  issueDate: "18.08.2026",
  fingerprint: "DEMO-CERTIFICATE-PREVIEW",
  verificationUrl: "https://myskyparcel.com/verify/demo-preview",
};

export function CertificateTemplatePreview({ tier, className = "" }: CertificateTemplatePreviewProps) {
  const templateType: CertificateTemplateType = tier === "elite" ? "special" : tier;
  const [src, setSrc] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function loadPreview() {
      try {
        const svg = await renderCertificateSvg({
          templateType,
          ...DEMO_DATA,
        });
        if (cancelled) return;
        setSrc(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
      } catch {
        if (!cancelled) setSrc("");
      }
    }

    void loadPreview();
    return () => {
      cancelled = true;
    };
  }, [templateType]);

  return (
    <div className={`min-w-0 ${className}`}>
      <div className="relative w-full overflow-hidden rounded-lg border border-gold/30 bg-slate-950 shadow-lg">
        {src ? (
          <img
            src={src}
            alt={`${certificateTierLabel(tier)} MySkyParcel sertifika şablonu`}
            width={1122}
            height={794}
            decoding="async"
            className="block h-auto w-full"
          />
        ) : (
          <div className="flex aspect-[1122/794] w-full items-center justify-center text-sm text-white/70">
            Sertifika önizlemesi hazırlanıyor…
          </div>
        )}
      </div>
      <div className="mt-2 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">{certificateTierLabel(tier)} Sertifika</p>
        <p className="mt-0.5 text-[9px] text-muted-foreground">Örnek tasarım önizlemesi</p>
      </div>
    </div>
  );
}
