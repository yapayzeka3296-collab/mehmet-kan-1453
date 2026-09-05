import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Play, K as Globe, L as Layers, M as Lock, W as Headphones, ct as Boxes, f as Sparkles, ft as ArrowRight, g as ShieldCheck, ot as Check } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-Ct-Hn9rm.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
import { n as TrustBar } from "./TrustBar-Ci8UbTsR.mjs";
import { t as CertificateTemplatePreview } from "./CertificateTemplatePreview-O3wylTrN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ana-sayfa-Cxl15_67.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var CITY_IMAGES = {
	IST: "/images/cities/istanbul.webp",
	ANK: "/images/cities/ankara.webp",
	IZM: "/images/cities/izmir.webp",
	BUR: "/images/cities/bursa.webp",
	ANT: "/images/cities/antalya.webp",
	KAY: "/images/cities/kayseri.webp",
	GZT: "/images/cities/gaziantep.webp"
};
var SKY_PARCEL_MODEL = {
	cityCount: 81,
	layersPerCity: 10,
	sectorsPerCity: 1e3,
	parcelsPerCity: 1e6,
	totalParcels: 81e6
};
var STATS = [
	{
		icon: Globe,
		big: "81 MİLYON",
		title: "TOPLAM GÖKYÜZÜ PARSELİ",
		text: "81 il × 1.000.000 parsel uzun vadeli hedef"
	},
	{
		icon: Layers,
		big: "10",
		title: "KATMAN / İL",
		text: "Her il için 10 katman"
	},
	{
		icon: ShieldCheck,
		big: "1.000",
		title: "SEKTÖR / İL",
		text: "Her il için 1.000 sektör"
	},
	{
		icon: Boxes,
		big: "1.000.000",
		title: "PARSEL / İL",
		text: "Her il için 1.000.000 parsel"
	},
	{
		icon: Headphones,
		big: "DESTEK",
		title: "DESTEK EKİBİ",
		text: "İletişim kanalları üzerinden bize ulaşabilirsiniz"
	},
	{
		icon: Lock,
		big: "",
		title: "GÜVENLİ ALTYAPI",
		text: "Güvenlik ve ödeme altyapısı ayrıca doğrulanmalıdır"
	}
];
var CERTIFICATE_PACKAGES = [
	{
		id: "digital",
		name: "DİJİTAL PARSEL SERTİFİKA",
		price: 149,
		features: ["Dijital sertifika", "Parsel kodu ve kayıt bilgileri"]
	},
	{
		id: "elite",
		name: "ÖZEL PARSEL SERTİFİKA",
		price: 349,
		features: [
			"Özel tasarım sertifika",
			"A4 fiziksel baskı",
			"Dijital sertifika"
		]
	},
	{
		id: "premium",
		name: "PREMİUM PARSEL SERTİFİKA",
		price: 699,
		features: [
			"Premium tasarım sertifika",
			"Çerçeveli baskı",
			"Dijital sertifika"
		]
	}
];
var POPULAR_CITIES = [
	{
		name: "İSTANBUL",
		slug: "istanbul",
		code: "IST",
		image: CITY_IMAGES.IST
	},
	{
		name: "ANKARA",
		slug: "ankara",
		code: "ANK",
		image: CITY_IMAGES.ANK
	},
	{
		name: "İZMİR",
		slug: "izmir",
		code: "IZM",
		image: CITY_IMAGES.IZM
	},
	{
		name: "ANTALYA",
		slug: "antalya",
		code: "ANT",
		image: CITY_IMAGES.ANT
	},
	{
		name: "BURSA",
		slug: "bursa",
		code: "BUR",
		image: CITY_IMAGES.BUR
	},
	{
		name: "KAYSERİ",
		slug: "kayseri",
		code: "KAY",
		image: CITY_IMAGES.KAY
	},
	{
		name: "GAZİANTEP",
		slug: "gaziantep",
		code: "GZT",
		image: CITY_IMAGES.GZT
	}
];
function Index() {
	const navigate = useNavigate();
	const [certificateCode, setCertificateCode] = (0, import_react.useState)("");
	const parcelModelCheck = SKY_PARCEL_MODEL.cityCount * SKY_PARCEL_MODEL.parcelsPerCity === SKY_PARCEL_MODEL.totalParcels;
	function handleCertificateSubmit(event) {
		event.preventDefault();
		if (!certificateCode.trim()) return;
		navigate({
			to: "/sertifika-dogrula",
			search: { code: certificateCode.trim() }
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "hero-sky-parcels relative min-h-[312px] overflow-hidden bg-cover bg-center bg-no-repeat sm:min-h-[344px] lg:min-h-[376px]",
					style: { backgroundImage: "url('/hero-background.jpg')" },
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative mx-auto max-w-[1600px] px-4 py-4 sm:py-5 lg:px-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 max-w-3xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-block max-w-full rounded-md border border-gold/60 bg-background/20 px-3 py-1 tracking-[0.1em] text-[8px] leading-4 text-gold backdrop-blur-[2px] sm:px-4 sm:text-[9px]",
									children: [
										"HER İL İÇİN ",
										SKY_PARCEL_MODEL.layersPerCity,
										" KATMAN · ",
										SKY_PARCEL_MODEL.sectorsPerCity.toLocaleString("tr-TR"),
										" SEKTÖR · ",
										SKY_PARCEL_MODEL.parcelsPerCity.toLocaleString("tr-TR"),
										" PARSEL",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
											"TOPLAM ",
											SKY_PARCEL_MODEL.totalParcels.toLocaleString("tr-TR"),
											" GÖKYÜZÜ PARSELİ"
										] })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
									className: "mt-2 break-words font-display text-3xl leading-[1.05] font-bold drop-shadow-lg sm:text-4xl lg:text-5xl",
									children: [
										"GÖKYÜZÜNDE",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-gradient-gold",
											children: "SANA ÖZEL"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										"SEMBOLİK BİR YER"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 max-w-lg text-xs font-medium text-black drop-shadow sm:text-sm",
									children: "MySkyParcel ile gökyüzünde sana özel bir parsel seçebilir, benzersiz sertifikanla bu anı ölümsüzleştirebilirsin."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex max-w-full flex-wrap gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/turkiye-haritasi",
										className: "btn-gold inline-flex max-w-full items-center gap-2 rounded-md px-4 py-2 text-[10px] sm:px-5 sm:text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 shrink-0" }), " GÖKYÜZÜ HARİTASINA GİT"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled: true,
										className: "inline-flex items-center gap-2 rounded-md border border-border bg-background/20 px-4 py-2 text-[10px] opacity-70",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4" }), " VİDEOYU İZLE"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 max-w-3xl rounded-xl border border-cyan-300/20 bg-slate-950/45 px-3 py-2 text-left shadow-lg backdrop-blur-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[9px] font-semibold uppercase tracking-[0.12em] text-cyan-100/95 sm:text-[10px]",
										children: "81 MİLYON BENZERSİZ PARSEL"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 text-[9px] leading-4 font-semibold text-white sm:text-xs",
										children: "Her parsel kendine özel bir parsel koduyla oluşturulur. Bir parsel yalnızca bir kişi tarafından satın alınabilir; satın alınan parsel sahibinin hesabına kaydedilir ve aynı parsel yeniden üretilemez."
									})]
								})
							]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mx-auto max-w-[1600px] px-4 pt-4 sm:pt-5 lg:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "panel grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
						children: STATS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "mt-0.5 h-5 w-5 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									s.big && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-lg font-bold",
										children: s.big
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] font-semibold tracking-[0.08em]",
										children: s.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 text-[10px] text-muted-foreground",
										children: s.text
									})
								]
							})]
						}, s.title))
					}), !parcelModelCheck && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-center text-[10px] text-muted-foreground",
						children: "Parsel model verisi henüz doğrulanmadı."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "mx-auto max-w-[1600px] px-4 py-6 lg:px-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-5 md:grid-cols-2 xl:grid-cols-3",
						children: CERTIFICATE_PACKAGES.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "panel flex min-w-0 flex-col p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-display text-lg",
									children: p.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 space-y-1.5 text-xs",
									children: p.features.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-start gap-2 text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: f })]
									}, f))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CertificateTemplatePreview, {
									tier: p.id,
									className: "mt-5"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-4 font-display text-2xl text-gold",
									children: [
										p.price.toLocaleString("tr-TR"),
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-base",
											children: "TL"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/paketler",
									className: "btn-gold mt-3 inline-flex min-h-10 items-center justify-center rounded-md px-5 py-2 text-[11px]",
									children: "HEMEN İNCELE"
								})
							]
						}, p.id))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "mx-auto max-w-[1600px] px-4 pb-6 lg:px-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-4 sm:p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-base",
								children: "SERTİFİKA DOĞRULA"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1.5 text-xs text-muted-foreground",
								children: "Sertifika numaranızı girerek geçerliliğini kontrol edebilirsiniz."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								onSubmit: handleCertificateSubmit,
								className: "mt-3 flex flex-col gap-2 sm:flex-row",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "homepage-certificate-code",
										className: "sr-only",
										children: "Sertifika numarası"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "homepage-certificate-code",
										value: certificateCode,
										onChange: (event) => setCertificateCode(event.target.value),
										placeholder: "Sertifika numaranızı girin",
										autoComplete: "off",
										className: "min-w-0 flex-1 rounded-md border border-input bg-background/60 px-3 py-2 text-[11px] uppercase outline-none focus:border-gold"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "submit",
										className: "btn-gold inline-flex items-center justify-center rounded-md px-4 py-2 text-[11px]",
										children: "DOĞRULA"
									})
								]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "mx-auto max-w-[1600px] px-4 pb-6 lg:px-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel grid gap-4 p-4 sm:p-5 lg:grid-cols-[auto_1fr_auto] lg:items-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-base tracking-[0.08em]",
								children: "POPÜLER ŞEHİRLER"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "flex flex-wrap justify-center gap-3 sm:gap-4",
								children: POPULAR_CITIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => navigate({
										to: "/turkiye-haritasi",
										search: { city: c.slug }
									}),
									className: "block cursor-pointer text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mx-auto grid h-11 w-11 items-center overflow-hidden rounded-full border border-gold/60 bg-navy sm:h-12 sm:w-12",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: c.image,
											alt: `${c.name} şehir manzarası`,
											loading: "lazy",
											width: 96,
											height: 96,
											className: "h-full w-full object-cover"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1.5 text-[10px] tracking-[0.08em] text-muted-foreground",
										children: c.name
									})]
								}) }, c.code))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/turkiye-haritasi",
								className: "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-gold/60 px-5 py-2 text-[11px] text-gold",
								children: ["TÜM ŞEHİRLER ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustBar, {})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Index as component };
