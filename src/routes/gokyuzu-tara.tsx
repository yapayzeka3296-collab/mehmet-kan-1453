import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV10 } from "@/components/sky-scan/SkyScanExperienceV10";

function SkyScanRoute() {
  return <SkyScanExperienceV10 />;
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanRoute });
