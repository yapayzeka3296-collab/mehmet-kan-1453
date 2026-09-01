import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as Route$20, s as supabaseBrowser } from "./router-CCOvPKz4.mjs";
import { M as LoaderCircle, Z as ExternalLink, ft as ArrowLeft, h as ShieldCheck, j as Lock } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-DW5U6wj9.mjs";
import { t as SiteFooter } from "./SiteFooter-DN-Ow7j8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/odeme-BEQGE9O8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PACKAGES = {
	digital: {
		name: "Dijital",
		price: 149,
		link: ""
	},
	elite: {
		name: "Özel",
		price: 349,
		link: ""
	},
	premium: {
		name: "Premium",
		price: 699,
		link: ""
	}
};
function Odeme() {
	const navigate = useNavigate({ from: "/odeme" });
	const { parcels, certificateParcel } = Route$20.useSearch();
	const selectedParcels = (0, import_react.useMemo)(() => Array.from(new Set(parcels.split(",").map((value) => value.trim()).filter(Boolean))), [parcels]);
	const [verified, setVerified] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let active = true;
		async function verify() {
			if (!selectedParcels.length) {
				setVerified([]);
				setLoading(false);
				return;
			}
			if (!supabaseBrowser) {
				setError("Parsel doğrulama altyapısı kullanılamıyor.");
				setLoading(false);
				return;
			}
			setLoading(true);
			setError(null);
			const { data, error: queryError } = await supabaseBrowser.from("parcel_map_public").select("id,tier,tier_price,status").in("id", selectedParcels);
			if (!active) return;
			if (queryError) {
				setError("Parseller ödeme öncesinde doğrulanamadı.");
				setVerified([]);
				setLoading(false);
				return;
			}
			const rows = data ?? [];
			const byId = new Map(rows.map((row) => [row.id, row]));
			const missing = selectedParcels.filter((id) => !byId.has(id));
			const unavailable = rows.filter((row) => row.status !== "available");
			const invalid = rows.filter((row) => !row.tier || ![
				"digital",
				"elite",
				"premium"
			].includes(row.tier) || Number(row.tier_price) !== PACKAGES[row.tier].price);
			if (missing.length || unavailable.length || invalid.length) {
				setError(unavailable.length ? `Ödeme durduruldu. Satışa uygun olmayan parsel: ${unavailable.map((row) => row.id).join(", ")}` : invalid.length ? "Parsel paket/fiyat bilgisi doğrulanamadı; ödeme durduruldu." : "Seçilen parseller doğrulanamadı.");
				setVerified([]);
				setLoading(false);
				return;
			}
			setVerified(selectedParcels.map((id) => {
				const tier = byId.get(id).tier;
				return {
					id,
					tier,
					price: PACKAGES[tier].price
				};
			}));
			setLoading(false);
		}
		verify();
		return () => {
			active = false;
		};
	}, [selectedParcels]);
	const groups = (0, import_react.useMemo)(() => [
		"digital",
		"elite",
		"premium"
	].map((tier) => {
		const tierItems = verified.filter((item) => item.tier === tier);
		if (!tierItems.length) return null;
		return {
			...PACKAGES[tier],
			tier,
			count: tierItems.length,
			parcels: tierItems.map((item) => item.id)
		};
	}).filter((group) => Boolean(group)), [verified]);
	const total = verified.reduce((sum, item) => sum + item.price, 0);
	const missingLink = groups.some((group) => !group.link);
	const certificateIsSelected = Boolean(certificateParcel && selectedParcels.includes(certificateParcel));
	(0, import_react.useEffect)(() => {
		if (!verified.length || !certificateIsSelected || typeof window === "undefined") return;
		try {
			window.localStorage.setItem("myskyparcel_checkout_plan", JSON.stringify({
				items: verified,
				certificateParcel,
				groups,
				total
			}));
		} catch {}
	}, [
		verified,
		certificateParcel,
		groups,
		total,
		certificateIsSelected
	]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-3xl px-4 py-16 lg:px-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-8 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto h-7 w-7 animate-spin text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: "Ödeme öncesi parseller doğrulanıyor..."
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
	if (!verified.length || !certificateIsSelected) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-3xl px-4 py-16 lg:px-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-8 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl font-bold",
							children: "ÖDEME HAZIRLANAMADI"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: error ?? (!certificateIsSelected ? "Sertifika için bir parsel seçimi doğrulanamadı." : "Seçilen parseller doğrulanamadı.")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void navigate({
								to: "/parsel-satin-al",
								search: {
									parcels: selectedParcels.join(","),
									certificateParcel: certificateIsSelected ? certificateParcel : selectedParcels[0]
								}
							}),
							className: "mt-6 inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " BİLGİLERE DÖN"]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mx-auto mt-3 max-w-3xl text-center text-sm text-muted-foreground",
						children: [
							"Seçtiğiniz ",
							verified.length,
							" parsel doğrulandı. Sertifika yalnızca ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: certificateParcel
							}),
							" için talep edilir."
						]
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
										children: "İYZİCO LİNK İLE ÖDEME"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Kart bilgileri MySkyParcel üzerinde alınmaz. Ödeme, seçtiğiniz paket için İyzico'nun güvenli ödeme sayfasında tamamlanır."
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-gold/20 bg-gold/[0.04] p-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold text-gold",
										children: "Doğrulanmış parsel siparişi"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xs leading-5 text-muted-foreground",
										children: "Paket türü, satış durumu ve fiyat MySkyParcel kayıtlarından ödeme öncesinde yeniden doğrulandı."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-5 space-y-4",
									children: groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border p-5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between gap-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold",
													children: group.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-xs text-muted-foreground",
													children: [
														group.count,
														" parsel × ",
														group.price.toLocaleString("tr-TR"),
														" TL"
													]
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "font-display text-xl text-gold",
													children: [(group.price * group.count).toLocaleString("tr-TR"), " TL"]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-3 text-xs text-muted-foreground",
												children: group.parcels.join(", ")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-4 flex items-center justify-between gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[11px] text-muted-foreground",
													children: group.count > 1 ? `${group.count} Link ödemesi gerekir.` : "1 Link ödemesi gerekir."
												}), group.link ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
													href: group.link,
													target: "_blank",
													rel: "noopener noreferrer",
													className: "btn-gold inline-flex shrink-0 items-center gap-2 rounded-md px-5 py-3 text-[11px]",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4" }),
														" İYZİCO'DA ÖDE ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-4 w-4" })
													]
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													disabled: true,
													className: "btn-gold rounded-md px-5 py-3 text-[11px] opacity-50",
													children: "ÖDEME LİNKİ HAZIR DEĞİL"
												})]
											})
										]
									}, group.tier))
								}),
								missingLink && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-xs",
									children: "Seçilen paketlerden en az birinin canlı İyzico Link'i Vercel ortam değişkenine eklenmemiş."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 rounded-xl border border-border p-5 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold text-foreground",
										children: "Ödeme sonrası"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2",
										children: "İyzico Link ile tamamlanan ödeme, İyzico Kontrol Paneli üzerinden takip edilir. Parseller ödeme doğrulanana kadar kesin olarak satılmış kabul edilmez."
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
							className: "panel h-fit p-6 lg:sticky lg:top-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-base",
									children: "SİPARİŞ ÖZETİ"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 space-y-3 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Parsel sayısı"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: verified.length })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Sertifika"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: certificateParcel })]
										}),
										groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-muted-foreground",
												children: [
													group.name,
													" × ",
													group.count
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [(group.price * group.count).toLocaleString("tr-TR"), " TL"] })]
										}, group.tier)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-t border-border pt-4 flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: "Toplam"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-display text-2xl text-gold",
												children: [total.toLocaleString("tr-TR"), " TL"]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 rounded-lg border border-gold/20 bg-gold/[0.04] p-4 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mb-2 h-4 w-4 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Parseller ödeme doğrulanana kadar kesin olarak satılmış kabul edilmez." })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => void navigate({
										to: "/parsel-satin-al",
										search: {
											parcels: selectedParcels.join(","),
											certificateParcel
										}
									}),
									className: "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-5 py-3 text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " BİLGİLERE DÖN"]
								})
							]
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
