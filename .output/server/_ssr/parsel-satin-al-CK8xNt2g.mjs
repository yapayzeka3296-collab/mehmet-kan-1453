import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as Route$20, o as supabaseBrowser } from "./router-DqMXAXw6.mjs";
import { N as LockKeyhole, P as LoaderCircle, ot as Check } from "../_libs/lucide-react.mjs";
import { n as SiteHeader, r as readParcelCart } from "./SiteHeader-DnF_PTN8.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
import { n as TrustBar } from "./TrustBar-Ci8UbTsR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parsel-satin-al-CK8xNt2g.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var VALID_TIERS = [
	"digital",
	"elite",
	"premium"
];
var PRICES = {
	digital: 149,
	elite: 349,
	premium: 699
};
var NAMES = {
	digital: "Dijital",
	elite: "Özel",
	premium: "Premium"
};
function SatinAl() {
	const navigate = useNavigate({ from: "/parsel-satin-al" });
	const { parcels } = Route$20.useSearch();
	const [cartIds, setCartIds] = (0, import_react.useState)([]);
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [paying, setPaying] = (0, import_react.useState)(false);
	const [validationError, setValidationError] = (0, import_react.useState)(null);
	const [reservationConflict, setReservationConflict] = (0, import_react.useState)(false);
	const [accepted, setAccepted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!parcels) setCartIds(readParcelCart().map((item) => item.id));
	}, [parcels]);
	const ids = (0, import_react.useMemo)(() => {
		const source = parcels ?? cartIds.join(",");
		return Array.from(new Set(source.split(",").map((value) => value.trim()).filter(Boolean)));
	}, [parcels, cartIds]);
	(0, import_react.useEffect)(() => {
		let active = true;
		async function validateParcels() {
			if (!ids.length) {
				if (active) {
					setItems([]);
					setLoading(false);
				}
				return;
			}
			if (!supabaseBrowser) {
				if (active) {
					setValidationError("Parsel doğrulama altyapısı kullanılamıyor.");
					setLoading(false);
				}
				return;
			}
			setLoading(true);
			setValidationError(null);
			setReservationConflict(false);
			const { data, error } = await supabaseBrowser.from("parcel_map_public").select("id,tier,tier_price,status").in("id", ids);
			if (!active) return;
			if (error) {
				setValidationError("Parseller doğrulanamadı. Lütfen tekrar deneyin.");
				setItems([]);
				setLoading(false);
				return;
			}
			const rows = Array.isArray(data) ? data.map((raw) => {
				const row = raw;
				const tierValue = typeof row.tier === "string" && VALID_TIERS.includes(row.tier) ? row.tier : null;
				return {
					id: typeof row.id === "string" ? row.id : String(row.id ?? ""),
					tier: tierValue,
					tier_price: typeof row.tier_price === "number" ? row.tier_price : Number(row.tier_price ?? NaN),
					status: typeof row.status === "string" ? row.status : ""
				};
			}) : [];
			const byId = new Map(rows.map((row) => [row.id, row]));
			const missing = ids.filter((id) => !byId.has(id));
			const unavailable = rows.filter((row) => row.status !== "available" && row.status !== "reserved");
			const invalid = rows.filter((row) => !row.tier || !VALID_TIERS.includes(row.tier) || Number(row.tier_price) !== PRICES[row.tier]);
			if (missing.length || unavailable.length || invalid.length) {
				setValidationError(unavailable.length ? `Şu parseller artık satışa uygun değil: ${unavailable.map((row) => row.id).join(", ")}` : invalid.length ? "Parsel fiyatı paket fiyatıyla eşleşmiyor." : "Seçilen parseller doğrulanamadı.");
				setItems([]);
				setLoading(false);
				return;
			}
			const next = ids.map((id) => {
				const row = byId.get(id);
				if (!row || !row.tier) throw new Error("Validated parcel row missing");
				return {
					id,
					tier: row.tier,
					price: PRICES[row.tier]
				};
			});
			setItems(next);
			setLoading(false);
		}
		validateParcels();
		return () => {
			active = false;
		};
	}, [ids]);
	const total = items.reduce((sum, item) => sum + item.price, 0);
	const grouped = items.reduce((acc, item) => {
		acc[item.tier] += 1;
		return acc;
	}, {
		digital: 0,
		elite: 0,
		premium: 0
	});
	async function startPayment() {
		if (!supabaseBrowser || paying || !accepted || !items.length) return;
		setPaying(true);
		setValidationError(null);
		setReservationConflict(false);
		try {
			const { data: sessionData } = await supabaseBrowser.auth.getSession();
			const token = sessionData.session?.access_token;
			if (!token) {
				await navigate({ to: "/giris" });
				return;
			}
			const response = await fetch("/api/shopier/checkout", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					authorization: `Bearer ${token}`
				},
				body: JSON.stringify({ parcel_ids: items.map((item) => item.id) })
			});
			const result = await response.json().catch(() => ({}));
			if (!response.ok || !result.checkout_url) {
				const messages = {
					shopier_not_configured: "Shopier ödeme bağlantısı henüz yapılandırılmamış. cPanel ortam değişkenlerini kontrol edin.",
					supabase_not_configured: "Ödeme altyapısı yapılandırılmamış. cPanel Supabase ayarlarını kontrol edin.",
					not_available: "Seçtiğiniz parsellerden biri artık satışa uygun değil.",
					parcel_reserved_by_other_user: "Bu parsel başka kullanıcı tarafından şu an satın alınmaktadır. 5 dk sonra yine deneyebilirsiniz.",
					parcel_not_found: "Seçilen parsel bulunamadı. Lütfen haritadan yeniden seçim yapın.",
					empty_parcel_selection: "Ödenecek parsel seçilmedi.",
					too_many_parcels: "Tek işlemde en fazla 100 parsel satın alınabilir.",
					invalid_parcel_price: "Parsel fiyatı doğrulanamadı. Lütfen tekrar deneyin.",
					unauthenticated: "Ödeme için giriş yapmanız gerekiyor.",
					checkout_intent_failed: "Ödeme hazırlığı tamamlanamadı. Lütfen tekrar deneyin.",
					checkout_intent_invalid: "Ödeme tutarı doğrulanamadı. Lütfen tekrar deneyin.",
					shopier_product_creation_failed: "Shopier ödeme ürünü oluşturamadı. Shopier API/PAT ayarlarını kontrol edin.",
					shopier_product_url_missing: "Shopier ödeme bağlantısı döndürmedi. Shopier ürün API yanıtını kontrol edin.",
					shopier_unreachable: "Shopier ödeme servisine ulaşılamadı. Lütfen birkaç dakika sonra tekrar deneyin.",
					checkout_persistence_failed: "Ödeme bağlantısı oluşturuldu ancak sipariş kaydı tamamlanamadı. Lütfen tekrar deneyin.",
					internal_error: "Sunucu tarafında beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
				};
				const reason = String(result.reason);
				setValidationError(messages[reason] ?? "Ödeme başlatılamadı. Lütfen tekrar deneyin.");
				if (reason === "parcel_reserved_by_other_user") {
					setItems([]);
					setReservationConflict(true);
				}
				return;
			}
			window.location.assign(result.checkout_url);
		} catch (error) {
			console.error("Shopier payment start failed", error);
			setValidationError("Ödeme bağlantısı oluşturulamadı. Lütfen tekrar deneyin.");
		} finally {
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
						children: "Parseller ve paket türleri doğrulanıyor..."
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
	if (!items.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
							children: reservationConflict ? "BU PARSEL ŞU AN SATIN ALINIYOR" : "SATIN ALMA HAZIRLANAMADI"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: validationError ?? "Sepetinizde satışa uygun parsel bulunamadı."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void navigate({ to: "/gokyuzu-haritasi" }),
							className: "btn-gold mt-6 rounded-md px-6 py-3 text-xs",
							children: "HARİTAYA DÖN"
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
				className: "mx-auto w-full max-w-[1200px] px-4 py-12 lg:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-center font-display text-4xl font-bold sm:text-5xl",
						children: "SATIN ALMA"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground",
						children: [
							"İstediğiniz sayıda ve farklı türlerde parsel seçebilirsiniz. ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: "Sertifika seçimi ödeme aşamasından çıkarılmıştır."
							}),
							" Satın aldığınız parseller için dijital veya fiziksel sertifikayı daha sonra kullanıcı panelinizden oluşturabilirsiniz."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "panel min-w-0 p-6 sm:p-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "font-display text-lg",
									children: [
										"SEÇİLEN PARSELLER (",
										items.length,
										")"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-5 space-y-3",
									children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded-xl border border-border p-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex min-w-0 items-center justify-between gap-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "truncate font-medium",
													children: item.id
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-xs text-muted-foreground",
													children: [
														NAMES[item.tier],
														" · ",
														item.price.toLocaleString("tr-TR"),
														" TL"
													]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: "Sertifika seçimi satın alma sonrasında"
											})]
										})
									}, item.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 rounded-xl border border-gold/20 bg-gold/[0.04] p-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold text-gold",
										children: "SERTİFİKA SEÇİMİ DAHA SONRA"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs leading-5 text-muted-foreground",
										children: [
											"Ödeme sırasında sertifika veya teslimat adresi istenmez. Satın alma tamamlandıktan sonra kullanıcı panelinizden sahip olduğunuz parseli seçerek ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "text-foreground",
												children: "Dijital"
											}),
											" veya uygun paketlerde ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "text-foreground",
												children: "Fiziksel"
											}),
											" sertifika oluşturabilirsiniz."
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mt-6 flex cursor-pointer items-start gap-3 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: accepted,
										onChange: (e) => setAccepted(e.target.checked),
										className: "mt-0.5 accent-current"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Seçtiğim parselleri ve satış sözleşmelerine eriştiğimi onaylıyorum." })]
								}),
								validationError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									role: "alert",
									className: "mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs text-destructive",
									children: validationError
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: !accepted || paying,
									onClick: () => void startPayment(),
									className: "mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-gold/50 bg-gold px-6 py-3 text-[11px] font-bold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50",
									children: [
										paying ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, { className: "h-4 w-4" }),
										" ",
										paying ? "ÖDEME HAZIRLANIYOR..." : "ÖDEMEYE GEÇ"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-center text-[10px] text-muted-foreground",
									children: "Kart bilgileri MySkyParcel sunucusunda tutulmaz; ödeme Shopier tarafında tamamlanır."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
							className: "panel h-fit min-w-0 p-6 lg:sticky lg:top-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-base",
									children: "SEÇİM ÖZETİ"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 space-y-3 text-sm",
									children: [
										[
											"digital",
											"elite",
											"premium"
										].filter((tier) => grouped[tier] > 0).map((tier) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between gap-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-muted-foreground",
												children: [
													NAMES[tier],
													" × ",
													grouped[tier]
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "shrink-0",
												children: [(PRICES[tier] * grouped[tier]).toLocaleString("tr-TR"), " TL"]
											})]
										}, tier)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-t border-border pt-4 flex justify-between gap-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: "Toplam"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "shrink-0 font-display text-2xl text-gold",
												children: [total.toLocaleString("tr-TR"), " TL"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-t border-border pt-4 text-xs text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Toplam parsel: ", items.length] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1",
												children: "Sertifika seçimi satın alma sonrasında kullanıcı panelinden yapılır."
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-5 space-y-3 text-sm",
									children: [
										"İstediğiniz sayıda sembolik parsel",
										"Farklı paket türlerini aynı seçimde kullanabilme",
										"Ödeme sonrası kullanıcı panelinden sertifika oluşturma",
										"Her parsel için benzersiz kayıt"
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
