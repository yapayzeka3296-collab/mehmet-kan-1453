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
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-08-21T07:10:53.178Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-08-21T07:10:53.178Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"345-auSYwhMQnC06JZD4GteGwLfuYW4\"",
		"mtime": "2026-08-21T07:10:53.178Z",
		"size": 837,
		"path": "../public/login-background.css"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-08-21T07:10:53.178Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-08-21T07:10:53.178Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/SiteFooter-BvqK8rXi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a9b-BqVUUVqKVhpMqyjDLpHZVTgNClQ\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 39579,
		"path": "../public/assets/SiteFooter-BvqK8rXi.js"
	},
	"/assets/TrustBar-WVrvTJZB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"852-wYsio7GEoXxsSSSF4gpq4QPcATY\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 2130,
		"path": "../public/assets/TrustBar-WVrvTJZB.js"
	},
	"/assets/UserSidebar-DQ8PkV6g.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"91d-PLm6WzKFKc6TJq0y9OzeWnkUO2w\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 2333,
		"path": "../public/assets/UserSidebar-DQ8PkV6g.js"
	},
	"/assets/arrow-left-CE_4vHhG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-50mU7YZKj4eFXaXo919yvVUNtRc\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 161,
		"path": "../public/assets/arrow-left-CE_4vHhG.js"
	},
	"/assets/arrow-right-BlunZnMt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-D/sauKOqZpTJiAZx75Z8hbZnyhw\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 161,
		"path": "../public/assets/arrow-right-BlunZnMt.js"
	},
	"/assets/award-CXQomsa9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e-kWLf86Ta0v0BdjJ3liHhQBwHEts\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 270,
		"path": "../public/assets/award-CXQomsa9.js"
	},
	"/assets/boxes-ByWDjWP9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34f-kw/l0Qi1cUQFf70wC1gxeLJ4B0U\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 847,
		"path": "../public/assets/boxes-ByWDjWP9.js"
	},
	"/assets/cerez-politikasi-CwZv-tBf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7b8-NNOnddunGQ+nbvTLeNVc82OCUzU\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 1976,
		"path": "../public/assets/cerez-politikasi-CwZv-tBf.js"
	},
	"/assets/check-rwahVzoo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"78-G+TtpUfQ8QL/tNmjvCnYTUx5tJs\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 120,
		"path": "../public/assets/check-rwahVzoo.js"
	},
	"/assets/circle-check-DMD2yK-K.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ae-8EVEpuKesOZR0UJHfJfT7EkfuIs\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 174,
		"path": "../public/assets/circle-check-DMD2yK-K.js"
	},
	"/assets/dogrula-Cblj6C2_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b23-xLPQ2zC8XAwpUefkED5pJAPVKLY\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 2851,
		"path": "../public/assets/dogrula-Cblj6C2_.js"
	},
	"/assets/eye-Ck4uojRw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fc-3pLCjDOI6J8OcsQFY61mBRBQxMQ\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 252,
		"path": "../public/assets/eye-Ck4uojRw.js"
	},
	"/assets/giris-BuHFx95R.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b47-7jH/YyACIw24zOlflNk5MfHjAjY\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 11079,
		"path": "../public/assets/giris-BuHFx95R.js"
	},
	"/assets/gizlilik-politikasi-Bq8f61w3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"92f-guCNFhUVODdFa6Hi6M33A77aUPE\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 2351,
		"path": "../public/assets/gizlilik-politikasi-Bq8f61w3.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/globe-jB2_yjgh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ee-Pu6CMk0F+Y47vhbtOYnIzMyxy7o\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 238,
		"path": "../public/assets/globe-jB2_yjgh.js"
	},
	"/assets/gokyuzu-haritasi-Ci7ZoRdf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dfc5-v1gYRx015h19z4XshJl5ih6Pqeg\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 57285,
		"path": "../public/assets/gokyuzu-haritasi-Ci7ZoRdf.js"
	},
	"/assets/gokyuzu-haritasi-Cl-6R0dA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6c3a-VMBe74AfaV8RFhUg9o6ah4IKr3A\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 27706,
		"path": "../public/assets/gokyuzu-haritasi-Cl-6R0dA.js"
	},
	"/assets/guvenlik-ayarlari-Blz80-6z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f01-hZmyaMgocAZuEhuVwOw+cyzRVhU\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 7937,
		"path": "../public/assets/guvenlik-ayarlari-Blz80-6z.js"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/hakkimizda-BN9kyqPn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef2-w8FEBQI+1DZkKANdCWk4Wlu2V6E\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 7922,
		"path": "../public/assets/hakkimizda-BN9kyqPn.js"
	},
	"/assets/heart-C8TOeReL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fe-uITZyseP8CLRDRmo1fX/dlzJJOg\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 254,
		"path": "../public/assets/heart-C8TOeReL.js"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/iletisim-CsiDDhTm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c31-j78tIN8j8xSmwZXJPikShngplDw\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 3121,
		"path": "../public/assets/iletisim-CsiDDhTm.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-08-21T07:10:52.283Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/index-BG1e17lj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4d6db-/8IGAj4wwOyPL+cYh5MeGa0pp5M\"",
		"mtime": "2026-08-21T07:10:52.280Z",
		"size": 317147,
		"path": "../public/assets/index-BG1e17lj.js"
	},
	"/assets/kayit-ol-DqLqa20f.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1846-uxqIHhExxhyCPPf4Q14xrxpZiAg\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 6214,
		"path": "../public/assets/kayit-ol-DqLqa20f.js"
	},
	"/assets/kullanim-sartlari-BvVaFS0w.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b98-YDb1OlhV5gaKt9KAZbJpgd3ZfIs\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 2968,
		"path": "../public/assets/kullanim-sartlari-BvVaFS0w.js"
	},
	"/assets/kvkk-Bjik20Fv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"165d-aAHUB5Hbb5LCXrOp6hsUeb9FYLQ\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 5725,
		"path": "../public/assets/kvkk-Bjik20Fv.js"
	},
	"/assets/layers-CXjIqrzY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a1-CX9wLMsw9/lkrwAQ90CyktXpGdk\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 417,
		"path": "../public/assets/layers-CXjIqrzY.js"
	},
	"/assets/loader-circle-uWq_sZdV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c-mnIGNL4BkDKbXND6xsDLN8qpcY0\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 140,
		"path": "../public/assets/loader-circle-uWq_sZdV.js"
	},
	"/assets/lock-DQdy6chf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ca-xkMmmNdJaXxDFqjX6rOAzOtiKSU\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 202,
		"path": "../public/assets/lock-DQdy6chf.js"
	},
	"/assets/log-out-D8uXZZI5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e2-6z8e6L0r+YnxgwjgVif9fkR1D0s\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 226,
		"path": "../public/assets/log-out-D8uXZZI5.js"
	},
	"/assets/mail-DV4MnOtM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d1-LPysS9OeDFPU9di404qq4hu1hqs\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 209,
		"path": "../public/assets/mail-DV4MnOtM.js"
	},
	"/assets/nasil-calisir-BZO-vYNU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1567-QSv92shK6jsMSL3xblpj4Qniy9o\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 5479,
		"path": "../public/assets/nasil-calisir-BZO-vYNU.js"
	},
	"/assets/map-pin-CAO00dXo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-i61I8ofBXeDOZYHOWXZDs4II1jw\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 255,
		"path": "../public/assets/map-pin-CAO00dXo.js"
	},
	"/assets/odeme-BkHTmiOU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13b5-QpP0dlKpKLpq4AaD8aKMWepqW9k\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 5045,
		"path": "../public/assets/odeme-BkHTmiOU.js"
	},
	"/assets/odeme-DAksF9G9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b6-X8XyCV36urqjWF6EHDUFLIV3TAU\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 694,
		"path": "../public/assets/odeme-DAksF9G9.js"
	},
	"/assets/paketler-fAJQyFXL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11d5-5qVFLHmNjbw0DDasPcgPuj9fsbM\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 4565,
		"path": "../public/assets/paketler-fAJQyFXL.js"
	},
	"/assets/panelim-Bo79d8X6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"168a-sf71DLrpsy5bnKBId9Js4reg5sE\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 5770,
		"path": "../public/assets/panelim-Bo79d8X6.js"
	},
	"/assets/parsel-satin-al-BTVQV2V-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"112e-jCB+sErhq1HMRu+vdPTOfdB7WUA\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 4398,
		"path": "../public/assets/parsel-satin-al-BTVQV2V-.js"
	},
	"/assets/parsel-satin-al-C29CPMHR.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"366-JPN5sGdJU7yTVCsU5xdRVdQflak\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 870,
		"path": "../public/assets/parsel-satin-al-C29CPMHR.js"
	},
	"/assets/parsellerim-CzuH8EE8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3cbe-G5WGnrZffvp/8kF3Od+7Oe7xQtc\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 15550,
		"path": "../public/assets/parsellerim-CzuH8EE8.js"
	},
	"/assets/pazar-yeri-DWPuWFwZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"61f-YyhP5Dwq0WfEnQvGrAWyAyfXpXY\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 1567,
		"path": "../public/assets/pazar-yeri-DWPuWFwZ.js"
	},
	"/assets/preload-helper-BOKH8X_l.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1793-jvfYVP4EigQ+0vrB2Ze9O/zNMOI\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 6035,
		"path": "../public/assets/preload-helper-BOKH8X_l.js"
	},
	"/assets/refresh-cw-DmhimJ6N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13d-/FguU1zHpkaTYRsc7uKqPMm7f6Y\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 317,
		"path": "../public/assets/refresh-cw-DmhimJ6N.js"
	},
	"/assets/profilim-BLqYF9yg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b45-cj2wgixQ83EXobZ8Ndwdc6wuyls\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 2885,
		"path": "../public/assets/profilim-BLqYF9yg.js"
	},
	"/assets/routes-BLskFRD3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24b9-eIBIEAcsTmQXLVsMKZ4pllwyIE0\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 9401,
		"path": "../public/assets/routes-BLskFRD3.js"
	},
	"/assets/search-lYurJhTD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa-0pM6zvcwGuKlBcDSYM2h9Ku4o6M\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 170,
		"path": "../public/assets/search-lYurJhTD.js"
	},
	"/assets/sertifika-dogrula-DHz9afE_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3c9-K5pl9Iq7ZHCZAkvT/lx3S3GLuOs\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 969,
		"path": "../public/assets/sertifika-dogrula-DHz9afE_.js"
	},
	"/assets/sertifika-talep-DRiZ6bnU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dcf-wxeBiRgbNwhkbb/Dc1qhFJZVLws\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 3535,
		"path": "../public/assets/sertifika-talep-DRiZ6bnU.js"
	},
	"/assets/sertifika-dogrula-CkGUhDat.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1664-s+hyXZ2SdvF3rSE25qOf0MEhZCk\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 5732,
		"path": "../public/assets/sertifika-dogrula-CkGUhDat.js"
	},
	"/assets/sertifikalarim-nuOPjJyn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"213c-qMHiZrGFg/Iry5hUPs1HN2aTArA\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 8508,
		"path": "../public/assets/sertifikalarim-nuOPjJyn.js"
	},
	"/assets/shield-check-B55oTPVP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5b5-BIv9VYC+LEK9a5dyfFi6h1JUU+4\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 1461,
		"path": "../public/assets/shield-check-B55oTPVP.js"
	},
	"/assets/sifre-yenile-_id6CqXw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f6e-1ks1upRikJm0W43o3gizzqujGzk\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 3950,
		"path": "../public/assets/sifre-yenile-_id6CqXw.js"
	},
	"/assets/sifremi-unuttum-DUU5lY5A.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1826-jHivaD/uW/0HrJaQEV8v0cjjcQc\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 6182,
		"path": "../public/assets/sifremi-unuttum-DUU5lY5A.js"
	},
	"/assets/siparislerim-C6Wr2Ydy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ece-83NoMDFac+WqhXxdNpKaVM+8Zm4\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 3790,
		"path": "../public/assets/siparislerim-C6Wr2Ydy.js"
	},
	"/assets/sparkles-BfrPZWLd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ea-dwTVeX+CfHhGtFLsdsqihYL3P3U\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 490,
		"path": "../public/assets/sparkles-BfrPZWLd.js"
	},
	"/assets/star-DFl6iXZS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d4-eq6+xegTT/sHmMfskOGAld4eRo0\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 468,
		"path": "../public/assets/star-DFl6iXZS.js"
	},
	"/assets/styles-D99r_CKn.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1fb4e-OnDByHPNAoop4rZoVx6bGOBn1qo\"",
		"mtime": "2026-08-21T07:10:52.283Z",
		"size": 129870,
		"path": "../public/assets/styles-D99r_CKn.css"
	},
	"/assets/supabaseBrowser-Bo8xYlgi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"35710-Pol5A+MXaMDLPbyCPtCbQDSySJ0\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 218896,
		"path": "../public/assets/supabaseBrowser-Bo8xYlgi.js"
	},
	"/assets/useAuth-Dj8B3fxG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7b55-LyMLFXQZsDAShJvWTwrDQfpse4E\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 31573,
		"path": "../public/assets/useAuth-Dj8B3fxG.js"
	},
	"/assets/user-C8zqUiGC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-PC087v0JFVxn+Oi2p0fa7EYIx5U\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 192,
		"path": "../public/assets/user-C8zqUiGC.js"
	},
	"/assets/uyelik-sozlesmesi-Bhg1OFva.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2507-J24VjADH3NFYStkzHwAeoRFRqfU\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 9479,
		"path": "../public/assets/uyelik-sozlesmesi-Bhg1OFva.js"
	},
	"/assets/yonetim-DZdf_0kT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3f82-HHi0sm74kim9uQSegVcfg6O0k0w\"",
		"mtime": "2026-08-21T07:10:52.282Z",
		"size": 16258,
		"path": "../public/assets/yonetim-DZdf_0kT.js"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"bca-YDePnpR2HUVdIccx2x0O4TskeQM\"",
		"mtime": "2026-08-21T07:10:53.177Z",
		"size": 3018,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"cd9-yJAGzlGRwrAMiMy0HSywTSqXpLA\"",
		"mtime": "2026-08-21T07:10:53.177Z",
		"size": 3289,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"b51-SGJrLA8tnbVJvy09ccAMhGrODkw\"",
		"mtime": "2026-08-21T07:10:53.177Z",
		"size": 2897,
		"path": "../public/certificate-templates/special.svg"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-08-21T07:10:34.107Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-08-21T07:10:53.177Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-08-21T07:10:53.178Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-08-21T07:10:53.178Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-08-21T07:10:53.178Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-08-21T07:10:53.178Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-08-21T07:10:53.178Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-08-21T07:10:53.178Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-08-21T07:10:53.178Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
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
