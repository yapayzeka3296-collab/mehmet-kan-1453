import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as createBrowserSupabase, s as useAuth } from "./router-va4RVshJ.mjs";
import { p as ShoppingBag } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-CNhubhFv.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
import { n as TrustBar, t as SECURITY_TRUST } from "./TrustBar-Ci8UbTsR.mjs";
import { t as UserSidebar } from "./UserSidebar-D5Vi_PKO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/siparislerim-BCwZz5zj.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var STATUS = {
	pending: "Beklemede",
	paid: "Ödendi",
	failed: "Başarısız",
	cancelled: "İptal edildi",
	refunded: "İade edildi"
};
function Siparislerim() {
	const { user, loading: authLoading } = useAuth();
	const [orders, setOrders] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let active = true;
		const load = async () => {
			const supabase = createBrowserSupabase();
			if (!supabase) {
				if (active) setOrders([]);
				return;
			}
			const { data } = await supabase.from("orders").select("id, parcel_id, amount, currency, status, provider, provider_reference, created_at, updated_at").eq("user_id", user.id).order("created_at", { ascending: false });
			if (active) setOrders(data ?? []);
		};
		load();
		return () => {
			active = false;
		};
	}, [user?.id]);
	if (authLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "starfield min-h-screen",
		"aria-busy": "true"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/giris",
		replace: true
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserSidebar, { active: "/siparislerim" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl font-bold",
							children: "SİPARİŞLERİM"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: "Geçmiş siparişlerinizi ve ödeme durumlarını takip edin."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "panel mt-6 overflow-hidden",
						children: orders === null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-10 text-center text-sm text-muted-foreground",
							children: "Siparişleriniz hazırlanıyor…"
						}) : orders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-10 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "mx-auto h-12 w-12 text-gold" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-4 font-display text-xl",
									children: "Henüz siparişiniz yok"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mx-auto mt-2 max-w-lg text-sm text-muted-foreground",
									children: "Bu hesap için henüz kaydedilmiş bir sipariş bulunmuyor."
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[720px] text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "border-b border-border text-left text-xs text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-6 py-4",
											children: "Sipariş"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-6 py-4",
											children: "Parsel"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-6 py-4",
											children: "Tarih"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-6 py-4",
											children: "Tutar"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-6 py-4",
											children: "Durum"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: orders.map((order) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-border last:border-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4 font-mono text-xs",
											children: order.id.slice(0, 8).toUpperCase()
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4 font-mono text-xs",
											children: order.parcel_id ? order.parcel_id.slice(0, 8).toUpperCase() : "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4",
											children: new Date(order.created_at).toLocaleDateString("tr-TR")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-6 py-4 font-medium",
											children: [
												Number(order.amount).toLocaleString("tr-TR", {
													minimumFractionDigits: 2,
													maximumFractionDigits: 2
												}),
												" ",
												order.currency
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "rounded-full border border-border px-2.5 py-1 text-xs",
												children: STATUS[order.status] ?? order.status
											})
										})
									]
								}, order.id)) })]
							})
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustBar, { items: SECURITY_TRUST }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Siparislerim as component };
