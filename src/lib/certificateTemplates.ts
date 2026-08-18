export type CertificateTemplateType = "digital" | "special" | "premium";

export const CERTIFICATE_TEMPLATE_PATHS: Record<CertificateTemplateType, string> = {
  digital: "/certificate-templates/digital.svg",
  special: "/certificate-templates/special.svg",
  premium: "/certificate-templates/premium.svg",
};

export function templateTypeForTier(tier: "digital" | "elite" | "premium"): CertificateTemplateType {
  if (tier === "elite") return "special";
  return tier;
}

export function certificateTierLabel(tier: "digital" | "elite" | "premium") {
  return { digital: "Dijital", elite: "Özel", premium: "Premium" }[tier];
}

export function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function qrImageUrl(verificationUrl: string) {
  return `https://quickchart.io/qr?text=${encodeURIComponent(verificationUrl)}&size=240&margin=2&ecLevel=M`;
}

export async function renderCertificateSvg(args: {
  templateType: CertificateTemplateType;
  holderName: string;
  parcelCode: string;
  cityName: string;
  certificateNumber: string;
  issueDate: string;
  fingerprint: string | null;
  verificationUrl: string;
}) {
  const response = await fetch(CERTIFICATE_TEMPLATE_PATHS[args.templateType]);
  if (!response.ok) throw new Error("certificate_template_unavailable");
  let svg = await response.text();
  const values: Record<string, string> = {
    HOLDER_NAME: xmlEscape(args.holderName || "MySkyParcel Kullanıcısı"),
    PARCEL_CODE: xmlEscape(args.parcelCode),
    CITY_NAME: xmlEscape(args.cityName || "Türkiye"),
    CERTIFICATE_NUMBER: xmlEscape(args.certificateNumber),
    ISSUE_DATE: xmlEscape(args.issueDate),
    FINGERPRINT_SHORT: xmlEscape((args.fingerprint || "").slice(0, 18)),
    QR_IMAGE_URL: xmlEscape(qrImageUrl(args.verificationUrl)),
  };
  for (const [key, value] of Object.entries(values)) svg = svg.replaceAll(`{{${key}}}`, value);
  return svg;
}

export function downloadSvg(svg: string, filename: string) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function printCertificate(svg: string, title = "MySkyParcel Sertifika") {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1200,height=850");
  if (!printWindow) throw new Error("print_window_blocked");
  printWindow.document.write(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${xmlEscape(title)}</title><style>@page{size:A4 landscape;margin:0}html,body{margin:0;width:100%;height:100%;background:#fff}body{display:grid;place-items:center}svg{width:100vw;height:100vh;max-width:297mm;max-height:210mm}</style></head><body>${svg}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  printWindow.addEventListener("load", () => printWindow.print(), { once: true });
}
