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
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-09-04T06:57:42.676Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"65e-MHb8tyQvnZqF3VBcapfMngMf+Qc\"",
		"mtime": "2026-09-04T06:57:42.676Z",
		"size": 1630,
		"path": "../public/login-background.css"
	},
	"/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"b3-q4U+Lz+OA1IC7zeKuGfh6t/KoAc\"",
		"mtime": "2026-09-04T06:57:42.676Z",
		"size": 179,
		"path": "../public/.htaccess"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-04T06:57:42.676Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-04T06:57:42.676Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"cd-FaeMXcnpfSW7Q5Y1D4GWmlv/CWs\"",
		"mtime": "2026-09-04T06:57:42.677Z",
		"size": 205,
		"path": "../public/assets/.htaccess"
	},
	"/assets/CertificateTemplatePreview-D0POOyDq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113e-II1cBWk9yJJMZqUGURgkewJyixs\"",
		"mtime": "2026-09-04T06:57:41.710Z",
		"size": 4414,
		"path": "../public/assets/CertificateTemplatePreview-D0POOyDq.js"
	},
	"/assets/CityParcelLivePage-Ou56FBAK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"399f-jSlMzVPyQCizkjPwHh5gm16YQgw\"",
		"mtime": "2026-09-04T06:57:41.710Z",
		"size": 14751,
		"path": "../public/assets/CityParcelLivePage-Ou56FBAK.js"
	},
	"/assets/Logo-DwFimv2N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1aa-8C7SgmbWQgXf/l2tyDT7dakCxhI\"",
		"mtime": "2026-09-04T06:57:41.710Z",
		"size": 426,
		"path": "../public/assets/Logo-DwFimv2N.js"
	},
	"/assets/SiteFooter-Ca34KokZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1028-ithwN9ey0f3LWOFjwYttpDyiTzE\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 4136,
		"path": "../public/assets/SiteFooter-Ca34KokZ.js"
	},
	"/assets/ParcelDetailPanel-BALNxDzk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ba6-2PRRZmzTDVHRKbZEqiZ1EmRCsMk\"",
		"mtime": "2026-09-04T06:57:41.710Z",
		"size": 19366,
		"path": "../public/assets/ParcelDetailPanel-BALNxDzk.js"
	},
	"/assets/SiteHeader-DDhJ20LZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"335a-td2a9GG9wj+/cEcFwhSWxwYwEuE\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 13146,
		"path": "../public/assets/SiteHeader-DDhJ20LZ.js"
	},
	"/assets/TrustBar-CPKaWrUd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"70d-72+l9j+ok1/wSDBVT6aXkBbI8Jg\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 1805,
		"path": "../public/assets/TrustBar-CPKaWrUd.js"
	},
	"/assets/UserSidebar-BeD4Cash.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b49-rm72hBG3dQCsRdVAmjRqINHmUUQ\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 2889,
		"path": "../public/assets/UserSidebar-BeD4Cash.js"
	},
	"/assets/_slug-CNDLvlaE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"27d-pisDcYcMMZ/uTfeDKF6D06LamLk\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 637,
		"path": "../public/assets/_slug-CNDLvlaE.js"
	},
	"/assets/_slug-DymUsVSx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2112-/0lNLi0rWu1JJckQWFLxyjcnKu8\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 8466,
		"path": "../public/assets/_slug-DymUsVSx.js"
	},
	"/assets/ana-sayfa-DdSQ4nrs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24a7-5yRiN65EknLmoO3pqHbxrLjLGjY\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 9383,
		"path": "../public/assets/ana-sayfa-DdSQ4nrs.js"
	},
	"/assets/arrow-left-C7V7Kb0r.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-YyvaAEIjymULWqNBxlkjDcjCREo\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 161,
		"path": "../public/assets/arrow-left-C7V7Kb0r.js"
	},
	"/assets/arrow-right-DsDMHiFG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1-tSiCpbk5g6+KkkBPJGN1qbv6Sl4\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 161,
		"path": "../public/assets/arrow-right-DsDMHiFG.js"
	},
	"/assets/award-BYcAhLU6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e-p4Lq7tvkZQ0qnQRR8T9+KBBJ7XE\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 270,
		"path": "../public/assets/award-BYcAhLU6.js"
	},
	"/assets/bildirimler-DYfA8ayN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a31-1TD7BhWbm84gvgvXnm0W/x4D53k\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 2609,
		"path": "../public/assets/bildirimler-DYfA8ayN.js"
	},
	"/assets/boxes-Bd6T6x4v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34f-PRqf4SWOJd5cRXV+lxwB/cJTkks\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 847,
		"path": "../public/assets/boxes-Bd6T6x4v.js"
	},
	"/assets/cerez-politikasi-CBkS2PiZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e00-hK/EHBrpC11F4+GdnEArYBKwE3o\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 3584,
		"path": "../public/assets/cerez-politikasi-CBkS2PiZ.js"
	},
	"/assets/certificateTemplates-BRIWk3kA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a2-f0EpRV3zmSolYtn1J/VS00AwWmE\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 25762,
		"path": "../public/assets/certificateTemplates-BRIWk3kA.js"
	},
	"/assets/MySkyParcelEarthGlobe-BchiE1J6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"819af-9XEYFl8z4j6eUoLdNVp4Zsk92wI\"",
		"mtime": "2026-09-04T06:57:41.710Z",
		"size": 530863,
		"path": "../public/assets/MySkyParcelEarthGlobe-BchiE1J6.js"
	},
	"/assets/check-DIHpnxBK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"78-4C+gdp1erM61eyovyW84xpk6InU\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 120,
		"path": "../public/assets/check-DIHpnxBK.js"
	},
	"/assets/circle-check-D9cjuKRo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ae-JktNqTLCeB5fsPNZPhgxd5gwMT0\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 174,
		"path": "../public/assets/circle-check-D9cjuKRo.js"
	},
	"/assets/circle-x-CATOnOET.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cb-QJaohZkr8gU/BXaMsaggSLlta3Y\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 203,
		"path": "../public/assets/circle-x-CATOnOET.js"
	},
	"/assets/dogrula-tGM4CVqE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16aa-Yo0jQBQE25K3+NKjOyRUbU2eJ10\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 5802,
		"path": "../public/assets/dogrula-tGM4CVqE.js"
	},
	"/assets/eye-Ce_puMWB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fc-UjTN3kuhJ4VFEtVuzm2NBr+ZEZc\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 252,
		"path": "../public/assets/eye-Ce_puMWB.js"
	},
	"/assets/file-badge-CLK7VoSs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c5-DsydYzxjJRu8suyBH84jr59TKv4\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 453,
		"path": "../public/assets/file-badge-CLK7VoSs.js"
	},
	"/assets/gift-DClLMoMA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"159-MoMU0+WBK9XIB9DiZS18UBdeCyY\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 345,
		"path": "../public/assets/gift-DClLMoMA.js"
	},
	"/assets/giris-CvR32ry6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2baa-YD7F5I7GprVuNKjUPx8FMScV9kg\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 11178,
		"path": "../public/assets/giris-CvR32ry6.js"
	},
	"/assets/gizlilik-politikasi-DYEkj0Hj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94c-u4p0OMwyTvoo5xFoSUPdjeqqLk4\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 2380,
		"path": "../public/assets/gizlilik-politikasi-DYEkj0Hj.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-haritasi-1erbGO4f.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9e9-1Lp0AIGh8c1QYHGHS2sspZhqxXw\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 2537,
		"path": "../public/assets/gokyuzu-haritasi-1erbGO4f.js"
	},
	"/assets/guvenlik-ayarlari-C5_t8cSs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23c6-rMRY+BDy8I0l/qj9yv5C1PCceA0\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 9158,
		"path": "../public/assets/guvenlik-ayarlari-C5_t8cSs.js"
	},
	"/assets/heart-Bv6Ic3wM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fe-X9vxPcgMIRYxeB6yg8C5ggUQBPg\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 254,
		"path": "../public/assets/heart-Bv6Ic3wM.js"
	},
	"/assets/hediye-kabul-DJXJMjtj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"180b-O2qPWoas0pQOHhgvjOBmpkHI1sA\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 6155,
		"path": "../public/assets/hediye-kabul-DJXJMjtj.js"
	},
	"/assets/hediyelerim-DSbN_rEP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2140-qANfW2KU4CsAbRzjQShyk2GHdIA\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 8512,
		"path": "../public/assets/hediyelerim-DSbN_rEP.js"
	},
	"/assets/hakkimizda-OJkxh_EH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef3-AqKIWlDoUICS1SpBF6eKoBkHDo0\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 7923,
		"path": "../public/assets/hakkimizda-OJkxh_EH.js"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/iade-iptal-politikasi-M9LZSo1g.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"118a-2OgWlHEN4QZDs6PWOqlAoX7a3C8\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 4490,
		"path": "../public/assets/iade-iptal-politikasi-M9LZSo1g.js"
	},
	"/assets/iletisim-BtAy7Xs8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14c2-9WAVFiTk53BPNUDGCo2KM2hROB0\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 5314,
		"path": "../public/assets/iletisim-BtAy7Xs8.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-04T06:57:41.712Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/jsx-runtime-DE3RlOCf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1edb-++aNIhyKgQeSqFVy8og9djQ1xvw\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 7899,
		"path": "../public/assets/jsx-runtime-DE3RlOCf.js"
	},
	"/assets/index-Bgz9Cp0X.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"26473-szlU3Igj39+AOL1/Bh7fcOPr560\"",
		"mtime": "2026-09-04T06:57:41.712Z",
		"size": 156787,
		"path": "../public/assets/index-Bgz9Cp0X.css"
	},
	"/assets/index-Cn_SVlp9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4eab7-Z4NaZlbYXfp8ybQJf4EOHSAayk8\"",
		"mtime": "2026-09-04T06:57:41.709Z",
		"size": 322231,
		"path": "../public/assets/index-Cn_SVlp9.js"
	},
	"/assets/kayit-ol-OuzIOU03.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d55-m0PGUVyKV5IF5qE0FLx+5nMNQvk\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 7509,
		"path": "../public/assets/kayit-ol-OuzIOU03.js"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/kvkk-fhe_oUqw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190e-z/I87S8v0aJQpOo2uf5eSk6RyXU\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 6414,
		"path": "../public/assets/kvkk-fhe_oUqw.js"
	},
	"/assets/kullanim-sartlari-DtcGNXBn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb5-zdAnsqcBnBIdlDmnWFETI3MaADE\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 2997,
		"path": "../public/assets/kullanim-sartlari-DtcGNXBn.js"
	},
	"/assets/layers-D1-aI-IN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a1-sbG6rQA2mEzhibsN6LhHVsOXsz8\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 417,
		"path": "../public/assets/layers-D1-aI-IN.js"
	},
	"/assets/link-D90cKH_E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6586-fb9WKhVhfd8d9CoIJ7QJ59V1DGQ\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 25990,
		"path": "../public/assets/link-D90cKH_E.js"
	},
	"/assets/loader-circle-B6wWvMCv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c-DQKlEdzD8WSoAHwrPqZBC+vCxRs\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 140,
		"path": "../public/assets/loader-circle-B6wWvMCv.js"
	},
	"/assets/lock-CVSojY-9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ca-lTz/f+7tNcrP8QtSVNRvsnlJUC4\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 202,
		"path": "../public/assets/lock-CVSojY-9.js"
	},
	"/assets/mail-Dg3VWqhn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d1-yekRUZTB2wDkXF5ohc1kal0bVnc\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 209,
		"path": "../public/assets/mail-Dg3VWqhn.js"
	},
	"/assets/map-pin-B02bdBCa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-/Fo1iY7GJCry4eS130Lllu5NbQE\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 255,
		"path": "../public/assets/map-pin-B02bdBCa.js"
	},
	"/assets/lazyRouteComponent-Bmrwwm4f.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1358-XCm7pS5kXnBOwYtNIwqDKon+uQU\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 4952,
		"path": "../public/assets/lazyRouteComponent-Bmrwwm4f.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-N0PraRC3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185c-mSlwt9jWRteDxOSwNC1NbeI3ugc\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 6236,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-N0PraRC3.js"
	},
	"/assets/nasil-calisir-BmeDIUFi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1589-sSFrk5TYCJqmuIKYVeZ7BK9ODFc\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 5513,
		"path": "../public/assets/nasil-calisir-BmeDIUFi.js"
	},
	"/assets/on-bilgilendirme-formu-DRxkD4pZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1170-Ecpf5KigrJJ7Hl8VXkYs6ewAvno\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 4464,
		"path": "../public/assets/on-bilgilendirme-formu-DRxkD4pZ.js"
	},
	"/assets/package-check-Dgh4Zlm7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a6-yxYCYrxOL+pa6pAh1CS5Ty2npLs\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 422,
		"path": "../public/assets/package-check-Dgh4Zlm7.js"
	},
	"/assets/paketler-BypmM_MF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14dd-6q8b4a4CX7rvq4+Uycf8bikH0g0\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 5341,
		"path": "../public/assets/paketler-BypmM_MF.js"
	},
	"/assets/panelim-jlS_T-l5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24ea-ynvVpnjY9Z626Ub+jIewYHPgHZo\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 9450,
		"path": "../public/assets/panelim-jlS_T-l5.js"
	},
	"/assets/parsel-satin-al-BJ2nxEKH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4d4-wpIJqXCjDwdd/HnycaXv1njTVa8\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 1236,
		"path": "../public/assets/parsel-satin-al-BJ2nxEKH.js"
	},
	"/assets/parsel-satin-al-CKRk6PRU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24ba-UIi15KgkjVpwwzZx5oBE4LfyC6E\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 9402,
		"path": "../public/assets/parsel-satin-al-CKRk6PRU.js"
	},
	"/assets/parsellerim-CAAlD3eT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a87-+4RXjKVcGZaKCcGylnaCdjIXgfU\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 10887,
		"path": "../public/assets/parsellerim-CAAlD3eT.js"
	},
	"/assets/pazar-yeri-DLsHXVzM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63c-xufpwkYqIT3DFbjiEJYiIqU51x4\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 1596,
		"path": "../public/assets/pazar-yeri-DLsHXVzM.js"
	},
	"/assets/phone-Bt4c4Bza.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13e-82hNQ7dFB5QB8F4xX8Rx3e29300\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 318,
		"path": "../public/assets/phone-Bt4c4Bza.js"
	},
	"/assets/play-BJfnRM5d.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ba-enjq0u1yFC9t6iIS1vqkgaNTsWg\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 186,
		"path": "../public/assets/play-BJfnRM5d.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/profilim-A9UozA_B.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b98-GVQwZSI3MXsSo+xsYeKmQOqnLaQ\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 2968,
		"path": "../public/assets/profilim-A9UozA_B.js"
	},
	"/assets/refresh-cw-CMXdKahV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"41d-6Re/gIb5FAQnP53HYysD6YcSvpc\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 1053,
		"path": "../public/assets/refresh-cw-CMXdKahV.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/search-DXSy84eM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa-Ox1dA+1+e8AtmT3tHzA31oaJOnY\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 170,
		"path": "../public/assets/search-DXSy84eM.js"
	},
	"/assets/sertifika-dogrula-Cghdrzbr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16da-YaDN+AxtsAQVqNnn/fPkb2CtAEk\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 5850,
		"path": "../public/assets/sertifika-dogrula-Cghdrzbr.js"
	},
	"/assets/sertifika-dogrula-gmLwzuiU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"495-Gq3gw6KQzoQaXH0mRgE4sXGpQJ4\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 1173,
		"path": "../public/assets/sertifika-dogrula-gmLwzuiU.js"
	},
	"/assets/sertifika-talep-BZyGbYZD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"215d-l7CHmwisWOFU+0t8VVzXliexl4Y\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 8541,
		"path": "../public/assets/sertifika-talep-BZyGbYZD.js"
	},
	"/assets/routes-CdQQKoK8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa6-TMZs5vAjmLqMAEOxBk6oSoYX13k\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 2726,
		"path": "../public/assets/routes-CdQQKoK8.js"
	},
	"/assets/sertifikalarim-BpU1sWpw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28bd-WkN/ZaTqeX/hTeYYksMjgIQ2u28\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 10429,
		"path": "../public/assets/sertifikalarim-BpU1sWpw.js"
	},
	"/assets/shield-check-BdI9sz93.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5dd-uqHec4/GyGrHsObNSuNOTetDUcE\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 1501,
		"path": "../public/assets/shield-check-BdI9sz93.js"
	},
	"/assets/sifremi-unuttum-M9xTbKru.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1899-4+lX51gpuT16+a3NJg5Zsu8yH0E\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 6297,
		"path": "../public/assets/sifremi-unuttum-M9xTbKru.js"
	},
	"/assets/sifre-yenile-Bfk4tu8N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fdc-sFaXBMqeqOdG7IRLZh4xm3mqeQQ\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 4060,
		"path": "../public/assets/sifre-yenile-Bfk4tu8N.js"
	},
	"/assets/siparislerim-BoHXqjpA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f09-3kEdhCdyDl/zH78vj+8BftyUlM4\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 3849,
		"path": "../public/assets/siparislerim-BoHXqjpA.js"
	},
	"/assets/smartphone-CVIoPJb0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c1-hwyImBjCY7U4jBBpkg2qCXrpOiY\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 193,
		"path": "../public/assets/smartphone-CVIoPJb0.js"
	},
	"/assets/sparkles-C3tZJlv4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ea-spW36x3+8rTQy+XxPQMW0aBtq/I\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 490,
		"path": "../public/assets/sparkles-C3tZJlv4.js"
	},
	"/assets/star-CY2iO-0y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d4-8MuCRFdsJwuVPP2BwQ6/rmziIlU\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 468,
		"path": "../public/assets/star-CY2iO-0y.js"
	},
	"/assets/turkiye-haritasi-Bd-LEHaT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f08-bRcwmRldPwNJAsNBfKu0Me6eYwM\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 3848,
		"path": "../public/assets/turkiye-haritasi-Bd-LEHaT.js"
	},
	"/assets/useAuth-DU-yA3pj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3556a-WJaSxqwWtpFGRiVOQsmRBmZiG4c\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 218474,
		"path": "../public/assets/useAuth-DU-yA3pj.js"
	},
	"/assets/useRouter-VMLxvdJG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"236-9wTGogEQs6FVqKrigBHqv3aErX8\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 566,
		"path": "../public/assets/useRouter-VMLxvdJG.js"
	},
	"/assets/user-bX7cVxt3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-/FjrcNlBxdlsFhf8q0pMfa0SX1c\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 192,
		"path": "../public/assets/user-bX7cVxt3.js"
	},
	"/assets/uyelik-sozlesmesi-CxjLYyJk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a4-UyL2c1OrPuzhqLDyX++sFW/Jc6Q\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 9636,
		"path": "../public/assets/uyelik-sozlesmesi-CxjLYyJk.js"
	},
	"/assets/yonetim-CCChp8Jx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"39ea-HzJUUq3tZqxJat2w7RCE1kK4yy0\"",
		"mtime": "2026-09-04T06:57:41.711Z",
		"size": 14826,
		"path": "../public/assets/yonetim-CCChp8Jx.js"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c8-aE0wi3G5UwBm20hIOogcLwFw76I\"",
		"mtime": "2026-09-04T06:57:42.675Z",
		"size": 8392,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-04T06:57:42.675Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c4-cuFwIStF+1ItvnpBQQU9Kt9iZVs\"",
		"mtime": "2026-09-04T06:57:42.675Z",
		"size": 8388,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-04T06:57:42.675Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20b9-i2nAOC3dv8uH13uIuFse9o5qOkg\"",
		"mtime": "2026-09-04T06:57:42.675Z",
		"size": 8377,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-04T06:57:42.675Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-04T06:57:23.994Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-04T06:57:42.675Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-04T06:57:42.676Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-04T06:57:42.676Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-04T06:57:42.676Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-04T06:57:42.676Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-04T06:57:42.676Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-04T06:57:42.676Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-04T06:57:42.676Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-04T06:57:42.676Z",
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
