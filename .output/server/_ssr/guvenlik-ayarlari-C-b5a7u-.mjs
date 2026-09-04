import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as supabaseBrowser, s as useAuth } from "./router-CeLrYSIK.mjs";
import { I as KeyRound, f as Smartphone, h as ShieldCheck } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-7dnce91Z.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
import { n as TrustBar, t as SECURITY_TRUST } from "./TrustBar-Ci8UbTsR.mjs";
import { t as UserSidebar } from "./UserSidebar-B_-y-sIT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/guvenlik-ayarlari-C-b5a7u-.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function Guvenlik() {
	const { user, loading: authLoading } = useAuth();
	const [currentPassword, setCurrentPassword] = (0, import_react.useState)("");
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [reauthCode, setReauthCode] = (0, import_react.useState)("");
	const [reauthPending, setReauthPending] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [mfaLoading, setMfaLoading] = (0, import_react.useState)(true);
	const [mfaEnabled, setMfaEnabled] = (0, import_react.useState)(false);
	const [mfaFactorId, setMfaFactorId] = (0, import_react.useState)(null);
	const [mfaQrCode, setMfaQrCode] = (0, import_react.useState)(null);
	const [mfaCode, setMfaCode] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let active = true;
		async function loadMfa() {
			if (!user || !supabaseBrowser) {
				setMfaLoading(false);
				return;
			}
			const { data, error } = await supabaseBrowser.auth.mfa.listFactors();
			if (!active) return;
			const verified = (data?.totp ?? []).find((factor) => factor.status === "verified");
			setMfaEnabled(Boolean(verified));
			setMfaFactorId(verified?.id ?? null);
			if (error) setMessage("İki adımlı doğrulama durumu alınamadı.");
			setMfaLoading(false);
		}
		loadMfa();
		return () => {
			active = false;
		};
	}, [user]);
	async function updatePassword() {
		setMessage(null);
		if (!supabaseBrowser || !user?.email) {
			setMessage("Oturum veya Supabase bağlantısı bulunamadı.");
			return;
		}
		if (newPassword.length < 10) {
			setMessage("Yeni şifre en az 10 karakter olmalıdır.");
			return;
		}
		if (newPassword !== confirmPassword) {
			setMessage("Yeni şifreler eşleşmiyor.");
			return;
		}
		if (!currentPassword) {
			setMessage("Mevcut şifrenizi girin.");
			return;
		}
		setBusy(true);
		try {
			if (!reauthPending) {
				const { error: signInError } = await supabaseBrowser.auth.signInWithPassword({
					email: user.email,
					password: currentPassword
				});
				if (signInError) {
					setMessage("Mevcut şifre doğrulanamadı.");
					return;
				}
				const { error: reauthError } = await supabaseBrowser.auth.reauthenticate();
				if (reauthError) {
					setMessage(`E-posta doğrulaması başlatılamadı: ${reauthError.message}`);
					return;
				}
				setReauthPending(true);
				setReauthCode("");
				setMessage(`Doğrulama kodu ${user.email} adresine gönderildi. E-postadaki kodu girip tekrar ŞİFREYİ GÜNCELLE'ye basın.`);
				return;
			}
			if (!/^\d{6}$/.test(reauthCode)) {
				setMessage("E-postadaki 6 haneli doğrulama kodunu girin.");
				return;
			}
			const { error } = await supabaseBrowser.auth.updateUser({
				password: newPassword,
				nonce: reauthCode
			});
			if (error) {
				setMessage(`Şifre güncellenemedi: ${error.message}`);
				return;
			}
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setReauthCode("");
			setReauthPending(false);
			setMessage("Şifreniz e-posta doğrulamasıyla başarıyla güncellendi.");
		} finally {
			setBusy(false);
		}
	}
	async function enableMfa() {
		setMessage(null);
		if (!supabaseBrowser) {
			setMessage("Supabase bağlantısı bulunamadı.");
			return;
		}
		setBusy(true);
		try {
			const { data, error } = await supabaseBrowser.auth.mfa.enroll({
				factorType: "totp",
				friendlyName: "MySkyParcel"
			});
			if (error || !data) {
				setMessage(error?.message ?? "İki adımlı doğrulama başlatılamadı.");
				return;
			}
			setMfaFactorId(data.id);
			setMfaQrCode(data.totp?.qr_code ?? null);
			setMfaCode("");
			setMessage("Authenticator uygulamanızla QR kodu okutun ve 6 haneli kodu girin.");
		} finally {
			setBusy(false);
		}
	}
	async function verifyMfa() {
		if (!supabaseBrowser || !mfaFactorId || !/^\d{6}$/.test(mfaCode)) {
			setMessage("Geçerli 6 haneli doğrulama kodunu girin.");
			return;
		}
		setBusy(true);
		setMessage(null);
		try {
			const { data: challenge, error: challengeError } = await supabaseBrowser.auth.mfa.challenge({ factorId: mfaFactorId });
			if (challengeError || !challenge) {
				setMessage("Doğrulama başlatılamadı.");
				return;
			}
			const { error } = await supabaseBrowser.auth.mfa.verify({
				factorId: mfaFactorId,
				challengeId: challenge.id,
				code: mfaCode
			});
			if (error) {
				setMessage("Kod doğrulanamadı. Lütfen tekrar deneyin.");
				return;
			}
			setMfaEnabled(true);
			setMfaQrCode(null);
			setMfaCode("");
			setMessage("İki adımlı doğrulama etkinleştirildi.");
		} finally {
			setBusy(false);
		}
	}
	async function disableMfa() {
		if (!supabaseBrowser || !mfaFactorId) return;
		if (!window.confirm("İki adımlı doğrulamayı kapatmak istediğinize emin misiniz?")) return;
		setBusy(true);
		setMessage(null);
		try {
			const { error } = await supabaseBrowser.auth.mfa.unenroll({ factorId: mfaFactorId });
			if (error) {
				setMessage("İki adımlı doğrulama kapatılamadı.");
				return;
			}
			setMfaEnabled(false);
			setMfaFactorId(null);
			setMessage("İki adımlı doğrulama kapatıldı.");
		} finally {
			setBusy(false);
		}
	}
	async function signOutEverywhere() {
		if (!supabaseBrowser) return;
		setBusy(true);
		setMessage(null);
		try {
			const { error } = await supabaseBrowser.auth.signOut({ scope: "global" });
			if (error) setMessage("Oturumlar kapatılamadı.");
		} finally {
			setBusy(false);
		}
	}
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserSidebar, { active: "/guvenlik-ayarlari" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-3xl font-bold",
								children: "GÜVENLİK AYARLARI"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: "Hesabınızı korumak için şifre, e-posta doğrulamalı şifre değişikliği, iki adımlı doğrulama ve oturum güvenliğini yönetin."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "panel mt-6 grid gap-5 p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "flex items-center gap-2 font-display text-base",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-5 w-5 text-gold" }), " ŞİFRE DEĞİŞTİR"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Şifre değişikliği öncesinde mevcut şifreniz doğrulanır ve e-posta adresinize 6 haneli güvenlik kodu gönderilir."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-5 sm:grid-cols-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "block",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: "Mevcut Şifre"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "password",
												autoComplete: "current-password",
												value: currentPassword,
												onChange: (e) => setCurrentPassword(e.target.value),
												disabled: reauthPending,
												className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold disabled:opacity-60"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "block",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: "Yeni Şifre"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "password",
												autoComplete: "new-password",
												value: newPassword,
												onChange: (e) => setNewPassword(e.target.value),
												className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "block",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-muted-foreground",
												children: "Yeni Şifre Tekrar"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "password",
												autoComplete: "new-password",
												value: confirmPassword,
												onChange: (e) => setConfirmPassword(e.target.value),
												className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold"
											})]
										})
									]
								}),
								reauthPending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block max-w-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "E-posta Doğrulama Kodu"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										inputMode: "numeric",
										autoComplete: "one-time-code",
										maxLength: 6,
										value: reauthCode,
										onChange: (e) => setReauthCode(e.target.value.replace(/\D/g, "").slice(0, 6)),
										placeholder: "123456",
										className: "mt-1.5 w-full rounded-md border border-gold/50 bg-background/50 px-3 py-2.5 text-center text-lg tracking-[0.35em] outline-none focus:border-gold"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => void updatePassword(),
									disabled: busy,
									className: "btn-gold w-fit rounded-md px-8 py-3 text-[11px] disabled:opacity-60",
									children: busy ? "İŞLENİYOR..." : reauthPending ? "ŞİFREYİ GÜNCELLE" : "ŞİFREYİ GÜNCELLE"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 grid gap-6 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "panel p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
										className: "flex items-center gap-2 font-display text-base",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "h-5 w-5 text-gold" }), " İKİ ADIMLI DOĞRULAMA"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm text-muted-foreground",
										children: "Authenticator uygulamasıyla hesabınıza ek bir güvenlik katmanı ekleyin."
									}),
									mfaQrCode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4 rounded-lg border border-border bg-white p-4",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: mfaQrCode,
											alt: "Authenticator QR kodu",
											className: "mx-auto h-48 w-48"
										})
									}),
									mfaQrCode && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											inputMode: "numeric",
											maxLength: 6,
											value: mfaCode,
											onChange: (e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6)),
											placeholder: "6 haneli kod",
											className: "min-w-0 flex-1 rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => void verifyMfa(),
											disabled: busy,
											className: "rounded-md border border-gold/60 px-4 py-2.5 text-[11px] text-gold disabled:opacity-60",
											children: "DOĞRULA"
										})]
									}),
									!mfaLoading && !mfaEnabled && !mfaQrCode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => void enableMfa(),
										disabled: busy,
										className: "mt-4 rounded-md border border-gold/60 px-6 py-2.5 text-[11px] text-gold disabled:opacity-60",
										children: "ETKİNLEŞTİR"
									}),
									!mfaLoading && mfaEnabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 flex items-center justify-between gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-green-500",
											children: "İki adımlı doğrulama etkin."
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => void disableMfa(),
											disabled: busy,
											className: "rounded-md border border-border px-4 py-2 text-[11px] disabled:opacity-60",
											children: "KAPAT"
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "panel p-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
										className: "flex items-center gap-2 font-display text-base",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5 text-gold" }), " AKTİF OTURUMLAR"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-sm text-muted-foreground",
										children: "Hesabınızdaki tüm aktif oturumları tek işlemle sonlandırabilirsiniz."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => void signOutEverywhere(),
										disabled: busy,
										className: "mt-4 rounded-md border border-border px-6 py-2.5 text-[11px] disabled:opacity-60",
										children: "TÜM OTURUMLARI KAPAT"
									})
								]
							})]
						}),
						message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 rounded-md border border-border bg-card p-3 text-sm text-muted-foreground",
							role: "status",
							children: message
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustBar, { items: SECURITY_TRUST }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Guvenlik as component };
