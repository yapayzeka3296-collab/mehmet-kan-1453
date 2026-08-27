import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { CityParcelLivePage } from "@/components/CityParcelLivePage";

export const Route = createFileRoute("/gokyuzu-haritasi")({ component: SkyMapPage });

function SkyMapPage() {
  const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
  const city = params.get("city") || "istanbul";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <CityParcelLivePage slug={city} />
    </div>
  );
}
