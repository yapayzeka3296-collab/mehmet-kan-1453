import { useEffect, useRef, useState } from "react";
import type { Parcel } from "@/types/parcel";

type CityCenter = { lat: number; lng: number };
type LatLng = { lat: number; lng: number };
type GeoJsonPolygon = { type: "Polygon"; coordinates: number[][][] };
type GeoJsonMultiPolygon = { type: "MultiPolygon"; coordinates: number[][][][] };
type ParcelWithGeometry = Parcel & { geometry?: GeoJsonPolygon | GeoJsonMultiPolygon | string | null };
type ViewportBounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };
type Props = { parcels: ParcelWithGeometry[]; selectedId: string | null; onSelect: (id: string) => void; onViewportChange?: (bounds: ViewportBounds) => void; center: CityCenter };
type GoogleMapsApi = any;
type GoogleMapInstance = any;
type GoogleMarker = any;
type GooglePolygon = any;

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

function parseGeometry(value: ParcelWithGeometry["geometry"]): GeoJsonPolygon | GeoJsonMultiPolygon | null {
  if (!value) return null;
  if (typeof value === "object" && (value.type === "Polygon" || value.type === "MultiPolygon")) return value;
  if (typeof value !== "string") return null;
  try {
    const parsed = JSON.parse(value);
    return parsed?.type === "Polygon" || parsed?.type === "MultiPolygon" ? parsed : null;
  } catch {
    return null;
  }
}

function statusColor(status: Parcel["status"]) {
  if (status === "sold") return "#ff4d6d";
  if (status === "reserved") return "#f6c453";
  return "#58e6ff";
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

function parcelStyle(status: Parcel["status"], selected: boolean, hovered: boolean, glow = false) {
  const color = statusColor(status);
  const statusOpacity = status === "sold" ? 0.38 : status === "reserved" ? 0.62 : 1;
  if (glow) {
    return {
      strokeColor: color,
      strokeOpacity: statusOpacity * (selected || hovered ? 0.55 : 0.18),
      strokeWeight: selected ? 12 : hovered ? 8 : 6,
      fillColor: color,
      fillOpacity: 0,
      clickable: false,
    };
  }
  return {
    strokeColor: color,
    strokeOpacity: statusOpacity * (selected || hovered ? 1 : 0.9),
    strokeWeight: selected ? 3.2 : hovered ? 2.1 : 1.35,
    fillColor: color,
    fillOpacity: statusOpacity * (selected ? 0.34 : hovered ? 0.10 : 0.025),
    clickable: true,
  };
}

function ringToPath(maps: any, ring: number[][]): LatLng[] {
  return ring.map(([lng, lat]) => new maps.LatLng(lat, lng));
}

function polygonPathGroups(maps: any, geometry: GeoJsonPolygon | GeoJsonMultiPolygon): LatLng[][][] {
  if (geometry.type === "Polygon") return [geometry.coordinates.map((ring) => ringToPath(maps, ring))];
  return geometry.coordinates.map((polygon) => polygon.map((ring) => ringToPath(maps, ring)));
}

function cornerPositions(maps: any, geometry: GeoJsonPolygon | GeoJsonMultiPolygon): LatLng[] {
  const rings = geometry.type === "Polygon"
    ? geometry.coordinates
    : geometry.coordinates.flatMap((polygon) => polygon);
  const seen = new Set<string>();
  const positions: LatLng[] = [];
  rings.forEach((ring) => {
    ring.forEach(([lng, lat], index) => {
      if (index === ring.length - 1 && ring.length > 1 && ring[0][0] === lng && ring[0][1] === lat) return;
      const key = `${lng.toFixed(7)},${lat.toFixed(7)}`;
      if (seen.has(key)) return;
      seen.add(key);
      positions.push(new maps.LatLng(lat, lng));
    });
  });
  return positions;
}

function markerIcon(maps: any, tier: Parcel["tier"], selected: boolean, status: Parcel["status"]) {
  const fill = selected ? statusColor(status) : tier === "premium" ? "#f6c453" : tier === "elite" ? "#b77cff" : "#55c9ff";
  const size = selected ? 18 : 12;
  const stroke = selected ? "#ffffff" : "#061a2f";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size + 8}" height="${size + 8}" viewBox="0 0 ${size + 8} ${size + 8}"><circle cx="${(size + 8) / 2}" cy="${(size + 8) / 2}" r="${size / 2}" fill="${fill}" stroke="${stroke}" stroke-width="2"/></svg>`;
  return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, scaledSize: new maps.Size(size + 8, size + 8), anchor: new maps.Point((size + 8) / 2, (size + 8) / 2) };
}

