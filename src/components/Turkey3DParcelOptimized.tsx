import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

const PROVINCES_GEOJSON = "/api/earth-assets?type=provinces";
const MAP_CENTER_LON = 35.4;
const MAP_CENTER_LAT = 39.0;
const MAP_SCALE = 0.34;
const CELL_SIZE = 0.025;

type Parcel = {
  id: string;
  parcelNumber: string;
  status: string;
  tier: string;
  cityName: string;
  layer: number;
  lat: number;
  lon: number;
};

const project = (lon: number, lat: number) =>
  new THREE.Vector2((lon - MAP_CENTER_LON) * MAP_SCALE, (lat - MAP_CENTER_LAT) * MAP_SCALE);

const colorFor = (p: Parcel) => {
  if (p.status === "sold") return 0xff3157;
  if (p.status === "reserved") return 0xffa63d;
  if (p.tier === "premium") return 0xf6c453;
  if (p.tier === "elite") return 0x9d7cff;
  return 0x24d6d0;
};

function addRing(shape: THREE.Shape, ring: any[]) {
  if (!Array.isArray(ring) || ring.length < 3) return false;
  let valid = 0;
  for (const c of ring) {
    const lon = Number(c?.[0]);
    const lat = Number(c?.[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    const p = project(lon, lat);
    valid === 0 ? shape.moveTo(p.x, p.y) : shape.lineTo(p.x, p.y);
    valid++;
  }
  if (valid < 3) return false;
  shape.closePath();
  return true;
}

function addHole(shape: THREE.Shape, ring: any[]) {
  if (!Array.isArray(ring) || ring.length < 3) return;
  const path = new THREE.Path();
  let valid = 0;
  for (const c of ring) {
    const lon = Number(c?.[0]);
    const lat = Number(c?.[1]);
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
    const p = project(lon, lat);
    valid === 0 ? path.moveTo(p.x, p.y) : path.lineTo(p.x, p.y);
    valid++;
  }
  if (valid >= 3) {
    path.closePath();
    shape.holes.push(path);
  }
}

export function Turkey3DParcelOptimized() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Türkiye 3D haritası hazırlanıyor…");
  const [selected, setSelected] = useState("Türkiye");
  const [provinceCount, setProvinceCount] = useState(0);
  const [parcelCount, setParcelCount] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    let idleId: number | undefined;
    let parcelMesh: THREE.InstancedMesh | null = null;
    let parcelGeometry: THREE.BoxGeometry | null = null;
    let parcelMaterial: THREE.MeshStandardMaterial | null = null;
    const parcels: Parcel[] = [];
    const baseColors: number[] = [];
    const spatial = new Map<string, number[]>();
    let selectedInstance = -1;
    let hoveredInstance = -1;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020711);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
    camera.position.set(0, 0.55, 6.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
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

    scene.add(new THREE.HemisphereLight(0x9ed8ff, 0x07101d, 1.25));
    const sun = new THREE.DirectionalLight(0xffffff, 2.8);
    sun.position.set(3.5, 6, 5.5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x36b9ff, 1.15);
    rim.position.set(-5, 1, -3);
    scene.add(rim);

    const floor = new THREE.Mesh(new THREE.CircleGeometry(8.5, 64), new THREE.MeshBasicMaterial({ color: 0x03101d, transparent: true, opacity: 0.92 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.9;
    scene.add(floor);

    const ring = new THREE.Mesh(new THREE.RingGeometry(3.7, 3.73, 64), new THREE.MeshBasicMaterial({ color: 0x23d9ff, transparent: true, opacity: 0.32, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.86;
    scene.add(ring);

    const mapGroup = new THREE.Group();
    mapGroup.rotation.x = -0.12;
    mapGroup.rotation.z = -0.015;
    scene.add(mapGroup);

    const provinceMeshes: THREE.Mesh[] = [];
    const loadProvinces = async () => {
      try {
        const r = await fetch(PROVINCES_GEOJSON);
        if (!r.ok) throw new Error(`GeoJSON HTTP ${r.status}`);
        const data = await r.json();
        if (disposed) return;
        const features = Array.isArray(data?.features) ? data.features : [];
        for (let i = 0; i < features.length; i++) {
          const feature = features[i];
          const g = feature?.geometry;
          if (!g) continue;
          const name = String(feature?.properties?.name ?? feature?.properties?.NAME_1 ?? feature?.properties?.province ?? `İl ${i + 1}`);
          const polygons = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
          for (const polygon of polygons) {
            const shape = new THREE.Shape();
            if (!addRing(shape, polygon?.[0])) continue;
            for (let h = 1; h < polygon.length; h++) addHole(shape, polygon[h]);
            const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 1, curveSegments: 1 });
            const material = new THREE.MeshStandardMaterial({ color: 0x155d62, roughness: 0.82, metalness: 0.05, emissive: 0x06252a, emissiveIntensity: 0.28, side: THREE.DoubleSide });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.userData.provinceName = name;
            mapGroup.add(mesh);
            provinceMeshes.push(mesh);
            for (const boundary of polygon) {
              if (!Array.isArray(boundary) || boundary.length < 3) continue;
              const points: THREE.Vector3[] = [];
              for (const c of boundary) {
                const p = project(Number(c?.[0]), Number(c?.[1]));
                if (Number.isFinite(p.x) && Number.isFinite(p.y)) points.push(new THREE.Vector3(p.x, p.y, 0.145));
              }
              if (points.length > 2) mapGroup.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0x7cf7ff, transparent: true, opacity: 0.62 })));
            }
          }
        }
        setProvinceCount(new Set(features.map((f: any, i: number) => String(f?.properties?.name ?? f?.properties?.NAME_1 ?? f?.properties?.province ?? `İl ${i + 1}`))).size);
        setStatus("81 il hazır · parseller arka planda yükleniyor…");
      } catch (e) {
        console.error("Turkey provinces failed", e);
        if (!disposed) setStatus("Türkiye haritası yüklenemedi");
      }
    };
    void loadProvinces();

    const majorCities = [[28.9784,41.0082,"İstanbul"],[32.8597,39.9334,"Ankara"],[27.1428,38.4237,"İzmir"],[29.06,40.195,"Bursa"],[34.6415,36.8121,"Mersin"],[37.3833,37.0662,"Gaziantep"],[32.4932,37.8746,"Konya"],[30.7133,36.8969,"Antalya"],[35.3213,37,"Adana"],[40.2306,37.9144,"Diyarbakır"],[43.373,38.5012,"Van"],[41.2679,39.9043,"Erzurum"]] as const;
    const cityDots = new THREE.Group();
    for (const [lon, lat, name] of majorCities) {
      const p = project(lon, lat);
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffd76a }));
      marker.position.set(p.x, p.y, 0.2);
      marker.userData.cityName = name;
      cityDots.add(marker);
    }
    mapGroup.add(cityDots);

    const restore = (id: number) => {
      if (!parcelMesh || !parcelMesh.instanceColor || id < 0) return;
      parcelMesh.setColorAt(id, new THREE.Color(baseColors[id] ?? 0x24d6d0));
    };
    const highlight = (id: number, hex: number) => {
      if (!parcelMesh || !parcelMesh.instanceColor || id < 0) return;
      parcelMesh.setColorAt(id, new THREE.Color(hex));
    };
    const spatialKey = (x: number, y: number) => `${Math.floor(x / CELL_SIZE)},${Math.floor(y / CELL_SIZE)}`;

    const buildParcels = async () => {
      try {
        const { data, error } = await supabaseBrowser.rpc("get_public_parcels_map");
        if (error) throw error;
        if (disposed) return;
        const rows = Array.isArray(data) ? data : [];
        for (const row of rows) {
          const lon = Number(row?.[7]);
          const lat = Number(row?.[6]);
          if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;
          const p: Parcel = { id: String(row?.[0] ?? ""), parcelNumber: String(row?.[1] ?? ""), status: String(row?.[2] ?? "available"), tier: String(row?.[3] ?? "digital"), cityName: String(row?.[4] ?? ""), layer: Math.min(10, Math.max(1, Number(row?.[5] ?? 1))), lat, lon };
          const index = parcels.length;
          parcels.push(p);
          const pos = project(lon, lat);
          const key = spatialKey(pos.x, pos.y);
          const bucket = spatial.get(key);
          bucket ? bucket.push(index) : spatial.set(key, [index]);
        }
        setParcelCount(parcels.length);
        if (!parcels.length) {
          setStatus("81 il hazır · parsel verisi bulunamadı");
          return;
        }

        parcelGeometry = new THREE.BoxGeometry(1, 1, 1);
        parcelMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0.05, emissive: 0x06151a, emissiveIntensity: 0.12 });
        parcelMesh = new THREE.InstancedMesh(parcelGeometry, parcelMaterial, parcels.length);
        parcelMesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
        const matrix = new THREE.Matrix4();
        const quaternion = new THREE.Quaternion();
        const color = new THREE.Color();
        for (let i = 0; i < parcels.length; i++) {
          const p = parcels[i];
          const pos = project(p.lon, p.lat);
          const depth = 0.025 + p.layer * 0.004;
          matrix.compose(new THREE.Vector3(pos.x, pos.y, 0.155 + depth / 2), quaternion, new THREE.Vector3(0.0051, 0.0041, depth));
          parcelMesh.setMatrixAt(i, matrix);
          const hex = colorFor(p);
          baseColors[i] = hex;
          color.setHex(hex);
          parcelMesh.setColorAt(i, color);
        }
        parcelMesh.instanceMatrix.needsUpdate = true;
        parcelMesh.instanceColor!.needsUpdate = true;
        parcelMesh.computeBoundingSphere();
        mapGroup.add(parcelMesh);
        setStatus(`Türkiye hazır · ${parcels.length.toLocaleString("tr-TR")} parsel`);
      } catch (e) {
        console.error("Compact parcel map failed", e);
        if (!disposed) setStatus("Parsel verisi yüklenemedi");
      }
    };

    const startParcelLoad = () => void buildParcels();
    if ("requestIdleCallback" in window) idleId = window.requestIdleCallback(startParcelLoad, { timeout: 1800 });
    else window.setTimeout(startParcelLoad, 350);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const worldPoint = new THREE.Vector3();
    const localPoint = new THREE.Vector3();
    const planeNormal = new THREE.Vector3();
    const planePoint = new THREE.Vector3();
    const plane = new THREE.Plane();
    const inverse = new THREE.Matrix4();
    let lastPick = 0;

    const pickParcel = (event: PointerEvent) => {
      if (!parcelMesh || !parcels.length) return -1;
      const now = performance.now();
      if (event.type === "pointermove" && now - lastPick < 45) return hoveredInstance;
      lastPick = now;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      planeNormal.set(0, 0, 1).applyQuaternion(mapGroup.getWorldQuaternion(new THREE.Quaternion())).normalize();
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
        const bucket = spatial.get(`${cx + dx},${cy + dy}`);
        if (!bucket) continue;
        for (const id of bucket) {
          const p = parcels[id];
          const pp = project(p.lon, p.lat);
          const d = (pp.x - localPoint.x) ** 2 + (pp.y - localPoint.y) ** 2;
          if (d < bestDistance) { bestDistance = d; best = id; }
        }
      }
      return best;
    };

    const onMove = (event: PointerEvent) => {
      const id = pickParcel(event);
      renderer.domElement.style.cursor = id >= 0 ? "pointer" : "grab";
      if (id === hoveredInstance) return;
      if (hoveredInstance >= 0 && hoveredInstance !== selectedInstance) restore(hoveredInstance);
      hoveredInstance = id;
      if (hoveredInstance >= 0 && hoveredInstance !== selectedInstance) highlight(hoveredInstance, 0xffffff);
      if (parcelMesh?.instanceColor) parcelMesh.instanceColor.needsUpdate = true;
    };
    const onClick = (event: PointerEvent) => {
      const id = pickParcel(event);
      if (id < 0 || !parcelMesh) return;
      if (selectedInstance >= 0) restore(selectedInstance);
      selectedInstance = id;
      highlight(id, 0xffd45a);
      parcelMesh.instanceColor!.needsUpdate = true;
      const p = parcels[id];
      setSelected(`${p.cityName} · ${p.parcelNumber}`);
    };
    renderer.domElement.addEventListener("pointermove", onMove, { passive: true });
    renderer.domElement.addEventListener("pointerup", onClick, { passive: true });

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
    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.update();
      ring.rotation.z += 0.0008;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      if (idleId !== undefined && "cancelIdleCallback" in window) window.cancelIdleCallback(idleId);
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("pointerup", onClick);
      controls.dispose();
      if (parcelMesh) mapGroup.remove(parcelMesh);
      parcelGeometry?.dispose();
      parcelMaterial?.dispose();
      provinceMeshes.forEach((m) => { m.geometry.dispose(); (m.material as THREE.Material).dispose(); });
      scene.traverse((o) => {
        if (o instanceof THREE.LineLoop) { o.geometry.dispose(); (o.material as THREE.Material).dispose(); }
        if (o instanceof THREE.Mesh && !provinceMeshes.includes(o) && o !== parcelMesh) { o.geometry.dispose(); (o.material as THREE.Material).dispose(); }
      });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[28px] border border-cyan-300/15 bg-[#020711] shadow-2xl shadow-black/50">
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4 sm:p-5">
          <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-xl">
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-200/70">MySkyParcel</div>
            <div className="mt-1 text-lg font-semibold text-white">3D Türkiye Gökyüzü Haritası</div>
          </div>
          <div className="rounded-full border border-cyan-200/15 bg-black/35 px-3 py-2 text-[11px] text-cyan-100 backdrop-blur-xl">
            {provinceCount ? `${provinceCount}/81 il` : "Yükleniyor…"}
          </div>
        </div>
        <div ref={mountRef} className="h-[620px] w-full sm:h-[700px]" aria-label="MySkyParcel 3D Türkiye haritası" />
        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-xl">
            <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/60">Seçili parsel</div>
            <div className="mt-1 text-base font-semibold text-white">{selected}</div>
            <div className="mt-1 text-xs text-cyan-100/60">{parcelCount ? `${parcelCount.toLocaleString("tr-TR")} gerçek parsel` : status}</div>
          </div>
          <div className="rounded-full border border-white/10 bg-black/45 px-3 py-2 text-[11px] text-white/70 backdrop-blur-xl">Döndür · Yaklaştır · Parsel seç</div>
        </div>
      </div>
    </main>
  );
}
