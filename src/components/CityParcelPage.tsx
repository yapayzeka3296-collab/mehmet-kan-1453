import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Layers3, ShoppingCart } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useAuth } from "@/hooks/useAuth";
import { readParcelCart, removeParcelFromCart, writeParcelCart } from "@/lib/parcelCart";
import { SkyParcelMap } from "@/components/SkyParcelMap";
import { selectVisibleCityParcels } from "@/lib/cityParcelVisibility";
import type { Parcel, ParcelTier } from "@/types/parcel";

type City = { id: string; name: string; slug: string };
const PRICE: Record<ParcelTier, number> = { digital: 149, elite: 349, premium: 699 };

export function CityParcelPage({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useAuth();
  const [city, setCity] = useState<City | null>(null); const [parcels, setParcels] = useState<Parcel[]>([]); const [memoryParcelIds, setMemoryParcelIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(readParcelCart().map((p) => p.id)));
  const [layer, setLayer] = useState<number | null>(null); const [sector, setSector] = useState<number | null>(null);
  const [loading, setLoading] = useState(true); const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => { let active = true; setLoading(true); setCity(null); setParcels([]); setMemoryParcelIds(new Set()); setSelectedIds(new Set()); setImageFailed(false);
    const load = async () => { if (!supabaseBrowser) { if (active) setLoading(false); return; }
      const { data: cityData, error: cityError } = await supabaseBrowser.from("cities").select("id,name,slug").eq("slug", slug).eq("is_active", true).maybeSingle();
      if (!active) return; if (cityError || !cityData) { setLoading(false); return; } setCity(cityData as City);
      const { data, error } = await supabaseBrowser.rpc("parcels_in_view", { p_city_slug: slug, p_min_lat: 35.75, p_min_lng: 25.65, p_max_lat: 42.15, p_max_lng: 44.85 });
      if (!active) return;
      const visibleParcels = !error ? selectVisibleCityParcels(((data ?? []) as Parcel[]).filter((p) => p.city_slug === slug)) : [];
      setParcels(visibleParcels);
      if (visibleParcels.length > 0) {
        const { data: memoryRows, error: memoryError } = await supabaseBrowser.from("parcel_memories").select("parcel_id").eq("is_public", true).in("parcel_id", visibleParcels.map((p) => p.id));
        if (!active) return;
        if (!memoryError) setMemoryParcelIds(new Set((memoryRows ?? []).map((row) => row.parcel_id as string)));
      }
      setLoading(false);
    }; void load(); return () => { active = false; };
  }, [slug]);

  const filtered = useMemo(() => parcels.filter((p) => (layer === null || p.layer_number === layer) && (sector === null || p.sector_number === sector)), [parcels, layer, sector]);
  const selected = useMemo(() => parcels.filter((p) => selectedIds.has(p.id)), [parcels, selectedIds]);
  const soldCount = useMemo(() => parcels.filter((p) => p.status === "sold").length, [parcels]);
  const total = selected.reduce((sum, p) => sum + Number(p.tier_price ?? PRICE[p.tier]), 0);
  const toggle = (id: string | null) => { if (!id) return; setSelectedIds((previous) => { const next = new Set(previous); const parcel = parcels.find((p) => p.id === id); if (!parcel || parcel.status !== "available") return previous; if (next.has(id)) { next.delete(id); removeParcelFromCart(id); } else { next.add(id); const cart = readParcelCart(); if (!cart.some((item) => item.id === id)) writeParcelCart([...cart, { id: parcel.id, parcel_number: parcel.parcel_number, city_name: parcel.city_name, tier: parcel.tier, tier_price: Number(parcel.tier_price ?? PRICE[parcel.tier]) }]); } return next; }); };
  const buy = () => { if (authLoading || selected.length === 0) return; const ids = selected.map((p) => p.id).join(","); window.location.href = user ? `/parsel-satin-al?parcels=${ids}` : `/giris?redirect=${encodeURIComponent(`/parsel-satin-al?parcels=${ids}`)}`; };
  if (!city) return <main className="mx-auto max-w-4xl p-8 text-center text-white"><h1 className="text-2xl font-bold">{loading ? "Gökyüzü haritası hazırlanıyor…" : "İl bulunamadı"}</h1><a href="/turkiye-haritasi" className="mt-4 inline-flex items-center gap-2 text-cyan-300"><ArrowLeft className="h-4 w-4" /> Türkiye haritasına dön</a></main>;
  const imagePath = `/images/cities/${city.slug}.webp`;
  return <main className="mx-auto max-w-[1800px] px-3 py-4 sm:px-5 lg:px-8"><div className="mb-4"><a href="/turkiye-haritasi" className="inline-flex items-center gap-2 text-sm text-cyan-200/80 hover:text-cyan-100"><ArrowLeft className="h-4 w-4" /> Türkiye haritası</a></div>
    <section className="overflow-hidden rounded-3xl border border-cyan-200/15 bg-slate-900/70 shadow-2xl"><div className="relative h-[520px] overflow-hidden bg-slate-950 sm:h-[620px] lg:h-[680px]">{!imageFailed && <img src={imagePath} alt={`${city.name} gökyüzü haritası`} className="absolute inset-0 h-full w-full object-cover" onError={() => setImageFailed(true)} />}<div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/10" /><div className="absolute inset-x-0 bottom-0 z-10 h-[72%] overflow-visible"><SkyParcelMap parcels={filtered} selectedId={selectedIds.size === 1 ? Array.from(selectedIds)[0] : null} selectedIds={selectedIds} onSelect={toggle} center={{ lat: 39, lng: 35 }} memoryParcelIds={memoryParcelIds} /></div><div className="absolute bottom-5 left-5 z-30"><p className="text-xs uppercase tracking-[.2em] text-cyan-200/70">MySkyParcel · İl Parsel Haritası</p><h1 className="mt-1 text-3xl font-bold text-white">{city.name}</h1><p className="mt-1 text-sm text-white/60">{loading ? "Parseller yükleniyor…" : `${filtered.length.toLocaleString("tr-TR")} parsel görüntüleniyor · ${soldCount} satıldı.`}</p></div></div>
      <div className="grid lg:grid-cols-[1fr_280px]"><div className="min-w-0 p-3 lg:p-5" /><aside className="border-t border-white/10 bg-slate-950/70 p-4 lg:border-l lg:border-t-0"><div className="flex items-center gap-2"><Layers3 className="h-4 w-4 text-cyan-200" /><span className="text-xs uppercase tracking-[.15em] text-white/55">Filtreler</span></div><label className="mt-4 block text-xs text-white/45">Katman</label><select value={layer ?? ""} onChange={(e) => setLayer(e.target.value ? Number(e.target.value) : null)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 p-2 text-white"><option value="">Tümü</option>{Array.from(new Set(parcels.map((p) => p.layer_number).filter((x): x is number => typeof x === "number"))).sort((a, b) => a - b).map((x) => <option key={x} value={x}>Katman {x}</option>)}</select><label className="mt-4 block text-xs text-white/45">Sektör</label><select value={sector ?? ""} onChange={(e) => setSector(e.target.value ? Number(e.target.value) : null)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 p-2 text-white"><option value="">Tümü</option>{Array.from(new Set(parcels.map((p) => p.sector_number).filter((x): x is number => typeof x === "number"))).sort((a, b) => a - b).map((x) => <option key={x} value={x}>Sektör {x}</option>)}</select><div className="mt-6 rounded-2xl border border-cyan-200/15 bg-slate-900 p-4"><p className="text-xs text-white/50">Seçilen parsel</p><p className="mt-1 text-2xl font-bold text-white">{selected.length}</p><p className="mt-3 text-xs text-white/50">Toplam</p><p className="text-lg font-bold text-cyan-100">{total.toLocaleString("tr-TR")} TL</p><button type="button" onClick={buy} disabled={selected.length === 0 || authLoading} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-3 py-3 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"><ShoppingCart className="h-4 w-4" /> Satın al</button></div></aside></div></section></main>;
}
