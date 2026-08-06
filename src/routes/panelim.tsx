import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  ChevronRight,
  Globe,
  Layers,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
} from "lucide-react";
import heroCity from "@/assets/hero-city.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";

export const Route = createFileRoute("/panelim")({
  head: () => ({
    meta: [
      { title: "Panelim — MySkyParcel" },
      { name: "description", content: "Parsellerini, sertifikalarını ve siparişlerini tek ekrandan yönet." },
      { property: "og:title", content: "Panelim — MySkyParcel" },
      { property: "og:description", content: "MySkyParcel kullanıcı paneli." },
    ],
  }),
  component: Panelim,
});

const STATS = [
  { icon: Globe, value: "3", title: "Parselim", sub: "Toplam Parsel" },
  { icon: Award, value: "3", title: "Sertifikam", sub: "Toplam Sertifika" },
  { icon: ShoppingBag, value: "5", title: "Siparişim", sub: "Toplam Sipariş" },
  { icon: Star, value: "4", title: "Favori Şehrim", sub: "Favori Şehir" },
];

const PARCELS = [
  { city: "Gaziantep", code: "K05 (5. Katman) - S042 (42. Sektör) - P07 (7. Parsel)", date: "20.05.2024" },
  { city: "İstanbul", code: "K02 (2. Katman) - S018 (18. Sektör) - P15 (15. Parsel)", date: "15.04.2024" },
  { city: "Konya", code: "K06 (6. Katman) - S067 (67. Sektör) - P03 (3. Parsel)", date: "10.03.2024" },
];

const ORDERS = [
  { no: "#MSP-2024-000123", date: "20.05.2024", total: "1.198,00 TL" },
  { no: "#MSP-2024-000098", date: "15.04.2024", total: "999,00 TL" },
  { no: "#MSP-2024-000076", date: "10.03.2024", total: "499,00 TL" },
  { no: "#MSP-2024-000045", date: "05.02.2024", total: "199,00 TL" },
];

const CERTS = [
  { city: "Gaziantep", code: "GZT-K05-S042-P07" },
  { city: "İstanbul", code: "IST-K02-S018-P15" },
  { city: "Konya", code: "KON-K06-S067-P03" },
];

const ACTIONS = [
  { icon: ShoppingCart, label: "Parsel Satın Al" },
  { icon: Globe, label: "Gökyüzü Haritası" },
  { icon: ShieldCheck, label: "Sertifika Doğrula" },
  { icon: Layers, label: "Paketleri İncele" },
];

function Panelim() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/panelim" />

        <div className="min-w-0">
          <div className="panel relative overflow-hidden p-6">
            <img
              src={heroCity}
              alt=""
              aria-hidden
              loading="lazy"
              width={1920}
              height={1088}
              className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover opacity-40 md:block"
            />
            <div className="relative">
              <h1 className="font-display text-3xl font-bold">PANELİM</h1>
              <p className="mt-2 text-sm">
                Hoş geldiniz, <span className="text-gold">Ahmet Yılmaz</span>
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.title} className="panel flex min-w-0 items-center gap-4 p-5">
                <s.icon className="h-8 w-8 shrink-0 text-gold" />
                <div className="min-w-0">
                  <p className="font-display text-2xl">{s.value}</p>
                  <p className="text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <section className="panel p-6">
              <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <h2 className="truncate font-display text-base tracking-[0.06em]">SON PARSELLERİM</h2>
                <Link to="/parsellerim" className="shrink-0 text-xs text-gold hover:underline">
                  Tüm Parsellerim →
                </Link>
              </header>
              <ul className="mt-4 divide-y divide-border">
                {PARCELS.map((p) => (
                  <li key={p.city} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4">
                    <div className="min-w-0">
                      <p className="font-semibold">{p.city}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{p.code}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Satın Alma Tarihi: {p.date}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="rounded-full border border-success/40 px-3 py-1 text-[11px] text-success">
                        Aktif
                      </span>
                      <ChevronRight className="h-4 w-4 text-gold" />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="panel p-6">
              <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <h2 className="truncate font-display text-base tracking-[0.06em]">SON SİPARİŞLERİM</h2>
                <Link to="/siparislerim" className="shrink-0 text-xs text-gold hover:underline">
                  Tüm Siparişlerim →
                </Link>
              </header>
              <ul className="mt-4 divide-y divide-border">
                {ORDERS.map((o) => (
                  <li key={o.no} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{o.no}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{o.date}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="rounded-full border border-success/40 px-3 py-1 text-[11px] text-success">
                        Tamamlandı
                      </span>
                      <span className="text-sm">{o.total}</span>
                      <ChevronRight className="h-4 w-4 text-gold" />
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section className="panel p-6">
              <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
                <h2 className="truncate font-display text-base tracking-[0.06em]">SERTİFİKALARIM</h2>
                <Link to="/sertifikalarim" className="shrink-0 text-xs text-gold hover:underline">
                  Tüm Sertifikalarım →
                </Link>
              </header>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {CERTS.map((c) => (
                  <div key={c.code} className="text-center">
                    <div className="grid h-28 place-items-center rounded-lg border border-gold/40 bg-navy">
                      <Award className="h-8 w-8 text-gold" />
                    </div>
                    <p className="mt-2 text-xs font-medium">{c.city}</p>
                    <p className="truncate text-[10px] text-muted-foreground">{c.code}</p>
                  </div>
                ))}
                <div className="grid h-28 place-items-center rounded-lg border border-dashed border-border text-center">
                  <div>
                    <Plus className="mx-auto h-6 w-6 text-gold" />
                    <p className="mt-1 text-[11px] text-muted-foreground">Yeni Sertifika</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="panel p-6">
              <h2 className="font-display text-base tracking-[0.06em]">HIZLI İŞLEMLER</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {ACTIONS.map((a) => (
                  <button
                    key={a.label}
                    className="flex items-center gap-3 rounded-lg border border-border bg-background/40 px-4 py-4 text-sm transition-colors hover:border-gold hover:text-gold"
                  >
                    <a.icon className="h-5 w-5 shrink-0 text-gold" />
                    <span className="truncate">{a.label}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <TrustBar items={SECURITY_TRUST} />
      <SiteFooter />
    </div>
  );
}
