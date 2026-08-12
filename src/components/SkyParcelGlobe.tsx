import { useEffect, useMemo, useRef } from "react";
import type { Parcel, ParcelTier } from "@/types/parcel";

type Props = { parcels: Parcel[]; selectedId: string | null; onSelect: (id: string) => void };
type P3 = { x: number; y: number; z: number };
type Cell = { parcel: Parcel; sector: number; row: number; depth: number; center: P3; points: P3[]; tier: ParcelTier };
type LayoutCell = { parcel: Parcel; sector: number; row: number };
type DomeState = { yaw: number; pitch: number; zoom: number; dragging: boolean; moved: boolean; lastX: number; lastY: number; velocityX: number; velocityY: number };

const SECTORS = 100;
const ROWS = 10;
const VISIBLE_CELLS = 53;
const PHI_MIN = 0.05;
const PHI_MAX = Math.PI * 0.5;
const ROW_VISIBLE_COUNTS = [2, 3, 4, 5, 6, 6, 8, 8, 6, 5];
const GRID = "rgba(151,214,255,0.82)";
const FILL: Record<ParcelTier, string> = { digital: "rgba(53,145,240,0.16)", elite: "rgba(155,83,235,0.18)", premium: "rgba(240,171,45,0.22)" };
const SELECTED: Record<ParcelTier, string> = { digital: "rgba(55,157,255,0.86)", elite: "rgba(172,94,255,0.88)", premium: "rgba(255,191,48,0.92)" };
const GLOW: Record<ParcelTier, string> = { digital: "rgba(82,184,255,1)", elite: "rgba(193,108,255,1)", premium: "rgba(255,201,70,1)" };

function spherePoint(theta: number, phi: number): P3 { const s = Math.sin(phi); return { x: s * Math.cos(theta), y: Math.cos(phi), z: s * Math.sin(theta) }; }
function rotatePoint(p: P3, yaw: number, pitch: number): P3 { const cy = Math.cos(yaw), sy = Math.sin(yaw); const x = p.x * cy - p.z * sy; const z0 = p.x * sy + p.z * cy; const cp = Math.cos(pitch), sp = Math.sin(pitch); return { x, y: p.y * cp - z0 * sp, z: p.y * sp + z0 * cp }; }
function project(p: P3, radius: number, cx: number, cy: number): P3 { return { x: cx + p.x * radius, y: cy - p.y * radius, z: p.z }; }
function parseParcelCode(code: string) { const sectorMatch = code.match(/-S(\d{1,3})-/i); const parcelMatch = code.match(/-P(\d{1,2})$/i); return { sector: sectorMatch ? Math.max(1, Math.min(SECTORS, Number(sectorMatch[1]))) - 1 : null, row: parcelMatch ? Math.max(1, Math.min(ROWS, Number(parcelMatch[1]))) - 1 : null }; }
function normalizeTier(tier: unknown): ParcelTier { return tier === "elite" || tier === "premium" ? tier : "digital"; }
function buildLayout(parcels: Parcel[]): LayoutCell[] {
  const result: LayoutCell[] = [];
  const used = new Set<string>();
  const placedIds = new Set<string>();
  for (const parcel of parcels) {
    const parsed = parseParcelCode(String(parcel.parcel_number ?? ""));
    if (parsed.sector === null || parsed.row === null) continue;
    const key = `${parsed.row}:${parsed.sector}`;
    if (used.has(key)) continue;
    used.add(key); placedIds.add(parcel.id); result.push({ parcel, sector: parsed.sector, row: parsed.row });
  }
  let cursor = 0;
  for (const parcel of parcels) {
    if (placedIds.has(parcel.id)) continue;
    while (cursor < ROWS * SECTORS && used.has(`${Math.floor(cursor / SECTORS)}:${cursor % SECTORS}`)) cursor++;
    if (cursor >= ROWS * SECTORS) break;
    const row = Math.floor(cursor / SECTORS); const sector = cursor % SECTORS;
    used.add(`${row}:${sector}`); placedIds.add(parcel.id); result.push({ parcel, sector, row }); cursor++;
  }
  return result;
}
function pointInPolygon(x: number, y: number, points: P3[]) { let inside = false; for (let i = 0, j = points.length - 1; i < points.length; j = i++) { const current = points[i]; const previous = points[j]; if (!current || !previous) continue; const { x: xi, y: yi } = current; const { x: xj, y: yj } = previous; const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi; if (intersect) inside = !inside; } return inside; }
function angularDistance(a: number, b: number) { return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))); }
function selectVisibleCells(candidatesByRow: Cell[][], yaw: number): Cell[] {
  const result: Cell[] = []; const facingTheta = Math.PI / 2 + yaw;
  for (let row = 0; row < ROWS; row++) {
    const quota = ROW_VISIBLE_COUNTS[row] ?? 0; const rowCandidates = candidatesByRow[row] ?? [];
    if (!rowCandidates.length || !quota) continue;
    const halfSpan = Math.min(1.48, 0.78 + row * 0.078); const rowOffset = row % 2 === 0 ? -0.018 : 0.018;
    const remaining = rowCandidates.slice();
    for (let index = 0; index < quota; index++) {
      const t = quota === 1 ? 0.5 : index / (quota - 1); const target = facingTheta - halfSpan + t * halfSpan * 2 + rowOffset;
      let bestIndex = -1; let bestDistance = Infinity;
      for (let i = 0; i < remaining.length; i++) { const candidate = remaining[i]; if (!candidate) continue; const theta = -Math.PI + (2 * Math.PI * (candidate.sector + 0.5)) / SECTORS; const distance = angularDistance(theta, target); if (distance < bestDistance) { bestIndex = i; bestDistance = distance; } }
      if (bestIndex >= 0) { const best = remaining[bestIndex]; if (best) result.push(best); remaining.splice(bestIndex, 1); }
    }
  }
  return result.slice(0, VISIBLE_CELLS);
}

