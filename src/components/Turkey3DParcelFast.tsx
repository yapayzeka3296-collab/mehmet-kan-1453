import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

const PROVINCES_GEOJSON = "/api/earth-assets?type=provinces";
const MAP_CENTER_LON = 35.4;
const MAP_CENTER_LAT = 39.0;
const MAP_SCALE = 0.34;
const CELL_SIZE = 0.025;
const BUILD_BATCH = 1800;

type RenderPayload = {
  parcel_number?: unknown[];
  status?: unknown[];
  tier?: unknown[];
  layer?: unknown[];
  lat?: unknown[];
  lon?: unknown[];
};

const project = (lon: number, lat: number) => ({ x: (lon - MAP_CENTER_LON) * MAP_SCALE, y: (lat - MAP_CENTER_LAT) * MAP_SCALE });

function parcelColor(status: number, tier: number): [number, number, number] {
  if (status === 1) return [1, 0.192, 0.341];
  if (status === 2) return [1, 0.651, 0.239];
  if (tier === 1) return [0.965, 0.769, 0.325];
  if (tier === 2) return [0.616, 0.486, 1];
  return [0.141, 0.839, 0.816];
}

function addRing(shape: THREE.Shape, ring: unknown[]) {
  if (!Array.isArray(ring) || ring.length < 3) return false;
  let valid = 0;
  for (const c of ring) {
    if (!Array.isArray(c)) continue;
    const p = project(Number(c[0]), Number(c[1]));
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    if (valid === 0) shape.moveTo(p.x, p.y); else shape.lineTo(p.x, p.y);
    valid++;
  }
  if (valid < 3) return false;
  shape.closePath();
  return true;
}

function addHole(shape: THREE.Shape, ring: unknown[]) {
  if (!Array.isArray(ring) || ring.length < 3) return;
  const path = new THREE.Path();
  let valid = 0;
  for (const c of ring) {
    if (!Array.isArray(c)) continue;
    const p = project(Number(c[0]), Number(c[1]));
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
    if (valid === 0) path.moveTo(p.x, p.y); else path.lineTo(p.x, p.y);
    valid++;
  }
  if (valid >= 3) { path.closePath(); shape.holes.push(path); }
}

