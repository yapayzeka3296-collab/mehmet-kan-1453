import { createFileRoute, Link } from '@tanstack/react-router';
import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import './gokyuzu.css';

export const Route = createFileRoute('/gokyuzu')({ component: GokyuzuPage });

const SKY_IMAGE_URL =
  'https://cdn.polyhaven.com/asset_img/primary/kloppenheim_03_puresky.png?height=2048';

// Current live world: 81 provinces × 1,000 real Supabase parcels = 81,000.
// Each province is a 40 × 25 grid, so every current world square has one
// deterministic city/grid coordinate and one unique real parcel record.
const CITY_COUNT = 81;
const REAL_PARCELS_PER_CITY = 1_000;
const CITY_GRID_WIDTH = 40;
const CITY_GRID_HEIGHT = 25;
const CITY_BLOCKS = 9;
const PARCEL_COLUMNS = CITY_BLOCKS * CITY_GRID_WIDTH;
const PARCEL_ROWS = CITY_BLOCKS * CITY_GRID_HEIGHT;
const REAL_PARCEL_COUNT = CITY_COUNT * REAL_PARCELS_PER_CITY;

const TILE_SIZE = 10;
const VISIBLE_X = 18;
const VISIBLE_Z = 14;

type RealSkyParcel = {
  id: string;
  parcel_number: string;
  status: string;
  price: number | null;
  tier: string | null;
  city_name: string | null;
  city_code: string | null;
  layer_number: number | null;
  sector_number: number | null;
  grid_x: number | null;
  grid_y: number | null;
};

function GokyuzuPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedParcel, setSelectedParcel] = useState<RealSkyParcel | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      52,
      Math.max(mount.clientWidth, 1) / Math.max(mount.clientHeight, 1),
      0.1,
      20000,
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.cursor = 'grab';
    mount.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const skyTexture = loader.load(SKY_IMAGE_URL);
    skyTexture.colorSpace = THREE.SRGBColorSpace;
    skyTexture.mapping = THREE.EquirectangularReflectionMapping;

    const skyGeometry = new THREE.SphereGeometry(8000, 48, 24);
    skyGeometry.scale(-1, 1, 1);
    const skyMaterial = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(skyGeometry, skyMaterial));

    const cameraTarget = new THREE.Vector3(0, 2.5, 0);
    camera.position.set(0, 32, 34);
    camera.lookAt(cameraTarget);

    // The parcel world is centered on its own pivot. Logical parcel coordinates
    // are translated into local coordinates around the current center, so
    // visual movement and Supabase data use the same coordinate system.
    const parcelGroup = new THREE.Group();
    scene.add(parcelGroup);

    const specialProvinceNumbers: Record<string, number> = {
      ANK: 6,
      ANT: 7,
      BUR: 16,
      GZT: 27,
      IST: 34,
      IZM: 35,
      KAY: 38,
    };

    type CityDefinition = { name: string; code: string; provinceNumber: number };
    let cities: CityDefinition[] = [];
    let citiesLoaded = false;

    const loadCities = async () => {
      if (citiesLoaded) return cities;
      const result = await supabaseBrowser
        .from('cities')
        .select('name,code')
        .eq('is_active', true);

      if (result.error) throw new Error('İller yüklenemedi: ' + result.error.message);

      cities = (result.data ?? [])
        .map((city) => {
          const numericCode = Number(city.code);
          const provinceNumber = specialProvinceNumbers[city.code] ?? (
            Number.isFinite(numericCode) ? numericCode : Number.NaN
          );
          return {
            name: city.name,
            code: city.code,
            provinceNumber,
          };
        })
        .filter((city) => Number.isInteger(city.provinceNumber) && city.provinceNumber >= 1 && city.provinceNumber <= CITY_COUNT)
        .sort((a, b) => a.provinceNumber - b.provinceNumber);

      const provinceNumbers = new Set(cities.map((city) => city.provinceNumber));
      if (cities.length !== CITY_COUNT || provinceNumbers.size !== CITY_COUNT) {
        throw new Error(`81 il eşleştirmesi tamamlanamadı: ${cities.length} aktif il bulundu.`);
      }

      citiesLoaded = true;
      return cities;
    };

    const getCityDefinition = (cityIndex: number) => cities[cityIndex];

    // Current logical center is an integer parcel coordinate. visualOffset keeps
    // the drag continuous between tile boundaries; when a full tile is crossed,
    // the logical center changes and only the affected Supabase window is fetched.
    let centerColumn = 20;
    let centerRow = 12;
    let visualOffsetX = 0;
    let visualOffsetZ = 0;
    let rotationY = 0;
    let rotationX = 0;

    const setZoom = (distance: number) => {
      const clamped = THREE.MathUtils.clamp(distance, 18, 120);
      camera.position.y = THREE.MathUtils.clamp(clamped * 0.9, 14, 90);
      camera.position.z = clamped;
      camera.lookAt(cameraTarget);
    };

    let dragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let dragMoved = false;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchDistance: number | null = null;

    const shiftLogicalCenter = (axis: 'x' | 'z', delta: number) => {
      if (axis === 'x') {
        centerColumn = THREE.MathUtils.clamp(centerColumn + delta, 0, PARCEL_COLUMNS - 1);
      } else {
        centerRow = THREE.MathUtils.clamp(centerRow + delta, 0, PARCEL_ROWS - 1);
      }
    };

    const applyVisualDrag = (dx: number, dy: number) => {
      visualOffsetX += dx * 0.08;
      visualOffsetZ += dy * 0.08;

      while (Math.abs(visualOffsetX) >= TILE_SIZE) {
        const step = visualOffsetX > 0 ? -1 : 1;
        shiftLogicalCenter('x', step);
        visualOffsetX += step * TILE_SIZE;
      }
      while (Math.abs(visualOffsetZ) >= TILE_SIZE) {
        const step = visualOffsetZ > 0 ? -1 : 1;
        shiftLogicalCenter('z', step);
        visualOffsetZ += step * TILE_SIZE;
      }

      // Small controlled pitch/yaw gives the centered grid a globe-like feel
      // without moving the camera or disconnecting parcel data from the world.
      rotationY = THREE.MathUtils.clamp(rotationY + dx * 0.0025, -0.65, 0.65);
      rotationX = THREE.MathUtils.clamp(rotationX + dy * 0.0018, -0.38, 0.38);
      parcelGroup.rotation.y = rotationY;
      parcelGroup.rotation.x = rotationX;
      void updateVisibleParcels();
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const current = Math.max(18, camera.position.z);
      setZoom(current + THREE.MathUtils.clamp(event.deltaY, -160, 160) * 0.08);
    };

    const onPointerDown = (event: PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      try { renderer.domElement.setPointerCapture(event.pointerId); } catch { /* unsupported */ }

      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDistance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
        dragging = false;
        return;
      }

      dragging = true;
      dragMoved = false;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onPointerMove = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;
      event.preventDefault();
      event.stopPropagation();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 2 && pinchDistance) {
        const [a, b] = [...pointers.values()];
        const distance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
        const current = Math.max(18, camera.position.z);
        setZoom(current / (distance / pinchDistance));
        pinchDistance = distance;
        return;
      }

      if (!dragging) return;
      const dx = event.clientX - lastPointerX;
      const dy = event.clientY - lastPointerY;
      if (Math.hypot(dx, dy) > 1) dragMoved = true;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      applyVisualDrag(dx, dy);
    };

    const onPointerUp = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinchDistance = null;
      dragging = pointers.size === 1;
      if (dragging) {
        const remaining = [...pointers.values()][0];
        lastPointerX = remaining.x;
        lastPointerY = remaining.y;
      } else {
        renderer.domElement.style.cursor = 'grab';
      }
      try { renderer.domElement.releasePointerCapture(event.pointerId); } catch { /* unsupported */ }
    };

    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);

    const parcelCache = new Map<number, Map<string, RealSkyParcel>>();
    const loadedRanges = new Set<string>();
    const loadingRanges = new Set<string>();

    const loadCityParcels = async (
      cityIndex: number,
      minX: number,
      maxX: number,
      minY: number,
      maxY: number,
    ) => {
      const city = getCityDefinition(cityIndex);
      if (!city) return;

      const key = [
        cityIndex,
        THREE.MathUtils.clamp(Math.floor(minX), 0, CITY_GRID_WIDTH - 1),
        THREE.MathUtils.clamp(Math.floor(maxX), 0, CITY_GRID_WIDTH - 1),
        THREE.MathUtils.clamp(Math.floor(minY), 0, CITY_GRID_HEIGHT - 1),
        THREE.MathUtils.clamp(Math.floor(maxY), 0, CITY_GRID_HEIGHT - 1),
      ].join(':');

      if (loadedRanges.has(key) || loadingRanges.has(key)) return;
      loadingRanges.add(key);

      try {
        const safeMinX = THREE.MathUtils.clamp(Math.floor(minX), 0, CITY_GRID_WIDTH - 1);
        const safeMaxX = THREE.MathUtils.clamp(Math.floor(maxX), 0, CITY_GRID_WIDTH - 1);
        const safeMinY = THREE.MathUtils.clamp(Math.floor(minY), 0, CITY_GRID_HEIGHT - 1);
        const safeMaxY = THREE.MathUtils.clamp(Math.floor(maxY), 0, CITY_GRID_HEIGHT - 1);

        const result = await supabaseBrowser
          .from('parcel_map_public')
          .select('id,parcel_number,status,price,tier,city_name,city_code,layer_number,sector_number,grid_x,grid_y')
          .eq('city_name', city.name)
          .eq('city_code', city.code)
          .gte('grid_x', safeMinX)
          .lte('grid_x', safeMaxX)
          .gte('grid_y', safeMinY)
          .lte('grid_y', safeMaxY)
          .order('grid_y', { ascending: true })
          .order('grid_x', { ascending: true });

        if (result.error) {
          throw new Error(`Şehir ${city.name} parselleri yüklenemedi: ${result.error.message}`);
        }

        const cityCache = parcelCache.get(cityIndex) ?? new Map<string, RealSkyParcel>();
        for (const parcel of (result.data ?? []) as RealSkyParcel[]) {
          if (parcel.grid_x == null || parcel.grid_y == null) continue;
          cityCache.set(parcel.grid_x + ':' + parcel.grid_y, parcel);
        }
        parcelCache.set(cityIndex, cityCache);
        loadedRanges.add(key);
      } finally {
        loadingRanges.delete(key);
      }
    };

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      depthTest: false,
    });

    const parcelLines: THREE.LineLoop[] = [];
    const parcelMeshes: THREE.Mesh[] = [];
    const realParcelMaterials = {
      available: new THREE.MeshBasicMaterial({ color: 0x2ee6a6, transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false, depthTest: false }),
      sold: new THREE.MeshBasicMaterial({ color: 0xff5c7a, transparent: true, opacity: 0.48, side: THREE.DoubleSide, depthWrite: false, depthTest: false }),
      reserved: new THREE.MeshBasicMaterial({ color: 0xffc857, transparent: true, opacity: 0.76, side: THREE.DoubleSide, depthWrite: false, depthTest: false }),
      other: new THREE.MeshBasicMaterial({ color: 0x8ea0b8, transparent: true, opacity: 0.58, side: THREE.DoubleSide, depthWrite: false, depthTest: false }),
    };

    const visibleWidth = VISIBLE_X * 2 + 1;
    const visibleDepth = VISIBLE_Z * 2 + 1;
    const pooledCount = visibleWidth * visibleDepth;

    for (let i = 0; i < pooledCount; i += 1) {
      const geometry = new THREE.BufferGeometry();
      const line = new THREE.LineLoop(geometry, lineMaterial);
      parcelGroup.add(line);
      parcelLines.push(line);

      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(TILE_SIZE * 0.92, TILE_SIZE * 0.92),
        realParcelMaterials.other,
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 2.65;
      mesh.visible = false;
      parcelGroup.add(mesh);
      parcelMeshes.push(mesh);
    }

    let visibleUpdateId = 0;
    let lastRenderedCenter = '';
    let updateQueued = false;

    const renderVisibleWindow = () => {
      const center = centerColumn + ':' + centerRow;
      if (center === lastRenderedCenter) {
        // Still update smooth visual offset without rebuilding geometries.
        parcelGroup.position.x = visualOffsetX;
        parcelGroup.position.z = visualOffsetZ;
        return;
      }
      lastRenderedCenter = center;
      parcelGroup.position.x = visualOffsetX;
      parcelGroup.position.z = visualOffsetZ;

      let index = 0;
      for (let dz = -VISIBLE_Z; dz <= VISIBLE_Z; dz += 1) {
        for (let dx = -VISIBLE_X; dx <= VISIBLE_X; dx += 1) {
          const column = centerColumn + dx;
          const row = centerRow + dz;
          const line = parcelLines[index];
          const mesh = parcelMeshes[index];
          index += 1;

          if (
            column < 0 ||
            column >= PARCEL_COLUMNS ||
            row < 0 ||
            row >= PARCEL_ROWS
          ) {
            line.visible = false;
            mesh.visible = false;
            continue;
          }

          const x = dx * TILE_SIZE;
          const z = dz * TILE_SIZE;
          const cityX = Math.floor(column / CITY_GRID_WIDTH);
          const cityZ = Math.floor(row / CITY_GRID_HEIGHT);
          const cityIndex = cityZ * CITY_BLOCKS + cityX;
          const localX = column - cityX * CITY_GRID_WIDTH;
          const localZ = row - cityZ * CITY_GRID_HEIGHT;
          const realParcel = parcelCache.get(cityIndex)?.get(localX + ':' + localZ);
          const y = realParcel ? 2.5 : 2.15;

          line.geometry.dispose();
          line.geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, y, z),
            new THREE.Vector3(x + TILE_SIZE, y, z),
            new THREE.Vector3(x + TILE_SIZE, y, z + TILE_SIZE),
            new THREE.Vector3(x, y, z + TILE_SIZE),
          ]);
          line.visible = true;
          line.userData.parcel = realParcel ?? null;
          line.userData.parcelNumber = realParcel?.parcel_number ?? null;
          line.userData.worldColumn = column;
          line.userData.worldRow = row;

          mesh.position.set(x + TILE_SIZE / 2, y + 0.42, z + TILE_SIZE / 2);
          mesh.visible = Boolean(realParcel);
          mesh.userData.parcel = realParcel ?? null;
          if (realParcel) {
            const status = realParcel.status === 'sold'
              ? 'sold'
              : realParcel.status === 'reserved'
                ? 'reserved'
                : realParcel.status === 'available'
                  ? 'available'
                  : 'other';
            mesh.material = realParcelMaterials[status];
          }
        }
      }
    };

    const updateVisibleParcels = async () => {
      if (updateQueued) return;
      updateQueued = true;
      updateQueued = false;

      renderVisibleWindow();
      const updateId = ++visibleUpdateId;

      try {
        const definitions = await loadCities();
        const minColumn = THREE.MathUtils.clamp(centerColumn - VISIBLE_X, 0, PARCEL_COLUMNS - 1);
        const maxColumn = THREE.MathUtils.clamp(centerColumn + VISIBLE_X, 0, PARCEL_COLUMNS - 1);
        const minRow = THREE.MathUtils.clamp(centerRow - VISIBLE_Z, 0, PARCEL_ROWS - 1);
        const maxRow = THREE.MathUtils.clamp(centerRow + VISIBLE_Z, 0, PARCEL_ROWS - 1);
        const tasks: Promise<void>[] = [];

        const minCityX = Math.floor(minColumn / CITY_GRID_WIDTH);
        const maxCityX = Math.floor(maxColumn / CITY_GRID_WIDTH);
        const minCityZ = Math.floor(minRow / CITY_GRID_HEIGHT);
        const maxCityZ = Math.floor(maxRow / CITY_GRID_HEIGHT);

        for (let cityZ = minCityZ; cityZ <= maxCityZ; cityZ += 1) {
          for (let cityX = minCityX; cityX <= maxCityX; cityX += 1) {
            const cityIndex = cityZ * CITY_BLOCKS + cityX;
            const city = definitions[cityIndex];
            if (!city) continue;

            const cityMinColumn = cityX * CITY_GRID_WIDTH;
            const cityMinRow = cityZ * CITY_GRID_HEIGHT;
            const localMinX = Math.max(0, minColumn - cityMinColumn);
            const localMaxX = Math.min(CITY_GRID_WIDTH - 1, maxColumn - cityMinColumn);
            const localMinY = Math.max(0, minRow - cityMinRow);
            const localMaxY = Math.min(CITY_GRID_HEIGHT - 1, maxRow - cityMinRow);
            tasks.push(loadCityParcels(cityIndex, localMinX, localMaxX, localMinY, localMaxY));
          }
        }

        await Promise.all(tasks);
        if (updateId !== visibleUpdateId) return;
        renderVisibleWindow();
      } catch (error) {
        console.error('Gökyüzü parselleri yüklenemedi:', error);
      }
    };

    void updateVisibleParcels();

    const raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = 2.5;
    const pointer = new THREE.Vector2();
    let pointerDownX = 0;
    let pointerDownY = 0;

    const onSelectPointerDown = (event: PointerEvent) => {
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
    };

    const onSelectPointerUp = (event: PointerEvent) => {
      if (dragMoved || Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY) > 8) {
        dragMoved = false;
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const realMeshes = parcelMeshes.filter((mesh) => mesh.visible && mesh.userData.parcel);
      const hit = raycaster.intersectObjects(realMeshes, false)[0];
      const parcel = hit?.object?.userData?.parcel as RealSkyParcel | null | undefined;
      if (parcel) setSelectedParcel(parcel);
      dragMoved = false;
    };

    renderer.domElement.addEventListener('pointerdown', onSelectPointerDown);
    renderer.domElement.addEventListener('pointerup', onSelectPointerUp);

    const resize = () => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', resize);
    resize();

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      renderer.domElement.removeEventListener('pointerdown', onSelectPointerDown);
      renderer.domElement.removeEventListener('pointerup', onSelectPointerUp);
      window.removeEventListener('resize', resize);

      skyTexture.dispose();
      skyGeometry.dispose();
      skyMaterial.dispose();
      lineMaterial.dispose();
      Object.values(realParcelMaterials).forEach((material) => material.dispose());
      parcelLines.forEach((line) => line.geometry.dispose());
      parcelMeshes.forEach((mesh) => mesh.geometry.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <main className="gokyuzu-page">
      <div
        ref={mountRef}
        className="gokyuzu-canvas"
        aria-label="81 bin gökyüzü parselinden oluşan sürüklenebilir parsel dünyası"
      />

      <header className="gokyuzu-header">
        <div>
          <div className="gokyuzu-kicker">MYSKYPARCEL · PARSEL DÜNYASI</div>
          <h1>Gökyüzü</h1>
          <p>
            81 milyonluk MySkyParcel evreninin şu anki 81.000 gerçek parselini keşfet.
            Her kare, Supabase'deki tekil bir gerçek parsele bağlanır.
          </p>
        </div>

        <div className="gokyuzu-badge">
          <span className="sun-dot" />
          <span>{REAL_PARCEL_COUNT.toLocaleString('tr-TR')} GERÇEK PARSEL · {TOTAL_PARCELS.toLocaleString('tr-TR')} HEDEF</span>
        </div>
      </header>

      <div className="gokyuzu-controls">
        <span>👆 Parmağınla sürükle</span>
        <span>🖱️ Fareyle sürükle</span>
        <span>↕️ Yakınlaştır / uzaklaştır</span>
        <span>▦ Gerçek Supabase parselleri</span>
      </div>

      {selectedParcel && (
        <aside className="gokyuzu-parcel-panel">
          <button className="gokyuzu-parcel-close" onClick={() => setSelectedParcel(null)} aria-label="Parsel panelini kapat">×</button>
          <div className="gokyuzu-parcel-kicker">{selectedParcel.city_name ?? 'Türkiye'} · Katman {selectedParcel.layer_number ?? 1} · Sektör {selectedParcel.sector_number ?? 1}</div>
          <h2>PARSEL #{selectedParcel.parcel_number}</h2>
          <div className="gokyuzu-parcel-meta">
            <span>{selectedParcel.status === 'available' ? 'Satın alınabilir' : selectedParcel.status === 'sold' ? 'Satıldı' : 'Rezerve'}</span>
            {selectedParcel.price != null && <strong>{selectedParcel.price.toLocaleString('tr-TR')} TL</strong>}
          </div>
          {selectedParcel.status === 'available' && (
            <Link to="/parsel-satin-al" search={{ parcels: selectedParcel.id }} className="gokyuzu-buy-button">Bu parseli satın al</Link>
          )}
        </aside>
      )}
    </main>
  );
}
// Canonical province-number mapping for the seven legacy alphanumeric city codes.
// The remaining cities use their numeric code from public.cities. City name + code
// are always queried together so duplicate legacy codes (BUR/CAN/ERZ/KAR/KIR)
// cannot return another province's parcels.

