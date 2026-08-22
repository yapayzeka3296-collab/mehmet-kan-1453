globalThis.__nitro_main__ = import.meta.url;
import { i as serve, r as NodeResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
import { a as toEventHandler, i as defineLazyEventHandler, n as HTTPError, r as defineHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-08-22T00:36:46.468Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/favicon.svg": {
		"type": "image/svg+xml",
		"etag": "\"694-YtlrEtmOcPshQTaxYMBR81pO2Mo\"",
		"mtime": "2026-08-22T00:36:46.469Z",
		"size": 1684,
		"path": "../public/favicon.svg"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"345-auSYwhMQnC06JZD4GteGwLfuYW4\"",
		"mtime": "2026-08-22T00:36:46.469Z",
		"size": 837,
		"path": "../public/login-background.css"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-08-22T00:36:46.469Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/myskyparcel-icon.svg": {
		"type": "image/svg+xml",
		"etag": "\"585-8yEZAuhHOct8uirv92Ocnoo9BGo\"",
		"mtime": "2026-08-22T00:36:46.469Z",
		"size": 1413,
		"path": "../public/myskyparcel-icon.svg"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-08-22T00:36:46.469Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-08-22T00:36:46.469Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/SiteFooter-EauEndRN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a9b-kEHhq31Q0ruSxF7kNnkHQPH0Um0\"",
		"mtime": "2026-08-22T00:36:45.294Z",
		"size": 39579,
		"path": "../public/assets/SiteFooter-EauEndRN.js"
	},
	"/assets/TrustBar-CtswPagV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"852-0AStfAtF5m8P03XricEPStSB06o\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 2130,
		"path": "../public/assets/TrustBar-CtswPagV.js"
	},
	"/assets/UserSidebar-DhIMxO6S.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"91d-/idyVRv4DF0RGRijovZSoH7pWTI\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 2333,
		"path": "../public/assets/UserSidebar-DhIMxO6S.js"
	},
	"/assets/arrow-left-C_WE0tNU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-N4+lE+uSHlc155mw625rzQO6H6E\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 161,
		"path": "../public/assets/arrow-left-C_WE0tNU.js"
	},
	"/assets/arrow-right-Bl79IoK2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-F+0mDQ3SpnwB1Og1/ztjZeRvivw\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 161,
		"path": "../public/assets/arrow-right-Bl79IoK2.js"
	},
	"/assets/award-BbXqbbRN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e-Vgp/VJ9LCA6+usGnSM0JveSAqxQ\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 270,
		"path": "../public/assets/award-BbXqbbRN.js"
	},
	"/assets/boxes-BvKoSD98.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34f-aQ3K9FVO/e5LkvNhi75oryhumPg\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 847,
		"path": "../public/assets/boxes-BvKoSD98.js"
	},
	"/assets/cerez-politikasi-wG7A_gsT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7b8-QDJpqvu/tCBGmXWJvi6QUjMRs4U\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 1976,
		"path": "../public/assets/cerez-politikasi-wG7A_gsT.js"
	},
	"/assets/check-CdvFU-Vq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"78-lRDp6KI8evWTOI2N0MBC/eEAQ9g\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 120,
		"path": "../public/assets/check-CdvFU-Vq.js"
	},
	"/assets/circle-check-NtfRTebK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ae-NQozyNJNKQTCu2B/MU20DqFdp14\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 174,
		"path": "../public/assets/circle-check-NtfRTebK.js"
	},
	"/assets/dogrula-BDXhfKfK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b23-jjXtxxXEw0UkIVpG3ZC9tatiVic\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 2851,
		"path": "../public/assets/dogrula-BDXhfKfK.js"
	},
	"/assets/eye-sWBrij9H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fc-jZq+ekbxokBN8TbbQCOFJ1wbdfU\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 252,
		"path": "../public/assets/eye-sWBrij9H.js"
	},
	"/assets/giris-D02Edcwm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b47-QYxCFoOhmD1WcmilBd69hHo515w\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 11079,
		"path": "../public/assets/giris-D02Edcwm.js"
	},
	"/assets/gizlilik-politikasi-HeCaF4id.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"92f-Pi4Ypt3fnb0r4qu6lEEuhC9tXwg\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 2351,
		"path": "../public/assets/gizlilik-politikasi-HeCaF4id.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/globe-p_jZ_LV7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ee-5h6NjPJx3QiFsD9nXefT/3XfCSQ\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 238,
		"path": "../public/assets/globe-p_jZ_LV7.js"
	},
	"/assets/gokyuzu-haritasi-G2_JfzcL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"df01-EYPjeaSMpk9H6FmQJZEvmaw+lsk\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 57089,
		"path": "../public/assets/gokyuzu-haritasi-G2_JfzcL.js"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/guvenlik-ayarlari-Bd6Z0ypi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f01-XJnrOfRHzMC+JPcX1g/3F443rjU\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 7937,
		"path": "../public/assets/guvenlik-ayarlari-Bd6Z0ypi.js"
	},
	"/assets/hakkimizda-hpOkh4Y1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef2-NfrEUH0MZw2ev5PjJdm42fe7bpU\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 7922,
		"path": "../public/assets/hakkimizda-hpOkh4Y1.js"
	},
	"/assets/gokyuzu-haritasi-fEbMfEUM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"565e-OgCOgD64eO3SrC1F9WLGQ7X3xi4\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 22110,
		"path": "../public/assets/gokyuzu-haritasi-fEbMfEUM.js"
	},
	"/assets/heart-C2eau7VT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fe-sstg1rcGhGIpjjt0vJfvBmqMHUk\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 254,
		"path": "../public/assets/heart-C2eau7VT.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/iletisim-DdEfyzsL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c31-F4x5TDdqtR2CC1nBaNh8D58uVUw\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 3121,
		"path": "../public/assets/iletisim-DdEfyzsL.js"
	},
	"/assets/kayit-ol-CM4NrcXb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1846-l+iCO4LVR9Rd2gdGrwQtb9r+2Ko\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 6214,
		"path": "../public/assets/kayit-ol-CM4NrcXb.js"
	},
	"/assets/kullanim-sartlari-DQZmyEZI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b98-894ceJnhU7mstndfbl9J5QvtlKY\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 2968,
		"path": "../public/assets/kullanim-sartlari-DQZmyEZI.js"
	},
	"/assets/kvkk-Bvgs94H6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"165d-ANs4PAsNHCUYQE2haiAySmWUX7A\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 5725,
		"path": "../public/assets/kvkk-Bvgs94H6.js"
	},
	"/assets/layers-CBeicywY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a1-PTLqjCAYk0wNlMHcOeU4sDrefUU\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 417,
		"path": "../public/assets/layers-CBeicywY.js"
	},
	"/assets/index-BjtFo4u_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4d75d-WNPML8HhzmyyOnU2r6GwwP/ub6A\"",
		"mtime": "2026-08-22T00:36:45.293Z",
		"size": 317277,
		"path": "../public/assets/index-BjtFo4u_.js"
	},
	"/assets/loader-circle-C9b16KNi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c-tsDWtHVGTk46L7J8Cdz4aiSiGGw\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 140,
		"path": "../public/assets/loader-circle-C9b16KNi.js"
	},
	"/assets/log-out-Ddn7CKHp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e2-UjHne/CAcGwRgI1j86tgFejuc/0\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 226,
		"path": "../public/assets/log-out-Ddn7CKHp.js"
	},
	"/assets/mail-CJMTXTw3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d1-7hc5R+5A0zV8u1AQkzSoUITVdn4\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 209,
		"path": "../public/assets/mail-CJMTXTw3.js"
	},
	"/assets/nasil-calisir-CATM_8_V.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1567-1HFHwcDY4V4cybDHFQowYvdxNxM\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 5479,
		"path": "../public/assets/nasil-calisir-CATM_8_V.js"
	},
	"/assets/map-pin-C3Ms_aDq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-MDVd0HMwvzApkdrO3hqqO4hWMCs\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 255,
		"path": "../public/assets/map-pin-C3Ms_aDq.js"
	},
	"/assets/odeme-BqzvemTE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13b5-PY8VOlPYMVgWnDcocCsY56GqyD8\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 5045,
		"path": "../public/assets/odeme-BqzvemTE.js"
	},
	"/assets/odeme-C1ihOvyu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b6-NxfSrkeUeS6MiXO+gZaIrQiWZmI\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 694,
		"path": "../public/assets/odeme-C1ihOvyu.js"
	},
	"/assets/lock-UqZlhznX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ca-cozpWUXGcY48OL8WPJHOgh2bn8E\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 202,
		"path": "../public/assets/lock-UqZlhznX.js"
	},
	"/assets/panelim-tGHGPESQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"168a-0KSD17WMJ6dKth3P5pIaKI3GEAs\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 5770,
		"path": "../public/assets/panelim-tGHGPESQ.js"
	},
	"/assets/paketler-BsO3eWFW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11d5-g9fIIPj0DBDtu+d41+0TwGSqdbM\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 4565,
		"path": "../public/assets/paketler-BsO3eWFW.js"
	},
	"/assets/parsel-satin-al-BwxO6EEG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"366-KP+0fvXxOwKZp7EPIndn81G1B/E\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 870,
		"path": "../public/assets/parsel-satin-al-BwxO6EEG.js"
	},
	"/assets/parsel-satin-al-DWjKa907.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"112e-HolQgPOWYXsWMlK4wncItDy3kd8\"",
		"mtime": "2026-08-22T00:36:45.295Z",
		"size": 4398,
		"path": "../public/assets/parsel-satin-al-DWjKa907.js"
	},
	"/assets/parsellerim-CalRydpC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3cbe-vSUqbLjdEIYRYhqRV+CG/D0LEcQ\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 15550,
		"path": "../public/assets/parsellerim-CalRydpC.js"
	},
	"/assets/pazar-yeri-BYpiI_tM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"61f-70EfOTpo5MX+UVYfHzzhNQ139i4\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 1567,
		"path": "../public/assets/pazar-yeri-BYpiI_tM.js"
	},
	"/assets/preload-helper-Br8mMo8c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1793-sy6FhzsBdhIieW3uuB7OM1U3qwI\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 6035,
		"path": "../public/assets/preload-helper-Br8mMo8c.js"
	},
	"/assets/profilim-QxOnU7D4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b45-FxRJEob4q9t63/4mqvpoy+vXdU0\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 2885,
		"path": "../public/assets/profilim-QxOnU7D4.js"
	},
	"/assets/refresh-cw-BmxqpEgI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13d-2PGK6Wutssk8jPxdZNfBu9Mqumo\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 317,
		"path": "../public/assets/refresh-cw-BmxqpEgI.js"
	},
	"/assets/routes-DG_zFw2d.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24b9-iRv4ctJgi6efIJG0oKqCOR6Rkt4\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 9401,
		"path": "../public/assets/routes-DG_zFw2d.js"
	},
	"/assets/search-BR9I9D_4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa-dP0cEJ4IcFCiUYhqKvZyMoixnLk\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 170,
		"path": "../public/assets/search-BR9I9D_4.js"
	},
	"/assets/sertifika-dogrula-BIpElnrc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3c9-1lJp7uItvqc7zcWfaWRokqRH0Wk\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 969,
		"path": "../public/assets/sertifika-dogrula-BIpElnrc.js"
	},
	"/assets/sertifika-dogrula-Dovsc2JP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1664-yvEzqVxcEdVD64yrU4n+cVvxWtI\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 5732,
		"path": "../public/assets/sertifika-dogrula-Dovsc2JP.js"
	},
	"/assets/sertifika-talep-CmhtQC6k.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dcf-XiSNdz9AK6Z/M8QeJs8mTyZKTs8\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 3535,
		"path": "../public/assets/sertifika-talep-CmhtQC6k.js"
	},
	"/assets/sertifikalarim-BhgR37fG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"213c-lHmv9UWsW0x8nD/+aroDRrgrH1E\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 8508,
		"path": "../public/assets/sertifikalarim-BhgR37fG.js"
	},
	"/assets/shield-check-BflpI6IR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5b5-znu4R50CmxVDHmmXElXZgG2p1SU\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 1461,
		"path": "../public/assets/shield-check-BflpI6IR.js"
	},
	"/assets/sifre-yenile-k2TuXm2e.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f6e-mhp8pzSSzskryAPxAy+NI0M/GhE\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 3950,
		"path": "../public/assets/sifre-yenile-k2TuXm2e.js"
	},
	"/assets/sifremi-unuttum-CKPHYv5j.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1826-k0wWJbdw/U3618QJpJuNfGBrpME\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 6182,
		"path": "../public/assets/sifremi-unuttum-CKPHYv5j.js"
	},
	"/assets/siparislerim-D133HbyF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ece-aqjJfqBa4mhY9xxCSMpY1XC4xMM\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 3790,
		"path": "../public/assets/siparislerim-D133HbyF.js"
	},
	"/assets/sparkles-BnEPIXRM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ea-4fnaS7L3MEyIo3Fr+nYDLOYy0hA\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 490,
		"path": "../public/assets/sparkles-BnEPIXRM.js"
	},
	"/assets/star-DtlIxubO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d4-9Cc4VRt8EAq6erhaM+2bpepkjGI\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 468,
		"path": "../public/assets/star-DtlIxubO.js"
	},
	"/assets/styles-BAyB5oRj.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1ecf0-R+dVFJ2xSgCFAkavnE4YcZf9Nkc\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 126192,
		"path": "../public/assets/styles-BAyB5oRj.css"
	},
	"/assets/supabaseBrowser-Cu4Txbqv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"35822-H/54iVjmFxsxHF/+tVXxovEoicc\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 219170,
		"path": "../public/assets/supabaseBrowser-Cu4Txbqv.js"
	},
	"/assets/useAuth-CrbsAGTR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7b55-H0lwW0Aywl5AitDSg89gyI+fnZs\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 31573,
		"path": "../public/assets/useAuth-CrbsAGTR.js"
	},
	"/assets/user-2x_WWf0A.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-C3tvpWe2kMG17kFu59ofRg/Fmq8\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 192,
		"path": "../public/assets/user-2x_WWf0A.js"
	},
	"/assets/uyelik-sozlesmesi-DCKFgu8q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2507-592QzDBsRmqnC4lf9pzifIeaYxg\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 9479,
		"path": "../public/assets/uyelik-sozlesmesi-DCKFgu8q.js"
	},
	"/assets/yonetim-BaHsEtwN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3f82-skNOaZshcG8zH1bhxegpSlr9aZo\"",
		"mtime": "2026-08-22T00:36:45.296Z",
		"size": 16258,
		"path": "../public/assets/yonetim-BaHsEtwN.js"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"bca-YDePnpR2HUVdIccx2x0O4TskeQM\"",
		"mtime": "2026-08-22T00:36:46.467Z",
		"size": 3018,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"cd9-yJAGzlGRwrAMiMy0HSywTSqXpLA\"",
		"mtime": "2026-08-22T00:36:46.467Z",
		"size": 3289,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"b51-SGJrLA8tnbVJvy09ccAMhGrODkw\"",
		"mtime": "2026-08-22T00:36:46.467Z",
		"size": 2897,
		"path": "../public/certificate-templates/special.svg"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-08-22T00:36:27.473Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-08-22T00:36:46.467Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-08-22T00:36:46.468Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-08-22T00:36:46.468Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-08-22T00:36:46.468Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-08-22T00:36:46.468Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-08-22T00:36:46.468Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-08-22T00:36:46.468Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-08-22T00:36:46.469Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	}
};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_GGa30w = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_GGa30w
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
var tracingSrvxPlugins = [];
//#endregion
//#region node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
var port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };
