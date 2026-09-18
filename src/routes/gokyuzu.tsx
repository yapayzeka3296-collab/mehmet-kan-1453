import { createFileRoute } from '@tanstack/react-router';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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
    renderer.setClearColor(0x58aee0, 0);
    mount.appendChild(renderer.domElement);

    const loadingManager = new THREE.LoadingManager();
    loadingManager.onLoad = () => mount.classList.add('gokyuzu-sky-ready');
    loadingManager.onError = () => {
      mount.classList.remove('gokyuzu-sky-ready');
      mount.classList.add('gokyuzu-sky-fallback');
    };

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

        // Important: render the photographic panorama as the actual
        // Three.js scene background. The CSS image stays only as fallback.
        // This makes the visible sky rotate with the camera on touch/mouse.
        scene.background = texture;
        mount.classList.add('gokyuzu-sky-ready');
      },
      undefined,
      () => {
        mount.classList.remove('gokyuzu-sky-ready');
        mount.classList.add('gokyuzu-sky-fallback');
      },
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = true;
    controls.enableRotate = true;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
    controls.minPolarAngle = 0.001;
    controls.maxPolarAngle = Math.PI - 0.001;
    controls.rotateSpeed = 0.7;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // One-finger touch = rotate. No two-finger pan/zoom is needed here.
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
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
