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
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-09-02T19:51:51.476Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"65e-MHb8tyQvnZqF3VBcapfMngMf+Qc\"",
		"mtime": "2026-09-02T19:51:51.476Z",
		"size": 1630,
		"path": "../public/login-background.css"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-02T19:51:51.479Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-02T19:51:51.479Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"cd-FaeMXcnpfSW7Q5Y1D4GWmlv/CWs\"",
		"mtime": "2026-09-02T19:51:51.480Z",
		"size": 205,
		"path": "../public/assets/.htaccess"
	},
	"/assets/CertificateTemplatePreview-D0POOyDq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113e-II1cBWk9yJJMZqUGURgkewJyixs\"",
		"mtime": "2026-09-02T19:51:50.416Z",
		"size": 4414,
		"path": "../public/assets/CertificateTemplatePreview-D0POOyDq.js"
	},
	"/assets/CityParcelLivePage-GXW8NyTA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"39bc-So8rkBA1XhdmcOgJBMlqxUJyhJU\"",
		"mtime": "2026-09-02T19:51:50.416Z",
		"size": 14780,
		"path": "../public/assets/CityParcelLivePage-GXW8NyTA.js"
	},
	"/assets/Logo-DwFimv2N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1aa-8C7SgmbWQgXf/l2tyDT7dakCxhI\"",
		"mtime": "2026-09-02T19:51:50.416Z",
		"size": 426,
		"path": "../public/assets/Logo-DwFimv2N.js"
	},
	"/assets/ParcelDetailPanel-SyYRiseF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b9b-448huXLEQVjpH9Ss8jWnVWsAgQ4\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 19355,
		"path": "../public/assets/ParcelDetailPanel-SyYRiseF.js"
	},
	"/assets/SiteFooter-BeZeCtB6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1022-ycW2dpPLOL5IQfYi83RfQVMI9Yw\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 4130,
		"path": "../public/assets/SiteFooter-BeZeCtB6.js"
	},
	"/assets/SiteHeader-jjcvi5I8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32f6-Q4CLClCYN7xPpy3fo+1ZydsGRrU\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 13046,
		"path": "../public/assets/SiteHeader-jjcvi5I8.js"
	},
	"/assets/TrustBar-TWWgWoui.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"750-ieaNo3O/O5GcQj+a+LDsTHdAvFs\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 1872,
		"path": "../public/assets/TrustBar-TWWgWoui.js"
	},
	"/assets/UserSidebar-C6n8E_7B.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3e-FxNSFed+Lg3t7c4G+Pj1egGfS5M\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 2878,
		"path": "../public/assets/UserSidebar-C6n8E_7B.js"
	},
	"/assets/_slug-BTY2Q29M.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2112-hiWRdujq87GVctdSfsgj0nbM8FE\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 8466,
		"path": "../public/assets/_slug-BTY2Q29M.js"
	},
	"/assets/_slug-DwrAJQ0I.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"272-S4N5I4+WKQ/cagYf4+sXit7rAu8\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 626,
		"path": "../public/assets/_slug-DwrAJQ0I.js"
	},
	"/assets/ana-sayfa-C-wZPX6w.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"249c-0XHvRjg7IC/XgdHYdaRtMATywvY\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 9372,
		"path": "../public/assets/ana-sayfa-C-wZPX6w.js"
	},
	"/assets/arrow-left-DWs8reEk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"96-eypTUqVmrtvMvJP73015LLNGJns\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 150,
		"path": "../public/assets/arrow-left-DWs8reEk.js"
	},
	"/assets/arrow-right-DkPvHfMW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"96-u1sjQPECLW/8yHberP4Qed8CRuY\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 150,
		"path": "../public/assets/arrow-right-DkPvHfMW.js"
	},
	"/assets/award-DGrmdhOE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"103-Knu3w5XFIcX9LCAA4fSTrObmF9s\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 259,
		"path": "../public/assets/award-DGrmdhOE.js"
	},
	"/assets/bildirimler-D0N19zif.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a31-8bCL0nS5as2sZNTT/Wb8VY/S6wI\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 2609,
		"path": "../public/assets/bildirimler-D0N19zif.js"
	},
	"/assets/boxes-DP4AA1mx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"344-4CeiGq0GjZ39NhK5iURK1wKTfV0\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 836,
		"path": "../public/assets/boxes-DP4AA1mx.js"
	},
	"/assets/cerez-politikasi-CYvqBmqq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e00-JI+jakUL8/wQhZBsC0TSFEJcGLM\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 3584,
		"path": "../public/assets/cerez-politikasi-CYvqBmqq.js"
	},
	"/assets/certificateTemplates-BRIWk3kA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a2-f0EpRV3zmSolYtn1J/VS00AwWmE\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 25762,
		"path": "../public/assets/certificateTemplates-BRIWk3kA.js"
	},
	"/assets/check-00lAq1zs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6d-v82OCwYezQhAF/VzVqee4nci/no\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 109,
		"path": "../public/assets/check-00lAq1zs.js"
	},
	"/assets/MySkyParcelEarthGlobe-BchiE1J6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"819af-9XEYFl8z4j6eUoLdNVp4Zsk92wI\"",
		"mtime": "2026-09-02T19:51:50.416Z",
		"size": 530863,
		"path": "../public/assets/MySkyParcelEarthGlobe-BchiE1J6.js"
	},
	"/assets/circle-check-Cy1nRfOp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a3-oNznFIdDt66GEhU6iRGjKzGu2Rw\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 163,
		"path": "../public/assets/circle-check-Cy1nRfOp.js"
	},
	"/assets/circle-x-_4dcCzyn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-jPSuqWCZkcv0gWajqNEtGsttMKA\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 192,
		"path": "../public/assets/circle-x-_4dcCzyn.js"
	},
	"/assets/dogrula-CFOEn5Lg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16aa-kCJBNWB85t8YNKVLbN0sUj7Jbyo\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 5802,
		"path": "../public/assets/dogrula-CFOEn5Lg.js"
	},
	"/assets/eye-kyXh2nCG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f1-6VsM/6BteN2+xvXl1FHgMlBolek\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 241,
		"path": "../public/assets/eye-kyXh2nCG.js"
	},
	"/assets/file-badge-Ct29h-j4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ba-yLHbAUMir0mAOvwo8fHEniFsJZo\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 442,
		"path": "../public/assets/file-badge-Ct29h-j4.js"
	},
	"/assets/gift-CyDlDjlX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14e-wvq8sJB2yiFfX7w/9dS1RWCa3Qg\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 334,
		"path": "../public/assets/gift-CyDlDjlX.js"
	},
	"/assets/giris-DWVVV79t.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b9f-qw3+B1+ZKFijeVZsBHy6MV3JYAU\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 11167,
		"path": "../public/assets/giris-DWVVV79t.js"
	},
	"/assets/gizlilik-politikasi-Db7gfx4G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94c-dy8XvpZCMJNYaLj25LF+1LcesS8\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 2380,
		"path": "../public/assets/gizlilik-politikasi-Db7gfx4G.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-haritasi-B85UuJK-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9e9-4hm9DHr6MmsyPg3UsLZCSaRFoNo\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 2537,
		"path": "../public/assets/gokyuzu-haritasi-B85UuJK-.js"
	},
	"/assets/guvenlik-ayarlari-Ujaxx1lg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23bb-BcG5iMQ1ztrrT7HVafMGDs3+Zfs\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 9147,
		"path": "../public/assets/guvenlik-ayarlari-Ujaxx1lg.js"
	},
	"/assets/hakkimizda-DzsbMQI1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ee8-0/XuCO4MqkZsecTpSylNOqzGYrM\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 7912,
		"path": "../public/assets/hakkimizda-DzsbMQI1.js"
	},
	"/assets/heart-C4CcLg80.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f3-Je1UCZ83RurDEAqO99OIjarrJAM\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 243,
		"path": "../public/assets/heart-C4CcLg80.js"
	},
	"/assets/hediye-kabul-DX3X0ZwX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1800-IvJSYnNVl+uHem7wHqitDqU5kVs\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 6144,
		"path": "../public/assets/hediye-kabul-DX3X0ZwX.js"
	},
	"/assets/hediyelerim-BvRF2q1Q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2135-cLGym/wsuNKlnPjh7IAo8GJzLhk\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 8501,
		"path": "../public/assets/hediyelerim-BvRF2q1Q.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-02T19:51:50.418Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/iade-iptal-politikasi-UHLN4c_X.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"118a-tATzaySyuIS664vHD6rgGtCxQ/c\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 4490,
		"path": "../public/assets/iade-iptal-politikasi-UHLN4c_X.js"
	},
	"/assets/iletisim-BsfZBkRe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14b7-nYmZLw0VkCyogA0GFxF6E9MKS6w\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 5303,
		"path": "../public/assets/iletisim-BsfZBkRe.js"
	},
	"/assets/index-D9gKK4cm.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"2673e-cg+0bB17E3rdPbSWXZAhqc7sL10\"",
		"mtime": "2026-09-02T19:51:50.418Z",
		"size": 157502,
		"path": "../public/assets/index-D9gKK4cm.css"
	},
	"/assets/jsx-runtime-DE3RlOCf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1edb-++aNIhyKgQeSqFVy8og9djQ1xvw\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 7899,
		"path": "../public/assets/jsx-runtime-DE3RlOCf.js"
	},
	"/assets/kayit-ol-hmUcOZBU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d55-lLtjRI6RVI9B7RHjGGTON1XCKeE\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 7509,
		"path": "../public/assets/kayit-ol-hmUcOZBU.js"
	},
	"/assets/index-CJYtb6Zp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4eba1-Y88QWdiBR2fKXGbOeeMtpWyf0JM\"",
		"mtime": "2026-09-02T19:51:50.415Z",
		"size": 322465,
		"path": "../public/assets/index-CJYtb6Zp.js"
	},
	"/assets/kullanim-sartlari-DRmIxwd5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb5-rm3GXjT8x2RQicb1eR39Rp3q/GM\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 2997,
		"path": "../public/assets/kullanim-sartlari-DRmIxwd5.js"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-02T19:51:50.418Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/kvkk-BOq59GHU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190e-mbbb2FdHkPDJ4zAo+/gVo7XhOEg\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 6414,
		"path": "../public/assets/kvkk-BOq59GHU.js"
	},
	"/assets/layers-Biz-lGsN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"196-1tTtJzo4myp0NnaqCxCgnSj7Dos\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 406,
		"path": "../public/assets/layers-Biz-lGsN.js"
	},
	"/assets/lazyRouteComponent-CM1Q2zZN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1358-8fHsj1iWVY0GpyW90daBDROg87w\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 4952,
		"path": "../public/assets/lazyRouteComponent-CM1Q2zZN.js"
	},
	"/assets/link-D90cKH_E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6586-fb9WKhVhfd8d9CoIJ7QJ59V1DGQ\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 25990,
		"path": "../public/assets/link-D90cKH_E.js"
	},
	"/assets/loader-circle-BxSgGKPt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"81-3TekXF/6elY5F6xX7S26QkPqeUc\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 129,
		"path": "../public/assets/loader-circle-BxSgGKPt.js"
	},
	"/assets/lock-C41urahQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bf-42PTmPX5N1VoOcc1PXyF2tgbXYY\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 191,
		"path": "../public/assets/lock-C41urahQ.js"
	},
	"/assets/mail-0JlEdQAB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c6-5+H8vW7y3ULRMuyouZwVnUUnVSM\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 198,
		"path": "../public/assets/mail-0JlEdQAB.js"
	},
	"/assets/map-pin-Cqt_e9on.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f4-vrYA7xEpj0Z7MdRFgFgqmUqbME0\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 244,
		"path": "../public/assets/map-pin-Cqt_e9on.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-BnqT7hk0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185c-AS4xbwvTk5Rsq+KBfTUnJgy4zpI\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 6236,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-BnqT7hk0.js"
	},
	"/assets/nasil-calisir-DV7SsGKU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"157e-lR/aXVojZ9kiskPotd9bVn5HI9U\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 5502,
		"path": "../public/assets/nasil-calisir-DV7SsGKU.js"
	},
	"/assets/odeme-CxBFfRhe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3e7-36AtwFp5vGH+uuhtNf0XQQjB+BU\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 999,
		"path": "../public/assets/odeme-CxBFfRhe.js"
	},
	"/assets/odeme-D7CpNoZl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20c9-rmageEoG0TjlifE0Z6DwvfBVhgw\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 8393,
		"path": "../public/assets/odeme-D7CpNoZl.js"
	},
	"/assets/odeme-sonuc-B0W9z9es.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36b-EKdKphJdDUmNHgJHiCvoy09hnYw\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 875,
		"path": "../public/assets/odeme-sonuc-B0W9z9es.js"
	},
	"/assets/odeme-sonuc-g2Bw21Em.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b6f-Msu7ggRVGXOZQk18wLSnutrTIB4\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 2927,
		"path": "../public/assets/odeme-sonuc-g2Bw21Em.js"
	},
	"/assets/on-bilgilendirme-formu-CHujUhmk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1170-IFcGFNoXgggHr5Da1GesHOla8/U\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 4464,
		"path": "../public/assets/on-bilgilendirme-formu-CHujUhmk.js"
	},
	"/assets/package-check-DzdXMIKE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19b-8B7USNfNK9K35KD4JeYtsoUrscA\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 411,
		"path": "../public/assets/package-check-DzdXMIKE.js"
	},
	"/assets/paketler-B3Zm6J9V.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14cd-I8pvWE2Xue4FjXF8PIFS4OnyS5M\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 5325,
		"path": "../public/assets/paketler-B3Zm6J9V.js"
	},
	"/assets/panelim-Db-GN4OP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24ea-/u3XhB4nF8ZpFAd3JHTkh1r29n0\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 9450,
		"path": "../public/assets/panelim-Db-GN4OP.js"
	},
	"/assets/parsel-satin-al-B8yewPor.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ed-H3MrPPKbwyYqZfljHMFaP8Qf47w\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 1261,
		"path": "../public/assets/parsel-satin-al-B8yewPor.js"
	},
	"/assets/parsel-satin-al-DGtIaHEx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"258b-d2fEy6NRy9LRb35WaYTfOTexGmg\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 9611,
		"path": "../public/assets/parsel-satin-al-DGtIaHEx.js"
	},
	"/assets/parsellerim-DUOfsa1q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a7c-BRfbqInc/sSYbkBCBHKKNgcBd1s\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 10876,
		"path": "../public/assets/parsellerim-DUOfsa1q.js"
	},
	"/assets/pazar-yeri-CQla7MYU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63c-7F+Mtmm4MCN7oXpoEcu2lKktajw\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 1596,
		"path": "../public/assets/pazar-yeri-CQla7MYU.js"
	},
	"/assets/phone-CXSxdpW4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"133-tlxs+oSvrQb42TthsTkSlTH0tKY\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 307,
		"path": "../public/assets/phone-CXSxdpW4.js"
	},
	"/assets/play-BxE8Lpsq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"af-V66Vbsn74ZQrj17GzQo4LzmnKpk\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 175,
		"path": "../public/assets/play-BxE8Lpsq.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/refresh-cw-BMYaAggc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"412-LzN4cRMQgp6kaOQQfv+4pS/3+vk\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 1042,
		"path": "../public/assets/refresh-cw-BMYaAggc.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/routes-CdQQKoK8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa6-TMZs5vAjmLqMAEOxBk6oSoYX13k\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 2726,
		"path": "../public/assets/routes-CdQQKoK8.js"
	},
	"/assets/search-DLltCVYE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9f-TsihnKyH2eQ/IbDAINWeVRiwBbQ\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 159,
		"path": "../public/assets/search-DLltCVYE.js"
	},
	"/assets/profilim-CumrexUY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b98-gDgFRqUvDxUWzjc1R0QTct9fFZs\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 2968,
		"path": "../public/assets/profilim-CumrexUY.js"
	},
	"/assets/sertifika-dogrula-Bn_jBqIt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"48a-TOAQG7hxDeDhcUrJ3+eiawL/pJo\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 1162,
		"path": "../public/assets/sertifika-dogrula-Bn_jBqIt.js"
	},
	"/assets/sertifika-dogrula-Dbb4m39v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16cf-cpS3vwMrvDmSXsEnhEIJvdAX7Vc\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 5839,
		"path": "../public/assets/sertifika-dogrula-Dbb4m39v.js"
	},
	"/assets/sertifika-talep-D_a6jd0t.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"215d-CqreWpBcchQRKGgaWxeG6KerXU8\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 8541,
		"path": "../public/assets/sertifika-talep-D_a6jd0t.js"
	},
	"/assets/sifre-yenile-CqEFpjXh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fd1-H/hPq9oHUHUi1HAm3kzDN3bLP2A\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 4049,
		"path": "../public/assets/sifre-yenile-CqEFpjXh.js"
	},
	"/assets/sertifikalarim-giR8W85w.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28b2-2lBVV5UFSKQNVLaEz/MtyOiBUiQ\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 10418,
		"path": "../public/assets/sertifikalarim-giR8W85w.js"
	},
	"/assets/sifremi-unuttum-DWsZyi2b.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"188e-ve/6cGJbYyqEBLQaSbYN9iCvBeg\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 6286,
		"path": "../public/assets/sifremi-unuttum-DWsZyi2b.js"
	},
	"/assets/siparislerim-Cwp5UHVG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"efe-H15eWywtMKchwmveXyiIn/A14Pk\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 3838,
		"path": "../public/assets/siparislerim-Cwp5UHVG.js"
	},
	"/assets/smartphone-UxzcEjmZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b6-998RHK71g2C5BxTmwBNDDlFYNRo\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 182,
		"path": "../public/assets/smartphone-UxzcEjmZ.js"
	},
	"/assets/sparkles-DxsTQQBM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1df-iNQkADOLy2lkxEALDn6y6O5jjHo\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 479,
		"path": "../public/assets/sparkles-DxsTQQBM.js"
	},
	"/assets/star-BovTK9xm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c9-CPBYUvxiGQUoW0xafBYfqJcug08\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 457,
		"path": "../public/assets/star-BovTK9xm.js"
	},
	"/assets/turkiye-haritasi-DYRDjkOE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f08-TEB9zC+QIRsBQ1HlCQ141TKNhBM\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 3848,
		"path": "../public/assets/turkiye-haritasi-DYRDjkOE.js"
	},
	"/assets/useRouter-VMLxvdJG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"236-9wTGogEQs6FVqKrigBHqv3aErX8\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 566,
		"path": "../public/assets/useRouter-VMLxvdJG.js"
	},
	"/assets/user-DzpdyRcC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b5-q6rZhIptO6ephYbot7KuUZlLfSA\"",
		"mtime": "2026-09-02T19:51:50.418Z",
		"size": 181,
		"path": "../public/assets/user-DzpdyRcC.js"
	},
	"/assets/uyelik-sozlesmesi-u0ApXcv-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a4-7QLYHpow+RLC8s00F14iv968XJE\"",
		"mtime": "2026-09-02T19:51:50.418Z",
		"size": 9636,
		"path": "../public/assets/uyelik-sozlesmesi-u0ApXcv-.js"
	},
	"/assets/useAuth-BRV1yRSV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"350a7-bZ/4iCkkuVDHUdMBRzpoCBSiPe8\"",
		"mtime": "2026-09-02T19:51:50.417Z",
		"size": 217255,
		"path": "../public/assets/useAuth-BRV1yRSV.js"
	},
	"/assets/x-Q6MQbkq7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63d-/9kKqTheXV9n/gxnYGp+IszZTho\"",
		"mtime": "2026-09-02T19:51:50.418Z",
		"size": 1597,
		"path": "../public/assets/x-Q6MQbkq7.js"
	},
	"/assets/yonetim-DzAAYVp-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7e0c-1k7hX/ELp1flb62Y2c66zVn+BNs\"",
		"mtime": "2026-09-02T19:51:50.418Z",
		"size": 32268,
		"path": "../public/assets/yonetim-DzAAYVp-.js"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-02T19:51:33.806Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c8-aE0wi3G5UwBm20hIOogcLwFw76I\"",
		"mtime": "2026-09-02T19:51:51.372Z",
		"size": 8392,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-02T19:51:51.372Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c4-cuFwIStF+1ItvnpBQQU9Kt9iZVs\"",
		"mtime": "2026-09-02T19:51:51.373Z",
		"size": 8388,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20b9-i2nAOC3dv8uH13uIuFse9o5qOkg\"",
		"mtime": "2026-09-02T19:51:51.373Z",
		"size": 8377,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-02T19:51:51.373Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-02T19:51:51.373Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-02T19:51:51.373Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-02T19:51:51.373Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-02T19:51:51.373Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-02T19:51:51.373Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-02T19:51:51.373Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-02T19:51:51.373Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-02T19:51:51.396Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-02T19:51:51.373Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-02T19:51:51.476Z",
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
