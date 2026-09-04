import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as Route$10, o as supabaseBrowser } from "./router-C06JPJBn.mjs";
import { h as ShieldCheck, x as QrCode, y as Search } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-DuBosk6l.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
import { n as TrustBar, t as SECURITY_TRUST } from "./TrustBar-Ci8UbTsR.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sertifika-dogrula-DMNxJ_WS.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var TIER_LABELS = {
	digital: "Dijital",
	elite: "Elit",
	premium: "Premium"
};
var CERTIFICATE_PATTERN = /^[A-Z0-9-]{4,80}$/i;
function Dogrula() {
	const { code: initialCode } = Route$10.useSearch();
	const [code, setCode] = (0, import_react.useState)(initialCode);
	const [result, setResult] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)(null);
	async function handleSubmit(event) {
		event.preventDefault();
		setResult(null);
		setMessage(null);
		const normalized = code.trim().toUpperCase();
		if (!normalized) {
			setMessage("Lütfen sertifika numaranızı girin.");
			return;
		}
		if (!CERTIFICATE_PATTERN.test(normalized)) {
			setMessage("Sertifika numarası geçersiz formatta.");
			return;
		}
		if (!supabaseBrowser) {
			setMessage("Doğrulama servisi şu anda yapılandırılmamış.");
			return;
		}
		setLoading(true);
		try {
			const { data, error } = await supabaseBrowser.rpc("verify_certificate", { p_certificate_number: normalized });
			if (error) throw error;
			const verified = Array.isArray(data) ? data[0] : data;
			if (!verified) {
				setMessage("Bu numaraya ait doğrulanmış bir sertifika bulunamadı.");
				return;
			}
			setResult(verified);
		} catch (error) {
			console.error("Certificate verification error", error);
			setMessage("Doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-3xl px-4 py-16 lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mx-auto h-10 w-10 text-gold" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-4 font-display text-4xl font-bold",
							children: "SERTİFİKA DOĞRULA"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-muted-foreground",
							children: "Sertifika numaranızı veya sertifika üzerindeki QR kodu kullanarak geçerliliği kontrol edin."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel mt-10 p-6 sm:p-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: handleSubmit,
							noValidate: true,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-xs text-muted-foreground",
									htmlFor: "kod",
									children: "Sertifika Numarası"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
										className: "h-4 w-4 shrink-0 text-muted-foreground",
										"aria-hidden": "true"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "kod",
										value: code,
										onChange: (event) => setCode(event.target.value),
										placeholder: "Örn: MSP-XXXXXXXXXXXX",
										autoComplete: "off",
										inputMode: "text",
										"aria-describedby": "verification-status",
										"aria-invalid": Boolean(message),
										disabled: loading,
										className: "min-w-0 flex-1 bg-transparent py-3 text-sm uppercase outline-none"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									disabled: loading,
									className: "btn-gold mt-5 w-full rounded-md py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60",
									children: loading ? "DOĞRULANIYOR..." : "DOĞRULA"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							id: "verification-status",
							"aria-live": "polite",
							className: "mt-5",
							children: [message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-md border border-red-300/20 bg-red-500/5 p-4 text-sm text-red-200",
								children: message
							}), result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border border-gold/30 bg-gold/5 p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-sm font-semibold text-gold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
										className: "h-5 w-5",
										"aria-hidden": "true"
									}), " SERTİFİKA DOĞRULANDI"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "mt-4 grid gap-3 text-sm sm:grid-cols-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs text-muted-foreground",
											children: "Sertifika"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-1 font-medium",
											children: result.certificate_number
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs text-muted-foreground",
											children: "Sahibi"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-1 font-medium",
											children: result.owner_display_name ?? "—"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs text-muted-foreground",
											children: "Parsel"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-1 font-medium",
											children: result.parcel_number
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs text-muted-foreground",
											children: "Şehir"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-1 font-medium",
											children: result.city_name ?? result.city_code ?? "—"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs text-muted-foreground",
											children: "Paket"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-1 font-medium",
											children: TIER_LABELS[result.tier]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs text-muted-foreground",
											children: "Durum"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-1 font-medium",
											children: "Geçerli"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "text-xs text-muted-foreground",
											children: "Düzenlenme"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-1 font-medium",
											children: result.issued_at ? new Date(result.issued_at).toLocaleDateString("tr-TR") : "—"
										})] })
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex items-start gap-4 rounded-md border border-border bg-background/40 p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, {
								className: "h-8 w-8 shrink-0 text-gold",
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "min-w-0 text-sm text-muted-foreground",
								children: [
									"Sertifikanızın üzerindeki QR kod, MySkyParcel doğrulama sayfasını açar. Yalnızca sunucuda ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "issued" }),
									" durumundaki sertifikalar doğrulanmış kabul edilir."
								]
							})]
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
export { Dogrula as component };
