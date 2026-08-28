import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { LegacySkyMapView } from "@/components/LegacySkyMapView";
import { CityParcelLivePage } from "@/components/CityParcelLivePage";

export const Route = createFileRoute("/turkiye-haritasi")({
  head: () => ({
    links: [{ rel: "preload", href: "/images/cities/turkey-3d-map.png", as: "image", type: "image/png", fetchpriority: "high" }],
  }),
  component: SkyMapPage,
});

function SkyMapPage() {
  const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
  const city = params.get("city");
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      {city ? <CityParcelLivePage slug={city} /> : <LegacySkyMapView />}
    </div>
  );
}
