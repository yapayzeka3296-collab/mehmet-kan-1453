import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Gift, Loader2, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";
import { acceptParcelGift } from "@/lib/parcelGifts";

export const Route = createFileRoute("/hediye-kabul")({ component: HediyeKabul });

function HediyeKabul() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const giftId = params?.get("gift") ?? "";
  const token = params?.get("token") ?? "";

  useEffect(() => {
    if (!user || !giftId || !token || done) return;
    let active = true;
    setBusy(true);
    void acceptParcelGift(giftId, token).then(() => { if (active) setDone(true); }).catch((err) => { if (active) setMessage(err instanceof Error ? err.message : "Hediye kabul edilemedi."); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [user, giftId, token, done]);

  if (loading) return <div className="starfield min-h-screen" />;
  if (!giftId || !token) return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-xl px-4 py-20"><section className="panel p-8 text-center"><Gift className="mx-auto h-10 w-10 text-gold" /><h1 className="mt-5 font-display text-2xl">GEÇERSİZ HEDİYE BAĞLANTISI</h1><p className="mt-3 text-sm text-muted-foreground">Hediye bağlantısı eksik veya hatalı.</p></section></main></div>;
  if (!user) return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-xl px-4 py-20"><section className="panel p-8 text-center"><Gift className="mx-auto h-10 w-10 text-gold" /><h1 className="mt-5 font-display text-2xl">BİR PARSEL HEDİYESİ SİZİ BEKLİYOR</h1><p className="mt-3 text-sm text-muted-foreground">Hediyeyi kabul etmek için davetin gönderildiği e-posta adresiyle giriş yapın veya yeni hesap oluşturun.</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link to="/giris" search={{ redirect: `/hediye-kabul?gift=${encodeURIComponent(giftId)}&token=${encodeURIComponent(token)}` } as never} className="btn-gold inline-flex items-center gap-2 rounded-md px-5 py-3 text-xs"><LogIn className="h-4 w-4" /> GİRİŞ YAP</Link><Link to="/kayit-ol" search={{ redirect: `/hediye-kabul?gift=${encodeURIComponent(giftId)}&token=${encodeURIComponent(token)}` } as never} className="rounded-md border border-border px-5 py-3 text-xs hover:border-gold">KAYIT OL</Link></div></section></main></div>;

  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-xl px-4 py-20"><section className="panel p-8 text-center">{busy ? <><Loader2 className="mx-auto h-10 w-10 animate-spin text-gold" /><h1 className="mt-5 font-display text-2xl">HEDİYE KABUL EDİLİYOR...</h1><p className="mt-3 text-sm text-muted-foreground">Parsel güvenli şekilde hesabınıza aktarılıyor.</p></> : done ? <><CheckCircle2 className="mx-auto h-10 w-10 text-success" /><h1 className="mt-5 font-display text-2xl">HEDİYE KABUL EDİLDİ</h1><p className="mt-3 text-sm text-muted-foreground">Parsel artık hesabınızda. Eski sertifika arşivlendi ve adınıza yeni sertifika talebi oluşturuldu.</p><Link to="/parsellerim" className="btn-gold mt-6 inline-flex rounded-md px-5 py-3 text-xs">PARSELLERİMİ GÖR</Link></> : <><h1 className="font-display text-2xl">HEDİYE KABUL EDİLEMEDİ</h1><p className="mt-3 text-sm text-destructive">{message}</p></>}</section></main></div>;
}
