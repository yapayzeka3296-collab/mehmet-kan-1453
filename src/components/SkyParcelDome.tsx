import { useEffect, useMemo, useRef } from "react";
import type { Parcel, ParcelTier } from "@/types/parcel";

type Props = { parcels: Parcel[]; selectedId: string | null; onSelect: (id: string) => void; layerFilter?: number | null; sectorFilter?: number | null };
type Point = { x: number; y: number };
type Cell = { parcel: Parcel; layer: number; sector: number; points: Point[]; center: Point };
type MapState = { centerSector: number; zoom: number; dragging: boolean; moved: boolean; lastX: number };

const SECTORS = 100, LAYERS = 10;
const TIER_FILL: Record<ParcelTier, string> = { digital: "rgba(66,190,255,.12)", elite: "rgba(184,116,255,.15)", premium: "rgba(255,207,82,.16)" };
const TIER_STROKE: Record<ParcelTier, string> = { digital: "rgba(116,220,255,.55)", elite: "rgba(211,158,255,.62)", premium: "rgba(255,222,124,.68)" };
const TIER_GLOW: Record<ParcelTier, string> = { digital: "rgba(107,218,255,.98)", elite: "rgba(213,147,255,.98)", premium: "rgba(255,220,104,1)" };

function normalizeTier(tier: unknown): ParcelTier { return tier === "elite" || tier === "premium" ? tier : "digital"; }
function parseHierarchy(parcel: Parcel) {
  const code = String(parcel.parcel_number ?? "");
  const s = parcel.sector_number ?? (code.match(/-S(\d{1,3})-/i)?.[1] ? Number(code.match(/-S(\d{1,3})-/i)![1]) : null);
  const l = parcel.layer_number ?? (code.match(/-K(\d{1,3})-/i)?.[1] ? Number(code.match(/-K(\d{1,3})-/i)![1]) : null);
  return { sector: s == null ? null : Math.max(1, Math.min(SECTORS, Number(s))), layer: l == null ? null : Math.max(1, Math.min(LAYERS, Number(l))) };
}
function buildLayout(parcels: Parcel[]) {
  const result: { parcel: Parcel; layer: number; sector: number }[] = [], used = new Set<string>(), placed = new Set<string>();
  for (const parcel of parcels) { const h = parseHierarchy(parcel); if (h.layer == null || h.sector == null) continue; const key = `${h.layer}:${h.sector}`; if (used.has(key)) continue; used.add(key); placed.add(parcel.id); result.push({ parcel, layer: h.layer, sector: h.sector }); }
  let cursor = 0;
  for (const parcel of parcels) { if (placed.has(parcel.id)) continue; while (cursor < SECTORS * LAYERS && used.has(`${Math.floor(cursor / SECTORS) + 1}:${cursor % SECTORS + 1}`)) cursor++; if (cursor >= SECTORS * LAYERS) break; const layer = Math.floor(cursor / SECTORS) + 1, sector = cursor % SECTORS + 1; used.add(`${layer}:${sector}`); placed.add(parcel.id); result.push({ parcel, layer, sector }); cursor++; }
  return result;
}
function polygonContains(x: number, y: number, points: Point[]) { let inside = false; for (let i = 0, j = points.length - 1; i < points.length; j = i++) { const a = points[i], b = points[j]; const hit = a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x; if (hit) inside = !inside; } return inside; }

