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
		"etag": "\"8df-y+mXp+gWbBH+67xk5rlDf/aJqkc\"",
		"mtime": "2026-09-04T19:54:27.295Z",
		"size": 2271,
		"path": "../public/.htaccess"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"65e-MHb8tyQvnZqF3VBcapfMngMf+Qc\"",
		"mtime": "2026-09-04T19:54:27.295Z",
		"size": 1630,
		"path": "../public/login-background.css"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-09-04T19:54:27.295Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-04T19:54:27.295Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-04T19:54:27.295Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c8-aE0wi3G5UwBm20hIOogcLwFw76I\"",
		"mtime": "2026-09-04T19:54:27.293Z",
		"size": 8392,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-04T19:54:27.294Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c4-cuFwIStF+1ItvnpBQQU9Kt9iZVs\"",
		"mtime": "2026-09-04T19:54:27.294Z",
		"size": 8388,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-04T19:54:27.294Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20b9-i2nAOC3dv8uH13uIuFse9o5qOkg\"",
		"mtime": "2026-09-04T19:54:27.294Z",
		"size": 8377,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-04T19:54:27.294Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-04T19:53:59.823Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/assets/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"b5-RNSDzi1HBdUvkZk9a+K+w23lY/Q\"",
		"mtime": "2026-09-04T19:54:27.295Z",
		"size": 181,
		"path": "../public/assets/.htaccess"
	},
	"/assets/CityParcelLivePage-C82pyEQ4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"39ca-j6iKHc0kG4gvD+oZwEBd7aLmRKY\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 14794,
		"path": "../public/assets/CityParcelLivePage-C82pyEQ4.js"
	},
	"/assets/Logo-DwFimv2N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1aa-8C7SgmbWQgXf/l2tyDT7dakCxhI\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 426,
		"path": "../public/assets/Logo-DwFimv2N.js"
	},
	"/assets/CertificateTemplatePreview-D0POOyDq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113e-II1cBWk9yJJMZqUGURgkewJyixs\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 4414,
		"path": "../public/assets/CertificateTemplatePreview-D0POOyDq.js"
	},
	"/assets/ParcelDetailPanel-BHKcEk-U.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4bd1-d8GzugoGQpA5HyBsHh8TKu/ZLY0\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 19409,
		"path": "../public/assets/ParcelDetailPanel-BHKcEk-U.js"
	},
	"/assets/SiteFooter-Ca34KokZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1028-ithwN9ey0f3LWOFjwYttpDyiTzE\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 4136,
		"path": "../public/assets/SiteFooter-Ca34KokZ.js"
	},
	"/assets/TrustBar-CPKaWrUd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"70d-72+l9j+ok1/wSDBVT6aXkBbI8Jg\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 1805,
		"path": "../public/assets/TrustBar-CPKaWrUd.js"
	},
	"/assets/SiteHeader-DCf2BnHt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"341b-F9zBL5FJuS+0Gv37nfgwrqWOtFE\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 13339,
		"path": "../public/assets/SiteHeader-DCf2BnHt.js"
	},
	"/assets/UserSidebar-Rez7f5Xj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b4e-chDQxoyLRXEDGCuFdSoGfcJOrEQ\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 2894,
		"path": "../public/assets/UserSidebar-Rez7f5Xj.js"
	},
	"/assets/_slug-7AuEujbA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"213d-Hzf0OnpJ/32Fhvm7V4Z3CwlzHUc\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 8509,
		"path": "../public/assets/_slug-7AuEujbA.js"
	},
	"/assets/_slug-DIHEwUjs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a5-nNntK712zmvnLXQkHZkbewJ5rSM\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 677,
		"path": "../public/assets/_slug-DIHEwUjs.js"
	},
	"/assets/ana-sayfa-MfPaW2GA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24a2-/CwShW5eKTioMfRhGC1f6Ks50Uo\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 9378,
		"path": "../public/assets/ana-sayfa-MfPaW2GA.js"
	},
	"/assets/MySkyParcelEarthGlobe-BchiE1J6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"819af-9XEYFl8z4j6eUoLdNVp4Zsk92wI\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 530863,
		"path": "../public/assets/MySkyParcelEarthGlobe-BchiE1J6.js"
	},
	"/assets/arrow-right-DsDMHiFG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-tSiCpbk5g6+KkkBPJGN1qbv6Sl4\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 161,
		"path": "../public/assets/arrow-right-DsDMHiFG.js"
	},
	"/assets/award-BYcAhLU6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e-p4Lq7tvkZQ0qnQRR8T9+KBBJ7XE\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 270,
		"path": "../public/assets/award-BYcAhLU6.js"
	},
	"/assets/bildirimler-C6GmbGU3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5c-ijWQsYv0DF2bl95VxAPAtutBAeI\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 2652,
		"path": "../public/assets/bildirimler-C6GmbGU3.js"
	},
	"/assets/boxes-Bd6T6x4v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34f-PRqf4SWOJd5cRXV+lxwB/cJTkks\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 847,
		"path": "../public/assets/boxes-Bd6T6x4v.js"
	},
	"/assets/cerez-politikasi-BQDwwwlH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e00-+xTSNMAsY7kQVVsl/fY+5fr9yGU\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 3584,
		"path": "../public/assets/cerez-politikasi-BQDwwwlH.js"
	},
	"/assets/certificateTemplates-BRIWk3kA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a2-f0EpRV3zmSolYtn1J/VS00AwWmE\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 25762,
		"path": "../public/assets/certificateTemplates-BRIWk3kA.js"
	},
	"/assets/check-DIHpnxBK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"78-4C+gdp1erM61eyovyW84xpk6InU\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 120,
		"path": "../public/assets/check-DIHpnxBK.js"
	},
	"/assets/circle-check-D9cjuKRo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ae-JktNqTLCeB5fsPNZPhgxd5gwMT0\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 174,
		"path": "../public/assets/circle-check-D9cjuKRo.js"
	},
	"/assets/circle-x-CATOnOET.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cb-QJaohZkr8gU/BXaMsaggSLlta3Y\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 203,
		"path": "../public/assets/circle-x-CATOnOET.js"
	},
	"/assets/dogrula-DQ76ty7v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16da-SCo7P9a3YZTwnUwYDY736Jezwe4\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 5850,
		"path": "../public/assets/dogrula-DQ76ty7v.js"
	},
	"/assets/eye-Ce_puMWB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fc-UjTN3kuhJ4VFEtVuzm2NBr+ZEZc\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 252,
		"path": "../public/assets/eye-Ce_puMWB.js"
	},
	"/assets/file-badge-CLK7VoSs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c5-DsydYzxjJRu8suyBH84jr59TKv4\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 453,
		"path": "../public/assets/file-badge-CLK7VoSs.js"
	},
	"/assets/gift-DClLMoMA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"159-MoMU0+WBK9XIB9DiZS18UBdeCyY\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 345,
		"path": "../public/assets/gift-DClLMoMA.js"
	},
	"/assets/giris-DrE-Vai0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b2f-/Ue8zq/CAOOUZAnRfQCD3D26lDU\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 11055,
		"path": "../public/assets/giris-DrE-Vai0.js"
	},
	"/assets/gizlilik-politikasi-BVxuSMb7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94c-UMLTILh9wxdrkL1zKUm1Qf8D9xk\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 2380,
		"path": "../public/assets/gizlilik-politikasi-BVxuSMb7.js"
	},
	"/assets/arrow-left-C7V7Kb0r.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-YyvaAEIjymULWqNBxlkjDcjCREo\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 161,
		"path": "../public/assets/arrow-left-C7V7Kb0r.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-haritasi-DYzz1fDW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a14-BT6mi4R+B/p74l7FenOJZaSFrws\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 2580,
		"path": "../public/assets/gokyuzu-haritasi-DYzz1fDW.js"
	},
	"/assets/guvenlik-ayarlari-Bcspz-wi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23f6-NVAGvuLRGrj3NqbRjncaiIxtXsM\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 9206,
		"path": "../public/assets/guvenlik-ayarlari-Bcspz-wi.js"
	},
	"/assets/hakkimizda-DiKh2BUY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef3-166QdZF09eb2aTkR7yrBwD75Av0\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 7923,
		"path": "../public/assets/hakkimizda-DiKh2BUY.js"
	},
	"/assets/heart-Bv6Ic3wM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fe-X9vxPcgMIRYxeB6yg8C5ggUQBPg\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 254,
		"path": "../public/assets/heart-Bv6Ic3wM.js"
	},
	"/assets/hediye-kabul-DSM0BGkt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"183b-tr1ty6iWrTBufp22kBgNkWkvdZQ\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 6203,
		"path": "../public/assets/hediye-kabul-DSM0BGkt.js"
	},
	"/assets/hediyelerim-DN7pYOmL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"216b-JSb5nZEWIGE3R48jrRbZsN/YcWU\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 8555,
		"path": "../public/assets/hediyelerim-DN7pYOmL.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/iade-iptal-politikasi-ColDfe34.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"118a-ZIiSazic/mhD2R35YzRmBmQqKjw\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 4490,
		"path": "../public/assets/iade-iptal-politikasi-ColDfe34.js"
	},
	"/assets/iletisim-Dk6gJyW7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15c5-27Iyo+MRTYRumW2H5ubSmnoUghU\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 5573,
		"path": "../public/assets/iletisim-Dk6gJyW7.js"
	},
	"/assets/index-C8brGzGO.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"268d4-pkccOaUUICUQ6RnKsIV/Pv0+mco\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 157908,
		"path": "../public/assets/index-C8brGzGO.css"
	},
	"/assets/kayit-ol-_JmJ9B40.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d55-Hb252TRvuuwyqyt22pz40Hlf9Gk\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 7509,
		"path": "../public/assets/kayit-ol-_JmJ9B40.js"
	},
	"/assets/index-DNzu91Jj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4f7b2-y8WcTYfU/eYgUYB7+YjrIbtNOag\"",
		"mtime": "2026-09-04T19:54:26.000Z",
		"size": 325554,
		"path": "../public/assets/index-DNzu91Jj.js"
	},
	"/assets/jsx-runtime-DE3RlOCf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1edb-++aNIhyKgQeSqFVy8og9djQ1xvw\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 7899,
		"path": "../public/assets/jsx-runtime-DE3RlOCf.js"
	},
	"/assets/kullanim-sartlari-DbKmZj3k.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb5-k3uKIn+CBSvTdN8HXcOuL2MWJc0\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 2997,
		"path": "../public/assets/kullanim-sartlari-DbKmZj3k.js"
	},
	"/assets/kvkk-ZBa3Hh9K.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190e-Jrpi3KMPdczTe1VYpLaGsqD8m3s\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 6414,
		"path": "../public/assets/kvkk-ZBa3Hh9K.js"
	},
	"/assets/layers-D1-aI-IN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a1-sbG6rQA2mEzhibsN6LhHVsOXsz8\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 417,
		"path": "../public/assets/layers-D1-aI-IN.js"
	},
	"/assets/lazyRouteComponent-BcnOwrpE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1366-AzkDoEBsxDKr8pFJ7pAAUif2bFs\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 4966,
		"path": "../public/assets/lazyRouteComponent-BcnOwrpE.js"
	},
	"/assets/link-D90cKH_E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6586-fb9WKhVhfd8d9CoIJ7QJ59V1DGQ\"",
		"mtime": "2026-09-04T19:54:26.001Z",
		"size": 25990,
		"path": "../public/assets/link-D90cKH_E.js"
	},
	"/assets/loader-circle-B6wWvMCv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c-DQKlEdzD8WSoAHwrPqZBC+vCxRs\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 140,
		"path": "../public/assets/loader-circle-B6wWvMCv.js"
	},
	"/assets/lock-CVSojY-9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ca-lTz/f+7tNcrP8QtSVNRvsnlJUC4\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 202,
		"path": "../public/assets/lock-CVSojY-9.js"
	},
	"/assets/mail-Dg3VWqhn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d1-yekRUZTB2wDkXF5ohc1kal0bVnc\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 209,
		"path": "../public/assets/mail-Dg3VWqhn.js"
	},
	"/assets/map-pin-B02bdBCa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-/Fo1iY7GJCry4eS130Lllu5NbQE\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 255,
		"path": "../public/assets/map-pin-B02bdBCa.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-BmwKJ03G.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185c-fzYvLM4U0CvHvR4Lvp+5Oej+KbA\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 6236,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-BmwKJ03G.js"
	},
	"/assets/nasil-calisir-EPO7w0HC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1589-VKQb3UWzqWI2H9IqS7B0w2c4XFk\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 5513,
		"path": "../public/assets/nasil-calisir-EPO7w0HC.js"
	},
	"/assets/on-bilgilendirme-formu-DwuQhAyx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1170-dDBbMhFNAMbzfUHjAxZh0DkyPD8\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 4464,
		"path": "../public/assets/on-bilgilendirme-formu-DwuQhAyx.js"
	},
	"/assets/package-check-Dgh4Zlm7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a6-yxYCYrxOL+pa6pAh1CS5Ty2npLs\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 422,
		"path": "../public/assets/package-check-Dgh4Zlm7.js"
	},
	"/assets/paketler-L6eSluhr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14dd-b4kKIlvo5Vg6GMjlBWyuiYcO5rU\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 5341,
		"path": "../public/assets/paketler-L6eSluhr.js"
	},
	"/assets/panelim-ChTDRwi8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"251f-q673gszTt1DilAKaSjmDU6y8DT0\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 9503,
		"path": "../public/assets/panelim-ChTDRwi8.js"
	},
	"/assets/parsel-satin-al-BkGN_a1M.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4db-RU8kr9I5pEvzMk+VlxUFwEiKU3w\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 1243,
		"path": "../public/assets/parsel-satin-al-BkGN_a1M.js"
	},
	"/assets/parsel-satin-al-C9Hn_rz5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c97-07OeA5WEiFLogUez0TlpbBkmCiw\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 11415,
		"path": "../public/assets/parsel-satin-al-C9Hn_rz5.js"
	},
	"/assets/parsellerim-BuKTok__.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2aad-gATOKwk8BK580xrpAVZYqYIanxU\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 10925,
		"path": "../public/assets/parsellerim-BuKTok__.js"
	},
	"/assets/pazar-yeri-tX4DvVJG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63c-1dEwxFdmqM2SRQ+C2aL2oA1t8Oc\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 1596,
		"path": "../public/assets/pazar-yeri-tX4DvVJG.js"
	},
	"/assets/phone-Bt4c4Bza.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13e-82hNQ7dFB5QB8F4xX8Rx3e29300\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 318,
		"path": "../public/assets/phone-Bt4c4Bza.js"
	},
	"/assets/play-BJfnRM5d.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ba-enjq0u1yFC9t6iIS1vqkgaNTsWg\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 186,
		"path": "../public/assets/play-BJfnRM5d.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/profilim-DVqmQMU0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bc8-1rLjMed6+2XKNfYYC4bvqrEP43c\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 3016,
		"path": "../public/assets/profilim-DVqmQMU0.js"
	},
	"/assets/refresh-cw-CMXdKahV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"41d-6Re/gIb5FAQnP53HYysD6YcSvpc\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 1053,
		"path": "../public/assets/refresh-cw-CMXdKahV.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/routes-CdQQKoK8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa6-TMZs5vAjmLqMAEOxBk6oSoYX13k\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 2726,
		"path": "../public/assets/routes-CdQQKoK8.js"
	},
	"/assets/search-DXSy84eM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa-Ox1dA+1+e8AtmT3tHzA31oaJOnY\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 170,
		"path": "../public/assets/search-DXSy84eM.js"
	},
	"/assets/sertifika-dogrula-CPJFVkWc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4bd-qkg1/fIiyWDUL445fYN0DrIIcPo\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 1213,
		"path": "../public/assets/sertifika-dogrula-CPJFVkWc.js"
	},
	"/assets/sertifika-dogrula-CctSXiLZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16e2-5ulVYgyHTqwOaiyvKtvHUCF98Sw\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 5858,
		"path": "../public/assets/sertifika-dogrula-CctSXiLZ.js"
	},
	"/assets/sertifika-talep-8_Tzhkj6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2188-L9seC6571k7WAjJ8JeCCfg2iqak\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 8584,
		"path": "../public/assets/sertifika-talep-8_Tzhkj6.js"
	},
	"/assets/sertifikalarim-BE3nJW_l.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28ed-FjNJ34O34KcWlGkxRETYtIlNgqg\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 10477,
		"path": "../public/assets/sertifikalarim-BE3nJW_l.js"
	},
	"/assets/shield-check-BdI9sz93.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5dd-uqHec4/GyGrHsObNSuNOTetDUcE\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 1501,
		"path": "../public/assets/shield-check-BdI9sz93.js"
	},
	"/assets/sifre-yenile-DcuUvGpM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1007-cVxwadhYwtQ5S2khYH2tOYslO6U\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 4103,
		"path": "../public/assets/sifre-yenile-DcuUvGpM.js"
	},
	"/assets/sifremi-unuttum-BwG3h3tl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18a6-DYmphj21YCS55vxXr4wCRkTPRrI\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 6310,
		"path": "../public/assets/sifremi-unuttum-BwG3h3tl.js"
	},
	"/assets/siparislerim-UmBwZHi7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f34-BIYXXQSX1X202NfGg4SHfX5jbjE\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 3892,
		"path": "../public/assets/siparislerim-UmBwZHi7.js"
	},
	"/assets/smartphone-CVIoPJb0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c1-hwyImBjCY7U4jBBpkg2qCXrpOiY\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 193,
		"path": "../public/assets/smartphone-CVIoPJb0.js"
	},
	"/assets/sparkles-C3tZJlv4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ea-spW36x3+8rTQy+XxPQMW0aBtq/I\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 490,
		"path": "../public/assets/sparkles-C3tZJlv4.js"
	},
	"/assets/star-CY2iO-0y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d4-8MuCRFdsJwuVPP2BwQ6/rmziIlU\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 468,
		"path": "../public/assets/star-CY2iO-0y.js"
	},
	"/assets/turkiye-haritasi-DJKx2P40.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f08-1PQ3SZIIx1AMshB6pZ0B4bwYzq8\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 3848,
		"path": "../public/assets/turkiye-haritasi-DJKx2P40.js"
	},
	"/assets/useAuth-DU37Xl8_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19ca-FtVnMQSBa7x4nQqChRaaFNMxgjc\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 6602,
		"path": "../public/assets/useAuth-DU37Xl8_.js"
	},
	"/assets/supabaseBrowser-DPbf7JGk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"33c92-QDY8prCcZYH5Ziwu1I9LWwa9JPU\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 212114,
		"path": "../public/assets/supabaseBrowser-DPbf7JGk.js"
	},
	"/assets/useRouter-VMLxvdJG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"236-9wTGogEQs6FVqKrigBHqv3aErX8\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 566,
		"path": "../public/assets/useRouter-VMLxvdJG.js"
	},
	"/assets/user-bX7cVxt3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-/FjrcNlBxdlsFhf8q0pMfa0SX1c\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 192,
		"path": "../public/assets/user-bX7cVxt3.js"
	},
	"/assets/uyelik-sozlesmesi-vxDTMwH9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a4-HOVogZEp1KseTbBpju+Ugrr5GuI\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 9636,
		"path": "../public/assets/uyelik-sozlesmesi-vxDTMwH9.js"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-04T19:54:27.294Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/assets/yonetim-HWugadT5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3a5f-iOLbBceMxaiSxGZMKhr3Xx1ZCX4\"",
		"mtime": "2026-09-04T19:54:26.002Z",
		"size": 14943,
		"path": "../public/assets/yonetim-HWugadT5.js"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-04T19:54:27.295Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-04T19:54:27.295Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-04T19:54:27.295Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-04T19:54:27.295Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-04T19:54:27.295Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-04T19:54:27.295Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-04T19:54:27.295Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-04T19:54:27.295Z",
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
