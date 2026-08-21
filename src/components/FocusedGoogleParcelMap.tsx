import { useEffect, useRef, useState } from "react";
import type { Parcel } from "@/types/parcel";

type CityCenter = { lat: number; lng: number };
type ViewportBounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };
type FocusTarget = { city: CityCenter; parcel: CityCenter; token: string };
type GeoJsonPolygon = { type: "Polygon"; coordinates: number[][][] };
type GeoJsonMultiPolygon = { type: "MultiPolygon"; coordinates: number[][][][] };
type MapParcel = Parcel & {
  geometry?: GeoJsonPolygon | GeoJsonMultiPolygon | null;
  layer_number?: number | null;
  sector_number?: number | null;
  local_parcel_number?: number | null;
  city_slug?: string | null;
};
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
type PolygonHandle = { polygon: any; parcelId: string };
type Ring = Array<{ lat: number; lng: number }>;

declare global {
  interface Window {
    __myskyparcelGoogleMapsPromise?: Promise<any>;
  }
}

const SCRIPT_ID = "myskyparcel-google-maps";
const EMPTY_SELECTED_IDS = new Set<string>();
const TURKEY_CENTER = { lat: 39, lng: 35 };
const CITY_ZOOM = 11;
const FOCUS_ZOOM = 15;
const VIEWPORT_DEBOUNCE_MS = 250;

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
    const finish = () => {
      if (window.google?.maps) resolve(window.google.maps);
      else fail();
    };

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

const parcelColor = (parcel: MapParcel) => {
  if (parcel.status === "sold") return "#ff1744";
  if (parcel.status === "reserved") return "#f6c453";
  if (parcel.tier === "premium") return "#f6c453";
  if (parcel.tier === "elite") return "#b77cff";
  return "#55c9ff";
};

function geometryToRings(geometry: MapParcel["geometry"]): Ring[][] {
  if (!geometry) return [];
  const convertRing = (ring: number[][]): Ring => ring
    .filter((point) => Number.isFinite(point?.[0]) && Number.isFinite(point?.[1]))
    .map(([lng, lat]) => ({ lat, lng }));

  if (geometry.type === "Polygon") {
    const rings = geometry.coordinates.map(convertRing).filter((ring) => ring.length >= 3);
    return rings.length ? [rings] : [];
  }

  return geometry.coordinates
    .map((polygon) => polygon.map(convertRing).filter((ring) => ring.length >= 3))
    .filter((polygon) => polygon.length > 0);
}