export function SkyParcelGlobe({ parcels, selectedId, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<DomeState>({ yaw: 0, pitch: 0.08, zoom: 1, dragging: false, moved: false, lastX: 0, lastY: 0, velocityX: 0, velocityY: 0 });
  const selectedRef = useRef(selectedId); const layoutRef = useRef<LayoutCell[]>([]); const hitRef = useRef<Cell[]>([]);
  const layout = useMemo(() => buildLayout(parcels), [parcels]);
  useEffect(() => { selectedRef.current = selectedId; }, [selectedId]); useEffect(() => { layoutRef.current = layout; }, [layout]);

  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext("2d"); if (!canvas || !ctx) return;
    let raf = 0; let width = 0; let height = 0; let dpr = 1;
    const resize = () => { const rect = canvas.getBoundingClientRect(); width = Math.max(320, rect.width); height = Math.max(380, rect.height); dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const drawHemisphere = (radius: number, cx: number, cy: number, yaw: number, pitch: number) => {
      const halo = ctx.createRadialGradient(cx, cy - radius * 0.62, radius * 0.04, cx, cy, radius * 1.08); halo.addColorStop(0, "rgba(46,139,255,0.045)"); halo.addColorStop(0.58, "rgba(29,104,198,0.028)"); halo.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = halo; ctx.beginPath(); ctx.ellipse(cx, cy, radius, radius * 0.98, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = GRID; ctx.lineWidth = 0.8;
      for (let row = 0; row <= ROWS; row++) { const phi = PHI_MIN + (PHI_MAX - PHI_MIN) * (row / ROWS); ctx.beginPath(); let started = false; for (let i = 0; i <= 180; i++) { const theta = -Math.PI + (2 * Math.PI * i) / 180; const p = rotatePoint(spherePoint(theta, phi), yaw, pitch); if (p.z < -0.03) { started = false; continue; } const q = project(p, radius, cx, cy); if (!started) { ctx.moveTo(q.x, q.y); started = true; } else ctx.lineTo(q.x, q.y); } ctx.stroke(); }
      for (let sector = 0; sector < SECTORS; sector += 5) { const theta = -Math.PI + (2 * Math.PI * sector) / SECTORS; ctx.beginPath(); let started = false; for (let i = 0; i <= 90; i++) { const phi = PHI_MIN + (PHI_MAX - PHI_MIN) * (i / 90); const p = rotatePoint(spherePoint(theta, phi), yaw, pitch); if (p.z < -0.03) { started = false; continue; } const q = project(p, radius, cx, cy); if (!started) { ctx.moveTo(q.x, q.y); started = true; } else ctx.lineTo(q.x, q.y); } ctx.stroke(); }
    };
    const draw = () => {
      const s = stateRef.current; if (!s.dragging) { s.yaw += s.velocityX; s.pitch += s.velocityY; s.velocityX *= 0.90; s.velocityY *= 0.90; if (Math.abs(s.velocityX) < 0.00002) s.velocityX = 0; if (Math.abs(s.velocityY) < 0.00002) s.velocityY = 0; } s.pitch = Math.max(-0.42, Math.min(0.42, s.pitch));
      const radius = Math.min(width * 0.48, height * 0.46) * s.zoom; const cx = width * 0.50; const cy = Math.min(height - radius - 18, radius + 14); ctx.clearRect(0, 0, width, height); drawHemisphere(radius, cx, cy, s.yaw, s.pitch);
      const candidatesByRow: Cell[][] = Array.from({ length: ROWS }, () => []);
      for (const item of layoutRef.current) {
        const theta0 = -Math.PI + (2 * Math.PI * item.sector) / SECTORS; const theta1 = -Math.PI + (2 * Math.PI * (item.sector + 1)) / SECTORS;
        const phi0 = PHI_MIN + (PHI_MAX - PHI_MIN) * (item.row / ROWS); const phi1 = PHI_MIN + (PHI_MAX - PHI_MIN) * ((item.row + 1) / ROWS);
        const center3 = rotatePoint(spherePoint((theta0 + theta1) / 2, (phi0 + phi1) / 2), s.yaw, s.pitch); if (center3.z <= 0.015) continue;
        const corners = [spherePoint(theta0, phi0), spherePoint(theta1, phi0), spherePoint(theta1, phi1), spherePoint(theta0, phi1)].map((p) => project(rotatePoint(p, s.yaw, s.pitch), radius, cx, cy));
        const center = project(center3, radius, cx, cy); if (center.x < -radius || center.x > width + radius || center.y < -radius || center.y > height + radius) continue;
        const row = candidatesByRow[item.row]; if (row) row.push({ parcel: item.parcel, sector: item.sector, row: item.row, depth: center3.z, center, points: corners, tier: normalizeTier(item.parcel.tier) });
      }
      const visible = selectVisibleCells(candidatesByRow, s.yaw).sort((a, b) => a.depth - b.depth); hitRef.current = visible;
      for (const cell of visible) { const selected = cell.parcel.id === selectedRef.current; ctx.beginPath(); cell.points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)); ctx.closePath(); ctx.fillStyle = selected ? SELECTED[cell.tier] : FILL[cell.tier]; ctx.fill(); ctx.lineWidth = selected ? 2.2 : 1.15; ctx.strokeStyle = selected ? GLOW[cell.tier] : "rgba(170,220,255,0.90)"; ctx.stroke(); if (selected) { ctx.save(); ctx.shadowColor = GLOW[cell.tier]; ctx.shadowBlur = 20; ctx.strokeStyle = GLOW[cell.tier]; ctx.lineWidth = 2.5; ctx.stroke(); const sx = cell.center.x, sy = cell.center.y; ctx.fillStyle = "#fff4bf"; ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const r = i % 2 === 0 ? 7 : 3; const x = sx + Math.cos(a) * r; const y = sy + Math.sin(a) * r; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.closePath(); ctx.fill(); ctx.restore(); const label = String(cell.parcel.parcel_number ?? ""); ctx.save(); ctx.font = "600 11px Inter, sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.95)"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(label, cell.center.x, cell.center.y + 20); ctx.restore(); } }
      raf = requestAnimationFrame(draw);
    };
    resize(); window.addEventListener("resize", resize); raf = requestAnimationFrame(draw);
    const onPointerDown = (event: globalThis.PointerEvent) => { const rect = canvas.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top; const s = stateRef.current; s.dragging = true; s.moved = false; s.lastX = x; s.lastY = y; s.velocityX = 0; s.velocityY = 0; canvas.setPointerCapture(event.pointerId); };
    const onPointerMove = (event: globalThis.PointerEvent) => { const s = stateRef.current; if (!s.dragging) return; const rect = canvas.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top; const dx = x - s.lastX; const dy = y - s.lastY; if (Math.abs(dx) + Math.abs(dy) > 2) s.moved = true; s.yaw += dx * 0.008; s.pitch += dy * 0.006; s.velocityX = dx * 0.0025; s.velocityY = dy * 0.002; s.lastX = x; s.lastY = y; };
    const onPointerUp = (event: globalThis.PointerEvent) => { const s = stateRef.current; if (!s.dragging) return; s.dragging = false; if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId); if (s.moved) return; const rect = canvas.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top; const hit = hitRef.current.slice().reverse().find((cell) => pointInPolygon(x, y, cell.points)); if (hit) onSelect(hit.parcel.id); };
    const onWheel = (event: globalThis.WheelEvent) => { event.preventDefault(); stateRef.current.zoom = Math.max(0.82, Math.min(1.22, stateRef.current.zoom + (event.deltaY > 0 ? -0.04 : 0.04))); };
    canvas.addEventListener("pointerdown", onPointerDown); canvas.addEventListener("pointermove", onPointerMove); canvas.addEventListener("pointerup", onPointerUp); canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); canvas.removeEventListener("pointerdown", onPointerDown); canvas.removeEventListener("pointermove", onPointerMove); canvas.removeEventListener("pointerup", onPointerUp); canvas.removeEventListener("wheel", onWheel); };
  }, [onSelect]);
  return <canvas ref={canvasRef} aria-label="Gökyüzü parsel haritası" role="img" className="h-full w-full touch-none" />;
}
