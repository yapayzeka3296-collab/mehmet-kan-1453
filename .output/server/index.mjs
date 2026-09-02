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
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"65e-MHb8tyQvnZqF3VBcapfMngMf+Qc\"",
		"mtime": "2026-09-02T08:05:19.075Z",
		"size": 1630,
		"path": "../public/login-background.css"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-02T08:05:19.075Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-02T08:05:19.082Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"10a5-l/Rzf76Qzw33OET02kw0xh9JB88\"",
		"mtime": "2026-09-02T08:05:19.059Z",
		"size": 4261,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-09-02T08:05:19.075Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-02T08:05:19.059Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"10db-9NJPfaYHJH0IPwfwnfBcCRfUeeg\"",
		"mtime": "2026-09-02T08:05:19.059Z",
		"size": 4315,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-02T08:05:19.059Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"11e6-FxMTKbkrT8TG+MSgLjIAZCgOgyo\"",
		"mtime": "2026-09-02T08:05:19.059Z",
		"size": 4582,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-02T08:05:19.059Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-02T08:04:58.916Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/assets/CertificateTemplatePreview-qBZKeaV6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1140-pSYsRA6xHbz3WfdozCMcPniFwmM\"",
		"mtime": "2026-09-02T08:05:17.714Z",
		"size": 4416,
		"path": "../public/assets/CertificateTemplatePreview-qBZKeaV6.js"
	},
	"/assets/CityParcelLivePage-D4WdZupp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3aeb-lMqaHxnXLWm8OIC8Mz10EBAg8Bw\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 15083,
		"path": "../public/assets/CityParcelLivePage-D4WdZupp.js"
	},
	"/assets/Logo-DwFimv2N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1aa-8C7SgmbWQgXf/l2tyDT7dakCxhI\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 426,
		"path": "../public/assets/Logo-DwFimv2N.js"
	},
	"/assets/SiteFooter-CTRQwo21.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1021-cDHp6aapD4G6EalYj6ts0a7XIJg\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 4129,
		"path": "../public/assets/SiteFooter-CTRQwo21.js"
	},
	"/assets/SiteHeader-Ba0f5PVj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3259-dT2r+Esg22utx3TTw8mstX5gkuM\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 12889,
		"path": "../public/assets/SiteHeader-Ba0f5PVj.js"
	},
	"/assets/TrustBar-B2umsU4J.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"74d-ceSVbjhvcJSUSP75QXzOX12RA3s\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 1869,
		"path": "../public/assets/TrustBar-B2umsU4J.js"
	},
	"/assets/UserSidebar-h7A7xPpu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3e-SLlijgZaThVBcPdWUPZrJLTrPro\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 2878,
		"path": "../public/assets/UserSidebar-h7A7xPpu.js"
	},
	"/assets/_slug-BLIH27NU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"272-rd8BENoWS6v6QMtp2gSXoNFPIpY\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 626,
		"path": "../public/assets/_slug-BLIH27NU.js"
	},
	"/assets/_slug-BpBQH0Yh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2114-D3wO/BEfL7Ot/6u5n3F52Ks2SHQ\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 8468,
		"path": "../public/assets/_slug-BpBQH0Yh.js"
	},
	"/assets/ana-sayfa-DXiRm1mJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2915-F26eJ2X/iPJbd0EwP+6w/OdbdxQ\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 10517,
		"path": "../public/assets/ana-sayfa-DXiRm1mJ.js"
	},
	"/assets/arrow-left-DWs8reEk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"96-eypTUqVmrtvMvJP73015LLNGJns\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 150,
		"path": "../public/assets/arrow-left-DWs8reEk.js"
	},
	"/assets/arrow-right-DkPvHfMW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"96-u1sjQPECLW/8yHberP4Qed8CRuY\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 150,
		"path": "../public/assets/arrow-right-DkPvHfMW.js"
	},
	"/assets/ana-sayfa-t_kifmGS.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"201-LYF7dGjK6i822lfGZRBhUXtCQZA\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 513,
		"path": "../public/assets/ana-sayfa-t_kifmGS.css"
	},
	"/assets/MySkyParcelEarthGlobe-JkdLY36F.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"819b1-MKtFlRhHm+7CZCY/PMnu5mSvGmw\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 530865,
		"path": "../public/assets/MySkyParcelEarthGlobe-JkdLY36F.js"
	},
	"/assets/award-DGrmdhOE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"103-Knu3w5XFIcX9LCAA4fSTrObmF9s\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 259,
		"path": "../public/assets/award-DGrmdhOE.js"
	},
	"/assets/boxes-DP4AA1mx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"344-4CeiGq0GjZ39NhK5iURK1wKTfV0\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 836,
		"path": "../public/assets/boxes-DP4AA1mx.js"
	},
	"/assets/cerez-politikasi-BCrOA2er.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e00-SYwfs/l58Ii4Y7tKLVPhEbz7kTk\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 3584,
		"path": "../public/assets/cerez-politikasi-BCrOA2er.js"
	},
	"/assets/certificateTemplates-BvldCKP0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a4-3UdOQLtEzE6LgJM4CiH4gqbGppY\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 25764,
		"path": "../public/assets/certificateTemplates-BvldCKP0.js"
	},
	"/assets/check-00lAq1zs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6d-v82OCwYezQhAF/VzVqee4nci/no\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 109,
		"path": "../public/assets/check-00lAq1zs.js"
	},
	"/assets/circle-check-Cy1nRfOp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a3-oNznFIdDt66GEhU6iRGjKzGu2Rw\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 163,
		"path": "../public/assets/circle-check-Cy1nRfOp.js"
	},
	"/assets/bildirimler-DMDMjfrJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a31-/p/+xiYB9yejVjZWDx6NNrWECMk\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 2609,
		"path": "../public/assets/bildirimler-DMDMjfrJ.js"
	},
	"/assets/circle-x-_4dcCzyn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-jPSuqWCZkcv0gWajqNEtGsttMKA\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 192,
		"path": "../public/assets/circle-x-_4dcCzyn.js"
	},
	"/assets/dogrula-DNCEfHRF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16aa-LHMoOTIr8KRu8aXAijnWE2En1eY\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 5802,
		"path": "../public/assets/dogrula-DNCEfHRF.js"
	},
	"/assets/eye-kyXh2nCG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f1-6VsM/6BteN2+xvXl1FHgMlBolek\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 241,
		"path": "../public/assets/eye-kyXh2nCG.js"
	},
	"/assets/file-badge-Ct29h-j4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ba-yLHbAUMir0mAOvwo8fHEniFsJZo\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 442,
		"path": "../public/assets/file-badge-Ct29h-j4.js"
	},
	"/assets/gift-CyDlDjlX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14e-wvq8sJB2yiFfX7w/9dS1RWCa3Qg\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 334,
		"path": "../public/assets/gift-CyDlDjlX.js"
	},
	"/assets/giris-CAapqXZc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b9f-d2iFIeRGzA9tGITjW6EnKdH67Ds\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 11167,
		"path": "../public/assets/giris-CAapqXZc.js"
	},
	"/assets/gizlilik-politikasi-0VCZU332.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94c-OVhtr5IH4Bs2+RnLd6i4NmoLHho\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 2380,
		"path": "../public/assets/gizlilik-politikasi-0VCZU332.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-haritasi-CGosB7L6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9e9-dxk2L/qBWKNMHOuTr+/sMIdZFks\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 2537,
		"path": "../public/assets/gokyuzu-haritasi-CGosB7L6.js"
	},
	"/assets/hakkimizda-BJ7EG9Gs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ee8-Fm3fW8pNwkgCazF4oe2QGa4HGh0\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 7912,
		"path": "../public/assets/hakkimizda-BJ7EG9Gs.js"
	},
	"/assets/guvenlik-ayarlari-CtnRTymu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23bb-cNRhOg2yIdo3Z0ZnhE7CpRrflw0\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 9147,
		"path": "../public/assets/guvenlik-ayarlari-CtnRTymu.js"
	},
	"/assets/heart-C4CcLg80.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f3-Je1UCZ83RurDEAqO99OIjarrJAM\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 243,
		"path": "../public/assets/heart-C4CcLg80.js"
	},
	"/assets/hediye-kabul-0b5MrGAu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1800-RFizkb1JMnGSb5MjQrlTI/WSFYA\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 6144,
		"path": "../public/assets/hediye-kabul-0b5MrGAu.js"
	},
	"/assets/hediyelerim-Dl6pn6UC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2135-qkJlchH853CfcDneXJc9VZHbIXs\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 8501,
		"path": "../public/assets/hediyelerim-Dl6pn6UC.js"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/iade-iptal-politikasi-BXCCqo_q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"118a-IYsOYmss30Y19puwHzxa4CgBZVs\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 4490,
		"path": "../public/assets/iade-iptal-politikasi-BXCCqo_q.js"
	},
	"/assets/iletisim-C3yhIYsF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14b7-9nDtuZhKu7MiV1pG+llrVgsJExY\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 5303,
		"path": "../public/assets/iletisim-C3yhIYsF.js"
	},
	"/assets/index-COYVZGkB.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"22bba-eE/WldJluKkt2Ta0Zplkv2Y7vDU\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 142266,
		"path": "../public/assets/index-COYVZGkB.css"
	},
	"/assets/jsx-runtime-DE3RlOCf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1edb-++aNIhyKgQeSqFVy8og9djQ1xvw\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 7899,
		"path": "../public/assets/jsx-runtime-DE3RlOCf.js"
	},
	"/assets/kayit-ol-CtHUPVW7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d55-7EUh2dyF+ujIcWf3WnRhPm7NKTA\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 7509,
		"path": "../public/assets/kayit-ol-CtHUPVW7.js"
	},
	"/assets/kullanim-sartlari-DiejzfnV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb5-URff8ZOXb3XWinnLUDF0YmgC+kE\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 2997,
		"path": "../public/assets/kullanim-sartlari-DiejzfnV.js"
	},
	"/assets/index-CbaxZpa2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4eb0f-gbHKBmaALv6NWp63Y+DZrowodP8\"",
		"mtime": "2026-09-02T08:05:17.714Z",
		"size": 322319,
		"path": "../public/assets/index-CbaxZpa2.js"
	},
	"/assets/kvkk-BvHP_18q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190e-qc7XtkWy3ieGYe0n/1M5ILIWu6Q\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 6414,
		"path": "../public/assets/kvkk-BvHP_18q.js"
	},
	"/assets/layers-Biz-lGsN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"196-1tTtJzo4myp0NnaqCxCgnSj7Dos\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 406,
		"path": "../public/assets/layers-Biz-lGsN.js"
	},
	"/assets/lazyRouteComponent-CX8oWAbN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1358-7VGBFnnK1WTopDYUh9ay42SVR7w\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 4952,
		"path": "../public/assets/lazyRouteComponent-CX8oWAbN.js"
	},
	"/assets/link-D90cKH_E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6586-fb9WKhVhfd8d9CoIJ7QJ59V1DGQ\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 25990,
		"path": "../public/assets/link-D90cKH_E.js"
	},
	"/assets/loader-circle-BxSgGKPt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"81-3TekXF/6elY5F6xX7S26QkPqeUc\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 129,
		"path": "../public/assets/loader-circle-BxSgGKPt.js"
	},
	"/assets/lock-C41urahQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bf-42PTmPX5N1VoOcc1PXyF2tgbXYY\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 191,
		"path": "../public/assets/lock-C41urahQ.js"
	},
	"/assets/mail-0JlEdQAB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c6-5+H8vW7y3ULRMuyouZwVnUUnVSM\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 198,
		"path": "../public/assets/mail-0JlEdQAB.js"
	},
	"/assets/map-pin-Cqt_e9on.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f4-vrYA7xEpj0Z7MdRFgFgqmUqbME0\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 244,
		"path": "../public/assets/map-pin-Cqt_e9on.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-Zxp9ZgEx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185c-u0iYTNeJXKnOK8whNxGqe4EZdEc\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 6236,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-Zxp9ZgEx.js"
	},
	"/assets/nasil-calisir-DimvYNYA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"157e-QZmR2HpxycOgyiO0CDNjDf3USEM\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 5502,
		"path": "../public/assets/nasil-calisir-DimvYNYA.js"
	},
	"/assets/odeme-C2m7t89H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3e3-zFZlhW92hLyzeB47H4z/FFYLJ9Y\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 995,
		"path": "../public/assets/odeme-C2m7t89H.js"
	},
	"/assets/odeme-CJlVRxFW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"22c5-dUxfze/wJbW4kxbZoCihTIGXpTs\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 8901,
		"path": "../public/assets/odeme-CJlVRxFW.js"
	},
	"/assets/on-bilgilendirme-formu-BVxuwoUc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1170-BzVaZGlnWtKhi3qQbSvZeNn+XEI\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 4464,
		"path": "../public/assets/on-bilgilendirme-formu-BVxuwoUc.js"
	},
	"/assets/package-check-DzdXMIKE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19b-8B7USNfNK9K35KD4JeYtsoUrscA\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 411,
		"path": "../public/assets/package-check-DzdXMIKE.js"
	},
	"/assets/paketler-DytbOqgj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14cd-bP/tDg/SlqE1sfirW0t70/I1kj4\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 5325,
		"path": "../public/assets/paketler-DytbOqgj.js"
	},
	"/assets/panelim-BmO8fqbr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24ea-opRTuvNE1qbYIVIVUW4xucxoC8E\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 9450,
		"path": "../public/assets/panelim-BmO8fqbr.js"
	},
	"/assets/parsel-satin-al-B9ZzfahS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ed-0WLP4+7UScbSGCLg5YJG8XDEKYE\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 1261,
		"path": "../public/assets/parsel-satin-al-B9ZzfahS.js"
	},
	"/assets/parsel-satin-al-DPGVA-Az.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"258b-WMpKBah5twOSjtOIW8BxOg9UMKg\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 9611,
		"path": "../public/assets/parsel-satin-al-DPGVA-Az.js"
	},
	"/assets/parsellerim-DPJ911Bl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"661f-YDAry2yK6ktklFN86ckSeoZpFD0\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 26143,
		"path": "../public/assets/parsellerim-DPJ911Bl.js"
	},
	"/assets/pazar-yeri-DNH6as56.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63c-1iQN6aFFLu7nkI//jCNZb65PsgE\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 1596,
		"path": "../public/assets/pazar-yeri-DNH6as56.js"
	},
	"/assets/phone-CXSxdpW4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"133-tlxs+oSvrQb42TthsTkSlTH0tKY\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 307,
		"path": "../public/assets/phone-CXSxdpW4.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/refresh-cw-BMYaAggc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"412-LzN4cRMQgp6kaOQQfv+4pS/3+vk\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 1042,
		"path": "../public/assets/refresh-cw-BMYaAggc.js"
	},
	"/assets/profilim-CQdd4LPx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b98-BSc3usrxkfXij4/7ONc63UuUhQM\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 2968,
		"path": "../public/assets/profilim-CQdd4LPx.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-02T08:05:17.715Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/routes-IwqXCd5c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a26-vgvc1kJ9lIeSxRHORKPYATT7G7Y\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 2598,
		"path": "../public/assets/routes-IwqXCd5c.js"
	},
	"/assets/search-DLltCVYE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9f-TsihnKyH2eQ/IbDAINWeVRiwBbQ\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 159,
		"path": "../public/assets/search-DLltCVYE.js"
	},
	"/assets/sertifika-dogrula-Be3coMGR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16cf-CxrhV+dSLt3wV24rKjoB0go9T88\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 5839,
		"path": "../public/assets/sertifika-dogrula-Be3coMGR.js"
	},
	"/assets/sertifika-dogrula-CPQ5Rybv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"48a-/w4cGH3uAzXGhRGvh3bHAbg/Xdw\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 1162,
		"path": "../public/assets/sertifika-dogrula-CPQ5Rybv.js"
	},
	"/assets/sertifikalarim-Gb-9X8db.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2688-B+Fh+QsodzQJxgbBJhM7YXdQ7LQ\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 9864,
		"path": "../public/assets/sertifikalarim-Gb-9X8db.js"
	},
	"/assets/sertifika-talep-CxRFyKGq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"215d-FQgBXOYvu/BypXBrK6x2AMjfTfc\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 8541,
		"path": "../public/assets/sertifika-talep-CxRFyKGq.js"
	},
	"/assets/sifre-yenile-DSY_tK9-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fd1-QfSUNa74YEnSG7IRxSa+jo0KjgM\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 4049,
		"path": "../public/assets/sifre-yenile-DSY_tK9-.js"
	},
	"/assets/sifremi-unuttum-DFBQ81Qf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"188e-5Pi4wi/BNJ6W1b6giYAn0prARzM\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 6286,
		"path": "../public/assets/sifremi-unuttum-DFBQ81Qf.js"
	},
	"/assets/smartphone-UxzcEjmZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b6-998RHK71g2C5BxTmwBNDDlFYNRo\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 182,
		"path": "../public/assets/smartphone-UxzcEjmZ.js"
	},
	"/assets/siparislerim-MfJ0bj4G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"efe-WFxdi/ol+pQWvx1BLNXzlF59WT8\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 3838,
		"path": "../public/assets/siparislerim-MfJ0bj4G.js"
	},
	"/assets/star-BovTK9xm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c9-CPBYUvxiGQUoW0xafBYfqJcug08\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 457,
		"path": "../public/assets/star-BovTK9xm.js"
	},
	"/assets/sparkles-DxsTQQBM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1df-iNQkADOLy2lkxEALDn6y6O5jjHo\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 479,
		"path": "../public/assets/sparkles-DxsTQQBM.js"
	},
	"/assets/turkiye-haritasi-B2oQ_kEm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f0a-bOhJzpCudzfLaBJ2yyq9Sg3q8+8\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 3850,
		"path": "../public/assets/turkiye-haritasi-B2oQ_kEm.js"
	},
	"/assets/useAuth-B65SKTQ4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34f67-bcySqFoL45/GCJxD+QPFm9uVT7w\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 216935,
		"path": "../public/assets/useAuth-B65SKTQ4.js"
	},
	"/assets/useRouter-VMLxvdJG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"236-9wTGogEQs6FVqKrigBHqv3aErX8\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 566,
		"path": "../public/assets/useRouter-VMLxvdJG.js"
	},
	"/assets/user-DzpdyRcC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b5-q6rZhIptO6ephYbot7KuUZlLfSA\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 181,
		"path": "../public/assets/user-DzpdyRcC.js"
	},
	"/assets/uyelik-sozlesmesi-CSgzkgn3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a4-YxWxI+DzTloknTKjrWaRbYxNG+k\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 9636,
		"path": "../public/assets/uyelik-sozlesmesi-CSgzkgn3.js"
	},
	"/assets/x-Q6MQbkq7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63d-/9kKqTheXV9n/gxnYGp+IszZTho\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 1597,
		"path": "../public/assets/x-Q6MQbkq7.js"
	},
	"/assets/yonetim-B7OPaXnD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7e0e-ChNI2DqIar+LZBBKB0Gwx09mwg8\"",
		"mtime": "2026-09-02T08:05:17.716Z",
		"size": 32270,
		"path": "../public/assets/yonetim-B7OPaXnD.js"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-02T08:05:19.060Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-02T08:05:19.060Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-02T08:05:19.060Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-02T08:05:19.060Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-02T08:05:19.060Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-02T08:05:19.060Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-02T08:05:19.060Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-02T08:05:19.060Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-02T08:05:19.060Z",
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
