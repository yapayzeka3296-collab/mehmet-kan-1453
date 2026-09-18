import { createFileRoute } from '@tanstack/react-router';
import * as THREE from 'three';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { useEffect, useRef } from 'react';
import './gokyuzu.css';

export const Route = createFileRoute('/gokyuzu')({ component: GokyuzuPage });

const SKY_IMAGE_URL =
  'https://cdn.polyhaven.com/asset_img/primary/kloppenheim_03_puresky.png?height=2048';

// 81,000 logical parcels: 360 columns × 225 rows.
// Only the parcels around the camera are rendered; dragging loads/recycles
// the visible window, so we do not create 81,000 WebGL objects at once.
const PARCEL_COLUMNS = 360;
const PARCEL_ROWS = 225;
const TOTAL_PARCELS = PARCEL_COLUMNS * PARCEL_ROWS;
const TILE_SIZE = 10;
const VISIBLE_X = 18;
const VISIBLE_Z = 14;

function parcelNumber(column: number, row: number) {
  return row * PARCEL_COLUMNS + column + 1;
}

function GokyuzuPage() {
  const mountRef = useRef<HTMLDivElement>(null);

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

    const worldCenterX = ((PARCEL_COLUMNS - 1) * TILE_SIZE) / 2;
    const worldCenterZ = ((PARCEL_ROWS - 1) * TILE_SIZE) / 2;

    camera.position.set(worldCenterX, 32, worldCenterZ + 34);

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

    // The parcel world is a real finite 81,000-cell coordinate system.
    // MapControls is intentionally used instead of custom touch handlers:
    // Three.js supports one-finger pan and left-mouse pan natively.
    const controls = new MapControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enableZoom = true;
    controls.minDistance = 18;
    controls.maxDistance = 150;
    controls.zoomSpeed = 1.15;
    controls.enablePan = true;
    controls.screenSpacePanning = false;
    controls.panSpeed = 1.15;
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    controls.mouseButtons.RIGHT = THREE.MOUSE.PAN;
    controls.touches.ONE = THREE.TOUCH.PAN;
    controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
    controls.target.set(worldCenterX, 0, worldCenterZ);
    controls.update();

    const parcelGroup = new THREE.Group();
    scene.add(parcelGroup);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
      depthWrite: false,
      depthTest: false,
    });

    const parcelLines: THREE.LineLoop[] = [];
    const visibleWidth = VISIBLE_X * 2 + 1;
    const visibleDepth = VISIBLE_Z * 2 + 1;

    for (let i = 0; i < visibleWidth * visibleDepth; i += 1) {
      const geometry = new THREE.BufferGeometry();
      const line = new THREE.LineLoop(geometry, lineMaterial);
      parcelGroup.add(line);
      parcelLines.push(line);
    }

    let lastCenterColumn = -1;
    let lastCenterRow = -1;

    const updateVisibleParcels = () => {
      const centerColumn = Math.floor(controls.target.x / TILE_SIZE);
      const centerRow = Math.floor(controls.target.z / TILE_SIZE);

      if (
        centerColumn === lastCenterColumn &&
        centerRow === lastCenterRow
      ) {
        return;
      }

      lastCenterColumn = centerColumn;
      lastCenterRow = centerRow;

      let index = 0;

      for (let dz = -VISIBLE_Z; dz <= VISIBLE_Z; dz += 1) {
        for (let dx = -VISIBLE_X; dx <= VISIBLE_X; dx += 1) {
          const column = centerColumn + dx;
          const row = centerRow + dz;
          const line = parcelLines[index++];

          if (
            column < 0 ||
            column >= PARCEL_COLUMNS ||
            row < 0 ||
            row >= PARCEL_ROWS
          ) {
            line.visible = false;
            continue;
          }

          const x = column * TILE_SIZE;
          const z = row * TILE_SIZE;

          const y = 2.5;
          const points = [
            new THREE.Vector3(x, y, z),
            new THREE.Vector3(x + TILE_SIZE, y, z),
            new THREE.Vector3(x + TILE_SIZE, y, z + TILE_SIZE),
            new THREE.Vector3(x, y, z + TILE_SIZE),
          ];

          line.geometry.dispose();
          line.geometry = new THREE.BufferGeometry().setFromPoints(points);
          line.visible = true;
          line.position.set(0, 0, 0);
          line.userData.parcelNumber = parcelNumber(column, row);
          line.userData.column = column;
          line.userData.row = row;
        }
      }
    };

    updateVisibleParcels();

    const clampTarget = () => {
      const halfX = TILE_SIZE / 2;
      const halfZ = TILE_SIZE / 2;
      const minX = halfX;
      const maxX = (PARCEL_COLUMNS - 1) * TILE_SIZE + halfX;
      const minZ = halfZ;
      const maxZ = (PARCEL_ROWS - 1) * TILE_SIZE + halfZ;

      const oldX = controls.target.x;
      const oldZ = controls.target.z;

      controls.target.x = THREE.MathUtils.clamp(controls.target.x, minX, maxX);
      controls.target.z = THREE.MathUtils.clamp(controls.target.z, minZ, maxZ);
      controls.target.y = 2.5;

      const dx = controls.target.x - oldX;
      const dz = controls.target.z - oldZ;

      if (dx !== 0 || dz !== 0) {
        camera.position.x += dx;
        camera.position.z += dz;
      }
    };

    const onControlsChange = () => {
      clampTarget();
      updateVisibleParcels();
    };

    controls.addEventListener('change', onControlsChange);

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
    let motionTime = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      motionTime += 0.012;

      // The parcel plane has a subtle living 3D motion so the grid never
      // feels like a flat, static overlay while the camera moves through it.
      parcelGroup.rotation.x = -0.035 + Math.sin(motionTime * 0.55) * 0.008;
      parcelGroup.position.y = Math.sin(motionTime * 0.8) * 0.35;

      for (const line of parcelLines) {
        if (!line.visible) continue;
        const column = Number(line.userData.column ?? 0);
        const row = Number(line.userData.row ?? 0);
        const wave = Math.sin(motionTime * 0.9 + column * 0.07 + row * 0.05) * 0.035;
        line.position.y = wave;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      controls.removeEventListener('change', onControlsChange);
      controls.dispose();
      window.removeEventListener('resize', resize);

      skyTexture.dispose();
      skyGeometry.dispose();
      skyMaterial.dispose();
      lineMaterial.dispose();

      parcelLines.forEach((line) => line.geometry.dispose());
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
            81.000 parseli gökyüzünde keşfet. Parmağınla veya farenle
            sürükledikçe yeni parseller görünür.
          </p>
        </div>

        <div className="gokyuzu-badge">
          <span className="sun-dot" />
          <span>{TOTAL_PARCELS.toLocaleString('tr-TR')} PARSEL</span>
        </div>
      </header>

      <div className="gokyuzu-controls">
        <span>👆 Parmağınla sürükle</span>
        <span>🖱️ Fareyle sürükle</span>
        <span>↕️ Yakınlaştır / uzaklaştır</span>
        <span>▦ Sürükledikçe yeni parseller</span>
      </div>
    </main>
  );
}
