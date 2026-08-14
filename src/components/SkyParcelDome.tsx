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
const VISIBLE_CELLS = 150;
const PHI_MIN = 0.045;
const PHI_MAX = Math.PI * 0.5;
const GRID = "rgba(191,231,255,0.46)";
const GRID_FAINT = "rgba(177,224,255,0.20)";
const FILL: Record<ParcelTier, string> = { digital: "rgba(54,170,246,0.055)", elite: "rgba(165,101,244,0.075)", premium: "rgba(247,186,63,0.09)" };
const SELECTED: Record<ParcelTier, string> = { digital: "rgba(53,170,247,0.24)", elite: "rgba(171,102,247,0.25)", premium: "rgba(247,186,63,0.28)" };
const GLOW: Record<ParcelTier, string> = { digital: "rgba(92,205,255,0.98)", elite: "rgba(194,125,255,0.98)", premium: "rgba(255,210,91,0.99)" };

function spherePoint(theta: number, phi: number): P3 { const s = Math.sin(phi); return { x: s * Math.cos(theta), y: Math.cos(phi), z: s * Math.sin(theta) }; }
function rotatePoint(p: P3, yaw: number, pitch: number): P3 { const cy = Math.cos(yaw), sy = Math.sin(yaw); const x = p.x * cy - p.z * sy; const z0 = p.x * sy + p.z * cy; const cp = Math.cos(pitch), sp = Math.sin(pitch); return { x, y: p.y * cp - z0 * sp, z: p.y * sp + z0 * cp }; }
function project(p: P3, radius: number, cx: number, cy: number, xScale: number): P3 { const perspective = 1 + Math.max(-0.18, Math.min(0.18, p.z)) * 0.08; return { x: cx + p.x * radius * xScale * perspective, y: cy - p.y * radius * perspective, z: p.z }; }
function parseParcelCode(code: string) { const sectorMatch = code.match(/-S(\d{1,3})-/i); const layerMatch = code.match(/-K(\d{1,3})-/i); return { sector: sectorMatch ? Math.max(1, Math.min(SECTORS, Number(sectorMatch[1]))) : null, layer: layerMatch ? Math.max(1, Math.min(LAYERS, Number(layerMatch[1]))) : null }; }
function normalizeTier(tier: unknown): ParcelTier { return tier === "elite" || tier === "premium" ? tier : "digital"; }
function getHierarchy(parcel: Parcel) { const parsed = parseParcelCode(String(parcel.parcel_number ?? "")); const layer = parcel.layer_number ?? parsed.layer; const sector = parcel.sector_number ?? parsed.sector; return { layer: layer ? Math.max(1, Math.min(LAYERS, Number(layer))) : null, sector: sector ? Math.max(1, Math.min(SECTORS, Number(sector))) : null }; }
function buildLayout(parcels: Parcel[]): LayoutCell[] { const result: LayoutCell[] = []; const used = new Set<string>(); const placed = new Set<string>(); for (const parcel of parcels) { const hierarchy = getHierarchy(parcel); if (hierarchy.layer === null || hierarchy.sector === null) continue; const key = `${hierarchy.layer}:${hierarchy.sector}`; if (used.has(key)) continue; used.add(key); placed.add(parcel.id); result.push({ parcel, layer: hierarchy.layer, sector: hierarchy.sector }); } let cursor = 0; for (const parcel of parcels) { if (placed.has(parcel.id)) continue; while (cursor < LAYERS * SECTORS) { const layer = Math.floor(cursor / SECTORS) + 1; const sector = (cursor % SECTORS) + 1; if (!used.has(`${layer}:${sector}`)) break; cursor += 1; } if (cursor >= LAYERS * SECTORS) break; const layer = Math.floor(cursor / SECTORS) + 1; const sector = (cursor % SECTORS) + 1; used.add(`${layer}:${sector}`); placed.add(parcel.id); result.push({ parcel, layer, sector }); cursor += 1; } return result; }
function pointInPolygon(x: number, y: number, points: P3[]) { let inside = false; for (let i = 0, j = points.length - 1; i < points.length; j = i) { const current = points[i]; const previous = points[j]; if (!current || !previous) continue; const intersect = current.y > y !== previous.y > y && x < ((previous.x - current.x) * (y - current.y)) / (previous.y - current.y) + current.x; if (intersect) inside = !inside; } return inside; }
function drawCurve(ctx: CanvasRenderingContext2D, points: P3[]) { if (!points.length) return; ctx.beginPath(); points.forEach((point, index) => { if (index === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y); }); ctx.stroke(); }

export function SkyParcelDome({ parcels, selectedId, onSelect, layerFilter = null, sectorFilter = null }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedRef = useRef(selectedId);
  const layoutRef = useRef<LayoutCell[]>([]);
  const hitRef = useRef<Cell[]>([]);
  const stateRef = useRef<DomeState>({ yaw: 0, pitch: -0.035, zoom: 1, dragging: false, moved: false, lastX: 0, lastY: 0, velocityX: 0, velocityY: 0 });
  const layout = useMemo(() => buildLayout(parcels), [parcels]);
  useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);
  useEffect(() => { layoutRef.current = layout; }, [layout]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0; let width = 0; let height = 0; let dpr = 1;
    const resize = () => { const rect = canvas.getBoundingClientRect(); width = Math.max(320, rect.width); height = Math.max(440, rect.height); dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const drawSkyGlow = () => { const gradient = ctx.createLinearGradient(0, 0, 0, height); gradient.addColorStop(0, "rgba(117,198,255,0.035)"); gradient.addColorStop(0.48, "rgba(86,179,245,0.018)"); gradient.addColorStop(1, "rgba(8,34,64,0.08)"); ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height); const centerGlow = ctx.createRadialGradient(width * 0.5, height * 0.22, 8, width * 0.5, height * 0.38, width * 0.7); centerGlow.addColorStop(0, "rgba(220,246,255,0.12)"); centerGlow.addColorStop(0.46, "rgba(104,203,255,0.035)"); centerGlow.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = centerGlow; ctx.fillRect(0, 0, width, height * 0.82); };
    const domePoint = (theta: number, phi: number, yaw: number, pitch: number, radius: number, cx: number, cy: number) => project(rotatePoint(spherePoint(theta, phi), yaw, pitch), radius, cx, cy, 1.26);
    const drawDome = (radius: number, cx: number, cy: number, yaw: number, pitch: number) => {
      ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round";
      const halo = ctx.createRadialGradient(cx, cy - radius * 0.74, 0, cx, cy - radius * 0.22, radius * 1.2); halo.addColorStop(0, "rgba(111,210,255,0.10)"); halo.addColorStop(0.5, "rgba(60,168,236,0.035)"); halo.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = halo; ctx.beginPath(); ctx.ellipse(cx, cy - radius * 0.05, radius * 1.27, radius * 0.96, 0, Math.PI, Math.PI * 2); ctx.fill();
      for (let layer = 0; layer <= LAYERS; layer += 1) { const phi = PHI_MIN + (PHI_MAX - PHI_MIN) * (layer / LAYERS); const points: P3[] = []; for (let i = 0; i <= 220; i += 1) { const theta = -Math.PI + (2 * Math.PI * i) / 220; const point = domePoint(theta, phi, yaw, pitch, radius, cx, cy); if (point.z > -0.32) points.push(point); } ctx.strokeStyle = layer === 0 ? "rgba(229,250,255,0.62)" : GRID; ctx.lineWidth = layer === 0 ? 1.15 : 0.72; drawCurve(ctx, points); }
      for (let sector = 0; sector < SECTORS; sector += 2) { const theta = -Math.PI + (2 * Math.PI * sector) / SECTORS; const points: P3[] = []; for (let i = 0; i <= 100; i += 1) { const phi = PHI_MIN + (PHI_MAX - PHI_MIN) * (i / 100); const point = domePoint(theta, phi, yaw, pitch, radius, cx, cy); if (point.z > -0.32) points.push(point); } ctx.strokeStyle = sector % 10 === 0 ? "rgba(219,247,255,0.46)" : GRID_FAINT; ctx.lineWidth = sector % 10 === 0 ? 0.82 : 0.52; drawCurve(ctx, points); }
      ctx.strokeStyle = "rgba(194,235,255,0.34)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(cx, cy + radius * 0.01, radius * 1.26, radius * 0.27, 0, Math.PI, Math.PI * 2); ctx.stroke();
      const extensionBaseY = cy + radius * 0.01; ctx.strokeStyle = "rgba(189,231,255,0.12)"; ctx.lineWidth = 0.55; for (let i = -8; i <= 8; i += 1) { const x = cx + i * radius * 0.17; ctx.beginPath(); ctx.moveTo(x, extensionBaseY - radius * 0.02); ctx.bezierCurveTo(x * 0.98 + cx * 0.02, extensionBaseY + radius * 0.05, cx + i * radius * 0.25, height * 0.82, cx + i * radius * 0.42, height + 40); ctx.stroke(); }
      ctx.restore();
    };
    const draw = () => {
      const state = stateRef.current; if (!state.dragging) { state.yaw += state.velocityX; state.pitch += state.velocityY; state.velocityX *= 0.91; state.velocityY *= 0.91; if (Math.abs(state.velocityX) < 0.00002) state.velocityX = 0; if (Math.abs(state.velocityY) < 0.00002) state.velocityY = 0; } state.pitch = Math.max(-0.28, Math.min(0.28, state.pitch));
      const radius = Math.min(width * 0.69, height * 0.79) * state.zoom; const cx = width * 0.5; const cy = height * 0.84; ctx.clearRect(0, 0, width, height); drawSkyGlow(); drawDome(radius, cx, cy, state.yaw, state.pitch);
      const cells: Cell[] = [];
      for (const item of layoutRef.current) {
        if (layerFilter !== null && item.layer !== layerFilter) continue;
        if (sectorFilter !== null && item.sector !== sectorFilter) continue;
        const phi0 = PHI_MIN + (PHI_MAX - PHI_MIN) * ((item.layer - 1) / LAYERS); const phi1 = PHI_MIN + (PHI_MAX - PHI_MIN) * (item.layer / LAYERS); const theta0 = -Math.PI + (2 * Math.PI * (item.sector - 1)) / SECTORS; const theta1 = -Math.PI + (2 * Math.PI * item.sector) / SECTORS; const center3 = rotatePoint(spherePoint((theta0 + theta1) * 0.5, (phi0 + phi1) * 0.5), state.yaw, state.pitch); if (center3.z <= -0.02) continue;
        const corners = [spherePoint(theta0, phi0), spherePoint(theta1, phi0), spherePoint(theta1, phi1), spherePoint(theta0, phi1)].map((point) => project(rotatePoint(point, state.yaw, state.pitch), radius, cx, cy, 1.26)); const center = project(center3, radius, cx, cy, 1.26); if (center.x < -radius * 0.4 || center.x > width + radius * 0.4 || center.y < -radius || center.y > height + radius * 0.2) continue;
        cells.push({ parcel: item.parcel, layer: item.layer, sector: item.sector, center, points: corners, depth: center3.z, tier: normalizeTier(item.parcel.tier) });
      }
      cells.sort((a, b) => a.depth - b.depth); const visible = cells.slice(Math.max(0, cells.length - VISIBLE_CELLS)); hitRef.current = visible;
      for (const cell of visible) {
        const selected = cell.parcel.id === selectedRef.current; const statusOpacity = cell.parcel.status === "sold" ? 0.48 : cell.parcel.status === "reserved" ? 0.66 : 1;
        ctx.save(); ctx.globalAlpha = statusOpacity; ctx.beginPath(); cell.points.forEach((point, index) => { if (index === 0) ctx.moveTo(point.x, point.y); else ctx.lineTo(point.x, point.y); }); ctx.closePath(); ctx.fillStyle = selected ? SELECTED[cell.tier] : FILL[cell.tier]; ctx.fill(); ctx.lineWidth = selected ? 2.25 : 0.72; ctx.strokeStyle = selected ? GLOW[cell.tier] : "rgba(198,235,255,0.48)"; ctx.stroke();
        if (cell.parcel.status === "reserved") { ctx.setLineDash([3, 3]); ctx.strokeStyle = "rgba(255,225,139,0.56)"; ctx.lineWidth = 0.9; ctx.stroke(); ctx.setLineDash([]); }
        if (selected) { ctx.shadowColor = GLOW[cell.tier]; ctx.shadowBlur = 22; ctx.strokeStyle = GLOW[cell.tier]; ctx.lineWidth = 2.8; ctx.stroke(); ctx.shadowBlur = 0; const pulse = 1 + Math.sin(performance.now() / 260) * 0.16; const glow = ctx.createRadialGradient(cell.center.x, cell.center.y, 0, cell.center.x, cell.center.y, 18 * pulse); glow.addColorStop(0, "rgba(255,255,255,0.98)"); glow.addColorStop(0.12, GLOW[cell.tier]); glow.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cell.center.x, cell.center.y, 18 * pulse, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = "rgba(255,255,255,0.98)"; ctx.beginPath(); ctx.arc(cell.center.x, cell.center.y, 2.5, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    resize(); window.addEventListener("resize", resize); raf = requestAnimationFrame(draw);
    const onPointerDown = (event: globalThis.PointerEvent) => { const rect = canvas.getBoundingClientRect(); const state = stateRef.current; state.dragging = true; state.moved = false; state.lastX = event.clientX - rect.left; state.lastY = event.clientY - rect.top; state.velocityX = 0; state.velocityY = 0; canvas.setPointerCapture(event.pointerId); };
    const onPointerMove = (event: globalThis.PointerEvent) => { const state = stateRef.current; if (!state.dragging) return; const rect = canvas.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top; const dx = x - state.lastX; const dy = y - state.lastY; if (Math.abs(dx) + Math.abs(dy) > 2) state.moved = true; state.yaw += dx * 0.0065; state.pitch += dy * 0.004; state.velocityX = dx * 0.002; state.velocityY = dy * 0.0014; state.lastX = x; state.lastY = y; };
    const onPointerUp = (event: globalThis.PointerEvent) => { const state = stateRef.current; if (!state.dragging) return; state.dragging = false; if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); if (state.moved) return; const rect = canvas.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top; const hit = hitRef.current.slice().reverse().find((cell) => pointInPolygon(x, y, cell.points)); if (hit) onSelect(hit.parcel.id); };
    const onWheel = (event: globalThis.WheelEvent) => { event.preventDefault(); stateRef.current.zoom = Math.max(0.84, Math.min(1.18, stateRef.current.zoom + (event.deltaY > 0 ? -0.035 : 0.035))); };
    canvas.addEventListener("pointerdown", onPointerDown); canvas.addEventListener("pointermove", onPointerMove); canvas.addEventListener("pointerup", onPointerUp); canvas.addEventListener("pointercancel", onPointerUp); canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); canvas.removeEventListener("pointerdown", onPointerDown); canvas.removeEventListener("pointermove", onPointerMove); canvas.removeEventListener("pointerup", onPointerUp); canvas.removeEventListener("pointercancel", onPointerUp); canvas.removeEventListener("wheel", onWheel); };
  }, [layerFilter, sectorFilter, onSelect]);

  return <div className="relative h-[560px] w-full overflow-hidden rounded-2xl sm:h-[680px] lg:h-[760px]"><canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none select-none" aria-label="MySkyParcel gökyüzü parsel kubbesi" /><div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/45 to-transparent" /><div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-sky-100/10 to-transparent" /></div>;
}
