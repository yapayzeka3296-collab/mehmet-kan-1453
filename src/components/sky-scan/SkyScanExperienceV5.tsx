import { Camera, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export function SkyScanExperienceV5() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (!window.isSecureContext) throw new Error("Kamera yalnızca HTTPS bağlantısında çalışır.");
    const video = videoRef.current;
    if (!navigator.mediaDevices?.getUserMedia || !video) throw new Error("Bu tarayıcı kamera erişimini desteklemiyor.");

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        frameRate: { ideal: 30, max: 60 },
      },
      audio: false,
    });

    streamRef.current = stream;
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    await video.play();
    setCameraStarted(true);
    setCameraReady(true);
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    setCameraStarted(false);
    setCameraReady(false);
  }, []);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const handleStart = useCallback(async () => {
    try {
      await startCamera();
    } catch (error) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraError(error instanceof Error ? error.message : "Kamera başlatılamadı.");
    }
  }, [startCamera]);

  return (
    <main className="fixed inset-0 overflow-hidden bg-black text-white">
      <video
        ref={videoRef}
        className={`absolute inset-0 z-0 h-full w-full object-cover ${cameraStarted ? "block" : "hidden"}`}
        playsInline
        muted
        autoPlay
      />

      {!cameraStarted && (
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
          <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-slate-950/90 p-7 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-300/10">
              <Camera className="h-8 w-8 text-cyan-200" />
            </div>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[.28em] text-cyan-300">MySkyParcel</p>
            <h1 className="mt-2 text-2xl font-bold">Gökyüzünü Tara</h1>
            <p className="mt-3 text-sm leading-6 text-white/65">Kamera deneyimi hazır.</p>
            <button onClick={handleStart} className="mt-6 w-full rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-bold text-slate-950">
              Kamerayı başlat
            </button>
            {cameraError && <p className="mt-3 text-xs text-red-200">{cameraError}</p>}
          </div>
        </div>
      )}

      {cameraStarted && (
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="rounded-2xl border border-white/15 bg-black/45 px-3 py-2 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Camera className="h-4 w-4" /> Kamera {cameraReady ? "hazır" : "başlatılıyor"}
            </div>
          </div>
          <button
            onClick={stopCamera}
            className="rounded-full border border-white/20 bg-black/45 p-2.5 backdrop-blur-md"
            aria-label="Kamerayı kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </main>
  );
}
