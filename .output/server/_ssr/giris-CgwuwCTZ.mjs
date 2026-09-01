import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as supabaseBrowser } from "./router-CCOvPKz4.mjs";
import { F as Layers, W as Globe, X as EyeOff, Y as Eye, dt as ArrowRight, h as ShieldCheck, j as Lock, k as Mail, u as Star } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-DW5U6wj9.mjs";
import { t as SiteFooter } from "./SiteFooter-DN-Ow7j8.mjs";
import { n as TrustBar, t as SECURITY_TRUST } from "./TrustBar-DFWcLzLx.mjs";
import { t as hero_city_default } from "./hero-city-CaGzJUSk.mjs";
import { t as globe_default } from "./globe-BhfwGUUe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/giris-CgwuwCTZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FEATURES = [
	{
		icon: Globe,
		big: "81 MİLYON",
		label: "Toplam Gökyüzü Parseli"
	},
	{
		icon: Layers,
		big: "10 Katman",
		label: "Her İl İçin"
	},
	{
		icon: ShieldCheck,
		big: "1.000 Sektör",
		label: "Her İl İçin"
	},
	{
		icon: Lock,
		big: "1.000.000 Parsel",
		label: "Her İl İçin"
	}
];
function getSafeRedirect() {
	if (typeof window === "undefined") return "/ana-sayfa";
	const value = new URLSearchParams(window.location.search).get("redirect");
	if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/ana-sayfa";
	return value;
}
function getOAuthRedirectUrl() {
	if (typeof window === "undefined") return "https://myskyparcel.com/giris";
	return `${window.location.origin}/giris?redirect=${encodeURIComponent(getSafeRedirect())}`;
}
function GirisPage() {
	const navigate = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [oauthLoading, setOauthLoading] = (0, import_react.useState)(null);
	const [message, setMessage] = (0, import_react.useState)("");
	const [mfaRequired, setMfaRequired] = (0, import_react.useState)(false);
	const [mfaFactorId, setMfaFactorId] = (0, import_react.useState)(null);
	const [mfaChallengeId, setMfaChallengeId] = (0, import_react.useState)(null);
	const [mfaCode, setMfaCode] = (0, import_react.useState)("");
	const [mfaBusy, setMfaBusy] = (0, import_react.useState)(false);
	async function beginMfaIfRequired() {
		if (!supabaseBrowser) return false;
		const { data: aal, error: aalError } = await supabaseBrowser.auth.mfa.getAuthenticatorAssuranceLevel();
		if (aalError) {
			setMessage("Güvenlik doğrulaması başlatılamadı. Lütfen tekrar deneyin.");
			return true;
		}
		if (aal?.nextLevel !== "aal2" || aal.currentLevel === "aal2") return false;
		const { data: factors, error: factorError } = await supabaseBrowser.auth.mfa.listFactors();
		if (factorError) {
			setMessage("İki adımlı doğrulama durumu alınamadı.");
			return true;
		}
		const factor = (factors?.totp ?? []).find((item) => item.status === "verified");
		if (!factor) {
			setMessage("Hesabınızda doğrulanmış iki adımlı doğrulama faktörü bulunamadı. Güvenlik ayarlarından MFA durumunu kontrol edin.");
			return true;
		}
		const { data: challenge, error: challengeError } = await supabaseBrowser.auth.mfa.challenge({ factorId: factor.id });
		if (challengeError || !challenge) {
			setMessage("İki adımlı doğrulama başlatılamadı.");
			return true;
		}
		setMfaFactorId(factor.id);
		setMfaChallengeId(challenge.id);
		setMfaCode("");
		setMfaRequired(true);
		setMessage("Authenticator uygulamanızdaki 6 haneli kodu girin.");
		return true;
	}
	async function completeLogin() {
		await navigate({ to: "/ana-sayfa" });
	}
	(0, import_react.useEffect)(() => {
		let active = true;
		async function finishOAuthLogin() {
			if (!supabaseBrowser) return;
			const { data } = await supabaseBrowser.auth.getSession();
			if (!active || !data.session?.user) return;
			if (!await beginMfaIfRequired() && active) await completeLogin();
		}
		finishOAuthLogin();
		return () => {
			active = false;
		};
	}, [navigate]);
	async function handleSubmit(event) {
		event.preventDefault();
		setMessage("");
		if (!supabaseBrowser) {
			setMessage("Giriş sistemi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.");
			return;
		}
		const cleanEmail = email.trim().toLowerCase();
		if (!cleanEmail || !password) {
			setMessage("E-posta ve şifre alanlarını doldurun.");
			return;
		}
		setLoading(true);
		const { error } = await supabaseBrowser.auth.signInWithPassword({
			email: cleanEmail,
			password
		});
		if (error) {
			const text = error.message ?? "Giriş yapılamadı.";
			if (/invalid login credentials/i.test(text)) setMessage("E-posta adresi veya şifre hatalı.");
			else if (/email not confirmed/i.test(text)) setMessage("E-posta adresiniz henüz doğrulanmamış. Lütfen doğrulama e-postanızı kontrol edin.");
			else setMessage(text);
			setLoading(false);
			return;
		}
		if (!await beginMfaIfRequired()) await completeLogin();
		setLoading(false);
	}
	async function verifyMfa() {
		if (!supabaseBrowser || !mfaFactorId || !mfaChallengeId || !/^\d{6}$/.test(mfaCode)) {
			setMessage("Geçerli 6 haneli doğrulama kodunu girin.");
			return;
		}
		setMfaBusy(true);
		setMessage("");
		try {
			const { error } = await supabaseBrowser.auth.mfa.verify({
				factorId: mfaFactorId,
				challengeId: mfaChallengeId,
				code: mfaCode
			});
			if (error) {
				setMessage("Kod doğrulanamadı. Lütfen tekrar deneyin.");
				return;
			}
			await supabaseBrowser.auth.refreshSession();
			setMfaRequired(false);
			setMfaFactorId(null);
			setMfaChallengeId(null);
			setMfaCode("");
			await completeLogin();
		} finally {
			setMfaBusy(false);
		}
	}
	async function handleOAuth(provider) {
		if (!supabaseBrowser) {
			setMessage("Giriş sistemi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.");
			return;
		}
		setMessage("");
		setOauthLoading(provider);
		const { error } = await supabaseBrowser.auth.signInWithOAuth({
			provider,
			options: { redirectTo: getOAuthRedirectUrl() }
		});
		if (error) {
			console.error(`${provider} OAuth login failed`, error);
			setMessage(`${provider === "google" ? "Google" : "Apple"} ile giriş şu anda kullanılamıyor. Supabase sağlayıcı ayarlarını kontrol edin.`);
			setOauthLoading(null);
		}
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
						className: "absolute inset-x-0 bottom-0 h-[70%] w-full object-cover opacity-50"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: globe_default,
						alt: "",
						"aria-hidden": true,
						width: 1024,
						height: 1024,
						className: "pointer-events-none absolute right-[28%] top-0 hidden h-[110%] opacity-40 mix-blend-screen xl:block"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mx-auto grid max-w-[1600px] gap-10 px-4 py-14 lg:grid-cols-2 lg:px-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-block rounded-md border border-gold/50 px-4 py-2 text-[10px] leading-5 tracking-[0.10em] text-gold",
									children: [
										"HER İL İÇİN 10 KATMAN · 1.000 SEKTÖR · 1.000.000 PARSEL",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "TOPLAM 81 MİLYON GÖKYÜZÜ PARSELİ" })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
									className: "mt-6 font-display text-4xl leading-tight font-bold sm:text-5xl",
									children: [
										"GÖKYÜZÜNDE",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-gradient-gold",
											children: "SANA ÖZEL"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										"BİR YER"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-5 max-w-md text-sm text-muted-foreground",
									children: "Kendinize veya sevdiklerinize unutulmaz bir hediye verin. Gökyüzündeki yerinizi seçin, sertifikanızı alın ve bu eşsiz deneyimin bir parçası olun."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-10 flex flex-wrap gap-8",
									children: FEATURES.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(f.icon, { className: "h-7 w-7 text-gold" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-sm font-semibold",
												children: f.big
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: f.label
											})
										]
									}, f.big))
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel min-w-0 p-6 sm:p-10",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "mx-auto h-6 w-6 text-gold" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-4 font-display text-3xl",
										children: mfaRequired ? "GÜVENLİK DOĞRULAMASI" : "GİRİŞ YAP"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm text-muted-foreground",
										children: mfaRequired ? "Authenticator uygulamanızla ikinci adımı tamamlayın." : "Hesabınıza giriş yaparak parsellerinizi yönetin ve sertifikalarınıza ulaşın."
									})
								]
							}), !mfaRequired ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-8 space-y-5",
								onSubmit: handleSubmit,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs text-muted-foreground",
										htmlFor: "email",
										children: "E-posta Adresiniz"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											id: "email",
											value: email,
											onChange: (e) => setEmail(e.target.value),
											type: "email",
											autoComplete: "email",
											placeholder: "ornek@email.com",
											className: "min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
										})]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "text-xs text-muted-foreground",
										htmlFor: "pass",
										children: "Şifreniz"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 shrink-0 text-muted-foreground" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												id: "pass",
												value: password,
												onChange: (e) => setPassword(e.target.value),
												type: showPassword ? "text" : "password",
												autoComplete: "current-password",
												placeholder: "••••••••••",
												className: "min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"aria-label": showPassword ? "Şifreyi gizle" : "Şifreyi göster",
												onClick: () => setShowPassword((value) => !value),
												className: "shrink-0 text-muted-foreground hover:text-gold",
												children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
											})
										]
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex justify-end",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/sifremi-unuttum",
											className: "text-xs text-gold hover:underline",
											children: "Şifremi unuttum"
										})
									}),
									message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										role: "alert",
										className: "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive",
										children: message
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Güvenlik nedeniyle oturum yalnızca bu tarayıcı oturumu boyunca saklanır. Tarayıcıyı kapatıp yeniden açtığınızda tekrar giriş yapmanız gerekir."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "submit",
										disabled: loading || oauthLoading !== null,
										className: "btn-gold flex w-full items-center justify-center gap-3 rounded-md py-3.5 text-sm disabled:pointer-events-none disabled:opacity-60",
										children: [
											loading ? "GİRİŞ YAPILIYOR..." : "GİRİŞ YAP",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-4 text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
											" veya ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-3 sm:grid-cols-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => void handleOAuth("google"),
											disabled: loading || oauthLoading !== null,
											className: "rounded-md border border-border py-3 text-sm transition-colors hover:border-gold disabled:pointer-events-none disabled:opacity-60",
											children: oauthLoading === "google" ? "Google açılıyor..." : "Google ile giriş yap"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => void handleOAuth("apple"),
											disabled: loading || oauthLoading !== null,
											className: "rounded-md border border-border py-3 text-sm transition-colors hover:border-gold disabled:pointer-events-none disabled:opacity-60",
											children: oauthLoading === "apple" ? "Apple açılıyor..." : "Apple ile giriş yap"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-center text-sm text-muted-foreground",
										children: ["Hesabınız yok mu? ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/kayit-ol",
											className: "text-gold hover:underline",
											children: "Kayıt olun"
										})]
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 space-y-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "Authenticator Kodu"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											inputMode: "numeric",
											maxLength: 6,
											autoComplete: "one-time-code",
											value: mfaCode,
											onChange: (e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6)),
											placeholder: "123456",
											className: "mt-2 w-full rounded-md border border-input bg-background/50 px-3 py-3 text-center text-lg tracking-[0.4em] outline-none focus:border-gold"
										})]
									}),
									message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										role: "alert",
										className: "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive",
										children: message
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => void verifyMfa(),
										disabled: mfaBusy,
										className: "btn-gold flex w-full items-center justify-center rounded-md py-3.5 text-sm disabled:opacity-60",
										children: mfaBusy ? "DOĞRULANIYOR..." : "DOĞRULA VE DEVAM ET"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-center text-xs text-muted-foreground",
										children: "Bu adım, hesabınızda MFA etkin olduğu için zorunludur."
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
export { GirisPage as component };
