import { useEffect, useRef } from "react";
import type { MouseEvent, PointerEvent, WheelEvent } from "react";
import type { Parcel } from "@/types/parcel";

type Props = {
  parcels: Parcel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

type Point3 = { x: number; y: number; z: number };
type ScreenPoint = Point3;
type ProjectedParcel = { parcel: Parcel; points: ScreenPoint[]; center: ScreenPoint; depth: number };
type GlobeState = { yaw: number; pitch: number; zoom: number; dragging: boolean; moved: boolean; lastX: number; lastY: number; velocityX: number; velocityY: number };

const GOLD = "#e8ad3f";
const GRID = "rgba(122, 181, 239, 0.30)";
const PARCEL = "rgba(74, 137, 213, 0.30)";

function rotatePoint(p: Point3, yaw: number, pitch: number): Point3 {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const x1 = p.x * cy - p.z * sy;
  const z1 = p.x * sy + p.z * cy;
  return { x: x1, y: p.y * cp - z1 * sp, z: p.y * sp + z1 * cp };
}

function latLonPoint(lat: number, lon: number): Point3 {
  const a = (lat * Math.PI) / 180, b = (lon * Math.PI) / 180;
  return { x: Math.cos(a) * Math.cos(b), y: Math.sin(a), z: Math.cos(a) * Math.sin(b) };
}

function parcelCellSize(parcel: Parcel) {
  const n = Number(parcel.parcel_number.split("-").pop() ?? 1) - 1;
  return { halfLat: 0.00345, halfLon: 0.00515, col: ((n % 40) + 40) % 40, row: Math.floor(Math.max(0, n) / 40) };
}

export function SkyParcelGlobe({ parcels, selectedId, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<GlobeState>({ yaw: -0.55, pitch: 0.08, zoom: 1, dragging: false, moved: false, lastX: 0, lastY: 0, velocityX: 0, velocityY: 0 });
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
    let frame = 0, width = 0, height = 0, dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(320, rect.width);
      height = Math.max(380, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const project = (p: Point3, r: number, cx: number, cy: number): ScreenPoint => ({ x: cx + p.x * r, y: cy - p.y * r, z: p.z });

    const drawShadow = (cx: number, cy: number, r: number) => {
      const y = cy + r * 1.02;
      ctx.save();
      ctx.translate(cx, y);
      ctx.scale(1.7, 0.18);
      const g = ctx.createRadialGradient(0, 0, r * 0.04, 0, 0, r * 0.68);
      g.addColorStop(0, "rgba(0,0,0,0.52)");
      g.addColorStop(0.5, "rgba(0,0,0,0.20)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      const s = stateRef.current;
      if (!s.dragging) {
        s.yaw += s.velocityX;
        s.pitch += s.velocityY;
        s.velocityX *= 0.94;
        s.velocityY *= 0.94;
      }
      s.pitch = Math.max(-1.05, Math.min(1.05, s.pitch));
      const radius = Math.min(width * 0.40, height * 0.43) * s.zoom;
      const cx = width / 2, cy = height * 0.43;
      ctx.clearRect(0, 0, width, height);

      // Floating digital-sky effect: halo, shadow, particles and a projected floor ring.
      drawShadow(cx, cy, radius);
      const halo = ctx.createRadialGradient(cx, cy, radius * 0.72, cx, cy, radius * 1.45);
      halo.addColorStop(0, "rgba(44,133,238,0.05)");
      halo.addColorStop(0.55, "rgba(44,133,238,0.18)");
      halo.addColorStop(0.78, "rgba(232,173,63,0.07)");
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(cx, cy, radius * 1.45, 0, Math.PI * 2); ctx.fill();

      for (let i = 0; i < 34; i++) {
        const angle = i * 2.399, distance = radius * (1.08 + ((i * 17) % 31) / 100);
        const sx = cx + Math.cos(angle) * distance, sy = cy + Math.sin(angle) * distance * 0.58;
        ctx.fillStyle = i % 7 === 0 ? "rgba(232,173,63,0.78)" : "rgba(167,211,255,0.58)";
        ctx.beginPath(); ctx.arc(sx, sy, 0.7 + (i % 3) * 0.45, 0, Math.PI * 2); ctx.fill();
      }

      const globe = ctx.createRadialGradient(cx - radius * 0.28, cy - radius * 0.34, radius * 0.05, cx, cy, radius);
      globe.addColorStop(0, "rgba(55,130,220,0.23)");
      globe.addColorStop(0.52, "rgba(9,51,106,0.36)");
      globe.addColorStop(0.86, "rgba(3,24,55,0.50)");
      globe.addColorStop(1, "rgba(1,10,25,0.62)");
      ctx.fillStyle = globe;
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();

      ctx.save();
      ctx.globalAlpha = 0.62;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(111,185,255,0.22)";
      for (const offset of [-0.20, 0.04, 0.27]) {
        ctx.beginPath();
        ctx.ellipse(cx, cy + radius * offset, radius * 0.99, radius * 0.18, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Geographic grid.
      ctx.lineWidth = 0.65;
      ctx.strokeStyle = GRID;
      for (let lon = -180; lon < 180; lon += 15) {
        ctx.beginPath(); let started = false;
        for (let lat = -90; lat <= 90; lat += 3) {
          const p = rotatePoint(latLonPoint(lat, lon), s.yaw, s.pitch);
          if (p.z < -0.03) { started = false; continue; }
          const q = project(p, radius, cx, cy);
          if (!started) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
          started = true;
        }
        ctx.stroke();
      }
      for (let lat = -75; lat <= 75; lat += 15) {
        ctx.beginPath(); let started = false;
        for (let lon = -180; lon <= 180; lon += 3) {
          const p = rotatePoint(latLonPoint(lat, lon), s.yaw, s.pitch);
          if (p.z < -0.03) { started = false; continue; }
          const q = project(p, radius, cx, cy);
          if (!started) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
          started = true;
        }
        ctx.stroke();
      }

      const projected: ProjectedParcel[] = [];
      for (const parcel of parcelsRef.current) {
        const { halfLat, halfLon } = parcelCellSize(parcel);
        const corners = [
          latLonPoint(parcel.latitude - halfLat, parcel.longitude - halfLon),
          latLonPoint(parcel.latitude - halfLat, parcel.longitude + halfLon),
          latLonPoint(parcel.latitude + halfLat, parcel.longitude + halfLon),
          latLonPoint(parcel.latitude + halfLat, parcel.longitude - halfLon),
        ].map((p) => rotatePoint(p, s.yaw, s.pitch));
        const center = rotatePoint(latLonPoint(parcel.latitude, parcel.longitude), s.yaw, s.pitch);
        if (center.z < 0.015) continue;
        projected.push({ parcel, depth: center.z, center: project(center, radius, cx, cy), points: corners.map((p) => project(p, radius, cx, cy)) });
      }
      projected.sort((a, b) => a.depth - b.depth);
      hitRef.current = projected;

      for (const item of projected) {
        const selected = item.parcel.id === selectedIdRef.current;
        const frontness = Math.max(0.12, item.depth);
        const alpha = Math.min(0.56, 0.10 + frontness * 0.46);
        ctx.beginPath();
        item.points.forEach((p, index) => index === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = selected ? "rgba(232,173,63,0.90)" : PARCEL.replace("0.30", alpha.toFixed(2));
        ctx.fill();
        ctx.lineWidth = selected ? 1.5 : 0.55;
        ctx.strokeStyle = selected ? GOLD : `rgba(116,174,234,${Math.max(0.16, frontness * 0.66)})`;
        ctx.stroke();
        if (selected) {
          ctx.save(); ctx.shadowColor = GOLD; ctx.shadowBlur = 22; ctx.strokeStyle = "rgba(255,220,132,0.98)"; ctx.lineWidth = 2.2;
          ctx.beginPath(); item.points.forEach((p, index) => index === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.closePath(); ctx.stroke(); ctx.restore();
          ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(item.center.x, item.center.y, 3.5, 0, Math.PI * 2); ctx.fill();
          const label = item.parcel.parcel_number;
          ctx.font = "600 12px Inter, system-ui, sans-serif";
          const labelWidth = ctx.measureText(label).width + 24;
          const boxX = Math.min(width - labelWidth - 12, Math.max(12, item.center.x + 18));
          const boxY = Math.max(14, item.center.y - 38);
          ctx.fillStyle = "rgba(3,12,27,0.95)"; ctx.strokeStyle = "rgba(232,173,63,0.86)"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect(boxX, boxY, labelWidth, 30, 7); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#fff"; ctx.fillText(label, boxX + 12, boxY + 20);
        }
      }

      // Luminous rim + gold arc.
      ctx.save(); ctx.shadowColor = "rgba(70,157,255,0.70)"; ctx.shadowBlur = 14; ctx.lineWidth = 1.8; ctx.strokeStyle = "rgba(122,192,255,0.88)";
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      ctx.lineWidth = 2; ctx.strokeStyle = "rgba(232,173,63,0.38)"; ctx.beginPath(); ctx.arc(cx, cy, radius + 4, -2.45, -0.65); ctx.stroke();
      ctx.save(); ctx.globalAlpha = 0.72; ctx.lineWidth = 1.2; ctx.strokeStyle = "rgba(232,173,63,0.42)";
      ctx.beginPath(); ctx.ellipse(cx, cy + radius * 1.03, radius * 0.56, radius * 0.055, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();

      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);

  const pointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    s.dragging = true; s.moved = false; s.velocityX = 0; s.velocityY = 0; s.lastX = event.clientX; s.lastY = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (!s.dragging) return;
    const dx = event.clientX - s.lastX, dy = event.clientY - s.lastY;
    if (Math.abs(dx) + Math.abs(dy) > 3) s.moved = true;
    s.yaw += dx * 0.0075;
    s.pitch = Math.max(-1.05, Math.min(1.05, s.pitch + dy * 0.0055));
    s.velocityX = dx * 0.0012; s.velocityY = dy * 0.0007;
    s.lastX = event.clientX; s.lastY = event.clientY;
  };

  const pointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    stateRef.current.dragging = false;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* already released */ }
  };

  const click = (event: MouseEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (s.moved) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    let closest: { id: string; distance: number; depth: number } | null = null;
    for (const item of hitRef.current) {
      const distance = Math.hypot(x - item.center.x, y - item.center.y);
      if (distance < 16 && (!closest || item.depth > closest.depth || distance < closest.distance)) closest = { id: item.parcel.id, distance, depth: item.depth };
    }
    if (closest) onSelect(closest.id);
  };

  const wheel = (event: WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    stateRef.current.zoom = Math.max(0.78, Math.min(1.22, stateRef.current.zoom - event.deltaY * 0.0007));
  };

  const reset = () => {
    stateRef.current.yaw = -0.55; stateRef.current.pitch = 0.08; stateRef.current.zoom = 1; stateRef.current.velocityX = 0; stateRef.current.velocityY = 0;
  };

  return (
    <div className="relative mx-auto h-[500px] w-full max-w-[940px] touch-none sm:h-[590px]">
      <div className="pointer-events-none absolute inset-x-[18%] top-[6%] h-[72%] rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-[25%] bottom-[9%] h-10 rounded-full bg-black/35 blur-2xl" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full cursor-grab drop-shadow-[0_24px_34px_rgba(0,0,0,0.42)] active:cursor-grabbing" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onMouseLeave={pointerUp} onClick={click} onWheel={wheel} aria-label="3D MySkyParcel küresi. Küreyi sürükleyerek çevirin, yakınlaştırın ve parsellere dokunun." />
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-gold/25 bg-navy-deep/75 px-4 py-2 text-[10px] tracking-wide text-muted-foreground backdrop-blur-md">HAVADA ASILI DİJİTAL GÖKYÜZÜ · SÜRÜKLE · YAKLAŞTIR · PARSEL SEÇ</div>
      <button type="button" onClick={reset} className="absolute bottom-3 right-3 rounded-full border border-gold/30 bg-navy-deep/85 px-3 py-2 text-xs text-gold shadow-lg backdrop-blur-md hover:bg-navy-deep">Sıfırla</button>
    </div>
  );
}
