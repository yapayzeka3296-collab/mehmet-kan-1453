import { useEffect, useMemo, useRef, useState } from "react";
import { CITY_IMAGES } from "@/lib/cityImages";
import type { Parcel } from "@/types/parcel";

type Position = { x: number; y: number };
type DragState = { id: string; offsetX: number; offsetY: number } | null;

type Props = {
  parcels: Parcel[];
  onSelect?: (id: string | null) => void;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

/**
 * Gaziantep's supplied city artwork is only the visual background. Parcel
 * labels are rendered from the real MySkyParcel records on top of it.
 *
 * The database does not store parcel polygons, so the stable layer/sector
 * hierarchy is used for the initial visual layout. This keeps the exact set
 * of database parcels (no synthetic parcels) while giving every parcel its
 * own draggable position over the artwork.
 */
export function GaziantepInteractiveParcelScene({ parcels, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState>(null);
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const gaziantepParcels = useMemo(
    () => parcels.filter((parcel) => parcel.city_slug === "gaziantep"),
    [parcels],
  );

  const initialPositions = useMemo(() => {
    if (!gaziantepParcels.length) return {};

    const withHierarchy = gaziantepParcels.filter(
      (parcel) => Number.isFinite(parcel.layer_number) && Number.isFinite(parcel.sector_number),
    );

    // Prefer the production hierarchy: up to 10 layers x 100 sectors.
    if (withHierarchy.length) {
      const maxLayer = Math.max(1, ...withHierarchy.map((parcel) => parcel.layer_number ?? 1));
      const maxSector = Math.max(1, ...withHierarchy.map((parcel) => parcel.sector_number ?? 1));
      const next: Record<string, Position> = {};

      withHierarchy.forEach((parcel) => {
        const layer = parcel.layer_number ?? 1;
        const sector = parcel.sector_number ?? 1;
        next[parcel.id] = {
          x: 4 + ((sector - 1) / Math.max(1, maxSector - 1)) * 92,
          y: 4 + ((layer - 1) / Math.max(1, maxLayer - 1)) * 92,
        };
      });

      // Records without hierarchy are placed from their stored coordinates.
      const remaining = gaziantepParcels.filter((parcel) => !next[parcel.id]);
      if (!remaining.length) return next;

      const lats = remaining.map((parcel) => parcel.latitude);
      const lngs = remaining.map((parcel) => parcel.longitude);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const latSpan = Math.max(maxLat - minLat, 0.000001);
      const lngSpan = Math.max(maxLng - minLng, 0.000001);

      remaining.forEach((parcel) => {
        next[parcel.id] = {
          x: 4 + ((parcel.longitude - minLng) / lngSpan) * 92,
          y: 4 + ((maxLat - parcel.latitude) / latSpan) * 92,
        };
      });
      return next;
    }

    const lats = gaziantepParcels.map((parcel) => parcel.latitude);
    const lngs = gaziantepParcels.map((parcel) => parcel.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latSpan = Math.max(maxLat - minLat, 0.000001);
    const lngSpan = Math.max(maxLng - minLng, 0.000001);

    return Object.fromEntries(
      gaziantepParcels.map((parcel) => [
        parcel.id,
        {
          x: 4 + ((parcel.longitude - minLng) / lngSpan) * 92,
          y: 4 + ((maxLat - parcel.latitude) / latSpan) * 92,
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
    const position = positions[parcel.id] ?? initialPositions[parcel.id] ?? { x: 4, y: 4 };
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
          MySkyParcel kayıtları görselin üzerine yerleştirilir. Yeni parsel üretilmez; mevcut parseller sürüklenebilir.
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
          const position = positions[parcel.id] ?? initialPositions[parcel.id] ?? { x: 4, y: 4 };
          const isActive = activeId === parcel.id;

          return (
            <div
              key={parcel.id}
              aria-label={`Parsel ${parcel.parcel_number}`}
              className={`absolute flex cursor-grab items-center justify-center rounded-sm border border-amber-200/80 bg-slate-950/25 text-[9px] font-semibold text-white shadow-sm backdrop-blur-[1px] active:cursor-grabbing sm:text-[10px] ${isActive ? "z-20 shadow-2xl ring-2 ring-amber-200/70" : "z-10"}`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                width: "8%",
                height: "8%",
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
