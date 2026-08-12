import React from 'react';

type Tier = 'digital' | 'elite' | 'premium';

type CertificateArtworkProps = {
  tier: Tier;
  name?: string | null;
  parcelCode?: string | null;
  certificateNumber?: string | null;
  issuedAt?: string | null;
  cityName?: string | null;
};

const META: Record<Tier, { title: string; subtitle: string; accent: string; seal: string }> = {
  digital: { title: 'DİJİTAL GÖKYÜZÜ SERTİFİKASI', subtitle: 'MySkyParcel Koleksiyonu', accent: 'text-sky-200', seal: 'DİJİTAL' },
  elite: { title: 'ELİT GÖKYÜZÜ SERTİFİKASI', subtitle: 'MySkyParcel Özel Koleksiyonu', accent: 'text-amber-200', seal: 'ELİT' },
  premium: { title: 'PREMİUM GÖKYÜZÜ SERTİFİKASI', subtitle: 'MySkyParcel Prestij Koleksiyonu', accent: 'text-yellow-100', seal: 'PREMİUM' },
};

function dateTR(value?: string | null) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('tr-TR');
}

export function CertificateArtwork({ tier, name, parcelCode, certificateNumber, issuedAt, cityName }: CertificateArtworkProps) {
  const meta = META[tier];
  const displayName = name?.trim() || 'MySkyParcel Koleksiyoncusu';

  return (
    <article className={`relative mx-auto aspect-[1.414/1] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/20 bg-[#07111f] text-white shadow-2xl ${tier === 'premium' ? 'ring-1 ring-yellow-300/30' : ''}`} aria-label={meta.title}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,.12),transparent_35%),linear-gradient(135deg,#07111f,#111827 55%,#07111f)]" />
      <div className="absolute inset-[3%] rounded-xl border border-white/20" />
      <div className="absolute inset-[4%] rounded-lg border border-white/10" />

      <div className="absolute left-[8%] top-[8%] text-[clamp(7px,1vw,13px)] tracking-[0.28em] text-white/60">MYSKYPARCEL.COM</div>
      <div className="absolute right-[8%] top-[7%] flex h-[clamp(28px,6vw,72px)] w-[clamp(28px,6vw,72px)] items-center justify-center rounded-full border border-white/25 bg-white/5 text-[clamp(5px,0.8vw,10px)] tracking-[0.15em] text-white/70">{meta.seal}</div>

      <div className="absolute left-[10%] right-[10%] top-[24%] text-center">
        <p className="text-[clamp(6px,1vw,12px)] tracking-[0.4em] text-white/55">MY SKY • MY PARCEL</p>
        <h1 className={`mt-3 font-serif text-[clamp(17px,3.6vw,48px)] font-semibold tracking-[0.08em] ${meta.accent}`}>{meta.title}</h1>
        <p className="mt-2 text-[clamp(7px,1.1vw,14px)] tracking-[0.18em] text-white/55">{meta.subtitle}</p>
      </div>

      <div className="absolute left-[12%] right-[12%] top-[48%] text-center">
        <p className="text-[clamp(6px,0.9vw,11px)] uppercase tracking-[0.3em] text-white/45">Bu sertifika</p>
        <div className="mt-3 border-b border-white/20 pb-3">
          <p className={`font-serif text-[clamp(18px,4vw,54px)] font-medium ${meta.accent}`}>{displayName}</p>
        </div>
        <p className="mt-3 text-[clamp(6px,0.9vw,11px)] tracking-[0.18em] text-white/55">gökyüzündeki sembolik dijital parsel koleksiyonunun sahibidir.</p>
      </div>

      <div className="absolute bottom-[8%] left-[9%] right-[9%] grid grid-cols-4 gap-2 border-t border-white/15 pt-3 text-center text-[clamp(5px,0.75vw,10px)]">
        <div><span className="block uppercase tracking-wider text-white/40">Parsel</span><strong className="mt-1 block truncate text-white/85">{parcelCode || '—'}</strong></div>
        <div><span className="block uppercase tracking-wider text-white/40">İl</span><strong className="mt-1 block truncate text-white/85">{cityName || '—'}</strong></div>
        <div><span className="block uppercase tracking-wider text-white/40">Sertifika No</span><strong className="mt-1 block truncate text-white/85">{certificateNumber || '—'}</strong></div>
        <div><span className="block uppercase tracking-wider text-white/40">Tarih</span><strong className="mt-1 block truncate text-white/85">{dateTR(issuedAt)}</strong></div>
      </div>
    </article>
  );
}
