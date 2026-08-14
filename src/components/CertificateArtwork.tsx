import React, { useCallback, useState } from "react";
import { CERTIFICATE_TEMPLATE_FALLBACK, CERTIFICATE_TEMPLATE_IMAGES, CERTIFICATE_TEMPLATE_LABELS } from "@/lib/certificateTemplate";

type Tier = "digital" | "elite" | "premium";
type Props = {
  tier: Tier;
  name?: string | null;
  parcelCode?: string | null;
  certificateNumber?: string | null;
  issuedAt?: string | null;
  cityName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};
const LABEL = CERTIFICATE_TEMPLATE_LABELS;
const dateTR = (v?: string | null) => { if (!v) return "—"; const d = new Date(v); return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("tr-TR"); };
const coordinateText = (latitude?: number | null, longitude?: number | null) => latitude != null && longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude) ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : "—";
const qrUrl = (n: string, cacheKey?: string | null) => { const base = import.meta.env.VITE_SUPABASE_URL as string | undefined; if (!base) return ""; const suffix = cacheKey ? `&v=${encodeURIComponent(cacheKey)}` : ""; return `${base.replace(/\/$/, "")}/functions/v1/certificate-qr?code=${encodeURIComponent(n)}${suffix}`; };
function loadImage(src: string, crossOrigin?: string) { return new Promise<HTMLImageElement>((resolve, reject) => { const i = new Image(); if (crossOrigin) i.crossOrigin = crossOrigin; i.onload = () => resolve(i); i.onerror = () => reject(new Error(`Image failed: ${src}`)); i.src = src; }); }
async function loadTemplate(tier: Tier) { try { return await loadImage(CERTIFICATE_TEMPLATE_IMAGES[tier]); } catch { return await loadImage(CERTIFICATE_TEMPLATE_FALLBACK); } }
function save(blob: Blob, name: string) { const u = URL.createObjectURL(blob), a = document.createElement("a"); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000); }

// Reference artwork is 3:2 (1600x1067). Values below are positioned against that exact canvas.
const LAYOUT = {
  name: { left: 24, width: 52, top: 43.8 },
  coordinates: { left: 34.5, width: 31, top: 56.2, height: 6.2 },
  parcel: { left: 78.6, width: 15.7, top: 40.0 },
  date: { left: 78.6, width: 15.7, top: 47.8 },
  number: { left: 78.6, width: 15.7, top: 55.3 },
  city: { left: 30, width: 40, top: 82 },
  qr: { right: 7.2, top: 64.5, size: 10.3 },
} as const;

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, start: number, min: number) { let size = start; while (size > min) { ctx.font = `600 ${size}px Arial,sans-serif`; if (ctx.measureText(text).width <= maxWidth) break; size -= 1; } return size; }

async function render(tier: Tier, name: string, parcel: string, date: string, number: string, city: string, latitude?: number | null, longitude?: number | null, qrVersion?: string | null) {
  const bg = await loadTemplate(tier); const c = document.createElement("canvas"); c.width = bg.naturalWidth; c.height = bg.naturalHeight;
  const x = c.getContext("2d"); if (!x) throw Error("canvas"); x.drawImage(bg, 0, 0, c.width, c.height); x.textAlign = "center"; x.textBaseline = "middle";
  const nameMax = c.width * (LAYOUT.name.width / 100) * .92; const nameSize = fitFont(x, name || "Ad Soyad", nameMax, c.width * .021, c.width * .0105);
  x.font = `600 italic ${nameSize}px Georgia,serif`; x.fillStyle = "#c79b38"; x.shadowColor = "rgba(0,0,0,.28)"; x.shadowBlur = c.width * .0015; x.fillText(name || "Ad Soyad", c.width * ((LAYOUT.name.left + LAYOUT.name.width / 2) / 100), c.height * (LAYOUT.name.top / 100)); x.shadowBlur = 0;

  // The right-hand information column follows the reference artwork: parcel no, date, certificate no.
  const valueX = c.width * ((LAYOUT.parcel.left + LAYOUT.parcel.width / 2) / 100); x.font = `600 ${c.width * .0092}px Arial,sans-serif`; x.fillStyle = "#1e2f46";
  x.fillText(parcel || "—", valueX, c.height * (LAYOUT.parcel.top / 100)); x.fillText(date || "—", valueX, c.height * (LAYOUT.date.top / 100)); x.fillText(number || "—", valueX, c.height * (LAYOUT.number.top / 100));

  // The gold-framed center field is the parcel-coordinate field requested for dynamic certificates.
  const coordinate = coordinateText(latitude, longitude); const coordMax = c.width * (LAYOUT.coordinates.width / 100) * .86; const coordSize = fitFont(x, coordinate, coordMax, c.width * .0135, c.width * .007);
  x.font = `600 ${coordSize}px Arial,sans-serif`; x.fillStyle = "#20324a"; x.fillText(coordinate, c.width * ((LAYOUT.coordinates.left + LAYOUT.coordinates.width / 2) / 100), c.height * ((LAYOUT.coordinates.top + LAYOUT.coordinates.height / 2) / 100));

  if (city) { x.font = `600 ${c.width * .0085}px Arial,sans-serif`; x.fillStyle = "rgba(255,255,255,.86)"; x.fillText(city, c.width * ((LAYOUT.city.left + LAYOUT.city.width / 2) / 100), c.height * (LAYOUT.city.top / 100)); }
  const qr = qrUrl(number, qrVersion); if (qr) { try { const q = await loadImage(qr, "anonymous"), size = Math.round(c.width * (LAYOUT.qr.size / 100)), qx = Math.round(c.width * (1 - LAYOUT.qr.right / 100) - size), qy = Math.round(c.height * (LAYOUT.qr.top / 100)); x.fillStyle = "#fff"; x.fillRect(qx - 5, qy - 5, size + 10, size + 10); x.drawImage(q, qx, qy, size, size); } catch (e) { console.warn("QR embedding failed", e); } }
  return c;
}

