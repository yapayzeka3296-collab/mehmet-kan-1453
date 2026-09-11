import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV14 } from "@/components/sky-scan/SkyScanExperienceV14";

function SkyScanRoute() {
  return <SkyScanExperienceV14 />;
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanRoute });
