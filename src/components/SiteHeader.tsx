import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, User, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";

const NAV = [
  { label: "ANA SAYFA", to: "/" },
  { label: "GÖKYÜZÜ HARİTASI", to: "/gokyuzu-haritasi" },
  { label: "PARSEL SATIN AL", to: "/parsel-satin-al" },
  { label: "SERTİFİKA DOĞRULA", to: "/sertifika-dogrula" },
  { label: "PAKETLER", to: "/paketler" },
  { label: "NASIL ÇALIŞIR?", to: "/nasil-calisir" },
  { label: "HAKKIMIZDA", to: "/hakkimizda" },
  { label: "İLETİŞİM", to: "/iletisim" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-navy-deep/95 backdrop-blur">
      <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 lg:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Logo />
          <nav className="hidden min-w-0 items-center gap-4 2xl:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="whitespace-nowrap text-[11px] font-medium tracking-[0.08em] text-foreground/85 transition-colors hover:text-gold"
                activeProps={{ className: "text-gold border-b-2 border-gold pb-1" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/giris"
            className="hidden items-center gap-2 rounded-md border border-border px-3 py-2 text-[11px] tracking-[0.08em] transition-colors hover:border-gold hover:text-gold sm:inline-flex"
          >
            <User className="h-4 w-4" /> GİRİŞ YAP
          </Link>
          <Link
            to="/kayit-ol"
            className="btn-gold hidden rounded-md px-4 py-2 text-[11px] sm:inline-flex"
          >
            KAYIT OL
          </Link>
          <button
            aria-label="Sepet"
            className="relative rounded-md border border-border p-2 text-foreground/85 transition-colors hover:border-gold hover:text-gold"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-primary-foreground">
              0
            </span>
          </button>
          <button
            aria-label="Menü"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border border-border p-2 2xl:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-navy-deep px-4 py-3 2xl:hidden">
          <ul className="grid gap-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2 text-xs tracking-[0.08em] text-foreground/85 hover:bg-accent hover:text-gold"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="mt-2 flex gap-2 sm:hidden">
              <Link
                to="/giris"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md border border-border px-3 py-2 text-center text-[11px]"
              >
                GİRİŞ YAP
              </Link>
              <Link
                to="/kayit-ol"
                onClick={() => setOpen(false)}
                className="btn-gold flex-1 rounded-md px-3 py-2 text-center text-[11px]"
              >
                KAYIT OL
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
