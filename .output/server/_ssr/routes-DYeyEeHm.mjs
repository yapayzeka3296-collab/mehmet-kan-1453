import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Logo } from "./Logo-BeAdC7v8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DYeyEeHm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MySkyParcelEarthGlobe = (0, import_react.lazy)(() => import("./MySkyParcelEarthGlobe-Ct3j85gm.mjs").then((module) => ({ default: module.MySkyParcelEarthGlobe })));
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative z-0 min-h-screen overflow-hidden bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
				fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "absolute inset-0 z-0 bg-background",
					"aria-label": "Küre yükleniyor"
				}),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MySkyParcelEarthGlobe, { className: "h-screen rounded-none border-0 bg-transparent shadow-none" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_75%_20%,rgba(34,211,238,0.08),transparent_32%),linear-gradient(180deg,rgba(1,4,11,0.12),rgba(1,4,11,0.3))]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "msp-ui-layer absolute left-4 top-4 sm:left-8 sm:top-8 lg:left-12 lg:top-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto flex flex-col items-start",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 max-w-[260px] bg-transparent p-0 text-left",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[9px] font-semibold tracking-[0.12em] text-cyan-100 sm:text-[10px]",
								children: "81 İL · 81 MİLYON PARSEL"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[10px] font-medium text-foreground/85 sm:text-xs",
								children: "Türkiye'den dünyaya açılacak bir proje."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-2 text-base font-bold leading-tight tracking-tight sm:text-xl",
								children: "GÖKYÜZÜNDE KENDİ PARSELİNİ SEÇ."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1.5 text-[10px] leading-4 text-foreground/80 sm:text-xs sm:leading-5",
								children: [
									"Gökyüzündeki yerini keşfet.",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Şehrini seç, parselini seç ve sana ait dijital gökyüzü parselini oluştur."
								]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "msp-ui-layer absolute right-4 top-4 sm:right-8 sm:top-8 lg:right-12 lg:top-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/ana-sayfa",
					className: "inline-flex items-center justify-center rounded-xl border border-cyan-200/70 bg-cyan-300 px-5 py-2.5 text-xs font-bold tracking-[0.08em] text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200 sm:px-6 sm:py-3 sm:text-sm",
					children: "PARSELİNİ KEŞFET →"
				})
			})
		]
	});
}
//#endregion
export { Landing as component };