function cornerLightIcon(maps: any, selected: boolean, status: Parcel["status"]) {
  const color = statusColor(status);
  const size = selected ? 18 : 12;
  const center = (size + 8) / 2;
  const outer = selected ? 7 : 5;
  const inner = selected ? 3.1 : 2.2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size + 8}" height="${size + 8}" viewBox="0 0 ${size + 8} ${size + 8}"><circle cx="${center}" cy="${center}" r="${outer}" fill="${color}" fill-opacity="0.20"/><circle cx="${center}" cy="${center}" r="${outer - 1.6}" fill="${color}" fill-opacity="0.28"/><circle cx="${center}" cy="${center}" r="${inner}" fill="${selected ? "#ffffff" : color}" stroke="${color}" stroke-width="1"/><circle cx="${center}" cy="${center}" r="${selected ? 1.3 : 0.9}" fill="#ffffff"/></svg>`;
  return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, scaledSize: new maps.Size(size + 8, size + 8), anchor: new maps.Point(center, center) };
}

function parcelInfoHtml(parcel: ParcelWithGeometry) {
  const color = statusColor(parcel.status);
  const price = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(parcel.price);
  const city = parcel.city_name || parcel.city_code || "—";
  const layer = parcel.layer_number ?? "—";
  const sector = parcel.sector_number ?? "—";
  const local = parcel.local_parcel_number ?? "—";
  const isAvailable = parcel.status === "available";
  return `<div class="myskyparcel-info" style="--parcel-status:${color}">
    <button type="button" class="myskyparcel-info__close" data-parcel-action="close" aria-label="Parsel bilgi kutusunu kapat">×</button>
    <div class="myskyparcel-info__head"><div><div class="myskyparcel-info__eyebrow">GÖKYÜZÜ PARSELİ</div><div class="myskyparcel-info__title">${parcel.parcel_number}</div></div><span class="myskyparcel-info__status">${statusLabel(parcel.status)}</span></div>
    <div class="myskyparcel-info__grid">
      <div><span>Şehir</span><strong>${city}</strong></div>
      <div><span>Katman</span><strong>${layer}</strong></div>
      <div><span>Sektör</span><strong>${sector}</strong></div>
      <div><span>Yerel Parsel</span><strong>${local}</strong></div>
      <div><span>Parsel Tipi</span><strong>${tierLabel(parcel.tier)}</strong></div>
      <div><span>Fiyat</span><strong>${price}</strong></div>
    </div>
    ${isAvailable ? `<button type="button" class="myskyparcel-info__buy" data-parcel-action="buy">SATIN AL</button>` : `<div class="myskyparcel-info__unavailable">${statusLabel(parcel.status)} olduğu için satın alınamaz.</div>`}
  </div>`;
}

export function GoogleParcelMap({ parcels, selectedId, onSelect, onViewportChange, center }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const infoWindowRef = useRef<any>(null);
  const infoWindowDomListenerRef = useRef<any>(null);
  const markersRef = useRef<Map<string, GoogleMarker>>(new Map());
  const cornerMarkersRef = useRef<Map<string, GoogleMarker[]>>(new Map());
  const polygonsRef = useRef<Map<string, GooglePolygon[]>>(new Map());
  const onSelectRef = useRef(onSelect);
  const onViewportChangeRef = useRef(onViewportChange);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { onViewportChangeRef.current = onViewportChange; }, [onViewportChange]);

  useEffect(() => {
    const styleId = "myskyparcel-info-window-style";
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `.gm-style .gm-style-iw-c{background:transparent!important;box-shadow:none!important;padding:0!important;border-radius:0!important}.gm-style .gm-style-iw-d{overflow:visible!important;padding:0!important}.gm-style .gm-style-iw-tc{display:none!important}.gm-style .gm-ui-hover-effect{display:none!important}.myskyparcel-info{position:relative;width:300px;box-sizing:border-box;padding:15px;border:1px solid color-mix(in srgb,var(--parcel-status) 70%,white 10%);border-radius:16px;background:linear-gradient(145deg,rgba(5,18,35,.97),rgba(3,10,24,.94));color:#fff;box-shadow:0 0 0 1px rgba(255,255,255,.05),0 10px 35px rgba(0,0,0,.48),0 0 24px color-mix(in srgb,var(--parcel-status) 28%,transparent);font-family:Inter,system-ui,sans-serif}.myskyparcel-info:after{content:"";position:absolute;left:50%;bottom:-9px;width:16px;height:16px;transform:translateX(-50%) rotate(45deg);background:#071326;border-right:1px solid var(--parcel-status);border-bottom:1px solid var(--parcel-status);box-shadow:6px 6px 18px rgba(0,0,0,.3)}.myskyparcel-info__close{position:absolute;right:9px;top:8px;z-index:5;width:26px;height:26px;border:1px solid rgba(255,255,255,.16);border-radius:50%;background:rgba(255,255,255,.06);color:rgba(255,255,255,.78);font-size:20px;line-height:22px;cursor:pointer;transition:.2s}.myskyparcel-info__close:hover{background:rgba(255,255,255,.14);color:#fff;border-color:var(--parcel-status)}.myskyparcel-info__head{position:relative;z-index:1;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:0 32px 11px 0;border-bottom:1px solid rgba(255,255,255,.10)}.myskyparcel-info__eyebrow{font-size:8px;letter-spacing:.16em;color:rgba(255,255,255,.52);font-weight:700}.myskyparcel-info__title{margin-top:3px;font-size:18px;line-height:1.1;font-weight:800;letter-spacing:.02em}.myskyparcel-info__status{display:inline-flex;align-items:center;white-space:nowrap;border:1px solid color-mix(in srgb,var(--parcel-status) 70%,transparent);border-radius:999px;padding:5px 8px;color:var(--parcel-status);font-size:9px;font-weight:800;background:color-mix(in srgb,var(--parcel-status) 12%,transparent)}.myskyparcel-info__grid{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:9px 14px;padding-top:11px}.myskyparcel-info__grid>div{min-width:0}.myskyparcel-info__grid span{display:block;font-size:8px;color:rgba(255,255,255,.45);margin-bottom:2px}.myskyparcel-info__grid strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:rgba(255,255,255,.92);font-weight:700}.myskyparcel-info__buy{position:relative;z-index:2;width:100%;margin-top:13px;border:1px solid color-mix(in srgb,var(--parcel-status) 75%,white 8%);border-radius:10px;padding:10px 12px;background:linear-gradient(135deg,color-mix(in srgb,var(--parcel-status) 78%,#071326 22%),color-mix(in srgb,var(--parcel-status) 52%,#071326 48%));color:#fff;font-size:11px;font-weight:800;letter-spacing:.08em;cursor:pointer;box-shadow:0 0 18px color-mix(in srgb,var(--parcel-status) 24%,transparent);transition:transform .15s,filter .15s}.myskyparcel-info__buy:hover{filter:brightness(1.12);transform:translateY(-1px)}.myskyparcel-info__unavailable{position:relative;z-index:1;margin-top:13px;padding-top:11px;border-top:1px solid rgba(255,255,255,.08);font-size:9px;line-height:1.4;color:rgba(255,255,255,.48);text-align:center}`;
    document.head.appendChild(style);
    return () => { style.remove(); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Google Maps API anahtarı eksik. Vercel ortam değişkenlerine VITE_GOOGLE_MAPS_API_KEY eklenmelidir.");
      return;
    }
    if (!mapRef.current) return;
    void loadGoogleMaps(apiKey).then((maps) => {
      if (cancelled || !mapRef.current) return;
      setError(null);
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new maps.Map(mapRef.current, {
          center,
          zoom: 11,
          mapTypeId: "satellite",
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          gestureHandling: "greedy",
          clickableIcons: false,
          backgroundColor: "#071a2d",
        });
      } else {
        mapInstanceRef.current.setCenter(center);
      }
      setMapReady(true);
    }).catch((loadError) => {
      console.error("Google Maps load error", loadError);
      if (!cancelled) setError("Google Maps yüklenemedi. API anahtarını ve Maps JavaScript API yetkisini kontrol edin.");
    });
    return () => { cancelled = true; };
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !onViewportChangeRef.current) return;
    const map = mapInstanceRef.current;
    const maps = (window as any).google?.maps;
    if (!maps) return;
    const emitBounds = () => {
      const bounds = map.getBounds();
      if (!bounds) return;
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      onViewportChangeRef.current?.({ minLat: sw.lat(), minLng: sw.lng(), maxLat: ne.lat(), maxLng: ne.lng() });
    };
    const listener = maps.event.addListener(map, "idle", emitBounds);
    emitBounds();
    return () => maps.event.removeListener(listener);
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const maps = (window as any).google?.maps;
    if (!maps) return;
    const ids = new Set(parcels.map((parcel) => parcel.id));
    markersRef.current.forEach((marker, id) => {
      if (!ids.has(id)) { marker.setMap(null); markersRef.current.delete(id); }
    });
    cornerMarkersRef.current.forEach((markers, id) => {
      if (!ids.has(id)) { markers.forEach((marker) => marker.setMap(null)); cornerMarkersRef.current.delete(id); }
    });
    polygonsRef.current.forEach((polygons, id) => {
      if (!ids.has(id)) { polygons.forEach((polygon) => polygon.setMap(null)); polygonsRef.current.delete(id); }
    });

    parcels.forEach((parcel) => {
      const selected = parcel.id === selectedId;
      const geometry = parseGeometry(parcel.geometry);
      if (geometry) {
        const pathGroups = polygonPathGroups(maps, geometry);
        let polygons = polygonsRef.current.get(parcel.id);
        const expectedPolygonCount = pathGroups.length * 2;
        if (!polygons || polygons.length !== expectedPolygonCount) {
          polygons?.forEach((polygon) => polygon.setMap(null));
          polygons = [];
          pathGroups.forEach((paths) => {
            const glow = new maps.Polygon({ map: mapInstanceRef.current, paths, ...parcelStyle(parcel.status, selected, false, true), zIndex: selected ? 19 : 0 });
            const polygon = new maps.Polygon({ map: mapInstanceRef.current, paths, ...parcelStyle(parcel.status, selected, false, false), zIndex: selected ? 20 : 1 });
            polygon.addListener("click", () => onSelectRef.current(parcel.id));
            polygon.addListener("mouseover", () => {
              polygon.setOptions({ ...parcelStyle(parcel.status, parcel.id === selectedId, true, false), zIndex: 20 });
              glow.setOptions({ ...parcelStyle(parcel.status, parcel.id === selectedId, true, true), zIndex: 19 });
            });
            polygon.addListener("mouseout", () => {
              polygon.setOptions({ ...parcelStyle(parcel.status, parcel.id === selectedId, false, false), zIndex: parcel.id === selectedId ? 20 : 1 });
              glow.setOptions({ ...parcelStyle(parcel.status, parcel.id === selectedId, false, true), zIndex: parcel.id === selectedId ? 19 : 0 });
            });
            polygons!.push(glow, polygon);
          });
          polygonsRef.current.set(parcel.id, polygons);
        } else {
          pathGroups.forEach((paths, index) => {
            const glow = polygons![index * 2];
            const polygon = polygons![index * 2 + 1];
            glow.setPaths(paths);
            polygon.setPaths(paths);
            glow.setOptions({ ...parcelStyle(parcel.status, selected, false, true), zIndex: selected ? 19 : 0, visible: true });
            polygon.setOptions({ ...parcelStyle(parcel.status, selected, false, false), zIndex: selected ? 20 : 1, visible: true });
          });
        }

        const positions = cornerPositions(maps, geometry);
        let cornerMarkers = cornerMarkersRef.current.get(parcel.id);
        if (!cornerMarkers || cornerMarkers.length !== positions.length) {
          cornerMarkers?.forEach((marker) => marker.setMap(null));
          cornerMarkers = positions.map((position) => {
            const marker = new maps.Marker({
              map: mapInstanceRef.current,
              position,
              icon: cornerLightIcon(maps, selected, parcel.status),
              clickable: true,
              zIndex: selected ? 30 : 10,
            });
            marker.addListener("click", () => onSelectRef.current(parcel.id));
            return marker;
          });
          cornerMarkersRef.current.set(parcel.id, cornerMarkers);
        } else {
          positions.forEach((position, index) => {
            cornerMarkers![index].setPosition(position);
            cornerMarkers![index].setIcon(cornerLightIcon(maps, selected, parcel.status));
            cornerMarkers![index].setZIndex(selected ? 30 : 10);
            cornerMarkers![index].setMap(mapInstanceRef.current);
          });
        }

        const oldMarker = markersRef.current.get(parcel.id);
        if (oldMarker) { oldMarker.setMap(null); markersRef.current.delete(parcel.id); }
        return;
      }

      const oldCornerMarkers = cornerMarkersRef.current.get(parcel.id);
      if (oldCornerMarkers) {
        oldCornerMarkers.forEach((marker) => marker.setMap(null));
        cornerMarkersRef.current.delete(parcel.id);
      }
      const existingMarker = markersRef.current.get(parcel.id);
      const icon = markerIcon(maps, parcel.tier, selected, parcel.status);
      const markerOpacity = parcel.status === "sold" ? 0.42 : parcel.status === "reserved" ? 0.68 : 1;
      if (existingMarker) {
        existingMarker.setPosition({ lat: parcel.latitude, lng: parcel.longitude });
        existingMarker.setTitle(parcel.parcel_number);
        existingMarker.setIcon(icon);
        existingMarker.setOpacity(markerOpacity);
      } else {
        const marker = new maps.Marker({ map: mapInstanceRef.current, position: { lat: parcel.latitude, lng: parcel.longitude }, title: parcel.parcel_number, icon, opacity: markerOpacity });
        marker.addListener("click", () => onSelectRef.current(parcel.id));
        markersRef.current.set(parcel.id, marker);
      }
    });
  }, [parcels, selectedId, mapReady]);

  useEffect(() => {
    if (!mapReady || !selectedId || !mapInstanceRef.current) {
      if (infoWindowRef.current) infoWindowRef.current.close();
      return;
    }
    const maps = (window as any).google?.maps;
    if (!maps) return;
    const selected = parcels.find((parcel) => parcel.id === selectedId);
    if (!selected) {
      infoWindowRef.current?.close();
      return;
    }
    if (!infoWindowRef.current) {
      infoWindowRef.current = new maps.InfoWindow({ disableAutoPan: false, pixelOffset: new maps.Size(0, -12) });
    }
    infoWindowRef.current.setContent(parcelInfoHtml(selected));
    infoWindowRef.current.setPosition({ lat: selected.latitude, lng: selected.longitude });
    infoWindowRef.current.open({ map: mapInstanceRef.current });

    if (infoWindowDomListenerRef.current) {
      maps.event.removeListener(infoWindowDomListenerRef.current);
      infoWindowDomListenerRef.current = null;
    }
    infoWindowDomListenerRef.current = maps.event.addListener(infoWindowRef.current, "domready", () => {
      const root = document.querySelector(".myskyparcel-info");
      if (!(root instanceof HTMLElement)) return;
      const closeButton = root.querySelector('[data-parcel-action="close"]');
      closeButton?.addEventListener("click", () => onSelectRef.current(""), { once: true });
      const buyButton = root.querySelector('[data-parcel-action="buy"]');
      buyButton?.addEventListener("click", () => {
        document.getElementById("myskyparcel-purchase-action")?.click();
      }, { once: true });
    });

    mapInstanceRef.current.panTo({ lat: selected.latitude, lng: selected.longitude });
  }, [selectedId, parcels, mapReady]);

  useEffect(() => () => {
    if (infoWindowDomListenerRef.current) {
      const maps = (window as any).google?.maps;
      maps?.event.removeListener(infoWindowDomListenerRef.current);
    }
    infoWindowRef.current?.close();
    markersRef.current.forEach((marker) => marker.setMap(null));
    cornerMarkersRef.current.forEach((markers) => markers.forEach((marker) => marker.setMap(null)));
    polygonsRef.current.forEach((polygons) => polygons.forEach((polygon) => polygon.setMap(null)));
    markersRef.current.clear();
    cornerMarkersRef.current.clear();
    polygonsRef.current.clear();
    mapInstanceRef.current = null;
  }, []);

  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] sm:h-[680px] lg:h-[760px]">
      <div ref={mapRef} className="absolute inset-0" aria-label="MySkyParcel Google Maps parsel haritası" />
      {error && <div className="absolute inset-0 grid place-items-center bg-[#071a2d] p-6 text-center"><div className="max-w-md rounded-2xl border border-amber-200/20 bg-slate-950/85 p-6 shadow-2xl backdrop-blur-md"><p className="text-sm font-semibold text-white">Google Maps hazır değil</p><p className="mt-2 text-xs leading-5 text-white/60">{error}</p></div></div>}
      {!error && parcels.length === 0 && <div className="absolute inset-0 grid place-items-center bg-[#071a2d]/35 text-sm text-white/60">Bu şehir için gösterilecek parsel bulunamadı.</div>}
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-cyan-200/20 bg-slate-950/70 px-3 py-2 text-xs font-medium text-white/90 shadow-lg backdrop-blur-md sm:left-5 sm:top-5">MySkyParcel · Gökten parsel görünümü</div>
      <div className="pointer-events-none absolute bottom-4 left-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-slate-950/80 p-2.5 text-[10px] text-white/80 shadow-lg backdrop-blur-md sm:left-5 sm:bottom-5 sm:gap-4 sm:text-xs">
        <span className="font-semibold text-white/90">PARSEL DURUMU</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(88,230,255,0.95)]" />Satışta</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(246,196,83,0.9)]" />Rezerve</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(255,77,109,0.9)]" />Satıldı</span>
      </div>
    </div>
  );
}
