globalThis.__nitro_main__ = import.meta.url;
import { i as serve, r as NodeResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
import { i as toEventHandler, n as defineHandler, o as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
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
	"/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"90c-pG5taenK3cYYfL7WkdBxMb15u0w\"",
		"mtime": "2026-09-05T22:36:06.961Z",
		"size": 2316,
		"path": "../public/.htaccess"
	},
	"/cloud-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"200-lvKTdoTfo+30J2I2WxMu97p+hmI\"",
		"mtime": "2026-09-05T22:36:06.961Z",
		"size": 512,
		"path": "../public/cloud-texture.svg"
	},
	"/earth-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"432-7hbnUfYacpJ5GuKlsQ+DIaVE3oM\"",
		"mtime": "2026-09-05T22:36:06.961Z",
		"size": 1074,
		"path": "../public/earth-texture.svg"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-09-05T22:36:06.961Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"806-b1v3QqYB4V3OQR9kzlQsuHgBOqs\"",
		"mtime": "2026-09-05T22:36:06.961Z",
		"size": 2054,
		"path": "../public/login-background.css"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-05T22:36:06.961Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-05T22:36:06.961Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"b5-RNSDzi1HBdUvkZk9a+K+w23lY/Q\"",
		"mtime": "2026-09-05T22:36:06.961Z",
		"size": 181,
		"path": "../public/assets/.htaccess"
	},
	"/assets/CertificateTemplatePreview-Mvy_KL-K.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113c-g3eoT8+2o8kyg6PY6dFANiC0cHI\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 4412,
		"path": "../public/assets/CertificateTemplatePreview-Mvy_KL-K.js"
	},
	"/assets/CityParcelLivePage-Bx14qafk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"397a-RqViBtXiefKpMZgY+GYbWxU+2Jc\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 14714,
		"path": "../public/assets/CityParcelLivePage-Bx14qafk.js"
	},
	"/assets/Logo-BM3n8sf2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"252-buXevS/2xDkSRDsIgDtYqcFxibs\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 594,
		"path": "../public/assets/Logo-BM3n8sf2.js"
	},
	"/assets/ParcelDetailPanel-CePSXkjl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4c43-TO6/lZpAaHhSyT/Zh92qK0UNkhc\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 19523,
		"path": "../public/assets/ParcelDetailPanel-CePSXkjl.js"
	},
	"/assets/SiteFooter-COgeM3iz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1026-piEDEL5oM+6CNAuDiqWYg9WRw4s\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 4134,
		"path": "../public/assets/SiteFooter-COgeM3iz.js"
	},
	"/assets/SiteHeader-B4RgOr76.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"347f-/Dc9oc2SkX81Mb8uJSMIe+7PeGs\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 13439,
		"path": "../public/assets/SiteHeader-B4RgOr76.js"
	},
	"/assets/TrustBar-BA6nh4ka.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"70b-MlGuNs/cVskBR3xy0kPXzKaaCsI\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 1803,
		"path": "../public/assets/TrustBar-BA6nh4ka.js"
	},
	"/assets/UserSidebar-Ds7x7ux0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b47-pLYwR4jis8AGf6VwB0rJqgHHtOI\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 2887,
		"path": "../public/assets/UserSidebar-Ds7x7ux0.js"
	},
	"/assets/_slug-BNIz9PTc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2110-csWZnhD+g60VCyBS20+bL7ZxKLY\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 8464,
		"path": "../public/assets/_slug-BNIz9PTc.js"
	},
	"/assets/_slug-tGqK8hNG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a-fSLzKpD8WF1h3KjJvato9/2QJAA\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 602,
		"path": "../public/assets/_slug-tGqK8hNG.js"
	},
	"/assets/ana-sayfa-C1RpL-YC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24af-VEoS08kb37iPSotJZU3srYlyOD8\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 9391,
		"path": "../public/assets/ana-sayfa-C1RpL-YC.js"
	},
	"/assets/arrow-left-DOenzWnc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-9FjyGtP0BzNtfUKLkbMIfRksWDs\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 161,
		"path": "../public/assets/arrow-left-DOenzWnc.js"
	},
	"/assets/arrow-right-4J93-GJV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-YQGbWLJ2jRYy/4pT8cG3w20EiQc\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 161,
		"path": "../public/assets/arrow-right-4J93-GJV.js"
	},
	"/assets/award-Bw_cjSuQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e-8mEV88sAU5JQFyEcNFVJ/FCEYCM\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 270,
		"path": "../public/assets/award-Bw_cjSuQ.js"
	},
	"/assets/bildirimler-BBEecoQM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2f-/1gqj9es5wVBbKcua4bqw0dS1JU\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 2607,
		"path": "../public/assets/bildirimler-BBEecoQM.js"
	},
	"/assets/boxes-D2fQe-DV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34f-IwDjLpotdnpoHLuImE7xtYue/4c\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 847,
		"path": "../public/assets/boxes-D2fQe-DV.js"
	},
	"/assets/cerez-politikasi-ykutbvQX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dfe-4KteJB2btkuxbaO1WxK7mlfp6wU\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 3582,
		"path": "../public/assets/cerez-politikasi-ykutbvQX.js"
	},
	"/assets/certificateTemplates-BRIWk3kA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a2-f0EpRV3zmSolYtn1J/VS00AwWmE\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 25762,
		"path": "../public/assets/certificateTemplates-BRIWk3kA.js"
	},
	"/assets/check-6D1NelXt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"78-SFZClhEO0/zmsxXnawUwTTKPGE8\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 120,
		"path": "../public/assets/check-6D1NelXt.js"
	},
	"/assets/circle-check-s0WIuN5H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ae-b5IrL5otBso1ibbvdtVVeT0yWCU\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 174,
		"path": "../public/assets/circle-check-s0WIuN5H.js"
	},
	"/assets/circle-x-DQNZOD75.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cb-rCdC5laCQwnCx1XpK08ndNBJgyc\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 203,
		"path": "../public/assets/circle-x-DQNZOD75.js"
	},
	"/assets/destek-C5MaNi-L.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"756-twlVQ1+X0GvomeSmj9GMYgjAuhE\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 1878,
		"path": "../public/assets/destek-C5MaNi-L.js"
	},
	"/assets/dogrula-B70Ur6w4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16a8-QHaLckc2xiu0BZ3AEbQYWzzDvn8\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 5800,
		"path": "../public/assets/dogrula-B70Ur6w4.js"
	},
	"/assets/eye-p_GNO3wq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fc-/lD2c3xxGDi5B/K7Mhmq0GzoT9Q\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 252,
		"path": "../public/assets/eye-p_GNO3wq.js"
	},
	"/assets/gift-D6yAAB-X.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"159-X1AczFxYexPqOblLMNaRaXUf8oI\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 345,
		"path": "../public/assets/gift-D6yAAB-X.js"
	},
	"/assets/giris-5uloOa67.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b0d-2aAD1CPhOJpmeZlQAGykDqX1V8s\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 11021,
		"path": "../public/assets/giris-5uloOa67.js"
	},
	"/assets/gizlilik-politikasi-fuk8h2Ey.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94a-Y+bF1YnLMhNgt82UfRowj91uax4\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 2378,
		"path": "../public/assets/gizlilik-politikasi-fuk8h2Ey.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-haritasi-BxbYVPT8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9f1-tnayX7/KOJ/Ib66n3+eJnIe+uoA\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 2545,
		"path": "../public/assets/gokyuzu-haritasi-BxbYVPT8.js"
	},
	"/assets/guvenlik-ayarlari-Ai1EATqx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23c4-E5kalaKVqdC3l/aA2FMxppprVBI\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 9156,
		"path": "../public/assets/guvenlik-ayarlari-Ai1EATqx.js"
	},
	"/assets/hakkimizda-KEza57hc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef1-O2QrfiIKDS1oFztRcb/Wb9XCxwg\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 7921,
		"path": "../public/assets/hakkimizda-KEza57hc.js"
	},
	"/assets/heart-DCJZNAbD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fe-0WwY7XGCR2wcBMpJS7+FESrAnH8\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 254,
		"path": "../public/assets/heart-DCJZNAbD.js"
	},
	"/assets/hediye-kabul-0ly0MR5Y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1809-XM8WtfAzNfTd5gBOociIVlyt60k\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 6153,
		"path": "../public/assets/hediye-kabul-0ly0MR5Y.js"
	},
	"/assets/hediyelerim-DKjlXD2c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"213e-Esqr0DFgPumqne0COTJQFSUOULo\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 8510,
		"path": "../public/assets/hediyelerim-DKjlXD2c.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/iade-iptal-politikasi-BZbUMA4M.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1188-8BhWZrZtnYJ6tz+MrpQzL1FP2sI\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 4488,
		"path": "../public/assets/iade-iptal-politikasi-BZbUMA4M.js"
	},
	"/assets/iletisim-BPL2qxnC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"770-VY7Z82kYYqaIJ3Js7HZKdUq6Q7o\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 1904,
		"path": "../public/assets/iletisim-BPL2qxnC.js"
	},
	"/assets/index-BAQt6yRJ.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"26a2e-bqsRWzJUGD8De9z75RpUY0ufcW0\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 158254,
		"path": "../public/assets/index-BAQt6yRJ.css"
	},
	"/assets/index-BLi86EHU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4f7a3-5tJqjoREtGb/9KjK2Y8uCJ4xous\"",
		"mtime": "2026-09-05T22:36:05.719Z",
		"size": 325539,
		"path": "../public/assets/index-BLi86EHU.js"
	},
	"/assets/kayit-ol-C8YNIYMK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d53-13aVZoOKhIrKGnZRC+Yld3nMYeQ\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 7507,
		"path": "../public/assets/kayit-ol-C8YNIYMK.js"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/kullanim-sartlari-BNnISzas.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb3-UjXpOvma8K2j5UHeqSaU57rz5w4\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 2995,
		"path": "../public/assets/kullanim-sartlari-BNnISzas.js"
	},
	"/assets/kvkk-BzLkuJ_t.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190c-J5yg4gNycQLixQeLurtzfv+m2HE\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 6412,
		"path": "../public/assets/kvkk-BzLkuJ_t.js"
	},
	"/assets/layers-CT6A1AGW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a1-i0lEsDcrN9g7lgLwTaCbgezS1zU\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 417,
		"path": "../public/assets/layers-CT6A1AGW.js"
	},
	"/assets/link-BGEbXR-c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6564-iE312Hn1C3Q6l+H6bHSpyCLXQmI\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 25956,
		"path": "../public/assets/link-BGEbXR-c.js"
	},
	"/assets/lazyRouteComponent-BhJ4EGj3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"132e-PLbo2F9KDwiLEMKTDWhkXwWfg6Y\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 4910,
		"path": "../public/assets/lazyRouteComponent-BhJ4EGj3.js"
	},
	"/assets/loader-circle-BondijY5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c-uXJckqthXkz8rTV7tYibohljAlE\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 140,
		"path": "../public/assets/loader-circle-BondijY5.js"
	},
	"/assets/lock-D6Ih8eOu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ca-pIYOcDvnEiiHyF+se2u586URQXI\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 202,
		"path": "../public/assets/lock-D6Ih8eOu.js"
	},
	"/assets/mail-RKlVM7y6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d1-JQVl0eaAGKFUmSsg5VIO0zmvsaA\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 209,
		"path": "../public/assets/mail-RKlVM7y6.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-PWGLaWJN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185a-tPhii9dAvETLQWJy+CzXC+hgckQ\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 6234,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-PWGLaWJN.js"
	},
	"/assets/nasil-calisir-BxZGo509.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1587-NaL0IzuBcGWupcu0vuqJNZfWDtE\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 5511,
		"path": "../public/assets/nasil-calisir-BxZGo509.js"
	},
	"/assets/package-check-Dav4UZgF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a6-bxtsb7pCSMUzBQUUuxUULML5imA\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 422,
		"path": "../public/assets/package-check-Dav4UZgF.js"
	},
	"/assets/on-bilgilendirme-formu-C8fyBT-l.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"116e-w/6DioOZr1lKMqD+riHVv7v7IGE\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 4462,
		"path": "../public/assets/on-bilgilendirme-formu-C8fyBT-l.js"
	},
	"/assets/paketler-CtDDNIEx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14db-g7hOBNcDVnn1uNI/ubNOmwhWi/Q\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 5339,
		"path": "../public/assets/paketler-CtDDNIEx.js"
	},
	"/assets/panelim-wr-0_KM7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24e8-KJmcgrdnOqEx0ODC+ZIRtfiYiQc\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 9448,
		"path": "../public/assets/panelim-wr-0_KM7.js"
	},
	"/assets/parsel-satin-al-Ckq0O4gn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"40b-8aTZBN6Xs28v8QX2jWPo4XjIh6g\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 1035,
		"path": "../public/assets/parsel-satin-al-Ckq0O4gn.js"
	},
	"/assets/parsel-satin-al-CelrPFTX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2aa5-GPtwE5cMeLtUbdxuLRyY7qRzrBg\"",
		"mtime": "2026-09-05T22:36:05.721Z",
		"size": 10917,
		"path": "../public/assets/parsel-satin-al-CelrPFTX.js"
	},
	"/assets/pazar-yeri-C-bG2m0H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63a-L2X1rmA3rUE2qoqMQtu0rx9bxtk\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 1594,
		"path": "../public/assets/pazar-yeri-C-bG2m0H.js"
	},
	"/assets/parsellerim-BWkrJuuG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2bde-bYfFfjkX7JffEdhmBZ/D2iv0lMo\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 11230,
		"path": "../public/assets/parsellerim-BWkrJuuG.js"
	},
	"/assets/phone-DYOusoiK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13e-H+4OGFvf+50J7jAT0/xRFhJTy0Q\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 318,
		"path": "../public/assets/phone-DYOusoiK.js"
	},
	"/assets/play-CN06B9Mj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ba-eW8GPNDhP+G0XkdAi+S9i+WBZpM\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 186,
		"path": "../public/assets/play-CN06B9Mj.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/profilim-VNa2ePr1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b96-l4mxnWd5jdFfiVagkp1pLZHen08\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 2966,
		"path": "../public/assets/profilim-VNa2ePr1.js"
	},
	"/assets/refresh-cw-DhIcwFsv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"41d-OSnEjr3Pkvymkf/ibieiw2T6V1A\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 1053,
		"path": "../public/assets/refresh-cw-DhIcwFsv.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/routes-DUGqVY_V.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2efd-LWHiH0DEDi5cregH996nNR3UijA\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 12029,
		"path": "../public/assets/routes-DUGqVY_V.js"
	},
	"/assets/search-By8zGpI6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa-MZz3h5IBUJsFEJXBfv+f+gH+l24\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 170,
		"path": "../public/assets/search-By8zGpI6.js"
	},
	"/assets/sertifika-dogrula-C8GZovU5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16d8-Df4uFlvG68jGvyqBDadVjptbXnU\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 5848,
		"path": "../public/assets/sertifika-dogrula-C8GZovU5.js"
	},
	"/assets/sertifika-dogrula-CWOQ5Rmt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"471-k2k84UDehYbgYR+Q5Z/mN83yTsU\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 1137,
		"path": "../public/assets/sertifika-dogrula-CWOQ5Rmt.js"
	},
	"/assets/sertifika-talep-DjODusoD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"215b-+FAyOurn4Yx8CZX9XOD3yGC6ad4\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 8539,
		"path": "../public/assets/sertifika-talep-DjODusoD.js"
	},
	"/assets/sertifikalarim-CP4iOIv8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28bb-BUs8qdIJTuAa/TY3kamcoGywe7M\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 10427,
		"path": "../public/assets/sertifikalarim-CP4iOIv8.js"
	},
	"/assets/shield-check-B56z2cNX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5db-QEom1nngqRuVOIgJwL1w3oNAgYA\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 1499,
		"path": "../public/assets/shield-check-B56z2cNX.js"
	},
	"/assets/sifre-yenile-Br5Rcm4i.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fda-DUDWIp1veo98hFUVXy9Km6Macpc\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 4058,
		"path": "../public/assets/sifre-yenile-Br5Rcm4i.js"
	},
	"/assets/sifremi-unuttum-CD1nJl_t.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1897-6kktd4c9KOqYN6A33u1vgnWwvzA\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 6295,
		"path": "../public/assets/sifremi-unuttum-CD1nJl_t.js"
	},
	"/assets/siparislerim-D99PMrVi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f07-XFw5Ht5j/M8dpyUOwiyeMdX3Uo0\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 3847,
		"path": "../public/assets/siparislerim-D99PMrVi.js"
	},
	"/assets/smartphone-DqpMHNuQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c1-mR4YW2viANu3UaO5dOBGelfQQiU\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 193,
		"path": "../public/assets/smartphone-DqpMHNuQ.js"
	},
	"/assets/sparkles-BK9MyOsy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ea-cDQOhWuS1NIVEvd+bfIRct+bPcs\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 490,
		"path": "../public/assets/sparkles-BK9MyOsy.js"
	},
	"/assets/star-DU_WucsV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d4-7mNmjHC6rPoJVr4kKTDHA8CnmR8\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 468,
		"path": "../public/assets/star-DU_WucsV.js"
	},
	"/assets/turkiye-haritasi-BiEBOuOG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f2b-1ITn45qtaD4zQvTTmazQDA6Nulk\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 3883,
		"path": "../public/assets/turkiye-haritasi-BiEBOuOG.js"
	},
	"/assets/useRouter-Bfknwdby.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20b5-IuM+CAALeZ5Y42bvd3N+GgqS5p0\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 8373,
		"path": "../public/assets/useRouter-Bfknwdby.js"
	},
	"/assets/user-YvR6eHPy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-IhnTJLS4UqL0RpNdd73v5II4o7Q\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 192,
		"path": "../public/assets/user-YvR6eHPy.js"
	},
	"/assets/useAuth-P3jnq5qf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"355dc-MSgzweDpTx/XTR3lx6IwweH5wjM\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 218588,
		"path": "../public/assets/useAuth-P3jnq5qf.js"
	},
	"/assets/uyelik-sozlesmesi-CaSC3eCR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a2-O2cC+CDcoE+7bvJTgoaEsmjxb9s\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 9634,
		"path": "../public/assets/uyelik-sozlesmesi-CaSC3eCR.js"
	},
	"/assets/yonetim-DVsOf5g8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3a46-K2xge1wjHjVgCGtEKOikqKCBBXk\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 14918,
		"path": "../public/assets/yonetim-DVsOf5g8.js"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-05T22:35:40.209Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c8-aE0wi3G5UwBm20hIOogcLwFw76I\"",
		"mtime": "2026-09-05T22:36:06.959Z",
		"size": 8392,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-05T22:36:06.959Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c4-cuFwIStF+1ItvnpBQQU9Kt9iZVs\"",
		"mtime": "2026-09-05T22:36:06.959Z",
		"size": 8388,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-05T22:36:06.959Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20b9-i2nAOC3dv8uH13uIuFse9o5qOkg\"",
		"mtime": "2026-09-05T22:36:06.959Z",
		"size": 8377,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/assets/three.module-C5rh5wLt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b0d0c-yxZrAk456uilGR/GXmPe2vD3V3k\"",
		"mtime": "2026-09-05T22:36:05.722Z",
		"size": 724236,
		"path": "../public/assets/three.module-C5rh5wLt.js"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-05T22:36:06.959Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-05T22:36:06.960Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-05T22:36:06.960Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-05T22:36:06.960Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-05T22:36:06.961Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-05T22:36:06.960Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-05T22:36:06.960Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-05T22:36:06.960Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-05T22:36:06.960Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-05T22:36:06.961Z",
		"size": 2093538,
		"path": "../public/images/cities/turkey-3d-map.png"
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
var _lazy_rW2tzX = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_rW2tzX
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
