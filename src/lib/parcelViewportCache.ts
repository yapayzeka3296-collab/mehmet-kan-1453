export type ParcelViewportKey = {
  citySlug: string;
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
  zoomLevel?: number;
};

const round = (value: number) => Math.round(value * 10_000) / 10_000;

export function makeParcelViewportKey(viewport: ParcelViewportKey) {
  return [
    viewport.citySlug,
    round(viewport.minLat),
    round(viewport.minLng),
    round(viewport.maxLat),
    round(viewport.maxLng),
    viewport.zoomLevel ?? 0,
  ].join("|");
}

export function createParcelViewportCache<T>(maxEntries = 12) {
  const cache = new Map<string, T>();

  return {
    get(key: string) {
      const value = cache.get(key);
      if (value !== undefined) {
        cache.delete(key);
        cache.set(key, value);
      }
      return value;
    },
    set(key: string, value: T) {
      cache.delete(key);
      cache.set(key, value);
      while (cache.size > maxEntries) {
        const oldest = cache.keys().next().value;
        if (!oldest) break;
        cache.delete(oldest);
      }
    },
    clear() {
      cache.clear();
    },
  };
}

export function createViewportDebouncer<T>(delayMs: number, callback: (value: T) => void) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: T | null = null;

  return {
    schedule(value: T) {
      pending = value;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        timer = null;
        const next = pending;
        pending = null;
        if (next !== null) callback(next);
      }, delayMs);
    },
    cancel() {
      if (timer) clearTimeout(timer);
      timer = null;
      pending = null;
    },
  };
}
