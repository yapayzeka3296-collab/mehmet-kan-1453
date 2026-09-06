import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Loader2, LockKeyhole } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TrustBar } from "@/components/TrustBar";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { readParcelCart } from "@/lib/parcelCart";
import type { ParcelTier } from "@/types/parcel";

type Tier = ParcelTier;
type PurchaseItem = { id: string; tier: Tier; price: number };
type PurchaseSearch = { parcels?: string };
type PublicParcelRow = { id: string; tier: Tier | null; tier_price: number | null; status: string };

const VALID_TIERS: Tier[] = ["digital", "elite", "premium"];
const PRICES: Record<Tier, number> = { digital: 149, elite: 349, premium: 699 };
const NAMES: Record<Tier, string> = { digital: "Dijital", elite: "Özel", premium: "Premium" };

export const Route = createFileRoute("/parsel-satin-al")({
  validateSearch: (search: Record<string, unknown>): PurchaseSearch => ({
    parcels: typeof search.parcels === "string" ? search.parcels : undefined,
  }),
  head: () => ({ meta: [{ title: "Parsel Satın Al — MySkyParcel" }, { name: "description", content: "İstediğiniz sayıda sembolik parsel seçin ve güvenli ödeme adımına geçin." }] }),
  component: SatinAl,
});

