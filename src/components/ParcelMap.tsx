import type { Parcel } from "@/types/parcel";
import React, { useMemo } from "react";

type Props = {
  parcels: Parcel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

// Simple equirectangular projection approximation for placing points on the globe image.
function project(lat: number, lon: number) {
  // lat: -90..90 -> y 0..100
  // lon: -180..180 -> x 0..100
  const x = (lon + 180) / 360;
  const y = 1 - (lat + 90) / 180; // invert so north is top
  return { x: x * 100, y: y * 100 };
}

export function ParcelMap({ parcels, selectedId, onSelect }: Props) {
  const points = useMemo(() => parcels.map((p) => ({ id: p.id, pos: project(p.latitude, p.longitude), p })), [parcels]);

  return (
    <div className="relative w-full">
      <div className="relative mx-auto h-[420px] w-auto">
        {/* The underlying globe image is provided by the page; this component overlays clickable points */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* placeholder; actual image lives in parent route */}
        </div>

        {/* Overlay points */}
        <div className="absolute inset-0">
          {points.map((pt) => (
            <button
              key={pt.id}
              aria-label={`Parsel ${pt.p.parcel_number}`}
              onClick={() => onSelect(pt.id)}
              style={{ left: `${pt.pos.x}%`, top: `${pt.pos.y}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-2 shadow-lg transition-transform duration-150 pointer-events-auto ${
                selectedId === pt.id ? "bg-gold scale-110" : "bg-background/80 hover:scale-110"
              }`}
            >
              <span className="sr-only">{pt.p.parcel_number}</span>
              <span className="block h-3 w-3 rounded-full bg-current" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
