import { useEffect, useMemo, useRef } from "react";
import type { Parcel, ParcelTier } from "@/types/parcel";

type Props = { parcels: Parcel[]; selectedId: string | null; onSelect: (id: string) => void; layerFilter?: number | null; sectorFilter?: number | null };
type MapCell = { parcel: Parcel; layer: number; sector: number; x: number; y: number; w: number; h: number };
type MapState = { offsetX: number; zoom: number; dragging: boolean; moved: boolean; lastX: number };

const SECTORS = 100, LAYERS = 10;
const TIER_FILL: Record<ParcelTier, string> = { digital: "rgba(63,184,255,.12)", elite: "rgba(184,112,255,.16)", premium: "rgba(255,207,82,.18)" };
const TIER_STROKE: Record<ParcelTier, string> = { digital: "rgba(111,211,255,.48)", elite: "rgba(207,151,255,.58)", premium: "rgba(255,221,118,.65)" };
const TIER_GLOW: Record<ParcelTier, string> = { digital: "rgba(100,211,255,.95)", elite: "rgba(207,145,255,.98)", premium: "rgba(255,218,105,.98)" };

function normalizeTier(tier: unknown): ParcelTier { return tier === "elite" || tier === "premium" ? tier : "digital"; }
function parseHierarchy(parcel: Parcel) {
  const code = String(parcel.parcel_number ?? "");
  const sectorMatch = code.match(/-S(\d{1,3})-/i), layerMatch = code.match(/-K(\d{1,3})-/i);
  const sector = parcel.sector_number ?? (sectorMatch ? Number(sectorMatch[1]) : null);
  const layer = parcel.layer_number ?? (layerMatch ? Number(layerMatch[1]) : null);
  return { sector: sector == null ? null : Math.max(1, Math.min(SECTORS, Number(sector))), layer: layer == null ? null : Math.max(1, Math.min(LAYERS, Number(layer))) };
}
function buildLayout(parcels: Parcel[]) {
  const result: { parcel: Parcel; layer: number; sector: number }[] = [], used = new Set<string>(), placed = new Set<string>();
  for (const parcel of parcels) {
    const h = parseHierarchy(parcel); if (h.layer == null || h.sector == null) continue;
    const key = `${h.layer}:${h.sector}`; if (used.has(key)) continue;
    used.add(key); placed.add(parcel.id); result.push({ parcel, layer: h.layer, sector: h.sector });
  }
  let cursor = 0;
  for (const parcel of parcels) {
    if (placed.has(parcel.id)) continue;
    while (cursor < LAYERS * SECTORS && used.has(`${Math.floor(cursor / SECTORS) + 1}:${cursor % SECTORS + 1}`)) cursor++;
    if (cursor >= LAYERS * SECTORS) break;
    const layer = Math.floor(cursor / SECTORS) + 1, sector = cursor % SECTORS + 1;
    used.add(`${layer}:${sector}`); placed.add(parcel.id); result.push({ parcel, layer, sector }); cursor++;
  }
  return result;
}

