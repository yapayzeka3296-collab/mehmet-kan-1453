import { i as __toESM, n as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { n as require_jsx_runtime, r as require_react, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { S as useRouter, _ as Link, f as createRouter, g as createRootRouteWithContext, h as createFileRoute, l as Scripts, m as lazyRouteComponent, p as Outlet, u as HeadContent, v as require_react_dom, x as useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { n as objectType, r as stringType, t as arrayType } from "../_libs/zod.mjs";
import { createHmac, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BfErbPzM.mjs
var router_BfErbPzM_exports = /* @__PURE__ */ __exportAll({
	a: () => useAuth,
	getRouter: () => getRouter,
	i: () => Route$20,
	n: () => Route$4,
	o: () => createBrowserSupabase,
	r: () => Route$14,
	s: () => supabaseBrowser,
	t: () => router_exports
});
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var import_react_dom = require_react_dom();
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var DEFAULT_SUPABASE_URL = "https://agfxwddvobkhwbbrdzpt.supabase.co";
var DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFnZnh3ZGR2b2JraHdiYnJkenB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMTgxNDAsImV4cCI6MjEwMTc5NDE0MH0.T_CEm6eUddkxL2mqDpSfHl5WJqw4uufLi5fRqueGm5s";
var configuredUrl = {
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/"
}["VITE_SUPABASE_URL"];
var configuredAnonKey = {
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/"
}["VITE_SUPABASE_ANON_KEY"];
var configuredPublishableKey = {
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/"
}["VITE_SUPABASE_PUBLISHABLE_KEY"];
var url = configuredUrl || DEFAULT_SUPABASE_URL;
var anonKey = configuredAnonKey || configuredPublishableKey || DEFAULT_SUPABASE_ANON_KEY;
var isBrowser = typeof window !== "undefined";
function getSessionStorage() {
	if (!isBrowser) return void 0;
	try {
		return window.sessionStorage;
	} catch {
		return;
	}
}
var serverMemoryStorage = {
	get length() {
		return 0;
	},
	clear() {},
	getItem() {
		return null;
	},
	key() {
		return null;
	},
	removeItem() {},
	setItem() {}
};
function createBrowserSupabase() {
	const client = createClient(url, anonKey, { auth: {
		storage: getSessionStorage() ?? serverMemoryStorage,
		persistSession: isBrowser,
		autoRefreshToken: isBrowser,
		detectSessionInUrl: isBrowser
	} });
	const originalSignOut = client.auth.signOut.bind(client.auth);
	client.auth.signOut = async (options) => {
		if (isBrowser && window.location.pathname === "/yonetim") return { error: null };
		return originalSignOut(options);
	};
	return client;
}
var supabaseBrowser = createBrowserSupabase();
var AuthContext = (0, import_react.createContext)(void 0);
var ADMIN_EMAIL = "incememet3296@gmail.com";
var ADMIN_SESSION_KEY = "myskyparcel_admin_session";
var PROTECTED_PATHS = /* @__PURE__ */ new Set([
	"/panelim",
	"/parsellerim",
	"/hediyelerim",
	"/siparislerim",
	"/sertifikalarim",
	"/bildirimler",
	"/profilim",
	"/guvenlik-ayarlari",
	"/yonetim"
]);
function toUser(sessionUser, role) {
	const metadata = sessionUser.user_metadata ?? {};
	const fullName = metadata["full_name"];
	const email = sessionUser.email ?? null;
	const effectiveRole = email?.trim().toLowerCase() === ADMIN_EMAIL ? "admin" : role ?? null;
	return {
		id: sessionUser.id,
		email,
		name: typeof fullName === "string" && fullName.trim() ? fullName.trim() : null,
		role: effectiveRole,
		user_metadata: metadata
	};
}
async function loadUserRole(userId) {
	if (!supabaseBrowser) return null;
	const { data, error } = await supabaseBrowser.from("profiles").select("role").eq("id", userId).maybeSingle();
	if (error) {
		console.error("User role lookup failed", error);
		return null;
	}
	return typeof data?.role === "string" ? data.role : null;
}
function getEmailRedirectUrl() {
	if (typeof window === "undefined") return "https://myskyparcel.com/dogrula";
	const hostname = window.location.hostname.toLowerCase();
	if (hostname === "myskyparcel.com" || hostname === "www.myskyparcel.com") return "https://myskyparcel.com/dogrula";
	return `${window.location.origin}/dogrula`;
}
function getOAuthRedirectUrl() {
	if (typeof window === "undefined") return "https://myskyparcel.com/";
	const hostname = window.location.hostname.toLowerCase();
	if (hostname === "myskyparcel.com" || hostname === "www.myskyparcel.com") return "https://myskyparcel.com/";
	return window.location.origin;
}
function redirectToLogin() {
	if (typeof window === "undefined") return;
	const path = window.location.pathname;
	if (!PROTECTED_PATHS.has(path)) return;
	const redirect = `${window.location.pathname}${window.location.search}${window.location.hash}`;
	window.location.replace(`/giris?redirect=${encodeURIComponent(redirect)}`);
}
function readAdminSession() {
	if (typeof window === "undefined") return false;
	return window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "1";
}
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const [adminSession, setAdminSession] = (0, import_react.useState)(false);
	const startAdminSession = () => {
		if (typeof window !== "undefined") window.sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
		setAdminSession(true);
	};
	const endAdminSession = () => {
		if (typeof window !== "undefined") window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
		setAdminSession(false);
	};
	(0, import_react.useEffect)(() => {
		setAdminSession(readAdminSession());
	}, []);
	(0, import_react.useEffect)(() => {
		const client = supabaseBrowser;
		if (!client) {
			setLoading(false);
			redirectToLogin();
			return;
		}
		const authClient = client;
		let mounted = true;
		async function hydrate(sessionUser) {
			const role = await loadUserRole(sessionUser.id);
			if (!mounted) return;
			const u = toUser(sessionUser, role);
			setUser(u);
			if (typeof window !== "undefined" && window.location.pathname === "/yonetim" && u.role === "admin") startAdminSession();
			else if (typeof window !== "undefined" && window.location.pathname === "/yonetim" && u.role !== "admin") window.location.replace("/ana-sayfa");
		}
		async function init() {
			try {
				const { data, error: sessionError } = await authClient.auth.getSession();
				if (sessionError) console.error("Error fetching session", sessionError);
				const sessionUser = data.session?.user ?? null;
				if (mounted) {
					if (sessionUser) await hydrate(sessionUser);
					else {
						setUser(null);
						endAdminSession();
						redirectToLogin();
					}
				}
			} catch (err) {
				console.error("Error fetching session", err);
				if (mounted) {
					setUser(null);
					endAdminSession();
					redirectToLogin();
				}
			} finally {
				if (mounted) setLoading(false);
			}
		}
		init();
		const { data: listener } = authClient.auth.onAuthStateChange((event, session) => {
			const sessionUser = session?.user ?? null;
			if (sessionUser) {
				hydrate(sessionUser);
				setError(null);
			} else {
				setUser(null);
				endAdminSession();
				if (event === "SIGNED_OUT" || event === "INITIAL_SESSION") redirectToLogin();
			}
		});
		return () => {
			mounted = false;
			listener.subscription.unsubscribe();
		};
	}, []);
	async function signIn(email, password) {
		setLoading(true);
		setError(null);
		const client = supabaseBrowser;
		if (!client) {
			const msg = "Supabase yapılandırması eksik";
			setError(msg);
			setLoading(false);
			return {
				success: false,
				error: msg
			};
		}
		try {
			const cleanEmail = email.trim().toLowerCase();
			const { data, error } = await client.auth.signInWithPassword({
				email: cleanEmail,
				password
			});
			if (error) {
				const msg = error.message ?? "Giriş sırasında bir hata oluştu";
				setError(msg);
				return {
					success: false,
					error: msg
				};
			}
			const sessionUser = data.user ?? null;
			if (sessionUser) {
				const u = toUser(sessionUser, await loadUserRole(sessionUser.id));
				setUser(u);
				return {
					success: true,
					user: u
				};
			}
			const msg = "Giriş başarısız";
			setError(msg);
			return {
				success: false,
				error: msg
			};
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Giriş sırasında bir hata oluştu";
			setError(msg);
			return {
				success: false,
				error: msg
			};
		} finally {
			setLoading(false);
		}
	}
	async function signInWithGoogle() {
		setLoading(true);
		setError(null);
		const client = supabaseBrowser;
		if (!client) {
			const msg = "Supabase yapılandırması eksik";
			setError(msg);
			setLoading(false);
			return {
				success: false,
				error: msg
			};
		}
		try {
			const { error } = await client.auth.signInWithOAuth({
				provider: "google",
				options: { redirectTo: getOAuthRedirectUrl() }
			});
			if (error) {
				const msg = error.message ?? "Google ile giriş başlatılamadı";
				setError(msg);
				setLoading(false);
				return {
					success: false,
					error: msg
				};
			}
			return { success: true };
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Google ile giriş başlatılamadı";
			setError(msg);
			setLoading(false);
			return {
				success: false,
				error: msg
			};
		}
	}
	async function resendSignup(email) {
		const client = supabaseBrowser;
		if (!client) return {
			success: false,
			error: "Supabase yapılandırması eksik"
		};
		const { error } = await client.auth.resend({
			type: "signup",
			email,
			options: { emailRedirectTo: getEmailRedirectUrl() }
		});
		if (!error) return {
			success: true,
			status: "verification_resent"
		};
		const code = "code" in error ? String(error.code ?? "") : "";
		const message = error.message ?? "";
		if (/already.?confirmed|confirmed/i.test(`${code} ${message}`)) return {
			success: false,
			error: "Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın."
		};
		return {
			success: false,
			error: message || "Doğrulama e-postası yeniden gönderilemedi."
		};
	}
	async function signUp(email, password, name, phone) {
		setLoading(true);
		setError(null);
		const client = supabaseBrowser;
		if (!client) {
			const msg = "Supabase yapılandırması eksik";
			setError(msg);
			setLoading(false);
			return {
				success: false,
				error: msg
			};
		}
		try {
			const cleanEmail = email.trim().toLowerCase();
			const cleanPhone = phone?.trim() || "";
			if (password.length < 10) {
				const msg = "Şifre en az 10 karakter olmalıdır.";
				setError(msg);
				return {
					success: false,
					error: msg
				};
			}
			if (!/^\+[1-9]\d{9,14}$/.test(cleanPhone)) {
				const msg = "Telefon numarasını uluslararası formatta girin (ör. +905xxxxxxxxx).";
				setError(msg);
				return {
					success: false,
					error: msg
				};
			}
			const options = {
				emailRedirectTo: getEmailRedirectUrl(),
				...name?.trim() || cleanPhone ? { data: {
					...name?.trim() ? { full_name: name.trim() } : {},
					pending_phone: cleanPhone
				} } : {}
			};
			const { data, error } = await client.auth.signUp({
				email: cleanEmail,
				password,
				options
			});
			if (error) {
				const code = "code" in error ? String(error.code ?? "") : "";
				if (/email_exists|user_already_exists/i.test(code)) {
					const resendResult = await resendSignup(cleanEmail);
					if (resendResult.success) return resendResult;
				}
				const msg = error.message ?? "Kayıt sırasında bir hata oluştu";
				setError(msg);
				return {
					success: false,
					error: msg
				};
			}
			const sessionUser = data.user ?? null;
			if (sessionUser && Array.isArray(sessionUser.identities) && sessionUser.identities.length === 0) {
				const resendResult = await resendSignup(cleanEmail);
				if (resendResult.success) return resendResult;
				setError(resendResult.error);
				return resendResult;
			}
			if (data.session && sessionUser) {
				const u = toUser(sessionUser, await loadUserRole(sessionUser.id));
				setUser(u);
				return {
					success: true,
					user: u
				};
			}
			return {
				success: true,
				status: "verification_sent"
			};
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Kayıt sırasında bir hata oluştu";
			setError(msg);
			return {
				success: false,
				error: msg
			};
		} finally {
			setLoading(false);
		}
	}
	async function signOut() {
		setLoading(true);
		setError(null);
		const client = supabaseBrowser;
		if (!client) {
			const msg = "Supabase yapılandırması eksik";
			setError(msg);
			setLoading(false);
			return {
				success: false,
				error: msg
			};
		}
		try {
			if (typeof window !== "undefined" && window.location.pathname === "/yonetim") {
				endAdminSession();
				setLoading(false);
				return { success: true };
			}
			const { error } = await client.auth.signOut({ scope: "global" });
			if (error) {
				const msg = error.message ?? "Çıkış sırasında bir hata oluştu";
				setError(msg);
				return {
					success: false,
					error: msg
				};
			}
			setUser(null);
			endAdminSession();
			return { success: true };
		} catch (err) {
			const msg = err instanceof Error ? err.message : "Çıkış sırasında bir hata oluştu";
			setError(msg);
			return {
				success: false,
				error: msg
			};
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value: {
			user,
			loading,
			error,
			isAdmin: user?.role === "admin",
			adminSession,
			startAdminSession,
			endAdminSession,
			signIn,
			signInWithGoogle,
			signUp,
			signOut
		},
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
var SESSION_KEY = "myskyparcel_visit_session";
function getSessionId() {
	try {
		const existing = window.localStorage.getItem(SESSION_KEY);
		if (existing) return existing;
		const id = crypto.randomUUID();
		window.localStorage.setItem(SESSION_KEY, id);
		return id;
	} catch {
		return crypto.randomUUID();
	}
}
function isAdminDashboard() {
	if (typeof document === "undefined" || window.location.pathname !== "/yonetim") return false;
	return Array.from(document.querySelectorAll("h1")).some((el) => el.textContent?.trim() === "Dashboard");
}
function SiteVisitTracker() {
	const [stats, setStats] = (0, import_react.useState)(null);
	const [showStats, setShowStats] = (0, import_react.useState)(false);
	const [statsHost, setStatsHost] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!supabaseBrowser) return;
		const sessionId = getSessionId();
		const record = () => {
			supabaseBrowser.rpc("record_site_visit", {
				p_session_id: sessionId,
				p_path: window.location.pathname
			});
		};
		const timer = window.setTimeout(record, 1500);
		const interval = window.setInterval(record, 6e4);
		return () => {
			window.clearTimeout(timer);
			window.clearInterval(interval);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!supabaseBrowser || window.location.pathname !== "/yonetim") return;
		let cancelled = false;
		let host = null;
		const syncVisibility = () => {
			const dashboard = isAdminDashboard();
			setShowStats(dashboard);
			if (dashboard && !host) {
				const container = document.querySelector("main .space-y-6");
				if (container) {
					host = document.createElement("div");
					host.className = "w-full";
					container.appendChild(host);
					setStatsHost(host);
				}
			} else if (!dashboard && host) {
				host.remove();
				host = null;
				setStatsHost(null);
			}
		};
		syncVisibility();
		const observer = new MutationObserver(syncVisibility);
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			characterData: true
		});
		const loadStats = async () => {
			if (!isAdminDashboard()) return;
			const { data: userData } = await supabaseBrowser.auth.getUser();
			if (!userData.user || cancelled) return;
			const { data: profile } = await supabaseBrowser.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
			if (profile?.role !== "admin" || cancelled) return;
			const { data } = await supabaseBrowser.rpc("admin_site_statistics");
			if (!cancelled && data) setStats(data);
		};
		loadStats();
		const timer = window.setInterval(() => void loadStats(), 3e4);
		return () => {
			cancelled = true;
			observer.disconnect();
			window.clearInterval(timer);
			host?.remove();
			setStatsHost(null);
		};
	}, []);
	if (!showStats || !stats || !statsHost) return null;
	const cards = [
		["Şu an aktif", stats.active_now],
		["Bugün", stats.today],
		["Bu hafta", stats.week],
		["Bu ay", stats.month],
		["Toplam", stats.total],
		["Bugünkü sayfa görüntüleme", stats.pages_today]
	];
	return (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-xl border border-gold/30 bg-background/95 p-4 shadow-lg lg:p-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-lg font-semibold",
				children: "Site İstatistikleri"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: "Son 5 dakikadaki aktif ziyaretçiler ve toplam ziyaretler."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-full border border-green-500/30 px-2.5 py-1 text-[11px] text-green-500",
				children: "CANLI"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6",
			children: cards.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border bg-accent/30 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 font-display text-2xl",
					children: Number(value).toLocaleString("tr-TR")
				})]
			}, label))
		})]
	}), statsHost);
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$46 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "MySkyParcel — Gökyüzünde Sana Özel Bir Yer" },
			{
				name: "description",
				content: "Gökyüzünde sembolik bir parsel seç, benzersiz sertifikanla bu anı ölümsüzleştir."
			},
			{
				name: "author",
				content: "MySkyParcel"
			},
			{
				property: "og:title",
				content: "MySkyParcel — Gökyüzünde Sana Özel Bir Yer"
			},
			{
				property: "og:description",
				content: "Sembolik gökyüzü parseli ve koleksiyon sertifikası."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "google",
				content: "notranslate"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Jost:wght@300;400;500;600&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "tr",
		translate: "no",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meta", {
			name: "google-site-verification",
			content: "FnBKvdIxURn7yQQY7YNxhbM-sxPfNEjJf4GgmZKh0ec"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$46.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteVisitTracker, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})] })
	});
}
var $$splitComponentImporter$36 = () => import("./routes-DYMS3-eH.mjs");
var Route$45 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "MySkyParcel — Gökyüzünde Kendi Parselini Seç" }, {
		name: "description",
		content: "81 il, 81 milyon parsel. Türkiye'den dünyaya açılan MySkyParcel projesini keşfet."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$36, "component")
});
var jsonResponse$2 = (body, status) => new Response(JSON.stringify(body), {
	status,
	headers: {
		"content-type": "application/json",
		"cache-control": "no-store"
	}
});
var GET = async ({ request }) => {
	const authHeader = request.headers.get("authorization") ?? "";
	const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
	if (!token) return jsonResponse$2({
		ok: false,
		admin: false,
		reason: "unauthenticated"
	}, 401);
	const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
	const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
	if (!supabaseUrl || !serviceRoleKey) return jsonResponse$2({
		ok: false,
		admin: false,
		reason: "service_not_configured"
	}, 503);
	try {
		const { createClient } = await import("../_libs/supabase__supabase-js.mjs").then((n) => n.n);
		const admin = createClient(supabaseUrl, serviceRoleKey, { auth: {
			autoRefreshToken: false,
			persistSession: false
		} });
		const { data, error } = await admin.auth.getUser(token);
		if (error || !data.user) return jsonResponse$2({
			ok: false,
			admin: false,
			reason: "unauthenticated"
		}, 401);
		const { data: profile, error: profileError } = await admin.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
		if (profileError) {
			console.error("Admin role lookup failed", profileError);
			return jsonResponse$2({
				ok: false,
				admin: false,
				reason: "internal_error"
			}, 500);
		}
		if (profile?.role !== "admin") return jsonResponse$2({
			ok: false,
			admin: false,
			reason: "forbidden"
		}, 403);
		return jsonResponse$2({
			ok: true,
			admin: true
		}, 200);
	} catch (error) {
		console.error("Admin authorization check failed", error);
		return jsonResponse$2({
			ok: false,
			admin: false,
			reason: "internal_error"
		}, 500);
	}
};
var Route$44 = createFileRoute("/admin-check")({ server: { handlers: { GET } } });
var $$splitComponentImporter$35 = () => import("./ana-sayfa-M8QDeNfq.mjs");
var Route$43 = createFileRoute("/ana-sayfa")({
	head: () => ({ meta: [{ title: "MySkyParcel — Gökyüzünde Sana Özel Sembolik Bir Yer" }, {
		name: "description",
		content: "81 il ve 81 milyon benzersiz gökyüzü parseli fikri."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$35, "component")
});
var $$splitComponentImporter$34 = () => import("./bildirimler--J6wH_4h.mjs");
var Route$42 = createFileRoute("/bildirimler")({ component: lazyRouteComponent($$splitComponentImporter$34, "component") });
var $$splitComponentImporter$33 = () => import("./cerez-politikasi-CYoJozWP.mjs");
var Route$41 = createFileRoute("/cerez-politikasi")({
	head: () => ({ meta: [{ title: "Çerez Politikası — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel Çerez Politikası."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$33, "component")
});
var $$splitComponentImporter$32 = () => import("./destek-DjqyV9qV.mjs");
var Route$40 = createFileRoute("/destek")({
	head: () => ({ meta: [
		{ title: "Destek — MySkyParcel" },
		{
			name: "description",
			content: "MySkyParcel destek ve iletişim bilgileri."
		},
		{
			property: "og:title",
			content: "Destek — MySkyParcel"
		},
		{
			property: "og:description",
			content: "MySkyParcel destek ve iletişim bilgileri."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$32, "component")
});
var $$splitComponentImporter$31 = () => import("./dogrula-eNJSqA4E.mjs");
var Route$39 = createFileRoute("/dogrula")({
	head: () => ({ meta: [{ title: "E-posta Doğrulama — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel e-posta ve üyelik SMS doğrulama sonucu."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$31, "component")
});
var $$splitComponentImporter$30 = () => import("./giris-tEnmJNLy.mjs");
var Route$38 = createFileRoute("/giris")({
	head: () => ({
		meta: [
			{ title: "Giriş Yap — MySkyParcel" },
			{
				name: "description",
				content: "Hesabına giriş yaparak parsellerini yönet ve sertifikalarına ulaş."
			},
			{
				property: "og:title",
				content: "Giriş Yap — MySkyParcel"
			},
			{
				property: "og:description",
				content: "MySkyParcel hesabına giriş yap."
			}
		],
		links: [{
			rel: "stylesheet",
			href: "/login-background.css"
		}]
	}),
	component: lazyRouteComponent($$splitComponentImporter$30, "component")
});
var $$splitComponentImporter$29 = () => import("./gizlilik-politikasi-BlDwpGTC.mjs");
var Route$37 = createFileRoute("/gizlilik-politikasi")({
	head: () => ({ meta: [{ title: "Gizlilik Politikası — MySkyParcel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$29, "component")
});
var $$splitComponentImporter$28 = () => import("./gokyuzu-haritasi-B3nUKB-i.mjs");
var Route$36 = createFileRoute("/gokyuzu-haritasi")({ component: lazyRouteComponent($$splitComponentImporter$28, "component") });
var $$splitComponentImporter$27 = () => import("./guvenlik-ayarlari-mKpm7YkD.mjs");
var Route$35 = createFileRoute("/guvenlik-ayarlari")({
	head: () => ({ meta: [
		{ title: "Güvenlik Ayarları — MySkyParcel" },
		{
			name: "description",
			content: "Şifreni değiştir, iki adımlı doğrulamayı yönet ve oturumlarını kontrol et."
		},
		{
			property: "og:title",
			content: "Güvenlik Ayarları — MySkyParcel"
		},
		{
			property: "og:description",
			content: "Hesap güvenliği ayarların."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$27, "component")
});
var $$splitComponentImporter$26 = () => import("./hakkimizda-4wSbBmS7.mjs");
var Route$34 = createFileRoute("/hakkimizda")({
	head: () => ({ meta: [
		{ title: "Hakkımızda — MySkyParcel" },
		{
			name: "description",
			content: "MySkyParcel'in amacı, çalışma biçimi, sınırları ve sık sorulan sorular."
		},
		{
			property: "og:title",
			content: "Hakkımızda — MySkyParcel"
		},
		{
			property: "og:description",
			content: "MySkyParcel'in amacı, çalışma biçimi ve sık sorulan sorular."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$26, "component")
});
var $$splitComponentImporter$25 = () => import("./hediye-kabul-D_yAvlQ2.mjs");
var Route$33 = createFileRoute("/hediye-kabul")({
	head: () => ({ meta: [{ title: "Parsel Hediyesi — MySkyParcel" }, {
		name: "description",
		content: "Size gönderilen MySkyParcel parsel hediyesini güvenle kabul edin."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
var $$splitComponentImporter$24 = () => import("./hediyelerim-C3NIZXPn.mjs");
var Route$32 = createFileRoute("/hediyelerim")({
	head: () => ({ meta: [{ title: "Hediyelerim — MySkyParcel" }, {
		name: "description",
		content: "Gönderdiğiniz ve aldığınız parsel hediyelerini yönetin."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$24, "component")
});
var $$splitComponentImporter$23 = () => import("./iade-iptal-politikasi-h6aRIc7K.mjs");
var Route$31 = createFileRoute("/iade-iptal-politikasi")({
	head: () => ({ meta: [{ title: "İade ve İptal Politikası — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel iade, iptal ve cayma politikası."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./iletisim-BOEnVp-W.mjs");
var Route$30 = createFileRoute("/iletisim")({
	head: () => ({ meta: [
		{ title: "İletişim — MySkyParcel" },
		{
			name: "description",
			content: "MySkyParcel iletişim bilgileri ve destek kanalları."
		},
		{
			property: "og:title",
			content: "İletişim — MySkyParcel"
		},
		{
			property: "og:description",
			content: "MySkyParcel iletişim bilgileri ve destek kanalları."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var $$splitComponentImporter$21 = () => import("./kayit-ol-C-tzM31s.mjs");
var Route$29 = createFileRoute("/kayit-ol")({
	head: () => ({ meta: [
		{ title: "Kayıt Ol — MySkyParcel" },
		{
			name: "description",
			content: "Ücretsiz hesap oluştur, gökyüzündeki parselini seç ve sertifikanı al."
		},
		{
			property: "og:title",
			content: "Kayıt Ol — MySkyParcel"
		},
		{
			property: "og:description",
			content: "MySkyParcel'e ücretsiz üye ol."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./kullanim-sartlari-BQv4nLv5.mjs");
var Route$28 = createFileRoute("/kullanim-sartlari")({
	head: () => ({ meta: [{ title: "Kullanım Şartları — MySkyParcel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./kvkk-D44TW7FG.mjs");
var Route$27 = createFileRoute("/kvkk")({
	head: () => ({ meta: [{ title: "KVKK Aydınlatma Metni — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel KVKK Aydınlatma Metni."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./mesafeli-satis-sozlesmesi-XNWFKjbo.mjs");
var Route$26 = createFileRoute("/mesafeli-satis-sozlesmesi")({
	head: () => ({ meta: [{ title: "Mesafeli Satış Sözleşmesi — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel Mesafeli Satış Sözleşmesi."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./nasil-calisir-CKof_rnx.mjs");
var Route$25 = createFileRoute("/nasil-calisir")({
	head: () => ({ meta: [
		{ title: "MySkyParcel Nedir? — MySkyParcel" },
		{
			name: "description",
			content: "MySkyParcel'in dijital ve sembolik parsel sistemi, sertifikaları ve platform kapsamı hakkında bilgi."
		},
		{
			property: "og:title",
			content: "MySkyParcel Nedir?"
		},
		{
			property: "og:description",
			content: "MySkyParcel'in dijital parsel deneyiminin nasıl çalıştığını ve ne ifade ettiğini öğrenin."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./on-bilgilendirme-formu-DnIs1nwk.mjs");
var Route$24 = createFileRoute("/on-bilgilendirme-formu")({
	head: () => ({ meta: [{ title: "Ön Bilgilendirme Formu — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel mesafeli satış ön bilgilendirme formu."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./paketler-CAFy8DI2.mjs");
var Route$23 = createFileRoute("/paketler")({
	head: () => ({ meta: [{ title: "Sertifika Seçenekleri — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel dijital ve fiziksel sertifika seçeneklerini ve paket kapsamlarını inceleyin."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./panelim-DnzCtTwD.mjs");
var Route$22 = createFileRoute("/panelim")({
	head: () => ({ meta: [{ title: "Panelim — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel kullanıcı paneli."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var Route$21 = createFileRoute("/parsel-hatirasi")({ component: ParcelHatirasiPage });
function ParcelHatirasiPage() {
	const parcelId = useSearch({ strict: false }).parcel ?? "";
	const [memory, setMemory] = (0, import_react.useState)(null);
	const [parcelNumber, setParcelNumber] = (0, import_react.useState)(parcelId);
	const [photoUrl, setPhotoUrl] = (0, import_react.useState)(null);
	const [musicUrl, setMusicUrl] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!parcelId) {
			setError("Parsel bilgisi bulunamadı.");
			setLoading(false);
			return;
		}
		let cancelled = false;
		(async () => {
			const { data: sessionData } = await supabaseBrowser.auth.getSession();
			const userId = sessionData.session?.user?.id ?? null;
			const [{ data: mem, error: memError }, { data: parcel }] = await Promise.all([supabaseBrowser.from("parcel_memories").select("photo_path,music_path,note,is_public").eq("parcel_id", parcelId).maybeSingle(), supabaseBrowser.from("parcels").select("parcel_number,owner_id").eq("id", parcelId).maybeSingle()]);
			if (cancelled) return;
			if (memError) setError(memError.message);
			else if (!mem?.photo_path) setError("Bu parselde henüz bir hatıra bulunmuyor.");
			else if (!mem.is_public && parcel?.owner_id !== userId) setError("Bu hatıra yalnızca sahibi tarafından görülebilir.");
			else {
				const next = mem;
				setMemory(next);
				setParcelNumber(parcel?.parcel_number ?? parcelId);
				const [{ data: photo }, { data: music }] = await Promise.all([supabaseBrowser.storage.from("parcel-memories").createSignedUrl(next.photo_path, 3600), next.music_path ? supabaseBrowser.storage.from("parcel-memories").createSignedUrl(next.music_path, 3600) : Promise.resolve({ data: null })]);
				if (!cancelled) {
					setPhotoUrl(photo?.signedUrl ?? null);
					setMusicUrl(music?.signedUrl ?? null);
				}
			}
			setLoading(false);
		})();
		return () => {
			cancelled = true;
		};
	}, [parcelId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "min-h-screen bg-[#050d18] p-4 text-white sm:p-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-2xl overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] shadow-2xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between border-b border-white/10 px-5 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] uppercase tracking-[0.18em] text-cyan-200/70",
					children: "Parsel Hatırası"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 text-lg font-extrabold",
					children: parcelNumber
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => window.history.back(),
					className: "grid h-9 w-9 place-items-center rounded-full bg-white/10 text-xl",
					children: "×"
				})]
			}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-10 text-center text-white/60",
				children: "Hatıra yükleniyor..."
			}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-10 text-center text-sm text-white/60",
				children: error
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-5",
				children: [
					photoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: photoUrl,
						alt: `${parcelNumber} parsel hatırası`,
						className: "max-h-[60vh] w-full rounded-xl object-contain bg-black/20",
						loading: "lazy"
					}),
					memory?.note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-[0.16em] text-cyan-200/60",
							children: "Not"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 whitespace-pre-wrap text-sm leading-6 text-white/80",
							children: memory.note
						})]
					}),
					musicUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-2 text-[10px] uppercase tracking-[0.16em] text-cyan-200/60",
							children: "Hatıra Müziği"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
							controls: true,
							preload: "none",
							src: musicUrl,
							className: "w-full"
						})]
					})
				]
			})]
		})
	});
}
var $$splitComponentImporter$13 = () => import("./parsel-satin-al-CJB-c5on.mjs");
var Route$20 = createFileRoute("/parsel-satin-al")({
	validateSearch: (search) => ({ parcels: typeof search.parcels === "string" ? search.parcels : void 0 }),
	head: () => ({ meta: [{ title: "Parsel Satın Al — MySkyParcel" }, {
		name: "description",
		content: "İstediğiniz sayıda sembolik parsel seçin ve güvenli ödeme adımına geçin."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./parsellerim-DqE7ekZj.mjs");
var Route$19 = createFileRoute("/parsellerim")({
	head: () => ({ meta: [{ title: "Koleksiyonum — MySkyParcel" }, {
		name: "description",
		content: "Satın aldığın gökyüzü parsellerini tek koleksiyon alanında görüntüle."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./pazar-yeri-D20V9Tle.mjs");
var Route$18 = createFileRoute("/pazar-yeri")({
	head: () => ({ meta: [{ title: "Pazar Yeri — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel Pazar Yeri çok yakında."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./profilim-BeNqlf7Q.mjs");
var Route$17 = createFileRoute("/profilim")({
	head: () => ({ meta: [
		{ title: "Profilim — MySkyParcel" },
		{
			name: "description",
			content: "Hesap bilgilerini güncelle ve iletişim tercihlerini yönet."
		},
		{
			property: "og:title",
			content: "Profilim — MySkyParcel"
		},
		{
			property: "og:description",
			content: "Hesap bilgilerin ve tercihlerin."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var ParamsSchema$1 = objectType({ parcel_id: stringType().uuid() });
var jsonResponse$1 = (body, status) => new Response(JSON.stringify(body), {
	status,
	headers: {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store"
	}
});
/**
* Legacy HTTP purchase endpoint kept for compatibility with existing clients.
* All reservation/order state changes are delegated to the transactional
* create_parcel_order() RPC. This endpoint deliberately never uses the
* service-role key, never accepts a client-supplied owner/price/status, and
* never mutates parcels directly.
*/
var POST$1 = async ({ request }) => {
	try {
		const json = await request.json().catch(() => ({}));
		const parse = ParamsSchema$1.safeParse(json);
		if (!parse.success) return jsonResponse$1({
			ok: false,
			reason: "invalid_parcel_id"
		}, 400);
		const authHeader = request.headers.get("authorization") ?? "";
		const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
		if (!token) return jsonResponse$1({
			ok: false,
			reason: "unauthenticated"
		}, 401);
		const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
		const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_ANON_KEY"];
		if (!supabaseUrl || !publishableKey) return jsonResponse$1({
			ok: false,
			reason: "service_not_configured"
		}, 503);
		const supabase = createClient(supabaseUrl, publishableKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
				detectSessionInUrl: false
			},
			global: { headers: { Authorization: `Bearer ${token}` } }
		});
		const { data: { user }, error: authError } = await supabase.auth.getUser(token);
		if (authError || !user) return jsonResponse$1({
			ok: false,
			reason: "unauthenticated"
		}, 401);
		const { data: order, error: orderError } = await supabase.rpc("create_parcel_order", { p_parcel_id: parse.data.parcel_id });
		if (orderError) {
			const message = orderError.message ?? "";
			if (/parcel_(unavailable|already_reserved)/i.test(message)) return jsonResponse$1({
				ok: false,
				reason: "not_available"
			}, 409);
			if (/parcel_not_found/i.test(message)) return jsonResponse$1({
				ok: false,
				reason: "parcel_not_found"
			}, 404);
			if (/unauthorized/i.test(message)) return jsonResponse$1({
				ok: false,
				reason: "unauthenticated"
			}, 401);
			console.error("Transactional parcel order failed", orderError);
			return jsonResponse$1({
				ok: false,
				reason: "reservation_failed"
			}, 500);
		}
		return jsonResponse$1({
			ok: true,
			status: "reserved",
			order
		}, 202);
	} catch (error) {
		console.error("Unexpected purchase handler error", error);
		return jsonResponse$1({
			ok: false,
			reason: "internal_error"
		}, 500);
	}
};
var Route$16 = createFileRoute("/purchase")({ server: { handlers: { POST: POST$1 } } });
var ParamsSchema = objectType({ parcel_ids: arrayType(stringType().uuid()).min(1).max(100) });
var jsonResponse = (body, status) => new Response(JSON.stringify(body), {
	status,
	headers: {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store"
	}
});
var POST = async ({ request }) => {
	try {
		const parse = ParamsSchema.safeParse(await request.json().catch(() => ({})));
		if (!parse.success) return jsonResponse({
			ok: false,
			reason: "invalid_parcel_selection"
		}, 400);
		const authHeader = request.headers.get("authorization") ?? "";
		const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
		if (!token) return jsonResponse({
			ok: false,
			reason: "unauthenticated"
		}, 401);
		const supabaseUrl = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
		const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_ANON_KEY"];
		if (!supabaseUrl || !publishableKey) return jsonResponse({
			ok: false,
			reason: "service_not_configured"
		}, 503);
		const supabase = createClient(supabaseUrl, publishableKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
				detectSessionInUrl: false
			},
			global: { headers: { Authorization: `Bearer ${token}` } }
		});
		const { data: { user }, error: authError } = await supabase.auth.getUser(token);
		if (authError || !user) return jsonResponse({
			ok: false,
			reason: "unauthenticated"
		}, 401);
		const { data: orders, error: orderError } = await supabase.rpc("create_parcel_orders_bulk", { p_parcel_ids: [...new Set(parse.data.parcel_ids)] });
		if (orderError) {
			const message = orderError.message ?? "";
			if (/too_many_parcels/i.test(message)) return jsonResponse({
				ok: false,
				reason: "too_many_parcels"
			}, 400);
			if (/parcel_(unavailable|already_reserved)/i.test(message)) return jsonResponse({
				ok: false,
				reason: "not_available"
			}, 409);
			if (/parcel_not_found/i.test(message)) return jsonResponse({
				ok: false,
				reason: "parcel_not_found"
			}, 404);
			if (/unauthorized/i.test(message)) return jsonResponse({
				ok: false,
				reason: "unauthenticated"
			}, 401);
			if (/empty_parcel_selection/i.test(message)) return jsonResponse({
				ok: false,
				reason: "empty_parcel_selection"
			}, 400);
			console.error("Transactional bulk parcel order failed", orderError);
			return jsonResponse({
				ok: false,
				reason: "reservation_failed"
			}, 500);
		}
		return jsonResponse({
			ok: true,
			status: "reserved",
			count: Array.isArray(orders) ? orders.length : 0,
			orders
		}, 202);
	} catch (error) {
		console.error("Unexpected bulk purchase handler error", error);
		return jsonResponse({
			ok: false,
			reason: "internal_error"
		}, 500);
	}
};
var Route$15 = createFileRoute("/purchase-bulk")({ server: { handlers: { POST } } });
var $$splitComponentImporter$9 = () => import("./sertifika-dogrula-CGSHOd6d.mjs");
var Route$14 = createFileRoute("/sertifika-dogrula")({
	validateSearch: (search) => ({ code: typeof search["code"] === "string" ? search["code"] : "" }),
	head: () => ({ meta: [
		{ title: "Sertifika Doğrula — MySkyParcel" },
		{
			name: "description",
			content: "Sertifika numarasını girerek sertifikanın geçerliliğini kontrol et."
		},
		{
			property: "og:title",
			content: "Sertifika Doğrula — MySkyParcel"
		},
		{
			property: "og:description",
			content: "QR kod veya sertifika numarası ile doğrulama."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./sertifika-talep-CUZsFuzw.mjs");
var Route$13 = createFileRoute("/sertifika-talep")({
	head: () => ({ meta: [{ title: "Sertifika Oluştur — MySkyParcel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./sertifikalarim-DaJspJcx.mjs");
var Route$12 = createFileRoute("/sertifikalarim")({
	head: () => ({ meta: [{ title: "Sertifikalarım — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel sertifikalarınızı görüntüleyin ve doğrulayın."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./sifre-yenile-CQ7-1jIF.mjs");
var Route$11 = createFileRoute("/sifre-yenile")({
	head: () => ({ meta: [{ title: "Şifre Yenile — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel hesabınız için yeni şifrenizi belirleyin."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./sifremi-unuttum-CG6rt0tn.mjs");
var Route$10 = createFileRoute("/sifremi-unuttum")({
	head: () => ({ meta: [
		{ title: "Şifremi Unuttum — MySkyParcel" },
		{
			name: "description",
			content: "E-posta adresinizi girin, şifrenizi sıfırlamanız için size bir bağlantı gönderelim."
		},
		{
			property: "og:title",
			content: "Şifremi Unuttum — MySkyParcel"
		},
		{
			property: "og:description",
			content: "Şifre sıfırlama bağlantısı talep edin."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./siparislerim-VRsmUhOp.mjs");
var Route$9 = createFileRoute("/siparislerim")({
	head: () => ({ meta: [
		{ title: "Siparişlerim — MySkyParcel" },
		{
			name: "description",
			content: "Geçmiş siparişlerini, tutarlarını ve durumlarını takip et."
		},
		{
			property: "og:title",
			content: "Siparişlerim — MySkyParcel"
		},
		{
			property: "og:description",
			content: "Sipariş geçmişin ve durumları."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./turkiye-haritasi-KbIZpi6G.mjs");
var Route$8 = createFileRoute("/turkiye-haritasi")({
	head: () => ({ links: [{
		rel: "preload",
		href: "/images/cities/turkey-3d-map.png",
		as: "image",
		type: "image/png",
		fetchpriority: "high"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./uyelik-sozlesmesi-BDsUMj74.mjs");
var Route$7 = createFileRoute("/uyelik-sozlesmesi")({
	head: () => ({ meta: [{ title: "Üyelik Sözleşmesi — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel Üyelik Sözleşmesi."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./yonetim-qa_3Fxg7.mjs");
var Route$6 = createFileRoute("/yonetim")({
	head: () => ({ meta: [{ title: "Yönetim Paneli — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel güvenli yönetim paneli."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var ASSETS = {
	earth: {
		url: "https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73630/world.topo.bathy.200403.3x5400x2700.jpg",
		contentType: "image/jpeg",
		cacheControl: "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=604800, stale-if-error=2592000",
		source: "NASA Earth Observatory / GSFC"
	},
	clouds: {
		url: "https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg",
		contentType: "image/jpeg",
		cacheControl: "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=604800, stale-if-error=2592000",
		source: "NASA Earth Observatory / GSFC"
	},
	provinces: {
		url: "https://raw.githubusercontent.com/cihadturhan/tr-geojson/master/geo/tr-cities-utf8.json",
		contentType: "application/geo+json; charset=utf-8",
		cacheControl: "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=604800, stale-if-error=2592000",
		source: "cihadturhan/tr-geojson"
	}
};
var Route$5 = createFileRoute("/api/earth-assets")({ server: { handlers: { GET: async ({ request }) => {
	const type = new URL(request.url).searchParams.get("type");
	if (!type || !(type in ASSETS)) return new Response(JSON.stringify({
		ok: false,
		reason: "invalid_asset"
	}), {
		status: 400,
		headers: { "content-type": "application/json; charset=utf-8" }
	});
	const asset = ASSETS[type];
	try {
		const upstream = await fetch(asset.url, {
			headers: { "user-agent": "MySkyParcel/1.0 Earth Globe asset proxy" },
			cache: "force-cache"
		});
		if (!upstream.ok) return new Response(JSON.stringify({
			ok: false,
			reason: "upstream_error",
			status: upstream.status
		}), {
			status: 502,
			headers: {
				"content-type": "application/json; charset=utf-8",
				"cache-control": "no-store"
			}
		});
		const body = await upstream.arrayBuffer();
		const headers = new Headers();
		headers.set("content-type", asset.contentType);
		headers.set("cache-control", asset.cacheControl);
		headers.set("access-control-allow-origin", "*");
		headers.set("x-myskyparcel-asset-source", asset.source);
		return new Response(body, {
			status: 200,
			headers
		});
	} catch (error) {
		console.error(`Earth asset proxy failed for ${type}`, error);
		return new Response(JSON.stringify({
			ok: false,
			reason: "proxy_error"
		}), {
			status: 502,
			headers: {
				"content-type": "application/json; charset=utf-8",
				"cache-control": "no-store"
			}
		});
	}
} } } });
var $$splitComponentImporter = () => import("../_slug-D_Yoqr4P.mjs");
var Route$4 = createFileRoute("/sehir/$slug")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var BodySchema = objectType({
	parcel_ids: arrayType(stringType().uuid()).min(1).max(100),
	certificate_parcel_id: stringType().uuid().nullable().optional()
});
var json$1 = (body, status = 200) => new Response(JSON.stringify(body), {
	status,
	headers: {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store"
	}
});
var getEnv$3 = (name) => process.env[name]?.trim() || "";
var SHOPIER_TIMEOUT_MS = 15e3;
var SHOPIER_DIAGNOSTIC_BODY_LIMIT = 4e3;
var SHOPIER_PRODUCT_IMAGE_URL = "https://myskyparcel.com/images/cities/turkey-3d-map.png";
var readShopierResponse = async (response) => {
	const rawBody = await response.text().catch(() => "");
	let parsedBody = {};
	try {
		const parsed = rawBody ? JSON.parse(rawBody) : null;
		if (parsed && typeof parsed === "object") parsedBody = parsed;
	} catch {}
	const requestId = response.headers.get("x-request-id") ?? response.headers.get("request-id") ?? response.headers.get("trace-id") ?? response.headers.get("x-correlation-id") ?? null;
	return {
		rawBody,
		parsedBody,
		requestId
	};
};
var getString = (value) => typeof value === "string" ? value.trim() : "";
var isShopierUrl$1 = (value) => {
	try {
		const url = new URL(value);
		return url.protocol === "https:" && (url.hostname === "shopier.com" || url.hostname.endsWith(".shopier.com"));
	} catch {
		return false;
	}
};
var Route$3 = createFileRoute("/api/shopier/checkout")({ server: { handlers: { POST: async ({ request }) => {
	let intentId = "";
	let releaseIntent = null;
	try {
		const parsed = BodySchema.safeParse(await request.json().catch(() => ({})));
		if (!parsed.success) return json$1({
			ok: false,
			reason: "invalid_request"
		}, 400);
		const authHeader = request.headers.get("authorization") ?? "";
		const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
		if (!token) return json$1({
			ok: false,
			reason: "unauthenticated"
		}, 401);
		const supabaseUrl = getEnv$3("SUPABASE_URL") || getEnv$3("VITE_SUPABASE_URL");
		const publishableKey = getEnv$3("SUPABASE_PUBLISHABLE_KEY") || getEnv$3("VITE_SUPABASE_PUBLISHABLE_KEY") || getEnv$3("VITE_SUPABASE_ANON_KEY");
		const serviceRoleKey = getEnv$3("SUPABASE_SECRET_KEY") || getEnv$3("SUPABASE_SERVICE_ROLE_KEY");
		const shopierPat = getEnv$3("SHOPIER_PAT");
		if (!supabaseUrl || !publishableKey || !serviceRoleKey) return json$1({
			ok: false,
			reason: "supabase_not_configured"
		}, 503);
		if (!shopierPat) return json$1({
			ok: false,
			reason: "shopier_not_configured"
		}, 503);
		const supabase = createClient(supabaseUrl, publishableKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
				detectSessionInUrl: false
			},
			global: { headers: { Authorization: `Bearer ${token}` } }
		});
		const { data: authData, error: authError } = await supabase.auth.getUser(token);
		if (authError || !authData.user) return json$1({
			ok: false,
			reason: "unauthenticated"
		}, 401);
		const serviceSupabase = createClient(supabaseUrl, serviceRoleKey, { auth: {
			autoRefreshToken: false,
			persistSession: false,
			detectSessionInUrl: false
		} });
		const { error: cleanupError } = await serviceSupabase.rpc("cleanup_expired_shopier_checkout_state");
		if (cleanupError) console.error("Shopier expired-state cleanup failed", {
			code: cleanupError.code,
			message: cleanupError.message
		});
		const parcelIdsRequest = [...new Set(parsed.data.parcel_ids)];
		let { data, error } = await supabase.rpc("create_shopier_checkout_intent", {
			p_parcel_ids: parcelIdsRequest,
			p_certificate_parcel_id: parsed.data.certificate_parcel_id ?? null
		});
		if (error && !/parcel_reserved_by_other_user|parcel_unavailable|parcel_not_found|empty_parcel_selection|too_many_parcels|invalid_certificate_parcel|invalid_parcel_price|unauthorized/i.test(error.message ?? "")) {
			const { error: retryCleanupError } = await serviceSupabase.rpc("cleanup_expired_shopier_checkout_state");
			if (retryCleanupError) console.error("Shopier checkout retry cleanup failed", {
				code: retryCleanupError.code,
				message: retryCleanupError.message
			});
			({data, error} = await supabase.rpc("create_shopier_checkout_intent", {
				p_parcel_ids: parcelIdsRequest,
				p_certificate_parcel_id: parsed.data.certificate_parcel_id ?? null
			}));
		}
		if (error) {
			const message = error.message ?? "";
			if (/parcel_reserved_by_other_user/i.test(message)) return json$1({
				ok: false,
				reason: "parcel_reserved_by_other_user"
			}, 409);
			if (/parcel_unavailable/i.test(message)) return json$1({
				ok: false,
				reason: "not_available"
			}, 409);
			if (/parcel_not_found/i.test(message)) return json$1({
				ok: false,
				reason: "parcel_not_found"
			}, 404);
			if (/empty_parcel_selection/i.test(message)) return json$1({
				ok: false,
				reason: "empty_parcel_selection"
			}, 400);
			if (/too_many_parcels/i.test(message)) return json$1({
				ok: false,
				reason: "too_many_parcels"
			}, 400);
			if (/invalid_certificate_parcel/i.test(message)) return json$1({
				ok: false,
				reason: "invalid_certificate_parcel"
			}, 400);
			if (/invalid_parcel_price/i.test(message)) return json$1({
				ok: false,
				reason: "invalid_parcel_price"
			}, 409);
			if (/unauthorized/i.test(message)) return json$1({
				ok: false,
				reason: "unauthenticated"
			}, 401);
			console.error("Shopier checkout intent failed after cleanup retry", {
				code: error.code,
				message: error.message
			});
			return json$1({
				ok: false,
				reason: "checkout_intent_failed"
			}, 500);
		}
		const intent = data;
		intentId = String(intent.intent_id ?? "");
		const amount = Number(intent.amount);
		const currency = String(intent.currency ?? "TRY").toUpperCase();
		const parcelIds = Array.isArray(intent.parcel_ids) ? intent.parcel_ids.filter((id) => typeof id === "string") : [];
		if (!intentId || !Number.isFinite(amount) || amount <= 0 || currency !== "TRY" || !parcelIds.length) {
			console.error("Invalid Shopier checkout intent data", {
				intentId,
				amount,
				currency,
				parcelCount: parcelIds.length
			});
			return json$1({
				ok: false,
				reason: "checkout_intent_invalid"
			}, 500);
		}
		const orderIds = Array.isArray(intent.order_ids) ? intent.order_ids.filter((id) => typeof id === "string") : [];
		releaseIntent = async (reason) => {
			const now = (/* @__PURE__ */ new Date()).toISOString();
			const { error: releaseError } = await serviceSupabase.from("parcels").update({
				status: "available",
				reserved_by: null,
				reserved_until: null,
				updated_at: now
			}).in("id", parcelIds).eq("status", "reserved").eq("reserved_by", authData.user.id);
			if (releaseError) console.error("Shopier reservation release failed", {
				intentId,
				reason,
				code: releaseError.code,
				message: releaseError.message
			});
			if (orderIds.length) {
				const { error: orderError } = await serviceSupabase.from("orders").update({
					status: "cancelled",
					updated_at: now
				}).in("id", orderIds).eq("user_id", authData.user.id).eq("status", "pending");
				if (orderError) console.error("Shopier pending order cancellation failed", {
					intentId,
					reason,
					code: orderError.code,
					message: orderError.message
				});
			}
			const { error: intentError } = await serviceSupabase.from("shopier_checkout_intents").update({
				status: "failed",
				updated_at: now
			}).eq("id", intentId).eq("user_id", authData.user.id).in("status", ["pending", "redirected"]);
			if (intentError) console.error("Shopier intent failure persistence failed", {
				intentId,
				reason,
				code: intentError.code,
				message: intentError.message
			});
		};
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), SHOPIER_TIMEOUT_MS);
		let shopierResponse;
		let shopierResponseInfo;
		try {
			const payload = {
				title: `MySkyParcel Parsel Siparişi ${intentId}`,
				description: `MySkyParcel parsel satın alma işlemi. Sipariş referansı: ${intentId}`,
				type: "digital",
				shippingPayer: "sellerPays",
				priceData: {
					currency: "TRY",
					price: amount.toFixed(2)
				},
				media: [{
					type: "image",
					url: SHOPIER_PRODUCT_IMAGE_URL,
					placement: 1
				}],
				stockQuantity: 1,
				customListing: true,
				customNote: `MySkyParcel intent: ${intentId}`
			};
			shopierResponse = await fetch("https://api.shopier.com/v1/products", {
				method: "POST",
				signal: controller.signal,
				headers: {
					Authorization: `Bearer ${shopierPat}`,
					Accept: "application/json",
					"Content-Type": "application/json",
					"Idempotency-Key": intentId
				},
				body: JSON.stringify(payload)
			});
			shopierResponseInfo = await readShopierResponse(shopierResponse);
		} catch (error) {
			clearTimeout(timeout);
			const aborted = error instanceof Error && error.name === "AbortError";
			console.error("Shopier product creation request failed", {
				intentId,
				reason: aborted ? "timeout" : "network_error",
				message: error instanceof Error ? error.message : String(error)
			});
			await releaseIntent(aborted ? "shopier_timeout" : "shopier_request_failed");
			return json$1({
				ok: false,
				reason: aborted ? "shopier_timeout" : "shopier_unreachable"
			}, 502);
		}
		clearTimeout(timeout);
		const shopierBody = shopierResponseInfo.parsedBody;
		if (!shopierResponse.ok) {
			const apiMessage = (getString(shopierBody.message) || getString(shopierBody.error) || getString(shopierBody.detail)).slice(0, 500);
			const diagnostic = {
				status: shopierResponse.status,
				error: apiMessage || "Shopier API returned a non-success response",
				request_id: shopierResponseInfo.requestId
			};
			console.error("Shopier product creation failed", {
				intentId,
				status: shopierResponse.status,
				body: shopierResponseInfo.rawBody.slice(0, SHOPIER_DIAGNOSTIC_BODY_LIMIT),
				requestId: shopierResponseInfo.requestId,
				message: apiMessage
			});
			await serviceSupabase.from("shopier_checkout_intents").update({
				shopier_api_status: diagnostic.status,
				shopier_api_error: diagnostic.error,
				shopier_api_request_id: diagnostic.request_id,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", intentId).eq("user_id", authData.user.id);
			await releaseIntent(`shopier_http_${shopierResponse.status}`);
			if (shopierResponse.status === 401 || shopierResponse.status === 403) return json$1({
				ok: false,
				reason: "shopier_auth_failed"
			}, 502);
			if (shopierResponse.status === 400 || shopierResponse.status === 422) return json$1({
				ok: false,
				reason: "shopier_validation_failed"
			}, 502);
			if (shopierResponse.status === 429) return json$1({
				ok: false,
				reason: "shopier_rate_limited"
			}, 429);
			return json$1({
				ok: false,
				reason: "shopier_product_creation_failed"
			}, 502);
		}
		const product = shopierBody.data && typeof shopierBody.data === "object" ? shopierBody.data : shopierBody;
		const shopierProductId = getString(product.id) || getString(product.product_id) || getString(shopierBody.id) || getString(shopierBody.product_id);
		const explicitCheckoutUrl = getString(product.checkout_url) || getString(product.checkoutUrl) || getString(shopierBody.checkout_url) || getString(shopierBody.checkoutUrl);
		const productUrl = getString(product.url) || getString(shopierBody.url);
		if (!shopierProductId) {
			console.error("Shopier product creation returned no product id", {
				intentId,
				status: shopierResponse.status,
				body: shopierResponseInfo.rawBody.slice(0, SHOPIER_DIAGNOSTIC_BODY_LIMIT),
				requestId: shopierResponseInfo.requestId
			});
			await serviceSupabase.from("shopier_checkout_intents").update({
				shopier_api_status: shopierResponse.status,
				shopier_api_error: "Shopier returned success without a product id",
				shopier_api_request_id: shopierResponseInfo.requestId,
				updated_at: (/* @__PURE__ */ new Date()).toISOString()
			}).eq("id", intentId).eq("user_id", authData.user.id);
			await releaseIntent("shopier_product_id_missing");
			return json$1({
				ok: false,
				reason: "shopier_product_id_missing"
			}, 502);
		}
		const canonicalProductUrl = `https://www.shopier.com/${encodeURIComponent(shopierProductId)}`;
		const checkoutUrl = [
			explicitCheckoutUrl,
			productUrl,
			canonicalProductUrl
		].find((candidate) => isShopierUrl$1(candidate)) || canonicalProductUrl;
		const { error: intentUpdateError } = await serviceSupabase.from("shopier_checkout_intents").update({
			shopier_product_id: shopierProductId,
			checkout_url: checkoutUrl,
			status: "redirected",
			shopier_api_status: shopierResponse.status,
			shopier_api_error: null,
			shopier_api_request_id: shopierResponseInfo.requestId,
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", intentId).eq("user_id", authData.user.id).in("status", ["pending", "redirected"]);
		if (intentUpdateError) {
			console.error("Shopier intent persistence failed", {
				intentId,
				code: intentUpdateError.code,
				message: intentUpdateError.message
			});
			await releaseIntent("intent_persistence_failed");
			return json$1({
				ok: false,
				reason: "checkout_persistence_failed"
			}, 500);
		}
		return json$1({
			ok: true,
			...intent,
			shopier_product_id: shopierProductId,
			checkout_url: checkoutUrl,
			shopier_product_url: productUrl || canonicalProductUrl
		}, 200);
	} catch (error) {
		console.error("Unexpected Shopier checkout error", {
			intentId,
			message: error instanceof Error ? error.message : String(error)
		});
		if (releaseIntent) await releaseIntent("internal_error").catch(() => void 0);
		return json$1({
			ok: false,
			reason: "internal_error"
		}, 500);
	}
} } } });
var getEnv$2 = (name) => process.env[name]?.trim() || "";
var escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&apos;");
var isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
var tierName = (tier) => ({
	digital: "DİJİTAL",
	elite: "ÖZEL",
	premium: "PREMİUM"
})[tier] || "PARSEL";
var Route$2 = createFileRoute("/api/shopier/parcel-image")({ server: { handlers: { GET: async ({ request }) => {
	const url = new URL(request.url);
	const ids = [...new Set((url.searchParams.get("ids") || "").split(",").map((value) => value.trim()).filter(isUuid))].slice(0, 100);
	const supabaseUrl = getEnv$2("SUPABASE_URL") || getEnv$2("VITE_SUPABASE_URL");
	const serviceRoleKey = getEnv$2("SUPABASE_SECRET_KEY") || getEnv$2("SUPABASE_SERVICE_ROLE_KEY");
	if (!ids.length || !supabaseUrl || !serviceRoleKey) return new Response("Invalid parcel thumbnail request", { status: 400 });
	const { data, error } = await createClient(supabaseUrl, serviceRoleKey, { auth: {
		autoRefreshToken: false,
		persistSession: false,
		detectSessionInUrl: false
	} }).from("parcels").select("parcel_number,tier").in("id", ids);
	if (error || !data?.length) return new Response("Parcel thumbnail unavailable", { status: 404 });
	const parcels = data.map((row) => ({
		number: String(row.parcel_number || "PARSEL"),
		tier: String(row.tier || "digital")
	}));
	const first = parcels[0];
	const countLabel = parcels.length > 1 ? `+${parcels.length - 1} PARSEL` : "1 PARSEL";
	const width = 800;
	const height = 500;
	const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#050b1f"/>
      <stop offset="55%" stop-color="#0b1d3a"/>
      <stop offset="100%" stop-color="#102b52"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#d7b86a" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#d7b86a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="800" height="500" rx="32" fill="url(#bg)"/>
  <rect width="800" height="500" rx="32" fill="url(#glow)"/>
  <g stroke="#d7b86a" stroke-opacity="0.18" stroke-width="1">
    <path d="M80 0V500M160 0V500M240 0V500M320 0V500M400 0V500M480 0V500M560 0V500M640 0V500M720 0V500"/>
    <path d="M0 80H800M0 160H800M0 240H800M0 320H800M0 400H800"/>
  </g>
  <rect x="42" y="42" width="716" height="416" rx="24" fill="none" stroke="#d7b86a" stroke-opacity="0.45" stroke-width="2"/>
  <text x="70" y="95" fill="#ffffff" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="4">MYSKYPARCEL</text>
  <text x="730" y="95" text-anchor="end" fill="#d7b86a" font-family="Arial, sans-serif" font-size="17" font-weight="700">${escapeXml(tierName(first.tier))}</text>
  <rect x="105" y="135" width="590" height="205" rx="18" fill="#071226" stroke="#d7b86a" stroke-opacity="0.65" stroke-width="2"/>
  <path d="M135 285L205 215L275 270L355 185L440 265L520 205L665 300" fill="none" stroke="#d7b86a" stroke-opacity="0.75" stroke-width="3"/>
  <path d="M135 305L220 250L300 305L385 230L470 305L555 250L665 315" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2"/>
  <text x="400" y="205" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="34" font-weight="800" letter-spacing="2">${escapeXml(first.number)}</text>
  <text x="400" y="390" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="20" font-weight="700">${escapeXml(countLabel)}</text>
  <text x="400" y="425" text-anchor="middle" fill="#d7b86a" font-family="Arial, sans-serif" font-size="15" letter-spacing="2">SEÇİLEN PARSEL / PARSELLER</text>
</svg>`;
	return new Response(svg, {
		status: 200,
		headers: {
			"content-type": "image/svg+xml; charset=utf-8",
			"cache-control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
			"access-control-allow-origin": "*"
		}
	});
} } } });
var html = (body, status = 200) => new Response(body, {
	status,
	headers: {
		"content-type": "text/html; charset=utf-8",
		"cache-control": "no-store",
		"x-content-type-options": "nosniff"
	}
});
var getEnv$1 = (name) => process.env[name]?.trim() || "";
var escapeHtml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
var isShopierUrl = (value) => {
	try {
		const url = new URL(value);
		return url.protocol === "https:" && (url.hostname === "shopier.com" || url.hostname.endsWith(".shopier.com"));
	} catch {
		return false;
	}
};
var Route$1 = createFileRoute("/api/shopier/redirect")({ server: { handlers: { GET: async ({ request }) => {
	try {
		const intentId = new URL(request.url).searchParams.get("intent")?.trim() || "";
		const supabaseUrl = getEnv$1("SUPABASE_URL") || getEnv$1("VITE_SUPABASE_URL");
		const serviceRoleKey = getEnv$1("SUPABASE_SECRET_KEY") || getEnv$1("SUPABASE_SERVICE_ROLE_KEY");
		if (!intentId || !supabaseUrl || !serviceRoleKey) {
			console.error("Shopier redirect is not configured", {
				hasIntent: Boolean(intentId),
				hasSupabaseUrl: Boolean(supabaseUrl),
				hasServiceRoleKey: Boolean(serviceRoleKey)
			});
			return html("<!doctype html><html lang=\"tr\"><body>Ödeme bağlantısı yapılandırılamadı.</body></html>", 503);
		}
		const { data: intent, error } = await createClient(supabaseUrl, serviceRoleKey, { auth: {
			autoRefreshToken: false,
			persistSession: false,
			detectSessionInUrl: false
		} }).from("shopier_checkout_intents").select("id,shopier_product_id,checkout_url,status,expires_at").eq("id", intentId).maybeSingle();
		if (error || !intent?.shopier_product_id) {
			console.error("Shopier redirect intent lookup failed", {
				intentId,
				code: error?.code,
				message: error?.message
			});
			return html("<!doctype html><html lang=\"tr\"><body>Ödeme bağlantısı bulunamadı.</body></html>", 404);
		}
		if (!["pending", "redirected"].includes(String(intent.status))) return html("<!doctype html><html lang=\"tr\"><body>Bu ödeme oturumu artık kullanılamıyor.</body></html>", 410);
		if (intent.expires_at && new Date(String(intent.expires_at)).getTime() <= Date.now()) return html("<!doctype html><html lang=\"tr\"><body>Ödeme oturumunun süresi dolmuş.</body></html>", 410);
		const storedCheckoutUrl = typeof intent.checkout_url === "string" ? intent.checkout_url.trim() : "";
		const canonicalProductUrl = `https://www.shopier.com/${encodeURIComponent(String(intent.shopier_product_id))}`;
		const productUrl = isShopierUrl(storedCheckoutUrl) ? storedCheckoutUrl : canonicalProductUrl;
		const safeProductUrl = escapeHtml(productUrl);
		return html(`<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0;url=${safeProductUrl}">
  <title>Shopier Ödeme</title>
</head>
<body>
  <p>Shopier güvenli ödeme sayfasına yönlendiriliyorsunuz...</p>
  <p><a href="${safeProductUrl}">Shopier ile ödemeye devam et</a></p>
  <script>window.location.replace(${JSON.stringify(productUrl)});<\/script>
</body>
</html>`);
	} catch (error) {
		console.error("Shopier redirect error", error);
		return html("<!doctype html><html lang=\"tr\"><body>Ödeme yönlendirmesi hazırlanamadı.</body></html>", 500);
	}
} } } });
var json = (body, status = 200) => new Response(JSON.stringify(body), {
	status,
	headers: {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store"
	}
});
var getEnv = (name) => process.env[name]?.trim() || "";
var verifySignature = (token, rawBody, received) => {
	if (!token || !received) return false;
	const expectedHex = createHmac("sha256", token).update(rawBody).digest("hex");
	const expectedBase64 = createHmac("sha256", token).update(rawBody).digest("base64");
	const safeEqual = (expected) => {
		const a = Buffer.from(expected, "utf8");
		const b = Buffer.from(received.trim(), "utf8");
		return a.length === b.length && timingSafeEqual(a, b);
	};
	return safeEqual(expectedHex) || safeEqual(expectedBase64);
};
var asRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value) ? value : {};
var firstString = (...values) => {
	for (const value of values) {
		if (typeof value === "string" && value.trim()) return value.trim();
		if (typeof value === "number" && Number.isFinite(value)) return String(value);
	}
	return "";
};
var Route = createFileRoute("/api/shopier/webhook")({ server: { handlers: { POST: async ({ request }) => {
	const rawBody = await request.text();
	const signature = request.headers.get("Shopier-Signature") ?? request.headers.get("shopier-signature") ?? "";
	const webhookToken = getEnv("SHOPIER_WEBHOOK_TOKEN");
	if (!webhookToken) {
		console.error("Shopier webhook token is not configured");
		return json({
			ok: false,
			reason: "webhook_not_configured"
		}, 503);
	}
	if (!verifySignature(webhookToken, rawBody, signature)) return json({
		ok: false,
		reason: "invalid_signature"
	}, 401);
	let payload;
	try {
		payload = asRecord(JSON.parse(rawBody));
	} catch {
		return json({
			ok: false,
			reason: "invalid_json"
		}, 400);
	}
	const eventType = firstString(request.headers.get("shopier-event"), payload.event, payload.type).toLowerCase();
	const webhookId = firstString(request.headers.get("shopier-webhook-id"), payload.webhookId, payload.eventId, payload.id);
	const data = asRecord(payload.data ?? payload.order ?? payload);
	const orderId = firstString(data.id, payload.orderId, payload.shopierOrderId);
	const paymentStatus = firstString(data.paymentStatus, payload.paymentStatus).toLowerCase();
	const fulfillmentStatus = firstString(data.status, payload.status).toLowerCase();
	const currency = firstString(data.currency, payload.currency || "TRY").toUpperCase();
	const totals = asRecord(data.totals);
	const amount = Number(firstString(totals.total, data.total, payload.total, payload.amount));
	const productId = firstString(asRecord((Array.isArray(data.lineItems) ? data.lineItems : [])[0]).productId, data.productId, payload.productId);
	const paymentId = firstString(data.paymentId, payload.paymentId, asRecord(data.payment).id);
	const supabaseUrl = getEnv("SUPABASE_URL") || getEnv("VITE_SUPABASE_URL");
	const serviceRoleKey = getEnv("SUPABASE_SECRET_KEY") || getEnv("SUPABASE_SERVICE_ROLE_KEY");
	if (!supabaseUrl || !serviceRoleKey) {
		console.error("Supabase service configuration is missing for Shopier webhook");
		return json({
			ok: false,
			reason: "supabase_not_configured"
		}, 503);
	}
	const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: {
		autoRefreshToken: false,
		persistSession: false,
		detectSessionInUrl: false
	} });
	const eventRow = {
		event_id: webhookId || null,
		event_type: eventType || null,
		shopier_order_id: orderId || null,
		signature_valid: true,
		payload,
		received_at: (/* @__PURE__ */ new Date()).toISOString(),
		processing_status: "received"
	};
	let eventRecordId = null;
	const { data: insertedEvent, error: eventInsertError } = await supabase.from("shopier_webhook_events").insert(eventRow).select("id").maybeSingle();
	if (!eventInsertError) eventRecordId = insertedEvent?.id ?? null;
	else if (eventInsertError.code === "23505" && webhookId) {
		const { data: existingEvent, error: existingEventError } = await supabase.from("shopier_webhook_events").select("id,processing_status").eq("event_id", webhookId).maybeSingle();
		if (existingEventError || !existingEvent) {
			console.error("Shopier webhook duplicate lookup failed", existingEventError);
			return json({
				ok: false,
				reason: "event_persistence_failed"
			}, 500);
		}
		if (existingEvent.processing_status === "processed") return json({
			ok: true,
			status: "duplicate"
		}, 200);
		eventRecordId = existingEvent.id;
		const { error: retryUpdateError } = await supabase.from("shopier_webhook_events").update({
			event_type: eventType || null,
			shopier_order_id: orderId || null,
			signature_valid: true,
			payload,
			received_at: (/* @__PURE__ */ new Date()).toISOString(),
			processing_status: "received",
			processing_error: null,
			processed_at: null
		}).eq("id", eventRecordId);
		if (retryUpdateError) {
			console.error("Shopier webhook retry persistence failed", retryUpdateError);
			return json({
				ok: false,
				reason: "event_persistence_failed"
			}, 500);
		}
	} else {
		console.error("Shopier webhook event persistence failed", eventInsertError);
		return json({
			ok: false,
			reason: "event_persistence_failed"
		}, 500);
	}
	if (eventType !== "order.fulfilled") {
		await supabase.from("shopier_webhook_events").update({
			processing_status: "ignored",
			processed_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", eventRecordId);
		return json({
			ok: true,
			status: "ignored",
			event: eventType || null
		}, 200);
	}
	if (paymentStatus !== "paid" || fulfillmentStatus !== "fulfilled") {
		await supabase.from("shopier_webhook_events").update({
			processing_status: "ignored",
			processing_error: "order_not_paid_or_not_fulfilled",
			processed_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", eventRecordId);
		return json({
			ok: true,
			status: "ignored"
		}, 200);
	}
	if (!orderId || !productId || !Number.isFinite(amount) || amount <= 0 || currency !== "TRY") {
		await supabase.from("shopier_webhook_events").update({
			processing_status: "failed",
			processing_error: "missing_or_invalid_order_fields",
			processed_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", eventRecordId);
		return json({
			ok: false,
			reason: "invalid_order"
		}, 400);
	}
	const { data: intent, error: intentLookupError } = await supabase.from("shopier_checkout_intents").select("id,shopier_product_id").eq("shopier_product_id", productId).maybeSingle();
	if (intentLookupError || !intent) {
		const message = intentLookupError?.message || "checkout_intent_not_found";
		await supabase.from("shopier_webhook_events").update({
			processing_status: "failed",
			processing_error: message,
			processed_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", eventRecordId);
		return json({
			ok: false,
			reason: "checkout_intent_not_found"
		}, 404);
	}
	const { data: completion, error: completionError } = await supabase.rpc("complete_shopier_checkout", {
		p_intent_id: intent.id,
		p_shopier_order_id: orderId,
		p_shopier_payment_id: paymentId || null,
		p_shopier_product_id: productId,
		p_amount: amount,
		p_currency: currency
	});
	if (completionError) {
		console.error("Shopier checkout completion failed", completionError);
		await supabase.from("shopier_webhook_events").update({
			processing_status: "failed",
			processing_error: completionError.message,
			processed_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", eventRecordId);
		return json({
			ok: false,
			reason: "checkout_completion_failed"
		}, 500);
	}
	await supabase.from("shopier_webhook_events").update({
		processing_status: "processed",
		processing_error: null,
		processed_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", eventRecordId);
	return json({
		ok: true,
		status: "processed",
		completion
	}, 200);
} } } });
var rootRouteChildren = {
	IndexRoute: Route$45.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$46
	}),
	AdminCheckRoute: Route$44.update({
		id: "/admin-check",
		path: "/admin-check",
		getParentRoute: () => Route$46
	}),
	AnaSayfaRoute: Route$43.update({
		id: "/ana-sayfa",
		path: "/ana-sayfa",
		getParentRoute: () => Route$46
	}),
	BildirimlerRoute: Route$42.update({
		id: "/bildirimler",
		path: "/bildirimler",
		getParentRoute: () => Route$46
	}),
	CerezPolitikasiRoute: Route$41.update({
		id: "/cerez-politikasi",
		path: "/cerez-politikasi",
		getParentRoute: () => Route$46
	}),
	DestekRoute: Route$40.update({
		id: "/destek",
		path: "/destek",
		getParentRoute: () => Route$46
	}),
	DogrulaRoute: Route$39.update({
		id: "/dogrula",
		path: "/dogrula",
		getParentRoute: () => Route$46
	}),
	GirisRoute: Route$38.update({
		id: "/giris",
		path: "/giris",
		getParentRoute: () => Route$46
	}),
	GizlilikPolitikasiRoute: Route$37.update({
		id: "/gizlilik-politikasi",
		path: "/gizlilik-politikasi",
		getParentRoute: () => Route$46
	}),
	GokyuzuHaritasiRoute: Route$36.update({
		id: "/gokyuzu-haritasi",
		path: "/gokyuzu-haritasi",
		getParentRoute: () => Route$46
	}),
	GuvenlikAyarlariRoute: Route$35.update({
		id: "/guvenlik-ayarlari",
		path: "/guvenlik-ayarlari",
		getParentRoute: () => Route$46
	}),
	HakkimizdaRoute: Route$34.update({
		id: "/hakkimizda",
		path: "/hakkimizda",
		getParentRoute: () => Route$46
	}),
	HediyeKabulRoute: Route$33.update({
		id: "/hediye-kabul",
		path: "/hediye-kabul",
		getParentRoute: () => Route$46
	}),
	HediyelerimRoute: Route$32.update({
		id: "/hediyelerim",
		path: "/hediyelerim",
		getParentRoute: () => Route$46
	}),
	IadeIptalPolitikasiRoute: Route$31.update({
		id: "/iade-iptal-politikasi",
		path: "/iade-iptal-politikasi",
		getParentRoute: () => Route$46
	}),
	IletisimRoute: Route$30.update({
		id: "/iletisim",
		path: "/iletisim",
		getParentRoute: () => Route$46
	}),
	KayitOlRoute: Route$29.update({
		id: "/kayit-ol",
		path: "/kayit-ol",
		getParentRoute: () => Route$46
	}),
	KullanimSartlariRoute: Route$28.update({
		id: "/kullanim-sartlari",
		path: "/kullanim-sartlari",
		getParentRoute: () => Route$46
	}),
	KvkkRoute: Route$27.update({
		id: "/kvkk",
		path: "/kvkk",
		getParentRoute: () => Route$46
	}),
	MesafeliSatisSozlesmesiRoute: Route$26.update({
		id: "/mesafeli-satis-sozlesmesi",
		path: "/mesafeli-satis-sozlesmesi",
		getParentRoute: () => Route$46
	}),
	NasilCalisirRoute: Route$25.update({
		id: "/nasil-calisir",
		path: "/nasil-calisir",
		getParentRoute: () => Route$46
	}),
	OnBilgilendirmeFormuRoute: Route$24.update({
		id: "/on-bilgilendirme-formu",
		path: "/on-bilgilendirme-formu",
		getParentRoute: () => Route$46
	}),
	PaketlerRoute: Route$23.update({
		id: "/paketler",
		path: "/paketler",
		getParentRoute: () => Route$46
	}),
	PanelimRoute: Route$22.update({
		id: "/panelim",
		path: "/panelim",
		getParentRoute: () => Route$46
	}),
	ParselHatirasiRoute: Route$21.update({
		id: "/parsel-hatirasi",
		path: "/parsel-hatirasi",
		getParentRoute: () => Route$46
	}),
	ParselSatinAlRoute: Route$20.update({
		id: "/parsel-satin-al",
		path: "/parsel-satin-al",
		getParentRoute: () => Route$46
	}),
	ParsellerimRoute: Route$19.update({
		id: "/parsellerim",
		path: "/parsellerim",
		getParentRoute: () => Route$46
	}),
	PazarYeriRoute: Route$18.update({
		id: "/pazar-yeri",
		path: "/pazar-yeri",
		getParentRoute: () => Route$46
	}),
	ProfilimRoute: Route$17.update({
		id: "/profilim",
		path: "/profilim",
		getParentRoute: () => Route$46
	}),
	PurchaseRoute: Route$16.update({
		id: "/purchase",
		path: "/purchase",
		getParentRoute: () => Route$46
	}),
	PurchaseBulkRoute: Route$15.update({
		id: "/purchase-bulk",
		path: "/purchase-bulk",
		getParentRoute: () => Route$46
	}),
	SertifikaDogrulaRoute: Route$14.update({
		id: "/sertifika-dogrula",
		path: "/sertifika-dogrula",
		getParentRoute: () => Route$46
	}),
	SertifikaTalepRoute: Route$13.update({
		id: "/sertifika-talep",
		path: "/sertifika-talep",
		getParentRoute: () => Route$46
	}),
	SertifikalarimRoute: Route$12.update({
		id: "/sertifikalarim",
		path: "/sertifikalarim",
		getParentRoute: () => Route$46
	}),
	SifreYenileRoute: Route$11.update({
		id: "/sifre-yenile",
		path: "/sifre-yenile",
		getParentRoute: () => Route$46
	}),
	SifremiUnuttumRoute: Route$10.update({
		id: "/sifremi-unuttum",
		path: "/sifremi-unuttum",
		getParentRoute: () => Route$46
	}),
	SiparislerimRoute: Route$9.update({
		id: "/siparislerim",
		path: "/siparislerim",
		getParentRoute: () => Route$46
	}),
	TurkiyeHaritasiRoute: Route$8.update({
		id: "/turkiye-haritasi",
		path: "/turkiye-haritasi",
		getParentRoute: () => Route$46
	}),
	UyelikSozlesmesiRoute: Route$7.update({
		id: "/uyelik-sozlesmesi",
		path: "/uyelik-sozlesmesi",
		getParentRoute: () => Route$46
	}),
	YonetimRoute: Route$6.update({
		id: "/yonetim",
		path: "/yonetim",
		getParentRoute: () => Route$46
	}),
	ApiEarthAssetsRoute: Route$5.update({
		id: "/api/earth-assets",
		path: "/api/earth-assets",
		getParentRoute: () => Route$46
	}),
	SehirSlugRoute: Route$4.update({
		id: "/sehir/$slug",
		path: "/sehir/$slug",
		getParentRoute: () => Route$46
	}),
	ApiShopierCheckoutRoute: Route$3.update({
		id: "/api/shopier/checkout",
		path: "/api/shopier/checkout",
		getParentRoute: () => Route$46
	}),
	ApiShopierParcelImageRoute: Route$2.update({
		id: "/api/shopier/parcel-image",
		path: "/api/shopier/parcel-image",
		getParentRoute: () => Route$46
	}),
	ApiShopierRedirectRoute: Route$1.update({
		id: "/api/shopier/redirect",
		path: "/api/shopier/redirect",
		getParentRoute: () => Route$46
	}),
	ApiShopierWebhookRoute: Route.update({
		id: "/api/shopier/webhook",
		path: "/api/shopier/webhook",
		getParentRoute: () => Route$46
	})
};
var routeTree = Route$46._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll$1({ getRouter: () => getRouter });
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { router_BfErbPzM_exports as a, createBrowserSupabase as i, Route$20 as n, supabaseBrowser as o, Route$4 as r, useAuth as s, Route$14 as t };
