export const CERTIFICATE_TEMPLATE_IMAGES = {
  digital: "/sertifikalar/standart-sablon.jpg",
  elite: "/sertifikalar/elit-sablon.jpg",
  premium: "/sertifikalar/premium-sablon.jpg",
} as const;

/** Existing repository artwork used as the safe fallback until tier JPGs are available in production. */
export const CERTIFICATE_TEMPLATE_FALLBACK = "/sertifikalar/dijital-sertifika.webp";

// Homepage/package legacy consumers use the known-good repository asset until the tier JPGs are deployed.
export const CERTIFICATE_TEMPLATE_IMAGE = CERTIFICATE_TEMPLATE_FALLBACK;

export const CERTIFICATE_TEMPLATE_LABELS = {
  digital: "Dijital Gökyüzü Sertifikası",
  elite: "Elit Gökyüzü Sertifikası",
  premium: "Premium Gökyüzü Sertifikası",
} as const;
