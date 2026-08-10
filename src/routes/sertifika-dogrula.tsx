import { createFileRoute } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useState } from "react";
import { QrCode, Search, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export const Route = createFileRoute("/sertifika-dogrula")({
  validateSearch: (search) => ({
    code: typeof search["code"] === "string" ? search["code"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Sertifika Doğrula — MySkyParcel" },
      { name: "description", content: "Sertifika numarasını girerek sertifikanın geçerliliğini kontrol et." },
      { property: "og:title", content: "Sertifika Doğrula — MySkyParcel" },
      { property: "og:description", content: "QR kod veya sertifika numarası ile doğrulama." },
    ],
  }),
  component: Dogrula,
});

type VerificationResult = {
  certificate_number: string;
  status: "issued";
  issued_at: string | null;
  parcel_number: string;
  city_code: string | null;
  city_name: string | null;
  tier: "digital" | "elite" | "premium";
};

const TIER_LABELS = { digital: "Dijital", elite: "Elit", premium: "Premium" } as const;
const CERTIFICATE_PATTERN = /^[A-Z0-9-]{4,80}$/i;

function Dogrula() {
  const { code: initialCode } = Route.useSearch();
  const [code, setCode] = useState(initialCode);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setMessage(null);

    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setMessage("Lütfen sertifika numaranızı girin.");
      return;
    }
    if (!CERTIFICATE_PATTERN.test(normalized)) {
      setMessage("Sertifika numarası geçersiz formatta.");
      return;
    }
    if (!supabaseBrowser) {
      setMessage("Doğrulama servisi şu anda yapılandırılmamış.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabaseBrowser.rpc("verify_certificate", {
      p_certificate_number: normalized,
    });
    setLoading(false);

    if (error) {
      setMessage("Sertifika doğrulanamadı. Lütfen tekrar deneyin.");
      return;
    }

    const verified = Array.isArray(data) ? data[0] : data;
    if (!verified) {
      setMessage("Bu sertifika numarası bulunamadı veya geçerli değil.");
      return;
    }

    setResult(verified as VerificationResult);
  }

  return (
    <div className="min-h-screen bg-[#071426] text-white">
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#d6b15a]">Dijital Sertifika</p>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Sertifikanı Doğrula</h1>
            <p className="mt-4 text-white/70">Sertifika numaranı girerek gerçekliğini güvenli şekilde kontrol edebilirsin.</p>
          </div>

          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl sm:p-7">
            <form onSubmit={handleSubmit} noValidate>
              <label htmlFor="certificate-code" className="text-sm font-medium text-white/85">
                Sertifika numarası
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  id="certificate-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  aria-label="Sertifika numarası"
                  aria-invalid={message ? true : undefined}
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-[#d6b15a] focus:ring-2 focus:ring-[#d6b15a]/30"
                  placeholder="SP-GZT-0004207"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#d6b15a] px-6 py-3 font-semibold text-[#071426] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  {loading ? "Doğrulanıyor..." : "Doğrula"}
                </button>
              </div>
              <p className="mt-2 text-xs text-white/50">Sertifika kodu 4–80 karakter arasında harf, rakam ve tire içermelidir.</p>
            </form>

            {message && (
              <div role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                {message}
              </div>
            )}

            {result && (
              <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-5" role="status" aria-live="polite">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden="true" />
                  <div className="min-w-0">
                    <h2 className="font-semibold text-emerald-100">Sertifika doğrulandı</h2>
                    <dl className="mt-3 grid gap-2 text-sm text-white/80 sm:grid-cols-2">
                      <div><dt className="text-white/50">Sertifika</dt><dd className="break-all">{result.certificate_number}</dd></div>
                      <div><dt className="text-white/50">Parsel</dt><dd className="break-all">{result.parcel_number}</dd></div>
                      <div><dt className="text-white/50">Şehir</dt><dd>{result.city_name ?? result.city_code ?? "—"}</dd></div>
                      <div><dt className="text-white/50">Paket</dt><dd>{TIER_LABELS[result.tier]}</dd></div>
                      <div><dt className="text-white/50">Düzenlenme</dt><dd>{result.issued_at ? new Date(result.issued_at).toLocaleDateString("tr-TR") : "—"}</dd></div>
                    </dl>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-white/60">
              <QrCode className="h-5 w-5 shrink-0 text-[#d6b15a]" aria-hidden="true" />
              <span>QR kodlu sertifikalarda da aynı doğrulama numarası kullanılabilir.</span>
            </div>
          </div>
        </section>
        <TrustBar items={SECURITY_TRUST} />
      </main>
      <SiteFooter />
    </div>
  );
}
