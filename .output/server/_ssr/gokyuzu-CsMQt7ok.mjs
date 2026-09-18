import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import "./router-uo8HErPc.mjs";
import { a as ClampToEdgeWrapping, c as Mesh, d as RepeatWrapping, f as SRGBColorSpace, g as TextureLoader, h as TOUCH, l as MeshBasicMaterial, m as SphereGeometry, n as WebGLRenderer, o as LoadingManager, p as Scene, s as MOUSE, t as OrbitControls, u as PerspectiveCamera } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gokyuzu-CsMQt7ok.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var SKY_IMAGE_URL = "https://cdn.polyhaven.com/asset_img/primary/kloppenheim_03_puresky.png?height=2048";
function GokyuzuPage() {
	const mountRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const mount = mountRef.current;
		if (!mount) return;
		const scene = new Scene();
		const camera = new PerspectiveCamera(68, Math.max(mount.clientWidth, 1) / Math.max(mount.clientHeight, 1), .01, 2e4);
		camera.position.set(0, 0, .01);
		const renderer = new WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: "high-performance"
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
		renderer.setSize(mount.clientWidth, mount.clientHeight);
		renderer.outputColorSpace = SRGBColorSpace;
		renderer.setClearColor(0, 0);
		mount.appendChild(renderer.domElement);
		const loadingManager = new LoadingManager();
		loadingManager.onLoad = () => mount.classList.add("gokyuzu-sky-ready");
		loadingManager.onError = () => mount.classList.add("gokyuzu-sky-fallback");
		const loader = new TextureLoader(loadingManager);
		loader.setCrossOrigin("anonymous");
		const skyTexture = loader.load(SKY_IMAGE_URL, (texture) => {
			texture.colorSpace = SRGBColorSpace;
			texture.mapping = 303;
			texture.wrapS = RepeatWrapping;
			texture.wrapT = ClampToEdgeWrapping;
			texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
			mount.classList.add("gokyuzu-sky-ready");
		}, void 0, () => {
			mount.classList.add("gokyuzu-sky-fallback");
		});
		const skyGeometry = new SphereGeometry(8e3, 64, 40);
		skyGeometry.scale(-1, 1, 1);
		const skyMaterial = new MeshBasicMaterial({
			map: skyTexture,
			side: 1,
			depthWrite: false,
			transparent: true,
			opacity: 1,
			fog: false
		});
		const skyDome = new Mesh(skyGeometry, skyMaterial);
		scene.add(skyDome);
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableRotate = true;
		controls.enablePan = false;
		controls.enableZoom = false;
		controls.minAzimuthAngle = -Infinity;
		controls.maxAzimuthAngle = Infinity;
		controls.minPolarAngle = .001;
		controls.maxPolarAngle = Math.PI - .001;
		controls.rotateSpeed = .55;
		controls.enableDamping = true;
		controls.dampingFactor = .045;
		controls.touches.ONE = TOUCH.ROTATE;
		controls.mouseButtons.LEFT = MOUSE.ROTATE;
		controls.target.set(0, 0, -1);
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
			controls.update();
			renderer.render(scene, camera);
		};
		animate();
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("resize", resize);
			controls.dispose();
			skyTexture.dispose();
			skyGeometry.dispose();
			skyMaterial.dispose();
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
				"aria-label": "Parsel Dünyası gerçek 3D gündüz gökyüzü"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "gokyuzu-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "gokyuzu-kicker",
						children: "MYSKYPARCEL · PARSEL DÜNYASI"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Gökyüzü" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Gerçek gündüz gökyüzünü 360° olarak keşfet." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "gokyuzu-badge",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sun-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "360° gündüz gökyüzü" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gokyuzu-controls",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "👆 Sürükle: 360° bakış" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "☁️ Bulutlar sabit" })]
			})
		]
	});
}
//#endregion
export { GokyuzuPage as component };
