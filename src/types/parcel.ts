export type ParcelStatus = 'available' | 'reserved' | 'sold';
export type ParcelTier = 'digital' | 'elite' | 'premium';

export interface Parcel {
  id: string;
  parcel_number: string;
  status: ParcelStatus;
  owner_id: string | null;
  price: number;
  tier: ParcelTier;
  tier_price: number;
  city_id: string | null;
  city_name?: string;
  city_code?: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}
