export const CERTIFICATE_TEMPLATE_IMAGES = {
  digital: "/sertifikalar/standart-şablon.jpg",
  elite: "/sertifikalar/elit-şablon.jpg",
  premium: "/sertifikalar/premium-şablon.jpg",
} as const;

// Backward-compatible export used by existing homepage/package components.
// New certificate screens should use CERTIFICATE_TEMPLATE_IMAGES by tier.
export const CERTIFICATE_TEMPLATE_IMAGE = CERTIFICATE_TEMPLATE_IMAGES.digital;

/** Single source of truth for the certificate artwork used throughout the site. */
export const CERTIFICATE_TEMPLATE_LABELS = {
  digital: "Dijital Gökyüzü Sertifikası",
  elite: "Elit Gökyüzü Sertifikası",
  premium: "Premium Gökyüzü Sertifikası",
} as const;
