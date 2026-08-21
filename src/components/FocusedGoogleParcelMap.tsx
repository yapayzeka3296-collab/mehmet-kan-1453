import { useEffect, useRef, useState } from "react";
import type { Parcel } from "@/types/parcel";

type CityCenter = { lat: number; lng: number };
type ViewportBounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };
type FocusTarget = { city: CityCenter; parcel: CityCenter; token: string };
type GeoJsonPolygon = { type: "Polygon"; coordinates: number[][][] };
type GeoJsonMultiPolygon = { type: "MultiPolygon"; coordinates: number[][][][] };
type MapParcel = Parcel & { geometry?: GeoJsonPolygon | GeoJsonMultiPolygon | null };
type Props = { parcels: MapParcel[]; selectedId: string | null; selectedIds?: Set<string>; multiSelect?: boolean; onSelect: (id: string | null) => void; onToggleSelect?: (id: string) => void; onViewportChange?: (bounds: ViewportBounds) => void; center: CityCenter; focusTarget?: FocusTarget | null };
type Camera = { lat: number; lng: number; zoom: number };
type ParcelPolygon = { polygon: any; parcel: MapParcel };

const SCRIPT_ID = "myskyparcel-google-maps";
const EMPTY_SELECTED_IDS = new Set<string>();
let mapsPromise: Promise<any> | null = null;
const TURKEY_CENTER = { lat: 39, lng: 35 };
const INITIAL_CITY_ZOOM = 11;
const FOCUS_ZOOM = 16;

