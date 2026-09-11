import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV11 } from "@/components/sky-scan/SkyScanExperienceV11";

function SkyScanRoute() {
  return <SkyScanExperienceV11 />;
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanRoute });
