import { useEffect, useMemo, useRef } from "react";
import type { MouseEvent, PointerEvent, WheelEvent } from "react";
import type { Parcel, ParcelTier } from "@/types/parcel";

type Props = { parcels: Parcel[]; selectedId: string | null; onSelect: (id: string) => void };
type P3 = { x: number; y: number; z: number };
type Cell = { parcel: Parcel; sector: number; row: number; depth: number; center: P3; points: P3[] };
type LayoutCell = { parcel: Parcel; sector: number; row: number };
type DomeState = { yaw: number; pitch: number; zoom: number; dragging: boolean; moved: boolean; lastX: number; lastY: number; velocityX: number; velocityY: number };

const GRID = "rgba(135,205,255,0.72)";
const FILL: Record<ParcelTier, string> = { digital: "rgba(77,166,255,0.52)", elite: "rgba(163,104,235,0.56)", premium: "rgba(232,173,63,0.60)" };
const SELECTED: Record<ParcelTier, string> = { digital: "rgba(77,166,255,0.96)", elite: "rgba(180,115,255,0.96)", premium: "rgba(255,202,75,0.98)" };
const GLOW: Record<ParcelTier, string> = { digital: "rgba(77,166,255,0.98)", elite: "rgba(180,115,255,0.98)", premium: "rgba(255,202,75,1)" };

const SECTORS = 100;
const ROWS = 10;
const VISIBLE_CELLS = 66;
const PHI_MIN = 0.035;
const PHI_MAX = Math.PI * 0.49;

function spherePoint(theta: number, phi: number): P3 {
  const sinPhi = Math.sin(phi);
  return { x: sinPhi * Math.cos(theta), y: Math.cos(phi), z: sinPhi * Math.sin(theta) };
}

function rotatePoint(p: P3, yaw: number, pitch: number): P3 {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const x = p.x * cy - p.z * sy;
  const z = p.x * sy + p.z * cy;
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  return { x, y: p.y * cp - z * sp, z: p.y * sp + z * cp };
}

function parcelSort(a: Parcel, b: Parcel) {
  return a.parcel_number.localeCompare(b.parcel_number, undefined, { numeric: true });
}

function buildLayout(parcels: Parcel[]): LayoutCell[] {
  // Exactly 10 visual latitude bands: 5 Digital, 3 Elite, 2 Premium.
  // Each band contains up to 100 real Supabase parcels (one per sector).
  const groups: Record<ParcelTier, Parcel[]> = { digital: [], elite: [], premium: [] };
  for (const parcel of parcels) groups[parcel.tier ?? "digital"].push(parcel);
  for (const group of Object.values(groups)) group.sort(parcelSort);

  const result: LayoutCell[] = [];
  let rowOffset = 0;
  for (const tier of ["digital", "elite", "premium"] as const) {
    const rowCount = tier === "digital" ? 5 : tier === "elite" ? 3 : 2;
    const group = groups[tier];
    for (let index = 0; index < Math.min(group.length, rowCount * SECTORS); index++) {
      result.push({ parcel: group[index], sector: index % SECTORS, row: rowOffset + Math.floor(index / SECTORS) });
    }
    rowOffset += rowCount;
  }
  return result;
}

function project(p: P3, radius: number, cx: number, cy: number): P3 {
  return { x: cx + p.x * radius, y: cy - p.y * radius, z: p.z };
}

