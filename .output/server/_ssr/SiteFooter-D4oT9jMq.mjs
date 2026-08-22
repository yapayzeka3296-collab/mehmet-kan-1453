import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as useAuth } from "./router-BE67158d.mjs";
import { H as Facebook, M as Instagram, c as Store, f as ShoppingCart, k as Linkedin, m as ShieldCheck, n as X, o as Twitter, t as Youtube, x as Menu } from "../_libs/lucide-react.mjs";
import { t as require_lib } from "../_libs/qrcode.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SiteFooter-D4oT9jMq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lib = /* @__PURE__ */ __toESM(require_lib());
function Logo() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/",
		"aria-label": "MySkyParcel ana sayfa",
		className: "block shrink-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/myskyparcel-logo.svg",
			alt: "MySkyParcel — Gökyüzünde Sana Özel Bir Yer",
			className: "h-auto w-[180px] object-contain sm:w-[220px]",
			width: 1536,
			height: 526,
			decoding: "async"
		})
	});
}
var NAV_LINKS = [
	{
		label: "Ana Sayfa",
		to: "/"
	},
	{
		label: "MySkyParcel Nedir?",
		to: "/nasil-calisir"
	},
	{
		label: "Gökyüzü Haritası",
		to: "/gokyuzu-haritasi"
	},
	{
		label: "Koleksiyonum",
		to: "/parsellerim",
		requiresAuth: true
	},
	{
		label: "Dijital Sertifika",
		to: "/paketler"
	},
	{
		label: "Hakkımızda",
		to: "/hakkimizda"
	},
	{
		label: "SSS",
		to: "/hakkimizda",
		hash: "sss"
	},
	{
		label: "İletişim",
		to: "/iletisim"
	}
];
function SiteHeader() {
	const { user, loading: authLoading, isAdmin, signOut } = useAuth();
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const menuButtonRef = (0, import_react.useRef)(null);
	const closeButtonRef = (0, import_react.useRef)(null);
	const drawerRef = (0, import_react.useRef)(null);
	const isAuthenticated = !authLoading && !!user;
	const visibleNavLinks = NAV_LINKS.filter((item) => !("requiresAuth" in item) || !item.requiresAuth || isAuthenticated);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		closeButtonRef.current?.focus();
		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				event.preventDefault();
				setOpen(false);
				return;
			}
			if (event.key !== "Tab" || !drawerRef.current) return;
			const focusable = Array.from(drawerRef.current.querySelectorAll("a[href], button:not([disabled]), [tabindex]:not([tabindex=\"-1\"])")).filter((element) => !element.hasAttribute("aria-hidden"));
			if (focusable.length === 0) return;
			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			if (!first || !last) return;
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault();
				first.focus();
			}
		};
		const handlePointerDown = (event) => {
			if (drawerRef.current && !drawerRef.current.contains(event.target)) setOpen(false);
		};
		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("pointerdown", handlePointerDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("pointerdown", handlePointerDown);
			document.body.style.overflow = previousOverflow;
			menuButtonRef.current?.focus();
		};
	}, [open]);
	const closeMenu = () => setOpen(false);
	const handleSignOut = async () => {
		if ((await signOut()).success) {
			closeMenu();
			await navigate({ to: "/" });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-40 h-[80px] w-full border-b border-[#1E293B] bg-[color:var(--background)]/90 shadow-lg shadow-black/20 backdrop-blur-md",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex shrink-0 items-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					"aria-label": "Ana navigasyon",
					className: "hidden items-center gap-3 xl:flex 2xl:gap-5",
					children: [visibleNavLinks.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: item.to,
						hash: "hash" in item ? item.hash : void 0,
						search: item.to === "/gokyuzu-haritasi" ? { city: "istanbul" } : void 0,
						className: "relative whitespace-nowrap text-xs font-medium text-slate-300 transition-colors duration-200 hover:text-[#D4AF37] 2xl:text-sm",
						activeProps: { className: "text-[#D4AF37] after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:bg-[#D4AF37]" },
						children: item.label
					}, `${item.label}-${item.to}`)), isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/yonetim",
						className: "relative flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-[#D4AF37] transition-colors duration-200 hover:text-white 2xl:text-sm",
						activeProps: { className: "text-white" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4" }), " Yönetim"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden items-center gap-3 xl:flex 2xl:gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/pazar-yeri",
							"aria-label": "Pazar Yeri",
							title: "Pazar Yeri",
							className: "flex items-center gap-1.5 p-2 text-xs font-medium text-slate-300 transition-colors duration-200 hover:text-[#D4AF37] 2xl:text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-5 w-5" }),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PAZAR YERİ" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Sepet (henüz etkin değil)",
							title: "Sepet özelliği sonraki entegrasyonda etkinleştirilecek",
							className: "p-2 text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-5 w-5" })
						}),
						isAuthenticated ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/panelim",
							className: "rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors duration-200 hover:border-[#D4AF37] hover:text-[#D4AF37]",
							children: "Panelim"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void handleSignOut(),
							className: "rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black transition-colors duration-200 hover:bg-[#c29f2e]",
							children: "Çıkış Yap"
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/giris",
							className: "rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors duration-200 hover:border-[#D4AF37] hover:text-[#D4AF37]",
							children: "Giriş Yap"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/kayit-ol",
							className: "rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black transition-colors duration-200 hover:bg-[#c29e2e]",
							children: "Üye Ol"
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 xl:hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/pazar-yeri",
							"aria-label": "Pazar Yeri",
							title: "Pazar Yeri",
							className: "p-2 text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-6 w-6" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Sepet (henüz etkin değil)",
							title: "Sepet özelliği sonraki entegrasyonda etkinleştirilecek",
							className: "p-2 text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-6 w-6" })
						}),
						!open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							ref: menuButtonRef,
							type: "button",
							"aria-label": "Menüyü aç",
							"aria-expanded": "false",
							"aria-controls": "mobile-navigation",
							onClick: () => setOpen(true),
							className: "p-2 text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-7 w-7" })
						})
					]
				})
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-50 bg-black/70 backdrop-blur-sm xl:hidden",
			onClick: closeMenu,
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			ref: drawerRef,
			id: "mobile-navigation",
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Site menüsü",
			className: "fixed inset-y-0 right-0 z-50 flex h-[100dvh] max-h-[100dvh] w-[min(320px,calc(100vw-24px))] flex-col overflow-hidden border-l border-[#1E293B] bg-[color:var(--background)] p-6 pb-[calc(1rem+env(safe-area-inset-bottom))] xl:hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-h-0 flex-1 overflow-y-auto",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between border-b border-[#1E293B] pb-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-lg font-bold text-white",
						children: "Menü"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						ref: closeButtonRef,
						type: "button",
						onClick: closeMenu,
						"aria-label": "Menüyü kapat",
						className: "p-1 text-slate-400 hover:text-white",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-6 w-6" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					"aria-label": "Mobil site navigasyonu",
					className: "mt-6 flex flex-col gap-4 pb-4",
					children: [
						visibleNavLinks.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							hash: "hash" in item ? item.hash : void 0,
							search: item.to === "/gokyuzu-haritasi" ? { city: "istanbul" } : void 0,
							onClick: closeMenu,
							className: "text-base font-medium text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]",
							activeProps: { className: "font-semibold text-[#D4AF37]" },
							children: item.label
						}, `${item.label}-${item.to}`)),
						isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/yonetim",
							onClick: closeMenu,
							className: "flex items-center gap-2 text-base font-semibold text-[#D4AF37] transition-colors duration-200 hover:text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5" }), " Yönetim"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/pazar-yeri",
							onClick: closeMenu,
							className: "text-base font-medium text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]",
							children: "Pazar Yeri"
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "shrink-0 flex flex-col gap-2 border-t border-[#1E293B] bg-[color:var(--background)] pt-3",
				children: isAuthenticated ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/panelim",
						onClick: closeMenu,
						className: "w-full rounded-lg border border-slate-700 py-2.5 text-center text-sm font-medium text-slate-200 transition-colors duration-200 hover:border-[#D4AF37] hover:text-[#D4AF37]",
						children: "Panelim"
					}),
					isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/yonetim",
						onClick: closeMenu,
						className: "w-full rounded-lg border border-[#D4AF37] py-2.5 text-center text-sm font-semibold text-[#D4AF37]",
						children: "Yönetim Paneli"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => void handleSignOut(),
						className: "w-full rounded-lg bg-[#D4AF37] py-2.5 text-center text-sm font-semibold text-black transition-colors duration-200 hover:bg-[#c29e2e]",
						children: "Çıkış Yap"
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/giris",
					onClick: closeMenu,
					className: "w-full rounded-lg border border-slate-700 py-2.5 text-center text-sm font-medium text-slate-200 transition-colors duration-200 hover:border-[#D4AF37] hover:text-[#D4AF37]",
					children: "Giriş Yap"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/kayit-ol",
					onClick: closeMenu,
					className: "w-full rounded-lg bg-[#D4AF37] py-2.5 text-center text-sm font-semibold text-black transition-colors duration-200 hover:bg-[#c29e2e]",
					children: "Üye Ol"
				})] })
			})]
		})] })]
	});
}
var CERTIFICATE_TEMPLATE_PATHS = {
	digital: "/certificate-templates/digital.svg",
	special: "/certificate-templates/special.svg",
	premium: "/certificate-templates/premium.svg"
};
function templateTypeForTier(tier) {
	if (tier === "elite") return "special";
	return tier;
}
function certificateTierLabel(tier) {
	return {
		digital: "Dijital",
		elite: "Özel",
		premium: "Premium"
	}[tier];
}
function xmlEscape(value) {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
}
async function qrDataUrl(verificationUrl) {
	return import_lib.toDataURL(verificationUrl, {
		errorCorrectionLevel: "M",
		margin: 2,
		width: 240,
		color: {
			dark: "#000000",
			light: "#ffffff"
		}
	});
}
function holderFontSize(templateType, holderName) {
	const base = {
		digital: 50,
		special: 48,
		premium: 56
	}[templateType];
	const minimum = {
		digital: 32,
		special: 30,
		premium: 34
	}[templateType];
	const length = Array.from(holderName.trim()).length;
	if (length <= 18) return base;
	return Math.max(minimum, Math.round(base - (length - 18) * 1.8));
}
async function renderCertificateSvg(args) {
	const response = await fetch(CERTIFICATE_TEMPLATE_PATHS[args.templateType]);
	if (!response.ok) throw new Error("certificate_template_unavailable");
	let svg = await response.text();
	const holderName = args.holderName || "MySkyParcel Kullanıcısı";
	const qr = await qrDataUrl(args.verificationUrl);
	const values = {
		HOLDER_NAME: xmlEscape(holderName),
		HOLDER_NAME_FONT_SIZE: String(holderFontSize(args.templateType, holderName)),
		PARCEL_CODE: xmlEscape(args.parcelCode),
		CITY_NAME: xmlEscape(args.cityName || "Türkiye"),
		CERTIFICATE_NUMBER: xmlEscape(args.certificateNumber),
		ISSUE_DATE: xmlEscape(args.issueDate),
		FINGERPRINT_SHORT: xmlEscape((args.fingerprint || "").slice(0, 18)),
		QR_IMAGE_URL: xmlEscape(qr)
	};
	for (const [key, value] of Object.entries(values)) svg = svg.replaceAll(`{{${key}}}`, value);
	return svg;
}
function downloadSvg(svg, filename) {
	const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}
