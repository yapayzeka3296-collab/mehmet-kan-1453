import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const PROVINCES_GEOJSON = "/api/earth-assets?type=provinces";
const LON_MIN = 25.7;
const LON_MAX = 45.1;
const LAT_MIN = 35.5;
const LAT_MAX = 42.2;
const SCALE_X = 0.31;
const SCALE_Y = 0.52;

function project(lng: number, lat: number) {
  return new THREE.Vector2((lng - 35.4) * SCALE_X, (lat - 38.85) * SCALE_Y);
}

function safeName(feature: any, index: number) {
  const p = feature?.properties ?? {};
  return String(p.name ?? p.NAME_1 ?? p.province ?? p.il ?? `İl ${index + 1}`);
}

function relief(lng: number, lat: number) {
  const a = Math.sin(lng * 1.73 + lat * 0.91);
  const b = Math.sin(lng * 3.71 - lat * 1.37);
  const c = Math.cos(lng * 0.77 + lat * 2.41);
  return 0.07 + Math.max(0, (a * 0.5 + b * 0.3 + c * 0.2 + 1) * 0.5) * 0.16;
}

export function Turkey3DParcelExperience() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Türkiye 3D haritası hazırlanıyor…");
  const [selected, setSelected] = useState("Türkiye");
  const [provinceCount, setProvinceCount] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020711);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
    camera.position.set(0, 0.55, 6.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
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
    controls.minDistance = 4.0;
    controls.maxDistance = 10.5;
    controls.target.set(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0x9ed8ff, 0x07101d, 1.25));
    const sun = new THREE.DirectionalLight(0xffffff, 2.8);
    sun.position.set(3.5, 6, 5.5);
    scene.add(sun);
    const rim = new THREE.DirectionalLight(0x36b9ff, 1.15);
    rim.position.set(-5, 1, -3);
    scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(8.5, 96),
      new THREE.MeshBasicMaterial({ color: 0x03101d, transparent: true, opacity: 0.92 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.9;
    scene.add(floor);

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(3.7, 3.73, 96),
      new THREE.MeshBasicMaterial({ color: 0x23d9ff, transparent: true, opacity: 0.32, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -0.86;
    scene.add(ring);

    const mapGroup = new THREE.Group();
    mapGroup.rotation.x = -0.17;
    mapGroup.rotation.z = -0.035;
    scene.add(mapGroup);

    const glowGroup = new THREE.Group();
    mapGroup.add(glowGroup);
    const provinceMeshes: THREE.Mesh[] = [];
    const provinceNames = new Map<THREE.Object3D, string>();

    const addFeature = (feature: any, index: number) => {
      const geometry = feature?.geometry;
      if (!geometry) return;
      const name = safeName(feature, index);
      const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.type === "MultiPolygon" ? geometry.coordinates : [];

      for (const polygon of polygons) {
        const outer = polygon?.[0];
        if (!Array.isArray(outer) || outer.length < 3) continue;
        const shape = new THREE.Shape();
        let avgLon = 0;
        let avgLat = 0;
        let valid = 0;
        for (const coordinate of outer) {
          const lng = Number(coordinate?.[0]);
          const lat = Number(coordinate?.[1]);
          if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
          const p = project(lng, lat);
          if (valid === 0) shape.moveTo(p.x, p.y); else shape.lineTo(p.x, p.y);
          avgLon += lng;
          avgLat += lat;
          valid++;
        }
        if (valid < 3) continue;
        shape.closePath();
        avgLon /= valid;
        avgLat /= valid;

        const depth = relief(avgLon, avgLat);
        const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 2 });
        geo.computeVertexNormals();
        const material = new THREE.MeshStandardMaterial({
          color: 0x155d62,
          roughness: 0.82,
          metalness: 0.05,
          emissive: 0x06252a,
          emissiveIntensity: 0.28,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geo, material);
        mesh.userData.provinceName = name;
        mesh.userData.center = { lng: avgLon, lat: avgLat };
        mapGroup.add(mesh);
        provinceMeshes.push(mesh);
        provinceNames.set(mesh, name);

        const points: THREE.Vector3[] = [];
        for (const coordinate of outer) {
          const lng = Number(coordinate?.[0]);
          const lat = Number(coordinate?.[1]);
          if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
          const p = project(lng, lat);
          points.push(new THREE.Vector3(p.x, p.y, depth + 0.025));
        }
        if (points.length > 2) {
          const outline = new THREE.LineLoop(
            new THREE.BufferGeometry().setFromPoints(points),
            new THREE.LineBasicMaterial({ color: 0x7cf7ff, transparent: true, opacity: 0.62 })
          );
          mapGroup.add(outline);
        }
      }
    };

    fetch(PROVINCES_GEOJSON)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`GeoJSON HTTP ${r.status}`))))
      .then((data) => {
        if (disposed) return;
        (data.features ?? []).forEach(addFeature);
        setProvinceCount(provinceMeshes.length);
        setStatus(provinceMeshes.length === 81 ? "Türkiye hazır · 81 il" : `Türkiye hazır · ${provinceMeshes.length} il`);
      })
      .catch((error) => {
        console.error("Turkey 3D GeoJSON failed", error);
        if (!disposed) setStatus("Türkiye haritası yüklenemedi");
      });

    const cityDots = new THREE.Group();
    mapGroup.add(cityDots);
    const majorCities = [
      [28.9784,41.0082,"İstanbul"],[32.8597,39.9334,"Ankara"],[27.1428,38.4237,"İzmir"],[29.06,40.195,"Bursa"],
      [34.6415,36.8121,"Mersin"],[37.3833,37.0662,"Gaziantep"],[32.4932,37.8746,"Konya"],[30.7133,36.8969,"Antalya"],
      [35.3213,37,"Adana"],[40.2306,37.9144,"Diyarbakır"],[43.373,38.5012,"Van"],[41.2679,39.9043,"Erzurum"]
    ] as const;
    for (const [lng, lat, name] of majorCities) {
      const p = project(lng, lat);
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd76a }));
      marker.position.set(p.x, p.y, 0.34);
      marker.userData.cityName = name;
      cityDots.add(marker);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(provinceMeshes, false)[0];
      renderer.domElement.style.cursor = hit ? "pointer" : "grab";
      for (const mesh of provinceMeshes) {
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = hit?.object === mesh ? 0.95 : 0.28;
        material.color.setHex(hit?.object === mesh ? 0x28a9a2 : 0x155d62);
      }
    };
    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(provinceMeshes, false)[0];
      if (hit) setSelected(provinceNames.get(hit.object) ?? "Türkiye");
    };
    renderer.domElement.addEventListener("pointermove", onMove);
    renderer.domElement.addEventListener("click", onClick);

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
      glowGroup.rotation.z -= 0.00005;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointermove", onMove);
      renderer.domElement.removeEventListener("click", onClick);
      controls.dispose();
      provinceMeshes.forEach((mesh) => { mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); });
      scene.traverse((object) => {
        if (object instanceof THREE.LineLoop) { object.geometry.dispose(); (object.material as THREE.Material).dispose(); }
        if (object instanceof THREE.Mesh && object !== floor && object !== ring && provinceMeshes.indexOf(object) === -1) { object.geometry.dispose(); (object.material as THREE.Material).dispose(); }
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
            {provinceCount || 81}/81 il
          </div>
        </div>

        <div ref={mountRef} className="h-[620px] w-full sm:h-[700px]" aria-label="MySkyParcel 3D Türkiye haritası" />

        <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="rounded-2xl border border-white/10 bg-black/45 px-4 py-3 backdrop-blur-xl">
            <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-200/60">Seçili bölge</div>
            <div className="mt-1 text-base font-semibold text-white">{selected}</div>
            <div className="mt-1 text-[11px] text-white/55">{status}</div>
          </div>
          <div className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[10px] text-white/65 backdrop-blur-xl">
            Döndür · yakınlaştır · uzaklaştır · il seç
          </div>
        </div>
      </div>
    </main>
  );
}
