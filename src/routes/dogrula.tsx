import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/dogrula")({
  head: () => ({
    meta: [
      { title: "E-posta Doğrulama — MySkyParcel" },
      { name: "description", content: "MySkyParcel e-posta doğrulama sonucu." },
    ],
  }),
  component: Dogrula,
});

function Dogrula() {
  const { user, loading } = useAuth();
  const [linkError, setLinkError] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hasAuthError = Boolean(
      params.get("error") ||
        params.get("error_code") ||
        params.get("error_description") ||
        hash.get("error") ||
        hash.get("error_code") ||
        hash.get("error_description"),
    );

    setLinkError(hasAuthError);
  }, []);

  const verified = Boolean(user);

  return (
    <div className="starfield flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <section className="panel w-full max-w-xl p-8 text-center sm:p-12">
          {loading ? (
            <>
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-gold" aria-hidden />
              <h1 className="mt-6 font-display text-3xl">DOĞRULAMA KONTROL EDİLİYOR</h1>
              <p className="mt-4 text-sm text-muted-foreground">
                E-posta doğrulama sonucunuz kontrol ediliyor. Lütfen sayfayı kapatmayın.
              </p>
            </>
          ) : verified ? (
            <>
              <CheckCircle2 className="mx-auto h-14 w-14 text-green-500" aria-hidden />
              <h1 className="mt-6 font-display text-3xl">E-POSTANIZ DOĞRULANDI</h1>
              <p className="mt-4 text-sm text-muted-foreground">
                {user.email ? `${user.email} adresiniz başarıyla doğrulandı.` : "E-posta adresiniz başarıyla doğrulandı."}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to="/panelim" className="btn-gold rounded-md px-6 py-3 text-sm">
                  PANELİME GİT
                </Link>
                <Link to="/giris" className="rounded-md border border-input px-6 py-3 text-sm">
                  GİRİŞ SAYFASI
                </Link>
              </div>
            </>
          ) : (
            <>
              <XCircle className="mx-auto h-14 w-14 text-destructive" aria-hidden />
              <h1 className="mt-6 font-display text-3xl">DOĞRULAMA BAŞARISIZ</h1>
              <p className="mt-4 text-sm text-muted-foreground">
                {linkError
                  ? "Doğrulama bağlantısı geçersiz veya süresi dolmuş. Yeni doğrulama e-postası isteyin."
                  : "Doğrulama bağlantısı işlenemedi. Yeni doğrulama e-postası isteyin."}
              </p>
              <div className="mt-8">
                <Link to="/kayit-ol" className="btn-gold inline-flex rounded-md px-6 py-3 text-sm">
                  KAYIT SAYFASINA DÖN
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
