import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperienceV3 } from "@/components/sky-scan/SkyScanExperienceV3";

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanExperienceV3 });
