import { useState } from "react";
import { CertificateArtwork } from "@/components/CertificateArtwork";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

type Row = Record<string, any>;

const TIER_LABELS = { digital: "Dijital", elite: "Elit", premium: "Premium" } as const;

export function AdminCertificateList({ rows }: { rows: Row[] }) {
  const [selected, setSelected] = useState<Row | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [parcelNumber, setParcelNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function openCertificate(certificate: Row) {
    setSelected(certificate);
    setOwnerName("");
    setParcelNumber("");
    setError("");
    if (!supabaseBrowser) return;
    setLoading(true);
    const [{ data: profile }, { data: parcel }, profileResult, parcelResult] = await Promise.all([
      supabaseBrowser.from("profiles").select("full_name").eq("id", certificate.user_id).maybeSingle(),
      supabaseBrowser.from("parcels").select("parcel_number").eq("id", certificate.parcel_id).maybeSingle(),
      Promise.resolve(null),
      Promise.resolve(null),
    ]);
    void profileResult;
    void parcelResult;
    if (profile) setOwnerName(profile.full_name?.trim() || "");
    if (parcel) setParcelNumber(parcel.parcel_number || "");
    setLoading(false);
  }

  if (selected) {
    const parcel = parcelNumber || selected.parcel_id || "—";
    const name = ownerName || "Ad Soyad";
    return <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div><h2 className="font-semibold">Oluşturulan Sertifika</h2><p className="mt-1 text-xs text-muted-foreground">Sertifikaya tıklayarak tam görünümü açtınız.</p></div>
        <button type="button" onClick={() => setSelected(null)} className="rounded-md border border-border px-3 py-2 text-xs hover:border-gold">Listeye dön</button>
      </div>
      {loading ? <p className="p-6 text-center text-sm text-muted-foreground">Sertifika bilgileri yükleniyor...</p> : <CertificateArtwork tier={selected.tier} name={name} parcelCode={parcel} certificateNumber={selected.certificate_number} issuedAt={selected.issued_at || selected.requested_at} cityName={parcel.includes("-") ? parcel.split("-")[0] : undefined} />}
      {error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}
    </div>;
  }

  return <div className="panel overflow-auto p-5">
    <h2 className="mb-1 font-semibold">Mevcut sertifikalar</h2>
    <p className="mb-4 text-xs text-muted-foreground">Bir sertifikaya tıklayarak gerçek şablon üzerindeki bilgileri ve PDF/YAZDIR seçeneklerini görüntüleyin.</p>
    <table className="w-full min-w-[760px] text-left text-xs"><thead><tr className="border-b border-border text-muted-foreground"><th className="px-2 py-2">Sertifika No</th><th className="px-2 py-2">Parsel</th><th className="px-2 py-2">Statü</th><th className="px-2 py-2">Durum</th><th className="px-2 py-2">Tarih</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} onClick={() => void openCertificate(row)} className="cursor-pointer border-b border-border/50 hover:bg-accent"><td className="px-2 py-3 font-medium text-gold">{row.certificate_number || "—"}</td><td className="px-2 py-3">{row.parcel_id}</td><td className="px-2 py-3">{TIER_LABELS[row.tier as keyof typeof TIER_LABELS] || row.tier}</td><td className="px-2 py-3">{row.status}</td><td className="px-2 py-3">{row.issued_at ? new Date(row.issued_at).toLocaleDateString("tr-TR") : new Date(row.requested_at).toLocaleDateString("tr-TR")}</td></tr>)}</tbody></table>
    {!rows.length && <p className="p-6 text-center text-sm text-muted-foreground">Henüz sertifika kaydı yok.</p>}
  </div>;
}
