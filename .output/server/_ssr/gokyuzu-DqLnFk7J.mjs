import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import "./router-Bf_xVsk8.mjs";
import { a as HemisphereLight, c as PerspectiveCamera, d as Scene, f as SphereGeometry, l as RepeatWrapping, n as WebGLRenderer, o as Mesh, p as TextureLoader, s as MeshBasicMaterial, t as OrbitControls, u as SRGBColorSpace } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gokyuzu-DqLnFk7J.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var SKY_IMAGE_URL = "https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/kloppenheim_03_puresky.jpg";
function GokyuzuPage() {
	const mountRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const mount = mountRef.current;
		if (!mount) return;
		const scene = new Scene();
		const camera = new PerspectiveCamera(68, mount.clientWidth / mount.clientHeight, .01, 2e4);
		camera.position.set(0, 1.2, .01);
		const renderer = new WebGLRenderer({
			antialias: true,
			alpha: false,
			powerPreference: "high-performance"
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
		renderer.setSize(mount.clientWidth, mount.clientHeight);
		renderer.outputColorSpace = SRGBColorSpace;
		renderer.toneMapping = 4;
		renderer.toneMappingExposure = 1;
		mount.appendChild(renderer.domElement);
		const skyTexture = new TextureLoader().load(SKY_IMAGE_URL, void 0, void 0, () => {
			mount.classList.add("gokyuzu-sky-error");
		});
		skyTexture.colorSpace = SRGBColorSpace;
		skyTexture.mapping = 303;
		skyTexture.wrapS = RepeatWrapping;
		const skyGeometry = new SphereGeometry(8e3, 64, 32);
		skyGeometry.scale(-1, 1, 1);
		const skyMaterial = new MeshBasicMaterial({
			map: skyTexture,
			side: 1,
			depthWrite: false,
			fog: false
		});
		const skyDome = new Mesh(skyGeometry, skyMaterial);
		scene.add(skyDome);
		scene.add(new HemisphereLight(14677247, 8828888, .55));
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = .045;
		controls.enablePan = false;
		controls.minDistance = .01;
		controls.maxDistance = .01;
		controls.minPolarAngle = .06;
		controls.maxPolarAngle = Math.PI - .06;
		controls.target.set(0, 1.2, -1);
		controls.rotateSpeed = .18;
		controls.zoomToCursor = false;
		const resize = () => {
			camera.aspect = mount.clientWidth / mount.clientHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(mount.clientWidth, mount.clientHeight);
		};
		window.addEventListener("resize", resize);
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Gerçek gökyüzü görüntüsünün içinde 3D olarak keşfet." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "gokyuzu-badge",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sun-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Gerçek gündüz gökyüzü" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gokyuzu-controls",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "👆 Sürükle: gökyüzüne bak" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "☁️ Bulutlar sabit" })]
			})
		]
	});
}
//#endregion
export { GokyuzuPage as component };
