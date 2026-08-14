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
const dateTR = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("tr-TR");
};

const PLATE_CODES: Record<string, string> = {
  adana: "01", adiyaman: "02", afyonkarahisar: "03", afyon: "03", agri: "04", amasya: "05", ankara: "06", antalya: "07", artvin: "08", aydin: "09", balikesir: "10", bilecik: "11", bingol: "12", bitlis: "13", bolu: "14", burdur: "15", bursa: "16", canakkale: "17", cankiri: "18", corum: "19", denizli: "20", diyarbakir: "21", edirne: "22", elazig: "23", erzincan: "24", erzurum: "25", eskisehir: "26", gaziantep: "27", giresun: "28", gumushane: "29", hakkari: "30", hatay: "31", isparta: "32", mersin: "33", istanbul: "34", izmir: "35", kars: "36", kastamonu: "37", kayseri: "38", kirklareli: "39", kirsehir: "40", kocaeli: "41", konya: "42", kutahya: "43", malatya: "44", manisa: "45", kahramanmaras: "46", maras: "46", mardin: "47", mugla: "48", mus: "49", nevsehir: "50", nigde: "51", ordu: "52", rize: "53", sakarya: "54", samsun: "55", siirt: "56", sinop: "57", sivas: "58", tekirdag: "59", tokat: "60", trabzon: "61", tunceli: "62", sanliurfa: "63", usak: "64", van: "65", yozgat: "66", zonguldak: "67", aksaray: "68", bayburt: "69", karaman: "70", kirikkale: "71", batman: "72", sirnak: "73", bartin: "74", ardahan: "75", igdir: "76", yalova: "77", karabuk: "78", kilis: "79", osmaniye: "80", duzce: "81",
};

