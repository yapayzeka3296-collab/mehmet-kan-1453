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
		"mtime": "2026-09-02T17:31:37.612Z",
		"size": 1630,
		"path": "../public/login-background.css"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-02T17:31:37.612Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-02T17:31:37.612Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"cd-FaeMXcnpfSW7Q5Y1D4GWmlv/CWs\"",
		"mtime": "2026-09-02T17:31:37.612Z",
		"size": 205,
		"path": "../public/assets/.htaccess"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-09-02T17:31:37.612Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/assets/CityParcelLivePage--mIKTtz0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"39bc-S0LhgonoD3QeagO5tl4snaA/jdg\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 14780,
		"path": "../public/assets/CityParcelLivePage--mIKTtz0.js"
	},
	"/assets/Logo-DwFimv2N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1aa-8C7SgmbWQgXf/l2tyDT7dakCxhI\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 426,
		"path": "../public/assets/Logo-DwFimv2N.js"
	},
	"/assets/CertificateTemplatePreview-D0POOyDq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113e-II1cBWk9yJJMZqUGURgkewJyixs\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 4414,
		"path": "../public/assets/CertificateTemplatePreview-D0POOyDq.js"
	},
	"/assets/ParcelDetailPanel-yA4Oac6I.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b69-BMpe9DWZUWcB2YV+woqVFFDR4zc\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 19305,
		"path": "../public/assets/ParcelDetailPanel-yA4Oac6I.js"
	},
	"/assets/SiteFooter-BeZeCtB6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1022-ycW2dpPLOL5IQfYi83RfQVMI9Yw\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 4130,
		"path": "../public/assets/SiteFooter-BeZeCtB6.js"
	},
	"/assets/SiteHeader-CDYdn51A.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3257-v12RfZgop/fJjwqC7tniacDpK14\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 12887,
		"path": "../public/assets/SiteHeader-CDYdn51A.js"
	},
	"/assets/TrustBar-TWWgWoui.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"750-ieaNo3O/O5GcQj+a+LDsTHdAvFs\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 1872,
		"path": "../public/assets/TrustBar-TWWgWoui.js"
	},
	"/assets/UserSidebar-C6n8E_7B.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3e-FxNSFed+Lg3t7c4G+Pj1egGfS5M\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 2878,
		"path": "../public/assets/UserSidebar-C6n8E_7B.js"
	},
	"/assets/_slug-B4VM9F2H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"272-fSNNfPp/e/arstKdLYDVaIn8AL4\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 626,
		"path": "../public/assets/_slug-B4VM9F2H.js"
	},
	"/assets/_slug-DshRdpsO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2112-5JHtbQQxWnKdp5f0oMqDlGft0FQ\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 8466,
		"path": "../public/assets/_slug-DshRdpsO.js"
	},
	"/assets/ana-sayfa-dNPaku1t.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"249c-6UKb9m8U05BDfxSKZ/84/Md7j20\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 9372,
		"path": "../public/assets/ana-sayfa-dNPaku1t.js"
	},
	"/assets/arrow-left-DWs8reEk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"96-eypTUqVmrtvMvJP73015LLNGJns\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 150,
		"path": "../public/assets/arrow-left-DWs8reEk.js"
	},
	"/assets/arrow-right-DkPvHfMW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"96-u1sjQPECLW/8yHberP4Qed8CRuY\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 150,
		"path": "../public/assets/arrow-right-DkPvHfMW.js"
	},
	"/assets/award-DGrmdhOE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"103-Knu3w5XFIcX9LCAA4fSTrObmF9s\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 259,
		"path": "../public/assets/award-DGrmdhOE.js"
	},
	"/assets/bildirimler-k0pQ8Lt6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a31-pPyc4jrrCh8LFT3iZsSEcF/wRPU\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 2609,
		"path": "../public/assets/bildirimler-k0pQ8Lt6.js"
	},
	"/assets/boxes-DP4AA1mx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"344-4CeiGq0GjZ39NhK5iURK1wKTfV0\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 836,
		"path": "../public/assets/boxes-DP4AA1mx.js"
	},
	"/assets/cerez-politikasi-Dzc10JJt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e00-Q4cEfZtA73WngkLZv/jHenhfQLw\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 3584,
		"path": "../public/assets/cerez-politikasi-Dzc10JJt.js"
	},
	"/assets/certificateTemplates-BRIWk3kA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a2-f0EpRV3zmSolYtn1J/VS00AwWmE\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 25762,
		"path": "../public/assets/certificateTemplates-BRIWk3kA.js"
	},
	"/assets/check-00lAq1zs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6d-v82OCwYezQhAF/VzVqee4nci/no\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 109,
		"path": "../public/assets/check-00lAq1zs.js"
	},
	"/assets/MySkyParcelEarthGlobe-BchiE1J6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"819af-9XEYFl8z4j6eUoLdNVp4Zsk92wI\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 530863,
		"path": "../public/assets/MySkyParcelEarthGlobe-BchiE1J6.js"
	},
	"/assets/circle-check-Cy1nRfOp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a3-oNznFIdDt66GEhU6iRGjKzGu2Rw\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 163,
		"path": "../public/assets/circle-check-Cy1nRfOp.js"
	},
	"/assets/dogrula-Dp6gR8yz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16aa-8008/NdQytfFgQ8PNulREH2B4hE\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 5802,
		"path": "../public/assets/dogrula-Dp6gR8yz.js"
	},
	"/assets/circle-x-_4dcCzyn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-jPSuqWCZkcv0gWajqNEtGsttMKA\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 192,
		"path": "../public/assets/circle-x-_4dcCzyn.js"
	},
	"/assets/eye-kyXh2nCG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f1-6VsM/6BteN2+xvXl1FHgMlBolek\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 241,
		"path": "../public/assets/eye-kyXh2nCG.js"
	},
	"/assets/file-badge-Ct29h-j4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ba-yLHbAUMir0mAOvwo8fHEniFsJZo\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 442,
		"path": "../public/assets/file-badge-Ct29h-j4.js"
	},
	"/assets/gift-CyDlDjlX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14e-wvq8sJB2yiFfX7w/9dS1RWCa3Qg\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 334,
		"path": "../public/assets/gift-CyDlDjlX.js"
	},
	"/assets/giris-CaAUk6Sb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b9f-dOGQGGfRIgaD6rCWlsV1qfmrN34\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 11167,
		"path": "../public/assets/giris-CaAUk6Sb.js"
	},
	"/assets/gizlilik-politikasi-C8EsoIOh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94c-IAVdnJP3p/v7APjvyxnOAGAI7gE\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 2380,
		"path": "../public/assets/gizlilik-politikasi-C8EsoIOh.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-haritasi-DvOtK_Vm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9e9-jwSFFRX8e4yD/kESEfzA/QsJSjc\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 2537,
		"path": "../public/assets/gokyuzu-haritasi-DvOtK_Vm.js"
	},
	"/assets/guvenlik-ayarlari-B1-YPYyn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23bb-yMCA54ByvpuDdLmINa3ra7wG1Fs\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 9147,
		"path": "../public/assets/guvenlik-ayarlari-B1-YPYyn.js"
	},
	"/assets/heart-C4CcLg80.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f3-Je1UCZ83RurDEAqO99OIjarrJAM\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 243,
		"path": "../public/assets/heart-C4CcLg80.js"
	},
	"/assets/hediye-kabul-BLVM0IXb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1800-famISuS2htT/ReIzepexaah5Zxs\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 6144,
		"path": "../public/assets/hediye-kabul-BLVM0IXb.js"
	},
	"/assets/hakkimizda-BJNdAIAZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ee8-TuD0925FbPtIr1xdeLRZjqAXuYc\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 7912,
		"path": "../public/assets/hakkimizda-BJNdAIAZ.js"
	},
	"/assets/hediyelerim-BFQxavDF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2135-/woTQgtYhoxnSjVaAgAEPKCfbhk\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 8501,
		"path": "../public/assets/hediyelerim-BFQxavDF.js"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/iade-iptal-politikasi-CnIw7Jkc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"118a-6hS1yQgVdBeobqXdKOSYBA1IwGw\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 4490,
		"path": "../public/assets/iade-iptal-politikasi-CnIw7Jkc.js"
	},
	"/assets/iletisim-BGMum44d.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14b7-xLynaxyX4hyyFvOJJlQoRO/QpFc\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 5303,
		"path": "../public/assets/iletisim-BGMum44d.js"
	},
	"/assets/index-C96ccbzd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4eba1-dGJDa8BB5B4l4bFg/+0s0uy2jfA\"",
		"mtime": "2026-09-02T17:31:36.304Z",
		"size": 322465,
		"path": "../public/assets/index-C96ccbzd.js"
	},
	"/assets/index-yGtMBC21.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"26727-5a2akY5jwJQ/URNYfWrSPeMJKgE\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 157479,
		"path": "../public/assets/index-yGtMBC21.css"
	},
	"/assets/jsx-runtime-DE3RlOCf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1edb-++aNIhyKgQeSqFVy8og9djQ1xvw\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 7899,
		"path": "../public/assets/jsx-runtime-DE3RlOCf.js"
	},
	"/assets/kayit-ol-Deu-k30-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d55-SysoOtEa4c6kpB4c7FccA2NGAyY\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 7509,
		"path": "../public/assets/kayit-ol-Deu-k30-.js"
	},
	"/assets/kullanim-sartlari-CtJPNlvG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb5-DoSIlJnOYuUKtGviBi2jqfDe0C4\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 2997,
		"path": "../public/assets/kullanim-sartlari-CtJPNlvG.js"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/kvkk-CL1uTtfp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190e-10bXYsxDEyBkEVCLZ4Hm4zzvMoA\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 6414,
		"path": "../public/assets/kvkk-CL1uTtfp.js"
	},
	"/assets/layers-Biz-lGsN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"196-1tTtJzo4myp0NnaqCxCgnSj7Dos\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 406,
		"path": "../public/assets/layers-Biz-lGsN.js"
	},
	"/assets/lazyRouteComponent-CM1Q2zZN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1358-8fHsj1iWVY0GpyW90daBDROg87w\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 4952,
		"path": "../public/assets/lazyRouteComponent-CM1Q2zZN.js"
	},
	"/assets/link-D90cKH_E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6586-fb9WKhVhfd8d9CoIJ7QJ59V1DGQ\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 25990,
		"path": "../public/assets/link-D90cKH_E.js"
	},
	"/assets/loader-circle-BxSgGKPt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"81-3TekXF/6elY5F6xX7S26QkPqeUc\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 129,
		"path": "../public/assets/loader-circle-BxSgGKPt.js"
	},
	"/assets/mail-0JlEdQAB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c6-5+H8vW7y3ULRMuyouZwVnUUnVSM\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 198,
		"path": "../public/assets/mail-0JlEdQAB.js"
	},
	"/assets/map-pin-Cqt_e9on.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f4-vrYA7xEpj0Z7MdRFgFgqmUqbME0\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 244,
		"path": "../public/assets/map-pin-Cqt_e9on.js"
	},
	"/assets/lock-C41urahQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bf-42PTmPX5N1VoOcc1PXyF2tgbXYY\"",
		"mtime": "2026-09-02T17:31:36.305Z",
		"size": 191,
		"path": "../public/assets/lock-C41urahQ.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-Db0zVMp3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185c-07o7tIRGPup4f38TuKUOf4aR/+g\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 6236,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-Db0zVMp3.js"
	},
	"/assets/nasil-calisir-BHlcnUoC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"157e-rf64HPH0li4mX7B0/gj6iUU/Xv4\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 5502,
		"path": "../public/assets/nasil-calisir-BHlcnUoC.js"
	},
	"/assets/odeme-B83aLGcE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3e7-nGijlnK3zv1C0TWir/m7J9/UFoI\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 999,
		"path": "../public/assets/odeme-B83aLGcE.js"
	},
	"/assets/odeme-DL7b5-Cd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20c9-hCbTtGJNVWBzVfb1+q83htdj5TE\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 8393,
		"path": "../public/assets/odeme-DL7b5-Cd.js"
	},
	"/assets/odeme-sonuc-E1LwGbgB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36b-sNZo9borBGVdtU2W7ib0JvEBoBU\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 875,
		"path": "../public/assets/odeme-sonuc-E1LwGbgB.js"
	},
	"/assets/odeme-sonuc-wt-X4tw8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b6f-yeyY2OGYOUBDNKi1gkAGmCKlvy8\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 2927,
		"path": "../public/assets/odeme-sonuc-wt-X4tw8.js"
	},
	"/assets/on-bilgilendirme-formu-OBF70_VB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1170-K/ejO80yGX2DWRDsY5dCryNISaU\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 4464,
		"path": "../public/assets/on-bilgilendirme-formu-OBF70_VB.js"
	},
	"/assets/package-check-DzdXMIKE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19b-8B7USNfNK9K35KD4JeYtsoUrscA\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 411,
		"path": "../public/assets/package-check-DzdXMIKE.js"
	},
	"/assets/paketler-KgrQfipx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14cd-b/LQDmweKdY0AtQkSd6DCwwVWXg\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 5325,
		"path": "../public/assets/paketler-KgrQfipx.js"
	},
	"/assets/panelim-D0v_uOsY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24ea-JML9Ly2fG6LDYgvlm01NwhQJ3kY\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 9450,
		"path": "../public/assets/panelim-D0v_uOsY.js"
	},
	"/assets/parsel-satin-al-DbOsJUJ4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"258b-JhBs4SABYlrCYHmFXpvuH4DMn9c\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 9611,
		"path": "../public/assets/parsel-satin-al-DbOsJUJ4.js"
	},
	"/assets/parsel-satin-al-IZxPlVnP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ed-/sO1ZlcDAEMVAfd1FO8UXOhR0Xg\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 1261,
		"path": "../public/assets/parsel-satin-al-IZxPlVnP.js"
	},
	"/assets/parsellerim-L0IpYV1i.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a7c-WhlbJuWVTZbEQSDxZCzeBT2Ca40\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 10876,
		"path": "../public/assets/parsellerim-L0IpYV1i.js"
	},
	"/assets/pazar-yeri-DVnHw_7O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63c-sxZVpYIOie1G634q68Bxp51hX90\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 1596,
		"path": "../public/assets/pazar-yeri-DVnHw_7O.js"
	},
	"/assets/phone-CXSxdpW4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"133-tlxs+oSvrQb42TthsTkSlTH0tKY\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 307,
		"path": "../public/assets/phone-CXSxdpW4.js"
	},
	"/assets/play-BxE8Lpsq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"af-V66Vbsn74ZQrj17GzQo4LzmnKpk\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 175,
		"path": "../public/assets/play-BxE8Lpsq.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/profilim-kiKBMk3n.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b98-a9lZ7pCLq2dumQE9AluAsw9quJs\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 2968,
		"path": "../public/assets/profilim-kiKBMk3n.js"
	},
	"/assets/refresh-cw-BMYaAggc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"412-LzN4cRMQgp6kaOQQfv+4pS/3+vk\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 1042,
		"path": "../public/assets/refresh-cw-BMYaAggc.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/routes-CdQQKoK8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa6-TMZs5vAjmLqMAEOxBk6oSoYX13k\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 2726,
		"path": "../public/assets/routes-CdQQKoK8.js"
	},
	"/assets/search-DLltCVYE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9f-TsihnKyH2eQ/IbDAINWeVRiwBbQ\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 159,
		"path": "../public/assets/search-DLltCVYE.js"
	},
	"/assets/sertifika-dogrula-BCORbLmp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"48a-ovlbUGES5uTZ5S+oDG1Uvk6bfQA\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 1162,
		"path": "../public/assets/sertifika-dogrula-BCORbLmp.js"
	},
	"/assets/sertifika-dogrula-BMzzn00N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16cf-utMW60vnkoCs1MR095+9r8h4OhI\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 5839,
		"path": "../public/assets/sertifika-dogrula-BMzzn00N.js"
	},
	"/assets/sertifika-talep-B56zkSNL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"215d-gxvKEkUX/5H9R5AGTKKhk0j6G1I\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 8541,
		"path": "../public/assets/sertifika-talep-B56zkSNL.js"
	},
	"/assets/sertifikalarim-DS47IcXK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2686-8tn3bfUGoiRddHaScRIQ36T+j7g\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 9862,
		"path": "../public/assets/sertifikalarim-DS47IcXK.js"
	},
	"/assets/sifre-yenile-D_o8aTRD.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fd1-GZgxOYaL7J7nc+NDW64Cnwe1Y8w\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 4049,
		"path": "../public/assets/sifre-yenile-D_o8aTRD.js"
	},
	"/assets/sifremi-unuttum-CYrQdM06.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"188e-559Ozmx4YlcLSfPbC5SB05a4McM\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 6286,
		"path": "../public/assets/sifremi-unuttum-CYrQdM06.js"
	},
	"/assets/siparislerim-BxBfUirS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"efe-qVM2KAAT9EJD8YbCRvfxC1iy0kg\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 3838,
		"path": "../public/assets/siparislerim-BxBfUirS.js"
	},
	"/assets/smartphone-UxzcEjmZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b6-998RHK71g2C5BxTmwBNDDlFYNRo\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 182,
		"path": "../public/assets/smartphone-UxzcEjmZ.js"
	},
	"/assets/sparkles-DxsTQQBM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1df-iNQkADOLy2lkxEALDn6y6O5jjHo\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 479,
		"path": "../public/assets/sparkles-DxsTQQBM.js"
	},
	"/assets/star-BovTK9xm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c9-CPBYUvxiGQUoW0xafBYfqJcug08\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 457,
		"path": "../public/assets/star-BovTK9xm.js"
	},
	"/assets/turkiye-haritasi-vqg27W-Y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f08-aY9BWeMjozx6ql3uBS7RNsVQfD4\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 3848,
		"path": "../public/assets/turkiye-haritasi-vqg27W-Y.js"
	},
	"/assets/useAuth-BRV1yRSV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"350a7-bZ/4iCkkuVDHUdMBRzpoCBSiPe8\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 217255,
		"path": "../public/assets/useAuth-BRV1yRSV.js"
	},
	"/assets/user-DzpdyRcC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b5-q6rZhIptO6ephYbot7KuUZlLfSA\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 181,
		"path": "../public/assets/user-DzpdyRcC.js"
	},
	"/assets/useRouter-VMLxvdJG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"236-9wTGogEQs6FVqKrigBHqv3aErX8\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 566,
		"path": "../public/assets/useRouter-VMLxvdJG.js"
	},
	"/assets/uyelik-sozlesmesi-DnMyHLEE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a4-zxKSsXrXnVub1FmQjdtyqSZIPqM\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 9636,
		"path": "../public/assets/uyelik-sozlesmesi-DnMyHLEE.js"
	},
	"/assets/x-Q6MQbkq7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63d-/9kKqTheXV9n/gxnYGp+IszZTho\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 1597,
		"path": "../public/assets/x-Q6MQbkq7.js"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"1f48-b2FZwBjorRJIl7Fpg9YIsp4K650\"",
		"mtime": "2026-09-02T17:31:37.611Z",
		"size": 8008,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/assets/yonetim-DzAAYVp-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7e0c-1k7hX/ELp1flb62Y2c66zVn+BNs\"",
		"mtime": "2026-09-02T17:31:36.306Z",
		"size": 32268,
		"path": "../public/assets/yonetim-DzAAYVp-.js"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-02T17:31:37.611Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"10db-9NJPfaYHJH0IPwfwnfBcCRfUeeg\"",
		"mtime": "2026-09-02T17:31:37.611Z",
		"size": 4315,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-02T17:31:37.611Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"11e6-FxMTKbkrT8TG+MSgLjIAZCgOgyo\"",
		"mtime": "2026-09-02T17:31:37.611Z",
		"size": 4582,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-02T17:31:37.611Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-02T17:31:15.078Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-02T17:31:37.612Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-02T17:31:37.611Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-02T17:31:37.612Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-02T17:31:37.612Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-02T17:31:37.612Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-02T17:31:37.612Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-02T17:31:37.612Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-02T17:31:37.612Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-02T17:31:37.612Z",
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
