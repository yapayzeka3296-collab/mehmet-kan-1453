import { createFileRoute } from "@tanstack/react-router";
import {
  Award,
  Bell,
  Boxes,
  Calendar,
  CreditCard,
  Database,
  FileText,
  HardDrive,
  Home,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Mail,
  Menu,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

export const Route = createFileRoute("/yonetim")({
  head: () => ({
    meta: [
      { title: "Yönetim Paneli — MySkyParcel" },
      { name: "description", content: "Parsel, sipariş, kullanıcı ve gelir metriklerini tek ekrandan yönet." },
      { property: "og:title", content: "Yönetim Paneli — MySkyParcel" },
      { property: "og:description", content: "MySkyParcel admin dashboard." },
    ],
  }),
  component: Admin,
});

const MENU = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Parseller", icon: Boxes },
  { label: "Siparişler", icon: ShoppingCart },
  { label: "Kullanıcılar", icon: Users },
  { label: "Sertifikalar", icon: Award },
  { label: "Ödemeler", icon: CreditCard },
  { label: "Bildirimler", icon: Bell },
  { label: "Destek Talepleri", icon: LifeBuoy },
  { label: "İçerik Yönetimi", icon: FileText },
  { label: "Ayarlar", icon: Settings },
];

const REPORTS = [
  { label: "Satış Raporları", icon: FileText },
  { label: "Kullanıcı Raporları", icon: Users },
  { label: "Finansal Raporlar", icon: Wallet },
];

const SYSTEM = [
  { label: "Yedekleme", icon: HardDrive },
  { label: "Sistem Günlükleri", icon: Database },
];

const KPIS = [
  { icon: Boxes, label: "Toplam Parsel", value: "1.248", delta: "12.5%" },
  { icon: ShoppingCart, label: "Toplam Sipariş", value: "2.356", delta: "15.3%" },
  { icon: Users, label: "Toplam Kullanıcı", value: "5.892", delta: "9.8%" },
  { icon: Award, label: "Toplam Sertifika", value: "2.985", delta: "11.7%" },
  { icon: Wallet, label: "Toplam Gelir", value: "₺1.245.320", delta: "18.6%" },
];

const REVENUE = [340, 420, 560, 700, 900, 810, 1180];
const SIGNUPS = [500, 610, 730, 820, 860, 960, 1130];
const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem"];

const DIST = [
  { label: "Satışta", pct: 45.2, count: 564 },
  { label: "Satıldı", pct: 35.9, count: 448 },
  { label: "Rezerve", pct: 10.3, count: 128 },
  { label: "Kiralık", pct: 5.8, count: 72 },
  { label: "Beklemede", pct: 2.8, count: 36 },
];

const ORDERS = [
  { no: "SP-2026-1258", user: "Ahmet Yılmaz", total: "₺2.450", status: "Tamamlandı" },
  { no: "SP-2026-1257", user: "Zeynep Kaya", total: "₺1.890", status: "Tamamlandı" },
  { no: "SP-2026-1256", user: "Mehmet Demir", total: "₺3.250", status: "Ödeme Bekliyor" },
  { no: "SP-2026-1255", user: "Elif Arslan", total: "₺1.450", status: "Tamamlandı" },
  { no: "SP-2026-1254", user: "Can Yıldız", total: "₺2.190", status: "İşlemde" },
];

const SERVICES = [
  { label: "Web Sunucusu", icon: Database },
  { label: "Veritabanı", icon: Database },
  { label: "Ödeme Sistemi", icon: CreditCard },
  { label: "E-posta Servisi", icon: Mail },
  { label: "Yedekleme", icon: HardDrive },
];

const NOTIFS = [
  { t: "Yeni parsel eklendi", d: "Nova Prime - A12 parseli sisteme eklendi.", w: "5 dk önce", icon: Bell },
  { t: "Ödeme alındı", d: "SP-2026-1256 numaralı siparişin ödemesi alındı.", w: "15 dk önce", icon: CreditCard },
  { t: "Yeni destek talebi", d: "Ahmet Yılmaz yeni bir destek talebi oluşturdu.", w: "1 saat önce", icon: LifeBuoy },
  { t: "Sertifika oluşturuldu", d: "PRC-2026-0894 numaralı sertifika oluşturuldu.", w: "2 saat önce", icon: Award },
];

