import { useEffect, useState } from "react";

type CertificateArtworkProps = {
  tier: "digital" | "elite" | "premium";
  name?: string | null;
  parcelCode?: string | null;
  certificateNumber?: string | null;
  issuedAt?: string | null;
};

const TIER_META = {
  digital: {
    label: "DİJİTAL GÖKYÜZÜ SERTİFİKASI",
    image: "/certificates/digital-certificate.jpg",
    nameClass: "text-[#a77c2d]",
  },
  elite: {
    label: "ELİT GÖKYÜZÜ SERTİFİKASI",
    image: "/certificates/elite-certificate.jpg",
    nameClass: "text-[#d1a34f]",
  },
  premium: {
    label: "PREMİUM GÖKYÜZÜ SERTİFİKASI",
    image: "/certificates/premium-certificate.jpg",
    nameClass: "text-[#e0b657]",
  },
} as const;

function getDisplayName(name?: string | null) {
  return name?.trim() || "MySkyParcel Koleksiyoncusu";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("tr-TR");
}

function getQrUrl(certificateNumber?: string | null) {
  if (!certificateNumber) return null;
  const base = (import.meta.env["VITE_SUPABASE_URL"] ?? "https://agfxwddvobkhwbbrdzpt.supabase.co").replace(/\/$/, "");
  return `${base}/functions/v1/certificate-qr?code=${encodeURIComponent(certificateNumber)}`;
}

export function CertificateArtwork({ tier, name, parcelCode, certificateNumber, issuedAt }: CertificateArtworkProps) {
  const meta = TIER_META[tier];
  const displayName = getDisplayName(name);
  const qrUrl = getQrUrl(certificateNumber);
  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setImageReady(true);
    image.src = meta.image;
  }, [meta.image]);

  return (
    <div className="relative aspect-[1.5/1] w-full overflow-hidden rounded-xl bg-[#101a2b] shadow-2xl" aria-label={meta.label}>
      <img
        src={meta.image}
        alt={meta.label}
        className="absolute inset-0 h-full w-full object-cover"
        width={1536}
        height={1024}
        decoding="async"
      />

      {/* The artwork is the fixed certificate template. Dynamic data is layered on top. */}
      <div className="absolute inset-0">
        {/* Covers the baked-in sample name while preserving a clean luxury name area. */}
        <div className="absolute left-[27%] top-[39%] h-[12%] w-[46%] rounded-sm bg-white/90 shadow-sm" />
        <div className={`absolute left-[28%] top-[40%] w-[44%] text-center font-serif text-[clamp(13px,2.5vw,34px)] font-semibold leading-none ${meta.nameClass}`}>
          {displayName}
        </div>
        <div className="absolute left-[29%] top-[49%] h-px w-[42%] bg-[#b99a5a]/80" />

        {/* Dynamic metadata is shown in a compact overlay so the sample values in the artwork are never treated as real data. */}
        <div className="absolute bottom-[9%] left-[7%] rounded-md bg-black/65 px-2 py-1 text-[clamp(6px,0.75vw,10px)] leading-tight text-white backdrop-blur-[2px]">
          <div>Parsel: <strong>{parcelCode || "—"}</strong></div>
          <div>Sertifika: <strong>{certificateNumber || "Talep aşamasında"}</strong></div>
          <div>Tarih: <strong>{formatDate(issuedAt)}</strong></div>
        </div>

        {qrUrl && (
          <div className="absolute bottom-[8%] right-[8%] rounded-md bg-white p-1 shadow-lg">
            <img src={qrUrl} alt="Sertifika doğrulama QR kodu" width={72} height={72} className="h-12 w-12 sm:h-16 sm:w-16" />
          </div>
        )}
      </div>

      {!imageReady && <div className="absolute inset-0 animate-pulse bg-[#101a2b]" aria-hidden="true" />}
    </div>
  );
}
