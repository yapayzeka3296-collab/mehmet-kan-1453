import { useEffect, useRef, useState } from "react";

type CertificateTier = "digital" | "elite" | "premium";
type CertificateTemplateType = "digital" | "special" | "premium";
type CertificateTemplatePreviewProps = { tier: CertificateTier; className?: string };

const DEMO_DATA = { holderName: "Örnek Kullanıcı", parcelCode: "MSP-DEMO-001", cityName: "Gaziantep", certificateNumber: "MSP-DEMO-2026", issueDate: "18.08.2026", fingerprint: "DEMO-CERTIFICATE-PREVIEW", verificationUrl: "https://myskyparcel.com/verify/demo-preview" };
const LABELS: Record<CertificateTier, string> = { digital: "Dijital", elite: "Özel", premium: "Premium" };

export function CertificateTemplatePreview({ tier, className = "" }: CertificateTemplatePreviewProps) {
  const templateType: CertificateTemplateType = tier === "elite" ? "special" : tier;
  const [src, setSrc] = useState("");
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "0px" });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof window.setTimeout> | undefined;
    const loadPreview = async () => {
      try {
        const { renderCertificateSvg } = await import("@/lib/certificateTemplates");
        const svg = await renderCertificateSvg({ templateType, ...DEMO_DATA });
        if (!cancelled) setSrc(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
      } catch { if (!cancelled) setSrc(""); }
    };
    const run = () => void loadPreview();
    if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(run, { timeout: 1200 });
    else timeoutId = window.setTimeout(run, 80);
    return () => {
      cancelled = true;
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [templateType, visible]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = previousOverflow; };
  }, [open]);

  return <>
    <div ref={containerRef} className={`min-w-0 ${className}`}>
      <button type="button" onClick={() => src && setOpen(true)} disabled={!src} aria-label={`${LABELS[tier]} sertifika şablonunu büyük görüntüle`} className="group relative block w-full cursor-zoom-in overflow-hidden rounded-lg border border-gold/30 bg-slate-950 text-left shadow-lg transition duration-300 hover:border-gold/70 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-gold/70 disabled:cursor-default">
        {src ? <img src={src} alt={`${LABELS[tier]} MySkyParcel sertifika şablonu`} width={1122} height={794} decoding="async" className="block h-auto w-full transition duration-300 group-hover:scale-[1.015]" /> : <div className="flex aspect-[1122/794] w-full items-center justify-center text-sm text-white/70">{visible ? "Sertifika önizlemesi hazırlanıyor…" : "Sertifika önizlemesi"}</div>}
        {src && <span className="absolute inset-x-0 bottom-0 bg-black/55 px-3 py-2 text-center text-[10px] font-medium tracking-wide text-white opacity-0 transition group-hover:opacity-100">Büyütmek için tıklayın</span>}
      </button>
      <div className="mt-2 text-center"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">{LABELS[tier]} Sertifika</p><p className="mt-0.5 text-[9px] text-muted-foreground">Büyük görüntülemek için şablona tıklayın</p></div>
    </div>
    {open && src && <div role="dialog" aria-modal="true" aria-label={`${LABELS[tier]} sertifika şablonu büyük önizleme`} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6" onClick={() => setOpen(false)}><div className="relative flex max-h-[95vh] w-full max-w-[1400px] items-center justify-center" onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => setOpen(false)} aria-label="Büyük önizlemeyi kapat" className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/70 text-2xl leading-none text-white transition hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-gold/70">×</button><img src={src} alt={`${LABELS[tier]} MySkyParcel sertifika şablonu büyük önizleme`} width={1122} height={794} className="max-h-[92vh] w-auto max-w-full rounded-md object-contain shadow-2xl" /></div></div>}
  </>;
}
