export const SKY_PARCEL_HIERARCHY = {
  cities: 81,
  layersPerCity: 10,
  sectorsPerLayer: 100,
  parcelsPerSector: 1_000,
  sectorsPerCity: 1_000,
  parcelsPerCity: 1_000_000,
  totalParcels: 81_000_000,
} as const;

export type SkyParcelRef = {
  cityCode: string;
  layer: number;
  sector: number;
  parcel: number;
};

export type SkyParcelLod = "city" | "sector" | "parcel";

const CITY_RE = /^[A-Z0-9]{2,4}$/;

export function formatSkyParcelId(ref: SkyParcelRef): string {
  if (!CITY_RE.test(ref.cityCode)) throw new Error("Invalid city code");
  if (ref.layer < 1 || ref.layer > 10) throw new Error("Layer must be 1-10");
  if (ref.sector < 1 || ref.sector > 100) throw new Error("Sector must be 1-100");
  if (ref.parcel < 1 || ref.parcel > 1_000) throw new Error("Parcel must be 1-1000");
  return `${ref.cityCode}-K${String(ref.layer).padStart(2, "0")}-S${String(ref.sector).padStart(3, "0")}-P${String(ref.parcel).padStart(3, "0")}`;
}

export function parseSkyParcelId(id: string): SkyParcelRef | null {
  const match = /^([A-Z0-9]{2,4})-K(\d{2})-S(\d{3})-P(\d{3})$/i.exec(id.trim());
  if (!match) return null;
  const cityCode = match[1]?.toUpperCase();
  const layer = Number(match[2]);
  const sector = Number(match[3]);
  const parcel = Number(match[4]);
  if (!cityCode || layer < 1 || layer > 10 || sector < 1 || sector > 100 || parcel < 1 || parcel > 1_000) return null;
  return { cityCode, layer, sector, parcel };
}

export function getSkyParcelLod(zoom: number): SkyParcelLod {
  if (zoom < 1.06) return "city";
  if (zoom < 1.17) return "sector";
  return "parcel";
}

export function getSectorKey(layer: number, sector: number): string {
  return `K${String(layer).padStart(2, "0")}-S${String(sector).padStart(3, "0")}`;
}

export function getParcelRange(sector: number): { start: number; end: number } {
  if (sector < 1 || sector > 100) throw new Error("Sector must be 1-100");
  return { start: 1, end: SKY_PARCEL_HIERARCHY.parcelsPerSector };
}
