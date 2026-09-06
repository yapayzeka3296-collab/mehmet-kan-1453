import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as supabaseBrowser, s as useAuth } from "./router-BfErbPzM.mjs";
import { n as SiteHeader } from "./SiteHeader-CEjtL_N0.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
import { n as TrustBar, t as SECURITY_TRUST } from "./TrustBar-Ci8UbTsR.mjs";
import { t as UserSidebar } from "./UserSidebar-XW8ZakWO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/profilim-BeNqlf7Q.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function Profilim() {
	const { user, loading } = useAuth();
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!user) return;
		setFullName(typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "");
	}, [user]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "starfield min-h-screen",
		"aria-busy": "true"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/giris",
		replace: true
	});
	const currentUser = user;
	async function updateProfile(e) {
		e.preventDefault();
		if (!supabaseBrowser) {
			setError("Supabase yapılandırması eksik.");
			return;
		}
		const cleanName = fullName.trim();
		if (cleanName.length > 120) {
			setError("Ad soyad en fazla 120 karakter olabilir.");
			return;
		}
		setSaving(true);
		setMessage(null);
		setError(null);
		try {
			const { error: authError } = await supabaseBrowser.auth.updateUser({ data: { full_name: cleanName } });
			if (authError) throw authError;
			const { error: profileError } = await supabaseBrowser.from("profiles").update({ full_name: cleanName }).eq("id", currentUser.id);
			if (profileError) throw profileError;
			setMessage("Profil bilgileriniz güncellendi.");
		} catch (err) {
			console.error("Profile update failed", err);
			setError("Profil güncellenemedi. Lütfen bilgileri kontrol edip tekrar deneyin.");
		} finally {
			setSaving(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserSidebar, { active: "/profilim" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "panel p-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl font-bold",
							children: "PROFİLİM"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "panel mt-6 grid gap-5 p-6 sm:grid-cols-2",
						onSubmit: updateProfile,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "Ad Soyad"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: fullName,
									onChange: (e) => setFullName(e.target.value),
									autoComplete: "name",
									maxLength: 120,
									className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground",
									children: "E-posta"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: currentUser.email ?? "",
									readOnly: true,
									autoComplete: "email",
									className: "mt-1.5 w-full cursor-not-allowed rounded-md border border-input bg-muted/30 px-3 py-2.5 text-sm outline-none"
								})]
							}),
							message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-success sm:col-span-2",
								role: "status",
								children: message
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-destructive sm:col-span-2",
								role: "alert",
								children: error
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: saving,
								className: "btn-gold w-fit rounded-md px-8 py-3 text-[11px] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2",
								children: saving ? "GÜNCELLENİYOR..." : "BİLGİLERİ GÜNCELLE"
							})
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustBar, { items: SECURITY_TRUST }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Profilim as component };
