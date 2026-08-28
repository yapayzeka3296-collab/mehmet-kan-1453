import { useState } from "react";
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type CertificateRow = { id: string; status?: string | null; certificate_number?: string | null; parcel_id?: string | null; user_id?: string | null; tier?: string | null };

export function AdminCertificateOverride({ rows, onRefresh }: { rows: CertificateRow[]; onRefresh: () => Promise<void> }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function updateCertificate(id: string, action: "approve" | "reject" | "revoke") {
    if (!supabaseBrowser) return;
    const needsReason = action === "reject" || action === "revoke";
    const reason = needsReason ? window.prompt("Gerekçe (isteğe bağlı):") : null;
    if (needsReason && reason === null) return;
    setBusy(`${action}:${id}`); setMessage(null); setError(null);
    const { error: rpcError } = await supabaseBrowser.rpc("admin_update_certificate", { p_certificate_id: id, p_action: action, p_reason: reason });
    setBusy(null);
    if (rpcError) setError(rpcError.message); else { setMessage(action === "approve" ? "Sertifika talebi onaylandı." : action === "reject" ? "Sertifika talebi reddedildi." : "Sertifika iptal edildi."); await onRefresh(); }
  }

  async function issueCertificate(id: string) {
    if (!supabaseBrowser || !window.confirm("Bu onaylanmış talep yayınlansın mı? Yayınlama sırasında sertifika numarası, QR token ve fingerprint oluşturulur.")) return;
    setBusy(`issue:${id}`); setMessage(null); setError(null);
    const { error: rpcError } = await supabaseBrowser.rpc("issue_certificate_request", { p_request_id: id });
    setBusy(null);
    if (rpcError) setError(rpcError.message); else { setMessage("Sertifika yayınlandı."); await onRefresh(); }
  }

  return <div className="panel p-5">
    <div className="flex items-start gap-3"><ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gold" /><div><h2 className="font-semibold">Sertifika talepleri</h2><p className="mt-1 text-xs text-muted-foreground">requested → approved → issued akışını buradan yönetin.</p></div></div>
    {message && <div className="mt-4 rounded-md border border-green-500/30 bg-green-500/5 p-3 text-sm">{message}</div>}
    {error && <div role="alert" className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
    <div className="mt-4 overflow-auto rounded-md border border-border"><table className="w-full min-w-[900px] text-left text-xs"><thead><tr className="border-b border-border"><th className="p-3">Durum</th><th className="p-3">Parsel</th><th className="p-3">Kullanıcı</th><th className="p-3">Tier</th><th className="p-3">Sertifika No</th><th className="p-3">İşlem</th></tr></thead><tbody>{rows.map((row) => { const status=row.status; const id=row.id; return <tr key={id} className="border-b border-border/50"><td className="p-3 font-medium">{status ?? "—"}</td><td className="p-3">{row.parcel_id ?? "—"}</td><td className="p-3">{row.user_id ?? "—"}</td><td className="p-3">{row.tier ?? "—"}</td><td className="p-3">{row.certificate_number ?? "—"}</td><td className="p-3"><div className="flex flex-wrap gap-2">{status === "requested" && <><button disabled={busy!==null} onClick={()=>void updateCertificate(id,"approve")} className="inline-flex items-center gap-1 rounded-md border border-green-500/40 px-3 py-1.5 text-green-400 disabled:opacity-50">{busy===`approve:${id}`?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<CheckCircle2 className="h-3.5 w-3.5"/>}Onayla</button><button disabled={busy!==null} onClick={()=>void updateCertificate(id,"reject")} className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-3 py-1.5 text-destructive disabled:opacity-50"><XCircle className="h-3.5 w-3.5"/>Reddet</button></>}{status === "approved" && <><button disabled={busy!==null} onClick={()=>void issueCertificate(id)} className="inline-flex items-center gap-1 rounded-md border border-gold/50 px-3 py-1.5 text-gold disabled:opacity-50">{busy===`issue:${id}`?<Loader2 className="h-3.5 w-3.5 animate-spin"/>:<CheckCircle2 className="h-3.5 w-3.5"/>}Yayınla</button><button disabled={busy!==null} onClick={()=>void updateCertificate(id,"reject")} className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-3 py-1.5 text-destructive disabled:opacity-50"><XCircle className="h-3.5 w-3.5"/>Reddet</button></>}{status === "issued" && <button disabled={busy!==null} onClick={()=>void updateCertificate(id,"revoke")} className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-3 py-1.5 text-destructive disabled:opacity-50"><XCircle className="h-3.5 w-3.5"/>İptal Et</button>}{!['requested','approved','issued'].includes(status ?? '') && <span className="text-muted-foreground">İşlem yok</span>}</div></td></tr>})}</tbody></table></div>
  </div>;
}
