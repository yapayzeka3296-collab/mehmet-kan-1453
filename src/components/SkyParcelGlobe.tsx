import { useEffect, useRef } from "react";
import type { MouseEvent, PointerEvent, WheelEvent } from "react";
import type { Parcel } from "@/types/parcel";

type Props = { parcels: Parcel[]; selectedId: string | null; onSelect: (id: string) => void };
type Point3 = { x: number; y: number; z: number };
type ScreenPoint = Point3;
type LayoutParcel = { parcel: Parcel; sector: number; row: number };
type ProjectedParcel = { parcel: Parcel; points: ScreenPoint[]; center: ScreenPoint; depth: number; sector: number; row: number };
type DomeState = { yaw: number; pitch: number; zoom: number; dragging: boolean; moved: boolean; lastX: number; lastY: number; velocityX: number; velocityY: number };

const GOLD = "#e8ad3f";
const GRID = "rgba(122,181,239,0.58)";
const COLORS = { digital: "rgba(77,166,255,0.58)", elite: "rgba(163,104,235,0.62)", premium: "rgba(232,173,63,0.68)" };

function spherePoint(theta: number, phi: number): Point3 {
  const sinPhi = Math.sin(phi);
  return { x: sinPhi * Math.cos(theta), y: Math.cos(phi), z: sinPhi * Math.sin(theta) };
}

function rotatePoint(p: Point3, yaw: number, pitch: number): Point3 {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const x1 = p.x * cy - p.z * sy;
  const z1 = p.x * sy + p.z * cy;
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  return { x: x1, y: p.y * cp - z1 * sp, z: p.y * sp + z1 * cp };
}

function tierColor(parcel: Parcel) {
  return COLORS[parcel.tier] ?? COLORS.digital;
}

function parcelSort(a: Parcel, b: Parcel) {
  const ac = (a.city_code ?? a.city_name ?? "").localeCompare(b.city_code ?? b.city_name ?? "");
  if (ac) return ac;
  const an = Number((a.parcel_number.match(/(\d+)$/) ?? ["0", "0"])[1]);
  const bn = Number((b.parcel_number.match(/(\d+)$/) ?? ["0", "0"])[1]);
  return an - bn || a.parcel_number.localeCompare(b.parcel_number);
}