function printCertificate(svg, title = "MySkyParcel Sertifika") {
	const printWindow = window.open("", "_blank", "width=1200,height=850");
	if (!printWindow) throw new Error("print_window_blocked");
	printWindow.document.write(`<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${xmlEscape(title)}</title><style>@page{size:A4 landscape;margin:0}html,body{margin:0;width:100%;height:100%;background:#fff}body{display:grid;place-items:center}svg{width:100vw;height:100vh;max-width:297mm;max-height:210mm}</style></head><body>${svg}</body></html>`);
	printWindow.document.close();
	printWindow.focus();
	window.setTimeout(() => printWindow.print(), 350);
}
var DEMO_DATA = {
	holderName: "Örnek Kullanıcı",
	parcelCode: "MSP-DEMO-001",
	cityName: "Gaziantep",
	certificateNumber: "MSP-DEMO-2026",
	issueDate: "18.08.2026",
	fingerprint: "DEMO-CERTIFICATE-PREVIEW",
	verificationUrl: "https://myskyparcel.com/verify/demo-preview"
};
function CertificateTemplatePreview({ tier, className = "" }) {
	const templateType = tier === "elite" ? "special" : tier;
	const [src, setSrc] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		async function loadPreview() {
			try {
				const svg = await renderCertificateSvg({
					templateType,
					...DEMO_DATA
				});
				if (cancelled) return;
				setSrc(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
			} catch {
				if (!cancelled) setSrc("");
			}
		}
		loadPreview();
		return () => {
			cancelled = true;
		};
	}, [templateType]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `min-w-0 ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative w-full overflow-hidden rounded-lg border border-gold/30 bg-slate-950 shadow-lg",
			children: src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt: `${certificateTierLabel(tier)} MySkyParcel sertifika şablonu`,
				width: 1122,
				height: 794,
				decoding: "async",
				className: "block h-auto w-full"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex aspect-[1122/794] w-full items-center justify-center text-sm text-white/70",
				children: "Sertifika önizlemesi hazırlanıyor…"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[10px] font-semibold uppercase tracking-[0.16em] text-gold",
				children: [certificateTierLabel(tier), " Sertifika"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-[9px] text-muted-foreground",
				children: "Örnek tasarım önizlemesi"
			})]
		})]
	});
}
var LEGAL = [
	{
		label: "ÜYELİK SÖZLEŞMESİ",
		to: "/uyelik-sozlesmesi"
	},
	{
		label: "KVKK",
		to: "/kvkk"
	},
	{
		label: "GİZLİLİK POLİTİKASI",
		to: "/gizlilik-politikasi"
	},
	{
		label: "KULLANIM ŞARTLARI",
		to: "/kullanim-sartlari"
	},
	{
		label: "ÇEREZ POLİTİKASI",
		to: "/cerez-politikasi"
	}
];
var CURRENT_YEAR = (/* @__PURE__ */ new Date()).getFullYear();
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "border-t border-border bg-navy-deep",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "border-b border-gold/15 bg-background/10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-[1600px] px-4 py-6 lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] font-semibold uppercase tracking-[0.2em] text-gold",
						children: "MY SKYPARCEL SERTİFİKALARI"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Digital · Özel · Premium sertifika tasarımlarını inceleyin."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CertificateTemplatePreview, { tier: "digital" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CertificateTemplatePreview, { tier: "elite" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CertificateTemplatePreview, { tier: "premium" })
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-[1600px] gap-5 px-4 py-6 text-xs text-muted-foreground lg:grid-cols-[auto_1fr_auto] lg:items-center lg:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
					"© ",
					CURRENT_YEAR,
					" MySkyParcel Türkiye | Tüm hakları saklıdır."
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-center",
					"aria-label": "Hukuki sayfalar",
					children: LEGAL.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: item.to,
						className: "tracking-[0.06em] text-gold/70 transition-colors hover:text-gold",
						children: item.label
					}) }, item.label))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex items-center gap-3 lg:justify-end",
					"aria-label": "Sosyal medya",
					children: [
						Facebook,
						Instagram,
						Twitter,
						Youtube,
						Linkedin
					].map((Icon, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-label": "Sosyal medya bağlantısı henüz tanımlı değil",
						title: "Sosyal medya bağlantısı henüz tanımlı değil",
						className: "grid h-8 w-8 place-items-center rounded-full border border-gold/50 text-gold/70",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
							className: "h-3.5 w-3.5",
							"aria-hidden": "true"
						})
					}) }, i))
				})
			]
		})]
	});
}
//#endregion
export { downloadSvg as a, templateTypeForTier as c, certificateTierLabel as i, SiteFooter as n, printCertificate as o, SiteHeader as r, renderCertificateSvg as s, CertificateTemplatePreview as t };
