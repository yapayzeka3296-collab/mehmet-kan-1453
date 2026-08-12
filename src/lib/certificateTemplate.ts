import certificateTemplate from "@/assets/cert-digital.jpg";

/** Single source of truth for the certificate artwork used throughout the site. */
export const CERTIFICATE_TEMPLATE_IMAGE = certificateTemplate;

export const CERTIFICATE_TEMPLATE_LABELS = {
  digital: "Dijital Gökyüzü Sertifikası",
  elite: "Elit Gökyüzü Sertifikası",
  premium: "Premium Gökyüzü Sertifikası",
} as const;
