import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Logo-BeAdC7v8.mjs
var import_jsx_runtime = require_jsx_runtime();
function Logo() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/ana-sayfa",
		"aria-label": "MySkyParcel ana sayfa",
		className: "block shrink-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/myskyparcel-logo.svg",
			alt: "MySkyParcel — Gökyüzünde Sana Özel Bir Yer",
			className: "h-auto w-[180px] object-contain sm:w-[220px]",
			width: 1536,
			height: 526,
			decoding: "async"
		})
	});
}
//#endregion
export { Logo as t };
