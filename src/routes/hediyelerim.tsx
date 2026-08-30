import { createFileRoute } from "@tanstack/react-router";
import { Gift, Loader2, Mail, Send, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/hediyelerim")({
  head: () => ({ meta: [{ title: "Hediyelerim — MySkyParcel" }, { name: "description", content: "Gönderdiğiniz ve aldığınız parsel hediyelerini yönetin." }] }),
  component: Hediyelerim,
});

type ParcelOption = { id: string; parcel_number: string; tier: string | null; city_name?: string | null };
type GiftRow = { id: string; parcel_id: string; recipient_email: string; message: string | null; status: string; expires_at: string; created_at: string; recipient_user_id: string | null };

function Hediyelerim() {
  const { user, loading: authLoading } = useAuth();
  const [parcels, setParcels] = useState<ParcelOption[]>([]);
  const [gifts, setGifts] = useState<GiftRow[]>([]);
  const [selectedParcel, setSelectedParcel] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!supabaseBrowser || !user) return;
    setLoading(true); setError(null);
    try {
      const [{ data: parcelData, error: parcelError }, { data: giftData, error: giftError }] = await Promise.all([
        supabaseBrowser.from("parcels").select("id, parcel_number, tier, cities(name)").eq("owner_id", user.id).eq("status", "sold").order("created_at", { ascending: false }).limit(200),
        supabaseBrowser.from("parcel_gifts").select("id, parcel_id, recipient_email, message, status, expires_at, created_at, recipient_user_id").eq("sender_user_id", user.id).order("created_at", { ascending: false }).limit(100),
      ]);
      if (parcelError) throw parcelError;
      if (giftError) throw giftError;
      setParcels(((parcelData ?? []) as any[]).map((p) => ({ ...p, city_name: p.cities?.name ?? null })) as ParcelOption[]);
      setGifts((giftData ?? []) as GiftRow[]);
      if (!selectedParcel && parcelData?.[0]?.id) setSelectedParcel(parcelData[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hediye verileri yüklenemedi.");
    } finally { setLoading(false); }
  }

  useEffect(() => { if (user) void load(); }, [user]);

  const parcelMap = useMemo(() => new Map(parcels.map((p) => [p.id, p])), [parcels]);
  const pendingCount = gifts.filter((g) => g.status === "pending" && new Date(g.expires_at) > new Date()).length;

  async function sendGift(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null); setError(null);
    if (!supabaseBrowser || !selectedParcel) { setError("Önce hediye edilecek parseli seçin."); return; }
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) { setError("Geçerli bir e-posta adresi girin."); return; }
    setSending(true);
    try {
      const { data: gift, error: giftError } = await supabaseBrowser.rpc("create_parcel_gift", { p_parcel_id: selectedParcel, p_recipient_email: cleanEmail, p_message: message.trim() || null });
      if (giftError) throw giftError;
      const { error: emailError } = await supabaseBrowser.functions.invoke("send-parcel-gift", { body: { giftId: gift.gift_id, token: gift.token } });
      if (emailError) throw emailError;
      setEmail(""); setMessage("");
      setFeedback("Hediye oluşturuldu ve davet e-postası gönderildi.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hediye gönderilemedi.");
    } finally { setSending(false); }
  }

  async function cancelGift(id: string) {
    if (!supabaseBrowser) return;
    setCancelling(id); setError(null); setFeedback(null);
    try {
      const { error: cancelError } = await supabaseBrowser.rpc("cancel_parcel_gift", { p_gift_id: id });
      if (cancelError) throw cancelError;
      setFeedback("Bekleyen hediye iptal edildi.");
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Hediye iptal edilemedi."); }
    finally { setCancelling(null); }
  }

  if (authLoading) return <div className="starfield min-h-screen" aria-busy="true" />;
  if (!user) return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-[760px] px-4 py-16"><div className="panel p-8 text-center"><h1 className="font-display text-2xl">HEDİYELERİM</h1><p className="mt-3 text-sm text-muted-foreground">Bu bölümü kullanmak için giriş yapmalısınız.</p></div></main><SiteFooter /></div>;

  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-8"><UserSidebar active="/hediyelerim" /><div className="min-w-0 grid gap-6">
    <section className="panel p-6"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><Gift className="h-5 w-5 text-gold" /><h1 className="font-display text-3xl font-bold">HEDİYELERİM</h1></div><p className="mt-2 text-sm text-muted-foreground">Sahip olduğunuz parselleri üye olan veya olmayan kişilere güvenli davet bağlantısıyla hediye edin.</p></div><span className="rounded-full border border-gold/40 px-3 py-1 text-xs text-gold">Bekleyen: {pendingCount}</span></div></section>
    <section className="panel p-6"><h2 className="font-display text-xl">🎁 PARSEL HEDİYE ET</h2><p className="mt-2 text-xs text-muted-foreground">Parsel, alıcının hesabına yalnızca davet bağlantısı ve e-posta doğrulaması sonrası aktarılır.</p><form className="mt-5 grid gap-4" onSubmit={sendGift}><label className="grid gap-2 text-xs"><span className="text-muted-foreground">Hediye edilecek parsel</span><select value={selectedParcel} onChange={(e) => setSelectedParcel(e.target.value)} className="rounded-md border border-input bg-background px-3 py-3 outline-none focus:border-gold"><option value="">Parsel seçin</option>{parcels.map((p) => <option key={p.id} value={p.id}>{p.parcel_number} · {p.city_name ?? "—"} · {p.tier ?? "—"}</option>)}</select></label><label className="grid gap-2 text-xs"><span className="text-muted-foreground">Alıcının e-posta adresi</span><div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 focus-within:border-gold"><Mail className="h-4 w-4 text-muted-foreground" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alici@example.com" className="min-w-0 flex-1 bg-transparent py-3 outline-none" /></div></label><label className="grid gap-2 text-xs"><span className="text-muted-foreground">Hediye mesajı (isteğe bağlı)</span><textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} rows={4} placeholder="Size özel bir mesaj..." className="resize-none rounded-md border border-input bg-background px-3 py-3 outline-none focus:border-gold" /></label>{error && <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}{feedback && <p role="status" className="rounded-md border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-500">{feedback}</p>}<button type="submit" disabled={sending || !selectedParcel || parcels.length === 0} className="btn-gold inline-flex items-center justify-center gap-2 rounded-md py-3.5 text-xs disabled:opacity-60">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{sending ? "HEDİYE GÖNDERİLİYOR..." : "HEDİYEYİ GÖNDER"}</button></form>{parcels.length === 0 && <p className="mt-4 text-center text-xs text-muted-foreground">Hediye edilebilecek sahipli parseliniz bulunmuyor.</p>}</section>
    <section className="panel p-6"><h2 className="font-display text-xl">GÖNDERDİĞİM HEDİYELER</h2><div className="mt-5 grid gap-3">{loading && <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor...</div>}{!loading && gifts.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Henüz gönderilmiş bir hediyeniz yok.</p>}{!loading && gifts.map((gift) => { const parcel = parcelMap.get(gift.parcel_id); const expired = gift.status === "pending" && new Date(gift.expires_at) <= new Date(); return <div key={gift.id} className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_auto] md:items-center"><div><p className="font-semibold">{parcel?.parcel_number ?? gift.parcel_id}</p><p className="mt-1 text-xs text-muted-foreground">{gift.recipient_email}</p><p className="mt-1 text-[10px] text-muted-foreground">{gift.status === "pending" && !expired ? `Bekliyor · ${new Date(gift.expires_at).toLocaleDateString("tr-TR")} tarihine kadar` : gift.status === "accepted" ? "Kabul edildi" : gift.status === "cancelled" ? "İptal edildi" : expired ? "Süresi doldu" : gift.status}</p></div>{gift.status === "pending" && !expired && <button type="button" onClick={() => void cancelGift(gift.id)} disabled={cancelling === gift.id} className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-xs hover:border-destructive hover:text-destructive disabled:opacity-60">{cancelling === gift.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />} İPTAL ET</button>}</div>; })}</div></section>
  </div></main><SiteFooter /></div>;
}
