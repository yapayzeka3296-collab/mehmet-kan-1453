import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Logo } from "./Logo-DCMsOb-H.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Ehsw4gH5.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var EARTH_TEXTURE = "/api/earth-assets?type=earth";
var CLOUD_TEXTURE = "/api/earth-assets?type=clouds";
var RADIUS = 1.5;
var MIN_ZOOM = 3;
var MAX_ZOOM = 7;
var DEFAULT_ZOOM = 5.35;
function MySkyParcelEarthGlobeSafe({ className = "" }) {
	const mountRef = (0, import_react.useRef)(null);
	const zoomRef = (0, import_react.useRef)(DEFAULT_ZOOM);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		let cleanup;
		const start = async () => {
			const mount = mountRef.current;
			if (!mount) return;
			const fallback = () => {
				const el = document.createElement("div");
				el.className = "absolute inset-0 grid place-items-center";
				el.innerHTML = "<div style=\"width:min(62vw,520px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 32% 28%,#38bdf8,#0b4776 38%,#031329 72%);box-shadow:0 0 80px rgba(56,189,248,.22),inset -28px -22px 70px rgba(0,0,0,.72)\"></div>";
				mount.appendChild(el);
				cleanup = () => el.remove();
			};
			try {
				const test = document.createElement("canvas");
				if (!(test.getContext("webgl") || test.getContext("experimental-webgl"))) throw new Error("WebGL unavailable");
				const THREE = await import("../_libs/three.mjs").then((n) => n.n);
				if (cancelled) return;
				const mobile = window.matchMedia("(max-width:767px)").matches ? .7 : 1;
				const renderer = new THREE.WebGLRenderer({
					antialias: false,
					alpha: true,
					powerPreference: "high-performance"
				});
				renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));
				renderer.setClearColor(0, 0);
				renderer.outputColorSpace = THREE.SRGBColorSpace;
				renderer.domElement.style.cssText = "position:absolute;inset:0;display:block;width:100%;height:100%;max-width:100%;max-height:100%;touch-action:none;pointer-events:auto;user-select:none;-webkit-user-select:none;-webkit-user-drag:none;cursor:grab";
				mount.style.pointerEvents = "auto";
				mount.appendChild(renderer.domElement);
				const scene = new THREE.Scene();
				const camera = new THREE.PerspectiveCamera(35, 1, .05, 100);
				camera.position.set(0, .35, zoomRef.current);
				scene.add(new THREE.AmbientLight(7243949, .34));
				const sun = new THREE.DirectionalLight(16777215, 2.8);
				sun.position.set(5, 3, 5);
				scene.add(sun);
				const fill = new THREE.DirectionalLight(3960232, .45);
				fill.position.set(-4, -2, -3);
				scene.add(fill);
				const loader = new THREE.TextureLoader();
				const earthTexture = loader.load(EARTH_TEXTURE);
				earthTexture.colorSpace = THREE.SRGBColorSpace;
				earthTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 2);
				const cloudTexture = loader.load(CLOUD_TEXTURE);
				cloudTexture.colorSpace = THREE.SRGBColorSpace;
				cloudTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 1);
				const radius = RADIUS * mobile;
				const earthGeometry = new THREE.SphereGeometry(radius, 96, 96);
				const earthMaterial = new THREE.MeshPhongMaterial({
					map: earthTexture,
					shininess: 10,
					specular: new THREE.Color(2639722)
				});
				const earth = new THREE.Mesh(earthGeometry, earthMaterial);
				scene.add(earth);
				const cloudGeometry = new THREE.SphereGeometry(radius * 1.014, 64, 64);
				const cloudMaterial = new THREE.MeshPhongMaterial({
					color: 16777215,
					alphaMap: cloudTexture,
					transparent: true,
					opacity: .43,
					depthWrite: false
				});
				const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
				scene.add(clouds);
				const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.09, 64, 64);
				const atmosphereMaterial = new THREE.MeshBasicMaterial({
					color: 5089023,
					transparent: true,
					opacity: .12,
					side: THREE.BackSide,
					blending: THREE.AdditiveBlending,
					depthWrite: false
				});
				const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
				scene.add(atmosphere);
				const createStarField = () => {
					const count = mobile < 1 ? 700 : 1200;
					const positions = new Float32Array(count * 3);
					for (let i = 0; i < count; i++) {
						const distance = 12 + Math.random() * 29;
						const theta = Math.random() * Math.PI * 2;
						const z = Math.random() * 2 - 1;
						const xy = Math.sqrt(1 - z * z);
						positions[i * 3] = distance * xy * Math.cos(theta);
						positions[i * 3 + 1] = distance * z;
						positions[i * 3 + 2] = distance * xy * Math.sin(theta);
					}
					const geometry = new THREE.BufferGeometry();
					geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
					const material = new THREE.PointsMaterial({
						color: 16777215,
						size: .042,
						sizeAttenuation: true
					});
					const points = new THREE.Points(geometry, material);
					scene.add(points);
					return {
						geometry,
						material,
						points
					};
				};
				const stars = createStarField();
				const pointers = /* @__PURE__ */ new Map();
				let frame = 0;
				let lastRender = 0;
				let dragging = false;
				let pinch = null;
				const syncStarsToEarth = () => stars.points.rotation.copy(earth.rotation);
				const setZoom = (z) => {
					zoomRef.current = THREE.MathUtils.clamp(z, MIN_ZOOM, MAX_ZOOM);
					camera.position.z = zoomRef.current;
				};
				const wheel = (event) => {
					event.preventDefault();
					event.stopPropagation();
					setZoom(camera.position.z + THREE.MathUtils.clamp(event.deltaY, -160, 160) * .008);
				};
				const down = (event) => {
					event.preventDefault();
					pointers.set(event.pointerId, {
						x: event.clientX,
						y: event.clientY
					});
					try {
						renderer.domElement.setPointerCapture(event.pointerId);
					} catch {}
					if (pointers.size === 2) {
						const [a, b] = [...pointers.values()];
						pinch = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
						dragging = false;
						return;
					}
					dragging = true;
					event.clientX;
					event.clientY;
					renderer.domElement.style.cursor = "grabbing";
				};
				const move = (event) => {
					if (!pointers.has(event.pointerId)) return;
					event.preventDefault();
					const previous = pointers.get(event.pointerId);
					pointers.set(event.pointerId, {
						x: event.clientX,
						y: event.clientY
					});
					if (pointers.size === 2 && pinch) {
						const [a, b] = [...pointers.values()];
						const distance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
						setZoom(camera.position.z / (distance / pinch));
						pinch = distance;
						return;
					}
					if (!dragging) return;
					const dx = event.clientX - previous.x;
					const dy = event.clientY - previous.y;
					event.clientX;
					event.clientY;
					earth.rotation.y += dx * .008;
					earth.rotation.x = THREE.MathUtils.clamp(earth.rotation.x + dy * .005, -1.15, 1.15);
					clouds.rotation.y += dx * .003;
					clouds.rotation.x += dy * .0016;
					syncStarsToEarth();
				};
				const up = (event) => {
					pointers.delete(event.pointerId);
					if (pointers.size < 2) pinch = null;
					dragging = pointers.size === 1;
					if (dragging) {
						const remaining = [...pointers.values()][0];
						remaining.x;
						remaining.y;
					}
					renderer.domElement.style.cursor = dragging ? "grabbing" : "grab";
					try {
						renderer.domElement.releasePointerCapture(event.pointerId);
					} catch {}
				};
				const resize = () => {
					const width = Math.max(1, Math.floor(mount.clientWidth));
					const height = Math.max(1, Math.floor(mount.clientHeight));
					camera.aspect = width / height;
					camera.updateProjectionMatrix();
					renderer.setSize(width, height, false);
				};
				let lastWidth = 0;
				let lastHeight = 0;
				const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => {
					const width = Math.floor(mount.clientWidth);
					const height = Math.floor(mount.clientHeight);
					if (width === lastWidth && height === lastHeight) return;
					lastWidth = width;
					lastHeight = height;
					resize();
				}) : void 0;
				resizeObserver?.observe(mount);
				window.addEventListener("resize", resize);
				resize();
				renderer.domElement.addEventListener("wheel", wheel, { passive: false });
				renderer.domElement.addEventListener("pointerdown", down, { passive: false });
				renderer.domElement.addEventListener("pointermove", move, { passive: false });
				renderer.domElement.addEventListener("pointerup", up);
				renderer.domElement.addEventListener("pointercancel", up);
				renderer.domElement.addEventListener("lostpointercapture", up);
				const clock = new THREE.Clock();
				const animate = () => {
					if (cancelled) return;
					frame = requestAnimationFrame(animate);
					const delta = clock.getDelta();
					const elapsed = clock.elapsedTime;
					if (!dragging && !pointers.size) {
						earth.rotation.y += delta * .018;
						clouds.rotation.y += delta * .004;
						syncStarsToEarth();
					}
					if (elapsed - lastRender >= .033) {
						lastRender = elapsed;
						renderer.render(scene, camera);
					}
				};
				animate();
				cleanup = () => {
					cancelled = true;
					cancelAnimationFrame(frame);
					resizeObserver?.disconnect();
					window.removeEventListener("resize", resize);
					renderer.domElement.removeEventListener("wheel", wheel);
					renderer.domElement.removeEventListener("pointerdown", down);
					renderer.domElement.removeEventListener("pointermove", move);
					renderer.domElement.removeEventListener("pointerup", up);
					renderer.domElement.removeEventListener("pointercancel", up);
					renderer.domElement.removeEventListener("lostpointercapture", up);
					earthTexture.dispose();
					cloudTexture.dispose();
					earthGeometry.dispose();
					earthMaterial.dispose();
					cloudGeometry.dispose();
					cloudMaterial.dispose();
					atmosphereGeometry.dispose();
					atmosphereMaterial.dispose();
					stars.geometry.dispose();
					stars.material.dispose();
					renderer.dispose();
					renderer.domElement.remove();
				};
			} catch (error) {
				console.error("MySkyParcel globe fallback", error);
				fallback();
			}
		};
		start();
		return () => {
			cancelled = true;
			cleanup?.();
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `relative z-0 h-[560px] w-full min-w-0 max-w-full overflow-hidden rounded-3xl border border-sky-200/15 bg-background shadow-2xl shadow-black/40 ${className}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: mountRef,
				className: "absolute inset-0 z-0 min-h-0 min-w-0 max-w-full overflow-hidden pointer-events-auto",
				"aria-label": "MySkyParcel gerçek 3D Dünya küresi"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 z-10" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] text-white/60 backdrop-blur-md",
				children: "Sürükle: döndür · iki parmak: yakınlaştır · fare tekerleği: zoom"
			})
		]
	});
}
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative z-0 min-h-screen overflow-hidden bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MySkyParcelEarthGlobeSafe, { className: "h-screen rounded-none border-0 bg-transparent shadow-none" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_75%_20%,rgba(34,211,238,0.08),transparent_32%),linear-gradient(180deg,rgba(1,4,11,0.12),rgba(1,4,11,0.3))]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "msp-ui-layer absolute left-4 top-4 z-20 sm:left-8 sm:top-8 lg:left-12 lg:top-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-auto flex flex-col items-start",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 max-w-[280px] bg-transparent p-0 text-left drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[9px] font-semibold tracking-[0.12em] text-cyan-100 sm:text-[10px]",
								children: "81 İL · 81 MİLYON PARSEL"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-[10px] font-medium text-foreground/90 sm:text-xs",
								children: "Türkiye'den dünyaya açılacak bir proje."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-2 text-base font-bold leading-tight tracking-tight text-white sm:text-xl",
								children: "GÖKYÜZÜNDE KENDİ PARSELİNİ SEÇ."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1.5 text-[10px] leading-4 text-foreground/85 sm:text-xs sm:leading-5",
								children: [
									"Gökyüzündeki yerini keşfet.",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"Şehrini seç, parselini seç ve sana ait dijital gökyüzü parselini oluştur."
								]
							})
						]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "msp-ui-layer absolute right-4 top-4 z-20 sm:right-8 sm:top-8 lg:right-12 lg:top-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/ana-sayfa",
					"aria-label": "Ana sayfaya git",
					className: "pointer-events-auto inline-flex items-center justify-center rounded-xl border border-cyan-200/80 bg-cyan-300 px-5 py-2.5 text-xs font-bold tracking-[0.08em] text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200 sm:px-6 sm:py-3 sm:text-sm",
					children: "PARSELE GİT →"
				})
			})
		]
	});
}
//#endregion
export { Landing as component };
