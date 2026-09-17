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
		"mtime": "2026-09-17T22:10:11.647Z",
		"size": 2463,
		"path": "../public/.htaccess"
	},
	"/cloud-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"200-lvKTdoTfo+30J2I2WxMu97p+hmI\"",
		"mtime": "2026-09-17T22:10:11.647Z",
		"size": 512,
		"path": "../public/cloud-texture.svg"
	},
	"/earth-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"432-7hbnUfYacpJ5GuKlsQ+DIaVE3oM\"",
		"mtime": "2026-09-17T22:10:11.647Z",
		"size": 1074,
		"path": "../public/earth-texture.svg"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"806-b1v3QqYB4V3OQR9kzlQsuHgBOqs\"",
		"mtime": "2026-09-17T22:10:11.647Z",
		"size": 2054,
		"path": "../public/login-background.css"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-09-17T22:10:11.647Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-17T22:10:11.647Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/sitemap.xml": {
		"type": "application/xml",
		"etag": "\"634-MrBA/IGlHZxiXGckPcMr4Zb33/4\"",
		"mtime": "2026-09-17T22:10:11.647Z",
		"size": 1588,
		"path": "../public/sitemap.xml"
	},
	"/assets/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"b5-RNSDzi1HBdUvkZk9a+K+w23lY/Q\"",
		"mtime": "2026-09-17T22:10:11.648Z",
		"size": 181,
		"path": "../public/assets/.htaccess"
	},
	"/assets/CityParcelLivePage-ByrwNFO2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"39d0-PJ9MuP8ESBMqAMV+NCeQe734JRc\"",
		"mtime": "2026-09-17T22:10:10.050Z",
		"size": 14800,
		"path": "../public/assets/CityParcelLivePage-ByrwNFO2.js"
	},
	"/assets/CertificateTemplatePreview-D0POOyDq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113e-II1cBWk9yJJMZqUGURgkewJyixs\"",
		"mtime": "2026-09-17T22:10:10.050Z",
		"size": 4414,
		"path": "../public/assets/CertificateTemplatePreview-D0POOyDq.js"
	},
	"/assets/Logo-Bv906a9I.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"254-NVlmRnXKVSjfaC7XwgxBFCmH1Bg\"",
		"mtime": "2026-09-17T22:10:10.050Z",
		"size": 596,
		"path": "../public/assets/Logo-Bv906a9I.js"
	},
	"/assets/ParcelDetailPanel-DLBnZr61.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b94-otkABgkgba4ckjfKmcBUJ0ByyHA\"",
		"mtime": "2026-09-17T22:10:10.050Z",
		"size": 19348,
		"path": "../public/assets/ParcelDetailPanel-DLBnZr61.js"
	},
	"/assets/SiteFooter-D40BecKx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"102e-GJfu2ZDm/cK09LxNRWcNebv45VU\"",
		"mtime": "2026-09-17T22:10:10.050Z",
		"size": 4142,
		"path": "../public/assets/SiteFooter-D40BecKx.js"
	},
	"/assets/SiteHeader-DAyckAo8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"33cc-7mAEc7bHZVFvpYgmuIfWpFNuFwI\"",
		"mtime": "2026-09-17T22:10:10.050Z",
		"size": 13260,
		"path": "../public/assets/SiteHeader-DAyckAo8.js"
	},
	"/assets/TrustBar-A8xXgkGY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"70e-z3ZAmJqerSc20SYrQ7SjwGLBj40\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 1806,
		"path": "../public/assets/TrustBar-A8xXgkGY.js"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"ce-n8Tm1cPHNDloKfFtLwsBoYS5eu8\"",
		"mtime": "2026-09-17T22:10:11.647Z",
		"size": 206,
		"path": "../public/robots.txt"
	},
	"/assets/_slug-C3-BcAKm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a6-m4vF/aCMq6sXOyw2Gcv+QYLBj0c\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 678,
		"path": "../public/assets/_slug-C3-BcAKm.js"
	},
	"/assets/_slug-DaNExG-9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2166-iQ/oXC6L3jhYtNUXaA9xX2bxFLE\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 8550,
		"path": "../public/assets/_slug-DaNExG-9.js"
	},
	"/assets/ana-sayfa-BnYCWE3L.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2501-qdh/o2dlr80uHgVnfWoIVvNHSPA\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 9473,
		"path": "../public/assets/ana-sayfa-BnYCWE3L.js"
	},
	"/assets/arrow-left-DhkNktzm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-5jSHfXYxDD1zXX5yHsmjf7n5Zzs\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 162,
		"path": "../public/assets/arrow-left-DhkNktzm.js"
	},
	"/assets/arrow-right-D9AS9XGO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-JiyBjFZ3KlAhXtsaSF6bq3tNTMs\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 162,
		"path": "../public/assets/arrow-right-D9AS9XGO.js"
	},
	"/assets/award-JWn7kN7G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f-tfETvGFVD6Szhf8j7Oi0w55TEZM\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 271,
		"path": "../public/assets/award-JWn7kN7G.js"
	},
	"/assets/UserSidebar-B7WPBbwm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b4f-MISwu+BizEwZZDS2bKtyyWA1BYg\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 2895,
		"path": "../public/assets/UserSidebar-B7WPBbwm.js"
	},
	"/assets/bildirimler-DwxURm1k.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5c-5eyyGFK3KIo4fBunWQzMlElYWsY\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 2652,
		"path": "../public/assets/bildirimler-DwxURm1k.js"
	},
	"/assets/boxes-ZcVhWL2W.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"350-T3yIAqsh5gvPXm3UJGA+L90p8HM\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 848,
		"path": "../public/assets/boxes-ZcVhWL2W.js"
	},
	"/assets/certificateTemplates-BRIWk3kA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a2-f0EpRV3zmSolYtn1J/VS00AwWmE\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 25762,
		"path": "../public/assets/certificateTemplates-BRIWk3kA.js"
	},
	"/assets/cerez-politikasi-zC9DjNHS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e00-9f82YrLGHQCGr7pzrp1ZNqXdIfA\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 3584,
		"path": "../public/assets/cerez-politikasi-zC9DjNHS.js"
	},
	"/assets/check-BPX9t79G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"79-zW8lDB16S2r6PXB14WYXdppxXjI\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 121,
		"path": "../public/assets/check-BPX9t79G.js"
	},
	"/assets/circle-check-5SkMNrz6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"af-7ViVdcKCqPyx+8jXSmzPId/i040\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 175,
		"path": "../public/assets/circle-check-5SkMNrz6.js"
	},
	"/assets/circle-x-Gw0YWvCQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cc-rq7PP3xhM94pNHrX2yoQ+pNsyZc\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 204,
		"path": "../public/assets/circle-x-Gw0YWvCQ.js"
	},
	"/assets/destek-udyedxtv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"758-Nbqhrw1ia257sJSlmxvWoeUuYLQ\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 1880,
		"path": "../public/assets/destek-udyedxtv.js"
	},
	"/assets/dogrula-B5EmBfLT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16da-Mt31qa+0SFccxKD3J7II87M+qZY\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 5850,
		"path": "../public/assets/dogrula-B5EmBfLT.js"
	},
	"/assets/dogum-gunu-hediyesi-DLqSYVaa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e8-NEku/VQ2ZFn4u2apyfKkeq4yjUQ\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 4328,
		"path": "../public/assets/dogum-gunu-hediyesi-DLqSYVaa.js"
	},
	"/assets/eye-DNzehFF4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fd-A2Up39Hq4cPjV6W1hATSRGdjZ1A\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 253,
		"path": "../public/assets/eye-DNzehFF4.js"
	},
	"/assets/gift-CDEjzJZu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15a-3NGSAD/IGLLDIO+olGRlJWJDdHY\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 346,
		"path": "../public/assets/gift-CDEjzJZu.js"
	},
	"/assets/giris-B_RtBorP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b3b-8kEP9sWpC4knMPynz0ApGwhn06E\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 11067,
		"path": "../public/assets/giris-B_RtBorP.js"
	},
	"/assets/gizlilik-politikasi-CfAPQh5c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94c-T4VRiqm34/VDJRvWXXc/7BNtrzM\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 2380,
		"path": "../public/assets/gizlilik-politikasi-CfAPQh5c.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-C2iOSggk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6785-r8//bKkumaTtCJ55/4SMyoC0VAo\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 26501,
		"path": "../public/assets/gokyuzu-C2iOSggk.js"
	},
	"/assets/gokyuzu-D-ahmtD2.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1175-kuVFBrwyr6I/rVCLAoS21kuKd04\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 4469,
		"path": "../public/assets/gokyuzu-D-ahmtD2.css"
	},
	"/assets/gokyuzu-haritasi-Bbk4vpLL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1e-YSLX2ou7TeEhx71C7fnhgCfjyk8\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 2590,
		"path": "../public/assets/gokyuzu-haritasi-Bbk4vpLL.js"
	},
	"/assets/gokyuzunu-tara-Ckod1cZm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28b3-BjLfbpEJ7jYBBk44SZVjqz49GYM\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 10419,
		"path": "../public/assets/gokyuzunu-tara-Ckod1cZm.js"
	},
	"/assets/guvenlik-ayarlari-GiyjCZTQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23f7-Mmdlc8ys+ZE3bk3RpPz42fWpgHs\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 9207,
		"path": "../public/assets/guvenlik-ayarlari-GiyjCZTQ.js"
	},
	"/assets/hakkimizda-t1PxZLHP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef4-+SEhXnsStGqWhVh1GHr9hM3pOIY\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 7924,
		"path": "../public/assets/hakkimizda-t1PxZLHP.js"
	},
	"/assets/heart-DOp3gsZo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-TIP2q02XL5/PRth162NBWXFkgYQ\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 255,
		"path": "../public/assets/heart-DOp3gsZo.js"
	},
	"/assets/hediye-kabul-B93op1N0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"183c-A2zsx79N38P8soXSJph2bQKyZdo\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 6204,
		"path": "../public/assets/hediye-kabul-B93op1N0.js"
	},
	"/assets/hediyelerim-PGumU4Ap.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"216c-sWWzxUJOe5zwPMl0qn+OcLebcWs\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 8556,
		"path": "../public/assets/hediyelerim-PGumU4Ap.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/iade-iptal-politikasi-D55oQQnm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"118a-+kmUhadtm6HUQE/TOFa8b4+T6yk\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 4490,
		"path": "../public/assets/iade-iptal-politikasi-D55oQQnm.js"
	},
	"/assets/iletisim-hTujPuAM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"772-fxlfSziwJQTbUamgskpfDgKPklQ\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 1906,
		"path": "../public/assets/iletisim-hTujPuAM.js"
	},
	"/assets/index-BgeeSzP9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"50ce5-gJmkeTQSeLqWsKLSr4P8euuz4aY\"",
		"mtime": "2026-09-17T22:10:10.049Z",
		"size": 330981,
		"path": "../public/assets/index-BgeeSzP9.js"
	},
	"/assets/index-D5O7Ur_5.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"26d9e-ow7N1O4+Yjjf1AlQ1cJN6FGIyyI\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 159134,
		"path": "../public/assets/index-D5O7Ur_5.css"
	},
	"/assets/jsx-runtime-DE3RlOCf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1edb-++aNIhyKgQeSqFVy8og9djQ1xvw\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 7899,
		"path": "../public/assets/jsx-runtime-DE3RlOCf.js"
	},
	"/assets/kayit-ol-DOuCluH7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d55-yKW/NC6SUkahqQh20WVmjgnX8l0\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 7509,
		"path": "../public/assets/kayit-ol-DOuCluH7.js"
	},
	"/assets/kisiye-ozel-hediye-B5oSo3Cc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10ad-Rlbb0ZWhxItvEo9mC/oJWGlzIQQ\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 4269,
		"path": "../public/assets/kisiye-ozel-hediye-B5oSo3Cc.js"
	},
	"/assets/kullanim-sartlari-ncQdGyvG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb5-1LQVRdZ4C86khd9Wl1QXRuTHcyg\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 2997,
		"path": "../public/assets/kullanim-sartlari-ncQdGyvG.js"
	},
	"/assets/kvkk-gBuB2iUa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190e-nwJntNPBIY03gfOcejcR/IsWlmk\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 6414,
		"path": "../public/assets/kvkk-gBuB2iUa.js"
	},
	"/assets/layers-C4dVdVVJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a2-a4qNznuOVSLj7gkr7/DmrSOXEhI\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 418,
		"path": "../public/assets/layers-C4dVdVVJ.js"
	},
	"/assets/lazyRouteComponent-CMv33qUI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1366-Uno3UyTYrsa8gjsiTW6+nl9kCrY\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 4966,
		"path": "../public/assets/lazyRouteComponent-CMv33qUI.js"
	},
	"/assets/link-D90cKH_E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6586-fb9WKhVhfd8d9CoIJ7QJ59V1DGQ\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 25990,
		"path": "../public/assets/link-D90cKH_E.js"
	},
	"/assets/loader-circle-yl7k8cfp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8d-jlE4l64p2EkeonHorCc2sRDrIF8\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 141,
		"path": "../public/assets/loader-circle-yl7k8cfp.js"
	},
	"/assets/lock-Bn0zgxvO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cb-AywJSSWUSxtl0+cds2mb6Bv+ioo\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 203,
		"path": "../public/assets/lock-Bn0zgxvO.js"
	},
	"/assets/mail-C_zsa0YP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d2-NXuthSEy07pfW4Af6N1hSIe0K9E\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 210,
		"path": "../public/assets/mail-C_zsa0YP.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-DZg37bdg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185c-Zct4VVmm444kN8InIBIRI8vkGRg\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 6236,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-DZg37bdg.js"
	},
	"/assets/nasil-calisir-Dvr6jhB7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"158a-7dZSXM/cQPpuHpfvzW+mEZ0Ohh0\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 5514,
		"path": "../public/assets/nasil-calisir-Dvr6jhB7.js"
	},
	"/assets/on-bilgilendirme-formu-BJfpK2Fc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1170-938aL45hceK2gi+8sTcYfoCQrXQ\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 4464,
		"path": "../public/assets/on-bilgilendirme-formu-BJfpK2Fc.js"
	},
	"/assets/package-check-xnZmIUry.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a7-3g4QzLauZYPOFSzY3SN0cq2wxsU\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 423,
		"path": "../public/assets/package-check-xnZmIUry.js"
	},
	"/assets/paketler--vgFS6jI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15fe-EQ0r4v8hw+2eIXdzc3nEabCak8M\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 5630,
		"path": "../public/assets/paketler--vgFS6jI.js"
	},
	"/assets/panelim-DmJ_GEhb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"251f-iu0JoP3CGSGyCw3FjFlQNIGsYvg\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 9503,
		"path": "../public/assets/panelim-DmJ_GEhb.js"
	},
	"/assets/parsel-satin-al-B4Jh0XMk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"458-0FOoqw/vwEJpWgyF3CPuOCZynAE\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 1112,
		"path": "../public/assets/parsel-satin-al-B4Jh0XMk.js"
	},
	"/assets/parsel-satin-al-Cdgs3uNv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2ae0-qTDdxag011kVN0yslui7Fmm+l/4\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 10976,
		"path": "../public/assets/parsel-satin-al-Cdgs3uNv.js"
	},
	"/assets/parsellerim-DhlFFa0h.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c07-3UQl9bgJqchuU4LgnOR5t7r9DTk\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 11271,
		"path": "../public/assets/parsellerim-DhlFFa0h.js"
	},
	"/assets/pazar-yeri-Dt_t39w_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63c-cFKeKv8AwNazp29nowkyCeSnGDc\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 1596,
		"path": "../public/assets/pazar-yeri-Dt_t39w_.js"
	},
	"/assets/play-BP3W76HP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb-So6LsYY5Nri8BKI9iE/z1l64eR0\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 187,
		"path": "../public/assets/play-BP3W76HP.js"
	},
	"/assets/phone-DeZ5soYG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13f-SXB6NZJTbSPtj0cOH7fjeIJ39Kc\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 319,
		"path": "../public/assets/phone-DeZ5soYG.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/refresh-cw-YGBv4aYZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"41e-31O1XH8POA9NJRNesmyriXIqKCw\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 1054,
		"path": "../public/assets/refresh-cw-YGBv4aYZ.js"
	},
	"/assets/profilim-BfRhkrcI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bc8-lPnykDpZdgfbfk7utKGvvUJGW5Y\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 3016,
		"path": "../public/assets/profilim-BfRhkrcI.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/routes-Di1aNqtB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2eff-pE72W/GlcFEA44D6jeU99oGt+Bs\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 12031,
		"path": "../public/assets/routes-Di1aNqtB.js"
	},
	"/assets/search-BAFNdzgk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ab-rHaAgtN0rMXN1n1mPJrfJrrk7ZE\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 171,
		"path": "../public/assets/search-BAFNdzgk.js"
	},
	"/assets/sertifika-dogrula-Ch4350Px.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4be-eAzw4WflTMJzRtVGTi5oizPcz1k\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 1214,
		"path": "../public/assets/sertifika-dogrula-Ch4350Px.js"
	},
	"/assets/sertifika-dogrula-DZ70O013.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16e3-av0JVqIUNPCKVkOqM06ZLoBgoA4\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 5859,
		"path": "../public/assets/sertifika-dogrula-DZ70O013.js"
	},
	"/assets/sertifika-talep-DCtOcGI3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2188-/YsAR/EZuSc1DoiPRNTu6ZMaRRE\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 8584,
		"path": "../public/assets/sertifika-talep-DCtOcGI3.js"
	},
	"/assets/sertifikalarim-B778E2eu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28ee-9rmA/VXNCAvjYREWAExf8Vtvfn0\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 10478,
		"path": "../public/assets/sertifikalarim-B778E2eu.js"
	},
	"/assets/sevgiliye-hediye-nxY53BUb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f78-rPV7usA2C8e4zVBYDkiYH3x0pFo\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 3960,
		"path": "../public/assets/sevgiliye-hediye-nxY53BUb.js"
	},
	"/assets/shopping-cart-BUOrPFD6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6c7-vq+a/HLhb53W8RB0ew9gfVSJ3fo\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 1735,
		"path": "../public/assets/shopping-cart-BUOrPFD6.js"
	},
	"/assets/sifre-yenile-6W_WgBcg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1008-PAIBaBiNCiK4D8R/44tBKCEfSJQ\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 4104,
		"path": "../public/assets/sifre-yenile-6W_WgBcg.js"
	},
	"/assets/sifremi-unuttum-BBZiAjgw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18a7-KRt43k5vHvqFAehjXWvqPrU0zlI\"",
		"mtime": "2026-09-17T22:10:10.051Z",
		"size": 6311,
		"path": "../public/assets/sifremi-unuttum-BBZiAjgw.js"
	},
	"/assets/siparislerim-DsPkxLeY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f35-T3a5Dio9pd03aCKJcFpzN7h4BmU\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 3893,
		"path": "../public/assets/siparislerim-DsPkxLeY.js"
	},
	"/assets/smartphone-DZkRcLdo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c2-O8ux6fKIi8vXGanz/EvjqSy4xpI\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 194,
		"path": "../public/assets/smartphone-DZkRcLdo.js"
	},
	"/assets/sparkles-DURQUbPG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1eb-pkUEwDsG8NO4841TzwvocajEDVw\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 491,
		"path": "../public/assets/sparkles-DURQUbPG.js"
	},
	"/assets/star-gwKiS9s6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d5-TW1p6KlxMk5T9hRNAZL8OorK0e8\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 469,
		"path": "../public/assets/star-gwKiS9s6.js"
	},
	"/assets/supabaseBrowser-H823nToQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"33c14-9kfyP/QOROqvRRBOMcr4eFUAgqs\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 211988,
		"path": "../public/assets/supabaseBrowser-H823nToQ.js"
	},
	"/assets/trash-2-B5YpAglG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"145-WgJSyNICV8y/cKnrDrrNN+PYYJA\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 325,
		"path": "../public/assets/trash-2-B5YpAglG.js"
	},
	"/assets/turkiye-haritasi-Ddja9SRt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f2d-a220b0kdrsf96MAeJXXstckOQ0g\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 3885,
		"path": "../public/assets/turkiye-haritasi-Ddja9SRt.js"
	},
	"/assets/useAuth-U48ZwGqt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19ec-dS9YNYIaFvs/ZYdcLqmEPKb0v1w\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 6636,
		"path": "../public/assets/useAuth-U48ZwGqt.js"
	},
	"/assets/three.module-C5rh5wLt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b0d0c-yxZrAk456uilGR/GXmPe2vD3V3k\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 724236,
		"path": "../public/assets/three.module-C5rh5wLt.js"
	},
	"/assets/useRouter-VMLxvdJG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"236-9wTGogEQs6FVqKrigBHqv3aErX8\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 566,
		"path": "../public/assets/useRouter-VMLxvdJG.js"
	},
	"/assets/user-CqRV6n5O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c1-zwQo/E0+NEuABeRPtnoAdLX27DY\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 193,
		"path": "../public/assets/user-CqRV6n5O.js"
	},
	"/assets/uyelik-sozlesmesi-DowjTLTe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a4-lIruQlXJg2FaICQS4wMZLcHufEU\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 9636,
		"path": "../public/assets/uyelik-sozlesmesi-DowjTLTe.js"
	},
	"/assets/user-round-GjDIOvrv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3-SYYbMG3cA06Qi3Ak04caCRiBrBo\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 179,
		"path": "../public/assets/user-round-GjDIOvrv.js"
	},
	"/assets/yonetim-DuYy81Rs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c86-5H0YwH/6cG7y5Xj034vSx6QFXP4\"",
		"mtime": "2026-09-17T22:10:10.052Z",
		"size": 35974,
		"path": "../public/assets/yonetim-DuYy81Rs.js"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c4-cuFwIStF+1ItvnpBQQU9Kt9iZVs\"",
		"mtime": "2026-09-17T22:10:11.646Z",
		"size": 8388,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c8-aE0wi3G5UwBm20hIOogcLwFw76I\"",
		"mtime": "2026-09-17T22:10:11.645Z",
		"size": 8392,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-17T22:10:11.646Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-17T22:10:11.646Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20b9-i2nAOC3dv8uH13uIuFse9o5qOkg\"",
		"mtime": "2026-09-17T22:10:11.646Z",
		"size": 8377,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-17T22:10:11.646Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-17T22:09:37.897Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-17T22:10:11.646Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-17T22:10:11.647Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-17T22:10:11.647Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-17T22:10:11.647Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-17T22:10:11.647Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-17T22:10:11.647Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-17T22:10:11.647Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-17T22:10:11.647Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-17T22:10:11.648Z",
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