export function SkyParcelGlobe({ parcels, selectedId, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<DomeState>({ yaw: 0, pitch: 0.16, zoom: 1, dragging: false, moved: false, lastX: 0, lastY: 0, velocityX: 0, velocityY: 0 });
  const hitRef = useRef<ProjectedParcel[]>([]);
  const selectedIdRef = useRef(selectedId);
  const layoutRef = useRef<LayoutParcel[]>([]);

  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);

  useEffect(() => {
    layoutRef.current = [...parcels].sort(parcelSort).map((parcel, index) => ({ parcel, sector: Math.floor(index / 10), row: index % 10 }));
  }, [parcels]);

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

    const project = (p: Point3, r: number, cx: number, cy: number): ScreenPoint => ({ x: cx + p.x * r, y: cy - p.y * r, z: p.z });

    const draw = () => {
      const s = stateRef.current;
      if (!s.dragging) {
        s.yaw += s.velocityX;
        s.pitch += s.velocityY;
        s.velocityX *= 0.90;
        s.velocityY *= 0.90;
        if (Math.abs(s.velocityX) < 0.00002) s.velocityX = 0;
        if (Math.abs(s.velocityY) < 0.00002) s.velocityY = 0;
      }
      s.pitch = Math.max(-0.72, Math.min(0.72, s.pitch));
      const radius = Math.min(width * 0.43, height * 0.47) * s.zoom;
      const cx = width / 2;
      const cy = height * 0.39;
      ctx.clearRect(0, 0, width, height);

      const halo = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.35);
      halo.addColorStop(0, "rgba(65,145,240,0.05)");
      halo.addColorStop(0.62, "rgba(65,145,240,0.14)");
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.ellipse(cx, cy, radius * 1.18, radius * 0.92, 0, 0, Math.PI * 2); ctx.fill();

      ctx.save();
      const domeFill = ctx.createRadialGradient(cx - radius * 0.25, cy - radius * 0.35, radius * 0.05, cx, cy, radius * 1.1);
      domeFill.addColorStop(0, "rgba(40,130,230,0.13)");
      domeFill.addColorStop(0.72, "rgba(7,50,105,0.10)");
      domeFill.addColorStop(1, "rgba(0,20,50,0)");
      ctx.fillStyle = domeFill;
      ctx.beginPath(); ctx.arc(cx, cy, radius, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.restore();

      ctx.strokeStyle = GRID;
      ctx.lineWidth = 0.75;
      for (let i = 0; i <= 10; i++) {
        const phi = 0.12 + (Math.PI / 2 - 0.12) * (i / 10);
        ctx.beginPath();
        let started = false;
        for (let j = 0; j <= 80; j++) {
          const theta = -Math.PI + (2 * Math.PI * j) / 80;
          const p = rotatePoint(spherePoint(theta, phi), s.yaw, s.pitch);
          if (p.z <= 0.01) { started = false; continue; }
          const q = project(p, radius, cx, cy);
          if (!started) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
          started = true;
        }
        ctx.stroke();
      }
      for (let i = 0; i < 24; i++) {
        const theta = -Math.PI + (2 * Math.PI * i) / 24;
        ctx.beginPath();
        let started = false;
        for (let j = 0; j <= 40; j++) {
          const phi = 0.12 + (Math.PI / 2 - 0.12) * (j / 40);
          const p = rotatePoint(spherePoint(theta, phi), s.yaw, s.pitch);
          if (p.z <= 0.01) { started = false; continue; }
          const q = project(p, radius, cx, cy);
          if (!started) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
          started = true;
        }
        ctx.stroke();
      }

      const candidates: ProjectedParcel[] = [];
      for (const item of layoutRef.current) {
        const sectorCenter = item.sector + 0.5;
        const rowCenter = item.row + 0.5;
        const theta0 = -Math.PI + (2 * Math.PI * item.sector) / 100;
        const theta1 = -Math.PI + (2 * Math.PI * (item.sector + 1)) / 100;
        const phiTop = 0.10 + (Math.PI / 2 - 0.10) * (item.row / 10);
        const phiBottom = 0.10 + (Math.PI / 2 - 0.10) * ((item.row + 1) / 10);
        const center = rotatePoint(spherePoint(-Math.PI + (2 * Math.PI * sectorCenter) / 100, 0.10 + (Math.PI / 2 - 0.10) * (rowCenter / 10)), s.yaw, s.pitch);
        if (center.z <= 0.015) continue;
        const corners = [
          rotatePoint(spherePoint(theta0, phiTop), s.yaw, s.pitch),
          rotatePoint(spherePoint(theta1, phiTop), s.yaw, s.pitch),
          rotatePoint(spherePoint(theta1, phiBottom), s.yaw, s.pitch),
          rotatePoint(spherePoint(theta0, phiBottom), s.yaw, s.pitch),
        ];
        candidates.push({ parcel: item.parcel, sector: item.sector, row: item.row, depth: center.z, center: project(center, radius, cx, cy), points: corners.map((p) => project(p, radius, cx, cy)) });
      }

      candidates.sort((a, b) => b.depth - a.depth);
      const visible = candidates.slice(0, 60).sort((a, b) => a.depth - b.depth);
      hitRef.current = visible;

      for (const item of visible) {
        const selected = item.parcel.id === selectedIdRef.current;
        const alpha = Math.max(0.25, Math.min(0.78, 0.28 + item.depth * 0.50));
        ctx.beginPath();
        item.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = selected ? "rgba(255,205,75,0.96)" : tierColor(item.parcel).replace(/0\.\d+\)$/, `${alpha.toFixed(2)})`);
        ctx.fill();
        ctx.lineWidth = selected ? 1.8 : 0.9;
        ctx.strokeStyle = selected ? "rgba(255,231,153,0.98)" : `rgba(150,205,255,${Math.max(0.48, item.depth * 0.82)})`;
        ctx.stroke();

        ctx.font = "600 9px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = selected ? "#fff8df" : "rgba(235,247,255,0.88)";
        ctx.fillText(`S${String(item.sector + 1).padStart(3, "0")}`, item.center.x, item.center.y);

        if (selected) {
          ctx.save();
          ctx.shadowColor = GOLD;
          ctx.shadowBlur = 18;
          ctx.strokeStyle = GOLD;
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          item.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
          ctx.closePath();
          ctx.stroke();
          ctx.fillStyle = GOLD;
          ctx.beginPath(); ctx.arc(item.center.x, item.center.y - 9, 3.5, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
          const label = item.parcel.parcel_number;
          ctx.font = "600 12px Inter, system-ui, sans-serif";
          const labelWidth = ctx.measureText(label).width + 24;
          const boxX = Math.min(width - labelWidth - 12, Math.max(12, item.center.x + 16));
          const boxY = Math.max(12, item.center.y - 48);
          ctx.fillStyle = "rgba(3,12,27,0.95)";
          ctx.strokeStyle = GOLD;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect(boxX, boxY, labelWidth, 30, 7); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.fillText(label, boxX + 12, boxY + 19);
        }
      }

      ctx.save();
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = "rgba(112,190,255,0.72)";
      ctx.shadowColor = "rgba(72,160,255,0.42)";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI, 0);
      ctx.stroke();
      ctx.restore();

      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);

  const pointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    s.dragging = true;
    s.moved = false;
    s.velocityX = 0;
    s.velocityY = 0;
    s.lastX = event.clientX;
    s.lastY = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (!s.dragging) return;
    event.preventDefault();
    const dx = event.clientX - s.lastX;
    const dy = event.clientY - s.lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) s.moved = true;
    s.yaw += dx * 0.008;
    s.pitch = Math.max(-0.72, Math.min(0.72, s.pitch + dy * 0.006));
    s.velocityX = dx * 0.0014;
    s.velocityY = dy * 0.0009;
    s.lastX = event.clientX;
    s.lastY = event.clientY;
  };

  const pointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    stateRef.current.dragging = false;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* pointer already released */ }
  };

  const click = (event: MouseEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (s.moved) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let closest: ProjectedParcel | null = null;
    let best = Infinity;
    for (const item of hitRef.current) {
      const d = Math.hypot(x - item.center.x, y - item.center.y);
      if (d < best && d < 28) { best = d; closest = item; }
    }
    if (closest) onSelect(closest.parcel.id);
  };

  const wheel = (event: WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    stateRef.current.zoom = Math.max(0.82, Math.min(1.16, stateRef.current.zoom - event.deltaY * 0.0007));
  };

  const reset = () => {
    stateRef.current.yaw = 0;
    stateRef.current.pitch = 0.16;
    stateRef.current.zoom = 1;
    stateRef.current.velocityX = 0;
    stateRef.current.velocityY = 0;
  };

  return (
    <div className="relative mx-auto h-[500px] w-full max-w-[940px] touch-none sm:h-[590px]">
      <div className="pointer-events-none absolute inset-x-[18%] top-[2%] h-[72%] rounded-full bg-sky-500/10 blur-3xl" />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onLostPointerCapture={() => { stateRef.current.dragging = false; }}
        onClick={click}
        onWheel={wheel}
        aria-label="MySkyParcel dijital gökyüzü kubbesi. Sürükleyerek döndürün ve parsel seçin."
      />
      <button type="button" onClick={reset} className="absolute bottom-3 right-3 rounded-full border border-gold/30 bg-navy-deep/85 px-3 py-2 text-xs text-gold shadow-lg backdrop-blur-md hover:bg-navy-deep">Sıfırla</button>
    </div>
  );
}
