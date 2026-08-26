import { useNavigate } from "@tanstack/react-router";
import { SkyParcelMap } from "@/components/SkyParcelMap";
import { MySkyParcelEarthGlobe } from "@/components/MySkyParcelEarthGlobe";
import { GaziantepInteractiveParcelScene } from "@/components/GaziantepInteractiveParcelScene";
import type { Parcel } from "@/types/parcel";

type CityCenter={lat:number;lng:number};
type ViewportBounds={minLat:number;minLng:number;maxLat:number;maxLng:number};
type FocusTarget={city:CityCenter;parcel:CityCenter;token:string};
type Props={parcels:Parcel[];selectedId:string|null;selectedIds?:Set<string>;multiSelect?:boolean;onSelect:(id:string|null)=>void;onToggleSelect?:(id:string)=>void;onViewportChange?:(bounds:ViewportBounds)=>void;center:CityCenter;focusTarget?:FocusTarget|null};

export function FocusedSkyParcelMap(props: Props) {
  const navigate = useNavigate({ from: "/gokyuzu-haritasi" });
  const isGaziantep = Math.abs(props.center.lat - 37.0662) < 0.01 && Math.abs(props.center.lng - 37.3833) < 0.01;

  const handleProvinceSelect = ({ slug }: { name: string; slug: string; parcelCount: number | null }) => {
    void navigate({ search: { city: slug }, replace: true });
  };

  return (
    <div className="space-y-3">
      <MySkyParcelEarthGlobe onProvinceSelect={handleProvinceSelect} />
      <SkyParcelMap {...props} />
      {isGaziantep && <GaziantepInteractiveParcelScene />}
    </div>
  );
}
