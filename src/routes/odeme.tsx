import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import type { ParcelTier } from "@/types/parcel";

type Tier = ParcelTier;
type ParcelRow = { id: string; tier: Tier | null; tier_price: number | null; status: string };
export const Route = createFileRoute("/odeme")({ validateSearch: (search: Record<string, unknown>) => ({ parcels: typeof search.parcels === "string" ? search.parcels : "", certificateParcel: typeof search.certificateParcel === "string" ? search.certificateParcel : "" }), head: () => ({ meta: [{ title: "Ödeme — MySkyParcel" }, { name: "description", content: "MySkyParcel güvenli Shopier ödeme ekranı." }] }), component: Odeme });
const PACKAGES: Record<Tier, { name: string; price: number }> = { digital: { name: "Dijital", price: 149 }, elite: { name: "Özel", price: 349 }, premium: { name: "Premium", price: 699 } };

function Odeme() {
  const navigate = useNavigate({ from: "/odeme" });
  const { parcels, certificateParcel } = Route.useSearch();
  const selectedParcels = useMemo(() => Array.from(new Set(parcels.split(",").map((v) => v.trim()).filter(Boolean))), [parcels]);
  const [verified, setVerified] = useState<Array<{ id: string; tier: Tier; price: number }>>([]);
  const [loading, setLoading] = useState(true); const [paying, setPaying] = useState(false); const [error, setError] = useState<string | null>(null);

  useEffect(() => { let active = true; async function verify() {
    if (!selectedParcels.length) { setVerified([]); setLoading(false); return; }
    if (!supabaseBrowser) { setError("Parsel doğrulama altyapısı kullanılamıyor."); setLoading(false); return; }
    setLoading(true); setError(null);
    const { data, error: queryError } = await supabaseBrowser.from("parcel_map_public").select("id,tier,tier_price,status").in("id", selectedParcels);
    if (!active) return;
    if (queryError) { setError("Parseller ödeme öncesinde doğrulanamadı."); setVerified([]); setLoading(false); return; }
    const rows = (data ?? []) as ParcelRow[]; const byId = new Map(rows.map((r) => [r.id, r]));
    const missing = selectedParcels.filter((id) => !byId.has(id)); const unavailable = rows.filter((r) => r.status !== "available");
    const invalid = rows.filter((r) => !r.tier || !["digital", "elite", "premium"].includes(r.tier) || Number(r.tier_price) !== PACKAGES[r.tier!].price);
    if (missing.length || unavailable.length || invalid.length) { setError(unavailable.length ? "Seçilen parsellerden biri artık satışa uygun değil." : invalid.length ? "Parsel paket/fiyat bilgisi doğrulanamadı." : "Seçilen parseller doğrulanamadı."); setVerified([]); setLoading(false); return; }
    setVerified(selectedParcels.map((id) => { const r = byId.get(id)!; return { id, tier: r.tier!, price: PACKAGES[r.tier!].price }; })); setLoading(false);
  } void verify(); return () => { active = false; }; }, [selectedParcels]);

  const total = verified.reduce((s, i) => s + i.price, 0);
  const certificateIsSelected = Boolean(certificateParcel && selectedParcels.includes(certificateParcel));
  const groups = useMemo(() => (["digital", "elite", "premium"] as Tier[]).map((tier) => { const items = verified.filter((i) => i.tier === tier); return items.length ? { tier, name: PACKAGES[tier].name, price: PACKAGES[tier].price, count: items.length, parcels: items.map((i) => i.id) } : null; }).filter(Boolean) as Array<{ tier: Tier; name: string; price: number; count: number; parcels: string[] }>, [verified]);

  async function startPayment() {
    if (!supabaseBrowser || !verified.length || !certificateIsSelected || paying) return;
    setPaying(true); setError(null);
    const popup = window.open("about:blank", "myskyparcel-shopier", "noopener,noreferrer");
    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession(); const token = sessionData.session?.access_token;
      if (!token) { popup?.close(); await navigate({ to: "/giris" }); return; }
      const response = await fetch("/api/shopier-checkout-intent", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ parcel_ids: selectedParcels, certificate_parcel_id: certificateParcel }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok || !result.checkout_url) throw new Error(result.reason || "Shopier ödeme sayfası oluşturulamadı.");
      localStorage.setItem("myskyparcel_shopier_intent", result.intent_id);
      if (popup) { popup.location.href = result.checkout_url; } else { window.location.href = result.checkout_url; return; }
      await navigate({ to: "/odeme-sonuc", search: { intent: result.intent_id } });
    } catch (e) { popup?.close(); setError(e instanceof Error ? e.message : "Ödeme başlatılamadı."); setPaying(false); }
  }

  if (loading) return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-3xl px-4 py-16 lg:px-8"><div className="panel p-8 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-gold" /><p className="mt-4 text-sm text-muted-foreground">Ödeme öncesi parseller doğrulanıyor...</p></div></main><SiteFooter /></div>;
  if (!verified.length || !certificateIsSelected) return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-3xl px-4 py-16 lg:px-8"><div className="panel p-8 text-center"><h1 className="font-display text-3xl font-bold">ÖDEME HAZIRLANAMADI</h1><p className="mt-3 text-sm text-muted-foreground">{error ?? (!certificateIsSelected ? "Sertifika için bir parsel seçimi doğrulanamadı." : "Seçilen parseller doğrulanamadı.")}</p><button type="button" onClick={() => void navigate({ to: "/parsel-satin-al", search: { parcels: selectedParcels.join(","), certificateParcel: selectedParcels[0] ?? "" } })} className="mt-6 inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-xs"><ArrowLeft className="h-4 w-4" /> BİLGİLERE DÖN</button></div></main><SiteFooter /></div>;
  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-[1200px] px-4 py-12 lg:px-8"><h1 className="text-center font-display text-4xl font-bold sm:text-5xl">ÖDEME</h1><p className="mx-auto mt-3 max-w-3xl text-center text-sm text-muted-foreground">{verified.length} parsel doğrulandı. Sertifika <strong className="text-foreground">{certificateParcel}</strong> için oluşturulacak.</p><div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]"><section className="panel p-6 sm:p-8"><div className="mb-6 flex items-center gap-3"><Lock className="h-5 w-5 text-gold" /><div><h2 className="font-display text-lg">SHOPIER İLE GÜVENLİ ÖDEME</h2><p className="text-xs text-muted-foreground">Kart bilgileriniz MySkyParcel'e gelmez; ödeme Shopier'in güvenli ödeme ekranında yapılır.</p></div></div><div className="space-y-4">{groups.map((g) => <div key={g.tier} className="rounded-xl border border-border p-5"><div className="flex items-center justify-between"><div><p className="font-semibold">{g.name}</p><p className="mt-1 text-xs text-muted-foreground">{g.count} parsel × {g.price.toLocaleString("tr-TR")} TL</p></div><p className="font-display text-xl text-gold">{(g.count * g.price).toLocaleString("tr-TR")} TL</p></div><p className="mt-3 text-xs text-muted-foreground">{g.parcels.join(", ")}</p></div>)}</div>{error && <div className="mt-5 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-xs">{error}</div>}<button type="button" disabled={paying} onClick={() => void startPayment()} className="btn-gold mt-6 flex w-full items-center justify-center gap-2 rounded-md px-6 py-4 text-xs disabled:opacity-60">{paying ? <><Loader2 className="h-4 w-4 animate-spin" /> ÖDEME SAYFASI HAZIRLANIYOR...</> : <><Lock className="h-4 w-4" /> SHOPIER'DE GÜVENLİ ÖDEMEYE GEÇ <ExternalLink className="h-4 w-4" /></>}</button><p className="mt-4 text-center text-[11px] text-muted-foreground">Parseller, Shopier ödemesi sunucu tarafında doğrulanana kadar kesin olarak satılmış kabul edilmez.</p></section><aside className="panel h-fit p-6 lg:sticky lg:top-6"><h2 className="font-display text-base">SİPARİŞ ÖZETİ</h2><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Parsel sayısı</span><span>{verified.length}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Sertifika</span><span>{certificateParcel}</span></div><div className="border-t border-border pt-4 flex justify-between"><span className="font-semibold">Toplam</span><span className="font-display text-2xl text-gold">{total.toLocaleString("tr-TR")} TL</span></div></div><div className="mt-5 rounded-lg border border-gold/20 bg-gold/[0.04] p-4 text-xs text-muted-foreground"><ShieldCheck className="mb-2 h-4 w-4 text-gold" /><p>Ödeme sonrası webhook ve Shopier API ile tutar, ürün ve ödeme durumu doğrulanır.</p></div><button type="button" onClick={() => void navigate({ to: "/parsel-satin-al", search: { parcels: selectedParcels.join(","), certificateParcel } })} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border px-5 py-3 text-xs"><ArrowLeft className="h-4 w-4" /> BİLGİLERE DÖN</button></aside></div></main><SiteFooter /></div>;
}
