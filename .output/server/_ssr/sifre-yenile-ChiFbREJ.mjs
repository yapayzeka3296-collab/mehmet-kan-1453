import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as supabaseBrowser } from "./router-CG9ApP6x.mjs";
import { dt as ArrowRight, h as ShieldCheck, j as Lock } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-44a8THSy.mjs";
import { t as SiteFooter } from "./SiteFooter-DN-Ow7j8.mjs";
import { n as TrustBar, t as SECURITY_TRUST } from "./TrustBar-DFWcLzLx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sifre-yenile-ChiFbREJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SifreYenile() {
	useNavigate();
	const [ready, setReady] = (0, import_react.useState)(false);
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	const [success, setSuccess] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!supabaseBrowser) {
			setReady(false);
			return;
		}
		let active = true;
		const { data } = supabaseBrowser.auth.onAuthStateChange((event) => {
			if (!active) return;
			if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
		});
		supabaseBrowser.auth.getSession().then(({ data: sessionData }) => {
			if (active && sessionData.session) setReady(true);
		});
		return () => {
			active = false;
			data.subscription.unsubscribe();
		};
	}, []);
	async function onSubmit(e) {
		e.preventDefault();
		setMessage("");
		setSuccess(false);
		if (!supabaseBrowser || !ready) {
			setMessage("Şifre yenileme bağlantınız geçersiz veya süresi dolmuş olabilir. Lütfen yeni bir bağlantı isteyin.");
			return;
		}
		if (newPassword.length < 10) {
			setMessage("Yeni şifre en az 10 karakter olmalıdır.");
			return;
		}
		if (newPassword !== confirmPassword) {
			setMessage("Şifreler eşleşmiyor.");
			return;
		}
		setLoading(true);
		const { error } = await supabaseBrowser.auth.updateUser({ password: newPassword });
		setLoading(false);
		if (error) {
			setMessage("Şifre güncellenemedi. Lütfen yeni bir sıfırlama bağlantısı isteyin.");
			return;
		}
		setSuccess(true);
		setMessage("Şifreniz başarıyla yenilendi.");
		await supabaseBrowser.auth.signOut({ scope: "global" });
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "relative overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative mx-auto max-w-2xl px-4 py-16 lg:px-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel p-6 sm:p-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mx-auto h-8 w-8 text-gold" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "mt-4 font-display text-3xl",
										children: "ŞİFRE YENİLE"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm text-muted-foreground",
										children: "Yeni şifrenizi belirleyin. Güvenlik için en az 10 karakter kullanın."
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-8 space-y-5",
								onSubmit,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "Yeni Şifre"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "password",
												autoComplete: "new-password",
												required: true,
												minLength: 10,
												value: newPassword,
												onChange: (e) => setNewPassword(e.target.value),
												className: "min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "Yeni Şifre Tekrar"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "password",
												autoComplete: "new-password",
												required: true,
												minLength: 10,
												value: confirmPassword,
												onChange: (e) => setConfirmPassword(e.target.value),
												className: "min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
											})]
										})]
									}),
									message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										role: "status",
										className: success ? "text-center text-sm text-green-500" : "text-center text-sm text-destructive",
										children: message
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										disabled: loading || success,
										className: "btn-gold flex w-full items-center justify-center gap-3 rounded-md py-3.5 text-sm disabled:opacity-60",
										children: [loading ? "GÜNCELLENİYOR..." : "ŞİFREYİ GÜNCELLE", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/giris",
										className: "mx-auto flex w-fit items-center gap-2 rounded-md border border-border px-6 py-3 text-sm transition-colors hover:border-gold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4" }), " Giriş sayfasına dön"]
									})
								]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustBar, { items: SECURITY_TRUST })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { SifreYenile as component };
