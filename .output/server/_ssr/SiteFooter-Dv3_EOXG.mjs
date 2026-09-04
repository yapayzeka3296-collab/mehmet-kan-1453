import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { J as Facebook, L as Instagram, P as Linkedin, o as Twitter, t as Youtube } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SiteFooter-Dv3_EOXG.mjs
var import_jsx_runtime = require_jsx_runtime();
var LEGAL = [
	{
		label: "ÜYELİK SÖZLEŞMESİ",
		to: "/uyelik-sozlesmesi"
	},
	{
		label: "MESAFELİ SATIŞ SÖZLEŞMESİ",
		to: "/mesafeli-satis-sozlesmesi"
	},
	{
		label: "ÖN BİLGİLENDİRME FORMU",
		to: "/on-bilgilendirme-formu"
	},
	{
		label: "İADE / İPTAL",
		to: "/iade-iptal-politikasi"
	},
	{
		label: "KVKK",
		to: "/kvkk"
	},
	{
		label: "GİZLİLİK POLİTİKASI",
		to: "/gizlilik-politikasi"
	},
	{
		label: "KULLANIM ŞARTLARI",
		to: "/kullanim-sartlari"
	},
	{
		label: "ÇEREZ POLİTİKASI",
		to: "/cerez-politikasi"
	}
];
var CURRENT_YEAR = (/* @__PURE__ */ new Date()).getFullYear();
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "border-t border-border bg-navy-deep",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-[1600px] gap-5 px-4 py-7 text-xs text-muted-foreground lg:grid-cols-[auto_1fr_auto] lg:items-center lg:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
						"© ",
						CURRENT_YEAR,
						" MySkyParcel Türkiye | Tüm hakları saklıdır."
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted-foreground/80",
						children: "Sembolik dijital parsel ve sertifika hizmeti."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "flex flex-wrap items-center gap-x-4 gap-y-2 lg:justify-center",
					"aria-label": "Hukuki sayfalar",
					children: [LEGAL.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: item.to,
						className: "tracking-[0.04em] text-gold/70 transition-colors hover:text-gold",
						children: item.label
					}) }, item.label)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/iletisim",
						className: "tracking-[0.04em] text-gold/70 transition-colors hover:text-gold",
						children: "İLETİŞİM"
					}) })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-start gap-2 lg:items-end",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						"aria-label": "Ödeme yöntemleri",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded border border-white/15 bg-white px-2.5 py-1 text-[10px] font-bold tracking-wide text-slate-900",
								children: "Shopier ile Öde"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded border border-white/15 bg-white px-2.5 py-1 text-[10px] font-bold italic text-slate-900",
								children: "VISA"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded border border-white/15 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-900",
								children: "Mastercard"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "flex items-center gap-3",
						"aria-label": "Sosyal medya",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "https://www.instagram.com/myskyparcel/",
							target: "_blank",
							rel: "noopener noreferrer",
							"aria-label": "MySkyParcel Instagram",
							title: "MySkyParcel Instagram",
							className: "grid h-8 w-8 place-items-center rounded-full border border-gold/50 text-gold/70 transition-colors hover:text-gold hover:border-gold",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Instagram, {
								className: "h-3.5 w-3.5",
								"aria-hidden": "true"
							})
						}) }), [
							Facebook,
							Twitter,
							Youtube,
							Linkedin
						].map((Icon, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-label": "Sosyal medya bağlantısı henüz tanımlı değil",
							title: "Sosyal medya bağlantısı henüz tanımlı değil",
							className: "grid h-8 w-8 place-items-center rounded-full border border-gold/50 text-gold/70",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "h-3.5 w-3.5",
								"aria-hidden": "true"
							})
						}) }, i))]
					})]
				})
			]
		})
	});
}
//#endregion
export { SiteFooter as t };
