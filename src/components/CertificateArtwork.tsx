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
function buildCertificateSvg(template: string, values: { name: string; parcel: string; date: string; number: string; city: string }) {
  const safe = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, xmlEscape(value)])) as typeof values;
  const marker = '</svg>';
  const dynamic = `
    <text x="800" y="600" text-anchor="middle" fill="#f6d477" font-family="Georgia,serif" font-size="38" font-style="italic">${safe.name || 'Ad Soyad'}</text>
    <g font-family="Arial,sans-serif" text-anchor="middle">
      <text x="500" y="805" fill="#fff" font-size="20">${safe.parcel || '—'}</text>
      <text x="800" y="805" fill="#fff" font-size="20">${safe.date || '—'}</text>
      <text x="1100" y="805" fill="#fff" font-size="20">${safe.number || '—'}</text>
      ${safe.city ? `<text x="800" y="870" fill="#fff" fill-opacity=".82" font-size="18">${safe.city}</text>` : ''}
    </g>
  `;
  return template.replace(marker, `${dynamic}${marker}`);
}
export function CertificateArtwork({ tier, name, parcelCode, certificateNumber, issuedAt, cityName }: CertificateArtworkProps) {
  const meta = META[tier];
  const displayName = name?.trim() || 'Ad Soyad';
  const [downloading, setDownloading] = useState(false);
  const downloadCertificate = useCallback(async () => {
    if (!certificateNumber) return;
    setDownloading(true);
    try {
      const response = await fetch(meta.template);
      if (!response.ok) throw new Error(`Template fetch failed: ${response.status}`);
      const template = await response.text();
      const svg = buildCertificateSvg(template, { name: displayName, parcel: parcelCode || '—', date: dateTR(issuedAt), number: certificateNumber, city: cityName || '' });
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${certificateNumber}-${tier}.svg`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) { console.error('Certificate download failed', error); }
    finally { setDownloading(false); }
  }, [certificateNumber, cityName, displayName, issuedAt, meta.template, parcelCode, tier]);
  return <article className="relative mx-auto aspect-[1600/1067] w-full overflow-hidden rounded-xl bg-[#06162d] shadow-2xl" aria-label={meta.title}>
    <img src={meta.template} alt={meta.title} className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute left-[25%] right-[25%] top-[51%] h-[11%] flex items-center justify-center text-center"><p className="font-serif text-[clamp(15px,3vw,40px)] font-medium italic leading-none" style={{ color: meta.accent }}>{displayName}</p></div>
      <div className="absolute left-[24%] right-[24%] top-[69%] grid grid-cols-3 gap-3 text-center text-[clamp(6px,.8vw,13px)] text-white">
        <div className="rounded-md border border-[#d9ad49]/70 bg-[#07182e]/80 px-2 py-2"><span className="block text-white/60">PARSEL NO</span><strong>{parcelCode || '—'}</strong></div>
        <div className="rounded-md border border-[#d9ad49]/70 bg-[#07182e]/80 px-2 py-2"><span className="block text-white/60">TARİH</span><strong>{dateTR(issuedAt)}</strong></div>
        <div className="rounded-md border border-[#d9ad49]/70 bg-[#07182e]/80 px-2 py-2"><span className="block text-white/60">SERTİFİKA NO</span><strong>{certificateNumber || '—'}</strong></div>
      </div>
      {cityName && <div className="absolute left-[25%] right-[25%] top-[63%] text-center text-[clamp(6px,.8vw,12px)] text-white/75">{cityName}</div>}
    </div>
    {certificateNumber && <button type="button" onClick={() => void downloadCertificate()} disabled={downloading} className="absolute bottom-3 right-3 z-10 rounded-md border border-gold/40 bg-[#06162d]/90 px-3 py-2 text-[11px] font-semibold text-gold shadow-lg backdrop-blur-sm disabled:opacity-60">{downloading ? 'HAZIRLANIYOR...' : 'SERTİFİKAYI İNDİR'}</button>}
  </article>;
}
export const CERTIFICATE_TEMPLATES = [
  { tier: 'digital' as Tier, label: 'Dijital Gökyüzü Sertifikası', src: META.digital.template },
  { tier: 'elite' as Tier, label: 'Elit Gökyüzü Sertifikası', src: META.elite.template },
  { tier: 'premium' as Tier, label: 'Premium Gökyüzü Sertifikası', src: META.premium.template },
];