export function SkyParcelGlobe({ parcels, selectedId, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<DomeState>({ yaw: 0, pitch: 0.10, zoom: 1, dragging: false, moved: false, lastX: 0, lastY: 0, velocityX: 0, velocityY: 0 });
  const selectedRef = useRef(selectedId);
  const layoutRef = useRef<LayoutCell[]>([]);
  const hitRef = useRef<Cell[]>([]);
  const layout = useMemo(() => buildLayout(parcels), [parcels]);

  useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);
  useEffect(() => { layoutRef.current = layout; }, [layout]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(320, rect.width);
      height = Math.max(380, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawDomeGrid = (radius: number, cx: number, cy: number, yaw: number, pitch: number) => {
      ctx.strokeStyle = GRID;
      ctx.lineWidth = 0.8;
      // Ten curved latitude bands.
      for (let row = 0; row <= ROWS; row++) {
        const phi = PHI_MIN + (PHI_MAX - PHI_MIN) * (row / ROWS);
        ctx.beginPath();
        let drawing = false;
        for (let i = 0; i <= 160; i++) {
          const theta = -Math.PI + (2 * Math.PI * i) / 160;
          const p = rotatePoint(spherePoint(theta, phi), yaw, pitch);
          if (p.z <= 0.005) { drawing = false; continue; }
          const q = project(p, radius, cx, cy);
          if (!drawing) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
          drawing = true;
        }
        ctx.stroke();
      }
      // Curved meridians, dense enough to make the cell geometry obvious.
      for (let sector = 0; sector < SECTORS; sector += 5) {
        const theta = -Math.PI + (2 * Math.PI * sector) / SECTORS;
        ctx.beginPath();
        let drawing = false;
        for (let i = 0; i <= 70; i++) {
          const phi = PHI_MIN + (PHI_MAX - PHI_MIN) * (i / 70);
          const p = rotatePoint(spherePoint(theta, phi), yaw, pitch);
          if (p.z <= 0.005) { drawing = false; continue; }
          const q = project(p, radius, cx, cy);
          if (!drawing) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y);
          drawing = true;
        }
        ctx.stroke();
      }
    };

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

      const radius = Math.min(width * 0.46, height * 0.50) * s.zoom;
      const cx = width / 2;
      const cy = height * 0.43;
      ctx.clearRect(0, 0, width, height);

      // Airy blue atmosphere; transparent toward the city side.
      const halo = ctx.createRadialGradient(cx, cy - radius * 0.28, radius * 0.05, cx, cy, radius * 1.30);
      halo.addColorStop(0, "rgba(55,145,240,0.10)");
      halo.addColorStop(0.58, "rgba(35,105,190,0.10)");
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 1.12, radius * 0.88, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      drawDomeGrid(radius, cx, cy, s.yaw, s.pitch);

      const candidates: Cell[] = [];
      for (const item of layoutRef.current) {
        const theta0 = -Math.PI + (2 * Math.PI * item.sector) / SECTORS;
        const theta1 = -Math.PI + (2 * Math.PI * (item.sector + 1)) / SECTORS;
        const phi0 = PHI_MIN + (PHI_MAX - PHI_MIN) * (item.row / ROWS);
        const phi1 = PHI_MIN + (PHI_MAX - PHI_MIN) * ((item.row + 1) / ROWS);
        const center = rotatePoint(spherePoint((theta0 + theta1) / 2, (phi0 + phi1) / 2), s.yaw, s.pitch);
        if (center.z <= 0.025) continue;
        const rawCorners = [
          spherePoint(theta0, phi0), spherePoint(theta1, phi0),
          spherePoint(theta1, phi1), spherePoint(theta0, phi1),
        ];
        const points = rawCorners.map((p) => project(rotatePoint(p, s.yaw, s.pitch), radius, cx, cy));
        const projectedCenter = project(center, radius, cx, cy);
        candidates.push({ parcel: item.parcel, sector: item.sector, row: item.row, depth: center.z, center: projectedCenter, points });
      }

      // The viewport is always 66 cells (when enough real data exists), chosen
      // by 3D front-face depth. Rotating changes the selected cells naturally.
      candidates.sort((a, b) => b.depth - a.depth);
      const visible = candidates.slice(0, VISIBLE_CELLS).sort((a, b) => a.depth - b.depth);
      hitRef.current = visible;

      for (const cell of visible) {
        const tier = cell.parcel.tier ?? "digital";
        const selected = cell.parcel.id === selectedRef.current;
        const alpha = Math.max(0.34, Math.min(0.78, 0.34 + cell.depth * 0.44));
        ctx.beginPath();
        cell.points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = selected ? SELECTED[tier] : FILL[tier].replace(/0\.\d+\)$/, `${alpha.toFixed(2)})`);
        ctx.fill();
        ctx.lineWidth = selected ? 2 : 1.05;
        ctx.strokeStyle = selected ? GLOW[tier] : "rgba(175,220,255,0.82)";
        ctx.stroke();

        // Sector label only; full parcel code is intentionally shown on selection.
        ctx.font = "600 9px Inter, system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = selected ? "#fff" : "rgba(235,247,255,0.92)";
        ctx.fillText(`S${String(cell.sector + 1).padStart(3, "0")}`, cell.center.x, cell.center.y);

        if (selected) {
          ctx.save();
          ctx.shadowColor = GLOW[tier];
          ctx.shadowBlur = 18;
          ctx.strokeStyle = GLOW[tier];
          ctx.lineWidth = 2.4;
          ctx.stroke();
          ctx.fillStyle = GLOW[tier];
          const sx = cell.center.x, sy = cell.center.y - 11;
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const a = -Math.PI / 2 + i * Math.PI / 5;
            const r = i % 2 === 0 ? 5 : 2.2;
            const x = sx + Math.cos(a) * r, y = sy + Math.sin(a) * r;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.closePath(); ctx.fill();
          ctx.restore();

          const label = cell.parcel.parcel_number;
          ctx.font = "600 12px Inter, system-ui, sans-serif";
          const labelWidth = ctx.measureText(label).width + 24;
          const boxX = Math.min(width - labelWidth - 12, Math.max(12, cell.center.x + 16));
          const boxY = Math.max(12, cell.center.y - 50);
          ctx.fillStyle = "rgba(3,12,27,0.95)";
          ctx.strokeStyle = GLOW[tier];
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect(boxX, boxY, labelWidth, 30, 7); ctx.fill(); ctx.stroke();
          ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.fillText(label, boxX + 12, boxY + 19);
        }
      }

      // Soft blue upper boundary; intentionally no yellow baseline.
      ctx.save();
      ctx.strokeStyle = "rgba(112,190,255,0.38)";
      ctx.lineWidth = 1.1;
      ctx.shadowColor = "rgba(72,160,255,0.24)";
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(cx, cy, radius, Math.PI, 0); ctx.stroke();
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const pointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    s.dragging = true; s.moved = false; s.velocityX = 0; s.velocityY = 0;
    s.lastX = event.clientX; s.lastY = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    if (!s.dragging) return;
    event.preventDefault();
    const dx = event.clientX - s.lastX;
    const dy = event.clientY - s.lastY;
    if (Math.abs(dx) + Math.abs(dy) > 2) s.moved = true;
    // Screen drag follows the dome: right drag rotates the visible dome right.
    s.yaw += dx * 0.008;
    s.pitch = Math.max(-0.72, Math.min(0.72, s.pitch + dy * 0.006));
    s.velocityX = dx * 0.0012;
    s.velocityY = dy * 0.0008;
    s.lastX = event.clientX; s.lastY = event.clientY;
  };

  const pointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    stateRef.current.dragging = false;
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* already released */ }
  };

  const click = (event: MouseEvent<HTMLCanvasElement>) => {
    if (stateRef.current.moved) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let closest: Cell | null = null;
    let best = Infinity;
    for (const cell of hitRef.current) {
      const d = Math.hypot(x - cell.center.x, y - cell.center.y);
      if (d < best && d < 34) { best = d; closest = cell; }
    }
    if (closest) onSelect(closest.parcel.id);
  };

  const wheel = (event: WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    stateRef.current.zoom = Math.max(0.86, Math.min(1.12, stateRef.current.zoom - event.deltaY * 0.0007));
  };

  const reset = () => {
    stateRef.current.yaw = 0; stateRef.current.pitch = 0.10; stateRef.current.zoom = 1;
    stateRef.current.velocityX = 0; stateRef.current.velocityY = 0;
  };

  return (
    <div className="relative mx-auto h-[500px] w-full max-w-[940px] touch-none sm:h-[590px]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none select-none"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
        onLostPointerCapture={() => { stateRef.current.dragging = false; }}
        onClick={click}
        onWheel={wheel}
        aria-label="MySkyParcel dijital gökyüzü kubbesi. Sürükleyerek döndürün ve parsel seçin."
        style={{ touchAction: "none" }}
      />
      <button type="button" onClick={reset} className="absolute bottom-3 right-3 rounded-full border border-gold/30 bg-navy-deep/85 px-3 py-2 text-xs text-gold shadow-lg backdrop-blur-md hover:bg-navy-deep">Sıfırla</button>
    </div>
  );
}