function loadMaps(key: string) {
  if (typeof window === "undefined") return Promise.reject(new Error("Google Maps yalnızca tarayıcıda yüklenebilir."));
  if ((window as any).google?.maps) return Promise.resolve((window as any).google.maps);
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const finish = () => ((window as any).google?.maps ? resolve((window as any).google.maps) : reject(new Error("Google Maps yüklenemedi. API anahtarı, billing ve domain kısıtlamalarını kontrol edin.")));
    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Maps yüklenemedi. API anahtarı veya domain yetkisini kontrol edin.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`;
    script.onload = finish;
    script.onerror = () => reject(new Error("Google Maps yüklenemedi. API anahtarı veya domain yetkisini kontrol edin."));
    document.head.appendChild(script);
  });
  return mapsPromise;
}

const color = (parcel: MapParcel) => parcel.status === "sold" ? "#ff1744" : parcel.tier === "premium" ? "#f6c453" : parcel.tier === "elite" ? "#b77cff" : "#55c9ff";
const normalizeRing = (ring: number[][]) => ring.filter((point) => Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1]));
const geometryPaths = (parcel: MapParcel) => {
  const geometry = parcel.geometry;
  if (!geometry) return null;
  if (geometry.type === "Polygon") return geometry.coordinates.map(normalizeRing).filter((ring) => ring.length >= 3);
  return geometry.coordinates.flatMap((polygon) => polygon.map(normalizeRing).filter((ring) => ring.length >= 3));
};

function fallbackParcelPath(parcel: MapParcel) {
  const cos = Math.max(Math.cos(parcel.latitude * Math.PI / 180), 0.25);
  const dLat = 0.00125;
  const dLng = 0.00125 / cos;
  return [[
    { lat: parcel.latitude - dLat, lng: parcel.longitude - dLng },
    { lat: parcel.latitude - dLat, lng: parcel.longitude + dLng },
    { lat: parcel.latitude + dLat, lng: parcel.longitude + dLng },
    { lat: parcel.latitude + dLat, lng: parcel.longitude - dLng },
  ]];
}

const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function animateCamera(map: any, from: Camera, to: Camera, duration: number, maps: any, onDone?: () => void) {
  let frame = 0;
  const started = performance.now();
  const step = (now: number) => {
    const raw = Math.min(1, (now - started) / duration);
    const t = easeInOut(raw);
    map.moveCamera({ center: new maps.LatLng(lerp(from.lat, to.lat, t), lerp(from.lng, to.lng, t)), zoom: lerp(from.zoom, to.zoom, t), tilt: 0, heading: 0 });
    if (raw < 1) frame = requestAnimationFrame(step);
    else onDone?.();
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}

export function FocusedGoogleParcelMap({ parcels, selectedId, selectedIds = EMPTY_SELECTED_IDS, multiSelect = false, onSelect, onToggleSelect, onViewportChange, center, focusTarget }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const map = useRef<any>(null);
  const focusToken = useRef<string | null>(null);
  const focusOverlay = useRef<any>(null);
  const animationCancel = useRef<(() => void) | null>(null);
  const lastCityCenter = useRef<CityCenter | null>(null);
  const hasInitialAnimation = useRef(false);
  const polygons = useRef<Map<string, ParcelPolygon>>(new Map());
  const multiSelectRef = useRef(multiSelect);
  const onSelectRef = useRef(onSelect);
  const onToggleSelectRef = useRef(onToggleSelect);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { multiSelectRef.current = multiSelect; onSelectRef.current = onSelect; onToggleSelectRef.current = onToggleSelect; }, [multiSelect, onSelect, onToggleSelect]);

  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) { setError("Google Maps API anahtarı eksik. GitHub Actions secret VITE_GOOGLE_MAPS_API_KEY kontrol edilmeli."); return; }
    loadMaps(key).then((maps) => {
      if (!ref.current) return;
      map.current ||= new maps.Map(ref.current, { center: TURKEY_CENTER, zoom: 5, mapTypeId: "satellite", streetViewControl: false, fullscreenControl: false, mapTypeControl: false, gestureHandling: "greedy", clickableIcons: false, tilt: 0, heading: 0 });
      setReady(true);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Google Maps yüklenemedi."));
  }, []);

  useEffect(() => {
    if (!ready || !map.current || hasInitialAnimation.current || focusTarget) return;
    hasInitialAnimation.current = true;
    lastCityCenter.current = center;
    const maps = (window as any).google.maps;
    const from: Camera = { ...TURKEY_CENTER, zoom: 5 };
    const to: Camera = { ...center, zoom: INITIAL_CITY_ZOOM };
    animationCancel.current?.();
    map.current.moveCamera({ center: new maps.LatLng(from.lat, from.lng), zoom: from.zoom, tilt: 0, heading: 0 });
    animationCancel.current = animateCamera(map.current, from, to, 3000, maps);
    return () => { animationCancel.current?.(); animationCancel.current = null; };
  }, [ready, center.lat, center.lng, focusTarget]);

  useEffect(() => {
    if (!ready || !map.current || !lastCityCenter.current) return;
    const previous = lastCityCenter.current;
    if (previous.lat === center.lat && previous.lng === center.lng) return;
    lastCityCenter.current = center;
    if (focusTarget) return;
    const maps = (window as any).google.maps;
    const current = map.current.getCenter?.();
    const from: Camera = { lat: current?.lat?.() ?? TURKEY_CENTER.lat, lng: current?.lng?.() ?? TURKEY_CENTER.lng, zoom: map.current.getZoom?.() ?? 5 };
    const to: Camera = { ...center, zoom: INITIAL_CITY_ZOOM };
    animationCancel.current?.();
    animationCancel.current = animateCamera(map.current, from, to, 2500, maps);
    return () => { animationCancel.current?.(); animationCancel.current = null; };
  }, [ready, center.lat, center.lng, focusTarget]);

  useEffect(() => {
    if (!ready || !map.current || !focusTarget || focusToken.current === focusTarget.token) return;
    focusToken.current = focusTarget.token;
    const maps = (window as any).google.maps;
    animationCancel.current?.();
    focusOverlay.current?.setMap(null);
    focusOverlay.current = null;
    const cityCamera: Camera = { ...focusTarget.city, zoom: INITIAL_CITY_ZOOM };
    const parcelCamera: Camera = { ...focusTarget.parcel, zoom: FOCUS_ZOOM };
    const current = map.current.getCenter?.();
    const from: Camera = { lat: current?.lat?.() ?? TURKEY_CENTER.lat, lng: current?.lng?.() ?? TURKEY_CENTER.lng, zoom: map.current.getZoom?.() ?? 5 };
    animationCancel.current = animateCamera(map.current, from, cityCamera, 2200, maps, () => {
      animationCancel.current = animateCamera(map.current, cityCamera, parcelCamera, 1800, maps, () => {
        focusOverlay.current = new maps.Circle({ map: map.current, center: focusTarget.parcel, radius: 120, strokeColor: "#ff1744", strokeOpacity: 1, strokeWeight: 3, fillColor: "#ff1744", fillOpacity: 0.12, clickable: true, zIndex: 1000 });
        const focusParcelId = focusTarget.token.split(":")[0];
        if (focusParcelId) focusOverlay.current.addListener("click", () => onSelectRef.current(focusParcelId));
      });
    });
    return () => { animationCancel.current?.(); animationCancel.current = null; };
  }, [ready, focusTarget]);

  useEffect(() => {
    if (!ready || !map.current || !onViewportChange) return;
    const maps = (window as any).google.maps;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const emit = () => {
      const bounds = map.current?.getBounds?.();
      if (!bounds) return;
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      onViewportChange({ minLat: sw.lat(), minLng: sw.lng(), maxLat: ne.lat(), maxLng: ne.lng() });
    };
    const listener = maps.event.addListener(map.current, "idle", () => { if (timer) clearTimeout(timer); timer = setTimeout(emit, 150); });
    emit();
    return () => { maps.event.removeListener(listener); if (timer) clearTimeout(timer); };
  }, [ready, onViewportChange]);

  useEffect(() => {
    if (!ready || !map.current) return;
    const maps = (window as any).google.maps;
    polygons.current.forEach(({ polygon }) => polygon.setMap(null));
    polygons.current.clear();
    parcels.forEach((parcel) => {
      const rawPaths = geometryPaths(parcel);
      const paths = rawPaths && rawPaths.length > 0
        ? rawPaths.map((ring) => ring.map(([lng, lat]) => new maps.LatLng(lat, lng)))
        : fallbackParcelPath(parcel);
      const c = color(parcel);
      const selected = multiSelect ? selectedIds.has(parcel.id) : selectedId === parcel.id;
      const polygon = new maps.Polygon({ map: map.current, paths, strokeColor: selected ? "#fff4b0" : c, strokeOpacity: 1, strokeWeight: selected ? 2.5 : parcel.status === "sold" ? 2.5 : 1.1, fillColor: c, fillOpacity: selected ? 0.17 : parcel.status === "sold" ? 0.08 : 0.02, clickable: true, zIndex: selected ? 501 : parcel.status === "sold" ? 500 : 21 });
      polygon.addListener("click", () => {
        if (multiSelectRef.current && parcel.status === "available") onToggleSelectRef.current?.(parcel.id);
        else onSelectRef.current(parcel.id);
      });
      polygons.current.set(parcel.id, { polygon, parcel });
    });
    return () => { polygons.current.forEach(({ polygon }) => polygon.setMap(null)); polygons.current.clear(); };
  }, [ready, parcels]);

  useEffect(() => {
    if (!ready) return;
    polygons.current.forEach(({ polygon, parcel }) => {
      const selected = multiSelect ? selectedIds.has(parcel.id) : selectedId === parcel.id;
      const c = color(parcel);
      polygon.setOptions({ strokeColor: selected ? "#fff4b0" : c, strokeWeight: selected ? 2.5 : parcel.status === "sold" ? 2.5 : 1.1, fillOpacity: selected ? 0.17 : parcel.status === "sold" ? 0.08 : 0.02, zIndex: selected ? 501 : parcel.status === "sold" ? 500 : 21 });
    });
  }, [ready, selectedId, selectedIds, multiSelect]);

  useEffect(() => () => { animationCancel.current?.(); polygons.current.forEach(({ polygon }) => polygon.setMap(null)); polygons.current.clear(); focusOverlay.current?.setMap(null); map.current = null; }, []);

  return <div className="relative h-[500px] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] sm:h-[600px] lg:h-[670px]"><div ref={ref} className="absolute inset-0" aria-label="MySkyParcel parsel haritası" />{error && <div className="absolute inset-0 grid place-items-center bg-[#071a2d] p-6 text-center"><p className="max-w-xl text-xs leading-5 text-white/70">{error}</p></div>}</div>;
}
