import { createFileRoute } from "@tanstack/react-router";
import { LegacySkyMapView } from "@/components/LegacySkyMapView";

export const Route = createFileRoute("/turkiye-haritasi")({ component: SkyMapPage });

function SkyMapPage() {
  return <LegacySkyMapView />;
}
