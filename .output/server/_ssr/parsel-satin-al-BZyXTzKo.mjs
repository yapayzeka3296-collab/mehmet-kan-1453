import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as supabaseBrowser, r as Route$17 } from "./router-DaYfPNXl.mjs";
import { M as LoaderCircle, d as Sparkles, dt as ArrowRight, ot as Check, q as FileBadge } from "../_libs/lucide-react.mjs";
import { n as SiteHeader, r as readParcelCart } from "./SiteHeader-BfMXTZLg.mjs";
import { t as SiteFooter } from "./SiteFooter-DN-Ow7j8.mjs";
import { n as TrustBar } from "./TrustBar-DFWcLzLx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parsel-satin-al-BZyXTzKo.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
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
var PHYSICAL = {
	digital: false,
	elite: true,
	premium: true
};
function SatinAl() {
	const navigate = useNavigate({ from: "/parsel-satin-al" });
	const { parcels, certificateParcel: requestedCertificate } = Route$17.useSearch();
	const [cartIds, setCartIds] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		if (parcels) return;
		setCartIds(readParcelCart().map((item) => item.id));
	}, [parcels]);
	const ids = (0, import_react.useMemo)(() => Array.from(new Set((parcels ?? cartIds.join(",")).split(",").map((v) => v.trim()).filter(Boolean))), [parcels, cartIds]);
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [validationError, setValidationError] = (0, import_react.useState)(null);
	const [certificateParcel, setCertificateParcel] = (0, import_react.useState)("");
	const [accepted, setAccepted] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [city, setCity] = (0, import_react.useState)("");
	const [district, setDistrict] = (0, import_react.useState)("");
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
			const { data, error } = await supabaseBrowser.from("parcel_map_public").select("id,tier,tier_price,status").in("id", ids);
			if (!active) return;
			if (error) {
				setValidationError("Parseller doğrulanamadı. Lütfen tekrar deneyin.");
				setItems([]);
				setLoading(false);
				return;
			}
			const rows = data ?? [];
			const byId = new Map(rows.map((row) => [row.id, row]));
			const missing = ids.filter((id) => !byId.has(id));
			const unavailable = rows.filter((row) => row.status !== "available");
			const invalid = rows.filter((row) => !row.tier || ![
				"digital",
				"elite",
				"premium"
			].includes(row.tier) || Number(row.tier_price) !== PRICES[row.tier]);
			if (missing.length || unavailable.length || invalid.length) {
				setValidationError(unavailable.length ? `Şu parseller artık satışa uygun değil: ${unavailable.map((row) => row.id).join(", ")}` : invalid.length ? "Parsel fiyatı paket fiyatıyla eşleşmiyor; ödeme durduruldu." : "Seçilen parseller doğrulanamadı.");
				setItems([]);
				setLoading(false);
				return;
			}
			const next = ids.map((id) => {
				const row = byId.get(id);
				return {
					id,
					tier: row.tier,
					price: PRICES[row.tier]
				};
			});
			setItems(next);
			setCertificateParcel((current) => current && ids.includes(current) ? current : requestedCertificate && ids.includes(requestedCertificate) ? requestedCertificate : ids[0] ?? "");
			setLoading(false);
		}
		validateParcels();
		return () => {
			active = false;
		};
	}, [ids, requestedCertificate]);
	const certificateTier = certificateParcel ? items.find((item) => item.id === certificateParcel)?.tier ?? "digital" : "digital";
	const physicalReady = !PHYSICAL[certificateTier] || Boolean(name.trim() && phone.trim() && address.trim() && city.trim() && district.trim());
	const total = items.reduce((sum, item) => sum + item.price, 0);
	const grouped = items.reduce((acc, item) => {
		acc[item.tier] += 1;
		return acc;
	}, {
		digital: 0,
		elite: 0,
		premium: 0
	});
	function handleContinue() {
		if (!items.length || !certificateParcel || !accepted || !physicalReady) return;
		localStorage.setItem("myskyparcel_purchase_plan", JSON.stringify({
			items,
			certificateParcel
		}));
		if (PHYSICAL[certificateTier]) localStorage.setItem("myskyparcel_delivery", JSON.stringify({
			name: name.trim(),
			phone: phone.trim(),
			address: address.trim(),
			city: city.trim(),
			district: district.trim()
		}));
		navigate({
			to: "/odeme",
			search: {
				parcels: items.map((item) => item.id).join(","),
				certificateParcel
			}
		});
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
							children: "SATIN ALMA HAZIRLANAMADI"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted-foreground",
							children: validationError ?? "Sepetinizde ödeme için uygun parsel bulunamadı."
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
				className: "mx-auto max-w-[1200px] px-4 py-12 lg:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-center font-display text-4xl font-bold sm:text-5xl",
						children: "SATIN ALMA"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground",
						children: [
							"İstediğiniz sayıda ve farklı türlerde parsel seçebilirsiniz. Bu siparişte yalnızca ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								className: "text-foreground",
								children: "bir parsel için sertifika"
							}),
							" talep edilebilir."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 grid gap-6 lg:grid-cols-[1fr_380px]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "panel p-6 sm:p-8",
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
										className: `rounded-xl border p-4 ${certificateParcel === item.id ? "border-gold/50 bg-gold/[0.05]" : "border-border"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-medium",
												children: item.id
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-xs text-muted-foreground",
												children: [
													NAMES[item.tier],
													" · ",
													item.price.toLocaleString("tr-TR"),
													" TL"
												]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "flex shrink-0 cursor-pointer items-center gap-2 text-xs text-gold",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "radio",
														name: "certificateParcel",
														checked: certificateParcel === item.id,
														onChange: () => setCertificateParcel(item.id)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileBadge, { className: "h-4 w-4" }),
													" Sertifika bu parsele"
												]
											})]
										})
									}, item.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 rounded-xl border border-gold/20 bg-gold/[0.04] p-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold text-gold",
										children: "Tek sertifika kuralı"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-2 text-xs leading-5 text-muted-foreground",
										children: [
											"Siparişte kaç parsel olursa olsun yalnızca seçtiğiniz ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "text-foreground",
												children: certificateParcel
											}),
											" için sertifika talebi oluşturulur."
										]
									})]
								}),
								PHYSICAL[certificateTier] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 rounded-xl border border-gold/20 bg-gold/[0.04] p-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-semibold text-gold",
											children: "FİZİKSEL SERTİFİKA TESLİMATI"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-xs leading-5 text-muted-foreground",
											children: [
												"Seçtiğiniz sertifika ",
												NAMES[certificateTier],
												" paketine ait olduğu için fiziksel sertifika hazırlanır ve verdiğiniz adrese gönderilir."
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-4 grid gap-3 sm:grid-cols-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													value: name,
													onChange: (e) => setName(e.target.value),
													placeholder: "Ad Soyad",
													autoComplete: "name",
													className: "rounded-md border border-border bg-background/40 px-3 py-3 text-sm"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													value: phone,
													onChange: (e) => setPhone(e.target.value),
													placeholder: "Telefon",
													autoComplete: "tel",
													className: "rounded-md border border-border bg-background/40 px-3 py-3 text-sm"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													value: city,
													onChange: (e) => setCity(e.target.value),
													placeholder: "İl",
													autoComplete: "address-level1",
													className: "rounded-md border border-border bg-background/40 px-3 py-3 text-sm"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													value: district,
													onChange: (e) => setDistrict(e.target.value),
													placeholder: "İlçe",
													autoComplete: "address-level2",
													className: "rounded-md border border-border bg-background/40 px-3 py-3 text-sm"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
													value: address,
													onChange: (e) => setAddress(e.target.value),
													placeholder: "Açık teslimat adresi",
													autoComplete: "street-address",
													className: "min-h-24 rounded-md border border-border bg-background/40 px-3 py-3 text-sm sm:col-span-2"
												})
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mt-6 flex cursor-pointer items-start gap-3 text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: accepted,
										onChange: (e) => setAccepted(e.target.checked),
										className: "mt-0.5 accent-current"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Seçtiğim parselleri, sertifika talep ettiğim tek parseli ve satış sözleşmelerine eriştiğimi onaylıyorum." })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									disabled: !accepted || !physicalReady,
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
							className: "panel h-fit p-6 lg:sticky lg:top-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-base",
									children: "SİPARİŞ ÖZETİ"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 space-y-3 text-sm",
									children: [
										[
											"digital",
											"elite",
											"premium"
										].filter((tier) => grouped[tier] > 0).map((tier) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-muted-foreground",
												children: [
													NAMES[tier],
													" × ",
													grouped[tier]
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [(PRICES[tier] * grouped[tier]).toLocaleString("tr-TR"), " TL"] })]
										}, tier)),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-t border-border pt-4 flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: "Toplam"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-display text-2xl text-gold",
												children: [total.toLocaleString("tr-TR"), " TL"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-t border-border pt-4 text-xs text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
													className: "text-foreground",
													children: "Sertifika:"
												}),
												" ",
												certificateParcel
											] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1",
												children: ["Toplam parsel: ", items.length]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-5 space-y-3 text-sm",
									children: [
										"İstediğiniz sayıda sembolik parsel",
										"Farklı paket türlerini aynı siparişte seçebilme",
										"Yalnızca bir parsel için sertifika talebi",
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
