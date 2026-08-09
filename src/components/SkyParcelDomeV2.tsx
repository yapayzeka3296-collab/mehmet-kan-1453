import { useEffect, useRef } from "react";
import type { MouseEvent, PointerEvent, WheelEvent } from "react";
import type { Parcel } from "@/types/parcel";

type Props = { parcels: Parcel[]; selectedId: string | null; onSelect: (id: string) => void };
type P3 = { x: number; y: number; z: number };
type Hit = { parcel: Parcel; points: { x: number; y: number }[]; center: { x: number; y: number; z: number }; depth: number; sector: number };
type State = { yaw: number; pitch: number; zoom: number; dragging: boolean; moved: boolean; lastX: number; lastY: number; vx: number; vy: number };

const GOLD = "#e8ad3f";
const TIER = { digital: "#4da3ff", elite: "#b68cff", premium: "#e8ad3f" } as const;

function rotate(p: P3, yaw: number, pitch: number): P3 {
  const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  const x = p.x * cy - p.z * sy;
  const z = p.x * sy + p.z * cy;
  return { x, y: p.y * cp - z * sp, z: p.y * sp + z * cp };
}
function point(lon: number, elevation: number): P3 {
  const a = lon * Math.PI / 180, e = elevation * Math.PI / 180, c = Math.cos(e);
  return { x: c * Math.sin(a), y: Math.sin(e), z: c * Math.cos(a) };
}
function grid(parcel: Parcel) {
  const p = parcel as Parcel & { grid_x?: number; grid_y?: number };
  const n = Number(parcel.parcel_number.split("-").pop() || 1) - 1;
  return { col: Math.max(0, Math.min(39, Number.isFinite(p.grid_x) ? Number(p.grid_x) : n % 40)), row: Math.max(0, Math.min(24, Number.isFinite(p.grid_y) ? Number(p.grid_y) : Math.floor(n / 40))) };
}
function sector(parcel: Parcel) { return Math.max(1, Math.min(100, Math.ceil(Number(parcel.parcel_number.split("-").pop() || 1) / 10))); }
function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? r * .38 : r; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
  ctx.closePath(); ctx.fill();
}

