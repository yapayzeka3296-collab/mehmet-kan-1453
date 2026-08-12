import React from 'react';

type Tier = 'digital' | 'elite' | 'premium';
type CertificateArtworkProps = { tier: Tier; name?: string | null; parcelCode?: string | null; certificateNumber?: string | null; issuedAt?: string | null; cityName?: string | null };
const META: Record<Tier, { title: string; template: string; accent: string }> = {
  digital: { title: 'DİJİTAL GÖKYÜZÜ SERTİFİKASI', template: '/certificates/digital-template.svg', accent: '#f5d47b' },
  elite: { title: 'ELİT GÖKYÜZÜ SERTİFİKASI', template: '/certificates/elite-template.svg', accent: '#c9983d' },
  premium: { title: 'PREMİUM GÖKYÜZÜ SERTİFİKASI', template: '/certificates/premium-template.svg', accent: '#f6d77d' },
};
function dateTR(value?: string | null) { if (!value) return '—'; const d = new Date(value); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('tr-TR'); }
export function CertificateArtwork({ tier, name, parcelCode, certificateNumber, issuedAt, cityName }: CertificateArtworkProps) {
  const meta = META[tier]; const displayName = name?.trim() || 'MySkyParcel Koleksiyoncusu';
  return <article className="relative mx-auto aspect-[1600/1067] w-full overflow-hidden rounded-2xl bg-black shadow-2xl" aria-label={meta.title}>
    <img src={meta.template} alt={meta.title} className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute left-[24%] right-[24%] top-[46%] text-center"><p className="font-serif text-[clamp(15px,3.4vw,48px)] font-medium leading-none" style={{ color: meta.accent }}>{displayName}</p><div className="mx-auto mt-2 h-px w-[82%]" style={{ backgroundColor: meta.accent, opacity: .65 }} /></div>
      <div className="absolute bottom-[18%] left-[20%] right-[20%] grid grid-cols-4 gap-2 text-center text-[clamp(5px,.75vw,10px)] text-white/80">
        <div><span className="block opacity-50">PARSEL</span><strong>{parcelCode || '—'}</strong></div><div><span className="block opacity-50">İL</span><strong>{cityName || '—'}</strong></div><div><span className="block opacity-50">SERTİFİKA NO</span><strong>{certificateNumber || '—'}</strong></div><div><span className="block opacity-50">TARİH</span><strong>{dateTR(issuedAt)}</strong></div>
      </div>
    </div>
  </article>;
}
export const CERTIFICATE_TEMPLATES = [
  { tier: 'digital' as Tier, label: 'Dijital Gökyüzü Sertifikası', src: META.digital.template },
  { tier: 'elite' as Tier, label: 'Elit Gökyüzü Sertifikası', src: META.elite.template },
  { tier: 'premium' as Tier, label: 'Premium Gökyüzü Sertifikası', src: META.premium.template },
];
