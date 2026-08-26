import { useNavigate } from "@tanstack/react-router";
import { SkyParcelMap } from "@/components/SkyParcelMap";
import { MySkyParcelEarthGlobe } from "@/components/MySkyParcelEarthGlobe";
import type { Parcel } from "@/types/parcel";

type CityCenter={lat:number;lng:number};
type ViewportBounds={minLat:number;minLng:number;maxLat:number;maxLng:number};
type FocusTarget={city:CityCenter;parcel:CityCenter;token:string};
type Props={parcels:Parcel[];selectedId:string|null;selectedIds?:Set<string>;multiSelect?:boolean;onSelect:(id:string|null)=>void;onToggleSelect?:(id:string)=>void;onViewportChange?:(bounds:ViewportBounds)=>void;center:CityCenter;focusTarget?:FocusTarget|null};

export function FocusedSkyParcelMap(props: Props) {
  const navigate = useNavigate({ from: "/gokyuzu-haritasi" });

  const handleProvinceSelect = ({ slug }: { name: string; slug: string; parcelCount: number | null }) => {
    void navigate({ search: { city: slug }, replace: true });
  };

  return (
    <div className="space-y-3">
      <MySkyParcelEarthGlobe onProvinceSelect={handleProvinceSelect} />
      <SkyParcelMap {...props} />
    </div>
  );
}
