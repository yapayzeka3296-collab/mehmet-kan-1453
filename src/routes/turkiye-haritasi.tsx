import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { LegacySkyMapView } from "@/components/LegacySkyMapView";
import { CityParcelGridPage } from "@/components/CityParcelGridPage";

export const Route = createFileRoute("/turkiye-haritasi")({ component: SkyMapPage });

function SkyMapPage() {
  const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
  const city = params.get("city");
  return <div className="min-h-screen bg-slate-950 text-white"><SiteHeader />{city ? <CityParcelGridPage slug={city} /> : <LegacySkyMapView />}</div>;
}
