import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route$16 } from "./router-C28Q36UD.mjs";
import { T as Lock, it as ArrowLeft, m as ShieldCheck } from "../_libs/lucide-react.mjs";
import { n as SiteFooter, r as SiteHeader } from "./SiteFooter-DYmQPb-1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/odeme-CN3I89VB.js
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	"Parsel Seçimi",
	"Bilgiler",
	"Ödeme"
];
function Odeme() {
	const navigate = useNavigate({ from: "/odeme" });
	const { parcels } = Route$16.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-[1200px] px-4 py-12 lg:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-center font-display text-4xl font-bold sm:text-5xl",
						children: "ÖDEME"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-4",
						children: STEPS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `grid h-7 w-7 place-items-center rounded-full border ${i === 2 ? "border-gold text-gold" : "border-border text-muted-foreground"}`,
								children: i + 1
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: i === 2 ? "text-gold" : "text-muted-foreground",
								children: s
							})]
						}, s))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 grid gap-6 lg:grid-cols-[1fr_360px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "panel p-6 sm:p-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-6 flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-lg",
										children: "GÜVENLİ ÖDEME"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Sipariş bilgilerinizi kontrol ederek ödeme adımına geçebilirsiniz."
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 sm:grid-cols-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "block sm:col-span-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: "Kart Üzerindeki Ad Soyad"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												autoComplete: "cc-name",
												placeholder: "Ahmet Yılmaz",
												className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-3 text-sm outline-none focus:border-gold"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "block sm:col-span-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: "Kart Numarası"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												inputMode: "numeric",
												autoComplete: "cc-number",
												placeholder: "0000 0000 0000 0000",
												className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-3 text-sm outline-none focus:border-gold"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "block",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: "Son Kullanma Tarihi"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												autoComplete: "cc-exp",
												placeholder: "AA/YY",
												className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-3 text-sm outline-none focus:border-gold"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "block",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: "CVV"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												inputMode: "numeric",
												autoComplete: "cc-csc",
												placeholder: "123",
												className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-3 text-sm outline-none focus:border-gold"
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => void navigate({
											to: "/parsel-satin-al",
											search: { parcels }
										}),
										className: "inline-flex items-center justify-center gap-2 rounded-md border border-border px-5 py-3 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " BİLGİLERE DÖN"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled: true,
										className: "btn-gold inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-xs disabled:cursor-not-allowed disabled:opacity-60",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4" }), " ÖDEMEYİ TAMAMLA"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 rounded-lg border border-gold/20 bg-gold/[0.04] p-4 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mb-2 h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Ödeme sağlayıcısı entegrasyonu tamamlandığında kart bilgileri doğrudan güvenli ödeme sağlayıcısına gönderilecektir. Bu arayüz şu anda gerçek tahsilat yapmaz." })]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
							className: "panel h-fit p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-base",
								children: "SİPARİŞ ÖZETİ"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 space-y-3 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Seçilen parseller"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold",
											children: parcels ? parcels.split(",").filter(Boolean).length : 0
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Sertifika paketi"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Premium" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between border-t border-border pt-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Toplam"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-display text-2xl text-gold",
											children: "499 TL"
										})]
									})
								]
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Odeme as component };
