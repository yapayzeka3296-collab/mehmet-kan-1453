import { i as __toESM, n as __exportAll$1 } from "../_runtime.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { n as supabaseBrowser } from "./supabaseBrowser-eZYvgmwE.mjs";
import { n as require_jsx_runtime, r as require_react, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, b as useRouter, f as createRouter, g as createRootRouteWithContext, h as createFileRoute, l as Scripts, m as lazyRouteComponent, p as Outlet, u as HeadContent } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as objectType, r as stringType, t as arrayType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-C28Q36UD.js
var router_C28Q36UD_exports = /* @__PURE__ */ __exportAll$1({
	a: () => Route$24,
	getRouter: () => getRouter,
	i: () => Route$16,
	n: () => Route$7,
	o: () => useAuth,
	r: () => Route$13,
	t: () => router_exports
});
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var styles_default = "/assets/styles-D99r_CKn.css";
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
var AuthContext = (0, import_react.createContext)(void 0);
var ADMIN_EMAIL = "incememet3296@gmail.com";
var PROTECTED_PATHS = /* @__PURE__ */ new Set([
	"/panelim",
	"/parsellerim",
	"/siparislerim",
	"/sertifikalarim",
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
	if (path === "/giris") return;
	const redirect = `${window.location.pathname}${window.location.search}${window.location.hash}`;
	window.location.replace(`/giris?redirect=${encodeURIComponent(redirect)}`);
}
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
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
			if (typeof window !== "undefined" && window.location.pathname === "/yonetim" && u.role !== "admin") window.location.replace("/panelim");
			else if (typeof window !== "undefined" && window.location.pathname === "/giris" && u.role === "admin") window.location.replace("/yonetim");
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
						redirectToLogin();
					}
				}
			} catch (err) {
				console.error("Error fetching session", err);
				if (mounted) {
					setUser(null);
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
				if (event === "SIGNED_OUT" && typeof window !== "undefined" && window.location.pathname === "/yonetim") return;
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
	async function signUp(email, password, name) {
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
			if (password.length < 10) {
				const msg = "Şifre en az 10 karakter olmalıdır.";
				setError(msg);
				return {
					success: false,
					error: msg
				};
			}
			const options = {
				emailRedirectTo: getEmailRedirectUrl(),
				...name?.trim() ? { data: { full_name: name.trim() } } : {}
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
function SiteVisitTracker() {
	const [stats, setStats] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!supabaseBrowser) return;
		const sessionId = getSessionId();
		const record = () => {
			supabaseBrowser.rpc("record_site_visit", {
				p_session_id: sessionId,
				p_path: window.location.pathname
			});
		};
		record();
		const timer = window.setInterval(record, 6e4);
		return () => window.clearInterval(timer);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!supabaseBrowser || window.location.pathname !== "/yonetim") return;
		let cancelled = false;
		const loadStats = async () => {
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
			window.clearInterval(timer);
		};
	}, []);
	if (!stats || typeof window === "undefined" || window.location.pathname !== "/yonetim") return null;
	const cards = [
		["Şu an aktif", stats.active_now],
		["Bugün", stats.today],
		["Bu hafta", stats.week],
		["Bu ay", stats.month],
		["Toplam", stats.total],
		["Bugünkü sayfa görüntüleme", stats.pages_today]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mx-4 mt-4 rounded-xl border border-gold/30 bg-background/95 p-4 shadow-lg lg:ml-[266px] lg:mr-6 lg:mt-4 lg:p-5",
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
	});
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
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
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
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$31 = createRootRouteWithContext()({
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
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "stylesheet",
				href: "/login-background.css"
			},
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
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
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
			content: "FnBKvdIxURn7yQQY7YNxhbM-sxPfNEjJfG4gmZKh0ec"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$31.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteVisitTracker, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})] })
	});
}
var $$splitComponentImporter$27 = () => import("./routes-DN4CNkLX.mjs");
var Route$30 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "MySkyParcel — Gökyüzünde Sana Özel Sembolik Bir Yer" }, {
		name: "description",
		content: "81 il ve 81 milyon benzersiz gökyüzü parseli fikri."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$27, "component")
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
var Route$29 = createFileRoute("/admin-check")({ server: { handlers: { GET } } });
var $$splitComponentImporter$26 = () => import("./cerez-politikasi-rjzRC74Q.mjs");
var Route$28 = createFileRoute("/cerez-politikasi")({
	head: () => ({ meta: [{ title: "Çerez Politikası — MySkyParcel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$26, "component")
});
var $$splitComponentImporter$25 = () => import("./dogrula-BQiHW5VO.mjs");
var Route$27 = createFileRoute("/dogrula")({
	head: () => ({ meta: [{ title: "E-posta Doğrulama — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel e-posta doğrulama sonucu."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$25, "component")
});
var $$splitComponentImporter$24 = () => import("./giris-DS6VEXK9.mjs");
var Route$26 = createFileRoute("/giris")({
	head: () => ({ meta: [
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
	] }),
	component: lazyRouteComponent($$splitComponentImporter$24, "component")
});
var $$splitComponentImporter$23 = () => import("./gizlilik-politikasi-DlP1sdCF.mjs");
var Route$25 = createFileRoute("/gizlilik-politikasi")({
	head: () => ({ meta: [{ title: "Gizlilik Politikası — MySkyParcel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./gokyuzu-haritasi-DCyXIZ3o.mjs");
var Route$24 = createFileRoute("/gokyuzu-haritasi")({
	validateSearch: objectType({
		city: stringType().optional(),
		parcels: stringType().optional(),
		lat: stringType().optional(),
		lng: stringType().optional()
	}),
	head: () => ({ meta: [
		{ title: "Gökyüzü Haritası — MySkyParcel" },
		{
			name: "description",
			content: "MySkyParcel dijital parsellerini Google Maps üzerinde keşfet, seç ve detaylarını incele."
		},
		{
			property: "og:title",
			content: "Gökyüzü Haritası — MySkyParcel"
		},
		{
			property: "og:description",
			content: "MySkyParcel parsellerini gerçek harita üzerinde keşfet."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$22, "component")
});
var $$splitComponentImporter$21 = () => import("./guvenlik-ayarlari-Cflv9mkP.mjs");
var Route$23 = createFileRoute("/guvenlik-ayarlari")({
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
	component: lazyRouteComponent($$splitComponentImporter$21, "component")
});
var $$splitComponentImporter$20 = () => import("./hakkimizda-DKQplu5k.mjs");
var Route$22 = createFileRoute("/hakkimizda")({
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
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./iletisim--GCIvjWP.mjs");
var Route$21 = createFileRoute("/iletisim")({
	head: () => ({ meta: [
		{ title: "İletişim — MySkyParcel" },
		{
			name: "description",
			content: "Sorularınız için MySkyParcel destek ekibiyle 7/24 iletişime geçin."
		},
		{
			property: "og:title",
			content: "İletişim — MySkyParcel"
		},
		{
			property: "og:description",
			content: "MySkyParcel iletişim bilgileri ve destek formu."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$19, "component")
});
var $$splitComponentImporter$18 = () => import("./kayit-ol-D2Nhgpl_.mjs");
var Route$20 = createFileRoute("/kayit-ol")({
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
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./kullanim-sartlari-D-b4Yyd0.mjs");
var Route$19 = createFileRoute("/kullanim-sartlari")({
	head: () => ({ meta: [{ title: "Kullanım Şartları — MySkyParcel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./kvkk-DvNhLBd1.mjs");
var Route$18 = createFileRoute("/kvkk")({
	head: () => ({ meta: [{ title: "KVKK Aydınlatma Metni — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel KVKK Aydınlatma Metni."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./nasil-calisir-1Qa8_9In.mjs");
var Route$17 = createFileRoute("/nasil-calisir")({
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
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./odeme-CN3I89VB.mjs");
var Route$16 = createFileRoute("/odeme")({
	validateSearch: (search) => ({ parcels: typeof search.parcels === "string" ? search.parcels : "" }),
	head: () => ({ meta: [{ title: "Ödeme — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel parsel satın alma ödeme adımı."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./paketler-rWkvL-AU.mjs");
var Route$15 = createFileRoute("/paketler")({
	head: () => ({ meta: [{ title: "Sertifika Seçenekleri — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel Digital, Özel ve Premium sertifika seçeneklerini ve gerçek tasarım önizlemelerini inceleyin."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./panelim-BaUpT8yj.mjs");
var Route$14 = createFileRoute("/panelim")({
	head: () => ({ meta: [{ title: "Panelim — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel kullanıcı paneli."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./parsel-satin-al-B_aHPBGn.mjs");
var Route$13 = createFileRoute("/parsel-satin-al")({
	validateSearch: (search) => ({ parcels: typeof search.parcels === "string" ? search.parcels : void 0 }),
	head: () => ({ meta: [{ title: "Parsel Satın Al — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel parsel satın alma adımını tamamlayın."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./parsellerim-CarK7i44.mjs");
var Route$12 = createFileRoute("/parsellerim")({
	head: () => ({ meta: [{ title: "Koleksiyonum — MySkyParcel" }, {
		name: "description",
		content: "Satın aldığın gökyüzü parsellerini tek koleksiyon alanında görüntüle."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./pazar-yeri-iBalFbx3.mjs");
var Route$11 = createFileRoute("/pazar-yeri")({
	head: () => ({ meta: [{ title: "Pazar Yeri — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel Pazar Yeri çok yakında."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./profilim-Ddrf2IRe.mjs");
var Route$10 = createFileRoute("/profilim")({
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
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
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
var Route$9 = createFileRoute("/purchase")({ server: { handlers: { POST: POST$1 } } });
var ParamsSchema = objectType({ parcel_ids: arrayType(stringType().uuid()).min(1).max(5e3) });
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
			count: Array.isArray(orders) ? orders.length : parse.data.parcel_ids.length,
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
var Route$8 = createFileRoute("/purchase-bulk")({ server: { handlers: { POST } } });
var $$splitComponentImporter$7 = () => import("./sertifika-dogrula-C-1vpwmq.mjs");
var Route$7 = createFileRoute("/sertifika-dogrula")({
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
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./sertifika-talep-DV8vOv0q.mjs");
var Route$6 = createFileRoute("/sertifika-talep")({
	head: () => ({ meta: [{ title: "Sertifika Talebi — MySkyParcel" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./sertifikalarim-Ba5l0M9F.mjs");
var Route$5 = createFileRoute("/sertifikalarim")({
	head: () => ({ meta: [{ title: "Sertifikalarım — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel sertifikalarınızı görüntüleyin ve doğrulayın."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./sifre-yenile-B1CUsL8_.mjs");
var Route$4 = createFileRoute("/sifre-yenile")({
	head: () => ({ meta: [{ title: "Şifre Yenile — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel hesabınız için yeni şifrenizi belirleyin."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./sifremi-unuttum-gruBg2Y-.mjs");
var Route$3 = createFileRoute("/sifremi-unuttum")({
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
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./siparislerim-DGvXWRWF.mjs");
var Route$2 = createFileRoute("/siparislerim")({
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
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./uyelik-sozlesmesi-udvhxiYv.mjs");
var Route$1 = createFileRoute("/uyelik-sozlesmesi")({
	head: () => ({ meta: [{ title: "Üyelik Sözleşmesi — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel Üyelik Sözleşmesi."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./yonetim-xhAohDxq.mjs");
var Route = createFileRoute("/yonetim")({
	head: () => ({ meta: [{ title: "Yönetim Paneli — MySkyParcel" }, {
		name: "description",
		content: "MySkyParcel güvenli yönetim paneli."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$30.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$31
	}),
	AdminCheckRoute: Route$29.update({
		id: "/admin-check",
		path: "/admin-check",
		getParentRoute: () => Route$31
	}),
	CerezPolitikasiRoute: Route$28.update({
		id: "/cerez-politikasi",
		path: "/cerez-politikasi",
		getParentRoute: () => Route$31
	}),
	DogrulaRoute: Route$27.update({
		id: "/dogrula",
		path: "/dogrula",
		getParentRoute: () => Route$31
	}),
	GirisRoute: Route$26.update({
		id: "/giris",
		path: "/giris",
		getParentRoute: () => Route$31
	}),
	GizlilikPolitikasiRoute: Route$25.update({
		id: "/gizlilik-politikasi",
		path: "/gizlilik-politikasi",
		getParentRoute: () => Route$31
	}),
	GokyuzuHaritasiRoute: Route$24.update({
		id: "/gokyuzu-haritasi",
		path: "/gokyuzu-haritasi",
		getParentRoute: () => Route$31
	}),
	GuvenlikAyarlariRoute: Route$23.update({
		id: "/guvenlik-ayarlari",
		path: "/guvenlik-ayarlari",
		getParentRoute: () => Route$31
	}),
	HakkimizdaRoute: Route$22.update({
		id: "/hakkimizda",
		path: "/hakkimizda",
		getParentRoute: () => Route$31
	}),
	IletisimRoute: Route$21.update({
		id: "/iletisim",
		path: "/iletisim",
		getParentRoute: () => Route$31
	}),
	KayitOlRoute: Route$20.update({
		id: "/kayit-ol",
		path: "/kayit-ol",
		getParentRoute: () => Route$31
	}),
	KullanimSartlariRoute: Route$19.update({
		id: "/kullanim-sartlari",
		path: "/kullanim-sartlari",
		getParentRoute: () => Route$31
	}),
	KvkkRoute: Route$18.update({
		id: "/kvkk",
		path: "/kvkk",
		getParentRoute: () => Route$31
	}),
	NasilCalisirRoute: Route$17.update({
		id: "/nasil-calisir",
		path: "/nasil-calisir",
		getParentRoute: () => Route$31
	}),
	OdemeRoute: Route$16.update({
		id: "/odeme",
		path: "/odeme",
		getParentRoute: () => Route$31
	}),
	PaketlerRoute: Route$15.update({
		id: "/paketler",
		path: "/paketler",
		getParentRoute: () => Route$31
	}),
	PanelimRoute: Route$14.update({
		id: "/panelim",
		path: "/panelim",
		getParentRoute: () => Route$31
	}),
	ParselSatinAlRoute: Route$13.update({
		id: "/parsel-satin-al",
		path: "/parsel-satin-al",
		getParentRoute: () => Route$31
	}),
	ParsellerimRoute: Route$12.update({
		id: "/parsellerim",
		path: "/parsellerim",
		getParentRoute: () => Route$31
	}),
	PazarYeriRoute: Route$11.update({
		id: "/pazar-yeri",
		path: "/pazar-yeri",
		getParentRoute: () => Route$31
	}),
	ProfilimRoute: Route$10.update({
		id: "/profilim",
		path: "/profilim",
		getParentRoute: () => Route$31
	}),
	PurchaseRoute: Route$9.update({
		id: "/purchase",
		path: "/purchase",
		getParentRoute: () => Route$31
	}),
	PurchaseBulkRoute: Route$8.update({
		id: "/purchase-bulk",
		path: "/purchase-bulk",
		getParentRoute: () => Route$31
	}),
	SertifikaDogrulaRoute: Route$7.update({
		id: "/sertifika-dogrula",
		path: "/sertifika-dogrula",
		getParentRoute: () => Route$31
	}),
	SertifikaTalepRoute: Route$6.update({
		id: "/sertifika-talep",
		path: "/sertifika-talep",
		getParentRoute: () => Route$31
	}),
	SertifikalarimRoute: Route$5.update({
		id: "/sertifikalarim",
		path: "/sertifikalarim",
		getParentRoute: () => Route$31
	}),
	SifreYenileRoute: Route$4.update({
		id: "/sifre-yenile",
		path: "/sifre-yenile",
		getParentRoute: () => Route$31
	}),
	SifremiUnuttumRoute: Route$3.update({
		id: "/sifremi-unuttum",
		path: "/sifremi-unuttum",
		getParentRoute: () => Route$31
	}),
	SiparislerimRoute: Route$2.update({
		id: "/siparislerim",
		path: "/siparislerim",
		getParentRoute: () => Route$31
	}),
	UyelikSozlesmesiRoute: Route$1.update({
		id: "/uyelik-sozlesmesi",
		path: "/uyelik-sozlesmesi",
		getParentRoute: () => Route$31
	}),
	YonetimRoute: Route.update({
		id: "/yonetim",
		path: "/yonetim",
		getParentRoute: () => Route$31
	})
};
var routeTree = Route$31._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
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
export { router_C28Q36UD_exports as a, Route$7 as i, Route$16 as n, useAuth as o, Route$24 as r, Route$13 as t };
