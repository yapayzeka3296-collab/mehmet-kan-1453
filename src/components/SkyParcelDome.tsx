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
const SECTORS = 100;
const ROWS = 10;
const VISIBLE_SECTORS = 6;
const STEP = TAU / SECTORS;

const TIER_COLORS: Record<Tier, string> = {
  digital: "#58bfff",
  elite: "#ad82ff",
  premium: "#f2bd55",
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const wrap = (value: number) => ((value % SECTORS) + SECTORS) % SECTORS;

function sectorOf(parcel: Parcel) {
  const match = parcel.parcel_number.match(/(?:^|-)S(\d+)(?:-|$)/i);
  return clamp(Number(match?.[1] ?? 1), 1, SECTORS);
}

function rowOf(parcel: Parcel) {
  const match = parcel.parcel_number.match(/(?:^|-)P(\d+)(?:-|$)/i);
  return clamp(Number(match?.[1] ?? 1) - 1, 0, ROWS - 1);
}

function tierForRow(row: number): Tier {
  if (row < 5) return "digital";
  if (row < 8) return "elite";
  return "premium";
}

function spherePoint(latitudeDeg: number, longitudeRad: number): Point3 {
  const latitude = (latitudeDeg * Math.PI) / 180;
  return {
    x: Math.cos(latitude) * Math.cos(longitudeRad),
    y: Math.sin(latitude),
    z: Math.cos(latitude) * Math.sin(longitudeRad),
  };
}

function pitchPoint(point: Point3, pitch: number): Point3 {
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return {
    x: point.x,
    y: point.y * cp + point.z * sp,
    z: -point.y * sp + point.z * cp,
  };
}

function project(point: Point3, radius: number, cx: number, cy: number): ScreenPoint {
  return { x: cx + point.x * radius, y: cy - point.y * radius, z: point.z };
}

function pointInPolygon(x: number, y: number, polygon: ScreenPoint[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

export function SkyParcelDome({ parcels, selectedId, onSelect, cityName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hitRef = useRef<ProjectedParcel[]>([]);
  const selectedIdRef = useRef(selectedId);
  const parcelsRef = useRef(parcels);
  const onSelectRef = useRef(onSelect);
  const stateRef = useRef<DomeState>({
    yaw: 0,
    pitch: 0.02,
    zoom: 1,
    dragging: false,
    moved: false,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
  });

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

    const draw = () => {
      const state = stateRef.current;
      if (!state.dragging) {
        state.yaw += state.velocityX;
        state.pitch += state.velocityY;
        state.velocityX *= 0.92;
        state.velocityY *= 0.92;
      }
      state.pitch = clamp(state.pitch, -0.48, 0.48);

      ctx.clearRect(0, 0, width, height);

      // High floating placement: the dome sits in the sky instead of on the city.
      const radius = Math.min(width * 0.47, height * 0.82) * state.zoom;
      const cx = width / 2;
      const cy = height * 0.74;

      // Extremely light atmospheric fill. It must never become an opaque panel over the city.
      const atmosphere = ctx.createRadialGradient(cx, cy - radius * 0.42, radius * 0.08, cx, cy, radius * 1.04);
      atmosphere.addColorStop(0, "rgba(56,145,231,0.10)");
      atmosphere.addColorStop(0.52, "rgba(20,86,150,0.045)");
      atmosphere.addColorStop(0.86, "rgba(8,45,82,0.015)");
      atmosphere.addColorStop(1, "rgba(5,25,48,0)");
      ctx.fillStyle = atmosphere;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, Math.PI, TAU);
      ctx.lineTo(cx - radius, cy);
      ctx.closePath();
      ctx.fill();

      const bySector = new Map<number, Map<number, Parcel>>();
      for (const parcel of parcelsRef.current) {
        const sector = sectorOf(parcel);
        const row = rowOf(parcel);
        if (!bySector.has(sector)) bySector.set(sector, new Map());
        bySector.get(sector)!.set(row, parcel);
      }

      // Exactly six adjacent real sectors are in the initial viewport. As yaw changes,
      // this six-sector window advances through all 100 sectors without changing geometry.
      const startSector = wrap(Math.floor(state.yaw / STEP)) + 1;
      const visibleSectors = Array.from({ length: VISIBLE_SECTORS }, (_, index) => wrap(startSector - 1 + index) + 1);
      const latitudeTop = 84;
      const latitudeBottom = 6;
      const latitudeStep = (latitudeTop - latitudeBottom) / ROWS;
      const visibleCenterOffset = ((VISIBLE_SECTORS - 1) / 2) * STEP;
      const projected: ProjectedParcel[] = [];

      for (const sector of visibleSectors) {
        const rows = bySector.get(sector);
        if (!rows) continue;

        // The six-sector window is centered in the dome, so sector cells follow the curved surface.
        const longitude = (sector - 1) * STEP - state.yaw - visibleCenterOffset;
        const lon0 = longitude - STEP / 2;
        const lon1 = longitude + STEP / 2;

        for (let row = 0; row < ROWS; row += 1) {
          const parcel = rows.get(row);
          if (!parcel) continue;
          const lat0 = latitudeTop - row * latitudeStep;
          const lat1 = latitudeTop - (row + 1) * latitudeStep;
          const points = [
            spherePoint(lat0, lon0),
            spherePoint(lat0, lon1),
            spherePoint(lat1, lon1),
            spherePoint(lat1, lon0),
          ].map((point) => pitchPoint(point, state.pitch));
          const center = pitchPoint(spherePoint((lat0 + lat1) / 2, longitude), state.pitch);
          projected.push({
            parcel,
            points: points.map((point) => project(point, radius, cx, cy)),
            center: project(center, radius, cx, cy),
            depth: center.z,
            tier: tierForRow(row),
          });
        }
      }

      projected.sort((a, b) => a.depth - b.depth);
      hitRef.current = projected;

      // Spherical latitude lines and meridian lines stay locked to the same dome geometry.
      ctx.save();
      ctx.lineWidth = 0.85;
      ctx.strokeStyle = "rgba(89,176,239,0.38)";

      for (let row = 0; row <= ROWS; row += 1) {
        const latitude = latitudeTop - row * latitudeStep;
        const startLongitude = (visibleSectors[0] - 1) * STEP - state.yaw - visibleCenterOffset - STEP / 2;
        const endLongitude = (visibleSectors[VISIBLE_SECTORS - 1] - 1) * STEP - state.yaw - visibleCenterOffset + STEP / 2;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i <= 48; i += 1) {
          const longitude = startLongitude + ((endLongitude - startLongitude) * i) / 48;
          const point = pitchPoint(spherePoint(latitude, longitude), state.pitch);
          const q = project(point, radius, cx, cy);
          if (!started) {
            ctx.moveTo(q.x, q.y);
            started = true;
          } else {
            ctx.lineTo(q.x, q.y);
          }
        }
        ctx.globalAlpha = row >= 8 ? 0.62 : 1;
        ctx.stroke();
      }

      for (let index = 0; index <= VISIBLE_SECTORS; index += 1) {
        const longitude = (visibleSectors[0] - 1) * STEP - state.yaw - visibleCenterOffset - STEP / 2 + index * STEP;
        ctx.beginPath();
        let started = false;
        for (let i = 0; i <= 44; i += 1) {
          const latitude = latitudeBottom + ((latitudeTop - latitudeBottom) * i) / 44;
          const point = pitchPoint(spherePoint(latitude, longitude), state.pitch);
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
        const row = rowOf(item.parcel);
        const bottomFade = 1 - Math.max(0, row - 7) * 0.16;
        const depthAlpha = clamp(0.22 + item.depth * 0.42, 0.10, 0.66) * bottomFade;

        ctx.beginPath();
        item.points.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
        ctx.closePath();
        ctx.fillStyle = selected ? `${color}55` : `rgba(5,24,45,${Math.max(0.12, depthAlpha * 0.42).toFixed(2)})`;
        ctx.fill();
        ctx.lineWidth = selected ? 2.25 : 1.2;
        ctx.strokeStyle = selected ? color : `${color}${Math.round(clamp(depthAlpha, 0.16, 0.82) * 255).toString(16).padStart(2, "0")}`;
        ctx.stroke();

        const fontSize = clamp(width / 118, 7, 10);
        ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = selected ? "#fff8dc" : "rgba(237,248,255,0.94)";
        ctx.fillText(`S${String(sectorOf(item.parcel)).padStart(3, "0")}`, item.center.x, item.center.y);

        if (selected) {
          ctx.save();
          ctx.shadowColor = color;
          ctx.shadowBlur = 20;
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.7;
          ctx.beginPath();
          item.points.forEach((point, index) => index === 0 ? ctx.moveTo(point.x, point.y) : ctx.lineTo(point.x, point.y));
          ctx.closePath();
          ctx.stroke();
          ctx.restore();

          // Star marker inside the selected parcel.
          ctx.save();
          ctx.translate(item.center.x, item.center.y);
          ctx.fillStyle = "#fff7cf";
          ctx.beginPath();
          for (let i = 0; i < 10; i += 1) {
            const angle = -Math.PI / 2 + (i * Math.PI) / 5;
            const radiusStar = i % 2 === 0 ? 6 : 2.4;
            const x = Math.cos(angle) * radiusStar;
            const y = Math.sin(angle) * radiusStar;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.restore();

          const code = item.parcel.parcel_number;
          ctx.font = "700 11px Inter, system-ui, sans-serif";
          const boxWidth = ctx.measureText(code).width + 24;
          const boxX = clamp(item.center.x + 16, 8, width - boxWidth - 8);
          const boxY = clamp(item.center.y - 43, 8, height - 36);
          ctx.fillStyle = "rgba(3,14,30,0.96)";
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.2;
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

      // Soft outer dome arc: blue atmosphere above, transparent disappearance below. No yellow baseline.
      ctx.save();
      ctx.lineWidth = 1.55;
      ctx.shadowColor = "rgba(76,174,255,0.32)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius, radius * 0.98, 0, Math.PI, TAU);
      const rim = ctx.createLinearGradient(0, cy - radius, 0, cy);
      rim.addColorStop(0, "rgba(115,203,255,0.62)");
      rim.addColorStop(0.58, "rgba(78,171,241,0.28)");
      rim.addColorStop(1, "rgba(78,171,241,0.02)");
      ctx.strokeStyle = rim;
      ctx.stroke();
      ctx.restore();

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

    // Correct natural direction: right drag -> right, left drag -> left.
    state.yaw += dx * 0.008;
    // Correct natural vertical direction: up drag -> view rises, down drag -> view lowers.
    state.pitch += -dy * 0.0058;
    state.pitch = clamp(state.pitch, -0.48, 0.48);
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
      // Pointer capture may already be released.
    }
  };

  const click = (event: MouseEvent<HTMLCanvasElement>) => {
    const state = stateRef.current;
    if (state.moved) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let selected: ProjectedParcel | null = null;
    for (const item of hitRef.current) {
      if (!pointInPolygon(x, y, item.points)) continue;
      if (!selected || item.depth > selected.depth) selected = item;
    }
    if (selected) onSelectRef.current(selected.parcel.id);
  };

  const wheel = (event: WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    stateRef.current.zoom = clamp(stateRef.current.zoom - event.deltaY * 0.0007, 0.82, 1.18);
  };

  const reset = () => {
    stateRef.current.yaw = 0;
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
          ref={canvasRef}
          className="block h-[430px] w-full touch-none cursor-grab active:cursor-grabbing sm:h-[520px]"
          aria-label={`${cityName} için havada duran interaktif dijital gökyüzü kubbesi`}
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
