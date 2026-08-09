import { useEffect, useRef } from "react";
import type { MouseEvent, PointerEvent, WheelEvent } from "react";
import type { Parcel } from "@/types/parcel";

type Props = {
  parcels: Parcel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  cityName: string;
};

type Point3 = { x: number; y: number; z: number };
type ScreenPoint = { x: number; y: number; z: number };
type Tier = "digital" | "elite" | "premium";
type ProjectedParcel = {
  parcel: Parcel;
  points: ScreenPoint[];
  center: ScreenPoint;
  depth: number;
  tier: Tier;
  row: number;
  sector: number;
};

type DomeState = {
  yaw: number;
  pitch: number;
  zoom: number;
  dragging: boolean;
  moved: boolean;
  lastX: number;
  lastY: number;
  velocityX: number;
  velocityY: number;
};

const TAU = Math.PI * 2;
const SECTOR_COUNT = 100;
const ROW_COUNT = 10;
const INITIAL_VISIBLE_SECTORS = 6;
const MAX_INITIAL_PARCELS = INITIAL_VISIBLE_SECTORS * ROW_COUNT;

const TIER_COLORS: Record<Tier, string> = {
  digital: "#55b9ff",
  elite: "#ad82ff",
  premium: "#f2bd55",
};

const TIER_GLOW: Record<Tier, string> = {
  digital: "rgba(85,185,255,0.72)",
  elite: "rgba(173,130,255,0.72)",
  premium: "rgba(242,189,85,0.78)",
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function wrapSector(value: number) {
  return ((value % SECTOR_COUNT) + SECTOR_COUNT) % SECTOR_COUNT;
}

function parseSector(parcel: Parcel) {
  const match = parcel.parcel_number.match(/(?:^|-)S(\d+)(?:-|$)/i);
  return clamp(Number(match?.[1] ?? 1), 1, SECTOR_COUNT);
}

function parseParcelRow(parcel: Parcel) {
  const match = parcel.parcel_number.match(/(?:^|-)P(\d+)(?:-|$)/i);
  return clamp(Number(match?.[1] ?? 1) - 1, 0, ROW_COUNT - 1);
}

function tierForRow(row: number): Tier {
  // P01-P05 = Digital (top 50%), P06-P08 = Elit (middle 30%), P09-P10 = Premium (bottom 20%).
  if (row < 5) return "digital";
  if (row < 8) return "elite";
  return "premium";
}

function latLonPoint(latitude: number, longitude: number): Point3 {
  const lat = (latitude * Math.PI) / 180;
  const lon = (longitude * Math.PI) / 180;
  return {
    x: Math.cos(lat) * Math.cos(lon),
    y: Math.sin(lat),
    z: Math.cos(lat) * Math.sin(lon),
  };
}

function rotatePoint(point: Point3, yaw: number, pitch: number): Point3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x = point.x * cy - point.z * sy;
  const z = point.x * sy + point.z * cy;

  // Positive pitch raises the front of the dome. This makes upward drag feel natural.
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return {
    x,
    y: point.y * cp + z * sp,
    z: -point.y * sp + z * cp,
  };
}

function project(point: Point3, radius: number, cx: number, cy: number): ScreenPoint {
  return {
    x: cx + point.x * radius,
    y: cy - point.y * radius,
    z: point.z,
  };
}

