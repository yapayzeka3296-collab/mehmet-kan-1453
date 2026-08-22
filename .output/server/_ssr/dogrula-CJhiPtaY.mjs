import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as useAuth } from "./router-CtoA_F17.mjs";
import { E as LoaderCircle, X as CircleX, Z as CircleCheck } from "../_libs/lucide-react.mjs";
import { n as SiteFooter, r as SiteHeader } from "./SiteFooter-Bmry0A3s.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dogrula-CJhiPtaY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Dogrula() {
	const { user, loading } = useAuth();
	const [linkError, setLinkError] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const params = new URLSearchParams(window.location.search);
		const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
		setLinkError(Boolean(params.get("error") || params.get("error_code") || params.get("error_description") || hash.get("error") || hash.get("error_code") || hash.get("error_description")));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield flex min-h-screen flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex flex-1 items-center justify-center px-4 py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "panel w-full max-w-xl p-8 text-center sm:p-12",
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
							className: "mx-auto h-12 w-12 animate-spin text-gold",
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-6 font-display text-3xl",
							children: "DOĞRULAMA KONTROL EDİLİYOR"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-muted-foreground",
							children: "E-posta doğrulama sonucunuz kontrol ediliyor. Lütfen sayfayı kapatmayın."
						})
					] }) : Boolean(user) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
							className: "mx-auto h-14 w-14 text-green-500",
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-6 font-display text-3xl",
							children: "E-POSTANIZ DOĞRULANDI"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-muted-foreground",
							children: user?.email ? `${user.email} adresiniz başarıyla doğrulandı.` : "E-posta adresiniz başarıyla doğrulandı."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/panelim",
								className: "btn-gold rounded-md px-6 py-3 text-sm",
								children: "PANELİME GİT"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/giris",
								className: "rounded-md border border-input px-6 py-3 text-sm",
								children: "GİRİŞ SAYFASI"
							})]
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, {
							className: "mx-auto h-14 w-14 text-destructive",
							"aria-hidden": true
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-6 font-display text-3xl",
							children: "DOĞRULAMA BAŞARISIZ"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-muted-foreground",
							children: linkError ? "Doğrulama bağlantısı geçersiz veya süresi dolmuş. Yeni doğrulama e-postası isteyin." : "Doğrulama bağlantısı işlenemedi. Yeni doğrulama e-postası isteyin."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/kayit-ol",
								className: "btn-gold inline-flex rounded-md px-6 py-3 text-sm",
								children: "KAYIT SAYFASINA DÖN"
							})
						})
					] })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Dogrula as component };
