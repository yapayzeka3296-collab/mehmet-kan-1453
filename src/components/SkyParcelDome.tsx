import { useEffect, useRef } from "react";
import type { MouseEvent, PointerEvent, WheelEvent } from "react";
import type { Parcel } from "@/types/parcel";

type Props = {
  parcels: Parcel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

type Point3 = { x: number; y: number; z: number };
type ScreenPoint = { x: number; y: number; z: number };
type ProjectedParcel = { parcel: Parcel; points: ScreenPoint[]; center: ScreenPoint; depth: number };
type GlobeState = { yaw: number; pitch: number; zoom: number; dragging: boolean; moved: boolean; lastX: number; lastY: number; velocityX: number; velocityY: number };

const GOLD = "#e8ad3f";
const GRID = "rgba(122, 181, 239, 0.30)";
const PARCEL = "rgba(74, 137, 213, 0.22)";

function rotatePoint(p: Point3, yaw: number, pitch: number): Point3 {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const x1 = p.x * cy - p.z * sy;
  const z1 = p.x * sy + p.z * cy;
  return { x: x1, y: p.y * cp - z1 * sp, z: p.y * sp + z1 * cp };
}

function domePoint(lon: number, elevation: number): Point3 {
  const a = (lon * Math.PI) / 180;
  const e = (elevation * Math.PI) / 180;
  const ce = Math.cos(e);
  return { x: ce * Math.sin(a), y: Math.sin(e), z: ce * Math.cos(a) };
}

function gridPosition(parcel: Parcel) {
  const p = parcel as Parcel & { grid_x?: number; grid_y?: number };
  const number = Number(parcel.parcel_number.split("-").pop() ?? 1) - 1;
  const col = Math.max(0, Math.min(39, Number.isFinite(p.grid_x) ? Number(p.grid_x) : number % 40));
  const row = Math.max(0, Math.min(24, Number.isFinite(p.grid_y) ? Number(p.grid_y) : Math.floor(number / 40)));
  return { col, row };
}

export function SkyParcelDome({ parcels, selectedId, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GlobeState>({ yaw: -0.34, pitch: 0.08, zoom: 1, dragging: false, moved: false, lastX: 0, lastY: 0, velocityX: 0, velocityY: 0 });
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
      height = Math.max(440, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const project = (p: Point3, radius: number, cx: number, cy: number): ScreenPoint => ({
      x: cx + p.x * radius,
      y: cy - p.y * radius,
      z: p.z,
    });

    const draw = () => {
      const s = stateRef.current;
      if (!s.dragging) {
        s.yaw += s.velocityX;
        s.pitch += s.velocityY;
        s.velocityX *= 0.94;
        s.velocityY *= 0.94;
      }
      s.pitch = Math.max(-0.22, Math.min(0.65, s.pitch));

      const radius = Math.min(width * 0.43, height * 0.72) * s.zoom;
      const cx = width / 2;
      const cy = height * 0.70;
      const equatorY = cy;
      ctx.clearRect(0, 0, width, height);

      // Keep the city completely visible below the dome. Only the upper hemisphere is drawn.
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, width, equatorY + 1);
      ctx.clip();

      const halo = ctx.createRadialGradient(cx, cy - radius * 0.55, radius * 0.1, cx, cy, radius * 1.28);
      halo.addColorStop(0, "rgba(38,125,232,0.06)");
      halo.addColorStop(0.62, "rgba(38,125,232,0.15)");
      halo.addColorStop(0.88, "rgba(232,173,63,0.06)");
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.28, Math.PI, 2 * Math.PI);
      ctx.fill();

      // Transparent blue dome: the city remains visible through it.
      const dome = ctx.createRadialGradient(cx - radius * 0.25, cy - radius * 0.75, radius * 0.08, cx, cy, radius);
      dome.addColorStop(0, "rgba(68,153,239,0.18)");
      dome.addColorStop(0.48, "rgba(11,64,126,0.20)");
      dome.addColorStop(0.82, "rgba(3,28,61,0.16)");
      dome.addColorStop(1, "rgba(1,12,29,0.06)");
      ctx.fillStyle = dome;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI, 2 * Math.PI);
      ctx.fill();

      // Latitude arcs and longitude meridians, clipped to the upper hemisphere.
      ctx.lineWidth = 0.7;
      ctx.strokeStyle = GRID;
      for (let elevation = 10; elevation <= 80; elevation += 10) {
        ctx.beginPath();
        for (let lon = -90; lon <= 90; lon += 3) {
          const p = rotatePoint(domePoint(lon, elevation), s.yaw, s.pitch);
          if (p.z < -0.02) continue;
          const q = project(p, radius, cx, cy);
          if (lon === -90) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
        }
        ctx.stroke();
      }
      for (let lon = -90; lon <= 90; lon += 10) {
        ctx.beginPath();
        let started = false;
        for (let elevation = 0; elevation <= 90; elevation += 3) {
          const p = rotatePoint(domePoint(lon, elevation), s.yaw, s.pitch);
          if (p.z < -0.02) { started = false; continue; }
          const q = project(p, radius, cx, cy);
          if (!started) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
          started = true;
        }
        ctx.stroke();
      }

      const projected: ProjectedParcel[] = [];
      const parcelByCell = new Map<string, Parcel>();
      for (const parcel of parcelsRef.current) {
        const { col, row } = gridPosition(parcel);
        parcelByCell.set(`${col}:${row}`, parcel);
      }

      for (const parcel of parcelsRef.current) {
        const { col, row } = gridPosition(parcel);
        const lon0 = -84 + col * 4.2;
        const lon1 = lon0 + 4.2;
        const e0 = row * 3.5;
        const e1 = e0 + 3.5;
        const corners = [
          domePoint(lon0, e0),
          domePoint(lon1, e0),
          domePoint(lon1, e1),
          domePoint(lon0, e1),
        ].map((point) => rotatePoint(point, s.yaw, s.pitch));
        const center = rotatePoint(domePoint((lon0 + lon1) / 2, (e0 + e1) / 2), s.yaw, s.pitch);
        if (center.z < 0.02 || center.y < -0.01) continue;
        projected.push({ parcel, depth: center.z, center: project(center, radius, cx, cy), points: corners.map((p) => project(p, radius, cx, cy)) });
      }

      projected.sort((a, b) => a.depth - b.depth);
      hitRef.current = projected;

      for (const item of projected) {
        const selected = item.parcel.id === selectedIdRef.current;
        const frontness = Math.max(0.10, item.depth);
        ctx.beginPath();
        item.points.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
        ctx.closePath();
        ctx.fillStyle = selected ? "rgba(232,173,63,0.94)" : PARCEL.replace("0.22", (0.07 + frontness * 0.28).toFixed(2));
        ctx.fill();
        ctx.lineWidth = selected ? 1.7 : 0.55;
        ctx.strokeStyle = selected ? GOLD : `rgba(116,174,234,${Math.max(0.14, frontness * 0.62)})`;
        ctx.stroke();

        if (selected) {
          ctx.save();
          ctx.shadowColor = GOLD;
          ctx.shadowBlur = 24;
          ctx.strokeStyle = "rgba(255,220,132,0.98)";
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          item.points.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
          ctx.closePath();
          ctx.stroke();
          ctx.restore();

          ctx.fillStyle = GOLD;
          ctx.beginPath();
          ctx.arc(item.center.x, item.center.y, 3.5, 0, Math.PI * 2);
          ctx.fill();

          const label = item.parcel.parcel_number;
          ctx.font = "600 12px Inter, system-ui, sans-serif";
          const labelWidth = ctx.measureText(label).width + 24;
          const boxX = Math.min(width - labelWidth - 12, Math.max(12, item.center.x + 18));
          const boxY = Math.max(14, item.center.y - 38);
          ctx.fillStyle = "rgba(3,12,27,0.96)";
          ctx.strokeStyle = "rgba(232,173,63,0.88)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, labelWidth, 30, 7);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#fff";
          ctx.fillText(label, boxX + 12, boxY + 20);
        }
      }

      // Bright upper rim and the equator line. No lower hemisphere is drawn.
      ctx.save();
      ctx.shadowColor = "rgba(70,157,255,0.72)";
      ctx.shadowBlur = 16;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(122,192,255,0.90)";
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.restore();

      ctx.lineWidth = 1.6;
      ctx.strokeStyle = "rgba(232,173,63,0.62)";
      ctx.beginPath();
      ctx.ellipse(cx, equatorY, radius, radius * 0.075, 0, Math.PI, 2 * Math.PI);
      ctx.stroke();

      ctx.restore();

      // Small floating particles stay above the skyline and outside the city focal area.
      for (let i = 0; i < 18; i++) {
        const angle = i * 2.4;
        const distance = radius * (1.04 + (i % 5) * 0.045);
        const sx = cx + Math.cos(angle) * distance;
        const sy = cy - Math.abs(Math.sin(angle)) * distance * 0.55 - radius * 0.08;
        if (sy > equatorY - 8) continue;
        ctx.fillStyle = i % 6 === 0 ? "rgba(232,173,63,0.72)" : "rgba(167,211,255,0.52)";
        ctx.beginPath();
        ctx.arc(sx, sy, 0.7 + (i % 3) * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }

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

  const pointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    state.dragging = true;
    state.moved = false;
    state.velocityX = 0;
    state.velocityY = 0;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    if (!state.dragging) return;
    const dx = event.clientX - state.lastX;
    const dy = event.clientY - state.lastY;
    if (Math.abs(dx) + Math.abs(dy) > 3) state.moved = true;
    state.yaw += dx * 0.0075;
    state.pitch = Math.max(-0.22, Math.min(0.65, state.pitch + dy * 0.0035));
    state.velocityX = dx * 0.0012;
    state.velocityY = dy * 0.00045;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
  };

  const pointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    stateRef.current.dragging = false;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* already released */ }
  };

  const click = (event: MouseEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    if (state.moved) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let closest: { id: string; distance: number; depth: number } | null = null;
    for (const item of hitRef.current) {
      const distance = Math.hypot(x - item.center.x, y - item.center.y);
      if (distance < 18 && (!closest || item.depth > closest.depth || distance < closest.distance)) {
        closest = { id: item.parcel.id, distance, depth: item.depth };
      }
    }
    if (closest) onSelect(closest.id);
  };

  const wheel = (event: WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    stateRef.current.zoom = Math.max(0.78, Math.min(1.16, stateRef.current.zoom - event.deltaY * 0.00065));
  };

  const reset = () => {
    stateRef.current.yaw = -0.34;
    stateRef.current.pitch = 0.08;
    stateRef.current.zoom = 1;
    stateRef.current.velocityX = 0;
    stateRef.current.velocityY = 0;
  };

  const zoom = (delta: number) => {
    stateRef.current.zoom = Math.max(0.78, Math.min(1.16, stateRef.current.zoom + delta));
  };

  return (
    <div className="relative h-[520px] w-full select-none sm:h-[580px]" aria-label="Dijital gökyüzü parsel kubbesi">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none cursor-grab active:cursor-grabbing"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onClick={click}
        onWheel={wheel}
      />
      <div className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-gold/20 bg-navy-deep/80 shadow-lg shadow-black/30 backdrop-blur-sm">
        <button type="button" onClick={() => zoom(0.08)} className="h-11 w-11 text-xl text-gold hover:bg-gold/10" aria-label="Yakınlaştır">+</button>
        <button type="button" onClick={() => zoom(-0.08)} className="h-11 w-11 border-t border-gold/10 text-xl text-gold hover:bg-gold/10" aria-label="Uzaklaştır">−</button>
        <button type="button" onClick={reset} className="h-11 w-11 border-t border-gold/10 text-sm text-gold hover:bg-gold/10" aria-label="Sıfırla">↻</button>
      </div>
      <div className="pointer-events-none absolute bottom-1 left-1/2 z-20 -translate-x-1/2 rounded-full border border-gold/20 bg-navy-deep/65 px-4 py-1.5 text-[10px] text-muted-foreground backdrop-blur-sm">
        Dijital gökyüzü · 1.000 parsel · sürükle ve keşfet
      </div>
    </div>
  );
}
