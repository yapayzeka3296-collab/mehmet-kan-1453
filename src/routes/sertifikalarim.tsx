import { createFileRoute, Navigate, Link } from "@tanstack/react-router";
import { Award, Eye, RefreshCw, ShieldCheck, Share2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { UserSidebar } from "@/components/UserSidebar";
import { SECURITY_TRUST, TrustBar } from "@/components/TrustBar";
import { supabase } from "@/lib/supabase";
import { CertificatePreview } from "@/components/CertificatePreview";

export const Route = createFileRoute("/sertifikalarim")({ component: SertifikalarimPage });

function SertifikalarimPage() {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<any>(null);

  const openPreview = (certificate: any) => {
    setSelectedCertificate(certificate);
    setPreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
        <UserSidebar />
        <main className="min-w-0 flex-1">
          {/* existing certificate list/content */}
        </main>
      </div>
      <SiteFooter />

      {previewOpen && selectedCertificate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="relative z-[101] flex max-h-[calc(100vh-2rem)] max-w-[calc(100vw-2rem)] items-center justify-center">
            <button
              type="button"
              aria-label="Önizlemeyi kapat"
              onClick={() => setPreviewOpen(false)}
              className="absolute -right-3 -top-3 z-[110] flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-xl hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
            <CertificatePreview certificate={selectedCertificate} />
          </div>
        </div>
      )}
    </div>
  );
}
