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

function tierStyle(tier: Parcel["tier"], status: Parcel["status"], selected: boolean, hovered: boolean) {
  const color = tier === "premium" ? "#f6c453" : tier === "elite" ? "#b77cff" : "#55c9ff";
  const statusOpacity = status === "sold" ? 0.42 : status === "reserved" ? 0.68 : 1;
  return {
    strokeColor: selected ? "#ffffff" : color,
    strokeOpacity: statusOpacity * (selected || hovered ? 1 : 0.82),
    strokeWeight: selected ? 3 : hovered ? 2.5 : 1.25,
    fillColor: color,
    fillOpacity: statusOpacity * (selected ? 0.48 : hovered ? 0.3 : 0.16),
  };
}

function ringToPath(maps: any, ring: number[][]): LatLng[] {
  return ring.map(([lng, lat]) => new maps.LatLng(lat, lng));
}

function polygonPathGroups(maps: any, geometry: GeoJsonPolygon | GeoJsonMultiPolygon): LatLng[][][] {
  if (geometry.type === "Polygon") return [geometry.coordinates.map((ring) => ringToPath(maps, ring))];
  return geometry.coordinates.map((polygon) => polygon.map((ring) => ringToPath(maps, ring)));
}

function markerIcon(maps: any, tier: Parcel["tier"], selected: boolean) {
  const fill = tier === "premium" ? "#f6c453" : tier === "elite" ? "#b77cff" : "#55c9ff";
  const size = selected ? 18 : 12;
  const stroke = selected ? "#ffffff" : "#061a2f";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size + 8}" height="${size + 8}" viewBox="0 0 ${size + 8} ${size + 8}"><circle cx="${(size + 8) / 2}" cy="${(size + 8) / 2}" r="${size / 2}" fill="${fill}" stroke="${stroke}" stroke-width="2"/></svg>`;
  return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, scaledSize: new maps.Size(size + 8, size + 8), anchor: new maps.Point((size + 8) / 2, (size + 8) / 2) };
}

export function GoogleParcelMap({ parcels, selectedId, onSelect, onViewportChange, center }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<GoogleMapInstance | null>(null);
  const markersRef = useRef<Map<string, GoogleMarker>>(new Map());
  const polygonsRef = useRef<Map<string, GooglePolygon[]>>(new Map());
  const onSelectRef = useRef(onSelect);
  const onViewportChangeRef = useRef(onViewportChange);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { onViewportChangeRef.current = onViewportChange; }, [onViewportChange]);

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
    polygonsRef.current.forEach((polygons, id) => {
      if (!ids.has(id)) { polygons.forEach((polygon) => polygon.setMap(null)); polygonsRef.current.delete(id); }
    });

    parcels.forEach((parcel) => {
      const selected = parcel.id === selectedId;
      const geometry = parseGeometry(parcel.geometry);
      if (geometry) {
        const pathGroups = polygonPathGroups(maps, geometry);
        let polygons = polygonsRef.current.get(parcel.id);
        if (!polygons || polygons.length !== pathGroups.length) {
          polygons?.forEach((polygon) => polygon.setMap(null));
          polygons = pathGroups.map((paths) => {
            const polygon = new maps.Polygon({ map: mapInstanceRef.current, paths, ...tierStyle(parcel.tier, parcel.status, selected, false), clickable: true, zIndex: selected ? 20 : 1 });
            polygon.addListener("click", () => onSelectRef.current(parcel.id));
            polygon.addListener("mouseover", () => polygon.setOptions({ ...tierStyle(parcel.tier, parcel.status, parcel.id === selectedId, true), zIndex: 10 }));
            polygon.addListener("mouseout", () => polygon.setOptions({ ...tierStyle(parcel.tier, parcel.status, parcel.id === selectedId, false), zIndex: parcel.id === selectedId ? 20 : 1 }));
            return polygon;
          });
          polygonsRef.current.set(parcel.id, polygons);
        } else {
          polygons.forEach((polygon, index) => {
            polygon.setPaths(pathGroups[index]);
            polygon.setOptions({ ...tierStyle(parcel.tier, parcel.status, selected, false), zIndex: selected ? 20 : 1, visible: true });
          });
        }
        const oldMarker = markersRef.current.get(parcel.id);
        if (oldMarker) { oldMarker.setMap(null); markersRef.current.delete(parcel.id); }
        return;
      }

      const existingMarker = markersRef.current.get(parcel.id);
      const icon = markerIcon(maps, parcel.tier, selected);
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
    if (!mapReady || !selectedId || !mapInstanceRef.current) return;
    const selected = parcels.find((parcel) => parcel.id === selectedId);
    if (selected) mapInstanceRef.current.panTo({ lat: selected.latitude, lng: selected.longitude });
  }, [selectedId, parcels, mapReady]);

  useEffect(() => () => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    polygonsRef.current.forEach((polygons) => polygons.forEach((polygon) => polygon.setMap(null)));
    markersRef.current.clear();
    polygonsRef.current.clear();
    mapInstanceRef.current = null;
  }, []);

  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-2xl border border-sky-200/15 bg-[#071a2d] sm:h-[680px] lg:h-[760px]">
      <div ref={mapRef} className="absolute inset-0" aria-label="MySkyParcel Google Maps parsel haritası" />
      {error && <div className="absolute inset-0 grid place-items-center bg-[#071a2d] p-6 text-center"><div className="max-w-md rounded-2xl border border-amber-200/20 bg-slate-950/85 p-6 shadow-2xl backdrop-blur-md"><p className="text-sm font-semibold text-white">Google Maps hazır değil</p><p className="mt-2 text-xs leading-5 text-white/60">{error}</p></div></div>}
      {!error && parcels.length === 0 && <div className="absolute inset-0 grid place-items-center bg-[#071a2d]/35 text-sm text-white/60">Bu şehir için gösterilecek parsel bulunamadı.</div>}
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/70 px-3 py-2 text-xs font-medium text-white/85 shadow-lg backdrop-blur-md sm:left-5 sm:top-5">Google Maps · MySkyParcel parselleri</div>
      <div className="pointer-events-none absolute bottom-4 left-4 flex flex-wrap gap-2 rounded-xl border border-white/10 bg-slate-950/75 p-2 text-[10px] text-white/75 backdrop-blur-md sm:left-5 sm:bottom-5 sm:text-xs"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-sky-300" />Dijital</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-violet-300" />Elit</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-300" />Premium</span></div>
    </div>
  );
}
