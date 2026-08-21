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
		"mtime": "2026-08-21T15:09:58.308Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/favicon.svg": {
		"type": "image/svg+xml",
		"etag": "\"42c-tdPpzaFW5rv0ZIu44S07iJmDzvE\"",
		"mtime": "2026-08-21T15:09:58.308Z",
		"size": 1068,
		"path": "../public/favicon.svg"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"345-auSYwhMQnC06JZD4GteGwLfuYW4\"",
		"mtime": "2026-08-21T15:09:58.308Z",
		"size": 837,
		"path": "../public/login-background.css"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-08-21T15:09:58.308Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-08-21T15:09:58.308Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-08-21T15:09:58.308Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/SiteFooter-DW5nejfD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9a9b-I6LsKJnr6BWniDhoUCR0z31nCRc\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 39579,
		"path": "../public/assets/SiteFooter-DW5nejfD.js"
	},
	"/assets/TrustBar-BLGHtEAJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"852-BR9vQE3MIRToJ6gOzvdXVPb0Nns\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 2130,
		"path": "../public/assets/TrustBar-BLGHtEAJ.js"
	},
	"/assets/UserSidebar-DUcQGj_M.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"91d-IBRzhDAI5FIiOMuwiY41JRWLlAw\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 2333,
		"path": "../public/assets/UserSidebar-DUcQGj_M.js"
	},
	"/assets/arrow-left-C3wqhqg5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-uZECr+XWRVhfuIOTiZyBtcPpAuM\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 161,
		"path": "../public/assets/arrow-left-C3wqhqg5.js"
	},
	"/assets/arrow-right-CXkGkxm3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-5Keojm4hpmAZnshzaAryjEj+dc4\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 161,
		"path": "../public/assets/arrow-right-CXkGkxm3.js"
	},
	"/assets/award-Dr5bqk56.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e-v7F4CIey/+keJsl5nhqcr47El5k\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 270,
		"path": "../public/assets/award-Dr5bqk56.js"
	},
	"/assets/boxes-Dj8Q5Ume.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34f-mCdayIfcCCsdNMC10zbeyg/BmlY\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 847,
		"path": "../public/assets/boxes-Dj8Q5Ume.js"
	},
	"/assets/cerez-politikasi-BXhi409W.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7b8-h/Pko/iWbyVgvV3bibGysjVNigY\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 1976,
		"path": "../public/assets/cerez-politikasi-BXhi409W.js"
	},
	"/assets/check-BA7TPPjN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"78-G6gvSUV4cNsXbcmnPJDdyB0RelA\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 120,
		"path": "../public/assets/check-BA7TPPjN.js"
	},
	"/assets/circle-check-Cwardrv_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ae-QTM6GQZmmmvhKZNlXudvMNZd7x4\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 174,
		"path": "../public/assets/circle-check-Cwardrv_.js"
	},
	"/assets/dogrula-BxQ4ssO0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b23-b1qpFDbnSQedWtc4A4wKFi2BKPM\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 2851,
		"path": "../public/assets/dogrula-BxQ4ssO0.js"
	},
	"/assets/eye-DQtcW7R7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fc-YAjDv/l/z2TxNrsQRNjjO0V4noI\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 252,
		"path": "../public/assets/eye-DQtcW7R7.js"
	},
	"/assets/giris-raKi_usj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b47-eHgKzaz7ujbssvSMKxm1nTQueaM\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 11079,
		"path": "../public/assets/giris-raKi_usj.js"
	},
	"/assets/gizlilik-politikasi-CKs7tES3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"92f-xWP7w4jFp7IEheUHpxbiAZz6fPI\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 2351,
		"path": "../public/assets/gizlilik-politikasi-CKs7tES3.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/globe-hsPrXLUF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ee-HByJuLRteOKhjefuF9oio1L6z9Y\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 238,
		"path": "../public/assets/globe-hsPrXLUF.js"
	},
	"/assets/gokyuzu-haritasi-BS5IlhnC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6c3a-hAeGzEmKCzuEYvC1sz+AHgKwZ0I\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 27706,
		"path": "../public/assets/gokyuzu-haritasi-BS5IlhnC.js"
	},
	"/assets/gokyuzu-haritasi-YN8QlKKs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dfc5-MVgs6brelnPXQluZhM4ZpskK+aI\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 57285,
		"path": "../public/assets/gokyuzu-haritasi-YN8QlKKs.js"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/heart-DIRi9Pmk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fe-h+VM76fPdw/pDIJMieIpRJpbtlU\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 254,
		"path": "../public/assets/heart-DIRi9Pmk.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-08-21T15:09:57.247Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/iletisim-CH36EROf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c31-paMI3FYrjEL8d+XCftzFOGRs3BU\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 3121,
		"path": "../public/assets/iletisim-CH36EROf.js"
	},
	"/assets/index-nrBrkL7U.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4d6dc-vFhghSLsuPc/K/PUNb9XFHLi+Tw\"",
		"mtime": "2026-08-21T15:09:57.244Z",
		"size": 317148,
		"path": "../public/assets/index-nrBrkL7U.js"
	},
	"/assets/kayit-ol-D0Y9SFne.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1846-tBjBkqsleBwhkkQ/pXHTXxFDMY8\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 6214,
		"path": "../public/assets/kayit-ol-D0Y9SFne.js"
	},
	"/assets/kullanim-sartlari-CJ0Q10bO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b98-KFgX0+S3xprh/rKQGObstx8Eqp0\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 2968,
		"path": "../public/assets/kullanim-sartlari-CJ0Q10bO.js"
	},
	"/assets/kvkk-1FOLRk3Z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"165d-McXyCJEJH9KcMPhqBeqCVHUgdfc\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 5725,
		"path": "../public/assets/kvkk-1FOLRk3Z.js"
	},
	"/assets/layers-BwmOUYQV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a1-GXLbxpgIc9uLk3jVWXknSvEDgxk\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 417,
		"path": "../public/assets/layers-BwmOUYQV.js"
	},
	"/assets/loader-circle-xFYAyGHl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c-Id7ZOHl+TUj+DlsDuWHK5qFWPAA\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 140,
		"path": "../public/assets/loader-circle-xFYAyGHl.js"
	},
	"/assets/lock-CWAJKPO4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ca-A5z5QbGXb/9IvrnnUaX9gJUlvjM\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 202,
		"path": "../public/assets/lock-CWAJKPO4.js"
	},
	"/assets/guvenlik-ayarlari-DptrLbEv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1f01-PA5pKeM0sudEGSV3CGacpGwkDdM\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 7937,
		"path": "../public/assets/guvenlik-ayarlari-DptrLbEv.js"
	},
	"/assets/log-out-ByIV3XEY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e2-ihjREgGGGMnYpj+/83rElYJWrzA\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 226,
		"path": "../public/assets/log-out-ByIV3XEY.js"
	},
	"/assets/mail-Bx9S1yIB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d1-9TUCMuBKpiqJtMC2Zj/bbQyTbxA\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 209,
		"path": "../public/assets/mail-Bx9S1yIB.js"
	},
	"/assets/map-pin-DLJQHpZm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-5ZvD/QwZVjT3HK1V/rDsK5YNBLU\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 255,
		"path": "../public/assets/map-pin-DLJQHpZm.js"
	},
	"/assets/nasil-calisir-CpIdsfph.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1567-orHLSowQNRRXYRZXnGh5Xes8vOc\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 5479,
		"path": "../public/assets/nasil-calisir-CpIdsfph.js"
	},
	"/assets/odeme-B26OKOkb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b6-jpp9nFLA0EVgd11iWV67xgODyM4\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 694,
		"path": "../public/assets/odeme-B26OKOkb.js"
	},
	"/assets/odeme-CJwqFN1o.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13b5-KO7sE4aSk3YQmZ8eTH688HFab2A\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 5045,
		"path": "../public/assets/odeme-CJwqFN1o.js"
	},
	"/assets/paketler-CKHPZDDH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"11d5-nNwyxkjfWpzBcrcMFFRk1m0HmXA\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 4565,
		"path": "../public/assets/paketler-CKHPZDDH.js"
	},
	"/assets/panelim-D5ePutBI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"168a-XdRIQhhNgq4vtnJpCt74RJ6oLyI\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 5770,
		"path": "../public/assets/panelim-D5ePutBI.js"
	},
	"/assets/parsel-satin-al-Byy58LU8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"366-wZLxtfos6NyeaC0I7KX8+KxJVhU\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 870,
		"path": "../public/assets/parsel-satin-al-Byy58LU8.js"
	},
	"/assets/parsel-satin-al-CPYp7WbZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"112e-LDk3ZVUepzfhWTWziOiFHv1gnmY\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 4398,
		"path": "../public/assets/parsel-satin-al-CPYp7WbZ.js"
	},
	"/assets/parsellerim-BxrqO8X2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3cbe-PkDTvfcPgspfQMlBJtrazoLAn24\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 15550,
		"path": "../public/assets/parsellerim-BxrqO8X2.js"
	},
	"/assets/hakkimizda-BggkU91u.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef2-fI2ePnwwAE7yKdcQ12jMsiBniZU\"",
		"mtime": "2026-08-21T15:09:57.245Z",
		"size": 7922,
		"path": "../public/assets/hakkimizda-BggkU91u.js"
	},
	"/assets/pazar-yeri-BN6w5tBH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"61f-Qyv1dD1zj/7pyFxzgzwjdd7rDGc\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 1567,
		"path": "../public/assets/pazar-yeri-BN6w5tBH.js"
	},
	"/assets/profilim-CnRC_SwF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b45-tSjbwkwq735HbcBhENq7SJI4W2c\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 2885,
		"path": "../public/assets/profilim-CnRC_SwF.js"
	},
	"/assets/preload-helper-qrTBIh1z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1793-YAKKb0eYzCRb91r8Po/a5giXaQY\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 6035,
		"path": "../public/assets/preload-helper-qrTBIh1z.js"
	},
	"/assets/refresh-cw-B1j5q3s5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13d-lOMj42jsaMqz9VDXV2bzgLoViNM\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 317,
		"path": "../public/assets/refresh-cw-B1j5q3s5.js"
	},
	"/assets/routes-DXYnahaS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24b9-aBaLDW/svb5V7j6k4z/vE86Dsik\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 9401,
		"path": "../public/assets/routes-DXYnahaS.js"
	},
	"/assets/search-Bp7vpn7U.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa-Ng1Z/ug4tZjGnpTYoqC6n8T3HUo\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 170,
		"path": "../public/assets/search-Bp7vpn7U.js"
	},
	"/assets/sertifika-dogrula-B0FhTznl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3c9-3UoN2UwnbuDSks47nml6GXCyQCQ\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 969,
		"path": "../public/assets/sertifika-dogrula-B0FhTznl.js"
	},
	"/assets/sertifika-dogrula-zHt6ObDp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1664-xgnsO2GzbVv9brC6he2Bk1I0En8\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 5732,
		"path": "../public/assets/sertifika-dogrula-zHt6ObDp.js"
	},
	"/assets/sertifika-talep-Cff6mwZa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dcf-nq67EY9ZjrI/euUb7hOx1e5g9Yo\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 3535,
		"path": "../public/assets/sertifika-talep-Cff6mwZa.js"
	},
	"/assets/sertifikalarim-poQH26Gy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"213c-qLi31f+BX4MNpcOVXXYNKU9W6n8\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 8508,
		"path": "../public/assets/sertifikalarim-poQH26Gy.js"
	},
	"/assets/shield-check-gcS1keq9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5b5-QfObyiy0G0ehhWv2zs21d8NFwZk\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 1461,
		"path": "../public/assets/shield-check-gcS1keq9.js"
	},
	"/assets/sifre-yenile-DjRJL4V-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f6e-UTaU1+SWmIOfmHvzibEC4qVeGJo\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 3950,
		"path": "../public/assets/sifre-yenile-DjRJL4V-.js"
	},
	"/assets/sifremi-unuttum-CqPkwjeL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1826-pHlAiWBUmyhxW5ysn2qa9YQpHkw\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 6182,
		"path": "../public/assets/sifremi-unuttum-CqPkwjeL.js"
	},
	"/assets/siparislerim-Dh-fpvbA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ece-w1bjY3plVeBkem7J5eKn+7DR5ho\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 3790,
		"path": "../public/assets/siparislerim-Dh-fpvbA.js"
	},
	"/assets/star-4rVXd1-n.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d4-AfU1jTthd4c1lhCbkwAiqqhcb98\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 468,
		"path": "../public/assets/star-4rVXd1-n.js"
	},
	"/assets/sparkles-DakyMY82.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ea-AdVxIr/2B4JcBXCPBGzdR4cT/Sk\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 490,
		"path": "../public/assets/sparkles-DakyMY82.js"
	},
	"/assets/styles-D99r_CKn.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1fb4e-OnDByHPNAoop4rZoVx6bGOBn1qo\"",
		"mtime": "2026-08-21T15:09:57.247Z",
		"size": 129870,
		"path": "../public/assets/styles-D99r_CKn.css"
	},
	"/assets/useAuth-COu_2RDX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7b55-ielo/mwaFpXG2Uo1HHQF9zCy+7k\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 31573,
		"path": "../public/assets/useAuth-COu_2RDX.js"
	},
	"/assets/user-BHFafj9E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-fWQcl01QRuuaKC19NeAGkGXfMZI\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 192,
		"path": "../public/assets/user-BHFafj9E.js"
	},
	"/assets/uyelik-sozlesmesi-CWYR1XMp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2507-T6GsIZyJzGeqhB7MKVfmUtCLBak\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 9479,
		"path": "../public/assets/uyelik-sozlesmesi-CWYR1XMp.js"
	},
	"/assets/supabaseBrowser-B0MRA0GY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"357ce-SKy+xElLYax/qAgBticsUSAu+EU\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 219086,
		"path": "../public/assets/supabaseBrowser-B0MRA0GY.js"
	},
	"/assets/yonetim-ChBAx90c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3f82-fdyl28c0TYA2FM/6O34hVX/u7Nk\"",
		"mtime": "2026-08-21T15:09:57.246Z",
		"size": 16258,
		"path": "../public/assets/yonetim-ChBAx90c.js"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"cd9-yJAGzlGRwrAMiMy0HSywTSqXpLA\"",
		"mtime": "2026-08-21T15:09:58.306Z",
		"size": 3289,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"bca-YDePnpR2HUVdIccx2x0O4TskeQM\"",
		"mtime": "2026-08-21T15:09:58.306Z",
		"size": 3018,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"b51-SGJrLA8tnbVJvy09ccAMhGrODkw\"",
		"mtime": "2026-08-21T15:09:58.306Z",
		"size": 2897,
		"path": "../public/certificate-templates/special.svg"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-08-21T15:09:44.067Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-08-21T15:09:58.307Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-08-21T15:09:58.307Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-08-21T15:09:58.307Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-08-21T15:09:58.307Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-08-21T15:09:58.307Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-08-21T15:09:58.307Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-08-21T15:09:58.306Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-08-21T15:09:58.307Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
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
