type MapsLike = any;
type PolygonLike = any;

type Entry = {
  polygon: PolygonLike;
  map: any;
  baseColor: string;
  baseWeight: number;
  baseOpacity: number;
  isGlow: boolean;
  isSold: boolean;
};

const entries = new Set<Entry>();
const mapListeners = new WeakMap<object, any>();
const patchedMaps = new WeakSet<object>();

const GOLD = "#e8c66a";
const HOVER_GOLD = "#fff0a6";

function zoomProfile(zoom: number, isGlow: boolean) {
  if (zoom <= 10) return { weight: isGlow ? 1.6 : 0.65, opacity: isGlow ? 0.08 : 0.34 };
  if (zoom <= 12) return { weight: isGlow ? 2.0 : 0.8, opacity: isGlow ? 0.10 : 0.45 };
  if (zoom <= 14) return { weight: isGlow ? 2.4 : 0.95, opacity: isGlow ? 0.13 : 0.56 };
  if (zoom <= 16) return { weight: isGlow ? 3.0 : 1.15, opacity: isGlow ? 0.17 : 0.68 };
  return { weight: isGlow ? 4.0 : 1.45, opacity: isGlow ? 0.22 : 0.80 };
}

function isParcelPolygon(options: any) {
  if (!options || !options.map) return false;
  const z = Number(options.zIndex ?? 0);
  const weight = Number(options.strokeWeight ?? 0);
  return (z >= 20 && z <= 301 && weight <= 5) || (z >= 500 && z <= 501 && weight <= 7);
}

function applyZoom(entry: Entry, hovered = false) {
  if (entry.polygon.__mspApplying) return;
  const zoom = Number(entry.map?.getZoom?.() ?? 14);
  const profile = zoomProfile(zoom, entry.isGlow);
  const selected = Number(entry.polygon?.get?.("zIndex") ?? 0) >= 300;
  const sold = entry.isSold;
  const options: any = { strokeWeight: profile.weight, strokeOpacity: profile.opacity };

  if (sold) {
    options.strokeColor = entry.baseColor;
    options.strokeWeight = entry.isGlow ? Math.max(2.5, profile.weight * 1.5) : Math.max(1.5, profile.weight * 1.35);
    options.strokeOpacity = entry.isGlow ? Math.min(0.95, profile.opacity + 0.22) : Math.min(1, profile.opacity + 0.25);
  } else if (hovered || selected) {
    options.strokeColor = HOVER_GOLD;
    options.strokeWeight = entry.isGlow ? Math.max(3, profile.weight * 1.25) : Math.max(1.5, profile.weight * 1.22);
    options.strokeOpacity = entry.isGlow ? Math.min(0.38, profile.opacity + 0.12) : Math.min(1, profile.opacity + 0.16);
  } else {
    options.strokeColor = entry.baseColor;
  }

  entry.polygon.__mspApplying = true;
  entry.polygon.setOptions(options);
  entry.polygon.__mspApplying = false;
}

function registerPolygon(maps: MapsLike, polygon: PolygonLike, options: any) {
  if (!isParcelPolygon(options)) return;
  const map = options.map;
  const z = Number(options.zIndex ?? 0);
  const isGlow = z === 20 || z === 500;
  const isSold = z === 500 || z === 501;
  const baseColor = String(options.strokeColor ?? GOLD);
  const entry: Entry = { polygon, map, baseColor, baseWeight: Number(options.strokeWeight ?? 1), baseOpacity: Number(options.strokeOpacity ?? 0.6), isGlow, isSold };

  entries.add(entry);
  applyZoom(entry);
  polygon.addListener("mouseover", () => applyZoom(entry, true));
  polygon.addListener("mouseout", () => applyZoom(entry, false));

  let listener = mapListeners.get(map);
  if (!listener) {
    listener = maps.event.addListener(map, "zoom_changed", () => {
      entries.forEach((item) => { if (item.map === map) applyZoom(item); });
    });
    mapListeners.set(map, listener);
  }

  const originalSetOptions = polygon.setOptions.bind(polygon);
  polygon.setOptions = (next: any) => {
    if (next && typeof next === "object" && !polygon.__mspApplying) {
      if (typeof next.strokeColor === "string") entry.baseColor = next.strokeColor;
      if (typeof next.strokeWeight === "number") entry.baseWeight = next.strokeWeight;
      if (typeof next.strokeOpacity === "number") entry.baseOpacity = next.strokeOpacity;
    }
    originalSetOptions(next);
    if (!polygon.__mspApplying) applyZoom(entry);
  };
}

function patchGoogleMaps(maps: MapsLike) {
  if (!maps || patchedMaps.has(maps) || !maps.Polygon) return;
  const OriginalPolygon = maps.Polygon;
  const WrappedPolygon = function (this: any, options: any) {
    const polygon = new OriginalPolygon(options);
    registerPolygon(maps, polygon, options);
    return polygon;
  } as any;
  WrappedPolygon.prototype = OriginalPolygon.prototype;
  maps.Polygon = WrappedPolygon;
  patchedMaps.add(maps);
}

function compactSkyMapHeading() {
  if (typeof document === "undefined") return;
  const headings = Array.from(document.querySelectorAll("h1"));
  const heading = headings.find((item) => item.textContent?.trim() === "GÖKYÜZÜ HARİTASI");
  if (!heading) return;

  const wrapper = heading.parentElement;
  if (!wrapper) return;
  wrapper.dataset.mspCompactHeading = "true";

  // Yalnızca Gökyüzü Haritası başlık bloğunu yaklaşık %50 küçült.
  // Harita komponentinin yüksekliği/genişliği ve parsel katmanı burada değiştirilmez.
  heading.style.setProperty("font-size", "clamp(1rem, 2vw, 1.5rem)", "important");
  heading.style.setProperty("line-height", "1.15", "important");
  heading.style.setProperty("margin", "0", "important");
  heading.style.setProperty("transform", "none", "important");

  const description = wrapper.querySelector("p") as HTMLElement | null;
  if (description) {
    description.style.setProperty("margin-top", "0.25rem", "important");
    description.style.setProperty("font-size", "0.72rem", "important");
    description.style.setProperty("line-height", "1.15rem", "important");
  }

  wrapper.style.setProperty("margin-top", "-0.5rem", "important");
  wrapper.style.setProperty("margin-bottom", "0.25rem", "important");
  wrapper.style.setProperty("padding-top", "0", "important");
  wrapper.style.setProperty("padding-bottom", "0", "important");
}

function start() {
  if (typeof window === "undefined") return;
  const tryPatch = () => { const maps = (window as any).google?.maps; if (maps) patchGoogleMaps(maps); };
  tryPatch();
  const timer = window.setInterval(() => {
    tryPatch();
    const maps = (window as any).google?.maps;
    if (maps && patchedMaps.has(maps)) window.clearInterval(timer);
  }, 100);
  window.setTimeout(() => window.clearInterval(timer), 30000);

  compactSkyMapHeading();
  const observer = new MutationObserver(() => compactSkyMapHeading());
  observer.observe(document.body, { childList: true, subtree: true });
  // React route geçişlerinde başlık sonradan oluşabileceği için birkaç kez daha kesinleştir.
  [100, 300, 700, 1500, 3000].forEach((delay) => window.setTimeout(compactSkyMapHeading, delay));
  window.setTimeout(() => observer.disconnect(), 10000);
}

start();