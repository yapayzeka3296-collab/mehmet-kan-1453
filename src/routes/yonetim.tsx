import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Award, Boxes, LogOut, Menu, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export const Route = createFileRoute("/yonetim")({
  head: () => ({
    meta: [
      { title: "Yönetim Paneli — MySkyParcel" },
      { name: "description", content: "MySkyParcel yönetim paneli." },
    ],
  }),
  component: Admin,
});

type Stats = {
  parcels_total: number;
  parcels_sold: number;
  parcels_available: number;
  users_total: number;
  certificates_total: number;
  certificates_issued: number;
  certificates_pending: number;
  certificates_revoked: number;
  generated_at: string;
};

function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [name, setName] = useState("Yönetici");
  const [error, setError] = useState("");

  async function loadAdmin() {
    if (!supabaseBrowser) {
      await navigate({ to: "/giris" });
      return;
    }
    setLoading(true);
    setError("");

    const { data: userData, error: userError } = await supabaseBrowser.auth.getUser();
    if (userError || !userData.user) {
      await navigate({ to: "/giris" });
      return;
    }

    const { data: profile, error: profileError } = await supabaseBrowser
      .from("profiles")
      .select("full_name, role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      setAuthorized(false);
      setLoading(false);
      await navigate({ to: "/" });
      return;
    }

    setAuthorized(true);
    setName(profile.full_name?.trim() || "Yönetici");

    const { data, error: statsError } = await supabaseBrowser.rpc("admin_dashboard_stats");
    if (statsError) {
      setError("Yönetim verileri yüklenemedi. Yetki veya veritabanı bağlantısını kontrol edin.");
    } else {
      setStats(data as Stats);
    }
    setLoading(false);
  }

  useEffect(() => {
    let active = true;
    void loadAdmin();
    const subscription = supabaseBrowser?.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === "SIGNED_OUT") void navigate({ to: "/giris" });
      if (event === "TOKEN_REFRESHED") void loadAdmin();
    });
    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    if (supabaseBrowser) await supabaseBrowser.auth.signOut({ scope: "global" });
    await navigate({ to: "/giris" });
  }

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Yönetim yetkisi doğrulanıyor...</div>;
  }

  if (!authorized) return null;

  const cards = stats
    ? [
        { label: "Toplam Parsel", value: stats.parcels_total, icon: Boxes },
        { label: "Satılmış Parsel", value: stats.parcels_sold, icon: Boxes },
        { label: "Kullanıcı", value: stats.users_total, icon: Users },
        { label: "Toplam Sertifika", value: stats.certificates_total, icon: Award },
        { label: "Düzenlenmiş Sertifika", value: stats.certificates_issued, icon: ShieldCheck },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-r border-border bg-navy-deep p-4">
        <div className="flex items-center gap-2 px-2 py-3">
          <ShieldCheck className="h-7 w-7 text-gold" />
          <div><div className="font-display font-bold">MySky<span className="text-gold">Parcel</span></div><div className="text-[8px] tracking-[0.25em] text-muted-foreground">YÖNETİM PANELİ</div></div>
        </div>
        <div className="mt-8 rounded-lg border border-gold/30 bg-background/20 p-4">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="mt-1 text-xs text-gold">ADMIN</p>
        </div>
        <button onClick={() => void logout()} className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground/85 hover:bg-accent hover:text-gold">
          <LogOut className="h-4 w-4" /> Çıkış Yap
        </button>
      </aside>

      <div className="min-w-0">
        <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-4 lg:px-6">
          <div className="flex items-center gap-3"><Menu className="h-5 w-5 text-muted-foreground" /><h1 className="text-xl font-semibold">Dashboard</h1></div>
          <button onClick={() => void loadAdmin()} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs hover:border-gold" disabled={loading}><RefreshCw className="h-4 w-4" /> Yenile</button>
        </header>

        <main className="grid gap-6 p-4 lg:p-6">
          {error && <div role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {cards.map((card) => <div key={card.label} className="panel flex items-center gap-4 p-5"><div className="grid h-11 w-11 place-items-center rounded-full bg-accent"><card.icon className="h-5 w-5 text-gold" /></div><div><p className="text-xs text-muted-foreground">{card.label}</p><p className="font-display text-2xl">{card.value.toLocaleString("tr-TR")}</p></div></div>)}
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="panel p-6"><h2 className="font-semibold">Parsel Durumu</h2><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Satışta</span><b>{stats?.parcels_available.toLocaleString("tr-TR")}</b></div><div className="flex justify-between"><span className="text-muted-foreground">Satıldı</span><b>{stats?.parcels_sold.toLocaleString("tr-TR")}</b></div><div className="flex justify-between"><span className="text-muted-foreground">Toplam</span><b>{stats?.parcels_total.toLocaleString("tr-TR")}</b></div></div></div>
            <div className="panel p-6"><h2 className="font-semibold">Sertifika Durumu</h2><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Bekleyen</span><b>{stats?.certificates_pending}</b></div><div className="flex justify-between"><span className="text-muted-foreground">Düzenlenmiş</span><b>{stats?.certificates_issued}</b></div><div className="flex justify-between"><span className="text-muted-foreground">İptal edilmiş</span><b>{stats?.certificates_revoked}</b></div></div></div>
            <div className="panel p-6"><h2 className="font-semibold">Güvenlik</h2><p className="mt-3 text-sm text-muted-foreground">Bu sayfa yalnızca Supabase'deki <strong>admin</strong> rolü ile erişilebilir. Kritik işlemler veritabanındaki admin yetkili fonksiyonlar üzerinden yapılmalıdır.</p><div className="mt-4 inline-flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-xs text-green-500"><ShieldCheck className="h-4 w-4" /> Admin doğrulandı</div></div>
          </section>

          <section className="panel p-6">
            <h2 className="font-semibold">Yönetim Modülleri</h2>
            <p className="mt-2 text-sm text-muted-foreground">Yalnızca canlı veritabanında gerçekten mevcut olan modüller burada güvenli biçimde etkinleştirilecektir. Sahte KPI, sipariş, ödeme veya gelir verisi gösterilmez.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {["Parseller", "Kullanıcılar", "Sertifikalar", "Sistem Günlükleri"].map((item) => <div key={item} className="rounded-lg border border-border p-4 text-sm"><p className="font-medium">{item}</p><p className="mt-1 text-xs text-muted-foreground">Backend yetkilendirmesi tamamlanmadan değişiklik işlemleri açılmaz.</p></div>)}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
