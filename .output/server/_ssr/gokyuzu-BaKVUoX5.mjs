import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import "./router-DocpxnRf.mjs";
import { _ as TOUCH, a as BufferGeometry, c as LineLoop, d as Mesh, f as MeshBasicMaterial, g as SphereGeometry, h as Scene, l as MOUSE, m as SRGBColorSpace, n as WebGLRenderer, o as Group, p as PerspectiveCamera, s as LineBasicMaterial, t as MapControls, u as MathUtils, v as TextureLoader, y as Vector3 } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gokyuzu-BaKVUoX5.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var SKY_IMAGE_URL = "https://cdn.polyhaven.com/asset_img/primary/kloppenheim_03_puresky.png?height=2048";
var PARCEL_COLUMNS = 360;
var PARCEL_ROWS = 225;
var TOTAL_PARCELS = PARCEL_COLUMNS * PARCEL_ROWS;
var TILE_SIZE = 10;
var VISIBLE_X = 18;
var VISIBLE_Z = 14;
function parcelNumber(column, row) {
	return row * PARCEL_COLUMNS + column + 1;
}
function GokyuzuPage() {
	const mountRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const mount = mountRef.current;
		if (!mount) return;
		const scene = new Scene();
		const camera = new PerspectiveCamera(52, Math.max(mount.clientWidth, 1) / Math.max(mount.clientHeight, 1), .1, 2e4);
		const worldCenterX = 359 * TILE_SIZE / 2;
		const worldCenterZ = 1120;
		camera.position.set(worldCenterX, 32, 1154);
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
		controls.target.set(worldCenterX, 0, worldCenterZ);
		controls.update();
		const parcelGroup = new Group();
		scene.add(parcelGroup);
		const lineMaterial = new LineBasicMaterial({
			color: 16777215,
			transparent: true,
			opacity: .92,
			depthWrite: false,
			depthTest: false
		});
		const parcelLines = [];
		for (let i = 0; i < 1073; i += 1) {
			const geometry = new BufferGeometry();
			const line = new LineLoop(geometry, lineMaterial);
			parcelGroup.add(line);
			parcelLines.push(line);
		}
		let lastCenterColumn = -1;
		let lastCenterRow = -1;
		const updateVisibleParcels = () => {
			const centerColumn = Math.floor(controls.target.x / TILE_SIZE);
			const centerRow = Math.floor(controls.target.z / TILE_SIZE);
			if (centerColumn === lastCenterColumn && centerRow === lastCenterRow) return;
			lastCenterColumn = centerColumn;
			lastCenterRow = centerRow;
			let index = 0;
			for (let dz = -14; dz <= VISIBLE_Z; dz += 1) for (let dx = -18; dx <= VISIBLE_X; dx += 1) {
				const column = centerColumn + dx;
				const row = centerRow + dz;
				const line = parcelLines[index++];
				if (column < 0 || column >= PARCEL_COLUMNS || row < 0 || row >= PARCEL_ROWS) {
					line.visible = false;
					continue;
				}
				const x = column * TILE_SIZE;
				const z = row * TILE_SIZE;
				const y = 2.5;
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
				line.userData.parcelNumber = parcelNumber(column, row);
				line.userData.column = column;
				line.userData.row = row;
			}
		};
		updateVisibleParcels();
		const clampTarget = () => {
			const halfX = TILE_SIZE / 2;
			const halfZ = TILE_SIZE / 2;
			const minX = halfX;
			const maxX = 3595;
			const minZ = halfZ;
			const maxZ = 2245;
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
			parcelGroup.rotation.x = -.035 + Math.sin(motionTime * .55) * .008;
			parcelGroup.position.y = Math.sin(motionTime * .8) * .35;
			for (const line of parcelLines) {
				if (!line.visible) continue;
				const column = Number(line.userData.column ?? 0);
				const row = Number(line.userData.row ?? 0);
				const wave = Math.sin(motionTime * .9 + column * .07 + row * .05) * .035;
				line.position.y = wave;
			}
			renderer.render(scene, camera);
		};
		animate();
		return () => {
			cancelAnimationFrame(frame);
			controls.removeEventListener("change", onControlsChange);
			controls.dispose();
			window.removeEventListener("resize", resize);
			skyTexture.dispose();
			skyGeometry.dispose();
			skyMaterial.dispose();
			lineMaterial.dispose();
			parcelLines.forEach((line) => line.geometry.dispose());
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "81.000 parseli gökyüzünde keşfet. Parmağınla veya farenle sürükledikçe yeni parseller görünür." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "gokyuzu-badge",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sun-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [TOTAL_PARCELS.toLocaleString("tr-TR"), " PARSEL"] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gokyuzu-controls",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "👆 Parmağınla sürükle" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🖱️ Fareyle sürükle" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "↕️ Yakınlaştır / uzaklaştır" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "▦ Sürükledikçe yeni parseller" })
				]
			})
		]
	});
}
//#endregion
export { GokyuzuPage as component };