const TILE_SIZE = 10;
const VISIBLE_X = 18;
const VISIBLE_Z = 14;

type RealSkyParcel = {
  id: string;
  parcel_number: string;
  status: string;
  price: number | null;
  tier: string | null;
  city_name: string | null;
  city_code: string | null;
  layer_number: number | null;
  sector_number: number | null;
  grid_x: number | null;
  grid_y: number | null;
};

function GokyuzuPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedParcel, setSelectedParcel] = useState<RealSkyParcel | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      52,
      Math.max(mount.clientWidth, 1) / Math.max(mount.clientHeight, 1),
      0.1,
      20000,
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.cursor = 'grab';
    mount.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
    const skyTexture = loader.load(SKY_IMAGE_URL);
    skyTexture.colorSpace = THREE.SRGBColorSpace;
    skyTexture.mapping = THREE.EquirectangularReflectionMapping;

    const skyGeometry = new THREE.SphereGeometry(8000, 48, 24);
    skyGeometry.scale(-1, 1, 1);
    const skyMaterial = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(skyGeometry, skyMaterial));

    const cameraTarget = new THREE.Vector3(0, 2.5, 0);
    camera.position.set(0, 32, 34);
    camera.lookAt(cameraTarget);

    // The parcel world is centered on its own pivot. Logical parcel coordinates
    // are translated into local coordinates around the current center, so
    // visual movement and Supabase data use the same coordinate system.
    const parcelGroup = new THREE.Group();
    scene.add(parcelGroup);

    const specialProvinceNumbers: Record<string, number> = {
      ANK: 6,
      ANT: 7,
      BUR: 16,
      GZT: 27,
      IST: 34,
      IZM: 35,
      KAY: 38,
    };

    type CityDefinition = { name: string; code: string; provinceNumber: number };
    let cities: CityDefinition[] = [];
    let citiesLoaded = false;

    const loadCities = async () => {
      if (citiesLoaded) return cities;
      const result = await supabaseBrowser
        .from('cities')
        .select('name,code')
        .eq('is_active', true);

      if (result.error) throw new Error('İller yüklenemedi: ' + result.error.message);

      cities = (result.data ?? [])
        .map((city) => {
          const numericCode = Number(city.code);
          const provinceNumber = specialProvinceNumbers[city.code] ?? (
            Number.isFinite(numericCode) ? numericCode : Number.NaN
          );
          return {
            name: city.name,
            code: city.code,
            provinceNumber,
          };
        })
        .filter((city) => Number.isInteger(city.provinceNumber) && city.provinceNumber >= 1 && city.provinceNumber <= CITY_COUNT)
        .sort((a, b) => a.provinceNumber - b.provinceNumber);

      const provinceNumbers = new Set(cities.map((city) => city.provinceNumber));
      if (cities.length !== CITY_COUNT || provinceNumbers.size !== CITY_COUNT) {
        throw new Error(`81 il eşleştirmesi tamamlanamadı: ${cities.length} aktif il bulundu.`);
      }

      citiesLoaded = true;
      return cities;
    };

    const getCityDefinition = (cityIndex: number) => cities[cityIndex];

    // Current logical center is an integer parcel coordinate. visualOffset keeps
    // the drag continuous between tile boundaries; when a full tile is crossed,
    // the logical center changes and only the affected Supabase window is fetched.
    let centerColumn = 20;
    let centerRow = 12;
    let visualOffsetX = 0;
    let visualOffsetZ = 0;
    let rotationY = 0;
    let rotationX = 0;

    const setZoom = (distance: number) => {
      const clamped = THREE.MathUtils.clamp(distance, 18, 120);
      camera.position.y = THREE.MathUtils.clamp(clamped * 0.9, 14, 90);
      camera.position.z = clamped;
      camera.lookAt(cameraTarget);
    };

    let dragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let dragMoved = false;
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchDistance: number | null = null;

    const shiftLogicalCenter = (axis: 'x' | 'z', delta: number) => {
      if (axis === 'x') {
        centerColumn = THREE.MathUtils.clamp(centerColumn + delta, 0, PARCEL_COLUMNS - 1);
      } else {
        centerRow = THREE.MathUtils.clamp(centerRow + delta, 0, PARCEL_ROWS - 1);
      }
    };

    const applyVisualDrag = (dx: number, dy: number) => {
      visualOffsetX += dx * 0.08;
      visualOffsetZ += dy * 0.08;

      while (Math.abs(visualOffsetX) >= TILE_SIZE) {
        const step = visualOffsetX > 0 ? -1 : 1;
        shiftLogicalCenter('x', step);
        visualOffsetX += step * TILE_SIZE;
      }
      while (Math.abs(visualOffsetZ) >= TILE_SIZE) {
        const step = visualOffsetZ > 0 ? -1 : 1;
        shiftLogicalCenter('z', step);
        visualOffsetZ += step * TILE_SIZE;
      }

      // Small controlled pitch/yaw gives the centered grid a globe-like feel
      // without moving the camera or disconnecting parcel data from the world.
      rotationY = THREE.MathUtils.clamp(rotationY + dx * 0.0025, -0.65, 0.65);
      rotationX = THREE.MathUtils.clamp(rotationX + dy * 0.0018, -0.38, 0.38);
      parcelGroup.rotation.y = rotationY;
      parcelGroup.rotation.x = rotationX;
      void updateVisibleParcels();
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const current = Math.max(18, camera.position.z);
      setZoom(current + THREE.MathUtils.clamp(event.deltaY, -160, 160) * 0.08);
    };

    const onPointerDown = (event: PointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      try { renderer.domElement.setPointerCapture(event.pointerId); } catch { /* unsupported */ }

      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDistance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
        dragging = false;
        return;
      }

      dragging = true;
      dragMoved = false;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onPointerMove = (event: PointerEvent) => {
      const previous = pointers.get(event.pointerId);
      if (!previous) return;
      event.preventDefault();
      event.stopPropagation();
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size === 2 && pinchDistance) {
        const [a, b] = [...pointers.values()];
        const distance = Math.max(1, Math.hypot(a.x - b.x, a.y - b.y));
        const current = Math.max(18, camera.position.z);
        setZoom(current / (distance / pinchDistance));
        pinchDistance = distance;
        return;
      }

      if (!dragging) return;
      const dx = event.clientX - lastPointerX;
      const dy = event.clientY - lastPointerY;
      if (Math.hypot(dx, dy) > 1) dragMoved = true;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      applyVisualDrag(dx, dy);
    };

    const onPointerUp = (event: PointerEvent) => {
      pointers.delete(event.pointerId);
      if (pointers.size < 2) pinchDistance = null;
      dragging = pointers.size === 1;
      if (dragging) {
        const remaining = [...pointers.values()][0];
        lastPointerX = remaining.x;
        lastPointerY = remaining.y;
      } else {
        renderer.domElement.style.cursor = 'grab';
      }
      try { renderer.domElement.releasePointerCapture(event.pointerId); } catch { /* unsupported */ }
    };

    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);

    const parcelCache = new Map<number, Map<string, RealSkyParcel>>();
    const loadedRanges = new Set<string>();
    const loadingRanges = new Set<string>();

    const loadCityParcels = async (
      cityIndex: number,
      minX: number,
      maxX: number,
      minY: number,
      maxY: number,
    ) => {
      const city = getCityDefinition(cityIndex);
      if (!city) return;

      const key = [
        cityIndex,
        THREE.MathUtils.clamp(Math.floor(minX), 0, CITY_GRID_WIDTH - 1),
        THREE.MathUtils.clamp(Math.floor(maxX), 0, CITY_GRID_WIDTH - 1),
        THREE.MathUtils.clamp(Math.floor(minY), 0, CITY_GRID_HEIGHT - 1),
        THREE.MathUtils.clamp(Math.floor(maxY), 0, CITY_GRID_HEIGHT - 1),
      ].join(':');

      if (loadedRanges.has(key) || loadingRanges.has(key)) return;
      loadingRanges.add(key);

      try {
        const safeMinX = THREE.MathUtils.clamp(Math.floor(minX), 0, CITY_GRID_WIDTH - 1);
        const safeMaxX = THREE.MathUtils.clamp(Math.floor(maxX), 0, CITY_GRID_WIDTH - 1);
        const safeMinY = THREE.MathUtils.clamp(Math.floor(minY), 0, CITY_GRID_HEIGHT - 1);
        const safeMaxY = THREE.MathUtils.clamp(Math.floor(maxY), 0, CITY_GRID_HEIGHT - 1);

        const result = await supabaseBrowser
          .from('parcel_map_public')
          .select('id,parcel_number,status,price,tier,city_name,city_code,layer_number,sector_number,grid_x,grid_y')
          .eq('city_name', city.name)
          .eq('city_code', city.code)
          .gte('grid_x', safeMinX)
          .lte('grid_x', safeMaxX)
          .gte('grid_y', safeMinY)
          .lte('grid_y', safeMaxY)
          .order('grid_y', { ascending: true })
          .order('grid_x', { ascending: true });

        if (result.error) {
          throw new Error(`Şehir ${city.name} parselleri yüklenemedi: ${result.error.message}`);
        }

        const cityCache = parcelCache.get(cityIndex) ?? new Map<string, RealSkyParcel>();
        for (const parcel of (result.data ?? []) as RealSkyParcel[]) {
          if (parcel.grid_x == null || parcel.grid_y == null) continue;
          cityCache.set(parcel.grid_x + ':' + parcel.grid_y, parcel);
        }
        parcelCache.set(cityIndex, cityCache);
        loadedRanges.add(key);
      } finally {
        loadingRanges.delete(key);
      }
    };

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      depthTest: false,
    });

    const parcelLines: THREE.LineLoop[] = [];
    const parcelMeshes: THREE.Mesh[] = [];
    const realParcelMaterials = {
      available: new THREE.MeshBasicMaterial({ color: 0x2ee6a6, transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false, depthTest: false }),
      sold: new THREE.MeshBasicMaterial({ color: 0xff5c7a, transparent: true, opacity: 0.48, side: THREE.DoubleSide, depthWrite: false, depthTest: false }),
      reserved: new THREE.MeshBasicMaterial({ color: 0xffc857, transparent: true, opacity: 0.76, side: THREE.DoubleSide, depthWrite: false, depthTest: false }),
      other: new THREE.MeshBasicMaterial({ color: 0x8ea0b8, transparent: true, opacity: 0.58, side: THREE.DoubleSide, depthWrite: false, depthTest: false }),
    };

    const visibleWidth = VISIBLE_X * 2 + 1;
    const visibleDepth = VISIBLE_Z * 2 + 1;
    const pooledCount = visibleWidth * visibleDepth;

    for (let i = 0; i < pooledCount; i += 1) {
      const geometry = new THREE.BufferGeometry();
      const line = new THREE.LineLoop(geometry, lineMaterial);
      parcelGroup.add(line);
      parcelLines.push(line);

      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(TILE_SIZE * 0.92, TILE_SIZE * 0.92),
        realParcelMaterials.other,
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.y = 2.65;
      mesh.visible = false;
      parcelGroup.add(mesh);
      parcelMeshes.push(mesh);
    }

    let visibleUpdateId = 0;
    let lastRenderedCenter = '';
    let updateQueued = false;

    const renderVisibleWindow = () => {
      const center = centerColumn + ':' + centerRow;
      if (center === lastRenderedCenter) {
        // Still update smooth visual offset without rebuilding geometries.
        parcelGroup.position.x = visualOffsetX;
        parcelGroup.position.z = visualOffsetZ;
        return;
      }
      lastRenderedCenter = center;
      parcelGroup.position.x = visualOffsetX;
      parcelGroup.position.z = visualOffsetZ;

      let index = 0;
      for (let dz = -VISIBLE_Z; dz <= VISIBLE_Z; dz += 1) {
        for (let dx = -VISIBLE_X; dx <= VISIBLE_X; dx += 1) {
          const column = centerColumn + dx;
          const row = centerRow + dz;
          const line = parcelLines[index];
          const mesh = parcelMeshes[index];
          index += 1;

          if (
            column < 0 ||
            column >= PARCEL_COLUMNS ||
            row < 0 ||
            row >= PARCEL_ROWS
          ) {
            line.visible = false;
            mesh.visible = false;
            continue;
          }

          const x = dx * TILE_SIZE;
          const z = dz * TILE_SIZE;
          const cityX = Math.floor(column / CITY_GRID_WIDTH);
          const cityZ = Math.floor(row / CITY_GRID_HEIGHT);
          const cityIndex = cityZ * CITY_BLOCKS + cityX;
          const localX = column - cityX * CITY_GRID_WIDTH;
          const localZ = row - cityZ * CITY_GRID_HEIGHT;
          const realParcel = parcelCache.get(cityIndex)?.get(localX + ':' + localZ);
          const y = realParcel ? 2.5 : 2.15;

          line.geometry.dispose();
          line.geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, y, z),
            new THREE.Vector3(x + TILE_SIZE, y, z),
            new THREE.Vector3(x + TILE_SIZE, y, z + TILE_SIZE),
            new THREE.Vector3(x, y, z + TILE_SIZE),
          ]);
          line.visible = true;
          line.userData.parcel = realParcel ?? null;
          line.userData.parcelNumber = realParcel?.parcel_number ?? null;
          line.userData.worldColumn = column;
          line.userData.worldRow = row;

          mesh.position.set(x + TILE_SIZE / 2, y + 0.42, z + TILE_SIZE / 2);
          mesh.visible = Boolean(realParcel);
          mesh.userData.parcel = realParcel ?? null;
          if (realParcel) {
            const status = realParcel.status === 'sold'
              ? 'sold'
              : realParcel.status === 'reserved'
                ? 'reserved'
                : realParcel.status === 'available'
                  ? 'available'
                  : 'other';
            mesh.material = realParcelMaterials[status];
          }
        }
      }
    };

    const updateVisibleParcels = async () => {
      if (updateQueued) return;
      updateQueued = true;
      updateQueued = false;

      renderVisibleWindow();
      const updateId = ++visibleUpdateId;

      try {
        const definitions = await loadCities();
        const minColumn = THREE.MathUtils.clamp(centerColumn - VISIBLE_X, 0, PARCEL_COLUMNS - 1);
        const maxColumn = THREE.MathUtils.clamp(centerColumn + VISIBLE_X, 0, PARCEL_COLUMNS - 1);
        const minRow = THREE.MathUtils.clamp(centerRow - VISIBLE_Z, 0, PARCEL_ROWS - 1);
        const maxRow = THREE.MathUtils.clamp(centerRow + VISIBLE_Z, 0, PARCEL_ROWS - 1);
        const tasks: Promise<void>[] = [];

        const minCityX = Math.floor(minColumn / CITY_GRID_WIDTH);
        const maxCityX = Math.floor(maxColumn / CITY_GRID_WIDTH);
        const minCityZ = Math.floor(minRow / CITY_GRID_HEIGHT);
        const maxCityZ = Math.floor(maxRow / CITY_GRID_HEIGHT);

        for (let cityZ = minCityZ; cityZ <= maxCityZ; cityZ += 1) {
          for (let cityX = minCityX; cityX <= maxCityX; cityX += 1) {
            const cityIndex = cityZ * CITY_BLOCKS + cityX;
            const city = definitions[cityIndex];
            if (!city) continue;

            const cityMinColumn = cityX * CITY_GRID_WIDTH;
            const cityMinRow = cityZ * CITY_GRID_HEIGHT;
            const localMinX = Math.max(0, minColumn - cityMinColumn);
            const localMaxX = Math.min(CITY_GRID_WIDTH - 1, maxColumn - cityMinColumn);
            const localMinY = Math.max(0, minRow - cityMinRow);
            const localMaxY = Math.min(CITY_GRID_HEIGHT - 1, maxRow - cityMinRow);
            tasks.push(loadCityParcels(cityIndex, localMinX, localMaxX, localMinY, localMaxY));
          }
        }

        await Promise.all(tasks);
        if (updateId !== visibleUpdateId) return;
        renderVisibleWindow();
      } catch (error) {
        console.error('Gökyüzü parselleri yüklenemedi:', error);
      }
    };

    void updateVisibleParcels();

    const raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = 2.5;
    const pointer = new THREE.Vector2();
    let pointerDownX = 0;
    let pointerDownY = 0;

    const onSelectPointerDown = (event: PointerEvent) => {
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
    };

    const onSelectPointerUp = (event: PointerEvent) => {
      if (dragMoved || Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY) > 8) {
        dragMoved = false;
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const realMeshes = parcelMeshes.filter((mesh) => mesh.visible && mesh.userData.parcel);
      const hit = raycaster.intersectObjects(realMeshes, false)[0];
      const parcel = hit?.object?.userData?.parcel as RealSkyParcel | null | undefined;
      if (parcel) setSelectedParcel(parcel);
      dragMoved = false;
    };

    renderer.domElement.addEventListener('pointerdown', onSelectPointerDown);
    renderer.domElement.addEventListener('pointerup', onSelectPointerUp);

    const resize = () => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', resize);
    resize();

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      renderer.domElement.removeEventListener('pointerdown', onSelectPointerDown);
      renderer.domElement.removeEventListener('pointerup', onSelectPointerUp);
      window.removeEventListener('resize', resize);

      skyTexture.dispose();
      skyGeometry.dispose();
      skyMaterial.dispose();
      lineMaterial.dispose();
      Object.values(realParcelMaterials).forEach((material) => material.dispose());
      parcelLines.forEach((line) => line.geometry.dispose());
      parcelMeshes.forEach((mesh) => mesh.geometry.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <main className="gokyuzu-page">
      <div
        ref={mountRef}
        className="gokyuzu-canvas"
        aria-label="81 bin gökyüzü parselinden oluşan sürüklenebilir parsel dünyası"
      />

      <header className="gokyuzu-header">
        <div>
          <div className="gokyuzu-kicker">MYSKYPARCEL · PARSEL DÜNYASI</div>
          <h1>Gökyüzü</h1>
          <p>
            81 milyonluk MySkyParcel evreninin şu anki 81.000 gerçek parselini keşfet.
            Her kare, Supabase'deki tekil bir gerçek parsele bağlanır.
          </p>
        </div>

        <div className="gokyuzu-badge">
          <span className="sun-dot" />
          <span>{REAL_PARCEL_COUNT.toLocaleString('tr-TR')} GERÇEK PARSEL · {TOTAL_PARCELS.toLocaleString('tr-TR')} HEDEF</span>
        </div>
      </header>

      <div className="gokyuzu-controls">
        <span>👆 Parmağınla sürükle</span>
        <span>🖱️ Fareyle sürükle</span>
        <span>↕️ Yakınlaştır / uzaklaştır</span>
        <span>▦ Gerçek Supabase parselleri</span>
      </div>

      {selectedParcel && (
        <aside className="gokyuzu-parcel-panel">
          <button className="gokyuzu-parcel-close" onClick={() => setSelectedParcel(null)} aria-label="Parsel panelini kapat">×</button>
          <div className="gokyuzu-parcel-kicker">{selectedParcel.city_name ?? 'Türkiye'} · Katman {selectedParcel.layer_number ?? 1} · Sektör {selectedParcel.sector_number ?? 1}</div>
          <h2>PARSEL #{selectedParcel.parcel_number}</h2>
          <div className="gokyuzu-parcel-meta">
            <span>{selectedParcel.status === 'available' ? 'Satın alınabilir' : selectedParcel.status === 'sold' ? 'Satıldı' : 'Rezerve'}</span>
            {selectedParcel.price != null && <strong>{selectedParcel.price.toLocaleString('tr-TR')} TL</strong>}
          </div>
          {selectedParcel.status === 'available' && (
            <Link to="/parsel-satin-al" search={{ parcels: selectedParcel.id }} className="gokyuzu-buy-button">Bu parseli satın al</Link>
          )}
        </aside>
      )}
    </main>
  );
}
