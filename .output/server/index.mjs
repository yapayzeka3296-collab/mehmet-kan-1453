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
		"mtime": "2026-09-19T03:53:28.834Z",
		"size": 512,
		"path": "../public/cloud-texture.svg"
	},
	"/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"99f-3eU+qMV+fimPkExi1FU92UW+m0o\"",
		"mtime": "2026-09-19T03:53:28.833Z",
		"size": 2463,
		"path": "../public/.htaccess"
	},
	"/earth-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"432-7hbnUfYacpJ5GuKlsQ+DIaVE3oM\"",
		"mtime": "2026-09-19T03:53:28.834Z",
		"size": 1074,
		"path": "../public/earth-texture.svg"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"806-b1v3QqYB4V3OQR9kzlQsuHgBOqs\"",
		"mtime": "2026-09-19T03:53:28.834Z",
		"size": 2054,
		"path": "../public/login-background.css"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-09-19T03:53:28.834Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-19T03:53:28.834Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"ce-n8Tm1cPHNDloKfFtLwsBoYS5eu8\"",
		"mtime": "2026-09-19T03:53:28.834Z",
		"size": 206,
		"path": "../public/robots.txt"
	},
	"/sitemap.xml": {
		"type": "application/xml",
		"etag": "\"634-MrBA/IGlHZxiXGckPcMr4Zb33/4\"",
		"mtime": "2026-09-19T03:53:28.834Z",
		"size": 1588,
		"path": "../public/sitemap.xml"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c8-aE0wi3G5UwBm20hIOogcLwFw76I\"",
		"mtime": "2026-09-19T03:53:28.831Z",
		"size": 8392,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c4-cuFwIStF+1ItvnpBQQU9Kt9iZVs\"",
		"mtime": "2026-09-19T03:53:28.831Z",
		"size": 8388,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-19T03:53:28.831Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-19T03:53:28.831Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20b9-i2nAOC3dv8uH13uIuFse9o5qOkg\"",
		"mtime": "2026-09-19T03:53:28.832Z",
		"size": 8377,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-19T03:53:28.832Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/assets/CertificateTemplatePreview-D0POOyDq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113e-II1cBWk9yJJMZqUGURgkewJyixs\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 4414,
		"path": "../public/assets/CertificateTemplatePreview-D0POOyDq.js"
	},
	"/assets/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"b5-RNSDzi1HBdUvkZk9a+K+w23lY/Q\"",
		"mtime": "2026-09-19T03:53:28.834Z",
		"size": 181,
		"path": "../public/assets/.htaccess"
	},
	"/assets/CityParcelLivePage-DLC-TaBo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"39a5-j3SpQowfhmkyrYJdFjMxUlRTS+Q\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 14757,
		"path": "../public/assets/CityParcelLivePage-DLC-TaBo.js"
	},
	"/assets/ParcelDetailPanel-DwlL4s2s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b90-MLOFzbQ07dLKxU/7yjk2v7k29ss\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 19344,
		"path": "../public/assets/ParcelDetailPanel-DwlL4s2s.js"
	},
	"/assets/MySkyParcelEarthGlobeSafe-B99Tt1Mw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1bad-CEleGIHmUidQa1Ovy7Di4AyEdXI\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 7085,
		"path": "../public/assets/MySkyParcelEarthGlobeSafe-B99Tt1Mw.js"
	},
	"/assets/SiteFooter-DOzmIzRP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"102e-lq188wfDHwV8fxtLMjB36V1oJoc\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 4142,
		"path": "../public/assets/SiteFooter-DOzmIzRP.js"
	},
	"/assets/SiteHeader-B8zbZ0CJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"35be-BOHQFO1z7Xp/PxvCH6ApyNhgmwA\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 13758,
		"path": "../public/assets/SiteHeader-B8zbZ0CJ.js"
	},
	"/assets/TrustBar-A8xXgkGY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"70e-z3ZAmJqerSc20SYrQ7SjwGLBj40\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 1806,
		"path": "../public/assets/TrustBar-A8xXgkGY.js"
	},
	"/assets/UserSidebar-BsFy8BIh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b71-LeTTEmEcvZrZZdjOCAMI8HKHi50\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 2929,
		"path": "../public/assets/UserSidebar-BsFy8BIh.js"
	},
	"/assets/_slug-BcunpM5s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"213b-/okGE8c0fNypca/Sj3WwPvI77/Y\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 8507,
		"path": "../public/assets/_slug-BcunpM5s.js"
	},
	"/assets/_slug-WX0QqRPI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"264-n3Px+dz17+N9q8fQDECEDWtSgz8\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 612,
		"path": "../public/assets/_slug-WX0QqRPI.js"
	},
	"/assets/ana-sayfa-C5U9YkLK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"250a-usfAAPaH7jRtsnOSJlHauvHBTsw\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 9482,
		"path": "../public/assets/ana-sayfa-C5U9YkLK.js"
	},
	"/assets/arrow-left-DhkNktzm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-5jSHfXYxDD1zXX5yHsmjf7n5Zzs\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 162,
		"path": "../public/assets/arrow-left-DhkNktzm.js"
	},
	"/assets/arrow-right-D9AS9XGO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-JiyBjFZ3KlAhXtsaSF6bq3tNTMs\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 162,
		"path": "../public/assets/arrow-right-D9AS9XGO.js"
	},
	"/assets/award-JWn7kN7G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f-tfETvGFVD6Szhf8j7Oi0w55TEZM\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 271,
		"path": "../public/assets/award-JWn7kN7G.js"
	},
	"/assets/bildirimler-DCJ1yiiZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a58-FFb7zJ+harkpfLyIxCAWaVDV4K0\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 2648,
		"path": "../public/assets/bildirimler-DCJ1yiiZ.js"
	},
	"/assets/boxes-ZcVhWL2W.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"350-T3yIAqsh5gvPXm3UJGA+L90p8HM\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 848,
		"path": "../public/assets/boxes-ZcVhWL2W.js"
	},
	"/assets/cerez-politikasi-DtqQ-TKH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e51-q0XRR1hNwcl6OXOyT0Qg/BrgRwk\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 3665,
		"path": "../public/assets/cerez-politikasi-DtqQ-TKH.js"
	},
	"/assets/certificateTemplates-BRIWk3kA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a2-f0EpRV3zmSolYtn1J/VS00AwWmE\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 25762,
		"path": "../public/assets/certificateTemplates-BRIWk3kA.js"
	},
	"/assets/check-BPX9t79G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"79-zW8lDB16S2r6PXB14WYXdppxXjI\"",
		"mtime": "2026-09-19T03:53:27.188Z",
		"size": 121,
		"path": "../public/assets/check-BPX9t79G.js"
	},
	"/assets/circle-check-5SkMNrz6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"af-7ViVdcKCqPyx+8jXSmzPId/i040\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 175,
		"path": "../public/assets/circle-check-5SkMNrz6.js"
	},
	"/assets/circle-x-Gw0YWvCQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cc-rq7PP3xhM94pNHrX2yoQ+pNsyZc\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 204,
		"path": "../public/assets/circle-x-Gw0YWvCQ.js"
	},
	"/assets/destek-DxTgbQJm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"758-CMAqsjqKsan1zhHAENfFxkkIUec\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 1880,
		"path": "../public/assets/destek-DxTgbQJm.js"
	},
	"/assets/dogrula-CFaKFMlb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16aa-eQo/S5wzFCT7jooVg++zwYtyxb8\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 5802,
		"path": "../public/assets/dogrula-CFaKFMlb.js"
	},
	"/assets/dogum-gunu-hediyesi-CcNMzmOY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e8-XyJK4yt7Iu2rfykYWDud5bUEz/Q\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 4328,
		"path": "../public/assets/dogum-gunu-hediyesi-CcNMzmOY.js"
	},
	"/assets/eye-DNzehFF4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fd-A2Up39Hq4cPjV6W1hATSRGdjZ1A\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 253,
		"path": "../public/assets/eye-DNzehFF4.js"
	},
	"/assets/gift-CDEjzJZu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15a-3NGSAD/IGLLDIO+olGRlJWJDdHY\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 346,
		"path": "../public/assets/gift-CDEjzJZu.js"
	},
	"/assets/giris-D3lapCsp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b37-FAvSvOLEdUPnyJ2mlUY5YcfS4WY\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 11063,
		"path": "../public/assets/giris-D3lapCsp.js"
	},
	"/assets/gizlilik-politikasi-BFWU3Zgi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94c-9/EdAVi/E2QXNgMj57JaRZaal2I\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 2380,
		"path": "../public/assets/gizlilik-politikasi-BFWU3Zgi.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-C277ehIP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4520-FuGHlaKV1dGxXtxk9KYy9ogvfUg\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 17696,
		"path": "../public/assets/gokyuzu-C277ehIP.js"
	},
	"/assets/gokyuzu-haritasi-CcJ45K4N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9f3-GkrUs/iJ4evF6li5SM5o50I0tgY\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 2547,
		"path": "../public/assets/gokyuzu-haritasi-CcJ45K4N.js"
	},
	"/assets/gokyuzu-ms7CzuG9.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"155a-ZcPwRwQXW/SXDTSg4qPDIAJNX5Q\"",
		"mtime": "2026-09-19T03:53:27.191Z",
		"size": 5466,
		"path": "../public/assets/gokyuzu-ms7CzuG9.css"
	},
	"/assets/guvenlik-ayarlari-DrSNGRQX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23f3-y8BekUDxPwtGZun+t/JAPHElaIE\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 9203,
		"path": "../public/assets/guvenlik-ayarlari-DrSNGRQX.js"
	},
	"/assets/hakkimizda-DVdxlxZM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef4-9cL67dbV424v33mDrwxWs4VgUzU\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 7924,
		"path": "../public/assets/hakkimizda-DVdxlxZM.js"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-19T03:53:27.191Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/heart-DOp3gsZo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-TIP2q02XL5/PRth162NBWXFkgYQ\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 255,
		"path": "../public/assets/heart-DOp3gsZo.js"
	},
	"/assets/hediyelerim-BPC0Te_O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2141-C6A1UnV9VD94NS+SGYFSzDiMhTM\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 8513,
		"path": "../public/assets/hediyelerim-BPC0Te_O.js"
	},
	"/assets/hediye-kabul-RlHd6mGW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1838-tpwx8T3rHIotKQhFFSH3dxnqrvY\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 6200,
		"path": "../public/assets/hediye-kabul-RlHd6mGW.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-19T03:53:27.191Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/iade-iptal-politikasi-ChU9_z_9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"118a-G53QsyQrKTz/byGw8/JbipGtT2k\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 4490,
		"path": "../public/assets/iade-iptal-politikasi-ChU9_z_9.js"
	},
	"/assets/iletisim-9tdL_3Jd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"772-B51nrfvCq+NXblDwsrLOFZnzCDg\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 1906,
		"path": "../public/assets/iletisim-9tdL_3Jd.js"
	},
	"/assets/index-BEbr94Yj.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"26dc9-tsei9C+68m6WXrKFodSTuaTnsZA\"",
		"mtime": "2026-09-19T03:53:27.191Z",
		"size": 159177,
		"path": "../public/assets/index-BEbr94Yj.css"
	},
	"/assets/kayit-ol-BnNonqqP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d55-Xms4eZ3oJyNidGu3TyqHtGWzTeU\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 7509,
		"path": "../public/assets/kayit-ol-BnNonqqP.js"
	},
	"/assets/jsx-runtime-DE3RlOCf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1edb-++aNIhyKgQeSqFVy8og9djQ1xvw\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 7899,
		"path": "../public/assets/jsx-runtime-DE3RlOCf.js"
	},
	"/assets/kisiye-ozel-hediye-BYqxwc4j.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10ad-TS3ONgBPFb266ge6IHhd+SRaR6U\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 4269,
		"path": "../public/assets/kisiye-ozel-hediye-BYqxwc4j.js"
	},
	"/assets/kullanim-sartlari-BhcDuUtL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb5-aW6bYql1I5MsfrZrSMOTabb7yws\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 2997,
		"path": "../public/assets/kullanim-sartlari-BhcDuUtL.js"
	},
	"/assets/index-C_CcZFIK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"50a7e-O/MuKnX0BvySU4G5TQjchQV0sTI\"",
		"mtime": "2026-09-19T03:53:27.187Z",
		"size": 330366,
		"path": "../public/assets/index-C_CcZFIK.js"
	},
	"/assets/kvkk-ZXSzB7uG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190e-+XKwhoX7cQ/1J1QMO1FvXaPcdLw\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 6414,
		"path": "../public/assets/kvkk-ZXSzB7uG.js"
	},
	"/assets/layers-C4dVdVVJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a2-a4qNznuOVSLj7gkr7/DmrSOXEhI\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 418,
		"path": "../public/assets/layers-C4dVdVVJ.js"
	},
	"/assets/lazyRouteComponent-DABfJeBc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1368-Q61pijN0d5MQE58PhskbIBi0qm4\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 4968,
		"path": "../public/assets/lazyRouteComponent-DABfJeBc.js"
	},
	"/assets/link-Bmh80dY9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6584-DLO6/21Ej1AoAZWzzsfwdNmvTgQ\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 25988,
		"path": "../public/assets/link-Bmh80dY9.js"
	},
	"/assets/loader-circle-yl7k8cfp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8d-jlE4l64p2EkeonHorCc2sRDrIF8\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 141,
		"path": "../public/assets/loader-circle-yl7k8cfp.js"
	},
	"/assets/lock-Bn0zgxvO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cb-AywJSSWUSxtl0+cds2mb6Bv+ioo\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 203,
		"path": "../public/assets/lock-Bn0zgxvO.js"
	},
	"/assets/mail-C_zsa0YP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d2-NXuthSEy07pfW4Af6N1hSIe0K9E\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 210,
		"path": "../public/assets/mail-C_zsa0YP.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-DFPuehp1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185c-Ad7+JyGHUCr+u94ZGiio3uMY+Ac\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 6236,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-DFPuehp1.js"
	},
	"/assets/nasil-calisir-Cq1xqVV2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"158a-lpIBb4Sb8woRwhPkMJ3wwAwnaaw\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 5514,
		"path": "../public/assets/nasil-calisir-Cq1xqVV2.js"
	},
	"/assets/package-check-xnZmIUry.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a7-3g4QzLauZYPOFSzY3SN0cq2wxsU\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 423,
		"path": "../public/assets/package-check-xnZmIUry.js"
	},
	"/assets/on-bilgilendirme-formu-C0attsru.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1170-4Fo234iYOU/ZOiYhRyd4226wHZE\"",
		"mtime": "2026-09-19T03:53:27.189Z",
		"size": 4464,
		"path": "../public/assets/on-bilgilendirme-formu-C0attsru.js"
	},
	"/assets/paketler-Df1260FK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15fe-oK7Kqo1/dZyuOldRBGDHudjOgPA\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 5630,
		"path": "../public/assets/paketler-Df1260FK.js"
	},
	"/assets/panelim-DW-_Xxfb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"251b-7GmFcpyL21KGOEahin/tStHiaKM\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 9499,
		"path": "../public/assets/panelim-DW-_Xxfb.js"
	},
	"/assets/parsel-satin-al-Bpwvwtp_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"415-niICyg1XDdoll8leeJh5So+R/EU\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 1045,
		"path": "../public/assets/parsel-satin-al-Bpwvwtp_.js"
	},
	"/assets/parsellerim-CzYD7FqF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c03-a5HRn2L5b30jD5NwoWZ2UhfT+C0\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 11267,
		"path": "../public/assets/parsellerim-CzYD7FqF.js"
	},
	"/assets/pazar-yeri-CnbLj1Jv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63c-rZuR4/pfPbQw9Io01THBPFTWVNs\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 1596,
		"path": "../public/assets/pazar-yeri-CnbLj1Jv.js"
	},
	"/assets/play-BP3W76HP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb-So6LsYY5Nri8BKI9iE/z1l64eR0\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 187,
		"path": "../public/assets/play-BP3W76HP.js"
	},
	"/assets/parsel-satin-al-gtTMtTxr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2adc-9p8QYQSBPPJeUJtSgyjPB7RtVFc\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 10972,
		"path": "../public/assets/parsel-satin-al-gtTMtTxr.js"
	},
	"/assets/phone-DeZ5soYG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13f-SXB6NZJTbSPtj0cOH7fjeIJ39Kc\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 319,
		"path": "../public/assets/phone-DeZ5soYG.js"
	},
	"/assets/profilim-BHqMHtKm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bc4-VRlhp60MygpnkCCmG0IUPqPIZxI\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 3012,
		"path": "../public/assets/profilim-BHqMHtKm.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/refresh-cw-YGBv4aYZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"41e-31O1XH8POA9NJRNesmyriXIqKCw\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 1054,
		"path": "../public/assets/refresh-cw-YGBv4aYZ.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/routes-DKRjacT4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"adc-AObW9i7d1Y0+FZ/bOObzOPMQ/Fc\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 2780,
		"path": "../public/assets/routes-DKRjacT4.js"
	},
	"/assets/search-BAFNdzgk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ab-rHaAgtN0rMXN1n1mPJrfJrrk7ZE\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 171,
		"path": "../public/assets/search-BAFNdzgk.js"
	},
	"/assets/sertifika-dogrula-CnI7MoPQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16db-Ahk4lcMCBzQK7FgDqAJCGV78EEY\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 5851,
		"path": "../public/assets/sertifika-dogrula-CnI7MoPQ.js"
	},
	"/assets/sertifika-dogrula-D17IwADW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"47b-BenWmwptu6ZWa+d4pwQbypwl4xk\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 1147,
		"path": "../public/assets/sertifika-dogrula-D17IwADW.js"
	},
	"/assets/sertifika-talep-CbRD2vNT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"217f-HFBfR/hNDt7R7KO0HDVY46OJQS0\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 8575,
		"path": "../public/assets/sertifika-talep-CbRD2vNT.js"
	},
	"/assets/sertifikalarim-CoR3MKz4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28ea-zQ46ESyDKpUWmKSJkdSz3rMtUtM\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 10474,
		"path": "../public/assets/sertifikalarim-CoR3MKz4.js"
	},
	"/assets/sevgiliye-hediye-BnzMcqga.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f78-x6qTKIrAUioi/AZoB+u9ZDFsEe4\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 3960,
		"path": "../public/assets/sevgiliye-hediye-BnzMcqga.js"
	},
	"/assets/shopping-cart-BUOrPFD6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6c7-vq+a/HLhb53W8RB0ew9gfVSJ3fo\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 1735,
		"path": "../public/assets/shopping-cart-BUOrPFD6.js"
	},
	"/assets/sifre-yenile-CoqumbI2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1004-17kUbyA6jOhSPsh+Z3j5RHZF/vM\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 4100,
		"path": "../public/assets/sifre-yenile-CoqumbI2.js"
	},
	"/assets/smartphone-DZkRcLdo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c2-O8ux6fKIi8vXGanz/EvjqSy4xpI\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 194,
		"path": "../public/assets/smartphone-DZkRcLdo.js"
	},
	"/assets/sifremi-unuttum-DtW62C6c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"189a-Vt6QcTwUAfO/uAuiRDYDC3fLnjU\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 6298,
		"path": "../public/assets/sifremi-unuttum-DtW62C6c.js"
	},
	"/assets/sparkles-DURQUbPG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1eb-pkUEwDsG8NO4841TzwvocajEDVw\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 491,
		"path": "../public/assets/sparkles-DURQUbPG.js"
	},
	"/assets/siparislerim-D83iY0Gj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f31-xeim5zu1Yy70r2ypgDaQp0tFzWw\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 3889,
		"path": "../public/assets/siparislerim-D83iY0Gj.js"
	},
	"/assets/star-gwKiS9s6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d5-TW1p6KlxMk5T9hRNAZL8OorK0e8\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 469,
		"path": "../public/assets/star-gwKiS9s6.js"
	},
	"/assets/trash-2-B5YpAglG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"145-WgJSyNICV8y/cKnrDrrNN+PYYJA\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 325,
		"path": "../public/assets/trash-2-B5YpAglG.js"
	},
	"/assets/useAuth-CWXaSbPO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"356bc-sMDWhf1co8wJnC4Hr/4sy10BXq8\"",
		"mtime": "2026-09-19T03:53:27.191Z",
		"size": 218812,
		"path": "../public/assets/useAuth-CWXaSbPO.js"
	},
	"/assets/turkiye-haritasi-BoVXD7WD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f2d-Fc8dUZIeTdpO8vGTkIqw5bPkZsE\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 3885,
		"path": "../public/assets/turkiye-haritasi-BoVXD7WD.js"
	},
	"/assets/useNavigate-CJu93reX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18a-vNeG25DPDdGiv/ZwkWaoUtOEQCw\"",
		"mtime": "2026-09-19T03:53:27.191Z",
		"size": 394,
		"path": "../public/assets/useNavigate-CJu93reX.js"
	},
	"/assets/user-CqRV6n5O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c1-zwQo/E0+NEuABeRPtnoAdLX27DY\"",
		"mtime": "2026-09-19T03:53:27.191Z",
		"size": 193,
		"path": "../public/assets/user-CqRV6n5O.js"
	},
	"/assets/user-round-GjDIOvrv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3-SYYbMG3cA06Qi3Ak04caCRiBrBo\"",
		"mtime": "2026-09-19T03:53:27.191Z",
		"size": 179,
		"path": "../public/assets/user-round-GjDIOvrv.js"
	},
	"/assets/uyelik-sozlesmesi-BfP3qrpd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a4-0CWB6fwKPcl7hDHiX83jE7FW/Ao\"",
		"mtime": "2026-09-19T03:53:27.191Z",
		"size": 9636,
		"path": "../public/assets/uyelik-sozlesmesi-BfP3qrpd.js"
	},
	"/assets/yonetim-Bi6On4xS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c88-L+IyQHvT/2rn1OXbpw+1nVQX5NA\"",
		"mtime": "2026-09-19T03:53:27.191Z",
		"size": 35976,
		"path": "../public/assets/yonetim-Bi6On4xS.js"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-19T03:52:57.288Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-19T03:53:28.832Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-19T03:53:28.832Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-19T03:53:28.834Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-19T03:53:28.833Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-19T03:53:28.833Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-19T03:53:28.833Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-19T03:53:28.833Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-19T03:53:28.833Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/assets/three.module-C5rh5wLt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b0d0c-yxZrAk456uilGR/GXmPe2vD3V3k\"",
		"mtime": "2026-09-19T03:53:27.190Z",
		"size": 724236,
		"path": "../public/assets/three.module-C5rh5wLt.js"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-19T03:53:28.834Z",
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
