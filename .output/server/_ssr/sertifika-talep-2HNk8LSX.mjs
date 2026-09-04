import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as supabaseBrowser, s as useAuth } from "./router-C06JPJBn.mjs";
import { M as LoaderCircle, T as PackageCheck, ct as Award, nt as CircleCheck, ut as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-DuBosk6l.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
import { n as TrustBar, t as SECURITY_TRUST } from "./TrustBar-Ci8UbTsR.mjs";
import { t as UserSidebar } from "./UserSidebar-B-_ehMqP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sertifika-talep-2HNk8LSX.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var TIER_LABELS = {
	digital: "Dijital",
	elite: "Özel",
	premium: "Premium"
};
var ACTIVE_CERTIFICATE_STATUSES = /* @__PURE__ */ new Set([
	"requested",
	"approved",
	"issued",
	"revoked"
]);
function SertifikaTalep() {
	const { user, loading: authLoading } = useAuth();
	const [parcels, setParcels] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [message, setMessage] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [parcelId, setParcelId] = (0, import_react.useState)("");
	const [physical, setPhysical] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		fullName: "",
		phone: "",
		address: "",
		district: "",
		city: "",
		postalCode: ""
	});
	const selectedParcel = (0, import_react.useMemo)(() => parcels.find((p) => p.id === parcelId) ?? null, [parcels, parcelId]);
	const canPhysical = selectedParcel?.tier === "elite" || selectedParcel?.tier === "premium";
	(0, import_react.useEffect)(() => {
		if (!user || !supabaseBrowser) {
			setLoading(false);
			return;
		}
		(async () => {
			const [parcelResult, certificateResult] = await Promise.all([supabaseBrowser.from("parcels").select("id,parcel_number,tier,cities(name)").eq("owner_id", user.id).eq("status", "sold").order("created_at", { ascending: false }), supabaseBrowser.from("certificate_requests").select("parcel_id,status").eq("user_id", user.id)]);
			if (parcelResult.error) {
				console.error("Owned parcels for certificate creation failed", parcelResult.error);
				setParcels([]);
			} else {
				const existing = new Set((certificateResult.data ?? []).filter((r) => ACTIVE_CERTIFICATE_STATUSES.has(String(r.status))).map((r) => String(r.parcel_id)));
				const available = (parcelResult.data ?? []).filter((p) => !existing.has(p.id));
				setParcels(available);
				if (available.length === 1) setParcelId(available[0].id);
			}
			setLoading(false);
		})();
	}, [user]);
	(0, import_react.useEffect)(() => {
		if (!canPhysical) setPhysical(false);
	}, [canPhysical]);
	function updateField(key, value) {
		setForm((current) => ({
			...current,
			[key]: value
		}));
	}
	async function createCertificate() {
		if (!supabaseBrowser || !parcelId) return;
		if (physical && (!form.fullName.trim() || !form.phone.trim() || !form.address.trim() || !form.district.trim() || !form.city.trim())) {
			setError("Fiziksel sertifika için ad soyad, telefon, açık adres, ilçe ve il bilgilerini doldurun.");
			return;
		}
		setBusy(true);
		setMessage(null);
		setError(null);
		const { data: certificate, error: certificateError } = await supabaseBrowser.rpc("create_certificate_for_owned_parcel", { p_parcel_id: parcelId });
		if (certificateError) {
			setError({
				certificate_already_requested: "Bu parsel için zaten sertifika oluşturulmuş.",
				certificate_requires_owned_sold_parcel: "Sertifika yalnızca satın alınmış ve size ait parseller için oluşturulabilir.",
				invalid_parcel_tier: "Parselin sertifika seviyesi geçersiz."
			}[certificateError.message] || "Sertifika oluşturulamadı.");
			setBusy(false);
			return;
		}
		if (physical) {
			const { error: physicalError } = await supabaseBrowser.rpc("request_physical_certificate", {
				p_certificate_id: certificate.id,
				p_shipping_full_name: form.fullName,
				p_shipping_phone: form.phone,
				p_shipping_address_line: form.address,
				p_shipping_district: form.district,
				p_shipping_city: form.city,
				p_shipping_postal_code: form.postalCode || null,
				p_shipping_country: "Türkiye"
			});
			if (physicalError) {
				setError("Sertifika oluşturuldu ancak fiziksel sertifika talebi oluşturulamadı: " + physicalError.message);
				setBusy(false);
				return;
			}
		}
		setMessage(physical ? "Sertifikanız oluşturuldu. Fiziksel sertifika talebiniz adrese teslim edilmek üzere yöneticiye bildirildi." : "Sertifikanız başarıyla oluşturuldu. Yönetici onayı gerekmez.");
		setParcels((current) => current.filter((p) => p.id !== parcelId));
		setParcelId("");
		setPhysical(false);
		setForm({
			fullName: "",
			phone: "",
			address: "",
			district: "",
			city: "",
			postalCode: ""
		});
		setBusy(false);
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
								className: "inline-flex items-center gap-2 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-4 w-4" }), " Sertifikalarım"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "h-8 w-8 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "font-display text-3xl font-bold",
									children: "SERTİFİKA OLUŞTUR"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "Sahibi olduğunuz parsel için sertifikanızı kendiniz oluşturabilirsiniz. Dijital sertifikalarda fiziksel gönderim seçeneği bulunmaz."
								})] })]
							})]
						}),
						message && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel mt-6 flex items-start gap-3 p-5 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 h-5 w-5 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: message })]
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "panel mt-6 p-5 text-sm text-red-300",
							role: "alert",
							children: error
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mt-6 panel p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-semibold",
									children: "Parsel seçimi"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "Yalnızca satın aldığınız ve henüz sertifikası oluşturulmamış parseller listelenir."
								}),
								loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 text-sm text-muted-foreground",
									children: "Parseller yükleniyor..."
								}) : parcels.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 rounded-md border border-border p-4 text-sm text-muted-foreground",
									children: "Sertifika oluşturulabilecek satın alınmış parsel bulunmuyor."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "mt-4 block text-xs",
										children: ["Parsel", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: parcelId,
											onChange: (e) => setParcelId(e.target.value),
											className: "mt-1 w-full rounded-md border bg-background p-2.5 text-sm",
											required: true,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "",
												children: "Parsel seçin"
											}), parcels.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
												value: p.id,
												children: [
													p.parcel_number,
													" · ",
													p.city?.name || "Türkiye",
													" · ",
													TIER_LABELS[p.tier]
												]
											}, p.id))]
										})]
									}),
									selectedParcel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 rounded-md border border-gold/30 bg-gold/5 p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-semibold",
											children: [
												selectedParcel.parcel_number,
												" · ",
												TIER_LABELS[selectedParcel.tier]
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: "Sertifika oluşturma işlemi admin onayı beklemeden tamamlanır."
										})]
									}),
									canPhysical && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "mt-5 flex cursor-pointer items-start gap-3 rounded-md border border-border p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: physical,
											onChange: (e) => setPhysical(e.target.checked),
											className: "mt-1 h-4 w-4"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-2 font-semibold text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, { className: "h-4 w-4 text-gold" }), " Fiziksel sertifika istiyorum"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block text-xs text-muted-foreground",
											children: "Elit ve Premium parseller için fiziksel sertifika ayrıca talep edilebilir. Talep yöneticiye bildirilir."
										})] })]
									}),
									physical && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 grid gap-3 rounded-md border border-border p-4 md:grid-cols-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "text-xs",
												children: ["Ad Soyad", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													value: form.fullName,
													onChange: (e) => updateField("fullName", e.target.value),
													className: "mt-1 w-full rounded-md border bg-background p-2.5 text-sm",
													autoComplete: "name",
													required: true
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "text-xs",
												children: ["Telefon", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													value: form.phone,
													onChange: (e) => updateField("phone", e.target.value),
													className: "mt-1 w-full rounded-md border bg-background p-2.5 text-sm",
													autoComplete: "tel",
													required: true
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "text-xs",
												children: ["İl", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													value: form.city,
													onChange: (e) => updateField("city", e.target.value),
													className: "mt-1 w-full rounded-md border bg-background p-2.5 text-sm",
													autoComplete: "address-level1",
													required: true
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "text-xs",
												children: ["İlçe", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													value: form.district,
													onChange: (e) => updateField("district", e.target.value),
													className: "mt-1 w-full rounded-md border bg-background p-2.5 text-sm",
													autoComplete: "address-level2",
													required: true
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "text-xs",
												children: ["Posta Kodu", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													value: form.postalCode,
													onChange: (e) => updateField("postalCode", e.target.value),
													className: "mt-1 w-full rounded-md border bg-background p-2.5 text-sm",
													inputMode: "numeric",
													autoComplete: "postal-code"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
												className: "text-xs md:col-span-2",
												children: ["Açık Adres", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
													value: form.address,
													onChange: (e) => updateField("address", e.target.value),
													className: "mt-1 min-h-24 w-full rounded-md border bg-background p-2.5 text-sm",
													autoComplete: "street-address",
													required: true
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled: busy || !parcelId,
										onClick: () => void createCertificate(),
										className: "btn-gold mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs disabled:opacity-60",
										children: [busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), " SERTİFİKA OLUŞTUR"]
									})
								] })
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
