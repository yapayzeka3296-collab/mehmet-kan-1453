import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { CityParcelGridPage } from "@/components/CityParcelGridPage";

export const Route = createFileRoute("/sehir/$slug")({ component: CityPage });

function CityPage() {
  const { slug } = Route.useParams();
  return <div className="min-h-screen bg-slate-950 text-white"><SiteHeader /><CityParcelGridPage slug={slug} /></div>;
}
