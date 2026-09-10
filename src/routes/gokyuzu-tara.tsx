import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV3 } from "@/components/sky-scan/SkyScanExperienceV3";
import { SkyScanNightVision } from "@/components/sky-scan/SkyScanNightVision";
import { SkyScanSensorBridge } from "@/components/sky-scan/SkyScanSensorBridge";

function SkyScanPage() {
  return (
    <SkyScanSensorBridge>
      <SkyScanNightVision>
        <SkyScanExperienceV3 />
      </SkyScanNightVision>
    </SkyScanSensorBridge>
  );
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanPage });
