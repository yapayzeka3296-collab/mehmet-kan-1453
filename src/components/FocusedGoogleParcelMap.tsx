import { useEffect, useRef, useState } from "react";
import type { Parcel } from "@/types/parcel";

type CityCenter = { lat: number; lng: number };
type ViewportBounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };
type FocusTarget = { city: CityCenter; parcel: CityCenter; token: string };
type MapParcel = Parcel & { geometry?: unknown };
type Props = {
  parcels: MapParcel[];
  selectedId: string | null;
  selectedIds?: Set<string>;
  multiSelect?: boolean;
  onSelect: (id: string | null) => void;
  onToggleSelect?: (id: string) => void;
  onViewportChange?: (bounds: ViewportBounds) => void;
  center: CityCenter;
  focusTarget?: FocusTarget | null;
};
type Camera = { lat: number; lng: number; zoom: number };

declare global {
  interface Window {
    google?: any;
    __myskyparcelGoogleMapsPromise?: Promise<any>;
  }
}

const SCRIPT_ID = "myskyparcel-google-maps";
const TURKEY_CENTER = { lat: 39, lng: 35 };
const TURKEY_ZOOM = 5;
const CITY_ZOOM = 11;
const FOCUS_ZOOM = 16;
const DEBOUNCE_MS = 180;
const EMPTY_SELECTED_IDS = new Set<string>();
const NEON_CORE = "#eafaff";
const NEON_GLOW = "#5de2ff";
const SELECTED_CORE = "#fff4b0";
const SELECTED_GLOW = "#ffd35c";

function loadMaps(key: string): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("Google Maps yalnızca tarayıcıda yüklenebilir."));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (window.__myskyparcelGoogleMapsPromise) return window.__myskyparcelGoogleMapsPromise;

  window.__myskyparcelGoogleMapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const fail = () => {
      window.__myskyparcelGoogleMapsPromise = undefined;
      reject(new Error("Google Maps yüklenemedi. API anahtarı, Maps JavaScript API, billing ve domain kısıtlamalarını kontrol edin."));
    };
    const finish = () => (window.google?.maps ? resolve(window.google.maps) : fail());
    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", fail, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`;
    script.onload = finish;
    script.onerror = fail;
    document.head.appendChild(script);
  });
  return window.__myskyparcelGoogleMapsPromise;
}

function parcelColor(parcel: MapParcel) {
  if (parcel.status === "sold") return "#ff1744";
  if (parcel.status === "reserved") return "#f6c453";
  if (parcel.tier === "premium") return "#f6c453";
  if (parcel.tier === "elite") return "#b77cff";
  return "#55c9ff";
}

function animateCamera(map: any, from: Camera, to: Camera, duration: number, maps: any) {
  const start = performance.now();
  let frame = 0;
  const ease = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const step = (now: number) => {
    const raw = Math.min(1, (now - start) / duration);
    const t = ease(raw);
    map.moveCamera({
      center: new maps.LatLng(from.lat + (to.lat - from.lat) * t, from.lng + (to.lng - from.lng) * t),
      zoom: from.zoom + (to.zoom - from.zoom) * t,
      tilt: 0,
      heading: 0,
    });
    if (raw < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}

function distanceInLatitudeDegrees(a: MapParcel, b: MapParcel) {
  const lat = Number(a.latitude);
  const lng = Number(a.longitude);
  const lat2 = Number(b.latitude);
  const lng2 = Number(b.longitude);
  const cos = Math.max(Math.cos((lat * Math.PI) / 180), 0.25);
  const dx = (lng2 - lng) * cos;
  const dy = lat2 - lat;
  return Math.hypot(dx, dy);
}

function estimateGridCellSize(parcels: MapParcel[]) {
  const sample = parcels.filter((p) => Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude))).slice(0, 180);
  if (sample.length < 2) return 0.0012;
  const nearest: number[] = [];
  for (let i = 0; i < sample.length; i += 1) {
    let best = Number.POSITIVE_INFINITY;
    for (let j = 0; j < sample.length; j += 1) {
      if (i === j) continue;
      best = Math.min(best, distanceInLatitudeDegrees(sample[i]!, sample[j]!));
    }
    if (Number.isFinite(best)) nearest.push(best);
  }
  nearest.sort((a, b) => a - b);
  const median = nearest[Math.floor(nearest.length / 2)] ?? 0.0012;
  return Math.min(0.003, Math.max(0.00025, median * 0.82));
}

function squarePath(parcel: MapParcel, halfLat: number, maps: any) {
  const lat = Number(parcel.latitude);
  const lng = Number(parcel.longitude);
  const cos = Math.max(Math.cos((lat * Math.PI) / 180), 0.25);
  const halfLng = halfLat / cos;
  return [
    new maps.LatLng(lat - halfLat, lng - halfLng),
    new maps.LatLng(lat - halfLat, lng + halfLng),
    new maps.LatLng(lat + halfLat, lng + halfLng),
    new maps.LatLng(lat + halfLat, lng - halfLng),
  ];
}

export function FocusedGoogleParcelMap({
  parcels,
  selectedId,
  selectedIds = EMPTY_SELECTED_IDS,
  multiSelect = false,
  onSelect,
  onToggleSelect,
  onViewportChange,
  center,
  focusTarget,
}: Props) {
  const container = useRef<HTMLDivElement | null>(null);
  const map = useRef<any>(null);
  const overlays = useRef<Map<string, { glow: any; main: any }>>(new Map());
  const animation = useRef<(() => void) | null>(null);
  const selectedIdRef = useRef(selectedId);
  const selectedIdsRef = useRef(selectedIds);
  const multiRef = useRef(multiSelect);
  const onSelectRef = useRef(onSelect);
  const onToggleRef = useRef(onToggleSelect);
  const parcelsRef = useRef(parcels);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    selectedIdsRef.current = selectedIds;
    multiRef.current = multiSelect;
    onSelectRef.current = onSelect;
    onToggleRef.current = onToggleSelect;
    parcelsRef.current = parcels;
  }, [selectedId, selectedIds, multiSelect, onSelect, onToggleSelect, parcels]);

  useEffect(() => {
    let cancelled = false;
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) {
      setError("Google Maps API anahtarı eksik. GitHub Actions secret VITE_GOOGLE_MAPS_API_KEY kontrol edilmeli.");
      return;
    }
    loadMaps(key).then((maps) => {
      if (cancelled || !container.current) return;
      if (!map.current) {
        map.current = new maps.Map(container.current, {
          center: TURKEY_CENTER,
          zoom: TURKEY_ZOOM,
          mapTypeId: "satellite",
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
          gestureHandling: "greedy",
          clickableIcons: false,
          tilt: 0,
          heading: 0,
          backgroundColor: "#071a2d",
        });
      }
      setError(null);
      setReady(true);
    }).catch((cause) => {
      if (!cancelled) setError(cause instanceof Error ? cause.message : "Google Maps yüklenemedi.");
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || !map.current) return;
    const maps = window.google?.maps;
    if (!maps) return;
    animation.current?.();
    const current = map.current.getCenter?.();
    const from: Camera = {
      lat: current?.lat?.() ?? TURKEY_CENTER.lat,
      lng: current?.lng?.() ?? TURKEY_CENTER.lng,
      zoom: map.current.getZoom?.() ?? TURKEY_ZOOM,
    };
    animation.current = animateCamera(map.current, from, { ...center, zoom: CITY_ZOOM }, 1500, maps);
    return () => animation.current?.();
  }, [ready, center.lat, center.lng]);

  useEffect(() => {
    if (!ready || !map.current || !focusTarget) return;
    const maps = window.google?.maps;
    if (!maps) return;
    animation.current?.();
    const current = map.current.getCenter?.();
    const from: Camera = {
      lat: current?.lat?.() ?? center.lat,
      lng: current?.lng?.() ?? center.lng,
      zoom: map.current.getZoom?.() ?? CITY_ZOOM,
    };
    animation.current = animateCamera(map.current, from, { ...focusTarget.parcel, zoom: FOCUS_ZOOM }, 1900, maps);
    return () => animation.current?.();
  }, [ready, focusTarget?.token]);

  useEffect(() => {
    if (!ready || !map.current || !onViewportChange) return;
    const maps = window.google?.maps;
    if (!maps) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let last = "";
    const emit = () => {
      const bounds = map.current?.getBounds?.();
      if (!bounds) return;
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const next = { minLat: sw.lat(), minLng: sw.lng(), maxLat: ne.lat(), maxLng: ne.lng() };
      const key = `${next.minLat.toFixed(5)},${next.minLng.toFixed(5)},${next.maxLat.toFixed(5)},${next.maxLng.toFixed(5)}`;
      if (key === last) return;
      last = key;
      onViewportChange(next);
    };
    const listener = maps.event.addListener(map.current, "idle", () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(emit, DEBOUNCE_MS);
    });
    timer = setTimeout(emit, DEBOUNCE_MS);
    return () => {
      maps.event.removeListener(listener);
      if (timer) clearTimeout(timer);
    };
  }, [ready, onViewportChange]);

  useEffect(() => {
    if (!ready || !map.current) return;
    const maps = window.google?.maps;
    if (!maps) return;
    overlays.current.forEach(({ glow, main }) => { glow.setMap(null); main.setMap(null); });
    overlays.current.clear();

    const validParcels = parcels.filter((parcel) => Number.isFinite(Number(parcel.latitude)) && Number.isFinite(Number(parcel.longitude)));
    const halfLat = estimateGridCellSize(validParcels) / 2;

    validParcels.forEach((parcel) => {
      const selected = multiRef.current ? selectedIdsRef.current.has(parcel.id) : selectedIdRef.current === parcel.id;
      const base = parcelColor(parcel);
      const glowColor = selected ? SELECTED_GLOW : (parcel.status === "sold" || parcel.status === "reserved" ? base : NEON_GLOW);
      const coreColor = selected ? SELECTED_CORE : (parcel.status === "sold" || parcel.status === "reserved" ? base : NEON_CORE);
      const path = squarePath(parcel, halfLat, maps);
      const glow = new maps.Polygon({ map: map.current, paths: path, geodesic: false, strokeColor: glowColor, strokeOpacity: selected ? 0.55 : 0.2, strokeWeight: selected ? 7 : 4.5, fillColor: base, fillOpacity: selected ? 0.12 : parcel.status === "sold" ? 0.08 : 0.008, clickable: false, zIndex: selected ? 300 : 20 });
      const main = new maps.Polygon({ map: map.current, paths: path, geodesic: false, strokeColor: coreColor, strokeOpacity: selected ? 1 : 0.82, strokeWeight: selected ? 1.9 : parcel.status === "sold" ? 2.5 : 1.1, fillColor: base, fillOpacity: selected ? 0.17 : parcel.status === "sold" ? 0.1 : parcel.status === "reserved" ? 0.07 : 0.012, clickable: true, zIndex: selected ? 301 : 21 });
      main.addListener("click", () => {
        if (multiRef.current && parcel.status === "available") onToggleRef.current?.(parcel.id);
        else onSelectRef.current(parcel.id);
      });
      main.addListener("mouseover", () => main.setOptions({ strokeColor: selected ? SELECTED_CORE : "#ffffff", strokeOpacity: 0.98, strokeWeight: selected ? 2.3 : 1.7, fillOpacity: selected ? 0.2 : 0.04, zIndex: 400 }));
      main.addListener("mouseout", () => {
        const active = multiRef.current ? selectedIdsRef.current.has(parcel.id) : selectedIdRef.current === parcel.id;
        main.setOptions({ strokeColor: active ? SELECTED_CORE : coreColor, strokeOpacity: active ? 1 : 0.82, strokeWeight: active ? 1.9 : parcel.status === "sold" ? 2.5 : 1.1, fillOpacity: active ? 0.17 : parcel.status === "sold" ? 0.1 : parcel.status === "reserved" ? 0.07 : 0.012, zIndex: active ? 301 : 21 });
      });
      overlays.current.set(parcel.id, { glow, main });
    });

    return () => {
      overlays.current.forEach(({ glow, main }) => { glow.setMap(null); main.setMap(null); });
      overlays.current.clear();
    };
  }, [ready, parcels]);

  useEffect(() => {
    if (!ready) return;
    overlays.current.forEach(({ glow, main }, id) => {
      const parcel = parcelsRef.current.find((item) => item.id === id);
      if (!parcel) return;
      const selected = multiSelect ? selectedIds.has(id) : selectedId === id;
      const base = parcelColor(parcel);
      main.setOptions({ strokeColor: selected ? SELECTED_CORE : (parcel.status === "sold" || parcel.status === "reserved" ? base : NEON_CORE), strokeOpacity: selected ? 1 : 0.82, strokeWeight: selected ? 1.9 : parcel.status === "sold" ? 2.5 : 1.1, fillColor: base, fillOpacity: selected ? 0.17 : parcel.status === "sold" ? 0.1 : parcel.status === "reserved" ? 0.07 : 0.012, zIndex: selected ? 301 : 21 });
      glow.setOptions({ strokeColor: selected ? SELECTED_GLOW : (parcel.status === "sold" || parcel.status === "reserved" ? base : NEON_GLOW), strokeOpacity: selected ? 0.55 : 0.2, strokeWeight: selected ? 7 : 4.5, fillColor: base, fillOpacity: selected ? 0.12 : parcel.status === "sold" ? 0.08 : 0.008, zIndex: selected ? 300 : 20 });
    });
  }, [ready, selectedId, selectedIds, multiSelect]);

  useEffect(() => () => {
    animation.current?.();
    overlays.current.forEach(({ glow, main }) => { glow.setMap(null); main.setMap(null); });
    overlays.current.clear();
    map.current = null;
  }, []);

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] sm:h-[600px] lg:h-[670px]">
      <div ref={container} className="absolute inset-0" aria-label="MySkyParcel Türkiye dijital gökyüzü parsel haritası" />
      <div className="pointer-events-none absolute left-3 top-3 rounded-xl border border-cyan-200/20 bg-slate-950/70 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100/80 backdrop-blur-sm">Türkiye • Dijital Gökyüzü Parselleri</div>
      {error && <div className="absolute inset-0 grid place-items-center bg-[#071a2d] p-6 text-center"><p className="max-w-xl text-xs leading-5 text-white/70">{error}</p></div>}
    </div>
  );
}
