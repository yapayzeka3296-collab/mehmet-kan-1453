import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Link } from "@tanstack/react-router";

const LEGAL = [
  { label: "ÜYELİK SÖZLEŞMESİ", to: "/uyelik-sozlesmesi" },
  { label: "MESAFELİ SATIŞ SÖZLEŞMESİ", to: "/mesafeli-satis-sozlesmesi" },
  { label: "ÖN BİLGİLENDİRME FORMU", to: "/on-bilgilendirme-formu" },
  { label: "İADE / İPTAL", to: "/iade-iptal-politikasi" },
  { label: "KVKK", to: "/kvkk" },
  { label: "GİZLİLİK POLİTİKASI", to: "/gizlilik-politikasi" },
  { label: "KULLANIM ŞARTLARI", to: "/kullanim-sartlari" },
  { label: "ÇEREZ POLİTİKASI", to: "/cerez-politikasi" },
];
const CURRENT_YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-navy-deep">
      <div className="mx-auto grid max-w-[1600px] gap-5 px-4 py-7 text-xs text-muted-foreground lg:grid-cols-[auto_1fr_auto] lg:items-center lg:px-8">
        <div className="space-y-1">
          <p>© {CURRENT_YEAR} MySkyParcel Türkiye | Tüm hakları saklıdır.</p>
          <p className="text-[11px] text-muted-foreground/80">Sembolik dijital parsel ve sertifika hizmeti.</p>
        </div>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 lg:justify-center" aria-label="Hukuki sayfalar">
          {LEGAL.map((item) => (
            <li key={item.label}>
              <Link to={item.to} className="tracking-[0.04em] text-gold/70 transition-colors hover:text-gold">{item.label}</Link>
            </li>
          ))}
          <li><Link to="/iletisim" className="tracking-[0.04em] text-gold/70 transition-colors hover:text-gold">İLETİŞİM</Link></li>
        </ul>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <div className="flex flex-wrap items-center gap-2" aria-label="Ödeme yöntemleri">
            <span className="rounded border border-white/15 bg-white px-2.5 py-1 text-[10px] font-bold tracking-wide text-slate-900">iyzico ile Öde</span>
            <span className="rounded border border-white/15 bg-white px-2.5 py-1 text-[10px] font-bold italic text-slate-900">VISA</span>
            <span className="rounded border border-white/15 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-900">Mastercard</span>
          </div>
          <ul className="flex items-center gap-3" aria-label="Sosyal medya">
            <li>
              <a
                href="https://www.instagram.com/myskyparcel/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="MySkyParcel Instagram"
                title="MySkyParcel Instagram"
                className="grid h-8 w-8 place-items-center rounded-full border border-gold/50 text-gold/70 transition-colors hover:text-gold hover:border-gold"
              >
                <Instagram className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </li>
            {[Facebook, Twitter, Youtube, Linkedin].map((Icon, i) => (
              <li key={i}>
                <span aria-label="Sosyal medya bağlantısı henüz tanımlı değil" title="Sosyal medya bağlantısı henüz tanımlı değil" className="grid h-8 w-8 place-items-center rounded-full border border-gold/50 text-gold/70">
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
