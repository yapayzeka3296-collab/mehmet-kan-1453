import { useEffect, useMemo, useRef } from "react";
import type { MouseEvent, PointerEvent, WheelEvent } from "react";
import type { Parcel, ParcelTier } from "@/types/parcel";

type Props = { parcels: Parcel[]; selectedId: string | null; onSelect: (id: string) => void };
type P3 = { x: number; y: number; z: number };
type Cell = { parcel: Parcel; sector: number; row: number; depth: number; center: P3; points: P3[]; tier: ParcelTier };
type LayoutCell = { parcel: Parcel; sector: number; row: number };
type DomeState = { yaw: number; pitch: number; zoom: number; dragging: boolean; moved: boolean; lastX: number; lastY: number; velocityX: number; velocityY: number };

const SECTORS = 100;
const ROWS = 10;
const VISIBLE_CELLS = 66;
const PHI_MIN = 0.05;
const PHI_MAX = Math.PI * 0.50;
const ROW_VISIBLE_COUNTS = [3, 4, 5, 6, 7, 8, 10, 10, 7, 6];

const GRID = "rgba(151,214,255,0.82)";
const FILL: Record<ParcelTier, string> = {
  digital: "rgba(53,145,240,0.16)",
  elite: "rgba(155,83,235,0.18)",
  premium: "rgba(240,171,45,0.22)",
};
const SELECTED: Record<ParcelTier, string> = {
  digital: "rgba(55,157,255,0.86)",
  elite: "rgba(172,94,255,0.88)",
  premium: "rgba(255,191,48,0.92)",
};
const GLOW: Record<ParcelTier, string> = {
  digital: "rgba(82,184,255,1)",
  elite: "rgba(193,108,255,1)",
  premium: "rgba(255,201,70,1)",
};

function spherePoint(theta: number, phi: number): P3 {
  const s = Math.sin(phi);
  return { x: s * Math.cos(theta), y: Math.cos(phi), z: s * Math.sin(theta) };
}

function rotatePoint(p: P3, yaw: number, pitch: number): P3 {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const x = p.x * cy - p.z * sy;
  const z0 = p.x * sy + p.z * cy;
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  return { x, y: p.y * cp - z0 * sp, z: p.y * sp + z0 * cp };
}

function project(p: P3, radius: number, cx: number, cy: number): P3 {
  return { x: cx + p.x * radius, y: cy - p.y * radius, z: p.z };
}

function parseParcelCode(code: string) {
  const sectorMatch = code.match(/-S(\d{1,3})-/i);
  const parcelMatch = code.match(/-P(\d{1,2})$/i);
  return {
    sector: sectorMatch ? Math.max(1, Math.min(SECTORS, Number(sectorMatch[1]))) - 1 : null,
    row: parcelMatch ? Math.max(1, Math.min(ROWS, Number(parcelMatch[1]))) - 1 : null,
  };
}

function rowTier(row: number): ParcelTier {
  if (row >= 8) return "premium";
  if (row >= 6) return "elite";
  return "digital";
}

function buildLayout(parcels: Parcel[]): LayoutCell[] {
  const result: LayoutCell[] = [];
  const used = new Set<string>();
  for (const parcel of parcels) {
    const parsed = parseParcelCode(String(parcel.parcel_number ?? ""));
    if (parsed.sector === null || parsed.row === null) continue;
    const key = `${parsed.row}:${parsed.sector}`;
    if (!used.has(key)) {
      used.add(key);
      result.push({ parcel, sector: parsed.sector, row: parsed.row });
    }
  }
  let cursor = 0;
  for (const parcel of parcels) {
    if (result.some((x) => x.parcel.id === parcel.id)) continue;
    while (used.has(`${Math.floor(cursor / SECTORS)}:${cursor % SECTORS}`)) cursor++;
    if (cursor >= ROWS * SECTORS) break;
    const row = Math.floor(cursor / SECTORS);
    const sector = cursor % SECTORS;
    used.add(`${row}:${sector}`);
    result.push({ parcel, sector, row });
    cursor++;
  }
  return result;
}

