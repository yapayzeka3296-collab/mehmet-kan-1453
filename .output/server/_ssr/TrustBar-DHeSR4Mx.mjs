import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { L as Headphones, T as Lock, m as ShieldCheck, nt as Award, s as Truck } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/TrustBar-DHeSR4Mx.js
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_TRUST = [
	{
		icon: Lock,
		title: "GÜVENLİ ALTYAPI",
		text: "Güvenlik altyapısı yayın öncesi ayrıca doğrulanmalıdır"
	},
	{
		icon: Truck,
		title: "HIZLI TESLİMAT",
		text: "Dijital teslimat akışı yayın öncesi doğrulanmalıdır"
	},
	{
		icon: Headphones,
		title: "DESTEK",
		text: "Destek bilgileri için iletişim sayfasını ziyaret edin"
	},
	{
		icon: Award,
		title: "KOLEKSİYONUNA KAT",
		text: "Gökyüzündeki yerini koleksiyonuna ekle"
	}
];
var SECURITY_TRUST = [
	{
		icon: ShieldCheck,
		title: "GÜVENLİK ALTYAPISI",
		text: "Teknik güvenlik yapılandırması yayın öncesi doğrulanmalıdır."
	},
	{
		icon: Lock,
		title: "GÜVENLİ ÖDEME",
		text: "Ödeme altyapısı ve sağlayıcı doğrulaması yayın öncesi tamamlanmalıdır."
	},
	{
		icon: Truck,
		title: "HIZLI TESLİMAT",
		text: "Sertifika teslim akışı yayın öncesi doğrulanmalıdır."
	},
	{
		icon: Headphones,
		title: "DESTEK",
		text: "Destek bilgileri için iletişim sayfasını ziyaret edin."
	}
];
function TrustBar({ items = DEFAULT_TRUST }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-[1600px] px-4 pb-8 lg:px-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "panel grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4",
			children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-start gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "mt-0.5 h-6 w-6 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold tracking-[0.08em]",
						children: item.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: item.text
					})]
				})]
			}, item.title))
		})
	});
}
//#endregion
export { TrustBar as n, SECURITY_TRUST as t };