function fallbackParcelRing(center: CityCenter): Ring {
  const dLat = 0.0012;
  const dLng = 0.0015 / Math.max(Math.cos((center.lat * Math.PI) / 180), 0.25);
  return [
    { lat: center.lat - dLat, lng: center.lng - dLng },
    { lat: center.lat - dLat, lng: center.lng + dLng },
    { lat: center.lat + dLat, lng: center.lng + dLng },
    { lat: center.lat + dLat, lng: center.lng - dLng },
  ];
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function animateCamera(map: any, from: Camera, to: Camera, duration: number, maps: any, onDone?: () => void) {
  let frame = 0;
  const started = performance.now();
  const step = (now: number) => {
    const raw = Math.min(1, (now - started) / duration);
    const t = easeInOut(raw);
    map.moveCamera({
      center: new maps.LatLng(lerp(from.lat, to.lat, t), lerp(from.lng, to.lng, t)),
      zoom: lerp(from.zoom, to.zoom, t),
      tilt: 0,
      heading: 0,
    });
    if (raw < 1) frame = requestAnimationFrame(step);
    else onDone?.();
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
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
  const ref = useRef<HTMLDivElement | null>(null);
  const map = useRef<any>(null);
  const animationCancel = useRef<(() => void) | null>(null);
  const lastCityCenter = useRef<CityCenter | null>(null);
  const hasInitialAnimation = useRef(false);
  const polygons = useRef<Map<string, PolygonHandle[]>>(new Map());
  const selectedIdRef = useRef(selectedId);
  const selectedIdsRef = useRef(selectedIds);
  const multiSelectRef = useRef(multiSelect);
  const onSelectRef = useRef(onSelect);
  const onToggleSelectRef = useRef(onToggleSelect);
  const parcelsRef = useRef(parcels);
  const focusTargetRef = useRef(focusTarget);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
  useEffect(() => { selectedIdsRef.current = selectedIds; }, [selectedIds]);
  useEffect(() => { multiSelectRef.current = multiSelect; }, [multiSelect]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { onToggleSelectRef.current = onToggleSelect; }, [onToggleSelect]);
  useEffect(() => { parcelsRef.current = parcels; }, [parcels]);
  useEffect(() => { focusTargetRef.current = focusTarget; }, [focusTarget]);

  useEffect(() => {
    let cancelled = false;
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) {
      setError("Google Maps API anahtarı eksik. Netlen production build ortamında VITE_GOOGLE_MAPS_API_KEY tanımlanmalı.");
      return;
    }
    loadMaps(key).then((maps) => {
      if (cancelled || !ref.current) return;
      if (!map.current) {
        map.current = new maps.Map(ref.current, {
          center: TURKEY_CENTER,
          zoom: 5,
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
    }).catch((err) => {
      console.error("MySkyParcel Google Maps error", err);
      if (!cancelled) setError(err instanceof Error ? err.message : "Google Maps yüklenemedi.");
    });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || !map.current || hasInitialAnimation.current || focusTarget) return;
    hasInitialAnimation.current = true;
    lastCityCenter.current = center;
    const maps = (window as any).google.maps;
    animationCancel.current?.();
    const from: Camera = { ...TURKEY_CENTER, zoom: 5 };
    const to: Camera = { ...center, zoom: CITY_ZOOM };
    map.current.moveCamera({ center: new maps.LatLng(from.lat, from.lng), zoom: from.zoom, tilt: 0, heading: 0 });
    animationCancel.current = animateCamera(map.current, from, to, 4500, maps);
    return () => { animationCancel.current?.(); animationCancel.current = null; };
  }, [ready, center.lat, center.lng, focusTarget]);

  useEffect(() => {
    if (!ready || !map.current || !lastCityCenter.current) return;
    const previous = lastCityCenter.current;
    if (previous.lat === center.lat && previous.lng === center.lng) return;
    lastCityCenter.current = center;
    if (focusTarget) return;
    const maps = (window as any).google.maps;
    animationCancel.current?.();
    const current = map.current.getCenter();
    const from: Camera = {
      lat: current?.lat?.() ?? TURKEY_CENTER.lat,
      lng: current?.lng?.() ?? TURKEY_CENTER.lng,
      zoom: map.current.getZoom?.() ?? 5,
    };
    const to: Camera = { ...center, zoom: CITY_ZOOM };
    animationCancel.current = animateCamera(map.current, from, to, 2200, maps);
    return () => { animationCancel.current?.(); animationCancel.current = null; };
  }, [ready, center.lat, center.lng, focusTarget]);

  useEffect(() => {
    if (!ready || !map.current || !focusTarget) return;
    const maps = (window as any).google.maps;
    const target = focusTarget;
    animationCancel.current?.();
    const current = map.current.getCenter();
    const from: Camera = {
      lat: current?.lat?.() ?? TURKEY_CENTER.lat,
      lng: current?.lng?.() ?? TURKEY_CENTER.lng,
      zoom: map.current.getZoom?.() ?? 5,
    };
    const cityCamera: Camera = { ...target.city, zoom: CITY_ZOOM };
    const parcelCamera: Camera = { ...target.parcel, zoom: FOCUS_ZOOM };
    animationCancel.current = animateCamera(map.current, from, cityCamera, 2200, maps, () => {
      animationCancel.current = animateCamera(map.current, cityCamera, parcelCamera, 1800, maps);
    });
    return () => { animationCancel.current?.(); animationCancel.current = null; };
  }, [ready, focusTarget?.token]);

  useEffect(() => {
    if (!ready || !map.current || !onViewportChange) return;
    const maps = (window as any).google.maps;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let lastKey = "";
    const emit = () => {
      const bounds = map.current?.getBounds();
      if (!bounds) return;
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const next = {
        minLat: sw.lat(),
        minLng: sw.lng(),
        maxLat: ne.lat(),
        maxLng: ne.lng(),
      };
      const key = [next.minLat, next.minLng, next.maxLat, next.maxLng].map((value) => value.toFixed(5)).join(",");
      if (key === lastKey) return;
      lastKey = key;
      onViewportChange(next);
    };
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(emit, VIEWPORT_DEBOUNCE_MS);
    };
    const listener = maps.event.addListener(map.current, "idle", schedule);
    schedule();
    return () => {
      maps.event.removeListener(listener);
      if (timer) clearTimeout(timer);
    };
  }, [ready, onViewportChange]);

  useEffect(() => {
    if (!ready || !map.current) return;
    const maps = (window as any).google.maps;
    polygons.current.forEach((items) => items.forEach(({ polygon }) => polygon.setMap(null)));
    polygons.current.clear();

    parcelsRef.current.forEach((parcel) => {
      const ringsByPolygon = geometryToRings(parcel.geometry);
      const geometryParts = ringsByPolygon.length ? ringsByPolygon : [fallbackParcelRing({ lat: parcel.latitude, lng: parcel.longitude }).map((point) => point)];
      const color = parcelColor(parcel);
      const handles: PolygonHandle[] = [];
      const selected = multiSelectRef.current ? selectedIdsRef.current.has(parcel.id) : selectedIdRef.current === parcel.id;

      geometryParts.forEach((rings) => {
        const paths = rings.map((ring) => ring.map((point) => new maps.LatLng(point.lat, point.lng)));
        const polygon = new maps.Polygon({
          map: map.current,
          paths,
          geodesic: false,
          strokeColor: selected ? "#fff4b0" : color,
          strokeOpacity: parcel.status === "sold" ? 1 : selected ? 1 : 0.9,
          strokeWeight: selected ? 3 : parcel.status === "sold" ? 2.5 : 1.2,
          fillColor: color,
          fillOpacity: selected ? 0.18 : parcel.status === "sold" ? 0.12 : parcel.status === "reserved" ? 0.09 : 0.035,
          clickable: true,
          zIndex: selected ? 600 : parcel.status === "sold" ? 500 : 100,
        });
        polygon.addListener("click", () => {
          if (multiSelectRef.current && parcel.status === "available") onToggleSelectRef.current?.(parcel.id);
          else onSelectRef.current(parcel.id);
        });
        handles.push({ polygon, parcelId: parcel.id });
      });

      polygons.current.set(parcel.id, handles);
    });

    return () => {
      polygons.current.forEach((items) => items.forEach(({ polygon }) => polygon.setMap(null)));
      polygons.current.clear();
    };
  }, [ready, parcels]);

  useEffect(() => {
    if (!ready || !map.current) return;
    polygons.current.forEach((items, id) => {
      const parcel = parcelsRef.current.find((item) => item.id === id);
      if (!parcel) return;
      const selected = multiSelect ? selectedIds.has(id) : selectedId === id;
      const color = parcelColor(parcel);
      items.forEach(({ polygon }) => polygon.setOptions({
        strokeColor: selected ? "#fff4b0" : color,
        strokeWeight: selected ? 3 : parcel.status === "sold" ? 2.5 : 1.2,
        fillOpacity: selected ? 0.18 : parcel.status === "sold" ? 0.12 : parcel.status === "reserved" ? 0.09 : 0.035,
        zIndex: selected ? 600 : parcel.status === "sold" ? 500 : 100,
      }));
    });
  }, [ready, selectedId, selectedIds, multiSelect]);

  useEffect(() => {
    if (!ready || !map.current || !focusTarget) return;
    const maps = (window as any).google.maps;
    const focusedParcel = parcels.find((parcel) => parcel.id === focusTarget.token.split(":")[0]);
    const geometry = geometryToRings(focusedParcel?.geometry);
    const rings = geometry.length ? geometry[0] : [fallbackParcelRing(focusTarget.parcel)];
    const overlay = new maps.Polygon({
      map: map.current,
      paths: rings.map((ring) => ring.map((point) => new maps.LatLng(point.lat, point.lng))),
      strokeColor: "#fff4b0",
      strokeOpacity: 1,
      strokeWeight: 3,
      fillColor: "#ffd35c",
      fillOpacity: 0.16,
      clickable: true,
      zIndex: 1000,
    });
    overlay.addListener("click", () => onSelectRef.current(focusTarget.token.split(":")[0] || null));
    return () => overlay.setMap(null);
  }, [ready, focusTarget?.token, parcels]);

  useEffect(() => () => {
    animationCancel.current?.();
    polygons.current.forEach((items) => items.forEach(({ polygon }) => polygon.setMap(null)));
    polygons.current.clear();
    map.current = null;
  }, []);

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] sm:h-[600px] lg:h-[670px]">
      <div ref={ref} className="absolute inset-0" aria-label="MySkyParcel gerçek parsel haritası" />
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-[#071a2d]/95 p-6 text-center">
          <div>
            <p className="text-sm font-semibold text-white/90">Gökyüzü Haritası kullanılamıyor</p>
            <p className="mt-2 max-w-md text-xs leading-5 text-white/60">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
