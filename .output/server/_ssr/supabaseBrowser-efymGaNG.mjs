import { n as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/supabaseBrowser-efymGaNG.mjs
var supabaseBrowser_efymGaNG_exports = /* @__PURE__ */ __exportAll({
	n: () => supabaseBrowser,
	r: () => supabaseBrowser_exports,
	t: () => createBrowserSupabase
});
var supabaseBrowser_exports = /* @__PURE__ */ __exportAll$1({
	createBrowserSupabase: () => createBrowserSupabase,
	supabaseBrowser: () => supabaseBrowser
});
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
//#endregion
export { supabaseBrowser as n, supabaseBrowser_efymGaNG_exports as r, createBrowserSupabase as t };
