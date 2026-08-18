import { type CertificateTemplateType, CERTIFICATE_TEMPLATE_PATHS, certificateTierLabel } from "@/lib/certificateTemplates";

type CertificateTemplatePreviewProps = {
  tier: "digital" | "elite" | "premium";
  className?: string;
};

export function CertificateTemplatePreview({ tier, className = "" }: CertificateTemplatePreviewProps) {
  const templateType: CertificateTemplateType = tier === "elite" ? "special" : tier;
  return (
    <div className={`relative overflow-hidden rounded-lg border border-gold/30 bg-white shadow-lg ${className}`}>
      <img
        src={CERTIFICATE_TEMPLATE_PATHS[templateType]}
        alt={`${certificateTierLabel(tier)} MySkyParcel sertifika şablonu`}
        loading="lazy"
        className="block aspect-[297/210] h-auto w-full object-contain"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white">{certificateTierLabel(tier)} Sertifika</p>
        <p className="mt-0.5 text-[9px] text-white/80">Örnek tasarım önizlemesi</p>
      </div>
    </div>
  );
}
