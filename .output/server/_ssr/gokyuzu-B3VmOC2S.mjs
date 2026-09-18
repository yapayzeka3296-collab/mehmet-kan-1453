import { i as __toESM } from "../_runtime.mjs";
import { n as supabaseBrowser } from "./supabaseBrowser-BU58SfZL.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import "./router-BuEg6Ys0.mjs";
import { S as Vector3, _ as Scene, a as BufferGeometry, b as TextureLoader, c as LineLoop, d as Mesh, f as MeshBasicMaterial, g as SRGBColorSpace, h as Raycaster, l as MOUSE, m as PlaneGeometry, n as WebGLRenderer, o as Group, p as PerspectiveCamera, s as LineBasicMaterial, t as MapControls, u as MathUtils, v as SphereGeometry, x as Vector2, y as TOUCH } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gokyuzu-B3VmOC2S.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var SKY_IMAGE_URL = "https://cdn.polyhaven.com/asset_img/primary/kloppenheim_03_puresky.png?height=2048";
var CITY_COUNT = 81;
var PARCELS_PER_CITY = 1e6;
var CITY_GRID_SIZE = 1e3;
var CITY_BLOCKS = 9;
var PARCEL_COLUMNS = CITY_BLOCKS * CITY_GRID_SIZE;
var PARCEL_ROWS = CITY_BLOCKS * CITY_GRID_SIZE;
var TOTAL_PARCELS = CITY_COUNT * PARCELS_PER_CITY;
var TILE_SIZE = 10;
var VISIBLE_X = 18;
var VISIBLE_Z = 14;
function logicalParcelNumber(cityIndex, localX, localZ) {
	return cityIndex * PARCELS_PER_CITY + localZ * CITY_GRID_SIZE + localX + 1;
}
function GokyuzuPage() {
	const mountRef = (0, import_react.useRef)(null);
	const [selectedParcel, setSelectedParcel] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const mount = mountRef.current;
		if (!mount) return;
		const scene = new Scene();
		const camera = new PerspectiveCamera(52, Math.max(mount.clientWidth, 1) / Math.max(mount.clientHeight, 1), .1, 2e4);
		const initialWorldX = 200;
		const initialWorldZ = 120;
		camera.position.set(initialWorldX, 32, 154);
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
		const controls = new MapControls(camera, renderer.domElement);
		controls.enableRotate = false;
		controls.enableDamping = true;
		controls.dampingFactor = .08;
		controls.enableZoom = true;
		controls.minDistance = 18;
		controls.maxDistance = 150;
		controls.zoomSpeed = 1.15;
		controls.enablePan = true;
		controls.screenSpacePanning = false;
		controls.panSpeed = 1.15;
		controls.mouseButtons.LEFT = MOUSE.PAN;
		controls.mouseButtons.RIGHT = MOUSE.PAN;
		controls.touches.ONE = TOUCH.PAN;
		controls.touches.TWO = TOUCH.DOLLY_PAN;
		controls.target.set(initialWorldX, 2.5, initialWorldZ);
		controls.update();
		const parcelGroup = new Group();
		scene.add(parcelGroup);
		const realParcelCache = /* @__PURE__ */ new Map();
		let cityNames = [];
		let cityNamesLoaded = false;
		const loadingCities = /* @__PURE__ */ new Set();
		const loadCityParcels = async (cityIndex) => {
			if (cityIndex < 0 || cityIndex >= CITY_COUNT || realParcelCache.has(cityIndex) || loadingCities.has(cityIndex)) return;
			if (!cityNamesLoaded) {
				const result = await supabaseBrowser.from("cities").select("name,code").eq("is_active", true).order("code", { ascending: true });
				if (result.error) throw new Error("İller yüklenemedi: " + result.error.message);
				cityNames = (result.data ?? []).map((city) => city.name);
				cityNamesLoaded = true;
			}
			const cityName = cityNames[cityIndex];
			if (!cityName) return;
			loadingCities.add(cityIndex);
			try {
				const result = await supabaseBrowser.from("parcel_map_public").select("id,parcel_number,status,price,tier,city_name,city_code,layer_number,sector_number,grid_x,grid_y").eq("city_name", cityName).order("grid_y", { ascending: true }).order("grid_x", { ascending: true }).limit(1e3);
				if (result.error) throw new Error(cityName + " parselleri yüklenemedi: " + result.error.message);
				const byGrid = /* @__PURE__ */ new Map();
				for (const parcel of result.data ?? []) {
					if (parcel.grid_x == null || parcel.grid_y == null) continue;
					byGrid.set(parcel.grid_x + ":" + parcel.grid_y, parcel);
				}
				realParcelCache.set(cityIndex, byGrid);
			} finally {
				loadingCities.delete(cityIndex);
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
				opacity: .22,
				side: 2
			}),
			sold: new MeshBasicMaterial({
				color: 16735354,
				transparent: true,
				opacity: .24,
				side: 2
			}),
			reserved: new MeshBasicMaterial({
				color: 16762967,
				transparent: true,
				opacity: .24,
				side: 2
			}),
			other: new MeshBasicMaterial({
				color: 9347256,
				transparent: true,
				opacity: .18,
				side: 2
			})
		};
		for (let i = 0; i < 1073; i += 1) {
			const geometry = new BufferGeometry();
			const line = new LineLoop(geometry, lineMaterial);
			parcelGroup.add(line);
			parcelLines.push(line);
			const mesh = new Mesh(new PlaneGeometry(TILE_SIZE * .92, TILE_SIZE * .92), realParcelMaterials.other);
			mesh.rotation.x = -Math.PI / 2;
			mesh.position.y = 2.2;
			mesh.visible = false;
			parcelGroup.add(mesh);
			parcelMeshes.push(mesh);
		}
		let lastCenterColumn = -1;
		let lastCenterRow = -1;
		const updateVisibleParcels = async () => {
			const centerColumn = Math.floor(controls.target.x / TILE_SIZE);
			const centerRow = Math.floor(controls.target.z / TILE_SIZE);
			if (centerColumn === lastCenterColumn && centerRow === lastCenterRow) return;
			lastCenterColumn = centerColumn;
			lastCenterRow = centerRow;
			const safeColumn = MathUtils.clamp(centerColumn, 0, 8999);
			const safeRow = MathUtils.clamp(centerRow, 0, 8999);
			const minColumn = MathUtils.clamp(safeColumn - VISIBLE_X, 0, 8999);
			const maxColumn = MathUtils.clamp(safeColumn + VISIBLE_X, 0, 8999);
			const minRow = MathUtils.clamp(safeRow - VISIBLE_Z, 0, 8999);
			const maxRow = MathUtils.clamp(safeRow + VISIBLE_Z, 0, 8999);
			const minCityX = Math.floor(minColumn / CITY_GRID_SIZE);
			const maxCityX = Math.floor(maxColumn / CITY_GRID_SIZE);
			const minCityZ = Math.floor(minRow / CITY_GRID_SIZE);
			const maxCityZ = Math.floor(maxRow / CITY_GRID_SIZE);
			const citiesToLoad = [];
			for (let cityZ = minCityZ; cityZ <= maxCityZ; cityZ += 1) for (let cityX = minCityX; cityX <= maxCityX; cityX += 1) citiesToLoad.push(cityZ * CITY_BLOCKS + cityX);
			await Promise.all(citiesToLoad.map((cityIndex) => loadCityParcels(cityIndex)));
			let index = 0;
			for (let dz = -14; dz <= VISIBLE_Z; dz += 1) for (let dx = -18; dx <= VISIBLE_X; dx += 1) {
				const column = centerColumn + dx;
				const row = centerRow + dz;
				const line = parcelLines[index++];
				if (column < 0 || column >= PARCEL_COLUMNS || row < 0 || row >= PARCEL_ROWS) {
					line.visible = false;
					parcelMeshes[index - 1].visible = false;
					continue;
				}
				const x = column * TILE_SIZE;
				const z = row * TILE_SIZE;
				const cityX = Math.floor(column / CITY_GRID_SIZE);
				const cityZ = Math.floor(row / CITY_GRID_SIZE);
				const cityIndex = cityZ * CITY_BLOCKS + cityX;
				const localX = column - cityX * CITY_GRID_SIZE;
				const localZ = row - cityZ * CITY_GRID_SIZE;
				const realParcel = realParcelCache.get(cityIndex)?.get(localX + ":" + localZ);
				const y = realParcel ? 2.5 : 2.15;
				const points = [
					new Vector3(x, y, z),
					new Vector3(x + TILE_SIZE, y, z),
					new Vector3(x + TILE_SIZE, y, z + TILE_SIZE),
					new Vector3(x, y, z + TILE_SIZE)
				];
				line.geometry.dispose();
				line.geometry = new BufferGeometry().setFromPoints(points);
				line.visible = true;
				line.position.set(0, 0, 0);
				line.userData.parcelNumber = realParcel?.parcel_number ?? logicalParcelNumber(cityIndex, localX, localZ);
				line.userData.column = column;
				line.userData.row = row;
				line.userData.parcel = realParcel ?? null;
				const mesh = parcelMeshes[index - 1];
				mesh.visible = Boolean(realParcel);
				mesh.position.set(x + TILE_SIZE / 2, y + .08, z + TILE_SIZE / 2);
				mesh.rotation.x = -Math.PI / 2;
				if (realParcel) {
					const status = realParcel.status === "sold" ? "sold" : realParcel.status === "reserved" ? "reserved" : realParcel.status === "available" ? "available" : "other";
					mesh.material = realParcelMaterials[status];
					mesh.userData.parcel = realParcel;
				} else mesh.userData.parcel = null;
			}
		};
		updateVisibleParcels();
		const clampTarget = () => {
			const halfX = TILE_SIZE / 2;
			const halfZ = TILE_SIZE / 2;
			const minX = halfX;
			const maxX = 89995;
			const minZ = halfZ;
			const maxZ = 89995;
			const oldX = controls.target.x;
			const oldZ = controls.target.z;
			controls.target.x = MathUtils.clamp(controls.target.x, minX, maxX);
			controls.target.z = MathUtils.clamp(controls.target.z, minZ, maxZ);
			controls.target.y = 2.5;
			const dx = controls.target.x - oldX;
			const dz = controls.target.z - oldZ;
			if (dx !== 0 || dz !== 0) {
				camera.position.x += dx;
				camera.position.z += dz;
			}
		};
		const onControlsChange = () => {
			clampTarget();
			updateVisibleParcels();
		};
		controls.addEventListener("change", onControlsChange);
		const onControlsStart = () => {
			renderer.domElement.style.cursor = "grabbing";
		};
		const onControlsEnd = () => {
			renderer.domElement.style.cursor = "grab";
		};
		controls.addEventListener("start", onControlsStart);
		controls.addEventListener("end", onControlsEnd);
		const raycaster = new Raycaster();
		raycaster.params.Line.threshold = 2.5;
		const pointer = new Vector2();
		let pointerDownX = 0;
		let pointerDownY = 0;
		const onPointerDown = (event) => {
			pointerDownX = event.clientX;
			pointerDownY = event.clientY;
		};
		const onPointerUp = (event) => {
			if (Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY) > 8) return;
			const rect = renderer.domElement.getBoundingClientRect();
			pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
			pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
			raycaster.setFromCamera(pointer, camera);
			const realMeshes = parcelMeshes.filter((mesh) => mesh.visible);
			const meshHit = raycaster.intersectObjects(realMeshes, false)[0];
			const lineHit = raycaster.intersectObjects(parcelLines.filter((line) => line.visible), false)[0];
			const parcel = (meshHit ?? lineHit)?.object?.userData?.parcel;
			if (parcel) setSelectedParcel(parcel);
		};
		renderer.domElement.addEventListener("pointerdown", onPointerDown);
		renderer.domElement.addEventListener("pointerup", onPointerUp);
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
		let motionTime = 0;
		const animate = () => {
			frame = requestAnimationFrame(animate);
			motionTime += .012;
			parcelGroup.rotation.set(0, 0, 0);
			parcelGroup.position.set(0, 0, 0);
			for (const line of parcelLines) {
				if (!line.visible) continue;
				const column = Number(line.userData.column ?? 0);
				const row = Number(line.userData.row ?? 0);
				const wave = Math.sin(motionTime * .9 + column * .07 + row * .05) * .65;
				const secondaryWave = Math.sin(motionTime * .45 + column * .025 - row * .035) * .18;
				line.position.y = wave + secondaryWave;
			}
			controls.update();
			renderer.render(scene, camera);
		};
		animate();
		return () => {
			cancelAnimationFrame(frame);
			controls.removeEventListener("change", onControlsChange);
			controls.removeEventListener("start", onControlsStart);
			controls.removeEventListener("end", onControlsEnd);
			renderer.domElement.removeEventListener("pointerdown", onPointerDown);
			renderer.domElement.removeEventListener("pointerup", onPointerUp);
			controls.dispose();
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "81 milyonluk sanal gökyüzünde gerçek MySkyParcel parsellerini keşfet. Parmağınla veya farenle sürükledikçe yalnızca gerekli bölge yüklenir." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "gokyuzu-badge",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sun-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [TOTAL_PARCELS.toLocaleString("tr-TR"), " SANAL PARSEL"] })]
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
