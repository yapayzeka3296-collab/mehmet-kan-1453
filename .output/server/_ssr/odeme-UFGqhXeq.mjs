import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Route$22, c as supabaseBrowser } from "./router-rSLYDIlH.mjs";
import { M as LoaderCircle, Z as ExternalLink, ft as ArrowLeft, h as ShieldCheck, j as Lock } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-GNEwps4l.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/odeme-UFGqhXeq.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var PACKAGES = {
	digital: {
		name: "Dijital",
		price: 149
	},
	elite: {
		name: "Özel",
		price: 349
	},
	premium: {
		name: "Premium",
		price: 699
	}
};
function Odeme() {
	const navigate = useNavigate({ from: "/odeme" });
	const { parcels, certificateParcel } = Route$22.useSearch();
	const selectedParcels = (0, import_react.useMemo)(() => Array.from(new Set(parcels.split(",").map((v) => v.trim()).filter(Boolean))), [parcels]);
	const [verified, setVerified] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [paying, setPaying] = (0, import_react.useState)(false);
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
			const byId = new Map(rows.map((r) => [r.id, r]));
			const missing = selectedParcels.filter((id) => !byId.has(id));
			const unavailable = rows.filter((r) => r.status !== "available");
			const invalid = rows.filter((r) => !r.tier || ![
				"digital",
				"elite",
				"premium"
			].includes(r.tier) || Number(r.tier_price) !== PACKAGES[r.tier].price);
			if (missing.length || unavailable.length || invalid.length) {
				setError(unavailable.length ? "Seçilen parsellerden biri artık satışa uygun değil." : invalid.length ? "Parsel paket/fiyat bilgisi doğrulanamadı." : "Seçilen parseller doğrulanamadı.");
				setVerified([]);
				setLoading(false);
				return;
			}
			setVerified(selectedParcels.map((id) => {
				const r = byId.get(id);
				return {
					id,
					tier: r.tier,
					price: PACKAGES[r.tier].price
				};
			}));
			setLoading(false);
		}
		verify();
		return () => {
			active = false;
		};
	}, [selectedParcels]);
	const total = verified.reduce((s, i) => s + i.price, 0);
	const certificateIsSelected = Boolean(certificateParcel && selectedParcels.includes(certificateParcel));
	const groups = (0, import_react.useMemo)(() => [
		"digital",
		"elite",
		"premium"
	].map((tier) => {
		const items = verified.filter((i) => i.tier === tier);
		return items.length ? {
			tier,
			name: PACKAGES[tier].name,
			price: PACKAGES[tier].price,
			count: items.length,
			parcels: items.map((i) => i.id)
		} : null;
	}).filter(Boolean), [verified]);
	async function startPayment() {
		if (!supabaseBrowser || !verified.length || !certificateIsSelected || paying) return;
		setPaying(true);
		setError(null);
		const popup = window.open("about:blank", "myskyparcel-shopier", "noopener,noreferrer");
		try {
			const { data: sessionData } = await supabaseBrowser.auth.getSession();
			const token = sessionData.session?.access_token;
			if (!token) {
				popup?.close();
				await navigate({ to: "/giris" });
				return;
			}
			const response = await fetch("/api/shopier-checkout-intent", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					authorization: `Bearer ${token}`
				},
				body: JSON.stringify({
					parcel_ids: selectedParcels,
					certificate_parcel_id: certificateParcel
				})
			});
			const result = await response.json().catch(() => ({}));
			if (!response.ok || !result.ok || !result.checkout_html) throw new Error(result.reason || "Shopier ödeme sayfası oluşturulamadı.");
			localStorage.setItem("myskyparcel_shopier_intent", result.intent_id);
			if (popup) {
				popup.document.open();
				popup.document.write(result.checkout_html);
				popup.document.close();
			} else {
				window.location.href = result.checkout_url;
				return;
			}
			await navigate({
				to: "/odeme-sonuc",
				search: { intent: result.intent_id }
			});
		} catch (e) {
			popup?.close();
			setError(e instanceof Error ? e.message : "Ödeme başlatılamadı.");
			setPaying(false);
		}
	}
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
									certificateParcel: selectedParcels[0] ?? ""
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
							verified.length,
							" parsel doğrulandı. Sertifika ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: certificateParcel
							}),
							" için oluşturulacak."
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
										children: "SHOPIER İLE GÜVENLİ ÖDEME"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Kart bilgileriniz MySkyParcel'e gelmez; ödeme Shopier'in güvenli ödeme ekranında yapılır."
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-4",
									children: groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border border-border p-5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold",
												children: g.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-xs text-muted-foreground",
												children: [
													g.count,
													" parsel × ",
													g.price.toLocaleString("tr-TR"),
													" TL"
												]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "font-display text-xl text-gold",
												children: [(g.count * g.price).toLocaleString("tr-TR"), " TL"]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-xs text-muted-foreground",
											children: g.parcels.join(", ")
										})]
									}, g.tier))
								}),
								error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-5 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-xs",
									children: error
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									disabled: paying,
									onClick: () => void startPayment(),
									className: "btn-gold mt-6 flex w-full items-center justify-center gap-2 rounded-md px-6 py-4 text-xs disabled:opacity-60",
									children: paying ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " ÖDEME SAYFASI HAZIRLANIYOR..."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4" }),
										" SHOPIER'DE GÜVENLİ ÖDEMEYE GEÇ ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-4 w-4" })
									] })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-center text-[11px] text-muted-foreground",
									children: "Parseller, Shopier ödemesi sunucu tarafında doğrulanana kadar kesin olarak satılmış kabul edilmez."
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
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mb-2 h-4 w-4 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Ödeme sonrası webhook ve Shopier API ile tutar, ürün ve ödeme durumu doğrulanır." })]
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
