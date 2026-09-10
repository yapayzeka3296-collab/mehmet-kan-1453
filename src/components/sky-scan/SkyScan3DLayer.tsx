import { useEffect, useRef } from "react";
import * as THREE from "three";

type Parcel3D = {
  id: string;
  east: number;
  north: number;
  altitude: number;
  distance: number;
};

type Props = {
  parcels: Parcel3D[];
  heading: number | null;
  pitch: number | null;
  visible: boolean;
  selectedId?: string | null;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function scaleForDistance(distance: number) {
  return clamp(2.05 / Math.sqrt(distance / 1000 + 0.65), 0.48, 1.9);
}

export function SkyScan3DLayer({ parcels, heading, pitch, visible, selectedId }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const meshesRef = useRef(new Map<string, THREE.LineSegments>());
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 30000);
    camera.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    groupRef.current = group;

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = (time: number) => {
      const selected = selectedId;
      meshesRef.current.forEach((mesh) => {
        const phase = mesh.userData.phase as number;
        mesh.rotation.y = time * 0.00018 + phase;
        mesh.position.y += Math.sin(time * 0.001 + phase) * 0.00035;
        const active = mesh.userData.parcelId === selected;
        const material = mesh.material as THREE.LineBasicMaterial;
        material.opacity = active ? 1 : 0.72;
      });
      renderer.render(scene, camera);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      meshesRef.current.forEach((mesh) => {
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
      });
      meshesRef.current.clear();
      renderer.dispose();
      renderer.domElement.remove();
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      groupRef.current = null;
    };
  }, [selectedId]);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const incoming = new Map(parcels.map((parcel) => [parcel.id, parcel]));
    meshesRef.current.forEach((mesh, id) => {
      if (!incoming.has(id)) {
        group.remove(mesh);
        mesh.geometry.dispose();
        (mesh.material as THREE.Material).dispose();
        meshesRef.current.delete(id);
      }
    });

    parcels.forEach((parcel) => {
      let mesh = meshesRef.current.get(parcel.id);
      if (!mesh) {
        const geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
        const material = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.72 });
        mesh = new THREE.LineSegments(geometry, material);
        mesh.userData.parcelId = parcel.id;
        mesh.userData.phase = (parcel.id.length * 0.37) % (Math.PI * 2);
        group.add(mesh);
        meshesRef.current.set(parcel.id, mesh);
      }

      const scale = scaleForDistance(parcel.distance);
      mesh.position.set(parcel.east, parcel.altitude, -parcel.north);
      mesh.scale.setScalar(scale);
    });
  }, [parcels]);

  useEffect(() => {
    const camera = cameraRef.current;
    const host = hostRef.current;
    if (!camera || !host) return;
    camera.rotation.set(0, 0, 0);
    camera.fov = 70;
    camera.updateProjectionMatrix();
    camera.visible = visible && heading !== null && pitch !== null;
  }, [heading, pitch, visible]);

  return <div ref={hostRef} className="pointer-events-none absolute inset-0 z-20" aria-hidden="true" />;
}
