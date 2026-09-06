import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as useNavigate, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as supabaseBrowser, s as useAuth } from "./router-DCBTj4gL.mjs";
import { K as Globe, b as Search, d as Star, dt as Award, lt as Bell } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-DpuTXk5g.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
import { t as UserSidebar } from "./UserSidebar-_91KuVp3.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/panelim-DqUV9aC4.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var emptyStats = [
	{
		key: "parcels",
		icon: Globe,
		title: "Parsellerim"
	},
	{
		key: "certificates",
		icon: Award,
		title: "Sertifikalarım"
	},
	{
		key: "favorites",
		icon: Star,
		title: "Favorilerim"
	}
];
var formatTier = (tier) => tier === "premium" ? "Premium" : tier === "elite" ? "Elit" : tier === "digital" ? "Dijital" : "-";
function Panelim() {
	const { user, loading } = useAuth();
	const navigate = useNavigate({ from: "/panelim" });
	const userId = user?.id;
	const [parcels, setParcels] = (0, import_react.useState)([]);
	const [parcelCount, setParcelCount] = (0, import_react.useState)(0);
	const [certificates, setCertificates] = (0, import_react.useState)([]);
	const [certificateCount, setCertificateCount] = (0, import_react.useState)(0);
	const [dataLoading, setDataLoading] = (0, import_react.useState)(true);
	const [dataErrors, setDataErrors] = (0, import_react.useState)([]);
	const [cities, setCities] = (0, import_react.useState)([]);
	const [searchCity, setSearchCity] = (0, import_react.useState)("");
	const [searchNumber, setSearchNumber] = (0, import_react.useState)("");
	const [searching, setSearching] = (0, import_react.useState)(false);
	const [searchResults, setSearchResults] = (0, import_react.useState)([]);
	const [searchError, setSearchError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const client = supabaseBrowser;
		if (!userId || !client) return;
		let cancelled = false;
		const loadDashboard = async () => {
			const [parcelResult, certificateResult, cityResult] = await Promise.all([
				client.from("parcels").select("id, parcel_number, status, price, city_id, tier", { count: "exact" }).eq("owner_id", userId).eq("status", "sold").order("updated_at", { ascending: false }).order("parcel_number", { ascending: true }).limit(100),
				client.from("certificate_requests").select("id, parcel_id, tier, status, certificate_number, created_at", { count: "exact" }).eq("user_id", userId).order("created_at", { ascending: false }).limit(100),
				client.from("cities").select("slug,name").order("name", { ascending: true })
			]);
			if (cancelled) return;
			const errors = [];
			if (parcelResult.error) {
				console.error("Parseller yüklenemedi", parcelResult.error);
				errors.push("Parsellerim");
			}
			if (certificateResult.error) {
				console.error("Sertifikalar yüklenemedi", certificateResult.error);
				errors.push("Sertifikalarım");
			}
			if (cityResult.error) console.error("İller yüklenemedi", cityResult.error);
			setParcels(parcelResult.data ?? []);
			setParcelCount(parcelResult.count ?? 0);
			setCertificates(certificateResult.data ?? []);
			setCertificateCount(certificateResult.count ?? 0);
			setCities(cityResult.data ?? []);
			setDataErrors(errors);
			setDataLoading(false);
		};
		loadDashboard();
		return () => {
			cancelled = true;
		};
	}, [userId]);
	async function searchParcel() {
		if (!supabaseBrowser || !searchCity || !searchNumber.trim()) return;
		setSearching(true);
		setSearchError("");
		setSearchResults([]);
		const { data, error } = await supabaseBrowser.rpc("search_available_parcels", {
			p_city_slug: searchCity,
			p_query: searchNumber.trim()
		});
		if (error) setSearchError("Parsel aranırken bir hata oluştu.");
		else setSearchResults(data ?? []);
		setSearching(false);
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "starfield min-h-screen",
		"aria-busy": "true"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/giris",
		replace: true
	});
	const stats = {
		parcels: parcelCount,
		certificates: certificateCount,
		favorites: "—"
	};
	const pendingCertificateCount = certificates.filter((certificate) => certificate.status === "requested").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserSidebar, { active: "/panelim" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "min-w-0",
					"aria-label": "Kullanıcı paneli",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel p-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-3xl font-bold",
								children: "PANELİM"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: "Hesabınızın güncel durumu"
							})]
						}),
						pendingCertificateCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 rounded-lg border border-gold/40 bg-gold/10 p-4",
							role: "status",
							"aria-live": "polite",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "mt-0.5 h-5 w-5 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-display text-sm text-gold",
										children: "SERTİFİKA TALEBİNİZ ALINDI"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: [pendingCertificateCount === 1 ? "Sertifika talebiniz" : `${pendingCertificateCount} sertifika talebiniz`, " başarıyla alındı ve yönetici onayı bekliyor."]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => void navigate({ to: "/sertifikalarim" }),
										className: "mt-3 rounded-md border border-gold/40 px-3 py-2 text-xs text-gold hover:bg-gold/10",
										children: "SERTİFİKALARIMI GÖR"
									})
								] })]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
							children: emptyStats.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "panel flex min-w-0 items-center gap-4 p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "h-8 w-8 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-2xl",
									children: dataLoading ? "…" : stats[item.key]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm",
									children: item.title
								})] })]
							}, item.title))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "panel mt-6 p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-5 w-5 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-base tracking-[0.06em]",
										children: "PARSEL ARA"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: "81 ilden istediğiniz parsel numarasını Supabase kayıtlarından arayın."
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: (e) => {
										e.preventDefault();
										searchParcel();
									},
									className: "mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: searchCity,
											onChange: (e) => setSearchCity(e.target.value),
											className: "rounded-md border border-border bg-background/40 px-3 py-3 text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "",
												children: "İl seçin"
											}), cities.map((city) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: city.slug,
												children: city.name
											}, city.slug))]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: searchNumber,
											onChange: (e) => setSearchNumber(e.target.value),
											placeholder: "Parsel numarası",
											className: "rounded-md border border-border bg-background/40 px-3 py-3 text-sm"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "submit",
											disabled: searching || !searchCity || !searchNumber.trim(),
											className: "btn-gold inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-xs disabled:opacity-50",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" }), searching ? "ARANIYOR…" : "ARA"]
										})
									]
								}),
								searchError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-sm text-destructive",
									children: searchError
								}),
								!searching && searchCity && searchNumber.trim() && searchResults.length === 0 && !searchError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-sm text-muted-foreground",
									children: "Satışa uygun parsel bulunamadı."
								}),
								searchResults.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-5 space-y-3",
									children: searchResults.map((parcel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col gap-4 rounded-lg border border-border/70 bg-background/30 p-4 sm:flex-row sm:items-center sm:justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-sm",
											children: parcel.parcel_number
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: [
												formatTier(parcel.tier),
												" · ",
												Number(parcel.price).toLocaleString("tr-TR"),
												" TL · Satışa uygun"
											]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => void navigate({
												to: "/parsel-satin-al",
												search: {
													parcels: parcel.id,
													certificateParcel: parcel.id
												}
											}),
											className: "btn-gold rounded-md px-5 py-3 text-xs",
											children: "SATIN AL"
										})]
									}, parcel.id))
								})
							]
						}),
						dataErrors.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-muted-foreground",
							children: [
								"Bazı panel verileri yüklenemedi: ",
								dataErrors.join(", "),
								"."
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 grid gap-6 xl:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "panel p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-base tracking-[0.06em]",
										children: "SON PARSELLERİM"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: dataLoading ? "…" : parcelCount
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-6 space-y-3",
									children: dataLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-dashed border-border p-8 text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "mx-auto h-8 w-8 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-sm text-muted-foreground",
											children: "Parseller yükleniyor…"
										})]
									}) : parcels.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-dashed border-border p-8 text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "mx-auto h-8 w-8 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-sm text-muted-foreground",
											children: "Henüz satın alınmış parsel bulunmuyor."
										})]
									}) : parcels.map((parcel) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-border/70 bg-background/30 p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-display text-sm",
												children: parcel.parcel_number
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-gold",
												children: formatTier(parcel.tier)
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: "Parsel durumu: Satıldı"
										})]
									}, parcel.id))
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
								className: "panel p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-base tracking-[0.06em]",
										children: "SON SERTİFİKALARIM"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: dataLoading ? "…" : certificateCount
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-6 space-y-3",
									children: dataLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-dashed border-border p-8 text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "mx-auto h-8 w-8 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-sm text-muted-foreground",
											children: "Sertifikalar yükleniyor…"
										})]
									}) : certificates.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-dashed border-border p-8 text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "mx-auto h-8 w-8 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-sm text-muted-foreground",
											children: "Henüz sertifika bulunmuyor."
										})]
									}) : certificates.slice(0, 6).map((certificate) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-border/70 bg-background/30 p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-display text-sm",
												children: certificate.certificate_number ?? "Sertifika"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs text-gold",
												children: formatTier(certificate.tier)
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: ["Durum: ", certificate.status]
										})]
									}, certificate.id))
								})]
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Panelim as component };
