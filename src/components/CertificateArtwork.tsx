import React, { useCallback, useState } from 'react';

type Tier = 'digital' | 'elite' | 'premium';
type CertificateArtworkProps = { tier: Tier; name?: string | null; parcelCode?: string | null; certificateNumber?: string | null; issuedAt?: string | null; cityName?: string | null };
const META: Record<Tier, { title: string; template: string; accent: string }> = {
  digital: { title: 'DİJİTAL GÖKYÜZÜ SERTİFİKASI', template: '/certificates/digital-template.svg', accent: '#f5d47b' },
  elite: { title: 'ELİT GÖKYÜZÜ SERTİFİKASI', template: '/certificates/elite-template.svg', accent: '#e2b452' },
  premium: { title: 'PREMİUM GÖKYÜZÜ SERTİFİKASI', template: '/certificates/premium-template.svg', accent: '#f3cf69' },
};
function dateTR(value?: string | null) { if (!value) return '—'; const d = new Date(value); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('tr-TR'); }
function xmlEscape(value: string) { return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char] ?? char); }
function verificationUrl(certificateNumber: string) { return `${window.location.origin}/sertifika-dogrula?code=${encodeURIComponent(certificateNumber)}`; }
function qrUrl(certificateNumber: string) { return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&data=${encodeURIComponent(verificationUrl(certificateNumber))}`; }
async function imageToDataUrl(url: string) { const response = await fetch(url, { mode: 'cors' }); if (!response.ok) throw new Error(`QR fetch failed: ${response.status}`); const blob = await response.blob(); return await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onloadend = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(blob); }); }
function buildCertificateSvg(template: string, values: { name: string; parcel: string; date: string; number: string; city: string; qrDataUrl?: string }) {
  const safe = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, xmlEscape(value ?? '')])) as typeof values;
  let result = template.replace('>Ad Soyad<', `>${safe.name || 'Ad Soyad'}<`);
  const marker = '</svg>';
  const dynamic = `
    <g font-family="Arial,sans-serif" text-anchor="middle">
      <text x="500" y="805" fill="#fff" font-size="20">${safe.parcel || '—'}</text>
      <text x="800" y="805" fill="#fff" font-size="20">${safe.date || '—'}</text>
      <text x="1100" y="805" fill="#fff" font-size="20">${safe.number || '—'}</text>
      ${safe.city ? `<text x="800" y="870" fill="#fff" fill-opacity=".82" font-size="18">${safe.city}</text>` : ''}
    </g>
    ${safe.qrDataUrl ? `<image href="${safe.qrDataUrl}" x="1330" y="680" width="170" height="170" preserveAspectRatio="xMidYMid meet"/><text x="1415" y="865" fill="#fff" font-family="Arial,sans-serif" font-size="13" text-anchor="middle">DOĞRULAMA QR</text>` : ''}
  `;
  return result.replace(marker, `${dynamic}${marker}`);
}
function downloadBlob(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
export function CertificateArtwork({ tier, name, parcelCode, certificateNumber, issuedAt, cityName }: CertificateArtworkProps) {
  const meta = META[tier]; const displayName = name?.trim() || 'Ad Soyad'; const [working, setWorking] = useState(false); const [error, setError] = useState<string | null>(null);
  const makeSvg = useCallback(async () => {
    if (!certificateNumber) throw new Error('certificate_number_missing');
    const response = await fetch(meta.template); if (!response.ok) throw new Error(`Template fetch failed: ${response.status}`);
    const template = await response.text();
    let qrDataUrl = ''; try { qrDataUrl = await imageToDataUrl(qrUrl(certificateNumber)); } catch (qrError) { console.warn('QR could not be embedded; certificate remains downloadable.', qrError); }
    return buildCertificateSvg(template, { name: displayName, parcel: parcelCode || '—', date: dateTR(issuedAt), number: certificateNumber, city: cityName || '', qrDataUrl });
  }, [certificateNumber, cityName, displayName, issuedAt, meta.template, parcelCode]);
  const downloadSvg = useCallback(async () => { setWorking(true); setError(null); try { const svg = await makeSvg(); downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), `${certificateNumber}-${tier}.svg`); } catch (e) { console.error(e); setError('Sertifika indirilemedi. Lütfen tekrar deneyin.'); } finally { setWorking(false); } }, [certificateNumber, makeSvg, tier]);
  const downloadPng = useCallback(async () => { setWorking(true); setError(null); try { const svg = await makeSvg(); const svgUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })); const img = new Image(); img.crossOrigin = 'anonymous'; img.src = svgUrl; await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('SVG render failed')); }); const canvas = document.createElement('canvas'); canvas.width = 2400; canvas.height = 1601; const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('Canvas unavailable'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(svgUrl); const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 1)); if (!blob) throw new Error('PNG conversion failed'); downloadBlob(blob, `${certificateNumber}-${tier}.png`); } catch (e) { console.error(e); setError('PNG oluşturulamadı. SVG olarak indirebilirsiniz.'); } finally { setWorking(false); } }, [certificateNumber, makeSvg, tier]);
  const printPdf = useCallback(async () => { setWorking(true); setError(null); try { const svg = await makeSvg(); const win = window.open('', '_blank', 'noopener,noreferrer'); if (!win) throw new Error('popup_blocked'); win.document.write(`<html><head><title>${certificateNumber}</title><style>@page{size:A4 landscape;margin:0}html,body{margin:0;width:100%;height:100%;background:#fff}img{display:block;width:100%;height:100%;object-fit:contain}</style></head><body><img src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}" alt="MySkyParcel Sertifikası" /></body></html>`); win.document.close(); setTimeout(() => win.print(), 500); } catch (e) { console.error(e); setError('PDF yazdırma ekranı açılamadı. Tarayıcı açılır pencere iznini kontrol edin.'); } finally { setWorking(false); } }, [certificateNumber, makeSvg]);
  return <article className="relative mx-auto aspect-[1600/1067] w-full overflow-hidden rounded-xl bg-[#06162d] shadow-2xl" aria-label={meta.title}>
    <img src={meta.template} alt={meta.title} className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute left-[25%] right-[25%] top-[51%] h-[11%] flex items-center justify-center text-center"><p className="font-serif text-[clamp(15px,3vw,40px)] font-medium italic leading-none" style={{ color: meta.accent }}>{displayName}</p></div>
      <div className="absolute left-[24%] right-[24%] top-[69%] grid grid-cols-3 gap-3 text-center text-[clamp(6px,.8vw,13px)] text-white"><div><span className="block text-white/60">PARSEL NO</span><strong>{parcelCode || '—'}</strong></div><div><span className="block text-white/60">TARİH</span><strong>{dateTR(issuedAt)}</strong></div><div><span className="block text-white/60">SERTİFİKA NO</span><strong>{certificateNumber || '—'}</strong></div></div>
      {cityName && <div className="absolute left-[25%] right-[25%] top-[63%] text-center text-[clamp(6px,.8vw,12px)] text-white/75">{cityName}</div>}
      {certificateNumber && <img src={qrUrl(certificateNumber)} alt="Sertifika doğrulama QR kodu" className="absolute right-[3.5%] top-[64%] h-[11%] w-[11%] rounded bg-white p-1" />}
    </div>
    {certificateNumber && <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => void downloadSvg()} disabled={working} className="rounded-md border border-gold/40 bg-[#06162d]/95 px-3 py-2 text-[11px] font-semibold text-gold shadow-lg disabled:opacity-60">SVG</button><button type="button" onClick={() => void downloadPng()} disabled={working} className="rounded-md border border-gold/40 bg-[#06162d]/95 px-3 py-2 text-[11px] font-semibold text-gold shadow-lg disabled:opacity-60">PNG</button><button type="button" onClick={() => void printPdf()} disabled={working} className="rounded-md border border-gold/40 bg-[#06162d]/95 px-3 py-2 text-[11px] font-semibold text-gold shadow-lg disabled:opacity-60">PDF / YAZDIR</button></div>}
    {working && <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#06162d]/60 text-sm font-semibold text-gold">SERTİFİKA HAZIRLANIYOR...</div>}
    {error && <p className="absolute bottom-16 left-3 right-3 z-20 rounded-md bg-red-950/90 p-2 text-center text-[11px] text-red-200">{error}</p>}
  </article>;
}
export const CERTIFICATE_TEMPLATES = [
  { tier: 'digital' as Tier, label: 'Dijital Gökyüzü Sertifikası', src: META.digital.template },
  { tier: 'elite' as Tier, label: 'Elit Gökyüzü Sertifikası', src: META.elite.template },
  { tier: 'premium' as Tier, label: 'Premium Gökyüzü Sertifikası', src: META.premium.template },
];
