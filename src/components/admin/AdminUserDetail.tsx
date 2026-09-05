import { ArrowLeft, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Row = Record<string, any>;

export function AdminUserDetail({ userId, onBack }: { userId: string; onBack: () => void }) {
  const [user, setUser] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true); setError("");
      const { data, error: rpcError } = await supabaseBrowser.rpc("admin_user_detail", { p_user_id: userId });
      if (rpcError) setError(rpcError.message); else setUser((data ?? null) as Row | null);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) return <div className="panel p-5 text-sm text-muted-foreground">Kullanıcı bilgileri yükleniyor...</div>;
  if (error) return <div className="space-y-3"><button onClick={onBack} className="inline-flex items-center gap-2 text-sm hover:text-gold"><ArrowLeft className="h-4 w-4" />Kullanıcılara dön</button><div role="alert" className="panel p-5 text-sm text-destructive">{error}</div></div>;
  if (!user) return null;

  const address = [user.address, user.district, user.city, user.postal_code].filter(Boolean).join(", ");
  const parcels = Array.isArray(user.purchased_parcels) ? user.purchased_parcels : [];
  const certificates = Array.isArray(user.certificates) ? user.certificates : [];

  return <div className="space-y-4">
    <button onClick={onBack} className="inline-flex items-center gap-2 text-sm hover:text-gold"><ArrowLeft className="h-4 w-4" />Kullanıcılara dön</button>
    <div className="panel p-5">
      <div className="flex items-center gap-3"><UserRound className="h-6 w-6 text-gold" /><div><h2 className="font-semibold">{user.full_name || "Belirtilmemiş"}</h2><p className="text-xs text-muted-foreground">{user.email || "—"}</p></div></div>
      <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        <div><p className="text-xs text-muted-foreground">Ad Soyad</p><p className="mt-1">{user.full_name || "—"}</p></div>
        <div><p className="text-xs text-muted-foreground">E-posta</p><p className="mt-1">{user.email || "—"}</p></div>
        <div><p className="text-xs text-muted-foreground">Telefon</p><p className="mt-1">{user.phone || "—"}</p></div>
        <div><p className="text-xs text-muted-foreground">Adres</p><p className="mt-1">{address || "Adres bilgisi bulunmuyor"}</p></div>
        <div><p className="text-xs text-muted-foreground">Rol</p><p className="mt-1">{user.role || "—"}</p></div>
        <div><p className="text-xs text-muted-foreground">Kayıt Tarihi</p><p className="mt-1">{user.created_at ? new Date(user.created_at).toLocaleString("tr-TR") : "—"}</p></div>
      </div>
    </div>
    <div className="panel overflow-auto p-5"><h3 className="font-semibold">Satın Alınan Parseller ({parcels.length})</h3>{parcels.length ? <table className="mt-4 w-full min-w-[700px] text-left text-xs"><thead><tr className="border-b border-border">{["Parsel", "Sınıf", "Fiyat", "Durum", "Tarih"].map((x) => <th key={x} className="p-2">{x}</th>)}</tr></thead><tbody>{parcels.map((p: Row) => <tr key={p.id} className="border-b border-border/50"><td className="p-2">{p.parcel_number}</td><td className="p-2">{p.tier}</td><td className="p-2">{p.price == null ? "—" : `${Number(p.price).toLocaleString("tr-TR")} ₺`}</td><td className="p-2">{p.status}</td><td className="p-2">{p.created_at ? new Date(p.created_at).toLocaleString("tr-TR") : "—"}</td></tr>)}</tbody></table> : <p className="mt-3 text-sm text-muted-foreground">Satın alınmış parsel yok.</p>}</div>
    <div className="panel overflow-auto p-5"><h3 className="font-semibold">Sertifikalar ({certificates.length})</h3>{certificates.length ? <table className="mt-4 w-full min-w-[800px] text-left text-xs"><thead><tr className="border-b border-border">{["Sertifika", "Parsel", "Sınıf", "Durum", "Veriliş"].map((x) => <th key={x} className="p-2">{x}</th>)}</tr></thead><tbody>{certificates.map((c: Row) => <tr key={c.id} className="border-b border-border/50"><td className="p-2">{c.certificate_number || "—"}</td><td className="p-2">{c.parcel_number || "—"}</td><td className="p-2">{c.tier || "—"}</td><td className="p-2">{c.status || "—"}</td><td className="p-2">{c.issued_at ? new Date(c.issued_at).toLocaleString("tr-TR") : "—"}</td></tr>)}</tbody></table> : <p className="mt-3 text-sm text-muted-foreground">Sertifika yok.</p>}</div>
  </div>;
}
