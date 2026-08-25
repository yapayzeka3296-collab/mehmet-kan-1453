import { SkyParcelMap } from "@/components/SkyParcelMap";
import type { Parcel } from "@/types/parcel";

type CityCenter = { lat: number; lng: number };
type ViewportBounds = { minLat: number; minLng: number; maxLat: number; maxLng: number };
type ParcelWithGeometry = Parcel & { geometry?: unknown };
type Props = { parcels: ParcelWithGeometry[]; selectedId: string | null; selectedIds?: Set<string>; multiSelect?: boolean; onSelect: (id: string | null) => void; onToggleSelect?: (id: string) => void; onViewportChange?: (bounds: ViewportBounds) => void; center: CityCenter };

// Compatibility export: existing imports keep working, but Google Maps is no longer used.
export function GoogleParcelMap(props: Props) { return <SkyParcelMap {...props} />; }
