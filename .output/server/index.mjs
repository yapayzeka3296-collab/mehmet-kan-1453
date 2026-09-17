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
		"etag": "\"99f-3eU+qMV+fimPkExi1FU92UW+m0o\"",
		"mtime": "2026-09-17T21:23:44.322Z",
		"size": 2463,
		"path": "../public/.htaccess"
	},
	"/cloud-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"200-lvKTdoTfo+30J2I2WxMu97p+hmI\"",
		"mtime": "2026-09-17T21:23:44.322Z",
		"size": 512,
		"path": "../public/cloud-texture.svg"
	},
	"/earth-texture.svg": {
		"type": "image/svg+xml",
		"etag": "\"432-7hbnUfYacpJ5GuKlsQ+DIaVE3oM\"",
		"mtime": "2026-09-17T21:23:44.322Z",
		"size": 1074,
		"path": "../public/earth-texture.svg"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-09-17T21:23:44.322Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-17T21:23:44.322Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"ce-n8Tm1cPHNDloKfFtLwsBoYS5eu8\"",
		"mtime": "2026-09-17T21:23:44.322Z",
		"size": 206,
		"path": "../public/robots.txt"
	},
	"/sitemap.xml": {
		"type": "application/xml",
		"etag": "\"634-MrBA/IGlHZxiXGckPcMr4Zb33/4\"",
		"mtime": "2026-09-17T21:23:44.322Z",
		"size": 1588,
		"path": "../public/sitemap.xml"
	},
	"/assets/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"b5-RNSDzi1HBdUvkZk9a+K+w23lY/Q\"",
		"mtime": "2026-09-17T21:23:44.322Z",
		"size": 181,
		"path": "../public/assets/.htaccess"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"806-b1v3QqYB4V3OQR9kzlQsuHgBOqs\"",
		"mtime": "2026-09-17T21:23:44.322Z",
		"size": 2054,
		"path": "../public/login-background.css"
	},
	"/assets/CertificateTemplatePreview-Mvy_KL-K.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113c-g3eoT8+2o8kyg6PY6dFANiC0cHI\"",
		"mtime": "2026-09-17T21:23:42.826Z",
		"size": 4412,
		"path": "../public/assets/CertificateTemplatePreview-Mvy_KL-K.js"
	},
	"/assets/CityParcelLivePage-CkX70-2p.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"39ce-Ot3VzRkvPS2cDz/Ol6+vLiCxl54\"",
		"mtime": "2026-09-17T21:23:42.826Z",
		"size": 14798,
		"path": "../public/assets/CityParcelLivePage-CkX70-2p.js"
	},
	"/assets/Logo-BM3n8sf2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"252-buXevS/2xDkSRDsIgDtYqcFxibs\"",
		"mtime": "2026-09-17T21:23:42.826Z",
		"size": 594,
		"path": "../public/assets/Logo-BM3n8sf2.js"
	},
	"/assets/ParcelDetailPanel-BowUV5v1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b92-JeRQcVmjGPYsWaDWqiDemDwKQVU\"",
		"mtime": "2026-09-17T21:23:42.826Z",
		"size": 19346,
		"path": "../public/assets/ParcelDetailPanel-BowUV5v1.js"
	},
	"/assets/SiteFooter-DWXipnRg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"102c-EgSO7AfN52vTDEsGZyaH9JdQd0k\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 4140,
		"path": "../public/assets/SiteFooter-DWXipnRg.js"
	},
	"/assets/SiteHeader-ogd9FtCg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"33ca-v/54Ygn+d166/GuyBZVcpYSaqQw\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 13258,
		"path": "../public/assets/SiteHeader-ogd9FtCg.js"
	},
	"/assets/TrustBar-BzE_pHlV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"70c-njYAnqNjDR7Fm52Nyq61YozHYxM\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 1804,
		"path": "../public/assets/TrustBar-BzE_pHlV.js"
	},
	"/assets/UserSidebar-biPUabu-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b4d-ICOSgJY3y+8mI1Lo/riPCtLwePM\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 2893,
		"path": "../public/assets/UserSidebar-biPUabu-.js"
	},
	"/assets/_slug-DCeO5ndK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2164-+V+6LgMiGa9iJQR5IcAxyK8AaLM\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 8548,
		"path": "../public/assets/_slug-DCeO5ndK.js"
	},
	"/assets/_slug-xYRcCiLd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"282-AHHpIhl+7XlHQUMUDf0tWJiqLQs\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 642,
		"path": "../public/assets/_slug-xYRcCiLd.js"
	},
	"/assets/arrow-left-DyXE8XRn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-59WleIcpRiZNAYL8O8qi4JrQgfY\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 162,
		"path": "../public/assets/arrow-left-DyXE8XRn.js"
	},
	"/assets/ana-sayfa-BDgaa1na.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24ff-LVIbnc4BY6CVIpv05TRTK7REJBM\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 9471,
		"path": "../public/assets/ana-sayfa-BDgaa1na.js"
	},
	"/assets/arrow-right-MBaMI0Kk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a2-WbMMRgq5mUmr5c5g8HMK6V404r4\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 162,
		"path": "../public/assets/arrow-right-MBaMI0Kk.js"
	},
	"/assets/award-B051LtKG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10f-UD5Ga71c2lEfCpWkzxHllwduxGI\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 271,
		"path": "../public/assets/award-B051LtKG.js"
	},
	"/assets/bildirimler-D95NqCtm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a5a-/b2qXjV9wSz2RoJP2zfcJda9g64\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 2650,
		"path": "../public/assets/bildirimler-D95NqCtm.js"
	},
	"/assets/boxes-CKM3HuWa.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"350-TWxYUKXR17ZTeQZNZLNjVOdL1ck\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 848,
		"path": "../public/assets/boxes-CKM3HuWa.js"
	},
	"/assets/cerez-politikasi-8xJtWS9z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"dfe-Wz63TcXFRJwc44EFO8szNieSvI0\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 3582,
		"path": "../public/assets/cerez-politikasi-8xJtWS9z.js"
	},
	"/assets/certificateTemplates-BRIWk3kA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a2-f0EpRV3zmSolYtn1J/VS00AwWmE\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 25762,
		"path": "../public/assets/certificateTemplates-BRIWk3kA.js"
	},
	"/assets/check-DRelkuoV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"79-cEcwhiBY8KXxnwEL0aOdxt70hQE\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 121,
		"path": "../public/assets/check-DRelkuoV.js"
	},
	"/assets/circle-check-BBZrNoGL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"af-6ntwqvDm/tst6HKJH202oLlK0YQ\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 175,
		"path": "../public/assets/circle-check-BBZrNoGL.js"
	},
	"/assets/circle-x-CDvYXnr1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cc-m0ukeB97Daj2UmbC56q8Dr/++/o\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 204,
		"path": "../public/assets/circle-x-CDvYXnr1.js"
	},
	"/assets/destek-BCpUjZ3n.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"756-96tLFc866baC+9zbaOdWzHxNizs\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 1878,
		"path": "../public/assets/destek-BCpUjZ3n.js"
	},
	"/assets/dogrula-zaldxHTL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16d8-D2fWqYvoplvG8mqZ+WMFmOrqlTg\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 5848,
		"path": "../public/assets/dogrula-zaldxHTL.js"
	},
	"/assets/dogum-gunu-hediyesi-CokSpXxz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10e6-Ud1UCkFfnCG+LkMvjRuUC2Zj7PE\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 4326,
		"path": "../public/assets/dogum-gunu-hediyesi-CokSpXxz.js"
	},
	"/assets/eye-DDKOO2bo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fd-L6wyswac+c7FhWLT9koGbYxvxMc\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 253,
		"path": "../public/assets/eye-DDKOO2bo.js"
	},
	"/assets/gift-QSEeQ57e.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15a-OePrGyJc+DHFuntwI/WKPH3qWbI\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 346,
		"path": "../public/assets/gift-QSEeQ57e.js"
	},
	"/assets/giris-Ds8K7tLz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b39-xowF+Zx2NMf8py4lXMKgFImt2yU\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 11065,
		"path": "../public/assets/giris-Ds8K7tLz.js"
	},
	"/assets/gizlilik-politikasi-Bwgr9D6c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94a-iHYYnFZGgpTgXw89aPtZJ7jlR8I\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 2378,
		"path": "../public/assets/gizlilik-politikasi-Bwgr9D6c.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-haritasi-B40we3Bw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a1c-7P8Ziebn29lDI887OuRModtVfvE\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 2588,
		"path": "../public/assets/gokyuzu-haritasi-B40we3Bw.js"
	},
	"/assets/gokyuzunu-tara-HP7eFir0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2724-kjGwqw2e4B858T6nOdNFc1DXQI4\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 10020,
		"path": "../public/assets/gokyuzunu-tara-HP7eFir0.js"
	},
	"/assets/guvenlik-ayarlari-B3-TInI5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23f5-zL8CNgBLbe42IDQoOrqx6Z/kH9c\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 9205,
		"path": "../public/assets/guvenlik-ayarlari-B3-TInI5.js"
	},
	"/assets/hakkimizda-11w1i5He.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ef2-r0gd0niQU5KUbLAmpV0pS73J/2I\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 7922,
		"path": "../public/assets/hakkimizda-11w1i5He.js"
	},
	"/assets/heart-JbWxO7RN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ff-wDwUTMhO14XNbQFjiaFUc8xthDM\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 255,
		"path": "../public/assets/heart-JbWxO7RN.js"
	},
	"/assets/hediye-kabul-Bry3Dwo3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"183a-0kp6vfwSKgfs0KAhSVWwv/cieEk\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 6202,
		"path": "../public/assets/hediye-kabul-Bry3Dwo3.js"
	},
	"/assets/hediyelerim-CzSHnBE9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"216a-ikBly+9XsBJnYCeuxUC3cPGcW2A\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 8554,
		"path": "../public/assets/hediyelerim-CzSHnBE9.js"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/iade-iptal-politikasi-Cid2OEoJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1188-YCtPeYp6dvBZJN49hds9jKEXelU\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 4488,
		"path": "../public/assets/iade-iptal-politikasi-Cid2OEoJ.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/iletisim-CTBJRMrA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"770-2P4ygI0JwUEoyQfbu2OTMx/Jn3g\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 1904,
		"path": "../public/assets/iletisim-CTBJRMrA.js"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/index-D5O7Ur_5.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"26d9e-ow7N1O4+Yjjf1AlQ1cJN6FGIyyI\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 159134,
		"path": "../public/assets/index-D5O7Ur_5.css"
	},
	"/assets/kayit-ol-Cht7Y3yP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d53-MnCiB9yty+j0WM6UXMK/WhSkJdw\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 7507,
		"path": "../public/assets/kayit-ol-Cht7Y3yP.js"
	},
	"/assets/kisiye-ozel-hediye-CmeTpeqx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"10ab-kwgeDzF/JDAEe0At/I8/lgrO+2g\"",
		"mtime": "2026-09-17T21:23:42.827Z",
		"size": 4267,
		"path": "../public/assets/kisiye-ozel-hediye-CmeTpeqx.js"
	},
	"/assets/kvkk-DodCfuoo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190c-tfWE/D68pEN9uG/p7/Cj8JVGHCE\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 6412,
		"path": "../public/assets/kvkk-DodCfuoo.js"
	},
	"/assets/layers-CRq_trBh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a2-lxkRIxqGQJJUsDdxr6dhb+smUEY\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 418,
		"path": "../public/assets/layers-CRq_trBh.js"
	},
	"/assets/kullanim-sartlari-BFSLHP2V.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb3-cAo9xOb5i3I3TBmDEpYvk2itX2w\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 2995,
		"path": "../public/assets/kullanim-sartlari-BFSLHP2V.js"
	},
	"/assets/link-BGEbXR-c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6564-iE312Hn1C3Q6l+H6bHSpyCLXQmI\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 25956,
		"path": "../public/assets/link-BGEbXR-c.js"
	},
	"/assets/index-DiWvSigk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"50ae8-GittV9xix7vIHfZg75ySxiWwc+8\"",
		"mtime": "2026-09-17T21:23:42.826Z",
		"size": 330472,
		"path": "../public/assets/index-DiWvSigk.js"
	},
	"/assets/lazyRouteComponent-3S5VRRcG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1335-4BxhMmzD7KMwoJDYGs3Z3xP5U8I\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 4917,
		"path": "../public/assets/lazyRouteComponent-3S5VRRcG.js"
	},
	"/assets/loader-circle-CmgEtFg0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8d-ITJw7xOsz/T/QNQACKdj7JntDN0\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 141,
		"path": "../public/assets/loader-circle-CmgEtFg0.js"
	},
	"/assets/lock-BTOm-_yk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"cb-LrLwO8vug34y0AJ8iIx35HPbboo\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 203,
		"path": "../public/assets/lock-BTOm-_yk.js"
	},
	"/assets/mail-DDKdFKWi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d2-yIIEx/u8OcUefdZ8ByMvQoumV0E\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 210,
		"path": "../public/assets/mail-DDKdFKWi.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-Cd2gCQmN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185a-s8eL/QzpgKsNpvRRxNumMKoJ9lQ\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 6234,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-Cd2gCQmN.js"
	},
	"/assets/nasil-calisir-d-UOVZCo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1588-HZJuD64QAoNnLtTfSf6HaMGzI+g\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 5512,
		"path": "../public/assets/nasil-calisir-d-UOVZCo.js"
	},
	"/assets/on-bilgilendirme-formu-DhRVGont.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"116e-Gp01VQFt6UytFXH2nfTKi5EgXjA\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 4462,
		"path": "../public/assets/on-bilgilendirme-formu-DhRVGont.js"
	},
	"/assets/package-check-CAAoi8ax.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a7-ij55HEf7apFcoN92Tw76veSwrrk\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 423,
		"path": "../public/assets/package-check-CAAoi8ax.js"
	},
	"/assets/paketler-DRabfLDM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15fc-yh0Y6O00lDBcC2OiMKKnFI4IX4w\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 5628,
		"path": "../public/assets/paketler-DRabfLDM.js"
	},
	"/assets/panelim-DjU0nlx-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"251d-z/A7wMtlQt9bErkeyiGLArk972c\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 9501,
		"path": "../public/assets/panelim-DjU0nlx-.js"
	},
	"/assets/parsel-satin-al-DbOKLXrf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"434-cu/lux2RQFCPdF+GpNYVjEorpRY\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 1076,
		"path": "../public/assets/parsel-satin-al-DbOKLXrf.js"
	},
	"/assets/parsel-satin-al-CH3RV9Es.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2ade-5LtjAXaOFbF4N6rIP6w361Y2KW4\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 10974,
		"path": "../public/assets/parsel-satin-al-CH3RV9Es.js"
	},
	"/assets/parsellerim-DLgi1wg4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2c05-L2kUheR402RYhEJS0QnoA+1E3MQ\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 11269,
		"path": "../public/assets/parsellerim-DLgi1wg4.js"
	},
	"/assets/pazar-yeri-Bo2Xr7Vo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63a-71QyMthP2JNwgW8doVq3G6zXOKE\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 1594,
		"path": "../public/assets/pazar-yeri-Bo2Xr7Vo.js"
	},
	"/assets/phone-DwMp9viC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13f-vS5yFCrxlZlIxpF2xUL1GqL8+nQ\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 319,
		"path": "../public/assets/phone-DwMp9viC.js"
	},
	"/assets/play-RWSuMNVl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb-wFk8VhgNVULnonwxNBoUvCLyxa8\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 187,
		"path": "../public/assets/play-RWSuMNVl.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/refresh-cw-Cq71NfYJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"41e-E8IhzEWY96Xjd4Zd6WhrCNKW07k\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 1054,
		"path": "../public/assets/refresh-cw-Cq71NfYJ.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/profilim-DoOCYfUc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bc6-LmZGscX7c22qOi7R+zUbLZKpE5E\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 3014,
		"path": "../public/assets/profilim-DoOCYfUc.js"
	},
	"/assets/search-C4prwcQe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ab-Nf/7Ems0tyFdqzwUCiopdiHkd/o\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 171,
		"path": "../public/assets/search-C4prwcQe.js"
	},
	"/assets/routes-DUGqVY_V.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2efd-LWHiH0DEDi5cregH996nNR3UijA\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 12029,
		"path": "../public/assets/routes-DUGqVY_V.js"
	},
	"/assets/sertifika-dogrula-BGUqXrOH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16e1-pkFhDA88aXZqh48q6oXe8BRvmN0\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 5857,
		"path": "../public/assets/sertifika-dogrula-BGUqXrOH.js"
	},
	"/assets/sertifika-talep-CIpcb9vA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2186-iLQvh9nBkNH5QU9uE6qq4R+k9Fw\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 8582,
		"path": "../public/assets/sertifika-talep-CIpcb9vA.js"
	},
	"/assets/sertifikalarim-BPf-6d9O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28ec-b6SIaXSZzD6Rg56N8P12VNckKlc\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 10476,
		"path": "../public/assets/sertifikalarim-BPf-6d9O.js"
	},
	"/assets/sertifika-dogrula-DgAejcOB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"49a-fWN/EFgLJyQFlTPt7f2qZIdI6cU\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 1178,
		"path": "../public/assets/sertifika-dogrula-DgAejcOB.js"
	},
	"/assets/sevgiliye-hediye-BazWMi5Z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f76-ohYwC69HlRMusqsQ7kwxCsAb9/M\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 3958,
		"path": "../public/assets/sevgiliye-hediye-BazWMi5Z.js"
	},
	"/assets/sifre-yenile-Dhbt0EzT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1006-CmXH+Hhg0oqNn9XD+xgvo4COQ6Q\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 4102,
		"path": "../public/assets/sifre-yenile-Dhbt0EzT.js"
	},
	"/assets/siparislerim-BNeGQTrw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f33-2GZataEYJy1y1dgl4njrR4haQFo\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 3891,
		"path": "../public/assets/siparislerim-BNeGQTrw.js"
	},
	"/assets/shopping-cart-DAfFKxkm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6c5-DpLDawejr46LBJlNgFll7hECEoQ\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 1733,
		"path": "../public/assets/shopping-cart-DAfFKxkm.js"
	},
	"/assets/sifremi-unuttum-gIPrJ1Cs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"18a5-dMJDmjsSwSLyimhCmYFAoFXTzkQ\"",
		"mtime": "2026-09-17T21:23:42.828Z",
		"size": 6309,
		"path": "../public/assets/sifremi-unuttum-gIPrJ1Cs.js"
	},
	"/assets/sparkles-D4Li6fbV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1eb-OWwxXm1vAArXoiEUsUg3+UUGXmM\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 491,
		"path": "../public/assets/sparkles-D4Li6fbV.js"
	},
	"/assets/smartphone-Cey4vb7q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c2-W3v1QubA/e0IW2CWbH3WqYKx9ME\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 194,
		"path": "../public/assets/smartphone-Cey4vb7q.js"
	},
	"/assets/star-B8evEga9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d5-wDlsUOwkGvvJWeV+22+mp3me4s8\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 469,
		"path": "../public/assets/star-B8evEga9.js"
	},
	"/assets/supabaseBrowser-H823nToQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"33c14-9kfyP/QOROqvRRBOMcr4eFUAgqs\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 211988,
		"path": "../public/assets/supabaseBrowser-H823nToQ.js"
	},
	"/assets/trash-2-DYB1WKZL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"145-dKitZjdLRTcNha4JL1llDqAbByA\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 325,
		"path": "../public/assets/trash-2-DYB1WKZL.js"
	},
	"/assets/turkiye-haritasi-J-SifaNm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f2b-hh/plc8NZuERorEpy/lr7K6Eg0E\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 3883,
		"path": "../public/assets/turkiye-haritasi-J-SifaNm.js"
	},
	"/assets/useAuth-DQ-gmEX7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19c5-W8o1RptaDkIFuysKlNSQvoSLVaQ\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 6597,
		"path": "../public/assets/useAuth-DQ-gmEX7.js"
	},
	"/assets/useRouter-Bfknwdby.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20b5-IuM+CAALeZ5Y42bvd3N+GgqS5p0\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 8373,
		"path": "../public/assets/useRouter-Bfknwdby.js"
	},
	"/assets/user-DGFaOwCr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c1-swdwO19MOAGoJu6OsBZck1pkuQE\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 193,
		"path": "../public/assets/user-DGFaOwCr.js"
	},
	"/assets/user-round-C_BNunhi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3-5qF4jBzf0KgsDQaCVYNux5EZAI8\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 179,
		"path": "../public/assets/user-round-C_BNunhi.js"
	},
	"/assets/three.module-C5rh5wLt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b0d0c-yxZrAk456uilGR/GXmPe2vD3V3k\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 724236,
		"path": "../public/assets/three.module-C5rh5wLt.js"
	},
	"/assets/uyelik-sozlesmesi-DIKvI2cy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a2-MlvWZXPEJSfdQTKFM/nRkpOwHZU\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 9634,
		"path": "../public/assets/uyelik-sozlesmesi-DIKvI2cy.js"
	},
	"/assets/yonetim-DOn3Sy6_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c84-6RfOknMxcJyY8KsGIO37ElAZOoQ\"",
		"mtime": "2026-09-17T21:23:42.829Z",
		"size": 35972,
		"path": "../public/assets/yonetim-DOn3Sy6_.js"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-17T21:23:44.320Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c4-cuFwIStF+1ItvnpBQQU9Kt9iZVs\"",
		"mtime": "2026-09-17T21:23:44.320Z",
		"size": 8388,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-17T21:23:44.320Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c8-aE0wi3G5UwBm20hIOogcLwFw76I\"",
		"mtime": "2026-09-17T21:23:44.320Z",
		"size": 8392,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20b9-i2nAOC3dv8uH13uIuFse9o5qOkg\"",
		"mtime": "2026-09-17T21:23:44.320Z",
		"size": 8377,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-17T21:23:44.320Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-17T21:23:13.553Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-17T21:23:44.321Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-17T21:23:44.322Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-17T21:23:44.321Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-17T21:23:44.322Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-17T21:23:44.322Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-17T21:23:44.321Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-17T21:23:44.322Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-17T21:23:44.321Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-17T21:23:44.322Z",
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
