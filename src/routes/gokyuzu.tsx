import { createFileRoute } from '@tanstack/react-router';
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { useEffect, useRef } from 'react';
import './gokyuzu.css';

export const Route = createFileRoute('/gokyuzu')({ component: GokyuzuPage });

type Cloud = {
  sprite: THREE.Sprite;
  baseX: number;
  baseZ: number;
  drift: number;
  scale: number;
};

function createCloudTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  if (!context) return null;

  const gradient = context.createRadialGradient(128, 64, 8, 128, 64, 108);
  gradient.addColorStop(0, 'rgba(255,255,255,0.92)');
  gradient.addColorStop(0.42, 'rgba(255,255,255,0.72)');
  gradient.addColorStop(0.78, 'rgba(255,255,255,0.28)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function GokyuzuPage() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      58,
      mount.clientWidth / mount.clientHeight,
      0.1,
      1000000,
    );
    camera.position.set(0, 12, 35);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.82;
    mount.appendChild(renderer.domElement);

    // Physically-inspired daylight atmosphere from the official Three.js Sky addon.
    const sky = new Sky();
    sky.scale.setScalar(450000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;
    skyUniforms.turbidity.value = 5.2;
    skyUniforms.rayleigh.value = 2.15;
    skyUniforms.mieCoefficient.value = 0.0042;
    skyUniforms.mieDirectionalG.value = 0.72;

    const sun = new THREE.Vector3();
    const elevation = 48;
    const azimuth = -35;
    const phi = THREE.MathUtils.degToRad(90 - elevation);
    const theta = THREE.MathUtils.degToRad(azimuth);
    sun.setFromSphericalCoords(1, phi, theta);
    skyUniforms.sunPosition.value.copy(sun);

    // A soft atmospheric horizon keeps the scene bright and endless instead of flat.
    scene.fog = new THREE.FogExp2(0x9ccff5, 0.00018);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.035;
    controls.enablePan = false;
    controls.minDistance = 18;
    controls.maxDistance = 110;
    controls.minPolarAngle = 0.12;
    controls.maxPolarAngle = Math.PI * 0.82;
    controls.target.set(0, 28, 0);

    // Lightweight procedural cloud puffs. No external image download is required.
    const cloudTexture = createCloudTexture();
    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);

    const clouds: Cloud[] = [];
    if (cloudTexture) {
      const cloudMaterial = new THREE.SpriteMaterial({
        map: cloudTexture,
        transparent: true,
        opacity: 0.78,
        depthWrite: false,
        color: 0xffffff,
        fog: true,
      });

      const cloudCount = 42;
      for (let i = 0; i < cloudCount; i += 1) {
        const sprite = new THREE.Sprite(cloudMaterial.clone());
        const angle = (i / cloudCount) * Math.PI * 2 + (i % 5) * 0.21;
        const radius = 90 + ((i * 47) % 260);
        const scale = 24 + ((i * 19) % 55);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = 35 + ((i * 23) % 52);
        sprite.position.set(x, y, z);
        sprite.scale.set(scale * 1.55, scale * 0.7, 1);
        sprite.renderOrder = 2;
        cloudGroup.add(sprite);
        clouds.push({
          sprite,
          baseX: x,
          baseZ: z,
          drift: 0.7 + (i % 7) * 0.06,
          scale,
        });
      }
    }

    const ambient = new THREE.HemisphereLight(0xdff4ff, 0x8ab4d8, 1.5);
    scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(80, 160, -120);
    scene.add(sunLight);

    const updateClouds = (time: number) => {
      const cameraX = camera.position.x;
      const cameraZ = camera.position.z;
      const wrap = 330;

      for (const cloud of clouds) {
        let x = cloud.baseX + time * cloud.drift;
        let z = cloud.baseZ;

        x = ((x - cameraX + wrap / 2) % wrap + wrap) % wrap - wrap / 2 + cameraX;
        z = ((z - cameraZ + wrap / 2) % wrap + wrap) % wrap - wrap / 2 + cameraZ;

        cloud.sprite.position.x = x;
        cloud.sprite.position.z = z;
        cloud.sprite.position.y += Math.sin(time * 0.18 + cloud.baseX) * 0.002;
      }
    };

    const resize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', resize);

    const clock = new THREE.Clock();
    let frame = 0;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      controls.update();
      updateClouds(time);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      controls.dispose();

      cloudGroup.traverse((object) => {
        const sprite = object as THREE.Sprite;
        if (sprite.material) {
          const material = sprite.material as THREE.SpriteMaterial;
          material.map?.dispose();
          material.dispose();
        }
      });
      cloudTexture?.dispose();

      sky.geometry.dispose();
      sky.material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <main className="gokyuzu-page">
      <div ref={mountRef} className="gokyuzu-canvas" aria-label="Parsel Dünyası sonsuz 3D gündüz gökyüzü" />

      <header className="gokyuzu-header">
        <div>
          <div className="gokyuzu-kicker">MYSKYPARCEL · PARSEL DÜNYASI</div>
          <h1>Gökyüzü</h1>
          <p>Gündüz gökyüzünün içinde sonsuz bir 3D dünya. Sürükleyerek ufku keşfet.</p>
        </div>
        <div className="gokyuzu-badge">
          <span className="sun-dot" />
          <span>Gündüz modu</span>
        </div>
      </header>

      <div className="gokyuzu-horizon">
        <span>∞</span>
        <div>
          <strong>Sonsuz gökyüzü</strong>
          <small>Bulutlar hareket eder · kamera yönü özgür</small>
        </div>
      </div>

      <div className="gokyuzu-controls">
        <span>👆 Sürükle: gökyüzünü keşfet</span>
        <span>↕ Yaklaş / uzaklaş</span>
      </div>
    </main>
  );
}
