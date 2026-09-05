import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Logo } from "./Logo-BeAdC7v8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CwJ9VeR8.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var MySkyParcelEarthGlobe = (0, import_react.lazy)(() => import("./MySkyParcelEarthGlobeSafe-PJLPXFiM.mjs").then((module) => ({ default: module.MySkyParcelEarthGlobeSafe })));
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative z-0 min-h-screen overflow-hidden bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_75%_20%,rgba(34,211,238,0.08),transparent_32%),linear-gradient(180deg,rgba(1,4,11,0.12),rgba(1,4,11,0.3))]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-20 mx-auto grid min-h-screen w-full max-w-[1400px] min-w-0 grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative z-20 flex min-w-0 items-start px-4 pb-10 pt-4 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10 xl:px-14",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "pointer-events-auto flex min-w-0 flex-col items-start",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 max-w-[360px] text-left drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[9px] font-semibold tracking-[0.12em] text-cyan-100 sm:text-[10px]",
									children: "81 İL · 81 MİLYON PARSEL"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-[10px] font-medium text-foreground/90 sm:text-xs",
									children: "Türkiye'den dünyaya açılacak bir proje."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-2 text-base font-bold leading-tight tracking-tight text-white sm:text-xl",
									children: "GÖKYÜZÜNDE KENDİ PARSELİNİ SEÇ."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1.5 text-[10px] leading-4 text-foreground/85 sm:text-xs sm:leading-5",
									children: [
										"Gökyüzündeki yerini keşfet.",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										"Şehrini seç, parselini seç ve sana ait dijital gökyüzü parselini oluştur."
									]
								})
							]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative z-0 min-h-[440px] min-w-0 w-full overflow-hidden lg:min-h-screen",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
						fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "absolute inset-0 z-0 bg-background",
							"aria-label": "Küre yükleniyor"
						}),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MySkyParcelEarthGlobe, { className: "relative h-full min-h-[440px] w-full min-w-0 max-w-full overflow-hidden rounded-none border-0 bg-transparent shadow-none lg:min-h-screen" })
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "msp-ui-layer absolute right-4 top-4 z-30 sm:right-8 sm:top-8 lg:right-12 lg:top-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/turkiye-haritasi",
					"aria-label": "Parsel seçim haritasına git",
					className: "pointer-events-auto inline-flex items-center justify-center rounded-xl border border-cyan-200/80 bg-cyan-300 px-5 py-2.5 text-xs font-bold tracking-[0.08em] text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200 sm:px-6 sm:py-3 sm:text-sm",
					children: "PARSELE GİT →"
				})
			})
		]
	});
}
//#endregion
export { Landing as component };
