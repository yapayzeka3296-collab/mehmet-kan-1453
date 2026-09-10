import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Night mode is deliberately isolated from the AR engine. It only changes
 * presentation of the existing camera/parcel layer and never changes GPS,
 * sensor, projection or parcel-fetching logic.
 */
export function SkyScanNightVision({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const checkCamera = () => {
      const video = document.querySelector("video");
      setCameraActive(Boolean(video?.srcObject && video.readyState >= 2));
    };
    checkCamera();
    const observer = new MutationObserver(checkCamera);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "src"] });
    const interval = window.setInterval(checkCamera, 750);
    return () => {
      observer.disconnect();
      window.clearInterval(interval);
      root.removeAttribute("data-sky-night-vision");
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.skyNightVision = enabled ? "true" : "false";
    return () => {
      document.documentElement.removeAttribute("data-sky-night-vision");
    };
  }, [enabled]);

  return (
    <div className="relative h-full w-full" data-sky-night-vision-wrapper>
      <style>{`
        html[data-sky-night-vision="true"] [data-sky-night-vision-wrapper] video {
          filter: brightness(1.42) contrast(1.12) saturate(0.78) blur(0.22px);
          transform: translateZ(0);
        }
        html[data-sky-night-vision="true"] [data-sky-night-vision-wrapper] > main > button > div:first-child > div:first-child {
          filter: brightness(1.25) contrast(1.15);
        }
        html[data-sky-night-vision="true"] [data-sky-night-vision-wrapper] > main > button > div:first-child > div:first-child + div {
          text-shadow: 0 0 8px rgba(255,255,255,0.8), 0 0 16px rgba(34,211,238,0.55);
        }
      `}</style>
      {children}
      {cameraActive && (
        <div className="fixed right-3 top-20 z-[100] sm:right-5 sm:top-24">
          <button
            type="button"
            onClick={() => setEnabled((value) => !value)}
            aria-pressed={enabled}
            aria-label={enabled ? "Gece görüşünü kapat" : "Gece görüşünü aç"}
            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-bold shadow-xl backdrop-blur-md transition ${enabled ? "border-amber-300/70 bg-slate-950/85 text-amber-100 shadow-amber-300/20" : "border-white/20 bg-slate-950/65 text-white/85"}`}
          >
            {enabled ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {enabled ? "Gece Görüşü Açık" : "Gece Görüşü"}
          </button>
          {enabled && <div className="mt-1 rounded-full bg-black/60 px-2 py-1 text-center text-[8px] text-amber-100/80">Düşük ışık iyileştirme</div>}
        </div>
      )}
    </div>
  );
}
