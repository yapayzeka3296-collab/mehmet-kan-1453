type CertificatePreviewProps = {
  imageSrc: string;
  certificateLabel: string;
  name: string;
};

export function CertificatePreview({ imageSrc, certificateLabel, name }: CertificatePreviewProps) {
  return (
    <div className="relative aspect-[1.414/1] w-full overflow-hidden bg-navy">
      <img
        src={imageSrc}
        alt={`${certificateLabel} sertifika şablonu`}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-label={`Sertifika adı: ${name}`}
        className="absolute left-1/2 top-[56%] w-[78%] -translate-x-1/2 -translate-y-1/2 text-center font-display text-[clamp(14px,2.4vw,30px)] font-bold uppercase tracking-[0.08em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
      >
        {name}
      </div>
    </div>
  );
}
