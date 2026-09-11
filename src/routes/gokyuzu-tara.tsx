import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV5 } from "@/components/sky-scan/SkyScanExperienceV5";
import { SkyScanSensorBridge } from "@/components/sky-scan/SkyScanSensorBridge";

function SkyScanRoute() {
  return (
    <SkyScanSensorBridge>
      <SkyScanExperienceV5 />
    </SkyScanSensorBridge>
  );
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanRoute });
