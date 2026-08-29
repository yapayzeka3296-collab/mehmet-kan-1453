import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Gift, Loader2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { UserSidebar } from "@/components/UserSidebar";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { createParcelGift } from "@/lib/parcelGifts";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/hediye-et")({ component: HediyeEt });

type Parcel = { id: string; parcel_number: string; tier: string; city?: { name?: string } | null };

function HediyeEt() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [parcelId, setParcelId] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !supabaseBrowser) return;
    void supabaseBrowser.from("parcels").select("id,parcel_number,tier,cities(name)").eq("owner_id", user.id).eq("status", "sold").order("created_at", { ascending: false }).then(({ data }) => {
      const items = ((data ?? []) as Array<Record<string, unknown>>).map((p) => ({ id: String(p.id), parcel_number: String(p.parcel_number), tier: String(p.tier), city: p.cities as { name?: string } | null }));
      setParcels(items);
      if (items[0]) setParcelId(items[0].id);
    });
  }, [user]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setNotice("");
    if (!parcelId || !email.trim()) { setError("Parsel ve alıcı e-posta adresi zorunludur."); return; }
    setBusy(true);
    try {
      await createParcelGift(parcelId, email, message);
      setNotice("Hediye daveti gönderildi. Alıcı bağlantıdan kayıt olup hediyesini kabul edebilir.");
      setEmail(""); setMessage("");
    } catch (err) { setError(err instanceof Error ? err.message : "Hediye gönderilemedi."); }
    finally { setBusy(false); }
  }

  if (authLoading) return <div className="starfield min-h-screen" />;
  if (!user) return <Navigate to="/giris" replace />;

  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8"><UserSidebar active="/hediye-et" /><section className="panel max-w-3xl p-6 sm:p-10"><Link to="/parsellerim" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-gold"><ArrowLeft className="h-4 w-4" /> Parsellerime dön</Link><div className="mt-8 flex items-center gap-4"><div className="rounded-xl border border-gold/30 bg-gold/10 p-3"><Gift className="h-7 w-7 text-gold" /></div><div><h1 className="font-display text-3xl">PARSEL HEDİYE ET</h1><p className="mt-1 text-sm text-muted-foreground">Üye olmayan birine de e-posta ile hediye gönderebilirsiniz.</p></div></div><form onSubmit={submit} className="mt-8 space-y-5"><div><label className="text-xs text-muted-foreground">Hediye edilecek parsel</label><select value={parcelId} onChange={(e) => setParcelId(e.target.value)} className="mt-2 w-full rounded-md border border-input bg-background px-3 py-3 text-sm" disabled={!parcels.length}>{parcels.length ? parcels.map((p) => <option key={p.id} value={p.id}>{p.parcel_number} · {p.city?.name ?? "İl"} · {p.tier}</option>) : <option>Hediye edilebilir parsel bulunamadı</option>}</select></div><div><label className="text-xs text-muted-foreground" htmlFor="gift-email">Alıcının e-posta adresi</label><input id="gift-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alici@email.com" className="mt-2 w-full rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:border-gold" /></div><div><label className="text-xs text-muted-foreground" htmlFor="gift-message">Mesajınız (isteğe bağlı)</label><textarea id="gift-message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={500} rows={4} className="mt-2 w-full resize-none rounded-md border border-input bg-background px-3 py-3 text-sm outline-none focus:border-gold" /></div>{notice && <p role="status" className="rounded-md border border-success/40 bg-success/10 px-3 py-3 text-sm text-success">{notice}</p>}{error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-3 text-sm text-destructive">{error}</p>}<button type="submit" disabled={busy || !parcels.length} className="btn-gold flex w-full items-center justify-center gap-2 rounded-md py-3.5 text-sm disabled:opacity-60">{busy ? <><Loader2 className="h-4 w-4 animate-spin" /> GÖNDERİLİYOR...</> : <>HEDİYE DAVETİ GÖNDER <Gift className="h-4 w-4" /></>}</button></form></section></main></div>;
}
