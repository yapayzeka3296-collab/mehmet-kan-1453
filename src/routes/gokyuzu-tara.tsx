import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV15 } from "@/components/sky-scan/SkyScanExperienceV15";

function SkyScanRoute() {
  return <SkyScanExperienceV15 />;
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanRoute });
