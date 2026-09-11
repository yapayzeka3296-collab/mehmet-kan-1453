import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV9 } from "@/components/sky-scan/SkyScanExperienceV9";

function SkyScanRoute() {
  return <SkyScanExperienceV9 />;
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanRoute });
