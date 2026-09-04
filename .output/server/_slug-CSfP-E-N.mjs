import { i as __toESM } from "./_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "./_libs/react+tanstack__react-query.mjs";
import { c as supabaseBrowser, l as useAuth, t as Route$1 } from "./_ssr/router-C83ckKHJ.mjs";
import { ft as ArrowLeft, p as ShoppingCart } from "./_libs/lucide-react.mjs";
import { a as writeParcelCart, n as SiteHeader, r as readParcelCart } from "./_ssr/SiteHeader-DHMkcomS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-CSfP-E-N.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var TIER_COUNTS = {
	digital: 30,
	elite: 22,
	premium: 8
};
var TIER_COLOR = {
	digital: "85,201,255",
	elite: "183,124,255",
	premium: "246,196,83"
};
var PRICE = {
	digital: 199,
	elite: 499,
	premium: 999
};
var COLS = 40;
var ROWS = 25;
var SOLD_PER_CITY = 6;
function buildSlots() {
	const result = [];
	for (let y = 2; y < 23; y += 3) for (let x = 1; x < 39; x += 3) result.push({
		x,
		y
	});
	return result.slice(0, 60);
}
var VISIBLE_SLOTS = buildSlots();
var CENTER_X = 39 / 2;
var CENTER_Y = 12;
var TIER_SLOTS = (() => {
	const ranked = [...VISIBLE_SLOTS].sort((a, b) => {
		return (a.x - CENTER_X) ** 2 + (a.y - CENTER_Y) ** 2 - ((b.x - CENTER_X) ** 2 + (b.y - CENTER_Y) ** 2);
	});
	return {
		premium: ranked.slice(0, 8),
		elite: ranked.slice(8, 30),
		digital: ranked.slice(30, 60)
	};
})();
function cartItem(p) {
	return {
		id: p.id,
		parcel_number: p.parcel_number,
		city_name: p.city_name,
		tier: p.tier,
		tier_price: Number(p.tier_price ?? PRICE[p.tier])
	};
}
function normalizeCityParcels(rows) {
	const byTier = {
		digital: rows.filter((p) => p.tier === "digital"),
		elite: rows.filter((p) => p.tier === "elite"),
		premium: rows.filter((p) => p.tier === "premium")
	};
	const selected = Object.keys(TIER_COUNTS).flatMap((tier) => byTier[tier].slice(0, TIER_COUNTS[tier]));
	const soldIds = new Set(selected.filter((p) => p.status === "sold").map((p) => p.id));
	if (soldIds.size < SOLD_PER_CITY) for (const parcel of selected) {
		if (soldIds.size >= SOLD_PER_CITY) break;
		if (parcel.status === "available") soldIds.add(parcel.id);
	}
	return selected.map((parcel) => soldIds.has(parcel.id) ? {
		...parcel,
		status: "sold"
	} : parcel);
}
function SkyBackground() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-hidden": true,
		className: "pointer-events-none absolute inset-0 bg-[#020914]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(42,150,220,.28),transparent_35%),radial-gradient(circle_at_75%_75%,rgba(126,70,210,.18),transparent_30%),linear-gradient(145deg,#020711,#071a2d_52%,#01040b)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 opacity-65",
				style: {
					backgroundImage: "radial-gradient(circle,rgba(255,255,255,.85) .7px,transparent .9px)",
					backgroundSize: "29px 29px"
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 opacity-60",
				style: {
					backgroundImage: "linear-gradient(rgba(76,224,255,.24) 1px,transparent 1px),linear-gradient(90deg,rgba(76,224,255,.24) 1px,transparent 1px)",
					backgroundSize: "32px 32px"
				}
			})
		]
	});
}
function ParcelLines({ parcels, selectedIds, onToggle }) {
	const byTier = (0, import_react.useMemo)(() => ({
		digital: parcels.filter((p) => p.tier === "digital"),
		elite: parcels.filter((p) => p.tier === "elite"),
		premium: parcels.filter((p) => p.tier === "premium")
	}), [parcels]);
	const slotParcel = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		Object.keys(TIER_SLOTS).forEach((tier) => TIER_SLOTS[tier].forEach((slot, index) => {
			const parcel = byTier[tier][index];
			if (parcel) map.set(`${slot.x}:${slot.y}`, parcel);
		}));
		return map;
	}, [byTier]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 grid touch-manipulation",
		style: {
			gridTemplateColumns: `repeat(${COLS},minmax(0,1fr))`,
			gridTemplateRows: `repeat(${ROWS},minmax(0,1fr))`
		},
		"aria-label": "Gökyüzü parsel çizgileri",
		children: VISIBLE_SLOTS.map((slot) => {
			const p = slotParcel.get(`${slot.x}:${slot.y}`);
			if (!p) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "border border-cyan-200/10",
				"aria-hidden": true
			}, `${slot.x}:${slot.y}`);
			const selected = selectedIds.has(p.id);
			const sold = p.status === "sold";
			const rgb = TIER_COLOR[p.tier];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled: sold || p.status === "reserved",
				"aria-label": `${p.parcel_number} ${p.tier}${sold ? " · Satıldı" : ""}`,
				title: `${p.parcel_number} · ${p.tier}${sold ? " · Satıldı" : ""}`,
				onClick: (e) => {
					e.stopPropagation();
					onToggle(p);
				},
				className: "relative min-h-0 min-w-0 border transition-[background,border,box-shadow] duration-100 disabled:cursor-not-allowed",
				style: {
					borderColor: sold ? "rgba(248,113,113,.92)" : selected ? "rgba(255,244,176,.98)" : `rgba(${rgb},.55)`,
					background: sold ? "rgba(239,68,68,.20)" : selected ? "rgba(255,211,92,.48)" : `rgba(${rgb},.055)`,
					boxShadow: sold ? "inset 0 0 0 1px rgba(248,113,113,.32),0 0 7px rgba(239,68,68,.24)" : selected ? "inset 0 0 0 1px rgba(255,244,176,.95),0 0 12px rgba(255,211,92,.75)" : `inset 0 0 0 1px rgba(${rgb},.08)`
				},
				children: [sold && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pointer-events-none absolute inset-0 flex items-center justify-center text-[7px] font-bold uppercase tracking-wide text-red-200",
					children: "SATILDI"
				}), selected && !sold && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-slate-950/95 px-1.5 py-0.5 text-[8px] font-semibold text-white shadow-lg",
					children: p.parcel_number
				})]
			}, p.id);
		})
	});
}
function SkyParcelCityMapPage({ slug }) {
	const { user, loading: authLoading } = useAuth();
	const [city, setCity] = (0, import_react.useState)(null);
	const [parcels, setParcels] = (0, import_react.useState)([]);
	const [selectedIds, setSelectedIds] = (0, import_react.useState)(() => new Set(readParcelCart().map((p) => p.id)));
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let alive = true;
		const loadCity = async () => {
			if (!supabaseBrowser) return;
			const { data } = await supabaseBrowser.from("cities").select("id,name,slug").eq("slug", slug).eq("is_active", true).maybeSingle();
			if (alive) setCity(data);
		};
		loadCity();
		return () => {
			alive = false;
		};
	}, [slug]);
	const loadWindow = async (citySlug) => {
		if (!supabaseBrowser) return [];
		const { data, error } = await supabaseBrowser.rpc("parcels_in_view", {
			p_city_slug: citySlug,
			p_min_lat: -90,
			p_min_lng: -180,
			p_max_lat: 90,
			p_max_lng: 180
		});
		if (error) throw error;
		return normalizeCityParcels(data ?? []);
	};
	(0, import_react.useEffect)(() => {
		if (!city) return;
		let alive = true;
		setLoading(true);
		loadWindow(city.slug).then((rows) => {
			if (!alive) return;
			setParcels(rows);
			setLoading(false);
		}).catch(() => {
			if (alive) setLoading(false);
		});
		return () => {
			alive = false;
		};
	}, [city?.slug]);
	const visible = (0, import_react.useMemo)(() => parcels.slice(0, VISIBLE_SLOTS.length), [parcels]);
	const soldCount = (0, import_react.useMemo)(() => visible.filter((p) => p.status === "sold").length, [visible]);
	const selectParcel = (p) => {
		if (p.status !== "available") return;
		setSelectedIds((prev) => {
			const next = new Set(prev);
			const cart = readParcelCart();
			if (next.has(p.id)) {
				next.delete(p.id);
				writeParcelCart(cart.filter((item) => item.id !== p.id));
			} else {
				next.add(p.id);
				if (!cart.some((x) => x.id === p.id)) writeParcelCart([...cart, cartItem(p)]);
			}
			return next;
		});
	};
	const selected = (0, import_react.useMemo)(() => readParcelCart().filter((p) => selectedIds.has(p.id)), [selectedIds]);
	const total = selected.reduce((sum, p) => sum + Number(p.tier_price), 0);
	const buy = () => {
		if (authLoading || !selected.length) return;
		const ids = selected.map((p) => p.id).join(",");
		window.location.href = user ? `/parsel-satin-al?parcels=${ids}` : `/giris?redirect=${encodeURIComponent(`/parsel-satin-al?parcels=${ids}`)}`;
	};
	if (!city) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-4xl p-8 text-center text-white",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-bold",
			children: loading ? "Gökyüzü haritası hazırlanıyor…" : "İl bulunamadı"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
			href: "/turkiye-haritasi",
			className: "mt-4 inline-flex items-center gap-2 text-cyan-300",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Türkiye haritasına dön"]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto max-w-[1800px] px-3 py-4 sm:px-5 lg:px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
				href: "/turkiye-haritasi",
				className: "inline-flex items-center gap-2 text-sm text-cyan-200/80",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Türkiye haritası"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "overflow-hidden rounded-3xl border border-cyan-200/15 bg-slate-900/70 shadow-2xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative min-h-[430px] overflow-hidden bg-[#020914] sm:min-h-[620px]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkyBackground, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParcelLines, {
							parcels: visible,
							selectedIds,
							onToggle: selectParcel
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 z-30 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/10" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-none absolute bottom-5 left-5 z-40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs uppercase tracking-[.2em] text-cyan-200/70",
									children: "MySkyParcel · Gökyüzü Parsel Haritası"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-1 text-3xl font-bold",
									children: city.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-white/60",
									children: ["30 Dijital · 22 Elit · 8 Premium · ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-red-300",
										children: [soldCount, " satıldı"]
									})]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 p-3 sm:grid-cols-3 sm:p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-cyan-300/15 bg-slate-950/55 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-white/45",
								children: "Ekrandaki parsel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xl font-semibold text-cyan-200",
								children: visible.length
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-red-400/15 bg-slate-950/55 p-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-white/45",
								children: "Satılan parsel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xl font-semibold text-red-300",
								children: [soldCount, " / 60"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: buy,
							disabled: !selected.length || authLoading,
							className: "inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4" }),
								" Satın almaya devam et · ",
								total.toLocaleString("tr-TR"),
								" ₺"
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-3 border-t border-white/10 px-3 py-3 text-xs text-white/55 sm:px-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "● Dijital 30" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "● Elit 22" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "● Premium 8" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-red-300",
							children: ["● Satıldı ", soldCount]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: loading ? "Parseller yükleniyor…" : "Hazır" })
					]
				})
			]
		})]
	});
}
function CityPage() {
	const { slug } = Route$1.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-slate-950 text-white",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkyParcelCityMapPage, { slug })]
	});
}
//#endregion
export { CityPage as component };
