import { createFileRoute } from '@tanstack/react-router';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useEffect, useRef } from 'react';
import './gokyuzu.css';

export const Route = createFileRoute('/gokyuzu')({ component: GokyuzuPage });

const SKY_IMAGE_URL =
  'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/kloppenheim_03_puresky.jpg';

function GokyuzuPage() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      68,
      mount.clientWidth / mount.clientHeight,
      0.01,
      20000,
    );
    camera.position.set(0, 1.2, 0.01);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    mount.appendChild(renderer.domElement);

    // Real photographic daytime sky from Poly Haven, mapped around the camera.
    // The image is CC0 and contains real, static cloud formations.
    const loader = new THREE.TextureLoader();
    const skyTexture = loader.load(
      SKY_IMAGE_URL,
      undefined,
      undefined,
      () => {
        mount.classList.add('gokyuzu-sky-error');
      },
    );
    skyTexture.colorSpace = THREE.SRGBColorSpace;
    skyTexture.mapping = THREE.EquirectangularReflectionMapping;
    skyTexture.wrapS = THREE.RepeatWrapping;

    const skyGeometry = new THREE.SphereGeometry(8000, 64, 32);
    skyGeometry.scale(-1, 1, 1);
    const skyMaterial = new THREE.MeshBasicMaterial({
      map: skyTexture,
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
    });
    const skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skyDome);

    // Very subtle atmospheric fill; the photograph remains the visible sky.
    scene.add(new THREE.HemisphereLight(0xdff4ff, 0x86b7d8, 0.55));

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.045;
    controls.enablePan = false;
    controls.minDistance = 0.01;
    controls.maxDistance = 0.01;
    controls.minPolarAngle = 0.06;
    controls.maxPolarAngle = Math.PI - 0.06;
    controls.target.set(0, 1.2, -1);
    controls.rotateSpeed = 0.18;
    controls.zoomToCursor = false;

    const resize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', resize);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      // The clouds/photo never move independently. Only the user's view rotates.
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
          <p>Gerçek gökyüzü görüntüsünün içinde 3D olarak keşfet.</p>
        </div>
        <div className="gokyuzu-badge">
          <span className="sun-dot" />
          <span>Gerçek gündüz gökyüzü</span>
        </div>
      </header>

      <div className="gokyuzu-controls">
        <span>👆 Sürükle: gökyüzüne bak</span>
        <span>☁️ Bulutlar sabit</span>
      </div>
    </main>
  );
}
