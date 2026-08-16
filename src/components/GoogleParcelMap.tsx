import { useCallback, useEffect, useRef, useState } from "react";
import type { Parcel } from "@/types/parcel";

type CityCenter = { lat: number; lng: number };
type ParcelWithGeometry = Parcel & { geometry?: unknown };
type ViewportBounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };
type Props = {
  parcels: ParcelWithGeometry[];
  selectedId: string | null;
  selectedIds?: Set<string>;
  multiSelect?: boolean;
  onSelect: (id: string | null) => void;
  onToggleSelect?: (id: string) => void;
  onViewportChange?: (bounds: ViewportBounds) => void;
  center: CityCenter;
};
type Maps = any;
type Polygon = any;
type Marker = any;

const SCRIPT_ID = "myskyparcel-google-maps";
let mapsPromise: Promise<Maps> | null = null;
const cornerIconCache = new Map<string, any>();

const NEON_CORE = "#eafaff";
const NEON_GLOW = "#5de2ff";
const SELECTED_CORE = "#fff4b0";
const SELECTED_GLOW = "#ffd35c";

function loadGoogleMaps(apiKey: string): Promise<Maps> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps browser ortamında yüklenebilir."));
  }
  if ((window as any).google?.maps) return Promise.resolve((window as any).google.maps);
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const finish = () => {
      const maps = (window as any).google?.maps;
      if (maps) resolve(maps);
      else reject(new Error("Google Maps API yüklenemedi."));
    };

    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Google Maps script yüklenemedi.")),
        { once: true },
      );
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

function cornerIcon(maps: Maps, color: string) {
  const key = color;
  const cached = cornerIconCache.get(key);
  if (cached) return cached;

  // Keep the previously approved 50% reduced corner-light size.
  const s = 4.5;
  const blur = 1.5;
  const opacity = 0.65;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${s + 10}" height="${s + 10}" viewBox="0 0 ${s + 10} ${s + 10}"><defs><filter id="g"><feGaussianBlur stdDeviation="${blur}"/></filter></defs><circle cx="${(s + 10) / 2}" cy="${(s + 10) / 2}" r="${s / 2 + 3}" fill="${color}" opacity="${opacity}" filter="url(#g)"/><circle cx="${(s + 10) / 2}" cy="${(s + 10) / 2}" r="${s / 2}" fill="${color}" stroke="#fff" stroke-opacity=".95" stroke-width=".5"/></svg>`;
  const icon = {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new maps.Size(s + 10, s + 10),
    anchor: new maps.Point((s + 10) / 2, (s + 10) / 2),
  };
  cornerIconCache.set(key, icon);
  return icon;
}

type GridCell = {
  path: Array<{ lat: number; lng: number }>;
  center: { lat: number; lng: number };
};

function buildSquareGridLayout(
  center: CityCenter,
  total: number,
  innerRadius: number,
  outerRadius: number,
): GridCell[] {
  if (total <= 0) return [];

  const cosLat = Math.max(Math.cos((center.lat * Math.PI) / 180), 0.2);
  let gridSize = Math.max(2, Math.ceil(Math.sqrt(total)));
  let candidates: Array<{
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    ring: number;
  }> = [];

  const buildCandidates = (size: number) => {
    const cellSize = (outerRadius * 2) / size;
    const ratio = innerRadius / outerRadius;
    const next: typeof candidates = [];

    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        const x0 = -outerRadius + col * cellSize;
        const y0 = -outerRadius + row * cellSize;
        const x1 = x0 + cellSize;
        const y1 = y0 + cellSize;
        const cx = (x0 + x1) / 2 / outerRadius;
        const cy = (y0 + y1) / 2 / outerRadius;

        // Both the inner and outer boundaries stay square; only the visual
        // renderer changes, not the parcel data or selection model.
        if (Math.max(Math.abs(cx), Math.abs(cy)) < ratio) continue;

        next.push({
          x0,
          y0,
          x1,
          y1,
          ring: Math.max(Math.abs(cx), Math.abs(cy)),
        });
      }
    }

    return next;
  };

  candidates = buildCandidates(gridSize);
  while (candidates.length < total) {
    gridSize += 1;
    candidates = buildCandidates(gridSize);
  }

  // The candidate count is normally only a few cells above the requested
  // total. Trim the outermost cells so the inner square edge stays continuous.
  candidates.sort((a, b) => a.ring - b.ring);
  candidates = candidates.slice(0, total);

  return candidates.map(({ x0, y0, x1, y1 }) => {
    const toPoint = (x: number, y: number) => ({
      lat: center.lat + y,
      lng: center.lng + x / cosLat,
    });

    return {
      path: [toPoint(x0, y0), toPoint(x1, y0), toPoint(x1, y1), toPoint(x0, y1)],
      center: toPoint((x0 + x1) / 2, (y0 + y1) / 2),
    };
  });
}

