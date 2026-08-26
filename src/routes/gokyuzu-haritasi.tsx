import { createFileRoute } from "@tanstack/react-router";
import { MySkyParcelEarthGlobe } from "@/components/MySkyParcelEarthGlobe";

export const Route = createFileRoute("/gokyuzu-haritasi")({
  head: () => ({
    meta: [
      { title: "Gökyüzü Haritası — MySkyParcel" },
      {
        name: "description",
        content: "MySkyParcel 3D Dünya küresi ve Türkiye il sınırları.",
      },
    ],
  }),
  component: Harita,
});

function Harita() {
  return (
    <main className="min-h-screen bg-[#01040b]">
      <MySkyParcelEarthGlobe />
    </main>
  );
}
