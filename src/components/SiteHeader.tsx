import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "Ana Sayfa", to: "/" },
  { label: "MySkyParcel Nedir?", to: "/myskyparcel-nedir" },
  { label: "Gökyüzü Haritası", to: "/gokyuzu-haritasi" },
  { label: "Parsel Satın Al", to: "/parsel-satin-al" },
  { label: "Sertifika Doğrula", to: "/sertifika-dogrula" },
  { label: "Hakkımızda", to: "/hakkimizda" },
  { label: "İletişim", to: "/iletisim" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  // Mobil menü açıkken arka plan kaymasını engelle
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 h-[80px] w-full border-b border-[#1E293B] bg-[#050B1A]/90 backdrop-blur-md shadow-lg shadow-black/20">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LEFT: Logo (Değiştirilmedi) */}
        <div className="flex shrink-0 items-center">
          <Logo />
        </div>

        {/* CENTER: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative text-sm font-medium text-slate-300 transition-colors duration-250 hover:text-[#D4AF37]"
              activeProps={{
                className: "text-[#D4AF37] after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:w-full after:bg-[#D4AF37]",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* RIGHT: Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <button
            aria-label="Sepet"
            className="p-2 text-slate-300 transition-colors duration-250 hover:text-[#D4AF37]"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>

          <Link
            to="/giris"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition-colors duration-250 hover:border-[#D4AF37] hover:text-[#D4AF37]"
          >
            Giriş Yap
          </Link>

          <Link
            to="/kayit-ol"
            className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-semibold text-black transition-colors duration-250 hover:bg-[#c29f2e]"
          >
            Üye Ol
          </Link>
        </div>

        {/* TABLET & MOBILE RIGHT: Sepet & Hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            aria-label="Sepet"
            className="p-2 text-slate-300 transition-colors duration-250 hover:text-[#D4AF37]"
          >
            <ShoppingCart className="h-6 w-6" />
          </button>

          <button
            aria-label="Menü"
            onClick={() => setOpen((v) => !v)}
            className="p-2 text-slate-300 transition-colors duration-250 hover:text-[#D4AF37]"
          >
            {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>

      </div>

      {/* MOBILE & TABLET SLIDE-IN MENU */}
      {/* Overlay Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Right Slide-in Drawer */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-[280px] sm:w-[320px] bg-[#050B1A] border-l border-[#1E293B] p-6 flex flex-col justify-between transform transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div>
          {/* Header Inside Drawer */}
          <div className="flex items-center justify-between pb-6 border-b border-[#1E293B]">
            <span className="text-lg font-bold text-white">Menü</span>
            <button
              onClick={() => setOpen(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Links */}
          <nav className="mt-6 flex flex-col gap-4">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-slate-300 transition-colors duration-250 hover:text-[#D4AF37]"
                activeProps={{
                  className: "text-[#D4AF37] font-semibold",
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="my-6 border-t border-[#1E293B]" />

          {/* Auth Buttons */}
          <div className="flex flex-col gap-3">
            <Link
              to="/giris"
              onClick={() => setOpen(false)}
              className="w-full rounded-lg border border-slate-700 py-2.5 text-center text-sm font-medium text-slate-200 transition-colors duration-250 hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              Giriş Yap
            </Link>

            <Link
              to="/kayit-ol"
              onClick={() => setOpen(false)}
              className="w-full rounded-lg bg-[#D4AF37] py-2.5 text-center text-sm font-semibold text-black transition-colors duration-250 hover:bg-[#c29f2e]"
            >
              Üye Ol
            </Link>
          </div>
        </div>
      </aside>
    </header>
  );
}
