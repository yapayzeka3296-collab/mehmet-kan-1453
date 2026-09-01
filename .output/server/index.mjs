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
		"mtime": "2026-09-01T15:10:50.382Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"65e-MHb8tyQvnZqF3VBcapfMngMf+Qc\"",
		"mtime": "2026-09-01T15:10:50.382Z",
		"size": 1630,
		"path": "../public/login-background.css"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-01T15:10:50.382Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-01T15:10:50.382Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"10a5-l/Rzf76Qzw33OET02kw0xh9JB88\"",
		"mtime": "2026-09-01T15:10:50.380Z",
		"size": 4261,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-01T15:10:50.381Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"10db-9NJPfaYHJH0IPwfwnfBcCRfUeeg\"",
		"mtime": "2026-09-01T15:10:50.381Z",
		"size": 4315,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-01T15:10:50.381Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"11e6-FxMTKbkrT8TG+MSgLjIAZCgOgyo\"",
		"mtime": "2026-09-01T15:10:50.381Z",
		"size": 4582,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-01T15:10:50.381Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-01T15:10:33.304Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/assets/CertificateTemplatePreview-qBZKeaV6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1140-pSYsRA6xHbz3WfdozCMcPniFwmM\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 4416,
		"path": "../public/assets/CertificateTemplatePreview-qBZKeaV6.js"
	},
	"/assets/CityParcelLivePage-DAAkcQWg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3aeb-GRtkrK7ZaMhsuFKXHSl8kD8d9gQ\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 15083,
		"path": "../public/assets/CityParcelLivePage-DAAkcQWg.js"
	},
	"/assets/Logo-DwFimv2N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1aa-8C7SgmbWQgXf/l2tyDT7dakCxhI\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 426,
		"path": "../public/assets/Logo-DwFimv2N.js"
	},
	"/assets/SiteFooter-CTRQwo21.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1021-cDHp6aapD4G6EalYj6ts0a7XIJg\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 4129,
		"path": "../public/assets/SiteFooter-CTRQwo21.js"
	},
	"/assets/SiteHeader-DeYChfam.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3013-MEUc2Z0fsJ0dKZ3IdiLzuDiMkLc\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 12307,
		"path": "../public/assets/SiteHeader-DeYChfam.js"
	},
	"/assets/TrustBar-B2umsU4J.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"74d-ceSVbjhvcJSUSP75QXzOX12RA3s\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 1869,
		"path": "../public/assets/TrustBar-B2umsU4J.js"
	},
	"/assets/UserSidebar-CXQaSpNh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b23-ZYkz74PlP3hTAfycSvQaBHAPqCw\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 2851,
		"path": "../public/assets/UserSidebar-CXQaSpNh.js"
	},
	"/assets/_slug-DOS47t3L.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"272-w/2HfJ/4FU6Nsl2xUmjw4QR0KRU\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 626,
		"path": "../public/assets/_slug-DOS47t3L.js"
	},
	"/assets/_slug-QowbGzTZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2114-G5x+F5jDRRpylVDS2KVOjL1epic\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 8468,
		"path": "../public/assets/_slug-QowbGzTZ.js"
	},
	"/assets/ana-sayfa-CHikk53T.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24f9-5HwzzXmX26Txe6XNUEm5bm3CfU4\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 9465,
		"path": "../public/assets/ana-sayfa-CHikk53T.js"
	},
	"/assets/arrow-left-DWs8reEk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"96-eypTUqVmrtvMvJP73015LLNGJns\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 150,
		"path": "../public/assets/arrow-left-DWs8reEk.js"
	},
	"/assets/arrow-right-DkPvHfMW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"96-u1sjQPECLW/8yHberP4Qed8CRuY\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 150,
		"path": "../public/assets/arrow-right-DkPvHfMW.js"
	},
	"/assets/award-DGrmdhOE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"103-Knu3w5XFIcX9LCAA4fSTrObmF9s\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 259,
		"path": "../public/assets/award-DGrmdhOE.js"
	},
	"/assets/MySkyParcelEarthGlobe-A_CsdYlO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"81903-+ElFou2S5liyu2idOaXRUBgaf5o\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 530691,
		"path": "../public/assets/MySkyParcelEarthGlobe-A_CsdYlO.js"
	},
	"/assets/bildirimler-DxuTM8NF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a31-0QVY0gZo4IGY8ngSZsMEIGDHXBc\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 2609,
		"path": "../public/assets/bildirimler-DxuTM8NF.js"
	},
	"/assets/boxes-DP4AA1mx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"344-4CeiGq0GjZ39NhK5iURK1wKTfV0\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 836,
		"path": "../public/assets/boxes-DP4AA1mx.js"
	},
	"/assets/cerez-politikasi-BQ4Oi68y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e00-T+620Z6R0KuAIm7sBsEXQBgHZ4k\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 3584,
		"path": "../public/assets/cerez-politikasi-BQ4Oi68y.js"
	},
	"/assets/certificateTemplates-BvldCKP0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a4-3UdOQLtEzE6LgJM4CiH4gqbGppY\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 25764,
		"path": "../public/assets/certificateTemplates-BvldCKP0.js"
	},
	"/assets/check-00lAq1zs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6d-v82OCwYezQhAF/VzVqee4nci/no\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 109,
		"path": "../public/assets/check-00lAq1zs.js"
	},
	"/assets/circle-check-Cy1nRfOp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a3-oNznFIdDt66GEhU6iRGjKzGu2Rw\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 163,
		"path": "../public/assets/circle-check-Cy1nRfOp.js"
	},
	"/assets/circle-x-_4dcCzyn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-jPSuqWCZkcv0gWajqNEtGsttMKA\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 192,
		"path": "../public/assets/circle-x-_4dcCzyn.js"
	},
	"/assets/dogrula-Dt8Bj7Em.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16aa-FmSjQ5YFtMMZd+Hw/PcR8c9QBpY\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 5802,
		"path": "../public/assets/dogrula-Dt8Bj7Em.js"
	},
	"/assets/eye-kyXh2nCG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f1-6VsM/6BteN2+xvXl1FHgMlBolek\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 241,
		"path": "../public/assets/eye-kyXh2nCG.js"
	},
	"/assets/file-badge-Ct29h-j4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ba-yLHbAUMir0mAOvwo8fHEniFsJZo\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 442,
		"path": "../public/assets/file-badge-Ct29h-j4.js"
	},
	"/assets/gift-CyDlDjlX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14e-wvq8sJB2yiFfX7w/9dS1RWCa3Qg\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 334,
		"path": "../public/assets/gift-CyDlDjlX.js"
	},
	"/assets/giris-CdIOv9Zn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b9f-AoKSh0N9K4UEqXEl/yxLP8mmiac\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 11167,
		"path": "../public/assets/giris-CdIOv9Zn.js"
	},
	"/assets/gizlilik-politikasi-GG_FGZof.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94c-bKvXR1LSFk5dtsZV2By1j+4poZE\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 2380,
		"path": "../public/assets/gizlilik-politikasi-GG_FGZof.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-haritasi-Bg2YeUli.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9e9-wOl2pBz2Mr/ZSS99weWsw7Vr4xM\"",
		"mtime": "2026-09-01T15:10:49.066Z",
		"size": 2537,
		"path": "../public/assets/gokyuzu-haritasi-Bg2YeUli.js"
	},
	"/assets/guvenlik-ayarlari-CIaxeJ9b.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23bb-T8HRozjXvfPiif7GssHVzFmNpew\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 9147,
		"path": "../public/assets/guvenlik-ayarlari-CIaxeJ9b.js"
	},
	"/assets/hakkimizda-lD4ZPZxx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ee8-nmtI2Bt8wO3cyGcNvEhWFSki27c\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 7912,
		"path": "../public/assets/hakkimizda-lD4ZPZxx.js"
	},
	"/assets/heart-C4CcLg80.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f3-Je1UCZ83RurDEAqO99OIjarrJAM\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 243,
		"path": "../public/assets/heart-C4CcLg80.js"
	},
	"/assets/hediyelerim-D5hEzkOZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2135-qvSkAvndoCjEBjHe+5qR+f6ZHc4\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 8501,
		"path": "../public/assets/hediyelerim-D5hEzkOZ.js"
	},
	"/assets/hediye-kabul-CyZ7zLRv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1800-qvUX/3ZFEKAsEfE55yGtggOltww\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 6144,
		"path": "../public/assets/hediye-kabul-CyZ7zLRv.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/iade-iptal-politikasi-CqKZlEkO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"118a-bSe/ddcYgZtNQ8f+jG8wmbgkgRY\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 4490,
		"path": "../public/assets/iade-iptal-politikasi-CqKZlEkO.js"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/iletisim-sj0D1xl8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14b7-H5q5P+gnOT+b7CsNFm2Tdg4FqzE\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 5303,
		"path": "../public/assets/iletisim-sj0D1xl8.js"
	},
	"/assets/index-BZZXfxPQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4eb09-ZOO2YAj84dkt/1NmuQa01bgmLQA\"",
		"mtime": "2026-09-01T15:10:49.065Z",
		"size": 322313,
		"path": "../public/assets/index-BZZXfxPQ.js"
	},
	"/assets/kayit-ol-BcPyT_VA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d55-DYDxWbpBlB1HA1BWPDDOiSSJBjM\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 7509,
		"path": "../public/assets/kayit-ol-BcPyT_VA.js"
	},
	"/assets/index-7JpM49b2.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"3e-+yJO7CIbQLllSLHlpirZzTEJOfc\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 62,
		"path": "../public/assets/index-7JpM49b2.css"
	},
	"/assets/kullanim-sartlari-DlAbAV1b.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb5-FTBDuGq7hzm0qGT17okRUMLRAxQ\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 2997,
		"path": "../public/assets/kullanim-sartlari-DlAbAV1b.js"
	},
	"/assets/kvkk-gXQVmI84.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190e-gVlz/9kCHKspxevOXIwqS08Yy5o\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 6414,
		"path": "../public/assets/kvkk-gXQVmI84.js"
	},
	"/assets/layers-Biz-lGsN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"196-1tTtJzo4myp0NnaqCxCgnSj7Dos\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 406,
		"path": "../public/assets/layers-Biz-lGsN.js"
	},
	"/assets/lazyRouteComponent-D7YU3aeL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1358-iQO3PJfjULEB+xOFZrJI3NilLuk\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 4952,
		"path": "../public/assets/lazyRouteComponent-D7YU3aeL.js"
	},
	"/assets/link-D90cKH_E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6586-fb9WKhVhfd8d9CoIJ7QJ59V1DGQ\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 25990,
		"path": "../public/assets/link-D90cKH_E.js"
	},
	"/assets/loader-circle-BxSgGKPt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"81-3TekXF/6elY5F6xX7S26QkPqeUc\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 129,
		"path": "../public/assets/loader-circle-BxSgGKPt.js"
	},
	"/assets/lock-C41urahQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bf-42PTmPX5N1VoOcc1PXyF2tgbXYY\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 191,
		"path": "../public/assets/lock-C41urahQ.js"
	},
	"/assets/mail-0JlEdQAB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c6-5+H8vW7y3ULRMuyouZwVnUUnVSM\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 198,
		"path": "../public/assets/mail-0JlEdQAB.js"
	},
	"/assets/map-pin-Cqt_e9on.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f4-vrYA7xEpj0Z7MdRFgFgqmUqbME0\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 244,
		"path": "../public/assets/map-pin-Cqt_e9on.js"
	},
	"/assets/nasil-calisir-Cjzd6aQA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"157e-cMkcykozuSmp1HR3mCEvj4AkIxE\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 5502,
		"path": "../public/assets/nasil-calisir-Cjzd6aQA.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-Da1laLq9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185c-U5SutcThFPQBkRBpElaE5XQtZL8\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 6236,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-Da1laLq9.js"
	},
	"/assets/jsx-runtime-DE3RlOCf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1edb-++aNIhyKgQeSqFVy8og9djQ1xvw\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 7899,
		"path": "../public/assets/jsx-runtime-DE3RlOCf.js"
	},
	"/assets/odeme-C2xW4QIN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3e3-DRd/QfeKLsAzNNBoR08cFLR/ccU\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 995,
		"path": "../public/assets/odeme-C2xW4QIN.js"
	},
	"/assets/odeme-B333PLEe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22c5-o1THnlfVYHS9Cjw/jHaADIyJpR8\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 8901,
		"path": "../public/assets/odeme-B333PLEe.js"
	},
	"/assets/on-bilgilendirme-formu-CqZHStIu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1170-yYHEM9T0l0MdDAbLn1MLgM8WJmA\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 4464,
		"path": "../public/assets/on-bilgilendirme-formu-CqZHStIu.js"
	},
	"/assets/package-check-DzdXMIKE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19b-8B7USNfNK9K35KD4JeYtsoUrscA\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 411,
		"path": "../public/assets/package-check-DzdXMIKE.js"
	},
	"/assets/paketler-CKX35hQz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14cd-J54aO7SkeM8IT8cOk4L5Of2IN54\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 5325,
		"path": "../public/assets/paketler-CKX35hQz.js"
	},
	"/assets/panelim-DOlDcB_c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24ea-dMsz/ek8E5jT9+KKmLn5PJpDrcA\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 9450,
		"path": "../public/assets/panelim-DOlDcB_c.js"
	},
	"/assets/parsel-satin-al-CwYUwUdL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ed-RHiQq30RU35nCsm5ieT2/kqJh5w\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 1261,
		"path": "../public/assets/parsel-satin-al-CwYUwUdL.js"
	},
	"/assets/parsel-satin-al-aOWREHLQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"258b-v5eBjxyZwwZ/nIEk9/K/i0wRnsY\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 9611,
		"path": "../public/assets/parsel-satin-al-aOWREHLQ.js"
	},
	"/assets/parsellerim-BCUnbsRD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"661f-hYiBauQYIVqhVLVdl8tFOK9cIQU\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 26143,
		"path": "../public/assets/parsellerim-BCUnbsRD.js"
	},
	"/assets/pazar-yeri-CCGVsHGu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63c-pr5NAcX8UddOIrwH6sy/Krkm+28\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 1596,
		"path": "../public/assets/pazar-yeri-CCGVsHGu.js"
	},
	"/assets/phone-CXSxdpW4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"133-tlxs+oSvrQb42TthsTkSlTH0tKY\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 307,
		"path": "../public/assets/phone-CXSxdpW4.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/profilim-CSeZgF2v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b98-72kWstP/AI4bUgbLlMTK4vMp0U4\"",
		"mtime": "2026-09-01T15:10:49.067Z",
		"size": 2968,
		"path": "../public/assets/profilim-CSeZgF2v.js"
	},
	"/assets/refresh-cw-BMYaAggc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"412-LzN4cRMQgp6kaOQQfv+4pS/3+vk\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 1042,
		"path": "../public/assets/refresh-cw-BMYaAggc.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/routes-DosEqIjE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9e9-uGzsAqczlawGhhzF/rjPezylL+c\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 2537,
		"path": "../public/assets/routes-DosEqIjE.js"
	},
	"/assets/search-DLltCVYE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9f-TsihnKyH2eQ/IbDAINWeVRiwBbQ\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 159,
		"path": "../public/assets/search-DLltCVYE.js"
	},
	"/assets/sertifika-dogrula-aIjPyTtr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"48a-UVZymSRpXQJmuDk+QsmjNCT9SoY\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 1162,
		"path": "../public/assets/sertifika-dogrula-aIjPyTtr.js"
	},
	"/assets/sertifika-dogrula-LPBTCUuJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16cf-En/rKjzOgcSc5OiJC/SU1PwBLz0\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 5839,
		"path": "../public/assets/sertifika-dogrula-LPBTCUuJ.js"
	},
	"/assets/sertifika-talep-DK9_-pbs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"215d-wsutjjGfWGRQZTgkW0wUpUX8+bQ\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 8541,
		"path": "../public/assets/sertifika-talep-DK9_-pbs.js"
	},
	"/assets/sertifikalarim-CY_7EKEi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2688-Z3GTRfQ+7oPg9eUeM2azh+pvO48\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 9864,
		"path": "../public/assets/sertifikalarim-CY_7EKEi.js"
	},
	"/assets/sifre-yenile-Dht2MO78.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fd1-uljgB4tAzwFfukJuzHjXOEkc5ss\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 4049,
		"path": "../public/assets/sifre-yenile-Dht2MO78.js"
	},
	"/assets/sifremi-unuttum-Bs7Gjkdd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"188e-4iO9A0HSqj2efSwhpsGfGpseE6o\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 6286,
		"path": "../public/assets/sifremi-unuttum-Bs7Gjkdd.js"
	},
	"/assets/siparislerim-ca3jLtan.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"efe-RgR7YdTUPvGis3FmkLgwRfauFyY\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 3838,
		"path": "../public/assets/siparislerim-ca3jLtan.js"
	},
	"/assets/smartphone-UxzcEjmZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b6-998RHK71g2C5BxTmwBNDDlFYNRo\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 182,
		"path": "../public/assets/smartphone-UxzcEjmZ.js"
	},
	"/assets/sparkles-DxsTQQBM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1df-iNQkADOLy2lkxEALDn6y6O5jjHo\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 479,
		"path": "../public/assets/sparkles-DxsTQQBM.js"
	},
	"/assets/star-BovTK9xm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c9-CPBYUvxiGQUoW0xafBYfqJcug08\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 457,
		"path": "../public/assets/star-BovTK9xm.js"
	},
	"/assets/turkiye-haritasi-BTpaQacK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f0a-h9SVD6eUdJcp9V5V70Ogusmtvxk\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 3850,
		"path": "../public/assets/turkiye-haritasi-BTpaQacK.js"
	},
	"/assets/styles-DoJnuOGi.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"25a6c-P+Nbh5D7rQfeE8iAYkwoJDN/DV8\"",
		"mtime": "2026-09-01T15:10:49.069Z",
		"size": 154220,
		"path": "../public/assets/styles-DoJnuOGi.css"
	},
	"/assets/useRouter-VMLxvdJG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"236-9wTGogEQs6FVqKrigBHqv3aErX8\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 566,
		"path": "../public/assets/useRouter-VMLxvdJG.js"
	},
	"/assets/user-DzpdyRcC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b5-q6rZhIptO6ephYbot7KuUZlLfSA\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 181,
		"path": "../public/assets/user-DzpdyRcC.js"
	},
	"/assets/useAuth-DvbsXF6a.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34ed0-i8/YhMn+AzImMoNbAHzVDSV4oFc\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 216784,
		"path": "../public/assets/useAuth-DvbsXF6a.js"
	},
	"/assets/uyelik-sozlesmesi-xEUF4vml.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a4-bdp54AP9XrGAhCBpPDkWBW2U9gY\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 9636,
		"path": "../public/assets/uyelik-sozlesmesi-xEUF4vml.js"
	},
	"/assets/x-Q6MQbkq7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63d-/9kKqTheXV9n/gxnYGp+IszZTho\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 1597,
		"path": "../public/assets/x-Q6MQbkq7.js"
	},
	"/assets/yonetim-Bz7Nr0L5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7e0e-NOb4Z5QR4EEZaa1xg/l9KbyhzsI\"",
		"mtime": "2026-09-01T15:10:49.068Z",
		"size": 32270,
		"path": "../public/assets/yonetim-Bz7Nr0L5.js"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-01T15:10:50.382Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-01T15:10:50.381Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-01T15:10:50.382Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-01T15:10:50.382Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-01T15:10:50.382Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-01T15:10:50.382Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-01T15:10:50.382Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-01T15:10:50.382Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-01T15:10:50.382Z",
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
