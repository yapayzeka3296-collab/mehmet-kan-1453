import { useEffect, useRef, useState } from "react";

type CertificateTier = "digital" | "elite" | "premium";
type CertificateTemplateType = "digital" | "special" | "premium";

type CertificateTemplatePreviewProps = {
  tier: CertificateTier;
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

const LABELS: Record<CertificateTier, string> = {
  digital: "Dijital",
  elite: "Özel",
  premium: "Premium",
};

export function CertificateTemplatePreview({ tier, className = "" }: CertificateTemplatePreviewProps) {
  const templateType: CertificateTemplateType = tier === "elite" ? "special" : tier;
  const [src, setSrc] = useState<string>("");
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;

    async function loadPreview() {
      try {
        // Certificate rendering and QR generation are intentionally split from the homepage's initial bundle.
        const { renderCertificateSvg } = await import("@/lib/certificateTemplates");
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
  }, [templateType, visible]);

  return (
    <div ref={containerRef} className={`min-w-0 ${className}`}>
      <div className="relative w-full overflow-hidden rounded-lg border border-gold/30 bg-slate-950 shadow-lg">
        {src ? (
          <img
            src={src}
            alt={`${LABELS[tier]} MySkyParcel sertifika şablonu`}
            width={1122}
            height={794}
            decoding="async"
            className="block h-auto w-full"
          />
        ) : (
          <div className="flex aspect-[1122/794] w-full items-center justify-center text-sm text-white/70">
            {visible ? "Sertifika önizlemesi hazırlanıyor…" : "Sertifika önizlemesi"}
          </div>
        )}
      </div>
      <div className="mt-2 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">{LABELS[tier]} Sertifika</p>
        <p className="mt-0.5 text-[9px] text-muted-foreground">Örnek tasarım önizlemesi</p>
      </div>
    </div>
  );
}
