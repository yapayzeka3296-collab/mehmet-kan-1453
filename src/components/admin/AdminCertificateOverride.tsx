import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, ShieldAlert, XCircle } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export function AdminCertificateOverride() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const actions = useMemo(() => [
    { action: "approve", label: "Onayla", icon: CheckCircle2 },
    { action: "reject", label: "Reddet", icon: XCircle },
  ] as const, []);

  async function updateCertificate(id: string, action: "approve" | "reject" | "revoke") {
    if (!supabaseBrowser) return;
    setBusy(`${action}:${id}`); setMessage(null); setError(null);
    const reason = action === "reject" || action === "revoke" ? window.prompt("Gerekçe (isteğe bağlı):") : null;
    if ((action === "reject" || action === "revoke") && reason === null) { setBusy(null); return; }
    const { error: rpcError } = await supabaseBrowser.rpc("admin_update_certificate", {
      p_certificate_id: id,
      p_action: action,
      p_reason: reason,
    });
    setBusy(null);
    if (rpcError) setError(rpcError.message);
    else setMessage(action === "approve" ? "Sertifika talebi onaylandı." : action === "reject" ? "Sertifika talebi reddedildi." : "Sertifika iptal edildi.");
  }

  async function issueCertificate(id: string) {
    if (!supabaseBrowser) return;
    if (!window.confirm("Onaylanmış bu talep yayınlansın ve benzersiz sertifika numarası/QR bilgileri oluşturulsun mu?")) return;
    setBusy(`issue:${id}`); setMessage(null); setError(null);
    const { error: rpcError } = await supabaseBrowser.rpc("issue_certificate_request", { p_request_id: id });
    setBusy(null);
    if (rpcError) setError(rpcError.message);
    else setMessage("Sertifika yayınlandı. Sertifika numarası ve doğrulama bilgileri oluşturuldu.");
  }

  return (
    <div className="panel p-5">
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
        <div>
          <h2 className="font-semibold">Sertifika iş akışı</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Talep edilen sertifikaları önce onaylayın. Onaylanan talepler ayrıca yayınlanarak issued durumuna geçirilir.
          </p>
        </div>
      </div>
      {message && <div className="mt-4 rounded-md border border-green-500/30 bg-green-500/5 p-3 text-sm">{message}</div>}
      {error && <div role="alert" className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
      <div className="mt-4 rounded-md border border-border p-4 text-xs text-muted-foreground">
        <p><span className="text-foreground">requested</span> → Onayla → <span className="text-foreground">approved</span> → Yayınla → <span className="text-foreground">issued</span></p>
        <p className="mt-2">Reddet işlemi requested/approved talepleri rejected yapar. issued sertifikalar ayrı olarak iptal edilebilir.</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-border px-3 py-1 text-[11px]">Onaylama: admin_update_certificate</span>
        <span className="rounded-full border border-border px-3 py-1 text-[11px]">Yayınlama: issue_certificate_request</span>
      </div>
    </div>
  );
}
