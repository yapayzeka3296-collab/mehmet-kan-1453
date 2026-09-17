import { createFileRoute } from '@tanstack/react-router';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useEffect, useMemo, useRef, useState } from 'react';
import { loadAllSkyParcels, type AllSkyParcel } from '@/features/gokyuzu/allSkyParcels';
import './gokyuzu.css';

export const Route = createFileRoute('/gokyuzu')({ component: GokyuzuPage });

const TOTAL_EXPECTED = 81_000;
const CLUSTER_GAP = 15;
const CLUSTER_SIZE = 12;
const PARCEL_SIZE = 0.92;
const LAYER_HEIGHT = 0.42;

function parcelColor(status: string | null) {
  if (status === 'sold') return new THREE.Color('#f59e0b');
  if (status === 'reserved') return new THREE.Color('#a78bfa');
  return new THREE.Color('#38bdf8');
}

function GokyuzuPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const parcelIndexRef = useRef<AllSkyParcel[]>([]);
  const [parcels, setParcels] = useState<AllSkyParcel[]>([]);
  const [loaded, setLoaded] = useState(0);
  const [total, setTotal] = useState(TOTAL_EXPECTED);
  const [selected, setSelected] = useState<AllSkyParcel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cityPositions = useMemo(() => {
    const names = [...new Set(parcels.map((parcel) => parcel.city_name))].sort((a, b) => a.localeCompare(b, 'tr'));
    const positions = new Map<string, { x: number; z: number }>();
    names.forEach((name, index) => {
      const column = index % 9;
      const row = Math.floor(index / 9);
      positions.set(name, {
        x: (column - 4) * CLUSTER_GAP,
        z: (row - 4) * CLUSTER_GAP,
      });
    });
    return positions;
  }, [parcels]);

  useEffect(() => {
    let cancelled = false;
    loadAllSkyParcels((current, count) => {
      if (cancelled) return;
      setLoaded(current);
      setTotal(count || TOTAL_EXPECTED);
    })
      .then((rows) => {
        if (!cancelled) {
          parcelIndexRef.current = rows;
          setParcels(rows);
          setLoaded(rows.length);
          setTotal(rows.length);
        }
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : '81.000 parsel yüklenemedi.');
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || parcels.length === 0) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, mount.clientWidth / mount.clientHeight, 0.1, 5000);
    camera.position.set(0, 72, 78);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 5;
    controls.maxDistance = 900;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 0, 0);

    const geometry = new THREE.BoxGeometry(PARCEL_SIZE, 0.08, PARCEL_SIZE);
    const material = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.92 });
    const mesh = new THREE.InstancedMesh(geometry, material, parcels.length);
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    parcels.forEach((parcel, index) => {
      const cluster = cityPositions.get(parcel.city_name) ?? { x: 0, z: 0 };
      const sector = Math.max(1, parcel.sector_number ?? index % 100);
      const layer = Math.max(1, parcel.layer_number ?? Math.floor(index / 100) + 1);
      const localX = ((sector - 1) % 10) * 1.05 - 4.72;
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

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(155, 155),
      new THREE.MeshBasicMaterial({ color: '#0b2940', transparent: true, opacity: 0.24, side: THREE.DoubleSide }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.12;
    scene.add(ground);

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(mesh, false)[0];
      if (hit && hit.instanceId != null) setSelected(parcelIndexRef.current[hit.instanceId] ?? null);
    };
    renderer.domElement.addEventListener('pointerup', onPointer);

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
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('pointerup', onPointer);
      controls.dispose();
      geometry.dispose();
      material.dispose();
      ground.geometry.dispose();
      (ground.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
      meshRef.current = null;
    };
  }, [parcels, cityPositions]);

  const percent = total ? Math.min(100, Math.round((loaded / total) * 100)) : 0;

  return (
    <main className="gokyuzu-page">
      <div className="gokyuzu-sky" />
      <div ref={mountRef} className="gokyuzu-canvas" aria-label="81 bin MySkyParcel gökyüzü parsel haritası" />

      <header className="gokyuzu-header">
        <div>
          <div className="gokyuzu-kicker">MYSKYPARCEL · PARSELLENMİŞ GÖKYÜZÜ</div>
          <h1>Gökyüzü</h1>
          <p>81 ilin 81.000 mevcut parselini tek bir 3D gökyüzünde keşfet.</p>
        </div>
        <div className="gokyuzu-stats">
          <strong>{loaded.toLocaleString('tr-TR')}</strong>
          <span>/ {total.toLocaleString('tr-TR')} parsel</span>
        </div>
      </header>

      <div className="gokyuzu-legend">
        <span><i className="available" /> Müsait</span>
        <span><i className="sold" /> Satılmış</span>
        <span><i className="reserved" /> Rezerve</span>
      </div>

      {loaded < total && !error && (
        <div className="gokyuzu-loader">
          <div className="gokyuzu-loader-title">81.000 parsel gökyüzüne yükleniyor… %{percent}</div>
          <div className="gokyuzu-progress"><span style={{ width: `${percent}%` }} /></div>
          <small>Veriler parça parça geliyor; ekran yükleme devam ederken kullanılabilir.</small>
        </div>
      )}

      {error && <div className="gokyuzu-error">{error}</div>}

      <div className="gokyuzu-controls">
        <span>🖱️ Döndür</span><span>↕ Yaklaş / uzaklaş</span><span>👆 Parsel seç</span>
      </div>

      {selected && (
        <aside className="gokyuzu-detail">
          <button className="gokyuzu-close" onClick={() => setSelected(null)} aria-label="Kapat">×</button>
          <div className="detail-city">{selected.city_name} · Katman {selected.layer_number ?? '-'} · Sektör {selected.sector_number ?? '-'}</div>
          <h2>#{selected.parcel_number}</h2>
          <div className="detail-row"><span>Durum</span><strong>{selected.status === 'sold' ? 'Satılmış' : selected.status === 'reserved' ? 'Rezerve' : 'Müsait'}</strong></div>
          {selected.price != null && <div className="detail-row"><span>Fiyat</span><strong>{selected.price.toLocaleString('tr-TR')} ₺</strong></div>}
          {selected.status !== 'sold' && (
            <a className="detail-action" href={`/parsel-satin-al?parcels=${encodeURIComponent(selected.id)}`}>Bu parseli incele</a>
          )}
        </aside>
      )}
    </main>
  );
}
