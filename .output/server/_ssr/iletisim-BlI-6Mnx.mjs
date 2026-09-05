import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { O as Mail, S as Phone } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-BY0c5rB0.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
import { n as TrustBar } from "./TrustBar-Ci8UbTsR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/iletisim-BlI-6Mnx.mjs
var import_jsx_runtime = require_jsx_runtime();
function Iletisim() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-4xl px-4 py-16 lg:px-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel p-8 text-center sm:p-12",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold tracking-[0.3em] text-gold",
							children: "MYSKYPARCEL İLETİŞİM"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-4 font-display text-4xl font-bold sm:text-5xl",
							children: "BİZE ULAŞIN"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground",
							children: "Sipariş, ödeme, sertifika, sembolik parsel ve diğer konulardaki sorularınız için aşağıdaki iletişim kanallarından bize ulaşabilirsiniz."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "mailto:info.myskyparcel@gmail.com",
								className: "rounded-xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-gold/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-6 w-6 text-gold" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-xs text-muted-foreground",
										children: "E-posta"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 break-words text-sm font-medium",
										children: "info.myskyparcel@gmail.com"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "tel:+905416159743",
								className: "rounded-xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-gold/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-6 w-6 text-gold" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-xs text-muted-foreground",
										children: "Telefon"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm font-medium",
										children: "0541 615 97 43"
									})
								]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Iletisim as component };
