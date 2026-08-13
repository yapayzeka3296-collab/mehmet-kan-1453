export type CertificateTier = "digital" | "elite" | "premium";

export const CERTIFICATE_TEMPLATE_IMAGES: Record<CertificateTier, string> = {
  digital: "/sertifikalar/standart-sablon.jpg",
  elite: "/sertifikalar/elit-sablon.jpg",
  premium: "/sertifikalar/premium-sablon.jpg",
};

/** Last-resort repository asset. Used only when the tier artwork is unavailable. */
export const CERTIFICATE_TEMPLATE_FALLBACK = "/sertifikalar/dijital-sertifika.webp";

export const CERTIFICATE_TEMPLATE_LABELS: Record<CertificateTier, string> = {
  digital: "Dijital Gökyüzü Sertifikası",
  elite: "Elit Gökyüzü Sertifikası",
  premium: "Premium Gökyüzü Sertifikası",
};

export function getCertificateTemplateImage(tier: CertificateTier): string {
  return CERTIFICATE_TEMPLATE_IMAGES[tier] ?? CERTIFICATE_TEMPLATE_FALLBACK;
}
