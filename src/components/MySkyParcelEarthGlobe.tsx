import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Props = {
  className?: string;
  onProvinceSelect?: (province: { name: string; slug: string; parcelCount: number | null }) => void;
};

type GeoJsonGeometry =
  | { type: "Polygon"; coordinates: number[][][] }
  | { type: "MultiPolygon"; coordinates: number[][][][] };

type GeoJsonFeature = {
  type: "Feature";
  properties?: Record<string, unknown>;
  geometry?: GeoJsonGeometry | null;
};

type GeoJsonCollection = { type: "FeatureCollection"; features: GeoJsonFeature[] };

const EARTH_TEXTURE = "https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73826/world.topo.bathy.200410.3x5400x2700.jpg";
const CLOUD_TEXTURE = "https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57747/cloud_combined_2048.jpg";
const PROVINCES_GEOJSON = "https://raw.githubusercontent.com/ttezer/turkiye-harita-verisi/master/dist/geojson/provinces.geojson";
const EARTH_RADIUS = 1.5;

function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function coordinateToVector3(lng: number, lat: number, radius = EARTH_RADIUS + 0.012) {
  const phi = THREE.MathUtils.degToRad(lat);
  const theta = THREE.MathUtils.degToRad(lng);
  return new THREE.Vector3(
    radius * Math.cos(phi) * Math.cos(theta),
    radius * Math.sin(phi),
    radius * Math.cos(phi) * Math.sin(theta),
  );
}

function ringToLine(ring: number[][]) {
  const points = ring
    .filter((coordinate) => Number.isFinite(coordinate[0]) && Number.isFinite(coordinate[1]))
    .map(([lng, lat]) => coordinateToVector3(lng, lat));
  return points.length > 1 ? new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0x66d9ff, transparent: true, opacity: 0.9 })) : null;
}

function featureName(feature: GeoJsonFeature, index: number) {
  const properties = feature.properties ?? {};
  const value = properties.name ?? properties.NAME_1 ?? properties.province ?? properties.il ?? properties.ad ?? `İl ${index + 1}`;
  return String(value);
}

function addFeatureLines(feature: GeoJsonFeature, index: number) {
  if (!feature.geometry) return null;
  const name = featureName(feature, index);
  const group = new THREE.Group();
  group.name = name;
  group.userData = { provinceName: name, provinceSlug: slugify(name) };
  const material = new THREE.LineBasicMaterial({ color: 0x55c8ff, transparent: true, opacity: 0.62 });
  const rings = feature.geometry.type === "Polygon" ? feature.geometry.coordinates : feature.geometry.coordinates.flat();
  for (const ring of rings) {
    const points = ring.map(([lng, lat]) => coordinateToVector3(lng, lat));
    if (points.length < 2) continue;
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    group.add(new THREE.Line(geometry, material));
  }
  return group.children.length ? group : null;
}

