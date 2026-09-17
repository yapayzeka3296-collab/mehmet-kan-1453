import { createFileRoute } from '@tanstack/react-router';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useEffect, useRef, useState } from 'react';
import { loadCitySkyParcels, type AllSkyParcel } from '@/features/gokyuzu/allSkyParcels';
import './gokyuzu.css';

export const Route = createFileRoute('/gokyuzu')({ component: GokyuzuPage });

const TEST_CITY = 'Gaziantep';
const VISIBLE_PARCELS = 260;
const GRID_COLUMNS = 40;
const GRID_ROWS = 25;
const PARCEL_SIZE = 0.9;
const GRID_GAP = 1.05;
const DOME_HEIGHT = 15;

function parcelColor(status: string | null) {
  if (status === 'sold') return new THREE.Color('#f59e0b');
  if (status === 'reserved') return new THREE.Color('#a78bfa');
  return new THREE.Color('#38bdf8');
}

function domePosition(index: number) {
  const column = index % GRID_COLUMNS;
  const row = Math.floor(index / GRID_COLUMNS);
  const x = (column - (GRID_COLUMNS - 1) / 2) * GRID_GAP;
  const z = (row - (GRID_ROWS - 1) / 2) * GRID_GAP;
  const nx = x / ((GRID_COLUMNS - 1) * GRID_GAP * 0.52);
  const nz = z / ((GRID_ROWS - 1) * GRID_GAP * 0.52);
  const radius = Math.min(1, Math.sqrt(nx * nx + nz * nz));
  const y = DOME_HEIGHT * Math.sqrt(Math.max(0, 1 - radius * radius));
  return { x, y, z };
}

function GokyuzuPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const parcelsRef = useRef<AllSkyParcel[]>([]);
  const visibleParcelsRef = useRef<AllSkyParcel[]>([]);
  const [parcels, setParcels] = useState<AllSkyParcel[]>([]);
  const [loaded, setLoaded] = useState(0);
  const [selected, setSelected] = useState<AllSkyParcel | null>(null);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_PARCELS);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadCitySkyParcels(TEST_CITY, (current) => {
      if (!cancelled) setLoaded(current);
    })
      .then((rows) => {
        if (cancelled) return;
        parcelsRef.current = rows;
        setParcels(rows);
        setVisibleCount(Math.min(VISIBLE_PARCELS, rows.length));
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : `${TEST_CITY} parselleri yüklenemedi.`);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || parcels.length === 0) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, mount.clientWidth / mount.clientHeight, 0.1, 1200);
    camera.position.set(0, 24, 42);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.minDistance = 12;
    controls.maxDistance = 95;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 5, 0);

    const geometry = new THREE.BoxGeometry(PARCEL_SIZE, 0.11, PARCEL_SIZE);
    const material = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.94 });
    const mesh = new THREE.InstancedMesh(geometry, material, Math.min(VISIBLE_PARCELS, parcels.length));
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(mesh);

    const visibleIndexRef: number[] = [];
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    const updateVisibleWindow = () => {
      const targetX = controls.target.x;
      const targetZ = controls.target.z;
      const centerColumn = Math.round(targetX / GRID_GAP + (GRID_COLUMNS - 1) / 2);
      const centerRow = Math.round(targetZ / GRID_GAP + (GRID_ROWS - 1) / 2);
      const halfColumns = 7;
      const halfRows = 9;
      const candidates: Array<{ index: number; distance: number }> = [];

      for (let row = Math.max(0, centerRow - halfRows); row <= Math.min(GRID_ROWS - 1, centerRow + halfRows); row += 1) {
        for (let column = Math.max(0, centerColumn - halfColumns); column <= Math.min(GRID_COLUMNS - 1, centerColumn + halfColumns); column += 1) {
          const index = row * GRID_COLUMNS + column;
          if (index >= parcelsRef.current.length) continue;
          const dx = column - centerColumn;
          const dz = row - centerRow;
          candidates.push({ index, distance: dx * dx + dz * dz });
        }
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
    controls.addEventListener('change', onControlsChange);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = { x: 0, y: 0 };
    const onPointerDown = (event: PointerEvent) => { pointerDown = { x: event.clientX, y: event.clientY }; };
    const onPointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 8) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(mesh, false)[0];
      if (hit && hit.instanceId != null) setSelected(visibleParcelsRef.current[hit.instanceId] ?? null);
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    const resize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', resize);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      controls.removeEventListener('change', onControlsChange);
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [parcels]);

  return (
    <main className="gokyuzu-page">
      <div className="gokyuzu-sky" />
      <div ref={mountRef} className="gokyuzu-canvas" aria-label="Gaziantep parsel dünyası" />

      <header className="gokyuzu-header">
        <div>
          <div className="gokyuzu-kicker">MYSKYPARCEL · PARSEL DÜNYASI</div>
          <h1>Gaziantep</h1>
          <p>Dev parsel kubbesini sürükleyerek keşfet. Performans için aynı anda yalnızca sınırlı sayıda parsel ekranda tutulur.</p>
        </div>
        <div className="gokyuzu-stats">
          <strong>{visibleCount.toLocaleString('tr-TR')}</strong>
          <span>ekranda · {loaded.toLocaleString('tr-TR')} Gaziantep parseli</span>
        </div>
      </header>

      <div className="gokyuzu-city-label">GAZİANTEP · TEST 01</div>
      <div className="gokyuzu-legend">
        <span><i className="available" /> Müsait</span>
        <span><i className="sold" /> Satılmış</span>
        <span><i className="reserved" /> Rezerve</span>
      </div>

      {loaded === 0 && !error && <div className="gokyuzu-loader"><div className="gokyuzu-loader-title">Gaziantep parselleri yükleniyor…</div><small>İlk test yalnızca Gaziantep ile başlıyor.</small></div>}
      {error && <div className="gokyuzu-error">{error}</div>}

      <div className="gokyuzu-controls">
        <span>👆 Sürükle: yeni parseller</span><span>↕ Yaklaş / uzaklaş</span><span>👆 Parsel seç</span>
      </div>

      {selected && (
        <aside className="gokyuzu-detail">
          <button className="gokyuzu-close" onClick={() => setSelected(null)} aria-label="Kapat">×</button>
          <div className="detail-city">{selected.city_name} · Katman {selected.layer_number ?? '-'} · Sektör {selected.sector_number ?? '-'}</div>
          <h2>#{selected.parcel_number}</h2>
          <div className="detail-row"><span>Durum</span><strong>{selected.status === 'sold' ? 'Satılmış' : selected.status === 'reserved' ? 'Rezerve' : 'Müsait'}</strong></div>
          {selected.price != null && <div className="detail-row"><span>Fiyat</span><strong>{selected.price.toLocaleString('tr-TR')} ₺</strong></div>}
          {selected.status !== 'sold' && <a className="detail-action" href={`/parsel-satin-al?parcels=${encodeURIComponent(selected.id)}`}>Bu parseli incele</a>}
        </aside>
      )}
    </main>
  );
}
