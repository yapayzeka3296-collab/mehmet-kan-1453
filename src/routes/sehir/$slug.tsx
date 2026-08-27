import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { LegacySkyMapView } from "@/components/LegacySkyMapView";

const CITY_NAMES: Record<string, string> = {
  adana:"Adana", adiyaman:"Adıyaman", afyonkarahisar:"Afyonkarahisar", agri:"Ağrı", amasya:"Amasya", ankara:"Ankara", antalya:"Antalya", artvin:"Artvin", aydin:"Aydın", balikesir:"Balıkesir", bilecik:"Bilecik", bingol:"Bingöl", bitlis:"Bitlis", bolu:"Bolu", burdur:"Burdur", bursa:"Bursa", canakkale:"Çanakkale", cankiri:"Çankırı", corum:"Çorum", denizli:"Denizli", diyarbakir:"Diyarbakır", edirne:"Edirne", elazig:"Elazığ", erzincan:"Erzincan", erzurum:"Erzurum", eskisehir:"Eskişehir", gaziantep:"Gaziantep", giresun:"Giresun", gumushane:"Gümüşhane", hakkari:"Hakkari", hatay:"Hatay", isparta:"Isparta", mersin:"Mersin", istanbul:"İstanbul", izmir:"İzmir", kars:"Kars", kastamonu:"Kastamonu", kayseri:"Kayseri", kirklareli:"Kırklareli", kirsehir:"Kırşehir", kocaeli:"Kocaeli", konya:"Konya", kutahya:"Kütahya", malatya:"Malatya", manisa:"Manisa", kahramanmaras:"Kahramanmaraş", mardin:"Mardin", mugla:"Muğla", mus:"Muş", nevsehir:"Nevşehir", nigde:"Niğde", ordu:"Ordu", rize:"Rize", sakarya:"Sakarya", samsun:"Samsun", siirt:"Siirt", sinop:"Sinop", sivas:"Sivas", tekirdag:"Tekirdağ", tokat:"Tokat", trabzon:"Trabzon", tunceli:"Tunceli", sanliurfa:"Şanlıurfa", usak:"Uşak", van:"Van", yozgat:"Yozgat", zonguldak:"Zonguldak", aksaray:"Aksaray", bayburt:"Bayburt", karaman:"Karaman", kirikkale:"Kırıkkale", batman:"Batman", sirnak:"Şırnak", bartin:"Bartın", ardahan:"Ardahan", igdir:"Iğdır", yalova:"Yalova", karabuk:"Karabük", kilis:"Kilis", osmaniye:"Osmaniye", duzce:"Düzce"
};

export const Route = createFileRoute("/sehir/$slug")({ component: CityPage });

function CityPage() {
  const { slug } = Route.useParams();
  const cityName = CITY_NAMES[slug] ?? slug;

  useEffect(() => {
    window.localStorage.setItem("myskyparcel:selected-city-slug", slug);
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />
      <main className="mx-auto max-w-[1800px] px-3 py-3 sm:px-5 lg:px-8">
        <section className="mb-4 overflow-hidden rounded-3xl border border-cyan-200/15 bg-slate-900/70">
          <div className="relative aspect-[21/7] min-h-[180px] overflow-hidden bg-slate-950">
            <img
              src={`/images/cities/${slug}.webp`}
              alt={`${cityName} şehir görseli`}
              className="h-full w-full object-cover"
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-5 left-5 sm:left-8">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-200/80">MySkyParcel · Şehir Parselleri</p>
              <h1 className="mt-1 text-2xl font-bold sm:text-4xl">{cityName}</h1>
              <p className="mt-1 text-xs text-white/65">Bu sayfada yalnızca {cityName} iline ait parseller gösterilir.</p>
            </div>
          </div>
        </section>
        <LegacySkyMapView />
        <div className="mt-4 text-center">
          <Link to="/turkiye-haritasi" className="text-xs text-cyan-200/75 hover:text-cyan-100">← Türkiye haritasına dön</Link>
        </div>
      </main>
    </div>
  );
}
