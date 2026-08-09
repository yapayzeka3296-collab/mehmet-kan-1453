import { useEffect, useRef } from "react";
import type { Parcel } from "@/types/parcel";

type Props = {
  parcels: Parcel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

type Point3 = { x: number; y: number; z: number };
type ProjectedParcel = { parcel: Parcel; points: Array<{ x: number; y: number }>; depth: number };

const GOLD = "#e8ad3f";
const GRID = "rgba(105, 157, 224, 0.42)";
const PARCEL = "rgba(87, 143, 213, 0.26)";

function rotatePoint(point: Point3, yaw: number, pitch: number): Point3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);

  const x1 = point.x * cy - point.z * sy;
  const z1 = point.x * sy + point.z * cy;
  const y1 = point.y * cp - z1 * sp;
  const z2 = point.y * sp + z1 * cp;
  return { x: x1, y: y1, z: z2 };
}

function latLonPoint(lat: number, lon: number): Point3 {
  const latRad = (lat * Math.PI) / 180;
  const lonRad = (lon * Math.PI) / 180;
  return {
    x: Math.cos(latRad) * Math.cos(lonRad),
    y: Math.sin(latRad),
    z: Math.cos(latRad) * Math.sin(lonRad),
  };
}

export function SkyParcelGlobe({ parcels, selectedId, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({ yaw: -0.55, pitch: 0.08, dragging: false, lastX: 0, lastY: 0 });
  const hitRef = useRef<ProjectedParcel[]>([]);
  const selectedIdRef = useRef(selectedId);
  const parcelsRef = useRef(parcels);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    parcelsRef.current = parcels;
  }, [selectedId, parcels]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(320, rect.width);
      height = Math.max(360, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const project = (p: Point3, radius: number, cx: number, cy: number) => ({
      x: cx + p.x * radius,
      y: cy - p.y * radius,
      z: p.z,
    });

    const draw = () => {
      const state = stateRef.current;
      const radius = Math.min(width * 0.39, height * 0.48);
      const cx = width / 2;
      const cy = height * 0.48;

      ctx.clearRect(0, 0, width, height);

      // Deep blue globe body and soft atmospheric halo.
      const glow = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.35, radius * 0.1, cx, cy, radius * 1.18);
      glow.addColorStop(0, "rgba(37, 94, 169, 0.30)");
      glow.addColorStop(0.65, "rgba(16, 48, 94, 0.18)");
      glow.addColorStop(1, "rgba(4, 13, 30, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      const globeFill = ctx.createRadialGradient(cx - radius * 0.25, cy - radius * 0.35, radius * 0.1, cx, cy, radius);
      globeFill.addColorStop(0, "rgba(20, 67, 126, 0.22)");
      globeFill.addColorStop(1, "rgba(2, 15, 37, 0.78)");
      ctx.fillStyle = globeFill;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Longitude and latitude wireframe.
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = GRID;
      for (let lon = -180; lon < 180; lon += 15) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 4) {
          const p = rotatePoint(latLonPoint(lat, lon), state.yaw, state.pitch);
          if (p.z < -0.02) {
            started = false;
            continue;
          }
          const q = project(p, radius, cx, cy);
          if (!started) ctx.moveTo(q.x, q.y);
          else ctx.lineTo(q.x, q.y);
          started = true;
        }
        ctx.stroke();
      }
      for (let lat = -75; lat <= 75; lat += 15) {
        ctx.beginPath();
        let started = false;
        for (let lon = -180; lon <= 180; lon += 4) {
          const p = rotatePoint(latLonPoint(lat, lon), state.yaw, state.pitch);
          if (p.z < -0.02) {
            started = false;
            continue;
          }
          const q = project(p, radius, cx, cy);
          if (!started) ctx.moveTo(q.x, q.y);
          else ctx.lineTo(q.x, q.y);
          started = true;
        }
        ctx.stroke();
      }

      const projected: ProjectedParcel[] = [];
      const halfLat = 4.0;
      const halfLon = 3.6;
      const source = parcelsRef.current;

      // Every database parcel becomes a small square/rectangular cell on the globe.
      for (const parcel of source) {
        const corners = [
          latLonPoint(parcel.latitude - halfLat, parcel.longitude - halfLon),
          latLonPoint(parcel.latitude - halfLat, parcel.longitude + halfLon),
          latLonPoint(parcel.latitude + halfLat, parcel.longitude + halfLon),
          latLonPoint(parcel.latitude + halfLat, parcel.longitude - halfLon),
        ].map((p) => rotatePoint(p, state.yaw, state.pitch));

        const center = rotatePoint(latLonPoint(parcel.latitude, parcel.longitude), state.yaw, state.pitch);
        if (center.z < 0.02) continue;

        projected.push({
          parcel,
          depth: center.z,
          points: corners.map((p) => project(p, radius, cx, cy)),
        });
      }

      projected.sort((a, b) => a.depth - b.depth);
      hitRef.current = projected;

      for (const item of projected) {
        const selected = item.parcel.id === selectedIdRef.current;
        const alpha = Math.max(0.08, Math.min(0.42, item.depth * 0.45));
        ctx.beginPath();
        item.points.forEach((p, index) => (index === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.closePath();
        ctx.fillStyle = selected ? "rgba(232, 173, 63, 0.72)" : PARCEL.replace("0.26", alpha.toFixed(2));
        ctx.fill();
        ctx.lineWidth = selected ? 1.5 : 0.45;
        ctx.strokeStyle = selected ? GOLD : `rgba(108, 164, 226, ${Math.max(0.12, item.depth * 0.5)})`;
        ctx.stroke();

        if (selected) {
          const center = item.points.reduce((acc, p) => ({ x: acc.x + p.x / 4, y: acc.y + p.y / 4 }), { x: 0, y: 0 });
          ctx.shadowColor = GOLD;
          ctx.shadowBlur = 16;
          ctx.fillStyle = GOLD;
          ctx.beginPath();
          ctx.arc(center.x, center.y, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          const label = item.parcel.parcel_number;
          const labelWidth = ctx.measureText(label).width + 22;
          const boxX = Math.min(width - labelWidth - 12, Math.max(12, center.x + 18));
          const boxY = Math.max(16, center.y - 30);
          ctx.fillStyle = "rgba(4, 13, 28, 0.92)";
          ctx.strokeStyle = "rgba(232, 173, 63, 0.75)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, labelWidth, 28, 7);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#fff";
          ctx.font = "600 12px Inter, sans-serif";
          ctx.fillText(label, boxX + 11, boxY + 18);
        }
      }

      // Outer rim.
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = "rgba(106, 168, 235, 0.78)";
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();

      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    state.dragging = true;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    if (!state.dragging) return;
    const dx = event.clientX - state.lastX;
    const dy = event.clientY - state.lastY;
    state.yaw += dx * 0.008;
    state.pitch = Math.max(-1.15, Math.min(1.15, state.pitch + dy * 0.006));
    state.lastX = event.clientX;
    state.lastY = event.clientY;
  };

  const pointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    state.dragging = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released by the browser.
    }
  };

  const click = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let closest: { id: string; distance: number } | null = null;

    for (const item of hitRef.current) {
      const center = item.points.reduce((acc, p) => ({ x: acc.x + p.x / 4, y: acc.y + p.y / 4 }), { x: 0, y: 0 });
      const distance = Math.hypot(x - center.x, y - center.y);
      if (distance < 18 && (!closest || distance < closest.distance)) {
        closest = { id: item.parcel.id, distance };
      }
    }

    if (closest) onSelect(closest.id);
  };

  return (
    <div className="relative mx-auto h-[430px] w-full max-w-[900px] touch-none sm:h-[540px]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onMouseLeave={pointerUp}
        onClick={click}
        aria-label="3D MySkyParcel küresi. Küreyi sürükleyerek çevirin ve parsel seçin."
      />
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-gold/30 bg-navy-deep/80 px-4 py-2 text-[11px] text-muted-foreground backdrop-blur-sm">
        Sürükle: döndür · Dokun: parsel seç
      </div>
    </div>
  );
}