function SatinAl() {
  const navigate = useNavigate({ from: "/parsel-satin-al" });
  const search = Route.useSearch() as PurchaseSearch;
  const { parcels } = search;
  const [cartIds, setCartIds] = useState<string[]>([]);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [reservationConflict, setReservationConflict] = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!parcels) setCartIds(readParcelCart().map((item) => item.id));
  }, [parcels]);

  const ids = useMemo(() => {
    const source = parcels ?? cartIds.join(",");
    return Array.from(new Set(source.split(",").map((value) => value.trim()).filter(Boolean)));
  }, [parcels, cartIds]);

  useEffect(() => {
    let active = true;
    async function validateParcels() {
      if (!ids.length) {
        if (active) { setItems([]); setLoading(false); }
        return;
      }
      if (!supabaseBrowser) {
        if (active) { setValidationError("Parsel doğrulama altyapısı kullanılamıyor."); setLoading(false); }
        return;
      }
      setLoading(true);
      setValidationError(null);
      setReservationConflict(false);
      const { data, error } = await (supabaseBrowser as any)
        .from("parcel_map_public")
        .select("id,tier,tier_price,status")
        .in("id", ids);
      if (!active) return;
      if (error) {
        setValidationError("Parseller doğrulanamadı. Lütfen tekrar deneyin.");
        setItems([]);
        setLoading(false);
        return;
      }
      const rows: PublicParcelRow[] = Array.isArray(data) ? data.map((raw: unknown) => {
        const row = raw as Record<string, unknown>;
        const tierValue = typeof row.tier === "string" && VALID_TIERS.includes(row.tier as Tier) ? row.tier as Tier : null;
        return {
          id: typeof row.id === "string" ? row.id : String(row.id ?? ""),
          tier: tierValue,
          tier_price: typeof row.tier_price === "number" ? row.tier_price : Number(row.tier_price ?? NaN),
          status: typeof row.status === "string" ? row.status : "",
        };
      }) : [];
      const byId = new Map(rows.map((row) => [row.id, row]));
      const missing = ids.filter((id) => !byId.has(id));
      const unavailable = rows.filter((row) => row.status !== "available" && row.status !== "reserved");
      const invalid = rows.filter((row) => !row.tier || !VALID_TIERS.includes(row.tier) || Number(row.tier_price) !== PRICES[row.tier]);
      if (missing.length || unavailable.length || invalid.length) {
        setValidationError(unavailable.length
          ? `Şu parseller artık satışa uygun değil: ${unavailable.map((row) => row.id).join(", ")}`
          : invalid.length ? "Parsel fiyatı paket fiyatıyla eşleşmiyor." : "Seçilen parseller doğrulanamadı.");
        setItems([]);
        setLoading(false);
        return;
      }
      const next = ids.map((id) => {
        const row = byId.get(id);
        if (!row || !row.tier) throw new Error("Validated parcel row missing");
        return { id, tier: row.tier, price: PRICES[row.tier] };
      });
      setItems(next);
      setLoading(false);
    }
    void validateParcels();
    return () => { active = false; };
  }, [ids]);

  const total = items.reduce((sum, item) => sum + item.price, 0);
  const grouped = items.reduce<Record<Tier, number>>((acc, item) => {
    acc[item.tier] += 1;
    return acc;
  }, { digital: 0, elite: 0, premium: 0 });

  async function startPayment() {
    if (!supabaseBrowser || paying || !accepted || !items.length) return;
    setPaying(true);
    setValidationError(null);
    setReservationConflict(false);
    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) { await navigate({ to: "/giris" }); return; }
      const response = await fetch("/api/shopier/checkout", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ parcel_ids: items.map((item) => item.id) }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.checkout_url) {
        const messages: Record<string, string> = {
          shopier_not_configured: "Shopier ödeme bağlantısı henüz yapılandırılmamış. cPanel ortam değişkenlerini kontrol edin.",
          supabase_not_configured: "Ödeme altyapısı yapılandırılmamış. cPanel Supabase ayarlarını kontrol edin.",
          not_available: "Seçtiğiniz parsellerden biri artık satışa uygun değil.",
          parcel_reserved_by_other_user: "Bu parsel başka kullanıcı tarafından şu an satın alınmaktadır. 5 dk sonra yine deneyebilirsiniz.",
          parcel_not_found: "Seçilen parsel bulunamadı. Lütfen haritadan yeniden seçim yapın.",
          empty_parcel_selection: "Ödenecek parsel seçilmedi.",
          too_many_parcels: "Tek işlemde en fazla 100 parsel satın alınabilir.",
          invalid_parcel_price: "Parsel fiyatı doğrulanamadı. Lütfen tekrar deneyin.",
          unauthenticated: "Ödeme için giriş yapmanız gerekiyor.",
          checkout_intent_failed: "Ödeme hazırlığı tamamlanamadı. Lütfen tekrar deneyin.",
          checkout_intent_invalid: "Ödeme tutarı doğrulanamadı. Lütfen tekrar deneyin.",
          shopier_product_creation_failed: "Shopier ödeme ürünü oluşturamadı. Shopier API/PAT ayarlarını kontrol edin.",
          shopier_product_url_missing: "Shopier ödeme bağlantısı döndürmedi. Shopier ürün API yanıtını kontrol edin.",
          shopier_unreachable: "Shopier ödeme servisine ulaşılamadı. Lütfen birkaç dakika sonra tekrar deneyin.",
          checkout_persistence_failed: "Ödeme bağlantısı oluşturuldu ancak sipariş kaydı tamamlanamadı. Lütfen tekrar deneyin.",
          internal_error: "Sunucu tarafında beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        };
        const reason = String(result.reason);
        setValidationError(messages[reason] ?? "Ödeme başlatılamadı. Lütfen tekrar deneyin.");
        if (reason === "parcel_reserved_by_other_user") { setItems([]); setReservationConflict(true); }
        return;
      }
      window.location.assign(result.checkout_url);
    } catch (error) {
      console.error("Shopier payment start failed", error);
      setValidationError("Ödeme bağlantısı oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setPaying(false);
    }
  }

  if (loading) return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-3xl px-4 py-16 lg:px-8"><div className="panel p-8 text-center"><Loader2 className="mx-auto h-7 w-7 animate-spin text-gold" /><p className="mt-4 text-sm text-muted-foreground">Parseller ve paket türleri doğrulanıyor...</p></div></main><SiteFooter /></div>;
  if (!items.length) return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto max-w-3xl px-4 py-16 lg:px-8"><div className="panel p-8 text-center"><h1 className="font-display text-3xl font-bold">{reservationConflict ? "BU PARSEL ŞU AN SATIN ALINIYOR" : "SATIN ALMA HAZIRLANAMADI"}</h1><p className="mt-3 text-sm text-muted-foreground">{validationError ?? "Sepetinizde satışa uygun parsel bulunamadı."}</p><button type="button" onClick={() => void navigate({ to: "/gokyuzu-haritasi" })} className="btn-gold mt-6 rounded-md px-6 py-3 text-xs">HARİTAYA DÖN</button></div></main><SiteFooter /></div>;

  return <div className="starfield min-h-screen"><SiteHeader /><main className="mx-auto w-full max-w-[1200px] px-4 py-12 lg:px-8"><h1 className="text-center font-display text-4xl font-bold sm:text-5xl">SATIN ALMA</h1><p className="mx-auto mt-3 max-w-2xl text-center text-sm text-muted-foreground">İstediğiniz sayıda ve farklı türlerde parsel seçebilirsiniz. <strong className="text-foreground">Sertifika seçimi ödeme aşamasından çıkarılmıştır.</strong> Satın aldığınız parseller için dijital veya fiziksel sertifikayı daha sonra kullanıcı panelinizden oluşturabilirsiniz.</p><div className="mt-10 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"><section className="panel min-w-0 p-6 sm:p-8"><h2 className="font-display text-lg">SEÇİLEN PARSELLER ({items.length})</h2><div className="mt-5 space-y-3">{items.map((item) => <div key={item.id} className="rounded-xl border border-border p-4"><div className="flex min-w-0 items-center justify-between gap-4"><div className="min-w-0"><p className="truncate font-medium">{item.id}</p><p className="mt-1 text-xs text-muted-foreground">{NAMES[item.tier]} · {item.price.toLocaleString("tr-TR")} TL</p></div><span className="text-xs text-muted-foreground">Sertifika seçimi satın alma sonrasında</span></div></div>)}</div><div className="mt-6 rounded-xl border border-gold/20 bg-gold/[0.04] p-5"><p className="text-sm font-semibold text-gold">SERTİFİKA SEÇİMİ DAHA SONRA</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Ödeme sırasında sertifika veya teslimat adresi istenmez. Satın alma tamamlandıktan sonra kullanıcı panelinizden sahip olduğunuz parseli seçerek <strong className="text-foreground">Dijital</strong> veya uygun paketlerde <strong className="text-foreground">Fiziksel</strong> sertifika oluşturabilirsiniz.</p></div><label className="mt-6 flex cursor-pointer items-start gap-3 text-xs text-muted-foreground"><input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 accent-current" /><span>Seçtiğim parselleri ve satış sözleşmelerine eriştiğimi onaylıyorum.</span></label>{validationError && <div role="alert" className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs text-destructive">{validationError}</div>}<button type="button" disabled={!accepted || paying} onClick={() => void startPayment()} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-gold/50 bg-gold px-6 py-3 text-[11px] font-bold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50">{paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />} {paying ? "ÖDEME HAZIRLANIYOR..." : "SHOPIER İLE ÖDEMEYE GEÇ"}</button><p className="mt-2 text-center text-[10px] text-muted-foreground">Kart bilgileri MySkyParcel sunucusunda tutulmaz; ödeme Shopier tarafında tamamlanır.</p></section><aside className="panel h-fit min-w-0 p-6 lg:sticky lg:top-6"><h2 className="font-display text-base">SEÇİM ÖZETİ</h2><div className="mt-5 space-y-3 text-sm">{(["digital", "elite", "premium"] as Tier[]).filter((tier) => grouped[tier] > 0).map((tier) => <div key={tier} className="flex justify-between gap-4"><span className="text-muted-foreground">{NAMES[tier]} × {grouped[tier]}</span><span className="shrink-0">{(PRICES[tier] * grouped[tier]).toLocaleString("tr-TR")} TL</span></div>)}<div className="border-t border-border pt-4 flex justify-between gap-4"><span className="font-semibold">Toplam</span><span className="shrink-0 font-display text-2xl text-gold">{total.toLocaleString("tr-TR")} TL</span></div><div className="border-t border-border pt-4 text-xs text-muted-foreground"><p>Toplam parsel: {items.length}</p><p className="mt-1">Sertifika seçimi satın alma sonrasında kullanıcı panelinden yapılır.</p></div></div><ul className="mt-5 space-y-3 text-sm">{["İstediğiniz sayıda sembolik parsel", "Farklı paket türlerini aynı seçimde kullanabilme", "Ödeme sonrası kullanıcı panelinden sertifika oluşturma", "Her parsel için benzersiz kayıt"].map((item) => <li key={item} className="flex items-start gap-2 text-muted-foreground"><Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{item}</li>)}</ul></aside></div></main><TrustBar /><SiteFooter /></div>;
}
