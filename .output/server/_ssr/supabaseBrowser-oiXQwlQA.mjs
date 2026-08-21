import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/supabaseBrowser-oiXQwlQA.js
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
	"TSS_SERVER_FN_BASE": "/_serverFn/",
	"VITE_GOOGLE_MAPS_API_KEY": ""
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
	"TSS_SERVER_FN_BASE": "/_serverFn/",
	"VITE_GOOGLE_MAPS_API_KEY": ""
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
	"TSS_SERVER_FN_BASE": "/_serverFn/",
	"VITE_GOOGLE_MAPS_API_KEY": ""
}["VITE_SUPABASE_PUBLISHABLE_KEY"];
var url = configuredUrl || DEFAULT_SUPABASE_URL;
var anonKey = configuredAnonKey || configuredPublishableKey || DEFAULT_SUPABASE_ANON_KEY;
function getSessionStorage() {
	if (typeof window === "undefined") return void 0;
	try {
		return window.sessionStorage;
	} catch {
		return;
	}
}
function createBrowserSupabase() {
	const client = createClient(url, anonKey, { auth: {
		storage: getSessionStorage(),
		persistSession: true,
		autoRefreshToken: true,
		detectSessionInUrl: true
	} });
	const originalRpc = client.rpc.bind(client);
	client.rpc = (functionName, args, options) => {
		if (functionName.startsWith("admin_")) return client.functions.invoke("admin-rpc-gateway", { body: {
			rpc: functionName,
			args: args ?? {}
		} }).then((response) => ({
			data: response.data?.data ?? null,
			error: response.error ?? null
		}));
		return originalRpc(functionName, args, options);
	};
	const originalSignOut = client.auth.signOut.bind(client.auth);
	client.auth.signOut = async (options) => {
		if (typeof window !== "undefined" && window.location.pathname === "/yonetim") return { error: null };
		return originalSignOut(options);
	};
	return client;
}
var supabaseBrowser = createBrowserSupabase();
//#endregion
export { supabaseBrowser as n, createBrowserSupabase as t };
