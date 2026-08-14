import { useEffect, useMemo, useRef } from "react";
import type { Parcel, ParcelTier } from "@/types/parcel";

type Props = {
  parcels: Parcel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  layerFilter?: number | null;
  sectorFilter?: number | null;
};

type P3 = { x: number; y: number; z: number };
type Cell = { parcel: Parcel; layer: number; sector: number; center: P3; points: P3[]; depth: number; tier: ParcelTier };
type LayoutCell = { parcel: Parcel; layer: number; sector: number };
type DomeState = { yaw: number; pitch: number; zoom: number; dragging: boolean; moved: boolean; lastX: number; lastY: number; velocityX: number; velocityY: number };

const SECTORS = 100;
const LAYERS = 10;
const VISIBLE_CELLS = 220;
const PHI_MIN = 0.10;
const PHI_MAX = Math.PI * 0.54;
const X_SCALE = 1.42;
const GRID = "rgba(191,231,255,0.42)";
const GRID_FAINT = "rgba(177,224,255,0.16)";
const FILL: Record<ParcelTier, string> = {
  digital: "rgba(54,170,246,0.045)",
  elite: "rgba(165,101,244,0.06)",
  premium: "rgba(247,186,63,0.07)",
};
const SELECTED: Record<ParcelTier, string> = {
  digital: "rgba(53,170,247,0.22)",
  elite: "rgba(171,102,247,0.23)",
  premium: "rgba(247,186,63,0.25)",
};
const GLOW: Record<ParcelTier, string> = {
  digital: "rgba(92,205,255,0.98)",
  elite: "rgba(194,125,255,0.98)",
  premium: "rgba(255,210,91,0.99)",
};

function spherePoint(theta: number, phi: number): P3 {
  const s = Math.sin(phi);
  return { x: s * Math.cos(theta), y: Math.cos(phi), z: s * Math.sin(theta) };
}

function rotatePoint(p: P3, yaw: number, pitch: number): P3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x = p.x * cy - p.z * sy;
  const z0 = p.x * sy + p.z * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return { x, y: p.y * cp - z0 * sp, z: p.y * sp + z0 * cp };
}

function project(p: P3, radius: number, cx: number, cy: number): P3 {
  const perspective = 1 + Math.max(-0.22, Math.min(0.22, p.z)) * 0.12;
  return {
    x: cx + p.x * radius * X_SCALE * perspective,
    y: cy - p.y * radius * perspective,
    z: p.z,
  };
}

function parseParcelCode(code: string) {
  const sectorMatch = code.match(/-S(\d{1,3})-/i);
  const layerMatch = code.match(/-K(\d{1,3})-/i);
  return {
    sector: sectorMatch ? Math.max(1, Math.min(SECTORS, Number(sectorMatch[1]))) : null,
    layer: layerMatch ? Math.max(1, Math.min(LAYERS, Number(layerMatch[1]))) : null,
  };
}

function normalizeTier(tier: unknown): ParcelTier {
  return tier === "elite" || tier === "premium" ? tier : "digital";
}

function getHierarchy(parcel: Parcel) {
  const parsed = parseParcelCode(String(parcel.parcel_number ?? ""));
  const layer = parcel.layer_number ?? parsed.layer;
  const sector = parcel.sector_number ?? parsed.sector;
  return {
    layer: layer ? Math.max(1, Math.min(LAYERS, Number(layer))) : null,
    sector: sector ? Math.max(1, Math.min(SECTORS, Number(sector))) : null,
  };
}

function buildLayout(parcels: Parcel[]): LayoutCell[] {
  const result: LayoutCell[] = [];
  const used = new Set<string>();
  const placed = new Set<string>();

  for (const parcel of parcels) {
    const hierarchy = getHierarchy(parcel);
    if (hierarchy.layer === null || hierarchy.sector === null) continue;
    const key = `${hierarchy.layer}:${hierarchy.sector}`;
    if (used.has(key)) continue;
    used.add(key);
    placed.add(parcel.id);
    result.push({ parcel, layer: hierarchy.layer, sector: hierarchy.sector });
  }

  let cursor = 0;
  for (const parcel of parcels) {
    if (placed.has(parcel.id)) continue;
    while (cursor < LAYERS * SECTORS) {
      const layer = Math.floor(cursor / SECTORS) + 1;
      const sector = (cursor % SECTORS) + 1;
      if (!used.has(`${layer}:${sector}`)) break;
      cursor += 1;
    }
    if (cursor >= LAYERS * SECTORS) break;
    const layer = Math.floor(cursor / SECTORS) + 1;
    const sector = (cursor % SECTORS) + 1;
    used.add(`${layer}:${sector}`);
    placed.add(parcel.id);
    result.push({ parcel, layer, sector });
    cursor += 1;
  }

  return result;
}

function pointInPolygon(x: number, y: number, points: P3[]) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i) {
    const current = points[i];
    const previous = points[j];
    if (!current || !previous) continue;
    const intersect = current.y > y !== previous.y > y && x < ((previous.x - current.x) * (y - current.y)) / (previous.y - current.y) + current.x;
    if (intersect) inside = !inside;
  }
  return inside;
}

