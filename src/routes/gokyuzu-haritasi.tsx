import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { MySkyParcelEarthGlobe } from "@/components/MySkyParcelEarthGlobe";

export const Route = createFileRoute("/gokyuzu-haritasi")({
  head: () => ({
    meta: [
      { title: "MySkyParcel — Gökyüzünde Kendi Parselini Seç" },
      { name: "description", content: "81 il, 81 milyon parsel. Türkiye'den dünyaya açılan MySkyParcel projesini keşfet." },
    ],
  }),
  component: Harita,
});

function Harita() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#01040b] text-white">
      <MySkyParcelEarthGlobe className="h-screen rounded-none border-0 shadow-none" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(34,211,238,0.08),transparent_32%),linear-gradient(180deg,rgba(1,4,11,0.12),rgba(1,4,11,0.3))]" />
      <section className="absolute right-4 top-5 z-30 w-[min(92vw,560px)] text-right sm:right-8 sm:top-8 lg:right-12 lg:top-10">
        <div className="flex flex-col items-end">
          <div className="pointer-events-auto rounded-2xl border border-white/10 bg-[#01040b]/45 p-3 shadow-2xl backdrop-blur-md sm:p-4"><Logo /></div>
          <div className="mt-5 max-w-[560px] rounded-2xl border border-white/10 bg-[#01040b]/52 p-5 shadow-2xl backdrop-blur-md sm:p-7">
            <p className="text-xs font-semibold tracking-[0.18em] text-cyan-100 sm:text-sm">81 İL · 81 MİLYON PARSEL</p>
            <p className="mt-2 text-sm font-medium text-white/85 sm:text-base">Türkiye'den dünyaya açılacak bir proje.</p>
            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">GÖKYÜZÜNDE KENDİ PARSELİNİ SEÇ.</h1>
            <p className="mt-4 text-sm leading-6 text-white/80 sm:text-base sm:leading-7">Gökyüzündeki yerini keşfet.<br />Şehrini seç, parselini seç ve sana ait dijital gökyüzü parselini oluştur.</p>
            <Link to="/ana-sayfa" className="pointer-events-auto mt-6 inline-flex items-center justify-center rounded-xl border border-cyan-200/70 bg-cyan-300 px-6 py-3 text-sm font-bold tracking-[0.08em] text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200 sm:px-7 sm:py-3.5">PARSELİNİ KEŞFET →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
