import { useEffect, useRef, useState } from "react";
import type { Parcel } from "@/types/parcel";

type CityCenter = { lat: number; lng: number };
type ViewportBounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };
type FocusTarget = { city: CityCenter; parcel: CityCenter; token: string };
type GeoJsonPolygon = { type: "Polygon"; coordinates: number[][][] };
type GeoJsonMultiPolygon = { type: "MultiPolygon"; coordinates: number[][][][] };
type MapParcel = Parcel & { geometry?: GeoJsonPolygon | GeoJsonMultiPolygon | null };
type Props = { parcels: MapParcel[]; selectedId: string | null; selectedIds?: Set<string>; multiSelect?: boolean; onSelect: (id: string | null) => void; onToggleSelect?: (id: string) => void; onViewportChange?: (bounds: ViewportBounds) => void; center: CityCenter; focusTarget?: FocusTarget | null };
type Ring = Array<{ lat: number; lng: number }>;
type Camera = { lat: number; lng: number; zoom: number };

declare global { interface Window { google?: any; __myskyparcelGoogleMapsPromise?: Promise<any>; } }

const SCRIPT_ID = "myskyparcel-google-maps";
const TURKEY_CENTER = { lat: 39, lng: 35 };
const CITY_ZOOM = 11;
const FOCUS_ZOOM = 15;
const DEBOUNCE_MS = 250;
const EMPTY_SELECTED_IDS = new Set<string>();

