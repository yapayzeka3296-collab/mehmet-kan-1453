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
		"etag": "\"90c-pG5taenK3cYYfL7WkdBxMb15u0w\"",
		"mtime": "2026-09-05T23:47:34.592Z",
		"size": 2316,
		"path": "../public/.htaccess"
	},
	"/cloud-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"200-lvKTdoTfo+30J2I2WxMu97p+hmI\"",
		"mtime": "2026-09-05T23:47:34.592Z",
		"size": 512,
		"path": "../public/cloud-texture.svg"
	},
	"/earth-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"432-7hbnUfYacpJ5GuKlsQ+DIaVE3oM\"",
		"mtime": "2026-09-05T23:47:34.592Z",
		"size": 1074,
		"path": "../public/earth-texture.svg"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-09-05T23:47:34.592Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"806-b1v3QqYB4V3OQR9kzlQsuHgBOqs\"",
		"mtime": "2026-09-05T23:47:34.592Z",
		"size": 2054,
		"path": "../public/login-background.css"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-05T23:47:34.592Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-05T23:47:34.592Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-05T23:47:34.590Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c8-aE0wi3G5UwBm20hIOogcLwFw76I\"",
		"mtime": "2026-09-05T23:47:34.589Z",
		"size": 8392,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c4-cuFwIStF+1ItvnpBQQU9Kt9iZVs\"",
		"mtime": "2026-09-05T23:47:34.590Z",
		"size": 8388,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-05T23:47:34.590Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-05T23:47:34.590Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20b9-i2nAOC3dv8uH13uIuFse9o5qOkg\"",
		"mtime": "2026-09-05T23:47:34.590Z",
		"size": 8377,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/assets/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"b5-RNSDzi1HBdUvkZk9a+K+w23lY/Q\"",
		"mtime": "2026-09-05T23:47:34.592Z",
		"size": 181,
		"path": "../public/assets/.htaccess"
	},
	"/assets/CertificateTemplatePreview-Mvy_KL-K.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113c-g3eoT8+2o8kyg6PY6dFANiC0cHI\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 4412,
		"path": "../public/assets/CertificateTemplatePreview-Mvy_KL-K.js"
	},
	"/assets/CityParcelLivePage-Cq0FSf0R.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"39a3-R5Uq0YJLdFFsN/lzjcfPfgXSgqE\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 14755,
		"path": "../public/assets/CityParcelLivePage-Cq0FSf0R.js"
	},
	"/assets/Logo-BM3n8sf2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"252-buXevS/2xDkSRDsIgDtYqcFxibs\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 594,
		"path": "../public/assets/Logo-BM3n8sf2.js"
	},
	"/assets/ParcelDetailPanel-M2azcdAa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b67-YamhT7O2Za+enG9MWRlkXos2azA\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 19303,
		"path": "../public/assets/ParcelDetailPanel-M2azcdAa.js"
	},
	"/assets/SiteHeader-DmZ26BRP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"339d-R8Ynq1Q8wU9iMQLf/IFftfxg3q0\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 13213,
		"path": "../public/assets/SiteHeader-DmZ26BRP.js"
	},
	"/assets/SiteFooter-DWXipnRg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"102c-EgSO7AfN52vTDEsGZyaH9JdQd0k\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 4140,
		"path": "../public/assets/SiteFooter-DWXipnRg.js"
	},
	"/assets/TrustBar-BzE_pHlV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"70c-njYAnqNjDR7Fm52Nyq61YozHYxM\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 1804,
		"path": "../public/assets/TrustBar-BzE_pHlV.js"
	},
	"/assets/UserSidebar-C4Ksi8Gg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b48-6eQvdvknz7pQtOXqJL7LCfjP+B8\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 2888,
		"path": "../public/assets/UserSidebar-C4Ksi8Gg.js"
	},
	"/assets/_slug-Cxq5HtyD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25b-afvodpfC4tNnSklEbQOc2oXthSQ\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 603,
		"path": "../public/assets/_slug-Cxq5HtyD.js"
	},
	"/assets/ana-sayfa-DfXg7Q4h.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24b0-xUBCCOPys2s0Xm1RROK9g9Ae7SY\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 9392,
		"path": "../public/assets/ana-sayfa-DfXg7Q4h.js"
	},
	"/assets/_slug-Dd4sqGg1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2139-bgMOeWudTnuy239yZaHenRSNOTk\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 8505,
		"path": "../public/assets/_slug-Dd4sqGg1.js"
	},
	"/assets/arrow-left-DyXE8XRn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-59WleIcpRiZNAYL8O8qi4JrQgfY\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 162,
		"path": "../public/assets/arrow-left-DyXE8XRn.js"
	},
	"/assets/arrow-right-MBaMI0Kk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-WbMMRgq5mUmr5c5g8HMK6V404r4\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 162,
		"path": "../public/assets/arrow-right-MBaMI0Kk.js"
	},
	"/assets/award-B051LtKG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f-UD5Ga71c2lEfCpWkzxHllwduxGI\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 271,
		"path": "../public/assets/award-B051LtKG.js"
	},
	"/assets/bildirimler-Dff77Frr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2f-2D5Q8CVAalBA3CgS/GR3F6RDRgM\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 2607,
		"path": "../public/assets/bildirimler-Dff77Frr.js"
	},
	"/assets/boxes-CKM3HuWa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"350-TWxYUKXR17ZTeQZNZLNjVOdL1ck\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 848,
		"path": "../public/assets/boxes-CKM3HuWa.js"
	},
	"/assets/cerez-politikasi-Dpro6Jxk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dfe-1Y+hRAlbLgXZ3dQ4SD6MtJyhT1M\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 3582,
		"path": "../public/assets/cerez-politikasi-Dpro6Jxk.js"
	},
	"/assets/check-DRelkuoV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"79-cEcwhiBY8KXxnwEL0aOdxt70hQE\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 121,
		"path": "../public/assets/check-DRelkuoV.js"
	},
	"/assets/certificateTemplates-BRIWk3kA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a2-f0EpRV3zmSolYtn1J/VS00AwWmE\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 25762,
		"path": "../public/assets/certificateTemplates-BRIWk3kA.js"
	},
	"/assets/circle-check-BBZrNoGL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"af-6ntwqvDm/tst6HKJH202oLlK0YQ\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 175,
		"path": "../public/assets/circle-check-BBZrNoGL.js"
	},
	"/assets/circle-x-CDvYXnr1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cc-m0ukeB97Daj2UmbC56q8Dr/++/o\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 204,
		"path": "../public/assets/circle-x-CDvYXnr1.js"
	},
	"/assets/destek-DNz_falg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"756-j2ND+/Efkt71/mfsxextQE2tJaA\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 1878,
		"path": "../public/assets/destek-DNz_falg.js"
	},
	"/assets/dogrula-CaAFcVFt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16a8-UobpMhBG6zkHDEJ8TmErmx6SayI\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 5800,
		"path": "../public/assets/dogrula-CaAFcVFt.js"
	},
	"/assets/eye-DDKOO2bo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fd-L6wyswac+c7FhWLT9koGbYxvxMc\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 253,
		"path": "../public/assets/eye-DDKOO2bo.js"
	},
	"/assets/gift-QSEeQ57e.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15a-OePrGyJc+DHFuntwI/WKPH3qWbI\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 346,
		"path": "../public/assets/gift-QSEeQ57e.js"
	},
	"/assets/giris-sOZ7f_03.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b0e-O2mem8vbG9ykPIT5URDYDULhkPs\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 11022,
		"path": "../public/assets/giris-sOZ7f_03.js"
	},
	"/assets/gizlilik-politikasi-CHbZRj06.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94a-AaCrxEVP0NtLUtNvjx2h0uaEn7Y\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 2378,
		"path": "../public/assets/gizlilik-politikasi-CHbZRj06.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-haritasi-BJcPvNxp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9f1-DjYiTmTxTBQbmWdvZS6KsMVXnTY\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 2545,
		"path": "../public/assets/gokyuzu-haritasi-BJcPvNxp.js"
	},
	"/assets/guvenlik-ayarlari-ChItoVSN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23c5-fo2BE2xtxUGkaG7KBwzjzJAgdPE\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 9157,
		"path": "../public/assets/guvenlik-ayarlari-ChItoVSN.js"
	},
	"/assets/hakkimizda-DbrH22TY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef2-iqKWemgRdvO8UxG/w1S7mCp/gqs\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 7922,
		"path": "../public/assets/hakkimizda-DbrH22TY.js"
	},
	"/assets/heart-JbWxO7RN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-wDwUTMhO14XNbQFjiaFUc8xthDM\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 255,
		"path": "../public/assets/heart-JbWxO7RN.js"
	},
	"/assets/hediye-kabul-B6ZWyrlw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"180a-KcpFWLx2SLdNq2gBtRwSdpyt6NE\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 6154,
		"path": "../public/assets/hediye-kabul-B6ZWyrlw.js"
	},
	"/assets/hediyelerim-BSqK56z8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"213f-o9/QGohywHyuFNuBQtlXyYAtOvs\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 8511,
		"path": "../public/assets/hediyelerim-BSqK56z8.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-05T23:47:33.167Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-05T23:47:33.167Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/iade-iptal-politikasi-BPjKWpMj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1188-m1Y4tNg7Fx22HGC470ixGf3bLv8\"",
		"mtime": "2026-09-05T23:47:33.165Z",
		"size": 4488,
		"path": "../public/assets/iade-iptal-politikasi-BPjKWpMj.js"
	},
	"/assets/iletisim-waz4OUiX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"770-8P+0l435jrxj7W0QYU5braDtT3U\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 1904,
		"path": "../public/assets/iletisim-waz4OUiX.js"
	},
	"/assets/index--9YDL0KI.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"26b68-Fzb2lsOlkU4CWgvh9IABPBDjHJk\"",
		"mtime": "2026-09-05T23:47:33.167Z",
		"size": 158568,
		"path": "../public/assets/index--9YDL0KI.css"
	},
	"/assets/kayit-ol-HNSv6J09.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d53-TwnD0gvKjQO+03a0etFHl96Zs+o\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 7507,
		"path": "../public/assets/kayit-ol-HNSv6J09.js"
	},
	"/assets/kullanim-sartlari-ZsK6jMqn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb3-hDKqzI/8s9W18T4GaNmTBjaCFOo\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 2995,
		"path": "../public/assets/kullanim-sartlari-ZsK6jMqn.js"
	},
	"/assets/kvkk-CnglcGlY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190c-/uRzCXvGQZs9HOEANdHbXReZQKo\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 6412,
		"path": "../public/assets/kvkk-CnglcGlY.js"
	},
	"/assets/index-eLa70cGZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4f7d0-yI5gFgIhZWfcm0chfLf5vjj0iQo\"",
		"mtime": "2026-09-05T23:47:33.163Z",
		"size": 325584,
		"path": "../public/assets/index-eLa70cGZ.js"
	},
	"/assets/layers-CRq_trBh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a2-lxkRIxqGQJJUsDdxr6dhb+smUEY\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 418,
		"path": "../public/assets/layers-CRq_trBh.js"
	},
	"/assets/link-BGEbXR-c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6564-iE312Hn1C3Q6l+H6bHSpyCLXQmI\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 25956,
		"path": "../public/assets/link-BGEbXR-c.js"
	},
	"/assets/loader-circle-CmgEtFg0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8d-ITJw7xOsz/T/QNQACKdj7JntDN0\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 141,
		"path": "../public/assets/loader-circle-CmgEtFg0.js"
	},
	"/assets/lazyRouteComponent-BhJ4EGj3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"132e-PLbo2F9KDwiLEMKTDWhkXwWfg6Y\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 4910,
		"path": "../public/assets/lazyRouteComponent-BhJ4EGj3.js"
	},
	"/assets/lock-BTOm-_yk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cb-LrLwO8vug34y0AJ8iIx35HPbboo\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 203,
		"path": "../public/assets/lock-BTOm-_yk.js"
	},
	"/assets/mail-DDKdFKWi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d2-yIIEx/u8OcUefdZ8ByMvQoumV0E\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 210,
		"path": "../public/assets/mail-DDKdFKWi.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-cDIs9_va.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185a-Qr6MP5WYvEFdEX6H4llApC8Ne4o\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 6234,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-cDIs9_va.js"
	},
	"/assets/nasil-calisir-Dtl2F_Ee.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1588-j9xcVrFPC0YpB41W6C77k2uR5UU\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 5512,
		"path": "../public/assets/nasil-calisir-Dtl2F_Ee.js"
	},
	"/assets/on-bilgilendirme-formu-D_28PL1P.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"116e-OOVaUHidPvmTHX3Ao50YmmUQBcU\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 4462,
		"path": "../public/assets/on-bilgilendirme-formu-D_28PL1P.js"
	},
	"/assets/package-check-CAAoi8ax.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a7-ij55HEf7apFcoN92Tw76veSwrrk\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 423,
		"path": "../public/assets/package-check-CAAoi8ax.js"
	},
	"/assets/paketler-DYvHl1-T.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14d7-8Xy5qckhcGY/qS01fK38RKwSK3A\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 5335,
		"path": "../public/assets/paketler-DYvHl1-T.js"
	},
	"/assets/panelim-B8G_fK5Z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24e8-vKWqYShILvjbjUo54jqt58f+b7I\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 9448,
		"path": "../public/assets/panelim-B8G_fK5Z.js"
	},
	"/assets/parsel-satin-al-BT_edDSE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2aa6-n7XrjrZ+EYmS47DuzxFLAVMchPk\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 10918,
		"path": "../public/assets/parsel-satin-al-BT_edDSE.js"
	},
	"/assets/parsel-satin-al-C6QNTqRG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"40c-LQVOshoVTwTuHQH4dyvrcuOJmEk\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 1036,
		"path": "../public/assets/parsel-satin-al-C6QNTqRG.js"
	},
	"/assets/parsellerim-C5ip4eCh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2bdf-p+CVpgfPHj8nyJwKkscEGTuVZV0\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 11231,
		"path": "../public/assets/parsellerim-C5ip4eCh.js"
	},
	"/assets/pazar-yeri-Br1fcHpU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63a-3NHK8XVIgcpEKtGkRWjmBn5Qw54\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 1594,
		"path": "../public/assets/pazar-yeri-Br1fcHpU.js"
	},
	"/assets/phone-DwMp9viC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13f-vS5yFCrxlZlIxpF2xUL1GqL8+nQ\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 319,
		"path": "../public/assets/phone-DwMp9viC.js"
	},
	"/assets/play-RWSuMNVl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb-wFk8VhgNVULnonwxNBoUvCLyxa8\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 187,
		"path": "../public/assets/play-RWSuMNVl.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/profilim-HJP_d26Y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b96-GFQEJ8G+MqFGMQxAaPLOwPW/sZ8\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 2966,
		"path": "../public/assets/profilim-HJP_d26Y.js"
	},
	"/assets/refresh-cw-Cq71NfYJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"41e-E8IhzEWY96Xjd4Zd6WhrCNKW07k\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 1054,
		"path": "../public/assets/refresh-cw-Cq71NfYJ.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/search-C4prwcQe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ab-Nf/7Ems0tyFdqzwUCiopdiHkd/o\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 171,
		"path": "../public/assets/search-C4prwcQe.js"
	},
	"/assets/sertifika-dogrula-D1AXLwkK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"472-IQ+QO5AUJME4GlFSZo619nVag7I\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 1138,
		"path": "../public/assets/sertifika-dogrula-D1AXLwkK.js"
	},
	"/assets/sertifika-dogrula-D7vMVnMJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16d9-PUwH+R+3hc55yCGNtaa7yIQWXgo\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 5849,
		"path": "../public/assets/sertifika-dogrula-D7vMVnMJ.js"
	},
	"/assets/sertifika-talep-DI60Sw3m.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"215b-8LI8bd1TXl1lo/9vjyVlNjM6hPs\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 8539,
		"path": "../public/assets/sertifika-talep-DI60Sw3m.js"
	},
	"/assets/sertifikalarim-BVPZX6n-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28bc-0Tif07P1aiKt/I0U4YKYtmx09ek\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 10428,
		"path": "../public/assets/sertifikalarim-BVPZX6n-.js"
	},
	"/assets/shopping-cart-DAfFKxkm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6c5-DpLDawejr46LBJlNgFll7hECEoQ\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 1733,
		"path": "../public/assets/shopping-cart-DAfFKxkm.js"
	},
	"/assets/sifre-yenile-B-lSe-Lt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fdb-DB60P587cUGcu5je/zNsLG05EWc\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 4059,
		"path": "../public/assets/sifre-yenile-B-lSe-Lt.js"
	},
	"/assets/routes-DUGqVY_V.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2efd-LWHiH0DEDi5cregH996nNR3UijA\"",
		"mtime": "2026-09-05T23:47:33.166Z",
		"size": 12029,
		"path": "../public/assets/routes-DUGqVY_V.js"
	},
	"/assets/sifremi-unuttum-CU4vzNTG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1898-Zm0CA46l8S3tcy4q1B/dIDsq4Nw\"",
		"mtime": "2026-09-05T23:47:33.167Z",
		"size": 6296,
		"path": "../public/assets/sifremi-unuttum-CU4vzNTG.js"
	},
	"/assets/siparislerim-CSVcSlMY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f08-I4K1hGnSw65Bsr/j8EO6Ulbjyyk\"",
		"mtime": "2026-09-05T23:47:33.167Z",
		"size": 3848,
		"path": "../public/assets/siparislerim-CSVcSlMY.js"
	},
	"/assets/smartphone-Cey4vb7q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c2-W3v1QubA/e0IW2CWbH3WqYKx9ME\"",
		"mtime": "2026-09-05T23:47:33.167Z",
		"size": 194,
		"path": "../public/assets/smartphone-Cey4vb7q.js"
	},
	"/assets/sparkles-D4Li6fbV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1eb-OWwxXm1vAArXoiEUsUg3+UUGXmM\"",
		"mtime": "2026-09-05T23:47:33.167Z",
		"size": 491,
		"path": "../public/assets/sparkles-D4Li6fbV.js"
	},
	"/assets/star-B8evEga9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d5-wDlsUOwkGvvJWeV+22+mp3me4s8\"",
		"mtime": "2026-09-05T23:47:33.167Z",
		"size": 469,
		"path": "../public/assets/star-B8evEga9.js"
	},
	"/assets/trash-2-DYB1WKZL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"145-dKitZjdLRTcNha4JL1llDqAbByA\"",
		"mtime": "2026-09-05T23:47:33.167Z",
		"size": 325,
		"path": "../public/assets/trash-2-DYB1WKZL.js"
	},
	"/assets/turkiye-haritasi-Do9JIQUc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f2b-tWj+YCIN3QXjbMRV9pQNoIySHuE\"",
		"mtime": "2026-09-05T23:47:33.167Z",
		"size": 3883,
		"path": "../public/assets/turkiye-haritasi-Do9JIQUc.js"
	},
	"/assets/useAuth-P3jnq5qf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"355dc-MSgzweDpTx/XTR3lx6IwweH5wjM\"",
		"mtime": "2026-09-05T23:47:33.167Z",
		"size": 218588,
		"path": "../public/assets/useAuth-P3jnq5qf.js"
	},
	"/assets/user-DGFaOwCr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c1-swdwO19MOAGoJu6OsBZck1pkuQE\"",
		"mtime": "2026-09-05T23:47:33.167Z",
		"size": 193,
		"path": "../public/assets/user-DGFaOwCr.js"
	},
	"/assets/useRouter-Bfknwdby.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20b5-IuM+CAALeZ5Y42bvd3N+GgqS5p0\"",
		"mtime": "2026-09-05T23:47:33.167Z",
		"size": 8373,
		"path": "../public/assets/useRouter-Bfknwdby.js"
	},
	"/assets/three.module-C5rh5wLt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b0d0c-yxZrAk456uilGR/GXmPe2vD3V3k\"",
		"mtime": "2026-09-05T23:47:33.167Z",
		"size": 724236,
		"path": "../public/assets/three.module-C5rh5wLt.js"
	},
	"/assets/uyelik-sozlesmesi-JuEUWZoI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a2-qyiUh9VO4E0yW1PejiGKQgk0blk\"",
		"mtime": "2026-09-05T23:47:33.167Z",
		"size": 9634,
		"path": "../public/assets/uyelik-sozlesmesi-JuEUWZoI.js"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-05T23:47:03.178Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-05T23:47:34.591Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/assets/yonetim-1o2OefEj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"54a6-ENlD+bz4q5pOpAGjf3LwpAGcmo0\"",
		"mtime": "2026-09-05T23:47:33.167Z",
		"size": 21670,
		"path": "../public/assets/yonetim-1o2OefEj.js"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-05T23:47:34.591Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-05T23:47:34.592Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-05T23:47:34.591Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-05T23:47:34.592Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-05T23:47:34.591Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-05T23:47:34.592Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-05T23:47:34.592Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-05T23:47:34.592Z",
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
