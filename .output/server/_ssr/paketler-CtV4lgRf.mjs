import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { $ as Check, I as Heart, J as CloudDownload, T as Lock, l as Star, m as ShieldCheck, rt as ArrowRight } from "../_libs/lucide-react.mjs";
import { n as SiteFooter, r as SiteHeader, t as CertificateTemplatePreview } from "./SiteFooter-D4oT9jMq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/paketler-CtV4lgRf.js
var import_jsx_runtime = require_jsx_runtime();
var PLANS = [
	{
		tier: "digital",
		name: "DİJİTAL PARSEL SERTİFİKASI",
		price: "199",
		popular: false,
		description: "Parselinizi belgeleyen modern dijital sertifika.",
		features: [
			"Kişiye özel dijital sertifika",
			"Parsel kodu ve kayıt bilgileri",
			"Dijital teslim"
		]
	},
	{
		tier: "elite",
		name: "ÖZEL PARSEL SERTİFİKASI",
		price: "499",
		popular: true,
		description: "Özel tasarım ve fiziksel baskı seçeneğiyle daha prestijli sunum.",
		features: [
			"Dijital sertifika",
			"Özel tasarım",
			"A4 fiziksel baskı",
			"Fiziksel ürün gönderimi"
		]
	},
	{
		tier: "premium",
		name: "PREMİUM PARSEL SERTİFİKASI",
		price: "999",
		popular: false,
		description: "En üst segment tasarım, premium baskı ve çerçeveli sunum.",
		features: [
			"Dijital sertifika",
			"Premium tasarım",
			"Premium dokulu kâğıt",
			"Çerçeveli A4 baskı",
			"Fiziksel ürün gönderimi"
		]
	}
];
var BENEFITS = [
	{
		icon: Star,
		title: "KİŞİYE ÖZEL",
		text: "Sertifika, satın alınan parsel ve kullanıcı kaydıyla ilişkilendirilir."
	},
	{
		icon: ShieldCheck,
		title: "DOĞRULANABİLİR",
		text: "Sertifikalar MySkyParcel doğrulama sistemi üzerinden kontrol edilebilir."
	},
	{
		icon: CloudDownload,
		title: "DİJİTAL & FİZİKSEL",
		text: "Paket kapsamına göre dijital ve fiziksel teslim seçenekleri sunulur."
	},
	{
		icon: Lock,
		title: "GÜVENLİ KAYIT",
		text: "Sertifika kayıtları doğrulama ve güvenlik altyapısıyla korunur."
	},
	{
		icon: Heart,
		title: "ANLAMLI HEDİYE",
		text: "Parsel deneyimini kalıcı ve kişisel bir hatıraya dönüştürür."
	}
];
function Paketler() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-[1600px] px-4 py-10 sm:py-14 lg:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold tracking-[0.2em] text-gold",
								children: "MY SKYPARCEL SERTİFİKALARI"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-3 font-display text-3xl font-bold sm:text-5xl",
								children: "SERTİFİKA SEÇENEKLERİ"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mx-auto mt-4 max-w-3xl text-sm leading-7 text-muted-foreground",
								children: "Digital, Özel ve Premium sertifika tasarımlarını inceleyin; parselinizi seçtikten sonra uygun sertifika seçeneğini belirleyin."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3",
						children: PLANS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: `panel relative flex h-full min-w-0 flex-col p-5 sm:p-7 ${p.popular ? "border-gold/70" : ""}`,
							children: [
								p.popular && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "btn-gold absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-[10px]",
									children: "EN POPÜLER"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-center font-display text-lg sm:text-xl",
									children: p.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 min-h-12 text-center text-xs leading-5 text-muted-foreground",
									children: p.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 text-center font-display text-3xl text-gold sm:text-4xl",
									children: [
										p.price,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-lg",
											children: "TL"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CertificateTemplatePreview, {
									tier: p.tier,
									className: "mt-5 w-full sm:mt-6"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-5 space-y-3 text-sm sm:mt-6",
									children: p.features.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-start gap-2 text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: f })]
									}, f))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/gokyuzu-haritasi",
									search: { city: "istanbul" },
									className: "btn-gold mt-6 flex min-h-11 items-center justify-center gap-3 rounded-md py-3 text-sm sm:mt-auto",
									children: ["PARSELİ SEÇ ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
								})
							]
						}, p.name))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "panel mt-10 grid gap-6 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-5",
						children: BENEFITS.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(b.icon, { className: "mt-0.5 h-6 w-6 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold tracking-[0.06em]",
									children: b.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs leading-5 text-muted-foreground",
									children: b.text
								})]
							})]
						}, b.title))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Paketler as component };
