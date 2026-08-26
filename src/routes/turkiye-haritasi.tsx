import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { TurkeyProvinceMapView } from "@/components/TurkeyProvinceMapView";

export const Route = createFileRoute("/turkiye-haritasi")({ component: TurkeyMapPage });

function TurkeyMapPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <TurkeyProvinceMapView />
    </div>
  );
}
