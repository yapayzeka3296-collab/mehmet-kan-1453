import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { MySkyParcelEarthGlobe } from "@/components/MySkyParcelEarthGlobe";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MySkyParcel — Gökyüzünde Kendi Parselini Seç" },
      { name: "description", content: "81 il, 81 milyon parsel. Türkiye'den dünyaya açılan MySkyParcel projesini keşfet." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#01040b] text-white">
      <MySkyParcelEarthGlobe className="h-screen rounded-none border-0 shadow-none" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(34,211,238,0.08),transparent_32%),linear-gradient(180deg,rgba(1,4,11,0.12),rgba(1,4,11,0.3))]" />

      <div className="absolute left-4 top-4 z-40 sm:left-8 sm:top-8 lg:left-12 lg:top-10">
        <div className="pointer-events-auto flex flex-col items-start">
          <Logo />
          <div className="mt-3 max-w-[260px] bg-transparent p-0 text-left">
            <p className="text-[9px] font-semibold tracking-[0.12em] text-cyan-100 sm:text-[10px]">81 İL · 81 MİLYON PARSEL</p>
            <p className="mt-1 text-[10px] font-medium text-white/85 sm:text-xs">Türkiye'den dünyaya açılacak bir proje.</p>
            <h1 className="mt-2 text-base font-bold leading-tight tracking-tight sm:text-xl">GÖKYÜZÜNDE KENDİ PARSELİNİ SEÇ.</h1>
            <p className="mt-1.5 text-[10px] leading-4 text-white/80 sm:text-xs sm:leading-5">Gökyüzündeki yerini keşfet.<br />Şehrini seç, parselini seç ve sana ait dijital gökyüzü parselini oluştur.</p>
          </div>
        </div>
      </div>

      <div className="absolute right-4 top-4 z-40 sm:right-8 sm:top-8 lg:right-12 lg:top-10">
        <Link to="/ana-sayfa" className="inline-flex items-center justify-center rounded-xl border border-cyan-200/70 bg-cyan-300 px-5 py-2.5 text-xs font-bold tracking-[0.08em] text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200 sm:px-6 sm:py-3 sm:text-sm">PARSELİNİ KEŞFET →</Link>
      </div>
    </main>
  );
}
