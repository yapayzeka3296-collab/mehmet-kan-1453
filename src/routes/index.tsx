import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { MySkyParcelEarthGlobeSafe as MySkyParcelEarthGlobe } from "@/components/MySkyParcelEarthGlobeSafe";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "MySkyParcel — Gökyüzünde Kendi Parselini Seç" }, { name: "description", content: "81 il, 81 milyon parsel. Türkiye'den dünyaya açılan MySkyParcel projesini keşfet." }] }),
  component: Landing,
});

function Landing() {
  return (
    <main className="relative z-0 isolate min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_45%,rgba(34,211,238,0.08),transparent_38%),linear-gradient(180deg,rgba(1,4,11,0.12),rgba(1,4,11,0.3))]" />

      <div className="relative z-20 flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="pointer-events-auto relative z-30 flex w-full max-w-2xl flex-col items-center text-center">
          <Logo />
          <div className="mt-3 max-w-[520px] drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
            <p className="text-[9px] font-semibold tracking-[0.12em] text-cyan-100 sm:text-[10px]">81 İL · 81 MİLYON PARSEL</p>
            <p className="mt-1 text-[10px] font-medium text-foreground/90 sm:text-xs">Türkiye'den dünyaya açılacak bir proje.</p>
            <h1 className="mt-2 text-base font-bold leading-tight tracking-tight text-white sm:text-xl lg:text-2xl">GÖKYÜZÜNDE KENDİ PARSELİNİ SEÇ.</h1>
            <p className="mt-1.5 text-[10px] leading-4 text-foreground/85 sm:text-xs sm:leading-5">Gökyüzündeki yerini keşfet.<br />Şehrini seç, parselini seç ve sana ait dijital gökyüzü parselini oluştur.</p>
          </div>
        </div>

        <div className="relative z-20 mt-2 flex h-[min(68vh,560px)] w-full min-w-0 max-w-[900px] items-center justify-center overflow-hidden sm:mt-4 lg:h-[min(72vh,640px)]">
          <MySkyParcelEarthGlobe className="relative z-20 h-full w-full min-w-0 max-w-full overflow-hidden rounded-none border-0 bg-transparent shadow-none" />
        </div>
      </div>

      <div className="msp-ui-layer absolute right-4 top-4 z-40 sm:right-8 sm:top-8 lg:right-10 lg:top-8">
        <Link to="/turkiye-haritasi" aria-label="Parsel seçim haritasına git" className="pointer-events-auto inline-flex items-center justify-center rounded-xl border border-cyan-200/80 bg-cyan-300 px-5 py-2.5 text-xs font-bold tracking-[0.08em] text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200 sm:px-6 sm:py-3 sm:text-sm">PARSELE GİT →</Link>
      </div>
    </main>
  );
}
