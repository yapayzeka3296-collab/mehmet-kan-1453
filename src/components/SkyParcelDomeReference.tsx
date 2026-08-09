import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Parcel } from "@/types/parcel";

type Props = {
  parcels: Parcel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

type Tier = "digital" | "elite" | "premium";
type Vec2 = { x: number; y: number };
type Cell = { parcel: Parcel; sector: number; row: number; points: Vec2[]; center: Vec2; tier: Tier };

const TIER_COLORS: Record<Tier, string> = {
  digital: "#45b8ff",
  elite: "#a979ff",
  premium: "#f1b84b",
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/**
 * Extract the real Sxxx/Pxx parts from the MySkyParcel code.
 * Example: GZT-K05-S042-P07 -> sector 42, row/parcel 7.
 * The previous implementation incorrectly used the final Pxx value as the sector,
 * which caused repeated S1/S2/S3... labels and broken geometry.
 */
function sectorOf(parcel: Parcel) {
  const match = parcel.parcel_number.match(/(?:^|-)S(\d+)(?:-|$)/i);
  return match ? clamp(Number(match[1]), 1, 100) : 1;
}

function rowOf(parcel: Parcel) {
  const match = parcel.parcel_number.match(/(?:^|-)P(\d+)(?:-|$)/i);
  return match ? clamp(Number(match[1]) - 1, 0, 9) : 0;
}

function tierForRow(row: number): Tier {
  if (row < 5) return "digital";
  if (row < 8) return "elite";
  return "premium";
}

function wrapSector(value: number) {
  return ((value - 1) % 100 + 100) % 100 + 1;
}

/**
 * MySkyParcel reference dome.
 *
 * This is intentionally a fresh spherical projection rather than the previous
 * flat/trapezoid grid. Six sectors x ten rows are visible at the initial angle;
 * rotating the dome moves that six-sector window through all 100 sectors.
 */
export function SkyParcelDomeReference({ parcels, selectedId, onSelect }: Props) {
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0);
  const drag = useRef({ active: false, pointerId: -1, x: 0, y: 0, moved: false });

  const bySector = useMemo(() => {
    const map = new Map<number, Map<number, Parcel>>();
    for (const parcel of parcels) {
      const sector = sectorOf(parcel);
      const row = rowOf(parcel);
      if (!map.has(sector)) map.set(sector, new Map());
      map.get(sector)!.set(row, parcel);
    }
    return map;
  }, [parcels]);

  // Six real sectors are visible at once. Yaw changes the sector window,
  // rather than regenerating/repositioning parcels randomly.
  const centerSector = wrapSector(Math.round((yaw / (Math.PI * 2)) * 100) + 1);
  const visibleSectors = Array.from({ length: 6 }, (_, index) =>
    wrapSector(centerSector - 2 + index),
  );

  const cells = useMemo<Cell[]>(() => {
    const result: Cell[] = [];
    const cx = 500;
    const cy = 394 + pitch * 18;
    const radiusX = 405;
    const radiusY = 286;

    // Six columns occupy a central 100° arc. Every row is a latitude band on
    // the upper half of the sphere, producing the reference-style dome.
    const longitudeStep = Math.PI / 18;
    const longitudeStart = -longitudeStep * 3;

    for (let col = 0; col < visibleSectors.length; col += 1) {
      const sector = visibleSectors[col];
      const sectorParcels = bySector.get(sector);
      if (!sectorParcels) continue;

      const lon0 = longitudeStart + col * longitudeStep;
      const lon1 = lon0 + longitudeStep;

      for (let row = 0; row < 10; row += 1) {
        const parcel = sectorParcels.get(row);
        if (!parcel) continue;

        // Elevation goes from the upper crown to the lower transparent edge.
        // The last rows sit close to the horizon and naturally become wider.
        const elevation0 = Math.PI / 2 - (row / 10) * (Math.PI / 2 - 0.08);
        const elevation1 = Math.PI / 2 - ((row + 1) / 10) * (Math.PI / 2 - 0.08);

        const project = (elevation: number, longitude: number): Vec2 => ({
          x: cx + radiusX * Math.cos(elevation) * Math.sin(longitude),
          y: cy - radiusY * Math.sin(elevation),
        });

        const p00 = project(elevation0, lon0);
        const p01 = project(elevation0, lon1);
        const p11 = project(elevation1, lon1);
        const p10 = project(elevation1, lon0);
        const center = {
          x: (p00.x + p01.x + p11.x + p10.x) / 4,
          y: (p00.y + p01.y + p11.y + p10.y) / 4,
        };

        result.push({
          parcel,
          sector,
          row,
          points: [p00, p01, p11, p10],
          center,
          tier: tierForRow(row),
        });
      }
    }

    return result;
  }, [bySector, centerSector, pitch, visibleSectors]);

  const beginDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    drag.current = {
      active: true,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!drag.current.active || drag.current.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.current.x;
    const dy = event.clientY - drag.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.current.moved = true;

    // Natural direction: drag right -> dome moves right; drag left -> left.
    setYaw((value) => value + dx * 0.012);
    setPitch((value) => clamp(value - dy * 0.006, -1, 1));

    drag.current.x = event.clientX;
    drag.current.y = event.clientY;
  };

  const endDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (drag.current.pointerId !== event.pointerId) return;
    drag.current.active = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released by the browser.
    }
  };

  return (
    <div className="relative -mt-14 w-full select-none sm:-mt-20">
      <svg
        viewBox="0 0 1000 540"
        className="block h-[510px] w-full touch-none overflow-visible sm:h-[570px]"
        role="img"
        aria-label="Havada duran dijital gökyüzü kubbesi"
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <defs>
          <linearGradient id="skyDomeFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#237fca" stopOpacity="0.18" />
            <stop offset="0.48" stopColor="#14588e" stopOpacity="0.075" />
            <stop offset="0.82" stopColor="#0b3158" stopOpacity="0.025" />
            <stop offset="1" stopColor="#06192d" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="skyEdge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#75caff" stopOpacity="0.52" />
            <stop offset="0.62" stopColor="#4aa8f0" stopOpacity="0.18" />
            <stop offset="1" stopColor="#4aa8f0" stopOpacity="0" />
          </linearGradient>
          <filter id="domeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          <filter id="selectionGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Floating half-dome: the city remains visible underneath it. */}
        <path
          d="M 70 396 A 430 330 0 0 1 930 396 L 930 432 L 70 432 Z"
          fill="url(#skyDomeFill)"
          pointerEvents="none"
        />
        <path
          d="M 72 396 A 428 328 0 0 1 928 396"
          fill="none"
          stroke="url(#skyEdge)"
          strokeWidth="18"
          opacity="0.22"
          filter="url(#domeGlow)"
          pointerEvents="none"
        />
        <path
          d="M 82 396 A 418 318 0 0 1 918 396"
          fill="none"
          stroke="url(#skyEdge)"
          strokeWidth="2"
          opacity="0.5"
          pointerEvents="none"
        />

        {/* Spherical latitude/longitude grid. It deliberately stops fading before
            the city horizon so there is no hard yellow baseline. */}
        {Array.from({ length: 11 }, (_, row) => {
          const elevation = Math.PI / 2 - (row / 10) * (Math.PI / 2 - 0.08);
          const left = {
            x: 500 - 405 * Math.cos(elevation) * Math.sin(Math.PI / 6),
            y: 394 + pitch * 18 - 286 * Math.sin(elevation),
          };
          const right = {
            x: 500 + 405 * Math.cos(elevation) * Math.sin(Math.PI / 6),
            y: 394 + pitch * 18 - 286 * Math.sin(elevation),
          };
          return (
            <path
              key={`latitude-${row}`}
              d={`M ${left.x} ${left.y} Q 500 ${left.y - (10 - row) * 5} ${right.x} ${right.y}`}
              fill="none"
              stroke="#62baff"
              strokeWidth={row === 10 ? 1.6 : 1.15}
              opacity={Math.max(0.28, 0.72 - row * 0.045)}
              pointerEvents="none"
            />
          );
        })}

        {Array.from({ length: 13 }, (_, index) => {
          const longitude = -Math.PI / 3 + index * (Math.PI / 18);
          const top = {
            x: 500 + 405 * Math.cos(Math.PI / 2) * Math.sin(longitude),
            y: 394 + pitch * 18 - 286,
          };
          const bottom = {
            x: 500 + 405 * Math.cos(0.08) * Math.sin(longitude),
            y: 394 + pitch * 18 - 286 * Math.sin(0.08),
          };
          const control = { x: 500 + (bottom.x - 500) * 0.35, y: 245 };
          return (
            <path
              key={`longitude-${index}`}
              d={`M ${top.x} ${top.y} Q ${control.x} ${control.y} ${bottom.x} ${bottom.y}`}
              fill="none"
              stroke="#4daaf5"
              strokeWidth="1.1"
              opacity="0.52"
              pointerEvents="none"
            />
          );
        })}

        {cells.map(({ parcel, sector, row, points, center, tier }) => {
          const color = TIER_COLORS[tier];
          const selected = parcel.id === selectedId;
          const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");

          return (
            <g key={parcel.id}>
              {selected && (
                <polygon
                  points={polygon}
                  fill={color}
                  opacity="0.48"
                  filter="url(#selectionGlow)"
                  pointerEvents="none"
                />
              )}
              <polygon
                points={polygon}
                fill={selected ? color : "rgba(4,22,42,0.34)"}
                fillOpacity={selected ? 0.58 : 0.9}
                stroke={color}
                strokeWidth={selected ? 3 : 1.7}
                opacity="0.98"
                pointerEvents="all"
                style={{ cursor: "pointer" }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (!drag.current.moved) onSelect(parcel.id);
                }}
              />
              <text
                x={center.x}
                y={center.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#edf8ff"
                fontSize="9"
                fontWeight="700"
                pointerEvents="none"
              >
                S{String(sector).padStart(3, "0")}
              </text>
              {selected && (
                <g pointerEvents="none">
                  <path
                    d={`M ${center.x} ${center.y - 8} l 2.3 5 5.4 .6 -4 3.5 1.2 5.3 -4.9 -2.8 -4.9 2.8 1.2 -5.3 -4 -3.5 5.4 -.6 Z`}
                    fill="#fff7cf"
                  />
                  <rect
                    x={center.x + 15}
                    y={center.y - 31}
                    width={Math.max(122, parcel.parcel_number.length * 7.1)}
                    height="28"
                    rx="7"
                    fill="#06172a"
                    stroke={color}
                    strokeWidth="1.4"
                  />
                  <text
                    x={center.x + 25}
                    y={center.y - 13}
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="700"
                  >
                    {parcel.parcel_number}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Fade below the last parcel rows. No hard/yellow lower border. */}
        <path
          d="M 90 394 Q 500 430 910 394 L 910 468 L 90 468 Z"
          fill="url(#skyDomeFill)"
          opacity="0.42"
          pointerEvents="none"
        />
        <text
          x="500"
          y="486"
          textAnchor="middle"
          fill="#72bfff"
          fontSize="9"
          letterSpacing="2.1"
          opacity="0.48"
          pointerEvents="none"
        >
          HAVADA ASILI DİJİTAL GÖKYÜZÜ
        </text>
      </svg>

      <button
        type="button"
        onClick={() => {
          setYaw(0);
          setPitch(0);
        }}
        className="absolute right-3 top-0 rounded-md border border-sky-400/20 bg-slate-950/65 px-3 py-2 text-[10px] text-sky-100 backdrop-blur-sm"
      >
        ↻ SIFIRLA
      </button>
    </div>
  );
}
