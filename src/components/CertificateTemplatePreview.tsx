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
    let objectUrl = "";

    async function loadPreview() {
      try {
        const svg = await renderCertificateSvg({
          templateType,
          ...DEMO_DATA,
        });
        if (cancelled) return;
        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch {
        if (!cancelled) setSrc("");
      }
    }

    void loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [templateType]);

  return (
    <div className={`relative overflow-hidden rounded-lg border border-gold/30 bg-white shadow-lg ${className}`}>
      {src ? (
        <img
          src={src}
          alt={`${certificateTierLabel(tier)} MySkyParcel sertifika şablonu`}
          className="block aspect-[297/210] h-auto w-full object-contain"
        />
      ) : (
        <div className="flex aspect-[297/210] w-full items-center justify-center bg-slate-950 text-sm text-white/70">
          Sertifika önizlemesi hazırlanıyor…
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white">{certificateTierLabel(tier)} Sertifika</p>
        <p className="mt-0.5 text-[9px] text-white/80">Örnek tasarım önizlemesi</p>
      </div>
    </div>
  );
}
