import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { boundingBox, type SkyParcel } from './geo';

const MAX_RESULTS = 120;

export async function loadNearbySkyParcels(
  latitude: number,
  longitude: number,
  radiusMeters = 25_000,
): Promise<SkyParcel[]> {
  const box = boundingBox({ latitude, longitude }, radiusMeters);

  const { data, error } = await supabaseBrowser
    .from('parcel_map_public')
    .select('id,parcel_number,status,price,tier,city_name,latitude,longitude,layer_number,sector_number,grid_x,grid_y')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .gte('latitude', box.minLat)
    .lte('latitude', box.maxLat)
    .gte('longitude', box.minLon)
    .lte('longitude', box.maxLon)
    .order('parcel_number', { ascending: true })
    .limit(MAX_RESULTS);

  if (error) throw new Error(`Parseller yüklenemedi: ${error.message}`);
  return (data ?? []) as SkyParcel[];
}
