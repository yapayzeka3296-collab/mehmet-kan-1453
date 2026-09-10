import { useEffect, useRef } from "react";
import * as THREE from "three";

type Parcel3D = { id: string; east: number; north: number; altitude: number; distance: number };
type Props = { parcels: Parcel3D[]; heading: number | null; pitch: number | null; fov?: number; visible: boolean; selectedId?: string | null; onSelect?: (id: string) => void };

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const rad = (n: number) => n * Math.PI / 180;
const MAX_RENDER_DISTANCE = 5000;
function scaleForDistance(distance: number) { return clamp(2.05 / Math.sqrt(distance / 1000 + 0.65), 0.48, 1.9); }
function detailForDistance(distance: number) { if (distance <= 500) return 1; if (distance <= 2000) return 2; return 3; }

export function SkyScan3DLayer({ parcels, heading, pitch, fov = 110, visible, selectedId, onSelect }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const meshesRef = useRef(new Map<string, THREE.LineSegments>());
  const frameRef = useRef<number | null>(null);
  const selectedRef = useRef<string | null | undefined>(selectedId);
  const onSelectRef = useRef<Props["onSelect"]>(onSelect);

  useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(110, 1, 0.1, 30000);
    camera.rotation.order = "YXZ";
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearAlpha(0);
    host.appendChild(renderer.domElement);
    const group = new THREE.Group();
    scene.add(group);
    sceneRef.current = scene; cameraRef.current = camera; rendererRef.current = renderer; groupRef.current = group;
    const resize = () => {
      const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
      camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false);
    };
    resize(); window.addEventListener("resize", resize);
    const pick = (event: PointerEvent) => {
      if (!visible || !onSelectRef.current || !camera.visible) return;
      const rect = renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const pointer = new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(Array.from(meshesRef.current.values()), false);
      const hit = hits.find((item) => item.object.visible);
      const id = hit?.object.userData.parcelId;
      if (typeof id === "string") onSelectRef.current(id);
    };
    renderer.domElement.addEventListener("pointerup", pick, { passive: true });
    const animate = (time: number) => {
      meshesRef.current.forEach((mesh) => {
        const phase = mesh.userData.phase as number;
        const baseY = mesh.userData.baseY as number;
        mesh.rotation.y = time * 0.00018 + phase;
        mesh.position.y = baseY + Math.sin(time * 0.001 + phase) * Math.min(8, Math.max(1.5, mesh.userData.floatAmplitude as number));
        const active = mesh.userData.parcelId === selectedRef.current;
        (mesh.material as THREE.LineBasicMaterial).opacity = active ? 1 : 0.72;
      });
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      renderer.domElement.removeEventListener("pointerup", pick);
      window.removeEventListener("resize", resize);
      meshesRef.current.forEach((mesh) => { mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); });
      meshesRef.current.clear(); renderer.dispose(); renderer.domElement.remove();
      sceneRef.current = null; cameraRef.current = null; rendererRef.current = null; groupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    const renderable = parcels.filter((parcel) => parcel.distance <= MAX_RENDER_DISTANCE);
    const incoming = new Map(renderable.map((parcel) => [parcel.id, parcel]));
    meshesRef.current.forEach((mesh, id) => {
      if (!incoming.has(id)) { group.remove(mesh); mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); meshesRef.current.delete(id); }
    });
    renderable.forEach((parcel) => {
      let mesh = meshesRef.current.get(parcel.id);
      const detail = detailForDistance(parcel.distance);
      if (!mesh || mesh.userData.detail !== detail) {
        if (mesh) { group.remove(mesh); mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); meshesRef.current.delete(parcel.id); }
        const size = detail === 1 ? 1 : detail === 2 ? 0.9 : 0.78;
        const geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(size, size, size), detail === 1 ? 1 : 2);
        const material = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.72 });
        mesh = new THREE.LineSegments(geometry, material);
        mesh.userData.parcelId = parcel.id;
        mesh.userData.detail = detail;
        mesh.userData.phase = (parcel.id.length * 0.37) % (Math.PI * 2);
        mesh.userData.floatAmplitude = clamp(parcel.distance * 0.01, 1.5, 8);
        group.add(mesh); meshesRef.current.set(parcel.id, mesh);
      }
      mesh.position.set(parcel.east, parcel.altitude, -parcel.north);
      mesh.userData.baseY = parcel.altitude;
      mesh.scale.setScalar(scaleForDistance(parcel.distance));
      mesh.visible = true;
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
