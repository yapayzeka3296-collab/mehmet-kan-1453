import { i as __toESM } from "../_runtime.mjs";
import { n as supabaseBrowser } from "./supabaseBrowser-CW6TqKSB.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, v as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as useAuth } from "./router-Clj7SSKb.mjs";
import { E as LoaderCircle, Z as CircleCheck, it as ArrowLeft, nt as Award } from "../_libs/lucide-react.mjs";
import { n as SiteFooter, r as SiteHeader } from "./SiteFooter-BgMvJZTE.mjs";
import { n as TrustBar, t as SECURITY_TRUST } from "./TrustBar-DHeSR4Mx.mjs";
import { t as UserSidebar } from "./UserSidebar-VZanX3GI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sertifika-talep-sh9uQ2tV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TIER_LABELS = {
	digital: "Dijital",
	elite: "Özel",
	premium: "Premium"
};
function SertifikaTalep() {
	const { user, loading: authLoading } = useAuth();
	const [parcels, setParcels] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [message, setMessage] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!user || !supabaseBrowser) {
			setLoading(false);
			return;
		}
		(async () => {
			const { data } = await supabaseBrowser.from("parcels").select("id,parcel_number,tier,cities(name)").eq("owner_id", user.id).eq("status", "sold").order("created_at", { ascending: false });
			setParcels(data ?? []);
			setLoading(false);
		})();
	}, [user]);
	async function requestCertificate(parcelId) {
		if (!supabaseBrowser) return;
		setBusy(parcelId);
		setMessage(null);
		const { error } = await supabaseBrowser.rpc("request_certificate", { p_parcel_id: parcelId });
		if (error) setMessage(error.message === "certificate_already_requested" ? "Bu parsel için zaten aktif bir sertifika talebiniz var." : "Sertifika talebi oluşturulamadı.");
		else setMessage("Sertifika talebiniz oluşturuldu. Onay ve yayın işlemi tamamlandığında Sertifikalarım bölümünde görünecektir.");
		setBusy(null);
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
				className: "mx-auto grid max-w-[1400px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserSidebar, { active: "/sertifikalarim" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/sertifikalarim",
								className: "inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-gold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Sertifikalarım"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "h-8 w-8 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-display text-3xl font-bold",
									children: "SERTİFİKA TALEP ET"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "Sahip olduğunuz satılmış parsellerden biri için sertifika talebi oluşturun."
								})] })]
							})]
						}),
						message && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel mt-6 flex items-start gap-3 p-5 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 h-5 w-5 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: message })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3",
							children: [
								loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "panel p-6 text-sm text-muted-foreground",
									children: "Parselleriniz yükleniyor..."
								}),
								!loading && parcels.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "panel p-6 text-sm text-muted-foreground",
									children: "Sertifika talep edilebilecek satın alınmış parsel bulunamadı."
								}),
								!loading && parcels.map((parcel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "panel p-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-xl",
											children: parcel.parcel_number
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: [
												parcel.city?.name || "Türkiye",
												" · ",
												TIER_LABELS[parcel.tier]
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											disabled: busy === parcel.id,
											onClick: () => void requestCertificate(parcel.id),
											className: "btn-gold mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs disabled:opacity-60",
											children: [busy === parcel.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " SERTİFİKA TALEP ET"]
										})
									]
								}, parcel.id))
							]
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
export { SertifikaTalep as component };
