import { useRef, useState } from "react";
import gaziantepParcelsImage from "@/assets/images/gaziantep-parcels.png";

// These are invisible hit areas over the parcels that already exist in the artwork.
// They do NOT draw, label, or create any new parcel on top of the image.
const COLS = 12;
const ROWS = 7;

type Parcel = { id: string; x: number; y: number };

const initialParcels: Parcel[] = Array.from({ length: COLS * ROWS }, (_, index) => ({
  id: `gzt-${index + 1}`,
  x: (index % COLS) * (100 / COLS),
  y: Math.floor(index / COLS) * (100 / ROWS),
}));

export function GaziantepInteractiveParcelScene() {
  const [parcels, setParcels] = useState(initialParcels);
  const [activeId, setActiveId] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>, parcel: Parcel) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const container = event.currentTarget.parentElement;
    const rect = container?.getBoundingClientRect();
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

    const x = Math.max(
      0,
      Math.min(100 - 100 / COLS, ((event.clientX - rect.left - drag.offsetX) / rect.width) * 100),
    );
    const y = Math.max(
      0,
      Math.min(100 - 100 / ROWS, ((event.clientY - rect.top - drag.offsetY) / rect.height) * 100),
    );

    setParcels((current) =>
      current.map((item) => (item.id === drag.id ? { ...item, x, y } : item)),
    );
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <section className="mt-5 overflow-hidden rounded-3xl border border-amber-200/20 bg-slate-950/80 p-2 shadow-2xl sm:p-3">
      <div className="mb-2 px-2 py-1">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-100">
          Gaziantep Gökyüzü Parselleri
        </p>
        <p className="mt-1 text-[10px] text-white/50">
          Görseldeki mevcut parsel alanını tutup sürükleyin.
        </p>
      </div>

      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-slate-900 select-none touch-none">
        <img
          src={gaziantepParcelsImage}
          alt="Gaziantep gökyüzü parselleri"
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />

        {/* Invisible interaction layer only. Nothing is drawn over the artwork. */}
        <div className="absolute inset-0">
          {parcels.map((parcel) => (
            <div
              key={parcel.id}
              aria-label="Mevcut parsel"
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                left: `${parcel.x}%`,
                top: `${parcel.y}%`,
                width: `${100 / COLS}%`,
                height: `${100 / ROWS}%`,
                background: "transparent",
                border: "0",
              }}
              onPointerDown={(event) => startDrag(event, parcel)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerLeave={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) moveDrag(event);
              }}
            />
          ))}
        </div>

        {activeId && (
          <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-amber-200/20 bg-black/60 px-3 py-1 text-[10px] text-white/70 backdrop-blur">
            Parsel taşınıyor
          </div>
        )}
      </div>
    </section>
  );
}
