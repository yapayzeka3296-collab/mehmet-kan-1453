import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as createBrowserSupabase, c as useAuth } from "./router-CCOvPKz4.mjs";
import { lt as Bell } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-DW5U6wj9.mjs";
import { t as SiteFooter } from "./SiteFooter-DN-Ow7j8.mjs";
import { t as UserSidebar } from "./UserSidebar-mFhlMXAV.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bildirimler-uJ9g-aVH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Bildirimler() {
	const { user, loading: authLoading } = useAuth();
	const [items, setItems] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		let active = true;
		const load = async () => {
			const supabase = createBrowserSupabase();
			if (!supabase) {
				if (active) setLoading(false);
				return;
			}
			const { data } = await supabase.from("user_notifications").select("id,type,title,message,is_read,created_at").eq("user_id", user.id).order("created_at", { ascending: false });
			if (active) {
				setItems(data ?? []);
				setLoading(false);
			}
		};
		load();
		return () => {
			active = false;
		};
	}, [user]);
	const markRead = async (id) => {
		const supabase = createBrowserSupabase();
		if (!supabase) return;
		const { error } = await supabase.from("user_notifications").update({ is_read: true }).eq("id", id).eq("user_id", user?.id ?? "");
		if (!error) setItems((current) => current.map((item) => item.id === id ? {
			...item,
			is_read: true
		} : item));
	};
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserSidebar, { active: "/bildirimler" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-6 w-6 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl font-bold",
							children: "BİLDİRİMLER"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: "Sipariş, sertifika ve hesap bildirimlerinizi takip edin."
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 space-y-3",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "p-8 text-center text-sm text-muted-foreground",
							children: "Bildirimler yükleniyor…"
						}) : items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground",
							children: "Henüz bildiriminiz yok."
						}) : items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => void markRead(item.id),
							className: `w-full rounded-lg border p-4 text-left ${item.is_read ? "border-border/60 opacity-70" : "border-gold/40 bg-gold/5"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", {
									className: "text-sm",
									children: item.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: new Date(item.created_at).toLocaleString("tr-TR")
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: item.message
							})]
						}, item.id))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Bildirimler as component };