const normalizeCity = (value?: string | null) =>
  (value || "").toLocaleLowerCase("tr-TR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/[^a-z0-9]/g, "");
const cityPlate = (city?: string | null) => PLATE_CODES[normalizeCity(city)] || "";
const parcelFieldText = (parcelCode?: string | null, cityName?: string | null) => {
  const parcel = (parcelCode || "").trim();
  const city = (cityName || (parcel.includes("-") ? parcel.split("-")[0] : "")).trim();
  const plate = cityPlate(city);
  const parcelNo = parcel.includes("-") ? parcel.slice(parcel.lastIndexOf("-") + 1).trim() : parcel;
  return plate && parcelNo ? `TR - ${plate} - ${parcelNo}` : parcel || "—";
};

const PRODUCTION_SUPABASE_URL = "https://agfxwddvobkhwbbrdzpt.supabase.co";
const qrUrl = (number: string, cacheKey?: string | null) => {
  const base = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || PRODUCTION_SUPABASE_URL;
  if (!base || !number) return "";
  const suffix = cacheKey ? `&v=${encodeURIComponent(cacheKey)}` : "";
  return `${base.replace(/\/$/, "")}/functions/v1/certificate-qr?code=${encodeURIComponent(number)}${suffix}`;
};

function loadImage(src: string, crossOrigin?: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    if (crossOrigin) image.crossOrigin = crossOrigin;
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Image failed: ${src}`));
    image.src = src;
  });
}

async function loadQrImage(url: string) {
  const response = await fetch(url, { method: "GET", cache: "no-store", headers: { Accept: "image/svg+xml,image/*" } });
  if (!response.ok) throw new Error(`QR HTTP ${response.status}`);
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    return await loadImage(objectUrl);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function loadTemplate(tier: Tier) {
  try {
    return await loadImage(CERTIFICATE_TEMPLATE_IMAGES[tier]);
  } catch {
    return await loadImage(CERTIFICATE_TEMPLATE_FALLBACK);
  }
}

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const LAYOUT = {
  name: { left: 24, width: 52, top: 43.5 },
  parcelField: { left: 34.5, width: 31, top: 57, height: 5.8 },
  parcel: { left: 78.6, width: 15.7, top: 40.8, height: 4.1 },
  date: { left: 78.6, width: 15.7, top: 48.8, height: 4.1 },
  number: { left: 78.6, width: 15.7, top: 56.7, height: 4.1 },
  qr: { right: 8.55, top: 64.45, size: 8.35 },
  signature: { left: 61, width: 20, top: 75.0, height: 7.5 },
} as const;

const SCRIPT_FONT = '"Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive';

function fitFont(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, start: number, min: number) {
  let size = start;
  while (size > min) {
    ctx.font = `400 ${size}px ${SCRIPT_FONT}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  return size;
}

async function render(
  tier: Tier,
  name: string,
  parcel: string,
  date: string,
  number: string,
  city: string,
  _latitude?: number | null,
  _longitude?: number | null,
  qrVersion?: string | null,
) {
  const bg = await loadTemplate(tier);
  const canvas = document.createElement("canvas");
  canvas.width = bg.naturalWidth;
  canvas.height = bg.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Referanstaki zarif el yazısı karakterini koru; isim alanını gerçek metne göre sığdır.
  const nameMax = canvas.width * (LAYOUT.name.width / 100) * 0.90;
  const nameSize = fitFont(ctx, name || "Ad Soyad", nameMax, canvas.width * 0.022, canvas.width * 0.0105);
  ctx.font = `400 italic ${nameSize}px ${SCRIPT_FONT}`;
  ctx.fillStyle = "#c79b38";
  ctx.shadowColor = "rgba(0,0,0,.20)";
  ctx.shadowBlur = canvas.width * 0.0012;
  ctx.fillText(name || "Ad Soyad", canvas.width * ((LAYOUT.name.left + LAYOUT.name.width / 2) / 100), canvas.height * (LAYOUT.name.top / 100));
  ctx.shadowBlur = 0;

  const valueX = canvas.width * ((LAYOUT.parcel.left + LAYOUT.parcel.width / 2) / 100);
  ctx.font = `600 ${canvas.width * 0.0089}px Arial, sans-serif`;
  ctx.fillStyle = "#1e2f46";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(parcel || "—", valueX, canvas.height * ((LAYOUT.parcel.top + LAYOUT.parcel.height) / 100));
  ctx.fillText(date || "—", valueX, canvas.height * ((LAYOUT.date.top + LAYOUT.date.height) / 100));
  ctx.fillText(number || "—", valueX, canvas.height * ((LAYOUT.number.top + LAYOUT.number.height) / 100));

  ctx.textBaseline = "middle";
  const parcelField = parcelFieldText(parcel, city);
  const fieldMax = canvas.width * (LAYOUT.parcelField.width / 100) * 0.93;
  const fieldSize = (() => {
    let size = canvas.width * 0.0195;
    while (size > canvas.width * 0.0105) {
      ctx.font = `600 ${size}px Arial, sans-serif`;
      if (ctx.measureText(parcelField).width <= fieldMax) break;
      size -= 1;
    }
    return size;
  })();
  ctx.font = `600 ${fieldSize}px Arial, sans-serif`;
  ctx.fillStyle = "#20324a";
  ctx.fillText(parcelField, canvas.width * ((LAYOUT.parcelField.left + LAYOUT.parcelField.width / 2) / 100), canvas.height * ((LAYOUT.parcelField.top + LAYOUT.parcelField.height / 2) / 100));

  // Referanstaki imza görünümü: ince, eğimli ve gerçek imza hissi veren metin.
  ctx.font = `400 italic ${canvas.width * 0.0205}px ${SCRIPT_FONT}`;
  ctx.fillStyle = "#1e2f46";
  ctx.save();
  ctx.translate(canvas.width * ((LAYOUT.signature.left + LAYOUT.signature.width / 2) / 100), canvas.height * ((LAYOUT.signature.top + LAYOUT.signature.height / 2) / 100));
  ctx.rotate(-0.055);
  ctx.fillText("MySkyParcel", 0, 0);
  ctx.restore();

  const qr = qrUrl(number, qrVersion);
  if (qr) {
    const image = await loadQrImage(qr);
    const size = Math.round(canvas.width * (LAYOUT.qr.size / 100));
    const qx = Math.round(canvas.width * (1 - LAYOUT.qr.right / 100) - size);
    const qy = Math.round(canvas.height * (LAYOUT.qr.top / 100));
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, qx, qy, size, size);
    ctx.imageSmoothingEnabled = true;
  }

  return canvas;
}

