import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV8 } from "@/components/sky-scan/SkyScanExperienceV8";

function SkyScanRoute() {
  return <SkyScanExperienceV8 />;
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanRoute });
