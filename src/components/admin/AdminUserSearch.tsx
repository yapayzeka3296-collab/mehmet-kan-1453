import { Search, UserRound } from "lucide-react";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Row = Record<string, any>;

export function AdminUserSearch({ initialRows }: { initialRows: Row[] }) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search() {
    setError("");
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

  return (
    <div className="space-y-4">
      <div className="panel p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") void search(); }}
              placeholder="Ad soyad veya e-posta ara..."
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-gold"
            />
          </div>
          <button disabled={loading} onClick={() => void search()} className="rounded-md border border-border px-4 py-2 text-sm hover:border-gold disabled:opacity-60">
            {loading ? "Aranıyor..." : "Ara"}
          </button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Arama kullanıcı adı veya e-posta üzerinden veritabanında sunucu tarafında yapılır.</p>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      </div>

      <div className="panel overflow-auto p-5">
        <table className="w-full min-w-[800px] text-left text-xs">
          <thead><tr className="border-b border-border">{["Ad Soyad", "E-posta", "Rol", "Kayıt Tarihi"].map((label) => <th key={label} className="p-2">{label}</th>)}</tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border/50">
                <td className="p-2"><span className="inline-flex items-center gap-2"><UserRound className="h-3.5 w-3.5 text-muted-foreground" />{row.full_name || "Belirtilmemiş"}</span></td>
                <td className="p-2">{row.email || "—"}</td>
                <td className="p-2">{row.role || "—"}</td>
                <td className="p-2">{row.created_at ? new Date(row.created_at).toLocaleString("tr-TR") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="py-4 text-sm text-muted-foreground">Kullanıcı bulunamadı.</p>}
      </div>
    </div>
  );
}