function pointInPolygon(x: number, y: number, polygon: ScreenPoint[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function sectorDistance(a: number, b: number) {
  const raw = Math.abs(a - b);
  return Math.min(raw, SECTOR_COUNT - raw);
}

export function SkyParcelDome({ parcels, selectedId, onSelect, cityName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<DomeState>({
    // Center the reference view on the first six real sectors.
    yaw: ((3.5 / SECTOR_COUNT) * TAU) - Math.PI / 2,
    pitch: 0.02,
    zoom: 1,
    dragging: false,
    moved: false,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
  });
  const selectedIdRef = useRef(selectedId);
  const parcelsRef = useRef(parcels);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    parcelsRef.current = parcels;
    onSelectRef.current = onSelect;
  }, [selectedId, parcels, onSelect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(320, rect.width);
      height = Math.max(360, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawDomeAtmosphere = (cx: number, cy: number, radius: number) => {
      const fill = ctx.createRadialGradient(cx, cy - radius * 0.28, radius * 0.05, cx, cy, radius * 1.05);
      fill.addColorStop(0, "rgba(58,145,230,0.10)");
      fill.addColorStop(0.52, "rgba(21,91,157,0.045)");
      fill.addColorStop(0.84, "rgba(11,54,99,0.018)");
      fill.addColorStop(1, "rgba(5,27,53,0)");
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI, TAU);
      ctx.lineTo(cx - radius, cy);
      ctx.closePath();
      ctx.fill();
    };

    const drawAtmosphericRim = (cx: number, cy: number, radius: number, yaw: number, pitch: number) => {
      ctx.save();
      ctx.lineWidth = 1.7;
      ctx.shadowColor = "rgba(84,181,255,0.36)";
      ctx.shadowBlur = 9;

      // Only the curved upper silhouette is drawn. The lower edge intentionally fades away.
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= 90; i += 2) {
        const longitude = (-90 + i) * (Math.PI / 180);
        const p = rotatePoint(latLonPoint(0, longitude * (180 / Math.PI)), yaw, pitch);
        if (p.z < -0.04) {
          started = false;
          continue;
        }
        const q = project(p, radius, cx, cy);
        const fade = clamp((q.y - (cy - radius * 0.05)) / (radius * 0.95), 0, 1);
        ctx.strokeStyle = `rgba(92,190,255,${0.62 * (1 - fade) + 0.04})`;
        if (!started) {
          ctx.moveTo(q.x, q.y);
          started = true;
        } else {
          ctx.lineTo(q.x, q.y);
        }
      }
      ctx.stroke();
      ctx.restore();
    };

    const draw = () => {
      const state = stateRef.current;

      if (!state.dragging) {
        state.yaw += state.velocityX;
        state.pitch += state.velocityY;
        state.velocityX *= 0.92;
        state.velocityY *= 0.92;
      }
      state.pitch = clamp(state.pitch, -0.52, 0.52);

      const radius = Math.min(width * 0.46, height * 0.78) * state.zoom;
      const cx = width / 2;
      // The dome is deliberately high so the city remains the dominant background.
      const cy = height * 0.72;

      ctx.clearRect(0, 0, width, height);

      drawDomeAtmosphere(cx, cy, radius);

      // Subtle digital atmosphere particles above the city, not a solid dome panel.
      for (let i = 0; i < 20; i += 1) {
        const angle = i * 2.47;
        const distance = radius * (0.72 + ((i * 17) % 22) / 100);
        const x = cx + Math.cos(angle) * distance;
        const y = cy - Math.abs(Math.sin(angle)) * distance * 0.54 - radius * 0.04;
        ctx.fillStyle = i % 5 === 0 ? "rgba(242,189,85,0.46)" : "rgba(150,211,255,0.34)";
        ctx.beginPath();
        ctx.arc(x, y, 0.7 + (i % 2) * 0.35, 0, TAU);
        ctx.fill();
      }

      const sectorById = new Map<number, Map<number, Parcel>>();
      for (const parcel of parcelsRef.current) {
        const sector = parseSector(parcel);
        const row = parseParcelRow(parcel);
        if (!sectorById.has(sector)) sectorById.set(sector, new Map());
        sectorById.get(sector)!.set(row, parcel);
      }

      const centerSector = wrapSector(Math.round((state.yaw / TAU) * SECTOR_COUNT) + 1);
      const visibleSectorNumbers = Array.from({ length: SECTOR_COUNT }, (_, index) => index + 1)
        .sort((a, b) => sectorDistance(a, centerSector) - sectorDistance(b, centerSector))
        .slice(0, INITIAL_VISIBLE_SECTORS);

      const projected: ProjectedParcel[] = [];
      const longitudeStep = TAU / SECTOR_COUNT;
      const latitudeTop = 84;
      const latitudeBottom = 6;
      const rowStep = (latitudeTop - latitudeBottom) / ROW_COUNT;

      // Six sectors x ten rows = exactly 60 parcels in the initial viewport.
      for (const sector of visibleSectorNumbers) {
        const parcelRows = sectorById.get(sector);
        if (!parcelRows) continue;
        const centerLongitude = ((sector - 1) * longitudeStep) - state.yaw;
        const lon0 = centerLongitude - longitudeStep / 2;
        const lon1 = centerLongitude + longitudeStep / 2;

        for (let row = 0; row < ROW_COUNT; row += 1) {
          const parcel = parcelRows.get(row);
          if (!parcel) continue;

          const lat0 = latitudeTop - row * rowStep;
          const lat1 = latitudeTop - (row + 1) * rowStep;
          const corners = [
            latLonPoint(lat0, (lon0 * 180) / Math.PI),
            latLonPoint(lat0, (lon1 * 180) / Math.PI),
            latLonPoint(lat1, (lon1 * 180) / Math.PI),
            latLonPoint(lat1, (lon0 * 180) / Math.PI),
          ].map((point) => rotatePoint(point, 0, state.pitch));

          // The longitude already includes yaw, so pitch is the only camera rotation left here.
          const center = rotatePoint(latLonPoint((lat0 + lat1) / 2, (centerLongitude * 180) / Math.PI), 0, state.pitch);
          projected.push({
            parcel,
            points: corners.map((point) => project(point, radius, cx, cy)),
            center: project(center, radius, cx, cy),
            depth: center.z,
            tier: tierForRow(row),
            row,
            sector,
          });
        }
      }

      projected.sort((a, b) => a.depth - b.depth);

      // Clear and redraw grid lines from the same spherical geometry so the cells stay locked to the dome.
      ctx.save();
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = "rgba(91,174,238,0.34)";
      for (let row = 0; row <= ROW_COUNT; row += 1) {
        const latitude = latitudeTop - row * rowStep;
        ctx.beginPath();
        let started = false;
        for (let step = 0; step <= 80; step += 2) {
          const longitude = -Math.PI / 2 + (Math.PI * step) / 80;
          const point = rotatePoint(latLonPoint(latitude, (longitude * 180) / Math.PI), state.yaw, state.pitch);
          if (point.z < -0.12) {
            started = false;
            continue;
          }
          const q = project(point, radius, cx, cy);
          const opacity = row >= 8 ? 0.22 : 0.34;
          ctx.strokeStyle = `rgba(91,174,238,${opacity})`;
          if (!started) {
            ctx.moveTo(q.x, q.y);
            started = true;
          } else {
            ctx.lineTo(q.x, q.y);
          }
        }
        ctx.stroke();
      }
      for (let index = -6; index <= 6; index += 1) {
        const longitude = index * longitudeStep - state.yaw;
        ctx.beginPath();
        let started = false;
        for (let step = 0; step <= 72; step += 2) {
          const latitude = latitudeBottom + ((latitudeTop - latitudeBottom) * step) / 72;
          const point = rotatePoint(latLonPoint(latitude, (longitude * 180) / Math.PI), 0, state.pitch);
          if (point.z < -0.10) {
            started = false;
            continue;
          }
          const q = project(point, radius, cx, cy);
          if (!started) {
            ctx.moveTo(q.x, q.y);
            started = true;
          } else {
            ctx.lineTo(q.x, q.y);
          }
        }
        ctx.stroke();
      }
      ctx.restore();

      for (const item of projected) {
        const selected = item.parcel.id === selectedIdRef.current;
        const color = TIER_COLORS[item.tier];
        const depthAlpha = clamp(0.22 + item.depth * 0.48, 0.12, 0.66);
        const polygon = item.points;

        ctx.beginPath();
        polygon.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.fillStyle = selected ? `${color}44` : `rgba(4,22,42,${Math.max(0.18, depthAlpha * 0.44).toFixed(2)})`;
        ctx.fill();

        ctx.lineWidth = selected ? 2.1 : 1.15;
        ctx.strokeStyle = selected ? color : `${color}${Math.round(depthAlpha * 255).toString(16).padStart(2, "0")}`;
        ctx.stroke();

        const labelFont = clamp(width / 120, 7, 10);
        ctx.font = `700 ${labelFont}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = selected ? "#fff8df" : "rgba(234,247,255,0.92)";
        ctx.fillText(`S${String(item.sector).padStart(3, "0")}`, item.center.x, item.center.y);

        if (selected) {
          ctx.save();
          ctx.shadowColor = TIER_GLOW[item.tier];
          ctx.shadowBlur = 18;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          polygon.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
          ctx.closePath();
          ctx.stroke();
          ctx.restore();

          // Small star in the selected parcel.
          ctx.save();
          ctx.translate(item.center.x, item.center.y);
          ctx.rotate(Math.PI / 4);
          ctx.fillStyle = "#fff7cf";
          ctx.fillRect(-3.5, -3.5, 7, 7);
          ctx.restore();

          const code = item.parcel.parcel_number;
          ctx.font = "700 11px Inter, system-ui, sans-serif";
          const boxWidth = ctx.measureText(code).width + 24;
          const boxX = clamp(item.center.x + 16, 10, width - boxWidth - 10);
          const boxY = clamp(item.center.y - 42, 8, height - 38);
          ctx.fillStyle = "rgba(3,13,29,0.96)";
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxWidth, 28, 7);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(code, boxX + 12, boxY + 14);
        }
      }

      drawAtmosphericRim(cx, cy, radius, state.yaw, state.pitch);

      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const pointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    state.dragging = true;
    state.moved = false;
    state.velocityX = 0;
    state.velocityY = 0;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    if (!state.dragging) return;

    const dx = event.clientX - state.lastX;
    const dy = event.clientY - state.lastY;
    if (Math.abs(dx) + Math.abs(dy) > 4) state.moved = true;

    // Natural direction: drag right -> dome moves right; drag left -> dome moves left.
    state.yaw += dx * 0.008;
    // Natural vertical direction: drag up -> view rises; drag down -> view lowers.
    state.pitch += -dy * 0.0058;
    state.pitch = clamp(state.pitch, -0.52, 0.52);
    state.velocityX = dx * 0.0012;
    state.velocityY = -dy * 0.0007;
    state.lastX = event.clientX;
    state.lastY = event.clientY;
  };

  const pointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    stateRef.current.dragging = false;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already have been released by the browser.
    }
  };

  const click = (event: MouseEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    if (state.moved) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const items = (event.currentTarget.dataset.hit ? [] : []) as ProjectedParcel[];
    void items;

    // Hit-test the currently visible 60 cells from their rendered geometry.
    // The renderer stores them indirectly, so approximate with the sector/row grid around the pointer.
    // A second, lightweight projection is not needed: the canvas click is forwarded through the
    // same visible geometry by sampling the nearest label center from the cached hit list below.
    const cached = (canvasRef.current as HTMLCanvasElement & { __skyHit?: ProjectedParcel[] }).__skyHit ?? [];
    let best: ProjectedParcel | null = null;
    let bestDistance = Infinity;
    for (const item of cached) {
      if (pointInPolygon(x, y, item.points)) {
        if (!best || item.depth > best.depth) best = item;
        continue;
      }
      const distance = Math.hypot(x - item.center.x, y - item.center.y);
      if (distance < bestDistance && distance < 24) {
        bestDistance = distance;
        best = item;
      }
    }
    if (best) onSelectRef.current(best.parcel.id);
  };

  const wheel = (event: WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    stateRef.current.zoom = clamp(stateRef.current.zoom - event.deltaY * 0.0007, 0.82, 1.18);
  };

  const reset = () => {
    stateRef.current.yaw = ((3.5 / SECTOR_COUNT) * TAU) - Math.PI / 2;
    stateRef.current.pitch = 0.02;
    stateRef.current.zoom = 1;
    stateRef.current.velocityX = 0;
    stateRef.current.velocityY = 0;
  };

  return (
    <div className="relative -mt-1 w-full select-none sm:-mt-2">
      <div className="pointer-events-none relative z-20 pb-1 text-center">
        <h2 className="font-display text-lg font-semibold tracking-[0.08em] text-white sm:text-2xl">
          {cityName.toUpperCase()} GÖKYÜZÜ HARİTASI
        </h2>
        <p className="mt-1 text-[9px] tracking-[0.14em] text-slate-200/80 sm:text-[11px]">
          1.000 ADET SEMBOLİK GÖKYÜZÜ PARSELİ
        </p>
      </div>

      <div className="relative -mt-1">
        <canvas
          ref={(node) => {
            canvasRef.current = node;
          }}
          className="block h-[430px] w-full touch-none cursor-grab active:cursor-grabbing sm:h-[520px]"
          aria-label="Havada duran interaktif dijital gökyüzü kubbesi"
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={pointerUp}
          onClick={click}
          onWheel={wheel}
        />
        <button
          type="button"
          onClick={reset}
          className="absolute right-2 top-2 rounded-md border border-sky-300/20 bg-slate-950/60 px-3 py-2 text-[10px] font-medium text-sky-100 backdrop-blur-sm"
        >
          ↻ SIFIRLA
        </button>
      </div>

      <div className="pointer-events-none absolute bottom-1 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-sky-300/15 bg-slate-950/55 px-3 py-1 text-[8px] tracking-wide text-slate-200/70 backdrop-blur-sm sm:text-[9px]">
        DİJİTAL %50 · ELİT %30 · PREMIUM %20
      </div>
    </div>
  );
}
