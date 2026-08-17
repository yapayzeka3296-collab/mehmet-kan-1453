import { useEffect, useRef, useState } from "react";
import type { Parcel } from "@/types/parcel";

type CityCenter = { lat: number; lng: number };
type ViewportBounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };
type FocusTarget = { city: CityCenter; parcel: CityCenter; token: string };
type Props = { parcels: Parcel[]; selectedId: string | null; selectedIds?: Set<string>; multiSelect?: boolean; onSelect: (id: string | null) => void; onToggleSelect?: (id: string) => void; onViewportChange?: (bounds: ViewportBounds) => void; center: CityCenter; focusTarget?: FocusTarget | null };
type Camera = { lat: number; lng: number; zoom: number };

type ParcelPolygon = { polygon: any; parcel: Parcel };

const SCRIPT_ID = "myskyparcel-google-maps";
let mapsPromise: Promise<any> | null = null;
const TURKEY_CENTER = { lat: 39, lng: 35 };
const INITIAL_ISTANBUL_ZOOM = 9.5;
const PARCEL_OVERVIEW_ZOOM = 11;

function loadMaps(key: string) {
  if (typeof window === "undefined") return Promise.reject(new Error("browser"));
  if ((window as any).google?.maps) return Promise.resolve((window as any).google.maps);
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const finish = () => ((window as any).google?.maps ? resolve((window as any).google.maps) : reject(new Error("Google Maps yüklenemedi.")));
    if (existing) { existing.addEventListener("load", finish, { once: true }); existing.addEventListener("error", () => reject(new Error("Google Maps yüklenemedi.")), { once: true }); return; }
    const s = document.createElement("script"); s.id = SCRIPT_ID; s.async = true; s.defer = true; s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`; s.onload = finish; s.onerror = () => reject(new Error("Google Maps yüklenemedi.")); document.head.appendChild(s);
  });
  return mapsPromise;
}

const color = (p: Parcel) => p.status === "sold" ? "#ff1744" : p.tier === "premium" ? "#f6c453" : p.tier === "elite" ? "#b77cff" : "#55c9ff";
function grid(center: CityCenter, total: number, inner: number, outer: number) { if (!total) return []; const cos = Math.max(Math.cos(center.lat * Math.PI / 180), .2); let n = Math.max(2, Math.ceil(Math.sqrt(total))); const make = () => { const size = outer * 2 / n; const ratio = inner / outer; const a: any[] = []; for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { const x0 = -outer + c * size, y0 = -outer + r * size, x1 = x0 + size, y1 = y0 + size; const cx = (x0 + x1) / 2 / outer, cy = (y0 + y1) / 2 / outer; if (Math.max(Math.abs(cx), Math.abs(cy)) >= ratio) a.push({ x0, y0, x1, y1 }); } return a; }; let a = make(); while (a.length < total) { n++; a = make(); } const point = (x: number, y: number) => ({ lat: center.lat + y, lng: center.lng + x / cos }); return a.slice(0, total).map(x => ({ path: [point(x.x0, x.y0), point(x.x1, x.y0), point(x.x1, x.y1), point(x.x0, x.y1)] })); }
function focusParcelShape(center: CityCenter) { const dLat = 0.0042; const dLng = 0.0055 / Math.max(Math.cos(center.lat * Math.PI / 180), 0.25); return [{ lat: center.lat - dLat, lng: center.lng - dLng }, { lat: center.lat - dLat, lng: center.lng + dLng }, { lat: center.lat + dLat, lng: center.lng + dLng }, { lat: center.lat + dLat, lng: center.lng - dLng }]; }
const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function animateCamera(map: any, from: Camera, to: Camera, duration: number, maps: any, onDone?: () => void) { let frame = 0; const started = performance.now(); const step = (now: number) => { const raw = Math.min(1, (now - started) / duration); const t = easeInOut(raw); map.moveCamera({ center: new maps.LatLng(lerp(from.lat, to.lat, t), lerp(from.lng, to.lng, t)), zoom: lerp(from.zoom, to.zoom, t), tilt: 0, heading: 0 }); if (raw < 1) frame = requestAnimationFrame(step); else onDone?.(); }; frame = requestAnimationFrame(step); return () => cancelAnimationFrame(frame); }

export function FocusedGoogleParcelMap({ parcels, selectedId, selectedIds = new Set(), multiSelect = false, onSelect, onToggleSelect, onViewportChange, center, focusTarget }: Props) {
  const ref = useRef<HTMLDivElement | null>(null); const map = useRef<any>(null); const focused = useRef<string | null>(null); const focusOverlay = useRef<any>(null); const animationCancel = useRef<(() => void) | null>(null); const lastCityCenter = useRef<CityCenter | null>(null); const hasInitialAnimation = useRef(false); const polygons = useRef<Map<string, ParcelPolygon>>(new Map()); const selectedIdRef = useRef(selectedId); const selectedIdsRef = useRef(selectedIds); const multiSelectRef = useRef(multiSelect); const onSelectRef = useRef(onSelect); const onToggleSelectRef = useRef(onToggleSelect); const [error, setError] = useState<string | null>(null); const [ready, setReady] = useState(false);

  useEffect(() => { selectedIdRef.current = selectedId; selectedIdsRef.current = selectedIds; multiSelectRef.current = multiSelect; onSelectRef.current = onSelect; onToggleSelectRef.current = onToggleSelect; }, [selectedId, selectedIds, multiSelect, onSelect, onToggleSelect]);

  useEffect(() => { const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY; if (!key) { setError("Google Maps API anahtarı eksik."); return; } loadMaps(key).then((maps) => { if (!ref.current) return; map.current ||= new maps.Map(ref.current, { center: TURKEY_CENTER, zoom: 5, mapTypeId: "satellite", streetViewControl: false, fullscreenControl: false, mapTypeControl: false, gestureHandling: "greedy", clickableIcons: false, tilt: 0, heading: 0 }); setReady(true); }).catch(e => setError(e.message)); }, []);
  useEffect(() => { if (!ready || !map.current || hasInitialAnimation.current || focusTarget) return; hasInitialAnimation.current = true; lastCityCenter.current = center; const maps = (window as any).google.maps; animationCancel.current?.(); const turkey: Camera = { ...TURKEY_CENTER, zoom: 5 }; const istanbul: Camera = { ...center, zoom: INITIAL_ISTANBUL_ZOOM }; map.current.moveCamera({ center: new maps.LatLng(turkey.lat, turkey.lng), zoom: turkey.zoom, tilt: 0, heading: 0 }); animationCancel.current = animateCamera(map.current, turkey, istanbul, 8000, maps); return () => { animationCancel.current?.(); animationCancel.current = null; }; }, [ready, center.lat, center.lng, focusTarget]);
  useEffect(() => { if (!ready || !map.current) return; if (!lastCityCenter.current) { lastCityCenter.current = center; return; } const previous = lastCityCenter.current; if (previous.lat === center.lat && previous.lng === center.lng) return; lastCityCenter.current = center; if (focusTarget) return; const maps = (window as any).google.maps; animationCancel.current?.(); const current = map.current.getCenter(); const from: Camera = { lat: current?.lat?.() ?? TURKEY_CENTER.lat, lng: current?.lng?.() ?? TURKEY_CENTER.lng, zoom: map.current.getZoom?.() ?? 5 }; const to: Camera = { lat: center.lat, lng: center.lng, zoom: INITIAL_ISTANBUL_ZOOM }; animationCancel.current = animateCamera(map.current, from, to, 7000, maps); return () => { animationCancel.current?.(); animationCancel.current = null; }; }, [ready, center.lat, center.lng, focusTarget]);
  useEffect(() => { if (!ready || !map.current || !focusTarget || focused.current === focusTarget.token) return; focused.current = focusTarget.token; const maps = (window as any).google.maps; animationCancel.current?.(); if (focusOverlay.current) { focusOverlay.current.setMap(null); focusOverlay.current = null; } const turkey: Camera = { ...TURKEY_CENTER, zoom: 5 }; map.current.moveCamera({ center: turkey, zoom: turkey.zoom, tilt: 0, heading: 0 }); const cityCamera: Camera = { ...focusTarget.city, zoom: INITIAL_ISTANBUL_ZOOM }; animationCancel.current = animateCamera(map.current, turkey, cityCamera, 8000, maps, () => { const parcelCamera: Camera = { ...focusTarget.parcel, zoom: PARCEL_OVERVIEW_ZOOM }; animationCancel.current = animateCamera(map.current, cityCamera, parcelCamera, 5500, maps, () => { focusOverlay.current = new maps.Polygon({ map: map.current, paths: focusParcelShape(focusTarget.parcel), strokeColor: "#ff1744", strokeOpacity: 1, strokeWeight: 3, fillColor: "#ff1744", fillOpacity: .38, clickable: true, zIndex: 1000 }); const focusParcelId = focusTarget.token.split(":")[0]; if (focusParcelId) focusOverlay.current.addListener("click", () => onSelectRef.current(focusParcelId)); }); }); return () => { animationCancel.current?.(); animationCancel.current = null; }; }, [ready, focusTarget]);
  useEffect(() => { if (!ready || !map.current || !onViewportChange) return; const maps = (window as any).google.maps; let timer: ReturnType<typeof setTimeout> | null = null; const emit = () => { const b = map.current.getBounds(); if (!b) return; const ne = b.getNorthEast(), sw = b.getSouthWest(); onViewportChange({ minLat: sw.lat(), minLng: sw.lng(), maxLat: ne.lat(), maxLng: ne.lng() }); }; const l = maps.event.addListener(map.current, "idle", () => { timer = setTimeout(emit, 100); }); emit(); return () => { maps.event.removeListener(l); if (timer) clearTimeout(timer); }; }, [ready, onViewportChange]);

  // Build map polygons only when the parcel dataset/city changes. Selection changes update
  // existing polygons instead of destroying and recreating every polygon on the map.
  useEffect(() => {
    if (!ready || !map.current) return;
    const maps = (window as any).google.maps;
    polygons.current.forEach(({ polygon }) => polygon.setMap(null));
    polygons.current.clear();

    const configs: any[] = [["digital", .095, .165], ["elite", .05, .08], ["premium", .012, .035]];
    configs.forEach(([tier, inner, outer]) => {
      const ps = parcels.filter(p => p.tier === tier);
      const cells = grid(center, ps.length, inner, outer);
      ps.forEach((p, i) => {
        const cell = cells[i];
        if (!cell) return;
        const paths = cell.path.map((x: any) => new maps.LatLng(x.lat, x.lng));
        const c = color(p);
        const selected = multiSelect ? selectedIds.has(p.id) : selectedId === p.id;
        const polygon = new maps.Polygon({ map: map.current, paths, strokeColor: selected ? "#fff4b0" : c, strokeOpacity: 1, strokeWeight: selected ? 2.5 : p.status === "sold" ? 2.5 : 1.1, fillColor: c, fillOpacity: selected ? .17 : p.status === "sold" ? .08 : .008, clickable: true, zIndex: selected ? 501 : p.status === "sold" ? 500 : 21 });
        polygon.addListener("click", () => {
          if (multiSelectRef.current && p.status === "available") onToggleSelectRef.current?.(p.id);
          else onSelectRef.current(p.id);
        });
        polygons.current.set(p.id, { polygon, parcel: p });
      });
    });

    return () => {
      polygons.current.forEach(({ polygon }) => polygon.setMap(null));
      polygons.current.clear();
    };
  }, [ready, parcels, center.lat, center.lng]);

  // Selection/filter changes now only update the existing Google Maps polygons.
  useEffect(() => {
    if (!ready || !map.current) return;
    const currentSelectedId = selectedId;
    polygons.current.forEach(({ polygon, parcel }) => {
      const selected = multiSelect ? selectedIds.has(parcel.id) : currentSelectedId === parcel.id;
      const c = color(parcel);
      polygon.setOptions({ strokeColor: selected ? "#fff4b0" : c, strokeWeight: selected ? 2.5 : parcel.status === "sold" ? 2.5 : 1.1, fillOpacity: selected ? .17 : parcel.status === "sold" ? .08 : .008, zIndex: selected ? 501 : parcel.status === "sold" ? 500 : 21 });
    });
  }, [ready, selectedId, selectedIds, multiSelect]);

  useEffect(() => () => { animationCancel.current?.(); polygons.current.forEach(({ polygon }) => polygon.setMap(null)); polygons.current.clear(); if (focusOverlay.current) focusOverlay.current.setMap(null); map.current = null; }, []);
  return <div className="relative h-[500px] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] sm:h-[600px] lg:h-[670px]"><div ref={ref} className="absolute inset-0" aria-label="MySkyParcel parsel haritası" />{error && <div className="absolute inset-0 grid place-items-center bg-[#071a2d] p-6 text-center"><p className="text-xs text-white/70">{error}</p></div>}</div>;
}
