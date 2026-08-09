import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Search } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";
import { SkyParcelDome } from "@/components/SkyParcelDome";
import { ParcelDetailPanel } from "@/components/ParcelDetailPanel";
import { CITY_IMAGES, CITY_IMAGE_FALLBACK } from "@/lib/cityImages";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import type { Parcel } from "@/types/parcel";

export const Route = createFileRoute("/gokyuzu-haritasi")({
  head: () => ({
    meta: [
      { title: "Gökyüzü Haritası — MySkyParcel" },
      { name: "description", content: "Pilot şehirlerdeki MySkyParcel parsellerini 3D dijital gökyüzü kubbesi üzerinden keşfet." },
      { property: "og:title", content: "Gökyüzü Haritası — MySkyParcel" },
      { property: "og:description", content: "İstanbul, Ankara, İzmir, Bursa, Antalya, Kayseri ve Gaziantep parsellerini keşfet." },
    ],
  }),
  component: Harita,
});

const PILOT_CITIES = [
  { code: "IST", slug: "istanbul", name: "İstanbul" },
  { code: "ANK", slug: "ankara", name: "Ankara" },
  { code: "IZM", slug: "izmir", name: "İzmir" },
  { code: "BUR", slug: "bursa", name: "Bursa" },
  { code: "ANT", slug: "antalya", name: "Antalya" },
  { code: "KAY", slug: "kayseri", name: "Kayseri" },
  { code: "GZT", slug: "gaziantep", name: "Gaziantep" },
] as const;

const TIER_BY_NUMBER = (number: number) => number <= 500 ? "digital" : number <= 800 ? "elite" : "premium";
const TIER_PRICE = { digital: 199, elite: 499, premium: 999 } as const;

function Harita() {
  const [selectedCity, setSelectedCity] = useState("GZT");
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedParcel = useMemo(() => parcels.find((parcel) => parcel.id === selectedId) ?? null, [parcels, selectedId]);
  const selectedCityMeta = PILOT_CITIES.find((city) => city.code === selectedCity) ?? PILOT_CITIES[6];
  const selectedCityImage = CITY_IMAGES[selectedCity] ?? CITY_IMAGE_FALLBACK;

  useEffect(() => {
    let mounted = true;

    async function loadParcels() {
      if (!supabaseBrowser) {
        setError("Supabase yapılandırması eksik");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setSelectedId(null);

      try {
        const { data: city, error: cityError } = await supabaseBrowser
          .from("cities")
          .select("id,name,slug")
          .eq("slug", selectedCityMeta.slug)
          .single();

        if (cityError) throw cityError;

        const { data, error: parcelError } = await supabaseBrowser
          .from("parcels")
          .select("id, parcel_number, status, owner_id, price, city_id, latitude, longitude, created_at, updated_at, grid_x, grid_y")
          .eq("city_id", city.id)
          .order("parcel_number")
          .limit(1000);

        if (parcelError) throw parcelError;

        const normalized = ((data ?? []) as Array<Parcel & { grid_x?: number; grid_y?: number }>).map((parcel) => {
          const numericCode = Number(parcel.parcel_number.split("-").pop() ?? 0);
          const tier = TIER_BY_NUMBER(numericCode);
          return { ...parcel, tier, tier_price: TIER_PRICE[tier] } as Parcel;
        });

        if (mounted) setParcels(normalized);
      } catch (err) {
        console.error("Error loading pilot city parcels", err);
        if (mounted) setError("Şehrin gerçek parselleri yüklenemedi. Supabase bağlantısını kontrol edin.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadParcels();
    return () => { mounted = false; };
  }, [selectedCityMeta.slug]);

  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-[1600px] px-4 py-12 lg:px-8">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">GÖKYÜZÜ HARİTASI</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">Küreyi keşfet, pilot şehrini seç ve bir parsele dokun. Parsel kodu yalnızca seçtiğinde gösterilir.</p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="panel grid content-start gap-5 p-5">
            <div className="flex items-center gap-2 rounded-md border border-input bg-background/50 px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input placeholder="Pilot şehir ara..." className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none" aria-label="Pilot şehir ara" />
            </div>

            <div>
              <p className="mb-2 text-xs text-muted-foreground">Pilot şehirler · 1.000 parsel</p>
              <ul className="grid gap-1">
                {PILOT_CITIES.map((city) => (
                  <li key={city.code}>
                    <button type="button" onClick={() => setSelectedCity(city.code)} className={`flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm ${selectedCity === city.code ? "border border-gold/50 bg-accent text-gold" : "hover:bg-accent hover:text-gold"}`}>
                      <MapPin className="h-4 w-4 shrink-0" />{city.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-md border border-gold/20 bg-background/30 p-3 text-xs">
              <p className="font-semibold text-gold">PARSEL STATÜLERİ</p>
              <p className="mt-2 text-muted-foreground">%50 Dijital · 199 TL</p>
              <p className="text-muted-foreground">%30 Elit · 499 TL</p>
              <p className="text-muted-foreground">%20 Premium · 999 TL</p>
            </div>
          </aside>

          <div className="panel relative min-h-[600px] overflow-hidden p-4 sm:p-6">
            <img key={selectedCityImage} src={selectedCityImage} alt={`${selectedCityMeta.name} şehir manzarası`} loading="eager" width={1536} height={864} onError={(event) => { if (event.currentTarget.src.endsWith(CITY_IMAGE_FALLBACK)) return; event.currentTarget.src = CITY_IMAGE_FALLBACK; }} className="absolute inset-0 h-full w-full object-cover opacity-32 transition-all duration-700 scale-[1.02]" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/55 via-background/15 to-background/65" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(24,78,145,0.14),transparent_58%)]" />

            <div className="relative z-10">
              {loading && <p className="text-center text-sm text-muted-foreground">Gerçek parseller yükleniyor...</p>}
              {error && <p className="text-center text-sm text-red-300">{error}</p>}
              {!loading && !error && parcels.length === 0 && <p className="text-center text-sm text-muted-foreground">Bu pilot şehirde henüz parsel bulunamadı.</p>}
              {!error && <SkyParcelDome parcels={parcels} selectedId={selectedId} onSelect={setSelectedId} />}
            </div>

            {selectedParcel && <ParcelDetailPanel parcel={selectedParcel} onClose={() => setSelectedId(null)} onReserved={(parcel) => setParcels((prev) => prev.map((item) => item.id === parcel.id ? parcel : item))} />}

            <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-md bg-navy-deep/90 px-4 py-2 text-center shadow-lg shadow-black/30">
              <p className="text-sm font-semibold text-gold">{selectedCityMeta.name}</p>
              <p className="text-[10px] text-muted-foreground">{parcels.length.toLocaleString("tr-TR")} gerçek parsel · sürükleyerek döndür · dokunarak seç</p>
            </div>
          </div>
        </div>
      </main>
      <TrustBar />
      <SiteFooter />
    </div>
  );
}
