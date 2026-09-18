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
		"mtime": "2026-09-18T17:48:30.408Z",
		"size": 2463,
		"path": "../public/.htaccess"
	},
	"/cloud-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"200-lvKTdoTfo+30J2I2WxMu97p+hmI\"",
		"mtime": "2026-09-18T17:48:30.409Z",
		"size": 512,
		"path": "../public/cloud-texture.svg"
	},
	"/earth-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"432-7hbnUfYacpJ5GuKlsQ+DIaVE3oM\"",
		"mtime": "2026-09-18T17:48:30.409Z",
		"size": 1074,
		"path": "../public/earth-texture.svg"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-09-18T17:48:30.409Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"806-b1v3QqYB4V3OQR9kzlQsuHgBOqs\"",
		"mtime": "2026-09-18T17:48:30.409Z",
		"size": 2054,
		"path": "../public/login-background.css"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-18T17:48:30.409Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"ce-n8Tm1cPHNDloKfFtLwsBoYS5eu8\"",
		"mtime": "2026-09-18T17:48:30.409Z",
		"size": 206,
		"path": "../public/robots.txt"
	},
	"/sitemap.xml": {
		"type": "application/xml",
		"etag": "\"634-MrBA/IGlHZxiXGckPcMr4Zb33/4\"",
		"mtime": "2026-09-18T17:48:30.409Z",
		"size": 1588,
		"path": "../public/sitemap.xml"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c8-aE0wi3G5UwBm20hIOogcLwFw76I\"",
		"mtime": "2026-09-18T17:48:30.406Z",
		"size": 8392,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-18T17:48:30.406Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c4-cuFwIStF+1ItvnpBQQU9Kt9iZVs\"",
		"mtime": "2026-09-18T17:48:30.406Z",
		"size": 8388,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-18T17:48:30.407Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20b9-i2nAOC3dv8uH13uIuFse9o5qOkg\"",
		"mtime": "2026-09-18T17:48:30.406Z",
		"size": 8377,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-18T17:48:30.407Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/assets/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"b5-RNSDzi1HBdUvkZk9a+K+w23lY/Q\"",
		"mtime": "2026-09-18T17:48:30.409Z",
		"size": 181,
		"path": "../public/assets/.htaccess"
	},
	"/assets/CertificateTemplatePreview-D0POOyDq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113e-II1cBWk9yJJMZqUGURgkewJyixs\"",
		"mtime": "2026-09-18T17:48:28.751Z",
		"size": 4414,
		"path": "../public/assets/CertificateTemplatePreview-D0POOyDq.js"
	},
	"/assets/CityParcelLivePage-BNysKUQG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"39d0-6CeL9Bk3HmPneRctwFUzqHLgit8\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 14800,
		"path": "../public/assets/CityParcelLivePage-BNysKUQG.js"
	},
	"/assets/Logo-Bv906a9I.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"254-NVlmRnXKVSjfaC7XwgxBFCmH1Bg\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 596,
		"path": "../public/assets/Logo-Bv906a9I.js"
	},
	"/assets/MySkyParcelEarthGlobeSafe-B99Tt1Mw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1bad-CEleGIHmUidQa1Ovy7Di4AyEdXI\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 7085,
		"path": "../public/assets/MySkyParcelEarthGlobeSafe-B99Tt1Mw.js"
	},
	"/assets/ParcelDetailPanel-DIr6hfiL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b94-8/pJlhw/+wajtjrjOCFH3pe55ng\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 19348,
		"path": "../public/assets/ParcelDetailPanel-DIr6hfiL.js"
	},
	"/assets/SiteFooter-D40BecKx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"102e-GJfu2ZDm/cK09LxNRWcNebv45VU\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 4142,
		"path": "../public/assets/SiteFooter-D40BecKx.js"
	},
	"/assets/SiteHeader-hpmOBG--.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"33c3-7WI/9jJKsyp4CTK6Y1eRgCDbxtk\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 13251,
		"path": "../public/assets/SiteHeader-hpmOBG--.js"
	},
	"/assets/TrustBar-A8xXgkGY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"70e-z3ZAmJqerSc20SYrQ7SjwGLBj40\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 1806,
		"path": "../public/assets/TrustBar-A8xXgkGY.js"
	},
	"/assets/UserSidebar-B7WPBbwm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b4f-MISwu+BizEwZZDS2bKtyyWA1BYg\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 2895,
		"path": "../public/assets/UserSidebar-B7WPBbwm.js"
	},
	"/assets/_slug-CKp7Sf6Q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a6-gSdxzKrx2onZukYN+xiOaWz8DcE\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 678,
		"path": "../public/assets/_slug-CKp7Sf6Q.js"
	},
	"/assets/_slug-ZpkaD_Ml.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2166-FwT/LIo7HFNnhUhi9JE8ontGH6o\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 8550,
		"path": "../public/assets/_slug-ZpkaD_Ml.js"
	},
	"/assets/ana-sayfa-B90nxJOv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2501-uODDcol1slgi9ZwxxwAfBzaqVb0\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 9473,
		"path": "../public/assets/ana-sayfa-B90nxJOv.js"
	},
	"/assets/arrow-left-DhkNktzm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-5jSHfXYxDD1zXX5yHsmjf7n5Zzs\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 162,
		"path": "../public/assets/arrow-left-DhkNktzm.js"
	},
	"/assets/arrow-right-D9AS9XGO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-JiyBjFZ3KlAhXtsaSF6bq3tNTMs\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 162,
		"path": "../public/assets/arrow-right-D9AS9XGO.js"
	},
	"/assets/award-JWn7kN7G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f-tfETvGFVD6Szhf8j7Oi0w55TEZM\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 271,
		"path": "../public/assets/award-JWn7kN7G.js"
	},
	"/assets/bildirimler-CTSKl9P6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5c-HVhwjLXQE+yv2HMokfoqKxhXOlA\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 2652,
		"path": "../public/assets/bildirimler-CTSKl9P6.js"
	},
	"/assets/boxes-ZcVhWL2W.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"350-T3yIAqsh5gvPXm3UJGA+L90p8HM\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 848,
		"path": "../public/assets/boxes-ZcVhWL2W.js"
	},
	"/assets/cerez-politikasi-uFXJLabX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e51-Pl/s1+IGp4HSKBoySGOswSkUjjE\"",
		"mtime": "2026-09-18T17:48:28.752Z",
		"size": 3665,
		"path": "../public/assets/cerez-politikasi-uFXJLabX.js"
	},
	"/assets/certificateTemplates-BRIWk3kA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a2-f0EpRV3zmSolYtn1J/VS00AwWmE\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 25762,
		"path": "../public/assets/certificateTemplates-BRIWk3kA.js"
	},
	"/assets/check-BPX9t79G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"79-zW8lDB16S2r6PXB14WYXdppxXjI\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 121,
		"path": "../public/assets/check-BPX9t79G.js"
	},
	"/assets/circle-check-5SkMNrz6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"af-7ViVdcKCqPyx+8jXSmzPId/i040\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 175,
		"path": "../public/assets/circle-check-5SkMNrz6.js"
	},
	"/assets/circle-x-Gw0YWvCQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cc-rq7PP3xhM94pNHrX2yoQ+pNsyZc\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 204,
		"path": "../public/assets/circle-x-Gw0YWvCQ.js"
	},
	"/assets/destek-CFWOyvai.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"758-VsWYIsE3HXvmPEgel0gQVcIddhs\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 1880,
		"path": "../public/assets/destek-CFWOyvai.js"
	},
	"/assets/dogrula-CEAN4asL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16da-1YBNGgzPzAzAp0bTB7DOVCdmNZE\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 5850,
		"path": "../public/assets/dogrula-CEAN4asL.js"
	},
	"/assets/dogum-gunu-hediyesi-Bs7o7PJ1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e8-H+SIo807DXUw3kJnk5mnS9L9EmM\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 4328,
		"path": "../public/assets/dogum-gunu-hediyesi-Bs7o7PJ1.js"
	},
	"/assets/eye-DNzehFF4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fd-A2Up39Hq4cPjV6W1hATSRGdjZ1A\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 253,
		"path": "../public/assets/eye-DNzehFF4.js"
	},
	"/assets/gift-CDEjzJZu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15a-3NGSAD/IGLLDIO+olGRlJWJDdHY\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 346,
		"path": "../public/assets/gift-CDEjzJZu.js"
	},
	"/assets/giris-D4dGfXgl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b3b-sHDnFovchxnkb2yZ8N7UOtr4YWw\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 11067,
		"path": "../public/assets/giris-D4dGfXgl.js"
	},
	"/assets/gizlilik-politikasi-CLkvg_oU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94c-RlpdrwosvNHGlOgDywfQKe2rqp0\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 2380,
		"path": "../public/assets/gizlilik-politikasi-CLkvg_oU.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-BadqmT3P.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"dbb-2q6UWQeW81r10WxCDZ3Bs/uS2ng\"",
		"mtime": "2026-09-18T17:48:28.755Z",
		"size": 3515,
		"path": "../public/assets/gokyuzu-BadqmT3P.css"
	},
	"/assets/gokyuzu-DaMcLwqf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2aaa-6Wqd59El5OZxjcVTJjeWNkdK6tg\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 10922,
		"path": "../public/assets/gokyuzu-DaMcLwqf.js"
	},
	"/assets/gokyuzu-haritasi-BBxEnqv2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1e-K7wM0jBg4dE//ZZULM8ddcfgNR4\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 2590,
		"path": "../public/assets/gokyuzu-haritasi-BBxEnqv2.js"
	},
	"/assets/guvenlik-ayarlari-CzlPrgfO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23f7-9ciXZnE9I4mMlID47AJ3c8Md7qY\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 9207,
		"path": "../public/assets/guvenlik-ayarlari-CzlPrgfO.js"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-18T17:48:28.755Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/hakkimizda-iy7jMmKD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef4-uM0w+yvwSP33Dw2tHoRazVxgMRY\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 7924,
		"path": "../public/assets/hakkimizda-iy7jMmKD.js"
	},
	"/assets/heart-DOp3gsZo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-TIP2q02XL5/PRth162NBWXFkgYQ\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 255,
		"path": "../public/assets/heart-DOp3gsZo.js"
	},
	"/assets/hediye-kabul-eWkPYSNH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"183c-m5/kXXHXOQcFRAhe8n3WrIFDL+M\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 6204,
		"path": "../public/assets/hediye-kabul-eWkPYSNH.js"
	},
	"/assets/hediyelerim-mPX1zlkY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"216c-YBIoB74YkVyEMGWVPBcn3bUbZ/w\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 8556,
		"path": "../public/assets/hediyelerim-mPX1zlkY.js"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-18T17:48:28.755Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/iade-iptal-politikasi-Brgbou1B.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"118a-Wvk2Fsa00vd4ks5ysYPQ9GmicYA\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 4490,
		"path": "../public/assets/iade-iptal-politikasi-Brgbou1B.js"
	},
	"/assets/iletisim-D2--w48J.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"772-9GRHM/H2GWMCes0BQos8DPnCP/M\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 1906,
		"path": "../public/assets/iletisim-D2--w48J.js"
	},
	"/assets/index-BEbr94Yj.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"26dc9-tsei9C+68m6WXrKFodSTuaTnsZA\"",
		"mtime": "2026-09-18T17:48:28.755Z",
		"size": 159177,
		"path": "../public/assets/index-BEbr94Yj.css"
	},
	"/assets/index-CPRLRI5l.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"50bde-52+k7JiFu1TdASyGm8Sck+CMFAI\"",
		"mtime": "2026-09-18T17:48:28.750Z",
		"size": 330718,
		"path": "../public/assets/index-CPRLRI5l.js"
	},
	"/assets/jsx-runtime-DE3RlOCf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1edb-++aNIhyKgQeSqFVy8og9djQ1xvw\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 7899,
		"path": "../public/assets/jsx-runtime-DE3RlOCf.js"
	},
	"/assets/kayit-ol-0M2n4WBy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d55-qVoAWKJAGEUUjbk0q81Dbc/j5xc\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 7509,
		"path": "../public/assets/kayit-ol-0M2n4WBy.js"
	},
	"/assets/kisiye-ozel-hediye-BTrdQOvl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10ad-XWRHdB17eMZ2mu6lyDAK6rIKVsA\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 4269,
		"path": "../public/assets/kisiye-ozel-hediye-BTrdQOvl.js"
	},
	"/assets/kullanim-sartlari-C80HukMJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb5-C/Jb7t13ucq0IEkboKs5ML1NLLc\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 2997,
		"path": "../public/assets/kullanim-sartlari-C80HukMJ.js"
	},
	"/assets/kvkk-BW4vDWye.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190e-N4ckz9FW4Ki5Pe5uQl8u2pzffWo\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 6414,
		"path": "../public/assets/kvkk-BW4vDWye.js"
	},
	"/assets/layers-C4dVdVVJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a2-a4qNznuOVSLj7gkr7/DmrSOXEhI\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 418,
		"path": "../public/assets/layers-C4dVdVVJ.js"
	},
	"/assets/lazyRouteComponent-CMv33qUI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1366-Uno3UyTYrsa8gjsiTW6+nl9kCrY\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 4966,
		"path": "../public/assets/lazyRouteComponent-CMv33qUI.js"
	},
	"/assets/link-D90cKH_E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6586-fb9WKhVhfd8d9CoIJ7QJ59V1DGQ\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 25990,
		"path": "../public/assets/link-D90cKH_E.js"
	},
	"/assets/loader-circle-yl7k8cfp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8d-jlE4l64p2EkeonHorCc2sRDrIF8\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 141,
		"path": "../public/assets/loader-circle-yl7k8cfp.js"
	},
	"/assets/lock-Bn0zgxvO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cb-AywJSSWUSxtl0+cds2mb6Bv+ioo\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 203,
		"path": "../public/assets/lock-Bn0zgxvO.js"
	},
	"/assets/mail-C_zsa0YP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d2-NXuthSEy07pfW4Af6N1hSIe0K9E\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 210,
		"path": "../public/assets/mail-C_zsa0YP.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-Dv7g3FCN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185c-PXXLSwRqJmTPGvJu0J4t6a86ZwA\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 6236,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-Dv7g3FCN.js"
	},
	"/assets/nasil-calisir-DKBFV3-U.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"158a-Ctyni+duYv64NwK7nTY08mW8uJU\"",
		"mtime": "2026-09-18T17:48:28.753Z",
		"size": 5514,
		"path": "../public/assets/nasil-calisir-DKBFV3-U.js"
	},
	"/assets/on-bilgilendirme-formu-lBseUwWg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1170-O2PHiozDTcZasMTM5Tfwr98EGmk\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 4464,
		"path": "../public/assets/on-bilgilendirme-formu-lBseUwWg.js"
	},
	"/assets/package-check-xnZmIUry.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a7-3g4QzLauZYPOFSzY3SN0cq2wxsU\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 423,
		"path": "../public/assets/package-check-xnZmIUry.js"
	},
	"/assets/paketler-BtkRt2ka.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15fe-dzQ635LcE8fpX0AgD/N/XAZ8OGI\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 5630,
		"path": "../public/assets/paketler-BtkRt2ka.js"
	},
	"/assets/parsel-satin-al-BjZIUNze.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2ae0-rcdoFDaDrySBCLHvNcddojoE+Nw\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 10976,
		"path": "../public/assets/parsel-satin-al-BjZIUNze.js"
	},
	"/assets/parsel-satin-al-DEeVI8CH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"458-KyAGjTZcdpztVN62yvVhIIqptSg\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 1112,
		"path": "../public/assets/parsel-satin-al-DEeVI8CH.js"
	},
	"/assets/panelim-BascbvaS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"251f-X9vctfbVEJzV/Qylso1cRJVmMk4\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 9503,
		"path": "../public/assets/panelim-BascbvaS.js"
	},
	"/assets/parsellerim-kLyJ1kCO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c07-o6O5zmNZHOf+Rvj8f5CoKfSva0g\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 11271,
		"path": "../public/assets/parsellerim-kLyJ1kCO.js"
	},
	"/assets/pazar-yeri-CIm-2JDn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63c-XyWpgy8Y1SVwX3NCLGONNnuI6+Y\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 1596,
		"path": "../public/assets/pazar-yeri-CIm-2JDn.js"
	},
	"/assets/phone-DeZ5soYG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13f-SXB6NZJTbSPtj0cOH7fjeIJ39Kc\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 319,
		"path": "../public/assets/phone-DeZ5soYG.js"
	},
	"/assets/play-BP3W76HP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb-So6LsYY5Nri8BKI9iE/z1l64eR0\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 187,
		"path": "../public/assets/play-BP3W76HP.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/profilim-9kJXOLsR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bc8-hGu0zu3/UW6qtiPAC199WacCeSY\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 3016,
		"path": "../public/assets/profilim-9kJXOLsR.js"
	},
	"/assets/refresh-cw-YGBv4aYZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"41e-31O1XH8POA9NJRNesmyriXIqKCw\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 1054,
		"path": "../public/assets/refresh-cw-YGBv4aYZ.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/routes-BWhJTTOY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"abf-dca/dTv+NvSKCyIejo5Q0wsr9jU\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 2751,
		"path": "../public/assets/routes-BWhJTTOY.js"
	},
	"/assets/search-BAFNdzgk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ab-rHaAgtN0rMXN1n1mPJrfJrrk7ZE\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 171,
		"path": "../public/assets/search-BAFNdzgk.js"
	},
	"/assets/sertifika-dogrula-DAKlyoNt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16e3-E9LXDmq0zvmrvtoMtrJHJEun/7I\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 5859,
		"path": "../public/assets/sertifika-dogrula-DAKlyoNt.js"
	},
	"/assets/sertifika-dogrula-llmQHaDk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4be-BPo5vMVvdFbXcefjtI13lsQV/2Y\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 1214,
		"path": "../public/assets/sertifika-dogrula-llmQHaDk.js"
	},
	"/assets/sertifika-talep-D5DvqjV8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2188-XkpsDmC58YWfofAZqLF7aAXlRaw\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 8584,
		"path": "../public/assets/sertifika-talep-D5DvqjV8.js"
	},
	"/assets/sertifikalarim-Ka-Ddf3a.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28ee-u20Dh9MU/QJWBdE+koXCYGTmrrk\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 10478,
		"path": "../public/assets/sertifikalarim-Ka-Ddf3a.js"
	},
	"/assets/sevgiliye-hediye-WnKU2XsU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f78-3T5ATdmJ+tCpDGpynoDISCLC7+o\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 3960,
		"path": "../public/assets/sevgiliye-hediye-WnKU2XsU.js"
	},
	"/assets/shopping-cart-BUOrPFD6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6c7-vq+a/HLhb53W8RB0ew9gfVSJ3fo\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 1735,
		"path": "../public/assets/shopping-cart-BUOrPFD6.js"
	},
	"/assets/sifre-yenile-RxrM2bYA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1008-9OCKJIfFn3puCQ98UAwx/ZJL2Pw\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 4104,
		"path": "../public/assets/sifre-yenile-RxrM2bYA.js"
	},
	"/assets/sifremi-unuttum-Coji2Kw9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18a7-XKMDIqJSlQjhuUCEx8B3SwsMw+s\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 6311,
		"path": "../public/assets/sifremi-unuttum-Coji2Kw9.js"
	},
	"/assets/smartphone-DZkRcLdo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c2-O8ux6fKIi8vXGanz/EvjqSy4xpI\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 194,
		"path": "../public/assets/smartphone-DZkRcLdo.js"
	},
	"/assets/siparislerim-BJkZMzEu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f35-bAqcmGW6jASH1Bs/DGuR/ej4Dlk\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 3893,
		"path": "../public/assets/siparislerim-BJkZMzEu.js"
	},
	"/assets/sparkles-DURQUbPG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1eb-pkUEwDsG8NO4841TzwvocajEDVw\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 491,
		"path": "../public/assets/sparkles-DURQUbPG.js"
	},
	"/assets/star-gwKiS9s6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d5-TW1p6KlxMk5T9hRNAZL8OorK0e8\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 469,
		"path": "../public/assets/star-gwKiS9s6.js"
	},
	"/assets/supabaseBrowser-H823nToQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"33c14-9kfyP/QOROqvRRBOMcr4eFUAgqs\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 211988,
		"path": "../public/assets/supabaseBrowser-H823nToQ.js"
	},
	"/assets/trash-2-B5YpAglG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"145-WgJSyNICV8y/cKnrDrrNN+PYYJA\"",
		"mtime": "2026-09-18T17:48:28.755Z",
		"size": 325,
		"path": "../public/assets/trash-2-B5YpAglG.js"
	},
	"/assets/turkiye-haritasi-DG9789kU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f2d-HRSqcfSpbyFw9TTXCHTgsry2YXg\"",
		"mtime": "2026-09-18T17:48:28.755Z",
		"size": 3885,
		"path": "../public/assets/turkiye-haritasi-DG9789kU.js"
	},
	"/assets/useAuth-U48ZwGqt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19ec-dS9YNYIaFvs/ZYdcLqmEPKb0v1w\"",
		"mtime": "2026-09-18T17:48:28.755Z",
		"size": 6636,
		"path": "../public/assets/useAuth-U48ZwGqt.js"
	},
	"/assets/user-CqRV6n5O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c1-zwQo/E0+NEuABeRPtnoAdLX27DY\"",
		"mtime": "2026-09-18T17:48:28.755Z",
		"size": 193,
		"path": "../public/assets/user-CqRV6n5O.js"
	},
	"/assets/useRouter-VMLxvdJG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"236-9wTGogEQs6FVqKrigBHqv3aErX8\"",
		"mtime": "2026-09-18T17:48:28.755Z",
		"size": 566,
		"path": "../public/assets/useRouter-VMLxvdJG.js"
	},
	"/assets/yonetim-CTjloO-m.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c8c-TKTiU/fsiMhCcT6w2vablycczRY\"",
		"mtime": "2026-09-18T17:48:28.755Z",
		"size": 35980,
		"path": "../public/assets/yonetim-CTjloO-m.js"
	},
	"/assets/uyelik-sozlesmesi-DrMGW7Jn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a4-zJxiX3eVIgMlNCsNPHjsUQSsOo4\"",
		"mtime": "2026-09-18T17:48:28.755Z",
		"size": 9636,
		"path": "../public/assets/uyelik-sozlesmesi-DrMGW7Jn.js"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-18T17:47:57.779Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-18T17:48:30.407Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-18T17:48:30.408Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-18T17:48:30.409Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-18T17:48:30.408Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-18T17:48:30.408Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-18T17:48:30.408Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-18T17:48:30.408Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-18T17:48:30.408Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/assets/user-round-GjDIOvrv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3-SYYbMG3cA06Qi3Ak04caCRiBrBo\"",
		"mtime": "2026-09-18T17:48:28.755Z",
		"size": 179,
		"path": "../public/assets/user-round-GjDIOvrv.js"
	},
	"/assets/three.module-C5rh5wLt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b0d0c-yxZrAk456uilGR/GXmPe2vD3V3k\"",
		"mtime": "2026-09-18T17:48:28.754Z",
		"size": 724236,
		"path": "../public/assets/three.module-C5rh5wLt.js"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-18T17:48:30.409Z",
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
