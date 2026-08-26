import { useEffect, useMemo, useRef, useState } from "react";
import { CITY_IMAGES } from "@/lib/cityImages";
import type { Parcel } from "@/types/parcel";

type Position = { x: number; y: number };
type DragState = { id: string; offsetX: number; offsetY: number } | null;

type Props = {
  parcels: Parcel[];
  onSelect?: (id: string | null) => void;
};

const MAX_VISIBLE_PARCELS = 84;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function GaziantepInteractiveParcelScene({ parcels, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState>(null);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  // Use the real MySkyParcel records. Never create a second synthetic parcel set.
  const gaziantepParcels = useMemo(
    () => parcels.filter((parcel) => parcel.city_slug === "gaziantep").slice(0, MAX_VISIBLE_PARCELS),
    [parcels],
  );

  // Place the real parcels according to their stored coordinates instead of an
  // artificial 12x7 grid. Dragging then only changes the visual position.
  const initialPositions = useMemo(() => {
    if (!gaziantepParcels.length) return {};

    const lats = gaziantepParcels.map((parcel) => parcel.latitude);
    const lngs = gaziantepParcels.map((parcel) => parcel.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latSpan = Math.max(maxLat - minLat, 0.000001);
    const lngSpan = Math.max(maxLng - minLng, 0.000001);
    const padding = 3;
    const usable = 100 - padding * 2;

    return Object.fromEntries(
      gaziantepParcels.map((parcel) => [
        parcel.id,
        {
          x: padding + ((parcel.longitude - minLng) / lngSpan) * usable,
          y: padding + ((maxLat - parcel.latitude) / latSpan) * usable,
        },
      ]),
    );
  }, [gaziantepParcels]);

  useEffect(() => {
    setPositions((current) => {
      const next = { ...initialPositions };
      Object.entries(current).forEach(([id, position]) => {
        if (gaziantepParcels.some((parcel) => parcel.id === id)) next[id] = position;
      });
      return next;
    });
  }, [initialPositions, gaziantepParcels]);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>, parcel: Parcel) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    const position = positions[parcel.id] ?? initialPositions[parcel.id] ?? { x: 3, y: 3 };
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

    const x = clamp(((event.clientX - rect.left - drag.offsetX) / rect.width) * 100, 0, 92);
    const y = clamp(((event.clientY - rect.top - drag.offsetY) / rect.height) * 100, 0, 92);
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
          MySkyParcel kayıtları kullanılır; eski görsel parselleri kullanılmaz. Parseller sürüklenebilir.
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
          const position = positions[parcel.id] ?? initialPositions[parcel.id] ?? { x: 3, y: 3 };
          const isActive = activeId === parcel.id;

          return (
            <div
              key={parcel.id}
              aria-label={`Parsel ${parcel.parcel_number}`}
              className={`absolute flex cursor-grab items-center justify-center rounded-sm border border-amber-200/80 bg-slate-950/25 text-[9px] font-semibold text-white shadow-sm backdrop-blur-[1px] active:cursor-grabbing sm:text-[10px] ${isActive ? "z-20 shadow-2xl ring-2 ring-amber-200/70" : "z-10"}`}
              style={{ left: `${position.x}%`, top: `${position.y}%`, width: "8%", height: "8%" }}
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
