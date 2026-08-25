import { SkyParcelMap } from "@/components/SkyParcelMap";
import type { Parcel } from "@/types/parcel";

type CityCenter={lat:number;lng:number};
type ViewportBounds={minLat:number;minLng:number;maxLat:number;maxLng:number};
type FocusTarget={city:CityCenter;parcel:CityCenter;token:string};
type Props={parcels:Parcel[];selectedId:string|null;selectedIds?:Set<string>;multiSelect?:boolean;onSelect:(id:string|null)=>void;onToggleSelect?:(id:string)=>void;onViewportChange?:(bounds:ViewportBounds)=>void;center:CityCenter;focusTarget?:FocusTarget|null};

// Compatibility export: the old focused-map API remains available without the Maps SDK.
export function FocusedGoogleParcelMap(props: Props) { return <SkyParcelMap {...props} />; }
