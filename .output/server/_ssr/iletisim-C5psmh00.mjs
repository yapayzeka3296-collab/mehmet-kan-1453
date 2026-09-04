import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { c as supabaseBrowser } from "./router-B5q8YR1C.mjs";
import { C as Phone, O as MapPin, a as UserRound, k as Mail } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-jMcAFes2.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
import { n as TrustBar } from "./TrustBar-UVKBrZO3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/iletisim-C5psmh00.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var CONTACT_EMAIL = "info.myskyparcel@gmail.com";
function Iletisim() {
	const [status, setStatus] = (0, import_react.useState)("idle");
	const [statusText, setStatusText] = (0, import_react.useState)("");
	async function handleSubmit(e) {
		e.preventDefault();
		if (status === "sending") return;
		setStatus("sending");
		setStatusText("");
		const form = e.currentTarget;
		const data = new FormData(form);
		const payload = {
			name: String(data.get("name") ?? "").trim(),
			email: String(data.get("email") ?? "").trim(),
			subject: String(data.get("subject") ?? "").trim(),
			message: String(data.get("message") ?? "").trim(),
			website: String(data.get("website") ?? "").trim()
		};
		if (!payload.name || !payload.email || !payload.message) {
			setStatus("error");
			setStatusText("Lütfen ad soyad, e-posta ve mesaj alanlarını doldurun.");
			return;
		}
		try {
			if (!supabaseBrowser) throw new Error("Supabase bağlantısı yapılandırılmamış.");
			const { data: result, error } = await supabaseBrowser.functions.invoke("contact-message", { body: payload });
			if (error) throw error;
			if (!result?.ok) throw new Error(result?.error || "Mesaj gönderilemedi.");
			form.reset();
			setStatus("success");
			setStatusText("Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.");
		} catch (error) {
			console.error("Contact form error", error);
			const subject = payload.subject || "MySkyParcel İletişim Mesajı";
			const body = `Ad Soyad: ${payload.name}\nE-posta: ${payload.email}\n\n${payload.message}`;
			const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
			window.location.href = mailto;
			setStatus("success");
			setStatusText(`Otomatik gönderim servisine ulaşılamadı. E-posta uygulamanız ${CONTACT_EMAIL} adresine hazır mesajı açtı; Gönder'e basmanız yeterli.`);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-[1600px] px-4 py-14 lg:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-center font-display text-4xl font-bold sm:text-5xl",
						children: "İLETİŞİM"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-4 max-w-xl text-center text-sm text-muted-foreground",
						children: "Sipariş, ödeme, sertifika, teslimat ve diğer destek talepleriniz için aşağıdaki iletişim kanallarından bize ulaşabilirsiniz."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 grid gap-6 lg:grid-cols-[360px_1fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
							className: "panel grid content-start gap-5 p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "mt-0.5 h-5 w-5 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Satıcı / İşletme"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: "MySkyParcel"
									})]
								})]
							}), [
								{
									icon: Mail,
									t: "E-posta",
									v: CONTACT_EMAIL
								},
								{
									icon: Phone,
									t: "Telefon",
									v: "0541 615 97 43"
								},
								{
									icon: MapPin,
									t: "Adres",
									v: "Kuştepe Mah. Mecidiyeköy Yolu Cad. No:18 34318 Şişli/İstanbul"
								}
							].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(c.icon, { className: "mt-0.5 h-5 w-5 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: c.t
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "break-words text-sm",
										children: c.v
									})]
								})]
							}, c.t))]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "panel grid gap-5 p-6",
							onSubmit: handleSubmit,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-5 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "Ad Soyad"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											required: true,
											name: "name",
											autoComplete: "name",
											className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "block",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "E-posta"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											required: true,
											name: "email",
											type: "email",
											autoComplete: "email",
											className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "Konu"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										name: "subject",
										className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "Mesajınız"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										required: true,
										name: "message",
										rows: 6,
										className: "mt-1.5 w-full rounded-md border border-input bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-gold"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									name: "website",
									tabIndex: -1,
									autoComplete: "off",
									"aria-hidden": "true",
									className: "hidden"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									disabled: status === "sending",
									className: "btn-gold w-fit rounded-md px-8 py-3 text-[11px] disabled:cursor-not-allowed disabled:opacity-60",
									children: status === "sending" ? "GÖNDERİLİYOR..." : "GÖNDER"
								}),
								statusText && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									role: "status",
									className: `text-sm ${status === "success" ? "text-emerald-400" : "text-red-400"}`,
									children: statusText
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Iletisim as component };
