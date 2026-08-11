import { createFileRoute } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useState } from "react";
import { QrCode, Search, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export const Route = createFileRoute("/sertifika-dogrula")({
  validateSearch: (search) => ({ code: typeof search["code"] === "string" ? search["code"] : "" }),
  head: () => ({ meta: [{ title: "Sertifika Doğrula — MySkyParcel" }, { name: "description", content: "Sertifika numarasını girerek sertifikanın geçerliliğini kontrol et." }, { property: "og:title", content: "Sertifika Doğrula — MySkyParcel" }, { property: "og:description", content: "QR kod veya sertifika numarası ile doğrulama." }] }),
  component: Dogrula,
});

type VerificationResult = { certificate_number: string; status: "issued"; issued_at: string | null; parcel_number: string; city_code: string | null; city_name: string | null; tier: "digital" | "elite" | "premium"; owner_display_name: string | null; certificate_fingerprint: string | null };
const TIER_LABELS = { digital: "Dijital", elite: "Elit", premium: "Premium" } as const;
const CERTIFICATE_PATTERN = /^[A-Z0-9-]{4,80}$/i;

function Dogrula() {
  const { code: initialCode } = Route.useSearch();
  const [code, setCode] = useState(initialCode); const [result, setResult] = useState<VerificationResult | null>(null); const [loading, setLoading] = useState(false); const [message, setMessage] = useState<string | null>(null);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setResult(null); setMessage(null); const normalized=code.trim().toUpperCase();
    if (!normalized) { setMessage("Lütfen sertifika numaranızı girin."); return; }
    if (!CERTIFICATE_PATTERN.test(normalized)) { setMessage("Sertifika numarası geçersiz formatta."); return; }
    if (!supabaseBrowser) { setMessage("Doğrulama servisi şu anda yapılandırılmamış."); return; }
    setLoading(true);
    try { const { data, error }=await supabaseBrowser.rpc("verify_certificate",{p_certificate_number:normalized}); if(error) throw error; const verified=Array.isArray(data)?data[0]:data; if(!verified){setMessage("Bu numaraya ait doğrulanmış bir sertifika bulunamadı.");return;} setResult(verified as VerificationResult); }
    catch(error){console.error("Certificate verification error",error);setMessage("Doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.");} finally {setLoading(false);}
  }
  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-3xl px-4 py-16 lg:px-8"><div className="text-center"><ShieldCheck className="mx-auto h-10 w-10 text-gold" /><h1 className="mt-4 font-display text-4xl font-bold">SERTİFİKA DOĞRULA</h1><p className="mt-4 text-sm text-muted-foreground">Sertifika numaranızı veya sertifika üzerindeki QR kodu kullanarak geçerliliği kontrol edin.</p></div><div className="panel mt-10 p-6 sm:p-10"><form onSubmit={handleSubmit} noValidate><label className="text-xs text-muted-foreground" htmlFor="kod">Sertifika Numarası</label><div className="mt-2 flex items-center gap-3 rounded-md border border-input bg-background/50 px-3 focus-within:border-gold"><Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" /><input id="kod" value={code} onChange={(event)=>setCode(event.target.value)} placeholder="Örn: MSP-XXXXXXXXXXXX" autoComplete="off" inputMode="text" aria-describedby="verification-status" aria-invalid={Boolean(message)} disabled={loading} className="min-w-0 flex-1 bg-transparent py-3 text-sm uppercase outline-none" /></div><button type="submit" disabled={loading} className="btn-gold mt-5 w-full rounded-md py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60">{loading?"DOĞRULANIYOR...":"DOĞRULA"}</button></form><div id="verification-status" aria-live="polite" className="mt-5">{message&&<div className="rounded-md border border-red-300/20 bg-red-500/5 p-4 text-sm text-red-200">{message}</div>}{result&&<div className="rounded-md border border-gold/30 bg-gold/5 p-5"><div className="flex items-center gap-2 text-sm font-semibold text-gold"><ShieldCheck className="h-5 w-5" aria-hidden="true" /> SERTİFİKA DOĞRULANDI</div><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-xs text-muted-foreground">Sertifika</dt><dd className="mt-1 font-medium">{result.certificate_number}</dd></div><div><dt className="text-xs text-muted-foreground">Sahibi</dt><dd className="mt-1 font-medium">{result.owner_display_name??"—"}</dd></div><div><dt className="text-xs text-muted-foreground">Parsel</dt><dd className="mt-1 font-medium">{result.parcel_number}</dd></div><div><dt className="text-xs text-muted-foreground">Şehir</dt><dd className="mt-1 font-medium">{result.city_name??result.city_code??"—"}</dd></div><div><dt className="text-xs text-muted-foreground">Paket</dt><dd className="mt-1 font-medium">{TIER_LABELS[result.tier]}</dd></div><div><dt className="text-xs text-muted-foreground">Durum</dt><dd className="mt-1 font-medium">Geçerli</dd></div><div><dt className="text-xs text-muted-foreground">Düzenlenme</dt><dd className="mt-1 font-medium">{result.issued_at?new Date(result.issued_at).toLocaleDateString("tr-TR"):"—"}</dd></div></dl></div>}</div><div className="mt-8 flex items-start gap-4 rounded-md border border-border bg-background/40 p-5"><QrCode className="h-8 w-8 shrink-0 text-gold" aria-hidden="true" /><p className="min-w-0 text-sm text-muted-foreground">Sertifikanızın üzerindeki QR kod, MySkyParcel doğrulama sayfasını açar. Yalnızca sunucuda <strong>issued</strong> durumundaki sertifikalar doğrulanmış kabul edilir.</p></div></div></main><TrustBar items={SECURITY_TRUST} /><SiteFooter /></div>;
}
