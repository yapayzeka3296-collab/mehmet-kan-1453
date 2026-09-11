import { createFileRoute } from "@tanstack/react-router";
import { SkyScanARRealistic } from "@/components/sky-scan/SkyScanARRealistic";

function SkyScanRoute() {
  return <SkyScanARRealistic />;
}

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanRoute });
