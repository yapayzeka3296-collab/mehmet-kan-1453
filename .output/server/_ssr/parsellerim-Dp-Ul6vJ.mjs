import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, b as useNavigate, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as supabaseBrowser, s as useAuth } from "./router-BxfBKsO2.mjs";
import { A as Lock, G as Gift, H as Headphones, N as List, U as Grid2x2, W as Globe, Z as EllipsisVertical, at as Calendar, l as Star, lt as ArrowRight, m as ShieldCheck, q as FileBadge } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-CU6bbNhr.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
import { n as TrustBar } from "./TrustBar-Ci8UbTsR.mjs";
import { t as UserSidebar } from "./UserSidebar--ATCJCs5.mjs";
import { t as hero_city_default } from "./hero-city-CaGzJUSk.mjs";
import { t as ParcelDetailPanel } from "./ParcelDetailPanel-CpzhYWu5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parsellerim-Dp-Ul6vJ.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var FOOTER_TRUST = [
	{
		icon: Globe,
		title: "81 İL 81 MİLYON PARSEL",
		text: "7 pilot ilde ilk parseller açıldı."
	},
	{
		icon: ShieldCheck,
		title: "SERTİFİKA SİSTEMİ",
		text: "Sertifikalar talep üzerine oluşturulur."
	},
	{
		icon: Lock,
		title: "GÜVENLİ ALTYAPI",
		text: "Sahiplik ve sertifika geçmişi korunur."
	},
	{
		icon: Headphones,
		title: "7/24 DESTEK",
		text: "Sorularınız için bize ulaşabilirsiniz."
	}
];
var TIER_LABELS = {
	digital: "Dijital",
	elite: "Elit",
	premium: "Premium"
};
function Parsellerim() {
	const { user, loading: authLoading } = useAuth();
	const navigate = useNavigate();
	const [parcels, setParcels] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [sortNewest, setSortNewest] = (0, import_react.useState)(true);
	const [viewMode, setViewMode] = (0, import_react.useState)("grid");
	const [selectedParcel, setSelectedParcel] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let mounted = true;
		async function load() {
			if (!supabaseBrowser) {
				if (mounted) {
					setError("Supabase yapılandırması eksik");
					setLoading(false);
				}
				return;
			}
			if (!user) {
				if (!authLoading && mounted) setParcels([]);
				return;
			}
			setLoading(true);
			setError(null);
			try {
				const { data: parcelData, error: parcelError } = await supabaseBrowser.from("parcels").select("id, parcel_number, status, owner_id, price, tier, tier_price, city_id, latitude, longitude, created_at, updated_at, cities(name,code)").eq("owner_id", user.id).eq("status", "sold").order("created_at", { ascending: false }).limit(200);
				if (parcelError) throw parcelError;
				if (!mounted) return;
				setParcels((parcelData ?? []).map((p) => ({
					...p,
					city_name: p.cities?.name,
					city_code: p.cities?.code
				})));
			} catch (err) {
				console.error(err);
				if (mounted) setError("Koleksiyon verileri yüklenirken hata oluştu");
			} finally {
				if (mounted) setLoading(false);
			}
		}
		load();
		return () => {
			mounted = false;
		};
	}, [user, authLoading]);
	(0, import_react.useEffect)(() => {
		if (!selectedParcel) return;
		const handleKeyDown = (event) => {
			if (event.key === "Escape") setSelectedParcel(null);
		};
		document.addEventListener("keydown", handleKeyDown);
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = previousOverflow;
		};
	}, [selectedParcel]);
	const purchasedParcels = (0, import_react.useMemo)(() => [...parcels].sort((a, b) => sortNewest ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime() : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()), [parcels, sortNewest]);
	const goToMap = (parcel) => {
		const citySlug = (parcel.city_name ?? "").toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c").replace(/İ/g, "i").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
		navigate({
			to: "/gokyuzu-haritasi",
			search: {
				city: citySlug,
				parcels: parcel.id,
				lat: String(parcel.latitude),
				lng: String(parcel.longitude)
			}
		});
	};
	if (authLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "starfield min-h-screen",
		"aria-busy": "true"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/giris",
		replace: true
	});
	const summaryCounts = [
		["Satın Alınan Parsel", purchasedParcels.length],
		["Aktif Sahiplik", purchasedParcels.length],
		["Hediye Edilen", 0]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserSidebar, { active: "/parsellerim" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 grid gap-6 xl:grid-cols-[1fr_300px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "panel relative overflow-hidden p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: hero_city_default,
									alt: "",
									"aria-hidden": true,
									loading: "lazy",
									width: 1920,
									height: 1088,
									className: "absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-40 md:block"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
											className: "font-display text-3xl font-bold",
											children: "KOLEKSİYONUM"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-xs text-muted-foreground",
											children: [
												"Ana Sayfa ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mx-2",
													children: "›"
												}),
												" Kullanıcı Paneli ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mx-2",
													children: "›"
												}),
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-gold",
													children: "Koleksiyonum"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 max-w-2xl text-sm text-muted-foreground",
											children: "Burada yalnızca satın aldığınız ve sahipliğinizde bulunan parseller gösterilir."
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate text-sm text-muted-foreground",
									children: [purchasedParcels.length, " satın alınmış parseliniz bulunuyor."]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex shrink-0 items-center gap-2 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden text-muted-foreground sm:inline",
											children: "Sırala:"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: sortNewest ? "new" : "old",
											onChange: (e) => setSortNewest(e.target.value === "new"),
											className: "rounded-md border border-input bg-background px-3 py-2 text-xs outline-none",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "new",
												children: "Satın Alma Tarihi (Yeni → Eski)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "old",
												children: "Satın Alma Tarihi (Eski → Yeni)"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setViewMode("grid"),
											className: `rounded-md border p-2 ${viewMode === "grid" ? "border-gold/50 text-gold" : "border-border"}`,
											"aria-label": "Izgara görünüm",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid2x2, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setViewMode("list"),
											className: `rounded-md border p-2 ${viewMode === "list" ? "border-gold/50 text-gold" : "border-border"}`,
											"aria-label": "Liste görünüm",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "h-4 w-4" })
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: viewMode === "grid" ? "mt-4 grid gap-4" : "mt-4 grid gap-2",
								children: [
									loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: "panel p-4 text-center text-sm text-muted-foreground",
										children: "Satın alınan parseller yükleniyor..."
									}),
									!loading && error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: "panel p-4 text-center text-sm text-destructive",
										children: error
									}),
									!loading && !error && purchasedParcels.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "panel p-8 text-center text-sm text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-display text-lg text-foreground",
												children: "Henüz satın alınmış parseliniz yok."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2",
												children: "Satın aldığınız parseller burada otomatik olarak görünecektir."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/parsel-satin-al",
												className: "btn-gold mt-5 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-[11px]",
												children: ["PARSEL SATIN AL ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
											})
										]
									}),
									!loading && purchasedParcels.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: `panel grid gap-4 p-4 ${viewMode === "grid" ? "md:grid-cols-[280px_1fr]" : "md:grid-cols-[180px_1fr]"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative overflow-hidden rounded-lg",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: "/assets/hero-city-COMI2E0Z.jpg",
												alt: `${p.parcel_number} parseli`,
												loading: "lazy",
												width: 1920,
												height: 1088,
												className: `${viewMode === "grid" ? "h-40" : "h-28"} w-full object-cover opacity-80`
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "absolute left-3 top-3 rounded bg-success px-2 py-0.5 text-[10px] font-bold text-background",
												children: "SATIN ALINDI"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
														className: "flex min-w-0 items-center gap-2 truncate font-display text-xl",
														children: [
															p.parcel_number,
															" ",
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-4 w-4 shrink-0 text-gold" })
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex shrink-0 items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "rounded-full border border-success/40 px-3 py-1 text-[11px] text-success",
															children: "Sahibisiniz"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "h-4 w-4 text-muted-foreground" })]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-2 text-sm text-muted-foreground",
													children: [
														p.city_name ?? "Pilot il",
														" · ",
														TIER_LABELS[p.tier],
														" · ",
														p.parcel_number
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex min-w-0 flex-wrap gap-6 text-xs",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-start gap-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "mt-0.5 h-4 w-4 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "block text-muted-foreground",
																children: "Satın Alma Tarihi"
															}), new Date(p.created_at).toLocaleDateString("tr-TR")] })]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-start gap-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileBadge, { className: "mt-0.5 h-4 w-4 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "block text-muted-foreground",
																children: "Paket"
															}), TIER_LABELS[p.tier]] })]
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex shrink-0 items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
															type: "button",
															onClick: () => void navigate({ to: "/hediyelerim" }),
															className: "inline-flex items-center gap-2 rounded-md border border-gold/40 px-4 py-2.5 text-[11px] text-gold hover:bg-gold/10",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "h-4 w-4" }), " PARSELİ HEDİYE ET"]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
															type: "button",
															onClick: () => setSelectedParcel(p),
															className: "btn-gold inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-[11px]",
															children: ["DETAYLAR ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
														})]
													})]
												})
											]
										})]
									}, p.id))
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid content-start gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "panel p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-xs font-semibold tracking-[0.1em] text-gold",
								children: "KOLEKSİYON ÖZETİ"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 grid gap-3",
								children: summaryCounts.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between border-b border-border pb-3 text-sm last:border-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold",
										children: value
									})]
								}, label))
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "panel p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-xs font-semibold tracking-[0.1em] text-gold",
									children: "SERTİFİKALARIM"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-muted-foreground",
									children: "Sertifikalarınızı ayrı bölümden görüntüleyebilir ve yönetebilirsiniz."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/sertifikalarim",
									className: "mt-4 inline-flex items-center gap-2 text-xs text-gold hover:underline",
									children: ["SERTİFİKALARIMA GİT ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
								})
							]
						})]
					})]
				})]
			}),
			selectedParcel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParcelDetailPanel, {
				parcel: selectedParcel,
				onClose: () => setSelectedParcel(null),
				onLocate: goToMap
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustBar, { items: FOOTER_TRUST }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Parsellerim as component };
