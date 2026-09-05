import { Ban, CheckCircle2, Search, Trash2, UserPlus, UserRound } from "lucide-react";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { AdminUserDetail } from "@/components/admin/AdminUserDetail";

type Row = Record<string, any>;

export function AdminUserSearch({ initialRows }: { initialRows: Row[] }) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newUser, setNewUser] = useState({ full_name: "", email: "", password: "", role: "user" });

  if (selectedUserId) return <AdminUserDetail userId={selectedUserId} onBack={() => setSelectedUserId(null)} />;

  async function search() {
    setError("");
    setNotice("");
    setLoading(true);
    const { data, error: rpcError } = await supabaseBrowser.rpc("admin_search_users", {
      p_query: query.trim() || null,
      p_limit: 100,
      p_offset: 0,
    });
    if (rpcError) setError(rpcError.message);
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }

  async function manageUser(userId: string, action: "disable" | "enable" | "delete") {
    if (action === "delete" && !window.confirm("Bu kullanıcı üyelikten kalıcı olarak silinsin mi? Satın alma veya sertifika geçmişi olan kullanıcılar silinemez.")) return;
    setError("");
    setNotice("");
    setActionUserId(userId);
    const { data, error: functionError } = await supabaseBrowser.functions.invoke("admin-user-management", { body: { action, user_id: userId } });
    setActionUserId(null);
    if (functionError) {
      setError(functionError.message);
      return;
    }
    if (data?.error) {
      setError(String(data.error));
      return;
    }
    setNotice(action === "delete" ? "Kullanıcı silindi." : action === "disable" ? "Kullanıcı pasifleştirildi." : "Kullanıcı aktifleştirildi.");
    await search();
  }

  async function createUser() {
    setError("");
    setNotice("");
    setCreateLoading(true);
    const { data, error: functionError } = await supabaseBrowser.functions.invoke("admin-user-management", {
      body: { action: "create", full_name: newUser.full_name, email: newUser.email, password: newUser.password, role: newUser.role },
    });
    setCreateLoading(false);
    if (functionError) {
      setError(functionError.message);
      return;
    }
    if (data?.error) {
      setError(String(data.error));
      return;
    }
    setNotice("Kullanıcı oluşturuldu.");
    setNewUser({ full_name: "", email: "", password: "", role: "user" });
    setShowCreate(false);
    await search();
  }

  return (
    <div className="space-y-4">
      <div className="panel p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void search(); }} placeholder="Ad soyad veya e-posta ara..." className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-gold" />
          </div>
          <button disabled={loading} onClick={() => void search()} className="rounded-md border border-border px-4 py-2 text-sm hover:border-gold disabled:opacity-60">{loading ? "Aranıyor..." : "Ara"}</button>
          <button onClick={() => setShowCreate((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-md border border-gold px-4 py-2 text-sm hover:bg-accent/40"><UserPlus className="h-4 w-4" />{showCreate ? "Kapat" : "Kullanıcı Ekle"}</button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Arama kullanıcı adı veya e-posta üzerinden veritabanında sunucu tarafında yapılır. Kullanıcı satırına dokunarak ayrıntıları açabilirsiniz.</p>
        {showCreate && (
          <div className="mt-4 rounded-lg border border-border p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={newUser.full_name} onChange={(event) => setNewUser((value) => ({ ...value, full_name: event.target.value }))} placeholder="Ad Soyad" className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold" />
              <input type="email" value={newUser.email} onChange={(event) => setNewUser((value) => ({ ...value, email: event.target.value }))} placeholder="E-posta" className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold" />
              <input type="password" minLength={10} value={newUser.password} onChange={(event) => setNewUser((value) => ({ ...value, password: event.target.value }))} placeholder="Şifre (en az 10 karakter)" className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold" />
              <select value={newUser.role} onChange={(event) => setNewUser((value) => ({ ...value, role: event.target.value }))} className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-gold"><option value="user">Kullanıcı</option><option value="admin">Admin</option></select>
            </div>
            <button disabled={createLoading || !newUser.email || newUser.password.length < 10} onClick={() => void createUser()} className="mt-3 rounded-md border border-gold px-4 py-2 text-sm hover:bg-accent/40 disabled:opacity-60">{createLoading ? "Oluşturuluyor..." : "Kullanıcıyı Oluştur"}</button>
          </div>
        )}
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        {notice && <p role="status" className="mt-3 text-sm text-muted-foreground">{notice}</p>}
      </div>
      <div className="panel overflow-auto p-5">
        <table className="w-full min-w-[1000px] text-left text-xs">
          <thead><tr className="border-b border-border">{["Ad Soyad", "E-posta", "Rol", "Durum", "Kayıt Tarihi", "İşlem"].map((label) => <th key={label} className="p-2">{label}</th>)}</tr></thead>
          <tbody>{rows.map((row) => <tr key={row.id} onClick={() => setSelectedUserId(row.id)} className="cursor-pointer border-b border-border/50 hover:bg-accent/40" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedUserId(row.id); }}><td className="p-2"><span className="inline-flex items-center gap-2"><UserRound className="h-3.5 w-3.5 text-muted-foreground" />{row.full_name || "Belirtilmemiş"}</span></td><td className="p-2">{row.email || "—"}</td><td className="p-2">{row.role || "—"}</td><td className="p-2">{row.is_active ? <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Aktif</span> : <span className="inline-flex items-center gap-1"><Ban className="h-3.5 w-3.5" />Pasif</span>}</td><td className="p-2">{row.created_at ? new Date(row.created_at).toLocaleString("tr-TR") : "—"}</td><td className="p-2" onClick={(event) => event.stopPropagation()}><div className="flex flex-wrap gap-2"><button disabled={actionUserId === row.id} onClick={() => void manageUser(row.id, row.is_active ? "disable" : "enable")} className="rounded-md border border-border px-2 py-1 hover:border-gold disabled:opacity-60">{row.is_active ? "Pasifleştir" : "Aktifleştir"}</button><button disabled={actionUserId === row.id} onClick={() => void manageUser(row.id, "delete")} title="Üyeliği sil" aria-label="Üyeliği sil" className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 hover:border-destructive disabled:opacity-60"><Trash2 className="h-3.5 w-3.5" />Sil</button></div></td></tr>)}</tbody>
        </table>
        {rows.length === 0 && <p className="py-4 text-sm text-muted-foreground">Kullanıcı bulunamadı.</p>}
      </div>
    </div>
  );
}
