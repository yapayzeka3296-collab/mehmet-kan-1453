import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV3 } from "@/components/sky-scan/SkyScanExperienceV3";
import { SkyScanSensorBridge } from "@/components/sky-scan/SkyScanSensorBridge";

function SkyScanPage() {
  return (
    <SkyScanSensorBridge>
      <SkyScanExperienceV3 />
    </SkyScanSensorBridge>
  );
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanPage });
