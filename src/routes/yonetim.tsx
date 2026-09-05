import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Award, Bell, Boxes, ClipboardList, FileText, LogOut, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { AdminCertificateOverride } from "@/components/admin/AdminCertificateOverride";
import { useAuth } from "@/hooks/useAuth";

type Module = "dashboard" | "users" | "parcels" | "orders" | "certificates" | "audit";
type Row = Record<string, any>;
type Stats = Record<string, number | string>;

const ADMIN_EMAIL = "incememet@gmail.com";
const menus = [
  { id: "dashboard", label: "Dashboard", icon: ShieldCheck },
  { id: "users", label: "Kullanıcılar", icon: Users },
  { id: "parcels", label: "Parseller", icon: Boxes },
  { id: "orders", label: "Askıdaki Siparişler", icon: ClipboardList },
  { id: "certificates", label: "Sertifikalar", icon: Award },
  { id: "audit", label: "Audit Günlüğü", icon: FileText },
] as const;

export const Route = createFileRoute("/yonetim")({
  head: () => ({
    meta: [
      { title: "Yönetim Paneli — MySkyParcel" },
      { name: "description", content: "MySkyParcel güvenli yönetim paneli." },
    ],
  }),
  component: Admin,
});

function Admin() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState<Module>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState("Yönetici");
  const [error, setError] = useState("");

  async function guard() {
    const { data, error: authError } = await supabaseBrowser.auth.getUser();
    if (authError || !data.user) {
      await navigate({ to: "/giris" });
      return false;
    }

    const email = data.user.email?.trim().toLowerCase() ?? "";
    const { data: profile, error: profileError } = await supabaseBrowser
      .from("profiles")
      .select("full_name,role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) console.error("Admin profile lookup failed", profileError);
    if (!(email === ADMIN_EMAIL || profile?.role === "admin")) {
      await navigate({ to: "/ana-sayfa" });
      return false;
    }

    setName(profile?.full_name?.trim() || "Yönetici");
    setAuthorized(true);
    return true;
  }

  async function load() {
    setError("");
    const ok = await guard();
    if (!ok) {
      setLoading(false);
      return;
    }

    setLoading(true);
    if (module === "dashboard") {
      const { data, error: rpcError } = await supabaseBrowser.rpc("admin_dashboard_stats");
      if (rpcError) setError(rpcError.message);
      else setStats(data as Stats);
    } else {
      const rpc: Record<string, string> = {
        users: "admin_list_users",
        parcels: "admin_list_parcels",
        orders: "admin_list_orders",
        certificates: "admin_list_certificates",
        audit: "admin_list_audit",
      };
      const { data, error: rpcError } = await supabaseBrowser.rpc(rpc[module], {
        p_limit: 100,
        p_offset: 0,
      });
      if (rpcError) setError(rpcError.message);
      else setRows((data ?? []) as Row[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
    const sub = supabaseBrowser.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") void navigate({ to: "/ana-sayfa" });
    });
    return () => sub.data.subscription.unsubscribe();
  }, [module]);

  async function logout() {
    const result = await signOut();
    if (!result.success) {
      setError(result.error);
      return;
    }
    await navigate({ to: "/ana-sayfa" });
  }

  if (loading && !authorized) {
    return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Admin yetkisi doğrulanıyor...</div>;
  }
  if (!authorized) return null;

  const title = menus.find((item) => item.id === module)?.label ?? "Dashboard";

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-r border-border bg-navy-deep p-4">
        <div className="flex items-center gap-2 px-2 py-3">
          <ShieldCheck className="h-7 w-7 text-gold" />
          <div>
            <div className="font-display font-bold">MySky<span className="text-gold">Parcel</span></div>
            <div className="text-[8px] tracking-[0.25em] text-muted-foreground">YÖNETİM PANELİ</div>
          </div>
        </div>
        <div className="mt-6 rounded-lg border border-gold/30 p-4">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="mt-1 text-xs text-gold">ADMIN</p>
        </div>
        <nav className="mt-5 space-y-1">
          {menus.map((item) => (
            <button
              key={item.id}
              onClick={() => setModule(item.id)}
              className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm ${module === item.id ? "bg-accent text-gold" : "text-foreground/80 hover:bg-accent"}`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => void logout()} className="mt-6 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-accent">
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </aside>

      <main className="min-w-0">
        <header className="flex items-center justify-between border-b border-border px-4 py-4 lg:px-6">
          <h1 className="text-xl font-semibold">{title}</h1>
          <button disabled={loading} onClick={() => void load()} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs hover:border-gold disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </button>
        </header>
        <div className="space-y-6 p-4 lg:p-6">
          {error && <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          {module === "dashboard" ? <Dashboard stats={stats} /> : <ModuleView module={module} rows={rows} />}
        </div>
      </main>
    </div>
  );
}

function Dashboard({ stats }: { stats: Stats | null }) {
  const [notifications, setNotifications] = useState<Row[]>([]);

  useEffect(() => {
    void (async () => {
      const { data } = await supabaseBrowser
        .from("admin_notifications")
        .select("id,title,message,is_read,created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      setNotifications((data ?? []) as Row[]);
    })();
  }, []);

  const items = stats
    ? [
        ["Toplam parsel", stats.parcels_inventory_total],
        ["Satışa açık", stats.parcels_available],
        ["Satılmış", stats.parcels_sold],
        ["Kullanıcı", stats.users_total],
        ["Sertifika", stats.certificates_total],
        ["Bekleyen sertifika", stats.certificates_pending],
        ["Askıdaki sipariş", stats.orders_total],
      ]
    : [];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={String(label)} className="panel p-5">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl">{Number(value).toLocaleString("tr-TR")}</p>
        </div>
      ))}
      <div className="panel p-5 sm:col-span-2 xl:col-span-4">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gold" />
          <h2 className="font-semibold">Bildirimler</h2>
        </div>
        {notifications.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Yeni bildirim yok.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="rounded-md border border-border p-3">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">{n.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ModuleView({ module, rows }: { module: Module; rows: Row[] }) {
  if (module === "certificates") {
    return (
      <>
        <AdminCertificateOverride />
        <DataTable rows={rows} columns={["id", "user_id", "parcel_id", "tier", "status", "certificate_number", "issued_at", "revoked_at"]} />
      </>
    );
  }
  if (module === "users") return <DataTable rows={rows} columns={["id", "email", "full_name", "role", "created_at"]} />;
  if (module === "parcels") return <DataTable rows={rows} columns={["id", "parcel_number", "status", "tier", "price", "owner_id"]} />;
  if (module === "orders") return <DataTable rows={rows} columns={["id", "user_id", "parcel_id", "amount", "currency", "status", "created_at"]} />;
  return <DataTable rows={rows} columns={["created_at", "entity_type", "action", "entity_id", "actor_id"]} />;
}

function DataTable({ rows, columns }: { rows: Row[]; columns: string[] }) {
  return (
    <div className="panel overflow-auto p-5">
      <table className="w-full min-w-[800px] text-left text-xs">
        <thead>
          <tr className="border-b border-border">
            {columns.map((c) => <th key={c} className="p-2">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? index} className="border-b border-border/50">
              {columns.map((c) => (
                <td key={c} className="max-w-[260px] truncate p-2">
                  {c.endsWith("_at") && row[c] ? new Date(row[c]).toLocaleString("tr-TR") : String(row[c] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p className="py-4 text-sm text-muted-foreground">Kayıt bulunmuyor.</p>}
    </div>
  );
}