function Admin() {
  const maxRev = Math.max(...REVENUE);
  const points = REVENUE.map((v, i) => `${(i / (REVENUE.length - 1)) * 100},${100 - (v / maxRev) * 90}`).join(" ");

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
      {/* SIDEBAR */}
      <aside className="border-r border-border bg-navy-deep p-4">
        <div className="flex items-center gap-2 px-2 py-3">
          <Sparkles className="h-7 w-7 text-gold" />
          <span>
            <span className="block font-display text-base font-bold">
              MySky<span className="text-gold">Parcel</span>
            </span>
            <span className="text-[8px] tracking-[0.25em] text-muted-foreground">YÖNETİM PANELİ</span>
          </span>
        </div>

        <p className="mt-6 px-3 text-[10px] tracking-[0.16em] text-gold">ANA MENÜ</p>
        <ul className="mt-2 grid gap-1">
          {MENU.map((m) => (
            <li key={m.label}>
              <button
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                  m.active
                    ? "bg-[image:var(--gradient-gold)] text-primary-foreground"
                    : "text-foreground/85 hover:bg-accent hover:text-gold"
                }`}
              >
                <m.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{m.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-6 px-3 text-[10px] tracking-[0.16em] text-gold">RAPORLAR</p>
        <ul className="mt-2 grid gap-1">
          {REPORTS.map((m) => (
            <li key={m.label}>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground/85 hover:bg-accent hover:text-gold">
                <m.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{m.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <p className="mt-6 px-3 text-[10px] tracking-[0.16em] text-gold">SİSTEM</p>
        <ul className="mt-2 grid gap-1">
          {SYSTEM.map((m) => (
            <li key={m.label}>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground/85 hover:bg-accent hover:text-gold">
                <m.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{m.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="panel mt-8 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-gold">MY</div>
            <div className="min-w-0">
              <p className="truncate text-sm">Mehmet Yılmaz</p>
              <p className="text-xs text-gold">Yönetici</p>
            </div>
          </div>
          <button className="mt-4 flex w-full items-center gap-3 rounded-lg px-1 py-2 text-sm text-foreground/85 hover:text-gold">
            <LogOut className="h-4 w-4" /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="min-w-0">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-4 py-4 lg:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Menu className="h-5 w-5 shrink-0 text-muted-foreground" />
            <h1 className="truncate text-xl font-semibold">Dashboard</h1>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg border border-input bg-card px-3 md:flex">
              <input placeholder="Ara..." className="w-40 bg-transparent py-2 text-sm outline-none" />
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <button className="relative rounded-lg border border-border p-2" aria-label="Bildirimler">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                3
              </span>
            </button>
            <div className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs sm:flex">
              <Calendar className="h-4 w-4 text-gold" />
              <span>
                6 Temmuz 2026 <span className="block text-muted-foreground">Pazartesi</span>
              </span>
            </div>
          </div>
        </header>

        <main className="grid gap-6 p-4 lg:p-6">
          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {KPIS.map((k) => (
              <div key={k.label} className="panel flex min-w-0 items-center gap-4 p-5">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent">
                  <k.icon className="h-5 w-5 text-gold" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">{k.label}</p>
                  <p className="font-display text-xl">{k.value}</p>
                  <p className="text-[11px] text-success">↑ {k.delta} önceki aya göre</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            {/* Revenue chart */}
            <section className="panel p-6">
              <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="truncate text-sm font-semibold">Gelir Grafiği</h2>
                <span className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">
                  Son 6 Ay
                </span>
              </header>
              <svg viewBox="0 0 100 100" className="mt-6 h-48 w-full" preserveAspectRatio="none">
                <polyline
                  points={points}
                  fill="none"
                  stroke="var(--gold)"
                  strokeWidth="1.5"
                  vectorEffect="non-scaling-stroke"
                />
                <polygon points={`0,100 ${points} 100,100`} fill="var(--gold)" opacity="0.15" />
              </svg>
              <ul className="mt-3 flex justify-between text-[10px] text-muted-foreground">
                {MONTHS.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <p className="mt-4 text-center text-xs text-gold">— Gelir (₺)</p>
            </section>

            {/* Distribution */}
            <section className="panel p-6">
              <h2 className="text-sm font-semibold">Parsel Dağılımı</h2>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-8">
                <div className="grid h-40 w-40 place-items-center rounded-full border-[14px] border-gold/80 [border-right-color:var(--muted)] [border-top-color:var(--info)]">
                  <div className="text-center">
                    <p className="font-display text-xl">1.248</p>
                    <p className="text-[11px] text-muted-foreground">Toplam</p>
                  </div>
                </div>
                <ul className="grid gap-2 text-xs">
                  {DIST.map((d) => (
                    <li key={d.label} className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-gold" />
                      <span className="w-20 text-muted-foreground">{d.label}</span>
                      <span>%{d.pct}</span>
                      <span className="text-muted-foreground">{d.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button className="mt-6 w-full text-center text-xs text-gold">Tüm Parseller →</button>
            </section>

            {/* Recent orders */}
            <section className="panel p-6">
              <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="truncate text-sm font-semibold">Son Siparişler</h2>
                <button className="shrink-0 text-xs text-gold">Tümünü Gör →</button>
              </header>
              <ul className="mt-4 divide-y divide-border">
                {ORDERS.map((o) => (
                  <li key={o.no} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm">{o.no}</p>
                      <p className="truncate text-xs text-muted-foreground">{o.user}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm">{o.total}</span>
                      <span
                        className={`rounded px-2 py-1 text-[10px] ${
                          o.status === "Tamamlandı"
                            ? "bg-success/20 text-success"
                            : o.status === "İşlemde"
                              ? "bg-gold/20 text-gold"
                              : "bg-info/20 text-info"
                        }`}
                      >
                        {o.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-4">
            {/* Signups bar chart */}
            <section className="panel p-6 xl:col-span-2">
              <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="truncate text-sm font-semibold">Kullanıcı Kayıtları</h2>
                <span className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground">
                  Son 6 Ay
                </span>
              </header>
              <div className="mt-6 flex h-48 items-stretch gap-3">
                {SIGNUPS.map((v, i) => (
                  <div key={i} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2">
                    <div
                      className="w-full shrink-0 rounded-t"
                      style={{
                        height: `${(v / 1200) * 100}%`,
                        minHeight: "4px",
                        backgroundImage: "var(--gradient-gold)",
                      }}
                    />

                    <span className="text-center text-[10px] text-muted-foreground">{MONTHS[i]}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-gold">▮ Yeni Kayıtlar</p>
            </section>

            {/* Parcel status */}
            <section className="panel p-6">
              <h2 className="text-sm font-semibold">Parsel Durumu</h2>
              <ul className="mt-5 grid gap-4">
                {DIST.map((d) => (
                  <li key={d.label}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="truncate text-muted-foreground">{d.label}</span>
                      <span>
                        {d.count} <span className="text-muted-foreground">(%{d.pct})</span>
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${d.pct}%`,
                          backgroundImage: "var(--gradient-gold)",
                        }}
                      />

                    </div>
                  </li>
                ))}
              </ul>
              <button className="mt-6 w-full text-center text-xs text-gold">Tüm Parseller →</button>
            </section>

            {/* System status */}
            <section className="panel p-6">
              <h2 className="text-sm font-semibold">Sistem Durumu</h2>
              <ul className="mt-5 grid gap-4 text-sm">
                {SERVICES.map((s) => (
                  <li key={s.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                      <s.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{s.label}</span>
                    </span>
                    <span className="shrink-0 text-xs text-success">Aktif</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-muted-foreground">Son Yedekleme: 06.07.2026 02:30</p>
              <p className="text-xs text-success">Başarılı</p>
            </section>
          </div>

          <section className="panel p-6">
            <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="truncate text-sm font-semibold">Son Bildirimler</h2>
              <button className="shrink-0 text-xs text-gold">Tümünü Gör →</button>
            </header>
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {NOTIFS.map((n) => (
                <li key={n.t} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                  <n.icon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  <div className="min-w-0">
                    <p className="truncate text-sm">{n.t}</p>
                    <p className="truncate text-xs text-muted-foreground">{n.d}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{n.w}</span>
                </li>
              ))}
            </ul>
          </section>

          <footer className="flex items-center gap-2 pb-4 text-xs text-muted-foreground">
            <Home className="h-3.5 w-3.5" /> © 2026 MySkyParcel Yönetim Paneli. Tüm hakları saklıdır.
          </footer>
        </main>
      </div>
    </div>
  );
}
