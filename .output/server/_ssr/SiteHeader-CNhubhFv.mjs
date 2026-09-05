import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as useAuth } from "./router-va4RVshJ.mjs";
import { t as Logo } from "./Logo-DCMsOb-H.mjs";
import { E as Menu, W as Globe, c as Store, f as ShoppingCart, m as ShieldCheck, n as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/SiteHeader-CNhubhFv.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var PARCEL_CART_KEY = "myskyparcel_cart";
var PARCEL_CART_EVENT = "myskyparcel-cart-updated";
var TIER_PRICES = {
	digital: 149,
	elite: 349,
	premium: 699
};
function readParcelCart() {
	if (typeof window === "undefined") return [];
	try {
		if (window.location.pathname === "/parsel-satin-al") {
			window.localStorage.removeItem(PARCEL_CART_KEY);
			return [];
		}
		const raw = window.localStorage.getItem(PARCEL_CART_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter((item) => Boolean(item?.id && item?.parcel_number && [
			"digital",
			"elite",
			"premium"
		].includes(item?.tier))).map((item) => ({
			...item,
			tier_price: TIER_PRICES[item.tier]
		}));
	} catch {
		return [];
	}
}
function writeParcelCart(items) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(PARCEL_CART_KEY, JSON.stringify(items));
	window.dispatchEvent(new CustomEvent(PARCEL_CART_EVENT, { detail: items }));
}
function removeParcelFromCart(id) {
	writeParcelCart(readParcelCart().filter((item) => item.id !== id));
}
var NAV_LINKS = [
	{
		label: "Ana Sayfa",
		to: "/ana-sayfa"
	},
	{
		label: "Gökyüzü Haritası",
		to: "/turkiye-haritasi"
	},
	{
		label: "MySkyParcel Nedir?",
		to: "/nasil-calisir"
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
		to: "/destek"
	}
];
var tierName = (tier) => tier === "digital" ? "Dijital" : tier === "elite" ? "Özel" : "Premium";
function SiteHeader({ variant = "default" }) {
	const { user, loading: authLoading, isAdmin, signOut } = useAuth();
	const navigate = useNavigate();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [cartOpen, setCartOpen] = (0, import_react.useState)(false);
	const [cart, setCart] = (0, import_react.useState)([]);
	const menuButtonRef = (0, import_react.useRef)(null);
	const closeButtonRef = (0, import_react.useRef)(null);
	const drawerRef = (0, import_react.useRef)(null);
	const cartRefs = (0, import_react.useRef)([]);
	const isAuthenticated = !authLoading && !!user;
	const visibleNavLinks = NAV_LINKS.filter((item) => !("requiresAuth" in item) || !item.requiresAuth || isAuthenticated);
	const cartTotal = cart.reduce((sum, item) => sum + Number(item.tier_price), 0);
	const light = variant === "light-bg";
	const navText = light ? "text-slate-800" : "text-slate-300";
	const navHover = light ? "hover:text-slate-950" : "hover:text-[#D4AF37]";
	(0, import_react.useEffect)(() => {
		const sync = () => setCart(readParcelCart());
		sync();
		window.addEventListener(PARCEL_CART_EVENT, sync);
		window.addEventListener("storage", sync);
		return () => {
			window.removeEventListener(PARCEL_CART_EVENT, sync);
			window.removeEventListener("storage", sync);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const closeHeaderOverlays = () => {
			setOpen(false);
			setCartOpen(false);
		};
		window.addEventListener("msp:close-overlays", closeHeaderOverlays);
		return () => window.removeEventListener("msp:close-overlays", closeHeaderOverlays);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!cartOpen) return;
		const close = (event) => {
			const target = event.target;
			if (!cartRefs.current.some((element) => element?.contains(target))) setCartOpen(false);
		};
		document.addEventListener("pointerdown", close);
		return () => document.removeEventListener("pointerdown", close);
	}, [cartOpen]);
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
		};
		const outside = (event) => {
			if (drawerRef.current && !drawerRef.current.contains(event.target)) setOpen(false);
		};
		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("pointerdown", outside);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("pointerdown", outside);
			document.body.style.overflow = previousOverflow;
			menuButtonRef.current?.focus();
		};
	}, [open]);
	const closeMenu = () => setOpen(false);
	const handleSignOut = async () => {
		if ((await signOut()).success) {
			closeMenu();
			await navigate({ to: "/ana-sayfa" });
		}
	};
	const goCheckout = () => {
		if (!cart.length || authLoading) return;
		const checkoutPath = `/parsel-satin-al?parcels=${encodeURIComponent(cart.map((item) => item.id).join(","))}`;
		setCartOpen(false);
		if (!isAuthenticated) {
			window.location.assign(`/giris?redirect=${encodeURIComponent(checkoutPath)}`);
			return;
		}
		navigate({
			to: "/parsel-satin-al",
			search: { parcels: cart.map((item) => item.id).join(",") }
		});
	};
	const cartButton = (mobile = false) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: (element) => {
			cartRefs.current[mobile ? 1 : 0] = element;
		},
		className: `relative z-[210] shrink-0 ${mobile ? "translate-x-0" : "-translate-x-1"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			"aria-label": "Sepetim",
			title: "Sepetim",
			"aria-expanded": cartOpen,
			onClick: () => setCartOpen((value) => !value),
			className: `relative p-2 transition-colors duration-200 ${light ? "text-slate-800 hover:text-slate-950" : "text-slate-300 hover:text-[#D4AF37]"}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: mobile ? "h-6 w-6" : "h-5 w-5" }), cart.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-[#D4AF37] px-1 text-center text-[10px] font-bold leading-5 text-black",
				children: cart.length
			})]
		}), cartOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `absolute right-0 top-full z-[1100] mt-2 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-cyan-300/20 bg-slate-950/95 shadow-2xl shadow-black/70 backdrop-blur-xl ring-1 ring-white/5 ${mobile ? "fixed !right-0 !left-auto !top-[80px] !mt-0 !w-[160px] !min-w-0 !max-w-[160px] !translate-x-0 !bg-black max-h-[58vh]" : ""}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-w-0 items-center justify-between border-b border-white/10 bg-slate-900/80 px-2 py-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 max-w-[52px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm font-semibold text-white",
						children: "Sepetim"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "truncate text-[10px] text-white/45",
						children: [cart.length, " parsel seçildi"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setCartOpen(false),
					className: "shrink-0 p-1 text-white/50 hover:text-white",
					"aria-label": "Sepeti kapat",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})]
			}), cart.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-48 min-w-0 overflow-y-auto overflow-x-hidden p-1.5",
				children: cart.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-center gap-1 border-b border-white/5 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1 overflow-hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[10px] font-semibold text-white",
								children: item.parcel_number
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-[8px] text-white/45",
								children: [
									item.city_name ?? "MySkyParcel",
									" · ",
									tierName(item.tier)
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "shrink-0 text-[9px] font-semibold text-[#D4AF37]",
							children: [item.tier_price.toLocaleString("tr-TR"), " TL"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onPointerDown: (event) => event.stopPropagation(),
							onClick: (event) => {
								event.preventDefault();
								event.stopPropagation();
								removeParcelFromCart(item.id);
							},
							"aria-label": `${item.parcel_number} parselini kaldır`,
							className: "shrink-0 rounded-full p-0.5 text-white/45 hover:bg-red-500/10 hover:text-red-300",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
						})
					]
				}, item.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-white/10 bg-slate-900/60 p-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex min-w-0 flex-col items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-[8px] text-white/55",
						children: "Toplam"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
						className: "text-xs text-[#D4AF37]",
						children: [cartTotal.toLocaleString("tr-TR"), " TL"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: goCheckout,
					disabled: authLoading,
					className: "w-full rounded-lg bg-[#D4AF37] px-1 py-2 text-[9px] font-bold text-black hover:bg-[#c29e2e] disabled:cursor-wait disabled:opacity-60",
					children: authLoading ? "KONTROL..." : "Ödemeye Geç"
				})]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-2 text-center text-[9px] text-white/50",
				children: "Sepetinizde henüz parsel yok."
			})]
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: `sticky top-0 z-[1000] h-[80px] w-full border-b shadow-lg backdrop-blur-md ${light ? "border-slate-300/70 bg-white/75 shadow-slate-900/10" : "border-[#1E293B] bg-[color:var(--background)]/90 shadow-black/20"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex h-full min-w-0 max-w-[1800px] items-center gap-2 px-3 sm:gap-3 sm:px-5 lg:gap-3 lg:px-8 2xl:gap-4 2xl:px-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 shrink-0 items-center gap-1.5 lg:gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						"aria-label": "Küre sayfası",
						title: "Küre",
						className: `group flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${light ? "border-slate-400/70 bg-white/60 text-slate-800 hover:border-slate-600 hover:bg-white/80" : "border-cyan-300/30 bg-slate-900/70 text-cyan-200 hover:border-cyan-200/70 hover:bg-cyan-300/10 hover:text-cyan-100"}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-5 w-5 transition-transform group-hover:rotate-12" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					"aria-label": "Ana navigasyon",
					className: "hidden min-w-0 flex-1 flex-wrap items-center justify-center gap-x-2 gap-y-1 px-1 xl:flex 2xl:gap-x-3",
					children: [visibleNavLinks.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: item.to,
						hash: "hash" in item ? item.hash : void 0,
						className: `relative shrink-0 whitespace-nowrap text-[11px] font-medium transition-colors 2xl:text-sm ${navText} ${navHover}`,
						children: item.label
					}, `${item.label}-${item.to}`)), isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/yonetim",
						className: "relative flex shrink-0 items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-[#D4AF37] 2xl:text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4" }), " Yönetim"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hidden shrink-0 items-center justify-end gap-1 xl:flex 2xl:gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/pazar-yeri",
							"aria-label": "Pazar Yeri",
							title: "Pazar Yeri",
							className: `flex shrink-0 items-center gap-1 whitespace-nowrap p-1.5 text-[11px] font-medium 2xl:gap-1.5 2xl:p-2 2xl:text-xs ${navText} ${navHover}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-5 w-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PAZAR YERİ" })]
						}),
						cartButton(),
						isAuthenticated ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/panelim",
							className: `shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-medium 2xl:px-3 2xl:py-2 2xl:text-sm ${light ? "border-slate-300 text-slate-800" : "border-slate-700 text-slate-200"}`,
							children: "Panelim"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => void handleSignOut(),
							className: "shrink-0 rounded-lg bg-[#D4AF37] px-2.5 py-1.5 text-xs font-semibold text-black 2xl:px-3 2xl:py-2 2xl:text-sm",
							children: "Çıkış Yap"
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/giris",
							preload: "intent",
							className: `shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-medium 2xl:px-3 2xl:py-2 2xl:text-sm ${light ? "border-slate-300 text-slate-800" : "border-slate-700 text-slate-200"}`,
							children: "Giriş Yap"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/kayit-ol",
							className: "shrink-0 rounded-lg bg-[#D4AF37] px-2.5 py-1.5 text-xs font-semibold text-black 2xl:px-3 2xl:py-2 2xl:text-sm",
							children: "Üye Ol"
						})] })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex shrink-0 items-center gap-1.5 xl:hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/pazar-yeri",
							"aria-label": "Pazar Yeri",
							title: "Pazar Yeri",
							className: `shrink-0 p-1.5 ${navText}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "h-6 w-6" })
						}),
						cartButton(true),
						!open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							ref: menuButtonRef,
							type: "button",
							"aria-label": "Menüyü aç",
							"aria-expanded": "false",
							"aria-controls": "mobile-navigation",
							onClick: () => setOpen(true),
							className: `shrink-0 p-1.5 ${navText}`,
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
						className: "shrink-0 p-1 text-slate-400 hover:text-white",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-6 w-6" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					"aria-label": "Mobil site navigasyonu",
					className: "mt-6 flex flex-col gap-4",
					children: [
						visibleNavLinks.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.to,
							hash: "hash" in item ? item.hash : void 0,
							onClick: closeMenu,
							className: "text-base font-medium text-slate-300",
							children: item.label
						}, `${item.label}-${item.to}`)),
						isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/yonetim",
							onClick: closeMenu,
							className: "flex items-center gap-2 text-base font-semibold text-[#D4AF37]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5" }), " Yönetim"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/pazar-yeri",
							onClick: closeMenu,
							className: "text-base font-medium text-slate-300",
							children: "Pazar Yeri"
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex shrink-0 flex-col gap-2 border-t border-[#1E293B] pt-3",
				children: isAuthenticated ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/panelim",
					onClick: closeMenu,
					className: "w-full rounded-lg border border-slate-700 py-2.5 text-center text-sm font-medium text-slate-200",
					children: "Panelim"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => void handleSignOut(),
					className: "w-full rounded-lg bg-[#D4AF37] py-2.5 text-center text-sm font-semibold text-black",
					children: "Çıkış Yap"
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/giris",
					preload: "intent",
					onClick: closeMenu,
					className: "w-full rounded-lg border border-slate-700 py-2.5 text-center text-sm font-medium text-slate-200",
					children: "Giriş Yap"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/kayit-ol",
					onClick: closeMenu,
					className: "w-full rounded-lg bg-[#D4AF37] py-2.5 text-center text-sm font-semibold text-black",
					children: "Üye Ol"
				})] })
			})]
		})] })]
	});
}
//#endregion
export { writeParcelCart as a, removeParcelFromCart as i, SiteHeader as n, readParcelCart as r, PARCEL_CART_EVENT as t };