function loadMaps(key: string): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("Google Maps yalnızca tarayıcıda yüklenebilir."));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (window.__myskyparcelGoogleMapsPromise) return window.__myskyparcelGoogleMapsPromise;
  window.__myskyparcelGoogleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const fail = () => { window.__myskyparcelGoogleMapsPromise = undefined; reject(new Error("Google Maps yüklenemedi. API anahtarı, Maps JavaScript API, billing ve domain kısıtlamalarını kontrol edin.")); };
    const finish = () => { if (window.google?.maps) resolve(window.google.maps); else fail(); };
    if (existing) { existing.addEventListener("load", finish, { once: true }); existing.addEventListener("error", fail, { once: true }); return; }
    const script = document.createElement("script");
    script.id = SCRIPT_ID; script.async = true; script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`;
    script.onload = finish; script.onerror = fail; document.head.appendChild(script);
  });
  return window.__myskyparcelGoogleMapsPromise;
}

function geometryToRings(geometry: MapParcel["geometry"]): Ring[][] {
  if (!geometry) return [];
  const convertRing = (source: number[][]): Ring => {
    const result: Ring = [];
    for (const point of source) {
      const lng = point[0]; const lat = point[1];
      if (typeof lng === "number" && Number.isFinite(lng) && typeof lat === "number" && Number.isFinite(lat)) result.push({ lat, lng });
    }
    return result;
  };
  if (geometry.type === "Polygon") {
    const rings = geometry.coordinates.map(convertRing).filter((ring) => ring.length >= 3);
    return rings.length ? [rings] : [];
  }
  return geometry.coordinates.map((polygon) => polygon.map(convertRing).filter((ring) => ring.length >= 3)).filter((polygon) => polygon.length > 0);
}

function fallbackParcelRings(center: CityCenter): Ring[][] {
  const dLat = 0.0012;
  const dLng = 0.0015 / Math.max(Math.cos((center.lat * Math.PI) / 180), 0.25);
  return [[
    [{ lat: center.lat - dLat, lng: center.lng - dLng }, { lat: center.lat - dLat, lng: center.lng + dLng }, { lat: center.lat + dLat, lng: center.lng + dLng }, { lat: center.lat + dLat, lng: center.lng - dLng }],
  ]];
}

function color(parcel: MapParcel) { if (parcel.status === "sold") return "#ff1744"; if (parcel.status === "reserved") return "#f6c453"; if (parcel.tier === "premium") return "#f6c453"; if (parcel.tier === "elite") return "#b77cff"; return "#55c9ff"; }
const ease = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function animateCamera(map: any, from: Camera, to: Camera, duration: number, maps: any) { let frame = 0; const start = performance.now(); const step = (now: number) => { const raw = Math.min(1, (now - start) / duration); const t = ease(raw); map.moveCamera({ center: new maps.LatLng(lerp(from.lat, to.lat, t), lerp(from.lng, to.lng, t)), zoom: lerp(from.zoom, to.zoom, t), tilt: 0, heading: 0 }); if (raw < 1) frame = requestAnimationFrame(step); }; frame = requestAnimationFrame(step); return () => cancelAnimationFrame(frame); }

export function FocusedGoogleParcelMap({ parcels, selectedId, selectedIds = EMPTY_SELECTED_IDS, multiSelect = false, onSelect, onToggleSelect, onViewportChange, center, focusTarget }: Props) {
  const container = useRef<HTMLDivElement | null>(null); const map = useRef<any>(null); const polygons = useRef<Map<string, any[]>>(new Map()); const animation = useRef<(() => void) | null>(null); const selectedIdRef = useRef(selectedId); const selectedIdsRef = useRef(selectedIds); const multiRef = useRef(multiSelect); const onSelectRef = useRef(onSelect); const onToggleRef = useRef(onToggleSelect); const parcelsRef = useRef(parcels); const [ready, setReady] = useState(false); const [error, setError] = useState<string | null>(null);
  useEffect(() => { selectedIdRef.current = selectedId; selectedIdsRef.current = selectedIds; multiRef.current = multiSelect; onSelectRef.current = onSelect; onToggleRef.current = onToggleSelect; parcelsRef.current = parcels; }, [selectedId, selectedIds, multiSelect, onSelect, onToggleSelect, parcels]);
  useEffect(() => { let cancelled = false; const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; if (!key) { setError("Google Maps API anahtarı eksik. GitHub Actions secret VITE_GOOGLE_MAPS_API_KEY kontrol edilmeli."); return; } loadMaps(key).then((maps) => { if (cancelled || !container.current) return; map.current ||= new maps.Map(container.current, { center: TURKEY_CENTER, zoom: 5, mapTypeId: "satellite", streetViewControl: false, fullscreenControl: false, mapTypeControl: false, gestureHandling: "greedy", clickableIcons: false, tilt: 0, heading: 0 }); setError(null); setReady(true); }).catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : "Google Maps yüklenemedi."); }); return () => { cancelled = true; }; }, []);
  useEffect(() => { if (!ready || !map.current) return; const maps = window.google?.maps; if (!maps) return; animation.current?.(); const current = map.current.getCenter?.(); const from: Camera = { lat: current?.lat?.() ?? TURKEY_CENTER.lat, lng: current?.lng?.() ?? TURKEY_CENTER.lng, zoom: map.current.getZoom?.() ?? 5 }; animation.current = animateCamera(map.current, from, { ...center, zoom: CITY_ZOOM }, 1800, maps); return () => { animation.current?.(); animation.current = null; }; }, [ready, center.lat, center.lng]);
  useEffect(() => { if (!ready || !map.current || !focusTarget) return; const maps = window.google?.maps; if (!maps) return; animation.current?.(); const current = map.current.getCenter?.(); const from: Camera = { lat: current?.lat?.() ?? TURKEY_CENTER.lat, lng: current?.lng?.() ?? TURKEY_CENTER.lng, zoom: map.current.getZoom?.() ?? 5 }; animation.current = animateCamera(map.current, from, { ...focusTarget.parcel, zoom: FOCUS_ZOOM }, 2200, maps); return () => { animation.current?.(); animation.current = null; }; }, [ready, focusTarget?.token]);
  useEffect(() => { if (!ready || !map.current || !onViewportChange) return; const maps = window.google?.maps; if (!maps) return; let timer: ReturnType<typeof setTimeout> | null = null; let last = ""; const emit = () => { const bounds = map.current?.getBounds?.(); if (!bounds) return; const ne = bounds.getNorthEast(); const sw = bounds.getSouthWest(); const next = { minLat: sw.lat(), minLng: sw.lng(), maxLat: ne.lat(), maxLng: ne.lng() }; const key = `${next.minLat.toFixed(5)},${next.minLng.toFixed(5)},${next.maxLat.toFixed(5)},${next.maxLng.toFixed(5)}`; if (key === last) return; last = key; onViewportChange(next); }; const listener = maps.event.addListener(map.current, "idle", () => { if (timer) clearTimeout(timer); timer = setTimeout(emit, DEBOUNCE_MS); }); timer = setTimeout(emit, DEBOUNCE_MS); return () => { maps.event.removeListener(listener); if (timer) clearTimeout(timer); }; }, [ready, onViewportChange]);
  useEffect(() => { if (!ready || !map.current) return; const maps = window.google?.maps; if (!maps) return; polygons.current.forEach((items) => items.forEach((polygon) => polygon.setMap(null))); polygons.current.clear(); parcelsRef.current.forEach((parcel) => { const ringsByPolygon = geometryToRings(parcel.geometry); const geometryParts: Ring[][] = ringsByPolygon.length ? ringsByPolygon : fallbackParcelRings({ lat: parcel.latitude, lng: parcel.longitude }); const selected = multiRef.current ? selectedIdsRef.current.has(parcel.id) : selectedIdRef.current === parcel.id; const handles: any[] = []; geometryParts.forEach((rings) => { const paths = rings.map((ring) => ring.map((point) => new maps.LatLng(point.lat, point.lng))); const polygon = new maps.Polygon({ map: map.current, paths, strokeColor: selected ? "#fff4b0" : color(parcel), strokeOpacity: 1, strokeWeight: selected ? 3 : parcel.status === "sold" ? 2.5 : 1.2, fillColor: color(parcel), fillOpacity: selected ? 0.18 : parcel.status === "sold" ? 0.12 : parcel.status === "reserved" ? 0.09 : 0.035, clickable: true, zIndex: selected ? 600 : 100 }); polygon.addListener("click", () => { if (multiRef.current && parcel.status === "available") onToggleRef.current?.(parcel.id); else onSelectRef.current(parcel.id); }); handles.push(polygon); }); polygons.current.set(parcel.id, handles); }); return () => { polygons.current.forEach((items) => items.forEach((polygon) => polygon.setMap(null))); polygons.current.clear(); }; }, [ready, parcels]);
  useEffect(() => { if (!ready) return; polygons.current.forEach((items, id) => { const parcel = parcelsRef.current.find((item) => item.id === id); if (!parcel) return; const selected = multiSelect ? selectedIds.has(id) : selectedId === id; items.forEach((polygon) => polygon.setOptions({ strokeColor: selected ? "#fff4b0" : color(parcel), strokeWeight: selected ? 3 : parcel.status === "sold" ? 2.5 : 1.2, fillOpacity: selected ? 0.18 : parcel.status === "sold" ? 0.12 : parcel.status === "reserved" ? 0.09 : 0.035, zIndex: selected ? 600 : 100 })); }); }, [ready, selectedId, selectedIds, multiSelect]);
  useEffect(() => () => { animation.current?.(); polygons.current.forEach((items) => items.forEach((polygon) => polygon.setMap(null))); polygons.current.clear(); map.current = null; }, []);
  return <div className="relative h-[500px] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] sm:h-[600px] lg:h-[670px]"><div ref={container} className="absolute inset-0" aria-label="MySkyParcel parsel haritası" />{error && <div className="absolute inset-0 grid place-items-center bg-[#071a2d] p-6 text-center"><p className="max-w-xl text-xs leading-5 text-white/70">{error}</p></div>}</div>;
}
