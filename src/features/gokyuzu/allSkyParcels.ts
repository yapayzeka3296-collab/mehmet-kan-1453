import { supabaseBrowser } from '@/lib/supabaseBrowser';

export type AllSkyParcel = {
  id: string;
  parcel_number: string;
  status: string | null;
  price: number | null;
  tier: string | null;
  city_name: string;
  layer_number: number | null;
  sector_number: number | null;
  grid_x: number | null;
  grid_y: number | null;
};

const PAGE_SIZE = 1000;
const PARALLEL_PAGES = 8;
const PARCEL_SELECT = 'id,parcel_number,status,price,tier,city_name,layer_number,sector_number,grid_x,grid_y';

export async function loadCitySkyParcels(
  cityName: string,
  onProgress?: (loaded: number, total: number) => void,
): Promise<AllSkyParcel[]> {
  const first = await supabaseBrowser
    .from('parcel_map_public')
    .select(PARCEL_SELECT, { count: 'exact' })
    .eq('city_name', cityName)
    .order('layer_number', { ascending: true })
    .order('sector_number', { ascending: true })
    .range(0, PAGE_SIZE - 1);

  if (first.error) throw new Error(`${cityName} parselleri yüklenemedi: ${first.error.message}`);

  const total = first.count ?? first.data?.length ?? 0;
  const rows: AllSkyParcel[] = (first.data ?? []) as AllSkyParcel[];
  onProgress?.(rows.length, total);

  if (rows.length >= total) return rows;

  const offsets: number[] = [];
  for (let offset = PAGE_SIZE; offset < total; offset += PAGE_SIZE) offsets.push(offset);

  for (let i = 0; i < offsets.length; i += PARALLEL_PAGES) {
    const batch = offsets.slice(i, i + PARALLEL_PAGES);
    const pages = await Promise.all(
      batch.map((offset) =>
        supabaseBrowser
          .from('parcel_map_public')
          .select(PARCEL_SELECT)
          .eq('city_name', cityName)
          .order('layer_number', { ascending: true })
          .order('sector_number', { ascending: true })
          .range(offset, Math.min(offset + PAGE_SIZE - 1, total - 1)),
      ),
    );

    for (const page of pages) {
      if (page.error) throw new Error(`${cityName} parselleri yüklenemedi: ${page.error.message}`);
      rows.push(...((page.data ?? []) as AllSkyParcel[]));
    }
    onProgress?.(Math.min(rows.length, total), total);
  }

  return rows;
}

export async function loadAllSkyParcels(
  onProgress?: (loaded: number, total: number) => void,
): Promise<AllSkyParcel[]> {
  const first = await supabaseBrowser
    .from('parcel_map_public')
    .select(PARCEL_SELECT, { count: 'exact' })
    .order('city_name', { ascending: true })
    .order('layer_number', { ascending: true })
    .order('sector_number', { ascending: true })
    .range(0, PAGE_SIZE - 1);

  if (first.error) throw new Error(`Parseller yüklenemedi: ${first.error.message}`);

  const total = first.count ?? first.data?.length ?? 0;
  const rows: AllSkyParcel[] = (first.data ?? []) as AllSkyParcel[];
  onProgress?.(rows.length, total);

  if (rows.length >= total) return rows;

  const offsets: number[] = [];
  for (let offset = PAGE_SIZE; offset < total; offset += PAGE_SIZE) offsets.push(offset);

  for (let i = 0; i < offsets.length; i += PARALLEL_PAGES) {
    const batch = offsets.slice(i, i + PARALLEL_PAGES);
    const pages = await Promise.all(
      batch.map((offset) =>
        supabaseBrowser
          .from('parcel_map_public')
          .select(PARCEL_SELECT)
          .order('city_name', { ascending: true })
          .order('layer_number', { ascending: true })
          .order('sector_number', { ascending: true })
          .range(offset, Math.min(offset + PAGE_SIZE - 1, total - 1)),
      ),
    );

    for (const page of pages) {
      if (page.error) throw new Error(`Parseller yüklenemedi: ${page.error.message}`);
      rows.push(...((page.data ?? []) as AllSkyParcel[]));
    }
    onProgress?.(Math.min(rows.length, total), total);
  }

  return rows;
}
