import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { C as Mail, S as MapPin, y as Phone } from "../_libs/lucide-react.mjs";
import { n as SiteFooter, r as SiteHeader } from "./SiteFooter-Bmry0A3s.mjs";
import { n as TrustBar } from "./TrustBar-DHeSR4Mx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/iletisim-BDDGyL8i.js
var import_jsx_runtime = require_jsx_runtime();
function Iletisim() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-[1600px] px-4 py-14 lg:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-center font-display text-4xl font-bold sm:text-5xl",
						children: "İLETİŞİM"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-4 max-w-xl text-center text-sm text-muted-foreground",
						children: "Her türlü soru, görüş ve destek talebiniz için bize ulaşın. 7/24 yanınızdayız."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 grid gap-6 lg:grid-cols-[360px_1fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
							className: "panel grid content-start gap-5 p-6",
							children: [
								{
									icon: Mail,
									t: "E-posta",
									v: "destek@myskyparcel.com"
								},
								{
									icon: Phone,
									t: "Telefon",
									v: "+90 850 000 00 00"
								},
								{
									icon: MapPin,
									t: "Adres",
									v: "Şehitkamil, Gaziantep, Türkiye"
								}
							].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "mt-0.5 h-5 w-5 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: c.t
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-sm",
										children: c.v
									})]
								})]
							}, c.t))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "panel grid gap-5 p-6",
							onSubmit: (e) => e.preventDefault(),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-5 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "Ad Soyad"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "E-posta"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "Konu"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "Mesajınız"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										rows: 6,
										className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									className: "btn-gold w-fit rounded-md px-8 py-3 text-[11px]",
									children: "GÖNDER"
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Iletisim as component };
