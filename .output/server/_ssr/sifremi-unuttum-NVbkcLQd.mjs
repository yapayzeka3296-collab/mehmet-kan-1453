import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as supabaseBrowser } from "./router-IKvlUoAf.mjs";
import { A as Mail, B as Info, M as Lock, W as Headphones, ft as ArrowRight, g as ShieldCheck, s as UserLock } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-Ct-Hn9rm.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
import { n as TrustBar, t as SECURITY_TRUST } from "./TrustBar-Ci8UbTsR.mjs";
import { t as hero_city_default } from "./hero-city-CaGzJUSk.mjs";
import { t as globe_default } from "./globe-BhfwGUUe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sifremi-unuttum-NVbkcLQd.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var BADGES = [
	{
		icon: ShieldCheck,
		title: "GÜVENLİ",
		text: "Güvenli şifre sıfırlama"
	},
	{
		icon: Mail,
		title: "HIZLI",
		text: "E-posta ile bağlantı"
	},
	{
		icon: UserLock,
		title: "KORUNAN",
		text: "Hesap bilgileriniz korunur"
	},
	{
		icon: Headphones,
		title: "DESTEK",
		text: "Sorun yaşarsanız iletişime geçin"
	}
];
function getResetRedirectUrl() {
	if (typeof window === "undefined") return "https://myskyparcel.com/sifre-yenile";
	return `${window.location.origin}/sifre-yenile`;
}
function SifremiUnuttum() {
	const [email, setEmail] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [sent, setSent] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)("");
	async function onSubmit(e) {
		e.preventDefault();
		setMessage("");
		const cleanEmail = email.trim().toLowerCase();
		if (!cleanEmail) {
			setMessage("Lütfen kayıtlı e-posta adresinizi girin.");
			return;
		}
		if (!supabaseBrowser) {
			setMessage("Şifre sıfırlama sistemi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.");
			return;
		}
		setLoading(true);
		const { error } = await supabaseBrowser.auth.resetPasswordForEmail(cleanEmail, { redirectTo: getResetRedirectUrl() });
		setLoading(false);
		if (error) {
			console.error("Password reset request failed", error);
			setMessage("İşlem şu anda tamamlanamadı. Lütfen daha sonra tekrar deneyin.");
			return;
		}
		setSent(true);
		setMessage("Eğer bu e-posta adresiyle bir MySkyParcel hesabı varsa, şifre sıfırlama bağlantısı gönderildi. E-posta kutunuzu ve spam klasörünü kontrol edin.");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "relative overflow-hidden",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: hero_city_default,
						alt: "",
						"aria-hidden": true,
						width: 1920,
						height: 1088,
						className: "absolute inset-x-0 bottom-0 h-[65%] w-full object-cover opacity-50"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: globe_default,
						alt: "",
						"aria-hidden": true,
						width: 1024,
						height: 1024,
						className: "pointer-events-none absolute left-[30%] top-0 hidden h-[105%] opacity-40 mix-blend-screen xl:block"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mx-auto grid max-w-[1600px] gap-10 px-4 py-14 lg:grid-cols-2 lg:px-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
									className: "font-display text-4xl leading-tight font-bold sm:text-5xl",
									children: [
										"ŞİFREMİ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-gradient-gold",
											children: "UNUTTUM"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-5 max-w-sm text-sm text-muted-foreground",
									children: "Kayıtlı e-posta adresinizi girin. Hesabınız varsa şifre yenileme bağlantısı gönderilecektir."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-10 flex flex-wrap gap-6",
									children: BADGES.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "w-28 min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(b.icon, { className: "h-7 w-7 text-gold" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-xs font-semibold tracking-[0.06em]",
												children: b.title
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-[11px] text-muted-foreground",
												children: b.text
											})
										]
									}, b.title))
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel min-w-0 p-6 sm:p-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-3xl",
									children: "ŞİFRE SIFIRLAMA"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-sm text-muted-foreground",
									children: "Kayıtlı e-posta adresinizi girin."
								})]
							}), !sent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-8 space-y-5",
								onSubmit,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs text-muted-foreground",
										htmlFor: "mail",
										children: "E-posta Adresiniz"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "mail",
											name: "email",
											type: "email",
											autoComplete: "email",
											required: true,
											value: email,
											onChange: (e) => setEmail(e.target.value),
											placeholder: "ornek@email.com",
											className: "min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-3 rounded-md border border-border bg-background/40 p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-5 w-5 shrink-0 text-info" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "min-w-0 text-sm text-muted-foreground",
											children: "Güvenlik nedeniyle hesap var/yok bilgisini bu ekranda açıklamıyoruz."
										})]
									}),
									message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										role: "alert",
										className: "text-center text-sm text-destructive",
										children: message
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										disabled: loading,
										className: "btn-gold flex w-full items-center justify-center gap-3 rounded-md py-3.5 text-sm disabled:opacity-60",
										children: [loading ? "GÖNDERİLİYOR..." : "ŞİFRE SIFIRLAMA BAĞLANTISI GÖNDER", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-center text-xs text-muted-foreground",
										children: "E-postanızı alamazsanız spam klasörünü kontrol edin."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/giris",
										className: "mx-auto flex w-fit items-center gap-2 rounded-md border border-border px-6 py-3 text-sm transition-colors hover:border-gold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4" }), " Giriş sayfasına dön"]
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 space-y-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "rounded-md border border-green-500/30 bg-green-500/10 p-4 text-center text-sm text-green-500",
										role: "status",
										children: message
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-center text-xs text-muted-foreground",
										children: "Bağlantıya tıklayarak yeni şifrenizi belirleyebilirsiniz."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/giris",
										className: "mx-auto flex w-fit items-center gap-2 rounded-md border border-border px-6 py-3 text-sm transition-colors hover:border-gold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4" }), " Giriş sayfasına dön"]
									})
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustBar, { items: SECURITY_TRUST })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { SifremiUnuttum as component };
