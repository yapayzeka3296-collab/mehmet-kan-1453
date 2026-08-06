import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  FileBadge,
  Globe,
  Grid2x2,
  Headphones,
  List,
  Lock,
  MoreVertical,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import heroCity from "@/assets/hero-city.jpg";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { TrustBar, type TrustItem } from "@/components/TrustBar";

export const Route = createFileRoute("/parsellerim")({
  head: () => ({
    meta: [
      { title: "Parsellerim — MySkyParcel" },
      { name: "description", content: "Satın aldığın gökyüzü parsellerini görüntüle, filtrele ve yönet." },
      { property: "og:title", content: "Parsellerim — MySkyParcel" },
      { property: "og:description", content: "Gökyüzü parsellerinin listesi ve detayları." },
    ],
  }),
  component: Parsellerim,
});

const TABS = [
  { label: "TÜM PARSELLER", count: "" },
  { label: "AKTİF PARSELLER", count: "3" },
  { label: "HEDİYE EDİLENLER", count: "1" },
  { label: "SÜRESİ DOLANLAR", count: "0" },
];

const PARCELS = [
  { city: "Gaziantep", code: "K05 (5. Katman) - S042 (42. Sektör) - P07 (7. Parsel)", date: "20.05.2024", cert: "SP-GZT-0004207" },
  { city: "İstanbul", code: "K02 (2. Katman) - S018 (18. Sektör) - P15 (15. Parsel)", date: "15.04.2024", cert: "SP-IST-0003891" },
  { city: "Konya", code: "K06 (6. Katman) - S067 (67. Sektör) - P03 (3. Parsel)", date: "10.03.2024", cert: "SP-KON-0003456" },
];

const SUMMARY = [
  ["Toplam Parsel", "3"],
  ["Aktif Parsel", "3"],
  ["Hediye Edilen", "1"],
  ["Süresi Dolan", "0"],
];

const FOOTER_TRUST: TrustItem[] = [
  { icon: Globe, title: "10.000+ PARSEL", text: "Dünyanın her yerinden seçim yapabilirsiniz." },
  { icon: ShieldCheck, title: "DİJİTAL SERTİFİKA", text: "Tüm parselleriniz dijital sertifika ile güvence altında." },
  { icon: Lock, title: "GÜVENLİ ALTYAPI", text: "256 Bit SSL ile tüm bilgileriniz korunur." },
  { icon: Headphones, title: "7/24 DESTEK", text: "Her zaman yanınızdayız. Sorularınız için bize ulaşın." },
];

function Parsellerim() {
  return (
    <div className="starfield min-h-screen">
      <SiteHeader />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8">
        <UserSidebar active="/parsellerim" />

        <div className="min-w-0 grid gap-6 xl:grid-cols-[1fr_300px]">
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
                <h1 className="font-display text-3xl font-bold">PARSELLERİM</h1>
                <p className="mt-2 text-xs text-muted-foreground">
                  Ana Sayfa <span className="mx-2">›</span> Kullanıcı Paneli{" "}
                  <span className="mx-2">›</span> <span className="text-gold">Parsellerim</span>
                </p>
              </div>
            </div>

            <div className="panel mt-6 p-5">
              <ul className="flex flex-wrap gap-2">
                {TABS.map((t, i) => (
                  <li key={t.label}>
                    <button
                      className={`rounded-md px-4 py-2.5 text-[11px] tracking-[0.06em] ${
                        i === 0
                          ? "border border-gold/60 text-gold"
                          : "text-muted-foreground hover:text-gold"
                      }`}
                    >
                      {t.label} {t.count && <span className="ml-1 text-gold">{t.count}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <p className="truncate text-sm text-muted-foreground">3 parseliniz bulunuyor.</p>
              <div className="flex shrink-0 items-center gap-2 text-xs">
                <span className="hidden text-muted-foreground sm:inline">Sırala:</span>
                <select className="rounded-md border border-input bg-background px-3 py-2 text-xs outline-none">
                  <option>Satın Alma Tarihi (Yeni → Eski)</option>
                  <option>Satın Alma Tarihi (Eski → Yeni)</option>
                </select>
                <button className="rounded-md border border-gold/50 p-2 text-gold" aria-label="Izgara görünüm">
                  <Grid2x2 className="h-4 w-4" />
                </button>
                <button className="rounded-md border border-border p-2" aria-label="Liste görünüm">
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            <ul className="mt-4 grid gap-4">
              {PARCELS.map((p) => (
                <li key={p.cert} className="panel grid gap-4 p-4 md:grid-cols-[280px_1fr]">
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={heroCity}
                      alt={`${p.city} parseli`}
                      loading="lazy"
                      width={1920}
                      height={1088}
                      className="h-40 w-full object-cover opacity-80"
                    />
                    <span className="absolute left-3 top-3 rounded bg-success px-2 py-0.5 text-[10px] font-bold text-background">
                      AKTİF
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <h2 className="flex min-w-0 items-center gap-2 truncate font-display text-xl">
                        {p.city} <Star className="h-4 w-4 shrink-0 text-gold" />
                      </h2>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-full border border-success/40 px-3 py-1 text-[11px] text-success">
                          Aktif
                        </span>
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{p.code}</p>
                    <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
                      <div className="flex min-w-0 flex-wrap gap-6 text-xs">
                        <div className="flex items-start gap-2">
                          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                          <span>
                            <span className="block text-muted-foreground">Satın Alma Tarihi</span>
                            {p.date}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <FileBadge className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                          <span>
                            <span className="block text-muted-foreground">Sertifika No</span>
                            {p.cert}
                          </span>
                        </div>
                      </div>
                      <button className="btn-gold inline-flex shrink-0 items-center gap-2 rounded-md px-5 py-2.5 text-[11px]">
                        DETAYLAR <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid content-start gap-6">
            <section className="panel p-5">
              <h2 className="text-xs font-semibold tracking-[0.1em] text-gold">PARSEL ÖZETİ</h2>
              <dl className="mt-4 space-y-3 text-sm">
                {SUMMARY.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <dt className="min-w-0 truncate text-muted-foreground">{k}</dt>
                    <dd className="shrink-0">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="panel p-5">
              <h2 className="text-xs font-semibold tracking-[0.1em]">FİLTRELE</h2>
              <div className="mt-4 space-y-4 text-sm">
                <label className="block">
                  <span className="text-xs text-muted-foreground">Şehir</span>
                  <select className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none">
                    <option>Tümü</option>
                    <option>Gaziantep</option>
                    <option>İstanbul</option>
                    <option>Konya</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-muted-foreground">Durum</span>
                  <select className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none">
                    <option>Tümü</option>
                    <option>Aktif</option>
                    <option>Hediye Edilen</option>
                  </select>
                </label>
                <div>
                  <span className="text-xs text-muted-foreground">Satın Alma Tarihi</span>
                  <div className="mt-1.5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <input
                      placeholder="Başlangıç"
                      className="min-w-0 rounded-md border border-input bg-background px-3 py-2.5 text-xs outline-none"
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      placeholder="Bitiş"
                      className="min-w-0 rounded-md border border-input bg-background px-3 py-2.5 text-xs outline-none"
                    />
                  </div>
                </div>
                <button className="btn-gold w-full rounded-md py-2.5 text-[11px]">FİLTRELE</button>
              </div>
            </section>

            <section className="panel p-5">
              <h2 className="text-xs font-semibold tracking-[0.1em]">YARDIMA MI İHTİYACINIZ VAR?</h2>
              <p className="mt-2 text-xs text-muted-foreground">
                Parselleriniz hakkında her türlü sorunuz için bize ulaşabilirsiniz.
              </p>
              <Link
                to="/iletisim"
                className="mt-4 flex items-center justify-center gap-2 rounded-md border border-gold/60 py-2.5 text-[11px] text-gold"
              >
                İLETİŞİME GEÇ <Truck className="h-4 w-4" />
              </Link>
            </section>
          </div>
        </div>
      </main>
      <TrustBar items={FOOTER_TRUST} />
      <SiteFooter />
    </div>
  );
}
