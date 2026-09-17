import { i as __toESM } from "../_runtime.mjs";
import { n as supabaseBrowser } from "./supabaseBrowser-BU58SfZL.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import "./router-BJAkyLME.mjs";
import { a as Color, c as Matrix4, d as Raycaster, f as SRGBColorSpace, i as BoxGeometry, l as MeshBasicMaterial, m as Vector2, n as WebGLRenderer, o as DynamicDrawUsage, p as Scene, s as InstancedMesh, t as OrbitControls, u as PerspectiveCamera } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gokyuzu-B_gzA3Vd.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var PAGE_SIZE = 1e3;
var PARALLEL_PAGES = 8;
var PARCEL_SELECT = "id,parcel_number,status,price,tier,city_name,layer_number,sector_number,grid_x,grid_y";
async function loadCitySkyParcels(cityName, onProgress) {
	const first = await supabaseBrowser.from("parcel_map_public").select(PARCEL_SELECT, { count: "exact" }).eq("city_name", cityName).order("layer_number", { ascending: true }).order("sector_number", { ascending: true }).range(0, 999);
	if (first.error) throw new Error(`${cityName} parselleri yüklenemedi: ${first.error.message}`);
	const total = first.count ?? first.data?.length ?? 0;
	const rows = first.data ?? [];
	onProgress?.(rows.length, total);
	if (rows.length >= total) return rows;
	const offsets = [];
	for (let offset = PAGE_SIZE; offset < total; offset += PAGE_SIZE) offsets.push(offset);
	for (let i = 0; i < offsets.length; i += PARALLEL_PAGES) {
		const batch = offsets.slice(i, i + PARALLEL_PAGES);
		const pages = await Promise.all(batch.map((offset) => supabaseBrowser.from("parcel_map_public").select(PARCEL_SELECT).eq("city_name", cityName).order("layer_number", { ascending: true }).order("sector_number", { ascending: true }).range(offset, Math.min(offset + PAGE_SIZE - 1, total - 1))));
		for (const page of pages) {
			if (page.error) throw new Error(`${cityName} parselleri yüklenemedi: ${page.error.message}`);
			rows.push(...page.data ?? []);
		}
		onProgress?.(Math.min(rows.length, total), total);
	}
	return rows;
}
var TEST_CITY = "Gaziantep";
var VISIBLE_PARCELS = 260;
var GRID_COLUMNS = 40;
var PARCEL_SIZE = .9;
var GRID_GAP = 1.05;
var DOME_HEIGHT = 15;
function parcelColor(status) {
	if (status === "sold") return new Color("#f59e0b");
	if (status === "reserved") return new Color("#a78bfa");
	return new Color("#38bdf8");
}
function domePosition(index) {
	const column = index % GRID_COLUMNS;
	const row = Math.floor(index / GRID_COLUMNS);
	const x = (column - 39 / 2) * GRID_GAP;
	const z = (row - 12) * GRID_GAP;
	const nx = x / (39 * GRID_GAP * .52);
	const nz = z / (24 * GRID_GAP * .52);
	const radius = Math.min(1, Math.sqrt(nx * nx + nz * nz));
	return {
		x,
		y: DOME_HEIGHT * Math.sqrt(Math.max(0, 1 - radius * radius)),
		z
	};
}
function GokyuzuPage() {
	const mountRef = (0, import_react.useRef)(null);
	const parcelsRef = (0, import_react.useRef)([]);
	const visibleParcelsRef = (0, import_react.useRef)([]);
	const [parcels, setParcels] = (0, import_react.useState)([]);
	const [loaded, setLoaded] = (0, import_react.useState)(0);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [visibleCount, setVisibleCount] = (0, import_react.useState)(VISIBLE_PARCELS);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		loadCitySkyParcels(TEST_CITY, (current) => {
			if (!cancelled) setLoaded(current);
		}).then((rows) => {
			if (cancelled) return;
			parcelsRef.current = rows;
			setParcels(rows);
			setVisibleCount(Math.min(VISIBLE_PARCELS, rows.length));
		}).catch((cause) => {
			if (!cancelled) setError(cause instanceof Error ? cause.message : `${TEST_CITY} parselleri yüklenemedi.`);
		});
		return () => {
			cancelled = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const mount = mountRef.current;
		if (!mount || parcels.length === 0) return;
		const scene = new Scene();
		const camera = new PerspectiveCamera(48, mount.clientWidth / mount.clientHeight, .1, 1200);
		camera.position.set(0, 24, 42);
		const renderer = new WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: "high-performance"
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
		renderer.setSize(mount.clientWidth, mount.clientHeight);
		renderer.outputColorSpace = SRGBColorSpace;
		mount.appendChild(renderer.domElement);
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = .08;
		controls.enablePan = true;
		controls.screenSpacePanning = true;
		controls.minDistance = 12;
		controls.maxDistance = 95;
		controls.maxPolarAngle = Math.PI * .49;
		controls.target.set(0, 5, 0);
		const geometry = new BoxGeometry(PARCEL_SIZE, .11, PARCEL_SIZE);
		const material = new MeshBasicMaterial({
			vertexColors: true,
			transparent: true,
			opacity: .94
		});
		const mesh = new InstancedMesh(geometry, material, Math.min(VISIBLE_PARCELS, parcels.length));
		mesh.instanceMatrix.setUsage(DynamicDrawUsage);
		scene.add(mesh);
		const visibleIndexRef = [];
		const matrix = new Matrix4();
		const color = new Color();
		const updateVisibleWindow = () => {
			const targetX = controls.target.x;
			const targetZ = controls.target.z;
			const centerColumn = Math.round(targetX / GRID_GAP + 39 / 2);
			const centerRow = Math.round(targetZ / GRID_GAP + 12);
			const halfColumns = 7;
			const halfRows = 9;
			const candidates = [];
			for (let row = Math.max(0, centerRow - halfRows); row <= Math.min(24, centerRow + halfRows); row += 1) for (let column = Math.max(0, centerColumn - halfColumns); column <= Math.min(39, centerColumn + halfColumns); column += 1) {
				const index = row * GRID_COLUMNS + column;
				if (index >= parcelsRef.current.length) continue;
				const dx = column - centerColumn;
				const dz = row - centerRow;
				candidates.push({
					index,
					distance: dx * dx + dz * dz
				});
			}
			candidates.sort((a, b) => a.distance - b.distance);
			const next = candidates.slice(0, Math.min(VISIBLE_PARCELS, parcelsRef.current.length));
			visibleIndexRef.length = 0;
			visibleIndexRef.push(...next.map((item) => item.index));
			visibleParcelsRef.current = visibleIndexRef.map((index) => parcelsRef.current[index]);
			for (let instance = 0; instance < mesh.count; instance += 1) {
				const parcelIndex = visibleIndexRef[instance];
				if (parcelIndex == null) {
					matrix.makeScale(0, 0, 0);
					mesh.setMatrixAt(instance, matrix);
					continue;
				}
				const position = domePosition(parcelIndex);
				matrix.makeTranslation(position.x, position.y, position.z);
				mesh.setMatrixAt(instance, matrix);
				color.copy(parcelColor(parcelsRef.current[parcelIndex].status));
				mesh.setColorAt(instance, color);
			}
			mesh.instanceMatrix.needsUpdate = true;
			if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
			setVisibleCount(visibleParcelsRef.current.length);
		};
		updateVisibleWindow();
		const onControlsChange = () => updateVisibleWindow();
		controls.addEventListener("change", onControlsChange);
		const raycaster = new Raycaster();
		const pointer = new Vector2();
		let pointerDown = {
			x: 0,
			y: 0
		};
		const onPointerDown = (event) => {
			pointerDown = {
				x: event.clientX,
				y: event.clientY
			};
		};
		const onPointerUp = (event) => {
			if (Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 8) return;
			const rect = renderer.domElement.getBoundingClientRect();
			pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
			pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
			raycaster.setFromCamera(pointer, camera);
			const hit = raycaster.intersectObject(mesh, false)[0];
			if (hit && hit.instanceId != null) setSelected(visibleParcelsRef.current[hit.instanceId] ?? null);
		};
		renderer.domElement.addEventListener("pointerdown", onPointerDown);
		renderer.domElement.addEventListener("pointerup", onPointerUp);
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
			controls.removeEventListener("change", onControlsChange);
			window.removeEventListener("resize", resize);
			renderer.domElement.removeEventListener("pointerdown", onPointerDown);
			renderer.domElement.removeEventListener("pointerup", onPointerUp);
			controls.dispose();
			geometry.dispose();
			material.dispose();
			renderer.dispose();
			renderer.domElement.remove();
		};
	}, [parcels]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "gokyuzu-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gokyuzu-sky" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: mountRef,
				className: "gokyuzu-canvas",
				"aria-label": "Gaziantep parsel dünyası"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "gokyuzu-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "gokyuzu-kicker",
						children: "MYSKYPARCEL · PARSEL DÜNYASI"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Gaziantep" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Dev parsel kubbesini sürükleyerek keşfet. Performans için aynı anda yalnızca sınırlı sayıda parsel ekranda tutulur." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "gokyuzu-stats",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: visibleCount.toLocaleString("tr-TR") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"ekranda · ",
						loaded.toLocaleString("tr-TR"),
						" Gaziantep parseli"
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "gokyuzu-city-label",
				children: "GAZİANTEP · TEST 01"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gokyuzu-legend",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "available" }), " Müsait"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sold" }), " Satılmış"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "reserved" }), " Rezerve"] })
				]
			}),
			loaded === 0 && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gokyuzu-loader",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "gokyuzu-loader-title",
					children: "Gaziantep parselleri yükleniyor…"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "İlk test yalnızca Gaziantep ile başlıyor." })]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "gokyuzu-error",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gokyuzu-controls",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "👆 Sürükle: yeni parseller" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "↕ Yaklaş / uzaklaş" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "👆 Parsel seç" })
				]
			}),
			selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "gokyuzu-detail",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "gokyuzu-close",
						onClick: () => setSelected(null),
						"aria-label": "Kapat",
						children: "×"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "detail-city",
						children: [
							selected.city_name,
							" · Katman ",
							selected.layer_number ?? "-",
							" · Sektör ",
							selected.sector_number ?? "-"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", { children: ["#", selected.parcel_number] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "detail-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Durum" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: selected.status === "sold" ? "Satılmış" : selected.status === "reserved" ? "Rezerve" : "Müsait" })]
					}),
					selected.price != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "detail-row",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Fiyat" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [selected.price.toLocaleString("tr-TR"), " ₺"] })]
					}),
					selected.status !== "sold" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "detail-action",
						href: `/parsel-satin-al?parcels=${encodeURIComponent(selected.id)}`,
						children: "Bu parseli incele"
					})
				]
			})
		]
	});
}
//#endregion
export { GokyuzuPage as component };
