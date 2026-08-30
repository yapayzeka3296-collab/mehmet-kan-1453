import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Gift, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/hediye-kabul")({
  head: () => ({
    meta: [
      { title: "Parsel Hediyesi — MySkyParcel" },
      { name: "description", content: "Size gönderilen MySkyParcel parsel hediyesini güvenle kabul edin." },
    ],
  }),
  component: HediyeKabul,
});

type GiftPreview = {
  giftId: string;
  recipientEmail: string;
  message: string | null;
  expiresAt: string;
  parcel: { parcelNumber: string | null; tier: string | null; city: string | null };
};

function HediyeKabul() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [preview, setPreview] = useState<GiftPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  const params = useMemo(() => {
    if (typeof window === "undefined") return { gift: "", token: "" };
    const search = new URLSearchParams(window.location.search);
    return { gift: search.get("gift") ?? "", token: search.get("token") ?? "" };
  }, []);
  const giftUrl = `/hediye-kabul?gift=${encodeURIComponent(params.gift)}&token=${encodeURIComponent(params.token)}`;
  const loginUrl = `/giris?redirect=${encodeURIComponent(giftUrl)}`;
  const registerUrl = `/kayit-ol?hediye=${encodeURIComponent(giftUrl)}`;

  useEffect(() => {
    let active = true;
    async function load() {
      if (!params.gift || !params.token) {
        if (active) { setError("Hediye bağlantısı eksik veya geçersiz."); setLoading(false); }
        return;
      }
      setLoading(true); setError(null);
      try {
        if (!supabaseBrowser) throw new Error("Supabase yapılandırması eksik");
        const { data, error: functionError } = await supabaseBrowser.functions.invoke("parcel-gift", {
          body: { action: "preview", giftId: params.gift, token: params.token },
        });
        if (functionError) throw functionError;
        if (!data?.giftId) throw new Error(data?.error ?? "Hediye bağlantısı geçersiz veya süresi dolmuş.");
        if (active) setPreview(data as GiftPreview);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Hediye bilgileri alınamadı.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [params.gift, params.token]);

  async function acceptGift() {
    if (!supabaseBrowser || !user || !params.gift || !params.token) return;
    setAccepting(true); setError(null);
    try {
      const { data, error: functionError } = await supabaseBrowser.functions.invoke("parcel-gift", {
        body: { action: "accept", giftId: params.gift, token: params.token },
      });
      if (functionError) throw functionError;
      if (!data?.success) throw new Error(data?.error ?? "Hediye kabul edilemedi.");
      setAccepted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hediye kabul edilemedi.");
    } finally {
      setAccepting(false);
    }
  }

  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto flex min-h-[70vh] max-w-[760px] items-center px-4 py-12"><section className="panel w-full p-6 sm:p-10">
    <div className="text-center"><Gift className="mx-auto h-10 w-10 text-gold" /><h1 className="mt-4 font-display text-3xl font-bold">PARSEL HEDİYESİ</h1><p className="mt-2 text-sm text-muted-foreground">MySkyParcel'dan size özel bir parsel hediyesi.</p></div>
    {loading || authLoading ? <div className="flex items-center justify-center gap-3 py-16 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Hediye bilgileri kontrol ediliyor...</div> : error ? <div className="mt-8 rounded-lg border border-destructive/40 bg-destructive/10 p-5 text-center"><p className="text-sm text-destructive">{error}</p><Link to="/ana-sayfa" className="mt-5 inline-flex items-center gap-2 text-xs text-gold hover:underline">ANA SAYFAYA DÖN <ArrowRight className="h-4 w-4" /></Link></div> : accepted ? <div className="mt-8 rounded-lg border border-green-500/40 bg-green-500/10 p-6 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-green-500" /><h2 className="mt-3 font-display text-xl">HEDİYE KABUL EDİLDİ</h2><p className="mt-2 text-sm text-muted-foreground">Parsel artık hesabınızdaki koleksiyonunuzda.</p><button type="button" onClick={() => void navigate({ to: "/parsellerim" })} className="btn-gold mt-5 inline-flex items-center gap-2 rounded-md px-5 py-3 text-xs">KOLEKSİYONUMA GİT <ArrowRight className="h-4 w-4" /></button></div> : <>
      <div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-border p-4"><p className="text-[10px] text-muted-foreground">PARSEL</p><p className="mt-1 font-semibold">{preview?.parcel.parcelNumber ?? "—"}</p></div><div className="rounded-lg border border-border p-4"><p className="text-[10px] text-muted-foreground">ŞEHİR</p><p className="mt-1 font-semibold">{preview?.parcel.city ?? "—"}</p></div><div className="rounded-lg border border-border p-4"><p className="text-[10px] text-muted-foreground">PAKET</p><p className="mt-1 font-semibold">{preview?.parcel.tier ?? "—"}</p></div></div>
      {preview?.message && <div className="mt-4 rounded-lg border border-gold/30 bg-gold/5 p-4"><p className="text-[10px] text-gold">HEDİYE MESAJI</p><p className="mt-2 text-sm">{preview.message}</p></div>}
      <div className="mt-6 rounded-lg border border-border p-4 text-xs text-muted-foreground"><p><strong className="text-foreground">Alıcı:</strong> {preview?.recipientEmail}</p><p className="mt-2">Bu bağlantı 7 gün geçerlidir ve yalnızca belirtilen e-posta hesabıyla kabul edilebilir.</p></div>
      {!user ? <div className="mt-7 grid gap-3 sm:grid-cols-2"><Link to={registerUrl as never} className="btn-gold inline-flex items-center justify-center gap-2 rounded-md py-3 text-xs">ÜCRETSİZ HESAP OLUŞTUR <ArrowRight className="h-4 w-4" /></Link><Link to={loginUrl as never} className="inline-flex items-center justify-center gap-2 rounded-md border border-border py-3 text-xs hover:border-gold">HESABIM VAR — GİRİŞ YAP</Link></div> : <button type="button" onClick={() => void acceptGift()} disabled={accepting} className="btn-gold mt-7 flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-xs disabled:opacity-60">{accepting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}{accepting ? "HEDİYE KABUL EDİLİYOR..." : "HEDİYEYİ KABUL ET"}</button>}
    </>}
    <p className="mt-7 text-center text-[10px] text-muted-foreground">Güvenli sahiplik aktarımı sunucu tarafında doğrulanır.</p>
  </section></main><SiteFooter /></div>;
}
