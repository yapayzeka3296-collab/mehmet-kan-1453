import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export const Route = createFileRoute("/odeme-sonuc")({
  validateSearch: (search: Record<string, unknown>) => ({ intent: typeof search.intent === "string" ? search.intent : "" }),
  head: () => ({ meta: [{ title: "Sipariş Durumu — MySkyParcel" }] }),
  component: PaymentResult,
});

function PaymentResult() {
  const navigate = useNavigate({ from: "/odeme-sonuc" }); const { intent } = Route.useSearch();
  const [status, setStatus] = useState<"checking" | "paid" | "waiting" | "failed">("checking");
  const [message, setMessage] = useState("Shopier ödemeniz doğrulanıyor...");

  useEffect(() => {
    if (!intent || !supabaseBrowser) { setStatus("failed"); setMessage("Sipariş doğrulama bilgisi bulunamadı."); return; }
    let cancelled = false; let timer: ReturnType<typeof setInterval> | undefined;
    const check = async () => {
      const { data, error } = await supabaseBrowser.from("shopier_checkout_intents").select("status").eq("id", intent).maybeSingle();
      if (cancelled) return;
      if (error) { setStatus("waiting"); setMessage("Ödeme alındıysa doğrulama birkaç saniye sürebilir."); return; }
      if (data?.status === "paid") { setStatus("paid"); setMessage("Ödemeniz doğrulandı. Parselleriniz hesabınıza tanımlandı ve sertifika süreci başlatıldı."); if (timer) clearInterval(timer); return; }
      if (["failed", "cancelled", "expired"].includes(data?.status ?? "")) { setStatus("failed"); setMessage("Ödeme tamamlanamadı veya ödeme oturumu sona erdi."); if (timer) clearInterval(timer); return; }
      setStatus("waiting"); setMessage("Shopier ödeme sonucu sunucuda doğrulanıyor...");
    };
    void check(); timer = setInterval(() => void check(), 2500); const stop = setTimeout(() => { if (!cancelled) { setStatus("waiting"); setMessage("Doğrulama devam ediyor. Siparişlerim sayfasından durumu takip edebilirsiniz."); } }, 30000);
    return () => { cancelled = true; if (timer) clearInterval(timer); clearTimeout(stop); };
  }, [intent]);

  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-2xl px-4 py-20 lg:px-8"><div className="panel p-8 text-center sm:p-12">{status === "checking" ? <Loader2 className="mx-auto h-12 w-12 animate-spin text-gold" /> : status === "paid" ? <CheckCircle2 className="mx-auto h-14 w-14 text-gold" /> : status === "failed" ? <XCircle className="mx-auto h-14 w-14 text-destructive" /> : <Loader2 className="mx-auto h-12 w-12 animate-spin text-gold" />}<h1 className="mt-6 font-display text-3xl font-bold">{status === "paid" ? "SİPARİŞ TAMAMLANDI" : status === "failed" ? "ÖDEME DOĞRULANAMADI" : "ÖDEME DOĞRULANIYOR"}</h1><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">{message}</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><button type="button" onClick={() => void navigate({ to: "/siparislerim" })} className="btn-gold rounded-md px-6 py-3 text-xs">SİPARİŞLERİM</button><button type="button" onClick={() => void navigate({ to: "/panelim" })} className="rounded-md border border-border px-6 py-3 text-xs">PANELE DÖN</button></div></div></main><SiteFooter /></div>;
}
