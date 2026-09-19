import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { o as supabaseBrowser, s as useAuth } from "./router-3MRomBBh.mjs";
import { A as TextureLoader, C as Raycaster, D as Sprite, E as SphereGeometry, M as Vector3, O as SpriteMaterial, S as Ray, T as Scene, _ as MeshBasicMaterial, a as BufferGeometry, b as PlaneGeometry, c as Color, d as InstancedMesh, f as LineBasicMaterial, g as Mesh, h as Matrix4, i as BufferAttribute, j as Vector2, k as StaticDrawUsage, l as Euler, m as MathUtils, o as CanvasTexture, p as LineSegments, s as ClampToEdgeWrapping, t as WebGLRenderer, u as Group, v as PerspectiveCamera, w as SRGBColorSpace, x as Quaternion, y as Plane } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gokyuzu-keDemdIM.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var SKY_IMAGE_URL = "https://cdn.polyhaven.com/asset_img/primary/kloppenheim_03_puresky.png?height=2048";
var REAL_PARCELS_PER_CITY = 1e3;
var CITY_GRID_WIDTH = 40;
var CITY_GRID_HEIGHT = 25;
var PARCEL_COLUMNS = CITY_GRID_WIDTH;
var PARCEL_ROWS = CITY_GRID_HEIGHT;
var REAL_PARCEL_COUNT = REAL_PARCELS_PER_CITY;
var TILE_SIZE = 10;
var normalizeCityName = (value) => value.toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9]/g, "");
var pointInRing = (longitude, latitude, ring) => {
	let inside = false;
	for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
		const xi = ring[i]?.[0] ?? 0;
		const yi = ring[i]?.[1] ?? 0;
		const xj = ring[j]?.[0] ?? 0;
		const yj = ring[j]?.[1] ?? 0;
		if (yi > latitude !== yj > latitude && longitude < (xj - xi) * (latitude - yi) / (yj - yi || Number.EPSILON) + xi) inside = !inside;
	}
	return inside;
};
var pointInPolygon = (longitude, latitude, coordinates) => {
	if (!coordinates[0] || !pointInRing(longitude, latitude, coordinates[0])) return false;
	for (let i = 1; i < coordinates.length; i += 1) if (coordinates[i] && pointInRing(longitude, latitude, coordinates[i])) return false;
	return true;
};
var findProvinceFromGeoJson = (longitude, latitude, geoJson) => {
	for (const feature of geoJson.features ?? []) {
		const geometry = feature.geometry;
		if (!geometry?.coordinates) continue;
		const coordinates = geometry.coordinates;
		let matched = false;
		if (geometry.type === "Polygon") matched = pointInPolygon(longitude, latitude, coordinates);
		else if (geometry.type === "MultiPolygon") matched = coordinates.some((polygon) => pointInPolygon(longitude, latitude, polygon));
		if (!matched) continue;
		const properties = feature.properties ?? {};
		const name = properties.name ?? properties.NAME_1 ?? properties.NAME ?? properties.il_adi ?? properties.IL_ADI ?? properties.province;
		if (typeof name === "string" && name.trim()) return name.trim();
	}
	return null;
};
function GokyuzuPage() {
	const { user } = useAuth();
	const mountRef = (0, import_react.useRef)(null);
	const [selectedParcel, setSelectedParcel] = (0, import_react.useState)(null);
	const [selectedAd, setSelectedAd] = (0, import_react.useState)(null);
	const [selectedIsOwner, setSelectedIsOwner] = (0, import_react.useState)(false);
	const [showAdInfo, setShowAdInfo] = (0, import_react.useState)(false);
	const [adTitle, setAdTitle] = (0, import_react.useState)("");
	const [adLink, setAdLink] = (0, import_react.useState)("");
	const [adFile, setAdFile] = (0, import_react.useState)(null);
	const [adSaving, setAdSaving] = (0, import_react.useState)(false);
	const [adMessage, setAdMessage] = (0, import_react.useState)("");
	const [worldLoading, setWorldLoading] = (0, import_react.useState)(true);
	const [worldLoaded, setWorldLoaded] = (0, import_react.useState)(0);
	const [detectedCity, setDetectedCity] = (0, import_react.useState)(null);
	const [locationMessage, setLocationMessage] = (0, import_react.useState)("Konumunuz alınıyor…");
	const [locationError, setLocationError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!selectedParcel) {
			setSelectedAd(null);
			setShowAdInfo(false);
			setSelectedIsOwner(false);
			setAdMessage("");
			return;
		}
		let cancelled = false;
		const loadParcelAd = async () => {
			setAdMessage("");
			const [{ data: ownerData }, { data: adData }] = await Promise.all([user ? supabaseBrowser.rpc("is_parcel_owner", { p_parcel_id: selectedParcel.id }) : Promise.resolve({ data: false }), supabaseBrowser.from("parcel_advertisements").select("id,parcel_id,title,image_path,link_url,is_active").eq("parcel_id", selectedParcel.id).maybeSingle()]);
			if (cancelled) return;
			setSelectedIsOwner(Boolean(ownerData));
			setSelectedAd(adData ?? null);
			setShowAdInfo(false);
			setAdTitle(adData?.title ?? "");
			setAdLink(adData?.link_url ?? "");
		};
		loadParcelAd();
		return () => {
			cancelled = true;
		};
	}, [selectedParcel, user]);
	const saveAdvertisement = async () => {
		if (!selectedParcel || !user || !selectedIsOwner) return;
		if (!adFile && !selectedAd) {
			setAdMessage("Bir reklam görseli seçin.");
			return;
		}
		if (adFile && (!adFile.type.startsWith("image/") || adFile.size > 5242880)) {
			setAdMessage("Görsel JPG, PNG, WEBP veya GIF olmalı ve 5 MB altında olmalı.");
			return;
		}
		setAdSaving(true);
		setAdMessage("");
		try {
			let imagePath = selectedAd?.image_path ?? "";
			if (adFile) {
				const extension = adFile.name.split(".").pop()?.toLowerCase() || "jpg";
				const nextPath = user.id + "/" + selectedParcel.id + "/" + crypto.randomUUID() + "." + extension;
				const upload = await supabaseBrowser.storage.from("parcel-ads").upload(nextPath, adFile, {
					contentType: adFile.type,
					upsert: false
				});
				if (upload.error) throw upload.error;
				imagePath = nextPath;
			}
			const payload = {
				parcel_id: selectedParcel.id,
				title: adTitle.trim() || "Parsel Reklamı",
				image_path: imagePath,
				link_url: adLink.trim() || null,
				is_active: true
			};
			const { data, error } = await supabaseBrowser.from("parcel_advertisements").upsert(payload, { onConflict: "parcel_id" }).select("id,parcel_id,title,image_path,link_url,is_active").single();
			if (error) throw error;
			setSelectedAd(data);
			setAdFile(null);
			setAdMessage("Reklam bu parsele yayınlandı.");
		} catch (error) {
			console.error("Parsel reklamı kaydedilemedi:", error);
			setAdMessage(error instanceof Error ? error.message : "Reklam kaydedilemedi.");
		} finally {
			setAdSaving(false);
		}
	};
	const removeAdvertisement = async () => {
		if (!selectedParcel || !selectedIsOwner || !selectedAd) return;
		setAdSaving(true);
		setAdMessage("");
		try {
			const { error } = await supabaseBrowser.from("parcel_advertisements").delete().eq("parcel_id", selectedParcel.id);
			if (error) throw error;
			await supabaseBrowser.storage.from("parcel-ads").remove([selectedAd.image_path]);
			setSelectedAd(null);
			setAdTitle("");
			setAdLink("");
			setAdMessage("Reklam kaldırıldı.");
		} catch (error) {
			console.error("Parsel reklamı kaldırılamadı:", error);
			setAdMessage(error instanceof Error ? error.message : "Reklam kaldırılamadı.");
		} finally {
			setAdSaving(false);
		}
	};
	const getAdUrl = (ad) => supabaseBrowser.storage.from("parcel-ads").getPublicUrl(ad.image_path).data.publicUrl;
	const getExternalAdUrl = (value) => {
		const trimmed = value.trim();
		if (!trimmed) return null;
		if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) return trimmed;
		return "https://" + trimmed.replace(/^\/\//, "");
	};
	(0, import_react.useEffect)(() => {
		const mount = mountRef.current;
		if (!mount) return;
		const scene = new Scene();
		const camera = new PerspectiveCamera(52, Math.max(mount.clientWidth, 1) / Math.max(mount.clientHeight, 1), .1, 2e4);
		const renderer = new WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: "high-performance"
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
		renderer.setSize(mount.clientWidth, mount.clientHeight);
		renderer.outputColorSpace = SRGBColorSpace;
		renderer.domElement.style.touchAction = "none";
		renderer.domElement.style.cursor = "grab";
		mount.appendChild(renderer.domElement);
		const loader = new TextureLoader();
		loader.setCrossOrigin("anonymous");
		const skyTexture = loader.load(SKY_IMAGE_URL);
		skyTexture.colorSpace = SRGBColorSpace;
		skyTexture.mapping = 303;
		const skyGeometry = new SphereGeometry(8e3, 48, 24);
		skyGeometry.scale(-1, 1, 1);
		const skyMaterial = new MeshBasicMaterial({
			map: skyTexture,
			side: 1,
			depthWrite: false
		});
		scene.add(new Mesh(skyGeometry, skyMaterial));
		const cameraTarget = new Vector3(0, 2.5, 0);
		const zoomPlane = new Plane(new Vector3(0, 1, 0), -2.58);
		const zoomWorldBefore = new Vector3();
		const zoomWorldAfter = new Vector3();
		new Ray();
		camera.position.set(0, 32, 34);
		camera.lookAt(cameraTarget);
		const parcelGroup = new Group();
		scene.add(parcelGroup);
		const adGroup = new Group();
		parcelGroup.add(adGroup);
		const raycaster = new Raycaster();
		const pointer = new Vector2();
		raycaster.params.Line.threshold = 2.5;
		let panX = 0;
		let panZ = 0;
		let velocityX = 0;
		let velocityZ = 0;
		let dragging = false;
		let dragMoved = false;
		let lastPointerX = 0;
		let lastPointerY = 0;
		let pointerDownX = 0;
		let pointerDownY = 0;
		const pointers = /* @__PURE__ */ new Map();
		let pinchDistance = null;
		let twoFingerCenterX = null;
		let twoFingerCenterY = null;
		const getFitDistance = () => {
			const verticalFov = MathUtils.degToRad(camera.fov);
			const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * Math.max(camera.aspect, .1));
			const fitWidth = 400 / (2 * Math.tan(horizontalFov / 2));
			const fitDepth = 250 / (2 * Math.tan(verticalFov / 2));
			return Math.ceil(Math.max(fitWidth, fitDepth) * 1.18);
		};
		const setZoom = (distance, focusX, focusY) => {
			const maxZoomDistance = Math.max(120, getFitDistance());
			const clamped = MathUtils.clamp(distance, 18, maxZoomDistance);
			camera.position.y = MathUtils.clamp(clamped * .9, 14, 520);
			camera.position.z = clamped;
			camera.lookAt(cameraTarget);
			if (focusX == null || focusY == null) return;
			const rect = renderer.domElement.getBoundingClientRect();
			pointer.x = (focusX - rect.left) / rect.width * 2 - 1;
			pointer.y = -((focusY - rect.top) / rect.height) * 2 + 1;
			raycaster.setFromCamera(pointer, camera);
			if (!raycaster.ray.intersectPlane(zoomPlane, zoomWorldAfter)) return;
			const shiftX = zoomWorldBefore.x - zoomWorldAfter.x;
			const shiftZ = zoomWorldBefore.z - zoomWorldAfter.z;
			applyPan(MathUtils.clamp(panX + shiftX, -maxPanX, maxPanX), MathUtils.clamp(panZ + shiftZ, -maxPanZ, maxPanZ));
		};
		const maxPanX = 180;
		const maxPanZ = 105;
		const dragScale = .1;
		const friction = .9;
		const inertiaStop = .015;
		const applyPan = (x, z) => {
			panX = x;
			panZ = z;
			parcelGroup.position.set(panX, 0, panZ);
		};
		const applyDrag = (dx, dy) => {
			const nextX = MathUtils.clamp(panX + dx * dragScale, -180, maxPanX);
			const nextZ = MathUtils.clamp(panZ + dy * dragScale, -105, maxPanZ);
			const movementX = nextX - panX;
			const movementZ = nextZ - panZ;
			velocityX = velocityX * .65 + movementX * .35;
			velocityZ = velocityZ * .65 + movementZ * .35;
			if (nextX === -180 || nextX === maxPanX) velocityX = 0;
			if (nextZ === -105 || nextZ === maxPanZ) velocityZ = 0;
			applyPan(nextX, nextZ);
		};
		const stopInertia = () => {
			velocityX = 0;
			velocityZ = 0;
		};
		const onWheel = (event) => {
			event.preventDefault();
			event.stopPropagation();
			const current = Math.max(18, camera.position.z);
			const rect = renderer.domElement.getBoundingClientRect();
			pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
			pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
			raycaster.setFromCamera(pointer, camera);
			if (raycaster.ray.intersectPlane(zoomPlane, zoomWorldBefore)) setZoom(current + MathUtils.clamp(event.deltaY, -160, 160) * .12, event.clientX, event.clientY);
			else setZoom(current + MathUtils.clamp(event.deltaY, -160, 160) * .12);
		};
		const onPointerDown = (event) => {
			event.preventDefault();
			event.stopPropagation();
			pointers.set(event.pointerId, {
				x: event.clientX,
				y: event.clientY
			});
			pointerDownX = event.clientX;
			pointerDownY = event.clientY;
			try {
				renderer.domElement.setPointerCapture(event.pointerId);
			} catch {}
			if (pointers.size === 2) {
				const [a, b] = [...pointers.values()];
				pinchDistance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
				twoFingerCenterX = (a.x + b.x) / 2;
				twoFingerCenterY = (a.y + b.y) / 2;
				dragging = false;
				stopInertia();
				return;
			}
			dragging = true;
			dragMoved = false;
			stopInertia();
			lastPointerX = event.clientX;
			lastPointerY = event.clientY;
			renderer.domElement.style.cursor = "grabbing";
		};
		const onPointerMove = (event) => {
			if (!pointers.get(event.pointerId)) {
				updateHover(event);
				return;
			}
			event.preventDefault();
			event.stopPropagation();
			pointers.set(event.pointerId, {
				x: event.clientX,
				y: event.clientY
			});
			if (pointers.size === 2 && pinchDistance != null) {
				const [a, b] = [...pointers.values()];
				const distance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
				const focusX = (a.x + b.x) / 2;
				const focusY = (a.y + b.y) / 2;
				if (twoFingerCenterX != null && twoFingerCenterY != null) {
					const rotateScale = .008;
					parcelGroup.rotation.y -= (focusX - twoFingerCenterX) * rotateScale;
					parcelGroup.rotation.x = MathUtils.clamp(parcelGroup.rotation.x - (focusY - twoFingerCenterY) * rotateScale, -Math.PI / 2, Math.PI / 2);
				}
				twoFingerCenterX = focusX;
				twoFingerCenterY = focusY;
				const zoomRatio = distance / pinchDistance;
				if (Math.abs(zoomRatio - 1) > .002) setZoom(Math.max(18, camera.position.z / zoomRatio));
				pinchDistance = distance;
				renderer.domElement.style.cursor = "grab";
				return;
			}
			if (!dragging) {
				updateHover(event);
				return;
			}
			const dx = event.clientX - lastPointerX;
			const dy = event.clientY - lastPointerY;
			if (Math.hypot(dx, dy) > 1) dragMoved = true;
			lastPointerX = event.clientX;
			lastPointerY = event.clientY;
			clearHover();
			applyDrag(dx, dy);
		};
		const onPointerUp = (event) => {
			pointers.delete(event.pointerId);
			if (pointers.size < 2) {
				pinchDistance = null;
				twoFingerCenterX = null;
				twoFingerCenterY = null;
			}
			dragging = pointers.size === 1;
			if (pointers.size === 0 && dragMoved) dragMoved = true;
			if (dragging) {
				const remaining = [...pointers.values()][0];
				lastPointerX = remaining.x;
				lastPointerY = remaining.y;
			} else renderer.domElement.style.cursor = "grab";
			try {
				renderer.domElement.releasePointerCapture(event.pointerId);
			} catch {}
		};
		let hoveredIndex = null;
		let parcelMesh = null;
		const parcelBaseColors = [];
		const clearHover = () => {
			if (hoveredIndex == null || !parcelMesh) return;
			const color = parcelBaseColors[hoveredIndex];
			if (color) parcelMesh.setColorAt(hoveredIndex, color);
			parcelMesh.instanceColor.needsUpdate = true;
			hoveredIndex = null;
			renderer.domElement.style.cursor = dragging ? "grabbing" : "grab";
		};
		const updateHover = (event) => {
			if (!parcelMesh || dragging || pointers.size > 1) {
				clearHover();
				return;
			}
			const rect = renderer.domElement.getBoundingClientRect();
			pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
			pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
			raycaster.setFromCamera(pointer, camera);
			const nextIndex = raycaster.intersectObject(parcelMesh, false)[0]?.instanceId ?? null;
			if (nextIndex === hoveredIndex) return;
			clearHover();
			if (nextIndex == null || !parcelBaseColors[nextIndex]) return;
			hoveredIndex = nextIndex;
			parcelMesh.setColorAt(nextIndex, new Color(16765286));
			parcelMesh.instanceColor.needsUpdate = true;
			renderer.domElement.style.cursor = "pointer";
		};
		const loadAllWorldData = async () => {
			setWorldLoading(true);
			setWorldLoaded(0);
			setDetectedCity(null);
			setLocationError(null);
			setLocationMessage("Konumunuz alınıyor…");
			if (!navigator.geolocation) throw new Error("Bu cihazda konum özelliği desteklenmiyor.");
			const citiesResult = await supabaseBrowser.from("cities").select("name,code").eq("is_active", true);
			if (citiesResult.error) throw citiesResult.error;
			const cities = (citiesResult.data ?? []).map((city) => ({
				name: city.name,
				code: city.code
			}));
			if (cities.length === 0) throw new Error("Aktif il kaydı bulunamadı.");
			const getPosition = (options) => new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(resolve, reject, options);
			});
			let position;
			try {
				position = await getPosition({
					enableHighAccuracy: true,
					timeout: 12e3,
					maximumAge: 3e5
				});
			} catch (firstError) {
				if (firstError?.code === GeolocationPositionError.PERMISSION_DENIED) throw new Error("Konum izni verilmedi. Tarayıcıdan konum iznini açıp sayfayı yenileyin.");
				setLocationMessage("GPS sinyali bekleniyor, ikinci konum denemesi yapılıyor…");
				position = await getPosition({
					enableHighAccuracy: false,
					timeout: 1e4,
					maximumAge: 6e5
				});
			}
			const { latitude, longitude } = position.coords;
			setLocationMessage("Bulunduğunuz il belirleniyor…");
			const provinceResponse = await fetch("/api/earth-assets?type=provinces", { cache: "force-cache" });
			if (!provinceResponse.ok) throw new Error("İl sınırları alınamadı.");
			const provinceName = findProvinceFromGeoJson(longitude, latitude, await provinceResponse.json());
			if (!provinceName) throw new Error("Konumunuz Türkiye sınırları içinde bir ile eşleştirilemedi.");
			const normalizedProvince = normalizeCityName(provinceName);
			const city = cities.find((item) => normalizeCityName(item.name) === normalizedProvince);
			if (!city) throw new Error("Konumunuzdaki il MySkyParcel il listesinde bulunamadı.");
			setDetectedCity(city.name);
			setLocationMessage(city.name + " · 1.000 parsel hazırlanıyor…");
			const { data: parcelData, error: parcelError } = await supabaseBrowser.from("parcel_map_public").select("id,parcel_number,status,price,tier,city_name,city_code,layer_number,sector_number,grid_x,grid_y").eq("city_name", city.name).order("grid_y", { ascending: true }).order("grid_x", { ascending: true }).range(0, 999);
			if (parcelError) throw parcelError;
			const allParcels = parcelData ?? [];
			if (allParcels.length !== REAL_PARCELS_PER_CITY) throw new Error(city.name + " için 1.000 parsel yerine " + allParcels.length.toLocaleString("tr-TR") + " parsel bulundu.");
			setWorldLoaded(allParcels.length);
			const adsResult = await supabaseBrowser.from("parcel_advertisements").select("id,parcel_id,title,image_path,link_url,is_active").eq("is_active", true);
			if (adsResult.error) throw adsResult.error;
			const gridPositions = new Float32Array(REAL_PARCEL_COUNT * 4 * 2 * 3);
			let gridCursor = 0;
			const halfWorldX = 200;
			const halfWorldZ = 125;
			for (let globalZ = 0; globalZ < PARCEL_ROWS; globalZ += 1) for (let globalX = 0; globalX < PARCEL_COLUMNS; globalX += 1) {
				const x = globalX * TILE_SIZE - halfWorldX;
				const z = globalZ * TILE_SIZE - halfWorldZ;
				const x2 = x + TILE_SIZE;
				const z2 = z + TILE_SIZE;
				const values = [
					[
						x,
						2.15,
						z
					],
					[
						x2,
						2.15,
						z
					],
					[
						x2,
						2.15,
						z
					],
					[
						x2,
						2.15,
						z2
					],
					[
						x2,
						2.15,
						z2
					],
					[
						x,
						2.15,
						z2
					],
					[
						x,
						2.15,
						z2
					],
					[
						x,
						2.15,
						z
					]
				];
				for (const point of values) {
					gridPositions[gridCursor++] = point[0];
					gridPositions[gridCursor++] = point[1];
					gridPositions[gridCursor++] = point[2];
				}
			}
			const gridGeometry = new BufferGeometry();
			gridGeometry.setAttribute("position", new BufferAttribute(gridPositions, 3));
			const gridMaterial = new LineBasicMaterial({
				color: 9498256,
				transparent: true,
				opacity: 1,
				depthWrite: false,
				depthTest: false
			});
			const gridLines = new LineSegments(gridGeometry, gridMaterial);
			parcelGroup.add(gridLines);
			const parcelGeometry = new PlaneGeometry(TILE_SIZE * .92, TILE_SIZE * .92);
			parcelMesh = new InstancedMesh(parcelGeometry, new MeshBasicMaterial({
				transparent: true,
				opacity: .72,
				side: 2,
				depthWrite: false,
				depthTest: false,
				vertexColors: true
			}), REAL_PARCEL_COUNT);
			parcelMesh.instanceMatrix.setUsage(StaticDrawUsage);
			const baseColor = new Color();
			const matrix = new Matrix4();
			const adMap = new Map((adsResult.data ?? []).map((ad) => [ad.parcel_id, ad]));
			for (let i = 0; i < allParcels.length; i += 1) {
				const parcel = allParcels[i];
				if (parcel.grid_x == null || parcel.grid_y == null) continue;
				const globalX = parcel.grid_x;
				const globalZ = parcel.grid_y;
				const x = globalX * TILE_SIZE - halfWorldX + TILE_SIZE / 2;
				const z = globalZ * TILE_SIZE - halfWorldZ + TILE_SIZE / 2;
				const hasAd = adMap.has(parcel.id);
				matrix.compose(new Vector3(x, 2.58, z), new Quaternion().setFromEuler(new Euler(-Math.PI / 2, 0, 0)), new Vector3(hasAd ? 0 : 1, hasAd ? 0 : 1, hasAd ? 0 : 1));
				parcelMesh.setMatrixAt(i, matrix);
				baseColor.set(9498256);
				const color = baseColor.clone();
				parcelBaseColors[i] = color;
				parcelMesh.setColorAt(i, color);
			}
			parcelMesh.userData.parcels = allParcels;
			parcelMesh.userData.ads = adMap;
			parcelMesh.instanceMatrix.needsUpdate = true;
			if (parcelMesh.instanceColor) parcelMesh.instanceColor.needsUpdate = true;
			parcelGroup.add(parcelMesh);
			const soldLabelCanvas = document.createElement("canvas");
			soldLabelCanvas.width = 256;
			soldLabelCanvas.height = 64;
			const soldLabelContext = soldLabelCanvas.getContext("2d");
			if (soldLabelContext) {
				soldLabelContext.fillStyle = "#b91c1c";
				soldLabelContext.roundRect(4, 8, 248, 48, 12);
				soldLabelContext.fill();
				soldLabelContext.font = "700 30px Arial";
				soldLabelContext.textAlign = "center";
				soldLabelContext.textBaseline = "middle";
				soldLabelContext.fillStyle = "#ffffff";
				soldLabelContext.fillText("SATILDI", 128, 32);
			}
			const soldLabelTexture = new CanvasTexture(soldLabelCanvas);
			soldLabelTexture.colorSpace = SRGBColorSpace;
			const soldLabelMaterial = new SpriteMaterial({
				map: soldLabelTexture,
				transparent: true,
				depthWrite: false,
				depthTest: false
			});
			for (let i = 0; i < allParcels.length; i += 1) {
				const parcel = allParcels[i];
				if (parcel.grid_x == null || parcel.grid_y == null) continue;
				const x = parcel.grid_x * TILE_SIZE - halfWorldX + TILE_SIZE / 2;
				const z = parcel.grid_y * TILE_SIZE - halfWorldZ + TILE_SIZE / 2;
				if (parcel.status === "sold") {
					const label = new Sprite(soldLabelMaterial);
					label.position.set(x, 5.2, z);
					label.scale.set(7.2, 1.8, 1);
					label.userData.kind = "sold-label";
					adGroup.add(label);
				}
				const ad = adMap.get(parcel.id);
				if (ad?.is_active && ad.image_path) {
					const adUrl = getAdUrl(ad);
					loader.load(adUrl, (texture) => {
						texture.colorSpace = SRGBColorSpace;
						texture.wrapS = ClampToEdgeWrapping;
						texture.wrapT = ClampToEdgeWrapping;
						const adGeometry = new PlaneGeometry(TILE_SIZE * .92, TILE_SIZE * .92);
						const adMaterial = new MeshBasicMaterial({
							map: texture,
							transparent: true,
							opacity: 1,
							side: 2,
							depthWrite: false,
							depthTest: false
						});
						const adTile = new Mesh(adGeometry, adMaterial);
						adTile.position.set(x, 2.66, z);
						adTile.rotation.x = -Math.PI / 2;
						adTile.userData.kind = "parcel-ad-tile";
						adTile.userData.parcelId = parcel.id;
						adGroup.add(adTile);
					});
				}
			}
			setWorldLoading(false);
			setWorldLoaded(allParcels.length);
			setLocationMessage(city.name + " · 1.000 parsel yüklendi");
		};
		loadAllWorldData().catch((error) => {
			console.error("Parsel Dünyası yüklenemedi:", error);
			setWorldLoading(false);
			setLocationError(error instanceof Error ? error.message : "Parsel Dünyası yüklenemedi.");
			setLocationMessage("Konum/parsel yükleme işlemi tamamlanamadı.");
		});
		const onSelectPointerDown = (event) => {
			pointerDownX = event.clientX;
			pointerDownY = event.clientY;
		};
		const onSelectPointerUp = (event) => {
			if (!parcelMesh) return;
			if (dragMoved || Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY) > 8) {
				dragMoved = false;
				return;
			}
			const rect = renderer.domElement.getBoundingClientRect();
			pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
			pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
			raycaster.setFromCamera(pointer, camera);
			const parcelHit = raycaster.intersectObject(parcelMesh, false)[0];
			if (parcelHit?.instanceId != null) {
				const parcel = parcelMesh.userData.parcels?.[parcelHit.instanceId];
				if (parcel) setSelectedParcel(parcel);
				dragMoved = false;
				return;
			}
			const adHit = adGroup.children.length ? raycaster.intersectObjects(adGroup.children, true).find((item) => item.object.userData.kind === "parcel-ad-tile") : void 0;
			if (adHit) {
				const parcelId = adHit.object.userData.parcelId;
				const parcel = parcelMesh.userData.parcels?.find((item) => item.id === parcelId);
				if (parcel) setSelectedParcel(parcel);
			}
			dragMoved = false;
		};
		renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
		renderer.domElement.addEventListener("pointerdown", onPointerDown);
		renderer.domElement.addEventListener("pointermove", onPointerMove);
		renderer.domElement.addEventListener("pointerup", onPointerUp);
		renderer.domElement.addEventListener("pointercancel", onPointerUp);
		renderer.domElement.addEventListener("pointerdown", onSelectPointerDown);
		renderer.domElement.addEventListener("pointerup", onSelectPointerUp);
		const resize = () => {
			const width = Math.max(mount.clientWidth, 1);
			const height = Math.max(mount.clientHeight, 1);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height);
		};
		window.addEventListener("resize", resize);
		resize();
		let frame = 0;
		const animate = () => {
			frame = requestAnimationFrame(animate);
			if (!dragging && pointers.size === 0 && (Math.abs(velocityX) > inertiaStop || Math.abs(velocityZ) > inertiaStop)) {
				const nextX = MathUtils.clamp(panX + velocityX, -180, maxPanX);
				const nextZ = MathUtils.clamp(panZ + velocityZ, -105, maxPanZ);
				if (nextX === -180 || nextX === maxPanX) velocityX = 0;
				if (nextZ === -105 || nextZ === maxPanZ) velocityZ = 0;
				applyPan(nextX, nextZ);
				velocityX *= friction;
				velocityZ *= friction;
				if (Math.abs(velocityX) <= inertiaStop) velocityX = 0;
				if (Math.abs(velocityZ) <= inertiaStop) velocityZ = 0;
			}
			renderer.render(scene, camera);
		};
		animate();
		return () => {
			cancelAnimationFrame(frame);
			renderer.domElement.removeEventListener("wheel", onWheel);
			renderer.domElement.removeEventListener("pointerdown", onPointerDown);
			renderer.domElement.removeEventListener("pointermove", onPointerMove);
			renderer.domElement.removeEventListener("pointerup", onPointerUp);
			renderer.domElement.removeEventListener("pointercancel", onPointerUp);
			renderer.domElement.removeEventListener("pointerdown", onSelectPointerDown);
			renderer.domElement.removeEventListener("pointerup", onSelectPointerUp);
			window.removeEventListener("resize", resize);
			skyTexture.dispose();
			skyGeometry.dispose();
			skyMaterial.dispose();
			if (parcelMesh) {
				parcelMesh.geometry.dispose();
				parcelMesh.material.dispose();
			}
			parcelGroup.traverse((object) => {
				if (object instanceof Sprite) {
					const material = object.material;
					material.map?.dispose();
					material.dispose();
				}
				if (object instanceof LineSegments && object.geometry !== skyGeometry) {
					object.geometry.dispose();
					object.material.dispose();
				}
			});
			renderer.dispose();
			renderer.domElement.remove();
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "gokyuzu-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: mountRef,
				className: "gokyuzu-canvas",
				"aria-label": "Konuma göre bulunduğunuz ilin 1.000 gerçek gökyüzü parselinden oluşan sürüklenebilir parsel dünyası"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "gokyuzu-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "gokyuzu-kicker",
						children: "MYSKYPARCEL · PARSEL DÜNYASI"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Gökyüzü" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [detectedCity ? detectedCity + " ilindeki 1.000 gerçek gökyüzü parselini keşfet." : "Konumunuza göre yalnızca bulunduğunuz ilin 1.000 gerçek gökyüzü parseli yüklenir.", "Açılışta bu ilin parselleri doğrudan yüklenir; sürüklediğinde yeni veri beklemezsin."] })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "gokyuzu-badge",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sun-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: worldLoading ? worldLoaded.toLocaleString("tr-TR") + " / " + REAL_PARCELS_PER_CITY.toLocaleString("tr-TR") + " YÜKLENİYOR" : detectedCity ? detectedCity.toLocaleUpperCase("tr-TR") + " · " + REAL_PARCELS_PER_CITY.toLocaleString("tr-TR") + " GERÇEK PARSEL" : locationMessage })]
				})]
			}),
			locationError && !worldLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gokyuzu-loading",
				role: "alert",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Konum alınamadı" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: locationError })]
			}),
			worldLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gokyuzu-loading",
				role: "status",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Parsel Dünyası hazırlanıyor" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					locationMessage,
					" ",
					worldLoaded > 0 ? "· " + worldLoaded.toLocaleString("tr-TR") + " / " + REAL_PARCELS_PER_CITY.toLocaleString("tr-TR") : ""
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gokyuzu-controls",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "👆 Parmağınla sürükle" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🖱️ Fareyle sürükle" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "↕️ Yakınlaştır / uzaklaştır" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["▦ ", detectedCity ? detectedCity + " · 1.000 parsel" : "Konuma göre 1.000 parsel"] })
				]
			}),
			selectedParcel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "gokyuzu-parcel-panel",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "gokyuzu-parcel-close",
						onClick: () => setSelectedParcel(null),
						"aria-label": "Parsel panelini kapat",
						children: "×"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "gokyuzu-parcel-kicker",
						children: [
							selectedParcel.city_name ?? "Türkiye",
							" · Katman ",
							selectedParcel.layer_number ?? 1,
							" · Sektör ",
							selectedParcel.sector_number ?? 1
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: ["PARSEL #", selectedParcel.parcel_number] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "gokyuzu-parcel-meta",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: selectedParcel.status === "available" ? "Satın alınabilir" : selectedParcel.status === "sold" ? "Satıldı" : "Rezerve" }), selectedParcel.price != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [selectedParcel.price.toLocaleString("tr-TR"), " TL"] })]
					}),
					selectedAd && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "gokyuzu-ad-card",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "gokyuzu-ad-label",
								children: "PARSEL REKLAMI"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "gokyuzu-ad-save",
								onClick: () => setShowAdInfo((visible) => !visible),
								children: showAdInfo ? "REKLAM BİLGİLERİNİ GİZLE" : "REKLAMA GİT"
							}),
							showAdInfo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: getAdUrl(selectedAd),
									alt: selectedAd.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selectedAd.title }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Bu reklam parsele gömülü olarak yayınlanıyor." }),
								getExternalAdUrl(selectedAd.link_url ?? "") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: getExternalAdUrl(selectedAd.link_url ?? "") ?? void 0,
									target: "_blank",
									rel: "noopener noreferrer",
									children: "WEB SİTESİNE GİT →"
								})
							] })
						]
					}),
					selectedParcel.status === "available" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/parsel-satin-al",
						search: { parcels: selectedParcel.id },
						className: "gokyuzu-buy-button",
						children: "Bu parseli satın al"
					}),
					selectedIsOwner && selectedParcel.status === "sold" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "gokyuzu-ad-editor",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "gokyuzu-ad-editor-title",
								children: "Bu parsele reklam ver"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: adTitle,
								onChange: (event) => setAdTitle(event.target.value),
								maxLength: 120,
								placeholder: "Mağaza / işletme adı",
								"aria-label": "Reklam başlığı"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: adLink,
								onChange: (event) => setAdLink(event.target.value),
								maxLength: 500,
								placeholder: "Web sitesi (isteğe bağlı)",
								"aria-label": "Reklam bağlantısı"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "gokyuzu-ad-file",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: adFile?.name ?? (selectedAd ? "Yeni görsel seç" : "Mağaza görseli seç") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: "image/jpeg,image/png,image/webp,image/gif",
									onChange: (event) => setAdFile(event.target.files?.[0] ?? null)
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => void saveAdvertisement(),
								disabled: adSaving,
								className: "gokyuzu-ad-save",
								children: adSaving ? "YAYINLANIYOR…" : selectedAd ? "REKLAMI GÜNCELLE" : "REKLAMI YAYINLA"
							}),
							selectedAd && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => void removeAdvertisement(),
								disabled: adSaving,
								className: "gokyuzu-ad-remove",
								children: "Reklamı kaldır"
							}),
							adMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "gokyuzu-ad-message",
								children: adMessage
							})
						]
					})
				]
			})
		]
	});
}
//#endregion
export { GokyuzuPage as component };