export function MySkyParcelEarthGlobe({ className = "", onProvinceSelect }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("Dünya yükleniyor…");
  const [provinceCount, setProvinceCount] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x01040b);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 100);
    const turkeyLat = THREE.MathUtils.degToRad(39);
    const turkeyLng = THREE.MathUtils.degToRad(35);
    const initialDirection = new THREE.Vector3(
      Math.cos(turkeyLat) * Math.cos(turkeyLng),
      Math.sin(turkeyLat),
      Math.cos(turkeyLat) * Math.sin(turkeyLng),
    ).normalize();
    camera.position.copy(initialDirection.multiplyScalar(4.25));

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.enablePan = false;
    controls.minDistance = 2.35;
    controls.maxDistance = 7.5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.18;
    controls.target.set(0, 0, 0);
    controls.update();

    const ambient = new THREE.AmbientLight(0x6e88ad, 0.48);
    scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffffff, 2.7);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    const coolFill = new THREE.DirectionalLight(0x3c6da8, 0.55);
    coolFill.position.set(-4, -2, -3);
    scene.add(coolFill);

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(EARTH_TEXTURE, () => setStatus("Dünya hazır"), undefined, () => setStatus("Dünya dokusu yüklenemedi"));
    earthTexture.colorSpace = THREE.SRGBColorSpace;
    earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS, 128, 128),
      new THREE.MeshPhongMaterial({ map: earthTexture, shininess: 8, specular: new THREE.Color(0x1c3550) }),
    );
    scene.add(earth);

    const cloudTexture = textureLoader.load(CLOUD_TEXTURE);
    cloudTexture.colorSpace = THREE.SRGBColorSpace;
    cloudTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.012, 96, 96),
      new THREE.MeshPhongMaterial({ map: cloudTexture, transparent: true, opacity: 0.34, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    scene.add(clouds);

    const atmosphere = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.08, 96, 96),
      new THREE.ShaderMaterial({
        uniforms: { glowColor: { value: new THREE.Color(0x4da3ff) }, viewVector: { value: camera.position } },
        vertexShader: `varying vec3 vNormal; varying vec3 vWorldPosition; void main(){ vNormal = normalize(normalMatrix * normal); vec4 worldPosition = modelMatrix * vec4(position,1.0); vWorldPosition = worldPosition.xyz; gl_Position = projectionMatrix * viewMatrix * worldPosition; }`,
        fragmentShader: `uniform vec3 glowColor; varying vec3 vNormal; varying vec3 vWorldPosition; void main(){ vec3 viewDir = normalize(cameraPosition - vWorldPosition); float intensity = pow(0.72 - max(dot(vNormal, viewDir), 0.0), 3.0); gl_FragColor = vec4(glowColor, intensity * 0.72); }`,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    );
    scene.add(atmosphere);

    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 3200;
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
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

    const provinces = new THREE.Group();
    provinces.name = "TurkeyProvinces";
    scene.add(provinces);
    const raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = 0.035;
    const pointer = new THREE.Vector2();
    let selectedGroup: THREE.Group | null = null;
    let disposed = false;

    const setSelected = (group: THREE.Group | null) => {
      if (selectedGroup) {
        selectedGroup.traverse((child) => {
          if (child instanceof THREE.Line && child.material instanceof THREE.LineBasicMaterial) child.material.color.setHex(0x55c8ff);
        });
      }
      selectedGroup = group;
      if (selectedGroup) {
        selectedGroup.traverse((child) => {
          if (child instanceof THREE.Line && child.material instanceof THREE.LineBasicMaterial) child.material.color.setHex(0xffffff);
        });
      }
    };

    const selectProvince = async (group: THREE.Group) => {
      const name = String(group.userData.provinceName ?? "");
      const slug = String(group.userData.provinceSlug ?? slugify(name));
      setSelected(group);
      let parcelCount: number | null = null;
      if (supabaseBrowser) {
        try {
          const box = new THREE.Box3().setFromObject(group);
          const points = group.children.flatMap((child) => child instanceof THREE.Line ? Array.from((child.geometry.getAttribute("position") as THREE.BufferAttribute).array as ArrayLike<number>) : []);
          void points;
          const minLat = -90;
          const maxLat = 90;
          const minLng = -180;
          const maxLng = 180;
          const result = await supabaseBrowser.rpc("parcels_in_view", { p_city_slug: slug, p_min_lat: minLat, p_min_lng: minLng, p_max_lat: maxLat, p_max_lng: maxLng });
          if (!result.error && Array.isArray(result.data)) parcelCount = result.data.length;
          void box;
        } catch (error) {
          console.warn("Province parcel lookup skipped", error);
        }
      }
      if (!disposed) onProvinceSelect?.({ name, slug, parcelCount });
    };

    const onPointerDown = () => { renderer.domElement.style.cursor = "grabbing"; };
    const onPointerUp = () => { renderer.domElement.style.cursor = "grab"; };
    const onPointerClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(provinces.children, true);
      const group = hits.find((hit) => hit.object.parent instanceof THREE.Group)?.object.parent;
      if (group instanceof THREE.Group) void selectProvince(group);
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("click", onPointerClick);

    fetch(PROVINCES_GEOJSON)
      .then(async (response) => {
        if (!response.ok) throw new Error(`GeoJSON HTTP ${response.status}`);
        return (await response.json()) as GeoJsonCollection;
      })
      .then((geojson) => {
        if (disposed) return;
        geojson.features.forEach((feature, index) => {
          const group = addFeatureLines(feature, index);
          if (!group) return;
          provinces.add(group);
        });
        setProvinceCount(provinces.children.length);
      })
      .catch((error) => {
        console.error("Turkey province GeoJSON load failed", error);
        if (!disposed) setStatus("Dünya hazır · il sınırları yüklenemedi");
      });

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const onVisibility = () => { controls.autoRotate = document.visibilityState === "visible"; };
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    resize();

    const clock = new THREE.Clock();
    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      controls.update();
      clouds.rotation.y += delta * 0.004;
      stars.rotation.y += delta * 0.00012;
      atmosphere.material.uniforms.viewVector.value.copy(camera.position);
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
      renderer.domElement.removeEventListener("click", onPointerClick);
      controls.dispose();
      earthTexture.dispose();
      cloudTexture.dispose();
      earth.geometry.dispose();
      (earth.material as THREE.Material).dispose();
      clouds.geometry.dispose();
      (clouds.material as THREE.Material).dispose();
      atmosphere.geometry.dispose();
      (atmosphere.material as THREE.Material).dispose();
      starsGeometry.dispose();
      (stars.material as THREE.Material).dispose();
      provinces.traverse((child) => {
        if (child instanceof THREE.Line) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [onProvinceSelect]);

  return (
    <div className={`relative h-[560px] w-full overflow-hidden rounded-3xl border border-sky-200/15 bg-[#01040b] shadow-2xl shadow-black/40 ${className}`}>
      <div ref={mountRef} className="absolute inset-0" aria-label="MySkyParcel gerçek 3D Dünya küresi" />
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] font-medium tracking-[0.12em] text-white/75 backdrop-blur-md">
        {status}{provinceCount ? ` · ${provinceCount}/81 il` : ""}
      </div>
      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] text-white/60 backdrop-blur-md">
        Döndür · yakınlaştır · uzaklaştır · Türkiye'den il seç
      </div>
    </div>
  );
}
