import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV12 } from "@/components/sky-scan/SkyScanExperienceV12";

function SkyScanRoute() {
  return <SkyScanExperienceV12 />;
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanRoute });
