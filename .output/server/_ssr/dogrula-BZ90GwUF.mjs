import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as supabaseBrowser, s as useAuth } from "./router-C0UD-Ad-.mjs";
import { M as LoaderCircle, d as Smartphone, nt as CircleCheck, tt as CircleX } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-DYKr_Yet.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dogrula-BZ90GwUF.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function Dogrula() {
	const { user, loading } = useAuth();
	const [linkError, setLinkError] = (0, import_react.useState)(false);
	const [phone, setPhone] = (0, import_react.useState)("");
	const [phoneCode, setPhoneCode] = (0, import_react.useState)("");
	const [phoneSending, setPhoneSending] = (0, import_react.useState)(false);
	const [phoneVerified, setPhoneVerified] = (0, import_react.useState)(false);
	const [phoneMessage, setPhoneMessage] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const params = new URLSearchParams(window.location.search);
		const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
		setLinkError(Boolean(params.get("error") || params.get("error_code") || params.get("error_description") || hash.get("error") || hash.get("error_code") || hash.get("error_description")));
	}, []);
	(0, import_react.useEffect)(() => {
		let active = true;
		async function startPhoneVerification() {
			if (!user || !supabaseBrowser) return;
			const pendingPhone = typeof user.user_metadata?.pending_phone === "string" ? user.user_metadata.pending_phone : "";
			if (!pendingPhone) return;
			if (sessionStorage.getItem(`myskyparcel-phone-sms:${user.id}`) === "sent") {
				setPhone(pendingPhone);
				return;
			}
			setPhone(pendingPhone);
			setPhoneSending(true);
			setPhoneMessage(null);
			const { error } = await supabaseBrowser.auth.updateUser({ phone: pendingPhone });
			if (!active) return;
			setPhoneSending(false);
			if (error) {
				setPhoneMessage(`SMS doğrulaması başlatılamadı: ${error.message}`);
				return;
			}
			sessionStorage.setItem(`myskyparcel-phone-sms:${user.id}`, "sent");
			setPhoneMessage(`SMS doğrulama kodu ${pendingPhone} numarasına gönderildi.`);
		}
		startPhoneVerification();
		return () => {
			active = false;
		};
	}, [user?.id, user?.user_metadata?.pending_phone]);
	async function verifyPhone() {
		if (!supabaseBrowser || !user || !phone || !/^\d{6}$/.test(phoneCode)) {
			setPhoneMessage("Geçerli 6 haneli SMS kodunu girin.");
			return;
		}
		setPhoneSending(true);
		setPhoneMessage(null);
		try {
			const { error } = await supabaseBrowser.auth.verifyOtp({
				phone,
				token: phoneCode,
				type: "phone_change"
			});
			if (error) {
				setPhoneMessage(`SMS kodu doğrulanamadı: ${error.message}`);
				return;
			}
			await supabaseBrowser.auth.updateUser({ data: { pending_phone: null } });
			sessionStorage.removeItem(`myskyparcel-phone-sms:${user.id}`);
			setPhoneVerified(true);
			setPhoneCode("");
			setPhoneMessage("Telefon numaranız başarıyla doğrulandı.");
		} finally {
			setPhoneSending(false);
		}
	}
	async function resendPhone() {
		if (!supabaseBrowser || !phone) return;
		setPhoneSending(true);
		setPhoneMessage(null);
		try {
			const { error } = await supabaseBrowser.auth.resend({
				type: "phone_change",
				phone
			});
			if (error) {
				setPhoneMessage(`SMS yeniden gönderilemedi: ${error.message}`);
				return;
			}
			setPhoneMessage("Yeni SMS doğrulama kodu gönderildi.");
		} finally {
			setPhoneSending(false);
		}
	}
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
						phone && !phoneVerified && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 rounded-xl border border-gold/20 bg-gold/5 p-5 text-left",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-semibold",
										children: "SMS ÜYELİK DOĞRULAMASI"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-xs text-muted-foreground",
									children: ["Telefonunuz yalnızca üyelik doğrulaması için SMS ile doğrulanır. ", phoneSending ? "SMS işlemi hazırlanıyor..." : phoneMessage]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mt-4 block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "6 haneli SMS kodu"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										inputMode: "numeric",
										autoComplete: "one-time-code",
										maxLength: 6,
										value: phoneCode,
										onChange: (e) => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6)),
										className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-3 text-center text-lg tracking-[0.4em] outline-none focus:border-gold",
										placeholder: "123456"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 grid gap-2 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => void verifyPhone(),
										disabled: phoneSending,
										className: "btn-gold rounded-md px-4 py-3 text-xs font-bold",
										children: "SMS KODUNU DOĞRULA"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => void resendPhone(),
										disabled: phoneSending,
										className: "rounded-md border border-border px-4 py-3 text-xs",
										children: "SMS KODUNU YENİDEN GÖNDER"
									})]
								})
							]
						}),
						phoneVerified && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 rounded-md border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-500",
							children: "Telefon numaranız da doğrulandı. Üyelik doğrulaması tamamlandı."
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
