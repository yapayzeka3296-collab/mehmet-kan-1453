import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV13 } from "@/components/sky-scan/SkyScanExperienceV13";

function SkyScanRoute() {
  return <SkyScanExperienceV13 />;
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanRoute });
