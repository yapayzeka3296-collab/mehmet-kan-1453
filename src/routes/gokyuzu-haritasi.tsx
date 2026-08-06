import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Search, Star } from "lucide-react";
import globe from "@/assets/globe.png";
import heroCity from "@/assets/hero-city.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/gokyuzu-haritasi")({
  head: () => ({
    meta: [
      { title: "Gökyüzü Haritası — MySkyParcel" },
      { name: "description", content: "Etkileşimli gökyüzü haritasından şehrini, katmanını ve sektörünü seç." },
      { property: "og:title", content: "Gökyüzü Haritası — MySkyParcel" },
      { property: "og:description", content: "10 katman, 100 sektör, 10.000 parsel arasından seç." },
    ],
  }),
  component: Harita,
});

const CITIES = ["İstanbul", "Ankara", "İzmir", "Gaziantep", "Trabzon", "Antalya", "Bursa", "Konya", "Adana"];

function Harita() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-4 py-12 lg:px-8">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">GÖKYÜZÜ HARİTASI</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">
            Şehrini seç, katman ve sektörü belirle, sana özel parseli haritadan işaretle.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="panel grid content-start gap-5 p-5">
            <div className="flex items-center gap-2 rounded-md border border-input bg-background/50 px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                placeholder="Şehir ara..."
                className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none"
              />
            </div>
            <ul className="grid gap-1">
              {CITIES.map((c, i) => (
                <li key={c}>
                  <button
                    className={`flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm ${
                      i === 3 ? "border border-gold/50 bg-accent text-gold" : "hover:bg-accent hover:text-gold"
                    }`}
                  >
                    <MapPin className="h-4 w-4 shrink-0" /> {c}
                  </button>
                </li>
              ))}
            </ul>
            <label className="block">
              <span className="text-xs text-muted-foreground">Katman</span>
              <select className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none">
                {Array.from({ length: 10 }).map((_, i) => (
                  <option key={i}>{`K${String(i + 1).padStart(2, "0")} (${i + 1}. Katman)`}</option>
                ))}
              </select>
            </label>
            <button className="btn-gold rounded-md py-3 text-[11px]">PARSELİ SEÇ</button>
          </aside>

          <div className="panel relative min-h-[520px] overflow-hidden p-6">
            <img
              src={heroCity}
              alt=""
              aria-hidden
              loading="lazy"
              width={1920}
              height={1088}
              className="absolute inset-x-0 bottom-0 h-1/2 w-full object-cover opacity-50"
            />
            <img
              src={globe}
              alt="Gökyüzü parsel ızgarası"
              loading="lazy"
              width={1024}
              height={1024}
              className="relative mx-auto h-[420px] w-auto opacity-70 mix-blend-screen"
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded border border-gold px-6 py-8 text-center">
              <span className="rounded bg-background/80 px-2 py-1 text-[11px] text-gold">
                GZT-K05-S042-P07
              </span>
              <Star className="mx-auto mt-4 h-5 w-5 text-gold" />
            </div>
            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-md bg-navy-deep/80 px-4 py-2">
              <MapPin className="h-5 w-5 text-gold" />
              <span className="text-sm font-semibold">
                GAZİANTEP <span className="block text-[10px] text-muted-foreground">MERKEZ</span>
              </span>
            </div>
          </div>
        </div>
      </main>
      <TrustBar />
      <SiteFooter />
    </div>
  );
}