export function SkyParcelDome({ parcels, selectedId, onSelect, layerFilter = null, sectorFilter = null }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null), selectedRef = useRef(selectedId), layoutRef = useRef<{ parcel: Parcel; layer: number; sector: number }[]>([]), hitRef = useRef<Cell[]>([]);
  const stateRef = useRef<MapState>({ centerSector: 50, zoom: 1, dragging: false, moved: false, lastX: 0 });
  const layout = useMemo(() => buildLayout(parcels), [parcels]);
  useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);
  useEffect(() => { layoutRef.current = layout; }, [layout]);

  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas?.getContext("2d"); if (!canvas || !ctx) return;
    let raf = 0, width = 0, height = 0, dpr = 1;
    const stars = Array.from({ length: 125 }, (_, i) => ({ x: ((i * 83) % 997) / 997, y: ((i * 47 + 19) % 701) / 701, r: i % 11 === 0 ? 1.7 : i % 4 === 0 ? 1 : .55, a: .16 + (i % 7) * .055 }));
    const resize = () => { const r = canvas.getBoundingClientRect(); width = Math.max(320, r.width); height = Math.max(440, r.height); dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const clampState = () => { const s = stateRef.current; s.zoom = Math.max(.85, Math.min(3.2, s.zoom)); const visible = Math.max(7, Math.min(34, 28 / s.zoom)); const half = visible / 2; s.centerSector = Math.max(1 + half, Math.min(SECTORS - half, s.centerSector)); };
    const draw = () => {
      const s = stateRef.current; clampState(); ctx.clearRect(0, 0, width, height);
      const bg = ctx.createLinearGradient(0, 0, 0, height); bg.addColorStop(0, "#061a32"); bg.addColorStop(.46, "#07304b"); bg.addColorStop(1, "#020b18"); ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
      const haze = ctx.createRadialGradient(width * .5, height * .3, 0, width * .5, height * .38, width * .78); haze.addColorStop(0, "rgba(86,204,255,.16)"); haze.addColorStop(.45, "rgba(44,125,191,.055)"); haze.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = haze; ctx.fillRect(0, 0, width, height * .8);
      for (const star of stars) { ctx.globalAlpha = star.a; ctx.fillStyle = "#dff7ff"; ctx.beginPath(); ctx.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1;

      const mapL = width * .055, mapR = width * .945, mapT = height * .23, mapB = height * .82, mapW = mapR - mapL, mapH = mapB - mapT;
      const visibleSectors = Math.max(7, Math.min(34, 28 / s.zoom)), sectorSpan = visibleSectors / SECTORS;
      const leftSector = s.centerSector - visibleSectors / 2, cellW = mapW / visibleSectors, rowH = mapH / LAYERS;
      const cells: Cell[] = [];
      ctx.save();
      ctx.beginPath(); ctx.roundRect(mapL - 4, mapT - 8, mapW + 8, mapH + 18, 28); ctx.clip();
      const horizon = mapT + mapH * .03;
      ctx.fillStyle = "rgba(3,20,36,.54)"; ctx.fillRect(mapL - 20, mapT - 20, mapW + 40, mapH + 50);

      for (let layer = 1; layer <= LAYERS; layer++) {
        const t0 = (layer - 1) / LAYERS, t1 = layer / LAYERS;
        const y0 = mapT + t0 * mapH, y1 = mapT + t1 * mapH;
        const inset0 = Math.pow(t0, 1.55) * mapW * .13, inset1 = Math.pow(t1, 1.55) * mapW * .13;
        const curve0 = Math.sin(t0 * Math.PI) * mapH * .025, curve1 = Math.sin(t1 * Math.PI) * mapH * .025;
        for (let sector = Math.floor(leftSector) - 1; sector <= Math.ceil(leftSector + visibleSectors) + 1; sector++) {
          if (sector < 1 || sector > SECTORS) continue;
          const x0 = mapL + (sector - leftSector) * cellW, x1 = x0 + cellW;
          const p0 = { x: x0 + inset0, y: y0 + curve0 }, p1 = { x: x1 + inset0, y: y0 + curve0 }, p2 = { x: x1 + inset1, y: y1 + curve1 }, p3 = { x: x0 + inset1, y: y1 + curve1 };
          const item = layoutRef.current.find(v => v.layer === layer && v.sector === sector);
          if (!item) continue;
          if (layerFilter !== null && layer !== layerFilter) continue;
          if (sectorFilter !== null && sector !== sectorFilter) continue;
          const center = { x: (p0.x + p1.x + p2.x + p3.x) / 4, y: (p0.y + p1.y + p2.y + p3.y) / 4 };
          cells.push({ parcel: item.parcel, layer, sector, points: [p0, p1, p2, p3], center });
        }
      }
      cells.sort((a, b) => a.layer - b.layer);
      hitRef.current = cells;
      for (const cell of cells) {
        const tier = normalizeTier(cell.parcel.tier), selected = cell.parcel.id === selectedRef.current, statusAlpha = cell.parcel.status === "sold" ? .34 : cell.parcel.status === "reserved" ? .56 : .92;
        ctx.save(); ctx.globalAlpha = statusAlpha; ctx.beginPath(); cell.points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); ctx.fillStyle = TIER_FILL[tier]; ctx.fill();
        ctx.strokeStyle = selected ? TIER_GLOW[tier] : TIER_STROKE[tier]; ctx.lineWidth = selected ? 2.6 : .55; ctx.stroke();
        if (cell.parcel.status === "reserved") { ctx.setLineDash([4, 3]); ctx.strokeStyle = "rgba(255,227,145,.78)"; ctx.lineWidth = .8; ctx.stroke(); ctx.setLineDash([]); }
        if (selected) { ctx.shadowColor = TIER_GLOW[tier]; ctx.shadowBlur = 22; ctx.strokeStyle = TIER_GLOW[tier]; ctx.lineWidth = 2.8; ctx.stroke(); ctx.shadowBlur = 0; ctx.globalAlpha = .22; ctx.fillStyle = TIER_GLOW[tier]; ctx.fill(); }
        ctx.restore();
      }
      ctx.restore();

      // Horizon and perspective guides: they make the map feel like a sky plane, not a table.
      ctx.save(); ctx.strokeStyle = "rgba(163,228,255,.23)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(mapL, mapT + mapH * .02); ctx.quadraticCurveTo(width * .5, mapT - mapH * .035, mapR, mapT + mapH * .02); ctx.stroke();
      for (let i = 0; i <= 8; i++) { const x = mapL + i * mapW / 8; ctx.strokeStyle = "rgba(173,230,255,.08)"; ctx.lineWidth = .6; ctx.beginPath(); ctx.moveTo(width * .5 + (x - width * .5) * .45, mapT - 2); ctx.lineTo(x, mapB + 18); ctx.stroke(); }
      ctx.strokeStyle = "rgba(164,224,255,.14)"; ctx.beginPath(); ctx.ellipse(width * .5, mapB + 5, mapW * .48, 18, 0, Math.PI, Math.PI * 2); ctx.stroke(); ctx.restore();

      ctx.fillStyle = "rgba(220,247,255,.78)"; ctx.font = "600 11px sans-serif"; ctx.textAlign = "center";
      const firstLabel = Math.max(1, Math.floor(leftSector / 5) * 5); for (let sector = firstLabel; sector <= leftSector + visibleSectors + 2; sector += 5) { if (sector < 1 || sector > 100) continue; const x = mapL + (sector - leftSector + .5) * cellW; ctx.fillText(`S${String(sector).padStart(2, "0")}`, x, mapB + 25); }
      ctx.font = "600 10px sans-serif"; ctx.textAlign = "left"; for (let layer = 1; layer <= LAYERS; layer++) { const y = mapT + (layer - .5) * rowH + 3; ctx.fillStyle = "rgba(196,238,255,.36)"; ctx.fillText(`K${String(layer).padStart(2, "0")}`, mapL - 2, y); }
      ctx.textAlign = "center"; ctx.fillStyle = "rgba(207,241,255,.5)"; ctx.font = "600 12px sans-serif"; ctx.fillText(`${Math.round(visibleSectors)} sektör görünümü · sürükle`, width * .5, mapB + 48);
      ctx.globalAlpha = 1; raf = requestAnimationFrame(draw);
    };

    const down = (e: PointerEvent) => { const s = stateRef.current; s.dragging = true; s.moved = false; s.lastX = e.clientX; canvas.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => { const s = stateRef.current; if (!s.dragging) return; const dx = e.clientX - s.lastX; if (Math.abs(dx) > 2) s.moved = true; const visible = Math.max(7, Math.min(34, 28 / s.zoom)); s.centerSector -= dx / Math.max(1, width) * visible; s.lastX = e.clientX; };
    const up = (e: PointerEvent) => { const s = stateRef.current; s.dragging = false; if (!s.moved) { const rect = canvas.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top, mapL = width * .055, mapR = width * .945, mapT = height * .23, mapB = height * .82, mapW = mapR - mapL, mapH = mapB - mapT, visible = Math.max(7, Math.min(34, 28 / s.zoom)), left = s.centerSector - visible / 2; if (x >= mapL && x <= mapR && y >= mapT && y <= mapB) { const sector = Math.floor(left + ((x - mapL) / mapW) * visible) + 1, layer = Math.floor(((y - mapT) / mapH) * LAYERS) + 1, target = hitRef.current.find(c => c.sector === sector && c.layer === layer && polygonContains(x, y, c.points)); if (target) onSelect(target.parcel.id); } } if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId); };
    const cancel = (e: PointerEvent) => { const s = stateRef.current; s.dragging = false; s.moved = true; if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId); };
    const wheel = (e: WheelEvent) => { e.preventDefault(); stateRef.current.zoom *= e.deltaY > 0 ? .9 : 1.1; };
    resize(); window.addEventListener("resize", resize); canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", cancel); canvas.addEventListener("wheel", wheel, { passive: false }); raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerup", up); canvas.removeEventListener("pointercancel", cancel); canvas.removeEventListener("wheel", wheel); };
  }, [layerFilter, sectorFilter, onSelect]);

  return <canvas ref={canvasRef} aria-label="MySkyParcel 2.5D panoramik gökyüzü parsel haritası" className="absolute inset-0 h-full w-full touch-none select-none" />;
}
