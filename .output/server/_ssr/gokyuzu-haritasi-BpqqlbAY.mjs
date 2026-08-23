import { i as __toESM } from "../_runtime.mjs";
import { n as supabaseBrowser } from "./supabaseBrowser-oiXQwlQA.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as useAuth, r as Route$24 } from "./router-KMIfqJ_B.mjs";
import { A as Layers, O as ListChecks, P as ImagePlus, S as MapPin, b as Pencil, f as ShoppingCart, h as Search, m as ShieldCheck, n as X } from "../_libs/lucide-react.mjs";
import { n as SiteHeader, t as SiteFooter } from "./SiteFooter-Senk75td.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gokyuzu-haritasi-BpqqlbAY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TURKEY_CENTER = {
	lat: 39,
	lng: 35
};
var INITIAL_ISTANBUL_ZOOM = 9.5;
var PARCEL_OVERVIEW_ZOOM = 11;
var color = (p) => p.status === "sold" ? "#ff1744" : p.tier === "premium" ? "#f6c453" : p.tier === "elite" ? "#b77cff" : "#55c9ff";
function grid(center, total, inner, outer) {
	if (!total) return [];
	const cos = Math.max(Math.cos(center.lat * Math.PI / 180), .2);
	let n = Math.max(2, Math.ceil(Math.sqrt(total)));
	const make = () => {
		const size = outer * 2 / n;
		const ratio = inner / outer;
		const a = [];
		for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
			const x0 = -outer + c * size, y0 = -outer + r * size, x1 = x0 + size, y1 = y0 + size;
			const cx = (x0 + x1) / 2 / outer, cy = (y0 + y1) / 2 / outer;
			if (Math.max(Math.abs(cx), Math.abs(cy)) >= ratio) a.push({
				x0,
				y0,
				x1,
				y1
			});
		}
		return a;
	};
	let a = make();
	while (a.length < total) {
		n++;
		a = make();
	}
	const point = (x, y) => ({
		lat: center.lat + y,
		lng: center.lng + x / cos
	});
	return a.slice(0, total).map((x) => ({ path: [
		point(x.x0, x.y0),
		point(x.x1, x.y0),
		point(x.x1, x.y1),
		point(x.x0, x.y1)
	] }));
}
function focusParcelShape(center) {
	const dLat = .0042;
	const dLng = .0055 / Math.max(Math.cos(center.lat * Math.PI / 180), .25);
	return [
		{
			lat: center.lat - dLat,
			lng: center.lng - dLng
		},
		{
			lat: center.lat - dLat,
			lng: center.lng + dLng
		},
		{
			lat: center.lat + dLat,
			lng: center.lng + dLng
		},
		{
			lat: center.lat + dLat,
			lng: center.lng - dLng
		}
	];
}
var easeInOut = (t) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
var lerp = (a, b, t) => a + (b - a) * t;
function animateCamera(map, from, to, duration, maps, onDone) {
	let frame = 0;
	const started = performance.now();
	const step = (now) => {
		const raw = Math.min(1, (now - started) / duration);
		const t = easeInOut(raw);
		map.moveCamera({
			center: new maps.LatLng(lerp(from.lat, to.lat, t), lerp(from.lng, to.lng, t)),
			zoom: lerp(from.zoom, to.zoom, t),
			tilt: 0,
			heading: 0
		});
		if (raw < 1) frame = requestAnimationFrame(step);
		else onDone?.();
	};
	frame = requestAnimationFrame(step);
	return () => cancelAnimationFrame(frame);
}
function FocusedGoogleParcelMap({ parcels, selectedId, selectedIds = /* @__PURE__ */ new Set(), multiSelect = false, onSelect, onToggleSelect, onViewportChange, center, focusTarget }) {
	const ref = (0, import_react.useRef)(null);
	const map = (0, import_react.useRef)(null);
	const focused = (0, import_react.useRef)(null);
	const focusOverlay = (0, import_react.useRef)(null);
	const animationCancel = (0, import_react.useRef)(null);
	const lastCityCenter = (0, import_react.useRef)(null);
	const hasInitialAnimation = (0, import_react.useRef)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setError("Google Maps API anahtarı eksik.");
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready || !map.current || hasInitialAnimation.current || focusTarget) return;
		hasInitialAnimation.current = true;
		lastCityCenter.current = center;
		const maps = window.google.maps;
		animationCancel.current?.();
		const turkey = {
			...TURKEY_CENTER,
			zoom: 5
		};
		const istanbul = {
			...center,
			zoom: INITIAL_ISTANBUL_ZOOM
		};
		map.current.moveCamera({
			center: new maps.LatLng(turkey.lat, turkey.lng),
			zoom: turkey.zoom,
			tilt: 0,
			heading: 0
		});
		animationCancel.current = animateCamera(map.current, turkey, istanbul, 8e3, maps);
		return () => {
			animationCancel.current?.();
			animationCancel.current = null;
		};
	}, [
		ready,
		center.lat,
		center.lng,
		focusTarget
	]);
	(0, import_react.useEffect)(() => {
		if (!ready || !map.current) return;
		if (!lastCityCenter.current) {
			lastCityCenter.current = center;
			return;
		}
		const previous = lastCityCenter.current;
		if (previous.lat === center.lat && previous.lng === center.lng) return;
		lastCityCenter.current = center;
		if (focusTarget) return;
		const maps = window.google.maps;
		animationCancel.current?.();
		const current = map.current.getCenter();
		const from = {
			lat: current?.lat?.() ?? TURKEY_CENTER.lat,
			lng: current?.lng?.() ?? TURKEY_CENTER.lng,
			zoom: map.current.getZoom?.() ?? 5
		};
		const to = {
			lat: center.lat,
			lng: center.lng,
			zoom: INITIAL_ISTANBUL_ZOOM
		};
		animationCancel.current = animateCamera(map.current, from, to, 7e3, maps);
		return () => {
			animationCancel.current?.();
			animationCancel.current = null;
		};
	}, [
		ready,
		center.lat,
		center.lng,
		focusTarget
	]);
	(0, import_react.useEffect)(() => {
		if (!ready || !map.current || !focusTarget || focused.current === focusTarget.token) return;
		focused.current = focusTarget.token;
		const maps = window.google.maps;
		animationCancel.current?.();
		if (focusOverlay.current) {
			focusOverlay.current.setMap(null);
			focusOverlay.current = null;
		}
		const turkey = {
			...TURKEY_CENTER,
			zoom: 5
		};
		map.current.moveCamera({
			center: turkey,
			zoom: turkey.zoom,
			tilt: 0,
			heading: 0
		});
		const cityCamera = {
			...focusTarget.city,
			zoom: INITIAL_ISTANBUL_ZOOM
		};
		animationCancel.current = animateCamera(map.current, turkey, cityCamera, 8e3, maps, () => {
			const parcelCamera = {
				...focusTarget.parcel,
				zoom: PARCEL_OVERVIEW_ZOOM
			};
			animationCancel.current = animateCamera(map.current, cityCamera, parcelCamera, 5500, maps, () => {
				focusOverlay.current = new maps.Polygon({
					map: map.current,
					paths: focusParcelShape(focusTarget.parcel),
					strokeColor: "#ff1744",
					strokeOpacity: 1,
					strokeWeight: 3,
					fillColor: "#ff1744",
					fillOpacity: .38,
					clickable: true,
					zIndex: 1e3
				});
				const focusParcelId = focusTarget.token.split(":")[0];
				if (focusParcelId) focusOverlay.current.addListener("click", () => onSelect(focusParcelId));
			});
		});
		return () => {
			animationCancel.current?.();
			animationCancel.current = null;
		};
	}, [
		ready,
		focusTarget,
		onSelect
	]);
	(0, import_react.useEffect)(() => {
		if (!ready || !map.current || !onViewportChange) return;
		const maps = window.google.maps;
		const emit = () => {
			const b = map.current.getBounds();
			if (!b) return;
			const ne = b.getNorthEast(), sw = b.getSouthWest();
			onViewportChange({
				minLat: sw.lat(),
				minLng: sw.lng(),
				maxLat: ne.lat(),
				maxLng: ne.lng()
			});
		};
		const l = maps.event.addListener(map.current, "idle", () => setTimeout(emit, 100));
		emit();
		return () => maps.event.removeListener(l);
	}, [ready, onViewportChange]);
	(0, import_react.useEffect)(() => {
		if (!ready || !map.current) return;
		const maps = window.google.maps;
		const all = [];
		[
			[
				"digital",
				.095,
				.165
			],
			[
				"elite",
				.05,
				.08
			],
			[
				"premium",
				.012,
				.035
			]
		].forEach(([tier, inner, outer]) => {
			const ps = parcels.filter((p) => p.tier === tier), cells = grid(center, ps.length, inner, outer);
			ps.forEach((p, i) => {
				const cell = cells[i];
				if (!cell) return;
				const paths = cell.path.map((x) => new maps.LatLng(x.lat, x.lng));
				const c = color(p), sel = multiSelect ? selectedIds.has(p.id) : selectedId === p.id;
				const poly = new maps.Polygon({
					map: map.current,
					paths,
					strokeColor: sel ? "#fff4b0" : c,
					strokeOpacity: 1,
					strokeWeight: sel ? 2.5 : p.status === "sold" ? 2.5 : 1.1,
					fillColor: c,
					fillOpacity: sel ? .17 : p.status === "sold" ? .08 : .008,
					clickable: true,
					zIndex: sel ? 501 : p.status === "sold" ? 500 : 21
				});
				poly.addListener("click", () => multiSelect && p.status === "available" ? onToggleSelect?.(p.id) : onSelect(p.id));
				all.push(poly);
			});
		});
		return () => all.forEach((p) => p.setMap(null));
	}, [
		ready,
		parcels,
		center.lat,
		center.lng,
		selectedId,
		selectedIds,
		multiSelect,
		onSelect,
		onToggleSelect
	]);
	(0, import_react.useEffect)(() => () => {
		animationCancel.current?.();
		if (focusOverlay.current) focusOverlay.current.setMap(null);
		map.current = null;
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-[500px] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] sm:h-[600px] lg:h-[670px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref,
			className: "absolute inset-0",
			"aria-label": "MySkyParcel parsel haritası"
		}), error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 grid place-items-center bg-[#071a2d] p-6 text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-white/70",
				children: error
			})
		})]
	});
}
var TIER_LABELS = {
	digital: "Dijital",
	elite: "Elit",
	premium: "Premium"
};
function ParcelDetailPanel({ parcel, onClose }) {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [isOwner, setIsOwner] = (0, import_react.useState)(false);
	const [memoryLoading, setMemoryLoading] = (0, import_react.useState)(true);
	const [memorySaving, setMemorySaving] = (0, import_react.useState)(false);
	const [memory, setMemory] = (0, import_react.useState)(null);
	const [memoryPhotoUrl, setMemoryPhotoUrl] = (0, import_react.useState)(null);
	const [memoryNote, setMemoryNote] = (0, import_react.useState)("");
	const [memoryFile, setMemoryFile] = (0, import_react.useState)(null);
	const [memoryIsPublic, setMemoryIsPublic] = (0, import_react.useState)(true);
	const [memoryMessage, setMemoryMessage] = (0, import_react.useState)(null);
	const [editingMemory, setEditingMemory] = (0, import_react.useState)(false);
	const ownsFromParcel = !!user && parcel.owner_id === user.id;
	const canManageMemory = ownsFromParcel || isOwner;
	const statusLabel = parcel.status === "sold" ? "Satıldı" : parcel.status === "reserved" ? "Rezerve" : "Satılık";
	const tierLabel = TIER_LABELS[parcel.tier];
	const priceLabel = typeof parcel.tier_price === "number" ? `${parcel.tier_price.toLocaleString("tr-TR")} TL` : "—";
	const canBuy = parcel.status !== "sold" && parcel.status !== "reserved" && !ownsFromParcel;
	function handleBuy() {
		const redirect = `/parsel-satin-al?parcels=${encodeURIComponent(parcel.id)}`;
		if (!user) {
			navigate({
				to: "/giris",
				search: { redirect }
			});
			return;
		}
		navigate({
			to: "/parsel-satin-al",
			search: { parcels: parcel.id }
		});
	}
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		setMemoryLoading(true);
		setMemory(null);
		setMemoryPhotoUrl(null);
		setMemoryNote("");
		setMemoryFile(null);
		setMemoryIsPublic(true);
		setMemoryMessage(null);
		setEditingMemory(false);
		async function loadMemory() {
			try {
				const [{ data: sessionData }, { data: ownerData, error: ownerError }, { data: parcelOwnerRow, error: parcelOwnerError }, { data: memoryRow, error: memoryError }] = await Promise.all([
					supabaseBrowser.auth.getSession(),
					supabaseBrowser.rpc("is_parcel_owner", { p_parcel_id: parcel.id }),
					supabaseBrowser.from("parcels").select("owner_id").eq("id", parcel.id).maybeSingle(),
					supabaseBrowser.from("parcel_memories").select("photo_path,note,is_public,updated_at").eq("parcel_id", parcel.id).maybeSingle()
				]);
				if (cancelled) return;
				if (ownerError) console.error("Parcel owner RPC error", ownerError);
				if (parcelOwnerError) console.error("Parcel owner row error", parcelOwnerError);
				if (memoryError) console.error("Parcel memory lookup error", memoryError);
				const currentUserId = sessionData.session?.user?.id ?? user?.id ?? null;
				const rpcOwner = ownerData === true || ownerData === "true";
				const databaseOwner = !!currentUserId && parcelOwnerRow?.owner_id === currentUserId;
				setIsOwner(rpcOwner || databaseOwner);
				const nextMemory = memoryRow ? memoryRow : null;
				setMemory(nextMemory);
				setMemoryNote(nextMemory?.note ?? "");
				setMemoryIsPublic(nextMemory?.is_public ?? true);
				if (nextMemory?.photo_path && nextMemory.photo_path !== "note-only") setMemoryPhotoUrl(supabaseBrowser.storage.from("parcel-memories").getPublicUrl(nextMemory.photo_path).data.publicUrl);
			} catch (error) {
				console.error("Parcel memory load error", error);
			} finally {
				if (!cancelled) setMemoryLoading(false);
			}
		}
		loadMemory();
		return () => {
			cancelled = true;
		};
	}, [
		parcel.id,
		parcel.owner_id,
		user?.id
	]);
	function startMemoryEditor() {
		setMemoryMessage(null);
		setMemoryFile(null);
		setEditingMemory(true);
	}
	function cancelMemoryEditor() {
		setMemoryMessage(null);
		setMemoryFile(null);
		setMemoryNote(memory?.note ?? "");
		setMemoryIsPublic(memory?.is_public ?? true);
		setEditingMemory(false);
	}
	async function handleMemorySave() {
		if (!user) {
			setMemoryMessage("Hatıra eklemek için giriş yapın.");
			return;
		}
		if (!canManageMemory) {
			setMemoryMessage("Hatıra eklenemedi.");
			return;
		}
		if (!memoryFile && !memory?.photo_path) {
			setMemoryMessage("Lütfen bir fotoğraf seçin.");
			return;
		}
		if (memoryNote.trim().length > 300) {
			setMemoryMessage("Not en fazla 300 karakter olabilir.");
			return;
		}
		setMemorySaving(true);
		setMemoryMessage(null);
		let uploadedPath = null;
		try {
			let nextPhotoPath = memory?.photo_path ?? null;
			if (memoryFile) {
				if (!memoryFile.type.startsWith("image/")) throw new Error("Lütfen bir fotoğraf seçin.");
				if (memoryFile.size > 5242880) throw new Error("Fotoğraf en fazla 5 MB olabilir.");
				const ext = (memoryFile.name.split(".").pop() || "jpg").toLowerCase();
				if (![
					"jpg",
					"jpeg",
					"png",
					"webp"
				].includes(ext)) throw new Error("JPG, PNG veya WebP kullanın.");
				uploadedPath = `${user.id}/${parcel.id}/memory-${Date.now()}.${ext}`;
				const { error } = await supabaseBrowser.storage.from("parcel-memories").upload(uploadedPath, memoryFile, {
					upsert: false,
					contentType: memoryFile.type,
					cacheControl: "3600"
				});
				if (error) throw new Error(`Fotoğraf yüklenemedi: ${error.message}`);
				nextPhotoPath = uploadedPath;
			}
			const { error: saveError } = await supabaseBrowser.rpc("save_parcel_memory", {
				p_parcel_id: parcel.id,
				p_photo_path: nextPhotoPath,
				p_note: memoryNote.trim(),
				p_is_public: memoryIsPublic
			});
			if (saveError) {
				if (uploadedPath) await supabaseBrowser.storage.from("parcel-memories").remove([uploadedPath]);
				throw new Error(`Hatıra kaydedilemedi: ${saveError.message}`);
			}
			const { data: persistedMemory, error: reloadError } = await supabaseBrowser.from("parcel_memories").select("photo_path,note,is_public,updated_at").eq("parcel_id", parcel.id).maybeSingle();
			if (reloadError || !persistedMemory) {
				if (uploadedPath) await supabaseBrowser.storage.from("parcel-memories").remove([uploadedPath]);
				throw new Error(reloadError?.message || "Hatıra kaydı doğrulanamadı.");
			}
			const nextMemory = persistedMemory;
			if (uploadedPath && memory?.photo_path && memory.photo_path !== uploadedPath) await supabaseBrowser.storage.from("parcel-memories").remove([memory.photo_path]);
			setMemory(nextMemory);
			setMemoryNote(nextMemory.note ?? "");
			setMemoryIsPublic(nextMemory.is_public);
			setMemoryFile(null);
			setMemoryPhotoUrl(nextMemory.photo_path && nextMemory.photo_path !== "note-only" ? supabaseBrowser.storage.from("parcel-memories").getPublicUrl(nextMemory.photo_path).data.publicUrl : null);
			setEditingMemory(false);
			setMemoryMessage(nextMemory.is_public ? "Hatıran kaydedildi. Herkes görebilir." : "Hatıran kaydedildi. Sadece sen görebilirsin.");
		} catch (error) {
			setMemoryMessage(error instanceof Error ? error.message : "Hatıran kaydedilemedi.");
		} finally {
			setMemorySaving(false);
		}
	}
	function handleMemoryFileChange(event) {
		setMemoryFile(event.target.files?.[0] ?? null);
		setMemoryMessage(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
		className: "fixed inset-0 z-[100] grid place-items-center bg-black/45 p-4 backdrop-blur-[2px]",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Parsel bilgileri",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-h-[92vh] w-full max-w-md overflow-auto rounded-2xl border border-cyan-300/20 bg-[#071a2d] p-5 shadow-2xl shadow-black/60 sm:p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-cyan-100/60",
					children: parcel.city_name ?? "MySkyParcel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-1 font-display text-lg font-bold",
					children: "PARSEL BİLGİLERİ"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					"aria-label": "Kapat",
					className: "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-xl border border-cyan-300/15 bg-cyan-950/10 p-4",
				"aria-label": "Parsel bilgileri ve hatırası",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-x-4 gap-y-2 border-b border-white/10 pb-4 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-[9px] uppercase tracking-[0.12em] text-white/40",
								children: "Parsel No"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: parcel.parcel_number })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-[9px] uppercase tracking-[0.12em] text-white/40",
								children: "Durum"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: statusLabel })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-[9px] uppercase tracking-[0.12em] text-white/40",
								children: "Kategori"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: tierLabel })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-[9px] uppercase tracking-[0.12em] text-white/40",
								children: "Fiyat"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: priceLabel })] })
						]
					}),
					canBuy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: handleBuy,
						className: "btn-gold mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-lg text-xs font-bold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4" }), " SATIN AL"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 border-t border-white/10 pt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-200/65",
								children: "Parsel Hatırası"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm font-semibold",
								children: "1 fotoğraf + küçük bir not"
							})] }), memory && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full border border-cyan-300/20 px-2 py-1 text-[9px] font-semibold text-cyan-100/65",
								children: memory.is_public ? "HERKESE AÇIK" : "SADECE BEN"
							})]
						}), memoryLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-xs text-muted-foreground",
							children: "Hatıra kontrol ediliyor..."
						}) : canManageMemory && editingMemory ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-3",
							children: [
								memoryPhotoUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: memoryPhotoUrl,
									alt: `${parcel.parcel_number} parsel hatırası`,
									className: "max-h-48 w-full rounded-lg object-cover",
									loading: "lazy"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block cursor-pointer rounded-lg border border-dashed border-cyan-300/25 bg-white/[0.03] p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-2 text-xs font-semibold",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "h-4 w-4" }),
												" ",
												memory?.photo_path ? "Fotoğrafı değiştir" : "Fotoğraf ekle"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block text-[10px] text-muted-foreground",
											children: "JPG, PNG veya WebP · Maks. 5 MB"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "mt-2 block w-full text-[10px]",
											type: "file",
											accept: "image/jpeg,image/png,image/webp",
											onChange: handleMemoryFileChange
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold",
										children: "📝 Küçük not"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										value: memoryNote,
										onChange: (e) => setMemoryNote(e.target.value.slice(0, 300)),
										maxLength: 300,
										rows: 3,
										placeholder: "Bu parsel için kısa bir anı...",
										className: "mt-2 w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex cursor-pointer items-start gap-3 rounded-lg border border-cyan-300/10 bg-white/[0.03] p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: memoryIsPublic,
										onChange: (e) => setMemoryIsPublic(e.target.checked)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs",
										children: "🌍 Gökyüzü Haritasında herkes görebilsin"
									})]
								}),
								memoryMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "rounded-lg bg-white/5 px-3 py-2 text-[10px]",
									children: memoryMessage
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: memorySaving,
										onClick: cancelMemoryEditor,
										className: "h-10 rounded-lg border border-white/10 text-xs font-semibold",
										children: "VAZGEÇ"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										disabled: memorySaving,
										onClick: handleMemorySave,
										className: "h-10 rounded-lg border border-cyan-300/25 text-xs font-bold",
										children: memorySaving ? "KAYDEDİLİYOR..." : "HATIRAYI KAYDET"
									})]
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-3",
							children: [
								memoryPhotoUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: memoryPhotoUrl,
									alt: `${parcel.parcel_number} parsel hatırası`,
									className: "max-h-52 w-full rounded-lg object-cover",
									loading: "lazy"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-5 text-center text-xs text-white/40",
									children: "Henüz parsel hatırası eklenmemiş."
								}),
								memory?.note && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-white/10 bg-white/[0.03] p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[9px]",
										children: "Not"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 whitespace-pre-wrap text-xs leading-5",
										children: memory.note
									})]
								}),
								memoryMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "rounded-lg bg-white/5 px-3 py-2 text-[10px]",
									children: memoryMessage
								}),
								canManageMemory ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: startMemoryEditor,
									className: "flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-xs font-bold text-cyan-100",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" }), memory ? "HATIRAYI DÜZENLE" : "PARSEL HATIRASI EKLE"]
								}) : null
							]
						})]
					})
				]
			})]
		})
	});
}
var CITIES = [
	{
		code: "IST",
		slug: "istanbul",
		name: "İstanbul",
		center: {
			lat: 41.0082,
			lng: 28.9784
		}
	},
	{
		code: "ANK",
		slug: "ankara",
		name: "Ankara",
		center: {
			lat: 39.9334,
			lng: 32.8597
		}
	},
	{
		code: "IZM",
		slug: "izmir",
		name: "İzmir",
		center: {
			lat: 38.4237,
			lng: 27.1428
		}
	},
	{
		code: "BUR",
		slug: "bursa",
		name: "Bursa",
		center: {
			lat: 40.195,
			lng: 29.06
		}
	},
	{
		code: "ANT",
		slug: "antalya",
		name: "Antalya",
		center: {
			lat: 36.8969,
			lng: 30.7133
		}
	},
	{
		code: "KAY",
		slug: "kayseri",
		name: "Kayseri",
		center: {
			lat: 38.7205,
			lng: 35.4826
		}
	},
	{
		code: "GZT",
		slug: "gaziantep",
		name: "Gaziantep",
		center: {
			lat: 37.0662,
			lng: 37.3833
		}
	}
];
var DEFAULT_CITY = CITIES[0];
var TIER_PRICE = {
	digital: 199,
	elite: 499,
	premium: 999
};
function SkyMapPage() {
	const search = Route$24.useSearch();
	const navigate = useNavigate({ from: "/gokyuzu-haritasi" });
	const initialCity = CITIES.find((city) => city.slug === search.city) ?? DEFAULT_CITY;
	const [selectedCity, setSelectedCity] = (0, import_react.useState)(initialCity.code);
	const [parcels, setParcels] = (0, import_react.useState)([]);
	const [selectedId, setSelectedId] = (0, import_react.useState)(null);
	const [selectedIds, setSelectedIds] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [multiSelect, setMultiSelect] = (0, import_react.useState)(false);
	const [layerFilter, setLayerFilter] = (0, import_react.useState)(null);
	const [sectorFilter, setSectorFilter] = (0, import_react.useState)(null);
	const [citySearch, setCitySearch] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const requestId = (0, import_react.useRef)(0);
	const city = CITIES.find((item) => item.code === selectedCity) ?? DEFAULT_CITY;
	const selectedParcel = (0, import_react.useMemo)(() => parcels.find((parcel) => parcel.id === selectedId) ?? null, [parcels, selectedId]);
	const availableLayers = (0, import_react.useMemo)(() => Array.from(new Set(parcels.map((parcel) => parcel.layer_number).filter((value) => typeof value === "number"))).sort((a, b) => a - b), [parcels]);
	const availableSectors = (0, import_react.useMemo)(() => {
		const source = layerFilter === null ? parcels : parcels.filter((parcel) => parcel.layer_number === layerFilter);
		return Array.from(new Set(source.map((parcel) => parcel.sector_number).filter((value) => typeof value === "number"))).sort((a, b) => a - b);
	}, [parcels, layerFilter]);
	const filteredParcels = (0, import_react.useMemo)(() => parcels.filter((parcel) => (layerFilter === null || parcel.layer_number === layerFilter) && (sectorFilter === null || parcel.sector_number === sectorFilter)), [
		parcels,
		layerFilter,
		sectorFilter
	]);
	const filteredCities = (0, import_react.useMemo)(() => {
		const query = citySearch.trim().toLocaleLowerCase("tr-TR");
		return query ? CITIES.filter((item) => item.name.toLocaleLowerCase("tr-TR").includes(query)) : CITIES;
	}, [citySearch]);
	const selectedIdsForPurchase = (0, import_react.useMemo)(() => Array.from(selectedIds).join(","), [selectedIds]);
	(0, import_react.useMemo)(() => parcels.filter((parcel) => selectedIds.has(parcel.id)).reduce((sum, parcel) => sum + Number(parcel.tier_price ?? TIER_PRICE[parcel.tier]), 0), [parcels, selectedIds]);
	(0, import_react.useEffect)(() => {
		const next = CITIES.find((item) => item.slug === search.city) ?? DEFAULT_CITY;
		setSelectedCity(next.code);
	}, [search.city]);
	(0, import_react.useEffect)(() => {
		setParcels([]);
		setSelectedId(null);
		setSelectedIds(/* @__PURE__ */ new Set());
		setMultiSelect(false);
		setLayerFilter(null);
		setSectorFilter(null);
	}, [city.code]);
	const loadViewportParcels = (0, import_react.useCallback)(async (bounds) => {
		if (!supabaseBrowser) {
			setError("Supabase yapılandırması eksik.");
			return;
		}
		const currentRequest = ++requestId.current;
		setLoading(true);
		setError(null);
		try {
			const { data, error: rpcError } = await supabaseBrowser.rpc("parcels_in_view", {
				p_city_slug: city.slug,
				p_min_lat: bounds.minLat,
				p_min_lng: bounds.minLng,
				p_max_lat: bounds.maxLat,
				p_max_lng: bounds.maxLng
			});
			if (rpcError) throw rpcError;
			if (currentRequest !== requestId.current) return;
			const normalized = (data ?? []).map((parcel) => ({
				...parcel,
				owner_id: null,
				city_name: parcel.city_name ?? city.name,
				city_code: parcel.city_code ?? city.code,
				city_slug: parcel.city_slug ?? city.slug,
				tier_price: parcel.tier_price ?? TIER_PRICE[parcel.tier]
			}));
			setParcels(normalized);
			setSelectedIds((current) => new Set(Array.from(current).filter((id) => normalized.some((parcel) => parcel.id === id))));
			setSelectedId((current) => current && normalized.some((parcel) => parcel.id === current) ? current : null);
		} catch (cause) {
			console.error("Gökyüzü Haritası parsel sorgusu başarısız", cause);
			if (currentRequest === requestId.current) setError("Harita alanındaki parseller yüklenemedi. Lütfen tekrar deneyin.");
		} finally {
			if (currentRequest === requestId.current) setLoading(false);
		}
	}, [
		city.code,
		city.name,
		city.slug
	]);
	const selectCity = (code) => {
		const next = CITIES.find((item) => item.code === code) ?? DEFAULT_CITY;
		setSelectedCity(next.code);
		navigate({
			search: { city: next.slug },
			replace: true
		});
	};
	const toggleSelected = (id) => setSelectedIds((current) => {
		const next = new Set(current);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		return next;
	});
	const goToPurchase = () => {
		if (!selectedIdsForPurchase) return;
		navigate({
			to: "/parsel-satin-al",
			search: { parcels: selectedIdsForPurchase }
		});
	};
	const focusTarget = search.parcels && search.lat && search.lng && Number.isFinite(Number(search.lat)) && Number.isFinite(Number(search.lng)) ? {
		city: city.center,
		parcel: {
			lat: Number(search.lat),
			lng: Number(search.lng)
		},
		token: `${search.parcels}:${search.lat}:${search.lng}`
	} : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-slate-950 text-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-[1800px] px-3 py-2 sm:px-5 lg:px-8 lg:py-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "grid overflow-hidden rounded-3xl border border-sky-200/15 bg-slate-900/70 shadow-2xl shadow-black/30 lg:grid-cols-[280px_1fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
						className: "order-2 border-t border-white/10 bg-slate-950/90 p-4 lg:order-1 lg:border-r lg:border-t-0 lg:p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 rounded-2xl border border-cyan-300/20 bg-slate-900/80 p-4 text-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mx-auto h-7 w-7 text-cyan-200" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-[11px] font-bold uppercase tracking-[0.14em]",
									children: "GÜVENLİK"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-sky-100/60" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: citySearch,
									onChange: (event) => setCitySearch(event.target.value),
									placeholder: "Şehir ara...",
									className: "min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/40"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-5 grid gap-1.5",
								children: filteredCities.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => selectCity(item.code),
									className: `flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm ${selectedCity === item.code ? "border-sky-200/40 bg-sky-200/10" : "border-transparent text-white/65 hover:bg-white/5"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4" }), item.name]
								}, item.code))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 border-t border-white/10 pt-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-3 flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] font-semibold uppercase tracking-[0.16em]",
											children: "Parsel filtreleri"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: layerFilter ?? "",
										onChange: (event) => setLayerFilter(event.target.value ? Number(event.target.value) : null),
										className: "w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Tüm katmanlar"
										}), availableLayers.map((layer) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: layer,
											children: ["Katman ", layer]
										}, layer))]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: sectorFilter ?? "",
										onChange: (event) => setSectorFilter(event.target.value ? Number(event.target.value) : null),
										className: "mt-3 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Tüm sektörler"
										}), availableSectors.map((sector) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: sector,
											children: ["Sektör ", String(sector).padStart(2, "0")]
										}, sector))]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 rounded-2xl border border-white/10 bg-slate-900/65 p-4 text-xs text-white/60",
								children: [loading ? "Parseller yükleniyor..." : `${filteredParcels.length} parsel gösteriliyor.`, error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-red-300",
									children: error
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "order-1 min-w-0 p-2 sm:p-3 lg:order-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FocusedGoogleParcelMap, {
								parcels: filteredParcels,
								selectedId,
								selectedIds,
								multiSelect,
								onSelect: setSelectedId,
								onToggleSelect: toggleSelected,
								onViewportChange: loadViewportParcels,
								center: city.center,
								focusTarget
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-900/80 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setMultiSelect((value) => !value),
									className: "inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListChecks, { className: "h-4 w-4" }), multiSelect ? "Çoklu seçimi kapat" : "Çoklu seçim"]
								}), multiSelect && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: goToPurchase,
									disabled: !selectedIdsForPurchase,
									className: "inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-40",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4" }),
										selectedIds.size,
										" parseli satın al"
									]
								})]
							}),
							selectedParcel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParcelDetailPanel, {
								parcel: selectedParcel,
								onClose: () => setSelectedId(null),
								onReserved: (reserved) => setParcels((current) => current.map((item) => item.id === reserved.id ? {
									...item,
									...reserved,
									status: "reserved"
								} : item))
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { SkyMapPage as component };
