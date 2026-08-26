import { createFileRoute } from "@tanstack/react-router";
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
  const showLegacyMap = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("view") === "legacy";

  if (showLegacyMap) return <LegacySkyMapView />;

  return (
    <main className="min-h-screen bg-[#01040b]">
      <div className="relative">
        <MySkyParcelEarthGlobe />
        <div className="pointer-events-none absolute right-4 top-4 z-20 md:right-6 md:top-6">
          <button
            type="button"
            className="pointer-events-auto rounded-xl border border-cyan-300/50 bg-[#06131d]/90 px-4 py-3 text-sm font-semibold text-white shadow-2xl shadow-cyan-950/40 backdrop-blur-xl transition hover:border-cyan-200 hover:bg-[#09202d]"
            onClick={() => { window.location.href = "/gokyuzu-haritasi?view=legacy"; }}
          >
            Türkiye Haritasına Gir
          </button>
        </div>
      </div>
    </main>
  );
}
