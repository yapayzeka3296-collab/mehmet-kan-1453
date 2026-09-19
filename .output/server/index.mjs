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
		"mtime": "2026-09-19T04:32:10.348Z",
		"size": 2463,
		"path": "../public/.htaccess"
	},
	"/cloud-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"200-lvKTdoTfo+30J2I2WxMu97p+hmI\"",
		"mtime": "2026-09-19T04:32:10.348Z",
		"size": 512,
		"path": "../public/cloud-texture.svg"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-09-19T04:32:10.349Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/earth-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"432-7hbnUfYacpJ5GuKlsQ+DIaVE3oM\"",
		"mtime": "2026-09-19T04:32:10.348Z",
		"size": 1074,
		"path": "../public/earth-texture.svg"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"806-b1v3QqYB4V3OQR9kzlQsuHgBOqs\"",
		"mtime": "2026-09-19T04:32:10.349Z",
		"size": 2054,
		"path": "../public/login-background.css"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-19T04:32:10.349Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"ce-n8Tm1cPHNDloKfFtLwsBoYS5eu8\"",
		"mtime": "2026-09-19T04:32:10.349Z",
		"size": 206,
		"path": "../public/robots.txt"
	},
	"/sitemap.xml": {
		"type": "application/xml",
		"etag": "\"634-MrBA/IGlHZxiXGckPcMr4Zb33/4\"",
		"mtime": "2026-09-19T04:32:10.349Z",
		"size": 1588,
		"path": "../public/sitemap.xml"
	},
	"/assets/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"b5-RNSDzi1HBdUvkZk9a+K+w23lY/Q\"",
		"mtime": "2026-09-19T04:32:10.349Z",
		"size": 181,
		"path": "../public/assets/.htaccess"
	},
	"/assets/CityParcelLivePage-C3IpJB1O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"39a5-mXJZCvKNNbuRqBonaE8o8pyCF18\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 14757,
		"path": "../public/assets/CityParcelLivePage-C3IpJB1O.js"
	},
	"/assets/MySkyParcelEarthGlobeSafe-B99Tt1Mw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1bad-CEleGIHmUidQa1Ovy7Di4AyEdXI\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 7085,
		"path": "../public/assets/MySkyParcelEarthGlobeSafe-B99Tt1Mw.js"
	},
	"/assets/ParcelDetailPanel-Bz3J3_Ly.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"60ad-BjqMm1GXOVaMRWIunDY3gG20jiE\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 24749,
		"path": "../public/assets/ParcelDetailPanel-Bz3J3_Ly.js"
	},
	"/assets/SiteHeader-BHSoxDMu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36b2-HXgUqu/p1DjN9kf1ocAUC2f9YG0\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 14002,
		"path": "../public/assets/SiteHeader-BHSoxDMu.js"
	},
	"/assets/SiteFooter-DOzmIzRP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"102e-lq188wfDHwV8fxtLMjB36V1oJoc\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 4142,
		"path": "../public/assets/SiteFooter-DOzmIzRP.js"
	},
	"/assets/UserSidebar-BsFy8BIh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b71-LeTTEmEcvZrZZdjOCAMI8HKHi50\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 2929,
		"path": "../public/assets/UserSidebar-BsFy8BIh.js"
	},
	"/assets/TrustBar-A8xXgkGY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"70e-z3ZAmJqerSc20SYrQ7SjwGLBj40\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 1806,
		"path": "../public/assets/TrustBar-A8xXgkGY.js"
	},
	"/assets/_slug-CcDcmcB1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"264-s5MZfdrylgBFKJQwR2kfAGDo97Y\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 612,
		"path": "../public/assets/_slug-CcDcmcB1.js"
	},
	"/assets/_slug-Z36BJAyZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"213b-YKIJ+Zc4Vlk3CFM8A+FWlRvtpyQ\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 8507,
		"path": "../public/assets/_slug-Z36BJAyZ.js"
	},
	"/assets/ana-sayfa-DEofVuDW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"250a-qFzsmrGCD91Nyueh5NBpuANC9ZI\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 9482,
		"path": "../public/assets/ana-sayfa-DEofVuDW.js"
	},
	"/assets/CertificateTemplatePreview-D0POOyDq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113e-II1cBWk9yJJMZqUGURgkewJyixs\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 4414,
		"path": "../public/assets/CertificateTemplatePreview-D0POOyDq.js"
	},
	"/assets/arrow-left-DhkNktzm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-5jSHfXYxDD1zXX5yHsmjf7n5Zzs\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 162,
		"path": "../public/assets/arrow-left-DhkNktzm.js"
	},
	"/assets/award-JWn7kN7G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f-tfETvGFVD6Szhf8j7Oi0w55TEZM\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 271,
		"path": "../public/assets/award-JWn7kN7G.js"
	},
	"/assets/arrow-right-D9AS9XGO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-JiyBjFZ3KlAhXtsaSF6bq3tNTMs\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 162,
		"path": "../public/assets/arrow-right-D9AS9XGO.js"
	},
	"/assets/bildirimler-BpaNRaZs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a58-JEcvQpIMEurSiTevn56TQ/gCBik\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 2648,
		"path": "../public/assets/bildirimler-BpaNRaZs.js"
	},
	"/assets/boxes-ZcVhWL2W.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"350-T3yIAqsh5gvPXm3UJGA+L90p8HM\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 848,
		"path": "../public/assets/boxes-ZcVhWL2W.js"
	},
	"/assets/certificateTemplates-BRIWk3kA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a2-f0EpRV3zmSolYtn1J/VS00AwWmE\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 25762,
		"path": "../public/assets/certificateTemplates-BRIWk3kA.js"
	},
	"/assets/cerez-politikasi-Dn5BeLAB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e51-o8WD4x7lR+5ooJjMifELITQLQTw\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 3665,
		"path": "../public/assets/cerez-politikasi-Dn5BeLAB.js"
	},
	"/assets/circle-check-5SkMNrz6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"af-7ViVdcKCqPyx+8jXSmzPId/i040\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 175,
		"path": "../public/assets/circle-check-5SkMNrz6.js"
	},
	"/assets/circle-x-Gw0YWvCQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cc-rq7PP3xhM94pNHrX2yoQ+pNsyZc\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 204,
		"path": "../public/assets/circle-x-Gw0YWvCQ.js"
	},
	"/assets/check-BPX9t79G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"79-zW8lDB16S2r6PXB14WYXdppxXjI\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 121,
		"path": "../public/assets/check-BPX9t79G.js"
	},
	"/assets/destek-hkA-toEO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"758-+YbpnkN1kFLom4jX111sp7F+9x8\"",
		"mtime": "2026-09-19T04:32:08.673Z",
		"size": 1880,
		"path": "../public/assets/destek-hkA-toEO.js"
	},
	"/assets/dogrula-CwXODWHn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16aa-Z9YseITIBpf4fBvnnEO54MbNGBM\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 5802,
		"path": "../public/assets/dogrula-CwXODWHn.js"
	},
	"/assets/dogum-gunu-hediyesi-DJz-oqkg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e8-nuTzSJ6rtTTelsEiZG7gWDxrEOQ\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 4328,
		"path": "../public/assets/dogum-gunu-hediyesi-DJz-oqkg.js"
	},
	"/assets/eye-DNzehFF4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fd-A2Up39Hq4cPjV6W1hATSRGdjZ1A\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 253,
		"path": "../public/assets/eye-DNzehFF4.js"
	},
	"/assets/gift-CDEjzJZu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15a-3NGSAD/IGLLDIO+olGRlJWJDdHY\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 346,
		"path": "../public/assets/gift-CDEjzJZu.js"
	},
	"/assets/giris-Mx-K7OG-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b37-v755JNnCFVZyVZtgK4C0D5vA7Ds\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 11063,
		"path": "../public/assets/giris-Mx-K7OG-.js"
	},
	"/assets/gizlilik-politikasi-DXD4-99r.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94c-VQ0U4Sv/kqh1/a6A3iCUN8oZHIM\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 2380,
		"path": "../public/assets/gizlilik-politikasi-DXD4-99r.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-haritasi-wjTsWS9g.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9f3-iFl06nH+t3uMFVrPClOERuLkD6M\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 2547,
		"path": "../public/assets/gokyuzu-haritasi-wjTsWS9g.js"
	},
	"/assets/gokyuzu-C277ehIP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4520-FuGHlaKV1dGxXtxk9KYy9ogvfUg\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 17696,
		"path": "../public/assets/gokyuzu-C277ehIP.js"
	},
	"/assets/gokyuzu-ms7CzuG9.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"155a-ZcPwRwQXW/SXDTSg4qPDIAJNX5Q\"",
		"mtime": "2026-09-19T04:32:08.676Z",
		"size": 5466,
		"path": "../public/assets/gokyuzu-ms7CzuG9.css"
	},
	"/assets/guvenlik-ayarlari-CbpV9PCI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23f3-1yig69bwT9A8eswTCXS0QlyZJNA\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 9203,
		"path": "../public/assets/guvenlik-ayarlari-CbpV9PCI.js"
	},
	"/assets/hakkimizda-DqZzBJFv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef4-4OHmj3+qzR8dDYtTEmPozdhtOKc\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 7924,
		"path": "../public/assets/hakkimizda-DqZzBJFv.js"
	},
	"/assets/heart-DOp3gsZo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-TIP2q02XL5/PRth162NBWXFkgYQ\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 255,
		"path": "../public/assets/heart-DOp3gsZo.js"
	},
	"/assets/hediye-kabul-DR_aG71U.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1838-An1Www0z//qb2lX0/LRFXmacMSE\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 6200,
		"path": "../public/assets/hediye-kabul-DR_aG71U.js"
	},
	"/assets/hediyelerim-gV1NHvDt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2141-+Z4mkmb8S30drDKZmZAlVROynmg\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 8513,
		"path": "../public/assets/hediyelerim-gV1NHvDt.js"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-19T04:32:08.676Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/iade-iptal-politikasi-DRVc7Ubw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"118a-QBC98sIlXIqDOa72EuhkdyMTISo\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 4490,
		"path": "../public/assets/iade-iptal-politikasi-DRVc7Ubw.js"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-19T04:32:08.676Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/iletisim-BghSSJo1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"772-YZCPUxbqhkfYW+cd6MZ8/kUOM1Q\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 1906,
		"path": "../public/assets/iletisim-BghSSJo1.js"
	},
	"/assets/index-Dx2RySkK.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"26df8-D+l1yWkt9Om3H8vEG8k93UpKi7o\"",
		"mtime": "2026-09-19T04:32:08.676Z",
		"size": 159224,
		"path": "../public/assets/index-Dx2RySkK.css"
	},
	"/assets/kayit-ol-DtTwUwAL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d55-+D5pOU4hJQhheNj1UG02FS1PiJc\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 7509,
		"path": "../public/assets/kayit-ol-DtTwUwAL.js"
	},
	"/assets/index-P70JSg4D.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"50a7e-gqBU+hszNlPCx5F5TGbxLer9VKw\"",
		"mtime": "2026-09-19T04:32:08.671Z",
		"size": 330366,
		"path": "../public/assets/index-P70JSg4D.js"
	},
	"/assets/jsx-runtime-DE3RlOCf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1edb-++aNIhyKgQeSqFVy8og9djQ1xvw\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 7899,
		"path": "../public/assets/jsx-runtime-DE3RlOCf.js"
	},
	"/assets/kisiye-ozel-hediye-SAYRjBEk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10ad-OggQZ8g6W9zvJsABJ6yReXQjXmo\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 4269,
		"path": "../public/assets/kisiye-ozel-hediye-SAYRjBEk.js"
	},
	"/assets/kullanim-sartlari-v77UDxMY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb5-yCOjpqpRmGMoB1Nm9QvF50Un750\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 2997,
		"path": "../public/assets/kullanim-sartlari-v77UDxMY.js"
	},
	"/assets/kvkk-D3fI57lu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190e-OE+ekgMbHQdUy/1ZKIHf9ysTacI\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 6414,
		"path": "../public/assets/kvkk-D3fI57lu.js"
	},
	"/assets/layers-C4dVdVVJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a2-a4qNznuOVSLj7gkr7/DmrSOXEhI\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 418,
		"path": "../public/assets/layers-C4dVdVVJ.js"
	},
	"/assets/lazyRouteComponent-DABfJeBc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1368-Q61pijN0d5MQE58PhskbIBi0qm4\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 4968,
		"path": "../public/assets/lazyRouteComponent-DABfJeBc.js"
	},
	"/assets/loader-circle-yl7k8cfp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8d-jlE4l64p2EkeonHorCc2sRDrIF8\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 141,
		"path": "../public/assets/loader-circle-yl7k8cfp.js"
	},
	"/assets/lock-Bn0zgxvO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cb-AywJSSWUSxtl0+cds2mb6Bv+ioo\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 203,
		"path": "../public/assets/lock-Bn0zgxvO.js"
	},
	"/assets/link-Bmh80dY9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6584-DLO6/21Ej1AoAZWzzsfwdNmvTgQ\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 25988,
		"path": "../public/assets/link-Bmh80dY9.js"
	},
	"/assets/mail-C_zsa0YP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d2-NXuthSEy07pfW4Af6N1hSIe0K9E\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 210,
		"path": "../public/assets/mail-C_zsa0YP.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-BMNkzgtd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185c-DOkp6OM1XmrnlKkXbfiF0/pvJJw\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 6236,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-BMNkzgtd.js"
	},
	"/assets/nasil-calisir-OLYhj4Se.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"158a-P9chuxC0/qYZZWjPeBasP96B350\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 5514,
		"path": "../public/assets/nasil-calisir-OLYhj4Se.js"
	},
	"/assets/package-check-xnZmIUry.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a7-3g4QzLauZYPOFSzY3SN0cq2wxsU\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 423,
		"path": "../public/assets/package-check-xnZmIUry.js"
	},
	"/assets/on-bilgilendirme-formu-AQz__wGA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1170-QT5o8H6kq935F5+pQBJbJdlSVT0\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 4464,
		"path": "../public/assets/on-bilgilendirme-formu-AQz__wGA.js"
	},
	"/assets/paketler-CKrtl-MP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15fe-Vv/CBcs4fE/Z/vSRuPIz1/vzu3c\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 5630,
		"path": "../public/assets/paketler-CKrtl-MP.js"
	},
	"/assets/panelim-IcizjBOb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"251b-hcInmaXlNzaEoimuH3dST2HoEAU\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 9499,
		"path": "../public/assets/panelim-IcizjBOb.js"
	},
	"/assets/parsel-satin-al-Be8bMw2v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2adc-v48Gb3pE0OKD0HSM6+04ChhKp+g\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 10972,
		"path": "../public/assets/parsel-satin-al-Be8bMw2v.js"
	},
	"/assets/parsel-satin-al-BKBdkD6m.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"415-3QqbKZfBtD1+BL0swGfAPdKv35s\"",
		"mtime": "2026-09-19T04:32:08.674Z",
		"size": 1045,
		"path": "../public/assets/parsel-satin-al-BKBdkD6m.js"
	},
	"/assets/parsellerim-ChkngWzo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c03-uNrY1LYmUV/dcwactR2/F8NNkzA\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 11267,
		"path": "../public/assets/parsellerim-ChkngWzo.js"
	},
	"/assets/pazar-yeri-D0qQ5ww2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63c-oVDH7nx6rfJFR67aQuEG4FZUnp8\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 1596,
		"path": "../public/assets/pazar-yeri-D0qQ5ww2.js"
	},
	"/assets/phone-DeZ5soYG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13f-SXB6NZJTbSPtj0cOH7fjeIJ39Kc\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 319,
		"path": "../public/assets/phone-DeZ5soYG.js"
	},
	"/assets/play-BP3W76HP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb-So6LsYY5Nri8BKI9iE/z1l64eR0\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 187,
		"path": "../public/assets/play-BP3W76HP.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/profilim-DGNki5T9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bc4-nGE+4zNjl6inxBKvTQ2JTRMzvfY\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 3012,
		"path": "../public/assets/profilim-DGNki5T9.js"
	},
	"/assets/refresh-cw-YGBv4aYZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"41e-31O1XH8POA9NJRNesmyriXIqKCw\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 1054,
		"path": "../public/assets/refresh-cw-YGBv4aYZ.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/routes-RTKB3ruC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"adc-PbyUtn7SY7QfiL1JS17+7uhrOno\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 2780,
		"path": "../public/assets/routes-RTKB3ruC.js"
	},
	"/assets/search-BAFNdzgk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ab-rHaAgtN0rMXN1n1mPJrfJrrk7ZE\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 171,
		"path": "../public/assets/search-BAFNdzgk.js"
	},
	"/assets/sertifika-dogrula-BpkPfWr6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"47b-MZNtMmihLkfJu/tP2LEyDU6m7y4\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 1147,
		"path": "../public/assets/sertifika-dogrula-BpkPfWr6.js"
	},
	"/assets/sertifika-dogrula-TUuqZsML.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16db-sw5Vz+RT6X8ctOGvi1+LJf8QrDQ\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 5851,
		"path": "../public/assets/sertifika-dogrula-TUuqZsML.js"
	},
	"/assets/sertifika-talep-BnOR9vbm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"217f-M8ucyJq7inWVMTTR1O06qSti77Y\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 8575,
		"path": "../public/assets/sertifika-talep-BnOR9vbm.js"
	},
	"/assets/sertifikalarim-CtXLjR8m.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28ea-pfYfgqx7bpqaYdbasKBan7xLwLQ\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 10474,
		"path": "../public/assets/sertifikalarim-CtXLjR8m.js"
	},
	"/assets/sevgiliye-hediye-i8OGnjdS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f78-8vso9nAfFzQqo8roF7r+9eAYgic\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 3960,
		"path": "../public/assets/sevgiliye-hediye-i8OGnjdS.js"
	},
	"/assets/shopping-cart-BUOrPFD6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6c7-vq+a/HLhb53W8RB0ew9gfVSJ3fo\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 1735,
		"path": "../public/assets/shopping-cart-BUOrPFD6.js"
	},
	"/assets/sifre-yenile-C4SouH14.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1004-DtJYBrpAhI8TAW5iyv3K0Hmo31Y\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 4100,
		"path": "../public/assets/sifre-yenile-C4SouH14.js"
	},
	"/assets/sifremi-unuttum-7I5ZEDOY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"189a-BeashqbsZXlLN4Bld5J5SRod0E8\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 6298,
		"path": "../public/assets/sifremi-unuttum-7I5ZEDOY.js"
	},
	"/assets/siparislerim-B1o5a-iZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f31-A5P5KLnNPGZl2BBRFDngzaXFifA\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 3889,
		"path": "../public/assets/siparislerim-B1o5a-iZ.js"
	},
	"/assets/smartphone-DZkRcLdo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c2-O8ux6fKIi8vXGanz/EvjqSy4xpI\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 194,
		"path": "../public/assets/smartphone-DZkRcLdo.js"
	},
	"/assets/sparkles-DURQUbPG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1eb-pkUEwDsG8NO4841TzwvocajEDVw\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 491,
		"path": "../public/assets/sparkles-DURQUbPG.js"
	},
	"/assets/star-gwKiS9s6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d5-TW1p6KlxMk5T9hRNAZL8OorK0e8\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 469,
		"path": "../public/assets/star-gwKiS9s6.js"
	},
	"/assets/trash-2-B5YpAglG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"145-WgJSyNICV8y/cKnrDrrNN+PYYJA\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 325,
		"path": "../public/assets/trash-2-B5YpAglG.js"
	},
	"/assets/turkiye-haritasi-thtSrE-C.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f2d-J8dk4DH/sr642V9KLuUpdCbO3VI\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 3885,
		"path": "../public/assets/turkiye-haritasi-thtSrE-C.js"
	},
	"/assets/useAuth-CWXaSbPO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"356bc-sMDWhf1co8wJnC4Hr/4sy10BXq8\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 218812,
		"path": "../public/assets/useAuth-CWXaSbPO.js"
	},
	"/assets/useNavigate-CJu93reX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18a-vNeG25DPDdGiv/ZwkWaoUtOEQCw\"",
		"mtime": "2026-09-19T04:32:08.676Z",
		"size": 394,
		"path": "../public/assets/useNavigate-CJu93reX.js"
	},
	"/assets/user-CqRV6n5O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c1-zwQo/E0+NEuABeRPtnoAdLX27DY\"",
		"mtime": "2026-09-19T04:32:08.676Z",
		"size": 193,
		"path": "../public/assets/user-CqRV6n5O.js"
	},
	"/assets/three.module-C5rh5wLt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b0d0c-yxZrAk456uilGR/GXmPe2vD3V3k\"",
		"mtime": "2026-09-19T04:32:08.675Z",
		"size": 724236,
		"path": "../public/assets/three.module-C5rh5wLt.js"
	},
	"/assets/user-round-GjDIOvrv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3-SYYbMG3cA06Qi3Ak04caCRiBrBo\"",
		"mtime": "2026-09-19T04:32:08.676Z",
		"size": 179,
		"path": "../public/assets/user-round-GjDIOvrv.js"
	},
	"/assets/uyelik-sozlesmesi-e-2IGdmA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a4-alfjhygeVpYvJ6mfaBXhMY+Yrmw\"",
		"mtime": "2026-09-19T04:32:08.676Z",
		"size": 9636,
		"path": "../public/assets/uyelik-sozlesmesi-e-2IGdmA.js"
	},
	"/assets/yonetim-Bi6On4xS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c88-L+IyQHvT/2rn1OXbpw+1nVQX5NA\"",
		"mtime": "2026-09-19T04:32:08.676Z",
		"size": 35976,
		"path": "../public/assets/yonetim-Bi6On4xS.js"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c8-aE0wi3G5UwBm20hIOogcLwFw76I\"",
		"mtime": "2026-09-19T04:32:10.345Z",
		"size": 8392,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-19T04:32:10.347Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c4-cuFwIStF+1ItvnpBQQU9Kt9iZVs\"",
		"mtime": "2026-09-19T04:32:10.347Z",
		"size": 8388,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-19T04:32:10.347Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20b9-i2nAOC3dv8uH13uIuFse9o5qOkg\"",
		"mtime": "2026-09-19T04:32:10.347Z",
		"size": 8377,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-19T04:32:10.347Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-19T04:31:37.778Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-19T04:32:10.347Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-19T04:32:10.348Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-19T04:32:10.348Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-19T04:32:10.349Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-19T04:32:10.348Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-19T04:32:10.348Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-19T04:32:10.348Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-19T04:32:10.348Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-19T04:32:10.349Z",
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