export function SkyParcelDomeV2({ parcels, selectedId, onSelect }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedRef = useRef(selectedId);
  const parcelsRef = useRef(parcels);
  const hitsRef = useRef<Hit[]>([]);
  const state = useRef<State>({ yaw: -.34, pitch: .08, zoom: 1, dragging: false, moved: false, lastX: 0, lastY: 0, vx: 0, vy: 0 });
  useEffect(() => { selectedRef.current = selectedId; parcelsRef.current = parcels; }, [selectedId, parcels]);

  useEffect(() => {
    const canvas = canvasRef.current; const ctx = canvas?.getContext("2d"); if (!canvas || !ctx) return;
    let raf = 0, w = 0, h = 0, dpr = 1;
    const resize = () => { const r = canvas.getBoundingClientRect(); dpr = Math.min(devicePixelRatio || 1, 2); w = Math.max(320, r.width); h = Math.max(430, r.height); canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    const project = (p: P3, radius: number, cx: number, cy: number) => ({ x: cx + p.x * radius, y: cy - p.y * radius, z: p.z });
    const draw = () => {
      const s = state.current; if (!s.dragging) { s.yaw += s.vx; s.pitch += s.vy; s.vx *= .94; s.vy *= .94; }
      s.pitch = Math.max(-.12, Math.min(.34, s.pitch));
      const radius = Math.min(w * .42, h * .40) * s.zoom, cx = w / 2, baseY = h * .47;
      ctx.clearRect(0, 0, w, h);

      const halo = ctx.createRadialGradient(cx, baseY - radius * .8, radius * .05, cx, baseY - radius * .35, radius * 1.35);
      halo.addColorStop(0, "rgba(48,143,255,.10)"); halo.addColorStop(.58, "rgba(48,143,255,.07)"); halo.addColorStop(.84, "rgba(232,173,63,.03)"); halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, baseY, radius * 1.34, Math.PI, Math.PI * 2); ctx.fill();

      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, baseY + 1); ctx.clip();
      const fill = ctx.createLinearGradient(cx, baseY - radius, cx, baseY);
      fill.addColorStop(0, "rgba(33,116,208,.15)"); fill.addColorStop(.45, "rgba(12,72,140,.10)"); fill.addColorStop(.78, "rgba(6,43,89,.05)"); fill.addColorStop(1, "rgba(3,24,54,0)");
      ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(cx, baseY, radius, Math.PI, Math.PI * 2); ctx.fill();

      for (let e = 12; e <= 84; e += 12) {
        ctx.beginPath(); for (let lon = -90; lon <= 90; lon += 3) { const p = rotate(point(lon, e), s.yaw, s.pitch); if (p.z < -.03) continue; const q = project(p, radius, cx, baseY); lon === -90 ? ctx.moveTo(q.x, q.y) : ctx.lineTo(q.x, q.y); }
        ctx.lineWidth = .7; ctx.strokeStyle = `rgba(120,190,255,${(.10 + Math.min(1, e / 52) * .22).toFixed(3)})`; ctx.stroke();
      }
      for (let lon = -90; lon <= 90; lon += 12) {
        ctx.beginPath(); let started = false; for (let e = 0; e <= 90; e += 3) { const p = rotate(point(lon, e), s.yaw, s.pitch); if (p.z < -.03) { started = false; continue; } const q = project(p, radius, cx, baseY); started ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); started = true; }
        ctx.lineWidth = .7; ctx.strokeStyle = "rgba(120,190,255,.20)"; ctx.stroke();
      }

      const all: Hit[] = [];
      for (const parcel of parcelsRef.current) {
        const { col, row } = grid(parcel), lon0 = -84 + col * 4.2, lon1 = lon0 + 4.2, e0 = row * 3.5, e1 = e0 + 3.5;
        const raw = [point(lon0, e0), point(lon1, e0), point(lon1, e1), point(lon0, e1)].map(p => rotate(p, s.yaw, s.pitch));
        const c = rotate(point((lon0 + lon1) / 2, (e0 + e1) / 2), s.yaw, s.pitch);
        if (c.z < .05 || c.y < .01) continue;
        const q = project(c, radius, cx, baseY);
        all.push({ parcel, depth: c.z, center: q, points: raw.map(p => project(p, radius, cx, baseY)), sector: sector(parcel) });
      }
      all.sort((a, b) => b.depth - a.depth);
      const visible = all.slice(0, 60); hitsRef.current = visible;

      for (const item of visible) {
        const selected = item.parcel.id === selectedRef.current, color = TIER[item.parcel.tier] || TIER.digital, alpha = .045 + Math.max(.15, item.depth) * .09;
        ctx.beginPath(); item.points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath();
        ctx.fillStyle = selected ? "rgba(232,173,63,.96)" : color + Math.round(alpha * 255).toString(16).padStart(2, "0"); ctx.fill();
        ctx.lineWidth = selected ? 2 : .75; ctx.strokeStyle = selected ? GOLD : color + "88"; ctx.stroke();
        if (!selected) { ctx.font = "600 9px Inter,system-ui,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = `rgba(235,245,255,${Math.min(.9, .35 + item.depth * .55)})`; ctx.fillText(`S${item.sector}`, item.center.x, item.center.y); }
        if (selected) {
          ctx.save(); ctx.shadowColor = GOLD; ctx.shadowBlur = 28; ctx.strokeStyle = "rgba(255,224,145,.98)"; ctx.lineWidth = 2.5; ctx.beginPath(); item.points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); ctx.stroke(); ctx.restore();
          ctx.save(); ctx.shadowColor = GOLD; ctx.shadowBlur = 18; ctx.fillStyle = "#fff2bf"; star(ctx, item.center.x, item.center.y, Math.max(8, radius * .018)); ctx.restore();
          const label = item.parcel.parcel_number; ctx.font = "700 12px Inter,system-ui,sans-serif"; ctx.textAlign = "left"; const lw = ctx.measureText(label).width + 26, bx = Math.min(w - lw - 12, Math.max(12, item.center.x + 18)), by = Math.max(12, item.center.y - 48);
          ctx.fillStyle = "rgba(3,12,27,.96)"; ctx.strokeStyle = GOLD; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(bx, by, lw, 32, 7); ctx.fill(); ctx.stroke(); ctx.fillStyle = "#fff"; ctx.fillText(label, bx + 13, by + 21);
        }
      }

      ctx.save(); ctx.shadowColor = "rgba(77,165,255,.65)"; ctx.shadowBlur = 18; ctx.lineWidth = 2; ctx.strokeStyle = "rgba(124,198,255,.90)"; ctx.beginPath(); ctx.arc(cx, baseY, radius, Math.PI, Math.PI * 2); ctx.stroke(); ctx.restore();
      const edge = ctx.createLinearGradient(cx, baseY - 4, cx, baseY + 38); edge.addColorStop(0, "rgba(232,173,63,.46)"); edge.addColorStop(.35, "rgba(120,190,255,.18)"); edge.addColorStop(1, "rgba(120,190,255,0)"); ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(cx, baseY, radius, radius * .07, 0, Math.PI, Math.PI * 2); ctx.stroke();
      ctx.restore();

      for (let i = 0; i < 22; i++) { const a = i * 2.618, d = radius * (1.08 + (i % 4) * .06), x = cx + Math.cos(a) * d, y = baseY - radius * .42 + Math.sin(a) * d * .42; if (y > baseY - 8) continue; ctx.fillStyle = i % 7 === 0 ? "rgba(232,173,63,.78)" : "rgba(164,215,255,.48)"; ctx.beginPath(); ctx.arc(x, y, .7 + (i % 3) * .35, 0, Math.PI * 2); ctx.fill(); }
      raf = requestAnimationFrame(draw);
    };
    resize(); window.addEventListener("resize", resize); raf = requestAnimationFrame(draw); return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const down = (e: PointerEvent<HTMLCanvasElement>) => { const s = state.current; s.dragging = true; s.moved = false; s.vx = 0; s.vy = 0; s.lastX = e.clientX; s.lastY = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e: PointerEvent<HTMLCanvasElement>) => { const s = state.current; if (!s.dragging) return; const dx = e.clientX - s.lastX, dy = e.clientY - s.lastY; if (Math.abs(dx) + Math.abs(dy) > 3) s.moved = true; s.yaw += dx * .0075; s.pitch = Math.max(-.12, Math.min(.34, s.pitch + dy * .0025)); s.vx = dx * .0012; s.vy = dy * .00035; s.lastX = e.clientX; s.lastY = e.clientY; };
  const up = (e: PointerEvent<HTMLCanvasElement>) => { state.current.dragging = false; try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {} };
  const click = (e: MouseEvent<HTMLCanvasElement>) => { if (state.current.moved) return; const r = e.currentTarget.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; let best: Hit | null = null; for (const item of hitsRef.current) { const d = Math.hypot(x - item.center.x, y - item.center.y); if (d < 22 && (!best || item.depth > best.depth || d < Math.hypot(x - best.center.x, y - best.center.y))) best = item; } if (best) onSelect(best.parcel.id); };
  const wheel = (e: WheelEvent<HTMLCanvasElement>) => { e.preventDefault(); state.current.zoom = Math.max(.86, Math.min(1.12, state.current.zoom - e.deltaY * .00055)); };
  const reset = () => { state.current.yaw = -.34; state.current.pitch = .08; state.current.zoom = 1; state.current.vx = 0; state.current.vy = 0; };

  return <div className="relative w-full"><canvas ref={canvasRef} className="h-[500px] w-full touch-none select-none sm:h-[560px]" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClick={click} onWheel={wheel} aria-label="Etkileşimli dijital gökyüzü kubbesi" /><div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-gold/30 bg-navy-deep/75 px-4 py-2 text-[10px] text-muted-foreground backdrop-blur-sm"><span className="text-blue-300">Dijital %50</span> · <span className="text-violet-300">Elit %30</span> · <span className="text-gold">Premium %20</span></div><button type="button" onClick={reset} className="absolute right-3 top-3 rounded-md border border-gold/35 bg-navy-deep/75 px-3 py-2 text-[10px] text-gold backdrop-blur-sm">↻ SIFIRLA</button></div>;
}