export function GoogleParcelMap({
  parcels,
  selectedId,
  selectedIds = new Set<string>(),
  multiSelect = false,
  onSelect,
  onToggleSelect,
  onViewportChange,
  center,
}: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<any>(null);
  const cells = useRef<Map<string, Polygon[]>>(new Map());
  const corners = useRef<Map<string, Marker>>(new Map());
  const selectRef = useRef(onSelect);
  const toggleRef = useRef(onToggleSelect);
  const multiSelectRef = useRef(multiSelect);
  const viewportRef = useRef(onViewportChange);
  const selectedRef = useRef<string | null>(selectedId);
  const selectedIdsRef = useRef<Set<string>>(selectedIds);
  const previousSelectedIdsRef = useRef<Set<string>>(new Set(selectedIds));
  const parcelsRef = useRef(parcels);
  const lastViewportKeyRef = useRef("");
  const hoveredRef = useRef<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    selectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    toggleRef.current = onToggleSelect;
  }, [onToggleSelect]);

  useEffect(() => {
    multiSelectRef.current = multiSelect;
  }, [multiSelect]);

  useEffect(() => {
    viewportRef.current = onViewportChange;
  }, [onViewportChange]);

  useEffect(() => {
    parcelsRef.current = parcels;
  }, [parcels]);

  useEffect(() => {
    selectedIdsRef.current = selectedIds;
  }, [selectedIds]);

  useEffect(() => {
    let cancelled = false;
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!key) {
      setError("Google Maps API anahtarı eksik.");
      return;
    }
    if (!mapRef.current) return;

    loadGoogleMaps(key)
      .then((maps) => {
        if (cancelled || !mapRef.current) return;
        if (!mapObj.current) {
          mapObj.current = new maps.Map(mapRef.current, {
            center,
            zoom: 12,
            mapTypeId: "satellite",
            streetViewControl: false,
            fullscreenControl: false,
            mapTypeControl: false,
            gestureHandling: "greedy",
            clickableIcons: false,
            backgroundColor: "#071a2d",
          });
        } else {
          mapObj.current.setCenter(center);
        }
        setError(null);
        setReady(true);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setError("Google Maps yüklenemedi. API anahtarını kontrol edin.");
      });

    return () => {
      cancelled = true;
    };
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
      const next = {
        minLat: sw.lat(),
        minLng: sw.lng(),
        maxLat: ne.lat(),
        maxLng: ne.lng(),
      };
      const key = [next.minLat, next.minLng, next.maxLat, next.maxLng]
        .map((v) => v.toFixed(5))
        .join(",");
      if (key === lastViewportKeyRef.current) return;
      lastViewportKeyRef.current = key;
      viewportRef.current?.(next);
    };

    const schedule = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = window.setTimeout(emit, 120);
    };

    const listener = maps.event.addListener(map, "idle", schedule);
    schedule();

    return () => {
      maps.event.removeListener(listener);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [ready]);

  const applyParcelStyle = useCallback((id: string, mode: "normal" | "hover" | "selected") => {
    const parcel = parcelsRef.current.find((item) => item.id === id);
    const parcelCells = cells.current.get(id);
    if (!parcel || !parcelCells) return;

    const sold = parcel.status === "sold";
    const reserved = parcel.status === "reserved";
    const base = sold ? statusColor(parcel.status) : tierColor(parcel.tier);
    const core = sold ? base : reserved ? base : mode === "selected" ? SELECTED_CORE : NEON_CORE;
    const glow = sold ? base : reserved ? base : mode === "selected" ? SELECTED_GLOW : NEON_GLOW;
    const isActive = mode !== "normal";
    const glowOpacity = sold ? 0.72 : mode === "selected" ? 0.52 : mode === "hover" ? 0.34 : 0.18;
    const glowWeight = sold ? 6 : mode === "selected" ? 7 : mode === "hover" ? 6 : 4.5;
    const mainOpacity = sold ? 1 : mode === "selected" ? 1 : mode === "hover" ? 0.92 : 0.78;
    const mainWeight = sold ? 2.5 : mode === "selected" ? 1.9 : mode === "hover" ? 1.6 : 1.1;
    const fillOpacity = sold ? 0.08 : mode === "selected" ? 0.17 : mode === "hover" ? 0.035 : 0.008;

    parcelCells.forEach((polygon, index) => {
      const isGlow = index === 0;
      polygon.setOptions({
        strokeColor: isGlow ? glow : core,
        strokeOpacity: isGlow ? glowOpacity : mainOpacity,
        strokeWeight: isGlow ? glowWeight : mainWeight,
        fillColor: base,
        fillOpacity,
        zIndex: sold ? (isGlow ? 500 : 501) : isActive ? (isGlow ? 300 : 301) : (isGlow ? 20 : 21),
      });
    });
  }, []);

  useEffect(() => {
    if (!ready || !mapObj.current) return;
    const maps = (window as any).google.maps;

    cells.current.forEach((items) => items.forEach((polygon) => polygon.setMap(null)));
    cells.current.clear();
    corners.current.forEach((marker) => marker.setMap(null));
    corners.current.clear();
    hoveredRef.current.clear();

    const configs = [
      { tier: "digital" as const, innerRadius: 0.095, outerRadius: 0.165 },
      { tier: "elite" as const, innerRadius: 0.05, outerRadius: 0.08 },
      { tier: "premium" as const, innerRadius: 0.012, outerRadius: 0.035 },
    ];
    const cornerKeys = new Set<string>();

    configs.forEach((cfg) => {
      const items = parcels.filter((parcel) => parcel.tier === cfg.tier);
      const layout = buildSquareGridLayout(center, items.length, cfg.innerRadius, cfg.outerRadius);

      items.forEach((parcel, index) => {
        const cell = layout[index];
        if (!cell) return;

        const paths = cell.path.map((point) => new maps.LatLng(point.lat, point.lng));
        const sold = parcel.status === "sold";
        const reserved = parcel.status === "reserved";
        const base = sold ? statusColor(parcel.status) : tierColor(parcel.tier);
        const core = sold ? base : reserved ? base : NEON_CORE;
        const glow = sold ? base : reserved ? base : NEON_GLOW;

        const glowPolygon = new maps.Polygon({
          map: mapObj.current,
          paths,
          geodesic: false,
          strokeColor: glow,
          strokeOpacity: sold ? 0.72 : 0.18,
          strokeWeight: sold ? 6 : 4.5,
          fillColor: base,
          fillOpacity: sold ? 0.08 : 0.008,
          zIndex: sold ? 500 : 20,
          clickable: false,
        });

        const mainPolygon = new maps.Polygon({
          map: mapObj.current,
          paths,
          geodesic: false,
          strokeColor: core,
          strokeOpacity: sold ? 1 : 0.78,
          strokeWeight: sold ? 2.5 : 1.1,
          fillColor: base,
          fillOpacity: sold ? 0.08 : 0.008,
          zIndex: sold ? 501 : 21,
          clickable: true,
        });

        const click = () => {
          if (multiSelectRef.current) {
            if (parcel.status === "available") toggleRef.current?.(parcel.id);
          } else {
            selectRef.current(parcel.id);
          }
        };

        const setHover = (value: boolean) => {
          if (value) hoveredRef.current.add(parcel.id);
          else hoveredRef.current.delete(parcel.id);

          const selected = multiSelectRef.current
            ? selectedIdsRef.current.has(parcel.id)
            : selectedRef.current === parcel.id;
          applyParcelStyle(parcel.id, selected ? "selected" : value ? "hover" : "normal");
        };

        mainPolygon.addListener("click", click);
        mainPolygon.addListener("mouseover", () => setHover(true));
        mainPolygon.addListener("mouseout", () => setHover(false));

        cells.current.set(parcel.id, [glowPolygon, mainPolygon]);

        cell.path.forEach((point) => {
          const key = `${point.lat.toFixed(8)}:${point.lng.toFixed(8)}`;
          if (cornerKeys.has(key)) return;
          cornerKeys.add(key);
          corners.current.set(
            `${parcel.id}:${key}`,
            new maps.Marker({
              map: mapObj.current,
              position: point,
              icon: cornerIcon(maps, base),
              clickable: false,
              zIndex: sold ? 2000 : 1000,
              optimized: true,
            }),
          );
        });
      });
    });

    selectedIdsRef.current.forEach((id) => applyParcelStyle(id, "selected"));
    if (selectedRef.current) applyParcelStyle(selectedRef.current, "selected");

    return () => {
      cells.current.forEach((items) => items.forEach((polygon) => polygon.setMap(null)));
      corners.current.forEach((marker) => marker.setMap(null));
      cells.current.clear();
      corners.current.clear();
      hoveredRef.current.clear();
    };
  }, [parcels, ready, center.lat, center.lng, applyParcelStyle]);

  useEffect(() => {
    if (!ready) return;

    const previousSelected = selectedRef.current;
    const previousMulti = previousSelectedIdsRef.current;
    const currentMulti = new Set(selectedIds);

    if (multiSelect) {
      previousMulti.forEach((id) => {
        if (!currentMulti.has(id)) applyParcelStyle(id, "normal");
      });
      currentMulti.forEach((id) => applyParcelStyle(id, "selected"));
    }

    if (previousSelected && previousSelected !== selectedId && !multiSelect) {
      applyParcelStyle(previousSelected, "normal");
    }

    if (selectedId && !multiSelect) {
      applyParcelStyle(selectedId, "selected");
    }

    if (!multiSelect && previousMulti.size) {
      previousMulti.forEach((id) => applyParcelStyle(id, "normal"));
    }

    selectedRef.current = selectedId;
    previousSelectedIdsRef.current = currentMulti;
  }, [selectedId, selectedIds, ready, multiSelect, applyParcelStyle]);

  useEffect(
    () => () => {
      cells.current.forEach((items) => items.forEach((polygon) => polygon.setMap(null)));
      corners.current.forEach((marker) => marker.setMap(null));
      mapObj.current = null;
    },
    [],
  );

  return (
    <div className="relative h-[500px] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] sm:h-[600px] lg:h-[670px]">
      <div ref={mapRef} className="absolute inset-0" aria-label="MySkyParcel neon kare ızgara parsel haritası" />
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-[#071a2d] p-6 text-center">
          <div>
            <p className="text-sm font-semibold text-white">Google Maps hazır değil</p>
            <p className="mt-2 text-xs text-white/60">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
