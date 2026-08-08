export type ParcelStatus = 'available' | 'reserved' | 'sold';

export interface Parcel {
  id: string; // uuid
  parcel_number: string; // unique human-friendly identifier
  status: ParcelStatus;
  owner_id: string | null; // user id (nullable for available parcels)
  price: number; // stored as smallest currency unit or decimal (decide in DB)
  latitude: number;
  longitude: number;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
