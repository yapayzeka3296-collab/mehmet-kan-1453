import { useEffect, useMemo, useState } from "react";
import type { Parcel, ParcelGeometry } from "@/types/parcel";
import { PARCEL_CART_EVENT, readParcelCart, writeParcelCart, type ParcelCartItem } from "@/lib/parcelCart";

type CityCenter = { lat: number; lng: number };
type ViewportBounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };
type FocusTarget = { city: CityCenter; parcel: CityCenter; token: string };
type Props = {
  parcels: Parcel[];
  selectedId: string | null;
  selectedIds?: Set<string>;
  multiSelect?: boolean;
  onSelect: (id: string | null) => void;
  onToggleSelect?: (id: string) => void;
  onViewportChange?: (bounds: ViewportBounds) => void;
  center: CityCenter;
  focusTarget?: FocusTarget | null;
};
type Tier = "digital" | "elite" | "premium";
type XY = { x: number; y: number };

const colors: Record<Tier, string> = { digital: "#55c9ff", elite: "#b77cff", premium: "#f6c453" };
const B: ViewportBounds = { minLat: 35.75, maxLat: 42.15, minLng: 25.65, maxLng: 44.85 };
const MAX_POLYGON_FEATURES = 2500;

function cartItem(p: Parcel): ParcelCartItem | undefined {
  const tier = p.tier;
  if (tier !== "digital" && tier !== "elite" && tier !== "premium") return undefined;
  return { id: p.id, parcel_number: p.parcel_number, city_name: p.city_name, tier, tier_price: Number(p.tier_price ?? (tier === "digital" ? 199 : tier === "elite" ? 499 : 999)) };
}

