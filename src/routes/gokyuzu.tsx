import { createFileRoute } from '@tanstack/react-router';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useEffect, useRef } from 'react';
import './gokyuzu.css';

export const Route = createFileRoute('/gokyuzu')({ component: GokyuzuPage });

// Poly Haven CDN preview: same photographic sky family, served from a web CDN.
// The CSS background is also used as a visible fallback so a texture/network
// failure can never leave the Three.js canvas black.
const SKY_IMAGE_URL =
  'https://cdn.polyhaven.com/asset_img/primary/kloppenheim_03_puresky.png?height=2048';

function GokyuzuPage() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      68,
      Math.max(mount.clientWidth, 1) / Math.max(mount.clientHeight, 1),
      0.01,
      20000,
    );
    camera.position.set(0, 0, 0.01);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const loadingManager = new THREE.LoadingManager();
    loadingManager.onLoad = () => mount.classList.add('gokyuzu-sky-ready');
    loadingManager.onError = () => mount.classList.add('gokyuzu-sky-fallback');

    const loader = new THREE.TextureLoader(loadingManager);
    loader.setCrossOrigin('anonymous');

    const skyTexture = loader.load(
      SKY_IMAGE_URL,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        mount.classList.add('gokyuzu-sky-ready');
      },
      undefined,
      () => {
        mount.classList.add('gokyuzu-sky-fallback');
      },
    );

    const skyGeometry = new THREE.SphereGeometry(8000, 64, 40);
    skyGeometry.scale(-1, 1, 1);

    const skyMaterial = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide,
      depthWrite: false,
      transparent: true,
      opacity: 1,
      fog: false,
    });

    const skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skyDome);

    const controls = new OrbitControls(camera, renderer.domElement);

    // Full 360° panorama navigation: one-finger drag on mobile and
    // left-mouse drag on desktop rotate the view without panning or zooming.
    controls.enableRotate = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
    controls.minPolarAngle = 0.001;
    controls.maxPolarAngle = Math.PI - 0.001;
    controls.rotateSpeed = 0.55;
    controls.enableDamping = true;
    controls.dampingFactor = 0.045;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
    controls.target.set(0, 0, -1);

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
      window.removeEventListener('resize', resize);
      controls.dispose();
      skyTexture.dispose();
      skyGeometry.dispose();
      skyMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <main className="gokyuzu-page">
      <div
        ref={mountRef}
        className="gokyuzu-canvas"
        aria-label="Parsel Dünyası gerçek 3D gündüz gökyüzü"
      />

      <header className="gokyuzu-header">
        <div>
          <div className="gokyuzu-kicker">MYSKYPARCEL · PARSEL DÜNYASI</div>
          <h1>Gökyüzü</h1>
          <p>Gerçek gündüz gökyüzünü 360° olarak keşfet.</p>
        </div>

        <div className="gokyuzu-badge">
          <span className="sun-dot" />
          <span>360° gündüz gökyüzü</span>
        </div>
      </header>

      <div className="gokyuzu-controls">
        <span>👆 Sürükle: 360° bakış</span>
        <span>☁️ Bulutlar sabit</span>
      </div>
    </main>
  );
}
