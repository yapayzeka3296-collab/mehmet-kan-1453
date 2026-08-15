import { useEffect, useRef, useState } from "react";
import type { Parcel } from "@/types/parcel";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type CityCenter = { lat: number; lng: number };
type ParcelWithGeometry = Parcel & { geometry?: unknown };
type ViewportBounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };
type Props = {
  parcels: ParcelWithGeometry[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onViewportChange?: (bounds: ViewportBounds) => void;
  center: CityCenter;
};
type Maps = any;
type Polygon = any;
type Marker = any;

const SCRIPT_ID = "myskyparcel-google-maps";
let mapsPromise: Promise<Maps> | null = null;
const cornerIconCache = new Map<string, any>();

function loadGoogleMaps(apiKey: string): Promise<Maps> {
  if (typeof window === "undefined") return Promise.reject(new Error("Google Maps browser ortamında yüklenebilir."));
  if ((window as any).google?.maps) return Promise.resolve((window as any).google.maps);
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const finish = () => {
      const maps = (window as any).google?.maps;
      if (maps) resolve(maps); else reject(new Error("Google Maps API yüklenemedi."));
    };
    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Maps script yüklenemedi.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.onload = finish;
    script.onerror = () => reject(new Error("Google Maps script yüklenemedi."));
    document.head.appendChild(script);
  });
  return mapsPromise;
}

function statusColor(status: Parcel["status"]) {
  return status === "sold" ? "#ff1744" : status === "reserved" ? "#f6c453" : "#58e6ff";
}
function tierColor(tier: Parcel["tier"]) {
  return tier === "premium" ? "#f6c453" : tier === "elite" ? "#b77cff" : "#55c9ff";
}
function tierLabel(tier: Parcel["tier"]) {
  return tier === "premium" ? "Premium" : tier === "elite" ? "Elit" : "Dijital";
}
function statusLabel(status: Parcel["status"]) {
  return status === "sold" ? "Satıldı" : status === "reserved" ? "Rezerve" : "Satılık";
}
function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>\"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;", "'": "&#39;" }[char] ?? char));
}
function cornerIcon(maps: Maps, color: string, selected: boolean) {
  const key = `${color}:${selected ? 1 : 0}`;
  const cached = cornerIconCache.get(key);
  if (cached) return cached;
  const s = selected ? 14 : 9;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s + 14}" height="${s + 14}" viewBox="0 0 ${s + 14} ${s + 14}"><defs><filter id="g"><feGaussianBlur stdDeviation="2.5"/></filter></defs><circle cx="${(s + 14) / 2}" cy="${(s + 14) / 2}" r="${s / 2 + 3}" fill="${color}" opacity=".65" filter="url(#g)"/><circle cx="${(s + 14) / 2}" cy="${(s + 14) / 2}" r="${s / 2}" fill="${color}" stroke="#fff" stroke-opacity=".8" stroke-width="${selected ? 1.8 : 1}"/></svg>`;
  const icon = { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, scaledSize: new maps.Size(s + 14, s + 14), anchor: new maps.Point((s + 14) / 2, (s + 14) / 2) };
  cornerIconCache.set(key, icon);
  return icon;
}

// A parcel's screen position must never depend on the current viewport/list order.
// The hash below gives every parcel a deterministic slot, so reloading a viewport
// cannot move an existing parcel to a different location.
function stableHash(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
function stableUnit(value: string, salt: number) {
  const hash = stableHash(`${value}:${salt}`);
  return hash / 4294967296;
}
function stableDomeCell(center: CityCenter, parcel: ParcelWithGeometry, innerRadius: number, outerRadius: number) {
  const angle = stableUnit(parcel.id, 1) * Math.PI * 2 - Math.PI / 2;
  const radius = innerRadius + stableUnit(parcel.id, 2) * (outerRadius - innerRadius);
  const radialSpan = outerRadius - innerRadius;
  const radialSize = Math.max(radialSpan * 0.018, 0.00055);
  const angularSize = Math.max(radialSize / Math.max(radius, 0.01), 0.006);
  const r0 = Math.max(innerRadius, radius - radialSize / 2);
  const r1 = Math.min(outerRadius, radius + radialSize / 2);
  const a0 = angle - angularSize / 2;
  const a1 = angle + angularSize / 2;
  const project = (a: number, r: number) => {
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    const radial = Math.min(1, r / outerRadius);
    const dome = Math.sqrt(Math.max(0, 1 - radial * radial));
    const lift = (1 - dome) * 0.01;
    const cos = Math.max(Math.cos(center.lat * Math.PI / 180), 0.2);
    return { lat: center.lat + y + lift, lng: center.lng + x / cos };
  };
  return { path: [project(a0, r0), project(a1, r0), project(a1, r1), project(a0, r1)], center: project(angle, (r0 + r1) / 2) };
}

export function GoogleParcelMap({ parcels, selectedId, onSelect, onViewportChange, center }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<any>(null);
  const cells = useRef<Map<string, Polygon[]>>(new Map());
  const corners = useRef<Map<string, Marker>>(new Map());
  const layouts = useRef<Map<string, { position: { lat: number; lng: number } }>>(new Map());
  const selectRef = useRef(onSelect);
  const viewportRef = useRef(onViewportChange);
  const info = useRef<any>(null);
  const selectedRef = useRef<string | null>(selectedId);
  const parcelsRef = useRef(parcels);
  const lastViewportKeyRef = useRef("");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { viewportRef.current = onViewportChange; }, [onViewportChange]);
  useEffect(() => { parcelsRef.current = parcels; }, [parcels]);

  useEffect(() => {
    let cancelled = false;
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) { setError("Google Maps API anahtarı eksik."); return; }
    if (!mapRef.current) return;
    loadGoogleMaps(key).then((maps) => {
      if (cancelled || !mapRef.current) return;
      if (!mapObj.current) mapObj.current = new maps.Map(mapRef.current, { center, zoom: 12, mapTypeId: "satellite", streetViewControl: false, fullscreenControl: false, mapTypeControl: false, gestureHandling: "greedy", clickableIcons: false, backgroundColor: "#071a2d" });
      else mapObj.current.setCenter(center);
      setError(null);
      setReady(true);
    }).catch((err) => {
      console.error(err);
      if (!cancelled) setError("Google Maps yüklenemedi. API anahtarını kontrol edin.");
    });
    return () => { cancelled = true; };
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!ready || !mapObj.current || !viewportRef.current) return;
    const maps = (window as any).google.maps;
    const map = mapObj.current;
    let timer: number | undefined;
    const emit = () => {
      const bounds = map.getBounds();
      if (!bounds) return;
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const next = { minLat: sw.lat(), minLng: sw.lng(), maxLat: ne.lat(), maxLng: ne.lng() };
      const key = [next.minLat, next.minLng, next.maxLat, next.maxLng].map((v) => v.toFixed(5)).join(",");
      if (key === lastViewportKeyRef.current) return;
      lastViewportKeyRef.current = key;
      viewportRef.current?.(next);
    };
    const schedule = () => { if (timer !== undefined) window.clearTimeout(timer); timer = window.setTimeout(emit, 120); };
    const listener = maps.event.addListener(map, "idle", schedule);
    schedule();
    return () => { maps.event.removeListener(listener); if (timer !== undefined) window.clearTimeout(timer); };
  }, [ready]);

  useEffect(() => {
    if (!ready || !mapObj.current) return;
    const maps = (window as any).google.maps;
    cells.current.forEach((items) => items.forEach((polygon) => polygon.setMap(null)));
    cells.current.clear();
    corners.current.forEach((marker) => marker.setMap(null));
    corners.current.clear();
    layouts.current.clear();
    const configs = [
      { tier: "digital" as const, innerRadius: 0.095, outerRadius: 0.165 },
      { tier: "elite" as const, innerRadius: 0.05, outerRadius: 0.08 },
      { tier: "premium" as const, innerRadius: 0.012, outerRadius: 0.035 },
    ];
    const cornerKeys = new Set<string>();
    configs.forEach((cfg) => {
      const items = parcels.filter((parcel) => parcel.tier === cfg.tier);
      items.forEach((parcel) => {
        const cell = stableDomeCell(center, parcel, cfg.innerRadius, cfg.outerRadius);
        layouts.current.set(parcel.id, { position: cell.center });
        const paths = cell.path.map((point) => new maps.LatLng(point.lat, point.lng));
        const sold = parcel.status === "sold";
        const base = sold ? statusColor(parcel.status) : tierColor(parcel.tier);
        const glow = new maps.Polygon({ map: mapObj.current, paths, geodesic: false, strokeColor: base, strokeOpacity: sold ? 0.95 : 0.28, strokeWeight: sold ? 7 : 2.5, fillColor: base, fillOpacity: sold ? 0.16 : 0.025, zIndex: sold ? 500 : 20, clickable: true });
        const main = new maps.Polygon({ map: mapObj.current, paths, geodesic: false, strokeColor: base, strokeOpacity: 1, strokeWeight: sold ? 3 : 1.2, fillColor: base, fillOpacity: sold ? 0.08 : 0.015, zIndex: sold ? 501 : 21, clickable: true });
        const click = () => selectRef.current(parcel.id);
        glow.addListener("click", click);
        main.addListener("click", click);
        cells.current.set(parcel.id, [glow, main]);
        cell.path.forEach((point) => {
          const key = `${point.lat.toFixed(8)}:${point.lng.toFixed(8)}`;
          if (cornerKeys.has(key)) return;
          cornerKeys.add(key);
          corners.current.set(`${parcel.id}:${key}`, new maps.Marker({ map: mapObj.current, position: point, icon: cornerIcon(maps, base, false), clickable: false, zIndex: sold ? 2000 : 1000, optimized: true }));
        });
      });
    });
    return () => {
      cells.current.forEach((items) => items.forEach((polygon) => polygon.setMap(null)));
      corners.current.forEach((marker) => marker.setMap(null));
      cells.current.clear();
      corners.current.clear();
      layouts.current.clear();
    };
  }, [parcels, ready, center.lat, center.lng]);

  useEffect(() => {
    if (!ready || !mapObj.current) return;
    const maps = (window as any).google.maps;
    const previous = selectedRef.current;
    if (previous && previous !== selectedId) {
      const old = parcelsRef.current.find((parcel) => parcel.id === previous);
      const oldCells = cells.current.get(previous);
      if (old && oldCells) {
        const color = old.status === "sold" ? statusColor(old.status) : tierColor(old.tier);
        oldCells.forEach((polygon, index) => polygon.setOptions({ strokeOpacity: old.status === "sold" ? (index === 0 ? 0.95 : 1) : (index === 0 ? 0.28 : 1), strokeWeight: old.status === "sold" ? (index === 0 ? 7 : 3) : (index === 0 ? 2.5 : 1.2), fillOpacity: old.status === "sold" ? (index === 0 ? 0.16 : 0.08) : (index === 0 ? 0.025 : 0.015), zIndex: old.status === "sold" ? (index === 0 ? 500 : 501) : (index === 0 ? 20 : 21), strokeColor: color, fillColor: color }));
        const prefix = `${previous}:`;
        corners.current.forEach((marker, key) => { if (key.startsWith(prefix)) marker.setIcon(cornerIcon(maps, color, false)); });
      }
    }
    if (selectedId) {
      const parcel = parcelsRef.current.find((item) => item.id === selectedId);
      const selectedCells = cells.current.get(selectedId);
      if (parcel && selectedCells) {
        const color = parcel.status === "sold" ? statusColor(parcel.status) : tierColor(parcel.tier);
        selectedCells.forEach((polygon, index) => polygon.setOptions({ strokeOpacity: parcel.status === "sold" ? (index === 0 ? 0.95 : 1) : (index === 0 ? 0.65 : 1), strokeWeight: parcel.status === "sold" ? (index === 0 ? 7 : 3) : (index === 0 ? 5 : 2.2), fillOpacity: parcel.status === "sold" ? (index === 0 ? 0.16 : 0.08) : (index === 0 ? 0.12 : 0.18), zIndex: parcel.status === "sold" ? (index === 0 ? 500 : 501) : (index === 0 ? 300 : 301), strokeColor: color, fillColor: color }));
        const prefix = `${selectedId}:`;
        corners.current.forEach((marker, key) => { if (key.startsWith(prefix)) marker.setIcon(cornerIcon(maps, color, true)); });
      }
    }
    selectedRef.current = selectedId;
  }, [selectedId, ready]);

  useEffect(() => {
    if (!ready || !mapObj.current) return;
    const maps = (window as any).google.maps;
    if (!info.current) info.current = new maps.InfoWindow({ disableAutoPan: true, pixelOffset: new maps.Size(0, -18) });
    if (!selectedId) { info.current.close(); return; }
    const parcel = parcelsRef.current.find((item) => item.id === selectedId);
    const layout = layouts.current.get(selectedId);
    if (!parcel || !layout) { info.current.close(); return; }
    const color = statusColor(parcel.status);
    const price = typeof parcel.tier_price === "number" ? `${parcel.tier_price.toLocaleString("tr-TR")} TL` : "—";
    const city = escapeHtml(parcel.city_name ?? "MySkyParcel");
    const number = escapeHtml(parcel.parcel_number);
    const status = statusLabel(parcel.status);
    const tier = tierLabel(parcel.tier);
    const domKey = escapeHtml(parcel.id);
    const canBuy = parcel.status === "available";
    info.current.setPosition(layout.position);
    info.current.setContent(`<div data-msp-root="${domKey}" style="min-width:190px;padding:13px;background:linear-gradient(145deg,#071a2d,#0b1424);color:#fff;border:1px solid ${color};border-radius:12px;font:500 12px system-ui,sans-serif;box-shadow:0 0 22px ${color}55;position:relative"><button data-msp-close="1" aria-label="Kapat" style="position:absolute;right:7px;top:7px;width:24px;height:24px;border:0;border-radius:50%;background:rgba(255,255,255,.08);color:#fff;font-size:17px;line-height:24px;cursor:pointer">×</button><div style="padding-right:28px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#9ccfff">${city}</div><div style="margin-top:4px;font-size:16px;font-weight:800">${number}</div><div style="margin-top:10px;display:grid;gap:6px;border-top:1px solid rgba(255,255,255,.1);padding-top:9px"><div style="display:flex;justify-content:space-between;gap:14px"><span style="color:rgba(255,255,255,.55)">Durum</span><strong style="color:${color}">${status}</strong></div><div style="display:flex;justify-content:space-between;gap:14px"><span style="color:rgba(255,255,255,.55)">Kategori</span><strong>${tier}</strong></div><div style="display:flex;justify-content:space-between;gap:14px"><span style="color:rgba(255,255,255,.55)">Fiyat</span><strong>${price}</strong></div></div><button data-msp-purchase="1" ${canBuy ? "" : "disabled"} style="margin-top:10px;width:100%;height:34px;border:0;border-radius:8px;background:${canBuy ? "linear-gradient(90deg,#e7c45b,#f6d87b)" : "rgba(255,255,255,.12)"};color:${canBuy ? "#101010" : "rgba(255,255,255,.45)"};font-size:11px;font-weight:800;letter-spacing:.06em;cursor:${canBuy ? "pointer" : "not-allowed"}">${canBuy ? "SATIN AL" : "SATIN ALINAMAZ"}</button></div>`);
    info.current.open({ map: mapObj.current });
    const listener = maps.event.addListener(info.current, "domready", () => {
      const root = document.querySelector(`[data-msp-root="${CSS.escape(parcel.id)}"]`) as HTMLElement | null;
      if (!root) return;
      const closeButton = root.querySelector("[data-msp-close]") as HTMLButtonElement | null;
      const purchaseButton = root.querySelector("[data-msp-purchase]") as HTMLButtonElement | null;
      closeButton?.addEventListener("click", () => { info.current?.close(); selectRef.current(null); }, { once: true });
      purchaseButton?.addEventListener("click", async () => {
        if (parcel.status !== "available") return;
        const sessionResult = supabaseBrowser ? await supabaseBrowser.auth.getSession() : null;
        const session = sessionResult?.data.session;
        if (!session?.user) { window.location.assign(`/giris?redirect=${encodeURIComponent("/parsel-satin-al")}`); return; }
        info.current?.close();
        selectRef.current(null);
        window.location.assign("/parsel-satin-al");
      }, { once: true });
    });
    return () => maps.event.removeListener(listener);
  }, [selectedId, ready]);

  useEffect(() => () => {
    info.current?.close();
    cells.current.forEach((items) => items.forEach((polygon) => polygon.setMap(null)));
    corners.current.forEach((marker) => marker.setMap(null));
    mapObj.current = null;
  }, []);

  return <div className="relative h-[560px] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] sm:h-[680px] lg:h-[760px]"><div ref={mapRef} className="absolute inset-0" aria-label="MySkyParcel kubbe parsel haritası" />{error && <div className="absolute inset-0 grid place-items-center bg-[#071a2d] p-6 text-center"><div><p className="text-sm font-semibold text-white">Google Maps hazır değil</p><p className="mt-2 text-xs text-white/60">{error}</p></div></div>}</div>;
}
