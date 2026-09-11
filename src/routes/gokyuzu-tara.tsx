import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV6 } from "@/components/sky-scan/SkyScanExperienceV6";

function SkyScanRoute() {
  return <SkyScanExperienceV6 />;
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanRoute });
