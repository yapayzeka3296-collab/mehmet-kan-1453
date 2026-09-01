import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/CertificateTemplatePreview-BVIKAQ6g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEMO_DATA = {
	holderName: "Örnek Kullanıcı",
	parcelCode: "MSP-DEMO-001",
	cityName: "Gaziantep",
	certificateNumber: "MSP-DEMO-2026",
	issueDate: "18.08.2026",
	fingerprint: "DEMO-CERTIFICATE-PREVIEW",
	verificationUrl: "https://myskyparcel.com/verify/demo-preview"
};
var LABELS = {
	digital: "Dijital",
	elite: "Özel",
	premium: "Premium"
};
function CertificateTemplatePreview({ tier, className = "" }) {
	const templateType = tier === "elite" ? "special" : tier;
	const [src, setSrc] = (0, import_react.useState)("");
	const [visible, setVisible] = (0, import_react.useState)(false);
	const [open, setOpen] = (0, import_react.useState)(false);
	const containerRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const element = containerRef.current;
		if (!element) return;
		if (typeof IntersectionObserver === "undefined") {
			setVisible(true);
			return;
		}
		const observer = new IntersectionObserver(([entry]) => {
			if (entry?.isIntersecting) {
				setVisible(true);
				observer.disconnect();
			}
		}, { rootMargin: "0px" });
		observer.observe(element);
		return () => observer.disconnect();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!visible) return;
		let cancelled = false;
		let idleId;
		let timeoutId;
		const loadPreview = async () => {
			try {
				const { renderCertificateSvg } = await import("./certificateTemplates-BmaaQXT4.mjs").then((n) => n.t);
				const svg = await renderCertificateSvg({
					templateType,
					...DEMO_DATA
				});
				if (!cancelled) setSrc(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
			} catch {
				if (!cancelled) setSrc("");
			}
		};
		const run = () => void loadPreview();
		if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(run, { timeout: 1200 });
		else timeoutId = window.setTimeout(run, 80);
		return () => {
			cancelled = true;
			if (idleId !== void 0 && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
			if (timeoutId !== void 0) window.clearTimeout(timeoutId);
		};
	}, [templateType, visible]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKeyDown = (event) => {
			if (event.key === "Escape") setOpen(false);
		};
		document.addEventListener("keydown", onKeyDown);
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.body.style.overflow = previousOverflow;
		};
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: containerRef,
		className: `min-w-0 ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => src && setOpen(true),
			disabled: !src,
			"aria-label": `${LABELS[tier]} sertifika şablonunu büyük görüntüle`,
			className: "group relative block w-full cursor-zoom-in overflow-hidden rounded-lg border border-gold/30 bg-slate-950 text-left shadow-lg transition duration-300 hover:border-gold/70 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-gold/70 disabled:cursor-default",
			children: [src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt: `${LABELS[tier]} MySkyParcel sertifika şablonu`,
				width: 1122,
				height: 794,
				decoding: "async",
				className: "block h-auto w-full transition duration-300 group-hover:scale-[1.015]"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex aspect-[1122/794] w-full items-center justify-center text-sm text-white/70",
				children: visible ? "Sertifika önizlemesi hazırlanıyor…" : "Sertifika önizlemesi"
			}), src && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 text-center text-[10px] font-medium tracking-wide text-white opacity-0 transition group-hover:opacity-100",
				children: "Büyütmek için tıklayın"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-2 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[10px] font-semibold uppercase tracking-[0.16em] text-gold",
				children: [LABELS[tier], " Sertifika"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-[9px] text-muted-foreground",
				children: "Büyük görüntülemek için şablona tıklayın"
			})]
		})]
	}), open && src && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-label": `${LABELS[tier]} sertifika şablonu büyük önizleme`,
		className: "fixed inset-0 z-[2000] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6",
		onClick: () => setOpen(false),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setOpen(false),
			"aria-label": "Büyük önizlemeyi kapat",
			className: "fixed right-4 top-20 z-[9999] flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/50 bg-black text-3xl font-bold leading-none text-white shadow-2xl transition hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-gold/70 sm:right-6 sm:top-24",
			children: "×"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative flex max-h-[95vh] w-full max-w-[1400px] items-center justify-center",
			onClick: (event) => event.stopPropagation(),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt: `${LABELS[tier]} MySkyParcel sertifika şablonu büyük önizleme`,
				width: 1122,
				height: 794,
				className: "max-h-[92vh] w-auto max-w-full rounded-md object-contain shadow-2xl"
			})
		})]
	})] });
}
//#endregion
export { CertificateTemplatePreview as t };