function geoPos(p: Parcel) {
  const lat = Number(p.latitude); const lng = Number(p.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { left: Math.max(2, Math.min(98, ((lng - B.minLng) / (B.maxLng - B.minLng)) * 100)), top: Math.max(2, Math.min(98, ((B.maxLat - lat) / (B.maxLat - B.minLat)) * 100)) };
}

function geometryPoint(point: number[]): XY | null {
  const lng = Number(point[0]); const lat = Number(point[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  return { x: Math.max(0, Math.min(100, ((lng - B.minLng) / (B.maxLng - B.minLng)) * 100)), y: Math.max(0, Math.min(100, ((B.maxLat - lat) / (B.maxLat - B.minLat)) * 100)) };
}

function ringPath(ring: number[][]) {
  const points = ring.map((point, index) => { const xy = geometryPoint(point); return xy ? `${index === 0 ? "M" : "L"}${xy.x.toFixed(4)} ${xy.y.toFixed(4)}` : ""; }).filter(Boolean);
  return points.length ? `${points.join(" ")} Z` : "";
}

function geometryPath(geometry?: ParcelGeometry) {
  if (!geometry) return "";
  if (geometry.type === "Polygon") return geometry.coordinates.map(ringPath).filter(Boolean).join(" ");
  return geometry.coordinates.map((polygon) => polygon.map(ringPath).filter(Boolean).join(" ")).filter(Boolean).join(" ");
}

function hasUsableGeometry(p: Parcel) { return Boolean(p.geometry && (p.geometry.type === "Polygon" || p.geometry.type === "MultiPolygon")); }

function SciFiGrid() {
  return <div aria-hidden className="pointer-events-none absolute inset-0 z-[3] overflow-hidden"><div className="absolute inset-[-25%] opacity-75" style={{ backgroundImage: "linear-gradient(rgba(76,224,255,.34) 1px,transparent 1px),linear-gradient(90deg,rgba(76,224,255,.34) 1px,transparent 1px),linear-gradient(rgba(177,108,255,.13) 1px,transparent 1px),linear-gradient(90deg,rgba(177,108,255,.13) 1px,transparent 1px)", backgroundSize: "32px 32px,32px 32px,160px 160px,160px 160px", transform: "perspective(680px) rotateX(54deg) scale(1.55) translateY(12%)", transformOrigin: "50% 57%", maskImage: "linear-gradient(to bottom,transparent 0%,black 25%,black 85%,transparent 100%)" }} /><div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 52%,transparent 0 25%,rgba(0,15,30,.12) 48%,rgba(0,3,12,.65) 100%)" }} /></div>;
}

export function SkyParcelMap({ parcels, selectedId, selectedIds = new Set<string>(), multiSelect = false, onSelect, onToggleSelect, onViewportChange, center, focusTarget }: Props) {
  const [focus, setFocus] = useState(false); const [hover, setHover] = useState<string | null>(null);
  const groups = useMemo(() => { const result: Record<Tier, Parcel[]> = { digital: [], elite: [], premium: [] }; parcels.forEach((p) => { if (p.tier in result) result[p.tier as Tier].push(p); }); return result; }, [parcels]);
  const available = useMemo(() => parcels.filter((p) => p.status === "available").length, [parcels]);
  const cartIds = useMemo(() => new Set(readParcelCart().map((item) => item.id)), [parcels, selectedId, selectedIds]);
  const polygonMode = parcels.length <= MAX_POLYGON_FEATURES && parcels.some(hasUsableGeometry);

  useEffect(() => { onViewportChange?.(B); }, [onViewportChange]);
  useEffect(() => { if (!focusTarget) return; setFocus(true); const timer = window.setTimeout(() => setFocus(false), 6000); return () => window.clearTimeout(timer); }, [focusTarget?.token]);

  const click = (p: Parcel) => {
    if (p.status !== "available") return;
    const item = cartItem(p);
    if (multiSelect && item) { const current = readParcelCart(); const next = current.some((x) => x.id === p.id) ? current.filter((x) => x.id !== p.id) : [...current, item]; writeParcelCart(next); window.dispatchEvent(new CustomEvent(PARCEL_CART_EVENT, { detail: next })); onToggleSelect?.(p.id); return; }
    onSelect(p.id);
  };

  const renderParcel = (p: Parcel) => {
    const selected = selectedId === p.id || selectedIds.has(p.id) || cartIds.has(p.id); const tier = p.tier as Tier; const color = colors[tier] ?? colors.digital;
    if (polygonMode && hasUsableGeometry(p)) {
      const d = geometryPath(p.geometry); if (!d) return null;
      return <path key={p.id} d={d} fill={selected ? "rgba(255,211,92,.42)" : `${color}20`} stroke={selected ? "#fff4b0" : color} strokeWidth={selected ? 0.0275 : 0.01375} vectorEffect="non-scaling-stroke" fillRule="evenodd" className="cursor-pointer transition-[fill,stroke] duration-150" style={{ opacity: p.status === "sold" ? 0.82 : 1 }} onClick={() => click(p)} onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)} aria-label={p.parcel_number} />;
    }
    const xy = geoPos(p); if (!xy) return null;
    return <button key={p.id} type="button" disabled={p.status !== "available"} aria-label={p.parcel_number} onClick={() => click(p)} onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)} className="absolute z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-[3px] border p-0 sm:h-7 sm:w-7" style={{ left: `${xy.left}%`, top: `${xy.top}%`, borderColor: selected ? "#fff4b0" : color, background: selected ? "rgba(255,211,92,.25)" : "rgba(4,18,30,.8)", boxShadow: selected ? "0 0 8px #fff4b0,0 0 22px rgba(255,211,92,.8)" : `0 0 5px ${color}66`, opacity: p.status === "sold" ? 0.82 : 1 }}><span className="absolute inset-[5px] rounded-full" style={{ background: color }} />{(hover === p.id || selected) && <span className="pointer-events-none absolute left-1/2 top-[-30px] -translate-x-1/2 whitespace-nowrap rounded bg-[#020914]/95 px-2 py-1 text-[9px] text-white shadow-lg">{p.parcel_number}</span>}</button>;
  };

  return <div className={`relative h-[420px] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] sm:h-[420px] lg:h-[469px] ${focus ? "ring-2 ring-cyan-300/40" : ""}`} data-center-lat={center.lat} data-center-lng={center.lng}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(30,112,160,.3),transparent_32%),linear-gradient(145deg,#030b17,#071a2d_52%,#020711)]" />
    <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(circle,rgba(255,255,255,.7) .8px,transparent .9px)", backgroundSize: "31px 31px" }} />
    <SciFiGrid />
    <div className="absolute left-3 top-3 z-20 rounded-lg border border-cyan-300/20 bg-[#020914]/75 px-3 py-2 text-[10px] text-cyan-100 backdrop-blur-sm"><div className="font-semibold tracking-wide">GÖKYÜZÜ PARSEL HARİTASI</div><div className="mt-1 text-white/60">{available.toLocaleString("tr-TR")} uygun parsel</div></div>
    <div className="absolute right-3 top-3 z-20 flex gap-2 text-[9px] text-white/75">{(["digital", "elite", "premium"] as Tier[]).map((tier) => <span key={tier} className="rounded border border-white/10 bg-black/35 px-2 py-1 backdrop-blur-sm"><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ background: colors[tier] }} />{tier} {groups[tier].length}</span>)}</div>
    {polygonMode ? <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 z-[5] h-full w-full">{parcels.map(renderParcel)}</svg> : <div className="absolute inset-0 z-[5]">{parcels.map(renderParcel)}</div>}
    {parcels.length === 0 && <div className="absolute inset-0 z-20 flex items-center justify-center px-6 text-center text-sm text-white/70">Bu görünüm için parsel verisi bulunamadı. Haritayı yenileyerek tekrar deneyin.</div>}
  </div>;
}
