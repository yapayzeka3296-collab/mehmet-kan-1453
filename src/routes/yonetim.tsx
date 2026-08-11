import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Award, Boxes, ClipboardList, CreditCard, FileText, LogOut, RefreshCw, ShieldCheck, Users } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export const Route = createFileRoute("/yonetim")({
  head: () => ({ meta: [{ title: "Yönetim Paneli — MySkyParcel" }, { name: "description", content: "MySkyParcel güvenli yönetim paneli." }] }),
  component: Admin,
});

type Module = "dashboard" | "users" | "parcels" | "orders" | "payments" | "certificates" | "audit";
type Stats = Record<string, number | string>;
type Row = Record<string, any>;

function Admin() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [module, setModule] = useState<Module>("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState("Yönetici");
  const [error, setError] = useState("");

  async function guard() {
    if (!supabaseBrowser) { await navigate({ to: "/giris" }); return false; }
    const { data, error } = await supabaseBrowser.auth.getUser();
    if (error || !data.user) { await navigate({ to: "/giris" }); return false; }
    const { data: profile } = await supabaseBrowser.from("profiles").select("full_name,role").eq("id", data.user.id).maybeSingle();
    if (profile?.role !== "admin") { await navigate({ to: "/" }); return false; }
    setName(profile.full_name?.trim() || "Yönetici"); setAuthorized(true); return true;
  }

  async function load() {
    setError("");
    const ok = await guard(); if (!ok) { setLoading(false); return; }
    if (!supabaseBrowser) return;
    setLoading(true);
    if (module === "dashboard") {
      const { data, error } = await supabaseBrowser.rpc("admin_dashboard_stats");
      if (error) setError(error.message); else setStats(data as Stats);
    } else {
      const rpc = { users: "admin_list_users", parcels: "admin_list_parcels", orders: "admin_list_orders", payments: "admin_list_payments", certificates: "admin_list_certificates", audit: "admin_list_audit" }[module];
      const { data, error } = await supabaseBrowser.rpc(rpc, { p_limit: 100, p_offset: 0 });
      if (error) setError(error.message); else setRows((data ?? []) as Row[]);
    }
    setLoading(false);
  }

  useEffect(() => { void load(); const sub = supabaseBrowser?.auth.onAuthStateChange((e) => { if (e === "SIGNED_OUT") void navigate({ to: "/giris" }); }); return () => sub?.data.subscription.unsubscribe(); }, [module]);

  async function logout() { await supabaseBrowser?.auth.signOut({ scope: "global" }); await navigate({ to: "/giris" }); }
  async function call(name: string, args: Record<string, any>) { if (!supabaseBrowser) return; setError(""); const { error } = await supabaseBrowser.rpc(name, args); if (error) setError(error.message); else await load(); }

  if (loading && !authorized) return <div className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Admin yetkisi doğrulanıyor...</div>;
  if (!authorized) return null;

  const menu: { id: Module; label: string; icon: any }[] = [
    { id: "dashboard", label: "Dashboard", icon: ShieldCheck }, { id: "users", label: "Kullanıcılar", icon: Users }, { id: "parcels", label: "Parseller", icon: Boxes }, { id: "orders", label: "Siparişler", icon: ClipboardList }, { id: "payments", label: "Ödemeler", icon: CreditCard }, { id: "certificates", label: "Sertifikalar", icon: Award }, { id: "audit", label: "Audit Günlüğü", icon: FileText },
  ];
  const title = menu.find((m) => m.id === module)?.label ?? "Dashboard";

  return <div className="min-h-screen bg-background lg:grid lg:grid-cols-[250px_1fr]">
    <aside className="border-r border-border bg-navy-deep p-4"><div className="flex items-center gap-2 px-2 py-3"><ShieldCheck className="h-7 w-7 text-gold" /><div><div className="font-display font-bold">MySky<span className="text-gold">Parcel</span></div><div className="text-[8px] tracking-[0.25em] text-muted-foreground">YÖNETİM PANELİ</div></div></div><div className="mt-6 rounded-lg border border-gold/30 p-4"><p className="truncate text-sm font-medium">{name}</p><p className="mt-1 text-xs text-gold">ADMIN</p></div><nav className="mt-5 space-y-1">{menu.map((m) => <button key={m.id} onClick={() => setModule(m.id)} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm ${module === m.id ? "bg-accent text-gold" : "text-foreground/80 hover:bg-accent"}`}><m.icon className="h-4 w-4" />{m.label}</button>)}</nav><button onClick={() => void logout()} className="mt-6 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm hover:bg-accent"><LogOut className="h-4 w-4" />Çıkış Yap</button></aside>
    <main className="min-w-0"><header className="flex items-center justify-between border-b border-border px-4 py-4 lg:px-6"><h1 className="text-xl font-semibold">{title}</h1><button onClick={() => void load()} className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs hover:border-gold"><RefreshCw className="h-4 w-4" />Yenile</button></header><div className="space-y-6 p-4 lg:p-6">{error && <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}{module === "dashboard" ? <Dashboard stats={stats} /> : <ModuleView module={module} rows={rows} onCall={call} />}</div></main>
  </div>;
}

function Dashboard({ stats }: { stats: Stats | null }) {
  const items = useMemo(() => stats ? [["Parseller", stats.parcels_total], ["Satılmış", stats.parcels_sold], ["Kullanıcı", stats.users_total], ["Sertifika", stats.certificates_total], ["Sipariş", stats.orders_total], ["Başarılı ödeme", stats.payments_succeeded]] : [], [stats]);
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map(([label,value]) => <div key={String(label)} className="panel p-5"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl">{Number(value).toLocaleString("tr-TR")}</p></div>)}<div className="panel p-5 sm:col-span-2 xl:col-span-3"><h2 className="font-semibold">Güvenlik</h2><p className="mt-2 text-sm text-muted-foreground">Tüm yönetim işlemleri Supabase tarafında admin yetkisi ile doğrulanır ve kritik değişiklikler audit günlüğüne yazılır.</p></div></section>;
}

function ModuleView({ module, rows, onCall }: { module: Module; rows: Row[]; onCall: (name: string, args: Record<string, any>) => Promise<void> }) {
  if (module === "users") return <UsersModule rows={rows} onCall={onCall} />;
  if (module === "parcels") return <ParcelsModule rows={rows} onCall={onCall} />;
  if (module === "orders") return <OrdersModule rows={rows} onCall={onCall} />;
  if (module === "payments") return <PaymentsModule rows={rows} onCall={onCall} />;
  if (module === "certificates") return <CertificatesModule rows={rows} onCall={onCall} />;
  return <div className="panel overflow-auto p-5"><h2 className="mb-4 font-semibold">Son yönetim hareketleri</h2><table className="w-full min-w-[700px] text-left text-xs"><thead><tr className="border-b border-border"><th className="p-2">Tarih</th><th className="p-2">Modül</th><th className="p-2">İşlem</th><th className="p-2">Kayıt</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id} className="border-b border-border/50"><td className="p-2">{new Date(r.created_at).toLocaleString("tr-TR")}</td><td className="p-2">{r.entity_type}</td><td className="p-2">{r.action}</td><td className="p-2 font-mono">{r.entity_id ?? "—"}</td></tr>)}</tbody></table></div>;
}

function UsersModule({ rows, onCall }: any) { const [id,setId]=useState(""); const [name,setName]=useState(""); const [role,setRole]=useState("user"); return <><div className="panel p-5"><h2 className="font-semibold">Kullanıcı profili düzenle</h2><form onSubmit={(e:FormEvent)=>{e.preventDefault();void onCall("admin_update_user_profile",{p_user_id:id,p_full_name:name,p_role:role});}} className="mt-4 grid gap-3 md:grid-cols-4"><input className="rounded-md border bg-background p-2 text-sm" placeholder="User UUID" value={id} onChange={e=>setId(e.target.value)} required/><input className="rounded-md border bg-background p-2 text-sm" placeholder="Ad soyad" value={name} onChange={e=>setName(e.target.value)}/><select className="rounded-md border bg-background p-2 text-sm" value={role} onChange={e=>setRole(e.target.value)}><option value="user">user</option><option value="admin">admin</option></select><button className="btn-gold rounded-md px-4 py-2 text-sm">Kaydet</button></form></div><DataTable rows={rows} columns={["id","email","full_name","role","created_at"]}/></>; }
function ParcelsModule({ rows, onCall }: any) { const [id,setId]=useState(""); const [status,setStatus]=useState("available"); const [owner,setOwner]=useState(""); const [price,setPrice]=useState("0"); const [tier,setTier]=useState(""); return <><div className="panel p-5"><h2 className="font-semibold">Parsel düzenle</h2><form onSubmit={(e:FormEvent)=>{e.preventDefault();void onCall("admin_update_parcel",{p_parcel_id:id,p_status:status,p_owner_id:owner||null,p_price:Number(price),p_tier:tier||null});}} className="mt-4 grid gap-3 md:grid-cols-5"><input className="rounded-md border bg-background p-2 text-sm" placeholder="Parsel UUID" value={id} onChange={e=>setId(e.target.value)} required/><select className="rounded-md border bg-background p-2 text-sm" value={status} onChange={e=>setStatus(e.target.value)}><option>available</option><option>reserved</option><option>sold</option></select><input className="rounded-md border bg-background p-2 text-sm" placeholder="Owner UUID" value={owner} onChange={e=>setOwner(e.target.value)}/><input className="rounded-md border bg-background p-2 text-sm" type="number" min="0" step="0.01" value={price} onChange={e=>setPrice(e.target.value)}/><button className="btn-gold rounded-md px-4 py-2 text-sm">Kaydet</button></form></div><DataTable rows={rows} columns={["id","parcel_number","status","owner_id","price","tier"]}/></>; }
function OrdersModule({ rows, onCall }: any) { const [id,setId]=useState(""); const [status,setStatus]=useState("pending"); const [user,setUser]=useState(""); const [parcel,setParcel]=useState(""); const [amount,setAmount]=useState("0"); return <><div className="panel p-5"><h2 className="font-semibold">Sipariş</h2><form onSubmit={(e:FormEvent)=>{e.preventDefault();void onCall(id?"admin_update_order":"admin_create_order",id?{p_order_id:id,p_status:status}:{p_user_id:user,p_parcel_id:parcel||null,p_amount:Number(amount),p_currency:"TRY"});}} className="mt-4 grid gap-3 md:grid-cols-5"><input className="rounded-md border bg-background p-2 text-sm" placeholder="Order UUID (düzenleme)" value={id} onChange={e=>setId(e.target.value)}/><input className="rounded-md border bg-background p-2 text-sm" placeholder="User UUID (yeni)" value={user} onChange={e=>setUser(e.target.value)}/><input className="rounded-md border bg-background p-2 text-sm" placeholder="Parcel UUID" value={parcel} onChange={e=>setParcel(e.target.value)}/><input className="rounded-md border bg-background p-2 text-sm" type="number" min="0" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)}/><select className="rounded-md border bg-background p-2 text-sm" value={status} onChange={e=>setStatus(e.target.value)}><option>pending</option><option>paid</option><option>failed</option><option>cancelled</option><option>refunded</option></select><button className="btn-gold rounded-md px-4 py-2 text-sm md:col-span-5">{id?"Siparişi güncelle":"Sipariş oluştur"}</button></form></div><DataTable rows={rows} columns={["id","user_id","parcel_id","amount","currency","status","created_at"]}/></>; }
function PaymentsModule({ rows, onCall }: any) { const [id,setId]=useState(""); const [order,setOrder]=useState(""); const [amount,setAmount]=useState("0"); const [status,setStatus]=useState("pending"); return <><div className="panel p-5"><h2 className="font-semibold">Ödeme</h2><form onSubmit={(e:FormEvent)=>{e.preventDefault();void onCall(id?"admin_update_payment":"admin_create_payment",id?{p_payment_id:id,p_status:status}:{p_order_id:order,p_amount:Number(amount),p_currency:"TRY",p_status:status});}} className="mt-4 grid gap-3 md:grid-cols-4"><input className="rounded-md border bg-background p-2 text-sm" placeholder="Payment UUID (düzenleme)" value={id} onChange={e=>setId(e.target.value)}/><input className="rounded-md border bg-background p-2 text-sm" placeholder="Order UUID (yeni)" value={order} onChange={e=>setOrder(e.target.value)}/><input className="rounded-md border bg-background p-2 text-sm" type="number" min="0" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)}/><select className="rounded-md border bg-background p-2 text-sm" value={status} onChange={e=>setStatus(e.target.value)}><option>pending</option><option>succeeded</option><option>failed</option><option>refunded</option></select><button className="btn-gold rounded-md px-4 py-2 text-sm md:col-span-4">{id?"Ödemeyi güncelle":"Ödeme kaydı oluştur"}</button></form><p className="mt-3 text-xs text-muted-foreground">Bu modül gerçek ödeme sağlayıcısı işlemi başlatmaz; yalnızca doğrulanmış ödeme kayıtlarını yönetir.</p></div><DataTable rows={rows} columns={["id","order_id","user_id","amount","currency","status","provider","created_at"]}/></>; }
function CertificatesModule({ rows, onCall }: any) { const [id,setId]=useState(""); const [action,setAction]=useState("approve"); const [reason,setReason]=useState(""); return <><div className="panel p-5"><h2 className="font-semibold">Sertifika işlemi</h2><form onSubmit={(e:FormEvent)=>{e.preventDefault();void onCall("admin_update_certificate",{p_certificate_id:id,p_action:action,p_reason:reason||null});}} className="mt-4 grid gap-3 md:grid-cols-3"><input className="rounded-md border bg-background p-2 text-sm" placeholder="Certificate UUID" value={id} onChange={e=>setId(e.target.value)} required/><select className="rounded-md border bg-background p-2 text-sm" value={action} onChange={e=>setAction(e.target.value)}><option>approve</option><option>reject</option><option>revoke</option></select><input className="rounded-md border bg-background p-2 text-sm" placeholder="Gerekçe" value={reason} onChange={e=>setReason(e.target.value)}/><button className="btn-gold rounded-md px-4 py-2 text-sm md:col-span-3">İşlemi uygula</button></form></div><DataTable rows={rows} columns={["id","user_id","parcel_id","tier","status","certificate_number","issued_at","revoked_at"]}/></>; }
function DataTable({ rows, columns }: { rows: Row[]; columns: string[] }) { return <div className="panel overflow-auto p-5"><table className="w-full min-w-[900px] text-left text-xs"><thead><tr className="border-b border-border">{columns.map(c=><th key={c} className="p-2">{c}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={r.id??i} className="border-b border-border/50">{columns.map(c=><td key={c} className="max-w-[260px] truncate p-2">{c.endsWith("_at")&&r[c]?new Date(r[c]).toLocaleString("tr-TR"):String(r[c]??"—")}</td>)}</tr>)}</tbody></table></div>; }
