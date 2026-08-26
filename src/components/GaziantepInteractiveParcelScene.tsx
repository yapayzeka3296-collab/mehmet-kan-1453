import { useMemo, useRef, useState } from "react";

const COLS = 12;
const ROWS = 7;

type Parcel = { id: string; x: number; y: number; label: string };

const initialParcels: Parcel[] = Array.from({ length: COLS * ROWS }, (_, index) => ({
  id: `gzt-${index + 1}`,
  x: (index % COLS) * (100 / COLS),
  y: Math.floor(index / COLS) * (100 / ROWS),
  label: `${String.fromCharCode(65 + Math.floor(index / COLS))}${(index % COLS) + 1}`,
}));

/**
 * Gaziantep city artwork with an independent draggable parcel overlay.
 * The artwork remains untouched; parcel cells are a transparent interaction layer.
 */
export function GaziantepInteractiveParcelScene() {
  const [parcels, setParcels] = useState(initialParcels);
  const [activeId, setActiveId] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
    }),
    [],
  );

  const startDrag = (event: React.PointerEvent<HTMLDivElement>, parcel: Parcel) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const rect = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;
    dragRef.current = {
      id: parcel.id,
      offsetX: event.clientX - rect.left - (parcel.x / 100) * rect.width,
      offsetY: event.clientY - rect.top - (parcel.y / 100) * rect.height,
    };
    setActiveId(parcel.id);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const rect = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(100 - 100 / COLS, ((event.clientX - rect.left - drag.offsetX) / rect.width) * 100));
    const y = Math.max(0, Math.min(100 - 100 / ROWS, ((event.clientY - rect.top - drag.offsetY) / rect.height) * 100));
    setParcels((current) => current.map((item) => (item.id === drag.id ? { ...item, x, y } : item)));
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <section className="mt-5 overflow-hidden rounded-3xl border border-amber-200/20 bg-slate-950/80 p-2 shadow-2xl sm:p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-2 py-1">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-100">Gaziantep Gökyüzü Parselleri</p>
          <p className="mt-1 text-[10px] text-white/50">Parselleri fareyle veya parmağınla tutup hareket ettir.</p>
        </div>
        {activeId && <span className="rounded-full border border-amber-200/30 bg-amber-100/10 px-3 py-1 text-[10px] text-amber-100">Seçili: {parcels.find((p) => p.id === activeId)?.label}</span>}
      </div>

      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-slate-900 select-none touch-none">
        <img src="/gaziantep-parcels.png" alt="Gaziantep gökyüzü parselleri" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={gridStyle}>
          {parcels.map((parcel) => (
            <div
              key={parcel.id}
              className="absolute h-[14.2857%] w-[8.3333%] cursor-grab border border-cyan-100/20 bg-cyan-100/[0.025] transition hover:border-amber-200/70 hover:bg-amber-100/[0.06] active:cursor-grabbing"
              style={{ left: `${parcel.x}%`, top: `${parcel.y}%` }}
              onPointerDown={(event) => startDrag(event, parcel)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onDoubleClick={() => setActiveId(parcel.id)}
              title={`${parcel.label} — sürükle`}
            >
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-semibold text-white/55 sm:text-[10px]">{parcel.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
