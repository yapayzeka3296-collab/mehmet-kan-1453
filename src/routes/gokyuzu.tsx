import { createFileRoute } from '@tanstack/react-router';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import './gokyuzu.css';

export const Route = createFileRoute('/gokyuzu')({ component: GokyuzuPage });

const SKY_IMAGE_URL =
  'https://cdn.polyhaven.com/asset_img/primary/kloppenheim_03_puresky.png?height=2048';

function GokyuzuPage() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      Math.max(mount.clientWidth, 1) / Math.max(mount.clientHeight, 1),
      0.1,
      20000,
    );
    camera.position.set(0, 32, 34);
    camera.lookAt(0, 0, -8);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
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

    // Infinite-feeling sky parcel grid: a large tiled plane is recycled
    // underneath the camera while dragging, so new squares continuously enter view.
    const gridSize = 200;
    const divisions = 20;
    const grid = new THREE.GridHelper(gridSize, divisions, 0xffffff, 0xffffff);
    grid.position.set(0, 0, -40);
    grid.material.transparent = true;
    grid.material.opacity = 0.42;
    scene.add(grid);

    const gridGroup = new THREE.Group();
    scene.add(gridGroup);
    const tileSize = 10;
    const tileCount = 12;
    const lines = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.48,
    });

    const buildTile = (x: number, z: number) => {
      const points = [
        new THREE.Vector3(x, 0.05, z),
        new THREE.Vector3(x + tileSize, 0.05, z),
        new THREE.Vector3(x + tileSize, 0.05, z + tileSize),
        new THREE.Vector3(x, 0.05, z + tileSize),
        new THREE.Vector3(x, 0.05, z),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lines);
      gridGroup.add(line);
    };

    for (let ix = -tileCount; ix < tileCount; ix += 1) {
      for (let iz = -tileCount; iz < tileCount; iz += 1) {
        buildTile(ix * tileSize, iz * tileSize);
      }
    }

    let offsetX = 0;
    let offsetZ = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const wrap = (value: number, size: number) =>
      ((value % size) + size) % size;

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;

      offsetX += dx * 0.16;
      offsetZ += dy * 0.16;

      const wrappedX = wrap(offsetX, tileSize);
      const wrappedZ = wrap(offsetZ, tileSize);
      gridGroup.position.x = wrappedX;
      gridGroup.position.z = wrappedZ;
      grid.position.x = wrappedX;
      grid.position.z = -40 + wrappedZ;
    };

    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      if (renderer.domElement.hasPointerCapture(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);

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
      window.removeEventListener('resize', resize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('resize', resize);
      skyTexture.dispose();
      skyGeometry.dispose();
      skyMaterial.dispose();
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      gridGroup.children.forEach((child) => {
        const line = child as THREE.Line;
        line.geometry.dispose();
      });
      lines.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <main className="gokyuzu-page">
      <div
        ref={mountRef}
        className="gokyuzu-canvas"
        aria-label="Parsel Dünyası sonsuz gökyüzü parsel ızgarası"
      />
      <header className="gokyuzu-header">
        <div>
          <div className="gokyuzu-kicker">MYSKYPARCEL · PARSEL DÜNYASI</div>
          <h1>Gökyüzü</h1>
          <p>Gökyüzünde sonsuz parsel ızgarasını keşfet.</p>
        </div>
        <div className="gokyuzu-badge">
          <span className="sun-dot" />
          <span>Sonsuz parsel görünümü</span>
        </div>
      </header>
      <div className="gokyuzu-controls">
        <span>👆 Sürükle: parsel dünyasını hareket ettir</span>
        <span>▦ Yeni kareler görünür</span>
      </div>
    </main>
  );
}
