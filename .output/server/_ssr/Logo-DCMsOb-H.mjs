import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Logo-DCMsOb-H.mjs
var import_jsx_runtime = require_jsx_runtime();
function Logo() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/ana-sayfa",
		"aria-label": "MySkyParcel ana sayfa",
		className: "block w-[150px] max-w-[150px] shrink-0 sm:w-[180px] sm:max-w-[180px] lg:w-[190px] lg:max-w-[190px] 2xl:w-[210px] 2xl:max-w-[210px]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/myskyparcel-logo.svg",
			alt: "MySkyParcel — Gökyüzünde Sana Özel Bir Yer",
			className: "!block !h-auto !w-full !max-w-full object-contain",
			style: {
				width: "100%",
				maxWidth: "100%",
				height: "auto"
			},
			width: 190,
			height: 65,
			decoding: "async"
		})
	});
}
//#endregion
export { Logo as t };
