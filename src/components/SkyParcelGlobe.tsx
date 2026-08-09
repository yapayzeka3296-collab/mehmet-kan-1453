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
type ProjectedParcel = {
  parcel: Parcel;
  points: ScreenPoint[];
  center: ScreenPoint;
  depth: number;
};

type GlobeState = {
  yaw: number;
  pitch: number;
  zoom: number;
  dragging: boolean;
  moved: boolean;
  lastX: number;
  lastY: number;
  velocityX: number;
  velocityY: number;
};

const GOLD = "#e8ad3f";
const GOLD_SOFT = "rgba(232, 173, 63, 0.32)";
const GRID = "rgba(105, 157, 224, 0.28)";
const PARCEL = "rgba(87, 143, 213, 0.30)";

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

function parcelCellSize(parcel: Parcel) {
  // The seed migration creates a 25 x 40 grid (1,000 parcels).
  // Use half the spacing so cells touch without overlapping.
  const n = Number(parcel.parcel_number.split("-").pop() ?? 1) - 1;
  const col = ((n % 40) + 40) % 40;
  const row = Math.floor(Math.max(0, n) / 40);
  return {
    halfLat: 0.00345,
    halfLon: 0.00515,
    col,
    row,
  };
}

export function SkyParcelGlobe({ parcels, selectedId, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GlobeState>({
    yaw: -0.55,
    pitch: 0.08,
    zoom: 1,
    dragging: false,
    moved: false,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
  });
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
      height = Math.max(380, rect.height);
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
      const state = stateRef.current;
      if (!state.dragging) {
        state.yaw += state.velocityX;
        state.pitch += state.velocityY;
        state.velocityX *= 0.94;
        state.velocityY *= 0.94;
      }

      state.pitch = Math.max(-1.05, Math.min(1.05, state.pitch));
      const radius = Math.min(width * 0.43, height * 0.48) * state.zoom;
      const cx = width / 2;
      const cy = height * 0.48;

      ctx.clearRect(0, 0, width, height);

      // Atmospheric glow matching the dark-blue / gold MySkyParcel visual language.
      const glow = ctx.createRadialGradient(
        cx - radius * 0.28,
        cy - radius * 0.38,
        radius * 0.08,
        cx,
        cy,
        radius * 1.22,
      );
      glow.addColorStop(0, "rgba(58, 126, 218, 0.34)");
      glow.addColorStop(0.55, "rgba(17, 57, 111, 0.20)");
      glow.addColorStop(1, "rgba(4, 13, 30, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.24, 0, Math.PI * 2);
      ctx.fill();

      const globeFill = ctx.createRadialGradient(
        cx - radius * 0.25,
        cy - radius * 0.32,
        radius * 0.08,
        cx,
        cy,
        radius,
      );
      globeFill.addColorStop(0, "rgba(31, 82, 153, 0.28)");
      globeFill.addColorStop(0.72, "rgba(5, 28, 64, 0.58)");
      globeFill.addColorStop(1, "rgba(2, 13, 30, 0.88)");
      ctx.fillStyle = globeFill;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Globe grid.
      ctx.lineWidth = 0.65;
      ctx.strokeStyle = GRID;
      for (let lon = -180; lon < 180; lon += 15) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 3) {
          const p = rotatePoint(latLonPoint(lat, lon), state.yaw, state.pitch);
          if (p.z < -0.03) {
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
        for (let lon = -180; lon <= 180; lon += 3) {
          const p = rotatePoint(latLonPoint(lat, lon), state.yaw, state.pitch);
          if (p.z < -0.03) {
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
      // The real database coordinates are retained. The smaller cells now match
      // the deterministic 40-column x 25-row seed grid instead of overlapping.
      for (const parcel of parcelsRef.current) {
        const { halfLat, halfLon } = parcelCellSize(parcel);
        const corners = [
          latLonPoint(parcel.latitude - halfLat, parcel.longitude - halfLon),
          latLonPoint(parcel.latitude - halfLat, parcel.longitude + halfLon),
          latLonPoint(parcel.latitude + halfLat, parcel.longitude + halfLon),
          latLonPoint(parcel.latitude + halfLat, parcel.longitude - halfLon),
        ].map((p) => rotatePoint(p, state.yaw, state.pitch));
        const center = rotatePoint(latLonPoint(parcel.latitude, parcel.longitude), state.yaw, state.pitch);
        if (center.z < 0.015) continue;
        projected.push({
          parcel,
          depth: center.z,
          center: project(center, radius, cx, cy),
          points: corners.map((p) => project(p, radius, cx, cy)),
        });
      }

      projected.sort((a, b) => a.depth - b.depth);
      hitRef.current = projected;

      for (const item of projected) {
        const selected = item.parcel.id === selectedIdRef.current;
        const frontness = Math.max(0.12, item.depth);
        const alpha = Math.min(0.52, 0.10 + frontness * 0.42);

        ctx.beginPath();
        item.points.forEach((p, index) => (index === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.closePath();
        ctx.fillStyle = selected ? "rgba(232, 173, 63, 0.88)" : PARCEL.replace("0.30", alpha.toFixed(2));
        ctx.fill();
        ctx.lineWidth = selected ? 1.35 : 0.55;
        ctx.strokeStyle = selected ? GOLD : `rgba(116, 174, 234, ${Math.max(0.16, frontness * 0.62)})`;
        ctx.stroke();

        if (selected) {
          ctx.save();
          ctx.shadowColor = GOLD;
          ctx.shadowBlur = 18;
          ctx.strokeStyle = "rgba(255, 220, 132, 0.95)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          item.points.forEach((p, index) => (index === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
          ctx.closePath();
          ctx.stroke();
          ctx.restore();

          // Gold selection marker.
          ctx.fillStyle = GOLD;
          ctx.beginPath();
          ctx.arc(item.center.x, item.center.y, 3.5, 0, Math.PI * 2);
          ctx.fill();

          const label = item.parcel.parcel_number;
          ctx.font = "600 12px Inter, system-ui, sans-serif";
          const labelWidth = ctx.measureText(label).width + 24;
          const boxX = Math.min(width - labelWidth - 12, Math.max(12, item.center.x + 18));
          const boxY = Math.max(14, item.center.y - 38);
          ctx.fillStyle = "rgba(3, 12, 27, 0.94)";
          ctx.strokeStyle = "rgba(232, 173, 63, 0.80)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, labelWidth, 30, 7);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#fff";
          ctx.fillText(label, boxX + 12, boxY + 20);
        }
      }

      // Outer rim and a subtle gold arc for the premium look.
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(106, 168, 235, 0.82)";
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.strokeStyle = GOLD_SOFT;
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 3, -2.45, -0.65);
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
    state.pitch = Math.max(-1.05, Math.min(1.05, state.pitch + dy * 0.0055));
    state.velocityX = dx * 0.0012;
    state.velocityY = dy * 0.0007;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
  };

  const pointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    state.dragging = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released by the browser.
    }
  };

  const click = (event: MouseEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    if (state.moved) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let closest: { id: string; distance: number; depth: number } | null = null;

    // Prefer the front-most parcel when cells are close together.
    for (const item of hitRef.current) {
      const distance = Math.hypot(x - item.center.x, y - item.center.y);
      if (distance < 16 && (!closest || item.depth > closest.depth || distance < closest.distance)) {
        closest = { id: item.parcel.id, distance, depth: item.depth };
      }
    }

    if (closest) onSelect(closest.id);
  };

  const wheel = (event: WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const state = stateRef.current;
    state.zoom = Math.max(0.78, Math.min(1.22, state.zoom - event.deltaY * 0.0007));
  };

  const reset = () => {
    stateRef.current.yaw = -0.55;
    stateRef.current.pitch = 0.08;
    stateRef.current.zoom = 1;
    stateRef.current.velocityX = 0;
    stateRef.current.velocityY = 0;
  };

  return (
    <div className="relative mx-auto h-[460px] w-full max-w-[940px] touch-none sm:h-[570px]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onMouseLeave={pointerUp}
        onClick={click}
        onWheel={wheel}
        aria-label="3D MySkyParcel küresi. Küreyi sürükleyerek çevirin, yakınlaştırın ve parsel seçin."
      />

      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-gold/25 bg-[#03101f]/90 p-1 shadow-lg backdrop-blur-md">
        <button type="button" onClick={() => (stateRef.current.zoom = Math.min(1.22, stateRef.current.zoom + 0.08))} className="h-8 w-8 rounded-full text-lg text-gold hover:bg-gold/10" aria-label="Yakınlaştır">+</button>
        <button type="button" onClick={() => (stateRef.current.zoom = Math.max(0.78, stateRef.current.zoom - 0.08))} className="h-8 w-8 rounded-full text-lg text-gold hover:bg-gold/10" aria-label="Uzaklaştır">−</button>
        <button type="button" onClick={reset} className="rounded-full px-3 py-1.5 text-[11px] font-medium text-white hover:bg-gold/10" aria-label="Küreyi sıfırla">↻ Sıfırla</button>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-full border border-white/10 bg-[#03101f]/70 px-3 py-1.5 text-[10px] tracking-wide text-white/70 backdrop-blur-sm">
        SÜRÜKLE · DÖNDÜR · DOKUN · PARSELİ SEÇ
      </div>
    </div>
  );
}
