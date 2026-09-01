import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as ShaderMaterial, a as Clock, c as Group, d as MeshPhongMaterial, f as PerspectiveCamera, g as Scene, h as SRGBColorSpace, i as BufferGeometry, l as MathUtils, m as PointsMaterial, n as AmbientLight, o as Color, p as Points, r as BufferAttribute, s as DirectionalLight, t as WebGLRenderer, u as Mesh, v as SphereGeometry, y as TextureLoader } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/MySkyParcelEarthGlobe-Ct3j85gm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EARTH_TEXTURE = "/api/earth-assets?type=earth";
var CLOUD_TEXTURE = "/api/earth-assets?type=clouds";
var EARTH_RADIUS = 1.5;
var MIN_ZOOM = 3;
var MAX_ZOOM = 7;
var DEFAULT_CAMERA_Z = 5.35;
function MySkyParcelEarthGlobe({ className = "" }) {
	const mountRef = (0, import_react.useRef)(null);
	const cameraZRef = (0, import_react.useRef)(DEFAULT_CAMERA_Z);
	(0, import_react.useEffect)(() => {
		const mount = mountRef.current;
		if (!mount) return;
		let disposed = false;
		let dragging = false;
		let lastX = 0;
		let lastY = 0;
		const pointers = /* @__PURE__ */ new Map();
		let pinchDistance = null;
		const scene = new Scene();
		scene.background = null;
		const camera = new PerspectiveCamera(35, 1, .05, 100);
		camera.position.set(0, .35, cameraZRef.current);
		const renderer = new WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: "high-performance"
		});
		renderer.setClearColor(0, 0);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
		renderer.outputColorSpace = SRGBColorSpace;
		renderer.setSize(mount.clientWidth, mount.clientHeight, false);
		renderer.domElement.classList.add("msp-three-interactive");
		renderer.domElement.style.display = "block";
		renderer.domElement.style.width = "100%";
		renderer.domElement.style.height = "100%";
		renderer.domElement.style.touchAction = "none";
		renderer.domElement.style.userSelect = "none";
		renderer.domElement.style.cursor = "grab";
		mount.appendChild(renderer.domElement);
		scene.add(new AmbientLight(7243949, .48));
		const sun = new DirectionalLight(16777215, 2.7);
		sun.position.set(5, 3, 5);
		scene.add(sun);
		const fill = new DirectionalLight(3960232, .55);
		fill.position.set(-4, -2, -3);
		scene.add(fill);
		const loader = new TextureLoader();
		const earthTexture = loader.load(EARTH_TEXTURE);
		earthTexture.colorSpace = SRGBColorSpace;
		earthTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
		const earthRadius = EARTH_RADIUS * (window.matchMedia("(max-width: 767px)").matches ? .7 : 1);
		const earthGeometry = new SphereGeometry(earthRadius, 128, 128);
		const earthMaterial = new MeshPhongMaterial({
			map: earthTexture,
			shininess: 8,
			specular: new Color(1848656)
		});
		const earth = new Mesh(earthGeometry, earthMaterial);
		scene.add(earth);
		const cloudTexture = loader.load(CLOUD_TEXTURE);
		cloudTexture.colorSpace = SRGBColorSpace;
		cloudTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 2);
		const cloudGeometry = new SphereGeometry(earthRadius * 1.014, 96, 96);
		const cloudMaterial = new MeshPhongMaterial({
			color: 16777215,
			alphaMap: cloudTexture,
			transparent: true,
			opacity: .42,
			depthWrite: false
		});
		const clouds = new Mesh(cloudGeometry, cloudMaterial);
		scene.add(clouds);
		const atmosphereGeometry = new SphereGeometry(earthRadius * 1.085, 96, 96);
		const atmosphereMaterial = new ShaderMaterial({
			vertexShader: `varying vec3 vNormal; varying vec3 vWorldPosition; void main(){vNormal=normalize(normalMatrix*normal);vec4 worldPosition=modelMatrix*vec4(position,1.0);vWorldPosition=worldPosition.xyz;gl_Position=projectionMatrix*viewMatrix*worldPosition;}`,
			fragmentShader: `varying vec3 vNormal; varying vec3 vWorldPosition; void main(){vec3 viewDir=normalize(cameraPosition-vWorldPosition);float intensity=pow(0.76-max(dot(vNormal,viewDir),0.0),3.0);gl_FragColor=vec4(vec3(0.302,0.639,1.0),intensity*0.78);}`,
			side: 1,
			blending: 2,
			transparent: true,
			depthWrite: false
		});
		const atmosphere = new Mesh(atmosphereGeometry, atmosphereMaterial);
		scene.add(atmosphere);
		const starsGeometry = new BufferGeometry();
		const positions = /* @__PURE__ */ new Float32Array(9600);
		for (let i = 0; i < 3200; i++) {
			const radius = 11 + Math.random() * 28;
			const theta = Math.random() * Math.PI * 2;
			const z = Math.random() * 2 - 1;
			const xy = Math.sqrt(1 - z * z);
			positions[i * 3] = radius * xy * Math.cos(theta);
			positions[i * 3 + 1] = radius * z;
			positions[i * 3 + 2] = radius * xy * Math.sin(theta);
		}
		starsGeometry.setAttribute("position", new BufferAttribute(positions, 3));
		const starsMaterial = new PointsMaterial({
			color: 16777215,
			size: .048,
			sizeAttenuation: true,
			transparent: true,
			opacity: 1
		});
		const stars = new Points(starsGeometry, starsMaterial);
		const starsGroup = new Group();
		starsGroup.add(stars);
		scene.add(starsGroup);
		const syncStarsToEarth = () => starsGroup.rotation.copy(earth.rotation);
		const applyZoom = (next) => {
			const clamped = MathUtils.clamp(next, MIN_ZOOM, MAX_ZOOM);
			cameraZRef.current = clamped;
			camera.position.z = clamped;
		};
		const onWheel = (event) => {
			event.preventDefault();
			event.stopPropagation();
			applyZoom(camera.position.z + MathUtils.clamp(event.deltaY, -160, 160) * .008);
		};
		const onPointerDown = (event) => {
			pointers.set(event.pointerId, {
				x: event.clientX,
				y: event.clientY
			});
			if (pointers.size === 2) {
				const [a, b] = [...pointers.values()];
				pinchDistance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
				dragging = false;
				return;
			}
			dragging = true;
			lastX = event.clientX;
			lastY = event.clientY;
			renderer.domElement.style.cursor = "grabbing";
			renderer.domElement.setPointerCapture?.(event.pointerId);
		};
		const onPointerMove = (event) => {
			if (!pointers.has(event.pointerId)) return;
			pointers.set(event.pointerId, {
				x: event.clientX,
				y: event.clientY
			});
			if (pointers.size === 2 && pinchDistance !== null) {
				const [a, b] = [...pointers.values()];
				const distance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
				const ratio = distance / pinchDistance;
				if (Math.abs(ratio - 1) > .002) {
					applyZoom(camera.position.z / ratio);
					pinchDistance = distance;
				}
				return;
			}
			if (!dragging) return;
			const dx = event.clientX - lastX;
			const dy = event.clientY - lastY;
			lastX = event.clientX;
			lastY = event.clientY;
			earth.rotation.y += dx * .006;
			earth.rotation.x += dy * .0035;
			earth.rotation.x = Math.max(-1.15, Math.min(1.15, earth.rotation.x));
			clouds.rotation.y += dx * .002;
			clouds.rotation.x += dy * .0012;
			syncStarsToEarth();
		};
		const onPointerUp = (event) => {
			pointers.delete(event.pointerId);
			if (pointers.size < 2) pinchDistance = null;
			dragging = pointers.size === 1;
			if (dragging) {
				const remaining = [...pointers.values()][0];
				lastX = remaining.x;
				lastY = remaining.y;
			}
			renderer.domElement.style.cursor = dragging ? "grabbing" : "grab";
			try {
				renderer.domElement.releasePointerCapture?.(event.pointerId);
			} catch (error) {}
		};
		renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
		renderer.domElement.addEventListener("pointerdown", onPointerDown);
		renderer.domElement.addEventListener("pointermove", onPointerMove);
		renderer.domElement.addEventListener("pointerup", onPointerUp);
		renderer.domElement.addEventListener("pointercancel", onPointerUp);
		const resize = () => {
			const width = mount.clientWidth;
			const height = mount.clientHeight;
			if (!width || !height) return;
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderer.setSize(width, height, false);
		};
		window.addEventListener("resize", resize);
		resize();
		let frame = 0;
		const clock = new Clock();
		const animate = () => {
			if (disposed) return;
			frame = requestAnimationFrame(animate);
			const delta = clock.getDelta();
			if (!dragging && pointers.size === 0) {
				earth.rotation.y += delta * .018;
				clouds.rotation.y += delta * .004;
				syncStarsToEarth();
			}
			renderer.render(scene, camera);
		};
		animate();
		return () => {
			disposed = true;
			cancelAnimationFrame(frame);
			window.removeEventListener("resize", resize);
			renderer.domElement.removeEventListener("wheel", onWheel);
			renderer.domElement.removeEventListener("pointerdown", onPointerDown);
			renderer.domElement.removeEventListener("pointermove", onPointerMove);
			renderer.domElement.removeEventListener("pointerup", onPointerUp);
			renderer.domElement.removeEventListener("pointercancel", onPointerUp);
			earthTexture.dispose();
			cloudTexture.dispose();
			earthGeometry.dispose();
			earthMaterial.dispose();
			cloudGeometry.dispose();
			cloudMaterial.dispose();
			atmosphereGeometry.dispose();
			atmosphereMaterial.dispose();
			starsGeometry.dispose();
			starsMaterial.dispose();
			renderer.dispose();
			if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `relative z-0 h-[560px] w-full overflow-hidden rounded-3xl border border-sky-200/15 bg-background shadow-2xl shadow-black/40 ${className}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: mountRef,
				className: "absolute inset-0 z-0",
				"aria-label": "MySkyParcel görsel 3D Dünya küresi"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 z-10",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] text-white/60 backdrop-blur-md",
				children: "İki parmakla yakınlaştır · fare tekerleğiyle zoom"
			})
		]
	});
}
//#endregion
export { MySkyParcelEarthGlobe };
