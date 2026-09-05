import { i as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/MySkyParcelEarthGlobeSafe-DrwUGs9W.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
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
				const THREE = await import("../_libs/three.mjs").then((n) => n.t);
				if (cancelled) return;
				const makeTexture = (renderer, clouds = false) => {
					const canvas = document.createElement("canvas");
					canvas.width = 1024;
					canvas.height = 512;
					const ctx = canvas.getContext("2d");
					if (!ctx) return null;
					ctx.clearRect(0, 0, 1024, 512);
					if (clouds) for (const [x, y, rx, ry] of [
						[
							.15,
							.3,
							.12,
							.04
						],
						[
							.3,
							.55,
							.18,
							.05
						],
						[
							.48,
							.28,
							.12,
							.035
						],
						[
							.64,
							.58,
							.2,
							.05
						],
						[
							.8,
							.34,
							.14,
							.04
						],
						[
							.9,
							.66,
							.1,
							.03
						]
					]) {
						const g = ctx.createRadialGradient(x * 1024, y * 512, 0, x * 1024, y * 512, rx * 1024);
						g.addColorStop(0, "rgba(255,255,255,.7)");
						g.addColorStop(1, "rgba(255,255,255,0)");
						ctx.fillStyle = g;
						ctx.beginPath();
						ctx.ellipse(x * 1024, y * 512, rx * 1024, ry * 512, 0, 0, Math.PI * 2);
						ctx.fill();
					}
					else {
						const g = ctx.createLinearGradient(0, 0, 0, 512);
						g.addColorStop(0, "#082d55");
						g.addColorStop(.5, "#0c6b8c");
						g.addColorStop(1, "#04182f");
						ctx.fillStyle = g;
						ctx.fillRect(0, 0, 1024, 512);
						const shapes = [
							[
								[.07, .2],
								[.18, .12],
								[.28, .22],
								[.24, .4],
								[.18, .48],
								[.1, .4]
							],
							[
								[.28, .56],
								[.38, .52],
								[.4, .68],
								[.32, .88],
								[.25, .72]
							],
							[
								[.4, .18],
								[.52, .12],
								[.6, .25],
								[.55, .35],
								[.44, .3]
							],
							[
								[.48, .42],
								[.6, .38],
								[.65, .5],
								[.58, .68],
								[.5, .58]
							],
							[
								[.62, .18],
								[.78, .14],
								[.88, .27],
								[.82, .4],
								[.68, .34]
							],
							[
								[.76, .48],
								[.9, .44],
								[.96, .58],
								[.84, .64]
							]
						];
						ctx.fillStyle = "#249475";
						ctx.strokeStyle = "rgba(150,235,210,.22)";
						ctx.lineWidth = 2;
						for (const points of shapes) {
							ctx.beginPath();
							points.forEach(([x, y], i) => i ? ctx.lineTo(x * 1024, y * 512) : ctx.moveTo(x * 1024, y * 512));
							ctx.closePath();
							ctx.fill();
							ctx.stroke();
						}
					}
					const texture = new THREE.CanvasTexture(canvas);
					texture.colorSpace = THREE.SRGBColorSpace;
					texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
					return texture;
				};
				const renderer = new THREE.WebGLRenderer({
					antialias: true,
					alpha: true,
					powerPreference: "high-performance"
				});
				renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
				renderer.setClearColor(0, 0);
				renderer.outputColorSpace = THREE.SRGBColorSpace;
				renderer.domElement.style.cssText = "position:absolute;inset:0;display:block;width:100%;height:100%;max-width:100%;max-height:100%;touch-action:none;user-select:none;cursor:grab";
				mount.appendChild(renderer.domElement);
				const scene = new THREE.Scene();
				const camera = new THREE.PerspectiveCamera(35, 1, .05, 100);
				camera.position.set(0, .35, zoomRef.current);
				scene.add(new THREE.AmbientLight(7243949, .5));
				const sun = new THREE.DirectionalLight(16777215, 2.7);
				sun.position.set(5, 3, 5);
				scene.add(sun);
				const earthTex = makeTexture(renderer);
				const cloudTex = makeTexture(renderer, true);
				if (!earthTex || !cloudTex) throw new Error("Texture creation failed");
				const r = RADIUS * (window.matchMedia("(max-width:767px)").matches ? .7 : 1);
				const geo = new THREE.SphereGeometry(r, 96, 96);
				const mat = new THREE.MeshPhongMaterial({
					map: earthTex,
					shininess: 8,
					specular: new THREE.Color(1848656)
				});
				const earth = new THREE.Mesh(geo, mat);
				scene.add(earth);
				const cgeo = new THREE.SphereGeometry(r * 1.014, 72, 72);
				const cmat = new THREE.MeshPhongMaterial({
					color: 16777215,
					alphaMap: cloudTex,
					transparent: true,
					opacity: .42,
					depthWrite: false
				});
				const clouds = new THREE.Mesh(cgeo, cmat);
				scene.add(clouds);
				const ageo = new THREE.SphereGeometry(r * 1.085, 72, 72);
				const amat = new THREE.MeshBasicMaterial({
					color: 5089023,
					transparent: true,
					opacity: .13,
					side: THREE.BackSide,
					blending: THREE.AdditiveBlending,
					depthWrite: false
				});
				const atmosphere = new THREE.Mesh(ageo, amat);
				scene.add(atmosphere);
				const sgeo = new THREE.BufferGeometry();
				const pos = /* @__PURE__ */ new Float32Array(6600);
				for (let i = 0; i < 2200; i++) {
					const rad = 11 + i % 2800 / 100;
					const th = i * 2.399963;
					const z = i * .6180339887 % 2 - 1;
					const xy = Math.sqrt(1 - z * z);
					pos[i * 3] = rad * xy * Math.cos(th);
					pos[i * 3 + 1] = rad * z;
					pos[i * 3 + 2] = rad * xy * Math.sin(th);
				}
				sgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
				const smat = new THREE.PointsMaterial({
					color: 16777215,
					size: .048
				});
				const stars = new THREE.Points(sgeo, smat);
				scene.add(stars);
				const pointers = /* @__PURE__ */ new Map();
				let frame = 0;
				let dragging = false;
				let lastX = 0;
				let lastY = 0;
				let pinch = null;
				const sync = () => stars.rotation.copy(earth.rotation);
				const setZoom = (z) => {
					zoomRef.current = THREE.MathUtils.clamp(z, MIN_ZOOM, MAX_ZOOM);
					camera.position.z = zoomRef.current;
				};
				const wheel = (e) => {
					e.preventDefault();
					setZoom(camera.position.z + THREE.MathUtils.clamp(e.deltaY, -160, 160) * .008);
				};
				const down = (e) => {
					pointers.set(e.pointerId, {
						x: e.clientX,
						y: e.clientY
					});
					if (pointers.size === 2) {
						const [a, b] = [...pointers.values()];
						pinch = Math.hypot(a.x - b.x, a.y - b.y);
						dragging = false;
						return;
					}
					dragging = true;
					lastX = e.clientX;
					lastY = e.clientY;
				};
				const move = (e) => {
					if (!pointers.has(e.pointerId)) return;
					pointers.set(e.pointerId, {
						x: e.clientX,
						y: e.clientY
					});
					if (pointers.size === 2 && pinch) {
						const [a, b] = [...pointers.values()];
						const d = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
						setZoom(camera.position.z / (d / pinch));
						pinch = d;
						return;
					}
					if (!dragging) return;
					const dx = e.clientX - lastX;
					const dy = e.clientY - lastY;
					lastX = e.clientX;
					lastY = e.clientY;
					earth.rotation.y += dx * .006;
					earth.rotation.x = THREE.MathUtils.clamp(earth.rotation.x + dy * .0035, -1.15, 1.15);
					clouds.rotation.y += dx * .002;
					sync();
				};
				const up = (e) => {
					pointers.delete(e.pointerId);
					if (pointers.size < 2) pinch = null;
					dragging = pointers.size === 1;
				};
				let lastWidth = 0;
				let lastHeight = 0;
				const resize = () => {
					const w = Math.max(1, Math.floor(mount.clientWidth));
					const h = Math.max(1, Math.floor(mount.clientHeight));
					if (w === lastWidth && h === lastHeight) return;
					lastWidth = w;
					lastHeight = h;
					camera.aspect = w / h;
					camera.updateProjectionMatrix();
					renderer.setSize(w, h, false);
				};
				const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : void 0;
				resizeObserver?.observe(mount);
				window.addEventListener("resize", resize);
				resize();
				renderer.domElement.addEventListener("wheel", wheel, { passive: false });
				renderer.domElement.addEventListener("pointerdown", down);
				renderer.domElement.addEventListener("pointermove", move);
				renderer.domElement.addEventListener("pointerup", up);
				renderer.domElement.addEventListener("pointercancel", up);
				const clock = new THREE.Clock();
				const animate = () => {
					if (cancelled) return;
					frame = requestAnimationFrame(animate);
					const d = clock.getDelta();
					if (!dragging && !pointers.size) {
						earth.rotation.y += d * .018;
						clouds.rotation.y += d * .004;
						sync();
					}
					renderer.render(scene, camera);
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
					earthTex.dispose();
					cloudTex.dispose();
					geo.dispose();
					mat.dispose();
					cgeo.dispose();
					cmat.dispose();
					ageo.dispose();
					amat.dispose();
					sgeo.dispose();
					smat.dispose();
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
				className: "absolute inset-0 z-0 min-h-0 min-w-0 max-w-full overflow-hidden",
				"aria-label": "MySkyParcel görsel 3D Dünya küresi"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 z-10" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] text-white/60 backdrop-blur-md",
				children: "İki parmakla yakınlaştır · fare tekerleğiyle zoom"
			})
		]
	});
}
//#endregion
export { MySkyParcelEarthGlobeSafe };
