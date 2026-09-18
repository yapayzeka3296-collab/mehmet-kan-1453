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
		"etag": "\"99f-3eU+qMV+fimPkExi1FU92UW+m0o\"",
		"mtime": "2026-09-18T06:59:34.072Z",
		"size": 2463,
		"path": "../public/.htaccess"
	},
	"/cloud-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"200-lvKTdoTfo+30J2I2WxMu97p+hmI\"",
		"mtime": "2026-09-18T06:59:34.072Z",
		"size": 512,
		"path": "../public/cloud-texture.svg"
	},
	"/earth-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"432-7hbnUfYacpJ5GuKlsQ+DIaVE3oM\"",
		"mtime": "2026-09-18T06:59:34.072Z",
		"size": 1074,
		"path": "../public/earth-texture.svg"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-09-18T06:59:34.072Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-18T06:59:34.072Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"ce-n8Tm1cPHNDloKfFtLwsBoYS5eu8\"",
		"mtime": "2026-09-18T06:59:34.072Z",
		"size": 206,
		"path": "../public/robots.txt"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"806-b1v3QqYB4V3OQR9kzlQsuHgBOqs\"",
		"mtime": "2026-09-18T06:59:34.072Z",
		"size": 2054,
		"path": "../public/login-background.css"
	},
	"/sitemap.xml": {
		"type": "application/xml",
		"etag": "\"634-MrBA/IGlHZxiXGckPcMr4Zb33/4\"",
		"mtime": "2026-09-18T06:59:34.072Z",
		"size": 1588,
		"path": "../public/sitemap.xml"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c8-aE0wi3G5UwBm20hIOogcLwFw76I\"",
		"mtime": "2026-09-18T06:59:34.067Z",
		"size": 8392,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-18T06:59:34.067Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c4-cuFwIStF+1ItvnpBQQU9Kt9iZVs\"",
		"mtime": "2026-09-18T06:59:34.067Z",
		"size": 8388,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-18T06:59:34.067Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20b9-i2nAOC3dv8uH13uIuFse9o5qOkg\"",
		"mtime": "2026-09-18T06:59:34.067Z",
		"size": 8377,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-18T06:59:34.071Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/assets/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"b5-RNSDzi1HBdUvkZk9a+K+w23lY/Q\"",
		"mtime": "2026-09-18T06:59:34.072Z",
		"size": 181,
		"path": "../public/assets/.htaccess"
	},
	"/assets/CertificateTemplatePreview-D0POOyDq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113e-II1cBWk9yJJMZqUGURgkewJyixs\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 4414,
		"path": "../public/assets/CertificateTemplatePreview-D0POOyDq.js"
	},
	"/assets/CityParcelLivePage-B5osDbT1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"39d0-RVm5r94WwvKnB+QW3+ms6rj8Yz8\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 14800,
		"path": "../public/assets/CityParcelLivePage-B5osDbT1.js"
	},
	"/assets/Logo-Bv906a9I.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"254-NVlmRnXKVSjfaC7XwgxBFCmH1Bg\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 596,
		"path": "../public/assets/Logo-Bv906a9I.js"
	},
	"/assets/ParcelDetailPanel-n8udd1z9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b94-RRvrJk/V3gLwgXy4jFDeINgn+B4\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 19348,
		"path": "../public/assets/ParcelDetailPanel-n8udd1z9.js"
	},
	"/assets/SiteFooter-D40BecKx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"102e-GJfu2ZDm/cK09LxNRWcNebv45VU\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 4142,
		"path": "../public/assets/SiteFooter-D40BecKx.js"
	},
	"/assets/SiteHeader-Ch0rpVjk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"33f5-yXtuVBzvMPZ7edsCEvMV0WDw6gs\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 13301,
		"path": "../public/assets/SiteHeader-Ch0rpVjk.js"
	},
	"/assets/TrustBar-A8xXgkGY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"70e-z3ZAmJqerSc20SYrQ7SjwGLBj40\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 1806,
		"path": "../public/assets/TrustBar-A8xXgkGY.js"
	},
	"/assets/UserSidebar-B7WPBbwm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b4f-MISwu+BizEwZZDS2bKtyyWA1BYg\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 2895,
		"path": "../public/assets/UserSidebar-B7WPBbwm.js"
	},
	"/assets/_slug-C320r-s_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2166-u0+VyjLs3tt9tvWKjgJfxv83hPc\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 8550,
		"path": "../public/assets/_slug-C320r-s_.js"
	},
	"/assets/_slug-DDeCbuPE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a6-LQvbTR6F4PgrizYlrfMBuWM92+4\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 678,
		"path": "../public/assets/_slug-DDeCbuPE.js"
	},
	"/assets/ana-sayfa-5Y6W_3TQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2501-yAwPNhEb+kvkJ6W+Lw9nE1cmlaI\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 9473,
		"path": "../public/assets/ana-sayfa-5Y6W_3TQ.js"
	},
	"/assets/arrow-left-DhkNktzm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-5jSHfXYxDD1zXX5yHsmjf7n5Zzs\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 162,
		"path": "../public/assets/arrow-left-DhkNktzm.js"
	},
	"/assets/arrow-right-D9AS9XGO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-JiyBjFZ3KlAhXtsaSF6bq3tNTMs\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 162,
		"path": "../public/assets/arrow-right-D9AS9XGO.js"
	},
	"/assets/bildirimler-De73HgK4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5c-kANuqshPh36LTPyCk3LVNw9GIwo\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 2652,
		"path": "../public/assets/bildirimler-De73HgK4.js"
	},
	"/assets/boxes-ZcVhWL2W.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"350-T3yIAqsh5gvPXm3UJGA+L90p8HM\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 848,
		"path": "../public/assets/boxes-ZcVhWL2W.js"
	},
	"/assets/cerez-politikasi-DOxQIxl3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e00-MlXLQ/jSPegsJ6EPICAWbI6BHxA\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 3584,
		"path": "../public/assets/cerez-politikasi-DOxQIxl3.js"
	},
	"/assets/certificateTemplates-BRIWk3kA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a2-f0EpRV3zmSolYtn1J/VS00AwWmE\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 25762,
		"path": "../public/assets/certificateTemplates-BRIWk3kA.js"
	},
	"/assets/award-JWn7kN7G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f-tfETvGFVD6Szhf8j7Oi0w55TEZM\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 271,
		"path": "../public/assets/award-JWn7kN7G.js"
	},
	"/assets/check-BPX9t79G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"79-zW8lDB16S2r6PXB14WYXdppxXjI\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 121,
		"path": "../public/assets/check-BPX9t79G.js"
	},
	"/assets/circle-check-5SkMNrz6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"af-7ViVdcKCqPyx+8jXSmzPId/i040\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 175,
		"path": "../public/assets/circle-check-5SkMNrz6.js"
	},
	"/assets/circle-x-Gw0YWvCQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cc-rq7PP3xhM94pNHrX2yoQ+pNsyZc\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 204,
		"path": "../public/assets/circle-x-Gw0YWvCQ.js"
	},
	"/assets/destek-DjV6-fHl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"758-Xu0eFIrW4L6YRtAVImqAOnrqYYA\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 1880,
		"path": "../public/assets/destek-DjV6-fHl.js"
	},
	"/assets/dogrula-BO_1dddd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16da-ZVuoucaNo/rL1xOLQ1aOKAxLUCQ\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 5850,
		"path": "../public/assets/dogrula-BO_1dddd.js"
	},
	"/assets/dogum-gunu-hediyesi-CR1k3Krk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e8-4n/bQL2GjPhVdw/EWw3Rq+mgT20\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 4328,
		"path": "../public/assets/dogum-gunu-hediyesi-CR1k3Krk.js"
	},
	"/assets/eye-DNzehFF4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fd-A2Up39Hq4cPjV6W1hATSRGdjZ1A\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 253,
		"path": "../public/assets/eye-DNzehFF4.js"
	},
	"/assets/gift-CDEjzJZu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15a-3NGSAD/IGLLDIO+olGRlJWJDdHY\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 346,
		"path": "../public/assets/gift-CDEjzJZu.js"
	},
	"/assets/giris-DRzYeHSi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b3b-jhoADhWLWK5XXVZy1broNcX39Ho\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 11067,
		"path": "../public/assets/giris-DRzYeHSi.js"
	},
	"/assets/gizlilik-politikasi-DB3RydgX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94c-Z2TC1cSBI3bw9LyX4S6J5oV0uyI\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 2380,
		"path": "../public/assets/gizlilik-politikasi-DB3RydgX.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-Bz4i7fov.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"584b-Mb8cTrOCPINVT5AABE1MPkdAjv8\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 22603,
		"path": "../public/assets/gokyuzu-Bz4i7fov.js"
	},
	"/assets/gokyuzu-CZIw7BzK.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"9c0-IYzrY+AQiAs38wT3GgNXKUdhQ2k\"",
		"mtime": "2026-09-18T06:59:33.125Z",
		"size": 2496,
		"path": "../public/assets/gokyuzu-CZIw7BzK.css"
	},
	"/assets/gokyuzunu-tara-Ckod1cZm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28b3-BjLfbpEJ7jYBBk44SZVjqz49GYM\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 10419,
		"path": "../public/assets/gokyuzunu-tara-Ckod1cZm.js"
	},
	"/assets/gokyuzu-haritasi-hUy9EfR8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1e-7Sabd0U9x0S/XNVwWLztDKRWpw8\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 2590,
		"path": "../public/assets/gokyuzu-haritasi-hUy9EfR8.js"
	},
	"/assets/guvenlik-ayarlari-y2w_HVt4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23f7-CRmcPu9YFaL/oTVRAeQdN5FjLE0\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 9207,
		"path": "../public/assets/guvenlik-ayarlari-y2w_HVt4.js"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-18T06:59:33.125Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/hakkimizda-BzNRl0CW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef4-FHMa1OJr+QwbDZ12dsLU+UXr0Ik\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 7924,
		"path": "../public/assets/hakkimizda-BzNRl0CW.js"
	},
	"/assets/heart-DOp3gsZo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-TIP2q02XL5/PRth162NBWXFkgYQ\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 255,
		"path": "../public/assets/heart-DOp3gsZo.js"
	},
	"/assets/hediye-kabul-xKt-1hFS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"183c-Lrte2BOAr34Smri13s/7FeO9ylY\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 6204,
		"path": "../public/assets/hediye-kabul-xKt-1hFS.js"
	},
	"/assets/hediyelerim-Db7TH4gK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"216c-YUgqDRyFnrFmJAxE6oAml3dDhQI\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 8556,
		"path": "../public/assets/hediyelerim-Db7TH4gK.js"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-18T06:59:33.125Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/iade-iptal-politikasi-qZCHSl3r.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"118a-M5WYLHpB7JkXxQu1cj/D6PdPtKI\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 4490,
		"path": "../public/assets/iade-iptal-politikasi-qZCHSl3r.js"
	},
	"/assets/iletisim-BZFvh7r1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"772-vWAr0gi/TF/gCVd+kC8QIzwIyS0\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 1906,
		"path": "../public/assets/iletisim-BZFvh7r1.js"
	},
	"/assets/index-D5O7Ur_5.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"26d9e-ow7N1O4+Yjjf1AlQ1cJN6FGIyyI\"",
		"mtime": "2026-09-18T06:59:33.125Z",
		"size": 159134,
		"path": "../public/assets/index-D5O7Ur_5.css"
	},
	"/assets/index-GE3aFrPw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"50ce3-JrFeEPMSYDsVNpalbEE8CY5BtQo\"",
		"mtime": "2026-09-18T06:59:33.121Z",
		"size": 330979,
		"path": "../public/assets/index-GE3aFrPw.js"
	},
	"/assets/jsx-runtime-DE3RlOCf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1edb-++aNIhyKgQeSqFVy8og9djQ1xvw\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 7899,
		"path": "../public/assets/jsx-runtime-DE3RlOCf.js"
	},
	"/assets/kayit-ol-DJm3DvVk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d55-JgfweXl2jwhHDD9Qj2JRmVGxYz4\"",
		"mtime": "2026-09-18T06:59:33.123Z",
		"size": 7509,
		"path": "../public/assets/kayit-ol-DJm3DvVk.js"
	},
	"/assets/kisiye-ozel-hediye-BHmiIlYU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10ad-LXwHzQ/f/G+51jf4WlX40EibxU0\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 4269,
		"path": "../public/assets/kisiye-ozel-hediye-BHmiIlYU.js"
	},
	"/assets/kullanim-sartlari-BYgB7YE1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb5-qSI8nkw8hULD6IoMyZVdByxYoc0\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 2997,
		"path": "../public/assets/kullanim-sartlari-BYgB7YE1.js"
	},
	"/assets/kvkk-DIHVvg7m.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190e-TMna88AMeNqoTdpU1Oj9bJjmzVI\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 6414,
		"path": "../public/assets/kvkk-DIHVvg7m.js"
	},
	"/assets/layers-C4dVdVVJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a2-a4qNznuOVSLj7gkr7/DmrSOXEhI\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 418,
		"path": "../public/assets/layers-C4dVdVVJ.js"
	},
	"/assets/lazyRouteComponent-CMv33qUI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1366-Uno3UyTYrsa8gjsiTW6+nl9kCrY\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 4966,
		"path": "../public/assets/lazyRouteComponent-CMv33qUI.js"
	},
	"/assets/link-D90cKH_E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6586-fb9WKhVhfd8d9CoIJ7QJ59V1DGQ\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 25990,
		"path": "../public/assets/link-D90cKH_E.js"
	},
	"/assets/loader-circle-yl7k8cfp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8d-jlE4l64p2EkeonHorCc2sRDrIF8\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 141,
		"path": "../public/assets/loader-circle-yl7k8cfp.js"
	},
	"/assets/lock-Bn0zgxvO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cb-AywJSSWUSxtl0+cds2mb6Bv+ioo\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 203,
		"path": "../public/assets/lock-Bn0zgxvO.js"
	},
	"/assets/mail-C_zsa0YP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d2-NXuthSEy07pfW4Af6N1hSIe0K9E\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 210,
		"path": "../public/assets/mail-C_zsa0YP.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-DAEWyscZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185c-AJh/mjkvR6Z+ppIliCLzQVPCHxI\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 6236,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-DAEWyscZ.js"
	},
	"/assets/nasil-calisir-BOKXuoEJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"158a-JtAA58Yjr893pc6zRKRhjRVetsM\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 5514,
		"path": "../public/assets/nasil-calisir-BOKXuoEJ.js"
	},
	"/assets/on-bilgilendirme-formu-CInqhG3m.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1170-rvVcxXLYk4E5967O+SCTJ/vcUZ0\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 4464,
		"path": "../public/assets/on-bilgilendirme-formu-CInqhG3m.js"
	},
	"/assets/package-check-xnZmIUry.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a7-3g4QzLauZYPOFSzY3SN0cq2wxsU\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 423,
		"path": "../public/assets/package-check-xnZmIUry.js"
	},
	"/assets/paketler-CB7X8cEU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15fe-hnuSSmTv72qJrhLFCUm1uFtY2IA\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 5630,
		"path": "../public/assets/paketler-CB7X8cEU.js"
	},
	"/assets/parsel-satin-al-BeNq1Yzm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"458-qb+sgs8+SfgfZgkjDu0WdzxNCmE\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 1112,
		"path": "../public/assets/parsel-satin-al-BeNq1Yzm.js"
	},
	"/assets/parsel-satin-al-Dq1VGZeI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2ae0-XX6zAOJJBwqrgZM8rf5yTjKHH8A\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 10976,
		"path": "../public/assets/parsel-satin-al-Dq1VGZeI.js"
	},
	"/assets/panelim-C8GqD6c1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"251f-kmvfGB4vsj4rl10bDXKIA4sh0Xo\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 9503,
		"path": "../public/assets/panelim-C8GqD6c1.js"
	},
	"/assets/parsellerim-C1DaocZF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c07-k2JmPX5Zba4a5SxILYV8gFDZA2w\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 11271,
		"path": "../public/assets/parsellerim-C1DaocZF.js"
	},
	"/assets/pazar-yeri-BL8L7dvy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63c-cqEhijcruiGCJkYtv+1Pu6eiKoQ\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 1596,
		"path": "../public/assets/pazar-yeri-BL8L7dvy.js"
	},
	"/assets/phone-DeZ5soYG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13f-SXB6NZJTbSPtj0cOH7fjeIJ39Kc\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 319,
		"path": "../public/assets/phone-DeZ5soYG.js"
	},
	"/assets/play-BP3W76HP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb-So6LsYY5Nri8BKI9iE/z1l64eR0\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 187,
		"path": "../public/assets/play-BP3W76HP.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/profilim-CaVo2PhF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bc8-zXomTET/WwhpG/bCfy1zKLZOvGk\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 3016,
		"path": "../public/assets/profilim-CaVo2PhF.js"
	},
	"/assets/refresh-cw-YGBv4aYZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"41e-31O1XH8POA9NJRNesmyriXIqKCw\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 1054,
		"path": "../public/assets/refresh-cw-YGBv4aYZ.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/search-BAFNdzgk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ab-rHaAgtN0rMXN1n1mPJrfJrrk7ZE\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 171,
		"path": "../public/assets/search-BAFNdzgk.js"
	},
	"/assets/routes-Di1aNqtB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2eff-pE72W/GlcFEA44D6jeU99oGt+Bs\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 12031,
		"path": "../public/assets/routes-Di1aNqtB.js"
	},
	"/assets/sertifika-dogrula-D7rwD8EA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16e3-8CVJSfJL/fmkZ63jwZ0bjCp77LY\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 5859,
		"path": "../public/assets/sertifika-dogrula-D7rwD8EA.js"
	},
	"/assets/sertifika-dogrula-FXtpGglI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4be-zcyxPkT6eaDdyDlN+N1k1YlkccA\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 1214,
		"path": "../public/assets/sertifika-dogrula-FXtpGglI.js"
	},
	"/assets/sertifika-talep-1YCvXs9G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2188-EwFElv9PxfIwGy1J3/0OXs76tSI\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 8584,
		"path": "../public/assets/sertifika-talep-1YCvXs9G.js"
	},
	"/assets/sertifikalarim-BOQ2d6Rd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28ee-9Bfv3DEGU8pYpKteYrV1EoCldUo\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 10478,
		"path": "../public/assets/sertifikalarim-BOQ2d6Rd.js"
	},
	"/assets/sevgiliye-hediye-DXe2rgX7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f78-POQuBntjLVQDeALpCl/F2fBRIUo\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 3960,
		"path": "../public/assets/sevgiliye-hediye-DXe2rgX7.js"
	},
	"/assets/shopping-cart-BUOrPFD6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6c7-vq+a/HLhb53W8RB0ew9gfVSJ3fo\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 1735,
		"path": "../public/assets/shopping-cart-BUOrPFD6.js"
	},
	"/assets/sifre-yenile-Crcmto4g.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1008-d7dm3z7Q7ARDtX94a3cCAYBv1Pw\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 4104,
		"path": "../public/assets/sifre-yenile-Crcmto4g.js"
	},
	"/assets/sifremi-unuttum-CPY_Es7P.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18a7-LQWyPnyDZaPAQXvv/VdYYwsWe7M\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 6311,
		"path": "../public/assets/sifremi-unuttum-CPY_Es7P.js"
	},
	"/assets/siparislerim-B8npasX8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f35-sozcycfoEBQAf6FfP+uAh+bj978\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 3893,
		"path": "../public/assets/siparislerim-B8npasX8.js"
	},
	"/assets/smartphone-DZkRcLdo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c2-O8ux6fKIi8vXGanz/EvjqSy4xpI\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 194,
		"path": "../public/assets/smartphone-DZkRcLdo.js"
	},
	"/assets/sparkles-DURQUbPG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1eb-pkUEwDsG8NO4841TzwvocajEDVw\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 491,
		"path": "../public/assets/sparkles-DURQUbPG.js"
	},
	"/assets/star-gwKiS9s6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d5-TW1p6KlxMk5T9hRNAZL8OorK0e8\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 469,
		"path": "../public/assets/star-gwKiS9s6.js"
	},
	"/assets/supabaseBrowser-H823nToQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"33c14-9kfyP/QOROqvRRBOMcr4eFUAgqs\"",
		"mtime": "2026-09-18T06:59:33.124Z",
		"size": 211988,
		"path": "../public/assets/supabaseBrowser-H823nToQ.js"
	},
	"/assets/trash-2-B5YpAglG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"145-WgJSyNICV8y/cKnrDrrNN+PYYJA\"",
		"mtime": "2026-09-18T06:59:33.125Z",
		"size": 325,
		"path": "../public/assets/trash-2-B5YpAglG.js"
	},
	"/assets/turkiye-haritasi-CJHGs6AG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f2d-t5FuZzhSN71rdLqSrq/KcBIaK3o\"",
		"mtime": "2026-09-18T06:59:33.125Z",
		"size": 3885,
		"path": "../public/assets/turkiye-haritasi-CJHGs6AG.js"
	},
	"/assets/useAuth-U48ZwGqt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19ec-dS9YNYIaFvs/ZYdcLqmEPKb0v1w\"",
		"mtime": "2026-09-18T06:59:33.125Z",
		"size": 6636,
		"path": "../public/assets/useAuth-U48ZwGqt.js"
	},
	"/assets/useRouter-VMLxvdJG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"236-9wTGogEQs6FVqKrigBHqv3aErX8\"",
		"mtime": "2026-09-18T06:59:33.125Z",
		"size": 566,
		"path": "../public/assets/useRouter-VMLxvdJG.js"
	},
	"/assets/user-CqRV6n5O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c1-zwQo/E0+NEuABeRPtnoAdLX27DY\"",
		"mtime": "2026-09-18T06:59:33.125Z",
		"size": 193,
		"path": "../public/assets/user-CqRV6n5O.js"
	},
	"/assets/uyelik-sozlesmesi-O3uBV0Z4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a4-XPpG8NHx2rJB7XhChaRRCP+VAKs\"",
		"mtime": "2026-09-18T06:59:33.125Z",
		"size": 9636,
		"path": "../public/assets/uyelik-sozlesmesi-O3uBV0Z4.js"
	},
	"/assets/user-round-GjDIOvrv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3-SYYbMG3cA06Qi3Ak04caCRiBrBo\"",
		"mtime": "2026-09-18T06:59:33.125Z",
		"size": 179,
		"path": "../public/assets/user-round-GjDIOvrv.js"
	},
	"/assets/yonetim-DuYy81Rs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c86-5H0YwH/6cG7y5Xj034vSx6QFXP4\"",
		"mtime": "2026-09-18T06:59:33.125Z",
		"size": 35974,
		"path": "../public/assets/yonetim-DuYy81Rs.js"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-18T06:59:14.780Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-18T06:59:34.071Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-18T06:59:34.072Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-18T06:59:34.072Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-18T06:59:34.072Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-18T06:59:34.072Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-18T06:59:34.072Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-18T06:59:34.072Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-18T06:59:34.072Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/assets/three.module-C5rh5wLt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b0d0c-yxZrAk456uilGR/GXmPe2vD3V3k\"",
		"mtime": "2026-09-18T06:59:33.125Z",
		"size": 724236,
		"path": "../public/assets/three.module-C5rh5wLt.js"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-18T06:59:34.072Z",
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
