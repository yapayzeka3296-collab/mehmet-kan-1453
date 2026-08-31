import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link, b as useNavigate, y as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as useAuth, s as supabaseBrowser } from "./router-Db-WtvAA.mjs";
import { E as Music2, G as Gift, H as Headphones, N as List, O as MapPin, Q as EllipsisVertical, U as Grid2x2, W as Globe, c as Trash2, dt as ArrowRight, h as ShieldCheck, j as Lock, n as X, p as ShoppingCart, q as FileBadge, st as Calendar, u as Star, w as Pencil, z as ImagePlus } from "../_libs/lucide-react.mjs";
import { n as SiteHeader } from "./SiteHeader-yuDXKBmd.mjs";
import { t as SiteFooter } from "./SiteFooter-Dv3_EOXG.mjs";
import { n as TrustBar } from "./TrustBar-UVKBrZO3.mjs";
import { t as UserSidebar } from "./UserSidebar-D_-DP-PI.mjs";
import { t as hero_city_default } from "./hero-city-CaGzJUSk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parsellerim-BDvKnOL7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TIER_LABELS$1 = {
	digital: "Dijital",
	elite: "Elit",
	premium: "Premium"
};
var PHOTO_EXTENSIONS = [
	"jpg",
	"jpeg",
	"png",
	"webp"
];
var MUSIC_EXTENSIONS = [
	"mp3",
	"m4a",
	"aac",
	"wav",
	"ogg",
	"webm"
];
var MAX_PHOTO_BYTES = 5242880;
var MAX_MUSIC_BYTES = 8388608;
var citySlug = (name) => (name ?? "").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function ParcelDetailPanel({ parcel, onClose, onLocate }) {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [isOwner, setIsOwner] = (0, import_react.useState)(false);
	const [memoryLoading, setMemoryLoading] = (0, import_react.useState)(true);
	const [memorySaving, setMemorySaving] = (0, import_react.useState)(false);
	const [memoryDeleting, setMemoryDeleting] = (0, import_react.useState)(false);
	const [memory, setMemory] = (0, import_react.useState)(null);
	const [memoryPhotoUrl, setMemoryPhotoUrl] = (0, import_react.useState)(null);
	const [memoryMusicUrl, setMemoryMusicUrl] = (0, import_react.useState)(null);
	const [memoryNote, setMemoryNote] = (0, import_react.useState)("");
	const [memoryFile, setMemoryFile] = (0, import_react.useState)(null);
	const [memoryMusicFile, setMemoryMusicFile] = (0, import_react.useState)(null);
	const [memoryIsPublic, setMemoryIsPublic] = (0, import_react.useState)(false);
	const [memoryMessage, setMemoryMessage] = (0, import_react.useState)(null);
	const [editingMemory, setEditingMemory] = (0, import_react.useState)(false);
	const ownsFromParcel = !!user && parcel.owner_id === user.id;
	const canManageMemory = ownsFromParcel || isOwner;
	const statusLabel = parcel.status === "sold" ? "Satıldı" : parcel.status === "reserved" ? "Rezerve" : "Satılık";
	const tierLabel = TIER_LABELS$1[parcel.tier];
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
	function handleGoToParcel() {
		if (onLocate) {
			onLocate(parcel);
			return;
		}
		const slug = citySlug(parcel.city_name);
		if (!slug) return;
		onClose();
		navigate({
			to: "/turkiye-haritasi",
			search: {
				city: slug,
				parcels: parcel.id
			}
		});
	}
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		setMemoryLoading(true);
		setMemory(null);
		setMemoryPhotoUrl(null);
		setMemoryMusicUrl(null);
		setMemoryNote("");
		setMemoryFile(null);
		setMemoryMusicFile(null);
		setMemoryIsPublic(false);
		setMemoryMessage(null);
		setEditingMemory(false);
		async function loadMemory() {
			try {
				const [{ data: sessionData }, { data: ownerData, error: ownerError }, { data: parcelOwnerRow, error: parcelOwnerError }, { data: memoryRow, error: memoryError }] = await Promise.all([
					supabaseBrowser.auth.getSession(),
					supabaseBrowser.rpc("is_parcel_owner", { p_parcel_id: parcel.id }),
					supabaseBrowser.from("parcels").select("owner_id").eq("id", parcel.id).maybeSingle(),
					supabaseBrowser.from("parcel_memories").select("photo_path,music_path,note,is_public,updated_at").eq("parcel_id", parcel.id).maybeSingle()
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
				setMemoryIsPublic(nextMemory?.is_public ?? false);
				if (nextMemory?.photo_path && nextMemory.photo_path !== "note-only") {
					const { data } = await supabaseBrowser.storage.from("parcel-memories").createSignedUrl(nextMemory.photo_path, 3600);
					if (!cancelled) setMemoryPhotoUrl(data?.signedUrl ?? null);
				}
				if (nextMemory?.music_path) {
					const { data } = await supabaseBrowser.storage.from("parcel-memories").createSignedUrl(nextMemory.music_path, 3600);
					if (!cancelled) setMemoryMusicUrl(data?.signedUrl ?? null);
				}
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
	async function refreshMemoryMusicUrl() {
		if (!memory?.music_path) return;
		const { data, error } = await supabaseBrowser.storage.from("parcel-memories").createSignedUrl(memory.music_path, 3600);
		if (error) {
			setMemoryMessage(`Müzik açılamadı: ${error.message}`);
			return;
		}
		setMemoryMusicUrl(data?.signedUrl ?? null);
	}
	function startMemoryEditor() {
		setMemoryMessage(null);
		setMemoryFile(null);
		setMemoryMusicFile(null);
		setEditingMemory(true);
	}
	function cancelMemoryEditor() {
		setMemoryMessage(null);
		setMemoryFile(null);
		setMemoryMusicFile(null);
		setMemoryNote(memory?.note ?? "");
		setMemoryIsPublic(memory?.is_public ?? false);
		setEditingMemory(false);
	}
	function handleMemoryFileChange(event) {
		setMemoryFile(event.target.files?.[0] ?? null);
		setMemoryMessage(null);
	}
	function handleMemoryMusicChange(event) {
		setMemoryMusicFile(event.target.files?.[0] ?? null);
		setMemoryMessage(null);
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
		if (!memoryMusicFile && !memory?.music_path) {
			setMemoryMessage("Lütfen bir müzik dosyası seçin.");
			return;
		}
		if (memoryNote.trim().length > 300) {
			setMemoryMessage("Not en fazla 300 karakter olabilir.");
			return;
		}
		setMemorySaving(true);
		setMemoryMessage(null);
		let uploadedPhotoPath = null;
		let uploadedMusicPath = null;
		try {
			let nextPhotoPath = memory?.photo_path ?? null;
			let nextMusicPath = memory?.music_path ?? null;
			if (memoryFile) {
				if (!memoryFile.type.startsWith("image/")) throw new Error("Lütfen bir fotoğraf seçin.");
				if (memoryFile.size > MAX_PHOTO_BYTES) throw new Error("Fotoğraf en fazla 5 MB olabilir.");
				const ext = (memoryFile.name.split(".").pop() || "jpg").toLowerCase();
				if (!PHOTO_EXTENSIONS.includes(ext)) throw new Error("JPG, PNG veya WebP kullanın.");
				uploadedPhotoPath = `${user.id}/${parcel.id}/memory-photo-${Date.now()}.${ext}`;
				const { error } = await supabaseBrowser.storage.from("parcel-memories").upload(uploadedPhotoPath, memoryFile, {
					upsert: false,
					contentType: memoryFile.type,
					cacheControl: "3600"
				});
				if (error) throw new Error(`Fotoğraf yüklenemedi: ${error.message}`);
				nextPhotoPath = uploadedPhotoPath;
			}
			if (memoryMusicFile) {
				if (!memoryMusicFile.type.startsWith("audio/")) throw new Error("Lütfen bir müzik dosyası seçin.");
				if (memoryMusicFile.size > MAX_MUSIC_BYTES) throw new Error("Müzik en fazla 8 MB olabilir.");
				const ext = (memoryMusicFile.name.split(".").pop() || "mp3").toLowerCase();
				if (!MUSIC_EXTENSIONS.includes(ext)) throw new Error("MP3, M4A, AAC, WAV, OGG veya WebM kullanın.");
				uploadedMusicPath = `${user.id}/${parcel.id}/memory-music-${Date.now()}.${ext}`;
				const { error } = await supabaseBrowser.storage.from("parcel-memories").upload(uploadedMusicPath, memoryMusicFile, {
					upsert: false,
					contentType: memoryMusicFile.type,
					cacheControl: "3600"
				});
				if (error) throw new Error(`Müzik yüklenemedi: ${error.message}`);
				nextMusicPath = uploadedMusicPath;
			}
			const { error: saveError } = await supabaseBrowser.rpc("save_parcel_memory", {
				p_parcel_id: parcel.id,
				p_photo_path: nextPhotoPath,
				p_note: memoryNote.trim(),
				p_music_path: nextMusicPath,
				p_is_public: memoryIsPublic
			});
			if (saveError) throw new Error(`Hatıra kaydedilemedi: ${saveError.message}`);
			const { data: persistedMemory, error: reloadError } = await supabaseBrowser.from("parcel_memories").select("photo_path,music_path,note,is_public,updated_at").eq("parcel_id", parcel.id).maybeSingle();
			if (reloadError || !persistedMemory) throw new Error(reloadError?.message || "Hatıra kaydı doğrulanamadı.");
			const nextMemory = persistedMemory;
			if (uploadedPhotoPath && memory?.photo_path && memory.photo_path !== uploadedPhotoPath) await supabaseBrowser.storage.from("parcel-memories").remove([memory.photo_path]);
			if (uploadedMusicPath && memory?.music_path && memory.music_path !== uploadedMusicPath) await supabaseBrowser.storage.from("parcel-memories").remove([memory.music_path]);
			const [{ data: photoSigned }, { data: musicSigned }] = await Promise.all([nextMemory.photo_path ? supabaseBrowser.storage.from("parcel-memories").createSignedUrl(nextMemory.photo_path, 3600) : Promise.resolve({ data: null }), nextMemory.music_path ? supabaseBrowser.storage.from("parcel-memories").createSignedUrl(nextMemory.music_path, 3600) : Promise.resolve({ data: null })]);
			setMemory(nextMemory);
			setMemoryNote(nextMemory.note ?? "");
			setMemoryIsPublic(nextMemory.is_public);
			setMemoryFile(null);
			setMemoryMusicFile(null);
			setMemoryPhotoUrl(photoSigned?.signedUrl ?? null);
			setMemoryMusicUrl(musicSigned?.signedUrl ?? null);
			setEditingMemory(false);
			setMemoryMessage(nextMemory.is_public ? "Hatıran kaydedildi. Diğer kullanıcılar görebilir." : "Hatıran kaydedildi. Sadece sen görebilirsin.");
		} catch (error) {
			if (uploadedPhotoPath) await supabaseBrowser.storage.from("parcel-memories").remove([uploadedPhotoPath]);
			if (uploadedMusicPath) await supabaseBrowser.storage.from("parcel-memories").remove([uploadedMusicPath]);
			setMemoryMessage(error instanceof Error ? error.message : "Hatıran kaydedilemedi.");
		} finally {
			setMemorySaving(false);
		}
	}
	async function handleMemoryDelete() {
		if (!user || !canManageMemory || !memory) return;
		if (!window.confirm("Bu hatırayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;
		setMemoryDeleting(true);
		setMemoryMessage(null);
		try {
			const photoPath = memory.photo_path;
			const musicPath = memory.music_path;
			const { error } = await supabaseBrowser.rpc("delete_parcel_memory", { p_parcel_id: parcel.id });
			if (error) throw new Error(`Hatıra silinemedi: ${error.message}`);
			const paths = [photoPath, musicPath].filter((path) => !!path && path !== "note-only");
			if (paths.length) {
				const { error: storageError } = await supabaseBrowser.storage.from("parcel-memories").remove(paths);
				if (storageError) console.error("Memory media cleanup error", storageError);
			}
			setMemory(null);
			setMemoryPhotoUrl(null);
			setMemoryMusicUrl(null);
			setMemoryNote("");
			setMemoryMusicFile(null);
			setMemoryFile(null);
			setEditingMemory(false);
			setMemoryMessage("Hatıran silindi.");
		} catch (error) {
			setMemoryMessage(error instanceof Error ? error.message : "Hatıran silinemedi.");
		} finally {
			setMemoryDeleting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
		className: "fixed inset-0 z-[320] grid place-items-center bg-black/45 p-4 backdrop-blur-[2px]",
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
					className: "relative z-[1000] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#071a2d] text-muted-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-5 w-5" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-4 rounded-xl border border-cyan-300/15 bg-cyan-950/10 p-4",
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: handleGoToParcel,
							className: "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-xs font-bold text-cyan-100 transition hover:bg-cyan-300/15",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-4 w-4" }), " PARSELE GİT"]
						}), canBuy && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: handleBuy,
							className: "btn-gold flex h-10 items-center justify-center gap-2 rounded-lg text-xs font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4" }), " SATIN AL"]
						})]
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
								children: "1 fotoğraf + kısa not + 1 müzik"
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
								memoryMusicUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
									controls: true,
									preload: "metadata",
									src: memoryMusicUrl,
									onError: () => {
										refreshMemoryMusicUrl();
									},
									className: "w-full"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block cursor-pointer rounded-lg border border-dashed border-cyan-300/25 bg-white/[0.03] p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-2 text-xs font-semibold",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "h-4 w-4" }),
												" ",
												memory?.music_path ? "Müziği değiştir" : "Müzik ekle"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block text-[10px] text-muted-foreground",
											children: "MP3, M4A, AAC, WAV, OGG veya WebM · Maks. 8 MB"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "mt-2 block w-full text-[10px]",
											type: "file",
											accept: "audio/*",
											onChange: handleMemoryMusicChange
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs font-semibold",
										children: "📝 Kısa not"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										value: memoryNote,
										onChange: (e) => setMemoryNote(e.target.value.slice(0, 300)),
										maxLength: 300,
										rows: 3,
										placeholder: "Bu parsel için kısa bir anı...",
										className: "mt-2 w-full resize-none rounded-lg border border-white/10 bg-white/5 p-2.5 text-xs"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-cyan-300/10 bg-white/[0.03] p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold",
										children: "Hatıranın görünürlüğü"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 grid grid-cols-2 gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: `cursor-pointer rounded-lg border p-2 text-[11px] ${!memoryIsPublic ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/10"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "radio",
												className: "mr-2",
												checked: !memoryIsPublic,
												onChange: () => setMemoryIsPublic(false)
											}), " Sadece ben"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: `cursor-pointer rounded-lg border p-2 text-[11px] ${memoryIsPublic ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/10"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "radio",
												className: "mr-2",
												checked: memoryIsPublic,
												onChange: () => setMemoryIsPublic(true)
											}), " Herkes görebilir"]
										})]
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
						}) : !memory && canManageMemory ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-lg border border-dashed border-cyan-300/20 bg-white/[0.02] p-4 text-center text-xs text-white/55",
								children: "Bu parselde henüz bir hatıra yok."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: startMemoryEditor,
								className: "flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-xs font-bold text-cyan-100 transition hover:bg-cyan-300/15",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "h-4 w-4" }), " HATIRA EKLE"]
							})]
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
								memoryMusicUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-white/10 bg-white/[0.03] p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-2 flex items-center gap-2 text-[10px] text-white/55",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "h-3.5 w-3.5" }), " Hatıra müziği"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
										controls: true,
										preload: "metadata",
										src: memoryMusicUrl,
										onError: () => {
											refreshMemoryMusicUrl();
										},
										className: "w-full"
									})]
								}),
								memoryMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "rounded-lg bg-white/5 px-3 py-2 text-[10px]",
									children: memoryMessage
								}),
								canManageMemory && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: startMemoryEditor,
										className: "flex h-10 items-center justify-center gap-2 rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-xs font-bold text-cyan-100",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4" }), " DÜZENLE"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										disabled: memoryDeleting,
										onClick: () => void handleMemoryDelete(),
										className: "flex h-10 items-center justify-center gap-2 rounded-lg border border-red-300/20 bg-red-300/5 text-xs font-bold text-red-100",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" }),
											" ",
											memoryDeleting ? "SİLİNİYOR..." : "SİL"
										]
									})]
								})
							]
						})]
					})
				]
			})]
		})
	});
}
var FOOTER_TRUST = [
	{
		icon: Globe,
		title: "7.000 BAŞLANGIÇ PARSELİ",
		text: "7 pilot ilde ilk parseller açıldı."
	},
	{
		icon: ShieldCheck,
		title: "SERTİFİKA SİSTEMİ",
		text: "Sertifikalar talep üzerine oluşturulur."
	},
	{
		icon: Lock,
		title: "GÜVENLİ ALTYAPI",
		text: "Sahiplik ve sertifika geçmişi korunur."
	},
	{
		icon: Headphones,
		title: "7/24 DESTEK",
		text: "Sorularınız için bize ulaşabilirsiniz."
	}
];
var TIER_LABELS = {
	digital: "Dijital",
	elite: "Elit",
	premium: "Premium"
};
function Parsellerim() {
	const { user, loading: authLoading } = useAuth();
	const navigate = useNavigate();
	const [parcels, setParcels] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [sortNewest, setSortNewest] = (0, import_react.useState)(true);
	const [viewMode, setViewMode] = (0, import_react.useState)("grid");
	const [selectedParcel, setSelectedParcel] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let mounted = true;
		async function load() {
			if (!supabaseBrowser) {
				if (mounted) {
					setError("Supabase yapılandırması eksik");
					setLoading(false);
				}
				return;
			}
			if (!user) {
				if (!authLoading && mounted) setParcels([]);
				return;
			}
			setLoading(true);
			setError(null);
			try {
				const { data: parcelData, error: parcelError } = await supabaseBrowser.from("parcels").select("id, parcel_number, status, owner_id, price, tier, tier_price, city_id, latitude, longitude, created_at, updated_at, cities(name,code)").eq("owner_id", user.id).eq("status", "sold").order("created_at", { ascending: false }).limit(200);
				if (parcelError) throw parcelError;
				if (!mounted) return;
				setParcels((parcelData ?? []).map((p) => ({
					...p,
					city_name: p.cities?.name,
					city_code: p.cities?.code
				})));
			} catch (err) {
				console.error(err);
				if (mounted) setError("Koleksiyon verileri yüklenirken hata oluştu");
			} finally {
				if (mounted) setLoading(false);
			}
		}
		load();
		return () => {
			mounted = false;
		};
	}, [user, authLoading]);
	(0, import_react.useEffect)(() => {
		if (!selectedParcel) return;
		const handleKeyDown = (event) => {
			if (event.key === "Escape") setSelectedParcel(null);
		};
		document.addEventListener("keydown", handleKeyDown);
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = previousOverflow;
		};
	}, [selectedParcel]);
	const purchasedParcels = (0, import_react.useMemo)(() => [...parcels].sort((a, b) => sortNewest ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime() : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()), [parcels, sortNewest]);
	const goToMap = (parcel) => {
		const citySlug = (parcel.city_name ?? "").toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c").replace(/İ/g, "i").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
		navigate({
			to: "/gokyuzu-haritasi",
			search: {
				city: citySlug,
				parcels: parcel.id,
				lat: String(parcel.latitude),
				lng: String(parcel.longitude)
			}
		});
	};
	if (authLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "starfield min-h-screen",
		"aria-busy": "true"
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, {
		to: "/giris",
		replace: true
	});
	const summaryCounts = [
		["Satın Alınan Parsel", purchasedParcels.length],
		["Aktif Sahiplik", purchasedParcels.length],
		["Hediye Edilen", 0]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "starfield min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserSidebar, { active: "/parsellerim" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 grid gap-6 xl:grid-cols-[1fr_300px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "panel relative overflow-hidden p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: hero_city_default,
									alt: "",
									"aria-hidden": true,
									loading: "lazy",
									width: 1920,
									height: 1088,
									className: "absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-40 md:block"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
											className: "font-display text-3xl font-bold",
											children: "KOLEKSİYONUM"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-2 text-xs text-muted-foreground",
											children: [
												"Ana Sayfa ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mx-2",
													children: "›"
												}),
												" Kullanıcı Paneli ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mx-2",
													children: "›"
												}),
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-gold",
													children: "Koleksiyonum"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 max-w-2xl text-sm text-muted-foreground",
											children: "Burada yalnızca satın aldığınız ve sahipliğinizde bulunan parseller gösterilir."
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate text-sm text-muted-foreground",
									children: [purchasedParcels.length, " satın alınmış parseliniz bulunuyor."]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex shrink-0 items-center gap-2 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "hidden text-muted-foreground sm:inline",
											children: "Sırala:"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: sortNewest ? "new" : "old",
											onChange: (e) => setSortNewest(e.target.value === "new"),
											className: "rounded-md border border-input bg-background px-3 py-2 text-xs outline-none",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "new",
												children: "Satın Alma Tarihi (Yeni → Eski)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "old",
												children: "Satın Alma Tarihi (Eski → Yeni)"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setViewMode("grid"),
											className: `rounded-md border p-2 ${viewMode === "grid" ? "border-gold/50 text-gold" : "border-border"}`,
											"aria-label": "Izgara görünüm",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid2x2, { className: "h-4 w-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => setViewMode("list"),
											className: `rounded-md border p-2 ${viewMode === "list" ? "border-gold/50 text-gold" : "border-border"}`,
											"aria-label": "Liste görünüm",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { className: "h-4 w-4" })
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: viewMode === "grid" ? "mt-4 grid gap-4" : "mt-4 grid gap-2",
								children: [
									loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: "panel p-4 text-center text-sm text-muted-foreground",
										children: "Satın alınan parseller yükleniyor..."
									}),
									!loading && error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
										className: "panel p-4 text-center text-sm text-destructive",
										children: error
									}),
									!loading && !error && purchasedParcels.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "panel p-8 text-center text-sm text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-display text-lg text-foreground",
												children: "Henüz satın alınmış parseliniz yok."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2",
												children: "Satın aldığınız parseller burada otomatik olarak görünecektir."
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/parsel-satin-al",
												className: "btn-gold mt-5 inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-[11px]",
												children: ["PARSEL SATIN AL ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
											})
										]
									}),
									!loading && purchasedParcels.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: `panel grid gap-4 p-4 ${viewMode === "grid" ? "md:grid-cols-[280px_1fr]" : "md:grid-cols-[180px_1fr]"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative overflow-hidden rounded-lg",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
												src: "/assets/hero-city-COMI2E0Z.jpg",
												alt: `${p.parcel_number} parseli`,
												loading: "lazy",
												width: 1920,
												height: 1088,
												className: `${viewMode === "grid" ? "h-40" : "h-28"} w-full object-cover opacity-80`
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "absolute left-3 top-3 rounded bg-success px-2 py-0.5 text-[10px] font-bold text-background",
												children: "SATIN ALINDI"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
														className: "flex min-w-0 items-center gap-2 truncate font-display text-xl",
														children: [
															p.parcel_number,
															" ",
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-4 w-4 shrink-0 text-gold" })
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex shrink-0 items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "rounded-full border border-success/40 px-3 py-1 text-[11px] text-success",
															children: "Sahibisiniz"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EllipsisVertical, { className: "h-4 w-4 text-muted-foreground" })]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-2 text-sm text-muted-foreground",
													children: [
														p.city_name ?? "Pilot il",
														" · ",
														TIER_LABELS[p.tier],
														" · ",
														p.parcel_number
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex min-w-0 flex-wrap gap-6 text-xs",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-start gap-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "mt-0.5 h-4 w-4 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "block text-muted-foreground",
																children: "Satın Alma Tarihi"
															}), new Date(p.created_at).toLocaleDateString("tr-TR")] })]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-start gap-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileBadge, { className: "mt-0.5 h-4 w-4 shrink-0 text-gold" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "block text-muted-foreground",
																children: "Paket"
															}), TIER_LABELS[p.tier]] })]
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex shrink-0 items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
															type: "button",
															onClick: () => void navigate({ to: "/hediyelerim" }),
															className: "inline-flex items-center gap-2 rounded-md border border-gold/40 px-4 py-2.5 text-[11px] text-gold hover:bg-gold/10",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gift, { className: "h-4 w-4" }), " PARSELİ HEDİYE ET"]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
															type: "button",
															onClick: () => setSelectedParcel(p),
															className: "btn-gold inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-[11px]",
															children: ["DETAYLAR ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
														})]
													})]
												})
											]
										})]
									}, p.id))
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid content-start gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "panel p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-xs font-semibold tracking-[0.1em] text-gold",
								children: "KOLEKSİYON ÖZETİ"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 grid gap-3",
								children: summaryCounts.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between border-b border-border pb-3 text-sm last:border-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold",
										children: value
									})]
								}, label))
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "panel p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-xs font-semibold tracking-[0.1em] text-gold",
									children: "SERTİFİKALARIM"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-muted-foreground",
									children: "Sertifikalarınızı ayrı bölümden görüntüleyebilir ve yönetebilirsiniz."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/sertifikalarim",
									className: "mt-4 inline-flex items-center gap-2 text-xs text-gold hover:underline",
									children: ["SERTİFİKALARIMA GİT ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
								})
							]
						})]
					})]
				})]
			}),
			selectedParcel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParcelDetailPanel, {
				parcel: selectedParcel,
				onClose: () => setSelectedParcel(null),
				onLocate: goToMap
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrustBar, { items: FOOTER_TRUST }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { Parsellerim as component };
