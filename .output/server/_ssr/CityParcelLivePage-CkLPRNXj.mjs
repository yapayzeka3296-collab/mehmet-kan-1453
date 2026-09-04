import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { o as supabaseBrowser, s as useAuth } from "./router-DKiQedrs.mjs";
import { O as MapPin, V as Heart, n as X, p as ShoppingCart, ut as ArrowLeft } from "../_libs/lucide-react.mjs";
import { a as writeParcelCart, i as removeParcelFromCart, r as readParcelCart, t as PARCEL_CART_EVENT } from "./SiteHeader-CJi95Krg.mjs";
import { t as ParcelDetailPanel } from "./ParcelDetailPanel-DzZL9k_u.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CityParcelLivePage-CkLPRNXj.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var TIER_ORDER = [
	"digital",
	"elite",
	"premium"
];
var TIER_LIMITS = {
	digital: 30,
	elite: 22,
	premium: 8
};
var VISIBLE_COUNT = 60;
var COLS = 12;
var ROWS = 5;
var MAP_IMAGE = "/images/cities/turkey-3d-map.png";
var GOLD = "255,211,92";
var SOLD_RED = "248,68,68";
var TIER_COLOR = {
	digital: "34,211,238",
	elite: "168,85,247",
	premium: GOLD
};
var PRICES = {
	digital: 199,
	elite: 499,
	premium: 999
};
var TIER_LABEL = {
	digital: "Dijital",
	elite: "Elit",
	premium: "Premium"
};
function toCartItem(p) {
	return {
		id: p.id,
		parcel_number: p.parcel_number,
		city_name: p.city_name,
		tier: p.tier,
		tier_price: Number(p.tier_price ?? PRICES[p.tier])
	};
}
function toDetailParcel(p) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return {
		id: p.id,
		parcel_number: p.parcel_number,
		status: p.status,
		owner_id: null,
		price: Number(p.tier_price ?? PRICES[p.tier]),
		tier: p.tier,
		tier_price: Number(p.tier_price ?? PRICES[p.tier]),
		city_id: null,
		city_name: p.city_name,
		city_slug: p.city_slug,
		latitude: 0,
		longitude: 0,
		created_at: now,
		updated_at: now
	};
}
async function loadPublicParcels(citySlug) {
	if (!supabaseBrowser) throw new Error("Supabase bağlantısı bulunamadı.");
	const { data, error } = await supabaseBrowser.rpc("parcels_in_view", {
		p_city_slug: citySlug,
		p_min_lat: -90,
		p_min_lng: -180,
		p_max_lat: 90,
		p_max_lng: 180
	});
	if (error) throw error;
	return data ?? [];
}
var GRID_TIERS = (() => {
	const cells = Array.from({ length: VISIBLE_COUNT }, (_, index) => {
		const x = index % COLS;
		const y = Math.floor(index / COLS);
		return {
			index,
			distance: (x - 11 / 2) ** 2 + (y - 2) ** 2
		};
	}).sort((a, b) => a.distance - b.distance);
	const result = Array(VISIBLE_COUNT);
	let offset = 0;
	for (const tier of [
		"premium",
		"elite",
		"digital"
	]) {
		for (const cell of cells.slice(offset, offset + TIER_LIMITS[tier])) result[cell.index] = tier;
		offset += TIER_LIMITS[tier];
	}
	return result;
})();
function buildSlots(rows) {
	const result = Array.from({ length: VISIBLE_COUNT }, () => null);
	for (const tier of TIER_ORDER) {
		const tierRows = rows.filter((p) => p.tier === tier).slice(0, TIER_LIMITS[tier]);
		GRID_TIERS.map((slotTier, index) => slotTier === tier ? index : -1).filter((index) => index >= 0).forEach((index, position) => {
			result[index] = tierRows[position] ?? null;
		});
	}
	return result;
}
function CityParcelLivePage({ slug }) {
	const { user, loading: authLoading } = useAuth();
	const [city, setCity] = (0, import_react.useState)(null);
	const [slots, setSlots] = (0, import_react.useState)([]);
	const [selected, setSelected] = (0, import_react.useState)(() => readParcelCart());
	const [purchasedParcel, setPurchasedParcel] = (0, import_react.useState)(null);
	const [memoryParcelIds, setMemoryParcelIds] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [detailParcel, setDetailParcel] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const syncCart = () => setSelected(readParcelCart());
		syncCart();
		window.addEventListener(PARCEL_CART_EVENT, syncCart);
		window.addEventListener("storage", syncCart);
		return () => {
			window.removeEventListener(PARCEL_CART_EVENT, syncCart);
			window.removeEventListener("storage", syncCart);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		let alive = true;
		async function load() {
			if (authLoading) return;
			setLoading(true);
			setError(null);
			setSlots([]);
			setCity(null);
			setPurchasedParcel(null);
			setMemoryParcelIds(/* @__PURE__ */ new Set());
			setDetailParcel(null);
			try {
				if (!supabaseBrowser) throw new Error("Supabase bağlantısı bulunamadı.");
				const { data: cityData, error: cityError } = await supabaseBrowser.from("cities").select("id,name,slug").eq("slug", slug).eq("is_active", true).maybeSingle();
				if (cityError) throw cityError;
				if (!cityData) throw new Error("İl bulunamadı.");
				if (!alive) return;
				setCity(cityData);
				const existing = readParcelCart();
				setSelected(existing);
				const targetId = new URLSearchParams(window.location.search).get("parcels")?.split(",").map((s) => s.trim()).find(Boolean);
				if (targetId && user) {
					const { data: owned, error: ownedError } = await supabaseBrowser.from("parcels").select("id,parcel_number,status,tier,tier_price,price,city_id,latitude,longitude,cities(name,slug)").eq("id", targetId).eq("owner_id", user.id).eq("status", "sold").maybeSingle();
					if (ownedError) throw ownedError;
					if (owned && alive) {
						const p = owned;
						const ownedCity = p.cities?.[0];
						setPurchasedParcel({
							id: p.id,
							parcel_number: p.parcel_number,
							city_name: ownedCity?.name ?? cityData.name,
							tier: p.tier,
							tier_price: Number(p.tier_price ?? p.price ?? PRICES[p.tier])
						});
					}
				}
				const rows = await loadPublicParcels(slug);
				if (!alive) return;
				setSlots(buildSlots(rows));
				const parcelIds = rows.map((p) => p.id);
				if (parcelIds.length) {
					const { data: publicMemories, error: publicMemoryError } = await supabaseBrowser.from("parcel_memories").select("parcel_id").eq("is_public", true).in("parcel_id", parcelIds);
					if (!publicMemoryError && alive) setMemoryParcelIds(new Set((publicMemories ?? []).map((row) => row.parcel_id)));
				}
			} catch (e) {
				if (alive) setError(e instanceof Error ? e.message : "Parseller yüklenemedi.");
			} finally {
				if (alive) setLoading(false);
			}
		}
		load();
		return () => {
			alive = false;
		};
	}, [
		slug,
		user,
		authLoading
	]);
	const selectedIds = (0, import_react.useMemo)(() => new Set(selected.map((p) => p.id)), [selected]);
	const total = selected.reduce((sum, p) => sum + Number(p.tier_price ?? 0), 0);
	const soldCount = slots.filter((p) => p?.status === "sold").length;
	const soldPercent = Math.round(soldCount / VISIBLE_COUNT * 100);
	const toggleParcel = (parcel) => {
		if (parcel.status !== "available") return;
		if (selectedIds.has(parcel.id)) {
			const next = selected.filter((item) => item.id !== parcel.id);
			setSelected(next);
			removeParcelFromCart(parcel.id);
			return;
		}
		const item = toCartItem(parcel);
		const next = [...selected, item];
		setSelected(next);
		writeParcelCart(next);
	};
	const buy = () => {
		if (authLoading || selected.length === 0) return;
		const ids = selected.map((p) => p.id).join(",");
		window.location.href = user ? `/parsel-satin-al?parcels=${ids}` : `/giris?redirect=${encodeURIComponent(`/parsel-satin-al?parcels=${ids}`)}`;
	};
	const legend = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-3 text-[11px] text-white/70",
		children: [TIER_ORDER.map((tier) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex items-center gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "h-2.5 w-2.5 rounded-full",
				style: {
					backgroundColor: `rgb(${TIER_COLOR[tier]})`,
					boxShadow: `0 0 7px rgba(${TIER_COLOR[tier]},.75)`
				}
			}), TIER_LABEL[tier]]
		}, tier)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex items-center gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_7px_rgba(248,68,68,.65)]" }), "Satıldı"]
		})]
	});
	if (!city) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-4xl p-8 text-center text-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold",
				children: loading ? "Harita hazırlanıyor…" : "İl bulunamadı"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-red-300",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center justify-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "/turkiye-haritasi",
					className: "inline-flex items-center gap-2 text-cyan-300",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Türkiye haritasına dön"]
				}), legend]
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-[1800px] px-3 py-4 text-white sm:px-5 lg:px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: "/turkiye-haritasi",
				className: "inline-flex items-center gap-2 text-sm text-cyan-200/80",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Türkiye haritasına dön"]
			}), legend]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "overflow-hidden rounded-3xl border border-cyan-200/20 bg-slate-900/90 shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-h-[380px] overflow-hidden bg-[#020914] sm:min-h-[650px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: MAP_IMAGE,
							alt: "Türkiye gökyüzü parsel haritası",
							width: "1600",
							height: "1000",
							decoding: "async",
							fetchPriority: "high",
							className: "pointer-events-none absolute inset-0 z-0 h-full w-full object-contain opacity-90"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_45%,rgba(30,150,220,.22),transparent_42%),linear-gradient(145deg,rgba(2,7,17,.55),rgba(7,26,45,.18),rgba(1,4,11,.55)]" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pointer-events-auto absolute inset-4 z-[100] grid gap-1.5 sm:inset-8",
							style: {
								gridTemplateColumns: `repeat(${COLS},minmax(0,1fr))`,
								gridTemplateRows: `repeat(${ROWS},minmax(0,1fr))`,
								touchAction: "manipulation",
								perspective: "1200px",
								transform: "perspective(1200px) rotateX(7deg)",
								transformOrigin: "50% 100%"
							},
							children: Array.from({ length: VISIBLE_COUNT }, (_, i) => {
								const p = slots[i];
								if (!p) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none rounded-sm border border-white/5 bg-white/[0.01]" }, `empty-${i}`);
								const sold = p.status === "sold";
								const isSelected = selectedIds.has(p.id);
								const hasMemory = memoryParcelIds.has(p.id);
								const rgb = isSelected ? GOLD : sold ? SOLD_RED : TIER_COLOR[p.tier];
								const borderRgb = isSelected ? "255,225,120" : rgb;
								const fill = isSelected ? "rgba(255,211,92,.48)" : sold ? "rgba(248,68,68,.30)" : `rgba(${rgb},.10)`;
								const glow = isSelected ? "0 0 16px rgba(255,211,92,1),0 0 38px rgba(255,211,92,.95),0 0 80px rgba(255,211,92,.45),inset 0 0 26px rgba(255,225,135,.95)" : sold ? "0 0 3px rgba(248,68,68,.9),0 0 12px rgba(248,68,68,.45),inset 0 0 5px rgba(248,68,68,.35)" : `0 0 2px rgba(255,255,255,.8),0 0 7px rgba(${rgb},.9),0 0 18px rgba(${rgb},.55),inset 0 0 3px rgba(${rgb},.7)`;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									"aria-disabled": sold,
									onClick: (event) => {
										event.preventDefault();
										event.stopPropagation();
										toggleParcel(p);
									},
									className: `group relative z-[110] block h-full w-full min-h-0 min-w-0 select-none rounded-sm border p-0 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-200 ${sold ? "cursor-not-allowed disabled:hover:brightness-100" : "cursor-pointer hover:brightness-150 active:scale-95"}`,
									"aria-pressed": isSelected,
									"aria-label": `${p.parcel_number} parseli ${sold ? "satıldı" : isSelected ? "seçildi, kaldır" : "seç"}`,
									style: {
										WebkitTapHighlightColor: "transparent",
										WebkitAppearance: "none",
										borderColor: `rgba(${borderRgb},1)`,
										backgroundColor: fill,
										boxShadow: glow,
										touchAction: "manipulation",
										pointerEvents: "auto",
										transform: isSelected ? "scale(1.018)" : void 0
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "pointer-events-none absolute inset-[8%] rounded-sm",
											style: {
												background: isSelected ? "linear-gradient(135deg,rgba(255,248,196,.42),rgba(255,193,7,.16))" : sold ? "linear-gradient(135deg,rgba(248,68,68,.22),rgba(127,29,29,.16))" : `linear-gradient(135deg,rgba(${rgb},.10),rgba(${rgb},.025))`,
												border: isSelected ? "1px solid rgba(255,244,176,.35)" : sold ? "1px solid rgba(248,68,68,.35)" : `1px solid rgba(${rgb},.28)`
											}
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `pointer-events-none absolute inset-0 flex items-center justify-center font-semibold ${isSelected ? "text-[7px] text-slate-950 sm:text-[10px]" : sold ? "text-[6px] text-red-100 sm:text-[9px]" : "text-[6px] text-white/90 sm:text-[9px]"}`,
											children: p.parcel_number
										}),
										sold && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-red-600/80 px-1 py-px text-[5px] font-black uppercase tracking-wide text-white sm:text-[6px]",
											children: "SATILDI"
										}),
										hasMemory && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "group/memory absolute left-1/2 top-1/2 z-[160] flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center",
											role: "button",
											tabIndex: 0,
											"aria-label": `${p.parcel_number} parselindeki hatırayı gör`,
											onClick: (event) => {
												event.preventDefault();
												event.stopPropagation();
												setDetailParcel(toDetailParcel(p));
											},
											onKeyDown: (event) => {
												if (event.key === "Enter" || event.key === " ") {
													event.preventDefault();
													event.stopPropagation();
													setDetailParcel(toDetailParcel(p));
												}
											},
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "relative flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,.95)]",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, {
													className: "h-5 w-5",
													fill: "currentColor",
													strokeWidth: 2.2
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-emerald-300/20 bg-[#071a2d]/95 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-200 opacity-0 shadow-lg transition-opacity duration-150 group-hover/memory:opacity-100",
													children: "Hatırayı gör"
												})]
											})
										}),
										isSelected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "pointer-events-none absolute -top-2 left-1/2 z-[130] h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white/90 bg-amber-300 shadow-[0_0_16px_rgba(255,211,92,1)] sm:-top-3 sm:h-5 sm:w-5",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-full w-full p-[2px] text-slate-950" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "pointer-events-none absolute left-1/2 top-1/2 z-[130] -translate-x-1/2 translate-y-[115%] whitespace-nowrap rounded-full border border-amber-100/80 bg-slate-950/90 px-2 py-0.5 text-[7px] font-bold uppercase tracking-[.12em] text-amber-100 shadow-[0_0_14px_rgba(255,211,92,.65)] sm:text-[8px]",
												children: ["MY PARSEL · ", p.parcel_number]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "pointer-events-none absolute inset-0 animate-pulse rounded-sm",
												style: { boxShadow: "inset 0 0 22px rgba(255,221,110,.95),0 0 34px rgba(255,211,92,.58)" }
											})
										] })
									]
								}, p.id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-none absolute bottom-5 left-5 z-20",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs uppercase tracking-[.2em] text-cyan-200/70",
									children: "MySkyParcel · Türkiye Gökyüzü Parsel Haritası"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-1 text-3xl font-bold",
									children: city.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-white/70",
									children: "Dışta 30 Dijital · iç halkada 22 Elit · merkezde 8 Premium."
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 p-4 sm:grid-cols-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-cyan-300/15 bg-slate-950/60 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-white/45",
								children: "Ekrandaki parsel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xl font-bold text-cyan-200",
								children: slots.filter(Boolean).length
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-red-400/25 bg-red-950/20 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-red-200/60",
								children: "Satılan"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xl font-bold text-red-400",
								children: [
									soldCount,
									" / ",
									VISIBLE_COUNT,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm",
										children: [
											"(%",
											soldPercent,
											")"
										]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-amber-300/15 bg-slate-950/60 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-white/45",
								children: "Seçilen"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xl font-bold text-amber-200",
								children: selected.length
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-emerald-300/15 bg-slate-950/60 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-white/45",
								children: "Veri durumu"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-semibold text-emerald-300",
								children: loading ? "Yükleniyor…" : "Canlı"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: buy,
							disabled: !selected.length || authLoading,
							className: "inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4" }),
								" Satın almaya devam et · ",
								total.toLocaleString("tr-TR"),
								" ₺"
							]
						})
					]
				}),
				(selected.length > 0 || purchasedParcel) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-t border-cyan-200/10 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-sm font-semibold uppercase tracking-[.16em] text-cyan-200",
							children: "Parsel listesi"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs text-white/45",
							children: [selected.length + (purchasedParcel ? 1 : 0), " kayıt"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-2",
						children: [purchasedParcel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 rounded-xl border border-emerald-300/30 bg-emerald-950/20 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 shrink-0 text-emerald-300" }), purchasedParcel.parcel_number]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-white/45",
									children: [
										purchasedParcel.city_name,
										" · ",
										TIER_LABEL[purchasedParcel.tier]
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-semibold text-emerald-300",
								children: "Satın alındı"
							})]
						}), selected.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 rounded-xl border border-amber-300/20 bg-slate-950/55 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "h-2.5 w-2.5 shrink-0 rounded-full",
										style: { backgroundColor: `rgb(${TIER_COLOR[item.tier]})` }
									}), item.parcel_number]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-white/45",
									children: [
										item.city_name ?? city.name,
										" · ",
										TIER_LABEL[item.tier]
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm font-semibold text-amber-200",
									children: [item.tier_price.toLocaleString("tr-TR"), " TL"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => removeParcelFromCart(item.id),
									"aria-label": `${item.parcel_number} parselini kaldır`,
									className: "rounded-full p-1.5 text-white/45 hover:bg-red-500/10 hover:text-red-300",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
								})]
							})]
						}, item.id))]
					})]
				})
			]
		})]
	}), detailParcel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParcelDetailPanel, {
		parcel: detailParcel,
		onClose: () => setDetailParcel(null)
	})] });
}
//#endregion
export { CityParcelLivePage as t };
