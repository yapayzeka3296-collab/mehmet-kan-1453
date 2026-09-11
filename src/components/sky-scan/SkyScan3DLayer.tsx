import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export type Parcel3D = {
  id: string;
  east: number;
  north: number;
  altitude: number;
  distance: number;
};

export type ProjectedHit = {
  id: string;
  x: number;
  y: number;
  visible: boolean;
};

type ParcelMeta = {
  id: string;
  parcel_number: string;
  city_name: string;
  status: string;
  price: number | string | null;
  tier: string | null;
  tier_price: number | string | null;
};

type Props = {
  parcels: Parcel3D[];
  heading: number | null;
  pitch: number | null;
  fov: number;
  visible: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onProjectSelected?: (hit: ProjectedHit | null) => void;
};

const MAX_RENDER_DISTANCE = 5000;
const MAX_RENDERABLE_PARCELS = 100;
const PICK_THRESHOLD = 24;
const nf = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });

function money(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  return Number.isFinite(n) ? `₺${nf.format(n)}` : "—";
}

function distanceLabel(value: number) {
  return value < 1000 ? `${Math.round(value)} m` : `${(value / 1000).toFixed(1).replace(".", ",")} km`;
}

function compass(angle: number | null) {
  if (angle === null || !Number.isFinite(angle)) return "—";
  const a = ((angle % 360) + 360) % 360;
  const names = ["K", "KD", "D", "GD", "G", "GB", "B", "KB"];
  return `${Math.round(a)}° ${names[Math.round(a / 45) % 8]}`;
}

function colorForTier(tier: string | null | undefined, selected: boolean) {
  if (selected || tier === "premium" || tier === "elite") return "#ffd166";
  if (tier === "digital") return "#67d8ff";
  return "#ff7bd5";
}

function scaleForDistance(distance: number) {
  return THREE.MathUtils.clamp(1.65 / Math.sqrt(distance / 1000 + 0.65), 0.5, 1.55);
}

function detailForDistance(distance: number) {
  if (distance < 600) return 2;
  if (distance < 2200) return 1.35;
  return 0.95;
}

export function SkyScan3DLayer({ parcels, heading, pitch, fov, visible, selectedId, onSelect, onProjectSelected }: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshesRef = useRef(new Map<string, THREE.Object3D>());
  const [meta, setMeta] = useState<Record<string, ParcelMeta>>({});
  const [selectedHit, setSelectedHit] = useState<ProjectedHit | null>(null);

  const renderable = useMemo(
    () => parcels.filter((p) => Number.isFinite(p.east) && Number.isFinite(p.north) && p.distance <= MAX_RENDER_DISTANCE).slice(0, MAX_RENDERABLE_PARCELS),
    [parcels],
  );

  useEffect(() => {
    let cancelled = false;
    const ids = renderable.map((p) => p.id);
    if (!ids.length) {
      setMeta({});
      return;
    }
    const load = async () => {
      const { data } = await supabaseBrowser
        ?.from("sky_scan_parcels")
        .select("id,parcel_number,city_name:city_id,parcels(status,price,tier)")
        .in("id", ids) ?? { data: null };
      if (cancelled || !data) return;
      const next: Record<string, ParcelMeta> = {};
      for (const row of data as any[]) {
        const source = Array.isArray(row.parcels) ? row.parcels[0] : row.parcels;
        next[row.id] = {
          id: row.id,
          parcel_number: row.parcel_number,
          city_name: typeof row.city_name === "string" ? row.city_name : "Gaziantep",
          status: source?.status ?? "available",
          price: source?.price ?? null,
          tier: source?.tier ?? null,
          tier_price: null,
        };
      }
      setMeta(next);
    };
    void load();
    return () => { cancelled = true; };
  }, [renderable]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(90, 1, 0.1, 20000);
    camera.rotation.order = "YXZ";
    camera.position.set(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.zIndex = "10";
    mount.appendChild(renderer.domElement);
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = PICK_THRESHOLD;
    const pointer = new THREE.Vector2();
    const pick = (event: PointerEvent) => {
      if (!visible) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const targets = Array.from(meshesRef.current.values());
      const hits = raycaster.intersectObjects(targets, true);
      const hit = hits.find((h) => h.object.userData.parcelId) ?? hits[0];
      if (hit) {
        const id = hit.object.userData.parcelId as string | undefined;
        if (id) onSelect(id);
      }
    };
    renderer.domElement.addEventListener("pointerup", pick);

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      const now = performance.now();
      meshesRef.current.forEach((object, id) => {
        const group = object as THREE.Group;
        const phase = (Math.abs([...id].reduce((a, c) => a + c.charCodeAt(0), 0)) % 1000) / 1000;
        group.rotation.y += 0.006;
        group.rotation.x = Math.sin(now / 900 + phase * 7) * 0.12;
        group.position.y += Math.sin(now / 1100 + phase * 5) * 0.0015;
      });
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointerup", pick);
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else material?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
      meshesRef.current.clear();
    };
  }, [onSelect, visible]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const keep = new Set(renderable.map((p) => p.id));
    meshesRef.current.forEach((object, id) => {
      if (!keep.has(id)) {
        scene.remove(object);
        object.traverse((child) => {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material?.dispose();
        });
        meshesRef.current.delete(id);
      }
    });
    renderable.forEach((parcel) => {
      if (meshesRef.current.has(parcel.id)) return;
      const group = new THREE.Group();
      group.userData.parcelId = parcel.id;
      const size = 18 * detailForDistance(parcel.distance);
      const color = new THREE.Color(colorForTier(meta[parcel.id]?.tier, parcel.id === selectedId));
      const crystal = new THREE.Mesh(
        new THREE.OctahedronGeometry(size, 1),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: parcel.id === selectedId ? 0.92 : 0.66, wireframe: true }),
      );
      crystal.userData.parcelId = parcel.id;
      const core = new THREE.Mesh(
        new THREE.OctahedronGeometry(size * 0.42, 0),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: parcel.id === selectedId ? 0.34 : 0.16 }),
      );
      core.userData.parcelId = parcel.id;
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(size * 0.9, 12, 8),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.045, depthWrite: false }),
      );
      halo.userData.parcelId = parcel.id;
      group.add(halo, crystal, core);
      group.position.set(parcel.east, parcel.altitude, -parcel.north);
      group.scale.setScalar(scaleForDistance(parcel.distance));
      group.userData.parcelId = parcel.id;
      scene.add(group);
      meshesRef.current.set(parcel.id, group);
    });
    meshesRef.current.forEach((group, id) => {
      const parcel = renderable.find((p) => p.id === id);
      if (!parcel) return;
      const selected = id === selectedId;
      const c = new THREE.Color(colorForTier(meta[id]?.tier, selected));
      group.position.set(parcel.east, parcel.altitude, -parcel.north);
      group.scale.setScalar(scaleForDistance(parcel.distance) * (selected ? 1.28 : 1));
      group.traverse((child) => {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshBasicMaterial;
        if (material?.color) material.color.copy(c);
        if (material?.opacity !== undefined) material.opacity = selected ? (mesh.geometry instanceof THREE.OctahedronGeometry ? 0.92 : 0.34) : (mesh.geometry instanceof THREE.OctahedronGeometry ? 0.66 : 0.16);
      });
    });
  }, [meta, renderable, selectedId]);

  useEffect(() => {
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    if (!camera || !renderer) return;
    camera.fov = THREE.MathUtils.clamp(fov, 60, 120);
    camera.aspect = renderer.domElement.clientWidth / Math.max(1, renderer.domElement.clientHeight);
    camera.visible = visible && heading !== null && pitch !== null;
    if (heading !== null) camera.rotation.y = -THREE.MathUtils.degToRad(heading);
    if (pitch !== null) camera.rotation.x = -THREE.MathUtils.degToRad(pitch);
    camera.updateProjectionMatrix();
  }, [fov, heading, pitch, visible]);

  useEffect(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const selected = selectedId ? meshesRef.current.get(selectedId) : null;
    if (!renderer || !camera || !selected || !visible) {
      setSelectedHit(null);
      onProjectSelected?.(null);
      return;
    }
    let raf = 0;
    let lastX = -9999;
    let lastY = -9999;
    let lastVisible = false;
    const update = () => {
      const world = new THREE.Vector3();
      selected.getWorldPosition(world);
      const ndc = world.clone().project(camera);
      const rect = renderer.domElement.getBoundingClientRect();
      const x = rect.left + (ndc.x + 1) * 0.5 * rect.width;
      const y = rect.top + (1 - ndc.y) * 0.5 * rect.height;
      const isVisible = ndc.z >= -1 && ndc.z <= 1 && Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1 && camera.visible;
      const hit = { id: selectedId!, x, y, visible: isVisible };
      if (Math.abs(x - lastX) > 1.5 || Math.abs(y - lastY) > 1.5 || isVisible !== lastVisible) {
        lastX = x;
        lastY = y;
        lastVisible = isVisible;
        setSelectedHit(hit);
        onProjectSelected?.(hit);
      }
      raf = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(raf);
  }, [onProjectSelected, selectedId, visible]);

  const visibleCount = renderable.length;
  const nearest = renderable[0] ?? null;
  const selectedParcel = selectedId ? renderable.find((p) => p.id === selectedId) ?? null : null;
  const selectedMeta = selectedId ? meta[selectedId] : undefined;
  const leftArrow = useMemo(() => {
    if (!heading || !nearest) return "→";
    const delta = ((nearest.east >= 0 ? 90 : 270) - heading + 540) % 360 - 180;
    return delta > 18 ? "→" : delta < -18 ? "←" : "↑";
  }, [heading, nearest]);

  return (
    <div ref={mountRef} className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute inset-0 z-30 pointer-events-none">
        <div className="absolute left-3 top-20 rounded-2xl border border-white/15 bg-black/45 px-3 py-2 backdrop-blur-md shadow-lg">
          <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-200">AR PARSELLER</div>
          <div className="mt-0.5 text-sm font-bold text-white">{visibleCount} görünür</div>
        </div>

        <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-white/20 bg-black/55 px-4 py-2 backdrop-blur-md shadow-xl">
          <div className="text-center text-[9px] font-bold uppercase tracking-[0.18em] text-white/60">Pusula</div>
          <div className="text-sm font-black tracking-wide text-white">{compass(heading)}</div>
        </div>

        {nearest && (
          <div className="absolute right-3 top-20 rounded-2xl border border-cyan-200/25 bg-black/50 px-3 py-2 text-right backdrop-blur-md">
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-cyan-200">En yakın parsel</div>
            <div className="mt-0.5 flex items-center gap-1 text-sm font-bold text-white"><span>{leftArrow}</span>{distanceLabel(nearest.distance)}</div>
          </div>
        )}

        {selectedParcel && selectedHit?.visible && (
          <div className="absolute pointer-events-none" style={{ left: selectedHit.x - 18, top: selectedHit.y - 86 }}>
            <div className="relative w-44 overflow-hidden rounded-2xl border border-white/25 bg-slate-950/88 p-3 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-amber-300/15 px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-amber-200">{selectedMeta?.tier ?? "Parsel"}</span>
                <span className="text-[10px] font-bold text-cyan-200">{distanceLabel(selectedParcel.distance)}</span>
              </div>
              <div className="mt-1 text-sm font-black text-white">{selectedMeta?.parcel_number ?? selectedParcel.id.slice(0, 8)}</div>
              <div className="mt-0.5 text-[10px] text-white/55">{selectedMeta?.city_name ?? "Gaziantep"}</div>
              <div className="mt-2 flex items-end justify-between">
                <div className="text-lg font-black text-amber-200">{money(selectedMeta?.price)}</div>
                <span className="text-[9px] font-semibold text-white/50">Parseli incele</span>
              </div>
              <div className="absolute bottom-[-7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-white/25 bg-slate-950/88" />
            </div>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/15 bg-slate-950/72 p-3 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-200">Gökyüzü taraması</div>
              <div className="mt-1 text-xs font-semibold text-white/75">Telefonu yavaşça sağa-sola çevirin</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-white">{visibleCount}</div>
              <div className="text-[9px] uppercase tracking-[0.16em] text-white/45">parsel</div>
            </div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan-300/80" style={{ width: `${Math.min(100, Math.max(8, (visibleCount / 25) * 100))}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
