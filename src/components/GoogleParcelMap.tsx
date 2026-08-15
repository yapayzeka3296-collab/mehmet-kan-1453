import { useEffect, useRef, useState } from "react";
import type { Parcel } from "@/types/parcel";

type CityCenter = { lat: number; lng: number };
type ParcelWithGeometry = Parcel & { geometry?: unknown };
type ViewportBounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };
type Props = { parcels: ParcelWithGeometry[]; selectedId: string | null; onSelect: (id: string) => void; onViewportChange?: (bounds: ViewportBounds) => void; center: CityCenter };

type GoogleMapsApi = any;
type GoogleMapInstance = any;
type GoogleMarker = any;

const SCRIPT_ID = "myskyparcel-google-maps";
let mapsPromise: Promise<GoogleMapsApi> | null = null;

function loadGoogleMaps(apiKey: string): Promise<GoogleMapsApi> {
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
  if (status === "sold") return "#ff4d6d";
  if (status === "reserved") return "#f6c453";
  return "#58e6ff";
}

function tierColor(tier: Parcel["tier"]) {
  if (tier === "premium") return "#f6c453";
  if (tier === "elite") return "#b77cff";
  return "#55c9ff";
}

function statusLabel(status: Parcel["status"]) {
  if (status === "sold") return "Satıldı";
  if (status === "reserved") return "Rezerve";
  return "Satışta";
}

function tierLabel(tier: Parcel["tier"]) {
  if (tier === "premium") return "Premium";
  if (tier === "elite") return "Elit";
  return "Dijital";
}

function circularParcelIcon(maps: any, parcel: ParcelWithGeometry, selected: boolean) {
  const tier = tierColor(parcel.tier);
  const status = statusColor(parcel.status);
  const edge = selected ? status : tier;
  const fill = parcel.status === "sold" ? "#3d1020" : parcel.status === "reserved" ? "#3b2a0b" : "#071a2d";
  const size = selected ? 16 : 9;
  const glow = selected ? 7 : 3.5;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size + 16}" height="${size + 16}" viewBox="0 0 ${size + 16} ${size + 16}"><defs><filter id="g"><feGaussianBlur stdDeviation="2.5"/></filter></defs><rect x="8" y="8" width="${size}" height="${size}" rx="${selected ? 2 : 1}" fill="${edge}" opacity=".28" filter="url(#g)"/><rect x="8" y="8" width="${size}" height="${size}" rx="${selected ? 2 : 1}" fill="${fill}" stroke="${edge}" stroke-width="${selected ? 2 : 1}"/><circle cx="${8 + size / 2}" cy="${8 + size / 2}" r="${selected ? 1.8 : 0.9}" fill="${selected ? "#fff" : edge}"/><circle cx="${8 + size / 2}" cy="${8 + size / 2}" r="${glow}" fill="none" stroke="${status}" stroke-opacity="${selected ? .7 : .18}" stroke-width="1"/></svg>`;
  return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, scaledSize: new maps.Size(size + 16, size + 16), anchor: new maps.Point((size + 16) / 2, (size + 16) / 2) };
}

function parcelInfoHtml(parcel: ParcelWithGeometry) {
  const color = statusColor(parcel.status);
  const price = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(parcel.price);
  const city = parcel.city_name || parcel.city_code || "—";
  const layer = parcel.layer_number ?? "—";
  const sector = parcel.sector_number ?? "—";
  const local = parcel.local_parcel_number ?? "—";
  const available = parcel.status === "available";
  return `<div class="myskyparcel-info" style="--parcel-status:${color}">
    <button type="button" class="myskyparcel-info__close" data-parcel-action="close" aria-label="Kapat">×</button>
    <div class="myskyparcel-info__head"><div><div class="myskyparcel-info__eyebrow">GÖKYÜZÜ PARSELİ</div><div class="myskyparcel-info__title">${parcel.parcel_number}</div></div><span class="myskyparcel-info__status">${statusLabel(parcel.status)}</span></div>
    <div class="myskyparcel-info__grid">
      <div><span>Şehir</span><strong>${city}</strong></div><div><span>Katman</span><strong>${layer}</strong></div>
      <div><span>Sektör</span><strong>${sector}</strong></div><div><span>Yerel Parsel</span><strong>${local}</strong></div>
      <div><span>Parsel Tipi</span><strong>${tierLabel(parcel.tier)}</strong></div><div><span>Fiyat</span><strong>${price}</strong></div>
    </div>
    ${available ? `<button type="button" class="myskyparcel-info__buy" data-parcel-action="buy">SATIN AL</button>` : `<div class="myskyparcel-info__unavailable">${statusLabel(parcel.status)} olduğu için satın alınamaz.</div>`}
  </div>`;
}

