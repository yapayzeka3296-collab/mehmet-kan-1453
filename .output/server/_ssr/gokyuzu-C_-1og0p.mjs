import { i as __toESM } from "../_runtime.mjs";
import { n as supabaseBrowser } from "./supabaseBrowser-BU58SfZL.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import "./router-71BQlnS-.mjs";
import { a as Color, c as Mesh, d as PlaneGeometry, f as Raycaster, g as Vector2, h as StaticDrawUsage, i as BoxGeometry, l as MeshBasicMaterial, m as Scene, n as WebGLRenderer, o as InstancedMesh, p as SRGBColorSpace, s as Matrix4, t as OrbitControls, u as PerspectiveCamera } from "../_libs/three.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gokyuzu-C_-1og0p.mjs
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
var import_jsx_runtime = require_jsx_runtime();
var PAGE_SIZE = 1e3;
var PARALLEL_PAGES = 8;
async function loadAllSkyParcels(onProgress) {
	const first = await supabaseBrowser.from("parcel_map_public").select("id,parcel_number,status,price,tier,city_name,layer_number,sector_number,grid_x,grid_y", { count: "exact" }).order("city_name", { ascending: true }).order("layer_number", { ascending: true }).order("sector_number", { ascending: true }).range(0, 999);
	if (first.error) throw new Error(`Parseller yüklenemedi: ${first.error.message}`);
	const total = first.count ?? first.data?.length ?? 0;
	const rows = first.data ?? [];
	onProgress?.(rows.length, total);
	if (rows.length >= total) return rows;
	const offsets = [];
	for (let offset = PAGE_SIZE; offset < total; offset += PAGE_SIZE) offsets.push(offset);
	for (let i = 0; i < offsets.length; i += PARALLEL_PAGES) {
		const batch = offsets.slice(i, i + PARALLEL_PAGES);
		const pages = await Promise.all(batch.map((offset) => supabaseBrowser.from("parcel_map_public").select("id,parcel_number,status,price,tier,city_name,layer_number,sector_number,grid_x,grid_y").order("city_name", { ascending: true }).order("layer_number", { ascending: true }).order("sector_number", { ascending: true }).range(offset, Math.min(offset + PAGE_SIZE - 1, total - 1))));
		for (const page of pages) {
			if (page.error) throw new Error(`Parseller yüklenemedi: ${page.error.message}`);
			rows.push(...page.data ?? []);
		}
		onProgress?.(Math.min(rows.length, total), total);
	}
	return rows;
}
var TOTAL_EXPECTED = 81e3;
var CLUSTER_GAP = 15;
var PARCEL_SIZE = .92;
var LAYER_HEIGHT = .42;
function parcelColor(status) {
	if (status === "sold") return new Color("#f59e0b");
	if (status === "reserved") return new Color("#a78bfa");
	return new Color("#38bdf8");
}
function GokyuzuPage() {
	const mountRef = (0, import_react.useRef)(null);
	const meshRef = (0, import_react.useRef)(null);
	const parcelIndexRef = (0, import_react.useRef)([]);
	const [parcels, setParcels] = (0, import_react.useState)([]);
	const [loaded, setLoaded] = (0, import_react.useState)(0);
	const [total, setTotal] = (0, import_react.useState)(TOTAL_EXPECTED);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const cityPositions = (0, import_react.useMemo)(() => {
		const names = [...new Set(parcels.map((parcel) => parcel.city_name))].sort((a, b) => a.localeCompare(b, "tr"));
		const positions = /* @__PURE__ */ new Map();
		names.forEach((name, index) => {
			const column = index % 9;
			const row = Math.floor(index / 9);
			positions.set(name, {
				x: (column - 4) * CLUSTER_GAP,
				z: (row - 4) * CLUSTER_GAP
			});
		});
		return positions;
	}, [parcels]);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		loadAllSkyParcels((current, count) => {
			if (cancelled) return;
			setLoaded(current);
			setTotal(count || TOTAL_EXPECTED);
		}).then((rows) => {
			if (!cancelled) {
				parcelIndexRef.current = rows;
				setParcels(rows);
				setLoaded(rows.length);
				setTotal(rows.length);
			}
		}).catch((cause) => {
			if (!cancelled) setError(cause instanceof Error ? cause.message : "81.000 parsel yüklenemedi.");
		});
		return () => {
			cancelled = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const mount = mountRef.current;
		if (!mount || parcels.length === 0) return;
		const scene = new Scene();
		const camera = new PerspectiveCamera(48, mount.clientWidth / mount.clientHeight, .1, 5e3);
		camera.position.set(0, 72, 78);
		const renderer = new WebGLRenderer({
			antialias: true,
			alpha: true,
			powerPreference: "high-performance"
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
		renderer.setSize(mount.clientWidth, mount.clientHeight);
		renderer.outputColorSpace = SRGBColorSpace;
		mount.appendChild(renderer.domElement);
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enableDamping = true;
		controls.dampingFactor = .06;
		controls.minDistance = 5;
		controls.maxDistance = 900;
		controls.maxPolarAngle = Math.PI * .49;
		controls.target.set(0, 0, 0);
		const geometry = new BoxGeometry(PARCEL_SIZE, .08, PARCEL_SIZE);
		const material = new MeshBasicMaterial({
			vertexColors: true,
			transparent: true,
			opacity: .92
		});
		const mesh = new InstancedMesh(geometry, material, parcels.length);
		mesh.instanceMatrix.setUsage(StaticDrawUsage);
		const matrix = new Matrix4();
		const color = new Color();
		parcels.forEach((parcel, index) => {
			const cluster = cityPositions.get(parcel.city_name) ?? {
				x: 0,
				z: 0
			};
			const sector = Math.max(1, parcel.sector_number ?? index % 100);
			const layer = Math.max(1, parcel.layer_number ?? Math.floor(index / 100) + 1);
			const localX = (sector - 1) % 10 * 1.05 - 4.72;
			const localZ = Math.floor((sector - 1) / 10) * 1.05 - 4.72;
			const y = (layer - 1) * LAYER_HEIGHT;
			matrix.makeTranslation(cluster.x + localX, y, cluster.z + localZ);
			mesh.setMatrixAt(index, matrix);
			color.copy(parcelColor(parcel.status));
			mesh.setColorAt(index, color);
		});
		mesh.instanceMatrix.needsUpdate = true;
		if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
		mesh.computeBoundingSphere();
		scene.add(mesh);
		meshRef.current = mesh;
		const ground = new Mesh(new PlaneGeometry(155, 155), new MeshBasicMaterial({
			color: "#0b2940",
			transparent: true,
			opacity: .24,
			side: 2
		}));
		ground.rotation.x = -Math.PI / 2;
		ground.position.y = -.12;
		scene.add(ground);
		const raycaster = new Raycaster();
		const pointer = new Vector2();
		const onPointer = (event) => {
			const rect = renderer.domElement.getBoundingClientRect();
			pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
			pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
			raycaster.setFromCamera(pointer, camera);
			const hit = raycaster.intersectObject(mesh, false)[0];
			if (hit && hit.instanceId != null) setSelected(parcelIndexRef.current[hit.instanceId] ?? null);
		};
		renderer.domElement.addEventListener("pointerup", onPointer);
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
			renderer.domElement.removeEventListener("pointerup", onPointer);
			controls.dispose();
			geometry.dispose();
			material.dispose();
			ground.geometry.dispose();
			ground.material.dispose();
			renderer.dispose();
			renderer.domElement.remove();
			meshRef.current = null;
		};
	}, [parcels, cityPositions]);
	const percent = total ? Math.min(100, Math.round(loaded / total * 100)) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "gokyuzu-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "gokyuzu-sky" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: mountRef,
				className: "gokyuzu-canvas",
				"aria-label": "81 bin MySkyParcel gökyüzü parsel haritası"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "gokyuzu-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "gokyuzu-kicker",
						children: "MYSKYPARCEL · PARSELLENMİŞ GÖKYÜZÜ"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Gökyüzü" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "81 ilin 81.000 mevcut parselini tek bir 3D gökyüzünde keşfet." })
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "gokyuzu-stats",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: loaded.toLocaleString("tr-TR") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"/ ",
						total.toLocaleString("tr-TR"),
						" parsel"
					] })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gokyuzu-legend",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "available" }), " Müsait"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "sold" }), " Satılmış"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "reserved" }), " Rezerve"] })
				]
			}),
			loaded < total && !error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gokyuzu-loader",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "gokyuzu-loader-title",
						children: ["81.000 parsel gökyüzüne yükleniyor… %", percent]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "gokyuzu-progress",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: { width: `${percent}%` } })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Veriler parça parça geliyor; ekran yükleme devam ederken kullanılabilir." })
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "gokyuzu-error",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "gokyuzu-controls",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "🖱️ Döndür" }),
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
