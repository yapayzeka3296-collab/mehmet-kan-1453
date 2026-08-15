import { useEffect, useRef, useState } from "react";
import type { Parcel } from "@/types/parcel";

type CityCenter = { lat: number; lng: number };

type Props = {
  parcels: Parcel[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  center: CityCenter;
};

const SCRIPT_ID = "myskyparcel-google-maps";
let mapsPromise: Promise<any> | null = null;

function loadGoogleMaps(apiKey: string) {
  if (typeof window === "undefined") return Promise.reject(new Error("Google Maps browser ortamında yüklenebilir."));
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

function markerIcon(maps: any, tier: Parcel["tier"], selected: boolean) {
  const fill = tier === "premium" ? "#f6c453" : tier === "elite" ? "#b77cff" : "#55c9ff";
  const size = selected ? 18 : 12;
  const stroke = selected ? "#ffffff" : "#061a2f";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size + 8}" height="${size + 8}" viewBox="0 0 ${size + 8} ${size + 8}"><circle cx="${(size + 8) / 2}" cy="${(size + 8) / 2}" r="${size / 2}" fill="${fill}" stroke="${stroke}" stroke-width="2"/></svg>`;
  return { url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`, scaledSize: new maps.Size(size + 8, size + 8), anchor: new maps.Point((size + 8) / 2, (size + 8) / 2) };
}

export function GoogleParcelMap({ parcels, selectedId, onSelect, center }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const selectedRef = useRef(selectedId);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    selectedRef.current = selectedId;
    const maps = (window as any).google?.maps;
    const map = mapInstanceRef.current;
    if (!maps || !map) return;
    markersRef.current.forEach((marker, id) => {
      const parcel = parcels.find((item) => item.id === id);
      if (parcel) marker.setIcon(markerIcon(maps, parcel.tier, id === selectedId));
    });
    if (selectedId) {
      const selected = parcels.find((parcel) => parcel.id === selectedId);
      if (selected) map.panTo({ lat: selected.latitude, lng: selected.longitude });
    }
  }, [selectedId, parcels]);

  useEffect(() => {
    let cancelled = false;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Google Maps API anahtarı eksik. Vercel ortam değişkenlerine VITE_GOOGLE_MAPS_API_KEY eklenmelidir.");
      return;
    }
    if (!mapRef.current) return;

    void loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !mapRef.current) return;
        setError(null);
        if (!mapInstanceRef.current) {
          mapInstanceRef.current = new maps.Map(mapRef.current, {
            center,
            zoom: 11,
            mapTypeId: "roadmap",
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
      })
      .catch((err) => {
        console.error("Google Maps load error", err);
        if (!cancelled) setError("Google Maps yüklenemedi. API anahtarını ve Maps JavaScript API yetkisini kontrol edin.");
      });

    return () => {
      cancelled = true;
    };
  }, [center.lat, center.lng]);

  useEffect(() => {
    const maps = (window as any).google?.maps;
    const map = mapInstanceRef.current;
    if (!maps || !map || !mapReady) return;

    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current.clear();

    parcels.forEach((parcel) => {
      const marker = new maps.Marker({
        map,
        position: { lat: parcel.latitude, lng: parcel.longitude },
        title: parcel.parcel_number,
        icon: markerIcon(maps, parcel.tier, parcel.id === selectedRef.current),
        opacity: parcel.status === "sold" ? 0.45 : parcel.status === "reserved" ? 0.7 : 1,
      });
      marker.addListener("click", () => onSelect(parcel.id));
      markersRef.current.set(parcel.id, marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current.clear();
    };
  }, [parcels, onSelect, mapReady]);

  return (
    <div className="relative h-[560px] w-full overflow-hidden rounded-2xl border border-sky-200/15 bg-[#071a2d] sm:h-[680px] lg:h-[760px]">
      <div ref={mapRef} className="absolute inset-0" aria-label="MySkyParcel Google Maps parsel haritası" />
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-[#071a2d] p-6 text-center">
          <div className="max-w-md rounded-2xl border border-amber-200/20 bg-slate-950/85 p-6 shadow-2xl backdrop-blur-md">
            <p className="text-sm font-semibold text-white">Google Maps hazır değil</p>
            <p className="mt-2 text-xs leading-5 text-white/60">{error}</p>
          </div>
        </div>
      )}
      {!error && parcels.length === 0 && <div className="absolute inset-0 grid place-items-center bg-[#071a2d]/35 text-sm text-white/60">Bu şehir için gösterilecek parsel bulunamadı.</div>}
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-slate-950/70 px-3 py-2 text-xs font-medium text-white/85 shadow-lg backdrop-blur-md sm:left-5 sm:top-5">Google Maps · MySkyParcel parselleri</div>
      <div className="pointer-events-none absolute bottom-4 left-4 flex flex-wrap gap-2 rounded-xl border border-white/10 bg-slate-950/75 p-2 text-[10px] text-white/75 backdrop-blur-md sm:left-5 sm:bottom-5 sm:text-xs">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-sky-300" />Dijital</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-violet-300" />Elit</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-300" />Premium</span>
      </div>
    </div>
  );
}
