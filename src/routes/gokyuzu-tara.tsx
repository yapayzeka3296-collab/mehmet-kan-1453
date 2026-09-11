import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV7 } from "@/components/sky-scan/SkyScanExperienceV7";

function SkyScanRoute() {
  return <SkyScanExperienceV7 />;
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanRoute });
