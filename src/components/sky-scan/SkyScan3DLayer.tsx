import { useEffect, useRef } from "react";
import * as THREE from "three";

type Parcel3D = { id: string; east: number; north: number; altitude: number; distance: number };
type ProjectedHit = { id: string; x: number; y: number; visible: boolean };
type Props = { parcels: Parcel3D[]; heading: number | null; pitch: number | null; fov?: number; visible: boolean; selectedId?: string | null; onSelect?: (id: string) => void; onProjectSelected?: (hit: ProjectedHit | null) => void };

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const rad = (n: number) => n * Math.PI / 180;
const MAX_RENDER_DISTANCE = 5000;
const MAX_RENDERABLE_PARCELS = 100;
const PICK_THRESHOLD = 24;
function scaleForDistance(distance: number) { return clamp(2.4 / Math.sqrt(distance / 1000 + 0.65), 0.58, 2.2); }
function detailForDistance(distance: number) { if (distance <= 500) return 1; if (distance <= 2000) return 2; return 3; }
function phaseFor(id: string) { let hash = 2166136261; for (let i = 0; i < id.length; i += 1) hash = Math.imul(hash ^ id.charCodeAt(i), 16777619); return (Math.abs(hash) % 10000) / 10000 * Math.PI * 2; }

export function SkyScan3DLayer({ parcels, heading, pitch, fov = 110, visible, selectedId, onSelect, onProjectSelected }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const meshesRef = useRef(new Map<string, THREE.Object3D>());
  const frameRef = useRef<number | null>(null);
  const selectedRef = useRef<string | null | undefined>(selectedId);
  const onSelectRef = useRef<Props["onSelect"]>(onSelect);
  const onProjectSelectedRef = useRef<Props["onProjectSelected"]>(onProjectSelected);
  const lastProjectedRef = useRef<ProjectedHit | null>(null);
  const lastProjectAtRef = useRef(0);

  useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { onProjectSelectedRef.current = onProjectSelected; }, [onProjectSelected]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(110, 1, 0.1, 30000);
    camera.rotation.order = "YXZ";
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearAlpha(0);
    renderer.domElement.style.touchAction = "none";
    host.appendChild(renderer.domElement);
    const group = new THREE.Group();
    scene.add(group);
    cameraRef.current = camera; rendererRef.current = renderer; groupRef.current = group;

    const resize = () => {
      const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    window.addEventListener("resize", resize);

    const raycaster = new THREE.Raycaster();
    raycaster.params.Line.threshold = PICK_THRESHOLD;
    const pointer = new THREE.Vector2();
    const pick = (event: PointerEvent) => {
      if (!visible || !onSelectRef.current || !camera.visible) return;
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const objects = Array.from(meshesRef.current.values());
      const hit = raycaster.intersectObjects(objects, true).find(item => item.object.visible);
      const object = hit?.object;
      const id = object?.userData.parcelId ?? object?.parent?.userData.parcelId;
      if (typeof id === "string") onSelectRef.current(id);
    };
    renderer.domElement.addEventListener("pointerup", pick, { passive: true });

    const world = new THREE.Vector3();
    const animate = (time: number) => {
      meshesRef.current.forEach(root => {
        const phase = root.userData.phase as number;
        const baseY = root.userData.baseY as number;
        const selected = root.userData.parcelId === selectedRef.current;
        root.rotation.y = time * 0.0002 + phase;
        root.rotation.x = Math.sin(time * 0.00055 + phase) * 0.08;
        root.position.y = baseY + Math.sin(time * 0.00105 + phase) * Math.min(7, Math.max(1.25, root.userData.floatAmplitude as number));
        root.scale.setScalar((root.userData.distanceScale as number) * (selected ? 1.18 : 1));
        root.traverse(child => {
          const material = (child as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined;
          if (material && "opacity" in material) material.opacity = selected ? 1 : Math.max(0.42, root.userData.opacity as number);
        });
      });

      const selected = selectedRef.current;
      const now = performance.now();
      if (onProjectSelectedRef.current && now - lastProjectAtRef.current >= 50) {
        lastProjectAtRef.current = now;
        const root = selected ? meshesRef.current.get(selected) : undefined;
        if (!root || !root.visible || !camera.visible) {
          if (lastProjectedRef.current !== null) { lastProjectedRef.current = null; onProjectSelectedRef.current(null); }
        } else {
          root.getWorldPosition(world);
          const ndc = world.project(camera);
          const rect = renderer.domElement.getBoundingClientRect();
          const x = rect.left + (ndc.x + 1) * 0.5 * rect.width;
          const y = rect.top + (1 - ndc.y) * 0.5 * rect.height;
          const hit = { id: selected, x, y, visible: ndc.z >= -1 && ndc.z <= 1 && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom };
          const prev = lastProjectedRef.current;
          if (!prev || prev.id !== hit.id || Math.abs(prev.x - hit.x) > 1.5 || Math.abs(prev.y - hit.y) > 1.5 || prev.visible !== hit.visible) {
            lastProjectedRef.current = hit;
            onProjectSelectedRef.current(hit);
          }
        }
      }
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      renderer.domElement.removeEventListener("pointerup", pick);
      window.removeEventListener("resize", resize);
      onProjectSelectedRef.current?.(null);
      meshesRef.current.forEach(root => {
        root.traverse(child => {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
          if (Array.isArray(material)) material.forEach(item => item.dispose()); else material?.dispose();
        });
      });
      meshesRef.current.clear();
      renderer.dispose();
      renderer.domElement.remove();
      cameraRef.current = null; rendererRef.current = null; groupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const renderable = parcels.filter(parcel => parcel.distance <= MAX_RENDER_DISTANCE).slice(0, MAX_RENDERABLE_PARCELS);
    const incoming = new Map(renderable.map(parcel => [parcel.id, parcel]));

    meshesRef.current.forEach((root, id) => {
      if (!incoming.has(id)) {
        group.remove(root);
        root.traverse(child => {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
          if (Array.isArray(material)) material.forEach(item => item.dispose()); else material?.dispose();
        });
        meshesRef.current.delete(id);
      }
    });

    renderable.forEach(parcel => {
      let root = meshesRef.current.get(parcel.id);
      const detail = detailForDistance(parcel.distance);
      if (!root || root.userData.detail !== detail) {
        if (root) {
          group.remove(root);
          root.traverse(child => {
            const mesh = child as THREE.Mesh;
            mesh.geometry?.dispose();
            const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
            if (Array.isArray(material)) material.forEach(item => item.dispose()); else material?.dispose();
          });
          meshesRef.current.delete(parcel.id);
        }

        const size = detail === 1 ? 1.35 : detail === 2 ? 1.05 : 0.82;
        const phase = phaseFor(parcel.id);
        const group3d = new THREE.Group();
        const crystal = new THREE.Mesh(
          new THREE.OctahedronGeometry(size, detail === 1 ? 1 : 0),
          new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.86, wireframe: true })
        );
        const core = new THREE.Mesh(
          new THREE.OctahedronGeometry(size * 0.62, 0),
          new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.16, wireframe: false })
        );
        const halo = new THREE.Mesh(
          new THREE.OctahedronGeometry(size * 1.5, 0),
          new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.055, wireframe: true })
        );
        crystal.userData.parcelId = parcel.id;
        core.userData.parcelId = parcel.id;
        halo.userData.parcelId = parcel.id;
        group3d.userData.parcelId = parcel.id;
        group3d.userData.detail = detail;
        group3d.userData.phase = phase;
        group3d.userData.floatAmplitude = clamp(parcel.distance * 0.006, 1.25, 7);
        group3d.add(halo, core, crystal);
        root = group3d;
        group.add(root);
        meshesRef.current.set(parcel.id, root);
      }

      const distanceScale = scaleForDistance(parcel.distance);
      root.position.set(parcel.east, parcel.altitude, -parcel.north);
      root.userData.baseY = parcel.altitude;
      root.userData.distanceScale = distanceScale;
      root.userData.opacity = clamp(0.98 - parcel.distance / MAX_RENDER_DISTANCE * 0.34, 0.44, 0.96);
      root.userData.distance = parcel.distance;
      root.visible = true;
    });
  }, [parcels]);

  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    camera.fov = clamp(fov, 60, 120);
    if (heading !== null && pitch !== null) {
      camera.rotation.order = "YXZ";
      camera.rotation.y = -rad(heading);
      camera.rotation.x = -rad(pitch);
    }
    camera.visible = visible && heading !== null && pitch !== null;
    camera.updateProjectionMatrix();
  }, [fov, heading, pitch, visible]);

  return <div ref={hostRef} className="pointer-events-auto absolute inset-0 z-20" aria-label="3D gökyüzü parselleri" />;
}