export function SkyParcelDome({ parcels, selectedId, onSelect, layerFilter = null, sectorFilter = null }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedRef = useRef(selectedId);
  const layoutRef = useRef<{ parcel: Parcel; layer: number; sector: number }[]>([]);
  const hitRef = useRef<MapCell[]>([]);
  const stateRef = useRef<MapState>({ offsetX: 0, zoom: 1, dragging: false, moved: false, lastX: 0 });
  const layout = useMemo(() => buildLayout(parcels), [parcels]);
  useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);
  useEffect(() => { layoutRef.current = layout; }, [layout]);

  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0, width = 0, height = 0, dpr = 1;
    const resize = () => {
      const r = canvas.getBoundingClientRect(); width = Math.max(320, r.width); height = Math.max(440, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const stars = Array.from({ length: 110 }, (_, i) => ({ x: ((i * 83) % 997) / 997, y: ((i * 47 + 13) % 701) / 701, r: i % 7 === 0 ? 1.5 : .7, a: .18 + (i % 6) * .06 }));
    const draw = () => {
      const s = stateRef.current;
      s.zoom = Math.max(.75, Math.min(2.8, s.zoom));
      ctx.clearRect(0, 0, width, height);
      const bg = ctx.createLinearGradient(0, 0, 0, height); bg.addColorStop(0, "#04172d"); bg.addColorStop(.48, "#062844"); bg.addColorStop(1, "#020b19"); ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);
      const mist = ctx.createRadialGradient(width * .5, height * .28, 0, width * .5, height * .28, width * .7); mist.addColorStop(0, "rgba(70,190,255,.14)"); mist.addColorStop(.5, "rgba(46,111,186,.055)"); mist.addColorStop(1, "rgba(0,0,0,0)"); ctx.fillStyle = mist; ctx.fillRect(0, 0, width, height * .72);
      for (const star of stars) { ctx.globalAlpha = star.a; ctx.fillStyle = "#dff7ff"; ctx.beginPath(); ctx.arc(star.x * width, star.y * height, star.r, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
      const left = width * .08, top = height * .25, mapW = width * .84, mapH = height * .62, cellW = mapW / SECTORS, cellH = mapH / LAYERS;
      const offset = s.offsetX * mapW * s.zoom;
      ctx.save(); ctx.translate(width / 2, 0); ctx.scale(s.zoom, 1); ctx.translate(-width / 2 + offset, 0);
      ctx.fillStyle = "rgba(4,24,43,.74)"; ctx.strokeStyle = "rgba(142,220,255,.22)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(left, top, mapW, mapH, 24); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.roundRect(left, top, mapW, mapH, 24); ctx.clip();
      for (let i = 0; i <= SECTORS; i++) { ctx.strokeStyle = i % 10 === 0 ? "rgba(173,232,255,.28)" : "rgba(148,214,247,.065)"; ctx.lineWidth = i % 10 === 0 ? .8 : .35; const x = left + i * cellW; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top + mapH); ctx.stroke(); }
      for (let i = 0; i <= LAYERS; i++) { ctx.strokeStyle = "rgba(173,232,255,.14)"; ctx.lineWidth = .55; const y = top + i * cellH; ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(left + mapW, y); ctx.stroke(); }
      const cells: MapCell[] = [];
      for (const item of layoutRef.current) {
        if (layerFilter !== null && item.layer !== layerFilter) continue;
        if (sectorFilter !== null && item.sector !== sectorFilter) continue;
        const x = left + (item.sector - 1) * cellW, y = top + (item.layer - 1) * cellH;
        cells.push({ parcel: item.parcel, layer: item.layer, sector: item.sector, x, y, w: cellW, h: cellH });
      }
      hitRef.current = cells;
      for (const cell of cells) {
        const tier = normalizeTier(cell.parcel.tier), selected = cell.parcel.id === selectedRef.current;
        const statusAlpha = cell.parcel.status === "sold" ? .32 : cell.parcel.status === "reserved" ? .52 : .9;
        ctx.globalAlpha = statusAlpha;
        ctx.fillStyle = TIER_FILL[tier]; ctx.fillRect(cell.x + .6, cell.y + .6, Math.max(1, cell.w - 1.2), Math.max(1, cell.h - 1.2));
        ctx.strokeStyle = selected ? TIER_GLOW[tier] : TIER_STROKE[tier]; ctx.lineWidth = selected ? 2.2 : .45; ctx.strokeRect(cell.x + .6, cell.y + .6, Math.max(1, cell.w - 1.2), Math.max(1, cell.h - 1.2));
        if (cell.parcel.status === "reserved") { ctx.setLineDash([2, 2]); ctx.strokeStyle = "rgba(255,220,128,.7)"; ctx.lineWidth = .65; ctx.strokeRect(cell.x + 1, cell.y + 1, Math.max(1, cell.w - 2), Math.max(1, cell.h - 2)); ctx.setLineDash([]); }
        if (selected) { ctx.globalAlpha = .85; ctx.shadowColor = TIER_GLOW[tier]; ctx.shadowBlur = 18; ctx.strokeStyle = TIER_GLOW[tier]; ctx.lineWidth = 2.5; ctx.strokeRect(cell.x + .8, cell.y + .8, Math.max(1, cell.w - 1.6), Math.max(1, cell.h - 1.6)); ctx.shadowBlur = 0; }
      }
      ctx.restore();
      ctx.fillStyle = "rgba(173,230,255,.18)"; ctx.font = "10px sans-serif"; ctx.textAlign = "center";
      for (let i = 0; i < 10; i++) ctx.fillText(`S${String(i * 10 + 1).padStart(2, "0")}`, left + (i * 10 + 5) * cellW, top + mapH + 18);
      ctx.restore();
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    const down = (e: PointerEvent) => { const s = stateRef.current; s.dragging = true; s.moved = false; s.lastX = e.clientX; canvas.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => { const s = stateRef.current; if (!s.dragging) return; const dx = e.clientX - s.lastX; if (Math.abs(dx) > 2) s.moved = true; s.offsetX += dx / Math.max(1, width * s.zoom); s.lastX = e.clientX; };
    const up = (e: PointerEvent) => { const s = stateRef.current; s.dragging = false; if (!s.moved) { const rect = canvas.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top; const scaleX = s.zoom, mapLeft = width * .08, mapTop = height * .25, mapW = width * .84, mapH = height * .62; const localX = (x - width / 2) / scaleX + width / 2 - s.offsetX * mapW * s.zoom, localY = y; const sector = Math.floor(((localX - mapLeft) / mapW) * SECTORS) + 1, layer = Math.floor(((localY - mapTop) / mapH) * LAYERS) + 1; const target = hitRef.current.find(c => c.sector === sector && c.layer === layer); if (target) onSelect(target.parcel.id); } if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId); };
    const cancel = (e: PointerEvent) => { const s = stateRef.current; s.dragging = false; s.moved = true; if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId); };
    const wheel = (e: WheelEvent) => { e.preventDefault(); stateRef.current.zoom *= e.deltaY > 0 ? .92 : 1.09; };
    resize(); window.addEventListener("resize", resize); canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", cancel); canvas.addEventListener("wheel", wheel, { passive: false }); raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerup", up); canvas.removeEventListener("pointercancel", cancel); canvas.removeEventListener("wheel", wheel); };
  }, [layerFilter, sectorFilter, onSelect]);
  return <canvas ref={canvasRef} aria-label="MySkyParcel panoramik gökyüzü parsel haritası" className="absolute inset-0 h-full w-full touch-none select-none" />;
}
