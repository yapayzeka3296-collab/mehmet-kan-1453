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
		"etag": "\"b3-q4U+Lz+OA1IC7zeKuGfh6t/KoAc\"",
		"mtime": "2026-09-04T00:31:45.935Z",
		"size": 179,
		"path": "../public/.htaccess"
	},
	"/hero-background.jpg": {
		"type": "image/jpeg",
		"etag": "\"22b9a-LtgBawIJpjJjbpNNKHExcIJ6J1s\"",
		"mtime": "2026-09-04T00:31:45.935Z",
		"size": 142234,
		"path": "../public/hero-background.jpg"
	},
	"/login-background.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"65e-MHb8tyQvnZqF3VBcapfMngMf+Qc\"",
		"mtime": "2026-09-04T00:31:45.935Z",
		"size": 1630,
		"path": "../public/login-background.css"
	},
	"/myskyparcel-logo.svg": {
		"type": "image/svg+xml",
		"etag": "\"6c8-U1Ish7Sm/1+JwTXAmyBhWF3CxZw\"",
		"mtime": "2026-09-04T00:31:45.935Z",
		"size": 1736,
		"path": "../public/myskyparcel-logo.svg"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"a0-CKGXSIe7TSsqDTmGm/nY1t/o5d0\"",
		"mtime": "2026-09-04T00:31:45.935Z",
		"size": 160,
		"path": "../public/robots.txt"
	},
	"/assets/CertificateTemplatePreview-D0POOyDq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113e-II1cBWk9yJJMZqUGURgkewJyixs\"",
		"mtime": "2026-09-04T00:31:44.622Z",
		"size": 4414,
		"path": "../public/assets/CertificateTemplatePreview-D0POOyDq.js"
	},
	"/assets/CityParcelLivePage-DwOHUH6x.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"39bc-dflV4b7iG1doJ87yUKoqvx7MeNI\"",
		"mtime": "2026-09-04T00:31:44.622Z",
		"size": 14780,
		"path": "../public/assets/CityParcelLivePage-DwOHUH6x.js"
	},
	"/assets/Logo-DwFimv2N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1aa-8C7SgmbWQgXf/l2tyDT7dakCxhI\"",
		"mtime": "2026-09-04T00:31:44.622Z",
		"size": 426,
		"path": "../public/assets/Logo-DwFimv2N.js"
	},
	"/assets/.htaccess": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"cd-FaeMXcnpfSW7Q5Y1D4GWmlv/CWs\"",
		"mtime": "2026-09-04T00:31:45.935Z",
		"size": 205,
		"path": "../public/assets/.htaccess"
	},
	"/assets/ParcelDetailPanel-BNU96fu0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4b9b-81PpUOUPaypp3joauuEIKkO9vds\"",
		"mtime": "2026-09-04T00:31:44.622Z",
		"size": 19355,
		"path": "../public/assets/ParcelDetailPanel-BNU96fu0.js"
	},
	"/assets/SiteFooter-BeZeCtB6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1022-ycW2dpPLOL5IQfYi83RfQVMI9Yw\"",
		"mtime": "2026-09-04T00:31:44.622Z",
		"size": 4130,
		"path": "../public/assets/SiteFooter-BeZeCtB6.js"
	},
	"/assets/SiteHeader-Bn_AYF8Y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32f6-Gzm/cCUzHOLNeW7X3AvRlklbvMI\"",
		"mtime": "2026-09-04T00:31:44.622Z",
		"size": 13046,
		"path": "../public/assets/SiteHeader-Bn_AYF8Y.js"
	},
	"/assets/TrustBar-NzN2wlXq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"702-eUz3up4chyGxymKRkt3CG2bumrs\"",
		"mtime": "2026-09-04T00:31:44.622Z",
		"size": 1794,
		"path": "../public/assets/TrustBar-NzN2wlXq.js"
	},
	"/assets/UserSidebar-qXUagCNg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b3e-yMdV1GKUWBq+MA2YF/8tM4XDkj8\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 2878,
		"path": "../public/assets/UserSidebar-qXUagCNg.js"
	},
	"/assets/_slug-1kadZQgm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2112-UBR+ibFfQgJgWPDBOn/wKRjS2FQ\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 8466,
		"path": "../public/assets/_slug-1kadZQgm.js"
	},
	"/assets/_slug-Bicu84Uh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"272-FnUXvBFg95u84VZDED+qsKiRUDg\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 626,
		"path": "../public/assets/_slug-Bicu84Uh.js"
	},
	"/assets/ana-sayfa-BS4fQvVl.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"249c-TnD3bpzMR+ATOCKbDAziGiJ/ZFw\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 9372,
		"path": "../public/assets/ana-sayfa-BS4fQvVl.js"
	},
	"/assets/arrow-left-DWs8reEk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"96-eypTUqVmrtvMvJP73015LLNGJns\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 150,
		"path": "../public/assets/arrow-left-DWs8reEk.js"
	},
	"/assets/arrow-right-DkPvHfMW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"96-u1sjQPECLW/8yHberP4Qed8CRuY\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 150,
		"path": "../public/assets/arrow-right-DkPvHfMW.js"
	},
	"/assets/award-DGrmdhOE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"103-Knu3w5XFIcX9LCAA4fSTrObmF9s\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 259,
		"path": "../public/assets/award-DGrmdhOE.js"
	},
	"/assets/bildirimler-CD2qyEeb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a31-/Mm4YxPbEC9GuSq2sbHnWn89EbY\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 2609,
		"path": "../public/assets/bildirimler-CD2qyEeb.js"
	},
	"/assets/boxes-DP4AA1mx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"344-4CeiGq0GjZ39NhK5iURK1wKTfV0\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 836,
		"path": "../public/assets/boxes-DP4AA1mx.js"
	},
	"/assets/cerez-politikasi-19AhWivF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e00-7DYkK/QboTK0/197r+gBK+eb5TI\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 3584,
		"path": "../public/assets/cerez-politikasi-19AhWivF.js"
	},
	"/assets/certificateTemplates-BRIWk3kA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"64a2-f0EpRV3zmSolYtn1J/VS00AwWmE\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 25762,
		"path": "../public/assets/certificateTemplates-BRIWk3kA.js"
	},
	"/assets/MySkyParcelEarthGlobe-BchiE1J6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"819af-9XEYFl8z4j6eUoLdNVp4Zsk92wI\"",
		"mtime": "2026-09-04T00:31:44.622Z",
		"size": 530863,
		"path": "../public/assets/MySkyParcelEarthGlobe-BchiE1J6.js"
	},
	"/assets/circle-check-Cy1nRfOp.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a3-oNznFIdDt66GEhU6iRGjKzGu2Rw\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 163,
		"path": "../public/assets/circle-check-Cy1nRfOp.js"
	},
	"/assets/check-00lAq1zs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6d-v82OCwYezQhAF/VzVqee4nci/no\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 109,
		"path": "../public/assets/check-00lAq1zs.js"
	},
	"/assets/circle-x-_4dcCzyn.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c0-jPSuqWCZkcv0gWajqNEtGsttMKA\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 192,
		"path": "../public/assets/circle-x-_4dcCzyn.js"
	},
	"/assets/dogrula-CUXeXrwO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16aa-HRiVnrAC4dUwlZHmcgIOgz/IZvk\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 5802,
		"path": "../public/assets/dogrula-CUXeXrwO.js"
	},
	"/assets/file-badge-Ct29h-j4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ba-yLHbAUMir0mAOvwo8fHEniFsJZo\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 442,
		"path": "../public/assets/file-badge-Ct29h-j4.js"
	},
	"/assets/gift-CyDlDjlX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14e-wvq8sJB2yiFfX7w/9dS1RWCa3Qg\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 334,
		"path": "../public/assets/gift-CyDlDjlX.js"
	},
	"/assets/eye-kyXh2nCG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f1-6VsM/6BteN2+xvXl1FHgMlBolek\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 241,
		"path": "../public/assets/eye-kyXh2nCG.js"
	},
	"/assets/giris-BHpk_5_k.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2b9f-68r9IojkdYGj/93PIxfxqf16EdA\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 11167,
		"path": "../public/assets/giris-BHpk_5_k.js"
	},
	"/assets/gizlilik-politikasi-Eqdzs4gV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"94c-qY89aCEJvX6eRLD0DNQP0Sebt8c\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 2380,
		"path": "../public/assets/gizlilik-politikasi-Eqdzs4gV.js"
	},
	"/assets/globe-1KNWECIC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"32-oY3L0ExCQZYwcX6nfBQowqJXosM\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 50,
		"path": "../public/assets/globe-1KNWECIC.js"
	},
	"/assets/gokyuzu-haritasi-CM1BW7OS.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9e9-8jikMBHCjb/CiZ1sVJFFAKYVUlk\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 2537,
		"path": "../public/assets/gokyuzu-haritasi-CM1BW7OS.js"
	},
	"/assets/guvenlik-ayarlari-D8iKCu9C.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"23bb-I1vZ4yUKsJfMh1nhGk6my15n/3g\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 9147,
		"path": "../public/assets/guvenlik-ayarlari-D8iKCu9C.js"
	},
	"/assets/hakkimizda-Cdg2JRV6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1ee8-thHhF6nKyQrx5U8SjSFQGp3C398\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 7912,
		"path": "../public/assets/hakkimizda-Cdg2JRV6.js"
	},
	"/assets/hediye-kabul-YhOz0T_F.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1800-uGaEkoUUNbrmeXrhBvNDMoroveU\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 6144,
		"path": "../public/assets/hediye-kabul-YhOz0T_F.js"
	},
	"/assets/heart-C4CcLg80.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f3-Je1UCZ83RurDEAqO99OIjarrJAM\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 243,
		"path": "../public/assets/heart-C4CcLg80.js"
	},
	"/assets/hediyelerim-C8zDR5Ak.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2135-tz1mX9z01FXiQMe2y0jeBA8kI/Y\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 8501,
		"path": "../public/assets/hediyelerim-C8zDR5Ak.js"
	},
	"/assets/hero-city-COMI2E0Z.jpg": {
		"type": "image/jpeg",
		"etag": "\"40dab-Swer5uTeonUmIi8ZB4GQHNV8J58\"",
		"mtime": "2026-09-04T00:31:44.625Z",
		"size": 265643,
		"path": "../public/assets/hero-city-COMI2E0Z.jpg"
	},
	"/assets/hero-city-CREMy9qr.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36-X8o/TZkWD0ol7OmmmbJ1B2HFqgs\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 54,
		"path": "../public/assets/hero-city-CREMy9qr.js"
	},
	"/assets/iade-iptal-politikasi-B7yKPz6s.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"118a-n/REMpmHUClbnAlc66qtRPVmJtA\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 4490,
		"path": "../public/assets/iade-iptal-politikasi-B7yKPz6s.js"
	},
	"/assets/iletisim-v-a2wIN6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14b7-kT0HswVtpD3gfEVWJeRFFZPEtdo\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 5303,
		"path": "../public/assets/iletisim-v-a2wIN6.js"
	},
	"/assets/index-D9gKK4cm.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"2673e-cg+0bB17E3rdPbSWXZAhqc7sL10\"",
		"mtime": "2026-09-04T00:31:44.625Z",
		"size": 157502,
		"path": "../public/assets/index-D9gKK4cm.css"
	},
	"/assets/jsx-runtime-DE3RlOCf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1edb-++aNIhyKgQeSqFVy8og9djQ1xvw\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 7899,
		"path": "../public/assets/jsx-runtime-DE3RlOCf.js"
	},
	"/assets/index-QKk9mOAb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4eba1-E4Q0RdsXahrRS1fCF1gnERWjDRk\"",
		"mtime": "2026-09-04T00:31:44.621Z",
		"size": 322465,
		"path": "../public/assets/index-QKk9mOAb.js"
	},
	"/assets/kayit-ol-BhciLGM0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d55-t30dsLtjcSnWKYeKHKoNNqoNDSQ\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 7509,
		"path": "../public/assets/kayit-ol-BhciLGM0.js"
	},
	"/assets/globe-N3120dWu.png": {
		"type": "image/png",
		"etag": "\"9b409-t4zUsTfoPsK7Y4I99jeco6LoMcw\"",
		"mtime": "2026-09-04T00:31:44.625Z",
		"size": 635913,
		"path": "../public/assets/globe-N3120dWu.png"
	},
	"/assets/kullanim-sartlari-ADVpXjjE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bb5-GR285WeOOpNkcTSZToR7W4VIn/8\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 2997,
		"path": "../public/assets/kullanim-sartlari-ADVpXjjE.js"
	},
	"/assets/layers-Biz-lGsN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"196-1tTtJzo4myp0NnaqCxCgnSj7Dos\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 406,
		"path": "../public/assets/layers-Biz-lGsN.js"
	},
	"/assets/lazyRouteComponent-Bmrwwm4f.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1358-XCm7pS5kXnBOwYtNIwqDKon+uQU\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 4952,
		"path": "../public/assets/lazyRouteComponent-Bmrwwm4f.js"
	},
	"/assets/kvkk-DEYd0IUM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"190e-rQO+6Sbt3Ap7TuVwcQVS6p9Y5TU\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 6414,
		"path": "../public/assets/kvkk-DEYd0IUM.js"
	},
	"/assets/link-D90cKH_E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6586-fb9WKhVhfd8d9CoIJ7QJ59V1DGQ\"",
		"mtime": "2026-09-04T00:31:44.623Z",
		"size": 25990,
		"path": "../public/assets/link-D90cKH_E.js"
	},
	"/assets/loader-circle-BxSgGKPt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"81-3TekXF/6elY5F6xX7S26QkPqeUc\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 129,
		"path": "../public/assets/loader-circle-BxSgGKPt.js"
	},
	"/assets/mail-0JlEdQAB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c6-5+H8vW7y3ULRMuyouZwVnUUnVSM\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 198,
		"path": "../public/assets/mail-0JlEdQAB.js"
	},
	"/assets/lock-C41urahQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bf-42PTmPX5N1VoOcc1PXyF2tgbXYY\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 191,
		"path": "../public/assets/lock-C41urahQ.js"
	},
	"/assets/map-pin-Cqt_e9on.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f4-vrYA7xEpj0Z7MdRFgFgqmUqbME0\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 244,
		"path": "../public/assets/map-pin-Cqt_e9on.js"
	},
	"/assets/mesafeli-satis-sozlesmesi-f0r3pQYJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"185c-sRp3m7Yo0hKk803JExORaTQuceQ\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 6236,
		"path": "../public/assets/mesafeli-satis-sozlesmesi-f0r3pQYJ.js"
	},
	"/assets/nasil-calisir-i6b2_Sfu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"157e-GNvTAzR8O9cjRsUPyPnhBbBadd4\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 5502,
		"path": "../public/assets/nasil-calisir-i6b2_Sfu.js"
	},
	"/assets/odeme-C7Le-uNB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3e7-kGSaWk3FbGsMbqEdxm0qJ4/CQJg\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 999,
		"path": "../public/assets/odeme-C7Le-uNB.js"
	},
	"/assets/odeme-Dpt2OMPs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20c9-EBhgrm5N9NINTm4Ok/yKesdVM4Q\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 8393,
		"path": "../public/assets/odeme-Dpt2OMPs.js"
	},
	"/assets/odeme-sonuc-BgwMOkgz.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b6f-mCR/vG5Opl/ufkotsitZQ4bpI/s\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 2927,
		"path": "../public/assets/odeme-sonuc-BgwMOkgz.js"
	},
	"/assets/on-bilgilendirme-formu-XWIcTnEF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1170-8IrUTLwF323dSBZ+Me38h4W3koo\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 4464,
		"path": "../public/assets/on-bilgilendirme-formu-XWIcTnEF.js"
	},
	"/assets/odeme-sonuc-Dd0-3doX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"36b-eG0YF5qVnXrrvdZDN/fhCvtG8BY\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 875,
		"path": "../public/assets/odeme-sonuc-Dd0-3doX.js"
	},
	"/assets/package-check-DzdXMIKE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19b-8B7USNfNK9K35KD4JeYtsoUrscA\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 411,
		"path": "../public/assets/package-check-DzdXMIKE.js"
	},
	"/assets/panelim-D3pFv4kT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"24ea-wwVhas6TiW4Oz0mMHIxWpN8OEDg\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 9450,
		"path": "../public/assets/panelim-D3pFv4kT.js"
	},
	"/assets/parsel-satin-al-7LvgAlky.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ed-XjToqYyMLJ7nuQvPbDVrw6XZ7Tk\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 1261,
		"path": "../public/assets/parsel-satin-al-7LvgAlky.js"
	},
	"/assets/parsel-satin-al-COVL-BDO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"258b-rbSRa+EGPKjP4tMFRauTMkAbq2s\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 9611,
		"path": "../public/assets/parsel-satin-al-COVL-BDO.js"
	},
	"/assets/paketler-DlI2otk8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14cd-NYJvq7ESrQwJ2rFj/pkflmE1CfQ\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 5325,
		"path": "../public/assets/paketler-DlI2otk8.js"
	},
	"/assets/parsellerim-Bc07HPP0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2a7c-zXPGJrTzpaV1jEbzVWm4w+co61U\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 10876,
		"path": "../public/assets/parsellerim-Bc07HPP0.js"
	},
	"/assets/pazar-yeri-Bkan1HtV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63c-RJEWlARGIAIsbNWiLZPTupZ74CQ\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 1596,
		"path": "../public/assets/pazar-yeri-Bkan1HtV.js"
	},
	"/assets/phone-CXSxdpW4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"133-tlxs+oSvrQb42TthsTkSlTH0tKY\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 307,
		"path": "../public/assets/phone-CXSxdpW4.js"
	},
	"/assets/play-BxE8Lpsq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"af-V66Vbsn74ZQrj17GzQo4LzmnKpk\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 175,
		"path": "../public/assets/play-BxE8Lpsq.js"
	},
	"/assets/preload-helper-Czpn1I53.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4ac-sE+5KsaRXTMfwOfrOATQajMSGV4\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 1196,
		"path": "../public/assets/preload-helper-Czpn1I53.js"
	},
	"/assets/refresh-cw-BMYaAggc.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"412-LzN4cRMQgp6kaOQQfv+4pS/3+vk\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 1042,
		"path": "../public/assets/refresh-cw-BMYaAggc.js"
	},
	"/assets/rolldown-runtime-hePW80VL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2cc-fA8td6k29UVF6JoPfhOPkceTK1M\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 716,
		"path": "../public/assets/rolldown-runtime-hePW80VL.js"
	},
	"/assets/routes-CdQQKoK8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aa6-TMZs5vAjmLqMAEOxBk6oSoYX13k\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 2726,
		"path": "../public/assets/routes-CdQQKoK8.js"
	},
	"/assets/profilim-D9zS1_Un.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b98-/XbMdIEgr12Ssu6cb+WjrIRfbQY\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 2968,
		"path": "../public/assets/profilim-D9zS1_Un.js"
	},
	"/assets/search-DLltCVYE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9f-TsihnKyH2eQ/IbDAINWeVRiwBbQ\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 159,
		"path": "../public/assets/search-DLltCVYE.js"
	},
	"/assets/sertifika-dogrula-CCawhoW0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"48a-X4QXZbsxpWp4PWcX3LHfYr+MPJM\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 1162,
		"path": "../public/assets/sertifika-dogrula-CCawhoW0.js"
	},
	"/assets/sertifika-dogrula-y67_wE9H.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16cf-1md2POBG/xG3IZTPtISvipQgPEk\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 5839,
		"path": "../public/assets/sertifika-dogrula-y67_wE9H.js"
	},
	"/assets/sertifika-talep-CpVorSyy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"215d-1HSwL+gV9+xsCQAkHRG4RVOLBvg\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 8541,
		"path": "../public/assets/sertifika-talep-CpVorSyy.js"
	},
	"/assets/sifre-yenile-C-BR6v2o.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"fd1-g0KKX6roan9go/6w5KOq873ez/s\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 4049,
		"path": "../public/assets/sifre-yenile-C-BR6v2o.js"
	},
	"/assets/sertifikalarim-BORS1uwg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"28b2-03yAVbj2pcii43/ATIYhozoMQdo\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 10418,
		"path": "../public/assets/sertifikalarim-BORS1uwg.js"
	},
	"/assets/sifremi-unuttum-DDSySwlg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"188e-XXSvFTpCGemizB2JCYiBUx6AT/s\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 6286,
		"path": "../public/assets/sifremi-unuttum-DDSySwlg.js"
	},
	"/assets/smartphone-UxzcEjmZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b6-998RHK71g2C5BxTmwBNDDlFYNRo\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 182,
		"path": "../public/assets/smartphone-UxzcEjmZ.js"
	},
	"/assets/siparislerim-CDCH1mv8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"efe-aFJPPypeUdA6xCCzTd6FCxXRvl4\"",
		"mtime": "2026-09-04T00:31:44.624Z",
		"size": 3838,
		"path": "../public/assets/siparislerim-CDCH1mv8.js"
	},
	"/assets/sparkles-DxsTQQBM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1df-iNQkADOLy2lkxEALDn6y6O5jjHo\"",
		"mtime": "2026-09-04T00:31:44.625Z",
		"size": 479,
		"path": "../public/assets/sparkles-DxsTQQBM.js"
	},
	"/assets/star-BovTK9xm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1c9-CPBYUvxiGQUoW0xafBYfqJcug08\"",
		"mtime": "2026-09-04T00:31:44.625Z",
		"size": 457,
		"path": "../public/assets/star-BovTK9xm.js"
	},
	"/assets/turkiye-haritasi-WqXrS1WT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"f08-QDpafkJy1c/8RhTL3HsSvOZ9u/s\"",
		"mtime": "2026-09-04T00:31:44.625Z",
		"size": 3848,
		"path": "../public/assets/turkiye-haritasi-WqXrS1WT.js"
	},
	"/assets/user-DzpdyRcC.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"b5-q6rZhIptO6ephYbot7KuUZlLfSA\"",
		"mtime": "2026-09-04T00:31:44.625Z",
		"size": 181,
		"path": "../public/assets/user-DzpdyRcC.js"
	},
	"/assets/useRouter-VMLxvdJG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"236-9wTGogEQs6FVqKrigBHqv3aErX8\"",
		"mtime": "2026-09-04T00:31:44.625Z",
		"size": 566,
		"path": "../public/assets/useRouter-VMLxvdJG.js"
	},
	"/assets/uyelik-sozlesmesi-Ce0Y4bjM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25a4-sI0spzZP14iV3AtFArz8tdVmhw8\"",
		"mtime": "2026-09-04T00:31:44.625Z",
		"size": 9636,
		"path": "../public/assets/uyelik-sozlesmesi-Ce0Y4bjM.js"
	},
	"/assets/useAuth-DU-yA3pj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3556a-WJaSxqwWtpFGRiVOQsmRBmZiG4c\"",
		"mtime": "2026-09-04T00:31:44.625Z",
		"size": 218474,
		"path": "../public/assets/useAuth-DU-yA3pj.js"
	},
	"/assets/x-Q6MQbkq7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"63d-/9kKqTheXV9n/gxnYGp+IszZTho\"",
		"mtime": "2026-09-04T00:31:44.625Z",
		"size": 1597,
		"path": "../public/assets/x-Q6MQbkq7.js"
	},
	"/assets/yonetim-DRdeO0_n.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"7e0c-YXl3+cEjNbcawIjpuYG6NSuKZaw\"",
		"mtime": "2026-09-04T00:31:44.625Z",
		"size": 32268,
		"path": "../public/assets/yonetim-DRdeO0_n.js"
	},
	"/sertifikalar/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
		"mtime": "2026-09-04T00:31:26.112Z",
		"size": 0,
		"path": "../public/sertifikalar/.gitkeep"
	},
	"/certificate-templates/digital-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c8-aE0wi3G5UwBm20hIOogcLwFw76I\"",
		"mtime": "2026-09-04T00:31:45.933Z",
		"size": 8392,
		"path": "../public/certificate-templates/digital-v2.svg"
	},
	"/certificate-templates/digital.svg": {
		"type": "image/svg+xml",
		"etag": "\"c76-HELcVQqB1OtqWxJCYieBuTk+xsE\"",
		"mtime": "2026-09-04T00:31:45.933Z",
		"size": 3190,
		"path": "../public/certificate-templates/digital.svg"
	},
	"/certificate-templates/premium-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20c4-cuFwIStF+1ItvnpBQQU9Kt9iZVs\"",
		"mtime": "2026-09-04T00:31:45.933Z",
		"size": 8388,
		"path": "../public/certificate-templates/premium-v2.svg"
	},
	"/certificate-templates/premium.svg": {
		"type": "image/svg+xml",
		"etag": "\"e80-Fi4x2Epr1/SgqaGh4nLCNA1zWFs\"",
		"mtime": "2026-09-04T00:31:45.934Z",
		"size": 3712,
		"path": "../public/certificate-templates/premium.svg"
	},
	"/certificate-templates/special-v2.svg": {
		"type": "image/svg+xml",
		"etag": "\"20b9-i2nAOC3dv8uH13uIuFse9o5qOkg\"",
		"mtime": "2026-09-04T00:31:45.933Z",
		"size": 8377,
		"path": "../public/certificate-templates/special-v2.svg"
	},
	"/certificate-templates/special.svg": {
		"type": "image/svg+xml",
		"etag": "\"d80-7PJ7lUDp67H1nS+W0+Tg+ZezjbM\"",
		"mtime": "2026-09-04T00:31:45.933Z",
		"size": 3456,
		"path": "../public/certificate-templates/special.svg"
	},
	"/images/cities/.gitkeep": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"1-rcg7GeeTSRscbqD9i0bNnzLlkvw\"",
		"mtime": "2026-09-04T00:31:45.934Z",
		"size": 1,
		"path": "../public/images/cities/.gitkeep"
	},
	"/images/cities/ankara.webp": {
		"type": "image/webp",
		"etag": "\"39724-5sGylfcYb7pARnLmdqrxQK2PvHc\"",
		"mtime": "2026-09-04T00:31:45.935Z",
		"size": 235300,
		"path": "../public/images/cities/ankara.webp"
	},
	"/images/cities/antalya.webp": {
		"type": "image/webp",
		"etag": "\"466b4-i6WGZSY+2FEw5p8Td0AqRCtSWF4\"",
		"mtime": "2026-09-04T00:31:45.935Z",
		"size": 288436,
		"path": "../public/images/cities/antalya.webp"
	},
	"/images/cities/bursa.webp": {
		"type": "image/webp",
		"etag": "\"49a9c-p8Tf3sDHZzVJ1PJk5xCRvyWtdmc\"",
		"mtime": "2026-09-04T00:31:45.934Z",
		"size": 301724,
		"path": "../public/images/cities/bursa.webp"
	},
	"/images/cities/kayseri.webp": {
		"type": "image/webp",
		"etag": "\"431d6-vIWlvO0ymn6SbmPOTInUOn23Quc\"",
		"mtime": "2026-09-04T00:31:45.935Z",
		"size": 274902,
		"path": "../public/images/cities/kayseri.webp"
	},
	"/images/cities/istanbul.webp": {
		"type": "image/webp",
		"etag": "\"54156-Ziug1DqyjZCuStFmwy74mOKzegI\"",
		"mtime": "2026-09-04T00:31:45.934Z",
		"size": 344406,
		"path": "../public/images/cities/istanbul.webp"
	},
	"/images/cities/gaziantep.webp": {
		"type": "image/webp",
		"etag": "\"686c6-WG65ocFmn7dmC8Ph0xequBS3btw\"",
		"mtime": "2026-09-04T00:31:45.934Z",
		"size": 427718,
		"path": "../public/images/cities/gaziantep.webp"
	},
	"/images/cities/izmir.webp": {
		"type": "image/webp",
		"etag": "\"4cc8e-ApicG6v3ykEkGsfglCG2mpYwxiQ\"",
		"mtime": "2026-09-04T00:31:45.935Z",
		"size": 314510,
		"path": "../public/images/cities/izmir.webp"
	},
	"/images/cities/turkey-3d-map.png": {
		"type": "image/png",
		"etag": "\"1ff1e2-T+JV7t9ulLAFtV0DkMCjwjX8Ehg\"",
		"mtime": "2026-09-04T00:31:45.935Z",
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