export function CertificateArtwork({ tier, name, parcelCode, certificateNumber, issuedAt, cityName, latitude, longitude }: Props) {
  const displayName = name?.trim() || "Ad Soyad";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrVersion = issuedAt || certificateNumber || "1";
  const parcelField = parcelFieldText(parcelCode, cityName);
  const verificationQr = certificateNumber ? qrUrl(certificateNumber, qrVersion) : "";

  const make = useCallback(
    () => render(tier, displayName, parcelCode || "—", dateTR(issuedAt), certificateNumber || "—", cityName || "", latitude, longitude, qrVersion),
    [tier, displayName, parcelCode, issuedAt, certificateNumber, cityName, latitude, longitude, qrVersion],
  );

  const download = useCallback(async (type: "png" | "jpg" | "pdf") => {
    if (!certificateNumber) return;
    setBusy(true);
    setError(null);
    try {
      const canvas = await make();
      if (type === "pdf") {
        const win = window.open("", "_blank");
        if (!win) throw new Error("popup");
        win.document.write(`<html><head><title>${certificateNumber}</title><style>@page{size:A4 landscape;margin:0}html,body{margin:0;height:100%}img{width:100%;height:100%;object-fit:contain}</style></head><body><img src="${canvas.toDataURL("image/png")}"></body></html>`);
        win.document.close();
        setTimeout(() => win.print(), 500);
      } else {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type === "png" ? "image/png" : "image/jpeg", 1));
        if (!blob) throw new Error(type);
        save(blob, `${certificateNumber}-${tier}.${type}`);
      }
    } catch (err) {
      console.error(err);
      setError("Sertifika oluşturulamadı. Lütfen tekrar deneyin");
    } finally {
      setBusy(false);
    }
  }, [certificateNumber, make, tier]);

  const templateSrc = CERTIFICATE_TEMPLATE_IMAGES[tier];
  return (
    <article className="relative mx-auto w-full overflow-hidden rounded-xl bg-black shadow-2xl" aria-label={LABEL[tier]}>
      <div className="relative">
        <img src={templateSrc} alt={LABEL[tier]} onError={(event) => { const image = event.currentTarget; if (image.src.endsWith(CERTIFICATE_TEMPLATE_FALLBACK)) return; image.src = CERTIFICATE_TEMPLATE_FALLBACK; }} className="block aspect-[1600/1067] h-auto w-full object-cover" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[24%] top-[43.5%] flex h-[7%] w-[52%] items-center justify-center text-center">
            <span style={{ fontFamily: SCRIPT_FONT, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.025em" }} className="text-[clamp(15px,2.25vw,31px)] leading-none text-[#c79b38] drop-shadow-[0_1px_2px_rgba(0,0,0,.22)]">{displayName}</span>
          </div>
          <div className="absolute left-[34.5%] top-[57%] flex h-[5.8%] w-[31%] items-center justify-center text-center">
            <span className="font-sans text-[clamp(10px,1.35vw,22px)] font-semibold leading-none tracking-[.18em] text-[#20324a]">{parcelField}</span>
          </div>
          <div className="absolute left-[78.6%] top-[40.8%] flex h-[4.1%] w-[15.7%] items-end justify-center text-center"><span className="translate-y-[1px] font-sans text-[clamp(6px,.89vw,13px)] font-semibold leading-none text-[#1e2f46]">{parcelCode || "—"}</span></div>
          <div className="absolute left-[78.6%] top-[48.8%] flex h-[4.1%] w-[15.7%] items-end justify-center text-center"><span className="-translate-y-[1px] font-sans text-[clamp(6px,.89vw,13px)] font-semibold leading-none text-[#1e2f46]">{dateTR(issuedAt)}</span></div>
          <div className="absolute left-[78.6%] top-[56.7%] flex h-[4.1%] w-[15.7%] items-end justify-center text-center"><span className="translate-y-[1px] font-sans text-[clamp(6px,.89vw,13px)] font-semibold leading-none text-[#1e2f46]">{certificateNumber || "—"}</span></div>
          <div className="absolute left-[61%] top-[75%] flex h-[7.5%] w-[20%] items-center justify-center text-center">
            <span style={{ fontFamily: SCRIPT_FONT, fontStyle: "italic", fontWeight: 400, letterSpacing: "-0.04em", transform: "rotate(-3deg)" }} className="text-[clamp(16px,2.05vw,31px)] leading-none text-[#1e2f46]">MySkyParcel</span>
          </div>
          {verificationQr && (
            <div className="absolute right-[8.55%] top-[64.45%] flex aspect-square w-[8.35%] items-center justify-center overflow-hidden rounded-[2px] bg-transparent p-0">
              <img key={verificationQr} src={verificationQr} alt="Sertifika doğrulama QR kodu" className="block h-full w-full object-fill" onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />
            </div>
          )}
        </div>
      </div>
      {certificateNumber && <div className="relative z-10 flex flex-wrap justify-end gap-2 border-t border-white/10 bg-[#06162d] p-2"><button type="button" onClick={() => void download("png")} disabled={busy}>PNG</button><button type="button" onClick={() => void download("jpg")} disabled={busy}>JPG</button><button type="button" onClick={() => void download("pdf")} disabled={busy}>PDF / YAZDIR</button></div>}
      {busy && <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 text-sm font-semibold text-gold">SERTİFİKA HAZIRLANIYOR...</div>}
      {error && <p className="absolute bottom-14 left-3 right-3 z-20 rounded bg-red-950/90 p-2 text-center text-xs text-red-200">{error}</p>}
    </article>
  );
}

export const CERTIFICATE_TEMPLATES = (Object.keys(CERTIFICATE_TEMPLATE_IMAGES) as Tier[]).map((tier) => ({ tier, label: LABEL[tier], src: CERTIFICATE_TEMPLATE_IMAGES[tier] }));
