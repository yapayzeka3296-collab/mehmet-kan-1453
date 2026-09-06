import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, v as require_react_dom, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as supabaseBrowser, s as useAuth } from "./router-190-9nI5.mjs";
import { Z as Eye, dt as Award, g as ShieldCheck, n as X, v as Share2, x as RefreshCw } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-DX7D9obs.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
import { n as TrustBar, t as SECURITY_TRUST } from "./TrustBar-Ci8UbTsR.mjs";
import { t as UserSidebar } from "./UserSidebar-CiRTDePR.mjs";
import { a as renderCertificateSvg, i as printCertificate, n as certificateTierLabel, o as templateTypeForTier, r as downloadSvg } from "./certificateTemplates-BoULmo9y.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sertifikalarim-B7fqXMiQ.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = require_react_dom();
function CertificateRenderer({ certificate }) {
	const [svg, setSvg] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function load() {
			setLoading(true);
			setError(null);
			try {
				if (!certificate.certificate_number || certificate.status !== "issued") throw new Error("certificate_not_issued");
				const relativeVerificationUrl = certificate.verification_url || `/sertifika-dogrula?code=${encodeURIComponent(certificate.certificate_number)}`;
				const verificationUrl = new URL(relativeVerificationUrl, window.location.origin).toString();
				const result = await renderCertificateSvg({
					templateType: templateTypeForTier(certificate.tier),
					holderName: certificate.holder_name_snapshot || "MySkyParcel Kullanıcısı",
					parcelCode: certificate.parcel?.parcel_number || certificate.parcel_id,
					cityName: certificate.city_name_snapshot || "Türkiye",
					certificateNumber: certificate.certificate_number,
					issueDate: certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString("tr-TR") : "—",
					fingerprint: certificate.certificate_fingerprint ?? null,
					verificationUrl
				});
				if (!cancelled) setSvg(result);
			} catch (err) {
				console.error("Certificate render failed", err);
				if (!cancelled) setError("Sertifika tasarımı yüklenemedi.");
			} finally {
				if (!cancelled) setLoading(false);
			}
		}
		load();
		return () => {
			cancelled = true;
		};
	}, [certificate]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel grid min-h-[300px] place-items-center p-6 text-sm text-muted-foreground",
		children: "Sertifika hazırlanıyor..."
	});
	if (error || !svg) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel p-6 text-sm text-red-300",
		children: error || "Sertifika hazırlanamadı."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "certificate-print-surface space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-hidden rounded-xl border border-gold/30 bg-black/20 shadow-2xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "aspect-[1122/794] w-full [&>svg]:block [&>svg]:h-full [&>svg]:w-full",
					dangerouslySetInnerHTML: { __html: svg }
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "btn-gold rounded-md px-4 py-2 text-xs",
					onClick: () => printCertificate(svg, `${certificateTierLabel(certificate.tier)} Sertifika`),
					children: "PDF / Yazdır"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "rounded-md border border-input px-4 py-2 text-xs hover:bg-accent",
					onClick: () => downloadSvg(svg, `${certificate.certificate_number}.svg`),
					children: "SVG İndir"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-muted-foreground",
				children: "PDF / Yazdır düğmesi tarayıcının yüksek kaliteli yazdırma ekranını açar; buradan “PDF olarak kaydet” seçilebilir. Sertifikanın QR kodu doğrulama adresine yönlendirir."
			})
		]
	});
}
var TIER_LABELS = {
	digital: "Dijital",
	elite: "Özel",
	premium: "Premium"
};
var STATUS_LABELS = {
	requested: "Talep edildi",
	approved: "Onaylandı",
	issued: "Yayınlandı",
	rejected: "Reddedildi",
	revoked: "İptal edildi"
};
async function shareCertificate(certificate) {
	const code = certificate.certificate_number;
	const url = code ? `${window.location.origin}/sertifika-dogrula?code=${encodeURIComponent(code)}` : `${window.location.origin}/sertifikalarim`;
	const title = `${TIER_LABELS[certificate.tier]} MySkyParcel Sertifikası`;
	if (navigator.share) {
		await navigator.share({
			title,
			text: `MySkyParcel sertifikası: ${code || "Sertifika"}`,
			url
		});
		return;
	}
	await navigator.clipboard.writeText(url);
}
function CertificateModal({ certificate, onClose }) {
	(0, import_react.useEffect)(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		window.dispatchEvent(new Event("msp:close-overlays"));
		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				event.preventDefault();
				onClose();
			}
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = previousOverflow;
		};
	}, [onClose]);
	if (typeof document === "undefined") return null;
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[10000] overflow-y-auto bg-black/80 p-3 sm:p-6",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Sertifika önizleme",
		onPointerDown: (event) => {
			if (event.target === event.currentTarget) onClose();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto w-full max-w-[576px] py-4 sm:py-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute right-0 top-0 z-[10010] sm:-right-2 sm:top-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					className: "rounded-full border border-border bg-background/95 p-2 shadow-lg hover:border-gold",
					"aria-label": "Önizlemeyi kapat",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CertificateRenderer, { certificate })]
		})
	}), document.body);
}
function Sertifikalarim() {
	const { user, loading: authLoading } = useAuth();
	const [certificates, setCertificates] = (0, import_react.useState)([]);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const [sharingId, setSharingId] = (0, import_react.useState)(null);
	const loadCertificates = (0, import_react.useCallback)(async () => {
		if (!user || !supabaseBrowser) {
			setCertificates([]);
			setLoading(false);
			return;
		}
		setLoading(true);
		setError(null);
		const { data, error: queryError } = await supabaseBrowser.from("certificate_requests").select("id,parcel_id,tier,status,certificate_number,requested_at,issued_at,holder_name_snapshot,city_name_snapshot,certificate_fingerprint,verification_url,parcel:parcels(parcel_number)").eq("user_id", user.id).order("requested_at", { ascending: false });
		if (queryError) {
			console.error("Certificate query failed", queryError);
			setError("Sertifika kayıtları yüklenemedi.");
		} else setCertificates(data ?? []);
		setLoading(false);
	}, [user]);
	(0, import_react.useEffect)(() => {
		loadCertificates();
	}, [loadCertificates]);
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
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserSidebar, { active: "/sertifikalarim" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-3xl font-bold",
								children: "SERTİFİKALARIM"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: "MySkyParcel sertifikalarınız, doğrulama bilgileri ve güncel şablonlarıyla birlikte burada saklanır."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/sertifika-talep",
									className: "btn-gold rounded-md px-3 py-2 text-xs",
									children: "SERTİFİKA OLUŞTUR"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => void loadCertificates(),
									className: "rounded-md border border-input px-3 py-2 text-xs hover:bg-accent",
									"aria-label": "Sertifikaları yenile",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "mr-2 inline h-3.5 w-3.5" }), " Yenile"]
								})]
							})]
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "panel mt-6 p-6 text-sm text-red-300",
							role: "alert",
							children: error
						}),
						loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "panel mt-6 p-6 text-sm text-muted-foreground",
							children: "Sertifika kayıtları yükleniyor..."
						}),
						!loading && !error && certificates.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel mt-6 p-8 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "mx-auto h-12 w-12 text-gold" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-4 font-display text-xl",
									children: "Henüz sertifika kaydınız yok"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mx-auto mt-2 max-w-lg text-sm text-muted-foreground",
									children: "Sahip olduğunuz bir parsel için sertifikanızı kendiniz oluşturabilirsiniz."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/sertifika-talep",
									className: "btn-gold mt-5 inline-flex rounded-md px-5 py-2.5 text-xs",
									children: "SERTİFİKA OLUŞTUR"
								})
							]
						}),
						!loading && !error && certificates.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "mt-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-xl",
									children: "SERTİFİKA KAYITLARIM"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "Şablonlar DİJİTAL, ÖZEL ve PREMIUM olarak ayrılır. Yayınlanmış sertifikalar doğrulama, paylaşma ve yazdırma/PDF akışına sahiptir."
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
								children: certificates.map((certificate) => {
									const parcelNumber = certificate.parcel?.parcel_number || certificate.parcel_id;
									const issued = certificate.status === "issued";
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "panel p-5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start justify-between gap-4",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "font-display text-lg",
													children: [TIER_LABELS[certificate.tier], " Sertifika"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-xs text-gold",
													children: ["Parsel: ", parcelNumber]
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Award, { className: "h-5 w-5 shrink-0 text-gold" })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
												className: "mt-4 space-y-2 text-xs text-muted-foreground",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between gap-4",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Durum" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
															className: "text-foreground",
															children: STATUS_LABELS[certificate.status]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between gap-4",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Sertifika No" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
															className: "text-right text-foreground",
															children: certificate.certificate_number || "—"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between gap-4",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", { children: "Düzenlenme" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
															className: "text-foreground",
															children: certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString("tr-TR") : "—"
														})]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-5 flex flex-wrap gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														type: "button",
														disabled: !issued,
														onClick: () => setSelected(certificate),
														className: "inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-xs hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" }), " Görüntüle"]
													}),
													issued && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														type: "button",
														disabled: sharingId === certificate.id,
														onClick: async () => {
															setSharingId(certificate.id);
															try {
																await shareCertificate(certificate);
															} catch (shareError) {
																if (shareError?.name !== "AbortError") console.error("Certificate share failed", shareError);
															} finally {
																setSharingId(null);
															}
														},
														className: "inline-flex items-center gap-2 rounded-md border border-cyan-300/30 px-3 py-2 text-xs text-cyan-200 hover:bg-cyan-300/10 disabled:opacity-50",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "h-3.5 w-3.5" }),
															" ",
															sharingId === certificate.id ? "Paylaşılıyor…" : "Paylaş"
														]
													}),
													issued && certificate.certificate_number && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
														href: `/sertifika-dogrula?code=${encodeURIComponent(certificate.certificate_number)}`,
														target: "_blank",
														rel: "noreferrer",
														className: "inline-flex items-center gap-2 rounded-md border border-gold/40 px-3 py-2 text-xs text-gold hover:bg-gold/10",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" }), " Doğrula"]
													})
												]
											})
										]
									}, certificate.id);
								})
							})]
						})
					]
				})]
			}),
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CertificateModal, {
				certificate: selected,
				onClose: () => setSelected(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustBar, { items: SECURITY_TRUST }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Sertifikalarim as component };
