import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

const LEGAL = ["KVKK", "GİZLİLİK POLİTİKASI", "KULLANIM ŞARTLARI", "ÇEREZ POLİTİKASI"];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-navy-deep">
      <div className="mx-auto grid max-w-[1600px] gap-5 px-4 py-6 text-xs text-muted-foreground lg:grid-cols-[auto_1fr_auto] lg:items-center lg:px-8">
        <p>© 2024 MySkyParcel Türkiye | Tüm hakları saklıdır.</p>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-center">
          {LEGAL.map((l) => (
            <li key={l}>
              <a href="#" className="tracking-[0.06em] text-gold/90 hover:text-gold">
                {l}
              </a>
            </li>
          ))}
        </ul>
        <ul className="flex items-center gap-3 lg:justify-end">
          {[Facebook, Instagram, Twitter, Youtube, Linkedin].map((Icon, i) => (
            <li key={i}>
              <a
                href="#"
                aria-label="Sosyal medya"
                className="grid h-8 w-8 place-items-center rounded-full border border-gold/50 text-gold transition-colors hover:bg-gold hover:text-primary-foreground"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
