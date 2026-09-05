import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as useAuth } from "./router-C0UD-Ad-.mjs";
import { B as House, F as Layers, G as Gift, K as FileText, ct as Award, i as User, k as LogOut, m as ShieldCheck, st as Bell, u as Sparkles, y as RefreshCw } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/UserSidebar-BnhLMQb-.mjs
var import_jsx_runtime = require_jsx_runtime();
var ITEMS = [
	{
		to: "/panelim",
		label: "Panelim",
		icon: House
	},
	{
		to: "/parsellerim",
		label: "Parsellerim",
		icon: Layers
	},
	{
		to: "/hediyelerim",
		label: "Hediyelerim",
		icon: Gift
	},
	{
		to: "/siparislerim",
		label: "Siparişlerim",
		icon: FileText
	},
	{
		to: "/sertifikalarim",
		label: "Sertifikalarım",
		icon: Award
	},
	{
		to: "/bildirimler",
		label: "Bildirimler",
		icon: Bell
	},
	{
		to: "/profilim",
		label: "Profilim",
		icon: User
	},
	{
		to: "/guvenlik-ayarlari",
		label: "Güvenlik Ayarları",
		icon: ShieldCheck
	}
];
function UserSidebar({ active }) {
	const { signOut } = useAuth();
	const navigate = useNavigate();
	const handleSignOut = async () => {
		if ((await signOut()).success) await navigate({ to: "/" });
	};
	const handleRefresh = () => {
		window.location.reload();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "msp-sidebar-layer relative grid content-start gap-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: "panel p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-2 pb-3 text-xs font-semibold tracking-[0.12em] text-gold",
					children: "KULLANICI PANELİ"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-1",
					children: ITEMS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: item.to,
						className: `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active === item.to ? "border border-gold/50 bg-accent text-gold" : "text-foreground/85 hover:bg-accent hover:text-gold"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate",
							children: item.label
						})]
					}) }, item.to))
				}),
				active === "/panelim" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: handleRefresh,
					className: "mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-foreground/85 hover:bg-accent hover:text-gold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4" }), " Paneli Yenile"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-3 h-px bg-border" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => void handleSignOut(),
					className: "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-foreground/85 hover:bg-accent hover:text-gold",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-4 w-4" }), " Çıkış Yap"]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mx-auto h-10 w-10 text-gold" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 font-display text-base leading-snug",
					children: [
						"GÖKYÜZÜNDE",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"SANA ÖZEL BİR YER"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-muted-foreground",
					children: "Koleksiyonunuzu ve sertifikalarınızı hesabınızdan güvenle yönetin."
				})
			]
		})]
	});
}
//#endregion
export { UserSidebar as t };