export function CertificateArtwork({ tier, name, parcelCode, certificateNumber, issuedAt, cityName, latitude, longitude }: Props) {
  const displayName = name?.trim() || "Ad Soyad"; const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null); const qrVersion = issuedAt || certificateNumber || "1"; const coordinates = coordinateText(latitude, longitude);
  const make = useCallback(() => render(tier, displayName, parcelCode || "—", dateTR(issuedAt), certificateNumber || "—", cityName || "", latitude, longitude, qrVersion), [tier, displayName, parcelCode, issuedAt, certificateNumber, cityName, latitude, longitude, qrVersion]);
  const download = useCallback(async (type: "png" | "jpg" | "pdf") => { if (!certificateNumber) return; setBusy(true); setError(null); try { const c = await make(); if (type === "pdf") { const w = window.open("", "_blank"); if (!w) throw Error("popup"); w.document.write(`<html><head><title>${certificateNumber}</title><style>@page{size:A4 landscape;margin:0}html,body{margin:0;height:100%}img{width:100%;height:100%;object-fit:contain}</style></head><body><img src="${c.toDataURL("image/png")}"></body></html>`); w.document.close(); setTimeout(() => w.print(), 500); } else { const b = await new Promise<Blob | null>(r => c.toBlob(r, type === "png" ? "image/png" : "image/jpeg", 1)); if (!b) throw Error(type); save(b, `${certificateNumber}-${tier}.${type}`); } } catch (e) { console.error(e); setError("Sertifika oluşturulamadı. Lütfen tekrar deneyin"); } finally { setBusy(false); } }, [certificateNumber, make, tier]);
  const templateSrc = CERTIFICATE_TEMPLATE_IMAGES[tier]; const verificationQr = certificateNumber ? qrUrl(certificateNumber, qrVersion) : "";
  return <article className="relative mx-auto w-full overflow-hidden rounded-xl bg-black shadow-2xl" aria-label={LABEL[tier]}><div className="relative"><img src={templateSrc} alt={LABEL[tier]} onError={(event) => { const img = event.currentTarget; if (img.src.endsWith(CERTIFICATE_TEMPLATE_FALLBACK)) return; img.src = CERTIFICATE_TEMPLATE_FALLBACK; }} className="block aspect-[1600/1067] h-auto w-full object-cover"/><div className="pointer-events-none absolute inset-0">
    <div className="absolute left-[24%] top-[43.8%] flex h-[7%] w-[52%] items-center justify-center text-center"><span className="font-serif text-[clamp(13px,2.1vw,28px)] font-semibold italic leading-none text-[#c79b38] drop-shadow-[0_1px_2px_rgba(0,0,0,.3)]">{displayName}</span></div>
    <div className="absolute left-[34.5%] top-[56.2%] flex h-[6.2%] w-[31%] items-center justify-center text-center"><span className="font-sans text-[clamp(7px,.9vw,14px)] font-semibold leading-none text-[#20324a]">{coordinates}</span></div>
    <div className="absolute left-[78.6%] top-[40%] w-[15.7%] text-center text-[clamp(6px,.92vw,13px)] font-semibold leading-tight text-[#1e2f46]">{parcelCode || "—"}</div>
    <div className="absolute left-[78.6%] top-[47.8%] w-[15.7%] text-center text-[clamp(6px,.92vw,13px)] font-semibold leading-tight text-[#1e2f46]">{dateTR(issuedAt)}</div>
    <div className="absolute left-[78.6%] top-[55.3%] w-[15.7%] text-center text-[clamp(6px,.92vw,13px)] font-semibold leading-tight text-[#1e2f46]">{certificateNumber || "—"}</div>
    {cityName && <div className="absolute left-[30%] top-[82%] w-[40%] text-center text-[clamp(6px,.75vw,12px)] font-semibold text-white/85">{cityName}</div>}
    {verificationQr && <img key={verificationQr} src={verificationQr} alt="Sertifika doğrulama QR kodu" className="absolute right-[7.2%] top-[64.5%] h-[10.3%] w-[10.3%] rounded bg-white p-1" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
  </div></div>{certificateNumber && <div className="relative z-10 flex flex-wrap justify-end gap-2 border-t border-white/10 bg-[#06162d] p-2"><button type="button" onClick={() => void download("png")} disabled={busy}>PNG</button><button type="button" onClick={() => void download("jpg")} disabled={busy}>JPG</button><button type="button" onClick={() => void download("pdf")} disabled={busy}>PDF / YAZDIR</button></div>}{busy && <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 text-sm font-semibold text-gold">SERTİFİKA HAZIRLANIYOR...</div>}{error && <p className="absolute bottom-14 left-3 right-3 z-20 rounded bg-red-950/90 p-2 text-center text-xs text-red-200">{error}</p>}</article>;
}

export const CERTIFICATE_TEMPLATES = (Object.keys(CERTIFICATE_TEMPLATE_IMAGES) as Tier[]).map((tier) => ({ tier, label: LABEL[tier], src: CERTIFICATE_TEMPLATE_IMAGES[tier] }));