function pointInPolygon(x: number, y: number, points: P3[]) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x, yi = points[i].y;
    const xj = points[j].x, yj = points[j].y;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function angularDistance(a: number, b: number) {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

/**
 * Choose a distributed viewport on the spherical surface.
 *
 * Do not take the nearest 66 cells to the facing longitude: that creates a
 * rectangular block in the centre of the dome. Instead, every parcel row gets
 * a quota and those parcels are sampled across a broad visible angular arc.
 * The actual parcel polygons are still projected from their true 3D spherical
 * coordinates, so the visible selection follows the dome curvature.
 */
function selectVisibleCells(candidates: Cell[], yaw: number): Cell[] {
  const result: Cell[] = [];
  const facingTheta = Math.PI / 2 - yaw;

  for (let row = 0; row < ROWS; row++) {
    const quota = ROW_VISIBLE_COUNTS[row] ?? 0;
    const rowCandidates = candidates.filter((cell) => cell.row === row);
    if (rowCandidates.length === 0 || quota === 0) continue;

    // Broadens toward the lower rows so the selected parcels visually follow
    // the dome instead of forming a narrow vertical column.
    const halfSpan = Math.min(1.46, 0.86 + row * 0.067);
    const targets = Array.from({ length: quota }, (_, index) =>
      facingTheta - halfSpan + ((index + 0.5) / quota) * halfSpan * 2,
    );

    const remaining = new Set(rowCandidates);
    for (const target of targets) {
      let best: Cell | null = null;
      let bestDistance = Infinity;
      for (const candidate of remaining) {
        const theta = -Math.PI + (2 * Math.PI * (candidate.sector + 0.5)) / SECTORS;
        const distance = angularDistance(theta, target);
        if (distance < bestDistance) {
          best = candidate;
          bestDistance = distance;
        }
      }
      if (best) {
        result.push(best);
        remaining.delete(best);
      }
    }
  }

  return result.slice(0, VISIBLE_CELLS);
}

export function SkyParcelGlobe({ parcels, selectedId, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<DomeState>({ yaw: 0, pitch: 0.08, zoom: 1, dragging: false, moved: false, lastX: 0, lastY: 0, velocityX: 0, velocityY: 0 });
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

    const drawHemisphere = (radius: number, cx: number, cy: number, yaw: number, pitch: number) => {
      const halo = ctx.createRadialGradient(cx, cy - radius * 0.45, radius * 0.08, cx, cy, radius * 1.1);
      halo.addColorStop(0, "rgba(46,139,255,0.12)");
      halo.addColorStop(0.62, "rgba(29,104,198,0.08)");
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius, radius * 0.98, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = GRID;
      ctx.lineWidth = 0.8;
      for (let row = 0; row <= ROWS; row++) {
        const phi = PHI_MIN + (PHI_MAX - PHI_MIN) * (row / ROWS);
        ctx.beginPath();
        let started = false;
        for (let i = 0; i <= 180; i++) {
          const theta = -Math.PI + (2 * Math.PI * i) / 180;
          const p = rotatePoint(spherePoint(theta, phi), yaw, pitch);
          if (p.z < -0.03) { started = false; continue; }
          const q = project(p, radius, cx, cy);
          if (!started) { ctx.moveTo(q.x, q.y); started = true; } else ctx.lineTo(q.x, q.y);
        }
        ctx.stroke();
      }

      for (let sector = 0; sector < SECTORS; sector += 5) {
        const theta = -Math.PI + (2 * Math.PI * sector) / SECTORS;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i <= 90; i++) {
          const phi = PHI_MIN + (PHI_MAX - PHI_MIN) * (i / 90);
          const p = rotatePoint(spherePoint(theta, phi), yaw, pitch);
          if (p.z < -0.03) { started = false; continue; }
          const q = project(p, radius, cx, cy);
          if (!started) { ctx.moveTo(q.x, q.y); started = true; } else ctx.lineTo(q.x, q.y);
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
      s.pitch = Math.max(-0.65, Math.min(0.65, s.pitch));

      const radius = Math.min(width * 0.48, height * 0.62) * s.zoom;
      const cx = width * 0.50;
      const cy = height * 0.64;
      ctx.clearRect(0, 0, width, height);
      drawHemisphere(radius, cx, cy, s.yaw, s.pitch);

      const candidates: Cell[] = [];
      for (const item of layoutRef.current) {
        const theta0 = -Math.PI + (2 * Math.PI * item.sector) / SECTORS;
        const theta1 = -Math.PI + (2 * Math.PI * (item.sector + 1)) / SECTORS;
        const phi0 = PHI_MIN + (PHI_MAX - PHI_MIN) * (item.row / ROWS);
        const phi1 = PHI_MIN + (PHI_MAX - PHI_MIN) * ((item.row + 1) / ROWS);

        const center3 = rotatePoint(spherePoint((theta0 + theta1) / 2, (phi0 + phi1) / 2), s.yaw, s.pitch);
        if (center3.z <= 0.015) continue;

        const corners = [
          spherePoint(theta0, phi0), spherePoint(theta1, phi0),
          spherePoint(theta1, phi1), spherePoint(theta0, phi1),
        ].map((p) => project(rotatePoint(p, s.yaw, s.pitch), radius, cx, cy));

        const center = project(center3, radius, cx, cy);
        if (center.x < -radius || center.x > width + radius || center.y < -radius || center.y > height + radius) continue;

        candidates.push({
          parcel: item.parcel,
          sector: item.sector,
          row: item.row,
          depth: center3.z,
          center,
          points: corners,
          tier: rowTier(item.row),
        });
      }

      const visible = selectVisibleCells(candidates, s.yaw).sort((a, b) => a.depth - b.depth);
      hitRef.current = visible;

      for (const cell of visible) {
        const selected = cell.parcel.id === selectedRef.current;
        ctx.beginPath();
        cell.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = selected ? SELECTED[cell.tier] : FILL[cell.tier];
        ctx.fill();
        ctx.lineWidth = selected ? 2.2 : 1.15;
        ctx.strokeStyle = selected ? GLOW[cell.tier] : "rgba(170,220,255,0.90)";
        ctx.stroke();

        if (selected) {
          ctx.save();
          ctx.shadowColor = GLOW[cell.tier];
          ctx.shadowBlur = 20;
          ctx.strokeStyle = GLOW[cell.tier];
          ctx.lineWidth = 2.5;
          ctx.stroke();

          const sx = cell.center.x, sy = cell.center.y;
          ctx.fillStyle = "#fff4bf";
          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const a = -Math.PI / 2 + i * Math.PI / 5;
            const r = i % 2 === 0 ? 7 : 3;
            const x = sx + Math.cos(a) * r;
            const y = sy + Math.sin(a) * r;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          const label = String(cell.parcel.parcel_number ?? "");
          ctx.font = "600 12px Inter, system-ui, sans-serif";
          const labelWidth = ctx.measureText(label).width + 26;
          const boxX = Math.min(width - labelWidth - 14, Math.max(14, cell.center.x + 18));
          const boxY = Math.max(14, cell.center.y - 54);
          ctx.fillStyle = "rgba(3,12,27,0.96)";
          ctx.strokeStyle = GLOW[cell.tier];
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, labelWidth, 32, 8);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#fff";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(label, boxX + 13, boxY + 16);
        }
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI, 0);
      ctx.strokeStyle = "rgba(92,181,255,0.34)";
      ctx.lineWidth = 1.1;
      ctx.shadowColor = "rgba(71,163,255,0.22)";
      ctx.shadowBlur = 10;
      ctx.stroke();
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
    s.yaw += dx * 0.0075;
    s.pitch = Math.max(-0.65, Math.min(0.65, s.pitch - dy * 0.0055));
    s.velocityX = dx * 0.0011;
    s.velocityY = -dy * 0.00075;
    s.lastX = event.clientX;
    s.lastY = event.clientY;
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
    let bestDepth = -Infinity;
    for (const cell of hitRef.current) {
      if (pointInPolygon(x, y, cell.points) && cell.depth > bestDepth) {
        closest = cell;
        bestDepth = cell.depth;
      }
    }
    if (closest) onSelect(closest.parcel.id);
  };

  const wheel = (event: WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    stateRef.current.zoom = Math.max(0.86, Math.min(1.10, stateRef.current.zoom - event.deltaY * 0.0007));
  };

  const reset = () => {
    stateRef.current.yaw = 0;
    stateRef.current.pitch = 0.08;
    stateRef.current.zoom = 1;
    stateRef.current.velocityX = 0;
    stateRef.current.velocityY = 0;
  };

  return (
    <div className="relative mx-auto h-[540px] w-full max-w-[1060px] touch-none sm:h-[640px]">
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
        aria-label="MySkyParcel dijital gökyüzü kubbesi. Sürükleyerek döndürün ve parsele tıklayarak kodunu görün."
        style={{ touchAction: "none" }}
      />
      <button type="button" onClick={reset} className="absolute bottom-3 right-3 rounded-full border border-gold/30 bg-navy-deep/85 px-3 py-2 text-xs text-gold shadow-lg backdrop-blur-md hover:bg-navy-deep">Sıfırla</button>
    </div>
  );
}
