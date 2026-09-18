import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { s as supabaseBrowser } from "./router-BT2yK_uz.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as TextureLoader, a as Group, c as MathUtils, d as PerspectiveCamera, f as PlaneGeometry, g as SphereGeometry, h as Scene, i as BufferGeometry, l as Mesh, m as SRGBColorSpace, o as LineBasicMaterial, p as Raycaster, s as LineLoop, t as WebGLRenderer, u as MeshBasicMaterial, v as Vector2, y as Vector3 } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gokyuzu-DMkm_iDk.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var SKY_IMAGE_URL = "https://cdn.polyhaven.com/asset_img/primary/kloppenheim_03_puresky.png?height=2048";
var CITY_COUNT = 81;
var REAL_PARCELS_PER_CITY = 1e3;
var CITY_GRID_WIDTH = 40;
var CITY_GRID_HEIGHT = 25;
var CITY_BLOCKS = 9;
var PARCEL_COLUMNS = 360;
var PARCEL_ROWS = 225;
var REAL_PARCEL_COUNT = CITY_COUNT * REAL_PARCELS_PER_CITY;
var TOTAL_PARCELS = 81e6;
var TILE_SIZE = 10;
var VISIBLE_X = 18;
var VISIBLE_Z = 14;
function GokyuzuPage() {
	const mountRef = (0, import_react.useRef)(null);
	const [selectedParcel, setSelectedParcel] = (0, import_react.useState)(null);
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
		camera.position.set(0, 32, 34);
		camera.lookAt(cameraTarget);
		const parcelGroup = new Group();
		scene.add(parcelGroup);
		const specialProvinceNumbers = {
			ANK: 6,
			ANT: 7,
			BUR: 16,
			GZT: 27,
			IST: 34,
			IZM: 35,
			KAY: 38
		};
		let cities = [];
		let citiesLoaded = false;
		const loadCities = async () => {
			if (citiesLoaded) return cities;
			const result = await supabaseBrowser.from("cities").select("name,code").eq("is_active", true);
			if (result.error) throw new Error("İller yüklenemedi: " + result.error.message);
			cities = (result.data ?? []).map((city) => {
				const numericCode = Number(city.code);
				const provinceNumber = specialProvinceNumbers[city.code] ?? (Number.isFinite(numericCode) ? numericCode : NaN);
				return {
					name: city.name,
					code: city.code,
					provinceNumber
				};
			}).filter((city) => Number.isInteger(city.provinceNumber) && city.provinceNumber >= 1 && city.provinceNumber <= CITY_COUNT).sort((a, b) => a.provinceNumber - b.provinceNumber);
			const provinceNumbers = new Set(cities.map((city) => city.provinceNumber));
			if (cities.length !== CITY_COUNT || provinceNumbers.size !== CITY_COUNT) throw new Error(`81 il eşleştirmesi tamamlanamadı: ${cities.length} aktif il bulundu.`);
			citiesLoaded = true;
			return cities;
		};
		const getCityDefinition = (cityIndex) => cities[cityIndex];
		let centerColumn = 20;
		let centerRow = 12;
		let visualOffsetX = 0;
		let visualOffsetZ = 0;
		let rotationY = 0;
		let rotationX = 0;
		const setZoom = (distance) => {
			const clamped = MathUtils.clamp(distance, 18, 120);
			camera.position.y = MathUtils.clamp(clamped * .9, 14, 90);
			camera.position.z = clamped;
			camera.lookAt(cameraTarget);
		};
		let dragging = false;
		let lastPointerX = 0;
		let lastPointerY = 0;
		let dragMoved = false;
		const pointers = /* @__PURE__ */ new Map();
		let pinchDistance = null;
		const shiftLogicalCenter = (axis, delta) => {
			if (axis === "x") centerColumn = MathUtils.clamp(centerColumn + delta, 0, 359);
			else centerRow = MathUtils.clamp(centerRow + delta, 0, 224);
		};
		const applyVisualDrag = (dx, dy) => {
			visualOffsetX += dx * .08;
			visualOffsetZ += dy * .08;
			while (Math.abs(visualOffsetX) >= TILE_SIZE) {
				const step = visualOffsetX > 0 ? -1 : 1;
				shiftLogicalCenter("x", step);
				visualOffsetX += step * TILE_SIZE;
			}
			while (Math.abs(visualOffsetZ) >= TILE_SIZE) {
				const step = visualOffsetZ > 0 ? -1 : 1;
				shiftLogicalCenter("z", step);
				visualOffsetZ += step * TILE_SIZE;
			}
			rotationY = MathUtils.clamp(rotationY + dx * .0025, -.65, .65);
			rotationX = MathUtils.clamp(rotationX + dy * .0018, -.38, .38);
			parcelGroup.rotation.y = rotationY;
			parcelGroup.rotation.x = rotationX;
			updateVisibleParcels();
		};
		const onWheel = (event) => {
			event.preventDefault();
			event.stopPropagation();
			const current = Math.max(18, camera.position.z);
			setZoom(current + MathUtils.clamp(event.deltaY, -160, 160) * .08);
		};
		const onPointerDown = (event) => {
			event.preventDefault();
			event.stopPropagation();
			pointers.set(event.pointerId, {
				x: event.clientX,
				y: event.clientY
			});
			try {
				renderer.domElement.setPointerCapture(event.pointerId);
			} catch {}
			if (pointers.size === 2) {
				const [a, b] = [...pointers.values()];
				pinchDistance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
				dragging = false;
				return;
			}
			dragging = true;
			dragMoved = false;
			lastPointerX = event.clientX;
			lastPointerY = event.clientY;
			renderer.domElement.style.cursor = "grabbing";
		};
		let hoveredParcelMesh = null;
		const clearHover = () => {
			if (!hoveredParcelMesh) return;
			hoveredParcelMesh.scale.set(1, 1, 1);
			hoveredParcelMesh = null;
			renderer.domElement.style.cursor = dragging ? "grabbing" : "grab";
		};
		const updateHover = (event) => {
			if (dragging || pointers.size > 1) {
				clearHover();
				return;
			}
			const rect = renderer.domElement.getBoundingClientRect();
			pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
			pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
			raycaster.setFromCamera(pointer, camera);
			const hit = raycaster.intersectObject(parcelGroup, true).find((entry) => {
				let object = entry.object;
				while (object && object !== parcelGroup) {
					if (object.userData?.parcel) return true;
					object = object.parent;
				}
				return false;
			});
			let next = null;
			if (hit) {
				let object = hit.object;
				while (object && object !== parcelGroup) {
					if (object.userData?.parcel && object instanceof Mesh) {
						next = object;
						break;
					}
					object = object.parent;
				}
			}
			if (next !== hoveredParcelMesh) {
				if (hoveredParcelMesh) {
					hoveredParcelMesh.scale.set(1, 1, 1);
					hoveredParcelMesh.renderOrder = 0;
				}
				hoveredParcelMesh = next;
				if (hoveredParcelMesh) {
					hoveredParcelMesh.scale.set(1.12, 1.12, 1.12);
					hoveredParcelMesh.renderOrder = 20;
					renderer.domElement.style.cursor = "pointer";
				} else renderer.domElement.style.cursor = "grab";
			}
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
			if (pointers.size === 2 && pinchDistance) {
				const [a, b] = [...pointers.values()];
				const distance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
				const current = Math.max(18, camera.position.z);
				setZoom(current / (distance / pinchDistance));
				pinchDistance = distance;
				clearHover();
				pinchDistance = distance;
				return;
			}
			if (!dragging) {
				updateHover(event);
				return;
			}
			clearHover();
			const dx = event.clientX - lastPointerX;
			const dy = event.clientY - lastPointerY;
			if (Math.hypot(dx, dy) > 1) dragMoved = true;
			lastPointerX = event.clientX;
			lastPointerY = event.clientY;
			applyVisualDrag(dx, dy);
		};
		const onPointerUp = (event) => {
			pointers.delete(event.pointerId);
			if (pointers.size < 2) pinchDistance = null;
			dragging = pointers.size === 1;
			if (dragging) {
				const remaining = [...pointers.values()][0];
				lastPointerX = remaining.x;
				lastPointerY = remaining.y;
			} else renderer.domElement.style.cursor = "grab";
			try {
				renderer.domElement.releasePointerCapture(event.pointerId);
			} catch {}
		};
		renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
		renderer.domElement.addEventListener("pointerdown", onPointerDown);
		renderer.domElement.addEventListener("pointermove", onPointerMove);
		renderer.domElement.addEventListener("pointerup", onPointerUp);
		renderer.domElement.addEventListener("pointercancel", onPointerUp);
		const parcelCache = /* @__PURE__ */ new Map();
		const loadedRanges = /* @__PURE__ */ new Set();
		const loadingRanges = /* @__PURE__ */ new Set();
		const loadCityParcels = async (cityIndex, minX, maxX, minY, maxY) => {
			const city = getCityDefinition(cityIndex);
			if (!city) return;
			const key = [
				cityIndex,
				MathUtils.clamp(Math.floor(minX), 0, 39),
				MathUtils.clamp(Math.floor(maxX), 0, 39),
				MathUtils.clamp(Math.floor(minY), 0, 24),
				MathUtils.clamp(Math.floor(maxY), 0, 24)
			].join(":");
			if (loadedRanges.has(key) || loadingRanges.has(key)) return;
			loadingRanges.add(key);
			try {
				const safeMinX = MathUtils.clamp(Math.floor(minX), 0, 39);
				const safeMaxX = MathUtils.clamp(Math.floor(maxX), 0, 39);
				const safeMinY = MathUtils.clamp(Math.floor(minY), 0, 24);
				const safeMaxY = MathUtils.clamp(Math.floor(maxY), 0, 24);
				const result = await supabaseBrowser.from("parcel_map_public").select("id,parcel_number,status,price,tier,city_name,city_code,layer_number,sector_number,grid_x,grid_y").eq("city_name", city.name).gte("grid_x", safeMinX).lte("grid_x", safeMaxX).gte("grid_y", safeMinY).lte("grid_y", safeMaxY).order("grid_y", { ascending: true }).order("grid_x", { ascending: true });
				if (result.error) throw new Error(`Şehir ${city.name} parselleri yüklenemedi: ${result.error.message}`);
				const cityCache = parcelCache.get(cityIndex) ?? /* @__PURE__ */ new Map();
				for (const parcel of result.data ?? []) {
					if (parcel.grid_x == null || parcel.grid_y == null) continue;
					cityCache.set(parcel.grid_x + ":" + parcel.grid_y, parcel);
				}
				parcelCache.set(cityIndex, cityCache);
				loadedRanges.add(key);
			} finally {
				loadingRanges.delete(key);
			}
		};
		const lineMaterial = new LineBasicMaterial({
			color: 16765286,
			transparent: true,
			opacity: 1,
			depthWrite: false,
			depthTest: false
		});
		const parcelLines = [];
		const parcelMeshes = [];
		const realParcelMaterials = {
			available: new MeshBasicMaterial({
				color: 3073702,
				transparent: true,
				opacity: .72,
				side: 2,
				depthWrite: false,
				depthTest: false
			}),
			sold: new MeshBasicMaterial({
				color: 16735354,
				transparent: true,
				opacity: .48,
				side: 2,
				depthWrite: false,
				depthTest: false
			}),
			reserved: new MeshBasicMaterial({
				color: 16762967,
				transparent: true,
				opacity: .76,
				side: 2,
				depthWrite: false,
				depthTest: false
			}),
			other: new MeshBasicMaterial({
				color: 9347256,
				transparent: true,
				opacity: .58,
				side: 2,
				depthWrite: false,
				depthTest: false
			})
		};
		const pooledCount = 1073;
		for (let i = 0; i < pooledCount; i += 1) {
			const geometry = new BufferGeometry();
			const line = new LineLoop(geometry, lineMaterial);
			parcelGroup.add(line);
			parcelLines.push(line);
			const mesh = new Mesh(new PlaneGeometry(TILE_SIZE * .92, TILE_SIZE * .92), realParcelMaterials.other);
			mesh.rotation.x = -Math.PI / 2;
			mesh.position.y = 2.65;
			mesh.visible = false;
			parcelGroup.add(mesh);
			parcelMeshes.push(mesh);
		}
		let visibleUpdateId = 0;
		let lastRenderedCenter = "";
		let updateQueued = false;
		const renderVisibleWindow = () => {
			const center = centerColumn + ":" + centerRow;
			if (center === lastRenderedCenter) {
				parcelGroup.position.x = visualOffsetX;
				parcelGroup.position.z = visualOffsetZ;
				return;
			}
			lastRenderedCenter = center;
			parcelGroup.position.x = visualOffsetX;
			parcelGroup.position.z = visualOffsetZ;
			let index = 0;
			for (let dz = -14; dz <= VISIBLE_Z; dz += 1) for (let dx = -18; dx <= VISIBLE_X; dx += 1) {
				const column = centerColumn + dx;
				const row = centerRow + dz;
				const line = parcelLines[index];
				const mesh = parcelMeshes[index];
				index += 1;
				if (column < 0 || column >= PARCEL_COLUMNS || row < 0 || row >= PARCEL_ROWS) {
					line.visible = false;
					mesh.visible = false;
					continue;
				}
				const x = dx * TILE_SIZE;
				const z = dz * TILE_SIZE;
				const cityX = Math.floor(column / CITY_GRID_WIDTH);
				const cityZ = Math.floor(row / CITY_GRID_HEIGHT);
				const cityIndex = cityZ * CITY_BLOCKS + cityX;
				const localX = column - cityX * CITY_GRID_WIDTH;
				const localZ = row - cityZ * CITY_GRID_HEIGHT;
				const realParcel = parcelCache.get(cityIndex)?.get(localX + ":" + localZ);
				const y = realParcel ? 2.5 : 2.15;
				line.geometry.dispose();
				line.geometry = new BufferGeometry().setFromPoints([
					new Vector3(x, y, z),
					new Vector3(x + TILE_SIZE, y, z),
					new Vector3(x + TILE_SIZE, y, z + TILE_SIZE),
					new Vector3(x, y, z + TILE_SIZE)
				]);
				line.visible = true;
				line.userData.parcel = realParcel ?? null;
				line.userData.parcelNumber = realParcel?.parcel_number ?? null;
				line.userData.worldColumn = column;
				line.userData.worldRow = row;
				mesh.position.set(x + TILE_SIZE / 2, y + .42, z + TILE_SIZE / 2);
				mesh.visible = Boolean(realParcel);
				mesh.userData.parcel = realParcel ?? null;
				if (realParcel) {
					const status = realParcel.status === "sold" ? "sold" : realParcel.status === "reserved" ? "reserved" : realParcel.status === "available" ? "available" : "other";
					mesh.material = realParcelMaterials[status];
				}
			}
		};
		const updateVisibleParcels = async () => {
			if (updateQueued) return;
			updateQueued = true;
			updateQueued = false;
			renderVisibleWindow();
			const updateId = ++visibleUpdateId;
			try {
				const definitions = await loadCities();
				const minColumn = MathUtils.clamp(centerColumn - VISIBLE_X, 0, 359);
				const maxColumn = MathUtils.clamp(centerColumn + VISIBLE_X, 0, 359);
				const minRow = MathUtils.clamp(centerRow - VISIBLE_Z, 0, 224);
				const maxRow = MathUtils.clamp(centerRow + VISIBLE_Z, 0, 224);
				const tasks = [];
				const minCityX = Math.floor(minColumn / CITY_GRID_WIDTH);
				const maxCityX = Math.floor(maxColumn / CITY_GRID_WIDTH);
				const minCityZ = Math.floor(minRow / CITY_GRID_HEIGHT);
				const maxCityZ = Math.floor(maxRow / CITY_GRID_HEIGHT);
				for (let cityZ = minCityZ; cityZ <= maxCityZ; cityZ += 1) for (let cityX = minCityX; cityX <= maxCityX; cityX += 1) {
					const cityIndex = cityZ * CITY_BLOCKS + cityX;
					if (!definitions[cityIndex]) continue;
					const cityMinColumn = cityX * CITY_GRID_WIDTH;
					const cityMinRow = cityZ * CITY_GRID_HEIGHT;
					const localMinX = Math.max(0, minColumn - cityMinColumn);
					const localMaxX = Math.min(39, maxColumn - cityMinColumn);
					const localMinY = Math.max(0, minRow - cityMinRow);
					const localMaxY = Math.min(24, maxRow - cityMinRow);
					tasks.push(loadCityParcels(cityIndex, localMinX, localMaxX, localMinY, localMaxY));
				}
				await Promise.all(tasks);
				if (updateId !== visibleUpdateId) return;
				renderVisibleWindow();
			} catch (error) {
				console.error("Gökyüzü parselleri yüklenemedi:", error);
			}
		};
		updateVisibleParcels();
		const raycaster = new Raycaster();
		raycaster.params.Line.threshold = 2.5;
		const pointer = new Vector2();
		let pointerDownX = 0;
		let pointerDownY = 0;
		const onSelectPointerDown = (event) => {
			pointerDownX = event.clientX;
			pointerDownY = event.clientY;
		};
		const onSelectPointerUp = (event) => {
			if (dragMoved || Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY) > 8) {
				dragMoved = false;
				return;
			}
			const rect = renderer.domElement.getBoundingClientRect();
			pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
			pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
			raycaster.setFromCamera(pointer, camera);
			const hit = raycaster.intersectObject(parcelGroup, true).find((entry) => {
				let object = entry.object;
				while (object && object !== parcelGroup) {
					if (object.userData?.parcel) return true;
					object = object.parent;
				}
				return false;
			});
			let parcel = null;
			if (hit) {
				let object = hit.object;
				while (object && object !== parcelGroup) {
					if (object.userData?.parcel) {
						parcel = object.userData.parcel;
						break;
					}
					object = object.parent;
				}
			}
			if (parcel) setSelectedParcel(parcel);
			dragMoved = false;
		};
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
			lineMaterial.dispose();
			Object.values(realParcelMaterials).forEach((material) => material.dispose());
			parcelLines.forEach((line) => line.geometry.dispose());
			parcelMeshes.forEach((mesh) => mesh.geometry.dispose());
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
				"aria-label": "81 bin gökyüzü parselinden oluşan sürüklenebilir parsel dünyası"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "gokyuzu-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "gokyuzu-kicker",
						children: "MYSKYPARCEL · PARSEL DÜNYASI"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Gökyüzü" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "81 milyonluk MySkyParcel evreninin şu anki 81.000 gerçek parselini keşfet. Her kare, Supabase'deki tekil bir gerçek parsele bağlanır." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "gokyuzu-badge",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sun-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						REAL_PARCEL_COUNT.toLocaleString("tr-TR"),
						" GERÇEK PARSEL · ",
						TOTAL_PARCELS.toLocaleString("tr-TR"),
						" HEDEF"
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gokyuzu-controls",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "👆 Parmağınla sürükle" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🖱️ Fareyle sürükle" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "↕️ Yakınlaştır / uzaklaştır" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "▦ Gerçek Supabase parselleri" })
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
					selectedParcel.status === "available" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/parsel-satin-al",
						search: { parcels: selectedParcel.id },
						className: "gokyuzu-buy-button",
						children: "Bu parseli satın al"
					})
				]
			})
		]
	});
}
//#endregion
export { GokyuzuPage as component };
