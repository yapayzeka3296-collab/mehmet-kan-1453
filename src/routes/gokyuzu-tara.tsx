import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SiteHeader } from "@/components/SiteHeader";
import { geoToSkyWorld, type GeoPoint } from "@/lib/skyCoordinateEngine";

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanPage });

type TestParcel = {
  id: string;
  parcelNumber: string;
  latitude: number;
  longitude: number;
  altitude: number;
};

const FALLBACK_ORIGIN: GeoPoint = { latitude: 37.0662, longitude: 37.3833, altitude: 0 };

const TEST_PARCELS: TestParcel[] = [
  { id: "sky-test-1000", parcelNumber: "TEST-001000", latitude: 37.0752, longitude: 37.3833, altitude: 180 },
  { id: "sky-test-1500", parcelNumber: "TEST-001500", latitude: 37.0797, longitude: 37.3833, altitude: 260 },
  { id: "sky-test-2000", parcelNumber: "TEST-002000", latitude: 37.0842, longitude: 37.3833, altitude: 340 },
];

function SkyScanPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<TestParcel | null>(null);
  const [locationText, setLocationText] = useState("Test başlangıç konumu");
  const navigate = useNavigate();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020817);
    scene.fog = new THREE.FogExp2(0x020817, 0.00055);

    const camera = new THREE.PerspectiveCamera(65, mount.clientWidth / mount.clientHeight, 0.1, 10000);
    camera.position.set(0, 4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0x9fc5ff, 0x07111f, 1.5));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(400, 700, 250);
    scene.add(sun);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(6000, 6000),
      new THREE.MeshStandardMaterial({ color: 0x07131f, roughness: 0.92, metalness: 0.02 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -8;
    scene.add(ground);

    const grid = new THREE.GridHelper(6000, 120, 0x21405a, 0x102337);
    grid.position.y = -7.9;
    scene.add(grid);

    const origin = FALLBACK_ORIGIN;
    const parcelMeshes = new Map<THREE.Object3D, TestParcel>();

    for (const parcel of TEST_PARCELS) {
      const world = geoToSkyWorld(origin, parcel);
      const group = new THREE.Group();
      group.position.set(world.x, world.y, -world.z);

      const size = 32;
      const geometry = new THREE.BoxGeometry(size, 2.2, size);
      const material = new THREE.MeshStandardMaterial({ color: 0xd6a84f, emissive: 0x5b4217, emissiveIntensity: 0.45, metalness: 0.55, roughness: 0.3 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.userData.parcel = parcel;
      group.add(mesh);
      parcelMeshes.set(mesh, parcel);

      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0xffe3a1, transparent: true, opacity: 0.95 }),
      );
      group.add(edge);
      scene.add(group);
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects([...parcelMeshes.keys()], false)[0];
      if (hit) setSelected(parcelMeshes.get(hit.object) ?? null);
    };
    renderer.domElement.addEventListener("pointerdown", onPointer);

    let animationFrame = 0;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh && object.userData.parcel) {
          object.rotation.y += 0.0008;
        }
      });
      renderer.render(scene, camera);
    };
    animate();

    const resize = () => {
      if (!mount.clientWidth || !mount.clientHeight) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", resize);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationText(`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
        },
        () => setLocationText("GPS izni verilmedi · test koordinatı kullanılıyor"),
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 30000 },
      );
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointerdown", onPointer);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) object.material.forEach((m) => m.dispose());
          else object.material.dispose();
        }
      });
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <main className="relative mx-auto max-w-[1800px] px-3 pb-6 pt-3 sm:px-5 lg:px-8">
        <section className="mb-3 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/90 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.24em] text-amber-300">MySkyParcel · 3D Sky Engine</p>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl">Gökyüzünü Tara</h1>
            <p className="mt-1 text-xs text-white/55">Parseller gerçek 3B dünya koordinatlarında. 2B harita veya kamera sabit katmanı kullanılmıyor.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/65">Konum: {locationText}</div>
        </section>

        <div ref={mountRef} className="relative h-[72vh] min-h-[520px] overflow-hidden rounded-2xl border border-white/10 shadow-2xl" aria-label="MySkyParcel gerçek 3B gökyüzü sahnesi" />

        <section className="mt-3 rounded-2xl border border-amber-300/15 bg-slate-900/90 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-amber-300">3B parsel seçimi</p>
              <p className="mt-1 text-sm text-white/70">1 km · 1,5 km · 2 km test parselleri sahnenin içindedir. Bir parseli seçmek için 3B yüzeyine dokunun.</p>
              {selected && <p className="mt-2 font-display text-xl">PARSEL #{selected.parcelNumber}</p>}
            </div>
            {selected && (
              <button
                type="button"
                onClick={() => void navigate({ to: "/parsel-satin-al", search: { parcels: selected.id } })}
                className="rounded-xl bg-amber-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
              >
                Bu parseli satın al
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
