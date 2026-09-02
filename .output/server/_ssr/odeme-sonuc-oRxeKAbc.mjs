import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as supabaseBrowser, i as Route$21 } from "./router-DmK7qVyG.mjs";
import { M as LoaderCircle, it as CircleCheck, rt as CircleX } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-zsFpX4_x.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/odeme-sonuc-oRxeKAbc.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function PaymentResult() {
	const navigate = useNavigate({ from: "/odeme-sonuc" });
	const { intent } = Route$21.useSearch();
	const [status, setStatus] = (0, import_react.useState)("checking");
	const [message, setMessage] = (0, import_react.useState)("Shopier ödemeniz doğrulanıyor...");
	(0, import_react.useEffect)(() => {
		if (!intent || !supabaseBrowser) {
			setStatus("failed");
			setMessage("Sipariş doğrulama bilgisi bulunamadı.");
			return;
		}
		let cancelled = false;
		let timer;
		const check = async () => {
			const { data: sessionData } = await supabaseBrowser.auth.getSession();
			const token = sessionData.session?.access_token;
			if (!token) {
				setStatus("failed");
				setMessage("Oturumunuz bulunamadı. Lütfen giriş yaparak siparişlerinizi kontrol edin.");
				return;
			}
			const response = await fetch(`/api/shopier-checkout-status?intent=${encodeURIComponent(intent)}`, {
				headers: { authorization: `Bearer ${token}` },
				cache: "no-store"
			});
			const result = await response.json().catch(() => ({}));
			if (cancelled) return;
			if (!response.ok) {
				setStatus("waiting");
				setMessage("Ödeme sonucu doğrulanıyor...");
				return;
			}
			if (result.status === "paid") {
				setStatus("paid");
				setMessage("Ödemeniz doğrulandı. Parselleriniz hesabınıza tanımlandı ve sertifika süreci başlatıldı.");
				if (timer) clearInterval(timer);
				return;
			}
			if ([
				"failed",
				"cancelled",
				"expired"
			].includes(result.status)) {
				setStatus("failed");
				setMessage("Ödeme tamamlanamadı veya ödeme oturumu sona erdi.");
				if (timer) clearInterval(timer);
				return;
			}
			setStatus("waiting");
			setMessage("Shopier ödeme sonucu sunucuda doğrulanıyor...");
		};
		check();
		timer = setInterval(() => void check(), 2500);
		const stop = setTimeout(() => {
			if (!cancelled) {
				setStatus("waiting");
				setMessage("Doğrulama devam ediyor. Siparişlerim sayfasından durumu takip edebilirsiniz.");
			}
		}, 3e4);
		return () => {
			cancelled = true;
			if (timer) clearInterval(timer);
			clearTimeout(stop);
		};
	}, [intent]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-2xl px-4 py-20 lg:px-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-8 text-center sm:p-12",
					children: [
						status === "paid" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mx-auto h-14 w-14 text-gold" }) : status === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "mx-auto h-14 w-14 text-destructive" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto h-12 w-12 animate-spin text-gold" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-6 font-display text-3xl font-bold",
							children: status === "paid" ? "SİPARİŞ TAMAMLANDI" : status === "failed" ? "ÖDEME DOĞRULANAMADI" : "ÖDEME DOĞRULANIYOR"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground",
							children: message
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-col justify-center gap-3 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => void navigate({ to: "/siparislerim" }),
								className: "btn-gold rounded-md px-6 py-3 text-xs",
								children: "SİPARİŞLERİM"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => void navigate({ to: "/panelim" }),
								className: "rounded-md border border-border px-6 py-3 text-xs",
								children: "PANELE DÖN"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { PaymentResult as component };
