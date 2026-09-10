import { createFileRoute } from "@tanstack/react-router";
import { Camera, Compass, MapPin } from "lucide-react";

export const Route = createFileRoute("/gokyuzu-tara")({ component: SkyScanPage });

function SkyScanPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative z-10 flex items-center gap-3">
          <a
            href="/"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
          >
            ← Geri
          </a>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">MySkyParcel</p>
            <h1 className="font-display text-xl font-semibold sm:text-2xl">🌌 Gökyüzünü Tara</h1>
          </div>
        </header>

        <div className="relative mt-6 flex flex-1 items-center justify-center overflow-hidden rounded-3xl border border-cyan-300/15 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.10),transparent_42%)]" />

          <div className="relative z-10 flex max-w-md flex-col items-center px-6 py-16 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-300 shadow-lg shadow-cyan-950/40">
              <Camera className="h-9 w-9" />
            </div>
            <h2 className="text-2xl font-semibold sm:text-3xl">Gökyüzünü taramaya hazır</h2>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Bu sayfa yeni tarama sistemi için bağımsız bir alan olarak hazırlanıyor. Mevcut parsel,
              harita, sepet ve ödeme sistemi bu aşamada değiştirilmedi.
            </p>

            <div className="mt-7 grid w-full gap-3 text-left sm:grid-cols-3">
              <StatusCard icon={<MapPin className="h-4 w-4" />} label="Konum" value="Hazır değil" />
              <StatusCard icon={<Compass className="h-4 w-4" />} label="Yön" value="Hazır değil" />
              <StatusCard icon={<Camera className="h-4 w-4" />} label="Kamera" value="Hazır değil" />
            </div>

            <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/45">
              İlk aşama: yalnızca sayfa iskeleti. Sensör ve parsel verisi sonraki kontrollü aşamalarda eklenecek.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatusCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center gap-2 text-cyan-300">{icon}<span className="text-xs font-medium">{label}</span></div>
      <p className="mt-2 text-xs text-white/50">{value}</p>
    </div>
  );
}
