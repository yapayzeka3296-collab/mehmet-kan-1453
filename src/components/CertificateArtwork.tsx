import { Award, ShieldCheck, Star } from "lucide-react";

type CertificateArtworkProps = {
  tier: "digital" | "elite" | "premium";
  name?: string | null;
  parcelCode?: string | null;
  certificateNumber?: string | null;
  issuedAt?: string | null;
};

const TIER_META = {
  digital: {
    label: "DİJİTAL SERTİFİKA",
    subtitle: "Dijital Koleksiyon Katılım Belgesi",
    shell: "bg-[#f3f0e8] text-[#16233a] border-[#b99a5a]",
    inner: "border-[#b99a5a]/70",
    accent: "text-[#a77c2d]",
    muted: "text-[#536071]",
    mark: "bg-[#e7dfcf] border-[#b99a5a]/60",
  },
  elite: {
    label: "ELİT SERTİFİKA",
    subtitle: "Özel Dijital Koleksiyon Katılım Belgesi",
    shell: "bg-[#111722] text-[#f1e7d2] border-[#b08a42]",
    inner: "border-[#b08a42]/70",
    accent: "text-[#d1a34f]",
    muted: "text-[#b9b7b0]",
    mark: "bg-[#1b2230] border-[#b08a42]/60",
  },
  premium: {
    label: "PREMİUM SERTİFİKA",
    subtitle: "Premium Dijital Koleksiyon Katılım Belgesi",
    shell: "bg-[#080b10] text-[#f4ead4] border-[#d0a84d]",
    inner: "border-[#d0a84d]/75",
    accent: "text-[#e0b657]",
    muted: "text-[#aaa79f]",
    mark: "bg-[#10141c] border-[#d0a84d]/65",
  },
} as const;

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("tr-TR");
}

export function CertificateArtwork({
  tier,
  name,
  parcelCode,
  certificateNumber,
  issuedAt,
}: CertificateArtworkProps) {
  const meta = TIER_META[tier];
  const displayName = name?.trim() || "MySkyParcel Koleksiyoncusu";

  return (
    <div className={`relative aspect-[1.414/1] overflow-hidden rounded-xl border-2 p-4 shadow-2xl sm:p-6 ${meta.shell}`}>
      <div className={`pointer-events-none absolute inset-2 rounded-lg border ${meta.inner}`} />
      <div className="pointer-events-none absolute -left-10 -top-10 h-28 w-28 rounded-full border opacity-30" />
      <div className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full border opacity-25" />

      <div className="relative flex h-full flex-col items-center justify-between text-center">
        <div className="flex items-center gap-2 text-[9px] font-semibold tracking-[0.3em] sm:text-[11px]">
          <Star className={`h-3.5 w-3.5 ${meta.accent}`} />
          MYSKYPARCEL · TÜRKİYE
          <Star className={`h-3.5 w-3.5 ${meta.accent}`} />
        </div>

        <div className="mt-1">
          <div className={`mx-auto grid h-10 w-10 place-items-center rounded-full border ${meta.mark}`}>
            {tier === "premium" ? (
              <Star className={`h-5 w-5 ${meta.accent}`} />
            ) : tier === "elite" ? (
              <ShieldCheck className={`h-5 w-5 ${meta.accent}`} />
            ) : (
              <Award className={`h-5 w-5 ${meta.accent}`} />
            )}
          </div>
          <p className={`mt-2 font-display text-base font-bold tracking-[0.12em] sm:text-xl ${meta.accent}`}>
            {meta.label}
          </p>
          <p className={`mt-1 text-[8px] tracking-[0.16em] sm:text-[10px] ${meta.muted}`}>{meta.subtitle}</p>
        </div>

        <div className="w-full max-w-xl">
          <p className={`text-[8px] uppercase tracking-[0.25em] ${meta.muted}`}>Bu belge</p>
          <p className="mt-1 font-display text-base font-semibold sm:text-xl">{displayName}</p>
          <p className={`mt-1 text-[9px] sm:text-[11px] ${meta.muted}`}>
            MySkyParcel dijital koleksiyon ve deneyim ekosistemine katılımını temsil eder.
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 border-y py-2.5 text-left text-[8px] sm:text-[10px]">
          <div>
            <p className={meta.muted}>PARSEL KODU</p>
            <p className={`mt-0.5 font-semibold ${meta.accent}`}>{parcelCode || "—"}</p>
          </div>
          <div className="text-right">
            <p className={meta.muted}>SERTİFİKA NO</p>
            <p className="mt-0.5 font-semibold">{certificateNumber || "Talep aşamasında"}</p>
          </div>
        </div>

        <div className="flex w-full items-end justify-between text-[7px] sm:text-[9px]">
          <div className="text-left">
            <p className={meta.muted}>DÜZENLENME TARİHİ</p>
            <p className="mt-0.5">{formatDate(issuedAt)}</p>
          </div>
          <div className={`rounded-full border px-2 py-1 font-semibold tracking-[0.12em] ${meta.inner} ${meta.accent}`}>
            DİJİTAL BELGE
          </div>
        </div>

        <p className={`max-w-2xl text-[6.5px] leading-tight sm:text-[8px] ${meta.muted}`}>
          Bu belge, MySkyParcel dijital koleksiyon ve deneyim ekosistemine katılımı temsil eder. Herhangi bir taşınmaz mülkiyeti, tapu veya ayni hak devri anlamına gelmez.
        </p>
      </div>
    </div>
  );
}
