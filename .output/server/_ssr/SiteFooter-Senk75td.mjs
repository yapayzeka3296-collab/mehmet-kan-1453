import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as useAuth } from "./router-KMIfqJ_B.mjs";
import { H as Facebook, M as Instagram, c as Store, f as ShoppingCart, k as Linkedin, m as ShieldCheck, n as X, o as Twitter, t as Youtube, x as Menu } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SiteFooter-Senk75td.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "border-t border-border bg-navy-deep",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
		})
	});
}
//#endregion
export { SiteHeader as n, SiteFooter as t };
