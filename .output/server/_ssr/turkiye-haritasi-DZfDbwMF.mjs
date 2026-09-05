import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { D as MapPin, v as Search } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-DSWG6DeN.mjs";
import { t as CityParcelLivePage } from "./CityParcelLivePage-BM9AVFeo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/turkiye-haritasi-DZfDbwMF.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var CITIES = [
	"Adana",
	"Adıyaman",
	"Afyonkarahisar",
	"Ağrı",
	"Amasya",
	"Ankara",
	"Antalya",
	"Artvin",
	"Aydın",
	"Balıkesir",
	"Bilecik",
	"Bingöl",
	"Bitlis",
	"Bolu",
	"Burdur",
	"Bursa",
	"Çanakkale",
	"Çankırı",
	"Çorum",
	"Denizli",
	"Diyarbakır",
	"Edirne",
	"Elazığ",
	"Erzincan",
	"Erzurum",
	"Eskişehir",
	"Gaziantep",
	"Giresun",
	"Gümüşhane",
	"Hakkari",
	"Hatay",
	"Isparta",
	"Mersin",
	"İstanbul",
	"İzmir",
	"Kars",
	"Kastamonu",
	"Kayseri",
	"Kırklareli",
	"Kırşehir",
	"Kocaeli",
	"Konya",
	"Kütahya",
	"Malatya",
	"Manisa",
	"Kahramanmaraş",
	"Mardin",
	"Muğla",
	"Muş",
	"Nevşehir",
	"Niğde",
	"Ordu",
	"Rize",
	"Sakarya",
	"Samsun",
	"Siirt",
	"Sinop",
	"Sivas",
	"Tekirdağ",
	"Tokat",
	"Trabzon",
	"Tunceli",
	"Şanlıurfa",
	"Uşak",
	"Van",
	"Yozgat",
	"Zonguldak",
	"Aksaray",
	"Bayburt",
	"Karaman",
	"Kırıkkale",
	"Batman",
	"Şırnak",
	"Bartın",
	"Ardahan",
	"Iğdır",
	"Yalova",
	"Karabük",
	"Kilis",
	"Osmaniye",
	"Düzce"
];
var slug = (s) => s.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function LegacySkyMapView() {
	const [search, setSearch] = (0, import_react.useState)("");
	const filtered = (0, import_react.useMemo)(() => CITIES.filter((c) => c.toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR"))), [search]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "mx-auto max-w-[1800px] px-2 py-2 sm:px-5 sm:py-3 lg:px-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid overflow-hidden rounded-3xl border border-sky-200/15 bg-slate-900/70 shadow-2xl lg:grid-cols-[280px_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "order-2 border-t border-white/10 bg-slate-950/90 p-3 sm:p-4 lg:order-1 lg:border-r lg:border-t-0 lg:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-sky-100/60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: search,
							onChange: (e) => setSearch(e.target.value),
							placeholder: "Şehir ara...",
							className: "min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-white/40"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex items-center justify-between border-b border-white/10 pb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-100",
							children: "Türkiye'nin 81 ili"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4 text-sky-200/55" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid max-h-[560px] gap-1.5 overflow-auto pr-1",
						children: filtered.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => window.location.href = `/turkiye-haritasi?city=${slug(c)}`,
							className: "flex items-center gap-2 rounded-xl border border-transparent px-3 py-2.5 text-left text-sm text-white/65 transition hover:border-sky-200/20 hover:bg-sky-200/10 hover:text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4" }), c]
						}, c))
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "order-1 min-w-0 lg:order-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative flex min-h-[430px] items-center justify-center overflow-hidden bg-[#020914] px-1 py-2 sm:min-h-[700px] sm:p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/images/cities/turkey-3d-map.png",
						alt: "Türkiye 3D haritası",
						width: "1600",
						height: "1000",
						loading: "eager",
						fetchPriority: "high",
						decoding: "async",
						className: "h-auto w-full max-h-[58vh] object-contain drop-shadow-[0_0_28px_rgba(44,190,255,.2)] sm:max-h-[82vh] sm:drop-shadow-[0_0_40px_rgba(44,190,255,.2)]"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(0,5,15,.25)_75%,rgba(0,2,8,.65)_100%)]" })]
				})
			})]
		})
	});
}
function SkyMapPage() {
	const city = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search).get("city");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-slate-950 text-white",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), city ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CityParcelLivePage, { slug: city }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegacySkyMapView, {})]
	});
}
//#endregion
export { SkyMapPage as component };
