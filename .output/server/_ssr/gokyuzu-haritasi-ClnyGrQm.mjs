import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { o as supabaseBrowser, s as useAuth } from "./router-CIUObXl0.mjs";
import { D as MapPin, w as PackageCheck } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-FsYimahh.mjs";
import { t as CityParcelLivePage } from "./CityParcelLivePage-CgyjzDQl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gokyuzu-haritasi-ClnyGrQm.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var TIER_LABELS = {
	digital: "Dijital",
	elite: "Elit",
	premium: "Premium"
};
function SkyMapPage() {
	const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
	const city = params.get("city") || "istanbul";
	const parcelId = params.get("parcels");
	const { user, loading: authLoading } = useAuth();
	const [purchasedParcel, setPurchasedParcel] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let alive = true;
		async function loadPurchasedParcel() {
			if (!parcelId || !user || !supabaseBrowser) return;
			const { data, error } = await supabaseBrowser.from("parcels").select("id,parcel_number,status,tier,tier_price,price,latitude,longitude,cities(name,code)").eq("id", parcelId).eq("owner_id", user.id).eq("status", "sold").maybeSingle();
			if (!error && data && alive) {
				const cityRelation = Array.isArray(data.cities) ? data.cities[0] ?? null : data.cities;
				setPurchasedParcel({
					id: data.id,
					parcel_number: data.parcel_number,
					status: data.status,
					tier: data.tier,
					tier_price: data.tier_price,
					price: data.price,
					latitude: data.latitude,
					longitude: data.longitude,
					cities: cityRelation
				});
			}
		}
		loadPurchasedParcel();
		return () => {
			alive = false;
		};
	}, [parcelId, user]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-slate-950 text-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CityParcelLivePage, { slug: city }),
			parcelId && !authLoading && purchasedParcel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "mx-auto max-w-[1800px] px-3 pb-8 sm:px-5 lg:px-8",
				"aria-label": "Konumdan açılan satın alınmış parsel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl border border-emerald-300/20 bg-slate-900/90 p-4 shadow-xl sm:p-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[10px] font-semibold uppercase tracking-[.18em] text-emerald-300",
										children: "Satın alınan parsel"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 truncate font-display text-lg",
										children: purchasedParcel.parcel_number
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-white/55",
										children: [
											purchasedParcel.cities?.name ?? "—",
											" · ",
											TIER_LABELS[purchasedParcel.tier],
											" · Sahipliğinizde"
										]
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex shrink-0 items-center gap-2 rounded-lg border border-emerald-300/15 bg-emerald-400/5 px-3 py-2 text-xs text-emerald-200",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4" }), " Konumdan açıldı"]
						})]
					})
				})
			})
		]
	});
}
//#endregion
export { SkyMapPage as component };
