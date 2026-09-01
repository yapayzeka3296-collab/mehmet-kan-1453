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
		"mtime": "2026-09-01T10:02:12.967Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"65e-MHb8tyQvnZqF3VBcapfMngMf+Qc\"",
		"mtime": "2026-09-01T10:02:12.967Z",
		"size": 1630,
		"path": "../public/login-background.css"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-01T10:02:12.967Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-01T10:02:12.967Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"10a5-l/Rzf76Qzw33OET02kw0xh9JB88\"",
		"mtime": "2026-09-01T10:02:12.965Z",
		"size": 4261,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-01T10:02:12.965Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"10db-9NJPfaYHJH0IPwfwnfBcCRfUeeg\"",
		"mtime": "2026-09-01T10:02:12.965Z",
		"size": 4315,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-01T10:02:12.965Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"11e6-FxMTKbkrT8TG+MSgLjIAZCgOgyo\"",
		"mtime": "2026-09-01T10:02:12.965Z",
		"size": 4582,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-01T10:02:12.965Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/assets/CertificateTemplatePreview-qBZKeaV6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1140-pSYsRA6xHbz3WfdozCMcPniFwmM\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 4416,
		"path": "../public/assets/CertificateTemplatePreview-qBZKeaV6.js"
	},
	"/assets/CityParcelLivePage-D3UZp-pN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3674-mWH+lwW0sRD1NuoS/opUL57zOF0\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 13940,
		"path": "../public/assets/CityParcelLivePage-D3UZp-pN.js"
	},
	"/assets/SiteFooter-BeZeCtB6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1022-ycW2dpPLOL5IQfYi83RfQVMI9Yw\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 4130,
		"path": "../public/assets/SiteFooter-BeZeCtB6.js"
	},
	"/assets/TrustBar-TWWgWoui.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"750-ieaNo3O/O5GcQj+a+LDsTHdAvFs\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 1872,
		"path": "../public/assets/TrustBar-TWWgWoui.js"
	},
	"/assets/SiteHeader-DeYChfam.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3013-MEUc2Z0fsJ0dKZ3IdiLzuDiMkLc\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 12307,
		"path": "../public/assets/SiteHeader-DeYChfam.js"
	},
	"/assets/UserSidebar-CXQaSpNh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b23-ZYkz74PlP3hTAfycSvQaBHAPqCw\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 2851,
		"path": "../public/assets/UserSidebar-CXQaSpNh.js"
	},
	"/assets/_slug-BV0aQWq8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2114-+wgLjyG1DJcZYFVNQYarPilFqy4\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 8468,
		"path": "../public/assets/_slug-BV0aQWq8.js"
	},
	"/assets/_slug-Pmwrqgvt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"272-GcrTbX78jGokBlhFWJtNOhm59H4\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 626,
		"path": "../public/assets/_slug-Pmwrqgvt.js"
	},
	"/assets/Logo-DwFimv2N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1aa-8C7SgmbWQgXf/l2tyDT7dakCxhI\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 426,
		"path": "../public/assets/Logo-DwFimv2N.js"
	},
	"/assets/ana-sayfa-CPILS7V4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24f9-hTt/8XOh2XPEHcNfZhCoKyPqMEA\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 9465,
		"path": "../public/assets/ana-sayfa-CPILS7V4.js"
	},
	"/assets/arrow-right-DkPvHfMW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"96-u1sjQPECLW/8yHberP4Qed8CRuY\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 150,
		"path": "../public/assets/arrow-right-DkPvHfMW.js"
	},
	"/assets/arrow-left-DWs8reEk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"96-eypTUqVmrtvMvJP73015LLNGJns\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 150,
		"path": "../public/assets/arrow-left-DWs8reEk.js"
	},
	"/assets/award-DGrmdhOE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"103-Knu3w5XFIcX9LCAA4fSTrObmF9s\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 259,
		"path": "../public/assets/award-DGrmdhOE.js"
	},
	"/assets/bildirimler-DJTBjvuV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a31-gfEs8I/a3DphAGxTyj7jjujR3XE\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 2609,
		"path": "../public/assets/bildirimler-DJTBjvuV.js"
	},
	"/assets/MySkyParcelEarthGlobe-A_CsdYlO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"81903-+ElFou2S5liyu2idOaXRUBgaf5o\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 530691,
		"path": "../public/assets/MySkyParcelEarthGlobe-A_CsdYlO.js"
	},
	"/assets/boxes-DP4AA1mx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"344-4CeiGq0GjZ39NhK5iURK1wKTfV0\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 836,
		"path": "../public/assets/boxes-DP4AA1mx.js"
	},
	"/assets/cerez-politikasi-BYxjfgBf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e00-j9oP+7mN+09+MhkaVfMFgWVkBYQ\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 3584,
		"path": "../public/assets/cerez-politikasi-BYxjfgBf.js"
	},
	"/assets/certificateTemplates-BvldCKP0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a4-3UdOQLtEzE6LgJM4CiH4gqbGppY\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 25764,
		"path": "../public/assets/certificateTemplates-BvldCKP0.js"
	},
	"/assets/check-00lAq1zs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6d-v82OCwYezQhAF/VzVqee4nci/no\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 109,
		"path": "../public/assets/check-00lAq1zs.js"
	},
	"/assets/circle-check-Cy1nRfOp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a3-oNznFIdDt66GEhU6iRGjKzGu2Rw\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 163,
		"path": "../public/assets/circle-check-Cy1nRfOp.js"
	},
	"/assets/circle-x-_4dcCzyn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-jPSuqWCZkcv0gWajqNEtGsttMKA\"",
		"mtime": "2026-09-01T10:02:11.470Z",
		"size": 192,
		"path": "../public/assets/circle-x-_4dcCzyn.js"
	},
	"/assets/dogrula-CJ9DYYGn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16aa-FNPA/38i+QvmTOMa4+WkkKrR5TQ\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 5802,
		"path": "../public/assets/dogrula-CJ9DYYGn.js"
	},
	"/assets/eye-kyXh2nCG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f1-6VsM/6BteN2+xvXl1FHgMlBolek\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 241,
		"path": "../public/assets/eye-kyXh2nCG.js"
	},
	"/assets/file-badge-Ct29h-j4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ba-yLHbAUMir0mAOvwo8fHEniFsJZo\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 442,
		"path": "../public/assets/file-badge-Ct29h-j4.js"
	},
	"/assets/gift-CyDlDjlX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14e-wvq8sJB2yiFfX7w/9dS1RWCa3Qg\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 334,
		"path": "../public/assets/gift-CyDlDjlX.js"
	},
	"/assets/giris-DhjBMzfl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b9f-mbt4EWQ8RcOmLbOAZCK0VRPWyhg\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 11167,
		"path": "../public/assets/giris-DhjBMzfl.js"
	},
	"/assets/gizlilik-politikasi-CFRzQ7UD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94c-6f+qzYrmHK+HSqbNtltg++lDJKc\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 2380,
		"path": "../public/assets/gizlilik-politikasi-CFRzQ7UD.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-haritasi-BqsM7F2_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9e9-iyUg4aLCmWIAJM+D1nT1pxyA5Fo\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 2537,
		"path": "../public/assets/gokyuzu-haritasi-BqsM7F2_.js"
	},
	"/assets/guvenlik-ayarlari-FoJEJiIi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23bb-uFgjk9B5F9nt5R6jIOCeC3uO0/I\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 9147,
		"path": "../public/assets/guvenlik-ayarlari-FoJEJiIi.js"
	},
	"/assets/hakkimizda-DKtNofCB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ee8-UFdty7LeboYJTayjBujYJrWIoEE\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 7912,
		"path": "../public/assets/hakkimizda-DKtNofCB.js"
	},
	"/assets/heart-C4CcLg80.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f3-Je1UCZ83RurDEAqO99OIjarrJAM\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 243,
		"path": "../public/assets/heart-C4CcLg80.js"
	},
	"/assets/hediye-kabul-_xUmD3Sn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1800-5sTvC3Y4nFrZ1PVbbXX1EO2/0Yc\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 6144,
		"path": "../public/assets/hediye-kabul-_xUmD3Sn.js"
	},
	"/assets/hediyelerim-CoO00nsU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2135-JXs4AsoObt9Mo6jAuY5RWUqxvLg\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 8501,
		"path": "../public/assets/hediyelerim-CoO00nsU.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-01T10:02:11.473Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/iade-iptal-politikasi-Di5tviQS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"118a-/LaRvdKKibNAzEFSYdVDZb50XmM\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 4490,
		"path": "../public/assets/iade-iptal-politikasi-Di5tviQS.js"
	},
	"/assets/iletisim-CHxtKwcW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14b7-n8vgDQGtnoULofSlDs4mYohZoAE\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 5303,
		"path": "../public/assets/iletisim-CHxtKwcW.js"
	},
	"/assets/index-7JpM49b2.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"3e-+yJO7CIbQLllSLHlpirZzTEJOfc\"",
		"mtime": "2026-09-01T10:02:11.473Z",
		"size": 62,
		"path": "../public/assets/index-7JpM49b2.css"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/index-XAyLLHmF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4f992-xXxwnmQ+rYH/wAhNJpRAb/+POck\"",
		"mtime": "2026-09-01T10:02:11.469Z",
		"size": 326034,
		"path": "../public/assets/index-XAyLLHmF.js"
	},
	"/assets/jsx-runtime-DE3RlOCf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1edb-++aNIhyKgQeSqFVy8og9djQ1xvw\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 7899,
		"path": "../public/assets/jsx-runtime-DE3RlOCf.js"
	},
	"/assets/kayit-ol-B5tSMmUe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d55-uTxZbYuk5v/Dap8HHsd40GDqYAo\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 7509,
		"path": "../public/assets/kayit-ol-B5tSMmUe.js"
	},
	"/assets/kullanim-sartlari-B4Ya6hA0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb5-1ncH4yEudYZFD36QCq7U8Xzsf4o\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 2997,
		"path": "../public/assets/kullanim-sartlari-B4Ya6hA0.js"
	},
	"/assets/kvkk-B8KwPduq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190e-g+F1ELigmAwYDeIb7LGTAuCcx9Q\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 6414,
		"path": "../public/assets/kvkk-B8KwPduq.js"
	},
	"/assets/layers-Biz-lGsN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"196-1tTtJzo4myp0NnaqCxCgnSj7Dos\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 406,
		"path": "../public/assets/layers-Biz-lGsN.js"
	},
	"/assets/lazyRouteComponent-DnRELX_S.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"135f-A1YoXmec0GFlPnoDbC1TWgiK+lY\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 4959,
		"path": "../public/assets/lazyRouteComponent-DnRELX_S.js"
	},
	"/assets/link-D90cKH_E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6586-fb9WKhVhfd8d9CoIJ7QJ59V1DGQ\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 25990,
		"path": "../public/assets/link-D90cKH_E.js"
	},
	"/assets/loader-circle-BxSgGKPt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"81-3TekXF/6elY5F6xX7S26QkPqeUc\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 129,
		"path": "../public/assets/loader-circle-BxSgGKPt.js"
	},
	"/assets/lock-C41urahQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bf-42PTmPX5N1VoOcc1PXyF2tgbXYY\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 191,
		"path": "../public/assets/lock-C41urahQ.js"
	},
	"/assets/map-pin-Cqt_e9on.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f4-vrYA7xEpj0Z7MdRFgFgqmUqbME0\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 244,
		"path": "../public/assets/map-pin-Cqt_e9on.js"
	},
	"/assets/mail-0JlEdQAB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c6-5+H8vW7y3ULRMuyouZwVnUUnVSM\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 198,
		"path": "../public/assets/mail-0JlEdQAB.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-olbsSh6v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185c-RE/IdK7KQo3THFjRdJjve84ujn8\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 6236,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-olbsSh6v.js"
	},
	"/assets/nasil-calisir-D0ozrbjV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"157e-GJf/gb5k109bcODrgouoxSOAuOA\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 5502,
		"path": "../public/assets/nasil-calisir-D0ozrbjV.js"
	},
	"/assets/odeme-CVERwBI1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3e3-UaNaxg4o5RJFgDEXOh8ueNzqpbs\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 995,
		"path": "../public/assets/odeme-CVERwBI1.js"
	},
	"/assets/odeme-BrnCm77r.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22bd-3uoRCJlVvYx1S0IcuF9Ldu3V454\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 8893,
		"path": "../public/assets/odeme-BrnCm77r.js"
	},
	"/assets/on-bilgilendirme-formu-B80Mc5tc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1170-XEdC0NW72MN6Xap73COqepIbKaU\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 4464,
		"path": "../public/assets/on-bilgilendirme-formu-B80Mc5tc.js"
	},
	"/assets/package-check-DzdXMIKE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19b-8B7USNfNK9K35KD4JeYtsoUrscA\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 411,
		"path": "../public/assets/package-check-DzdXMIKE.js"
	},
	"/assets/paketler-tnzz20Ne.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14cd-VoHxALEVxnV+79SFRwVXpzVGRjA\"",
		"mtime": "2026-09-01T10:02:11.471Z",
		"size": 5325,
		"path": "../public/assets/paketler-tnzz20Ne.js"
	},
	"/assets/panelim-8RgQxa9H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24ea-MV/A3bqYmCoka+qHBhGNY+Qd5nU\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 9450,
		"path": "../public/assets/panelim-8RgQxa9H.js"
	},
	"/assets/parsel-satin-al-DIznkBJQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ed-1qkKjGE2/HXai7zLlOC1jFE/myg\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 1261,
		"path": "../public/assets/parsel-satin-al-DIznkBJQ.js"
	},
	"/assets/parsel-satin-al-BgyE7xr5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"258b-7r3fbBtfS0p7nyFKcqmRJgTFHgE\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 9611,
		"path": "../public/assets/parsel-satin-al-BgyE7xr5.js"
	},
	"/assets/parsellerim-DCqjdo4P.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6723-LrV/aYK3cEJ250YOM6bK0q9ki2I\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 26403,
		"path": "../public/assets/parsellerim-DCqjdo4P.js"
	},
	"/assets/pazar-yeri-RkcZgeyP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63c-e/i4CtaQPXF6TmyfGMQ6C1odPzg\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 1596,
		"path": "../public/assets/pazar-yeri-RkcZgeyP.js"
	},
	"/assets/phone-CXSxdpW4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"133-tlxs+oSvrQb42TthsTkSlTH0tKY\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 307,
		"path": "../public/assets/phone-CXSxdpW4.js"
	},
	"/assets/refresh-cw-BMYaAggc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"412-LzN4cRMQgp6kaOQQfv+4pS/3+vk\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 1042,
		"path": "../public/assets/refresh-cw-BMYaAggc.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/profilim-ftwAKQVY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b98-OHtS4EHsgHOOQIw/wer+ssjf6n8\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 2968,
		"path": "../public/assets/profilim-ftwAKQVY.js"
	},
	"/assets/routes-DosEqIjE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9e9-uGzsAqczlawGhhzF/rjPezylL+c\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 2537,
		"path": "../public/assets/routes-DosEqIjE.js"
	},
	"/assets/sertifika-talep-CKyQ3Gnk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"215d-1e+bDe9Qi1RzExW95YbFSAseIfo\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 8541,
		"path": "../public/assets/sertifika-talep-CKyQ3Gnk.js"
	},
	"/assets/sertifika-dogrula-D6EhTTMe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16cf-jarEWcEBKI34MCgTcimm3EC7yDc\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 5839,
		"path": "../public/assets/sertifika-dogrula-D6EhTTMe.js"
	},
	"/assets/search-DLltCVYE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9f-TsihnKyH2eQ/IbDAINWeVRiwBbQ\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 159,
		"path": "../public/assets/search-DLltCVYE.js"
	},
	"/assets/sertifika-dogrula-CwMmvnEU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"48a-kXrFP8Yr6U5jbaazrKpuljNUaT4\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 1162,
		"path": "../public/assets/sertifika-dogrula-CwMmvnEU.js"
	},
	"/assets/sertifikalarim-cw1ovZs_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2688-KG44R0i7KwaB0WFIamLE9QinUK0\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 9864,
		"path": "../public/assets/sertifikalarim-cw1ovZs_.js"
	},
	"/assets/sifremi-unuttum-CoIE8-kS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"188e-3Pw+Tt0YlrdfWTfVkxlaGtXfTPk\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 6286,
		"path": "../public/assets/sifremi-unuttum-CoIE8-kS.js"
	},
	"/assets/sifre-yenile-C3r_65Dq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fd1-EaJrxl4ywpr9vGYQmJSZsR8EP/I\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 4049,
		"path": "../public/assets/sifre-yenile-C3r_65Dq.js"
	},
	"/assets/siparislerim-DS04Rosn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"efe-i9leDkMTYwlb9SHwlIJrMH6FxwQ\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 3838,
		"path": "../public/assets/siparislerim-DS04Rosn.js"
	},
	"/assets/smartphone-UxzcEjmZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b6-998RHK71g2C5BxTmwBNDDlFYNRo\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 182,
		"path": "../public/assets/smartphone-UxzcEjmZ.js"
	},
	"/assets/sparkles-DxsTQQBM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1df-iNQkADOLy2lkxEALDn6y6O5jjHo\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 479,
		"path": "../public/assets/sparkles-DxsTQQBM.js"
	},
	"/assets/star-BovTK9xm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c9-CPBYUvxiGQUoW0xafBYfqJcug08\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 457,
		"path": "../public/assets/star-BovTK9xm.js"
	},
	"/assets/styles-CTnebwge.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"2558d-8tl1OPssi5tDNYrt4R1CDLgm4KI\"",
		"mtime": "2026-09-01T10:02:11.473Z",
		"size": 152973,
		"path": "../public/assets/styles-CTnebwge.css"
	},
	"/assets/turkiye-haritasi-Bv5I8SQE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f0a-G2IIiRkDIPMlQ8Wl+KxWDMVngGI\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 3850,
		"path": "../public/assets/turkiye-haritasi-Bv5I8SQE.js"
	},
	"/assets/useRouter-VMLxvdJG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"236-9wTGogEQs6FVqKrigBHqv3aErX8\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 566,
		"path": "../public/assets/useRouter-VMLxvdJG.js"
	},
	"/assets/user-DzpdyRcC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b5-q6rZhIptO6ephYbot7KuUZlLfSA\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 181,
		"path": "../public/assets/user-DzpdyRcC.js"
	},
	"/assets/useAuth-DvbsXF6a.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34ed0-i8/YhMn+AzImMoNbAHzVDSV4oFc\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 216784,
		"path": "../public/assets/useAuth-DvbsXF6a.js"
	},
	"/assets/uyelik-sozlesmesi-CrTEnsjY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a4-9flZO/gP3ASgrevKnofKuKRr3Do\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 9636,
		"path": "../public/assets/uyelik-sozlesmesi-CrTEnsjY.js"
	},
	"/assets/x-Q6MQbkq7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63d-/9kKqTheXV9n/gxnYGp+IszZTho\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 1597,
		"path": "../public/assets/x-Q6MQbkq7.js"
	},
	"/assets/yonetim-Bz7Nr0L5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7e0e-NOb4Z5QR4EEZaa1xg/l9KbyhzsI\"",
		"mtime": "2026-09-01T10:02:11.472Z",
		"size": 32270,
		"path": "../public/assets/yonetim-Bz7Nr0L5.js"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-01T10:01:47.837Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-01T10:02:12.966Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-01T10:02:12.966Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-01T10:02:12.966Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-01T10:02:12.967Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-01T10:02:12.967Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-01T10:02:12.967Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-01T10:02:12.966Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-01T10:02:12.967Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-01T10:02:12.967Z",
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
