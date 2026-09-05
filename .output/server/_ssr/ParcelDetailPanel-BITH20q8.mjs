import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { b as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as supabaseBrowser, s as useAuth } from "./router-EinU636B.mjs";
import { C as Pencil, D as MapPin, T as Music2, f as ShoppingCart, n as X, s as Trash2, x as Play, z as ImagePlus } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ParcelDetailPanel-BITH20q8.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var TIER_LABELS = {
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
var musicMimeType = (file) => {
	if (file.type.startsWith("audio/")) return file.type;
	return {
		mp3: "audio/mpeg",
		m4a: "audio/mp4",
		aac: "audio/aac",
		wav: "audio/wav",
		ogg: "audio/ogg",
		webm: "audio/webm"
	}[(file.name.split(".").pop() || "").toLowerCase()] ?? "application/octet-stream";
};
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
	const [memoryMusicPreviewUrl, setMemoryMusicPreviewUrl] = (0, import_react.useState)(null);
	const [memoryMusicError, setMemoryMusicError] = (0, import_react.useState)(null);
	const [memoryMusicPlaying, setMemoryMusicPlaying] = (0, import_react.useState)(false);
	const [memoryNote, setMemoryNote] = (0, import_react.useState)("");
	const [memoryFile, setMemoryFile] = (0, import_react.useState)(null);
	const [memoryMusicFile, setMemoryMusicFile] = (0, import_react.useState)(null);
	const [memoryIsPublic, setMemoryIsPublic] = (0, import_react.useState)(false);
	const [memoryMessage, setMemoryMessage] = (0, import_react.useState)(null);
	const [editingMemory, setEditingMemory] = (0, import_react.useState)(false);
	const memoryAudioRef = (0, import_react.useRef)(null);
	const activeMusicUrl = memoryMusicPreviewUrl || memoryMusicUrl;
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
		const audio = memoryAudioRef.current;
		audio?.pause();
		if (audio) {
			audio.removeAttribute("src");
			audio.load();
		}
		setMemoryMusicPlaying(false);
		setMemoryLoading(true);
		setMemory(null);
		setMemoryPhotoUrl(null);
		setMemoryMusicUrl(null);
		setMemoryMusicPreviewUrl(null);
		setMemoryMusicError(null);
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
					const { data, error } = await supabaseBrowser.storage.from("parcel-memories").createSignedUrl(nextMemory.photo_path, 3600);
					if (error) throw new Error(`Hatıra fotoğrafı açılamadı: ${error.message}`);
					if (!cancelled) setMemoryPhotoUrl(data?.signedUrl ?? null);
				}
				if (nextMemory?.music_path) {
					const { data, error } = await supabaseBrowser.storage.from("parcel-memories").createSignedUrl(nextMemory.music_path, 3600);
					if (error) throw new Error(`Hatıra müziği açılamadı: ${error.message}`);
					if (!data?.signedUrl) throw new Error("Hatıra müziği için geçerli bir oynatma adresi oluşturulamadı.");
					if (!cancelled) setMemoryMusicUrl(data.signedUrl);
				}
			} catch (error) {
				console.error("Parcel memory load error", error);
				if (!cancelled) setMemoryMusicError(error instanceof Error ? error.message : "Hatıra medyası yüklenemedi.");
			} finally {
				if (!cancelled) setMemoryLoading(false);
			}
		}
		loadMemory();
		return () => {
			cancelled = true;
			const currentAudio = memoryAudioRef.current;
			currentAudio?.pause();
			if (currentAudio) {
				currentAudio.removeAttribute("src");
				currentAudio.load();
			}
			setMemoryMusicPlaying(false);
		};
	}, [
		parcel.id,
		parcel.owner_id,
		user?.id
	]);
	(0, import_react.useEffect)(() => {
		const audio = memoryAudioRef.current;
		if (!audio) return;
		audio.pause();
		audio.currentTime = 0;
		audio.load();
		setMemoryMusicPlaying(false);
	}, [memoryMusicUrl, memoryMusicPreviewUrl]);
	function startMemoryEditor() {
		setMemoryMessage(null);
		setMemoryMusicError(null);
		setMemoryFile(null);
		setMemoryMusicFile(null);
		setEditingMemory(true);
	}
	function cancelMemoryEditor() {
		setMemoryMessage(null);
		setMemoryMusicError(null);
		setMemoryFile(null);
		setMemoryMusicFile(null);
		setMemoryNote(memory?.note ?? "");
		setMemoryIsPublic(memory?.is_public ?? false);
		setMemoryMusicPreviewUrl(null);
		setEditingMemory(false);
	}
	function handleMemoryFileChange(event) {
		setMemoryFile(event.target.files?.[0] ?? null);
		setMemoryMessage(null);
	}
	function handleMemoryMusicChange(event) {
		const file = event.target.files?.[0] ?? null;
		if (memoryMusicPreviewUrl) URL.revokeObjectURL(memoryMusicPreviewUrl);
		setMemoryMusicFile(file);
		setMemoryMusicError(null);
		setMemoryMessage(null);
		if (!file) {
			setMemoryMusicPreviewUrl(null);
			return;
		}
		const ext = (file.name.split(".").pop() || "").toLowerCase();
		if (!MUSIC_EXTENSIONS.includes(ext)) {
			setMemoryMusicPreviewUrl(null);
			setMemoryMusicError("MP3, M4A, AAC, WAV, OGG veya WebM kullanın.");
			return;
		}
		if (file.size > MAX_MUSIC_BYTES) {
			setMemoryMusicPreviewUrl(null);
			setMemoryMusicError("Müzik en fazla 8 MB olabilir.");
			return;
		}
		setMemoryMusicPreviewUrl(URL.createObjectURL(file));
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
		setMemoryMusicError(null);
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
				const ext = (memoryMusicFile.name.split(".").pop() || "mp3").toLowerCase();
				if (!MUSIC_EXTENSIONS.includes(ext)) throw new Error("MP3, M4A, AAC, WAV, OGG veya WebM kullanın.");
				if (memoryMusicFile.size > MAX_MUSIC_BYTES) throw new Error("Müzik en fazla 8 MB olabilir.");
				const contentType = musicMimeType(memoryMusicFile);
				if (contentType === "application/octet-stream") throw new Error("Lütfen desteklenen bir müzik dosyası seçin.");
				uploadedMusicPath = `${user.id}/${parcel.id}/memory-music-${Date.now()}.${ext}`;
				const { error } = await supabaseBrowser.storage.from("parcel-memories").upload(uploadedMusicPath, memoryMusicFile, {
					upsert: false,
					contentType,
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
			const photoPromise = nextMemory.photo_path ? supabaseBrowser.storage.from("parcel-memories").createSignedUrl(nextMemory.photo_path, 3600) : Promise.resolve({
				data: null,
				error: null
			});
			const musicPromise = nextMemory.music_path ? supabaseBrowser.storage.from("parcel-memories").createSignedUrl(nextMemory.music_path, 3600) : Promise.resolve({
				data: null,
				error: null
			});
			const [{ data: photoSigned, error: photoSignError }, { data: musicSigned, error: musicSignError }] = await Promise.all([photoPromise, musicPromise]);
			if (photoSignError) throw new Error(`Fotoğraf oynatma adresi oluşturulamadı: ${photoSignError.message}`);
			if (musicSignError || !musicSigned?.signedUrl) throw new Error(`Müzik oynatma adresi oluşturulamadı: ${musicSignError?.message || "geçersiz adres"}`);
			setMemory(nextMemory);
			setMemoryNote(nextMemory.note ?? "");
			setMemoryIsPublic(nextMemory.is_public);
			setMemoryFile(null);
			setMemoryMusicFile(null);
			setMemoryPhotoUrl(photoSigned?.signedUrl ?? null);
			setMemoryMusicUrl(musicSigned.signedUrl);
			setMemoryMusicPreviewUrl(null);
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
			const audio = memoryAudioRef.current;
			audio?.pause();
			if (audio) {
				audio.removeAttribute("src");
				audio.load();
			}
			setMemory(null);
			setMemoryPhotoUrl(null);
			setMemoryMusicUrl(null);
			setMemoryMusicPreviewUrl(null);
			setMemoryMusicError(null);
			setMemoryMusicPlaying(false);
			setMemoryNote("");
			setMemoryMusicFile(null);
			setMemoryFile(null);
			setEditingMemory(false);
			setMemoryMessage("Hatıran silindi.");
		} catch (error) {
			setMemoryMessage(error instanceof Error ? error.message : "Hatıra silinemedi.");
		} finally {
			setMemoryDeleting(false);
		}
	}
	async function toggleMemoryPlayback() {
		const audio = memoryAudioRef.current;
		if (!audio || !audio.src) {
			setMemoryMusicError("Müzik henüz yüklenmedi.");
			return;
		}
		setMemoryMusicError(null);
		if (!audio.paused) {
			audio.pause();
			return;
		}
		try {
			await audio.play();
			setMemoryMusicPlaying(true);
		} catch (error) {
			setMemoryMusicPlaying(false);
			if (error instanceof DOMException && error.name === "NotAllowedError") setMemoryMusicError("Tarayıcı müziğin başlamasına izin vermedi. OYNAT düğmesine tekrar dokunun.");
			else if (error instanceof DOMException && error.name === "NotSupportedError") setMemoryMusicError("Bu ses dosyası tarayıcı tarafından desteklenmiyor. MP3 kullanmanız önerilir.");
			else setMemoryMusicError(error instanceof Error ? `Müzik başlatılamadı: ${error.message}` : "Müzik başlatılamadı.");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
		className: "fixed inset-0 z-[5000] grid place-items-center bg-black/45 p-4 backdrop-blur-[2px]",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Parsel bilgileri",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative max-h-[92vh] w-full max-w-md overflow-auto rounded-2xl border border-cyan-300/20 bg-[#071a2d] p-5 shadow-2xl shadow-black/60 sm:p-6",
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
					className: "relative z-[10000] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#071a2d] text-muted-foreground",
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
								activeMusicUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-emerald-300/15 bg-emerald-400/5 p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-2 flex items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 text-[10px] text-emerald-200",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "h-3.5 w-3.5" }),
												" ",
												memoryMusicPreviewUrl ? "Seçilen müzik" : "Mevcut müzik"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => void toggleMemoryPlayback(),
											className: "inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-300/25 px-2.5 text-[10px] font-bold text-emerald-100",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-3.5 w-3.5" }),
												" ",
												memoryMusicPlaying ? "DURDUR" : "OYNAT"
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
										ref: memoryAudioRef,
										controls: true,
										preload: "metadata",
										src: activeMusicUrl,
										className: "w-full",
										onPlay: () => setMemoryMusicPlaying(true),
										onPause: () => setMemoryMusicPlaying(false),
										onEnded: () => setMemoryMusicPlaying(false),
										onError: () => setMemoryMusicError("Bu ses dosyası tarayıcı tarafından desteklenmiyor. MP3 formatı ile tekrar deneyin.")
									})]
								}),
								memoryMusicError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "rounded-lg border border-amber-300/20 bg-amber-300/5 px-3 py-2 text-[10px] text-amber-100",
									children: memoryMusicError
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
											children: "MP3, M4A, AAC, WAV, OGG veya WebM · Maks. 8 MB · MP3 önerilir"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "mt-2 block w-full text-[10px]",
											type: "file",
											accept: "audio/mpeg,audio/mp4,audio/aac,audio/wav,audio/x-wav,audio/ogg,audio/webm,.mp3,.m4a,.aac,.wav,.ogg,.webm",
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
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-2 flex items-center gap-2 text-[10px] text-white/55",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Music2, { className: "h-3.5 w-3.5" }), " Hatıra müziği"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("audio", {
											ref: memoryAudioRef,
											controls: true,
											preload: "metadata",
											src: memoryMusicUrl,
											className: "w-full",
											onPlay: () => setMemoryMusicPlaying(true),
											onPause: () => setMemoryMusicPlaying(false),
											onEnded: () => setMemoryMusicPlaying(false),
											onError: () => setMemoryMusicError("Bu ses dosyası tarayıcı tarafından desteklenmiyor. MP3 formatı ile tekrar deneyin.")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => void toggleMemoryPlayback(),
											className: "mt-2 inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-300/25 px-3 text-[10px] font-bold text-emerald-100",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-3.5 w-3.5" }),
												" ",
												memoryMusicPlaying ? "DURDUR" : "OYNAT"
											]
										}),
										memoryMusicError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 rounded-lg border border-amber-300/20 bg-amber-300/5 px-3 py-2 text-[10px] text-amber-100",
											children: memoryMusicError
										})
									]
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
//#endregion
export { ParcelDetailPanel as t };