export function GoogleParcelMap({ parcels, selectedId, onSelect, onViewportChange, center }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const markersRef = useRef<Map<string, GoogleMarker>>(new Map());
  const positionsRef = useRef<Map<string, any>>(new Map());
  const animationRef = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const selectedRef = useRef(selectedId);
  const onSelectRef = useRef(onSelect);
  const onViewportChangeRef = useRef(onViewportChange);
  const infoWindowRef = useRef<any>(null);
  const infoListenerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { onViewportChangeRef.current = onViewportChange; }, [onViewportChange]);

  useEffect(() => {
    const styleId = "myskyparcel-info-window-style";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `.gm-style .gm-style-iw-c{background:transparent!important;box-shadow:none!important;padding:0!important;border-radius:0!important}.gm-style .gm-style-iw-d{overflow:visible!important;padding:0!important}.gm-style .gm-style-iw-tc{display:none!important}.gm-style .gm-ui-hover-effect{display:none!important}.myskyparcel-info{position:relative;width:252px;box-sizing:border-box;padding:11px;border:1px solid color-mix(in srgb,var(--parcel-status) 70%,white 10%);border-radius:13px;background:linear-gradient(145deg,rgba(5,18,35,.97),rgba(3,10,24,.94));color:#fff;box-shadow:0 8px 24px rgba(0,0,0,.48),0 0 18px color-mix(in srgb,var(--parcel-status) 25%,transparent);font-family:Inter,system-ui,sans-serif}.myskyparcel-info:after{content:"";position:absolute;left:50%;bottom:-7px;width:12px;height:12px;transform:translateX(-50%) rotate(45deg);background:#071326;border-right:1px solid var(--parcel-status);border-bottom:1px solid var(--parcel-status)}.myskyparcel-info__close{position:absolute;right:7px;top:6px;width:22px;height:22px;border:1px solid rgba(255,255,255,.16);border-radius:50%;background:rgba(255,255,255,.06);color:rgba(255,255,255,.78);font-size:17px;cursor:pointer}.myskyparcel-info__head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;padding:0 27px 8px 0;border-bottom:1px solid rgba(255,255,255,.1)}.myskyparcel-info__eyebrow{font-size:7px;letter-spacing:.14em;color:rgba(255,255,255,.52);font-weight:700}.myskyparcel-info__title{margin-top:2px;font-size:15px;font-weight:800}.myskyparcel-info__status{border:1px solid var(--parcel-status);border-radius:999px;padding:4px 6px;color:var(--parcel-status);font-size:8px;font-weight:800}.myskyparcel-info__grid{display:grid;grid-template-columns:1fr 1fr;gap:7px 10px;padding-top:8px}.myskyparcel-info__grid span{display:block;font-size:7px;color:rgba(255,255,255,.45)}.myskyparcel-info__grid strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:9px}.myskyparcel-info__buy{width:100%;margin-top:10px;border:1px solid var(--parcel-status);border-radius:8px;padding:8px;background:color-mix(in srgb,var(--parcel-status) 55%,#071326 45%);color:#fff;font-size:9px;font-weight:800;letter-spacing:.08em;cursor:pointer}.myskyparcel-info__unavailable{margin-top:9px;padding-top:8px;border-top:1px solid rgba(255,255,255,.08);font-size:8px;color:rgba(255,255,255,.48);text-align:center}`;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) { setError("Google Maps API anahtarı eksik."); return; }
    if (!mapRef.current) return;
    void loadGoogleMaps(apiKey).then((maps) => {
      if (cancelled || !mapRef.current) return;
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new maps.Map(mapRef.current, { center, zoom: 12, mapTypeId: "satellite", streetViewControl: false, fullscreenControl: false, mapTypeControl: false, gestureHandling: "greedy", clickableIcons: false, backgroundColor: "#071a2d" });
      } else mapInstanceRef.current.setCenter(center);
      setError(null); setMapReady(true);
    }).catch((e) => { console.error(e); if (!cancelled) setError("Google Maps yüklenemedi. API anahtarını kontrol edin."); });
    return () => { cancelled = true; };
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !onViewportChangeRef.current) return;
    const maps = (window as any).google?.maps; const map = mapInstanceRef.current;
    const emit = () => { const b = map.getBounds(); if (!b) return; const ne = b.getNorthEast(); const sw = b.getSouthWest(); onViewportChangeRef.current?.({ minLat: sw.lat(), minLng: sw.lng(), maxLat: ne.lat(), maxLng: ne.lng() }); };
    const listener = maps.event.addListener(map, "idle", emit); emit();
    return () => maps.event.removeListener(listener);
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const maps = (window as any).google?.maps;
    if (!maps) return;
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear(); positionsRef.current.clear();
    rotationRef.current = 0;

    const groups = {
      digital: parcels.filter((p) => p.tier === "digital"),
      elite: parcels.filter((p) => p.tier === "elite"),
      premium: parcels.filter((p) => p.tier === "premium"),
    };
    const rings: Array<{ tier: Parcel["tier"]; items: ParcelWithGeometry[]; radius: number }> = [
      { tier: "digital", items: groups.digital, radius: 0.105 },
      { tier: "elite", items: groups.elite, radius: 0.062 },
      { tier: "premium", items: groups.premium, radius: 0.028 },
    ];

    const createPosition = (angle: number, radius: number) => {
      const latRadius = radius;
      const lngRadius = radius / Math.max(Math.cos((center.lat * Math.PI) / 180), 0.2);
      return new maps.LatLng(center.lat + Math.sin(angle) * latRadius, center.lng + Math.cos(angle) * lngRadius);
    };

    const layouts = new Map<string, { angle: number; radius: number; tier: Parcel["tier"] }>();
    rings.forEach(({ tier, items, radius }) => {
      items.forEach((parcel, index) => {
        const angle = (index / Math.max(items.length, 1)) * Math.PI * 2;
        layouts.set(parcel.id, { angle, radius, tier });
        const position = createPosition(angle, radius);
        positionsRef.current.set(parcel.id, position);
        const marker = new maps.Marker({ map: mapInstanceRef.current, position, title: `${parcel.parcel_number} · ${tierLabel(tier)}`, icon: circularParcelIcon(maps, parcel, parcel.id === selectedId), optimized: true, zIndex: tier === "premium" ? 30 : tier === "elite" ? 20 : 10 });
        marker.addListener("click", () => onSelectRef.current(parcel.id));
        markersRef.current.set(parcel.id, marker);
      });
    });

    const animate = () => {
      rotationRef.current += 0.0022;
      layouts.forEach((layout, id) => {
        const marker = markersRef.current.get(id); if (!marker) return;
        const position = createPosition(layout.angle + rotationRef.current, layout.radius);
        positionsRef.current.set(id, position); marker.setPosition(position);
      });
      const selected = selectedRef.current;
      if (selected && infoWindowRef.current) {
        const position = positionsRef.current.get(selected); if (position) infoWindowRef.current.setPosition(position);
      }
      animationRef.current = window.setTimeout(animate, 65) as unknown as number;
    };
    animate();

    return () => {
      if (animationRef.current !== null) { window.clearTimeout(animationRef.current); animationRef.current = null; }
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current.clear(); positionsRef.current.clear();
    };
  }, [parcels, mapReady, center.lat, center.lng]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const maps = (window as any).google?.maps; if (!maps) return;
    markersRef.current.forEach((marker, id) => {
      const parcel = parcels.find((p) => p.id === id); if (!parcel) return;
      marker.setIcon(circularParcelIcon(maps, parcel, id === selectedId));
      marker.setZIndex(id === selectedId ? 100 : parcel.tier === "premium" ? 30 : parcel.tier === "elite" ? 20 : 10);
    });
  }, [selectedId, parcels, mapReady]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const maps = (window as any).google?.maps; if (!maps) return;
    if (!selectedId) { infoWindowRef.current?.close(); return; }
    const selected = parcels.find((p) => p.id === selectedId); const position = positionsRef.current.get(selectedId);
    if (!selected || !position) return;
    if (!infoWindowRef.current) infoWindowRef.current = new maps.InfoWindow({ disableAutoPan: true, pixelOffset: new maps.Size(0, -12) });
    infoWindowRef.current.setContent(parcelInfoHtml(selected)); infoWindowRef.current.setPosition(position); infoWindowRef.current.open({ map: mapInstanceRef.current });
    if (infoListenerRef.current) maps.event.removeListener(infoListenerRef.current);
    infoListenerRef.current = maps.event.addListener(infoWindowRef.current, "domready", () => {
      const root = document.querySelector(".myskyparcel-info"); if (!(root instanceof HTMLElement)) return;
      root.querySelector('[data-parcel-action="close"]')?.addEventListener("click", () => onSelectRef.current(""), { once: true });
      root.querySelector('[data-parcel-action="buy"]')?.addEventListener("click", () => document.getElementById("myskyparcel-purchase-action")?.click(), { once: true });
    });
  }, [selectedId, parcels, mapReady]);

  useEffect(() => () => {
    if (animationRef.current !== null) window.clearTimeout(animationRef.current);
    if (infoListenerRef.current) { const maps = (window as any).google?.maps; maps?.event.removeListener(infoListenerRef.current); }
    infoWindowRef.current?.close(); markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear(); positionsRef.current.clear(); mapInstanceRef.current = null;
  }, []);

  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] sm:h-[680px] lg:h-[760px]">
      <div ref={mapRef} className="absolute inset-0" aria-label="MySkyParcel dairesel gökyüzü parsel haritası" />
      {error && <div className="absolute inset-0 grid place-items-center bg-[#071a2d] p-6 text-center"><div className="max-w-md rounded-2xl border border-amber-200/20 bg-slate-950/85 p-6"><p className="text-sm font-semibold text-white">Google Maps hazır değil</p><p className="mt-2 text-xs text-white/60">{error}</p></div></div>}
      {!error && parcels.length === 0 && <div className="absolute inset-0 grid place-items-center bg-[#071a2d]/35 text-sm text-white/60">Bu şehir için gösterilecek parsel bulunamadı.</div>}
      {!error && parcels.length > 0 && <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full border border-cyan-200/20 bg-slate-950/75 px-4 py-2 text-center text-[10px] font-semibold tracking-[.12em] text-white/90 shadow-lg backdrop-blur-md sm:top-5">MY SKY PARCEL · DİJİTAL GÖKYÜZÜ HALKASI</div>}
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-slate-950/80 p-2.5 text-[10px] text-white/80 shadow-lg backdrop-blur-md sm:left-5 sm:bottom-5 sm:gap-4 sm:text-xs">
        <span className="font-semibold text-white/90">PARSEL TİPİ</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(85,201,255,.9)]" />Dijital · Dış</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-violet-300 shadow-[0_0_8px_rgba(183,124,255,.9)]" />Elit · Orta</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(246,196,83,.9)]" />Premium · İç</span>
        <span className="mx-1 h-4 w-px bg-white/15" />
        <span className="font-semibold text-white/90">DURUM</span>
        <span>🔵 Satışta</span><span>🟡 Rezerve</span><span>🔴 Satıldı</span>
      </div>
    </div>
  );
}
