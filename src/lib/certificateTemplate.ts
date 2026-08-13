export const CERTIFICATE_TEMPLATE_IMAGES = {
  digital: "/sertifikalar/standart-şablon.jpg",
  elite: "/sertifikalar/elit-şablon.jpg",
  premium: "/sertifikalar/premium-şablon.jpg",
} as const;

/** Single source of truth for the certificate artwork used throughout the site. */
export const CERTIFICATE_TEMPLATE_LABELS = {
  digital: "Dijital Gökyüzü Sertifikası",
  elite: "Elit Gökyüzü Sertifikası",
  premium: "Premium Gökyüzü Sertifikası",
} as const;
