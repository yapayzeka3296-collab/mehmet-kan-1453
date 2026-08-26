import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { FocusedSkyParcelMap } from "@/components/FocusedSkyParcelMap";
import type { Parcel } from "@/types/parcel";

const ISTANBUL = { lat: 41.0082, lng: 28.9784 };

export function LegacySkyMapView() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!supabaseBrowser) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await supabaseBrowser.from("parcel_map_public").select("*").limit(5000);
        if (active) setParcels((data ?? []) as Parcel[]);
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const selectedSet = useMemo(() => selectedIds, [selectedIds]);

  if (loading) {
    return <div className="flex min-h-[560px] items-center justify-center bg-[#01040b] text-sm text-white/70">Gökyüzü Haritası yükleniyor…</div>;
  }

  return (
    <div className="min-h-screen bg-[#01040b] p-2 md:p-4">
      <FocusedSkyParcelMap
        parcels={parcels}
        selectedId={selectedId}
        selectedIds={selectedSet}
        multiSelect={false}
        onSelect={(id) => {
          setSelectedId(id);
          setSelectedIds(id ? new Set([id]) : new Set());
        }}
        onToggleSelect={(id) => {
          setSelectedIds((previous) => {
            const next = new Set(previous);
            if (next.has(id)) next.delete(id); else next.add(id);
            setSelectedId(next.has(id) ? id : null);
            return next;
          });
        }}
        center={ISTANBUL}
      />
    </div>
  );
}
