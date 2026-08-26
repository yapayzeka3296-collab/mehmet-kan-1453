import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Turkey3DParcelOptimized } from "@/components/Turkey3DParcelOptimized";

export const Route = createFileRoute("/turkiye-haritasi")({ component: SkyMapPage });

function SkyMapPage() {
  return <div className="min-h-screen bg-slate-950 text-white"><SiteHeader/><Turkey3DParcelOptimized/></div>;
}
