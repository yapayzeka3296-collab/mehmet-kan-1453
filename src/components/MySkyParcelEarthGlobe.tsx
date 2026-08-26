import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Props = { className?: string; onProvinceSelect?: (province: { name: string; slug: string; parcelCount: number | null }) => void };
const EARTH_TEXTURE = "/api/earth-assets?type=earth";
const CLOUD_TEXTURE = "/api/earth-assets?type=clouds";
const EARTH_RADIUS = 1.5;

export function MySkyParcelEarthGlobe({ className = "", onProvinceSelect: _onProvinceSelect }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Dünya yükleniyor…");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x01040b);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 100);
    camera.position.set(0, 0.35, 5.05);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.rotateSpeed = 0.65;
    controls.zoomSpeed = 0.75;
    controls.enablePan = false;
    controls.minDistance = 2.35;
    controls.maxDistance = 7.5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.378;
    controls.target.set(0, 0, 0);
    controls.update();

    scene.add(new THREE.AmbientLight(0x6e88ad, 0.48));
    const sun = new THREE.DirectionalLight(0xffffff, 2.7);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x3c6da8, 0.55);
    fill.position.set(-4, -2, -3);
    scene.add(fill);

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(EARTH_TEXTURE, () => {
      if (!disposed) setStatus("Dünya hazır");
    }, undefined, () => {
      if (!disposed) setStatus("Dünya dokusu yüklenemedi");
    });
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 96, 64);
    const earth = new THREE.Mesh(earthGeometry, new THREE.MeshPhongMaterial({ map: earthTexture, shininess: 8, specular: new THREE.Color(0x1c3550) }));
    scene.add(earth);

    const cloudTexture = textureLoader.load(CLOUD_TEXTURE, undefined, undefined, () => undefined);
    cloudTexture.colorSpace = THREE.SRGBColorSpace;
    cloudTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 2);
    const cloudGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.014, 64, 48);
    const clouds = new THREE.Mesh(cloudGeometry, new THREE.MeshPhongMaterial({ color: 0xffffff, alphaMap: cloudTexture, transparent: true, opacity: 0.42, depthWrite: false }));
    scene.add(clouds);

    const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.085, 64, 48);
    const atmosphere = new THREE.Mesh(atmosphereGeometry, new THREE.ShaderMaterial({
      vertexShader: `varying vec3 vNormal; varying vec3 vWorldPosition; void main(){vNormal=normalize(normalMatrix*normal);vec4 worldPosition=modelMatrix*vec4(position,1.0);vWorldPosition=worldPosition.xyz;gl_Position=projectionMatrix*viewMatrix*worldPosition;}`,
      fragmentShader: `varying vec3 vNormal; varying vec3 vWorldPosition; void main(){vec3 viewDir=normalize(cameraPosition-vWorldPosition);float intensity=pow(0.76-max(dot(vNormal,viewDir),0.0),3.0);gl_FragColor=vec4(vec3(0.302,0.639,1.0),intensity*0.78);}`,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    }));
    scene.add(atmosphere);

    // Decorative stars only. No project, parcel, province or Supabase data is loaded here.
    const starsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(1800 * 3);
    for (let i = 0; i < 1800; i++) {
      const radius = 11 + Math.random() * 28;
      const theta = Math.random() * Math.PI * 2;
      const z = Math.random() * 2 - 1;
      const xy = Math.sqrt(1 - z * z);
      positions[i * 3] = radius * xy * Math.cos(theta);
      positions[i * 3 + 1] = radius * z;
      positions[i * 3 + 2] = radius * xy * Math.sin(theta);
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.035, sizeAttenuation: true, transparent: true, opacity: 0.9 }));
    scene.add(stars);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const onVisibility = () => { controls.autoRotate = document.visibilityState === "visible"; };
    const onPointerDown = () => { renderer.domElement.style.cursor = "grabbing"; };
    const onPointerUp = () => { renderer.domElement.style.cursor = "grab"; };
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    resize();

    let frame = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      controls.update();
      clouds.rotation.y += delta * 0.004;
      stars.rotation.y += delta * 0.00012;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      earthTexture.dispose();
      cloudTexture.dispose();
      earthGeometry.dispose();
      (earth.material as THREE.Material).dispose();
      cloudGeometry.dispose();
      (clouds.material as THREE.Material).dispose();
      atmosphereGeometry.dispose();
      (atmosphere.material as THREE.Material).dispose();
      starsGeometry.dispose();
      (stars.material as THREE.Material).dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className={`relative h-[560px] w-full overflow-hidden rounded-3xl border border-sky-200/15 bg-[#01040b] shadow-2xl shadow-black/40 ${className}`}>
      <div ref={mountRef} className="absolute inset-0" aria-label="MySkyParcel görsel 3D Dünya küresi" />
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] font-medium tracking-[0.12em] text-white/75 backdrop-blur-md">{status}</div>
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] text-white/60 backdrop-blur-md">Döndür · yakınlaştır · uzaklaştır</div>
    </div>
  );
}
