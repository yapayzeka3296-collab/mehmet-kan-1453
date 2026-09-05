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
		"etag": "\"905-EsQTJqPd3tba66xcc9P3RbXHXEQ\"",
		"mtime": "2026-09-05T11:24:11.998Z",
		"size": 2309,
		"path": "../public/.htaccess"
	},
	"/earth-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"432-7hbnUfYacpJ5GuKlsQ+DIaVE3oM\"",
		"mtime": "2026-09-05T11:24:11.997Z",
		"size": 1074,
		"path": "../public/earth-texture.svg"
	},
	"/cloud-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"200-lvKTdoTfo+30J2I2WxMu97p+hmI\"",
		"mtime": "2026-09-05T11:24:11.997Z",
		"size": 512,
		"path": "../public/cloud-texture.svg"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-09-05T11:24:11.998Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"65e-MHb8tyQvnZqF3VBcapfMngMf+Qc\"",
		"mtime": "2026-09-05T11:24:11.998Z",
		"size": 1630,
		"path": "../public/login-background.css"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-05T11:24:11.998Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-05T11:24:11.998Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"b5-RNSDzi1HBdUvkZk9a+K+w23lY/Q\"",
		"mtime": "2026-09-05T11:24:11.998Z",
		"size": 181,
		"path": "../public/assets/.htaccess"
	},
	"/assets/CertificateTemplatePreview-D0POOyDq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113e-II1cBWk9yJJMZqUGURgkewJyixs\"",
		"mtime": "2026-09-05T11:24:10.623Z",
		"size": 4414,
		"path": "../public/assets/CertificateTemplatePreview-D0POOyDq.js"
	},
	"/assets/CityParcelLivePage-C6e3AKU6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"397c-uwkYDqkRffmnfHcB6H5MrXyHAMw\"",
		"mtime": "2026-09-05T11:24:10.623Z",
		"size": 14716,
		"path": "../public/assets/CityParcelLivePage-C6e3AKU6.js"
	},
	"/assets/Logo-DwFimv2N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1aa-8C7SgmbWQgXf/l2tyDT7dakCxhI\"",
		"mtime": "2026-09-05T11:24:10.623Z",
		"size": 426,
		"path": "../public/assets/Logo-DwFimv2N.js"
	},
	"/assets/MySkyParcelEarthGlobeSafe-DH6Q293b.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18f9-A8+K6J0WMyNweGwcuLatMznApBk\"",
		"mtime": "2026-09-05T11:24:10.623Z",
		"size": 6393,
		"path": "../public/assets/MySkyParcelEarthGlobeSafe-DH6Q293b.js"
	},
	"/assets/ParcelDetailPanel-BCunsiGf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4c45-UcbexuKlHT38F3X/C/+utaB5meo\"",
		"mtime": "2026-09-05T11:24:10.623Z",
		"size": 19525,
		"path": "../public/assets/ParcelDetailPanel-BCunsiGf.js"
	},
	"/assets/SiteFooter-Ca34KokZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1028-ithwN9ey0f3LWOFjwYttpDyiTzE\"",
		"mtime": "2026-09-05T11:24:10.623Z",
		"size": 4136,
		"path": "../public/assets/SiteFooter-Ca34KokZ.js"
	},
	"/assets/SiteHeader-BTnp7NGM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3424-KTG+oyVWYHRObHjJTFVzL3n6Y2o\"",
		"mtime": "2026-09-05T11:24:10.623Z",
		"size": 13348,
		"path": "../public/assets/SiteHeader-BTnp7NGM.js"
	},
	"/assets/TrustBar-CPKaWrUd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"70d-72+l9j+ok1/wSDBVT6aXkBbI8Jg\"",
		"mtime": "2026-09-05T11:24:10.623Z",
		"size": 1805,
		"path": "../public/assets/TrustBar-CPKaWrUd.js"
	},
	"/assets/UserSidebar-BDMm-jkx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b49-1YTJRpy+XU7CrUTbBMrdDXBgxpk\"",
		"mtime": "2026-09-05T11:24:10.623Z",
		"size": 2889,
		"path": "../public/assets/UserSidebar-BDMm-jkx.js"
	},
	"/assets/_slug-C3SbsuPc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2112-ra/7oRqVljSkbrkPiuBLRDxtnMw\"",
		"mtime": "2026-09-05T11:24:10.623Z",
		"size": 8466,
		"path": "../public/assets/_slug-C3SbsuPc.js"
	},
	"/assets/_slug-Db9l5aWw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"27d-OWbZp4aR2iA6cveys+IhrN21r9c\"",
		"mtime": "2026-09-05T11:24:10.623Z",
		"size": 637,
		"path": "../public/assets/_slug-Db9l5aWw.js"
	},
	"/assets/ana-sayfa-CKdiBzSe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24a7-+QW7F8mHbawUQXFJna4DpXUEeas\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 9383,
		"path": "../public/assets/ana-sayfa-CKdiBzSe.js"
	},
	"/assets/arrow-left-C7V7Kb0r.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-YyvaAEIjymULWqNBxlkjDcjCREo\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 161,
		"path": "../public/assets/arrow-left-C7V7Kb0r.js"
	},
	"/assets/arrow-right-DsDMHiFG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-tSiCpbk5g6+KkkBPJGN1qbv6Sl4\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 161,
		"path": "../public/assets/arrow-right-DsDMHiFG.js"
	},
	"/assets/award-BYcAhLU6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e-p4Lq7tvkZQ0qnQRR8T9+KBBJ7XE\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 270,
		"path": "../public/assets/award-BYcAhLU6.js"
	},
	"/assets/bildirimler-B9hPQvRp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a31-51yv4czWM9TVpUKAldAfksBcvVY\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 2609,
		"path": "../public/assets/bildirimler-B9hPQvRp.js"
	},
	"/assets/boxes-Bd6T6x4v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34f-PRqf4SWOJd5cRXV+lxwB/cJTkks\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 847,
		"path": "../public/assets/boxes-Bd6T6x4v.js"
	},
	"/assets/cerez-politikasi-OUEBb7jj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e00-Vc9O7WsDQR1fMbDxYfeTeDqeBPU\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 3584,
		"path": "../public/assets/cerez-politikasi-OUEBb7jj.js"
	},
	"/assets/check-DIHpnxBK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"78-4C+gdp1erM61eyovyW84xpk6InU\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 120,
		"path": "../public/assets/check-DIHpnxBK.js"
	},
	"/assets/certificateTemplates-BRIWk3kA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a2-f0EpRV3zmSolYtn1J/VS00AwWmE\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 25762,
		"path": "../public/assets/certificateTemplates-BRIWk3kA.js"
	},
	"/assets/circle-check-D9cjuKRo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ae-JktNqTLCeB5fsPNZPhgxd5gwMT0\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 174,
		"path": "../public/assets/circle-check-D9cjuKRo.js"
	},
	"/assets/destek-Bv_8InVn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"758-mt7uCKZ//bMzXnKAm/PyknXJxn8\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 1880,
		"path": "../public/assets/destek-Bv_8InVn.js"
	},
	"/assets/dogrula-DcfrJwHr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16aa-drGIooAbUPEWMKyXzpQvL7KRSNc\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 5802,
		"path": "../public/assets/dogrula-DcfrJwHr.js"
	},
	"/assets/eye-Ce_puMWB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fc-UjTN3kuhJ4VFEtVuzm2NBr+ZEZc\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 252,
		"path": "../public/assets/eye-Ce_puMWB.js"
	},
	"/assets/file-badge-CLK7VoSs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c5-DsydYzxjJRu8suyBH84jr59TKv4\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 453,
		"path": "../public/assets/file-badge-CLK7VoSs.js"
	},
	"/assets/gift-DClLMoMA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"159-MoMU0+WBK9XIB9DiZS18UBdeCyY\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 345,
		"path": "../public/assets/gift-DClLMoMA.js"
	},
	"/assets/gizlilik-politikasi-D49eozED.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94c-B1XE4JHZdR5G7mceBfdkhpCYuRc\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 2380,
		"path": "../public/assets/gizlilik-politikasi-D49eozED.js"
	},
	"/assets/giris-B1PtOoRp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b04-KyPK5l8l7pNf3RLGdQtauER8Qg4\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 11012,
		"path": "../public/assets/giris-B1PtOoRp.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-haritasi-BkYf_zBo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9f3-3++VgsXet14M1H3m2DDVQVRYnIE\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 2547,
		"path": "../public/assets/gokyuzu-haritasi-BkYf_zBo.js"
	},
	"/assets/guvenlik-ayarlari-BVr8MW2K.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23c6-rpqMndlRzukM7O+MTm5wcDSDo+Y\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 9158,
		"path": "../public/assets/guvenlik-ayarlari-BVr8MW2K.js"
	},
	"/assets/heart-Bv6Ic3wM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fe-X9vxPcgMIRYxeB6yg8C5ggUQBPg\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 254,
		"path": "../public/assets/heart-Bv6Ic3wM.js"
	},
	"/assets/hakkimizda-DWd7D7zW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef3-lqpDdyFx+6hVBNAjwlG+BWvAt+g\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 7923,
		"path": "../public/assets/hakkimizda-DWd7D7zW.js"
	},
	"/assets/hediye-kabul-Ce6Kc24t.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"180b-j0zzk+Dl3SM2xYAa0BMzyDrazpI\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 6155,
		"path": "../public/assets/hediye-kabul-Ce6Kc24t.js"
	},
	"/assets/hediyelerim-SgOt5mDb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2140-z0P5Zi4LboCACMk1QS0dByGgXf8\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 8512,
		"path": "../public/assets/hediyelerim-SgOt5mDb.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-05T11:24:10.626Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/circle-x-CATOnOET.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cb-QJaohZkr8gU/BXaMsaggSLlta3Y\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 203,
		"path": "../public/assets/circle-x-CATOnOET.js"
	},
	"/assets/iade-iptal-politikasi-UbpTC2zE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"118a-+KEh/6c5W9HoOPdO7b9IrODQC8A\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 4490,
		"path": "../public/assets/iade-iptal-politikasi-UbpTC2zE.js"
	},
	"/assets/iletisim-DAxpZxVF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"772-97Kw4VRBUZziODcmqwL5WUBLwLQ\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 1906,
		"path": "../public/assets/iletisim-DAxpZxVF.js"
	},
	"/assets/index-BIoB9rBL.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"26ac5-Try0tCf2SxM/Bu6af0L8PCAJ6Cc\"",
		"mtime": "2026-09-05T11:24:10.626Z",
		"size": 158405,
		"path": "../public/assets/index-BIoB9rBL.css"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-05T11:24:10.626Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/jsx-runtime-DE3RlOCf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1edb-++aNIhyKgQeSqFVy8og9djQ1xvw\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 7899,
		"path": "../public/assets/jsx-runtime-DE3RlOCf.js"
	},
	"/assets/kayit-ol-Dyr1ZoR8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d55-+TB/E5d3aSjTnebqOtyvHQHcwII\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 7509,
		"path": "../public/assets/kayit-ol-Dyr1ZoR8.js"
	},
	"/assets/kullanim-sartlari-CK1ydyGS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb5-3IDcRFh9UkyrFkqkJKD0z+e5tNc\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 2997,
		"path": "../public/assets/kullanim-sartlari-CK1ydyGS.js"
	},
	"/assets/kvkk-DWJWkLSX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190e-RKiYDvGzRCkGAU7LIedJq1zKXJg\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 6414,
		"path": "../public/assets/kvkk-DWJWkLSX.js"
	},
	"/assets/layers-D1-aI-IN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a1-sbG6rQA2mEzhibsN6LhHVsOXsz8\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 417,
		"path": "../public/assets/layers-D1-aI-IN.js"
	},
	"/assets/index-BU7Zd02P.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4f85d-w6hMILePWJrKfouoeaKalvX5QO0\"",
		"mtime": "2026-09-05T11:24:10.622Z",
		"size": 325725,
		"path": "../public/assets/index-BU7Zd02P.js"
	},
	"/assets/link-D90cKH_E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6586-fb9WKhVhfd8d9CoIJ7QJ59V1DGQ\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 25990,
		"path": "../public/assets/link-D90cKH_E.js"
	},
	"/assets/loader-circle-B6wWvMCv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c-DQKlEdzD8WSoAHwrPqZBC+vCxRs\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 140,
		"path": "../public/assets/loader-circle-B6wWvMCv.js"
	},
	"/assets/lazyRouteComponent-6eKFI5v0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"135f-nHgEw46H/CPx89h/PEbNOk5b65A\"",
		"mtime": "2026-09-05T11:24:10.624Z",
		"size": 4959,
		"path": "../public/assets/lazyRouteComponent-6eKFI5v0.js"
	},
	"/assets/lock-CVSojY-9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ca-lTz/f+7tNcrP8QtSVNRvsnlJUC4\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 202,
		"path": "../public/assets/lock-CVSojY-9.js"
	},
	"/assets/mail-Dg3VWqhn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d1-yekRUZTB2wDkXF5ohc1kal0bVnc\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 209,
		"path": "../public/assets/mail-Dg3VWqhn.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-CC5P4SxI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185c-Yl5AZrYMsZZE71qmJHpSrGs+omc\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 6236,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-CC5P4SxI.js"
	},
	"/assets/nasil-calisir-4Z2sJZzQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1589-D3uXnhsJ55wHL2NLNoZ/CRqLFv4\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 5513,
		"path": "../public/assets/nasil-calisir-4Z2sJZzQ.js"
	},
	"/assets/package-check-Dgh4Zlm7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a6-yxYCYrxOL+pa6pAh1CS5Ty2npLs\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 422,
		"path": "../public/assets/package-check-Dgh4Zlm7.js"
	},
	"/assets/paketler-DJTzn-Vr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14dd-Etb+52uz8C1Ia+CK4bYQ2PuR2WE\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 5341,
		"path": "../public/assets/paketler-DJTzn-Vr.js"
	},
	"/assets/on-bilgilendirme-formu-CWtRSglw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1170-5DRy8OJiGn/myMg1Rlgi6I47law\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 4464,
		"path": "../public/assets/on-bilgilendirme-formu-CWtRSglw.js"
	},
	"/assets/parsel-satin-al-9v0X5ssu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b3-lRXE7+cLNWu1aajRAvWE+mqUxu4\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 1203,
		"path": "../public/assets/parsel-satin-al-9v0X5ssu.js"
	},
	"/assets/panelim-BmVwUuKM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24ea-RWCh1ApO8YUV2QzvsRzQOZZUm84\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 9450,
		"path": "../public/assets/panelim-BmVwUuKM.js"
	},
	"/assets/parsel-satin-al-dxW2W7_O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3120-BqWHnb+S99zgRUMeMZuIOMsVHBo\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 12576,
		"path": "../public/assets/parsel-satin-al-dxW2W7_O.js"
	},
	"/assets/parsellerim-JJW0_t60.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a85-ta2sUjIZgzWnPu168BXS3bbBfpA\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 10885,
		"path": "../public/assets/parsellerim-JJW0_t60.js"
	},
	"/assets/pazar-yeri-CrUBdo7a.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63c-yXTJ8yQ3HXoGpvEZ8KhYk+i6XPM\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 1596,
		"path": "../public/assets/pazar-yeri-CrUBdo7a.js"
	},
	"/assets/phone-Bt4c4Bza.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13e-82hNQ7dFB5QB8F4xX8Rx3e29300\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 318,
		"path": "../public/assets/phone-Bt4c4Bza.js"
	},
	"/assets/play-BJfnRM5d.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ba-enjq0u1yFC9t6iIS1vqkgaNTsWg\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 186,
		"path": "../public/assets/play-BJfnRM5d.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/profilim-5Tm1Hcun.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b98-THzgobszhqaruQbwRHHB4wc0y8w\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 2968,
		"path": "../public/assets/profilim-5Tm1Hcun.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/refresh-cw-CMXdKahV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"41d-6Re/gIb5FAQnP53HYysD6YcSvpc\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 1053,
		"path": "../public/assets/refresh-cw-CMXdKahV.js"
	},
	"/assets/routes-DqTCv1Up.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c4c-VfN+nG7J6Qrvr3M5zQNp8sBRP6E\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 3148,
		"path": "../public/assets/routes-DqTCv1Up.js"
	},
	"/assets/sertifika-dogrula-B788B-IU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16da-vA41aEPf5O5SWaDhgN4kKutSoQQ\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 5850,
		"path": "../public/assets/sertifika-dogrula-B788B-IU.js"
	},
	"/assets/sertifika-dogrula-iHzzU4tf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"495-I5X7M3A/naDQn7GO2pjNzSMk70E\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 1173,
		"path": "../public/assets/sertifika-dogrula-iHzzU4tf.js"
	},
	"/assets/search-DXSy84eM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa-Ox1dA+1+e8AtmT3tHzA31oaJOnY\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 170,
		"path": "../public/assets/search-DXSy84eM.js"
	},
	"/assets/sertifika-talep-Bg7XtKw5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"215d-4AuKOI/pPeUJYHSHcG/8l8qDjbc\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 8541,
		"path": "../public/assets/sertifika-talep-Bg7XtKw5.js"
	},
	"/assets/shield-check-BdI9sz93.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5dd-uqHec4/GyGrHsObNSuNOTetDUcE\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 1501,
		"path": "../public/assets/shield-check-BdI9sz93.js"
	},
	"/assets/sertifikalarim-CdBpe1iS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28bd-m0HcZfDJsTUnzSXcKr+eYtBU8PQ\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 10429,
		"path": "../public/assets/sertifikalarim-CdBpe1iS.js"
	},
	"/assets/sifre-yenile-Bqnjrz8n.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fdc-Fobz/sZtN4QU1TQRqBIu3d8D6Uk\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 4060,
		"path": "../public/assets/sifre-yenile-Bqnjrz8n.js"
	},
	"/assets/sifremi-unuttum-BUwY3K4J.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1899-sa5Qb6JIR7mqeMlI8M2D0RKm8Cg\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 6297,
		"path": "../public/assets/sifremi-unuttum-BUwY3K4J.js"
	},
	"/assets/siparislerim-ByI7kofN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f09-i5F+rqo4XHfbduL3ov+/dOBp/iM\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 3849,
		"path": "../public/assets/siparislerim-ByI7kofN.js"
	},
	"/assets/smartphone-CVIoPJb0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c1-hwyImBjCY7U4jBBpkg2qCXrpOiY\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 193,
		"path": "../public/assets/smartphone-CVIoPJb0.js"
	},
	"/assets/sparkles-C3tZJlv4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ea-spW36x3+8rTQy+XxPQMW0aBtq/I\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 490,
		"path": "../public/assets/sparkles-C3tZJlv4.js"
	},
	"/assets/star-CY2iO-0y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d4-8MuCRFdsJwuVPP2BwQ6/rmziIlU\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 468,
		"path": "../public/assets/star-CY2iO-0y.js"
	},
	"/assets/turkiye-haritasi-Cm6JUcB4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f2d-FTpXQ9qGkJBstV/+9Vk/zLln374\"",
		"mtime": "2026-09-05T11:24:10.626Z",
		"size": 3885,
		"path": "../public/assets/turkiye-haritasi-Cm6JUcB4.js"
	},
	"/assets/useRouter-VMLxvdJG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"236-9wTGogEQs6FVqKrigBHqv3aErX8\"",
		"mtime": "2026-09-05T11:24:10.626Z",
		"size": 566,
		"path": "../public/assets/useRouter-VMLxvdJG.js"
	},
	"/assets/useAuth-1iViKr1p.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"355e1-ZWGsSJMa7csarGC8cCoXRh3nh3M\"",
		"mtime": "2026-09-05T11:24:10.626Z",
		"size": 218593,
		"path": "../public/assets/useAuth-1iViKr1p.js"
	},
	"/assets/user-bX7cVxt3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-/FjrcNlBxdlsFhf8q0pMfa0SX1c\"",
		"mtime": "2026-09-05T11:24:10.626Z",
		"size": 192,
		"path": "../public/assets/user-bX7cVxt3.js"
	},
	"/assets/uyelik-sozlesmesi-DfA-UXnm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a4-8qc9LyR3Wi1LYqjL3bJ/S/8edZ8\"",
		"mtime": "2026-09-05T11:24:10.626Z",
		"size": 9636,
		"path": "../public/assets/uyelik-sozlesmesi-DfA-UXnm.js"
	},
	"/assets/yonetim-BZ8Xn3YK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3a34-0N6BkjfBxwCoWcFFwfedyKePjr0\"",
		"mtime": "2026-09-05T11:24:10.626Z",
		"size": 14900,
		"path": "../public/assets/yonetim-BZ8Xn3YK.js"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c8-aE0wi3G5UwBm20hIOogcLwFw76I\"",
		"mtime": "2026-09-05T11:24:11.995Z",
		"size": 8392,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-05T11:24:11.996Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c4-cuFwIStF+1ItvnpBQQU9Kt9iZVs\"",
		"mtime": "2026-09-05T11:24:11.996Z",
		"size": 8388,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/assets/three.module-C5rh5wLt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b0d0c-yxZrAk456uilGR/GXmPe2vD3V3k\"",
		"mtime": "2026-09-05T11:24:10.625Z",
		"size": 724236,
		"path": "../public/assets/three.module-C5rh5wLt.js"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20b9-i2nAOC3dv8uH13uIuFse9o5qOkg\"",
		"mtime": "2026-09-05T11:24:11.996Z",
		"size": 8377,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-05T11:23:41.284Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-05T11:24:11.996Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-05T11:24:11.998Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-05T11:24:11.996Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-05T11:24:11.997Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-05T11:24:11.997Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-05T11:24:11.997Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-05T11:24:11.997Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-05T11:24:11.996Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-05T11:24:11.997Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-05T11:24:11.997Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-05T11:24:11.998Z",
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
