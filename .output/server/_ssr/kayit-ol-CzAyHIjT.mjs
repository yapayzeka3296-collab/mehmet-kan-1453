import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as useAuth } from "./router-CXq3UVUR.mjs";
import { C as Phone, i as User, j as Lock, k as Mail, lt as ArrowRight } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-CwbzZ46g.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
import { n as TrustBar, t as SECURITY_TRUST } from "./TrustBar-Ci8UbTsR.mjs";
import { t as hero_city_default } from "./hero-city-CaGzJUSk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/kayit-ol-CzAyHIjT.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function KayitOl() {
	const { signUp, loading } = useAuth();
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [accepted, setAccepted] = (0, import_react.useState)(false);
	const [kvkkRead, setKvkkRead] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)(null);
	const [success, setSuccess] = (0, import_react.useState)(false);
	async function onSubmit(e) {
		e.preventDefault();
		setMessage(null);
		setSuccess(false);
		if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirm) {
			setMessage("Lütfen tüm alanları doldurun.");
			return;
		}
		if (!/^\+[1-9]\d{9,14}$/.test(phone.trim())) {
			setMessage("Telefon numarasını +905xxxxxxxxx gibi uluslararası formatta girin.");
			return;
		}
		if (password !== confirm) {
			setMessage("Şifreler eşleşmiyor.");
			return;
		}
		if (!accepted) {
			setMessage("Üyelik Sözleşmesi'ni okuduğunuzu ve kabul ettiğinizi onaylamalısınız.");
			return;
		}
		if (!kvkkRead) {
			setMessage("KVKK Aydınlatma Metni'ni okuduğunuzu onaylamalısınız.");
			return;
		}
		const res = await signUp(email.trim(), password, name.trim(), phone.trim());
		if (res.success) {
			setSuccess(true);
			setMessage(res.status === "verification_resent" ? "Doğrulama e-postası yeniden gönderildi. E-postayı doğruladıktan sonra telefonunuza SMS doğrulama kodu gönderilecektir." : "Kayıt başarılı. Önce e-postanızı doğrulayın; ardından yalnızca üyelik aşamasında telefonunuza SMS doğrulama kodu gönderilecektir.");
		} else setMessage(res.error);
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
						loading: "lazy",
						width: 1920,
						height: 1088,
						className: "absolute inset-x-0 bottom-0 h-[70%] w-full object-cover opacity-45"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/30" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mx-auto grid max-w-[1600px] gap-10 px-4 py-14 lg:grid-cols-2 lg:px-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
								className: "font-display text-4xl leading-tight font-bold sm:text-5xl",
								children: [
									"HESABINI",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-gradient-gold",
										children: "OLUŞTUR"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 max-w-md text-sm text-muted-foreground",
								children: "Ücretsiz üye ol, gökyüzünde sana özel parselini seç ve sertifikanı anında e-posta ile al. Telefon numaran yalnızca üyelik doğrulaması için SMS ile doğrulanır."
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel min-w-0 p-6 sm:p-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-center font-display text-3xl",
								children: "KAYIT OL"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-8 space-y-5",
								onSubmit,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs text-muted-foreground",
										htmlFor: "ad",
										children: "Ad Soyad"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "ad",
											name: "name",
											type: "text",
											placeholder: "",
											autoComplete: "name",
											value: name,
											onChange: (e) => setName(e.target.value),
											className: "min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
										})]
									})] }),
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
											placeholder: "",
											autoComplete: "email",
											value: email,
											onChange: (e) => setEmail(e.target.value),
											className: "min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "text-xs text-muted-foreground",
											htmlFor: "telefon",
											children: "Telefon (SMS doğrulama)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												id: "telefon",
												name: "phone",
												type: "tel",
												placeholder: "+905xxxxxxxxx",
												autoComplete: "tel",
												value: phone,
												onChange: (e) => setPhone(e.target.value.replace(/[^+\d]/g, "").slice(0, 16)),
												className: "min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-[10px] text-muted-foreground",
											children: "Örn. +905xxxxxxxxx · SMS yalnızca üyelik doğrulamasında kullanılır."
										})
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs text-muted-foreground",
										htmlFor: "sifre",
										children: "Şifreniz"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "sifre",
											name: "password",
											type: "password",
											placeholder: "",
											autoComplete: "new-password",
											value: password,
											onChange: (e) => setPassword(e.target.value),
											className: "min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs text-muted-foreground",
										htmlFor: "sifre2",
										children: "Şifre Tekrar"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "sifre2",
											name: "password-confirmation",
											type: "password",
											placeholder: "",
											autoComplete: "new-password",
											value: confirm,
											onChange: (e) => setConfirm(e.target.value),
											className: "min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-start gap-2 text-xs text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: accepted,
												onChange: (e) => setAccepted(e.target.checked),
												className: "mt-0.5 accent-[oklch(0.78_0.13_82)]"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/uyelik-sozlesmesi",
												className: "text-gold hover:underline",
												children: "Üyelik Sözleşmesi"
											}), "'ni okudum ve kabul ediyorum."] })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-start gap-2 text-xs text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: kvkkRead,
												onChange: (e) => setKvkkRead(e.target.checked),
												className: "mt-0.5 accent-[oklch(0.78_0.13_82)]"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/kvkk",
												className: "text-gold hover:underline",
												children: "KVKK Aydınlatma Metni"
											}), "'ni okudum ve bilgilendirildim."] })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										disabled: loading,
										className: "btn-gold flex w-full items-center justify-center gap-3 rounded-md py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60",
										children: [loading ? "KAYIT YAPILIYOR..." : "KAYIT OL", !loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
									}),
									message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: `text-center text-sm ${success ? "text-green-500" : "text-destructive"}`,
										role: "status",
										children: message
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-center text-sm text-muted-foreground",
										children: ["Zaten hesabınız var? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/giris",
											className: "text-gold hover:underline",
											children: "Giriş yapın"
										})]
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
export { KayitOl as component };
