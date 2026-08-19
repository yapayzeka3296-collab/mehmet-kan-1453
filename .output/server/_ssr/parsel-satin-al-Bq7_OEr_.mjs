import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$13 } from "./router-Clj7SSKb.mjs";
import { $ as Check, rt as ArrowRight, u as Sparkles } from "../_libs/lucide-react.mjs";
import { n as SiteFooter, r as SiteHeader } from "./SiteFooter-BgMvJZTE.mjs";
import { n as TrustBar } from "./TrustBar-DHeSR4Mx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parsel-satin-al-Bq7_OEr_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	"Parsel Seçimi",
	"Bilgiler",
	"Ödeme"
];
function SatinAl() {
	const navigate = useNavigate({ from: "/parsel-satin-al" });
	const { parcels } = Route$13.useSearch();
	const [accepted, setAccepted] = (0, import_react.useState)(false);
	const selectedParcel = parcels?.split(",").filter(Boolean)[0] || "GZ-K05-S042-P07";
	function handleContinue() {
		if (!accepted) return;
		navigate({
			to: "/odeme",
			search: { parcels: parcels ?? "" }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-[1200px] px-4 py-12 lg:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-center font-display text-4xl font-bold sm:text-5xl",
						children: "PARSEL SATIN AL"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-4",
						children: STEPS.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center gap-2 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `grid h-7 w-7 place-items-center rounded-full border ${index === 1 ? "border-gold text-gold" : "border-border text-muted-foreground"}`,
								children: index + 1
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: index === 1 ? "text-gold" : "text-muted-foreground",
								children: step
							})]
						}, step))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 grid gap-6 lg:grid-cols-[1fr_420px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "panel p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-lg",
									children: "PARSEL BİLGİLERİ"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 rounded-xl border border-gold/20 bg-gold/[0.04] p-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold text-gold",
										children: "Bu parsel size özel olacaktır."
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xs leading-5 text-muted-foreground",
										children: "Parselin kendine özel kodu satın alma tamamlandığında hesabınıza kaydedilir. Aynı parsel başka bir kullanıcıya satılamaz veya yeniden oluşturulamaz."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-5 grid gap-4 sm:grid-cols-2",
									children: [
										{
											label: "Şehir",
											value: "Gaziantep"
										},
										{
											label: "Katman",
											value: "K05 (5. Katman)"
										},
										{
											label: "Sektör",
											value: "S042 (42. Sektör)"
										},
										{
											label: "Parsel",
											value: selectedParcel
										}
									].map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-border bg-background/30 p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] uppercase tracking-[0.12em] text-muted-foreground",
											children: field.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 font-medium",
											children: field.value
										})]
									}, field.label))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 rounded-lg border border-border p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-gold",
										children: "SERTİFİKA TASARIMI"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xs leading-5 text-muted-foreground",
										children: "Sertifika şablonuna yazı işleme ve otomatik sertifika görseli oluşturma sistemi kaldırıldı. Tasarım sil baştan hazırlanacak. Satın alma ve parsel sahipliği akışı bundan bağımsız olarak korunur."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mt-6 flex cursor-pointer items-start gap-3 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: accepted,
										onChange: (event) => setAccepted(event.target.checked),
										className: "mt-0.5 accent-current"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Parsel bilgilerimi kontrol ettiğimi ve satın alma adımına geçmek istediğimi onaylıyorum." })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: !accepted,
									onClick: handleContinue,
									className: "btn-gold mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md px-6 py-3 text-[11px] disabled:cursor-not-allowed disabled:opacity-50",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }),
										" ÖDEMEYE GEÇ ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
							className: "panel h-fit p-5 lg:sticky lg:top-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-base",
									children: "SATIN ALMA ÖZETİ"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-xs text-muted-foreground",
									children: "Seçilen parsel"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 font-display text-xl text-gold",
									children: selectedParcel
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-5 space-y-3 text-sm",
									children: [
										"Benzersiz parsel kodu",
										"Hesabınıza kayıt",
										"Parsel sahipliği kontrolü",
										"Sertifika tasarımı daha sonra eklenecek"
									].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-start gap-2 text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-gold" }), item]
									}, item))
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
export { SatinAl as component };
