import { createFileRoute, Link } from '@tanstack/react-router';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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
const TOTAL_PARCELS = 81_000_000;
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

        // Start over the first real Supabase parcel region (city 0, local grid 20/12),
    // not the empty center of the 1000×1000 logical block.
    const initialColumn = 20;
    const initialRow = 12;
    const initialWorldX = initialColumn * TILE_SIZE;
    const initialWorldZ = initialRow * TILE_SIZE;
    camera.position.set(initialWorldX, 32, initialWorldZ + 34);

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

    // Same interaction model as the landing-page globe:
    // one-finger/left-mouse rotates the 3D view; two-finger/wheel zooms.
    // Panning is disabled so the parcel world behaves like a 3D globe view.
    const cameraTarget = new THREE.Vector3(initialWorldX, 2.5, initialWorldZ);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(cameraTarget);
    controls.enablePan = false;
    controls.enableRotate = true;
    controls.enableZoom = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.075;
    controls.rotateSpeed = 0.72;
    controls.zoomSpeed = 0.85;
    controls.minDistance = 18;
    controls.maxDistance = 150;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = 1.48;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
    controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
    controls.update();

    const parcelGroup = new THREE.Group();
    scene.add(parcelGroup);

    const raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = 2.5;
    const pointer = new THREE.Vector2();
    let pointerDownX = 0;
    let pointerDownY = 0;
    const onPointerDown = (event: PointerEvent) => { pointerDownX = event.clientX; pointerDownY = event.clientY; };
    const onPointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY) > 8) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const realMeshes = parcelMeshes.filter((mesh) => mesh.visible);
      const meshHit = raycaster.intersectObjects(realMeshes, false)[0];
      const lineHit = raycaster.intersectObjects(parcelLines.filter((line) => line.visible), false)[0];
      const hit = meshHit ?? lineHit;
      const parcel = hit?.object?.userData?.parcel as RealSkyParcel | null | undefined;
      if (parcel) setSelectedParcel(parcel);
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

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
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);

      controls.dispose();
      controls.dispose();
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
