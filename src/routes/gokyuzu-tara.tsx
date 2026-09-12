import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV17 } from "@/components/sky-scan/SkyScanExperienceV17";

function SkyScanRoute() {
  return <SkyScanExperienceV17 />;
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanRoute });
