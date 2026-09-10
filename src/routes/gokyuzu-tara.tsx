import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV4 } from "@/components/sky-scan/SkyScanExperienceV4";
import { SkyScanSensorBridge } from "@/components/sky-scan/SkyScanSensorBridge";

function SkyScanRoute() {
  return (
    <SkyScanSensorBridge>
      <SkyScanExperienceV4 />
    </SkyScanSensorBridge>
  );
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanRoute });
