import { useEffect, useMemo, useRef, useState } from "react";
import { CITY_IMAGES } from "@/lib/cityImages";
import type { Parcel } from "@/types/parcel";

const MAX_VISIBLE_PARCELS = 84;
const GRID_COLS = 12;
const GRID_ROWS = 7;

// The Gaziantep city photo is used only as the visual background. Parcel
// outlines/numbers are rendered from the project's own parcel records.
type Position = { x: number; y: number };
type DragState = { id: string; offsetX: number; offsetY: number } | null;

type Props = {
  parcels: Parcel[];
  onSelect?: (id: string | null) => void;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function GaziantepInteractiveParcelScene({ parcels, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState>(null);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const gaziantepParcels = useMemo(
    () => parcels.filter((parcel) => parcel.city_slug === "gaziantep").slice(0, MAX_VISIBLE_PARCELS),
    [parcels],
  );

  useEffect(() => {
    setPositions((current) => {
      const next = { ...current };
      gaziantepParcels.forEach((parcel, index) => {
        if (!next[parcel.id]) {
          next[parcel.id] = {
            x: (index % GRID_COLS) * (100 / GRID_COLS),
            y: Math.floor(index / GRID_COLS) * (100 / GRID_ROWS),
          };
        }
      });
      return next;
    });
  }, [gaziantepParcels]);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>, parcel: Parcel) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    const position = positions[parcel.id] ?? { x: 0, y: 0 };
    dragRef.current = {
      id: parcel.id,
      offsetX: event.clientX - rect.left - (position.x / 100) * rect.width,
      offsetY: event.clientY - rect.top - (position.y / 100) * rect.height,
    };
    setActiveId(parcel.id);
    onSelect?.(parcel.id);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;

    const cellWidth = 100 / GRID_COLS;
    const cellHeight = 100 / GRID_ROWS;
    const x = clamp(((event.clientX - rect.left - drag.offsetX) / rect.width) * 100, 0, 100 - cellWidth);
    const y = clamp(((event.clientY - rect.top - drag.offsetY) / rect.height) * 100, 0, 100 - cellHeight);

    setPositions((current) => ({ ...current, [drag.id]: { x, y } }));
  };

  const endDrag = (event?: React.PointerEvent<HTMLDivElement>) => {
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setActiveId(null);
  };

  return (
    <section className="mt-5 overflow-hidden rounded-3xl border border-amber-200/20 bg-slate-950/80 p-2 shadow-2xl sm:p-3">
      <div className="mb-2 px-2 py-1">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-100">
          Gaziantep Gökyüzü Parselleri
        </p>
        <p className="mt-1 text-[10px] text-white/50">
          Görseldeki hazır parseller kaldırıldı. Buradaki parseller MySkyParcel kayıtlarından gelir ve sürüklenebilir.
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-slate-900 select-none touch-none"
      >
        <img
          src={CITY_IMAGES.GZT}
          alt="Gaziantep şehir görünümü"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        <div className="absolute inset-0 bg-slate-950/10" aria-hidden="true" />

        {gaziantepParcels.map((parcel) => {
          const position = positions[parcel.id] ?? { x: 0, y: 0 };
          const isActive = activeId === parcel.id;

          return (
            <div
              key={parcel.id}
              aria-label={`Parsel ${parcel.parcel_number}`}
              className={`absolute flex cursor-grab items-center justify-center rounded-sm border border-amber-200/80 bg-slate-950/25 text-[9px] font-semibold text-white shadow-sm backdrop-blur-[1px] transition-shadow active:cursor-grabbing sm:text-[10px] ${isActive ? "z-20 shadow-2xl ring-2 ring-amber-200/70" : "z-10"}`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: `${100 / GRID_COLS}%`,
                height: `${100 / GRID_ROWS}%`,
              }}
              onPointerDown={(event) => startDrag(event, parcel)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              {parcel.parcel_number}
            </div>
          );
        })}

        {gaziantepParcels.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs text-white/80 backdrop-blur">
              Gaziantep için henüz parsel kaydı bulunamadı.
            </div>
          </div>
        )}

        {activeId && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 z-30 -translate-x-1/2 rounded-full border border-amber-200/20 bg-black/60 px-3 py-1 text-[10px] text-white/80 backdrop-blur">
            Parsel taşınıyor
          </div>
        )}
      </div>
    </section>
  );
}
