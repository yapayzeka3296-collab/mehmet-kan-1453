import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Parcel } from "@/types/parcel";

type Props = { parcels: Parcel[]; selectedId: string | null; onSelect: (id: string) => void };
type Point = { x: number; y: number };
type Cell = { parcel: Parcel; sector: number; row: number; points: Point[]; center: Point };

const COLORS = { digital: "#4aa9ff", elite: "#a879ff", premium: "#f0b84b" } as const;
const numberOf = (p: Parcel) => Number(p.parcel_number.split("-").pop() || 0);
const sectorOf = (p: Parcel) => Math.max(1, Math.min(100, Math.ceil(numberOf(p) / 10)));
const rowOf = (p: Parcel) => (numberOf(p) - 1) % 10;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Reference-inspired floating digital sky dome. SVG is used deliberately so tablet pointer hit-testing is deterministic. */
export function SkyParcelDomeReference({ parcels, selectedId, onSelect }: Props) {
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const drag = useRef({ active: false, x: 0, y: 0, moved: false });
  const bySector = useMemo(() => {
    const map = new Map<number, Parcel[]>();
    [...parcels].sort((a, b) => numberOf(a) - numberOf(b)).forEach((p) => {
      const list = map.get(sectorOf(p)) ?? [];
      list.push(p);
      map.set(sectorOf(p), list);
    });
    return map;
  }, [parcels]);

  // Initial viewport = 6 sectors x 10 parcels = 60 real Supabase parcels.
  // As yaw changes, the viewport advances through the 100 real sectors without changing cell geometry.
  const centerSector = ((Math.round((yaw / (Math.PI * 2)) * 100) % 100) + 100) % 100 + 1;
  const visibleSectors = Array.from({ length: 6 }, (_, i) => ((centerSector - 3 + i + 100) % 100) + 1);

  const cells: Cell[] = visibleSectors.flatMap((sector, col) => {
    const list = (bySector.get(sector) ?? []).sort((a, b) => rowOf(a) - rowOf(b));
    return Array.from({ length: 10 }, (_, row) => {
      const parcel = list.find((p) => rowOf(p) === row);
      if (!parcel) return null;
      const angle = ((col - 2.5) / 2.5) * 0.86 + (yaw % (Math.PI * 2)) * 0.025;
      const x = 500 + Math.sin(angle) * 380;
      const surface = 365 - Math.cos(angle) * 150;
      const y = surface - row * 25 - pitch * 72;
      const w = 108 - Math.abs(col - 2.5) * 8;
      const h = 21;
      const skew = Math.sin(angle) * 11;
      const points = [
        { x: x - w / 2 + skew, y }, { x: x + w / 2 + skew, y },
        { x: x + w / 2 - skew, y: y - h }, { x: x - w / 2 - skew, y: y - h },
      ];
      return { parcel, sector, row, points, center: { x, y: y - h / 2 } };
    }).filter((x): x is Cell => Boolean(x));
  });

  const down = (e: ReactPointerEvent<SVGSVGElement>) => {
    drag.current = { active: true, x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true;
    setYaw((v) => v + dx * 0.012);
    setPitch((v) => clamp(v - dy * 0.006, -1, 1));
    drag.current.x = e.clientX;
    drag.current.y = e.clientY;
  };
  const up = (e: ReactPointerEvent<SVGSVGElement>) => {
    drag.current.active = false;
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  };

  return (
    <div className="relative -mt-8 w-full select-none sm:-mt-12">
      <svg viewBox="0 0 1000 520" className="block h-[490px] w-full touch-none overflow-visible sm:h-[550px]" role="img" aria-label="Havada duran dijital gökyüzü kubbesi" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <defs>
          <linearGradient id="domeFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1e7fd5" stopOpacity=".17" />
            <stop offset=".48" stopColor="#14588e" stopOpacity=".075" />
            <stop offset=".82" stopColor="#0b3158" stopOpacity=".02" />
            <stop offset="1" stopColor="#082039" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="blueAtmosphere" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7bcfff" stopOpacity=".45" />
            <stop offset=".55" stopColor="#3c9bea" stopOpacity=".12" />
            <stop offset="1" stopColor="#3c9bea" stopOpacity="0" />
          </linearGradient>
          <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" /></filter>
          <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7" /></filter>
        </defs>

        {/* Wide, high, floating dome. Its lower edge fades into the city instead of forming a hard baseline. */}
        <path d="M 72 386 A 428 330 0 0 1 928 386 L 850 388 A 350 270 0 0 0 150 388 Z" fill="url(#domeFade)" />
        <path d="M 78 386 A 422 326 0 0 1 922 386" fill="none" stroke="url(#blueAtmosphere)" strokeWidth="14" opacity=".25" filter="url(#soft)" />
        <path d="M 80 386 A 420 323 0 0 1 920 386" fill="none" stroke="#5db8ff" strokeWidth="1.5" opacity=".48" />

        {/* Clear blue parcel grid. No yellow lower line. */}
        {Array.from({ length: 11 }, (_, i) => {
          const y = 116 + i * 25 - pitch * 25;
          return <path key={`h${i}`} d={`M ${130 - i * 4} ${y} Q 500 ${y - 40} ${870 + i * 4} ${y}`} fill="none" stroke="#67bcff" strokeWidth="1.25" opacity={0.7 - i * 0.035} />;
        })}
        {Array.from({ length: 13 }, (_, i) => {
          const x = 150 + i * 58 + Math.sin(yaw) * 7;
          return <path key={`v${i}`} d={`M ${x} 108 Q ${500 + (x - 500) * .72} 250 ${x + (x - 500) * .16} 386`} fill="none" stroke="#55aff9" strokeWidth="1.15" opacity=".64" />;
        })}

        {cells.map(({ parcel, sector, points, center }) => {
          const color = COLORS[parcel.tier];
          const selected = parcel.id === selectedId;
          const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");
          return (
            <g key={parcel.id}>
              {selected && <polygon points={polygon} fill={color} opacity=".42" filter="url(#glow)" />}
              <polygon points={polygon} fill={selected ? color : "rgba(5,25,48,.20)"} stroke={color} strokeWidth={selected ? 3 : 1.9} opacity={selected ? 1 : .96} style={{ cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); if (!drag.current.moved) onSelect(parcel.id); }} />
              <text x={center.x} y={center.y + 1} textAnchor="middle" dominantBaseline="middle" fill="#f0f8ff" fontSize="10" fontWeight="700" pointerEvents="none">S{sector}</text>
              {selected && <g pointerEvents="none">
                <path d={`M ${center.x} ${center.y - 8} l 2.5 5.5 6 .5 -4.5 4 1.4 6 -5.4 -3.1 -5.4 3.1 1.4 -6 -4.5 -4 6 -.5 Z`} fill="#fff9dc" />
                <rect x={center.x + 14} y={center.y - 28} width={Math.max(112, parcel.parcel_number.length * 7.2)} height="28" rx="7" fill="#06172a" stroke={color} strokeWidth="1.3" />
                <text x={center.x + 24} y={center.y - 10} fill="#fff" fontSize="11" fontWeight="700">{parcel.parcel_number}</text>
              </g>}
            </g>
          );
        })}

        {/* Bottom transparency only; the city remains visually dominant. */}
        <path d="M 100 386 A 400 315 0 0 0 900 386 L 900 440 L 100 440 Z" fill="url(#domeFade)" opacity=".48" pointerEvents="none" />
        <text x="500" y="454" textAnchor="middle" fill="#76bfff" fontSize="9" letterSpacing="2.2" opacity=".5" pointerEvents="none">HAVADA ASILI DİJİTAL GÖKYÜZÜ</text>
      </svg>
      <button type="button" onClick={() => { setYaw(0); setPitch(0); }} className="absolute right-3 top-2 rounded-md border border-sky-400/20 bg-slate-950/60 px-3 py-2 text-[10px] text-sky-200 backdrop-blur-sm">↻ SIFIRLA</button>
    </div>
  );
}
