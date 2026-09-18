import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import "./router-VVTGH2dr.mjs";
import { a as GridHelper, c as LineBasicMaterial, d as PerspectiveCamera, f as SRGBColorSpace, g as Vector3, h as TextureLoader, i as BufferGeometry, l as Mesh, m as SphereGeometry, o as Group, p as Scene, s as Line, t as WebGLRenderer, u as MeshBasicMaterial } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gokyuzu-9-dkV55v.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var SKY_IMAGE_URL = "https://cdn.polyhaven.com/asset_img/primary/kloppenheim_03_puresky.png?height=2048";
function GokyuzuPage() {
	const mountRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const mount = mountRef.current;
		if (!mount) return;
		const scene = new Scene();
		const camera = new PerspectiveCamera(55, Math.max(mount.clientWidth, 1) / Math.max(mount.clientHeight, 1), .1, 2e4);
		camera.position.set(0, 32, 34);
		camera.lookAt(0, 0, -8);
		const renderer = new WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: "high-performance"
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
		renderer.setSize(mount.clientWidth, mount.clientHeight);
		renderer.outputColorSpace = SRGBColorSpace;
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
		const grid = new GridHelper(200, 20, 16777215, 16777215);
		grid.position.set(0, 0, -40);
		grid.material.transparent = true;
		grid.material.opacity = .42;
		scene.add(grid);
		const gridGroup = new Group();
		scene.add(gridGroup);
		const tileSize = 10;
		const tileCount = 12;
		const lines = new LineBasicMaterial({
			color: 16777215,
			transparent: true,
			opacity: .48
		});
		const buildTile = (x, z) => {
			const points = [
				new Vector3(x, .05, z),
				new Vector3(x + tileSize, .05, z),
				new Vector3(x + tileSize, .05, z + tileSize),
				new Vector3(x, .05, z + tileSize),
				new Vector3(x, .05, z)
			];
			const geometry = new BufferGeometry().setFromPoints(points);
			const line = new Line(geometry, lines);
			gridGroup.add(line);
		};
		for (let ix = -12; ix < tileCount; ix += 1) for (let iz = -12; iz < tileCount; iz += 1) buildTile(ix * tileSize, iz * tileSize);
		let dragging = false;
		let lastX = 0;
		let lastY = 0;
		const onPointerDown = (event) => {
			event.preventDefault();
			dragging = true;
			lastX = event.clientX;
			lastY = event.clientY;
			renderer.domElement.style.cursor = "grabbing";
			renderer.domElement.setPointerCapture(event.pointerId);
		};
		const onPointerMove = (event) => {
			if (!dragging) return;
			event.preventDefault();
			const dx = event.clientX - lastX;
			const dy = event.clientY - lastY;
			lastX = event.clientX;
			lastY = event.clientY;
			const moveX = dx * .28;
			const moveZ = dy * .28;
			gridGroup.position.x += moveX;
			gridGroup.position.z += moveZ;
			grid.position.x += moveX;
			grid.position.z += moveZ;
			if (Math.abs(gridGroup.position.x) >= tileSize) {
				const steps = Math.trunc(gridGroup.position.x / tileSize);
				gridGroup.position.x -= steps * tileSize;
				grid.position.x -= steps * tileSize;
			}
			if (Math.abs(gridGroup.position.z) >= tileSize) {
				const steps = Math.trunc(gridGroup.position.z / tileSize);
				gridGroup.position.z -= steps * tileSize;
				grid.position.z -= steps * tileSize;
			}
		};
		const onPointerUp = (event) => {
			dragging = false;
			renderer.domElement.style.cursor = "grab";
			if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId);
		};
		renderer.domElement.addEventListener("pointerdown", onPointerDown);
		renderer.domElement.addEventListener("pointermove", onPointerMove);
		renderer.domElement.addEventListener("pointerup", onPointerUp);
		renderer.domElement.addEventListener("pointercancel", onPointerUp);
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
			window.removeEventListener("resize", resize);
			renderer.domElement.removeEventListener("pointerdown", onPointerDown);
			renderer.domElement.removeEventListener("pointermove", onPointerMove);
			renderer.domElement.removeEventListener("pointerup", onPointerUp);
			renderer.domElement.removeEventListener("pointercancel", onPointerUp);
			window.removeEventListener("resize", resize);
			skyTexture.dispose();
			skyGeometry.dispose();
			skyMaterial.dispose();
			grid.geometry.dispose();
			grid.material.dispose();
			gridGroup.children.forEach((child) => {
				child.geometry.dispose();
			});
			lines.dispose();
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
				"aria-label": "Parsel Dünyası sonsuz gökyüzü parsel ızgarası"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "gokyuzu-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "gokyuzu-kicker",
						children: "MYSKYPARCEL · PARSEL DÜNYASI"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Gökyüzü" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Gökyüzünde sonsuz parsel ızgarasını keşfet." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "gokyuzu-badge",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sun-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sonsuz parsel görünümü" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gokyuzu-controls",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "👆 Sürükle: parsel dünyasını hareket ettir" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "▦ Yeni kareler görünür" })]
			})
		]
	});
}
//#endregion
export { GokyuzuPage as component };
