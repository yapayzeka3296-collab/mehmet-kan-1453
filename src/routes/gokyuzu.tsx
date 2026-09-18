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

    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let activeTouchId: number | null = null;

    const moveGrid = (clientX: number, clientY: number) => {
      const dx = clientX - lastX;
      const dy = clientY - lastY;
      lastX = clientX;
      lastY = clientY;

      // Move the parcel world itself. This is deliberately independent
      // of camera rotation so touch dragging works like a map.
      const moveX = dx * 0.28;
      const moveZ = dy * 0.28;
      gridGroup.position.x += moveX;
      gridGroup.position.z += moveZ;
      grid.position.x += moveX;
      grid.position.z += moveZ;

      // Recycle in complete parcel-sized steps to keep the world endless.
      if (Math.abs(gridGroup.position.x) >= tileSize) {
        const steps = Math.trunc(gridGroup.position.x / tileSize);
        gridGroup.position.x -= steps * tileSize;
        grid.position.x -= steps * tileSize;
      }
      if (Math.abs(gridGroup.position.z) >= tileSize) {
        const steps = Math.trunc(gridGroup.position.z / tileSize);
        gridGroup.position.z -= steps * tileSize;
        grid.position.z -= steps * tileSize;
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      event.preventDefault();
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.style.cursor = 'grabbing';
      renderer.domElement.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      event.preventDefault();
      moveGrid(event.clientX, event.clientY);
    };

    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      renderer.domElement.style.cursor = 'grab';
      if (renderer.domElement.hasPointerCapture?.(event.pointerId)) {
        renderer.domElement.releasePointerCapture(event.pointerId);
      }
    };

    // Android browsers/WebViews can behave differently with Pointer Events.
    // Keep an explicit touch path as a fallback, with passive:false so the
    // page cannot steal the gesture for scrolling.
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const touch = event.touches[0];
      activeTouchId = touch.identifier;
      dragging = true;
      lastX = touch.clientX;
      lastY = touch.clientY;
      event.preventDefault();
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!dragging || activeTouchId === null) return;
      const touch = Array.from(event.touches).find(
        (item) => item.identifier === activeTouchId,
      );
      if (!touch) return;
      event.preventDefault();
      moveGrid(touch.clientX, touch.clientY);
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (activeTouchId === null) return;
      const stillActive = Array.from(event.touches).some(
        (item) => item.identifier === activeTouchId,
      );
      if (!stillActive) {
        dragging = false;
        activeTouchId = null;
        renderer.domElement.style.cursor = 'grab';
      }
      event.preventDefault();
    };

    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointercancel', onPointerUp);
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
    renderer.domElement.addEventListener('touchend', onTouchEnd, { passive: false });
    renderer.domElement.addEventListener('touchcancel', onTouchEnd, { passive: false });

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
