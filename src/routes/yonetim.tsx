import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, Award, Bell, Boxes, ClipboardList, FileText, LogOut, RefreshCw, Search, ShieldCheck, ShoppingCart, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminCertificateOverride } from "@/components/admin/AdminCertificateOverride";
import { AdminUserSearch } from "@/components/admin/AdminUserSearch";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";

type Module = "dashboard" | "users" | "parcels" | "orders" | "payments" | "certificates" | "audit";
type Row = Record<string, any>;
type Stats = Record<string, number | string>;
const ADMIN_EMAIL = "incememet3296@gmail.com";
const menus = [
  { id: "dashboard", label: "Dashboard", icon: ShieldCheck },
  { id: "users", label: "Kullanıcılar", icon: Users },
  { id: "parcels", label: "Parseller", icon: Boxes },
  { id: "orders", label: "Askıdaki Siparişler", icon: ClipboardList },
  { id: "payments", label: "Ödeme Yönetimi", icon: ShoppingCart },
  { id: "certificates", label: "Sertifikalar", icon: Award },
  { id: "audit", label: "Audit Günlüğü", icon: FileText },
] as const;

export const Route = createFileRoute("/yonetim")({ head: () => ({ meta: [{ title: "Yönetim Paneli — MySkyParcel" }, { name: "description", content: "MySkyParcel güvenli yönetim paneli." }] }), component: Admin });

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
    if (authError || !data.user) { await navigate({ to: "/giris" }); return false; }
    const email = data.user.email?.trim().toLowerCase() ?? "";
    const { data: profile, error: profileError } = await supabaseBrowser.from("profiles").select("full_name,role").eq("id", data.user.id).maybeSingle();
    if (profileError) console.error("Admin profile lookup failed", profileError);
    if (!(email === ADMIN_EMAIL || profile?.role === "admin")) { await navigate({ to: "/ana-sayfa" }); return false; }
    setName(profile?.full_name?.trim() || "Yönetici"); setAuthorized(true); return true;
  }

  async function load() {
    setError(""); const ok = await guard(); if (!ok) { setLoading(false); return; } setLoading(true);
    if (module === "dashboard") {
      const { data, error: rpcError } = await supabaseBrowser.rpc("admin_dashboard_stats");
      if (rpcError) setError(rpcError.message); else setStats(data as Stats);
    } else {
      const rpc: Record<string, string> = { users: "admin_list_users", parcels: "admin_list_parcels", orders: "admin_list_orders", payments: "admin_list_payment_management", certificates: "admin_list_certificates", audit: "admin_list_audit" };
      const { data, error: rpcError } = await supabaseBrowser.rpc(rpc[module], { p_limit: 100, p_offset: 0 });
      if (rpcError) setError(rpcError.message); else setRows((data ?? []) as Row[]);
    }
    setLoading(false);
  }

  useEffect(() => { void load(); const sub = supabaseBrowser.auth.onAuthStateChange((event) => { if (event === "SIGNED_OUT") void navigate({ to: "/ana-sayfa" }); }); return () => sub.data.subscription.unsubscribe(); }, [module]);
  async function logout() { const result = await signOut(); if (!result.success) { setError(result.error); return; } await navigate({ to: "/ana-sayfa" }); }
  if (loading && !authorized) return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Admin yetkisi doğrulanıyor...</div>;
  if (!authorized) return null;
  const title = menus.find((item) => item.id === module)?.label ?? "Dashboard";
  return <div className="min-h-screen bg-background lg:grid lg:grid-cols-[250px_1fr]"><aside className="border-r border-border bg-navy-deep p-4"><div className="flex items-center gap-2 px-2 py-3"><ShieldCheck className="h-7 w-7 text-gold" /><div><div className="font-display font-bold">MySky<span className="text-gold">Parcel</span></div><div className="text-[8px] tracking-[0.25em] text-muted-foreground">YÖNETİM PANELİ</div></div></div><div className="mt-6 rounded-lg border border-gold/30 p-4"><p className="truncate text-sm font-medium">{name}</p><p className="mt-1 text-xs text-gold">ADMIN</p></div><nav className="mt-5 space-y-1">{menus.map((item) => <button key={item.id} onClick={() => setModule(item.id)} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm ${module === item.id ? "bg-accent text-gold" : "text-foreground/80 hover:bg-accent"}`}><item.icon className="h-4 w-4" />{item.label}</button>)}</nav><button onClick={() => void logout()} className="mt-6 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-accent"><LogOut className="h-4 w-4" />Çıkış Yap</button></aside><main className="min-w-0"><header className="flex items-center justify-between border-b border-border px-4 py-4 lg:px-6"><h1 className="text-xl font-semibold">{title}</h1><button disabled={loading} onClick={() => void load()} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs hover:border-gold disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Yenile</button></header><div className="space-y-6 p-4 lg:p-6">{error && <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}{module === "dashboard" ? <Dashboard stats={stats} /> : <ModuleView module={module} rows={rows} onReload={load} />}</div></main></div>;
}

function Dashboard({ stats }: { stats: Stats | null }) {
  const [notifications, setNotifications] = useState<Row[]>([]); const [siteStats, setSiteStats] = useState<Stats | null>(null); const [siteStatsError, setSiteStatsError] = useState(""); const [notificationError, setNotificationError] = useState(""); const [clearingNotification, setClearingNotification] = useState("");
  useEffect(() => { void (async () => { const { data } = await supabaseBrowser.from("admin_notifications").select("id,title,message,is_read,created_at").order("created_at", { ascending: false }).limit(20); setNotifications((data ?? []) as Row[]); })(); }, []);
  useEffect(() => { void (async () => { const { data, error: rpcError } = await supabaseBrowser.rpc("admin_site_statistics"); if (rpcError) { setSiteStatsError(rpcError.message); return; } setSiteStats(data as Stats); })(); }, []);
  async function clearNotification(id: string) { setNotificationError(""); setClearingNotification(id); const { error: rpcError } = await supabaseBrowser.rpc("admin_delete_notification", { p_notification_id: id }); if (rpcError) setNotificationError(rpcError.message); else setNotifications((current) => current.filter((item) => item.id !== id)); setClearingNotification(""); }
  const items = stats ? [["Toplam parsel", stats.parcels_inventory_total], ["Satışa açık", stats.parcels_available], ["Satılmış", stats.parcels_sold], ["Kullanıcı", stats.users_total], ["Sertifika", stats.certificates_total], ["Bekleyen sertifika", stats.certificates_pending], ["Askıdaki sipariş", stats.orders_total]] : [];
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map(([label, value]) => <div key={String(label)} className="panel p-5"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl">{Number(value).toLocaleString("tr-TR")}</p></div>)}<div className="panel p-5 sm:col-span-2 xl:col-span-4"><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-gold" /><h2 className="font-semibold">Canlı Site İstatistikleri</h2></div>{siteStatsError ? <p className="mt-4 text-sm text-destructive">{siteStatsError}</p> : siteStats ? <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{[["Şu an aktif", siteStats.active_now], ["Bugün", siteStats.today], ["Bu hafta", siteStats.week], ["Bu ay", siteStats.month], ["Toplam", siteStats.total]].map(([label, value]) => <div key={String(label)} className="rounded-md border border-border p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 font-display text-2xl">{Number(value).toLocaleString("tr-TR")}</p></div>)}</div> : <p className="mt-4 text-sm text-muted-foreground">Canlı istatistikler yükleniyor...</p>}</div><div className="panel p-5 sm:col-span-2 xl:col-span-4"><div className="flex items-center gap-2"><Bell className="h-5 w-5 text-gold" /><h2 className="font-semibold">Bildirimler</h2></div>{notificationError && <p role="alert" className="mt-3 text-sm text-destructive">{notificationError}</p>}{notifications.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Yeni bildirim yok.</p> : <div className="mt-4 space-y-2">{notifications.map((n) => <div key={n.id} className="flex items-start justify-between gap-3 rounded-md border border-border p-3"><div className="min-w-0"><p className="text-sm font-medium">{n.title}</p><p className="mt-1 whitespace-pre-line text-xs text-muted-foreground">{n.message}</p></div><button aria-label="Bildirimi temizle" title="Bildirimi temizle" disabled={clearingNotification === n.id} onClick={() => void clearNotification(n.id)} className="shrink-0 rounded-md border border-border p-2 text-muted-foreground hover:border-destructive hover:text-destructive disabled:opacity-60"><Trash2 className="h-4 w-4" /></button></div>)}</div>}</div></section>;
}

function ModuleView({ module, rows, onReload }: { module: Module; rows: Row[]; onReload: () => Promise<void> }) {
  if (module === "certificates") return <><AdminCertificateOverride /><DataTable rows={rows} columns={["id", "user_id", "parcel_id", "tier", "status", "certificate_number", "issued_at", "revoked_at"]} /></>;
  if (module === "users") return <AdminUserSearch initialRows={rows} />;
  if (module === "parcels") return <ParcelModule initialRows={rows} />;
  if (module === "orders") return <DataTable rows={rows} columns={["id", "user_id", "parcel_id", "amount", "currency", "status", "created_at"]} />;
  if (module === "payments") return <PaymentModule initialRows={rows} />;
  return <AuditModule rows={rows} onReload={onReload} />;
}

function ParcelModule({ initialRows }: { initialRows: Row[] }) {
  const [query, setQuery] = useState(""); const [searchRows, setSearchRows] = useState<Row[]>(initialRows); const [searching, setSearching] = useState(false); const [actionError, setActionError] = useState(""); const [actionLoading, setActionLoading] = useState("");
  async function search() { setActionError(""); setSearching(true); const { data, error } = await supabaseBrowser.rpc("admin_search_parcels", { p_city_slug: null, p_query: query.trim() || null, p_only_sold: false }); if (error) setActionError(error.message); else setSearchRows((data ?? []) as Row[]); setSearching(false); }
  async function buy(id: string) { if (!window.confirm("Bu parseli yönetici hesabına satın almak istediğinizden emin misiniz?")) return; setActionError(""); setActionLoading(id + ":buy"); const { error } = await supabaseBrowser.rpc("admin_purchase_parcel", { p_parcel_id: id }); if (error) setActionError(error.message); else await search(); setActionLoading(""); }
  async function release(id: string) { if (!window.confirm("Bu yöneticiye ait parseli tekrar satışa çıkarmak istediğinizden emin misiniz?")) return; setActionError(""); setActionLoading(id + ":release"); const { error } = await supabaseBrowser.rpc("admin_release_parcel", { p_parcel_id: id }); if (error) setActionError(error.message); else await search(); setActionLoading(""); }
  return <div className="space-y-4"><div className="panel p-5"><div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void search(); }} placeholder="Parsel numarası ara..." className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-gold" /></div><button disabled={searching} onClick={() => void search()} className="rounded-md border border-border px-4 py-2 text-sm hover:border-gold disabled:opacity-60">{searching ? "Aranıyor..." : "Ara"}</button></div><p className="mt-3 text-xs text-muted-foreground">81.000 parsel veritabanında sunucu tarafında aranır. Sonuçlar en fazla 100 kayıt olarak gösterilir.</p>{actionError && <p role="alert" className="mt-3 text-sm text-destructive">{actionError}</p>}</div><div className="panel overflow-auto p-5"><table className="w-full min-w-[1000px] text-left text-xs"><thead><tr className="border-b border-border">{["Parsel", "Durum", "Sınıf", "Fiyat", "Sahibi", "İşlem"].map((c) => <th key={c} className="p-2">{c}</th>)}</tr></thead><tbody>{searchRows.map((row) => <tr key={row.parcel_id ?? row.id} className="border-b border-border/50"><td className="p-2">{row.parcel_number ?? "—"}</td><td className="p-2">{row.status ?? "—"}</td><td className="p-2">{row.tier ?? "—"}</td><td className="p-2">{row.price == null ? "—" : `${Number(row.price).toLocaleString("tr-TR")} ₺`}</td><td className="p-2">{row.owner_name || "—"}</td><td className="p-2"><div className="flex gap-2">{row.status === "available" && !row.owner_id && <button disabled={!!actionLoading} onClick={() => void buy(row.parcel_id)} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 hover:border-gold disabled:opacity-60"><ShoppingCart className="h-3 w-3" />{actionLoading === row.parcel_id + ":buy" ? "..." : "Satın Al"}</button>}{row.status === "sold" && row.owner_id && <button disabled={!!actionLoading} onClick={() => void release(row.parcel_id)} className="rounded-md border border-border px-2 py-1 hover:border-gold disabled:opacity-60">Satışa Çıkar</button>}</div></td></tr>)}</tbody></table>{searchRows.length === 0 && <p className="py-4 text-sm text-muted-foreground">Kayıt bulunmuyor.</p>}</div></div>;
}

function PaymentModule({ initialRows }: { initialRows: Row[] }) {
  const rows = initialRows;
  const total = rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  return <div className="space-y-4"><div className="panel p-5"><div className="flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-gold" /><div><h2 className="font-semibold">Ödeme Yönetimi</h2><p className="mt-1 text-xs text-muted-foreground">Tamamlanmış satın alma işlemleri gösterilir. Süresi dolmuş veya askıda kalan rezervasyonlar burada ödeme olarak görünmez.</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-md border border-border p-4"><p className="text-xs text-muted-foreground">Tamamlanan ödeme</p><p className="mt-2 font-display text-2xl">{rows.length.toLocaleString("tr-TR")}</p></div><div className="rounded-md border border-border p-4"><p className="text-xs text-muted-foreground">Gösterilen toplam</p><p className="mt-2 font-display text-2xl">{total.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺</p></div></div></div><div className="panel overflow-auto p-5"><table className="w-full min-w-[1200px] text-left text-xs"><thead><tr className="border-b border-border">{["Alıcı", "E-posta", "Parsel", "Sınıf", "Tutar", "Para Birimi", "Durum", "Sağlayıcı", "Referans", "Satın Alma Tarihi"].map((label) => <th key={label} className="p-2">{label}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.order_id} className="border-b border-border/50"><td className="p-2">{row.user_name || "—"}</td><td className="p-2">{row.user_email || "—"}</td><td className="p-2">{row.parcel_number || "—"}</td><td className="p-2">{row.tier || "—"}</td><td className="p-2">{row.amount == null ? "—" : Number(row.amount).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td><td className="p-2">{row.currency || "—"}</td><td className="p-2">{row.payment_status || "—"}</td><td className="p-2">{row.provider || "—"}</td><td className="p-2">{row.provider_reference || "—"}</td><td className="p-2">{row.purchased_at ? new Date(row.purchased_at).toLocaleString("tr-TR") : "—"}</td></tr>)}</tbody></table>{rows.length === 0 && <p className="py-4 text-sm text-muted-foreground">Tamamlanmış ödeme bulunmuyor.</p>}</div></div>;
}

function AuditModule({ rows, onReload }: { rows: Row[]; onReload: () => Promise<void> }) {
  const [clearing, setClearing] = useState(false); const [error, setError] = useState("");
  async function clearAudit() { if (!window.confirm("Audit günlüğündeki tüm kayıtları temizlemek istediğinizden emin misiniz?")) return; setError(""); setClearing(true); const { error: rpcError } = await supabaseBrowser.rpc("admin_clear_all_audit_logs"); if (rpcError) setError(rpcError.message); else await onReload(); setClearing(false); }
  return <div className="space-y-4"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Audit Günlüğü</h2><p className="text-xs text-muted-foreground">Yönetim işlemleri kayıtları.</p></div><button disabled={clearing} onClick={() => void clearAudit()} className="rounded-md border border-destructive/40 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-60">{clearing ? "Temizleniyor..." : "Audit Günlüğünü Temizle"}</button></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<DataTable rows={rows} columns={["id", "actor_id", "action", "entity_type", "entity_id", "created_at"]} /></div>;
}

function DataTable({ rows, columns }: { rows: Row[]; columns: string[] }) {
  return <div className="panel overflow-auto p-5"><table className="w-full min-w-[900px] text-left text-xs"><thead><tr className="border-b border-border">{columns.map((column) => <th key={column} className="p-2">{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={row.id ?? index} className="border-b border-border/50">{columns.map((column) => <td key={column} className="p-2">{row[column] == null ? "—" : String(row[column])}</td>)}</tr>)}</tbody></table>{rows.length === 0 && <p className="py-4 text-sm text-muted-foreground">Kayıt bulunmuyor.</p>}</div>;
}
