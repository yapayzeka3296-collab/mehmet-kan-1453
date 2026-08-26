import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = { className?: string };
const EARTH_TEXTURE = "/api/earth-assets?type=earth";
const CLOUD_TEXTURE = "/api/earth-assets?type=clouds";
const EARTH_RADIUS = 1.5;

/**
 * Opening-screen globe only.
 * Deliberately has no project, parcel, province, map or Supabase dependencies.
 * It is a self-contained visual and does not participate in application data flow.
 */
export function MySkyParcelEarthGlobe({ className = "" }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let disposed = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x01040b);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 100);
    camera.position.set(0, 0.35, 5.05);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    // Keep the visual sharp while preventing high-DPI devices from multiplying GPU work.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x6e88ad, 0.48));
    const sun = new THREE.DirectionalLight(0xffffff, 2.7);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x3c6da8, 0.55);
    fill.position.set(-4, -2, -3);
    scene.add(fill);

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(EARTH_TEXTURE);
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);

    const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 128, 128);
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      shininess: 8,
      specular: new THREE.Color(0x1c3550),
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    const cloudTexture = textureLoader.load(CLOUD_TEXTURE);
    cloudTexture.colorSpace = THREE.SRGBColorSpace;
    cloudTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 2);
    const cloudGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.014, 96, 96);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      alphaMap: cloudTexture,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });
    const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    scene.add(clouds);

    const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.085, 96, 96);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `varying vec3 vNormal; varying vec3 vWorldPosition; void main(){vNormal=normalize(normalMatrix*normal);vec4 worldPosition=modelMatrix*vec4(position,1.0);vWorldPosition=worldPosition.xyz;gl_Position=projectionMatrix*viewMatrix*worldPosition;}`,
      fragmentShader: `varying vec3 vNormal; varying vec3 vWorldPosition; void main(){vec3 viewDir=normalize(cameraPosition-vWorldPosition);float intensity=pow(0.76-max(dot(vNormal,viewDir),0.0),3.0);gl_FragColor=vec4(vec3(0.302,0.639,1.0),intensity*0.78);}`,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    // Decorative stars only. No application or map data is involved.
    const starsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(3200 * 3);
    for (let i = 0; i < 3200; i++) {
      const radius = 11 + Math.random() * 28;
      const theta = Math.random() * Math.PI * 2;
      const z = Math.random() * 2 - 1;
      const xy = Math.sqrt(1 - z * z);
      positions[i * 3] = radius * xy * Math.cos(theta);
      positions[i * 3 + 1] = radius * z;
      positions[i * 3 + 2] = radius * xy * Math.sin(theta);
    }
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.035,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
    });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    window.addEventListener("resize", resize);
    resize();

    // No OrbitControls or application event handlers: the globe simply rotates as a visual.
    let frame = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      earth.rotation.y += delta * 0.018;
      clouds.rotation.y += delta * 0.004;
      stars.rotation.y += delta * 0.00012;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      earthTexture.dispose();
      cloudTexture.dispose();
      earthGeometry.dispose();
      earthMaterial.dispose();
      cloudGeometry.dispose();
      cloudMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className={`relative h-[560px] w-full overflow-hidden rounded-3xl border border-sky-200/15 bg-[#01040b] shadow-2xl shadow-black/40 ${className}`}>
      <div ref={mountRef} className="absolute inset-0" aria-label="MySkyParcel görsel 3D Dünya küresi" />
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] text-white/60 backdrop-blur-md">Döndür · yakınlaştır · uzaklaştır</div>
    </div>
  );
}
