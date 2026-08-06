import { createFileRoute } from "@tanstack/react-router";
import { Award, Download } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/sertifikalarim")({
  head: () => ({
    meta: [
      { title: "Sertifikalarım — MySkyParcel" },
      { name: "description", content: "Gökyüzü parsellerine ait dijital sertifikalarını görüntüle ve indir." },
      { property: "og:title", content: "Sertifikalarım — MySkyParcel" },
      { property: "og:description", content: "Dijital sertifika arşivin." },
    ],
  }),
  component: Sertifikalarim,
});

const CERTS = [
  { city: "Gaziantep", code: "GZT-K05-S042-P07", no: "SP-GZT-0004207", date: "20.05.2024" },
  { city: "İstanbul", code: "IST-K02-S018-P15", no: "SP-IST-0003891", date: "15.04.2024" },
  { city: "Konya", code: "KON-K06-S067-P03", no: "SP-KON-0003456", date: "10.03.2024" },
];

function Sertifikalarim() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/sertifikalarim" />
        <div className="min-w-0">
          <div className="panel p-6">
            <h1 className="font-display text-3xl font-bold">SERTİFİKALARIM</h1>
            <p className="mt-2 text-xs text-muted-foreground">3 sertifikanız bulunuyor.</p>
          </div>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {CERTS.map((c) => (
              <li key={c.no} className="panel p-5 text-center">
                <div className="grid h-44 place-items-center rounded-lg border border-gold/40 bg-navy">
                  <Award className="h-12 w-12 text-gold" />
                </div>
                <p className="mt-4 font-display text-lg">{c.city}</p>
                <p className="text-xs text-gold">{c.code}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Sertifika No: {c.no} · {c.date}
                </p>
                <button className="btn-gold mt-4 flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-[11px]">
                  <Download className="h-4 w-4" /> İNDİR
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <TrustBar items={SECURITY_TRUST} />
      <SiteFooter />
    </div>
  );
}
