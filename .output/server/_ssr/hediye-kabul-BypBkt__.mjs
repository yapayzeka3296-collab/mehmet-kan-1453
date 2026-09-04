import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as supabaseBrowser, s as useAuth } from "./router-CUqG1PTn.mjs";
import { G as Gift, M as LoaderCircle, h as ShieldCheck, lt as ArrowRight } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-Cpx76iDo.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hediye-kabul-BypBkt__.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function HediyeKabul() {
	const navigate = useNavigate();
	const { user, loading: authLoading } = useAuth();
	const [preview, setPreview] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [accepting, setAccepting] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [accepted, setAccepted] = (0, import_react.useState)(false);
	const params = (0, import_react.useMemo)(() => {
		if (typeof window === "undefined") return {
			gift: "",
			token: ""
		};
		const search = new URLSearchParams(window.location.search);
		return {
			gift: search.get("gift") ?? "",
			token: search.get("token") ?? ""
		};
	}, []);
	const giftUrl = `/hediye-kabul?gift=${encodeURIComponent(params.gift)}&token=${encodeURIComponent(params.token)}`;
	const loginUrl = `/giris?redirect=${encodeURIComponent(giftUrl)}`;
	const registerUrl = `/kayit-ol?hediye=${encodeURIComponent(giftUrl)}`;
	(0, import_react.useEffect)(() => {
		let active = true;
		async function load() {
			if (!params.gift || !params.token) {
				if (active) {
					setError("Hediye bağlantısı eksik veya geçersiz.");
					setLoading(false);
				}
				return;
			}
			setLoading(true);
			setError(null);
			try {
				if (!supabaseBrowser) throw new Error("Supabase yapılandırması eksik");
				const { data, error: functionError } = await supabaseBrowser.functions.invoke("parcel-gift", { body: {
					action: "preview",
					giftId: params.gift,
					token: params.token
				} });
				if (functionError) throw functionError;
				if (!data?.giftId) throw new Error(data?.error ?? "Hediye bağlantısı geçersiz veya süresi dolmuş.");
				if (active) setPreview(data);
			} catch (err) {
				if (active) setError(err instanceof Error ? err.message : "Hediye bilgileri alınamadı.");
			} finally {
				if (active) setLoading(false);
			}
		}
		load();
		return () => {
			active = false;
		};
	}, [params.gift, params.token]);
	async function acceptGift() {
		if (!supabaseBrowser || !user || !params.gift || !params.token) return;
		setAccepting(true);
		setError(null);
		try {
			const { data, error: functionError } = await supabaseBrowser.functions.invoke("parcel-gift", { body: {
				action: "accept",
				giftId: params.gift,
				token: params.token
			} });
			if (functionError) throw functionError;
			if (!data?.success) throw new Error(data?.error ?? "Hediye kabul edilemedi.");
			setAccepted(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Hediye kabul edilemedi.");
		} finally {
			setAccepting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto flex min-h-[70vh] max-w-[760px] items-center px-4 py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "panel w-full p-6 sm:p-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "mx-auto h-10 w-10 text-gold" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-4 font-display text-3xl font-bold",
									children: "PARSEL HEDİYESİ"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: "MySkyParcel'dan size özel bir parsel hediyesi."
								})
							]
						}),
						loading || authLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin" }), " Hediye bilgileri kontrol ediliyor..."]
						}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 rounded-lg border border-destructive/40 bg-destructive/10 p-5 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-destructive",
								children: error
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/ana-sayfa",
								className: "mt-5 inline-flex items-center gap-2 text-xs text-gold hover:underline",
								children: ["ANA SAYFAYA DÖN ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
							})]
						}) : accepted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 rounded-lg border border-green-500/40 bg-green-500/10 p-6 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mx-auto h-8 w-8 text-green-500" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-3 font-display text-xl",
									children: "HEDİYE KABUL EDİLDİ"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: "Parsel artık hesabınızdaki koleksiyonunuzda."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => void navigate({ to: "/parsellerim" }),
									className: "btn-gold mt-5 inline-flex items-center gap-2 rounded-md px-5 py-3 text-xs",
									children: ["KOLEKSİYONUMA GİT ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 grid gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-border p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground",
											children: "PARSEL"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 font-semibold",
											children: preview?.parcel.parcelNumber ?? "—"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-border p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground",
											children: "ŞEHİR"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 font-semibold",
											children: preview?.parcel.city ?? "—"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-border p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground",
											children: "PAKET"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 font-semibold",
											children: preview?.parcel.tier ?? "—"
										})]
									})
								]
							}),
							preview?.message && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-lg border border-gold/30 bg-gold/5 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-gold",
									children: "HEDİYE MESAJI"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm",
									children: preview.message
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 rounded-lg border border-border p-4 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
										className: "text-foreground",
										children: "Alıcı:"
									}),
									" ",
									preview?.recipientEmail
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2",
									children: "Bu bağlantı 7 gün geçerlidir ve yalnızca belirtilen e-posta hesabıyla kabul edilebilir."
								})]
							}),
							!user ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-7 grid gap-3 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: registerUrl,
									className: "btn-gold inline-flex items-center justify-center gap-2 rounded-md py-3 text-xs",
									children: ["ÜCRETSİZ HESAP OLUŞTUR ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: loginUrl,
									className: "inline-flex items-center justify-center gap-2 rounded-md border border-border py-3 text-xs hover:border-gold",
									children: "HESABIM VAR — GİRİŞ YAP"
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => void acceptGift(),
								disabled: accepting,
								className: "btn-gold mt-7 flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-xs disabled:opacity-60",
								children: [accepting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "h-4 w-4" }), accepting ? "HEDİYE KABUL EDİLİYOR..." : "HEDİYEYİ KABUL ET"]
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-7 text-center text-[10px] text-muted-foreground",
							children: "Güvenli sahiplik aktarımı sunucu tarafında doğrulanır."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { HediyeKabul as component };
