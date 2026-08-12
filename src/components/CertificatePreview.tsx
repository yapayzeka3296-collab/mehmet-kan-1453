type CertificatePreviewProps = {
  imageSrc: string;
  certificateLabel: string;
  name: string;
};

export function CertificatePreview({ imageSrc, certificateLabel, name }: CertificatePreviewProps) {
  return (
    <div className="relative aspect-[3/2] w-full overflow-hidden bg-navy sm:rounded-lg">
      <img
        src={imageSrc}
        alt={`${certificateLabel} sertifika şablonu`}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-contain object-center"
      />
      <div
        aria-label={`Sertifika adı: ${name}`}
        className="absolute left-1/2 top-[56%] w-[76%] -translate-x-1/2 -translate-y-1/2 text-center font-display text-[clamp(12px,2.4vw,30px)] font-bold uppercase leading-tight tracking-[0.06em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] sm:w-[72%] sm:text-[clamp(14px,2vw,30px)]"
      >
        {name}
      </div>
    </div>
  );
}