export function Turkey3DParcelFast() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Türkiye 3D haritası hazırlanıyor…");
  const [selected, setSelected] = useState("Türkiye");
  const [provinceCount, setProvinceCount] = useState(0);
  const [parcelCount, setParcelCount] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let buildFrame = 0;
    let parcelTimer = 0;
    let parcelMesh: THREE.InstancedMesh | null = null;
    let parcelGeometry: THREE.BoxGeometry | null = null;
    let parcelMaterial: THREE.MeshStandardMaterial | null = null;
    let raf = 0;

    const parcelNumbers: string[] = [];
    let xs = new Float32Array(0);
    let ys = new Float32Array(0);
    let layers = new Uint8Array(0);
    let baseColors = new Float32Array(0);
    const spatial = new Map<number, number[]>();
    let hovered = -1;
    let selectedIndex = -1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020711);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
    camera.position.set(0, 0.55, 6.8);

    const isCoarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    const renderer = new THREE.WebGLRenderer({ antialias: !isCoarse, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCoarse ? 1.15 : 1.35));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.enablePan = false;
    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 0.72;
    controls.minDistance = 3.25;
    controls.maxDistance = 10.5;

    scene.add(new THREE.HemisphereLight(0x9ed8ff, 0x07101d, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 2.25);
    sun.position.set(3.5, 6, 5.5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x36b9ff, 0.9);
    rim.position.set(-5, 1, -3);
    scene.add(rim);

    const floor = new THREE.Mesh(new THREE.CircleGeometry(8.5, 48), new THREE.MeshBasicMaterial({ color: 0x03101d, transparent: true, opacity: 0.92 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.9;
    scene.add(floor);
    const ring = new THREE.Mesh(new THREE.RingGeometry(3.7, 3.73, 48), new THREE.MeshBasicMaterial({ color: 0x23d9ff, transparent: true, opacity: 0.32, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.86;
    scene.add(ring);

    const mapGroup = new THREE.Group();
    mapGroup.rotation.x = -0.12;
    mapGroup.rotation.z = -0.015;
    scene.add(mapGroup);

    const provinceMeshes: THREE.Mesh[] = [];
    const boundaryLines: THREE.Line[] = [];
    let provinceMaterial: THREE.MeshStandardMaterial | null = null;
    let lineMaterial: THREE.LineBasicMaterial | null = null;

    const loadProvinces = async () => {
      try {
        const response = await fetch(PROVINCES_GEOJSON, { cache: "force-cache" });
        if (!response.ok) throw new Error(`GeoJSON HTTP ${response.status}`);
        const data = await response.json();
        if (disposed) return;
        const features = Array.isArray(data?.features) ? data.features : [];
        const provinceNames = new Set<string>();
        provinceMaterial = new THREE.MeshStandardMaterial({ color: 0x155d62, roughness: 0.82, metalness: 0.05, emissive: 0x06252a, emissiveIntensity: 0.28, side: THREE.DoubleSide });
        lineMaterial = new THREE.LineBasicMaterial({ color: 0x7cf7ff, transparent: true, opacity: 0.62 });
        for (const feature of features) {
          const geometryData = feature?.geometry;
          if (!geometryData) continue;
          const name = String(feature?.properties?.name ?? feature?.properties?.NAME_1 ?? feature?.properties?.province ?? "");
          if (name) provinceNames.add(name);
          const polygons = geometryData.type === "Polygon" ? [geometryData.coordinates] : geometryData.type === "MultiPolygon" ? geometryData.coordinates : [];
          for (const polygon of polygons) {
            if (!Array.isArray(polygon)) continue;
            const shape = new THREE.Shape();
            if (!addRing(shape, polygon[0])) continue;
            for (let h = 1; h < polygon.length; h++) addHole(shape, polygon[h]);
            const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: false, curveSegments: 1 });
            const mesh = new THREE.Mesh(geometry, provinceMaterial);
            mesh.userData.provinceName = name;
            mapGroup.add(mesh);
            provinceMeshes.push(mesh);
            for (const boundary of polygon) {
              if (!Array.isArray(boundary) || boundary.length < 3) continue;
              const points: THREE.Vector3[] = [];
              for (const c of boundary) {
                if (!Array.isArray(c)) continue;
                const p = project(Number(c[0]), Number(c[1]));
                if (Number.isFinite(p.x) && Number.isFinite(p.y)) points.push(new THREE.Vector3(p.x, p.y, 0.145));
              }
              if (points.length > 2) {
                const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), lineMaterial);
                mapGroup.add(line);
                boundaryLines.push(line);
              }
            }
          }
        }
        setProvinceCount(provinceNames.size);
        setStatus(`${provinceNames.size || 81} il hazır · parseller yükleniyor…`);
      } catch (error) {
        console.error("Turkey provinces failed", error);
        if (!disposed) setStatus("Türkiye haritası yüklenemedi");
      }
    };
    void loadProvinces();

    const majorCities = [
      [28.9784, 41.0082, "İstanbul"], [32.8597, 39.9334, "Ankara"], [27.1428, 38.4237, "İzmir"],
      [29.06, 40.195, "Bursa"], [34.6415, 36.8121, "Mersin"], [37.3833, 37.0662, "Gaziantep"],
      [32.4932, 37.8746, "Konya"], [30.7133, 36.8969, "Antalya"], [35.3213, 37, "Adana"],
      [40.2306, 37.9144, "Diyarbakır"], [43.373, 38.5012, "Van"], [41.2679, 39.9043, "Erzurum"],
    ] as const;
    const cityDots = new THREE.Group();
    const cityGeometry = new THREE.SphereGeometry(0.035, 10, 6);
    const cityMaterial = new THREE.MeshBasicMaterial({ color: 0xffd76a });
    for (const [lon, lat, name] of majorCities) {
      const p = project(lon, lat);
      const marker = new THREE.Mesh(cityGeometry, cityMaterial);
      marker.position.set(p.x, p.y, 0.2);
      marker.userData.cityName = name;
      cityDots.add(marker);
    }
    mapGroup.add(cityDots);

    const buildSpatial = (x: number, y: number, index: number) => {
      const cx = Math.floor(x / CELL_SIZE);
      const cy = Math.floor(y / CELL_SIZE);
      const key = (cx + 512) * 2048 + (cy + 512);
      const bucket = spatial.get(key);
      if (bucket) bucket.push(index); else spatial.set(key, [index]);
    };

    const installParcels = async () => {
      try {
        setStatus("81 il hazır · 81.000 parsel verisi hazırlanıyor…");
        const { data, error } = await supabaseBrowser.rpc("get_public_parcels_render_map");
        if (error) throw error;
        if (disposed) return;
        const payload = (data ?? {}) as RenderPayload;
        const numbers = Array.isArray(payload.parcel_number) ? payload.parcel_number : [];
        const statuses = Array.isArray(payload.status) ? payload.status : [];
        const tiers = Array.isArray(payload.tier) ? payload.tier : [];
        const layerValues = Array.isArray(payload.layer) ? payload.layer : [];
        const latValues = Array.isArray(payload.lat) ? payload.lat : [];
        const lonValues = Array.isArray(payload.lon) ? payload.lon : [];
        const count = Math.min(numbers.length, statuses.length, tiers.length, layerValues.length, latValues.length, lonValues.length);
        if (!count) throw new Error("No parcel render rows returned");
        xs = new Float32Array(count);
        ys = new Float32Array(count);
        layers = new Uint8Array(count);
        baseColors = new Float32Array(count * 3);
        parcelNumbers.length = 0;
        spatial.clear();
        for (let i = 0; i < count; i++) {
          const p = project(Number(lonValues[i]), Number(latValues[i]));
          if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) continue;
          xs[i] = p.x;
          ys[i] = p.y;
          layers[i] = Math.min(10, Math.max(1, Number(layerValues[i]) || 1));
          parcelNumbers[i] = String(numbers[i] ?? `P-${i + 1}`);
          buildSpatial(p.x, p.y, i);
          const [r, g, b] = parcelColor(Number(statuses[i]) || 0, Number(tiers[i]) || 0);
          baseColors[i * 3] = r;
          baseColors[i * 3 + 1] = g;
          baseColors[i * 3 + 2] = b;
        }
        setParcelCount(count);
        parcelGeometry = new THREE.BoxGeometry(1, 1, 1);
        parcelMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0.05, emissive: 0x06151a, emissiveIntensity: 0.12 });
        const mesh = new THREE.InstancedMesh(parcelGeometry, parcelMaterial, count);
        mesh.count = 0;
        mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        const matrixArray = mesh.instanceMatrix.array as Float32Array;
        const colorAttribute = new THREE.InstancedBufferAttribute(new Float32Array(count * 3), 3);
        mesh.instanceColor = colorAttribute;
        parcelMesh = mesh;
        mapGroup.add(mesh);
        const buildNext = () => {
          if (disposed || !parcelMesh) return;
          const start = parcelMesh.count;
          const end = Math.min(count, start + BUILD_BATCH);
          for (let i = start; i < end; i++) {
            const depth = 0.025 + (layers[i] ?? 1) * 0.004;
            const offset = i * 16;
            matrixArray[offset] = 0.0051;
            matrixArray[offset + 5] = 0.0041;
            matrixArray[offset + 10] = depth;
            matrixArray[offset + 12] = xs[i] ?? 0;
            matrixArray[offset + 13] = ys[i] ?? 0;
            matrixArray[offset + 14] = 0.155 + depth / 2;
            matrixArray[offset + 15] = 1;
            const colorOffset = i * 3;
            colorAttribute.array[colorOffset] = baseColors[colorOffset] ?? 0.141;
            colorAttribute.array[colorOffset + 1] = baseColors[colorOffset + 1] ?? 0.839;
            colorAttribute.array[colorOffset + 2] = baseColors[colorOffset + 2] ?? 0.816;
          }
          parcelMesh.count = end;
          parcelMesh.instanceMatrix.needsUpdate = true;
          colorAttribute.needsUpdate = true;
          if (end < count) {
            if (end % (BUILD_BATCH * 5) === 0) setStatus(`Türkiye hazırlanıyor · ${end.toLocaleString("tr-TR")} / ${count.toLocaleString("tr-TR")} parsel`);
            buildFrame = requestAnimationFrame(buildNext);
          } else {
            parcelMesh.computeBoundingSphere();
            setStatus(`Türkiye hazır · ${count.toLocaleString("tr-TR")} parsel`);
          }
        };
        buildFrame = requestAnimationFrame(buildNext);
      } catch (error) {
        console.error("Turkey parcel render data failed", error);
        if (!disposed) setStatus("Parsel verisi yüklenemedi");
      }
    };
    parcelTimer = window.setTimeout(() => void installParcels(), 250);

    const plane = new THREE.Plane();
    const planeNormal = new THREE.Vector3();
    const planePoint = new THREE.Vector3();
    const worldPoint = new THREE.Vector3();
    const localPoint = new THREE.Vector3();
    const inverse = new THREE.Matrix4();
    const worldQuaternion = new THREE.Quaternion();
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let lastPick = 0;
    const findParcelAtPointer = (event: PointerEvent) => {
      if (!parcelMesh || !parcelMesh.count) return -1;
      const now = performance.now();
      if (event.type === "pointermove" && now - lastPick < 90) return hovered;
      lastPick = now;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      mapGroup.getWorldQuaternion(worldQuaternion);
      planeNormal.set(0, 0, 1).applyQuaternion(worldQuaternion).normalize();
      planePoint.set(0, 0, 0.16).applyMatrix4(mapGroup.matrixWorld);
      plane.setFromNormalAndCoplanarPoint(planeNormal, planePoint);
      if (!raycaster.ray.intersectPlane(plane, worldPoint)) return -1;
      inverse.copy(mapGroup.matrixWorld).invert();
      localPoint.copy(worldPoint).applyMatrix4(inverse);
      const cx = Math.floor(localPoint.x / CELL_SIZE);
      const cy = Math.floor(localPoint.y / CELL_SIZE);
      let best = -1;
      let bestDistance = Infinity;
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
        const key = (cx + dx + 512) * 2048 + (cy + dy + 512);
        const bucket = spatial.get(key);
        if (!bucket) continue;
        for (const index of bucket) {
          if (index >= parcelMesh.count) continue;
          const distance = Math.abs(localPoint.x - (xs[index] ?? 0)) + Math.abs(localPoint.y - (ys[index] ?? 0));
          if (distance < bestDistance) { bestDistance = distance; best = index; }
        }
      }
      return best;
    };

    const setInstanceColor = (index: number, color: [number, number, number]) => {
      if (!parcelMesh?.instanceColor || index < 0) return;
      const arr = parcelMesh.instanceColor.array as Float32Array;
      arr[index * 3] = color[0];
      arr[index * 3 + 1] = color[1];
      arr[index * 3 + 2] = color[2];
      parcelMesh.instanceColor.needsUpdate = true;
    };
    const restoreColor = (index: number) => {
      if (index < 0) return;
      setInstanceColor(index, [baseColors[index * 3] ?? 0.141, baseColors[index * 3 + 1] ?? 0.839, baseColors[index * 3 + 2] ?? 0.816]);
    };
    const onPointerMove = (event: PointerEvent) => {
      const next = findParcelAtPointer(event);
      if (next === hovered) return;
      restoreColor(hovered);
      hovered = next;
      if (hovered >= 0) setInstanceColor(hovered, [1, 0.95, 0.25]);
    };
    const onPointerDown = (event: PointerEvent) => {
      const next = findParcelAtPointer(event);
      if (next < 0) return;
      restoreColor(selectedIndex);
      selectedIndex = next;
      setInstanceColor(selectedIndex, [1, 0.95, 0.25]);
      setSelected(`Parsel ${parcelNumbers[selectedIndex] ?? selectedIndex + 1}`);
    };
    renderer.domElement.addEventListener("pointermove", onPointerMove, { passive: true });
    renderer.domElement.addEventListener("pointerdown", onPointerDown, { passive: true });

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    resize();

    const render = () => {
      if (disposed) return;
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      disposed = true;
      window.clearTimeout(parcelTimer);
      cancelAnimationFrame(buildFrame);
      cancelAnimationFrame(raf);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      resizeObserver.disconnect();
      controls.dispose();
      provinceMeshes.forEach((mesh) => mesh.geometry.dispose());
      boundaryLines.forEach((line) => line.geometry.dispose());
      provinceMaterial?.dispose();
      lineMaterial?.dispose();
      cityGeometry.dispose();
      cityMaterial.dispose();
      parcelGeometry?.dispose();
      parcelMaterial?.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-slate-950">
      <div ref={mountRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between gap-3 p-4">
        <div className="rounded-2xl border border-cyan-400/20 bg-slate-950/75 px-4 py-3 shadow-2xl backdrop-blur-md">
          <div className="text-xs uppercase tracking-[0.22em] text-cyan-300">MySkyParcel</div>
          <div className="mt-1 text-lg font-semibold text-white">3D Türkiye Parsel Haritası</div>
          <div className="mt-1 text-xs text-slate-300">{status}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-right text-xs text-slate-300 backdrop-blur-md">
          <div>{provinceCount || 81} il</div>
          <div className="mt-1 text-cyan-300">{parcelCount.toLocaleString("tr-TR")} parsel</div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center p-4">
        <div className="rounded-full border border-white/10 bg-slate-950/70 px-4 py-2 text-xs text-slate-300 backdrop-blur-md">
          Döndür · yakınlaştır · parselin üzerine gel veya tıkla · <span className="text-cyan-300">{selected}</span>
        </div>
      </div>
    </section>
  );
}
