import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Row = Record<string, any>;

export function AdminCertificateOverride() {
  const [parcelQuery, setParcelQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [parcels, setParcels] = useState<Row[]>([]);
  const [users, setUsers] = useState<Row[]>([]);
  const [parcelId, setParcelId] = useState("");
  const [userId, setUserId] = useState("");
  const [tier, setTier] = useState("digital");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function searchParcels() {
    if (!supabaseBrowser) return;
    setError(""); setMessage("");
    const { data, error } = await supabaseBrowser.rpc("admin_search_parcels_for_certificate", { p_query: parcelQuery.trim() || null });
    if (error) setError(error.message); else setParcels((data ?? []) as Row[]);
  }

  async function searchUsers() {
    if (!supabaseBrowser) return;
    setError(""); setMessage("");
    const { data, error } = await supabaseBrowser.rpc("admin_search_users_for_certificate", { p_query: userQuery.trim() || null });
    if (error) setError(error.message); else setUsers((data ?? []) as Row[]);
  }

  async function createCertificate() {
    if (!supabaseBrowser || !parcelId || !userId) return;
    setBusy(true); setError(""); setMessage("");
    const { error } = await supabaseBrowser.rpc("admin_create_certificate_for_parcel", {
      p_parcel_id: parcelId,
      p_user_id: userId,
      p_tier: tier,
    });
    if (error) setError(error.message);
    else {
      setMessage("Admin sertifikası oluşturuldu ve Supabase'e kaydedildi. Parselin satış durumu ve envanter sayacı değiştirilmedi.");
      setParcelId("");
    }
    setBusy(false);
  }

  return <div className="panel p-5">
    <h2 className="font-semibold">Admin Sertifika Baskısı</h2>
    <p className="mt-2 text-xs text-muted-foreground">Admin, gerçek bir parseli seçip mevcut bir kullanıcı adına Dijital, Elit veya Premium sertifika oluşturabilir. Bu özel işlem satın alma/sipariş/ödeme kaydı oluşturmaz ve parsel sayaçlarını değiştirmez.</p>

    {error && <div role="alert" className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">{error}</div>}
    {message && <div role="status" className="mt-4 rounded-md border border-gold/30 p-3 text-xs text-gold">{message}</div>}

    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <section className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">1. Parsel seç</h3>
        <form onSubmit={(e) => { e.preventDefault(); void searchParcels(); }} className="mt-3 flex gap-2">
          <input className="min-w-0 flex-1 rounded-md border bg-background p-2 text-sm" placeholder="Parsel numarası" value={parcelQuery} onChange={(e) => setParcelQuery(e.target.value)} />
          <button className="btn-gold rounded-md px-3 py-2 text-xs">Ara</button>
        </form>
        <div className="mt-3 max-h-64 space-y-2 overflow-auto">
          {parcels.map((p) => <button key={p.parcel_id} type="button" onClick={() => setParcelId(p.parcel_id)} className={`w-full rounded-md border p-3 text-left text-xs ${parcelId === p.parcel_id ? "border-gold bg-accent" : "border-border"}`}>
            <div className="font-semibold">{p.parcel_number}</div><div className="mt-1 text-muted-foreground">Durum: {p.status} · Tier: {p.tier || "—"}</div><div className="text-muted-foreground">Sahibi: {p.owner_name || "—"}</div>
          </button>)}
        </div>
      </section>

      <section className="rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">2. Sertifika sahibi seç</h3>
        <form onSubmit={(e) => { e.preventDefault(); void searchUsers(); }} className="mt-3 flex gap-2">
          <input className="min-w-0 flex-1 rounded-md border bg-background p-2 text-sm" placeholder="Ad veya e-posta" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} />
          <button className="btn-gold rounded-md px-3 py-2 text-xs">Ara</button>
        </form>
        <div className="mt-3 max-h-64 space-y-2 overflow-auto">
          {users.map((u) => <button key={u.user_id} type="button" onClick={() => setUserId(u.user_id)} className={`w-full rounded-md border p-3 text-left text-xs ${userId === u.user_id ? "border-gold bg-accent" : "border-border"}`}>
            <div className="font-semibold">{u.full_name || "İsimsiz kullanıcı"}</div><div className="mt-1 text-muted-foreground">{u.email}</div>
          </button>)}
        </div>
      </section>
    </div>

    <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
      <div><label className="mb-1 block text-xs text-muted-foreground">Seçilen parsel</label><input readOnly className="w-full rounded-md border bg-muted p-2 text-sm" value={parcelId} placeholder="Parsel seçilmedi" /></div>
      <div><label className="mb-1 block text-xs text-muted-foreground">Sertifika statüsü</label><select className="w-full rounded-md border bg-background p-2 text-sm" value={tier} onChange={(e) => setTier(e.target.value)}><option value="digital">Dijital Parsel Sertifika</option><option value="elite">Elit Parsel Sertifika</option><option value="premium">Premium Parsel Sertifika</option></select></div>
      <button disabled={busy || !parcelId || !userId} onClick={() => void createCertificate()} className="btn-gold rounded-md px-5 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50">{busy ? "OLUŞTURULUYOR..." : "SERTİFİKAYI OLUŞTUR"}</button>
    </div>
  </div>;
}
