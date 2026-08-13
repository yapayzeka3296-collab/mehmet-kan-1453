export const CERTIFICATE_TEMPLATE_IMAGES = {
  digital: "/sertifikalar/standart-sablon.jpg",
  elite: "/sertifikalar/elit-sablon.jpg",
  premium: "/sertifikalar/premium-sablon.jpg",
} as const;

/** Existing repository artwork used only as a temporary fallback until the tier JPGs are uploaded. */
export const CERTIFICATE_TEMPLATE_FALLBACK = "/sertifikalar/dijital-sertifika.webp";

// Backward-compatible export used by existing homepage/package components.
export const CERTIFICATE_TEMPLATE_IMAGE = CERTIFICATE_TEMPLATE_IMAGES.digital;

export const CERTIFICATE_TEMPLATE_LABELS = {
  digital: "Dijital Gökyüzü Sertifikası",
  elite: "Elit Gökyüzü Sertifikası",
  premium: "Premium Gökyüzü Sertifikası",
} as const;
