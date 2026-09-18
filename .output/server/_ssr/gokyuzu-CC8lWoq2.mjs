import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import "./router-D5EnAAny.mjs";
import { _ as Vector3, a as CanvasTexture, c as FogExp2, d as MathUtils, f as PerspectiveCamera, g as SpriteMaterial, h as Sprite, l as Group, m as Scene, n as Sky, o as Clock, p as SRGBColorSpace, r as WebGLRenderer, s as DirectionalLight, t as OrbitControls, u as HemisphereLight } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gokyuzu-CC8lWoq2.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
function createCloudTexture() {
	const canvas = document.createElement("canvas");
	canvas.width = 256;
	canvas.height = 128;
	const context = canvas.getContext("2d");
	if (!context) return null;
	const gradient = context.createRadialGradient(128, 64, 8, 128, 64, 108);
	gradient.addColorStop(0, "rgba(255,255,255,0.92)");
	gradient.addColorStop(.42, "rgba(255,255,255,0.72)");
	gradient.addColorStop(.78, "rgba(255,255,255,0.28)");
	gradient.addColorStop(1, "rgba(255,255,255,0)");
	context.fillStyle = gradient;
	context.fillRect(0, 0, 256, 128);
	const texture = new CanvasTexture(canvas);
	texture.colorSpace = SRGBColorSpace;
	return texture;
}
function GokyuzuPage() {
	const mountRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const mount = mountRef.current;
		if (!mount) return;
		const scene = new Scene();
		const camera = new PerspectiveCamera(58, mount.clientWidth / mount.clientHeight, .1, 1e6);
		camera.position.set(0, 12, 35);
		const renderer = new WebGLRenderer({
			antialias: true,
			alpha: false,
			powerPreference: "high-performance"
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
		renderer.setSize(mount.clientWidth, mount.clientHeight);
		renderer.outputColorSpace = SRGBColorSpace;
		renderer.toneMapping = 4;
		renderer.toneMappingExposure = .82;
		mount.appendChild(renderer.domElement);
		const sky = new Sky();
		sky.scale.setScalar(45e4);
		scene.add(sky);
		const skyUniforms = sky.material.uniforms;
		skyUniforms.turbidity.value = 5.2;
		skyUniforms.rayleigh.value = 2.15;
		skyUniforms.mieCoefficient.value = .0042;
		skyUniforms.mieDirectionalG.value = .72;
		const sun = new Vector3();
		const azimuth = -35;
		const phi = MathUtils.degToRad(42);
		const theta = MathUtils.degToRad(azimuth);
		sun.setFromSphericalCoords(1, phi, theta);
		skyUniforms.sunPosition.value.copy(sun);
		scene.fog = new FogExp2(10276853, 18e-5);
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = .035;
		controls.enablePan = false;
		controls.minDistance = 18;
		controls.maxDistance = 110;
		controls.minPolarAngle = .12;
		controls.maxPolarAngle = Math.PI * .82;
		controls.target.set(0, 28, 0);
		const cloudTexture = createCloudTexture();
		const cloudGroup = new Group();
		scene.add(cloudGroup);
		const clouds = [];
		if (cloudTexture) {
			const cloudMaterial = new SpriteMaterial({
				map: cloudTexture,
				transparent: true,
				opacity: .78,
				depthWrite: false,
				color: 16777215,
				fog: true
			});
			const cloudCount = 42;
			for (let i = 0; i < cloudCount; i += 1) {
				const sprite = new Sprite(cloudMaterial.clone());
				const angle = i / cloudCount * Math.PI * 2 + i % 5 * .21;
				const radius = 90 + i * 47 % 260;
				const scale = 24 + i * 19 % 55;
				const x = Math.cos(angle) * radius;
				const z = Math.sin(angle) * radius;
				const y = 35 + i * 23 % 52;
				sprite.position.set(x, y, z);
				sprite.scale.set(scale * 1.55, scale * .7, 1);
				sprite.renderOrder = 2;
				cloudGroup.add(sprite);
				clouds.push({
					sprite,
					baseX: x,
					baseZ: z,
					drift: .7 + i % 7 * .06,
					scale
				});
			}
		}
		const ambient = new HemisphereLight(14677247, 9090264, 1.5);
		scene.add(ambient);
		const sunLight = new DirectionalLight(16777215, 2.2);
		sunLight.position.set(80, 160, -120);
		scene.add(sunLight);
		const updateClouds = (time) => {
			const cameraX = camera.position.x;
			const cameraZ = camera.position.z;
			const wrap = 330;
			for (const cloud of clouds) {
				let x = cloud.baseX + time * cloud.drift;
				let z = cloud.baseZ;
				x = ((x - cameraX + wrap / 2) % wrap + wrap) % wrap - wrap / 2 + cameraX;
				z = ((z - cameraZ + wrap / 2) % wrap + wrap) % wrap - wrap / 2 + cameraZ;
				cloud.sprite.position.x = x;
				cloud.sprite.position.z = z;
				cloud.sprite.position.y += Math.sin(time * .18 + cloud.baseX) * .002;
			}
		};
		const resize = () => {
			camera.aspect = mount.clientWidth / mount.clientHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(mount.clientWidth, mount.clientHeight);
		};
		window.addEventListener("resize", resize);
		const clock = new Clock();
		let frame = 0;
		const animate = () => {
			frame = requestAnimationFrame(animate);
			const time = clock.getElapsedTime();
			controls.update();
			updateClouds(time);
			renderer.render(scene, camera);
		};
		animate();
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("resize", resize);
			controls.dispose();
			cloudGroup.traverse((object) => {
				const sprite = object;
				if (sprite.material) {
					const material = sprite.material;
					material.map?.dispose();
					material.dispose();
				}
			});
			cloudTexture?.dispose();
			sky.geometry.dispose();
			sky.material.dispose();
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
				"aria-label": "Parsel Dünyası sonsuz 3D gündüz gökyüzü"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "gokyuzu-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "gokyuzu-kicker",
						children: "MYSKYPARCEL · PARSEL DÜNYASI"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Gökyüzü" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Gündüz gökyüzünün içinde sonsuz bir 3D dünya. Sürükleyerek ufku keşfet." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "gokyuzu-badge",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "sun-dot" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Gündüz modu" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gokyuzu-horizon",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "∞" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Sonsuz gökyüzü" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Bulutlar hareket eder · kamera yönü özgür" })] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gokyuzu-controls",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "👆 Sürükle: gökyüzünü keşfet" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "↕ Yaklaş / uzaklaş" })]
			})
		]
	});
}
//#endregion
export { GokyuzuPage as component };
