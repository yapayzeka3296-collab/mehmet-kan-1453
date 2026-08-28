import { useEffect, useRef, useState } from "react";
import { MySkyParcelEarthGlobe } from "@/components/MySkyParcelEarthGlobe";

type Props = { className?: string };
export function ZoomableEarthGlobe({ className = "" }: Props) {
  const [scale, setScale] = useState(1);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDistance = useRef<number | null>(null);
  useEffect(() => { const clamp = (value: number) => Math.max(0.82, Math.min(2.15, value)); const onWheel = (event: WheelEvent) => { event.preventDefault(); setScale((current) => clamp(current - event.deltaY * 0.0012)); }; const element = document.getElementById("my-sky-parcel-globe-zoom-surface"); if (!element) return; element.addEventListener("wheel", onWheel, { passive: false }); return () => element.removeEventListener("wheel", onWheel); }, []);
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => { pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY }); if (pointers.current.size === 2) { const values = [...pointers.current.values()]; const a = values[0]; const b = values[1]; if (!a || !b) return; pinchDistance.current = Math.hypot(a.x - b.x, a.y - b.y); } };
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => { if (!pointers.current.has(event.pointerId)) return; pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY }); if (pointers.current.size !== 2 || pinchDistance.current === null) return; const values = [...pointers.current.values()]; const a = values[0]; const b = values[1]; if (!a || !b) return; const distance = Math.hypot(a.x - b.x, a.y - b.y); if (distance <= 0) return; const ratio = distance / pinchDistance.current; if (Math.abs(ratio - 1) > 0.015) { setScale((current) => Math.max(0.82, Math.min(2.15, current * ratio))); pinchDistance.current = distance; } };
  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => { pointers.current.delete(event.pointerId); if (pointers.current.size < 2) pinchDistance.current = null; };
  return <div id="my-sky-parcel-globe-zoom-surface" className="relative h-full w-full overflow-hidden" style={{ touchAction: "none" }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}><div className="absolute inset-0 origin-center transition-transform duration-75" style={{ transform: `scale(${scale})` }}><MySkyParcelEarthGlobe className={className} /></div><div className="pointer-events-none absolute bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[10px] text-white/65 backdrop-blur-md">İki parmakla yakınlaştır · Mouse tekerleğiyle zoom</div></div>;
}
