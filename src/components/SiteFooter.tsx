import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { CertificateTemplatePreview } from "@/components/CertificateTemplatePreview";

const LEGAL = [
  { label: "ÜYELİK SÖZLEŞMESİ", to: "/uyelik-sozlesmesi" },
  { label: "KVKK", to: "/kvkk" },
  { label: "GİZLİLİK POLİTİKASI", to: "/gizlilik-politikasi" },
  { label: "KULLANIM ŞARTLARI", to: "/kullanim-sartlari" },
  { label: "ÇEREZ POLİTİKASI", to: "/cerez-politikasi" },
];
const CURRENT_YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-navy-deep">
      <section className="border-b border-gold/15 bg-background/10">
        <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-8">
          <div className="mb-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">MY SKYPARCEL SERTİFİKALARI</p>
            <p className="mt-1 text-xs text-muted-foreground">Digital · Özel · Premium sertifika tasarımlarını inceleyin.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <CertificateTemplatePreview tier="digital" />
            <CertificateTemplatePreview tier="elite" />
            <CertificateTemplatePreview tier="premium" />
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-[1600px] gap-5 px-4 py-6 text-xs text-muted-foreground lg:grid-cols-[auto_1fr_auto] lg:items-center lg:px-8">
        <p>© {CURRENT_YEAR} MySkyParcel Türkiye | Tüm hakları saklıdır.</p>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-center" aria-label="Hukuki sayfalar">
          {LEGAL.map((item) => (
            <li key={item.label}>
              <Link to={item.to} className="tracking-[0.06em] text-gold/70 transition-colors hover:text-gold">{item.label}</Link>
            </li>
          ))}
        </ul>
        <ul className="flex items-center gap-3 lg:justify-end" aria-label="Sosyal medya">
          {[Facebook, Instagram, Twitter, Youtube, Linkedin].map((Icon, i) => (
            <li key={i}><span aria-label="Sosyal medya bağlantısı henüz tanımlı değil" title="Sosyal medya bağlantısı henüz tanımlı değil" className="grid h-8 w-8 place-items-center rounded-full border border-gold/50 text-gold/70"><Icon className="h-3.5 w-3.5" aria-hidden="true" /></span></li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
