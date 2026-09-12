import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV16 } from "@/components/sky-scan/SkyScanExperienceV16";

function SkyScanRoute() {
  return <SkyScanExperienceV16 />;
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanRoute });
