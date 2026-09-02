import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { H as Headphones, h as ShieldCheck, j as Lock, ut as Award } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/TrustBar-DFWcLzLx.mjs
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_TRUST = [
	{
		icon: ShieldCheck,
		title: "GÜVENLİ ÖDEME",
		text: "Ödeme, iyzico Link ödeme sayfasında güvenli şekilde tamamlanır."
	},
	{
		icon: Lock,
		title: "SSL / HTTPS",
		text: "Site ve ödeme yönlendirmesi güvenli HTTPS bağlantısı üzerinden sunulur."
	},
	{
		icon: Award,
		title: "SEMBOLİK PARSEL",
		text: "Satın alma gerçek taşınmaz veya gökyüzü mülkiyeti oluşturmaz."
	},
	{
		icon: Headphones,
		title: "DESTEK",
		text: "Sipariş ve destek talepleri için İletişim sayfasından bize ulaşabilirsiniz."
	}
];
var SECURITY_TRUST = [
	{
		icon: ShieldCheck,
		title: "GÜVENLİ ÖDEME",
		text: "Ödeme işlemi iyzico Link ödeme sayfasında gerçekleştirilir."
	},
	{
		icon: Lock,
		title: "3D SECURE",
		text: "iyzico Link ödeme yöntemi desteklediğinde 3D Secure güvenliği kullanır."
	},
	{
		icon: Award,
		title: "AÇIK ÜRÜN TANIMI",
		text: "Sunulan parsel dijital ve sembolik bir koleksiyon kaydıdır."
	},
	{
		icon: Headphones,
		title: "MÜŞTERİ DESTEĞİ",
		text: "İletişim kanallarımız ve satış sonrası destek bilgilerimiz sitede yer alır."
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