function drawCurve(ctx: CanvasRenderingContext2D, points: P3[]) {
  if (points.length < 2) return;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();
}

export function SkyParcelDome({ parcels, selectedId, onSelect, layerFilter = null, sectorFilter = null }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedRef = useRef(selectedId);
  const layoutRef = useRef<LayoutCell[]>([]);
  const hitRef = useRef<Cell[]>([]);
  const stateRef = useRef<DomeState>({ yaw: 0, pitch: -0.12, zoom: 1, dragging: false, moved: false, lastX: 0, lastY: 0, velocityX: 0, velocityY: 0 });

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
      height = Math.max(440, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawAtmosphere = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(111,198,255,0.025)");
      gradient.addColorStop(0.52, "rgba(72,170,239,0.012)");
      gradient.addColorStop(1, "rgba(4,28,55,0.10)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const glow = ctx.createRadialGradient(width * 0.5, height * 0.16, 0, width * 0.5, height * 0.30, width * 0.72);
      glow.addColorStop(0, "rgba(239,252,255,0.10)");
      glow.addColorStop(0.45, "rgba(104,203,255,0.025)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height * 0.76);
    };

    const domePoint = (theta: number, phi: number, yaw: number, pitch: number, radius: number, cx: number, cy: number) =>
      project(rotatePoint(spherePoint(theta, phi), yaw, pitch), radius, cx, cy);

    const drawDome = (radius: number, cx: number, cy: number, yaw: number, pitch: number) => {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const halo = ctx.createRadialGradient(cx, cy - radius * 0.92, 0, cx, cy - radius * 0.22, radius * 1.38);
      halo.addColorStop(0, "rgba(111,210,255,0.075)");
      halo.addColorStop(0.45, "rgba(60,168,236,0.025)");
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.ellipse(cx, cy - radius * 0.13, radius * 1.42, radius * 1.02, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      for (let layer = 0; layer <= LAYERS; layer += 1) {
        const phi = PHI_MIN + (PHI_MAX - PHI_MIN) * (layer / LAYERS);
        const points: P3[] = [];
        for (let i = 0; i <= 260; i += 1) {
          const theta = -Math.PI - 0.08 + ((2 * Math.PI + 0.16) * i) / 260;
          const point = domePoint(theta, phi, yaw, pitch, radius, cx, cy);
          if (point.z > -0.45) points.push(point);
        }
        ctx.strokeStyle = layer === 0 ? "rgba(238,251,255,0.68)" : GRID;
        ctx.lineWidth = layer === 0 ? 1.15 : 0.68;
        drawCurve(ctx, points);
      }

      for (let sector = 0; sector < SECTORS; sector += 2) {
        const theta = -Math.PI + (2 * Math.PI * sector) / SECTORS;
        const points: P3[] = [];
        for (let i = 0; i <= 120; i += 1) {
          const phi = PHI_MIN + (PHI_MAX - PHI_MIN) * (i / 120);
          const point = domePoint(theta, phi, yaw, pitch, radius, cx, cy);
          if (point.z > -0.45) points.push(point);
        }
        ctx.strokeStyle = sector % 10 === 0 ? "rgba(219,247,255,0.44)" : GRID_FAINT;
        ctx.lineWidth = sector % 10 === 0 ? 0.78 : 0.48;
        drawCurve(ctx, points);
      }

      // The horizon rim is deliberately broad: it makes the dome feel much larger than the viewport.
      const rimY = cy + radius * 0.025;
      ctx.strokeStyle = "rgba(211,244,255,0.32)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, rimY, radius * 1.42, radius * 0.31, 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      // Soft continuation lines leave the viewport instead of ending at the dome rim.
      ctx.strokeStyle = "rgba(189,231,255,0.095)";
      ctx.lineWidth = 0.52;
      for (let i = -11; i <= 11; i += 1) {
        const startX = cx + i * radius * 0.125;
        const endX = cx + i * radius * 0.52;
        ctx.beginPath();
        ctx.moveTo(startX, rimY - radius * 0.015);
        ctx.bezierCurveTo(
          cx + i * radius * 0.18,
          rimY + radius * 0.08,
          cx + i * radius * 0.34,
          height * 0.78,
          endX,
          height + radius * 0.18,
        );
        ctx.stroke();
      }

      // A very subtle lower arc reinforces the globe curvature without becoming a second map.
      ctx.strokeStyle = "rgba(206,241,255,0.08)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.ellipse(cx, rimY + radius * 0.06, radius * 1.56, radius * 0.42, 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    };

    const draw = () => {
      const state = stateRef.current;
      if (!state.dragging) {
        state.yaw += state.velocityX;
        state.pitch += state.velocityY;
        state.velocityX *= 0.91;
        state.velocityY *= 0.91;
        if (Math.abs(state.velocityX) < 0.00002) state.velocityX = 0;
        if (Math.abs(state.velocityY) < 0.00002) state.velocityY = 0;
      }
      state.pitch = Math.max(-0.34, Math.min(0.26, state.pitch));

      const radius = Math.min(width * 0.72, height * 0.86) * state.zoom;
      const cx = width * 0.5;
      const cy = height * 0.87;
      ctx.clearRect(0, 0, width, height);
      drawAtmosphere();
      drawDome(radius, cx, cy, state.yaw, state.pitch);

      const cells: Cell[] = [];
      for (const item of layoutRef.current) {
        if (layerFilter !== null && item.layer !== layerFilter) continue;
        if (sectorFilter !== null && item.sector !== sectorFilter) continue;

        const phi0 = PHI_MIN + (PHI_MAX - PHI_MIN) * ((item.layer - 1) / LAYERS);
        const phi1 = PHI_MIN + (PHI_MAX - PHI_MIN) * (item.layer / LAYERS);
        const theta0 = -Math.PI + (2 * Math.PI * (item.sector - 1)) / SECTORS;
        const theta1 = -Math.PI + (2 * Math.PI * item.sector) / SECTORS;
        const center3 = rotatePoint(spherePoint((theta0 + theta1) * 0.5, (phi0 + phi1) * 0.5), state.yaw, state.pitch);
        if (center3.z <= -0.05) continue;

        const corners = [spherePoint(theta0, phi0), spherePoint(theta1, phi0), spherePoint(theta1, phi1), spherePoint(theta0, phi1)].map((point) => project(rotatePoint(point, state.yaw, state.pitch), radius, cx, cy));
        const center = project(center3, radius, cx, cy);
        if (center.x < -radius * 0.6 || center.x > width + radius * 0.6 || center.y < -radius * 1.1 || center.y > height + radius * 0.3) continue;
        cells.push({ parcel: item.parcel, layer: item.layer, sector: item.sector, center, points: corners, depth: center3.z, tier: normalizeTier(item.parcel.tier) });
      }

      cells.sort((a, b) => a.depth - b.depth);
      const visible = cells.slice(Math.max(0, cells.length - VISIBLE_CELLS));
      hitRef.current = visible;

      for (const cell of visible) {
        const selected = cell.parcel.id === selectedRef.current;
        const statusOpacity = cell.parcel.status === "sold" ? 0.43 : cell.parcel.status === "reserved" ? 0.62 : 1;
        ctx.save();
        ctx.globalAlpha = statusOpacity;
        ctx.beginPath();
        cell.points.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.fillStyle = selected ? SELECTED[cell.tier] : FILL[cell.tier];
        ctx.fill();
        ctx.lineWidth = selected ? 2.25 : 0.66;
        ctx.strokeStyle = selected ? GLOW[cell.tier] : "rgba(198,235,255,0.42)";
        ctx.stroke();

        if (cell.parcel.status === "reserved") {
          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = "rgba(255,225,139,0.55)";
          ctx.lineWidth = 0.86;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        if (selected) {
          ctx.shadowColor = GLOW[cell.tier];
          ctx.shadowBlur = 20;
          ctx.strokeStyle = GLOW[cell.tier];
          ctx.lineWidth = 2.7;
          ctx.stroke();
          ctx.shadowBlur = 0;
          const pulse = 1 + Math.sin(performance.now() / 260) * 0.16;
          const glow = ctx.createRadialGradient(cell.center.x, cell.center.y, 0, cell.center.x, cell.center.y, 18 * pulse);
          glow.addColorStop(0, "rgba(255,255,255,0.98)");
          glow.addColorStop(0.12, GLOW[cell.tier]);
          glow.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(cell.center.x, cell.center.y, 18 * pulse, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    const handlePointerDown = (event: PointerEvent) => {
      stateRef.current.dragging = true;
      stateRef.current.moved = false;
      stateRef.current.lastX = event.clientX;
      stateRef.current.lastY = event.clientY;
      stateRef.current.velocityX = 0;
      stateRef.current.velocityY = 0;
      canvas.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const state = stateRef.current;
      if (!state.dragging) return;
      const dx = event.clientX - state.lastX;
      const dy = event.clientY - state.lastY;
      if (Math.abs(dx) + Math.abs(dy) > 2) state.moved = true;
      state.yaw += dx * 0.0042;
      state.pitch += dy * 0.0030;
      state.velocityX = dx * 0.0008;
      state.velocityY = dy * 0.0005;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
    };

    const handlePointerUp = (event: PointerEvent) => {
      const state = stateRef.current;
      state.dragging = false;
      if (!state.moved) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const target = [...hitRef.current].reverse().find((cell) => pointInPolygon(x, y, cell.points));
        if (target) onSelect(target.parcel.id);
      }
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      stateRef.current.zoom = Math.max(0.82, Math.min(1.28, stateRef.current.zoom * (event.deltaY > 0 ? 0.94 : 1.06)));
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointercancel", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointercancel", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [layerFilter, sectorFilter, onSelect]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="MySkyParcel gökyüzü parsel haritası"
      className="absolute inset-0 h-full w-full touch-none select-none"
    />
  );
}
