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
	"/cloud-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"200-lvKTdoTfo+30J2I2WxMu97p+hmI\"",
		"mtime": "2026-09-05T12:57:46.272Z",
		"size": 512,
		"path": "../public/cloud-texture.svg"
	},
	"/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"90c-pG5taenK3cYYfL7WkdBxMb15u0w\"",
		"mtime": "2026-09-05T12:57:46.272Z",
		"size": 2316,
		"path": "../public/.htaccess"
	},
	"/earth-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"432-7hbnUfYacpJ5GuKlsQ+DIaVE3oM\"",
		"mtime": "2026-09-05T12:57:46.272Z",
		"size": 1074,
		"path": "../public/earth-texture.svg"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-09-05T12:57:46.272Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"806-b1v3QqYB4V3OQR9kzlQsuHgBOqs\"",
		"mtime": "2026-09-05T12:57:46.272Z",
		"size": 2054,
		"path": "../public/login-background.css"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-05T12:57:46.280Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-05T12:57:46.280Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"b5-RNSDzi1HBdUvkZk9a+K+w23lY/Q\"",
		"mtime": "2026-09-05T12:57:46.280Z",
		"size": 181,
		"path": "../public/assets/.htaccess"
	},
	"/assets/CertificateTemplatePreview-Mvy_KL-K.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113c-g3eoT8+2o8kyg6PY6dFANiC0cHI\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 4412,
		"path": "../public/assets/CertificateTemplatePreview-Mvy_KL-K.js"
	},
	"/assets/CityParcelLivePage-bXSBKnPr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"397a-E7RuuQH8CYjUvr49P4VSgt71Ntg\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 14714,
		"path": "../public/assets/CityParcelLivePage-bXSBKnPr.js"
	},
	"/assets/Logo-De9R165z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"254-bzDwMi8eP6SVHvtObWKfq1h/Y8o\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 596,
		"path": "../public/assets/Logo-De9R165z.js"
	},
	"/assets/ParcelDetailPanel-DTHuEMCd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4c43-R/BQUZ/KHU9FigTZGVSO2U1kA7g\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 19523,
		"path": "../public/assets/ParcelDetailPanel-DTHuEMCd.js"
	},
	"/assets/SiteHeader-Dkqc63XW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3422-bJLaY7iEIi2qGsrUvtTx9z72jn4\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 13346,
		"path": "../public/assets/SiteHeader-Dkqc63XW.js"
	},
	"/assets/TrustBar-BA6nh4ka.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"70b-MlGuNs/cVskBR3xy0kPXzKaaCsI\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 1803,
		"path": "../public/assets/TrustBar-BA6nh4ka.js"
	},
	"/assets/UserSidebar-Ds7x7ux0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b47-pLYwR4jis8AGf6VwB0rJqgHHtOI\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 2887,
		"path": "../public/assets/UserSidebar-Ds7x7ux0.js"
	},
	"/assets/_slug-B6qimYig.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2110-HseZWLDTxVudyj+COzMdTFT2cUw\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 8464,
		"path": "../public/assets/_slug-B6qimYig.js"
	},
	"/assets/_slug-Ba8WCMgS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a-M0KOzDXEzo/GMFON+cEW3WxDblc\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 602,
		"path": "../public/assets/_slug-Ba8WCMgS.js"
	},
	"/assets/SiteFooter-COgeM3iz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1026-piEDEL5oM+6CNAuDiqWYg9WRw4s\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 4134,
		"path": "../public/assets/SiteFooter-COgeM3iz.js"
	},
	"/assets/ana-sayfa-CocWnQk5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24af-m2ApDEtz9hZabxjXgu7YT0cEegw\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 9391,
		"path": "../public/assets/ana-sayfa-CocWnQk5.js"
	},
	"/assets/arrow-left-DOenzWnc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-9FjyGtP0BzNtfUKLkbMIfRksWDs\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 161,
		"path": "../public/assets/arrow-left-DOenzWnc.js"
	},
	"/assets/arrow-right-4J93-GJV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-YQGbWLJ2jRYy/4pT8cG3w20EiQc\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 161,
		"path": "../public/assets/arrow-right-4J93-GJV.js"
	},
	"/assets/award-Bw_cjSuQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e-8mEV88sAU5JQFyEcNFVJ/FCEYCM\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 270,
		"path": "../public/assets/award-Bw_cjSuQ.js"
	},
	"/assets/bildirimler-DTGrTSK6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2f-nkScOrHNwwHclNG5pqoI6eV77bA\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 2607,
		"path": "../public/assets/bildirimler-DTGrTSK6.js"
	},
	"/assets/boxes-D2fQe-DV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34f-IwDjLpotdnpoHLuImE7xtYue/4c\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 847,
		"path": "../public/assets/boxes-D2fQe-DV.js"
	},
	"/assets/cerez-politikasi-BlzwDjCi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dfe-8qm7sfY8A+2vAgyegiOhWbqCoq8\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 3582,
		"path": "../public/assets/cerez-politikasi-BlzwDjCi.js"
	},
	"/assets/certificateTemplates-BRIWk3kA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a2-f0EpRV3zmSolYtn1J/VS00AwWmE\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 25762,
		"path": "../public/assets/certificateTemplates-BRIWk3kA.js"
	},
	"/assets/circle-x-DQNZOD75.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cb-rCdC5laCQwnCx1XpK08ndNBJgyc\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 203,
		"path": "../public/assets/circle-x-DQNZOD75.js"
	},
	"/assets/circle-check-s0WIuN5H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ae-b5IrL5otBso1ibbvdtVVeT0yWCU\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 174,
		"path": "../public/assets/circle-check-s0WIuN5H.js"
	},
	"/assets/destek-DWQAl6UG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"756-mgMbAixmkG3NpZjNRSbFFykpyWE\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 1878,
		"path": "../public/assets/destek-DWQAl6UG.js"
	},
	"/assets/dogrula-BhG2zLNg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16a8-dFV88NGdJa2chUETmWcrx3oV2so\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 5800,
		"path": "../public/assets/dogrula-BhG2zLNg.js"
	},
	"/assets/eye-p_GNO3wq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fc-/lD2c3xxGDi5B/K7Mhmq0GzoT9Q\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 252,
		"path": "../public/assets/eye-p_GNO3wq.js"
	},
	"/assets/check-6D1NelXt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"78-SFZClhEO0/zmsxXnawUwTTKPGE8\"",
		"mtime": "2026-09-05T12:57:45.406Z",
		"size": 120,
		"path": "../public/assets/check-6D1NelXt.js"
	},
	"/assets/file-badge-BG77fjy2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c5-j4AblO8RF8sW0V4k5PrKf8uUI7Q\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 453,
		"path": "../public/assets/file-badge-BG77fjy2.js"
	},
	"/assets/giris--AJ7D54s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b0d-LlWvdomSq7j4vTkn+Q1cYuiKw5A\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 11021,
		"path": "../public/assets/giris--AJ7D54s.js"
	},
	"/assets/gift-D6yAAB-X.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"159-X1AczFxYexPqOblLMNaRaXUf8oI\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 345,
		"path": "../public/assets/gift-D6yAAB-X.js"
	},
	"/assets/gizlilik-politikasi-CLZtQ2mB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94a-rohoocYq/5GaEgJKcErRupFdjlk\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 2378,
		"path": "../public/assets/gizlilik-politikasi-CLZtQ2mB.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-haritasi-zv8hRpwv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9f1-+a4OX5Cb8u+GOoFcK0JisBAaeNQ\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 2545,
		"path": "../public/assets/gokyuzu-haritasi-zv8hRpwv.js"
	},
	"/assets/hakkimizda-Cl2pN0VE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef1-9VtpvrXtqCCicLrqa4xo+pauU44\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 7921,
		"path": "../public/assets/hakkimizda-Cl2pN0VE.js"
	},
	"/assets/guvenlik-ayarlari-BAcLSY8x.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23c4-m1LVyWZ32inNfGApNxKenmcyjxs\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 9156,
		"path": "../public/assets/guvenlik-ayarlari-BAcLSY8x.js"
	},
	"/assets/heart-DCJZNAbD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fe-0WwY7XGCR2wcBMpJS7+FESrAnH8\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 254,
		"path": "../public/assets/heart-DCJZNAbD.js"
	},
	"/assets/hediye-kabul-CB-Lzk8M.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1809-pceMskNzOGAWAIZyT/0+10NGXmk\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 6153,
		"path": "../public/assets/hediye-kabul-CB-Lzk8M.js"
	},
	"/assets/hediyelerim-CCaj1kB2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"213e-LA1dfudwb3KHrQF+clbAs3LqRxk\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 8510,
		"path": "../public/assets/hediyelerim-CCaj1kB2.js"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/iade-iptal-politikasi-CJe6aXv4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1188-dnHLk2iwpheIM9mqB5MBXUXy36A\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 4488,
		"path": "../public/assets/iade-iptal-politikasi-CJe6aXv4.js"
	},
	"/assets/iletisim-DZNmeex7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"770-FqDvoKDIrJhLgUueaqULfkb7Jsw\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 1904,
		"path": "../public/assets/iletisim-DZNmeex7.js"
	},
	"/assets/index-CaiOIRAf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4f7c6-AvMneL7dBigZFiAuW3522CS2T+4\"",
		"mtime": "2026-09-05T12:57:45.404Z",
		"size": 325574,
		"path": "../public/assets/index-CaiOIRAf.js"
	},
	"/assets/index-DypaDUDP.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"26ba8-cUZ0b79rghgWoGKSVMlKJwVcVs4\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 158632,
		"path": "../public/assets/index-DypaDUDP.css"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/kayit-ol-DRymwBL0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d53-C9jysJIbNQsYZspDUdijzMVH0YU\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 7507,
		"path": "../public/assets/kayit-ol-DRymwBL0.js"
	},
	"/assets/kvkk-CyUvNLqH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190c-ogP9oGw5hWfLh69tGUpSpkj0W5A\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 6412,
		"path": "../public/assets/kvkk-CyUvNLqH.js"
	},
	"/assets/kullanim-sartlari-Z8Nu0idh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb3-JlkwidGh2ML7aobq24zvbDf/YA8\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 2995,
		"path": "../public/assets/kullanim-sartlari-Z8Nu0idh.js"
	},
	"/assets/layers-CT6A1AGW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a1-i0lEsDcrN9g7lgLwTaCbgezS1zU\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 417,
		"path": "../public/assets/layers-CT6A1AGW.js"
	},
	"/assets/loader-circle-BondijY5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c-uXJckqthXkz8rTV7tYibohljAlE\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 140,
		"path": "../public/assets/loader-circle-BondijY5.js"
	},
	"/assets/lock-D6Ih8eOu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ca-pIYOcDvnEiiHyF+se2u586URQXI\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 202,
		"path": "../public/assets/lock-D6Ih8eOu.js"
	},
	"/assets/lazyRouteComponent-BhJ4EGj3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"132e-PLbo2F9KDwiLEMKTDWhkXwWfg6Y\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 4910,
		"path": "../public/assets/lazyRouteComponent-BhJ4EGj3.js"
	},
	"/assets/mail-RKlVM7y6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d1-JQVl0eaAGKFUmSsg5VIO0zmvsaA\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 209,
		"path": "../public/assets/mail-RKlVM7y6.js"
	},
	"/assets/link-BGEbXR-c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6564-iE312Hn1C3Q6l+H6bHSpyCLXQmI\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 25956,
		"path": "../public/assets/link-BGEbXR-c.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-DLCJLbdO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185a-EXduu+CMJIN2hyIquktlZoGKVKI\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 6234,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-DLCJLbdO.js"
	},
	"/assets/nasil-calisir-DbaZo0GL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1587-gjvDQ+F7sY93PQ/PlBOV6VIz8b8\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 5511,
		"path": "../public/assets/nasil-calisir-DbaZo0GL.js"
	},
	"/assets/on-bilgilendirme-formu-Bq2LUNc6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"116e-H8Dyz7CSdVtStHQfUTGsHoWsON8\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 4462,
		"path": "../public/assets/on-bilgilendirme-formu-Bq2LUNc6.js"
	},
	"/assets/package-check-Dav4UZgF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a6-bxtsb7pCSMUzBQUUuxUULML5imA\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 422,
		"path": "../public/assets/package-check-Dav4UZgF.js"
	},
	"/assets/paketler-LqYW2OdC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14db-0ZjIbkFn76MFx1k7OX+fTq5JH/E\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 5339,
		"path": "../public/assets/paketler-LqYW2OdC.js"
	},
	"/assets/panelim-Btna1waE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24e8-390haQNpJDr1BdkQext7ejQGeL0\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 9448,
		"path": "../public/assets/panelim-Btna1waE.js"
	},
	"/assets/parsel-satin-al-BvQ8FsIp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"311e-zf9FSRkR2Jptb0zInSgiAzrHzxA\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 12574,
		"path": "../public/assets/parsel-satin-al-BvQ8FsIp.js"
	},
	"/assets/parsel-satin-al-BxHoT_A9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"48f-cGqcRvAE1AQC1B8KMKpnW4FZtU4\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 1167,
		"path": "../public/assets/parsel-satin-al-BxHoT_A9.js"
	},
	"/assets/parsellerim-c90qSMHT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a83-6U7+xi6RqSIsMfS/YNJfMU8hSH8\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 10883,
		"path": "../public/assets/parsellerim-c90qSMHT.js"
	},
	"/assets/pazar-yeri-CVYabyES.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63a-cqo4kTkg960lpQ8pe2AoKW6QE3Q\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 1594,
		"path": "../public/assets/pazar-yeri-CVYabyES.js"
	},
	"/assets/phone-DYOusoiK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13e-H+4OGFvf+50J7jAT0/xRFhJTy0Q\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 318,
		"path": "../public/assets/phone-DYOusoiK.js"
	},
	"/assets/play-CN06B9Mj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ba-eW8GPNDhP+G0XkdAi+S9i+WBZpM\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 186,
		"path": "../public/assets/play-CN06B9Mj.js"
	},
	"/assets/profilim-BOkoQghM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b96-JWh1/o5E5R8KlcDyxxJhbA4eB1c\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 2966,
		"path": "../public/assets/profilim-BOkoQghM.js"
	},
	"/assets/refresh-cw-DhIcwFsv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"41d-OSnEjr3Pkvymkf/ibieiw2T6V1A\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 1053,
		"path": "../public/assets/refresh-cw-DhIcwFsv.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/routes-0A851AWc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2343-Q9UqapmJ3j1a7O6MOKPV1NHGN8A\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 9027,
		"path": "../public/assets/routes-0A851AWc.js"
	},
	"/assets/search-By8zGpI6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa-MZz3h5IBUJsFEJXBfv+f+gH+l24\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 170,
		"path": "../public/assets/search-By8zGpI6.js"
	},
	"/assets/sertifika-dogrula-CDbf9LnY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16d8-tbnv6PQocXLMuwZTCOFbibepUas\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 5848,
		"path": "../public/assets/sertifika-dogrula-CDbf9LnY.js"
	},
	"/assets/sertifika-talep-DzJQtC2O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"215b-aKFk77nFZThl7OEGG8EOF2zk8rk\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 8539,
		"path": "../public/assets/sertifika-talep-DzJQtC2O.js"
	},
	"/assets/sertifikalarim-5NeOlzJ9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28bb-UiEhFvoCXRQTwV0Ri2Yiu5XTjtg\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 10427,
		"path": "../public/assets/sertifikalarim-5NeOlzJ9.js"
	},
	"/assets/shield-check-B56z2cNX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5db-QEom1nngqRuVOIgJwL1w3oNAgYA\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 1499,
		"path": "../public/assets/shield-check-B56z2cNX.js"
	},
	"/assets/sifre-yenile-B-rD6FF_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fda-qdC5evkdEMuW4OsAH056G4+DfYI\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 4058,
		"path": "../public/assets/sifre-yenile-B-rD6FF_.js"
	},
	"/assets/sifremi-unuttum-9MuUlSj9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1897-Qk98XoZrABR9iRZ+Ce1v+WoIX/U\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 6295,
		"path": "../public/assets/sifremi-unuttum-9MuUlSj9.js"
	},
	"/assets/siparislerim-PVtOXHbc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f07-QHe9wJeauLd+GpKd4XPCLbzG980\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 3847,
		"path": "../public/assets/siparislerim-PVtOXHbc.js"
	},
	"/assets/smartphone-DqpMHNuQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c1-mR4YW2viANu3UaO5dOBGelfQQiU\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 193,
		"path": "../public/assets/smartphone-DqpMHNuQ.js"
	},
	"/assets/sparkles-BK9MyOsy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ea-cDQOhWuS1NIVEvd+bfIRct+bPcs\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 490,
		"path": "../public/assets/sparkles-BK9MyOsy.js"
	},
	"/assets/sertifika-dogrula-BwyYCJd1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"471-9gNHDJKcnEYJDR/JcrcIDUDNwB4\"",
		"mtime": "2026-09-05T12:57:45.407Z",
		"size": 1137,
		"path": "../public/assets/sertifika-dogrula-BwyYCJd1.js"
	},
	"/assets/star-DU_WucsV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d4-7mNmjHC6rPoJVr4kKTDHA8CnmR8\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 468,
		"path": "../public/assets/star-DU_WucsV.js"
	},
	"/assets/turkiye-haritasi-DERYV-4v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f2b-INcUeI96rl8cJix+nGs73+C5pFQ\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 3883,
		"path": "../public/assets/turkiye-haritasi-DERYV-4v.js"
	},
	"/assets/useAuth-P3jnq5qf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"355dc-MSgzweDpTx/XTR3lx6IwweH5wjM\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 218588,
		"path": "../public/assets/useAuth-P3jnq5qf.js"
	},
	"/assets/user-YvR6eHPy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-IhnTJLS4UqL0RpNdd73v5II4o7Q\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 192,
		"path": "../public/assets/user-YvR6eHPy.js"
	},
	"/assets/useRouter-Bfknwdby.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20b5-IuM+CAALeZ5Y42bvd3N+GgqS5p0\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 8373,
		"path": "../public/assets/useRouter-Bfknwdby.js"
	},
	"/assets/uyelik-sozlesmesi-B-93gW3u.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a2-TOisPt7XTxHWoHCm71Ps+Nec7Qs\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 9634,
		"path": "../public/assets/uyelik-sozlesmesi-B-93gW3u.js"
	},
	"/assets/yonetim-pB98JmBC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3a32-9H7TzFTbwvcIIe3hhkJL9qmMPP4\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 14898,
		"path": "../public/assets/yonetim-pB98JmBC.js"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c8-aE0wi3G5UwBm20hIOogcLwFw76I\"",
		"mtime": "2026-09-05T12:57:46.268Z",
		"size": 8392,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-05T12:57:46.268Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c4-cuFwIStF+1ItvnpBQQU9Kt9iZVs\"",
		"mtime": "2026-09-05T12:57:46.268Z",
		"size": 8388,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-05T12:57:46.268Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20b9-i2nAOC3dv8uH13uIuFse9o5qOkg\"",
		"mtime": "2026-09-05T12:57:46.268Z",
		"size": 8377,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/assets/three.module-C5rh5wLt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b0d0c-yxZrAk456uilGR/GXmPe2vD3V3k\"",
		"mtime": "2026-09-05T12:57:45.408Z",
		"size": 724236,
		"path": "../public/assets/three.module-C5rh5wLt.js"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-05T12:57:46.268Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-05T12:57:25.776Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-05T12:57:46.268Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-05T12:57:46.269Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-05T12:57:46.269Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-05T12:57:46.269Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-05T12:57:46.269Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-05T12:57:46.269Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-05T12:57:46.269Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-05T12:57:46.269Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-05T12:57:46.269Z",
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
