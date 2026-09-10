import { createFileRoute } from "@tanstack/react-router";
import { SkyScanExperience } from "@/components/sky-scan/SkyScanExperience";

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanExperience });
