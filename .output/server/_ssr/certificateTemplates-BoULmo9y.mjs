import { i as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { t as require_lib } from "../_libs/qrcode.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/certificateTemplates-BoULmo9y.mjs
var import_lib = /* @__PURE__ */ __toESM(require_lib(), 1);
var certificateTemplates_exports = /* @__PURE__ */ __exportAll({
	CERTIFICATE_TEMPLATE_PATHS: () => CERTIFICATE_TEMPLATE_PATHS,
	certificateTierLabel: () => certificateTierLabel,
	downloadSvg: () => downloadSvg,
	printCertificate: () => printCertificate,
	qrDataUrl: () => qrDataUrl,
	renderCertificateSvg: () => renderCertificateSvg,
	templateTypeForTier: () => templateTypeForTier,
	xmlEscape: () => xmlEscape
});
var CERTIFICATE_TEMPLATE_PATHS = {
	digital: "/certificate-templates/digital-v2.svg",
	special: "/certificate-templates/special-v2.svg",
	premium: "/certificate-templates/premium-v2.svg"
};
function templateTypeForTier(tier) {
	if (tier === "elite") return "special";
	return tier;
}
function certificateTierLabel(tier) {
	return {
		digital: "Dijital",
		elite: "Özel",
		premium: "Premium"
	}[tier];
}
function xmlEscape(value) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}
async function qrDataUrl(verificationUrl) {
	return import_lib.toDataURL(verificationUrl, {
		errorCorrectionLevel: "M",
		margin: 2,
		width: 240,
		color: {
			dark: "#000000",
			light: "#ffffff"
		}
	});
}
function holderFontSize(templateType, holderName) {
	const base = {
		digital: 50,
		special: 48,
		premium: 56
	}[templateType];
	const minimum = {
		digital: 32,
		special: 30,
		premium: 34
	}[templateType];
	const length = Array.from(holderName.trim()).length;
	if (length <= 18) return base;
	return Math.max(minimum, Math.round(base - (length - 18) * 1.8));
}
async function renderCertificateSvg(args) {
	const response = await fetch(CERTIFICATE_TEMPLATE_PATHS[args.templateType]);
	if (!response.ok) throw new Error("certificate_template_unavailable");
	let svg = await response.text();
	const holderName = args.holderName || "MySkyParcel Kullanıcısı";
	const qr = await qrDataUrl(args.verificationUrl);
	const values = {
		HOLDER_NAME: xmlEscape(holderName),
		HOLDER_NAME_FONT_SIZE: String(holderFontSize(args.templateType, holderName)),
		PARCEL_CODE: xmlEscape(args.parcelCode),
		CITY_NAME: xmlEscape(args.cityName || "Türkiye"),
		CERTIFICATE_NUMBER: xmlEscape(args.certificateNumber),
		ISSUE_DATE: xmlEscape(args.issueDate),
		FINGERPRINT_SHORT: xmlEscape((args.fingerprint || "").slice(0, 18)),
		QR_IMAGE_URL: xmlEscape(qr)
	};
	for (const [key, value] of Object.entries(values)) svg = svg.replaceAll(`{{${key}}}`, value);
	return svg;
}
function downloadSvg(svg, filename) {
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
function printCertificate(svg, title = "MySkyParcel Sertifika") {
	const printWindow = window.open("", "_blank", "width=1200,height=850");
	if (!printWindow) throw new Error("print_window_blocked");
	printWindow.document.write(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${xmlEscape(title)}</title><style>@page{size:A4 landscape;margin:0}html,body{margin:0;width:100%;height:100%;background:#fff}body{display:grid;place-items:center}svg{width:100vw;height:100vh;max-width:297mm;max-height:210mm}</style></head><body>${svg}</body></html>`);
	printWindow.document.close();
	printWindow.focus();
	window.setTimeout(() => printWindow.print(), 350);
}
//#endregion
export { renderCertificateSvg as a, printCertificate as i, certificateTierLabel as n, templateTypeForTier as o, downloadSvg as r, certificateTemplates_exports as t };
