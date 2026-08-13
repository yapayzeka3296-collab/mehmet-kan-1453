export type CertificateTier = "digital" | "elite" | "premium";

/**
 * Single source of truth for certificate artwork.
 * Assets live under /public/sertifikalar and are served from the site root.
 */
export const CERTIFICATE_TEMPLATE_IMAGES: Record<CertificateTier, string> = {
  digital: "/sertifikalar/standart-sablon.jpg",
  elite: "/sertifikalar/elit-sablon.jpg",
  premium: "/sertifikalar/premium-sablon.jpg",
};

/** Backward-compatible alias for existing consumers. */
export const CERTIFICATE_TEMPLATE_IMAGE = "/sertifikalar/dijital-sertifika.webp";
export const CERTIFICATE_TEMPLATE_FALLBACK = "/sertifikalar/dijital-sertifika.webp";

export const CERTIFICATE_TEMPLATE_LABELS: Record<CertificateTier, string> = {
  digital: "Dijital Gökyüzü Sertifikası",
  elite: "Elit Gökyüzü Sertifikası",
  premium: "Premium Gökyüzü Sertifikası",
};

export const CERTIFICATE_TEMPLATE_ASPECT_RATIO = "1600 / 1067";

export function getCertificateTemplateImage(tier: CertificateTier): string {
  return CERTIFICATE_TEMPLATE_IMAGES[tier] ?? CERTIFICATE_TEMPLATE_FALLBACK;
}

export function getCertificateTemplateLabel(tier: CertificateTier): string {
  return CERTIFICATE_TEMPLATE_LABELS[tier];
}
