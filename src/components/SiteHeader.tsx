import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "Ana Sayfa", to: "/" },
  { label: "Gökyüzü Haritası", to: "/gokyuzu-haritasi" },
  { label: "Parsel Satın Al", to: "/parsel-satin-al" },
  { label: "Koleksiyonum", to: "/parsellerim" },
  { label: "Dijital Sertifika", to: "/sertifikalarim" },
  { label: "Sertifika Doğrula", to: "/sertifika-dogrula" },
  { label: "Hakkımızda", to: "/hakkimizda" },
  { label: "İletişim", to: "/iletisim" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Mobil/tablet menü açıkken sayfanın arka planda kaymasını tamamen durdurur.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      menuButtonRef.current?.focus();
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 h-[80px] w-full border-b border-[#1E293B] bg-[#050B1A]/90 backdrop-blur-md shadow-lg shadow-black/20">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center">
          <Logo />
        </div>

        {/* Desktop: xl ve üzeri. 1024px civarında hamburger kullanılarak taşma önlenir. */}
        <nav aria-label="Ana navigasyon" className="hidden xl:flex items-center gap-3 2xl:gap-5">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative whitespace-nowrap text-xs font-medium text-slate-300 transition-colors duration-200 hover:text-[#D4AF37] 2xl:text-sm"
              activeProps={{
                className: "text-[#D4AF37] after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:bg-[#D4AF37]",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden xl:flex items-center gap-3 2xl:gap-4">
          <button
            type="button"
            aria-label="Sepet (henüz etkin değil)"
            title="Sepet özelliği sonraki entegrasyonda etkinleştirilecek"
            className="p-2 text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>

          <Link
            to="/giris"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors duration-200 hover:border-[#D4AF37] hover:text-[#D4AF37]"
          >
            Giriş Yap
          </Link>

          <Link
            to="/kayit-ol"
            className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black transition-colors duration-200 hover:bg-[#c29f2e]"
          >
            Üye Ol
          </Link>
        </div>

        {/* Tablet & mobile: hamburger menü 1280px altına kadar kullanılır. */}
        <div className="flex items-center gap-2 xl:hidden">
          <button
            type="button"
            aria-label="Sepet (henüz etkin değil)"
            title="Sepet özelliği sonraki entegrasyonda etkinleştirilecek"
            className="p-2 text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]"
          >
            <ShoppingCart className="h-6 w-6" />
          </button>

          <button
            ref={menuButtonRef}
            type="button"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen((value) => !value)}
            className="p-2 text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]"
          >
            {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-sm xl:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <aside
        id="mobile-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Site menüsü"
        className={`fixed top-0 right-0 z-50 h-screen w-[280px] sm:w-[320px] bg-[#050B1A] border-l border-[#1E293B] p-6 flex flex-col justify-between overflow-y-auto transform transition-transform duration-300 ease-in-out xl:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-[#1E293B]">
            <span className="text-lg font-bold text-white">Menü</span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Menüyü kapat"
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav aria-label="Mobil site navigasyonu" className="mt-6 flex flex-col gap-4">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-slate-300 transition-colors duration-200 hover:text-[#D4AF37]"
                activeProps={{
                  className: "text-[#D4AF37] font-semibold",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-[#1E293B] flex flex-col gap-3">
          <Link
            to="/giris"
            onClick={() => setOpen(false)}
            className="w-full rounded-lg border border-slate-700 py-2.5 text-center text-sm font-medium text-slate-200 transition-colors duration-200 hover:border-[#D4AF37] hover:text-[#D4AF37]"
          >
            Giriş Yap
          </Link>

          <Link
            to="/kayit-ol"
            onClick={() => setOpen(false)}
            className="w-full rounded-lg bg-[#D4AF37] py-2.5 text-center text-sm font-semibold text-black transition-colors duration-200 hover:bg-[#c29f2e]"
          >
            Üye Ol
          </Link>
        </div>
      </aside>
    </header>
  );
}
