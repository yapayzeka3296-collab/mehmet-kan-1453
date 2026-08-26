import type { Parcel } from "@/types/parcel";

type CityCenter={lat:number;lng:number};
type ViewportBounds={minLat:number;minLng:number;maxLat:number;maxLng:number};
type FocusTarget={city:CityCenter;parcel:CityCenter;token:string};
type Props={parcels:Parcel[];selectedId:string|null;selectedIds?:Set<string>;multiSelect?:boolean;onSelect:(id:string|null)=>void;onToggleSelect?:(id:string)=>void;onViewportChange?:(bounds:ViewportBounds)=>void;center:CityCenter;focusTarget?:FocusTarget|null};

export function SkyParcelMap({onViewportChange,center}:Props){
  // The current sky-map area intentionally uses only the supplied visual.
  // Parcel data is not rendered or connected to this visual layer.
  onViewportChange?.({minLat:center.lat-1,minLng:center.lng-1,maxLat:center.lat+1,maxLng:center.lng+1});
  return (
    <div className="relative h-[350px] w-full overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#071a2d] sm:h-[420px] lg:h-[469px]">
      <img
        src="/images/cities/turkey-3d-map.png"
        alt="Türkiye 3D harita"
        className="block h-full w-full object-contain"
        draggable={false}
      />
    </div>
  );
}
