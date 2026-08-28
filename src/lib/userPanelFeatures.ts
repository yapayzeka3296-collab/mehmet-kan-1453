export const CERTIFICATE_STEPS = [
  { key: "request_received", label: "Talep alındı" },
  { key: "preparing", label: "Hazırlanıyor" },
  { key: "printing", label: "Basımda" },
  { key: "printed", label: "Basım tamamlandı" },
  { key: "shipped", label: "Kargoya verildi" },
  { key: "delivered", label: "Teslim edildi" },
] as const;

export type CertificateStep = (typeof CERTIFICATE_STEPS)[number]["key"];

export function certificateStepIndex(status: string | null | undefined) {
  const index = CERTIFICATE_STEPS.findIndex((step) => step.key === status);
  return index < 0 ? 0 : index;
}

export function certificateStepLabel(status: string | null | undefined) {
  return CERTIFICATE_STEPS[certificateStepIndex(status)].label;
}

export async function shareCertificate(certificateId: string, title = "MySkyParcel Sertifikam") {
  const url = `${window.location.origin}/sertifika/${encodeURIComponent(certificateId)}`;
  if (navigator.share) {
    await navigator.share({ title, url });
    return url;
  }
  await navigator.clipboard.writeText(url);
  return url;
}
