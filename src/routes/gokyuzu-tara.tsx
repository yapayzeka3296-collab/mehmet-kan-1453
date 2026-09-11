import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV5 } from "@/components/sky-scan/SkyScanExperienceV5";

function SkyScanRoute() {
  return <SkyScanExperienceV5 />;
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanRoute });
