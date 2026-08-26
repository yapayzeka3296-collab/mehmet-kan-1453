import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { MySkyParcelEarthGlobe } from "@/components/MySkyParcelEarthGlobe";
import { LegacySkyMapView } from "@/components/LegacySkyMapView";

export const Route = createFileRoute("/gokyuzu-haritasi")({
  head: () => ({
    meta: [
      { title: "Gökyüzü Haritası — MySkyParcel" },
      { name: "description", content: "MySkyParcel 3D Dünya küresi ve Türkiye il sınırları." },
    ],
  }),
  component: Harita,
});

function Harita() {
  const search = useSearch({ from: "/gokyuzu-haritasi" }) as { view?: string };
  const [zoomHint, setZoomHint] = useState(false);

  if (search.view === "legacy") return <LegacySkyMapView />;

  return (
    <main className="min-h-screen bg-[#01040b]">
      <div
        className="relative"
        onWheel={(event) => {
          if (event.deltaY > 0) return;
          if (Math.abs(event.deltaY) > 18) setZoomHint(true);
        }}
      >
        <MySkyParcelEarthGlobe />
        {zoomHint && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              className="pointer-events-auto rounded-2xl border border-cyan-300/40 bg-[#06131d]/90 px-6 py-4 text-sm font-semibold text-white shadow-2xl shadow-cyan-950/40 backdrop-blur-xl transition hover:border-cyan-200 hover:bg-[#09202d]"
              onClick={() => { window.location.href = "/gokyuzu-haritasi?view=legacy"; }}
            >
              Haritaya Gir
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
